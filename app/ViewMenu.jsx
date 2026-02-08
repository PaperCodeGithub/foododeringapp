import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl
} from 'react-native';
import { db, auth } from './services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ViewMenu() {

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const fetchMenu = async () => {
        try {
            const q = query(
                collection(db, "foods"),
                where("restaurantID", "==", id || auth.currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMenuItems(items);
        } catch (error) {
            Alert.alert("Error", "Could not fetch menu items");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu, id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMenu();
    };

    const handleDelete = (id, name) => {
        if(!id) return;
        Alert.alert(
            "Delete Item",
            `Are you sure you want to remove ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteDoc(doc(db, "foods", id));
                        fetchMenu(); // Refresh list after deletion
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.menuCard}>
            <View style={styles.info}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
            </View>
            {!id && (
                <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="trash-outline" size={22} color="#E23744" />
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'My Menu', headerShadowVisible: false }} />
            <FlatList
                data={menuItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E23744" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food-outline" size={60} color="#D1D1D1" />
                        <Text style={styles.emptyText}>No items added yet.</Text>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => router.push('./FoodUpload')}
                        >
                            <Text style={styles.addBtnText}>Add Your First Dish</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    menuCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    info: { flex: 1 },
    foodName: { fontSize: 18, fontWeight: '700', color: '#1A1D1E' },
    category: { fontSize: 13, color: '#6E7172', marginTop: 2, textTransform: 'uppercase' },
    price: { fontSize: 16, fontWeight: '900', color: '#E23744', marginTop: 4 },
    deleteBtn: { padding: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#6E7172', marginTop: 10, fontSize: 16 },
    addBtn: { backgroundColor: '#E23744', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 20 },
    addBtnText: { color: '#fff', fontWeight: 'bold' }
});