import { create } from 'zustand'; 
import { Alert } from 'react-native'; 
import { dbService } from '@/services/dbService'; 
import { Category, Channel } from '@/types/types';

interface ChannelState {
    channelList: Channel[];
    nextId: number;
    isDBLoaded: boolean;
}

// --- Tipagem para as Ações (Funções para modificar o estado) ---
interface ChannelActions {
    // 1. Incluir (Create)
     loadChannel: () => Promise<void>; 
    incluir: (
        name: string,
        url: string,
        descricao: string | '',
        img: string | '',
        category: Category | undefined
      
    ) => Promise<Channel | null>; 

    // 2. Obter/Buscar (Read) - Não são necessárias ações, pois o estado é acessado diretamente
    //      A função 'buscarPorId' será um *selector* ou pode ser definida externamente se necessário

    // 3. Editar (Update)
   editar: (id: string, dados: Partial<Omit<Channel, 'id'>>) => Promise<Channel | null>;
    excluir: (id: string) => Promise<boolean>;
    buscarPorId: (id: string) => Channel | undefined;
}

// --- Criação da Store do Zustand ---
// Combina o Estado (AppState) e as Ações (AppActions)
export const useChanneStore = create<ChannelState & ChannelActions>((set, get) => ({
    channelList: [],
    nextId: 1,
     isDBLoaded: false,
    
loadChannel: async () => {
    await dbService.initDB();
        try {
            const storedApps = await dbService.channels.getChannels(); // getApps();
            
            const maxId = storedApps.reduce((max, app) => 
                Math.max(max, parseInt(app.id)), 0
            );

            set({ 
                channelList: storedApps, 
                nextId: maxId + 1,
                isDBLoaded: true,
            });
            console.log(`Dados carregados: ${storedApps.length} apps.`);
        } catch (error) {
            console.error("Erro ao carregar dados do DB:", error);
        }
    },
    // --- Ações (Modificam o estado via 'set') ---

incluir: async (name, url, descricao, img, category) => {
        const state = get();
        const nextId = state.nextId;
        const newId = nextId.toString();

        const novoApp: Channel = {
            id: newId, 
            name,
            url,
            descricao,
            img,
            category
  
        };

        try {
            // OPERAÇÃO 1: SQLite
            await dbService.channels.insertChannel(novoApp);//insertApp(novoApp);

            // OPERAÇÃO 2: Zustand
            set((state) => ({
                channelList: [...state.channelList, novoApp], 
                nextId: state.nextId + 1,
            }));
            
            return novoApp;

        } catch (error) {
            console.error("Erro ao incluir no DB:", error);
            Alert.alert("Erro", "Falha ao salvar o aplicativo.");
            return null;
        }
    },
  
    /**
     * Edita um objeto AppType existente.
     */

 editar: async (id, dados) => {
        const index = get().channelList.findIndex(app => app.id === id);
        if (index === -1) return null;

        // Cria o objeto atualizado mesclando o atual com os novos dados
        const appToUpdate = {
            ...get().channelList[index], 
            ...dados
        } as Channel; 

        try {
            // OPERAÇÃO 1: SQLite
            await dbService.channels.updateChannel(id, dados);

            // OPERAÇÃO 2: Zustand
            set((state): { channelList: Channel[]; } => {
                const novaLista = [...state.channelList];
                novaLista[index] = appToUpdate;

                return {
                    channelList: novaLista,
                };
            });
            return appToUpdate;

        } catch (error) {
            console.error("Erro ao editar no DB:", error);
            return null;
        }
    },



    /**
     * Exclui um objeto AppType pelo seu ID.
     */

     excluir: async (id) => {
        const tamanhoInicial = get().channelList.length;

        try {
            await dbService.channels.deleteChannel(id);

            set((state) => ({
                channelList: state.channelList.filter((app) => app.id !== id),
            }));

            const itemRemovido = get().channelList.length < tamanhoInicial;
            
            if (itemRemovido) {
                Alert.alert('Sucesso', 'Aplicativo removido');
            }
            return itemRemovido;

        } catch (error) {
            console.error("Erro ao excluir no DB:", error);
            Alert.alert("Erro", "Falha ao excluir o aplicativo.");
            return false;
        }
    },

    

    buscarPorId: (id) => {
        return get().channelList.find((app) => app.id === id);
    },
}));

