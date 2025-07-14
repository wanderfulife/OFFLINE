<template>
  <div class="app-container">
    <!-- Progress Bar -->
    <div v-if="currentStep === 'survey'" class="progress-bar">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="content-container">
      <!-- Enqueteur Input Step -->
      <div v-if="currentStep === 'enqueteur'" class="enqueteur-step">
        <div class="enqueteur-content">
          <img class="logo logo-center" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
          <h2>Prénom enqueteur :</h2>
          <input class="form-control" type="text" v-model="enqueteurInputRef" />
          <button
            v-if="enqueteurInputRef.trim()"
            @click="setEnqueteur"
            class="btn-next"
          >
            Suivant
          </button>
        </div>
      </div>

      <!-- Start Survey Step (now potentially skipped if enqueteur is set) -->
      <div v-else-if="currentStep === 'start'" class="start-survey-container">
        <h2 v-html="props.welcomeMessage"></h2>
        <button @click="startSurveyActual" class="btn-next">
          COMMENCER QUESTIONNAIRE
        </button>
      </div>

      <!-- Survey Questions Step -->
      <div v-else-if="currentStep === 'survey' && !isSurveyComplete && currentQuestion" class="survey-question-wrapper">
        <div class="question-container">
          <h2>{{ currentQuestionText }}</h2>

          <!-- Question Image (if available) -->
          <div v-if="currentQuestion.image" class="question-image-container">
            <img 
              :src="currentQuestion.image" 
              :alt="currentQuestion.imageAlt || 'Image d\'aide pour la question'"
              class="question-image"
              loading="eager"
              @error="handleImageError"
              @click="openImageZoom"
            />
            <div class="zoom-hint">
              <div class="zoom-icon"></div>
            </div>
          </div>

          <!-- Commune Selector -->
          <div v-if="currentQuestion.type === 'commune'">
            <CommuneSelector
              v-model="selectedCommune"
              v-model:postalCodePrefix="postalCodePrefix"
            />
            <button
              @click="handleCommuneSelection"
              class="btn-next"
              :disabled="!selectedCommune.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Station (Gare) Selector -->
          <div v-else-if="currentQuestion.type === 'station'">
            <div class="input-container">
              <input 
                v-model="stationInput" 
                @input="filterStations" 
                class="form-control"
                placeholder="Saisir ou rechercher une station (bus, tram, etc.)"
              />
              <ul v-if="filteredStations.length && stationInput" class="autocomplete-results">
                <li 
                  v-for="(station, index) in filteredStations" 
                  :key="index" 
                  @click="selectStationFromList(station)"
                >
                  {{ station }}
                </li>
              </ul>
            </div>
            <button 
              @click="handleStationStreetInput(stationInput, 'station')" 
              class="btn-next" 
              :disabled="!stationInput.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Gare (Train Station) Selector -->
          <div v-else-if="currentQuestion.type === 'gare'">
            <GareSelector v-model="selectedGareName" />
            <button 
              @click="handleGareInput"
              class="btn-next" 
              :disabled="!selectedGareName || !selectedGareName.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Street Selector -->
          <div v-else-if="currentQuestion.type === 'street'">
            <div class="input-container">
              <input 
                v-model="streetInput" 
                @input="filterStreets" 
                class="form-control"
                placeholder="Saisir ou rechercher une rue"
              />
              <ul v-if="filteredStreets.length && streetInput" class="autocomplete-results">
                <li 
                  v-for="(street, index) in filteredStreets" 
                  :key="index" 
                  @click="selectStreetFromList(street)"
                >
                  {{ street }}
                </li>
              </ul>
            </div>
            <button 
              @click="handleStationStreetInput(streetInput, 'street')" 
              class="btn-next" 
              :disabled="!streetInput.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>

          <!-- Multiple Choice Questions (checkboxes) -->
          <div v-else-if="currentQuestion.type === 'multipleChoice'">
            <div
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="checkbox-option"
            >
              <label :for="`${currentQuestion.id}_${option.id}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`${currentQuestion.id}_${option.id}`"
                  :value="option.id"
                  v-model="multipleChoiceSelections"
                  class="checkbox-input"
                />
                {{ option.text }}
              </label>
            </div>
            <button
              v-if="multipleChoiceSelections.length > 0"
              @click="handleMultipleChoiceAnswer"
              class="btn-next"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>
          
          <!-- Single Choice Questions (buttons) -->
          <div v-else-if="currentQuestion.type === 'singleChoice' && currentQuestion.options">
            <div
              v-for="(option) in currentQuestion.options"
              :key="option.id"
            >
              <button @click="selectAnswer(option)" class="btn-option">
                {{ option.text }}
              </button>
            </div>
          </div>

          <!-- Free Text Questions -->
          <div v-else-if="currentQuestion.type === 'freeText'">
            <div class="input-container">
              <input
                v-model="freeTextAnswer"
                class="form-control"
                :type="currentQuestion.validation === 'numeric' ? 'number' : 'text'"
                :placeholder="currentQuestion.freeTextPlaceholder || 'Votre réponse'"
                :inputmode="currentQuestion.validation === 'numeric' ? 'numeric' : undefined"
              />
            </div>
            <button
              @click="handleFreeTextAnswer"
              class="btn-next"
              :disabled="!freeTextAnswer || String(freeTextAnswer).trim() === ''"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>
          
          <!-- Fallback or Error for unknown question type -->
          <div v-else>
            <p style="color: red;">Erreur: Type de question non reconnu ou non défini pour QID: {{ currentQuestion.id }}. Définissez la propriété 'type'.</p>
          </div>

          <!-- Back Button -->
          <button @click="previousQuestion" class="btn-return" v-if="canGoBack">
            Retour
          </button>
        </div>
      </div>
      <div v-else-if="currentStep === 'survey' && !currentQuestion">
         <p>Chargement des questions...</p>
         <!-- Or an error if questions array is empty -->
         <div v-if="props.surveyQuestions && props.surveyQuestions.length === 0">
            <p style="color: red;">Aucune question n'a été chargée pour cette enquête.</p>
         </div>
      </div>


      <!-- Survey Complete Step -->
      <div v-else-if="isSurveyComplete" class="survey-complete">
        <h2>Merci pour votre réponse et bonne journée.</h2>
        <div v-if="onlineSessionSaveCount > 0" class="session-counter">
          {{ onlineSessionSaveCount }} enquête(s) enregistrée(s) en ligne durant cette session.
        </div>
        <button @click="resetSurvey" class="btn-next">
          Nouveau questionnaire
        </button>
      </div>

      <!-- Logo (only shown when not on enqueteur step) -->
      <img v-if="currentStep !== 'enqueteur'" class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
    </div>

    <!-- Image Zoom Modal -->
    <div v-if="showImageZoom" class="image-zoom-modal" @click="closeImageZoom">
      <div class="image-zoom-container" @click.stop>
        <button class="close-zoom" @click="closeImageZoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div 
          class="zoom-image-wrapper"
          ref="zoomWrapper"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @wheel="handleWheel"
        >
          <img 
            ref="zoomImage"
            :src="currentQuestion.image"
            :alt="currentQuestion.imageAlt || 'Image agrandie'"
            class="zoom-image"
            :style="imageTransform"
            @load="handleImageLoad"
          />
        </div>
      </div>
    </div>

    <!-- PDF Modal -->
    <div v-if="showPdf" class="modal">
      <div class="modal-content pdf-content">
        <button
          class="close"
          @click="
            () => {
              showPdf = false;
            }
          "
        >
          ×
        </button>
        <iframe
          :src="pdfUrl"
          width="100%"
          height="500px"
          type="application/pdf"
        >
          This browser does not support PDFs. Please download the PDF to view
          it.
        </iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import CommuneSelector from "./CommuneSelector.vue";
