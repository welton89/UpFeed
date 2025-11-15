// AddChannelScreen.tsx (Exemplo de uso)

import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Button as ButtonP, Dialog, Portal, List, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';

// Importa o hook gerado
import { useChannelForm } from '../hooks/useChannelForm';
import {COLORS} from '../../themes/colors'

// --- Definição das Cores do Tema (reutilizada para o componente) ---

const AddChannelScreen: React.FC = () => {
  // 🚀 Chamada do Hook: extrai toda a lógica necessária
  const {
    formData,
    loading,
    isEditMode,
    deleteDialogVisible,
    categoryDialogVisible,
    listCategory,
    handleChange,
    handleSelectCategory,
    setDeleteDialogVisible,
    setCategoryDialogVisible,
    handleSubmit,
    handleDelete,
  } = useChannelForm();
  
  const navigation = useNavigation();

  // Configura o cabeçalho usando useEffect para manter a UI limpa
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditMode ? 'Editar Canal' : 'Adicionar Canal',
      headerTransparent: true,
      headerTintColor: '#ffff',
      headerStyle: { backgroundColor: 'rgba(38, 38, 38, 0.83)' },
    });
  }, [isEditMode, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView style={styles.container}>
      
        {/* --- Nome do Canal --- */}
        <Text style={styles.label}>Nome do Canal *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Diolinux Feed"
          placeholderTextColor={COLORS.textSecondary}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          editable={!loading}
        />
        
        {/* --- URL do Feed --- */}
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

        {/* --- Descrição --- */}
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

        {/* --- URL da Imagem --- */}
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

        {/* --- Categoria --- */}
        <Text style={styles.label}>Categoria *</Text>
        <View  style={styles.categoryInputGroup} >
            <TouchableOpacity onPress={() => setCategoryDialogVisible(true)} disabled={loading} style={styles.inputTouchable}>
                <TextInput
                    style={[styles.input, { flex: 1, height: '100%', borderWidth: 0, marginBottom: 0, paddingHorizontal: 15 }]}
                    placeholder="Selecione uma Categoria"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.category}
                    editable={false} 
                    />
            </TouchableOpacity>
            <IconButton 
                icon={'database-plus'}
                iconColor={COLORS.primary}
                size={28}
                onPress={()=> router.push({ pathname: '/pages/CrudCategories'})}
            />
        </View>

        {/* --- Botões de Ação (Salvar/Cancelar) --- */}
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
        
        {/* --- Botão Apagar (Apenas em modo de edição) --- */}
        { isEditMode && !loading && <View style={styles.singleButtonContainer}>
             <TouchableOpacity 
                style={[styles.customButton, {backgroundColor: COLORS.error}]} 
                onPress={() => setDeleteDialogVisible(true)} 
                disabled={loading}
            >
                <Text style={[styles.customButtonText, { color: COLORS.background }]}>Apagar Canal</Text>
             </TouchableOpacity>
        </View>}


        {/* Portal para Diálogos */}
        <Portal>
            {/* Diálogo de Confirmação para Apagar */}
            <Dialog 
                visible={deleteDialogVisible} 
                onDismiss={() => setDeleteDialogVisible(false)} 
                style={{backgroundColor: COLORS.surface}}
            >
                <Dialog.Title style={{color: COLORS.text}}>Tá certo disso?</Dialog.Title>
                <Dialog.Content>
                  <Text style={{color: COLORS.textSecondary}}> Se tu apagar o canal já era.</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <ButtonP onPress={() => setDeleteDialogVisible(false)} color={COLORS.textSecondary}>Cancelar</ButtonP>
                  <ButtonP onPress={handleDelete} color={COLORS.error}>Apagar</ButtonP>
                </Dialog.Actions>
            </Dialog>

            {/* Diálogo de Seleção de Categoria */}
            <Dialog 
                visible={categoryDialogVisible} 
                onDismiss={() => setCategoryDialogVisible(false)} 
                style={{backgroundColor: COLORS.surface}}
            >
                <Dialog.Title style={{color: COLORS.text}}>Selecione a Categoria</Dialog.Title>
                <Dialog.Content style={{ maxHeight: 300, paddingHorizontal: 0 }}>
                  <ScrollView>
                    {listCategory.map((cat) => (
                      <List.Item
                        key={cat.id}
                        title={cat.name}
                        titleStyle={{ color: COLORS.text }}
                        onPress={() => handleSelectCategory(cat)}
                        style={{ backgroundColor: formData.category === cat.name ? COLORS.border : 'transparent' }} 
                      />
                    ))}
                  </ScrollView>
                </Dialog.Content>
                <Dialog.Actions>
                  <ButtonP onPress={() => setCategoryDialogVisible(false)} color={COLORS.textSecondary}>Fechar</ButtonP>
                </Dialog.Actions>
            </Dialog>
        </Portal>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos (mantidos no componente) ---
const styles = StyleSheet.create({
    // ... (restante dos estilos definidos no código original)
    container: {
        flex: 1,
        marginTop:40,
        padding: 20,
        backgroundColor: COLORS.background, 
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
      dualButtonContainer: {
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
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