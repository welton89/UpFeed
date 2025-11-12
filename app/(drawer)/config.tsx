import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// --- Definição das Cores do Tema (Dark Gray Moderno) ---
const COLORS = {
    background: '#282c34', // Fundo Dark Gray
    surface: '#3c4048',   // Superfícies (Se necessário)
    text: '#F8F8F8',      // Texto principal claro
    textSecondary: '#B0B0B0', // Texto secundário/label
    primary: '#61AFEF',   // Cor de destaque
    error: '#E06C75',     // Cor de erro
    border: '#4A4F59',    // Borda sutil
};


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
        backgroundColor: COLORS.background, // Fundo principal Dark Gray
        padding: 20,
    },
    // Container para centralizar o texto
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 28, // Tamanho maior
        fontWeight: 'bold',
        color: COLORS.text, // Cor clara
        opacity: 0.5, // Placeholder sutil
    },

    // Estilos de exemplo (com border aplicada onde faria sentido)
    list: {
        padding: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: COLORS.primary,
        borderBottomWidth: 1, // Exemplo de uso de borda
        borderBottomColor: COLORS.border, // Aplicação da cor de borda
    },
    itemContainer: {
        padding: 15,
        borderWidth: 1, // Aplicação da cor de borda
        borderColor: COLORS.border, // Aplicação da cor de borda
        marginBottom: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        elevation: 3, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    // O estilo 'title' foi renomeado para 'placeholderText' para clareza
});