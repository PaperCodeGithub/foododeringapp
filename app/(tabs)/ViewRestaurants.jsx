import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getResturants } from "../services/helper";

export default function ViewRestaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isListEnded, setIsListEnded] = useState(false);

    const router = useRouter();

    const loadRestaurants = async (isLoadMore = false) => {
        if (isLoadMore && (loadingMore || isListEnded)) return;

        if (isLoadMore)
            setLoadingMore(true);
        else
            setIsLoading(true);

        try{
            const response = await getResturants(isLoadMore ? lastVisible : null);
            if (isLoadMore) {
                setRestaurants(prev => [...prev, ...response.data]);
            } else {
                setRestaurants(response.data);
            }

            setLastVisible(response.lastDoc);
            setIsListEnded(response.isListEnded);

        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };


    useEffect(() => {
        loadRestaurants();
    }, []);

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#E23744" />
            </View>
        );
    };

    const renderRestaurantItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => {
                router.push({
                    pathname: "../ViewMenu",
                    params: {
                        id: item.id,
                    }
                })
            }}
        >

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.name}>{item.name || "Unknown Restaurant"}</Text>
                    <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>Available</Text>
                    </View>
                </View>
                <Text style={styles.cuisine}>{item.cuisine || "Food"}</Text>
                <Text style={styles.address}>{item.address || "Durgapur"}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#E23744" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Restaurants</Text>
            </View>
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item.id}
                renderItem={renderRestaurantItem}
                onEndReached={() => loadRestaurants(true)}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Ionicons name="restaurant-outline" size={50} color="#ccc" />
                        <Text style={{color: '#999', marginTop: 10}}>No Restaurants Found</Text>
                        <Text style={{color: '#ccc', fontSize: 10}}>Check your Firestore Collection</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1A1D1E'
    },
    listPadding: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#E1E1E1'
    },
    content: {
        padding: 15
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1D1E',
        flex: 1,
        marginRight: 10
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6
    },
    ratingText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
        marginRight: 2
    },
    cuisine: {
        fontSize: 14,
        color: '#6E7172',
        marginBottom: 4
    },
    address: {
        fontSize: 12,
        color: '#9DA3A3'
    }
});