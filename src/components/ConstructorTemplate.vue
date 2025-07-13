<template>
  <SurveyTemplate 
    :survey-questions="currentSurveyQuestions"
    :firebase-collection-name="props.firebaseCollectionOverride"
    poste-travail-question-id="YOUR_WORK_STATION_QUESTION_ID"
    :survey-title="surveyDisplayTitle"
    :welcome-message="customWelcomeMessage"
    logo-src="../assets/YOUR_LOGO.webp"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SurveyTemplate from './SurveyTemplate.vue';

// 🎯 STEP 1: Import your survey questions
// Replace 'exampleSurveyQuestions' with your own survey questions file
import { exampleSurveyQuestions } from './exampleSurveyQuestions.js';

// Props from App.vue (don't modify this)
const props = defineProps({
  firebaseCollectionOverride: {
    type: String,
    required: true
  }
});

// 🎯 STEP 2: Customize your survey configuration
const pageTitle = ref('Transportation Survey'); // Browser tab title
const surveyDisplayTitle = ref('Transportation Survey - Example Organization'); // Title shown in app
const customWelcomeMessage = ref(`
  <strong>Welcome to our Transportation Survey!</strong><br><br>
  
  Hello! We are conducting a short survey (about 5 minutes) to understand transportation habits and preferences.<br><br>
  
  Your responses are completely anonymous and will help us improve transportation services in your area.<br><br>
  
  <em>Would you like to participate?</em>
`); // HTML welcome message

// 🎯 STEP 3: Set your survey questions
// Replace 'exampleSurveyQuestions' with your imported questions
const currentSurveyQuestions = exampleSurveyQuestions;

onMounted(() => {
  document.title = pageTitle.value;
});
</script>

<style scoped>
/* Add any survey-specific styles here if needed */
</style>

<!-- 
🚀 HOW TO USE THIS TEMPLATE:

1. 📝 Create your survey questions file (e.g., mySurveyQuestions.js)
2. 🔧 Replace the import at the top with your questions file
3. 🎨 Customize the titles and welcome message
4. 🏢 Set poste-travail-question-id if you have a work station question
5. 🖼️ Replace logo path with your own logo
6. 💾 Save this file as Constructor.vue (replacing the old one)

EXAMPLE CONFIGURATION:

For a customer satisfaction survey:
- pageTitle: 'Customer Satisfaction Survey'
- surveyDisplayTitle: 'Customer Satisfaction - ACME Corp'
- poste-travail-question-id: 'STORE_LOCATION' (if asking about store)
- logo-src: '../assets/acme-logo.png'

For an event feedback survey:
- pageTitle: 'Event Feedback'
- surveyDisplayTitle: 'Event Feedback - Music Festival 2024'
- poste-travail-question-id: null (if no work station question)
- logo-src: '../assets/festival-logo.png'

🎯 QUICK CHECKLIST:
- [ ] Created your survey questions file
- [ ] Updated the import statement
- [ ] Customized pageTitle, surveyDisplayTitle, customWelcomeMessage
- [ ] Set poste-travail-question-id (or removed if not needed)
- [ ] Updated logo path
- [ ] Renamed file to Constructor.vue
--> 