import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dialog, Portal, TextInput, List, IconButton, Text, useTheme } from 'react-native-paper'; // Importei useTheme
import { useCategoryStore } from '@/store/useCategoryStore'; 
import { Category } from '@/services/dbService'; 
import { useNavigation } from 'expo-router';


// --- Definição das Cores do Tema (Dark Gray Moderno) ---
const COLORS = {
    background: '#282c34', // Fundo Dark Gray
    surface: '#3c4048',   // Superfícies (inputs, containers)
    text: '#F8F8F8',      // Texto principal claro
    textSecondary: '#B0B0B0', // Texto secundário/label
    primary: '#61AFEF',   // Cor de destaque (Primary - Azul Ciano moderno)
    secondary: '#98C379', // Cor secundária
    error: '#E06C75',     // Cor de erro (Vermelho)
    border: '#4A4F59',    // Borda sutil
    listHover: '#4A4F59', // Cor ao selecionar item na lista
};


// --- Componente da Tela ---
const CategoryManagerScreen: React.FC = () => {
    // Hooks da Store
    const { categoryList, loadCategories, incluirCategory, excluirCategory, editarCategory } = useCategoryStore();
    const isDBLoaded = useCategoryStore(state => state.isDBLoaded);
    
    // Configuração do tema para usar nas bibliotecas (se necessário, embora usemos COLORS)
    const theme = useTheme();

    // Estados Locais
    const [dialogVisible, setDialogVisible] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Carregar dados na montagem
    useEffect(() => {
        if (!isDBLoaded) {
            loadCategories();
        }
    }, [isDBLoaded, loadCategories]);


       useEffect(() => {
            navigation.setOptions({
              // headerTitle: 'Gerenciar Categorias',
               headerTransparent:true,
                headerTintColor:'#ffff',
                headerStyle: {backgroundColor: 'rgba(38, 38, 38, 0.83)'},
             
            });
          }, [ ]);

    // --- Funções do Dialog ---

    const showAddDialog = () => {
        setEditingCategory(null);
        setCategoryName('');
        setDialogVisible(true);
    };

    const showEditDialog = (category: Category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setEditingCategory(null);
        setCategoryName('');
    };

    // --- Ações CRUD ---

    const handleSave = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Erro', 'O nome da categoria é obrigatório.');
            return;
        }
        
        setLoading(true);

        if (editingCategory) {
            // AÇÃO: EDITAR
            await editarCategory(editingCategory.id, categoryName.trim());
        } else {
            // AÇÃO: INCLUIR
            await incluirCategory(categoryName.trim());
        }
        
        setLoading(false);
        hideDialog();
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja apagar esta categoria? Esta ação não pode ser desfeita.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Apagar',
                    onPress: async () => {
                        setLoading(true);
                        await excluirCategory(id);
                        setLoading(false);
                    },
                    style: 'destructive',
                },
            ]
        );
    };
    
    // --- Renderização de Item da Lista ---

    const renderItem = useCallback(({ item }: { item: Category }) => (
        <List.Item
            title={item.name}
            titleStyle={{ color: COLORS.text, fontWeight: '500' }}
            style={styles.listItem}
            left={() => <List.Icon icon="folder-outline" color={COLORS.primary} />}
            right={() => (
                <View style={styles.actions}>
                    <IconButton
                        icon="pencil"
                        iconColor={COLORS.primary}
                        onPress={() => showEditDialog(item)}
                        disabled={loading}
                    />
                    <IconButton
                        icon="delete"
                        iconColor={COLORS.error}
                        onPress={() => handleDelete(item.id)}
                        disabled={loading}
                    />
                </View>
            )}
        />
    ), [loading]);

    if (!isDBLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textSecondary }}>Carregando Categorias...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            
            
            {/* Lista de Categorias */}
            <FlatList
                data={categoryList}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria adicionada.</Text>}
                contentContainerStyle={categoryList.length === 0 && styles.flatListContent}
            />

            {/* Botão de Adicionar (Usando estilo customizado de FAB) */}
            <Button 
                mode="contained" 
                icon="plus" 
                onPress={showAddDialog} 
                style={[styles.fab, {backgroundColor: COLORS.primary}]}
                contentStyle={{ padding: 5 }} // Padding para aumentar o toque
                labelStyle={{ color: COLORS.background, fontWeight: 'bold' }} // Cor do texto em contraste com o primary
                disabled={loading}
            >
                Adicionar Categoria
            </Button>

            {/* Dialogo de Adição/Edição */}
            <Portal>
                <Dialog 
                    visible={dialogVisible} 
                    onDismiss={hideDialog} 
                    style={{ backgroundColor: COLORS.surface }} // Fundo do diálogo
                >
                    <Dialog.Title style={{ color: COLORS.text }}>
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                    </Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Nome da Categoria"
                            value={categoryName}
                            onChangeText={setCategoryName}
                            mode="outlined"
                            disabled={loading}
                            // Estilos do TextInput
                            style={{ backgroundColor: COLORS.surface }}
                            outlineColor={COLORS.border}
                            activeOutlineColor={COLORS.primary}
                            textColor={COLORS.text}
                            theme={{ colors: { placeholder: COLORS.textSecondary, text: COLORS.text, primary: COLORS.primary } }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog} disabled={loading} textColor={COLORS.textSecondary}>Cancelar</Button>
                        <Button 
                            onPress={handleSave} 
                            loading={loading} 
                            disabled={loading}
                            textColor={COLORS.primary}
                        >
                            {editingCategory ? 'Salvar Alterações' : 'Adicionar'}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
};

// --- Estilos Atualizados para Dark Mode Moderno ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, 
        paddingTop:80
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
        paddingVertical: 15,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    flatListContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    listItem: {
        backgroundColor: COLORS.surface, // Fundo do item
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        margin: 10, 
        padding:10,
        borderRadius:12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        margin: 16,
        borderRadius: 8,
        minHeight: 50,
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontSize: 16,
    }
});

export default CategoryManagerScreen;