import GareSelector from "./GareSelector.vue";
import { useOfflineData } from "../composables/useOfflineData.js";
import { useToast } from '../composables/useToast.js';

const onlineSessionSaveCount = ref(0);

const { showToast } = useToast();
let offlineSaveCount = 0;
let offlineToastTimer = null;
const OFFLINE_TOAST_ID = 'offline-save-toast';

const props = defineProps({
  surveyQuestions: {
    type: Array,
    required: true,
  },
  firebaseCollectionName: {
    type: String,
    required: true,
  },
  stationsList: { 
    type: Array,
    default: () => []
  },
  streetsList: { 
    type: Array,
    default: () => []
  },
  posteTravailQuestionId: {
    type: String,
    default: null,
  },
  surveyTitle: {
    type: String,
    default: 'Enquête'
  },
  welcomeMessage: {
    type: String,
    default: 'Bonjour Madame/Monsieur'
  },
  rememberPosteTravail: {
    type: Boolean,
    default: true,
  },
});

// Core State
const currentStep = ref("enqueteur");
const enqueteurInputRef = ref("");
const savedEnqueteur = ref("");
const startDate = ref("");
const currentQuestionIndex = ref(0);
const currentQuestion = ref(null);
const answers = ref({ question_answers: [] });
const freeTextAnswer = ref("");
const multipleChoiceSelections = ref([]);
const questionPath = ref([]);
const isSurveyComplete = ref(false);
const isFinishing = ref(false);

// Added for remembering Poste de Travail
const savedPosteTravailValue = ref(null);
const savedPosteTravailText = ref("");
const savedPosteTravailOptionIndex = ref(-1);

// State for CommuneSelector
const selectedCommune = ref("");
const postalCodePrefix = ref("");

// State for Station/Street selection
const stationInput = ref("");
const streetInput = ref("");
const filteredStations = ref([]);
const filteredStreets = ref([]);

// Initialize offline data loading
const { loadAllData, searchStreets, getDataStats } = useOfflineData();

// State for Gare selection (using GareSelector component now)
const selectedGareName = ref("");

// UI State
const showPdf = ref(false);
const pdfUrl = ref("/Plan.pdf");

// Image Zoom State
const showImageZoom = ref(false);
const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const lastTouchDistance = ref(0);
const isDragging = ref(false);
const lastTouchX = ref(0);
const lastTouchY = ref(0);
const zoomWrapper = ref(null);
const zoomImage = ref(null);

// Firestore References
const surveyCollectionRef = computed(() =>
  collection(db, props.firebaseCollectionName)
);

// Computed Properties
const currentQuestionText = computed(() => {
  if (!currentQuestion.value) return "";

  if (currentQuestion.value.conditionalText) {
    const conditionalTextBlock = currentQuestion.value.conditionalText;
    let specificText = null;

    const conditions = Array.isArray(conditionalTextBlock) ? conditionalTextBlock : [conditionalTextBlock];

    for (const condBlock of conditions) {
      const conditionQuestionId = condBlock.condition;
      const conditionAnswer = getAnswerById(conditionQuestionId);

      if (conditionAnswer !== undefined && conditionAnswer !== null) {
        for (const route of condBlock.routes) {
          if (conditionAnswer.optionId === route.value || 
              (Array.isArray(conditionAnswer.optionId) && conditionAnswer.optionId.includes(route.value)) ||
              conditionAnswer.answer === route.value 
             ) {
            specificText = route.text;
            break; 
          }
        }
      }
      if (specificText) break; 
    }
    if (specificText) return specificText;
  }
  return currentQuestion.value.text;
});

const canGoBack = computed(() => questionPath.value.length > 1);

const isLastQuestion = computed(() => {
    if (!currentQuestion.value || !props.surveyQuestions || props.surveyQuestions.length === 0) return true;
    const localCurrentIndex = props.surveyQuestions.findIndex(q => q.id === currentQuestion.value.id);
    if (localCurrentIndex === -1) return true;

    if (localCurrentIndex === props.surveyQuestions.length - 1) return true;
    if (currentQuestion.value.next === 'end') return true;
    if (currentQuestion.value.options && currentQuestion.value.options.every(opt => opt.next === 'end')) return true;
    return false;
});

