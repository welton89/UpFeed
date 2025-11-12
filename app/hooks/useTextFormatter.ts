// hooks/useTextFormatter.ts

interface FormatOptions {
  maxTitleLength?: number;
  minTitleLength?: number;
  maxTitleWords?: number;
}

export const useTextFormatter = () => {
  const formatarTextoParaHTML = (texto: string, url:string, options: FormatOptions = {},) => {
    const {
      maxTitleLength = 150,
      minTitleLength = 20,
      maxTitleWords = 15
    } = options;

    // Limpar e preparar o texto
    let textoFormatado = texto
      .trim()
      .replace(/\s+/g, ' ') // Remove espaços múltiplos
      .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>'); // Quebras de linha duplas viram parágrafos

    // Dividir em linhas para processamento
    const linhas = textoFormatado.split(/<br\s*\/?>/).filter(linha => linha.trim().length > 0);

    const elementosHTML: string[] = [];
    let paragrafoAtual: string[] = [];

    const finalizarParagrafo = () => {
      if (paragrafoAtual.length > 0) {
        const textoParagrafo = paragrafoAtual.join(' ').trim();
        if (textoParagrafo.length > 0) {
          elementosHTML.push(`<p>${textoParagrafo}</p>`);
        }
        paragrafoAtual = [];
      }
    };

    const ehPossivelTitulo = (texto: string): boolean => {
      const palavras = texto.split(' ').filter(palavra => palavra.length > 0);
      
      // Critérios para identificar títulos:
      return (
        palavras.length <= maxTitleWords && // Frases curtas
        !texto.includes('📲') && // Não contém emojos específicos
        !texto.toLowerCase().includes('veja') && // Não contém palavras indicativas de links
        !texto.toLowerCase().includes('assista') &&
        !texto.toLowerCase().includes('whatsapp') &&
        texto.length > minTitleLength && // Tem um comprimento mínimo
        texto.length < maxTitleLength && // E máximo
        (/[A-Z]/.test(texto[0])) && // Começa com letra maiúscula
        (!texto.endsWith('.') || palavras.length <= 8) // Não termina com ponto ou é muito curto
      );
    };

    for (const linha of linhas) {
      const linhaLimpa = linha.trim();
      
      if (linhaLimpa.length === 0) continue;

      // Se a linha contém uma imagem, adiciona como está
      if (linhaLimpa.includes('<img')) {
        finalizarParagrafo();
        elementosHTML.push(linhaLimpa);
        continue;
      }

      // Verificar se poderia ser um título
      if (ehPossivelTitulo(linhaLimpa)) {
        finalizarParagrafo();
        elementosHTML.push(`<h2>${linhaLimpa}</h2>`);
        continue;
      }

      // Se a linha é muito longa, considerar dividir
      if (linhaLimpa.length > 200) {
        finalizarParagrafo();
        // Tentar dividir em frases
        const frases = linhaLimpa.split(/[.!?]+/).filter(frase => frase.trim().length > 0);
        
        for (const frase of frases) {
          const fraseLimpa = frase.trim() + (frase.match(/[.!?]$/) ? '' : '.');
          if (fraseLimpa.length > 10) { // Ignorar frases muito curtas
            if (ehPossivelTitulo(fraseLimpa)) {
              elementosHTML.push(`<h2>${fraseLimpa}</h2>`);
            } else {
              elementosHTML.push(`<p>${fraseLimpa}</p>`);
            }
          }
        }
        continue;
      }

      // Adicionar ao parágrafo atual
      paragrafoAtual.push(linhaLimpa);
    }

    // Finalizar último parágrafo
    finalizarParagrafo();

    // Juntar tudo
    // return elementosHTML.join('\n');
    if (url.includes('https://g1.globo.com')){
        return elementosHTML.join('\n');
        
    }else{
        console.log(url)
        return texto;
    }
  };
  
  return {
    formatarTextoParaHTML
  };
};