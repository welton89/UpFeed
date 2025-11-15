import { FlatList, Text, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Button, IconButton } from 'react-native-paper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChanneStore } from '../../store/useChanneStore';
import useRssFeed from '../hooks/useRssFeed';
import { ReelCardRss } from '@/components/ReelCardRss';
import { ItemRSS } from '@/types/types';
import {COLORS} from '../../themes/colors'


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
      if (flatListRef.current && !loadingAll) {
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
          }}
        >
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
                  backgroundColor: COLORS.surface, 
                  borderRadius: 12, }}
                  labelStyle={ {
                    color: COLORS.primary, 
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                  onPress={() => router.push({ pathname: '/pages/createUpdate' })}
                  >
                Adicionar Canal
              </Button>
              <Button
                style={{ flex: 1, marginStart: 5,  padding: 3,
                  backgroundColor: COLORS.surface, 
                  borderRadius: 12, }}
                  labelStyle={ {
                    color: COLORS.primary, 
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}
                  onPress={() => router.push({ pathname: '/pages/exploreChannel' })} 
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
        backgroundColor: COLORS.background,
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
