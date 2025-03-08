<script setup lang="ts">
import { computed, watchEffect, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Preview from './components/Preview.vue';
import Options from './components/Options.vue';
import useMainStore from './stores/main';
import tinycolor from 'tinycolor2';
import Header from './components/Header.vue';
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';
import { isServerMode } from './utils/serverAdapter';

const i18n = useI18n();
const store = useMainStore();

const header = ref<HTMLDivElement>();
const preview = ref<HTMLDivElement>();
const serverMode = ref(false);

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

onMounted(() => {
  // Check if we're in server mode
  serverMode.value = isServerMode();
  
  // Initialize editor bridge if needed
  if (window.DICEBEAR_EDITOR || window.avatarBridge) {
    console.log('Editor bridge initialized');
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
