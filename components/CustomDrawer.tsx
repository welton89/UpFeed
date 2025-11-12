import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Button, List, Divider, IconButton, Icon } from 'react-native-paper';
import { useChanneStore } from '../store/useChanneStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { Channel, Category } from '@/types/types';
import { Image } from 'expo-image';


interface GroupedChannels {
  [categoryName: string]: Channel[];
}

// --- Definição das Cores do Tema (Dark Gray Moderno) ---
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


const groupChannelsByCategory = (channels: Channel[], allCategories: Category[]): GroupedChannels => {
  const grouped: GroupedChannels = {};
  channels.forEach(channel => {
    let categoryName = 'Sem Categoria';

    if (channel.category && typeof channel.category === 'object' && channel.category.name) {
      categoryName = channel.category.name;
    } else if (channel.category && channel.category.id) {
      const foundCategory = allCategories.find(cat => cat.id === channel.category?.id);
      categoryName = foundCategory?.name || 'Sem Categoria';
    }

    if (!grouped[categoryName]) grouped[categoryName] = [];
    grouped[categoryName].push(channel);
  });
  return grouped;
};

// ======================================================
// 🌟 ANIMAÇÃO DE EXPANSÃO CUSTOMIZADA
// ======================================================
interface AccordionItemProps {
  title: string;
  isExpanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

const AnimatedAccordion: React.FC<AccordionItemProps> = ({ title, isExpanded, onPress, children }) => {
  const [animation] = useState(new Animated.Value(isExpanded ? 1 : 0));
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight || 0],
  });

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={localStyles.accordionContainer}>
      <TouchableOpacity style={localStyles.accordionHeader} onPress={onPress}>
        <List.Icon  icon="folder-outline" color={COLORS.primary} />
        <Text style={[localStyles.accordionTitle]}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <List.Icon icon="chevron-right" color={COLORS.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[localStyles.accordionBody, { height }]}>
        <View
          style={localStyles.accordionContent}
          onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
        >
          {children}
        </View>
      </Animated.View>

      <Divider style={{ marginHorizontal: 10, backgroundColor: COLORS.border, opacity: 0.5 }} />
    </View>
  );
};

