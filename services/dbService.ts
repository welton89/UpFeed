import * as SQLite from 'expo-sqlite';
import { Channel, ItemRSS } from '../types/types';

export interface Category {
    id: string;
    name: string;
}

const DB_NAME = 'channel_store.db';
let db: SQLite.SQLiteDatabase | null = null;

// -----------------------------------------------------------------
// FUNÇÃO DE CONEXÃO E OBTENÇÃO DA INSTÂNCIA DB
// -----------------------------------------------------------------

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db === null) {
        db = await SQLite.openDatabaseAsync(DB_NAME);
    }
    return db;
};

// -----------------------------------------------------------------
// FUNÇÕES ESPECÍFICAS PARA A TABELA 'channels'
// -----------------------------------------------------------------
const channelService = {
    getChannels: async (): Promise<Channel[]> => {
        const currentDb = await getDb();
        const rows = await currentDb.getAllAsync<any>(
            `SELECT * FROM channels;`
        );
        
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            url: row.url,
            descricao: row.descricao,
            img: row.img,
            // Certifique-se de que a estrutura Channel aceita category_id
            category: { id: row.category_id, name: '' } as Category,
        }));
    },

    insertChannel: async (channel: Channel): Promise<void> => {
        const currentDb = await getDb();
        
        // 🚨 Tratamento para garantir que category_id é string ou null
        const categoryId = channel.category?.id || '1'; 

        await currentDb.runAsync(
            `INSERT INTO channels 
            (id, name, url, descricao, img, category_id) 
            VALUES (?, ?, ?, ?, ?, ?);`,
            [
                channel.id, 
                channel.name, 
                channel.url, 
                channel.descricao || null, // Usar null para campos opcionais TEXT
                channel.img || null, 
                categoryId,
            ]
        );
    },
    // ... (updateChannel e deleteChannel mantidos inalterados) ...
    
    updateChannel: async (id: string, data: Partial<Omit<Channel, 'id'>>): Promise<void> => {
       const currentDb = await getDb();
    const updates: string[] = [];
    const values: (string | number | boolean)[] = []; // Removi 'Category' dos tipos, pois só inserimos strings/números

    (Object.keys(data) as Array<keyof typeof data>).forEach(key => {
        const value = data[key];
        
        if (value !== undefined) {
            
            // 🛑 CORREÇÃO AQUI: TRATAMENTO DA CHAVE 'category'
            if (key === 'category') {
                const categoryValue = value as Category;
                
                // 1. A coluna na query deve ser 'category_id'
                if (categoryValue && categoryValue.id) {
                    updates.push(`category_id = ?`); 
                    
                    // 2. O valor deve ser o ID da categoria
                    values.push(categoryValue.id); 
                }
            } 
            // ------------------------------------------------
            else {
                // Tratamento para outras colunas (name, url, descricao, img)
                
                // Adiciona a chave da coluna original (name, url, etc.)
                updates.push(`${key} = ?`);

                if (typeof value === 'boolean') {
                    values.push(value ? 1 : 0);
                } else {
                    // Para strings (name, url, img, descricao)
                    values.push(value as string); 
                }
            }
        }
    });

        if (updates.length === 0) return; 

        const query = `UPDATE channels SET ${updates.join(', ')} WHERE id = ?;`;
        values.push(id);

        await currentDb.runAsync(query, values as any[]);
    },
    
    deleteChannel: async (id: string): Promise<void> => {
        const currentDb = await getDb();
        
        await currentDb.runAsync(
            `DELETE FROM channels WHERE id = ?;`,
            [id]
        );
    },
};

