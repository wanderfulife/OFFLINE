<!-- CommuneSelector.vue -->
<template>
  <div class="form-group">
    <input class="form-control" type="text" v-model="postalCodeInput" @input="search"
      placeholder="Code postal (ex: 92, 54)" />
    <input class="form-control" type="text" v-model="communeInput" @input="search" placeholder="Nom de la commune" />
    <div v-if="showDropdown" class="commune-dropdown">
      <div v-for="item in filteredCommunes" :key="item['CODE INSEE']" @click="selectCommune(item)"
        class="commune-option">
        {{ item.COMMUNE }} ({{ item['CODE POSTAL'] }})
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useOfflineData } from '../composables/useOfflineData.js';

const { getCommunes, searchCommunes, loadingState } = useOfflineData();
const insee = ref([]);

const props = defineProps({
  modelValue: String,
  postalCodePrefix: String
});

const emit = defineEmits(['update:modelValue', 'update:postalCodePrefix']);

const postalCodeInput = ref('');
const communeInput = ref('');
const showDropdown = ref(false);
const filteredCommunes = ref([]);

const search = async () => {
  if (postalCodeInput.value.length < 2 && communeInput.value.length < 2) {
    showDropdown.value = false;
    return;
  }

  try {
    // Use the offline-first search function
    filteredCommunes.value = await searchCommunes(
      communeInput.value,
      postalCodeInput.value,
      100
    );

    showDropdown.value = filteredCommunes.value.length > 0;

    // Emit the current inputs as the selected values
    emit('update:modelValue', `${communeInput.value}`);
    emit('update:postalCodePrefix', postalCodeInput.value);
  } catch (error) {
    console.error('Error searching communes:', error);
    filteredCommunes.value = [];
    showDropdown.value = false;
  }
};

const selectCommune = (item) => {
  if (item && item.COMMUNE && item['CODE INSEE']) {
    communeInput.value = item.COMMUNE;
    postalCodeInput.value = item['CODE POSTAL'] ? item['CODE POSTAL'].toString() : '';
    
    emit('update:modelValue', `${item.COMMUNE} - ${item['CODE INSEE']}`);
    emit('update:postalCodePrefix', postalCodeInput.value);
    
    showDropdown.value = false;
  }
};

watch(() => props.modelValue, async (newVal) => {
  if (newVal && typeof newVal === 'string') {
    const parts = newVal.split(' - ');
    communeInput.value = parts[0] || '';
    if (parts.length > 1 && !postalCodeInput.value) {
        const communes = await getCommunes();
        const matchedCommune = communes.find(i => i['CODE INSEE'] === parts[1]);
        if (matchedCommune && matchedCommune['CODE POSTAL']) {
            postalCodeInput.value = matchedCommune['CODE POSTAL'].toString();
        }
    }

  } else if (!newVal) {
    communeInput.value = '';
  }
});

watch(() => props.postalCodePrefix, (newVal) => {
  if (newVal && newVal !== postalCodeInput.value) {
    postalCodeInput.value = newVal;
  } else if (!newVal) {
    postalCodeInput.value = '';
  }
});
</script>

<style scoped>
.form-group {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Inherits .form-control from SurveyTemplate.vue, but we can add specifics */
.form-control {
  margin-bottom: 1rem;
}

.commune-dropdown {
  position: absolute;
  /* Position it below the second input field */
  top: calc(2 * (0.9rem * 2 + 1rem) - 0.5rem); /* 2 * (padding + margin) - overlap */
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background-color: var(--card-bg);
  border: 1px solid var(--button-bg);
  border-radius: var(--border-radius-md);
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.commune-option {
  padding: 0.9rem 1rem;
  cursor: pointer;
  color: var(--text-light);
  border-bottom: 1px solid var(--button-bg);
  transition: all 0.2s ease-in-out;
}

.commune-option:last-child {
  border-bottom: none;
}

.commune-option:hover {
  background-color: var(--button-hover-bg);
  color: var(--primary-text);
}
</style>