const progress = computed(() => {
  if (currentStep.value !== "survey" || !props.surveyQuestions || props.surveyQuestions.length === 0 || !currentQuestion.value) return 0;
  if (isSurveyComplete.value) return 100;
  
  const totalQuestions = props.surveyQuestions.length;
  const localCurrentIndex = props.surveyQuestions.findIndex(q => q.id === currentQuestion.value.id);
  if (localCurrentIndex === -1) return 0;
  const currentQuestionNumber = localCurrentIndex + 1;

  if (isLastQuestion.value) return 100;

  return Math.min(Math.round((currentQuestionNumber / totalQuestions) * 100), 99);
});

const imageTransform = computed(() => {
  return {
    transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoomLevel.value})`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease-out'
  };
});

// Methods
const setEnqueteur = () => {
  if (enqueteurInputRef.value.trim() !== "") {
    savedEnqueteur.value = enqueteurInputRef.value.trim();
    currentStep.value = "start";
  } else {
    alert("Veuillez entrer le prénom de l'enquêteur.");
  }
};

const startSurveyActual = () => {
  const now = new Date();
  startDate.value = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  answers.value = { question_answers: [] };
  currentStep.value = "survey";
  isSurveyComplete.value = false;
  
  freeTextAnswer.value = "";
  multipleChoiceSelections.value = [];
  selectedCommune.value = "";
  postalCodePrefix.value = "";
  stationInput.value = "";
  streetInput.value = "";
  selectedGareName.value = "";
  filteredStations.value = [];
  filteredStreets.value = [];

  let firstQuestionId;
  const posteTravailQId = props.posteTravailQuestionId;

  // If we have a remembered POSTE value, record it in this survey's answers
  if (posteTravailQId && savedPosteTravailValue.value !== null && savedPosteTravailText.value) {
    const posteQuestion = findQuestionById(posteTravailQId);
    if (posteQuestion) {
        // Record the remembered POSTE value in this survey's answers
        recordAnswerToState(
            posteTravailQId,
            posteQuestion.text, 
            savedPosteTravailValue.value,
            savedPosteTravailText.value,
            savedPosteTravailOptionIndex.value !== -1 ? savedPosteTravailOptionIndex.value : undefined
        );
        
        const matchedOption = posteQuestion.options 
            ? posteQuestion.options.find(opt => opt.id === savedPosteTravailValue.value) 
            : null;
        firstQuestionId = getNextQuestionId(posteQuestion, matchedOption);
         if (!firstQuestionId || firstQuestionId === posteTravailQId) {
            if (props.surveyQuestions && props.surveyQuestions.length > 0) {
                 const firstSurveyQuestion = props.surveyQuestions.find(q => q.id !== posteTravailQId); 
                 firstQuestionId = firstSurveyQuestion ? firstSurveyQuestion.id : (props.surveyQuestions[0] ? props.surveyQuestions[0].id : null);
                 if (!firstQuestionId && props.surveyQuestions[0] && props.surveyQuestions[0].id === posteTravailQId && props.surveyQuestions.length > 1) {
                    firstQuestionId = props.surveyQuestions[1].id;
                 } else if (!firstQuestionId && props.surveyQuestions[0]) {
                    firstQuestionId = props.surveyQuestions[0].id;
                 }
            } else {
                firstQuestionId = null; 
            }
        }
    } else {
        firstQuestionId = props.surveyQuestions && props.surveyQuestions.length > 0 ? props.surveyQuestions[0].id : null;
    }
  } else {
    firstQuestionId = props.surveyQuestions && props.surveyQuestions.length > 0 ? props.surveyQuestions[0].id : null;
  }

  currentQuestion.value = findQuestionById(firstQuestionId);
  if (currentQuestion.value) {
    questionPath.value = [currentQuestion.value.id];
    currentStep.value = 'survey';
    
    // Scroll to top when starting survey, with delay to prevent conflicts
    nextTick(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    });
  } else if (firstQuestionId === 'end'){
    finishSurvey();
  } else {
    console.error("Could not determine the first question. SurveyQuestions length:", props.surveyQuestions?.length);
    currentStep.value = 'survey'; 
    isSurveyComplete.value = true; 
  }
};

const recordAnswerToState = (questionId, questionText, optionId, optionText, optionIndex = -1) => {
  questionId = String(questionId);
  if (!answers.value.question_answers) {
    answers.value.question_answers = [];
  }
  const existingIndex = answers.value.question_answers.findIndex(
    (qa) => qa.questionId === questionId
  );
  if (existingIndex !== -1) {
    answers.value.question_answers.splice(existingIndex, 1);
  }
  answers.value.question_answers.push({
    questionId: questionId,
    questionText: questionText,
    optionId: optionId,
    optionText: optionText,
    optionIndex: optionIndex,
  });
  answers.value[questionId] = optionId; 

  if (props.posteTravailQuestionId && questionId === String(props.posteTravailQuestionId)) {
    savedPosteTravailValue.value = optionId;
    savedPosteTravailText.value = optionText;
    savedPosteTravailOptionIndex.value = optionIndex;
  }
};

const selectAnswer = (selectedOption) => {
  if (!currentQuestion.value) return;
  const optionIndex = currentQuestion.value.options 
    ? currentQuestion.value.options.findIndex(opt => opt.id === selectedOption.id)
    : -1;

  recordAnswerToState(
    currentQuestion.value.id, 
    currentQuestionText.value,
    selectedOption.id,
    selectedOption.text,
    optionIndex
  );
  
  // NEW: Check if this option has a condition
  let effectiveOption = selectedOption;
  if (selectedOption.condition) {
    const conditionMet = evaluateCondition(selectedOption.condition);
    if (!conditionMet && selectedOption.fallbackNext) {
      // Create a new option object with the fallback next
      effectiveOption = { ...selectedOption, next: selectedOption.fallbackNext };
    }
  }
  
  nextQuestion(effectiveOption);
};

const handleMultipleChoiceAnswer = () => {
  if (!currentQuestion.value || multipleChoiceSelections.value.length === 0) return;
  const questionIdStr = String(currentQuestion.value.id);

  const selectedOptionsDetails = multipleChoiceSelections.value.map(numericOptionId => {
    return currentQuestion.value.options.find(opt => opt.id === numericOptionId);
  }).filter(opt => opt);

  const combinedOptionText = selectedOptionsDetails.map(opt => opt.text).join(", ");
  recordAnswerToState(
    questionIdStr,
    currentQuestionText.value,
    multipleChoiceSelections.value,
    combinedOptionText
  );
  
  // Check if any selected option has next_if_selected (for precision questions)
  const optionWithPrecision = selectedOptionsDetails.find(opt => opt.next_if_selected);
  
  if (optionWithPrecision) {
    // Route to the precision question
    const precisionQuestionId = optionWithPrecision.next_if_selected;
    
    const precisionQuestion = findQuestionById(precisionQuestionId);
    if (precisionQuestion) {
      currentQuestion.value = precisionQuestion;
      questionPath.value.push(precisionQuestion.id);
      freeTextAnswer.value = "";
      multipleChoiceSelections.value = [];
      selectedCommune.value = "";
      postalCodePrefix.value = "";
      stationInput.value = "";
      streetInput.value = "";
      selectedGareName.value = "";
      return;
    }
  }
  
  nextQuestion(null);
};

const handleFreeTextAnswer = () => {
  if (!currentQuestion.value || !freeTextAnswer.value) return;
  
  // Convert to string and trim for validation
  const answerValue = String(freeTextAnswer.value).trim();
  if (!answerValue) return;
  
  recordAnswerToState(
    currentQuestion.value.id,
    currentQuestionText.value,
    freeTextAnswer.value, // Use original value (could be number)
    answerValue // Use trimmed string for display
  );
  nextQuestion(null);
};

const handleCommuneSelection = () => {
  if (!currentQuestion.value || !selectedCommune.value.trim()) return;
  
  const questionId = currentQuestion.value.id;
  
  // Parse the selectedCommune value (format: "COMMUNE - CODE_INSEE" or just "COMMUNE")
  const communeValue = selectedCommune.value.trim();
  let communeName = communeValue;
  let codeInsee = '';
  let communeLibre = '';
  
  if (communeValue.includes(' - ')) {
    // Selected from dropdown (format: "COMMUNE - CODE_INSEE")
    const parts = communeValue.split(' - ');
    communeName = parts[0];
    codeInsee = parts[1] || '';
  } else {
    // Free text input (user typed something not in the list)
    communeLibre = communeValue;
    communeName = '';
  }
  
  // Record the main commune field
  recordAnswerToState(
    questionId,
    currentQuestionText.value,
    communeName,
    communeName
  );
  
  // Record the CODE INSEE field if available
  if (codeInsee) {
    recordAnswerToState(
      `${questionId}_CODE_INSEE`,
      `${currentQuestionText.value} - Code INSEE`,
      codeInsee,
      codeInsee
    );
  }
  
  // Record the COMMUNE_LIBRE field if it's free text
  if (communeLibre) {
    recordAnswerToState(
      `${questionId}_COMMUNE_LIBRE`,
      `${currentQuestionText.value} - Commune libre`,
      communeLibre,
      communeLibre
    );
  }
  
  nextQuestion(null);
};

const handleStationStreetInput = (value, inputType) => {
  if (!currentQuestion.value || !value.trim()) return;
  recordAnswerToState(
    currentQuestion.value.id,
    currentQuestionText.value,
    value.trim(),
    value.trim()
  );
  nextQuestion(null);
};

const handleGareInput = () => {
  if (!currentQuestion.value || !selectedGareName.value || !selectedGareName.value.trim()) return;
  recordAnswerToState(
    currentQuestion.value.id,
    currentQuestionText.value,
    selectedGareName.value.trim(),
    selectedGareName.value.trim()
  );
  nextQuestion(null);
};

const nextQuestion = async (selectedOption = null) => {
  let nextId = getNextQuestionId(currentQuestion.value, selectedOption);

  // Check if the target question has a condition and skip it if not met
  while (nextId && nextId !== 'end') {
    const nextQObject = findQuestionById(nextId);
    if (nextQObject && nextQObject.condition) {
      const shouldShowQuestion = evaluateCondition(nextQObject.condition);
      if (!shouldShowQuestion) {
        // Skip this question and find the next one
        
        let fallbackNextId = null;
        
        // First, try to use the question's fallbackNext property
        if (nextQObject.fallbackNext) {
          fallbackNextId = nextQObject.fallbackNext;
        } else {
          // Try to get the next question from the skipped question
          fallbackNextId = getNextQuestionId(nextQObject, null);
          
          // If that also returns null, try to find the next question in sequence
          if (!fallbackNextId) {
            const currentIndex = props.surveyQuestions.findIndex(q => q.id === nextId);
            if (currentIndex !== -1 && currentIndex < props.surveyQuestions.length - 1) {
              fallbackNextId = props.surveyQuestions[currentIndex + 1].id;
            } else {
              // Final safety fallback - end the survey if we can't find the next question
              fallbackNextId = 'end';
            }
          }
        }
        
        nextId = fallbackNextId;
        continue;
      }
    }
    break; // Question should be shown or no condition
  }

  if (nextId === 'end') {
    await finishSurvey();
  } else if (nextId) {
    const nextQObject = findQuestionById(nextId);
    if (nextQObject) {
      currentQuestion.value = nextQObject;
      questionPath.value.push(nextQObject.id);
      freeTextAnswer.value = "";
      multipleChoiceSelections.value = [];
      selectedCommune.value = ""; 
      postalCodePrefix.value = ""; 
      stationInput.value = "";
      streetInput.value = "";
      selectedGareName.value = "";
      currentQuestionIndex.value = props.surveyQuestions.findIndex(q => q.id === nextQObject.id);
      
      // Scroll to top for new question after DOM updates, with a small delay to prevent conflicts
      nextTick(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 50);
      });
    } else {
      console.error(`CRITICAL ERROR: Next question with ID '${nextId}' not found.`);
      await finishSurvey();
    }
  } else {
    console.error("CRITICAL ERROR: No next question ID could be determined.");
    await finishSurvey();
  }
};

const previousQuestion = () => {
  if (!canGoBack.value) return;
  questionPath.value.pop();
  const previousQuestionIdStr = questionPath.value[questionPath.value.length - 1];
  
  const previousQObject = findQuestionById(previousQuestionIdStr);

  if (previousQObject) {
    currentQuestion.value = previousQObject;
    currentQuestionIndex.value = props.surveyQuestions.findIndex(q => q.id === previousQObject.id);
    freeTextAnswer.value = "";
    multipleChoiceSelections.value = [];
    selectedCommune.value = "";
    postalCodePrefix.value = "";
    stationInput.value = "";
    streetInput.value = "";
    selectedGareName.value = "";
    
    // Scroll to top when going back to previous question, with delay to prevent conflicts
    nextTick(() => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    });
  } else {
      console.error("Error going back: Could not find previous question ID in path or props:", previousQuestionIdStr);
  }
};

const finishSurvey = async () => {
  if (isFinishing.value) return;
  isFinishing.value = true;

  try {
    const capturedStartDate = startDate.value;
    const capturedAnswersData = JSON.parse(JSON.stringify(answers.value));
    const capturedEnqueteur = savedEnqueteur.value;
    let capturedPosteTravail = null;

    // First try to get from savedPosteTravailValue (session memory)
    if (props.posteTravailQuestionId && savedPosteTravailValue.value !== null) {
      capturedPosteTravail = savedPosteTravailValue.value;
    }
    
    // If not found in session, try to get from current answers
    if (!capturedPosteTravail && props.posteTravailQuestionId && capturedAnswersData.question_answers) {
      const posteAnswerObj = capturedAnswersData.question_answers.find(
        qa => qa.questionId === props.posteTravailQuestionId
      );
      if (posteAnswerObj) {
        capturedPosteTravail = posteAnswerObj.optionId;
      }
    }
    
    // If still not found, try direct property access
    if (!capturedPosteTravail && props.posteTravailQuestionId && capturedAnswersData[props.posteTravailQuestionId]) {
      capturedPosteTravail = capturedAnswersData[props.posteTravailQuestionId];
    }

    // Set completion state BEFORE attempting Firebase save
    isSurveyComplete.value = true;
    
    const now = new Date();
    let uniqueSurveyInstanceId = crypto.randomUUID();
    
    const surveyResult = {
      ID_questionnaire: uniqueSurveyInstanceId,
      firebase_timestamp: new Date().toISOString(),
      HEURE_DEBUT: capturedStartDate || "",
      DATE: now.toLocaleDateString("fr-FR").replace(/\//g, "-"),
      JOUR: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi",][now.getDay()],
      HEURE_FIN: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      ENQUETEUR: capturedEnqueteur,
    };
    
    // Add POSTE_TRAVAIL if available (legacy field for compatibility)
    if (capturedPosteTravail !== null) {
      surveyResult.POSTE_TRAVAIL = capturedPosteTravail;
    }

    // Sort answers by their position in the original surveyQuestions array
    const sortedAnswers = capturedAnswersData.question_answers ? 
      capturedAnswersData.question_answers.sort((a, b) => {
        const indexA = props.surveyQuestions.findIndex(q => q.id === a.questionId);
        const indexB = props.surveyQuestions.findIndex(q => q.id === b.questionId);
        return indexA - indexB;
      }) : [];

    // Add sorted answers to surveyResult
    sortedAnswers.forEach(qa => {
      surveyResult[qa.questionId] = qa.optionId;
    });

    // Ensure POSTE question ID is always saved (even if not explicitly answered in this session)
    if (props.posteTravailQuestionId && capturedPosteTravail !== null) {
      // Make sure the POSTE question ID is in the result (this ensures it appears in Excel)
      surveyResult[props.posteTravailQuestionId] = capturedPosteTravail;
    }

    try {
      // Try to save to Firebase
      await setDoc(doc(surveyCollectionRef.value, uniqueSurveyInstanceId), surveyResult);
      console.log("Survey saved to Firebase successfully");
      onlineSessionSaveCount.value++; // Increment the session counter
      showToast("Enquête enregistrée en ligne.", { duration: 3000, type: 'success', id: 'online-save-toast' });
      offlineSaveCount = 0; // Reset offline count on a successful online save
    } catch (firebaseError) {
      console.log("Firebase save failed (offline), data will be queued:", firebaseError);
      
      offlineSaveCount++;
      
      // Clear any existing timer to debounce
      if (offlineToastTimer) {
        clearTimeout(offlineToastTimer);
      }
      
      // Set a new timer
      offlineToastTimer = setTimeout(() => {
        showToast(
          `${offlineSaveCount} enquête(s) sauvegardée(s) hors ligne.`, 
          { duration: 5000, type: 'info', id: OFFLINE_TOAST_ID }
        );
        // Reset for the next batch
        offlineSaveCount = 0; 
      }, 500); // Debounce window of 500ms

      // Don't throw the error - the service worker will handle queueing
      // The survey completion should still proceed
    }
    
  } catch (error) {
    console.error("Error saving survey:", error);
    // Still mark as complete even if there's an error
    isSurveyComplete.value = true;
  } finally {
    // Always reset the finishing flag
    isFinishing.value = false;
  }
};

const resetSurvey = () => {
  // Force reset the finishing flag if it's stuck
  if (isFinishing.value) {
    console.warn("Reset requested while finishing. Forcing reset...");
    isFinishing.value = false;
  }
  
  // Set start time for the new survey
  const now = new Date();
  startDate.value = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  
  let firstQuestionIdToStart = null;
  const posteTravailQId = props.posteTravailQuestionId;

  // Clear previous answers 
  answers.value = { question_answers: [] };

  if (posteTravailQId && savedPosteTravailValue.value !== null && findQuestionById(posteTravailQId)) {
    // Record the remembered POSTE value in this new survey's answers
    if (props.rememberPosteTravail && savedPosteTravailValue.value !== null && savedPosteTravailText.value) {
        const posteQuestionForRecord = findQuestionById(posteTravailQId);
        if(posteQuestionForRecord) {
            recordAnswerToState(
                posteTravailQId,
                posteQuestionForRecord.text, 
                savedPosteTravailValue.value,
                savedPosteTravailText.value,
                savedPosteTravailOptionIndex.value !== -1 ? savedPosteTravailOptionIndex.value : undefined
            );
        }
    }
    const posteQuestion = findQuestionById(posteTravailQId);
    if (posteQuestion) {
        const matchedOption = posteQuestion.options 
            ? posteQuestion.options.find(opt => opt.id === savedPosteTravailValue.value)
            : null;
        firstQuestionIdToStart = getNextQuestionId(posteQuestion, matchedOption);
        if (!firstQuestionIdToStart || firstQuestionIdToStart === posteTravailQId) {
            const firstRegularQuestion = props.surveyQuestions.find(q => q.id !== posteTravailQId);
            if (firstRegularQuestion) {
                firstQuestionIdToStart = firstRegularQuestion.id;
            } else if (props.surveyQuestions && props.surveyQuestions.length > 0 && props.surveyQuestions[0].id === posteTravailQId && props.surveyQuestions.length > 1) {
                firstQuestionIdToStart = props.surveyQuestions[1].id;
            } else if (props.surveyQuestions && props.surveyQuestions.length > 0) {
                firstQuestionIdToStart = props.surveyQuestions[0].id;
            } else {
                firstQuestionIdToStart = null; 
            }
        }
    } else {
         firstQuestionIdToStart = (props.surveyQuestions && props.surveyQuestions.length > 0) ? props.surveyQuestions[0].id : null;
    }
  
    if (!props.rememberPosteTravail) {
        savedPosteTravailValue.value = null;
        savedPosteTravailText.value = "";
        savedPosteTravailOptionIndex.value = -1;
    }
  } else {
    // No POSTE question configured or no saved value, start from beginning
    if (props.surveyQuestions && props.surveyQuestions.length > 0) {
      firstQuestionIdToStart = props.surveyQuestions[0].id;
    }
  }

  freeTextAnswer.value = "";
  multipleChoiceSelections.value = [];
  isSurveyComplete.value = false;
  
  currentQuestion.value = findQuestionById(firstQuestionIdToStart);
  currentQuestionIndex.value = props.surveyQuestions.findIndex(q => q?.id === firstQuestionIdToStart);

  if (currentQuestion.value) {
    questionPath.value = [currentQuestion.value.id];
    currentStep.value = 'survey'; 
  } else if (firstQuestionIdToStart === 'end') {
    currentStep.value = 'survey';
    isSurveyComplete.value = true;
  } else {
    console.error("ResetSurvey: Could not determine the first question to restart.");
    currentStep.value = 'start'; 
  }
};

const getDocCount = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef.value);
    // docCount.value = querySnapshot.size; // This line is no longer needed
  } catch (error) {
    console.error("Error getting document count:", error);
  }
};

// getNextId function removed

onMounted(async () => {
  getDocCount();
  
  // Load all offline data on mount
  try {
    console.log('Loading offline data...');
    await loadAllData();
    console.log('Offline data loaded successfully');
  } catch (error) {
    console.error('Failed to load offline data:', error);
  }
  
  // console.log(`SurveyTemplate.vue mounted. Collection: ${props.firebaseCollectionName}, Questions: ${props.surveyQuestions?.length || 0}, Poste Question ID: ${props.posteTravailQuestionId || 'N/A'}`);
});

watch(stationInput, () => {
  filterStations(); 
});

watch(streetInput, () => {
  filterStreets();
});

const filterStations = () => {
  if (!stationInput.value) {
    filteredStations.value = [];
    return;
  }
  const inputLower = stationInput.value.toLowerCase();
  filteredStations.value = Array.isArray(props.stationsList) 
    ? props.stationsList.filter(station => station.toLowerCase().includes(inputLower))
    : [];
};

const selectStationFromList = (station) => {
  stationInput.value = station;
  filteredStations.value = [];
};

const filterStreets = async () => {
  if (!streetInput.value) {
    filteredStreets.value = [];
    return;
  }
  
  try {
    // Use offline-first search
    filteredStreets.value = await searchStreets(streetInput.value, 100);
  } catch (error) {
    console.error('Error filtering streets:', error);
    // Fallback to props if available
    const inputLower = streetInput.value.toLowerCase();
    filteredStreets.value = Array.isArray(props.streetsList)
      ? props.streetsList.filter(street => street.toLowerCase().includes(inputLower))
      : [];
  }
};

const selectStreetFromList = (street) => {
  streetInput.value = street;
  filteredStreets.value = [];
};

const handleImageError = (event) => {
  console.warn('Failed to load question image:', event.target.src);
  event.target.style.display = 'none';
};

// Image Zoom Methods
const openImageZoom = () => {
  showImageZoom.value = true;
  resetZoom();
};

const closeImageZoom = () => {
  showImageZoom.value = false;
  resetZoom();
};

const resetZoom = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
  isDragging.value = false;
};

const constrainPan = () => {
  if (!zoomWrapper.value || !zoomImage.value) return;
  
  const wrapper = zoomWrapper.value;
  const image = zoomImage.value;
  
  const wrapperRect = wrapper.getBoundingClientRect();
  const imageRect = image.getBoundingClientRect();
  
  const maxPanX = Math.max(0, (imageRect.width - wrapperRect.width) / 2);
  const maxPanY = Math.max(0, (imageRect.height - wrapperRect.height) / 2);
  
  panX.value = Math.max(-maxPanX, Math.min(maxPanX, panX.value));
  panY.value = Math.max(-maxPanY, Math.min(maxPanY, panY.value));
};

const handleImageLoad = () => {
  // Reset zoom when image loads
  resetZoom();
};

// Touch and Mouse Event Handlers
const handleTouchStart = (event) => {
  event.preventDefault();
  
  if (event.touches.length === 1) {
    // Single touch - start dragging
    isDragging.value = true;
    lastTouchX.value = event.touches[0].clientX;
    lastTouchY.value = event.touches[0].clientY;
  } else if (event.touches.length === 2) {
    // Two fingers - start pinch zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    lastTouchDistance.value = distance;
    isDragging.value = false;
  }
};

const handleTouchMove = (event) => {
  event.preventDefault();
  
  if (event.touches.length === 1 && isDragging.value) {
    // Single touch - pan the image
    const deltaX = event.touches[0].clientX - lastTouchX.value;
    const deltaY = event.touches[0].clientY - lastTouchY.value;
    
    panX.value += deltaX;
    panY.value += deltaY;
    
    lastTouchX.value = event.touches[0].clientX;
    lastTouchY.value = event.touches[0].clientY;
    
    constrainPan();
  } else if (event.touches.length === 2) {
    // Two fingers - pinch zoom
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    if (lastTouchDistance.value > 0) {
      const scale = distance / lastTouchDistance.value;
      const newZoom = Math.max(0.5, Math.min(4, zoomLevel.value * scale));
      zoomLevel.value = newZoom;
      constrainPan();
    }
    
    lastTouchDistance.value = distance;
  }
};

const handleTouchEnd = (event) => {
  event.preventDefault();
  isDragging.value = false;
  lastTouchDistance.value = 0;
};

const handleWheel = (event) => {
  event.preventDefault();
  
  const delta = event.deltaY > 0 ? 0.9 : 1.1;
  const newZoom = Math.max(0.5, Math.min(4, zoomLevel.value * delta));
  zoomLevel.value = newZoom;
  constrainPan();
};

const findQuestionById = (id) => {
  if (!id || !props.surveyQuestions) return null;
  return props.surveyQuestions.find((q) => String(q.id) === String(id));
};

const getAnswerById = (questionId) => {
  if (!answers.value || !answers.value.question_answers) return undefined;
  const constAnswer = answers.value.question_answers.find(
    (qa) => String(qa.questionId) === String(questionId)
  );
  return constAnswer;
};

const getNextQuestionId = (currentQ, selectedOption = null) => {
  if (!currentQ) {
    return null;
  }

  if (selectedOption && selectedOption.next) {
    return selectedOption.next;
  }

  if (currentQ.conditionalNext) {
    const conditionalNextBlocks = Array.isArray(currentQ.conditionalNext)
      ? currentQ.conditionalNext
      : [currentQ.conditionalNext];

    for (const block of conditionalNextBlocks) {
      const conditionQuestionId = block.condition;
      const conditionAnswer = getAnswerById(conditionQuestionId);

      if (conditionAnswer !== undefined && conditionAnswer !== null) {
        for (const route of block.routes) {
          let primaryConditionMet = false;
          if (conditionAnswer.optionId === route.value || 
              (Array.isArray(conditionAnswer.optionId) && conditionAnswer.optionId.includes(route.value)) ||
              conditionAnswer.answer === route.value 
             ) {
            primaryConditionMet = true;
          }
          
          if (primaryConditionMet) {
            if (route.condition2) {
              const condition2QuestionId = route.condition2;
              const condition2Answer = getAnswerById(condition2QuestionId);
              if (condition2Answer !== undefined && condition2Answer !== null) {
                for (const route2 of route.routes2) {
                  if (condition2Answer.optionId === route2.value ||
                      (Array.isArray(condition2Answer.optionId) && condition2Answer.optionId.includes(route2.value)) ||
                      condition2Answer.answer === route2.value
                     ) {
                    if (route2.next === null) continue;
                    return route2.next;
                  }
                }
              }
              continue;
            }
            if (route.next === null) continue;
            return route.next;
          }
        }
      }
    }
  }

  if (currentQ.next) {
    return currentQ.next;
  }

  const currentIndex = props.surveyQuestions.findIndex(q => q.id === currentQ.id);
  if (currentIndex === props.surveyQuestions.length - 1 && !currentQ.next && !currentQ.conditionalNext) {
      return 'end';
  }
  
  return null;
};

// NEW: Function to evaluate condition strings like "VELO == 1 AND (S2 == 3 OR S3 == 3)"
const evaluateCondition = (conditionString) => {
  try {
    // Replace question IDs with their actual values
    let processedCondition = conditionString;
    
    // Find all question references in the condition (e.g., VELO, S2, S3)
    // Exclude logical operators AND, OR, NOT
    const questionRefs = conditionString.match(/\b(?!AND|OR|NOT)[A-Z][A-Z0-9_]*\b/g) || [];
    
    for (const questionRef of questionRefs) {
      const answer = getAnswerById(questionRef);
      let value = -1; // Default to -1 for unanswered questions
      
      if (answer) {
        // Use the option ID (numeric value) for comparisons
        if (typeof answer.optionId === 'number') {
          value = answer.optionId;
        } else if (Array.isArray(answer.optionId)) {
          // For multiple choice, we'll need special handling
          value = answer.optionId;
        } else {
          // For free text answers, use the actual text
          value = `'${answer.answer}'`;
        }
      }
      
      // Replace the question reference with the actual value
      processedCondition = processedCondition.replace(new RegExp(`\\b${questionRef}\\b`, 'g'), value);
    }
    
    // Replace logical operators to JavaScript equivalents
    processedCondition = processedCondition
      .replace(/\bAND\b/g, '&&')
      .replace(/\bOR\b/g, '||')
      .replace(/\bNOT\b/g, '!');
    
    // Evaluate the condition
    const result = Function(`"use strict"; return (${processedCondition})`)();
    return result;
  } catch (error) {
    console.error('Error evaluating condition:', conditionString, error);
    return true; // Default to showing the question if there's an error
  }
};

</script>

<style>
/* Remove all old styles and replace with this */
.app-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content-container {
  width: 100%;
  max-width: 500px; /* Optimal width for forms on larger screens */
  margin: 0 auto;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* Add this for horizontal centering */
  flex: 1;
}

.question-container {
  width: 100%;
}

.question-container h2 {
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
}

.start-survey-container,
.enqueteur-content,
.survey-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center; /* Add this */
  flex-grow: 1; /* Add this */
}

.enqueteur-content h2,
.start-survey-container h2,
.survey-complete h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.survey-question-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
}

.logo {
  max-width: 120px;
  height: auto;
  margin-top: 2rem;
}

.logo-center {
  max-width: 100px;
  margin: 1rem 0 1.5rem 0;
}

/* --- Form & Button Styles --- */

.form-control {
  display: block;
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  color: var(--primary-text);
  background-color: var(--input-bg);
  border: 1px solid var(--button-bg);
  border-radius: var(--border-radius-md);
  box-sizing: border-box;
  margin-bottom: 1rem;
  transition: all 0.2s ease-in-out;
}

.form-control::placeholder {
  color: var(--text-light);
  opacity: 0.7;
}

.form-control:focus {
  outline: none;
  border-color: var(--secondary-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.btn-next,
.btn-option,
.btn-return {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  margin-top: 0.75rem;
}

.btn-next {
  background-color: var(--primary-accent);
  color: var(--primary-text);
  border-color: var(--primary-accent);
}
.btn-next:hover {
  filter: brightness(1.1);
}
.btn-next:disabled {
  background-color: var(--button-bg);
  border-color: var(--button-bg);
  color: var(--text-light);
  cursor: not-allowed;
  filter: none;
}

.btn-option {
  background-color: var(--button-bg);
  color: var(--text-light);
  border-color: rgba(255, 255, 255, 0.2);
}
.btn-option:hover {
  background-color: var(--button-hover-bg);
  color: var(--primary-text);
}

.btn-return {
  background-color: transparent;
  color: var(--text-light);
  text-decoration: underline;
}
.btn-return:hover {
  color: var(--primary-text);
}

.checkbox-label {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.9rem 1rem;
  margin-bottom: 0.75rem;
  background-color: var(--button-bg);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.checkbox-label:hover {
  background-color: var(--button-hover-bg);
  color: var(--primary-text);
}
.checkbox-input {
  width: 1.25em;
  height: 1.25em;
  margin-right: 0.75rem;
  accent-color: var(--secondary-accent);
}

/* --- Original Plan/Image Zoom Styles --- */
.question-image-container {
  margin: 20px 0;
  text-align: center;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.question-image {
  max-width: 100%;
  max-height: 60vh;
  height: auto;
  width: auto;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.question-image:hover {
  transform: scale(1.02);
}

.zoom-hint {
  position: absolute;
  bottom: 8px;
  right: 8px;
  pointer-events: none;
  z-index: 10;
}

.zoom-icon {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  position: relative;
  opacity: 0.9;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
}

.zoom-icon::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 2px;
  background: white;
  border-radius: 1px;
  bottom: -4px;
  right: -4px;
  transform: rotate(45deg);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.image-zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.image-zoom-container {
  position: relative;
  width: 95%;
  height: 95%;
  max-width: 1200px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-zoom {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.2s ease;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.close-zoom:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.zoom-image-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 0 16px 16px;
}

.zoom-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@media screen and (min-width: 768px) and (max-width: 1024px) {
  .question-image { max-height: 50vh; }
  .question-image-container { margin: 15px 0; }
  .close-zoom { width: 52px; height: 52px; }
  .zoom-hint { bottom: 6px; right: 6px; }
  .zoom-icon { width: 18px; height: 18px; }
  .zoom-icon::after { width: 5px; height: 2px; bottom: -3px; right: -3px; }
  .image-zoom-container { width: 98%; height: 98%; }
}

@media screen and (max-width: 767px) {
  .question-image { max-height: 40vh; }
  .question-image-container { margin: 10px 0; border-radius: 5px; }
  .close-zoom { top: 12px; right: 12px; width: 40px; height: 40px; }
  .zoom-hint { bottom: 4px; right: 4px; }
  .zoom-icon { width: 16px; height: 16px; }
  .zoom-icon::after { width: 4px; height: 1.5px; bottom: -2px; right: -2px; }
}

@media (pointer: coarse) {
  .question-image { cursor: pointer; }
  .zoom-image { cursor: grab; }
  .zoom-image:active { cursor: grabbing; }
  .close-zoom { min-width: 48px; min-height: 48px; }
  .image-zoom-modal * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
  .zoom-image-wrapper { -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
}
/* --- End of Zoom Styles --- */

.session-counter {
  margin: 1.5rem 0;
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  text-align: center;
  color: var(--text-light);
}

/* --- Autocomplete Styles --- */
.input-container {
  position: relative;
}

.autocomplete-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: var(--card-bg);
  border: 1px solid var(--button-bg);
  border-radius: var(--border-radius-md);
  list-style-type: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.autocomplete-results li {
  padding: 0.9rem 1rem;
  color: var(--text-light);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  border-bottom: 1px solid var(--button-bg);
}

.autocomplete-results li:last-child {
  border-bottom: none;
}

.autocomplete-results li:hover {
  background-color: var(--secondary-accent);
  color: var(--primary-text);
}

/* Remove any remaining old styles */
</style>