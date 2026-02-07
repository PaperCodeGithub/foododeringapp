import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { db, auth } from './services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';


export default function FoodUpload(){
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { resturantName } = useLocalSearchParams();

    const handleAddFood = async () => {
        if (!name || !price || !category) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        setLoading(true);

        try{
            await addDoc(collection(db, "foods"), {
                name: name,
                price: price,
                category: category,
                restaurantID: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                resturantName: resturantName,
            });

            setName('');
            setPrice('');
            setCategory('');
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Please fill all fields");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Add New Item',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color="#1A1D1E" />
                        </TouchableOpacity>
                    ),
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F8F9FA' }
                }}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.card}>
                        <Text style={styles.title}>New Dish</Text>
                        <Text style={styles.subtitle}>Add a new item to your restaurant menu</Text>

                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} placeholder="Food Name (e.g. Chicken Biryani)" value={name} onChangeText={setName} />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} placeholder="Price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput style={styles.input} placeholder="Category (e.g. Main Course, Starters)" value={category} onChangeText={setCategory} />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleAddFood} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add to Menu</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 28, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
    title: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#6E7172', textAlign: 'center', marginBottom: 24 },
    inputWrapper: { width: '100%', backgroundColor: '#F4F6F6', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8EBEB' },
    input: { width: '100%', height: 56, paddingHorizontal: 20, fontSize: 16, color: '#1A1D1E' },
    button: { backgroundColor: '#E23744', width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { marginTop: 20 },
    cancelText: { color: '#ADB3B3', fontWeight: '600' }
});
