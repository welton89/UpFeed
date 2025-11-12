import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { ActivityIndicator, Button, IconButton, MD2Colors } from 'react-native-paper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChanneStore } from '../../store/useChanneStore';
import useRssFeed from '../hooks/useRssFeed';
import { ReelCardRss } from '@/components/ReelCardRss';
import { ItemRSS } from '@/types/types';

const COLORS = {
    background: '#282c34', // Fundo Dark Gray
    backgroundDropbox: '#3c4048', // Fundo Dark Gray
    surface: '#3c4048',   // Superfícies (Itens de lista, botões secundários)
    text: '#F8F8F8',      // Texto principal claro
    textSecondary: '#B0B0B0', // Texto secundário/descrição
    primary: '#61AFEF',   // Cor de destaque (Primary - Azul Ciano moderno)
    secondary: '#98C379', // Cor secundária para botões
    error: '#E06C75',     // Cor de erro
    border: '#686f7dff',    // Borda sutil
    headerBackground: '#20232a', // Fundo um pouco mais escuro para o cabeçalho
};

export default function HomeScreen() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const channels = useChanneStore(state => state.channelList);
  const { feedItems: allFeeds, isLoading: loadingAll } = useRssFeed('all', channels, refreshTrigger);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<ItemRSS>>(null);
  const CUSTOM_TOP_MARGIN = 0;
  const TOP_EXCLUSION_HEIGHT = insets.top + CUSTOM_TOP_MARGIN;


  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);
      

useEffect(() => {
    // Verifica se o loadingAll acabou (passou de true para false)
    if (flatListRef.current && !loadingAll) {
      // 3. Rola para o topo (offset: 0) com animação
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [loadingAll]);



  useEffect(() => {
      navigation.setOptions({
        headerTitle: ` UpFeed`,
        headerRight: () => (
          <IconButton 
            icon={'reload'}
            size={30}
            style={{ marginRight: 25 }}
            onPress={handleRefresh} 
          />
        ),
      });
  }, [ ]);

if(channels.length == 0){

  return(
    <View  style={{
        backgroundColor: '#282c34',
        paddingTop:30,
        alignItems:'center',
        justifyContent:'center',
        flex:1
    }}  >
<Text style={{
    margin: 15,
      fontWeight: 'bold',
      fontSize: 18,
      textAlign:'center',
      color: COLORS.text,
      paddingBottom: 5,
}}>Parece que você ainda não adicionou nenhum canal 🙃</Text>
<Text style={{
    margin: 15,
      fontWeight: 'bold',
      fontSize: 14,
      textAlign:'center',
      color: '#9c9c9cff',
      paddingBottom: 5,
}}>Toque em Adicionar canal ou em Explorar Canais para adicionar a partir do nosso humilde catálogo</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 10, marginTop: 10 }}>
          <Button
            style={{ flex: 1, marginEnd: 5,  padding: 3,
              backgroundColor: COLORS.surface, // Botões com fundo surface
              borderRadius: 12, }}
              labelStyle={ {
                color: COLORS.primary, // Texto do botão em primary
                fontSize: 12,
                fontWeight: 'bold',
              }}
              onPress={() => router.push({ pathname: '/pages/createUpdate' })}
              >
            Adicionar Canal
          </Button>
          <Button
            style={{ flex: 1, marginStart: 5,  padding: 3,
              backgroundColor: COLORS.surface, // Botões com fundo surface
              borderRadius: 12, }}
              labelStyle={ {
                color: COLORS.primary, // Texto do botão em primary
                fontSize: 12,
                fontWeight: 'bold',
              }}
              onPress={() => router.push({ pathname: '/pages/exploreChannel' })} // Rota de exploração não existe, mantendo a rota existente
              >
            Explorar Canais
          </Button>
        </View>
            </View>
  )

}




  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#282c34',
        paddingTop: TOP_EXCLUSION_HEIGHT,
        paddingBottom: insets.bottom,
      }}
      onLayout={(e) => {
        const totalHeight = e.nativeEvent.layout.height;
        const usableHeight = totalHeight - TOP_EXCLUSION_HEIGHT - insets.bottom;
        setCardHeight(usableHeight);
      }}
    >

      {cardHeight && (
        <FlatList
          data={allFeeds}
          keyExtractor={(item, index) => `-${index}`}
          ref={flatListRef}
          renderItem={({ item }) => <ReelCardRss item={item} cardHeight={cardHeight} />}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          refreshing={loadingAll}
          bounces={false}
          getItemLayout={(data, index) => ({
            length: cardHeight,
            offset: cardHeight * index,
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282c34',
  },
});