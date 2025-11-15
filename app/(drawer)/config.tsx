import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {COLORS} from '../../themes/colors'


export default function defaultConfig ()  {
  return (
    <View style={styles.container}>
     <View style={styles.centerContainer}> 
        <Text style={styles.placeholderText}>
         nada aqui ainda
        </Text>
     </View>
    </View>
  );
};

// --- Estilos Atualizados para Dark Mode Moderno ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, 
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 28, 
        fontWeight: 'bold',
        color: COLORS.text, 
        opacity: 0.5,
    },

    list: {
        padding: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: COLORS.primary,
        borderBottomWidth: 1, 
        borderBottomColor: COLORS.border, 
    },
    itemContainer: {
        padding: 15,
        borderWidth: 1, 
        borderColor: COLORS.border, 
        marginBottom: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        elevation: 3, 
        shadowColor: COLORS.shadow, 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
});