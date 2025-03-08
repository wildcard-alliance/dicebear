<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import useMainStore from '../stores/main';
import { saveToServer, showNotification } from '../utils/serverAdapter';
import { SelectedStyleOptions } from '../types';

const store = useMainStore();
const isSaving = ref(false);

/**
 * Save the current avatar preferences to the server
 */
async function handleSave() {
  isSaving.value = true;
  
  try {
    const result = await saveToServer(
      store.selectedStyleName,
      store.selectedStyleOptions
    );
    
    if (result.success) {
      showNotification(result.message || 'Avatar saved successfully', 'success');
    } else {
      showNotification(result.message || 'Failed to save avatar', 'error');
    }
  } catch (error) {
    console.error('Error saving avatar:', error);
    showNotification(
      error instanceof Error ? error.message : 'Unknown error saving avatar',
      'error'
    );
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Button
    :icon="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'"
    :label="isSaving ? 'Saving...' : 'Save'"
    :disabled="isSaving"
    severity="success"
    @click="handleSave"
    class="save-button"
  />
</template>

<style scoped>
.save-button {
  margin-left: 10px;
}
</style>