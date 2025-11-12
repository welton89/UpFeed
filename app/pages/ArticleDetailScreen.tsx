import React, { useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useNavigation } from 'expo-router'; 
import { IconButton } from 'react-native-paper';
import { useFeedStore } from '@/store/useFeedStore';
import { useChanneStore } from '@/store/useChanneStore';
import { Channel, ItemRSS } from '@/types/types';
import { useTextFormatter } from '../hooks/useTextFormatter';

// ----------------------------------------------------
// Função de Processamento de HTML para YouTube Embeds
// ----------------------------------------------------


const processHtmlForYouTubeEmbeds = (html: string): string => {
  const youtubeIframeRegex =
    /<iframe[^>]*?src=["'](.*?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\/embed\/[^"']+)["'][^>]*?>\s*<\/iframe>/gi;

  const allowedAttributes = `frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation media-playback"`;

  const replaceIframe = (match: string, originalSrc: string): string => {
    let newSrc = originalSrc;

    // Se tiver youtu.be ou outros formatos, converter para /embed/
    newSrc = newSrc
      .replace(/^https?:\/\/youtu\.be\//, 'https://www.youtube.com/embed/')
      .replace(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=([^&]+)/, 'https://www.youtube.com/embed/$2');

    // Use youtube-nocookie se quiser
    newSrc = newSrc.replace(/^https?:\/\/(www\.)?youtube\.com\/embed\//, 'https://www.youtube-nocookie.com/embed/');

    const addParam = (url: string, param: string) =>
      url.includes('?') ? `${url}&${param}` : `${url}?${param}`;

    if (!newSrc.includes('playsinline=')) newSrc = addParam(newSrc, 'playsinline=1');
    if (!newSrc.includes('rel='))         newSrc = addParam(newSrc, 'rel=0');
    if (!newSrc.includes('controls='))    newSrc = addParam(newSrc, 'controls=1');
    if (!newSrc.includes('enablejsapi=')) newSrc = addParam(newSrc, 'enablejsapi=1');
    if (!newSrc.includes('origin='))      newSrc = addParam(newSrc, `origin=${encodeURIComponent(window.location.origin)}`);

    return `<iframe src="${newSrc}" ${allowedAttributes} referrerpolicy="strict-origin-when-cross-origin" style="width:100%;aspect-ratio:16/9;border:0;"></iframe>`;
  };

  return html.replace(youtubeIframeRegex, replaceIframe);
};

// ----------------------------------------------------
// FIM da Função de Processamento
// ----------------------------------------------------


const ArticleDetailScreen: React.FC = () => {
  const textueDark:string = 'https://img.freepik.com/fotos-premium/textura-de-papelao-preto-plano-de-fundo-texturizado-de-papel-ondulado_103373-354.jpg';
  const textureLigth:string = 'https://media.istockphoto.com/id/1912105119/pt/foto/texture-old-paper-canvas-grunge-background.jpg?s=612x612&w=0&k=20&c=_Wu2GzwTwq65Nce_Ko9iu1XS6KIjl8SRo4YaKBPgDDY=';
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const  [dark, setDark] = useState(true) 
  const { formatarTextoParaHTML } = useTextFormatter();
  const channels =  useChanneStore(state => state.channelList) 
  const canal:Channel | undefined =  channels.find(item => item.id === params.canalId);
    
      const feedsMarked = useFeedStore(state => state.insertFeedItem);
      const feedsMarkedDel = useFeedStore(state => state.deleteFeedItem);
      
           const isMarkedInStore = useFeedStore(
              React.useCallback(
                  (state) => state.feedList.some(itemMark => itemMark.id === params.id),
                  [params.id] 
              )
          );

      const dataFormatada = params.dataPublicacao 
      ? new Date(params.dataPublicacao.toString()).toLocaleDateString('pt-BR') + 
        ' às ' + 
        new Date(params.dataPublicacao.toString()).toLocaleTimeString('pt-BR', {
            hour: '2-digit', 
            minute: '2-digit' 
        })
        : 'Sem data';
        
                   const handleMark = async () => {
                            if (isMarkedInStore){
                              await  feedsMarkedDel(params.id.toString())
                              Alert.alert('Removel ',params.id.toString())
                
                            }else{
                                const newMark:ItemRSS = {
                                  id: params.id.toString(),
                                  titulo: params.titulo.toString(),
                                  body: params.body.toString(),
                                  tags: params.tags?.toString(),
                                  dataPublicacao: params.dataPublicacao.toString(),
                                  img: params.img?.toString(),
                                  canal: canal!,
                                  mark: true,
                                }
                                await feedsMarked(newMark)
                                Alert.alert('Adicionou ', newMark.id)
                            }
                        }

     useLayoutEffect(() => {
    if (params) {
          navigation.setOptions({
            headerTitle: `${canal?.name || params.titulo}`,
            headerTransparent:true,
            headerTintColor:'#ffff',
            headerStyle: {backgroundColor: 'rgba(38, 38, 38, 0.83)'},
            headerRight: () => ( 
            
        <IconButton icon={'bookmark'} 
          iconColor={isMarkedInStore? '#2e5ffdff' : '#ffff'}
          size={30}
          onPressOut={handleMark}
        />
       
      ),
          });
        }
        },);

        
  if (!params.titulo ||!params.body) {
    return (
        <View style={styles.container}>
            <Text style={styles.errorText}>Erro: Conteúdo ou título da notícia não encontrado.</Text>
        </View>
    );
  }
  
  const { title, body } = params; 
  // useLayoutEffect vazio removido para limpeza.

const htmlContent = useMemo(() => {
    // 1. Formata o corpo do RSS original
    const formattedBody = formatarTextoParaHTML(params.body.toString(), canal?.url.toString()||'');
    
    // 2. Processa o HTML formatado para aplicar as configurações de YouTube necessárias
    const finalBody = processHtmlForYouTubeEmbeds(formattedBody);

    return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <style>
          /* -------------------------------------- */
          /* 1. ESTILOS BASE E VARIÁVEIS DE TEMA */
          /* -------------------------------------- */
          :root {
            /* Tema Claro Padrão */
            --bg-color: #e8e8d6ff; 
            --text-color: #333333;
            --title-color: #1a1a1a;
            --separator-color: #EEEEEE;
            --link-color: #007AFF;
            --control-color: #666666;
          }

          /* Tema Escuro */
          body.dark-theme {
            --bg-color: #121212; 
            --text-color: #E0E0E0;
            --title-color: #FFFFFF;
            --separator-color: #333333;
            --control-color: #BBBBBB;
              background-image: url("${textueDark}");
              
              }
              
              body { 
              position:relative;
              overflow-x: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                padding: 0; 
                line-height: 1.7;
                margin-top: 100;
                background-color: var(--bg-color);
                color: var(--text-color);
                background-image: url("${textureLigth}");
                transition: background-image 0.8s, color 0.8s;
          }


        

          /* -------------------------------------- */
          /* 2. BARRA DE CONTROLE (NO TOPO) */
          /* -------------------------------------- */
          #controls-bar {
            display: flex;
            position: sticky;
            top:100px;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            border-radius:8px;
            border-bottom: 0px solid var(--separator-color);
             background-color:rgba(40, 40, 43, 0.77);
           //background-image: url("${ dark? textueDark :  textureLigth}"); 
            z-index: 10;
          }
        .font-controls button {
            background: none;
            font-size: 20px;
            border: none;
            color: var(--control-color);
            font-weight: bold;
            padding: 5px 8px;
            cursor: pointer;
            outline: none;
            transition: opacity 0.3s;
          }
        .font-controls button:disabled {
            opacity: 0.3;
          }
        .font-controls button.active {
            border: 0px solid var(--link-color);
            border-radius: 4px;
          }
          #theme-toggle {
            font-size: 24px;
            background-color:rgba(0, 0, 255, 0);
            border: 0px;
            color: var(--control-color);
            cursor: pointer;
            padding: 5px;
          }
          
          /* -------------------------------------- */
          /* 3. CONTEÚDO DO ARTIGO */
          /* -------------------------------------- */
          #article-content {
            padding: 20px;
          }


         table {
            color: var(--title-color);
            width: auto; 
            max-width: 100%; 
            overflow-x: auto; 
            display: block; 
            border-collapse: collapse;
          }


        td, th {
            white-space: nowrap; 
        }

          h2 {
            font-size: 24px;
            font-weight: 700;
            color: var(--title-color);
            margin-top: 0;
            margin-bottom: 20px;
            line-height: 1.3;
            border-bottom: 0px solid var(--separator-color); 
            padding-bottom: 10px;
             transition: color 0.8s;
          }
          
          p{
            font-size: 16px; 
            margin-bottom: 15px;
            text-align: justify;
          }
          li {
            font-size: 16px; 
            margin-bottom: 5px;
            text-align: justify;
          }
          
          /* CONTROLES DE TAMANHO DE FONTE */
          body.size--1 p, body.size--1 li { font-size: 16px; }
          body.size-0 p, body.size-0 li { font-size: 18px; } 
          body.size-1 p, body.size-1 li { font-size: 20px; }

          /* Estilos para links */
          a {
            color: var(--link-color); 
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }

          /* MÍDIA RESPONSIVA */
          img {
          width: 98vw;
            height: auto;
            display: block;
            margin-left: -23;
            margin-top: 25px; 
            margin-bottom: 25px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          figure {
            height: auto;
            display: block;
            margin-left: auto; 
            margin-right: auto;
            margin-top: 25px; 
            margin-bottom: 25px;
          }
            
          iframe {
            /* Seu estilo original para iframes, que será aplicado a TUDO */
            width: 100%;
            display: block;
            aspect-ratio: 16 / 9; 
            margin: 25px 0;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      
      <body class="dark-theme size-0">
        
        <div id="controls-bar">
          <div class="font-controls">
            <button id="font-minus" onclick="adjustFontSize(-1)">A-</button>
            <button id="font-default" class="active" onclick="setFontSize(0)">A</button>
            <button id="font-plus" onclick="adjustFontSize(1)">A+</button>
          </div>
          <button id="theme-toggle" onclick="toggleTheme()">☀️</button>
        </div>
        
        <div id="article-content">






          <h2>${params.titulo}</h2>





          
          <p>Publicado: ${dataFormatada}</p>
          ${finalBody}
        </div>

        <script>
          let currentFontSize = 0; 
          const body = document.body;
          const themeButton = document.getElementById('theme-toggle');
          
          // Mapeamento das classes de tamanho para facilitar a remoção
          const FONT_CLASSES = ['size--1', 'size-0', 'size-1'];
          
          // Função de Atualização de UI (Botões)
          function updateControls() {
            // Atualiza o estado "active" dos botões de fonte
            document.querySelectorAll('.font-controls button').forEach(btn => btn.classList.remove('active'));
            if (currentFontSize === -1) {
              document.getElementById('font-minus').classList.add('active');
            } else if (currentFontSize === 1) {
              document.getElementById('font-plus').classList.add('active');
            } else {
              document.getElementById('font-default').classList.add('active');
            }

            // Desabilita botões nos limites
            document.getElementById('font-minus').disabled = currentFontSize <= -1;
            document.getElementById('font-plus').disabled = currentFontSize >= 1;

            // Atualiza o ícone do tema
            themeButton.innerHTML = body.classList.contains('dark-theme')? '☀️' : '🌙';
          }
          
          /**
           * Função para SETAR o tamanho exato usando classList.
           */
          function setFontSize(size) {
            currentFontSize = size;
            
            // 1. Remove todas as classes de tamanho conhecidas
            FONT_CLASSES.forEach(c => body.classList.remove(c));

            // 2. Adiciona a classe de tamanho atual
            body.classList.add('size-' + currentFontSize);
            
            updateControls();
          }

          // Função para AJUSTAR (somar/subtrair)
          function adjustFontSize(step) {
            // Calcula o novo tamanho, limitando-o entre -1 e 1
            const newSize = Math.max(-3, Math.min(3, currentFontSize + step));
            setFontSize(newSize);
          }

          // Função para Alternar o Tema
          function toggleTheme() {
            // Alterna a classe dark-theme
            body.classList.toggle('dark-theme');
            
            // Garante que a classe 'light-theme' esteja presente se não for 'dark-theme'
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('light-theme');
            } else {
                body.classList.add('light-theme');
            }
            updateControls();
          }
          
          // 💡 Inicialização: Garante o estado inicial correto no JS e na UI
          if (!body.classList.contains('dark-theme') ||!body.classList.contains('light-theme')) {
              body.classList.add('${dark? 'dark-theme' : 'light-theme'}');
          }

          // 2. Configura o tamanho de fonte inicial (size-0) e atualiza os botões
          setFontSize(0);
        </script>
      </body>
    </html>
  `;
}, [params.titulo, params.body, dark, dataFormatada, canal?.url]);


  return (
    
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent,  baseUrl: 'https://meuapp.local' }}
        // PROPRIEDADES OBRIGATÓRIAS PARA VÍDEO:
        // permits HTML5 video to play inline [3], working with playsinline=1 in the iframe src
        allowsInlineMediaPlayback={true} 
        mediaPlaybackRequiresUserAction={true} // Mantém o requisito de toque do usuário [4]
        // FIM PROPRIEDADES OBRIGATÓRIAS
        onShouldStartLoadWithRequest={(navState) => {
          
            return true;
          }}
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
  container: {
    backgroundColor:'#282c34',
    flex: 1,
  },
  webview: {
    flex: 1,
    minHeight:'100%',
    width:'100%'
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#282c34',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    padding: 20,
    textAlign: 'center',
  },

});

export default ArticleDetailScreen;