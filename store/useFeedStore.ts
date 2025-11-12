import { create } from 'zustand';
import { dbService, ItemRSS } from '@/services/dbService'; 
import { Channel, Category } from '@/types/types'; // Assumindo que Channel e Category estão aqui

interface FeedState {
    feedList: ItemRSS[];
    isDBLoaded: boolean;
}

interface FeedActions {
    loadFeed: () => Promise<void>;
    insertFeedItem: (item: ItemRSS) => Promise<void>;
    deleteFeedItem: (id: string) => Promise<void>;
    toggleMark: (itemId: string, isMarked: boolean) => Promise<void>;
}

export const useFeedStore = create<FeedState & FeedActions>((set, get) => ({

    feedList: [],
    isDBLoaded: false,

    // -----------------------------------------------------------------
    // AÇÃO: Carregar Feed
    // -----------------------------------------------------------------
    loadFeed: async () => {
        try {
            // Note: A função getFeedItems retorna ItemRSS com apenas IDs (canal/category)
            const storedFeed = await dbService.feed.getFeedItems();
            
            set({ 
                feedList: storedFeed,
                isDBLoaded: true,
            });
            console.log(`Dados carregados: ${storedFeed.length} itens do feed.`);
        } catch (error) {
            console.error("Erro ao carregar feed do DB:", error);
        }
    },

    // -----------------------------------------------------------------
    // AÇÃO: Inserir Item no Feed
    // -----------------------------------------------------------------
    insertFeedItem: async (item) => {
        try {
            // 1. SQLite
            await dbService.feed.insertFeedItem(item);

            // 2. Zustand
            set((state) => ({
                // Adiciona o novo item no início da lista (assumindo ordem por data)
                feedList: [item, ...state.feedList], 
            }));

        } catch (error) {
            console.error("Erro ao inserir item do feed no DB:", error);
        }
    },
    deleteFeedItem: async (id:string) => {
        try {
            // 1. SQLite
            await dbService.feed.deleteFeedItem(id);

            // 2. Zustand
              set((state) => ({
                feedList: state.feedList.filter((feed) => feed.id !== id),
            }));

        } catch (error) {
            console.error("Erro ao apagar item do feed no DB:", error);
        }
    },

    // -----------------------------------------------------------------
    // AÇÃO: Marcar/Desmarcar Item (Update)
    // -----------------------------------------------------------------
    toggleMark: async (itemId, isMarked) => {
        // 1. SQLite
        await dbService.feed.updateFeedItemMark(itemId, isMarked);

        // 2. Zustand (Atualiza o item no estado local)
        set((state) => ({
            feedList: state.feedList.map(item => 
                item.id === itemId ? { ...item, mark: isMarked } : item
            ),
        }));
    },
}));