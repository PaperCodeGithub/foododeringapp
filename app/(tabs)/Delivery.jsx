import React from "react"
import {View, Text, StyleSheet} from 'react-native'

export default function Delivery() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Delivery</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    }

})