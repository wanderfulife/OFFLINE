git a# 🚀 Survey Template System

This is a complete survey application template built with Vue.js, Firebase, and a powerful admin dashboard. You can create new surveys by simply changing two files!

## 📋 What's Included

- **Complete Survey Engine** - Handles all question types (single choice, multiple choice, free text, commune selector, etc.)
- **Admin Dashboard** - Login, view responses, export to Excel
- **Mobile-Optimized** - Perfect for field surveys on phones/tablets
- **Firebase Integration** - Automatic data storage and export
- **Smart Navigation** - Conditional questions, question skipping, progress tracking

## 🎯 How to Create a New Survey

### Step 1: Configure Your Survey (Constructor.vue)

Edit `src/components/Constructor.vue`:

```vue
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
import { yourSurveyQuestions } from './yourSurveyQuestions.js';

const props = defineProps({
  firebaseCollectionOverride: {
    type: String,
    required: true
  }
});

// 🎨 Customize these for your survey
const pageTitle = ref('Your Survey Title');
const surveyDisplayTitle = ref('Your Survey - Organization');
const customWelcomeMessage = ref('Your welcome message here.<br>HTML is supported!');

const currentSurveyQuestions = yourSurveyQuestions;

onMounted(() => {
  document.title = pageTitle.value;
});
</script>
```

### Step 2: Create Your Questions (yourSurveyQuestions.js)

Create `src/components/yourSurveyQuestions.js`:

```javascript
export const yourSurveyQuestions = [
  {
    id: "Q1",
    text: "What is your age?",
    type: 'singleChoice',
    options: [
      { id: 1, text: "18-24", next: "Q2" },
      { id: 2, text: "25-34", next: "Q2" },
      { id: 3, text: "35-49", next: "Q2" },
      { id: 4, text: "50+", next: "Q2" }
    ]
  },
  {
    id: "Q2",
    text: "What are your interests?",
    type: 'multipleChoice',
    options: [
      { id: 1, text: "Sports" },
      { id: 2, text: "Music" },
      { id: 3, text: "Travel" },
      { id: 4, text: "Other", next_if_selected: "Q2_PRECISION" }
    ],
    next: "Q3"
  },
  {
    id: "Q2_PRECISION",
    text: "Please specify your other interests:",
    type: 'freeText',
    freeTextPlaceholder: "Type here...",
    next: "Q3"
  },
  {
    id: "Q3",
    text: "Any additional comments?",
    type: 'freeText',
    freeTextPlaceholder: "Optional comments...",
    next: "end"
  }
];
```

### Step 3: Configure Firebase Collection (App.vue)

Edit `src/App.vue` to change the Firebase collection name:

```javascript
const masterFirebaseCollectionName = ref("YourSurveyCollection2024");
```

## 📊 Question Types Available

### 1. Single Choice
```javascript
{
  id: "Q1",
  text: "Choose one option:",
  type: 'singleChoice',
  options: [
    { id: 1, text: "Option A", next: "Q2" },
    { id: 2, text: "Option B", next: "Q3" }
  ]
}
```

### 2. Multiple Choice
```javascript
{
  id: "Q2",
  text: "Select all that apply:",
  type: 'multipleChoice',
  options: [
    { id: 1, text: "Option 1" },
    { id: 2, text: "Option 2" },
    { id: 3, text: "Other", next_if_selected: "Q2_PRECISION" }
  ],
  next: "Q3"
}
```

### 3. Free Text
```javascript
{
  id: "Q3",
  text: "Please explain:",
  type: 'freeText',
  freeTextPlaceholder: "Your answer...",
  validation: "numeric", // optional: for numbers only
  next: "Q4"
}
```

### 4. Commune Selector (French municipalities)
```javascript
{
  id: "Q4",
  text: "Select your municipality:",
  type: 'commune',
  next: "Q5"
}
```

### 5. Station/Street Selector
```javascript
{
  id: "Q5",
  text: "Enter a station name:",
  type: 'station', // or 'street'
  next: "Q6"
}
```

### 6. Train Station Selector
```javascript
{
  id: "Q6",
  text: "Select your train station:",
  type: 'gare',
  next: "end"
}
```

## 🔀 Advanced Features

### Conditional Questions
```javascript
{
  id: "Q7",
  text: "This question only shows if Q1 answer was option 1",
  type: 'singleChoice',
  condition: "Q1 == 1", // Only show if Q1 answer was option 1
  options: [
    { id: 1, text: "Yes", next: "Q8" },
    { id: 2, text: "No", next: "end" }
  ],
  fallbackNext: "Q9" // Where to go if condition not met
}
```

### Conditional Text
```javascript
{
  id: "Q8",
  text: "Default question text",
  type: 'singleChoice',
  conditionalText: {
    condition: "Q1", // Based on Q1 answer
    routes: [
      { value: 1, text: "Special text for option 1" },
      { value: 2, text: "Special text for option 2" }
    ]
  },
  options: [...]
}
```

