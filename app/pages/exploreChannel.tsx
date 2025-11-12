// src/screens/ChannelsScreen.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFetchChannels } from '../hooks/useFetchChannels'; // Ajuste o caminho
import { Channel } from '../../types/types'; // Ajuste o caminho
import { IconButton } from 'react-native-paper';
import { router } from 'expo-router';
    const imgAlter:string = 'https://reporterbrasil.org.br/wp-content/uploads/2014/02/RSS.png';

// Componente para renderizar cada item da lista
const ChannelItem = ({ item }: { item: Channel }) => (
    <View style={styles.itemContainer}>






        <View style={{ flexDirection: 'row',flex:4}}>












            
                <Image 
                source={{ uri: item.img || imgAlter }} 
                style={styles.image} 
                resizeMode="cover"
                />
            
            <View style={[{flex:1,width:'100%'}]}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.url}>{item.url}</Text>
                {item.descricao && <Text style={styles.description}>{item.descricao}</Text>}
                {item.category && <Text style={styles.category}>Categoria: {item.category.toString()}</Text>}
            </View>
        </View>





        <IconButton icon={'plus'} size={30} style={{flex:1}}

         onPress={() =>
                                router.push({
                                  pathname: '/pages/createUpdate',
                                  params: {
                                    id: null,
                                    name: item.name,
                                    url: item.url,
                                    descricao: item.descricao,
                                    img: item.img,
                                    category: item.category?.id,
                                  },
                                })
                              }
        
        />


    </View>
);

// Componente principal da tela
const ChannelsScreen = () => {
    const { channels, loading, error } = useFetchChannels();

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.message}>Carregando canais...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>❌ Erro ao carregar dados:</Text>
                <Text style={styles.errorTextDetail}>{error}</Text>
            </View>
        );
    }
    
    if (channels.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.message}>Nenhum canal encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Lista de Canais ({channels.length})</Text>
            <FlatList
                data={channels}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChannelItem item={item} />}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 50, // Ajuste para Expo/safe areas
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
    },
    errorTextDetail: {
        fontSize: 14,
        color: 'red',
        textAlign: 'center',
        marginTop: 5,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    itemContainer: {
        flex:6,
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#eee'
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    url: {
        fontSize: 12,
        color: '#555',
    },
    category: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#28a745',
        marginTop: 4,
    },
    description: {
        fontSize: 13,
        color: '#6c757d',
        marginTop: 4,
    },
});

export default ChannelsScreen;