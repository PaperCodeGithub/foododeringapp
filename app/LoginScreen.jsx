import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";
import {Router, useRouter} from "expo-router";

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("customer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    type: role,
                    createdAt: new Date().toISOString()
                }, { merge: true });
            }
        } catch (error) {
            Alert.alert("Auth Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.emoji}>{role === "customer" ? "🍔" : "🏪"}</Text>
                    <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? `Login as ${role}` : `Register as ${role} partner`}
                    </Text>

                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === "customer" && styles.activeRole]}
                            onPress={() => setRole("customer")}
                        >
                            <Text style={[styles.roleText, role === "customer" && styles.activeRoleText]}>Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === "restaurant" && styles.activeRole]}
                            onPress={() => setRole("restaurant")}
                        >
                            <Text style={[styles.roleText, role === "restaurant" && styles.activeRoleText]}>Restaurant</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isLogin ? "Login" : "Sign Up"}</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleWrapper}>
                        <Text style={styles.toggleText}>
                            {isLogin ? "New to Foodie? " : "Already have an account? "}
                            <Text style={styles.toggleBold}>{isLogin ? "Register Now" : "Login"}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    scrollContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
    card: { backgroundColor: "#fff", borderRadius: 30, padding: 25, alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    emoji: { fontSize: 50, marginBottom: 10 },
    title: { fontSize: 26, fontWeight: "900", color: "#1A1D1E" },
    subtitle: { fontSize: 14, color: "#6E7172", marginBottom: 25, textTransform: "capitalize" },
    roleContainer: { flexDirection: "row", backgroundColor: "#F1F2F6", borderRadius: 15, padding: 5, marginBottom: 25, width: "100%" },
    roleBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
    activeRole: { backgroundColor: "#fff", elevation: 2 },
    roleText: { fontSize: 14, fontWeight: "600", color: "#6E7172" },
    activeRoleText: { color: "#E23744" },
    inputWrapper: { width: "100%", backgroundColor: "#F4F6F6", borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: "#E8EBEB" },
    input: { width: "100%", height: 55, paddingHorizontal: 20, fontSize: 16, color: "#1A1D1E" },
    mainBtn: { backgroundColor: "#E23744", width: "100%", height: 55, borderRadius: 15, justifyContent: "center", alignItems: "center", marginTop: 10 },
    mainBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    toggleWrapper: { marginTop: 20 },
    toggleText: { color: "#6E7172", fontSize: 14 },
    toggleBold: { color: "#E23744", fontWeight: "bold" }
});