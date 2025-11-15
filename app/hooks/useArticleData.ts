import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useFeedStore } from '@/store/useFeedStore';
import { useChanneStore } from '@/store/useChanneStore';
import { ItemRSS, Channel } from '@/types/types';
import Toast from 'react-native-toast-message';


type ArticleParams = Pick<ItemRSS, 'id' | 'titulo' | 'body' | 'dataPublicacao' | 'tags' | 'img'> & {
    canalId: string; // Parâmetro adicional de lookup
};

interface HeaderRightConfig {
    icon: string;
    iconColor: string;
    onPressOut: () => Promise<void>;
}

interface UseArticleDataReturn {
    params: ArticleParams;
    canal: Channel | undefined;
    dataFormatada: string;
    isMarked: boolean;
    dark: boolean;
    setDark: React.Dispatch<React.SetStateAction<boolean>>;
    headerRightConfig: HeaderRightConfig | null;
}


export const useArticleData = (): UseArticleDataReturn => {
    const navigation = useNavigation();
    
    // Parâmetros do Expo Router (assumindo que são strings)
    const rawParams = useLocalSearchParams();
    const params = rawParams as unknown as ArticleParams; 
    
    const [dark, setDark] = useState(true); 

    // 1. Extração e Otimização do Canal
    const channels = useChanneStore(state => state.channelList);
    const canal = useMemo(() => 
        channels.find(item => item.id === params.canalId), 
        [channels, params.canalId]
    );

    // 2. Formatação de Data
    const dataFormatada = useMemo(() => {
        if (!params.dataPublicacao) return 'Sem data';
        const date = new Date(params.dataPublicacao.toString());
        return date.toLocaleDateString('pt-BR') + 
               ' às ' + 
               date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }, [params.dataPublicacao]);

    // 3. Lógica de Marcação (Favoritos)
    const feedsMarked = useFeedStore(state => state.insertFeedItem);
    const feedsMarkedDel = useFeedStore(state => state.deleteFeedItem);

    const isMarked = useFeedStore(
        useCallback((state) => state.feedList.some(itemMark => itemMark.id === params.id), [params.id])
    );

    const handleMark = useCallback(async () => {
        if (!params.id || !params.titulo || !params.body || !canal) return;

        if (isMarked) {
            await feedsMarkedDel(params.id.toString());
             Toast.show({
                            type: 'info',
                            text1: 'Tudo Certo',
                            text2: `Artigo do ${canal.name} removido.`,
                        });
        } else {
            // Reutiliza o tipo ItemRSS para criar o objeto a ser salvo
            const newMark: ItemRSS = {
                id: params.id.toString(),
                titulo: params.titulo.toString(),
                body: params.body.toString(),
                tags: params.tags?.toString() || '',
                dataPublicacao: params.dataPublicacao!.toString(),
                img: params.img!.toString(),
                canal: canal, 
                mark: true,
            };
            await feedsMarked(newMark);
             Toast.show({
                            type: 'success',
                            text1: 'Tudo Certo 😁👍',
                            text2: `Artigo do ${canal.name} salvo.`,
                        });
        }
    }, [isMarked, params, canal, feedsMarked, feedsMarkedDel]);

    // 4. Configuração da Ação do Header (Retornado para a View)
    const headerRightConfig = useMemo(() => {
        if (!params.id) return null;

        return {
            icon: 'bookmark',
            iconColor: isMarked ? '#2e5ffdff' : '#ffff',
            onPressOut: handleMark,
        };
    }, [isMarked, handleMark, params.id]);

    // 5. Efeito para Definir as Opções de Navegação (Título e Estilos)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: `${canal?.name || params.titulo || 'Detalhe'}`,
            headerTransparent: true,
            headerTintColor: '#ffff',
            headerStyle: { backgroundColor: 'rgba(38, 38, 38, 0.83)' },
            // A renderização do headerRight é feita no componente ArticleDetailScreen
        });
    }, [navigation, params.titulo, canal?.name]);

    return {
        params,
        canal,
        dataFormatada,
        isMarked,
        dark,
        setDark,
        headerRightConfig,
    };
};