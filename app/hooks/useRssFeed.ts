import { useState, useEffect } from 'react';
import axios from 'axios';
import { Channel, ItemRSS } from '@/types/types'; // Certifique-se de que os tipos estão corretos aqui

import { XMLParser } from 'fast-xml-parser'; 
import { useFeedStore } from '@/store/useFeedStore';

// --- Interface do Resultado do Hook ---
interface HookResult {
  feedItems: ItemRSS[];
  isLoading: boolean;
  error: string | null;
}

// --- Funções Auxiliares de Parsing (Otimizadas) ---

const optionsParser = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    removeNSPrefix: true,
};
const parser = new XMLParser(optionsParser);


const processSingleItem = (item: any, canal: Channel, index: number): ItemRSS | null => {
    const titulo = item.title || 'Sem título';
    const bodyEncoded = item['encoded'] || item.description; 
    const dataPublicacaoString = item.pubDate;
    const link = item.link;
    
    // --- INÍCIO DA REVISÃO DE BODYHTML (CORREÇÃO DE TIPO) ---
    let bodyHTML: string | null = null;
    if (bodyEncoded) {
        let tempBody;
        
        // 1. Tenta extrair de '#text' se for um objeto (comum em feeds complexos)
        if (typeof bodyEncoded === 'object' && bodyEncoded !== null) {
            tempBody = bodyEncoded['#text'];
        } else {
            // 2. Se não for objeto, usa o valor como está (deve ser a string)
            tempBody = bodyEncoded;
        }

        // 3. Garante que o resultado final é uma string não vazia antes de atribuir
        if (typeof tempBody === 'string' && tempBody.length > 0) {
            bodyHTML = tempBody;
        } else if (bodyEncoded && typeof bodyEncoded !== 'string') {
            // Se bodyEncoded existia mas não conseguimos extrair uma string, logamos
            console.warn(`[RSS Parser] O item '${titulo}' do canal '${canal.name}' retornou um corpo inesperado. Tipo de bodyEncoded: ${typeof bodyEncoded}. Conteúdo:`, bodyEncoded);
        }
    }
    // --- FIM DA REVISÃO DE BODYHTML ---

    // INÍCIO DA CORREÇÃO: Trata item.guid como objeto ou string
    let rawId = item.guid || link;
    let itemId: string;

    if (rawId && typeof rawId === 'object' && rawId['#text']) {
        itemId = rawId['#text'];
    } else if (typeof rawId === 'string') {
        itemId = rawId;
    } else {
        itemId = `sem_id_${canal.name}_${index}`;
    }
    
    const id = itemId; 
    // FIM DA CORREÇÃO

    const tagsElements = item.category;
    let tags: string | null = null;
    if (tagsElements) {
        const tagsArray = Array.isArray(tagsElements) ? tagsElements : [tagsElements];
        tags = tagsArray.map((tag: any) => tag['#text'] || tag).filter(Boolean).join(', ');
    }

    const dataPublicacao = dataPublicacaoString 
                           ? new Date(dataPublicacaoString).toISOString() 
                           : null;

    let imgURL: string | null = null;
    
    // Agora, temos certeza que bodyHTML é string ou null.
    if (typeof bodyHTML === 'string' && bodyHTML.length > 0) { 
        const imgRegExp = /<img[^>]+src\s*=\s*['"]([^'"]+)['"]/i;
        const match = bodyHTML.match(imgRegExp);
        if (match && match[1]) {
            imgURL = match[1];
        }
    }

    // Se o corpo for nulo/vazio, garantimos que a propriedade 'body' no retorno seja uma string
    const finalBody = bodyHTML || 'Sem corpo do texto em HTML.';

    if (!titulo || !id) return null;

    return {
        canal: canal,
        id: id,
        dataPublicacao: dataPublicacao,
        titulo: titulo,
        tags: tags,
        body: finalBody, // Usa o corpo garantido como string
        img: imgURL,
        mark: false,
    };
};

