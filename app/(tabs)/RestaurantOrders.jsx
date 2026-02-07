import React from "react";
import {View, Text, StyleSheet} from 'react-native';
import text from "react-native-web/src/exports/Text";

export default function Restaurent(){
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Orders</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,

    }
})