import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { ItemRSS } from '@/types/types';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { IconButton } from 'react-native-paper';
import { useFeedStore } from '@/store/useFeedStore';


interface ReelCardRssProps {
  item: ItemRSS;
  cardHeight: number; 
}

export const ReelCardRss: React.FC<ReelCardRssProps> = React.memo(({ item, cardHeight }) => {
    const imgAlter:string = 'https://thebulletin.org/wp-content/uploads/2023/04/chat-ai-news.gif';
    const feedsMarked = useFeedStore(state => state.insertFeedItem);
    const feedsMarkedDel = useFeedStore(state => state.deleteFeedItem);
     const isMarkedInStore = useFeedStore(
        React.useCallback(
            (state) => state.feedList.some(itemMark => itemMark.id === item.id),
            [item.id] // 👈 Depende APENAS do ID deste cartão
        )
    );
  
      const isMark = isMarkedInStore; 
    const imageUrl = item.img || item.canal.img || imgAlter
    // const imageUrl = item.img || item.canal.img || 'https://static.vecteezy.com/ti/vetor-gratis/p1/8605368-rss-feed-icon-isolated-on-black-bakcround-symbol-logo-illustration-for-mobile-concept-and-web-design-vector-illustration-vetor.jpg'; 
    const dataFormatada = item.dataPublicacao 
        ? new Date(item.dataPublicacao).toLocaleDateString('pt-BR') + 
        ' às ' + 
        new Date(item.dataPublicacao).toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit' 
        })
        : 'Sem data';


    const canNavigate = item.body && item.body.length > 0;

    const handlePressItem = (item: ItemRSS) => {
        if (canNavigate) {
          router.push({
            pathname: '/pages/ArticleDetailScreen', 
            params: { 
                id:item.id,
                titulo: item.titulo, 
                body: item.body ,
                tags: item.tags,
                dataPublicacao: item.dataPublicacao,
                img: item.img,
                canalId:item?.canal.id,
                mark:item?.mark.toString() || 'true',
            }
          });
        } else {
          console.warn("Conteúdo da notícia indisponível para esta URL.");
        }
      };



        const handleMark = async () => {
            if (isMark){
              await  feedsMarkedDel(item.id)
              Alert.alert('Removel salvo')

            }else{
                const newMark:ItemRSS = {
                   ...item,
                    mark: true,
                }
                await feedsMarked(newMark)
                Alert.alert('Adicionou salvou')
            }
        }


  return (
    <View style={[styles.container, { height: cardHeight }]}> 
    
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      )}



       <TouchableOpacity 
              onPress={() => handlePressItem(item)}
              disabled={!canNavigate} 
              activeOpacity={0.7} 
              style={{width: '100%', }}
            >
        <BlurView intensity={100}
        //  experimentalBlurMethod='dimezisBlurView'
          tint="dark" style={styles.textOverlay}>



      <View style={{flexDirection:'row',alignItems:'center',gap:15}} >

    
       <TouchableOpacity  style={{flexDirection:'row',alignItems:'center',gap:15}}
              onPress={() => router.push({ pathname: `/(drawer)/channel/[id]`,params: { id: item.canal.id } })}
              disabled={!canNavigate} 
              activeOpacity={0.7} 
            >

        <Image
          source={{ uri: item.canal.img || 'https://reporterbrasil.org.br/wp-content/uploads/2014/02/RSS.png' }}
          style={{width:50,height:50,borderRadius:25}}
          contentFit="cover" 
          />
        <Text style={styles.channelName}>{item.canal.name}</Text>
          </TouchableOpacity>
    
      <IconButton icon={'bookmark'} 
      iconColor={isMark ? '#2e5ffdff' : '#ffff'}
      style={{position:'absolute',bottom:'0%',right:2,backgroundColor:'#00000059'}}
      size={30}
      onPress={handleMark}
      />

          </View>


        <Text style={styles.title} numberOfLines={4}>
          {item.titulo}
        </Text>
        <Text style={styles.metadata}>Publicado em: {dataFormatada}</Text>
        </BlurView>
    </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end', 
    backgroundColor: '#000',
  },
  image: {
    ...StyleSheet.absoluteFillObject, // Preenche todo o container
  },
  textOverlay: {
    padding: 30,
    bottom:80,
    paddingLeft: 15,
    paddingRight: 15,
    
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700', // Destaque para o canal
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  metadata: {
    fontSize: 14,
    color: '#ccc',
  },
});