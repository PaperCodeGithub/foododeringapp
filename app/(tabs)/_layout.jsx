import { Tabs, useRouter, usePathname } from 'expo-router'; // Import useRouter & usePathname
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../services/firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { View, ActivityIndicator } from "react-native";
import LoginScreen from "../LoginScreen";
import CreateProfile from "../CreateProfile";

export default function TabLayout() {
    const [user, setUser] = useState(null);
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("customer");

    const router = useRouter();
    const pathname = usePathname(); // Get current path

    useEffect(() => {
        const unsubscribed = onAuthStateChanged(auth, async (authenticatedUser) => {
            if (authenticatedUser) {
                setUser(authenticatedUser);
                try {
                    const docRef = doc(db, "users", authenticatedUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().name) {
                        setIsRegister(true);
                        const userType = docSnap.data().type || "customer";
                        setType(userType);

                        if (userType === "restaurant" && pathname === "/") {
                            router.replace("/Restaurant");
                        }
                    } else {
                        setIsRegister(false);
                    }
                } catch (error) {
                    setIsRegister(false);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribed;
    }, []);

    useEffect(() => {
        if (!loading && type === "restaurant" && pathname === "/") {
            router.replace("/Restaurant");
        }
    }, [loading, type, pathname]);


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    if (!user) return <LoginScreen />;
    if (!isRegister) return <CreateProfile />;

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#E23744',
            tabBarInactiveTintColor: '#6E7172',
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    href: type === "customer" ? "/" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="Cart"
                options={{
                    title: 'Cart',
                    href: type === "customer" ? "/Cart" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="CustomerOrders"
                options={{
                    title: 'Orders',
                    href: type === "customer" ? "/CustomerOrders" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="Restaurant"
                options={{
                    title: 'Dashboard',
                    href: type === "restaurant" ? "/Restaurant" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="RestaurantOrders"
                options={{
                    title: 'New Orders',
                    href: type === "restaurant" ? "/RestaurantOrders" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="Delivery"
                options={{
                    title: 'Delivery',
                    href: type === "restaurant" ? "/Delivery" : null,
                    tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="Settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}