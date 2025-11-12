import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Button as ButtonP, Dialog, Portal, List, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChanneStore } from '../../store/useChanneStore'; 
import { Category } from '@/types/types'; // Certifique-se que o tipo Category é importável
import { useCategoryStore } from '@/store/useCategoryStore';


// Defina um tipo para os dados do formulário
interface FormData {
  name: string;
  url: string;
  descricao: string;
  img: string;
  category: string; // Vai armazenar o nome/ID da categoria selecionada
}

// --- Definição das Cores do Tema (Dark Gray Moderno) ---
const COLORS = {
    background: '#282c34', // Fundo Dark Gray (menos escuro que o #121212)
    surface: '#3c4048',   // Superfícies (inputs, containers)
    text: '#F8F8F8',      // Texto principal claro
    textSecondary: '#B0B0B0', // Texto secundário/label
    primary: '#61AFEF',   // Cor de destaque (Primary - Azul Ciano moderno)
    secondary: '#98C379', // Cor secundária para Cancelar (Verde sutil)
    error: '#E06C75',     // Cor de erro (Vermelho)
    border: '#4A4F59',    // Borda sutil
};


const AddChannelScreen: React.FC = () => {
  const incluirChannel = useChanneStore(state => state.incluir);
  const listCategory = useCategoryStore(state => state.categoryList); // Lista de objetos Category
  const editChannel = useChanneStore(state => state.editar);
  const deleteChannel = useChanneStore(state => state.excluir);
  const { id, name, url, descricao, img, category } = useLocalSearchParams();
  
  // Encontrar a categoria inicial, se estiver no modo de edição
  const initialCategoryName = category?.toString() 
    ? listCategory.find(cat => cat.id === category)?.name || ''
    : '';

  const [formData, setFormData] = useState<FormData>({
    name: name?.toString() || '',
    url: url?.toString() || '',
    descricao: descricao?.toString() || '',
    img: img?.toString() || '',
    category: initialCategoryName, // Nome da categoria para exibição
  });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false); // Para o Diálogo de Apagar
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false); // Para o Diálogo de Categoria
  const navigation = useNavigation();
  
  // --- Função de Manipulação do Formulário ---
      useEffect(() => {
        navigation.setOptions({
          headerTitle: id ? 'Editar Canal' : 'Adicionar Canal',
           headerTransparent:true,
            headerTintColor:'#ffff',
            headerStyle: {backgroundColor: 'rgba(38, 38, 38, 0.83)'},
         
        });
      }, [ ]);
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Funções de Manipulação da Categoria ---
  const showCategoryDialog = () => setCategoryDialogVisible(true);
  const hideCategoryDialog = () => setCategoryDialogVisible(false);

  const handleSelectCategory = (categoryItem: Category) => {
    handleChange('category', categoryItem.name); // Seta o nome para exibição
    hideCategoryDialog();
  };


  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim() || !formData.category.trim()) {
      Alert.alert('Erro', 'Nome, URL do feed e Categoria são obrigatórios.');
      return;
    }
    setLoading(true);
    
    // Encontra o objeto Category completo para enviar à store
    const selectedCategoryObject = listCategory.find(cat => cat.name === formData.category);


    
    
    if (!selectedCategoryObject) {
        setLoading(false);
        Alert.alert('Erro', 'Categoria não encontrada. Tente novamente.');
        return;
    }

    if(id){
      // --- Lógica de EDIÇÃO ---
      try {
        const novoCanal = await editChannel(
          id.toString(),
         {name: formData.name.trim(),
          url: formData.url.trim(),
          descricao: formData.descricao.trim(),
          img: formData.img.trim(),
          category: selectedCategoryObject, // Usa o objeto Category
        }
        );
        setLoading(false);
        if (novoCanal) {
          Alert.alert('Sucesso', `Canal "${novoCanal.name}" Alterado!`);
          router.back(); 
        } else {
          Alert.alert('Erro', 'Falha ao alterar o canal.');
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('Erro Inesperado', 'Ocorreu um erro durante a edição.');
        console.error(error);
      }
    }else{
      // --- Lógica de INCLUSÃO ---
      try {
        const novoCanal = await incluirChannel(
          formData.name.trim(),
          formData.url.trim(),
          formData.descricao.trim(),
          formData.img.trim(),
          selectedCategoryObject, // Usa o objeto Category
        );
        setLoading(false);
        if (novoCanal) {
          Alert.alert('Sucesso', `Canal "${novoCanal.name}" adicionado com sucesso!`);
          router.back(); 
        } else {
          Alert.alert('Erro', 'Falha ao incluir o canal.');
        }
      } catch (error) {
        setLoading(false);
        Alert.alert('Erro Inesperado', 'Ocorreu um erro durante a inclusão.');
        console.error(error);
      }
    }
  };

  const handleDelete = async ()=> {
    setLoading(true)
    try{
      await deleteChannel(id.toString())
      Alert.alert('Apagado!')
      router.back()
    }catch(e){
      Alert.alert('Algo de errado não tá certo!', 'erro: '+e)
    }
    setLoading(false)
    setVisible(false)
  }

  // --- Componente ---

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
      
        <Text style={styles.label}>Nome do Canal *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Diolinux Feed"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          editable={!loading}
        />
        
        <Text style={styles.label}>URL do Feed *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: https://seusite.com/feed/"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.url}
          onChangeText={(text) => handleChange('url', text)}
          keyboardType="url"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Descrição (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Breve descrição do canal."
          placeholderTextColor={COLORS.textSecondary}
          value={formData.descricao}
          onChangeText={(text) => handleChange('descricao', text)}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>URL da Imagem (Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="URL da logo do canal"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.img}
          onChangeText={(text) => handleChange('img', text)}
          keyboardType="url"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Categoria *</Text>
        <View  style={styles.categoryInputGroup} >

        <TouchableOpacity onPress={showCategoryDialog} disabled={loading} style={styles.inputTouchable}>
            <TextInput
                style={[styles.input, { flex: 1, height: '100%', borderWidth: 0, marginBottom: 0, paddingHorizontal: 15 }]}
                placeholder="Selecione uma Categoria"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.category}
                editable={false} // Não pode ser editado via teclado
                />
        </TouchableOpacity>
        <IconButton 
            icon={'database-plus'}
            iconColor={COLORS.primary}
            size={28}
            onPress={()=> router.push({ pathname: '/pages/CrudCategories'})}
        />
        </View>

        {/* --- Botões de Ação (Lado a Lado) --- */}
        <View style={styles.dualButtonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
          ) : (
            <>
              {/* Botão Cancelar */}
              <TouchableOpacity 
                style={[styles.customButton, {backgroundColor: COLORS.primary, flex: 1, marginRight: 10}]} 
                onPress={() => router.back()} 
                disabled={loading}
              >
                  <Text style={[styles.customButtonText, { color: COLORS.background }]}>Cancelar</Text>
              </TouchableOpacity>

              {/* Botão Salvar */}
              <TouchableOpacity 
                style={[styles.customButton, {backgroundColor: COLORS.secondary, flex: 1}]} 
                onPress={handleSubmit} 
                disabled={loading}
              >
                  <Text style={[styles.customButtonText, { color: COLORS.background }]}>Salvar</Text>
              </TouchableOpacity>
              
            </>
          )}
        </View>
        
        { id &&  <View style={styles.singleButtonContainer}>
             <TouchableOpacity style={[styles.customButton, {backgroundColor: COLORS.error}]} onPress={() => setVisible(true)} disabled={loading}>
                <Text style={[styles.customButtonText, { color: COLORS.background }]}>Apagar Canal</Text>
             </TouchableOpacity>
        </View>}


        {/* Portal para Diálogos (mantido o estilo Paper para diálogos) */}
        <Portal>
            {/* Diálogo de Confirmação para Apagar */}
            <Dialog visible={visible} onDismiss={()=>setVisible(false)} style={{backgroundColor: COLORS.surface}}>
                <Dialog.Title style={{color: COLORS.text}}>Tá certo disso?</Dialog.Title>
                <Dialog.Content>
                  <Text style={{color: COLORS.textSecondary}}> Se tu apagar o canal já era.</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <ButtonP onPress={()=>setVisible(false)} color={COLORS.textSecondary}>Cancelar</ButtonP>
                  <ButtonP onPress={handleDelete} color={COLORS.error}>Apagar</ButtonP>
                </Dialog.Actions>
            </Dialog>

            {/* Diálogo de Seleção de Categoria */}
            <Dialog visible={categoryDialogVisible} onDismiss={hideCategoryDialog} style={{backgroundColor: COLORS.surface}}>
                <Dialog.Title style={{color: COLORS.text}}>Selecione a Categoria</Dialog.Title>
                <Dialog.Content style={{ maxHeight: 300, paddingHorizontal: 0 }}>
                  <ScrollView>
                    {listCategory.map((cat) => (
                      <List.Item
                        key={cat.id}
                        title={cat.name}
                        titleStyle={{ color: COLORS.text }}
                        onPress={() => handleSelectCategory(cat)}
                        style={{ backgroundColor: formData.category === cat.name ? COLORS.border : 'transparent' }} // Cor de destaque sutil
                      />
                    ))}
                  </ScrollView>
                </Dialog.Content>
                <Dialog.Actions>
                  <ButtonP onPress={hideCategoryDialog} color={COLORS.textSecondary}>Fechar</ButtonP>
                </Dialog.Actions>
            </Dialog>
        </Portal>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos Atualizados ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:40,
    padding: 20,
    backgroundColor: COLORS.background, // Fundo principal
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 8,
    color: COLORS.textSecondary,
  },
  input: {
    minHeight: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  categoryInputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  inputTouchable: {
    flex: 1,
    minHeight: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  // NOVO: Container para botões lado a lado
  dualButtonContainer: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Container para botões de largura total
  singleButtonContainer: {
    marginTop: 15,
  },
  customButton: {
    minHeight: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default AddChannelScreen;