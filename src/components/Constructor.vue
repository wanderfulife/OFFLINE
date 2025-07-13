<template>
  <SurveyTemplate 
    :survey-questions="currentSurveyQuestions"
    :firebase-collection-name="props.firebaseCollectionOverride"
    :poste-travail-question-id="posteTravailQuestionId"
    :welcome-message="customWelcomeMessage"
    logo-src="../assets/YOUR_LOGO.webp"
    :streets-list="allStreets"
  />
</template>
<script setup>
import { onMounted, ref } from 'vue';
import SurveyTemplate from './SurveyTemplate.vue';

// 🎯 STEP 1: Import your survey questions
// Replace 'exampleSurveyQuestions' with your own survey questions file
import { templateSurveyQuestions } from './surveyQuestions.js';

// Props from App.vue (don't modify this)
const props = defineProps({
  firebaseCollectionOverride: {
    type: String,
    required: true
  }
});

// 🎯 STEP 2: Customize your survey configuration
const pageTitle = ref('Offline'); // Browser tab title
// Ensure posteTravailQuestionId is defined for the template
const posteTravailQuestionId = null; // 🎯 Change this if your work station question has a different ID
const customWelcomeMessage = ref(`
Offline Survey
`); // HTML welcome message

// 🎯 STEP 3: Set your survey questions
// Replace 'exampleSurveyQuestions' with your imported questions
const currentSurveyQuestions = ref(templateSurveyQuestions);

// 🎯 STEP 4: Add Street Data (New Step)
const allStreets = ref([]); // Holds the street data

onMounted(async () => {
  document.title = pageTitle.value;

  // Fetch street data
  try {
    const response = await fetch('/streets.json'); // Path relative to public directory
    if (response.ok) {
      allStreets.value = await response.json();
      console.log("Streets loaded:", allStreets.value.length); // For debugging
    } else {
      console.error('Error loading streets.json: Response not OK', response.status);
      allStreets.value = []; // Ensure it's an empty array on failure
    }
  } catch (error) {
    console.error('Error fetching streets.json:', error);
    allStreets.value = []; // Ensure it's an empty array on error
  }
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
4. 🏢 Set posteTravailQuestionId if you have a work station question
5. 🖼️ Replace logo path with your own logo
6. 💾 Save this file as Constructor.vue (replacing the old one)

EXAMPLE CONFIGURATION:

For a customer satisfaction survey:
- pageTitle: 'Customer Satisfaction Survey'
- posteTravailQuestionId: 'STORE_LOCATION' (if asking about store location)
- logo-src: '../assets/acme-logo.png'

For an event feedback survey:
- pageTitle: 'Event Feedback'
- posteTravailQuestionId: null (if no work station question)
- logo-src: '../assets/festival-logo.png'

🎯 QUICK CHECKLIST:
- [ ] Created your survey questions file
- [ ] Updated the import statement
- [ ] Customized pageTitle, customWelcomeMessage
- [ ] Set posteTravailQuestionId to match your work station question ID
- [ ] Updated logo path
- [ ] Renamed file to Constructor.vue

📋 WORK STATION QUESTION:
The posteTravailQuestionId should match the "id" field of your work station question in your survey questions file.
This ensures the Excel export shows "POSTE" instead of duplicating the question ID.
--> 