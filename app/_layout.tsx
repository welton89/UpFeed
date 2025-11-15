import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useChanneStore } from '@/store/useChanneStore';
import { useFeedStore } from '@/store/useFeedStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';

import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {toastConfig} from '@/themes/configToast'


export default function RootLayout() {
    const colorScheme = useColorScheme();
        const loadChannel = useChanneStore(state => state.loadChannel);
        const loadFeed = useFeedStore(state => state.loadFeed);
        const loadCategory = useCategoryStore(state => state.loadCategories);
        const loadConfig= useSettingsStore(state => state.loadSettings);
        const isDBLoaded = useChanneStore(state => state.isDBLoaded);
  
useEffect(() => {
        loadChannel(); 
    }, [loadChannel]);

    useEffect(() => {
        if (isDBLoaded) {
            loadFeed();
            loadCategory();
            loadConfig();
        }
    }, [isDBLoaded,  loadCategory, loadConfig]);

  return (
    <>
    <SafeAreaProvider>

     <PaperProvider>
      <Stack >
        <Stack.Screen name="(drawer)"  options={{ headerShown: false }} />
        <Stack.Screen name="pages" options={{ headerShown: false }} />
      </Stack>
      {/* <StatusBar style="auto" /> */}
     </PaperProvider>
    </SafeAreaProvider>
     <Toast config={toastConfig} />
    </>
  );
}
