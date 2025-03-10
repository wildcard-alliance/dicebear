<script setup lang="ts">
import { computed, watchEffect, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Preview from './components/Preview.vue';
import Options from './components/Options.vue';
import useMainStore from './stores/main';
import tinycolor from 'tinycolor2';
import Header from './components/Header.vue';
import { useElementSize } from '@vueuse/core';
import { hasUserContext, loadFromServer, showNotification } from './utils/serverAdapter';

const i18n = useI18n();
const store = useMainStore();

const header = ref<HTMLDivElement>();
const preview = ref<HTMLDivElement>();
const userHasContext = ref(false);
const isLoading = ref(false);

const { height: headerHeight } = useElementSize(header);
const { height: previewHeight } = useElementSize(preview);

const navOffsetTop = computed(
  () => 0
);

const backgroundColor = computed(() =>
  tinycolor(`#${store.selectedStyleOptions.backgroundColor}`)
    .darken(10)
    .toHexString()
);

/**
 * Load avatar preferences from the server
 */
async function loadSavedPreferences() {
  if (!userHasContext.value) {
    console.log('No user context available, skipping preference loading');
    return; // Not in authenticated mode
  }
  
  isLoading.value = true;
  
  try {
    console.log('Loading saved preferences from server');
    const result = await loadFromServer();
    
    if (result.success && result.data) {
      // Apply the loaded preferences
      store.selectedStyleName = result.data.style;
      store.selectedStyleOptions = result.data.options;
      
      showNotification('Your saved avatar has been loaded', 'success');
      console.log('Successfully loaded preferences:', result.data);
    } else if (result.success) {
      console.log('No saved preferences found for this user');
    } else {
      console.error('Error loading preferences:', result.message);
    }
  } catch (error) {
    console.error('Failed to load saved preferences:', error);
    // Don't show error to user, just silently fail
  } finally {
    isLoading.value = false;
  }
}


/**
 * Handle errors that might happen during initialization
 */
function handleInitializationError(error: unknown) {
  console.error('Initialization error:', error);
  showNotification(
    'There was a problem initializing the editor. Some features may not be available.',
    'error'
  );
}

onMounted(async () => {
  try {
    // Check if we're in authenticated mode
    userHasContext.value = hasUserContext();
    console.log('User has context:', userHasContext.value);
    
    // Initialize editor bridge if needed
    if (window.DICEBEAR_EDITOR || window.avatarBridge) {
      console.log('Editor bridge initialized');
    }
    
    // Load saved preferences if available
    await loadSavedPreferences();
    
  } catch (error) {
    handleInitializationError(error);
  }
});

watchEffect(() => (document.documentElement.lang = i18n.locale.value));
</script>

<template>
  <div class="app">
    <div class="app-top">
      <div class="app-header" ref="header">
        <Header />
      </div>
      <div class="app-preview" ref="preview">
        <Preview />
      </div>
    </div>
    <div class="app-options-container">
      <Options />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;

  background: v-bind("backgroundColor");
  background-image: linear-gradient(white, white),
    linear-gradient(v-bind("backgroundColor"), v-bind("backgroundColor"));
  background-position: center center, left top;
  background-size: 960px 100%, 100% 100%;
  background-repeat: no-repeat;

  &-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background-color: v-bind("backgroundColor");
  }

  &-header {
    padding: 0 20px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  &-preview {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
  }

  &-options-container {
    position: absolute;
    top: calc(v-bind("headerHeight + previewHeight") * 1px);
    bottom: 0;
    left: 0;
    right: 0;
    overflow-y: auto;
    max-width: 960px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
