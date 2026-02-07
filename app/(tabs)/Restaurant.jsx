import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useRouter } from 'expo-router';

export default function Restaurant() {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [resturantName, setResturantName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
            setUser(authenticatedUser);
            if (authenticatedUser) {
                const docRef = doc(db, "restaurants", authenticatedUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setIsRegistered(true);
                    setResturantName(docSnap.data().name);
                    setAddress(docSnap.data().address);
                } else {
                    setIsRegistered(false);
                }
            }
            setInitialized(true);
        });
        return unsubscribe;
    }, []);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Enter email and password");
            return;
        }
        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!resturantName || !address) {
            Alert.alert("Error", "Fill all fields");
            return;
        }
        setLoading(true);
        try {
            await setDoc(doc(db, "restaurants", user.uid), {
                name: resturantName,
                address: address,
                ownerId: user.uid,
                ownerEmail: user.email,
                status: "active",
                updatedAt: new Date().toISOString()
            });
            setIsRegistered(true);
            Alert.alert("Success", "Restaurant Profile Updated");
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!initialized) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    const AuthContent = (
        <View style={styles.card}>
            <Text style={styles.emoji}>🍕</Text>
            <Text style={styles.title}>{isSignUp ? "Partner Sign Up" : "Vendor Login"}</Text>
            <Text style={styles.subtitle}>Start selling your delicious food today</Text>
            <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
            <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isSignUp ? "Create Account" : "Login"}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>{isSignUp ? "Already a partner? Login" : "New here? Join us"}</Text>
            </TouchableOpacity>
        </View>
    );

    const RegisterContent = (
        <View style={styles.card}>
            <Text style={styles.title}>Finish Setup</Text>
            <Text style={styles.subtitle}>Tell us about your restaurant</Text>
            <View style={styles.inputWrapper}>
                <TextInput style={styles.input} placeholder="Restaurant Name" value={resturantName} onChangeText={setResturantName} />
            </View>
            <View style={[styles.inputWrapper, { height: 100 }]}>
                <TextInput style={[styles.input, { height: 100, paddingTop: 15 }]} placeholder="Full Address" value={address} onChangeText={setAddress} multiline />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Complete Registration</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => signOut(auth)} style={styles.signOutBtn}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );

    const DashBoardContent = (
        <View style={styles.card}>
            <View style={styles.badge}><Text style={styles.badgeText}>Live Dashboard</Text></View>
            <Text style={styles.title}>{resturantName}</Text>
            <Text style={styles.subtitle}>{address}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>0</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>₹0</Text>
                    <Text style={styles.statLabel}>Revenue</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => router.push({
                pathname: "../FoodUpload",
                params: {
                    resturantName: resturantName,
                }

            })}>
                <Text style={styles.buttonText}>Add Food Items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push({
                pathname:"../ViewMenu",
                params: {
                    resturantName: resturantName,
                }
            })}>
                <Text style={styles.buttonText}>View Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#f1f2f6', marginTop: 12 }]}
                              onPress={() => setIsRegistered(false)}>
                <Text style={[styles.buttonText, { color: '#1A1D1E' }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => signOut(auth)} style={styles.signOutBtn}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {!user ? AuthContent : (isRegistered ? DashBoardContent : RegisterContent)}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 28, padding: 30, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20 },
    emoji: { fontSize: 56, marginBottom: 16 },
    badge: { backgroundColor: '#FDECEC', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
    badgeText: { color: '#E23744', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
    title: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#6E7172', textAlign: 'center', marginBottom: 24, paddingHorizontal: 10 },
    inputWrapper: { width: '100%', backgroundColor: '#F4F6F6', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8EBEB' },
    input: { width: '100%', height: 56, paddingHorizontal: 20, fontSize: 16, color: '#1A1D1E' },
    button: { backgroundColor: '#E23744', width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    toggleBtn: { marginTop: 20 },
    toggleText: { color: '#E23744', fontWeight: '700' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24, marginTop: 10 },
    statBox: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 16, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: '#E8EBEB' },
    statNum: { fontSize: 20, fontWeight: '900', color: '#1A1D1E' },
    statLabel: { fontSize: 12, color: '#6E7172', marginTop: 4 },
    signOutBtn: { marginTop: 24 },
    signOutText: { color: '#ADB3B3', fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }
});