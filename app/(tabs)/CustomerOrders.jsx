import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { auth, db } from '../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToOrders } from "../services/helper";

export default function CustomerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!auth.currentUser) return;

        const unsubscribe = subscribeToOrders(auth.currentUser.uid, (item) => {
            setOrders(item);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#F59E0B';
            case 'Preparing': return '#3B82F6';
            case 'Out for Delivery': return '#8B5CF6';
            case 'Delivered': return '#10B981';
            case 'Cancelled': return '#EF4444';
            default: return '#6E7172';
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderOrderItem = ({ item }) => {
        const statusColor = getStatusColor(item.status);
        const itemsSummary = item.items.map(i => `${i.name} x${i.quantity}`).join(', ');

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.iconBg, { backgroundColor: statusColor + '20' }]}>
                            <Ionicons name="fast-food" size={20} color={statusColor} />
                        </View>
                        <View>
                            <Text style={styles.restaurantName}>Order #{item.id.slice(0, 6).toUpperCase()}</Text>
                            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemsContainer}>
                    <Text style={styles.itemsText} numberOfLines={2}>
                        {itemsSummary}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalPrice}>₹{item.totalAmount}</Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Your Orders</Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listPadding}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E23744"]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/512/11329/11329060.png" }}
                            style={{ width: 150, height: 150, opacity: 0.5, marginBottom: 20 }}
                        />
                        <Text style={styles.emptyText}>No past orders found.</Text>
                        <Text style={styles.emptySubText}>Looks like you haven't ordered anything yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
    pageTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D1E' },
    listPadding: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        padding: 18,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F1F2F6'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBg: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    restaurantName: { fontSize: 16, fontWeight: '800', color: '#1A1D1E' },
    dateText: { fontSize: 12, color: '#9DA3A3', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#F1F2F6', marginVertical: 15 },
    itemsContainer: { marginBottom: 15 },
    itemsText: { fontSize: 14, color: '#6E7172', lineHeight: 20 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 14, fontWeight: '600', color: '#9DA3A3' },
    totalPrice: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 18, fontWeight: '700', color: '#1A1D1E' },
    emptySubText: { fontSize: 14, color: '#9DA3A3', marginTop: 5 }
});