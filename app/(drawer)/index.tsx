import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { ActivityIndicator, IconButton, MD2Colors } from 'react-native-paper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useChanneStore } from '../../store/useChanneStore';
import useRssFeed from '../hooks/useRssFeed';
import { ReelCardRss } from '@/components/ReelCardRss';
import { ItemRSS } from '@/types/types';


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