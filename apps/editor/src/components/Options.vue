<script setup lang="ts">
import useMainStore from '@/stores/main';
import type { SelectedStyleOptions } from '@/types';
import { computed } from 'vue';
import Avatar from './Avatar.vue';
import Footer from './Footer.vue';
import { useDebounceFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ColorPicker from 'primevue/colorpicker';

// No props needed anymore

const store = useMainStore();
const { t } = useI18n();

const tabs = computed(() => {
  const result: Record<
    string,
    Array<{
      avatar: string;
      active?: boolean;
      options?: SelectedStyleOptions;
      onClick: () => void;
      onColorInput?: (value: string) => void;
    }>
  > = {};

  result['style'] = Object.keys(store.availableStyles).map((styleName) => ({
    avatar: store.availableStyles[styleName][0].avatar.toString(),
    active: store.selectedStyleName === styleName,
    onClick: () => changeStyleName(styleName),
  }));

  for (const key in store.selectedStyleCombinations) {
    result[key] = store.selectedStyleCombinations[key].map((combination) => ({
      avatar: combination.avatar.toString(),
      active: combination.active,
      options: combination.options,
      onClick: () => changeOptions(combination.options),
      onColorInput: combination.isCustomColor
        ? (value: string) =>
            changeOptionsWithOverride(combination.options, key, value)
        : undefined,
    }));
  }

  return result;
});

const selectedTabOptionName = computed(() => {
  return Object.keys(tabs.value)[typeof store.selectedTab === 'number' ? store.selectedTab : 0];
});

const customColorDefaultValue = computed({
  get: () => store.selectedStyleOptions[selectedTabOptionName.value],
  set: (value) =>
    tabs.value[selectedTabOptionName.value][0].onColorInput?.(value),
});

function changeStyleName(styleName: string) {
  store.selectedStyleName = styleName;
}

function changeOptions(options: SelectedStyleOptions) {
  store.selectedStyleOptions = options;
}

const changeOptionsWithOverride = useDebounceFn(
  function (options: SelectedStyleOptions, optionKey: string, value: string) {
    store.selectedStyleOptions = {
      ...options,
      [optionKey]: value,
    };
  },
  50,
  { maxWait: 50 }
);
</script>

<template>
  <div class="options">
    <div class="options-tabs-container">
      <TabView v-model:activeIndex="store.selectedTab" :activeIndex="0">
        <TabPanel 
          v-for="(key, i) in Object.keys(tabs)" 
          :key="i" 
          :header="t(key)"
        >
          <div class="options-content">
            <div class="options-slide">
              <div class="options-grid">
                <button
                  v-for="(combination, ci) in tabs[key]"
                  :key="ci"
                  :class="{
                    'options-avatar': true,
                    'options-avatar-active': combination.active,
                  }"
                  @click="combination.onClick"
                >
                  <Avatar
                    :svg="combination.avatar"
                    class="options-avatar-component"
                  />
                  <label
                    v-if="combination.onColorInput"
                    class="options-avatar-wheel"
                  >
                    <div class="options-avatar-wheel-picker">
                      <ColorPicker v-model="customColorDefaultValue">
                      </ColorPicker>
                    </div>
                  </label>
                </button>
              </div>
              <Footer :tab="key" />
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<style scoped lang="scss">
.options {
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;

  &-tabs-container {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    width: 100%;
  }
  
  :deep(.p-tabview) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  :deep(.p-tabview-nav) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    padding: 0 !important;
    max-width: 100%;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
  
  :deep(.p-tabview-panels) {
    padding: 0 !important;
    border: none !important;
    flex: 1;
    overflow: visible;
  }
  
  :deep(.p-tabview-nav-link) {
    padding: 12px 20px !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 2px solid transparent !important;
    border-radius: 0 !important;
    font-weight: 600 !important;
    color: #757575 !important;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    box-shadow: none !important;
    
    &:hover:not(:disabled) {
      color: #424242 !important;
    }
    
    &.p-highlight {
      color: #4272d7 !important;
      border-bottom-color: #4272d7 !important;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &-content {
    height: 100%;
  }

  &-slide {
    padding: 20px 16px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    gap: 20px;
    width: 100%;
  }

  &-avatar {
    position: relative;

    &-component {
      border-radius: 12px;
      overflow: hidden;
    }

    &::after {
      content: '';
      position: absolute;
      top: -6px;
      right: -6px;
      bottom: -6px;
      left: -6px;
      border-radius: 18px;
      border: 0 solid #1689cc;
      transition: border-width 0.12s ease-in-out;
      pointer-events: none;
    }

    &-active {
      &::after {
        border-width: 3px;
      }
    }

    &-wheel {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      cursor: pointer;

      &-picker {
        position: absolute;
        bottom: 0;
        right: 0;

        :global(input) {
          visibility: hidden;
        }
      }

      &::before {
        content: '';
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 28px;
        height: 28px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: conic-gradient(
          red 0%,
          red 14.29%,
          orange 14.29%,
          orange 28.57%,
          yellow 28.57%,
          yellow 42.86%,
          green 42.86%,
          green 57.14%,
          blue 57.14%,
          blue 71.43%,
          indigo 71.43%,
          indigo 85.71%,
          violet 85.71%
        );
      }

      &::after {
        content: '';
        position: absolute;
        right: 11px;
        bottom: 11px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #fff;
      }
    }

    @media (pointer: fine) {
      &:hover {
        &::after {
          border-width: 3px;
        }
      }
    }
  }
}
</style>
