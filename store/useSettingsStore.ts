import { create } from 'zustand';
import { dbService } from '@/services/dbService';

// Estado tipado para um exemplo de configurações. 
// Adicione mais campos conforme necessário.
interface SettingsState {
    theme: 'light' | 'dark';
    fontSize: number;
    isLoaded: boolean;
}

interface SettingsActions {
    loadSettings: () => Promise<void>;
    setTheme: (theme: 'light' | 'dark') => Promise<void>;
    setFontSize: (size: number) => Promise<void>;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set, get) => ({
    theme: 'light', // Valor padrão
    fontSize: 16, // Valor padrão
    isLoaded: false,

    // -----------------------------------------------------------------
    // AÇÃO: Carregar Configurações (Inicializa o estado com o DB)
    // -----------------------------------------------------------------
    loadSettings: async () => {
        // Tenta carregar as configurações do DB
        const savedTheme = await dbService.settings.getSetting('theme');
        const savedFontSize = await dbService.settings.getSetting('fontSize');

        set({
            theme: (savedTheme as 'light' | 'dark') || 'light',
            fontSize: savedFontSize ? parseInt(savedFontSize) : 16,
            isLoaded: true,
        });
    },

    // -----------------------------------------------------------------
    // AÇÃO: Definir Tema
    // -----------------------------------------------------------------
    setTheme: async (newTheme) => {
        // 1. Atualiza no SQLite
        await dbService.settings.setSetting('theme', newTheme);
        // 2. Atualiza no Zustand
        set({ theme: newTheme });
    },

    // -----------------------------------------------------------------
    // AÇÃO: Definir Tamanho da Fonte
    // -----------------------------------------------------------------
    setFontSize: async (newSize) => {
        // 1. Atualiza no SQLite
        await dbService.settings.setSetting('fontSize', newSize.toString());
        // 2. Atualiza no Zustand
        set({ fontSize: newSize });
    },
}));