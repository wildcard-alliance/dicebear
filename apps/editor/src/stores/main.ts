import getRandomOptions from '@/utils/getRandomOptions';
import { defineStore } from 'pinia';
import { computed, ref, watch, onMounted } from 'vue';
import type {
  SelectedStyleCombinations,
  SelectedStyleOptionsCollection,
} from '@/types';
import { createAvatar } from '@/utils/createAvatar';
import getAvatarCombinations from '@/utils/getAvatarCombinations';
import styleCollection from '@/config/styles';
import { useLocalStorage, useStorage } from '@vueuse/core';

declare global {
  interface Window {
    DICEBEAR_EDITOR?: {
      userId: string;
      token: string;
      apiUrl: string;
      initialStyle: string;
    };
    saveEditorPreferences?: (style: string, options: any) => Promise<boolean>;
    avatarBridge?: {
      savePreferences: (style: string, options: any) => Promise<boolean>;
      loadPreferences: () => Promise<any>;
    };
  }
}

const useMainStore = defineStore('main', () => {
  // Get the initial style from the bridge if available
  const initialStyle = window.DICEBEAR_EDITOR?.initialStyle || Object.keys(styleCollection)[0];
  
  const selectedStyleName = useLocalStorage('editor_style', initialStyle);

  const selectedStyleOptionsCollection =
    useStorage<SelectedStyleOptionsCollection>(
      `editor_avatar_options_${__dicebearEditorVersion}`,
      Object.keys(styleCollection).reduce<SelectedStyleOptionsCollection>(
        (acc, key) => {
          acc[key] = getRandomOptions(styleCollection[key].options);
          return acc;
        },
        {}
      )
    );

  const selectedStyleOptions = computed({
    get: () => selectedStyleOptionsCollection.value[selectedStyleName.value],
    set: (value) => {
      selectedStyleOptionsCollection.value[selectedStyleName.value] = value;
      
      // Auto-save to server if bridge is available
      if (window.saveEditorPreferences) {
        window.saveEditorPreferences(
          selectedStyleName.value,
          selectedStyleOptionsCollection.value
        ).catch(error => {
          console.error('Failed to save preferences:', error);
        });
      }
    },
  });

  const selectedStyleCombinations = computed(() => {
    return getAvatarCombinations(
      selectedStyleName.value,
      selectedStyleOptionsCollection.value[selectedStyleName.value]
    );
  });

  const availableStyles = computed(() => {
    const result: SelectedStyleCombinations = {};

    for (const key in styleCollection) {
      if (
        false === Object.prototype.hasOwnProperty.call(styleCollection, key)
      ) {
        continue;
      }

      result[key] = [
        {
          active: selectedStyleName.value === key,
          avatar: createAvatar(key, selectedStyleOptionsCollection.value[key]),
          options: selectedStyleOptionsCollection.value[key],
        },
      ];
    }

    return result;
  });

  const selectedStylePreview = computed(() => {
    return createAvatar(
      selectedStyleName.value,
      selectedStyleOptionsCollection.value[selectedStyleName.value]
    );
  });

  const selectedTab = ref(0);

  // Listen for preferences loaded event
  onMounted(() => {
    window.addEventListener('dicebear:preferences-loaded', ((event: CustomEvent) => {
      const data = event.detail;
      if (data && data.style) {
        selectedStyleName.value = data.style;
      }
      if (data && data.options) {
        // Merge saved options with defaults
        for (const style in data.options) {
          if (selectedStyleOptionsCollection.value[style]) {
            selectedStyleOptionsCollection.value[style] = {
              ...selectedStyleOptionsCollection.value[style],
              ...data.options[style]
            };
          }
        }
      }
    }) as EventListener);
    
    // Load stored preferences if bridge is available
    if (window.avatarBridge?.loadPreferences) {
      window.avatarBridge.loadPreferences().catch(error => {
        console.error('Failed to load preferences:', error);
      });
    }
  });

  watch(
    () => selectedTab.value,
    () => window.scrollTo({ top: 0 })
  );
  
  // Also watch for style changes to save them
  watch(
    () => selectedStyleName.value,
    (newStyle) => {
      if (window.saveEditorPreferences) {
        window.saveEditorPreferences(
          newStyle,
          selectedStyleOptionsCollection.value
        ).catch(error => {
          console.error('Failed to save style preference:', error);
        });
      }
    }
  );

  return {
    availableStyles,
    selectedTab,
    selectedStyleName,
    selectedStylePreview,
    selectedStyleCombinations,
    selectedStyleOptions,
  };
});

export default useMainStore;
