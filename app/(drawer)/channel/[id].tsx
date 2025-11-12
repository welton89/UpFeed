
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { CardRss } from '@/components/cardRss';
import { useChanneStore } from '@/store/useChanneStore';
import { useFeedStore } from '@/store/useFeedStore';
import { Channel, ItemRSS } from '@/types/types';
import useRssFeed from '../../hooks/useRssFeed';



const FeedComponent: React.FC = () => {
  const { id } = useLocalSearchParams();
  const imgAlter =  'https://www.suatv.com.br/wp-content/uploads/2017/02/SUATV-Capas-para-blog-1.png'
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const channels =  useChanneStore(state => state.channelList) 
  const feedsList = useFeedStore(state => state.feedList)
  const canal:Channel| undefined = id == 'mark' ? undefined : channels.find(item => item.id === id);
  const { feedItems, isLoading, error, } = useRssFeed(id.toString(), channels, refreshTrigger);
  const navigation = useNavigation();

    
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [feedItems]);

  
  useLayoutEffect(() => {
    if (id ) {
          navigation.setOptions({
            headerTitle: ` ${canal?.name || (feedsList.length +' Feeds Salvos')}`,
            headerTintColor:'#ffff',
            headerTransparent:true,
            headerStyle: {
              backgroundColor: 'rgba(38, 38, 38, 0)'
            },
            headerRight: () => (
              <IconButton 
                icon={'reload'}
                size={30}
                style={{ marginRight: 25 }}
                onPress={handleRefresh} 
              />
            ),
            headerBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <Image
              source={{uri:canal?.img || imgAlter}} 
              style={{flex: 1, width: null,  height: '100%', opacity: 0.3}}
              resizeMode="cover" 
            />
            {/* <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(226, 12, 12, 0.2)'}} /> */}
          </View>
        ),

          });
        }
    }, [navigation, id]);
 


  // --- Renderização Principal (Loading/Error/Lista) ---

  if (isLoading) {
    return (
      <View style={[styles.center,styles.container]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ color: '#d8d8d8ff'}}>Carregando feed...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center,styles.container]}>
        <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center', }}
        >Erro ao carregar o feed: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.titulo}
        renderItem={({ item }) =>  <CardRss item={item} cardHeight={280}/>}//{renderItem}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:100,
        backgroundColor: '#282c34',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
   
});

export default FeedComponent;