// ======================================================
// 🌟 DRAWER CUSTOMIZADO
// ======================================================
function CustomDrawerContent(props: any) {
  const channelList = useChanneStore(state => state.channelList);
  const categoryList = useCategoryStore(state => state.categoryList);
  const groupedChannels = groupChannelsByCategory(channelList, categoryList);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      const animation = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      });
      animation.start();
      return () => animation.stop();
    }, [fadeAnim])
  );

  const handlePress = (categoryName: string) => {
    setExpanded(expanded === categoryName ? null : categoryName);
  };

  // Estilos adaptados ao tema Dark Gray
  const darkStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    headerText: {
      margin: 15,
      fontWeight: 'bold',
      fontSize: 14,
      color: COLORS.text, // Texto do cabeçalho
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingBottom: 5,
    },
    buttonStyle: {
      padding: 3,
      backgroundColor: COLORS.surface, // Botões com fundo surface
      borderRadius: 12,
    },
    buttonContent: {
      color: COLORS.primary, // Texto do botão em primary
      fontSize: 12,
      fontWeight: 'bold',
    },
    itemStyle: {
      paddingLeft: 15, // Ajuste para alinhar com o acordeão
      backgroundColor: COLORS.backgroundDropbox, // Fundo dos sub-itens
      borderTopColor: COLORS.border,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    itemTitle: {
      color: COLORS.text,
      fontSize: 16,
    },
    // Estilo para o botão principal de Feeds Salvos
    primaryButtonStyle: {
      marginTop: 15, 
      marginHorizontal: 15,
      padding: 3,

      backgroundColor: COLORS.primary,
      borderRadius: 12,
    },
    primaryButtonContent: {
      alignItems:'center',
      color: COLORS.background, // Texto em contraste com o primary
      fontSize: 16,
      fontWeight: 'bold',
    }
  });

  return (
    <DrawerContentScrollView style={darkStyles.container} {...props}>
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Usamos DrawerItemList para renderizar as rotas padrão */}
        <DrawerItemList 
            {...props} 
            // Sobrescrevendo estilos dos itens padrão
            itemStyle={{ backgroundColor: COLORS.background }}
            labelStyle={{ color: COLORS.text }}
        />

        {/* --- Botões de ação global --- */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 10, marginTop: 10 }}>
          <Button
            style={{ flex: 1, marginEnd: 5, ...darkStyles.buttonStyle }}
            labelStyle={darkStyles.buttonContent}
            onPress={() => router.push({ pathname: '/pages/createUpdate' })}
          >
            Adicionar Canal
          </Button>
          <Button
            style={{ flex: 1, marginStart: 5, ...darkStyles.buttonStyle }}
            labelStyle={darkStyles.buttonContent}
            onPress={() => router.push({ pathname: '/pages/exploreChannel' })} // Rota de exploração não existe, mantendo a rota existente
          >
            Explorar Canais
          </Button>
        </View>

        {/* Botão de Destaque */}
        <Button
          style={[darkStyles.primaryButtonStyle,{}]}
   
          labelStyle={darkStyles.primaryButtonContent}
          onPress={() => router.push({ pathname: '/(drawer)/channel/[id]', params: { id: 'mark' } })}
        >
          {/* <View>
          <Icon size={30} source={'bookmark'} />
          </View> */}
         
      Feeds Salvos
     
        </Button>

        <Text style={darkStyles.headerText}>Seus Canais por Categoria</Text>

        {/* 🎯 Loop das categorias */}
        {Object.keys(groupedChannels).sort().map(categoryName => {
          const isExpanded = expanded === categoryName;
          return (
            <AnimatedAccordion
              key={categoryName}
              title={categoryName}
              isExpanded={isExpanded}
              onPress={() => handlePress(categoryName)}
            >
              {groupedChannels[categoryName].map(item => (
                <List.Item
                  key={item.id}
                  title={item.name}
                  description={item.url}
                  titleStyle={darkStyles.itemTitle}
                  descriptionStyle={{ color: COLORS.textSecondary, fontSize: 12 }}
                  onPress={() =>
                    router.push({ pathname: '/(drawer)/channel/[id]', params: { id: item.id } })
                  }

                  style={darkStyles.itemStyle}
                  left={() => (
             <Image
                       source={{ uri: item.img || 'https://reporterbrasil.org.br/wp-content/uploads/2014/02/RSS.png' }}
                       style={{width:45,height:45,borderRadius:25}}
                       contentFit="cover" 
                       />
                  )}
                  right={() => (
                    <IconButton
                      icon="pencil-outline"
                      iconColor={COLORS.textSecondary}
                      size={18}
                      onPress={() =>
                        router.push({
                          pathname: '/pages/createUpdate',
                          params: {
                            id: item.id,
                            name: item.name,
                            url: item.url,
                            descricao: item.descricao,
                            img: item.img,
                            category: item.category?.id,
                          },
                        })
                      }
                    />
                  )}
                />
              ))}
            </AnimatedAccordion>
          );
        })}
      </Animated.View>
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;

// ======================================================
// 🌟 ESTILOS LOCAIS (para o Acordeão)
// ======================================================
const localStyles = StyleSheet.create({
  accordionContainer: {
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface, // Fundo do container do acordeão
  },
  accordionHeader: {
    flexDirection: 'row',
    gap:7,
    height:55,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  accordionTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text, // Título da categoria
  },
  accordionBody: {
    overflow: 'hidden',
  },
  accordionContent: {
    paddingBottom: 5,
    backgroundColor: COLORS.surface, // Fundo do container do acordeão

  },
});