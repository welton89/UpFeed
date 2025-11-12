// app/pages/_layout.tsx
import { Stack } from 'expo-router';

export default function PagesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="ArticleDetailScreen" 
        options={{ title: 'Detalhes da Notícia' }} 
      />
      <Stack.Screen 
        name="createUpdate" 
        options={{ title: 'Adicionar ou Editar' }} 
      />
      <Stack.Screen 
        name="CrudCategories" 
        options={{ title: 'Categorias' }} 
      />
      <Stack.Screen 
        name="exploreChannel" 
        options={{ title: 'Explorar Canais' }} 
      />
      
    </Stack>
  );
}