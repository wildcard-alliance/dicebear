<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import Button from 'primevue/button';
import useMainStore from '../stores/main';
import { saveToServer, showNotification } from '../utils/serverAdapter';

const store = useMainStore();
const isSaving = ref(false);
const saveSuccess = ref(true);
const lastSaved = ref(new Date());
const hasUnsavedChanges = ref(false);
const failedAttempts = ref(0);

// Track the saved state of the avatar
const savedStyleName = ref(store.selectedStyleName);
const savedStyleOptions = ref(JSON.stringify(store.selectedStyleOptions));

// Determine if there are unsaved changes by comparing current state to saved state
const buttonSeverity = computed(() => {
  return hasUnsavedChanges.value ? 'warning' : (saveSuccess.value ? 'success' : 'danger');
});

/**
 * Manual save initiated by the user clicking the Save button
 * Save the current avatar preferences to the server
 */
async function handleSave() {
  isSaving.value = true;
  
  try {
    console.log('SaveButton: Starting save operation with style:', store.selectedStyleName);
    
    const result = await saveToServer(
      store.selectedStyleName,
      store.selectedStyleOptions
    );
    
    console.log('SaveButton: Save result:', result);
    
    if (result.success) {
      saveSuccess.value = true;
      failedAttempts.value = 0;
      // Update saved state
      savedStyleName.value = store.selectedStyleName;
      savedStyleOptions.value = JSON.stringify(store.selectedStyleOptions);
      hasUnsavedChanges.value = false;
      showNotification(result.message || 'Avatar saved successfully', 'success');
    } else {
      saveSuccess.value = false;
      failedAttempts.value++;
      console.error('SaveButton: Failed to save avatar:', result.message);
      showNotification(result.message || 'Failed to save avatar', 'error');
    }
  } catch (error) {
    console.error('SaveButton: Error saving avatar:', error);
    failedAttempts.value++;
    showNotification(
      error instanceof Error ? error.message : 'Unknown error saving avatar',
      'error'
    );
    saveSuccess.value = false;
  } finally {
    isSaving.value = false;
    lastSaved.value = new Date();
  }
}

// Watch for changes to detect unsaved modifications
watch(
  () => [store.selectedStyleName, store.selectedStyleOptions],
  () => {
    const currentOptions = JSON.stringify(store.selectedStyleOptions);
    hasUnsavedChanges.value = 
      store.selectedStyleName !== savedStyleName.value || 
      currentOptions !== savedStyleOptions.value;
  }
);

// Initialize saved state when component is mounted
onMounted(() => {
  savedStyleName.value = store.selectedStyleName;
  savedStyleOptions.value = JSON.stringify(store.selectedStyleOptions);
});
</script>

<template>
  <div class="save-button-container">
    <Button
      :icon="isSaving ? 'pi pi-spin pi-spinner' : (hasUnsavedChanges ? 'pi pi-save' : 'pi pi-check')"
      :label="isSaving ? 'Saving...' : (hasUnsavedChanges ? 'Save Changes' : 'Saved')"
      :disabled="isSaving || !hasUnsavedChanges"
      :severity="buttonSeverity"
      @click="handleSave"
      class="save-button"
      :class="{ 'has-changes': hasUnsavedChanges }"
    />
  </div>
</template>

<style scoped>
.save-button-container {
  position: relative;
  margin-left: 10px;
}

.save-button {
  position: relative;
  transition: all 0.3s ease;
}

.save-button.has-changes {
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(255, 152, 0, 0.5);
  font-weight: bold;
}
</style>