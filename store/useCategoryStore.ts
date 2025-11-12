// useCategoryStore.ts (Arquivo completo e corrigido)

import { create } from 'zustand';
import { Alert } from 'react-native';
import { dbService, Category } from '@/services/dbService'; 
// Assumindo que você importou Category e dbService corretamente

interface CategoryState {
    categoryList: Category[];
    isDBLoaded: boolean;
}

interface CategoryActions {
    loadCategories: () => Promise<void>;
    incluirCategory: (name: string) => Promise<Category | null>;
    excluirCategory: (id: string) => Promise<boolean>;
    editarCategory: (id: string, newName: string) => Promise<Category | null>; // NOVA AÇÃO
}

export const useCategoryStore = create<CategoryState & CategoryActions>((set, get) => ({
    categoryList: [],
    isDBLoaded: false,

    // ... (loadCategories e incluirCategory permanecem iguais)

    // -----------------------------------------------------------------
    // AÇÃO: Carregar Categorias (Mantida)
    // -----------------------------------------------------------------
    loadCategories: async () => { 
         try {

            const storedCategories = await dbService.categories.getCategories();

            set({

            categoryList: storedCategories,

            isDBLoaded: true,

            });

            console.log(`Dados carregados: ${storedCategories.length} categorias.`);

        } catch (error) {

            console.error("Erro ao carregar categorias do DB:", error);

            } 
    },

    // -----------------------------------------------------------------
    // AÇÃO: Incluir Categoria (Mantida)
    // -----------------------------------------------------------------
    incluirCategory: async (name) => {
        const newId = Date.now().toString(); 
        const novaCategory: Category = { id: newId, name };

        try {
            await dbService.categories.insertCategory(novaCategory);
            set((state) => ({ categoryList: [...state.categoryList, novaCategory] }));
            return novaCategory;
        } catch (error) {
            console.error("Erro ao incluir categoria no DB:", error);
            Alert.alert("Erro", "Falha ao salvar a categoria.");
            return null;
        }
    },
    
    // -----------------------------------------------------------------
    // AÇÃO: Excluir Categoria (Mantida)
    // -----------------------------------------------------------------
    excluirCategory: async (id) => { 
         try {

// OPERAÇÃO 1: SQLite

await dbService.categories.deleteCategory(id);


// OPERAÇÃO 2: Zustand

set((state) => ({

categoryList: state.categoryList.filter((cat) => cat.id !== id),

}));


Alert.alert('Sucesso', 'Categoria removida');

return true;


} catch (error) {

console.error("Erro ao excluir categoria no DB:", error);

Alert.alert("Erro", "Falha ao excluir a categoria.");

return false;

} 
     },

    // -----------------------------------------------------------------
    // AÇÃO: Editar Categoria (NOVA)
    // -----------------------------------------------------------------
    editarCategory: async (id, newName) => {
        const updatedCategory: Category = { id, name: newName };

        try {
            // OPERAÇÃO 1: SQLite (Assumindo que dbService.categories.updateCategory existe)
            await dbService.categories.updateCategory(updatedCategory);

            // OPERAÇÃO 2: Zustand
            set((state) => ({
                categoryList: state.categoryList.map(cat => 
                    cat.id === id ? updatedCategory : cat
                ),
            }));

            Alert.alert('Sucesso', `Categoria "${newName}" atualizada.`);
            return updatedCategory;

        } catch (error) {
            console.error("Erro ao editar categoria no DB:", error);
            Alert.alert("Erro", "Falha ao atualizar a categoria.");
            return null;
        }
    },
}));