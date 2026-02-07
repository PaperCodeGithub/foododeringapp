import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from './services/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export default function FoodDetails() {
    const { id, name, price, resturantName, imageUrl } = useLocalSearchParams();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const itemPrice = parseFloat(price) || 0;
    const totalAmount = itemPrice * quantity;

    const handleAddToCart = async () => {
        if (!auth.currentUser) {
            Alert.alert("Login Required", "Please login to add items to cart.");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            const cartRef = doc(db, "users", user.uid, "cart", id);

            const docSnap = await getDoc(cartRef);

            if (docSnap.exists()) {
                const currentQty = docSnap.data().quantity;
                await updateDoc(cartRef, {
                    quantity: currentQty + quantity,
                    totalPrice: (currentQty + quantity) * itemPrice
                });
            } else {
                await setDoc(cartRef, {
                    id,
                    name,
                    price: itemPrice,
                    quantity,
                    resturantName,
                    imageUrl: imageUrl || "",
                    totalPrice: totalAmount,
                    addedAt: new Date().toISOString()
                });
            }

            Alert.alert(
                "Added to Cart 🛒",
                `${name} has been added.`,
                [
                    { text: "Continue", onPress: () => router.back() },
                    { text: "View Cart", onPress: () => router.navigate('/Cart') }
                ]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not add to cart.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Dish Details',
                headerTitleStyle: { fontWeight: '900', color: '#1A1D1E' },
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8F9FA' }
            }} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.productCard}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.foodImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="fast-food" size={80} color="#E8EBEB" />
                        </View>
                    )}

                    <View style={styles.detailsHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.resName}>{resturantName}</Text>
                            <Text style={styles.foodTitle}>{name}</Text>
                        </View>
                        <Text style={styles.priceTag}>₹{itemPrice}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>Select Quantity</Text>
                    <View style={styles.quantityRow}>
                        <TouchableOpacity
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            style={styles.qtyBtn}
                        >
                            <Ionicons name="remove" size={24} color="#1A1D1E" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity
                            onPress={() => setQuantity(quantity + 1)}
                            style={styles.qtyBtn}
                        >
                            <Ionicons name="add" size={24} color="#1A1D1E" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#6E7172" />
                    <Text style={styles.infoText}>
                        Item prices are set by the restaurant.
                    </Text>
                </View>
            </ScrollView>

            <View style={[
                styles.footer,
                { paddingBottom: Math.max(insets.bottom, 20) }
            ]}>
                <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.btnContent}>
                            <Text style={styles.btnText}>Add to Cart</Text>
                            <View style={styles.btnDivider} />
                            <Text style={styles.btnPrice}>₹{totalAmount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    content: { padding: 20 },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        marginTop: 20,
    },
    foodImage: {
        width: '100%',
        height: 220,
        borderRadius: 20,
        marginBottom: 20
    },
    imagePlaceholder: {
        width: '100%',
        height: 220,
        backgroundColor: '#F4F6F6',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    resName: { color: '#E23744', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
    foodTitle: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginTop: 4 },
    priceTag: { fontSize: 22, fontWeight: '900', color: '#1A1D1E', marginLeft: 10 },
    divider: { height: 1, backgroundColor: '#F1F2F6', marginVertical: 20 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#6E7172', marginBottom: 15 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', borderRadius: 15, padding: 10 },
    qtyBtn: { width: 45, height: 45, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    qtyText: { fontSize: 20, fontWeight: '900', marginHorizontal: 30, color: '#1A1D1E' },
    infoCard: { flexDirection: 'row', marginTop: 20, padding: 15, backgroundColor: '#F1F2F6', borderRadius: 15, alignItems: 'center' },
    infoText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#6E7172', lineHeight: 18 },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
        elevation: 20
    },
    cartBtn: { backgroundColor: '#E23744', height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    btnContent: { flexDirection: 'row', alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    btnDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 15 },
    btnPrice: { color: '#fff', fontSize: 18, fontWeight: '800' }
});