import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Image
} from 'react-native';
import { auth, db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {

    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [isListEnd, setIsListEnd] = useState(false);


    const [userName, setUserName] = useState("");

    const router = useRouter();

    useEffect(() => {
        const unsubscribed = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                try {
                    const docRef = doc(db, "users", authenticatedUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().name) {
                        setUserName(docSnap.data().name);
                    }
                } catch (error) {
                    console.log("Error fetching user name:", error);
                }
            }
        });
        return unsubscribed;
    }, []);


    useEffect(() => {
        fetchInitialFoods();
    }, []);

    const fetchInitialFoods = async () => {
        try {
            const q = query(
                collection(db, "foods"),
                orderBy("createdAt", "desc"),
                limit(20)
            );

            const documentSnapshots = await getDocs(q);
            const items = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setFoods(items);
            setFilteredFoods(items);
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredFoods(foods);
            return;
        }
        const filtered = foods.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.category.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredFoods(filtered);
    };

    const fetchMoreFoods = async () => {
        if (loadingMore || isListEnd || searchQuery !== '' || !lastVisible) return;

        setLoadingMore(true);
        try {
            const nextQuery = query(
                collection(db, "foods"),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(10)
            );

            const documentSnapshots = await getDocs(nextQuery);

            if (documentSnapshots.docs.length > 0) {
                const nextItems = documentSnapshots.docs.map(doc =>
                    ({ id: doc.id, ...doc.data() }));
                setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
                const newFoods = [...foods, ...nextItems];
                setFoods(newFoods);
                setFilteredFoods(newFoods);
            } else {
                setIsListEnd(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    };

    const renderFoodItem = ({ item }) => {
        const imageUrl = `https://loremflickr.com/600/400/${encodeURIComponent(item.name.split(' ')[0])},food/all`;
        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push({
                    pathname: "../FoodDetails",
                    params: {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        resturantName: item.resturantName,
                        imageUrl: imageUrl,
                    }
                })}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.foodImage}
                        resizeMode="cover" // Changed from contentFit to resizeMode for React Native Image
                    />
                    <View style={styles.overlay}>
                        <Text style={styles.categoryBadge}>{item.category}</Text>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.price}>₹{item.price}</Text>
                    </View>
                    <Text style={styles.restaurantName}>By {item.resturantName}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} color="#E23744" />;
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hungry? {userName}</Text>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#6E7172" />
                    <TextInput
                        placeholder="Search for dishes..."
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id}
                renderItem={renderFoodItem}
                onEndReached={fetchMoreFoods}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, paddingTop: 50, backgroundColor: '#fff' },
    greeting: { fontSize: 22, fontWeight: '900', color: '#1A1D1E', marginBottom: 15 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F6F6',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8EBEB'
    },
    searchInput: { marginLeft: 10, flex: 1, fontSize: 16 },
    listPadding: { paddingHorizontal: 20, paddingBottom: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 10,
        fontWeight: '700',
        color: '#E23744',
        textTransform: 'uppercase'
    },
    cardContent: { padding: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    foodName: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
    price: { fontSize: 16, fontWeight: '900', color: '#2D3436' },
    restaurantName: { color: '#6E7172', fontSize: 13, marginTop: 4 },
    imageContainer: {
        width: '100%',
        height: 180,
        backgroundColor: '#F1F2F6',
    },
    foodImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.05)',
    }
});