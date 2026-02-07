import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const deliveryFee = 40;
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal > 0 ? subtotal + deliveryFee : 0;

    useEffect(() => {
        if (!auth.currentUser) return;

        const cartRef = collection(db, "users", auth.currentUser.uid, "cart");

        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCartItems(items);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const deleteItem = async (itemId) => {
        try {
            await deleteDoc(doc(db, "users", auth.currentUser.uid, "cart", itemId));
        } catch (error) {
            Alert.alert("Error", "Could not remove item.");
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setCheckingOut(true);

        try {
            const batch = writeBatch(db);
            const orderRef = doc(collection(db, "orders"));
            batch.set(orderRef, {
                userId: auth.currentUser.uid,
                items: cartItems,
                totalAmount: total,
                status: "Pending",
                createdAt: new Date().toISOString()
            });

            cartItems.forEach(item => {
                const itemRef = doc(db, "users", auth.currentUser.uid, "cart", item.id);
                batch.delete(itemRef);
            });

            await batch.commit();

            Alert.alert("Success", "Order placed successfully!", [
                { text: "OK", onPress: () => router.push('/CustomerOrders') }
            ]);
        } catch (error) {
            Alert.alert("Error", "Checkout failed. Please try again.");
            console.error(error);
        } finally {
            setCheckingOut(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemRes}>{item.resturantName}</Text>
                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>

            <View style={styles.actions}>
                <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>x{item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#E23744" />
                </TouchableOpacity>
            </View>
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
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerTitle}>My Cart</Text>
                <Text style={styles.headerSubtitle}>{cartItems.length} items added</Text>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listPadding}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={80} color="#E8EBEB" />
                        <Text style={styles.emptyText}>Your cart is empty!</Text>
                        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
                            <Text style={styles.browseText}>Browse Food</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={cartItems.length > 0 && (
                    <View style={styles.billContainer}>
                        <Text style={styles.billTitle}>Bill Details</Text>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Item Total</Text>
                            <Text style={styles.billValue}>₹{subtotal}</Text>
                        </View>
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Delivery Fee</Text>
                            <Text style={styles.billValue}>₹{deliveryFee}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.billRow}>
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalValue}>₹{total}</Text>
                        </View>
                    </View>
                )}
            />

            {cartItems.length > 0 && (
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={handleCheckout}
                        disabled={checkingOut}
                    >
                        {checkingOut ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.checkoutContent}>
                                <View>
                                    <Text style={styles.finalTotal}>₹{total}</Text>
                                    <Text style={styles.finalTax}>TOTAL</Text>
                                </View>
                                <View style={styles.payNowRow}>
                                    <Text style={styles.checkoutText}>Place Order</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 15 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#1A1D1E' },
    headerSubtitle: { fontSize: 13, color: '#6E7172', marginTop: 2 },
    listPadding: { padding: 20, paddingBottom: 120 },
    cartItem: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700', color: '#1A1D1E' },
    itemRes: { fontSize: 12, color: '#9DA3A3', marginBottom: 4 },
    itemPrice: { fontSize: 15, fontWeight: '800', color: '#E23744' },
    actions: { flexDirection: 'row', alignItems: 'center' },
    qtyBadge: { backgroundColor: '#F1F2F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
    qtyText: { fontWeight: '700', color: '#1A1D1E' },
    deleteBtn: { padding: 5 },
    billContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 22, marginTop: 10 },
    billTitle: { fontSize: 16, fontWeight: '800', color: '#1A1D1E', marginBottom: 15 },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    billLabel: { color: '#6E7172', fontSize: 14 },
    billValue: { color: '#1A1D1E', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F1F2F6', marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '900', color: '#1A1D1E' },
    totalValue: { fontSize: 18, fontWeight: '900', color: '#1A1D1E' },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6'
    },
    checkoutBtn: {
        backgroundColor: '#E23744',
        height: 64,
        borderRadius: 18,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    checkoutContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    finalTotal: { color: '#fff', fontSize: 18, fontWeight: '900' },
    finalTax: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
    payNowRow: { flexDirection: 'row', alignItems: 'center' },
    checkoutText: { color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 5 },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 16, color: '#ADB3B3', marginTop: 15, fontWeight: '600' },
    browseBtn: { marginTop: 25, backgroundColor: '#E23744', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 15 },
    browseText: { color: '#fff', fontWeight: '800' }
});