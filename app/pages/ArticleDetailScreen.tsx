import React, { useLayoutEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from 'expo-router'; // ⬅️ Adicionado para configuração do header
import { IconButton } from 'react-native-paper'; // ⬅️ O componente de UI deve estar aqui
import { useTextFormatter } from '../hooks/useTextFormatter';
import { useArticleData } from '../hooks/useArticleData';
import { useArticleHtmlGenerator } from '../hooks/useArticleHtmlGenerator';

const ArticleDetailScreen: React.FC = () => {
    // 1. Uso de Hooks: Toda a lógica complexa de dados e ações
    const { 
        params, 
        canal, 
        dataFormatada, 
        dark, 
        headerRightConfig 
    } = useArticleData();
    const { formatarTextoParaHTML } = useTextFormatter();
    const navigation = useNavigation();

    // 2. Efeito para DEFINIR AS OPÇÕES DE NAVEGAÇÃO E O BOTÃO DE SALVAR
    useLayoutEffect(() => {
        // Define as opções de navegação baseadas na saída do hook
        navigation.setOptions({
            headerTitle: `${canal?.name || params.titulo || 'Detalhe'}`,
            headerTransparent: true,
            headerTintColor: '#ffff',
            headerStyle: { backgroundColor: 'rgba(38, 38, 38, 0.83)' },
            // RENDERIZAÇÃO CORRIGIDA DO BOTÃO DE FAVORITAR (headerRight)
            headerRight: () => (
                headerRightConfig ? (
                    <IconButton 
                        icon={headerRightConfig.icon} 
                        iconColor={headerRightConfig.iconColor}
                        size={30}
                        onPressOut={headerRightConfig.onPressOut}
                    />
                ) : null
            ),
        });
    }, [navigation, params.titulo, canal?.name, headerRightConfig]); // Dependência headerRightConfig

    // 3. Validação e Geração do HTML
    if (!params.titulo || !params.body) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Erro: Conteúdo ou título da notícia não encontrado.</Text>
            </View>
        );
    }
    
    const htmlContent = useArticleHtmlGenerator({
        titulo: params.titulo.toString(),
        body: params.body.toString(),
        dataFormatada: dataFormatada,
        canalUrl: canal?.url,
        darkTheme: dark,
        formatarTextoParaHTML: formatarTextoParaHTML,
    });

    // 4. Renderização da WebView
    return (
        <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: 'https://meuapp.local' }} 
            allowsInlineMediaPlayback={true} 
            mediaPlaybackRequiresUserAction={true} 
            style={styles.webview}
            renderLoading={() => (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#72729cff" />
                    <Text>Carregando conteúdo...</Text>
                </View>
            )}
            startInLoadingState={true}
        />
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#282c34', flex: 1 },
    webview: { flex: 1, minHeight: '100%', width: '100%' },
    loadingContainer: {
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: '#282c34', justifyContent: 'center', alignItems: 'center',
    },
    errorText: { color: 'red', padding: 20, textAlign: 'center' },
});

export default ArticleDetailScreen;