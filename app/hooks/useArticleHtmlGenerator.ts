import { useMemo } from 'react';

// Tipos base (Importados de Types)
type Channel = { url: string; /* ... outros campos ... */ };

// ----------------------------------------------------------------------
// O HOOK PERSONALIZADO
// ----------------------------------------------------------------------

interface UseArticleHtmlGeneratorProps {
    titulo: string;
    body: string;
    dataFormatada: string;
    canalUrl: string | undefined;
    darkTheme: boolean; 
    formatarTextoParaHTML: (text: string, baseUrl: string) => string; 
}

/**
 * Hook para gerar a string HTML formatada para uso em um componente WebView.
 */
export const useArticleHtmlGenerator = (props: UseArticleHtmlGeneratorProps): string => {
    const { titulo, body, dataFormatada, canalUrl, darkTheme, formatarTextoParaHTML } = props;

    // Função de Processamento de HTML (Coesa ao Hook)
    const processHtmlForYouTubeEmbeds = (html: string): string => {
        const youtubeIframeRegex =
            /<iframe[^>]*?src=["'](.*?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\/embed\/[^"']+)["'][^>]*?>\s*<\/iframe>/gi;

        const allowedAttributes = `frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation media-playback"`;

        const replaceIframe = (match: string, originalSrc: string): string => {
            let newSrc = originalSrc
                .replace(/^https?:\/\/youtu\.be\//, 'https://www.youtube.com/embed/')
                .replace(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=([^&]+)/, 'https://www.youtube.com/embed/$2')
                .replace(/^https?:\/\/(www\.)?youtube\.com\/embed\//, 'https://www.youtube-nocookie.com/embed/');

            const addParam = (url: string, param: string) =>
                url.includes('?') ? `${url}&${param}` : `${url}?${param}`;

            newSrc = addParam(newSrc, 'playsinline=1');
            newSrc = addParam(newSrc, 'rel=0');
            newSrc = addParam(newSrc, 'controls=1');
            newSrc = addParam(newSrc, 'enablejsapi=1');

            return `<iframe src="${newSrc}" ${allowedAttributes} referrerpolicy="strict-origin-when-cross-origin" style="width:100%;aspect-ratio:16/9;border:0;"></iframe>`;
        };

        return html.replace(youtubeIframeRegex, replaceIframe);
    };


    const textueDark: string = 'https://img.freepik.com/fotos-premium/textura-de-papelao-preto-plano-de-fundo-texturizado-de-papel-ondulado_103373-354.jpg';
    const textureLigth: string = 'https://media.istockphoto.com/id/1912105119/pt/foto/texture-old-paper-canvas-grunge-background.jpg?s=612x612&w=0&k=20&c=_Wu2GzwTwq65Nce_Ko9iu1XS6KIjl8SRo4YaKBPgDDY=';
    
    
    const htmlContent = useMemo(() => {
        const formattedBody = formatarTextoParaHTML(body, canalUrl || '');
        const finalBody = processHtmlForYouTubeEmbeds(formattedBody);
        const initialThemeClass = darkTheme ? 'dark-theme' : 'light-theme';

        return `
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <meta name="referrer" content="strict-origin-when-cross-origin">
                <style>
                /* -------------------------------------- */
                /* 1. ESTILOS BASE E VARIÁVEIS DE TEMA (RESTAURADOS) */
                /* -------------------------------------- */
                :root {
                    --bg-color: #e8e8d6ff; --text-color: #333333; --title-color: #1a1a1a;
                    --separator-color: #EEEEEE; --link-color: #007AFF; --control-color: #666666;
                }

                body.dark-theme {
                    --bg-color: #121212; --text-color: #E0E0E0; --title-color: #FFFFFF;
                    --separator-color: #333333; --control-color: #BBBBBB;
                    background-image: url("${textueDark}");
                }
                
                body { 
                    position:relative;
                    overflow-x: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    padding-top: 100px; 
                    line-height: 1.7; 
                    margin-top: 100px; 
                    background-color: var(--bg-color); color: var(--text-color); 
                    background-image: url("${textureLigth}");
                    transition: background-image 0.8s, color 0.8s;
                }

                /* -------------------------------------- */
                /* 2. BARRA DE CONTROLE (TOPO DA WEBVIEW) */
                /* -------------------------------------- */
                #controls-bar {
                    display: flex; 
                    position: sticky; 
                    top:100; justify-content: space-between; 
                    align-items: center;
                    padding: 10px 20px; border-radius:8px;
                    background-color:rgba(40, 40, 43, 0.77); z-index: 10;
                }
                .font-controls button {
                    background: none; font-size: 20px; border: none; color: var(--control-color); 
                    font-weight: bold; padding: 5px 8px; cursor: pointer; outline: none; transition: opacity 0.3s;
                }
                .font-controls button.active { border: 0px solid var(--link-color); border-radius: 4px; }
                #theme-toggle { font-size: 24px; background-color:rgba(0, 0, 255, 0); border: 0px; color: var(--control-color); cursor: pointer; padding: 5px; }

                /* -------------------------------------- */
                /* 3. CONTEÚDO E FORMATOS RESTAURADOS */
                /* -------------------------------------- */
                #article-content { padding: 20px; }
                
                table {
                    color: var(--title-color); width: auto; max-width: 100%; 
                    overflow-x: auto; display: block; border-collapse: collapse;
                }
                td, th { white-space: nowrap; }

                h2 {
                    font-size: 24px; font-weight: 700; color: var(--title-color); margin-top: 0; 
                    margin-bottom: 20px; line-height: 1.3; border-bottom: 0px solid var(--separator-color); 
                    padding-bottom: 10px; transition: color 0.8s;
                }
                
                p{ font-size: 16px; margin-bottom: 15px; text-align: justify; }
                li { font-size: 16px; margin-bottom: 5px; text-align: justify; }

                a {
                    color: var(--link-color); 
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                
                /* CONTROLES DE TAMANHO DE FONTE */
                body.size--1 p, body.size--1 li { font-size: 16px; }
                body.size-0 p, body.size-0 li { font-size: 18px; } 
                body.size-1 p, body.size-1 li { font-size: 20px; }

                /* MÍDIA RESPONSIVA - Margem negativa restaurada */
                img {
                    width: 98vw; 
                    height: auto; 
                    display: block; 
                    margin-left: -23px;
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
                    min-width: 98vw;
                    height: auto;
                    display: block;
                    margin-left: -23;
                    margin-top: 25px; 
                    margin-bottom: 25px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       
                }
                </style>
            </head>
            
            <body class="${initialThemeClass} size-0" style="margin-top: 0;">
                
                <div id="controls-bar">
                    <div class="font-controls">
                        <button id="font-minus" onclick="adjustFontSize(-1)">A-</button>
                        <button id="font-default" class="active" onclick="setFontSize(0)">A</button>
                        <button id="font-plus" onclick="adjustFontSize(1)">A+</button>
                    </div>
                    <button id="theme-toggle" onclick="toggleTheme()">${darkTheme ? '☀️' : '🌙'}</button>
                </div>
                
                <div id="article-content">
                    <h2>${titulo}</h2>
                    <div>Publicado: ${dataFormatada}</div>
                    ${finalBody}
                </div>

                <script>
                    let currentFontSize = 0; const body = document.body; const themeButton = document.getElementById('theme-toggle'); const FONT_CLASSES = ['size--1', 'size-0', 'size-1'];
                    
                    function updateControls() { 
                        document.querySelectorAll('.font-controls button').forEach(btn => btn.classList.remove('active'));
                        if (currentFontSize === -1) { document.getElementById('font-minus').classList.add('active'); } 
                        else if (currentFontSize === 1) { document.getElementById('font-plus').classList.add('active'); } 
                        else { document.getElementById('font-default').classList.add('active'); }
                        document.getElementById('font-minus').disabled = currentFontSize <= -1;
                        document.getElementById('font-plus').disabled = currentFontSize >= 1;
                        themeButton.innerHTML = body.classList.contains('dark-theme')? '☀️' : '🌙';
                    }
                    function setFontSize(size) { 
                        currentFontSize = size; FONT_CLASSES.forEach(c => body.classList.remove(c));
                        body.classList.add('size-' + currentFontSize); updateControls();
                    }
                    function adjustFontSize(step) { 
                        const newSize = Math.max(-1, Math.min(1, currentFontSize + step)); 
                        setFontSize(newSize);
                    }
                    function toggleTheme() { 
                        body.classList.toggle('dark-theme');
                        body.classList.contains('dark-theme') ? body.classList.remove('light-theme') : body.classList.add('light-theme');
                        updateControls();
                    }
                    if ('${initialThemeClass}' === 'dark-theme') { body.classList.add('dark-theme'); } else { body.classList.add('light-theme'); }
                    setFontSize(0); updateControls();
                </script>
            </body>
            </html>
        `;
    }, [titulo, body, dataFormatada, canalUrl, darkTheme, formatarTextoParaHTML, textueDark, textureLigth]);

    return htmlContent;
};