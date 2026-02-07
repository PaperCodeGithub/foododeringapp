import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {router} from "expo-router";

export default function CreateProfile() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = async () => {
        if (!name || !phone || !address) {
            Alert.alert("Wait!", "Please fill in all details to continue.");
            return;
        }

        setLoading(true);
        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                email: auth.currentUser.email,
                createdAt: new Date().toISOString()
            }, { merge: true });


            setName("");
            setPhone("");
            setAddress("");
            router.push("/");

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="person-add" size={40} color="#E23744" />
                        </View>
                        <Text style={styles.title}>Finish Your Profile</Text>
                        <Text style={styles.subtitle}>Almost there! We just need a few more details to get your food delivered.</Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                returnKeyType="next"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                returnKeyType="next"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Delivery Address"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={2}
                                style={[styles.input, { height: 80, paddingTop: 15 }]}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSaveProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Start Exploring</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 25 },
    card: { backgroundColor: "#fff", borderRadius: 30, padding: 30, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF1F2", justifyContent: "center", alignItems: "center", marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "900", color: "#1A1D1E", marginBottom: 10 },
    subtitle: { fontSize: 14, color: "#6E7172", textAlign: "center", lineHeight: 20, marginBottom: 30 },
    inputWrapper: { width: "100%", backgroundColor: "#F4F6F6", borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: "#E8EBEB" },
    input: { width: "100%", height: 55, paddingHorizontal: 20, fontSize: 16, color: "#1A1D1E" },
    button: { backgroundColor: "#E23744", width: "100%", height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", marginTop: 10 },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});