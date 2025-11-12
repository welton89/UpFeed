import { useLocalSearchParams, useNavigation } from 'expo-router'; 

import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router'; 
// import useRssFeed from '../hooks/useRssFeed';
import { Channel, ItemRSS } from '@/types/types';

// --- Definição das Cores do Tema (Dark Gray Moderno) ---
const COLORS = {
    background: '#282c34', // Fundo principal da página (contexto)
    surface: '#3c4048',   // Superfície do card (contraste sutil)
    text: '#F8F8F8',      // Texto principal claro
    textSecondary: '#B0B0B0', // Texto secundário (datas, descrições)
    primary: '#61AFEF',   // Cor de destaque (Primary - Azul Ciano moderno)
    secondary: '#98C379', // Cor para tags (Verde sutil)
    error: '#E06C75',     // Cor de erro/indisponível (Vermelho)
    border: '#4A4F59',    // Borda sutil
};


interface CardRssProps {
  item: ItemRSS;
  cardHeight?: number; 
}

export const CardRss:React.FC<CardRssProps> = React.memo(({ item }:CardRssProps) => {

    const canNavigate = item.body && item.body.length > 0;
    const dataFormatada = item.dataPublicacao 
        ? new Date(item.dataPublicacao).toLocaleDateString('pt-BR') + 
        ' às ' + 
        new Date(item.dataPublicacao).toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit' 
        })
        : 'Sem data';
      const handlePressItem = (item: ItemRSS) => {
        if (canNavigate) {
          router.push({
            pathname: '/pages/ArticleDetailScreen', 
            params: { 
                id:  item.id,
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
    // Verifica se a navegação é possível (se há body)

    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => handlePressItem(item)}
        disabled={!canNavigate} // Desabilita o clique se não houver conteúdo
        activeOpacity={0.7} // Efeito visual ao clicar
      >
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.date}>
         {item.canal.name}
        </Text>
        {item.img && (
          <Image 
            style={styles.rssImage} 
            source={{ uri: item.img }} 
            accessibilityLabel="Imagem da notícia"
          />
        )}
        
        <Text style={styles.date}>
          Publicado: {dataFormatada}
        </Text>
        <Text style={styles.tags}>Tags: {item.tags || 'Nenhuma'}</Text>
        
        {!canNavigate && (
           <Text style={styles.unavailable}>Conteúdo indisponível no feed.</Text>
        )}
      </TouchableOpacity>
    );
  });


  const styles = StyleSheet.create({

      itemContainer: {
          padding: 15,
          borderWidth: 1, // Adiciona borda
          borderColor: COLORS.border, // Borda sutil
          marginHorizontal: 10, // Margem lateral
          marginVertical: 8, // Espaçamento vertical
          backgroundColor: COLORS.surface, // Superfície para contraste com o fundo
          borderRadius: 10, // Borda mais arredondada
          elevation: 5, // Sombra para Android
          shadowColor: '#000', // Sombra para iOS
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
      },
      title: {
          fontSize: 17,
          fontWeight: '600',
          marginBottom: 8,
          color: COLORS.text, // Texto principal claro
      },
      rssImage: {
          width: '100%', 
          height: 220,    
          resizeMode: 'cover',
          borderRadius: 8, // Borda da imagem
          marginBottom: 10,
      },
      date: {
          fontSize: 13,
          color: COLORS.textSecondary, // Cor secundária para data/canal
          marginTop: 5,
      },
      tags: {
          fontSize: 12,
          color: COLORS.secondary, // Cor das tags
          marginTop: 5,
      },
      unavailable: {
          fontSize: 13,
          color: COLORS.error, // Cor de erro
          fontStyle: 'italic',
          marginTop: 8,
          paddingTop: 5,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: COLORS.border,
      },

  });