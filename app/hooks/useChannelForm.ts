// useChannelForm.ts

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Toast from 'react-native-toast-message';

// Tipos importados (ajuste os caminhos conforme necessário)
import { Category, Channel } from '@/types/types'; 
import { useChanneStore } from '../../store/useChanneStore';
import { useCategoryStore } from '@/store/useCategoryStore';

/**
 * @interface ChannelFormData
 * Definição dos tipos para os dados do formulário de canal.
 * 'category' armazena o NOME da categoria selecionada para exibição/manipulação.
 */
interface ChannelFormData {
  name: string;
  url: string;
  descricao: string;
  img: string;
  category: string; 
}

/**
 * @function useChannelForm
 * Hook personalizado para gerenciar o estado e a lógica de CRUD de um canal.
 * Lida com a inicialização, validação, inclusão, edição e exclusão de canais.
 * * @returns {object} O estado do formulário, funções de manipulação e estado de UI.
 */
export const useChannelForm = () => {
  // --- Stores e Parâmetros de Rota ---
  const { id, name, url, descricao, img, category } = useLocalSearchParams();
  const listCategory = useCategoryStore(state => state.categoryList); 
  const incluirChannel = useChanneStore(state => state.incluir);
  const editChannel = useChanneStore(state => state.editar);
  const deleteChannel = useChanneStore(state => state.excluir);

  // Determina o modo (edição se 'id' existir)
  const isEditMode = useMemo(() => !!id, [id]);

  // Encontra o nome da categoria inicial para preencher o formulário em modo de edição
  const initialCategoryName = useMemo(() => {
    if (isEditMode && category?.toString()) {
      return listCategory.find(cat => cat.id === category)?.name || '';
    }
    // Caso contrário, usa o nome da primeira categoria, se houver
    return listCategory.length > 0 ? listCategory[0].name : '';
  }, [isEditMode, category, listCategory]);


  // --- Estado do Formulário e UI ---
  const [formData, setFormData] = useState<ChannelFormData>({
    name: name?.toString() || '',
    url: url?.toString() || '',
    descricao: descricao?.toString() || '',
    img: img?.toString() || '',
    category: initialCategoryName,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [categoryDialogVisible, setCategoryDialogVisible] = useState<boolean>(false);

  // --- Funções de Manipulação de Estado ---

  /**
   * @function handleChange
   * Função otimizada com useCallback para atualizar campos do formulário.
   */
  const handleChange = useCallback((fieldName: keyof ChannelFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  /**
   * @function handleSelectCategory
   * Seleciona uma categoria e atualiza o estado do formulário.
   */
  const handleSelectCategory = useCallback((categoryItem: Category) => {
    handleChange('category', categoryItem.name); 
    setCategoryDialogVisible(false);
  }, [handleChange]);

  // --- Funções de Submissão e CRUD ---

  /**
   * @function handleSubmit
   * Lógica de inclusão/edição do canal.
   */
  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim() || !formData.url.trim() || !formData.category.trim()) {
      Alert.alert('Erro', 'Nome, URL do feed e Categoria são obrigatórios.');
      return;
    }
    setLoading(true);
    
    // Encontra o objeto Category completo baseado no nome (category é nome no formData)
    const selectedCategoryObject = listCategory.find(cat => cat.name === formData.category);
    
    if (!selectedCategoryObject) {
        setLoading(false);
        Alert.alert('Erro', 'Categoria não encontrada. Tente novamente.');
        return;
    }

    const channelData = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        descricao: formData.descricao.trim(),
        img: formData.img.trim(),
        category: selectedCategoryObject,
    };

    try {
        let resultChannel: Channel | null = null;
        let successMessage: string;
        
        if (isEditMode && id) {
            // Lógica de EDIÇÃO
            resultChannel = await editChannel(id.toString(), channelData);
            successMessage = `${resultChannel?.name} salvo!`;
        } else {
            // Lógica de INCLUSÃO
            resultChannel = await incluirChannel(
                channelData.name,
                channelData.url,
                channelData.descricao,
                channelData.img,
                selectedCategoryObject
            );
            successMessage = `${resultChannel?.name} adicionado com sucesso!`;
        }

        if (resultChannel) {
            Toast.show({
                type: 'success',
                text1: 'Tudo Certo 😁👍',
                text2: successMessage,
            });
            router.back(); 
        } else {
            Alert.alert('Erro', isEditMode ? 'Falha ao alterar o canal.' : 'Falha ao incluir o canal.');
        }

    } catch (error) {
        Alert.alert('Erro Inesperado', 'Ocorreu um erro durante a operação.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  }, [formData, isEditMode, id, listCategory, editChannel, incluirChannel]);

  /**
   * @function handleDelete
   * Lógica de exclusão do canal.
   */
  const handleDelete = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
        await deleteChannel(id.toString());
        Toast.show({
            type: 'success',
            text1: 'Tudo Certo 😁👍',
            text2: `${formData.name}" apagado com sucesso!`,
        });
        router.back();
    } catch (e) {
        Alert.alert('Erro', 'Falha ao apagar o canal.');
        console.error(e);
    } finally {
        setLoading(false);
        setDeleteDialogVisible(false);
    }
  }, [id, deleteChannel, formData.name]);


  // --- Retorno do Hook ---
  return {
    // Estado
    formData,
    loading,
    isEditMode,
    deleteDialogVisible,
    categoryDialogVisible,
    listCategory, 
    
    // Manipuladores de Estado
    handleChange,
    handleSelectCategory,
    
    // Manipuladores de UI/Diálogos
    setDeleteDialogVisible,
    setCategoryDialogVisible,

    // Funções de Ação
    handleSubmit,
    handleDelete,
  };
};