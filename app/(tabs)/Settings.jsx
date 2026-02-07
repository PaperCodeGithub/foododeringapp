import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => signOut(auth).catch(err => Alert.alert("Error", err.message))
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={50} color="#E23744" />
                </View>
                <Text style={styles.userName}>{auth.currentUser?.email}</Text>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#E23744" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF1F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1D1E',
    },
    menuSection: {
        marginTop: 20,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#E23744',
        marginLeft: 12,
    }
});