### Complex Routing
```javascript
{
  id: "Q9",
  text: "Question with complex routing",
  type: 'singleChoice',
  options: [
    { id: 1, text: "Option 1", next: "Q10" }
  ],
  conditionalNext: [
    {
      condition: "Q1", // Based on Q1
      routes: [
        { value: 1, next: "Q11" }, // If Q1 was 1, go to Q11
        { value: 2, next: "Q12" }  // If Q1 was 2, go to Q12
      ]
    }
  ]
}
```

## 🎯 Comprehensive Survey Example

We've created a complete survey template that demonstrates **EVERY SINGLE FEATURE** implemented in the system. This comprehensive example includes:

**File: `src/components/comprehensiveSurveyQuestions.js`**

### 📋 All Question Types Demonstrated:
- ✅ **singleChoice** - Basic single selection questions
- ✅ **multipleChoice** - Multiple selection with various options  
- ✅ **freeText** - Text input with and without validation
- ✅ **commune** - French municipality selector
- ✅ **station** - Station/transport stop selector
- ✅ **street** - Street name selector
- ✅ **gare** - Train station selector

### 🔀 All Conditional Logic Demonstrated:
- ✅ **condition** - Show questions only if conditions are met
- ✅ **conditionalText** - Change question text based on previous answers
- ✅ **conditionalNext** - Route to different questions based on previous answers
- ✅ **next_if_selected** - Go to precision questions if specific options selected
- ✅ **fallbackNext** - Where to go if conditions aren't met
- ✅ **Survey termination** - End survey early for certain responses

### 🧠 All Advanced Features Demonstrated:
- ✅ **Complex AND/OR conditions** (`"AGE >= 2 AND AGE <= 3"`)
- ✅ **Nested conditional routing** with multiple criteria
- ✅ **Work station question integration** (poste-travail-question-id)
- ✅ **Numeric validation** for postal codes and numbers
- ✅ **Multiple precision questions** for "Other" options
- ✅ **Dynamic question text** based on survey context
- ✅ **Comprehensive demographic collection**
- ✅ **Multi-path survey flow** with rejoining

### 📊 Survey Flow Complexity:
The comprehensive survey includes:
- **40+ questions** with smart conditional logic
- **20+ different possible paths** through the survey
- **Age-based routing** (minors, students, workers, retirees)
- **Employment-based conditional questions**
- **Transport mode specific deep dives**
- **Satisfaction-based improvement gathering**
- **Demographic collection with privacy options**
- **Optional contact information collection**

**🎯 Use Cases:**
This comprehensive survey demonstrates how to build complex, professional surveys for:
- **Market Research** - With demographic segmentation
- **Transportation Studies** - With mode-specific questions
- **Employee Surveys** - With job role routing
- **Customer Satisfaction** - With improvement tracking
- **Academic Research** - With conditional consent flows

The comprehensive survey serves as both a **reference implementation** and a **testing tool** to validate all features work correctly together.

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
Edit `src/firebaseConfig.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-bucket.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🔐 Admin Features

- **Password**: `admin123` (change in `AdminDashboard.vue`)
- **View survey statistics**
- **Export data to Excel**
- **Real-time response tracking**

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly buttons and inputs
- Proper keyboard handling on mobile
- No zoom issues on iOS devices

## 🎨 Customization

### Colors and Styling
Edit the CSS in `src/App.vue` and component files to match your brand.

### Logo
Replace `src/assets/Alycelogo.webp` with your own logo.

### Welcome Message
Supports HTML formatting for rich text and styling.

## 📦 File Structure

```
src/
├── components/
│   ├── SurveyTemplate.vue           # Core survey engine (don't modify)
│   ├── AdminDashboard.vue           # Admin panel (don't modify)
│   ├── Constructor.vue              # 🎯 MODIFY THIS - Survey config
│   ├── yourSurveyQuestions.js       # 🎯 MODIFY THIS - Your questions
│   ├── exampleSurveyQuestions.js    # 📋 SIMPLE EXAMPLE - Basic survey
│   ├── comprehensiveSurveyQuestions.js # 🎯 COMPREHENSIVE EXAMPLE - All features
│   ├── CommuneSelector.vue          # French municipality selector
│   └── GareSelector.vue             # Train station selector
├── App.vue                          # 🎯 MODIFY THIS - Collection name
└── firebaseConfig.js                # 🎯 MODIFY THIS - Firebase config
```

## 🚀 Quick Start Checklist

- [ ] Copy this template to a new folder
- [ ] Edit `Constructor.vue` with your survey title and welcome message
- [ ] Create your `yourSurveyQuestions.js` file (or copy from examples)
- [ ] Update Firebase collection name in `App.vue`
- [ ] Configure Firebase credentials in `firebaseConfig.js`
- [ ] Replace logo in `assets/` folder
- [ ] Run `npm install` and `npm run dev`
- [ ] Test your survey!

## 🆘 Need Help?

This template includes three example files:
- **`exampleSurveyQuestions.js`** - Simple survey for beginners
- **`comprehensiveSurveyQuestions.js`** - Advanced survey showing all features
- **`idfMobilitesCycleSurveyQuestions.js`** - Real-world complex survey example

Choose the one that best matches your needs as a starting point!

Happy surveying! 🎉 