// --- HOOK CUSTOMIZADO useRssFeed ---

const useRssFeed = (target: 'all' | 'mark' | string, channelList: Channel[], trigger: number = 0): HookResult => {
  const [feedItems, setFeedItems] = useState<ItemRSS[]>(([]));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🚨 Não há inscrição no useFeedStore aqui para evitar reloads no HomeScreen.

  useEffect(() => {
    
    // Caso de uso: Feeds Marcados (vem diretamente da Store, sem busca de rede)
    if (target === 'mark') {
        // Usa getState() para consultar o estado sem se inscrever.
        const markedFeeds = useFeedStore.getState().feedList;
        setFeedItems(markedFeeds);
        setIsLoading(false);
        return;
    }

    // Caso de uso: Busca de Rede
    let channelsToFetch: Channel[] = [];
    
    if (target === 'all') {
        channelsToFetch = channelList;
    } else {
        const singleChannel = channelList.find(c => c.id === target);
        if (singleChannel) {
            channelsToFetch = [singleChannel];
        } else if (channelList.length > 0) {
            setError(`Canal com ID '${target}' não encontrado na lista.`);
            setFeedItems([]);
            setIsLoading(false);
            return;
        }
    }
    
    if (channelsToFetch.length === 0) {
        setIsLoading(false);
        return;
    }


    const fetchAllFeeds = async () => {
      setIsLoading(true);
      setError(null);
      const allItems: ItemRSS[] = [];
      let fetchError: string | null = null;
      
      const fetchPromises = channelsToFetch.map(async (channel) => {
          try {
              const resposta = await axios.get(channel.url);
              const xmlTexto: string = resposta.data;
              const resultadoJSON: any = parser.parse(xmlTexto);

              const canalElement = resultadoJSON.rss?.channel;
              if (!canalElement) {
                  console.warn(`[RSS Parser] Não foi possível encontrar <channel> para ${channel.name}.`);
                  return;
              }

              // Garante que é um array ou cria um array de item (se for um único item)
              const itens = Array.isArray(canalElement.item) ? canalElement.item : [canalElement.item].filter(Boolean);
              
              itens.forEach((item: any, index: number) => {
                  const processedItem = processSingleItem(item, channel, index);
                  if (processedItem) {
                      allItems.push(processedItem);
                  }
              });

          } catch (err) {
              const errorMessage = axios.isAxiosError(err) ? err.message : (err as Error).message;
              console.error(`Falha ao buscar feed de ${channel.name}: ${errorMessage}`);
              if (!fetchError) {
                fetchError = `Falha ao buscar um dos feeds (${channel.name}).`;
              }
          }
      });
      
      await Promise.all(fetchPromises);
      
      // 1. Obtém o estado ATUAL dos marcadores (Consulta sem Inscrição).
      const markedItems = useFeedStore.getState().feedList;
      const markedIds = new Set(markedItems.map(item => item.id));

      // 2. Aplica o status 'mark'
      const finalItemsWithMark = allItems.map(item => ({
          ...item,
          mark: markedIds.has(item.id),
      }));


      // 3. ORDENAÇÃO CONSOLIDADA
      finalItemsWithMark.sort((a, b) => {
          if (!a.dataPublicacao || !b.dataPublicacao) {
              if (!a.dataPublicacao && !b.dataPublicacao) return 0;
              return !a.dataPublicacao ? 1 : -1; 
          }
          return new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime();
      });

      setFeedItems(finalItemsWithMark);
      if (fetchError) {
          setError(fetchError);
      }

      setIsLoading(false);
    };
 
    fetchAllFeeds()
    
  // Dependências limpas: O hook só roda se o canal ou o trigger mudar.
  }, [target, channelList, trigger]); 

  // 🚨 Retorna explicitamente o tipo HookResult.
  return { feedItems, isLoading, error };
};

export default useRssFeed;