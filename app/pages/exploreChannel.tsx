// src/screens/ChannelsScreen.tsx

import React, { useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useFetchChannels } from '../hooks/useFetchChannels'; // Ajuste o caminho
import { Channel } from '../../types/types'; // Ajuste o caminho
import { IconButton } from 'react-native-paper';
import { router, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChanneStore } from '../../store/useChanneStore';
import {COLORS} from '../../themes/colors'


const imgAlter:string = 'https://reporterbrasil.org.br/wp-content/uploads/2014/02/RSS.png';

// Componente para renderizar cada item da lista
const ChannelItem = ({ item, listChannel }: { item: Channel, listChannel:Channel[] }) => (
    
    <View style={styles.itemContainer}>
        <View style={styles.infoWrapper}>
            
            <Image 
                source={{ uri: item.img || imgAlter }} 
                style={styles.image} 
                resizeMode="cover"
            />
            
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.url}>{item.url}</Text>
                {item.descricao && <Text style={styles.description}>{item.descricao}</Text>}
                {/* O item.category aqui é um objeto com id e name, assumindo que você quer o nome */}
                {item.category && <Text style={styles.category}>Categoria: {item.category.toString()}</Text>}
            </View>
        </View>

      {  
        
       !( listChannel.some((existingItem) => existingItem.url === item.url)) &&
        
        
        
        <IconButton 
            icon={'plus'} // Alterei para pencil, que é mais intuitivo para editar
            iconColor={COLORS.primary}
            style={{backgroundColor:COLORS.background}}
            size={30}
            // flex:1 no IconButton é opcional dependendo do layout desejado
            onPress={() =>
                router.push({
                  pathname: '/pages/createUpdate',
                  params: {
                    id: null, 
                    name: item.name,
                    url: item.url,
                    descricao: item.descricao,
                    img: item.img,
                    category: (item.category as any)?.id, // Passa o ID da categoria
                  },
                })
            }
        />}
    </View>
);

// Componente principal da tela
const ChannelsScreen = () => {
    const { channels, loading, error } = useFetchChannels();
    const channelList = useChanneStore(state => state.channelList);

      const navigation = useNavigation();


           useLayoutEffect(() => {
 
                navigation.setOptions({
                    headerTransparent:true,
                    headerTintColor:'#ffff',
                    headerStyle: {backgroundColor: 'rgba(38, 38, 38, 0.83)'},
                    // headerRight: () => ( 
                    //     <IconButton icon={'bookmark'} 
                    //         iconColor={isMarkedInStore? '#2e5ffdff' : '#ffff'}
                    //         size={30}
                    //         onPressOut={handleMark}
                    //         />
                    // ),
                });
      
        },);
    

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.header}>Lista de Canais ({channels.length})</Text>
                <FlatList
                    data={channels}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChannelItem item={item} listChannel={channelList} />}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </SafeAreaView>
    );
};

// --- Estilos Atualizados ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background, // Fundo principal
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 50,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15, // Aumentado para dar espaço
        color: COLORS.text, // Cor do texto principal
    },
    message: {
        fontSize: 16,
        color: COLORS.textSecondary, // Cor secundária
        marginTop: 10,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.error, // Cor de erro
        textAlign: 'center',
    },
    errorTextDetail: {
        fontSize: 14,
        color: COLORS.error, // Cor de erro
        textAlign: 'center',
        marginTop: 5,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface, // Superfície do item
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoWrapper: {
        flex: 4, // Ocupa a maior parte do espaço
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10, // Espaço entre o conteúdo e o ícone
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30, // Círculo
        marginRight: 15,
        backgroundColor: COLORS.border // Cor de placeholder
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        // Removido width:'100%' e flex:1 conflitante
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary, // Destaque com primary
    },
    url: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    category: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.secondary, // Destaque com secondary
        marginTop: 4,
    },
    description: {
        fontSize: 13,
        color: COLORS.text, // Texto principal
        marginTop: 4,
    },
});

export default ChannelsScreen;