// -----------------------------------------------------------------
// FUNÇÕES ESPECÍFICAS PARA A TABELA 'feed_items'
// -----------------------------------------------------------------
const feedService = {
    getFeedItems: async (): Promise<ItemRSS[]> => {
        const currentDb = await getDb();
        const rows = await currentDb.getAllAsync<any>(
            `SELECT * FROM feed_items ORDER BY dataPublicacao DESC;`
        );
        
        return rows.map(row => ({
            canal: { id: row.canal_id } as Channel, 
            id: row.id,
            dataPublicacao: row.dataPublicacao,
            titulo: row.titulo,
            tags: row.tags,
            body: row.body,
            img: row.img,
            mark: row.mark === 1,
            // A coluna category_id foi removida, então não mapeamos
        }));
    },
    
    insertFeedItem: async (item: ItemRSS): Promise<void> => {
        const currentDb = await getDb();
        
        // 🚨 CORREÇÃO ESSENCIAL: Garante que campos opcionais são null
        const tags = item.tags || null;
        const body = item.body || null;
        const img = item.img || null;
        
        await currentDb.runAsync(
            // 🚨 8 placeholders (colunas)
            `INSERT INTO feed_items 
            (id, canal_id, dataPublicacao, titulo, tags, body, img, mark) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                item.id,
                item.canal.id, 
                item.dataPublicacao,
                item.titulo,
                tags, 
                body, 
                img, 
                item.mark ? 1 : 0,
            ]
        );
    },
    
    updateFeedItemMark: async (id: string, isMarked: boolean): Promise<void> => {
        const currentDb = await getDb();
        
        await currentDb.runAsync(
            `UPDATE feed_items SET mark = ? WHERE id = ?;`,
            [isMarked ? 1 : 0, id]
        );
    },
    
    deleteFeedItem: async (id: string): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `DELETE FROM feed_items WHERE id = ?;`,
            [id]
        );
    },
};

// ... (settingsService e categoryService mantidos inalterados) ...
const categoryService = {
    /** Obtém todas as categorias. */
    getCategories: async (): Promise<Category[]> => {
        const currentDb = await getDb();
        const rows = await currentDb.getAllAsync<Category>(
            `SELECT id, name FROM categories ORDER BY name;`
        );
        return rows;
    },

    /** Insere uma nova categoria. */
    insertCategory: async (category: Category): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `INSERT INTO categories (id, name) VALUES (?, ?);`,
            [category.id, category.name]
        );
    },
    
    /** Exclui uma categoria. */
    deleteCategory: async (id: string): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `DELETE FROM categories WHERE id = ?;`,
            [id]
        );
    },

    /** 🔄 Atualiza o nome de uma categoria existente. */
    updateCategory: async (category: Category): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `UPDATE categories SET name = ? WHERE id = ?;`,
            [category.name, category.id]
        );
    },
};
const settingsService = {
    getSetting: async (key: string): Promise<string | null> => {
        const currentDb = await getDb();
        const row = await currentDb.getFirstAsync<{ value: string }>(
            `SELECT value FROM user_settings WHERE key = ?;`,
            [key]
        );
        return row ? row.value : null;
    },
    
    setSetting: async (key: string, value: string): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?);`,
            [key, value]
        );
    },
    
    deleteSetting: async (key: string): Promise<void> => {
        const currentDb = await getDb();
        await currentDb.runAsync(
            `DELETE FROM user_settings WHERE key = ?;`,
            [key]
        );
    },
};

export const dbService = {

    // -----------------------------------------------------------------
    // 1. INICIALIZAÇÃO E CRIAÇÃO DAS TABELAS (TODAS)
    // -----------------------------------------------------------------
    initDB: async (): Promise<void> => {
        const currentDb = await getDb();
        
        await currentDb.execAsync(`
          
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS channels (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                descricao TEXT,
                img TEXT,
                category_id TEXT DEFAULT "1",  /* 🚨 VÍRGULA ADICIONADA AQUI */
                FOREIGN KEY (category_id) REFERENCES categories(id) 
            );
            
            CREATE TABLE IF NOT EXISTS user_settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT
            );
            
            
            CREATE TABLE IF NOT EXISTS feed_items (
                id TEXT PRIMARY KEY NOT NULL,
                canal_id TEXT NOT NULL,
                dataPublicacao TEXT,
                titulo TEXT NOT NULL,
                tags TEXT,
                body TEXT,
                img TEXT,
                mark INTEGER DEFAULT 0,
                
                FOREIGN KEY (canal_id) REFERENCES channels(id) /* 🚨 VÍRGULA FINAL REMOVIDA */
            );
        `);

    },

    channels: channelService,
    settings: settingsService,
    categories: categoryService,
    feed: feedService,
};

export { ItemRSS };