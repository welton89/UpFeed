// src/hooks/useFetchChannels.ts

import { useState, useEffect } from 'react';
import { Channel, ApiResponse } from '../../types/types'; // Ajuste o caminho conforme sua estrutura

const API_URL = 'https://script.google.com/macros/s/AKfycbyOGUr4h9j5eUPTcqlByJf9IlRUeeDBlKBsHQBy22yafNnUwNOUb5u6zkwJi-1bqN0j/exec';

type FetchState = {
    channels: Channel[];
    loading: boolean;
    error: string | null;
};

export const useFetchChannels = (): FetchState => {
    const [state, setState] = useState<FetchState>({
        channels: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Erro de rede: ${response.status}`);
                }
                
                // A API retorna um objeto com o campo 'data' contendo a lista de canais
                const result: ApiResponse = await response.json();
                
                // Mapeia os dados para garantir o tipo Channel e tratar campos vazios/nulos
                const formattedChannels: Channel[] = result.data.map(item => ({
                    id: item.id || '',
                    name: item.name || 'Nome Desconhecido',
                    url: item.url || '',
                    descricao: item.descricao || undefined,
                    img: item.img || undefined,
                    category:  item.category?.toString() !== '' ? item.category : undefined,
                }));

                setState({
                    channels: formattedChannels,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                // Trata o erro como 'unknown' e tenta convertê-lo para string
                const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar os dados.';
                
                setState({
                    channels: [],
                    loading: false,
                    error: errorMessage,
                });
                console.error('Erro ao buscar canais:', err);
            }
        };

        fetchChannels();
    }, []); // O array vazio garante que o efeito só seja executado uma vez, na montagem

    return state;
};