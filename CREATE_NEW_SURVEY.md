# 🚀 Quick Start: Create New Survey in 5 Minutes

Follow these simple steps to create your own survey from this template:

## Step 1: Copy Template Files (2 minutes)

### A. Create your questions file
1. Copy `src/components/exampleSurveyQuestions.js`
2. Rename it to `src/components/yourSurveyQuestions.js`
3. Edit the questions to match your survey needs

### B. Configure Constructor
1. Copy `src/components/ConstructorTemplate.vue`
2. Rename it to `src/components/Constructor.vue` (replace existing)
3. Update the import and configuration

### C. Configure App
1. Copy `src/AppTemplate.vue`  
2. Rename it to `src/App.vue` (replace existing)
3. Set your Firebase collection name

## Step 2: Basic Configuration (1 minute)

Edit your new `Constructor.vue`:

```javascript
// Change these 3 lines:
import { yourSurveyQuestions } from './yourSurveyQuestions.js';
const pageTitle = ref('Your Survey Title');
const surveyDisplayTitle = ref('Your Survey - Your Organization');
```

Edit your new `App.vue`:

```javascript
// Change this 1 line:
const masterFirebaseCollectionName = ref("YourSurveyName2024");
```

## Step 3: Test Your Survey (2 minutes)

```bash
npm run dev
```

Visit the local URL and test your survey!

## ✅ Complete Example: Customer Satisfaction Survey

### File: `customerSurveyQuestions.js`
```javascript
export const customerSurveyQuestions = [
  {
    id: "RATING",
    text: "How would you rate our service?",
    type: 'singleChoice',
    options: [
      { id: 1, text: "Excellent", next: "RECOMMEND" },
      { id: 2, text: "Good", next: "RECOMMEND" },
      { id: 3, text: "Average", next: "IMPROVE" },
      { id: 4, text: "Poor", next: "IMPROVE" },
      { id: 5, text: "Very Poor", next: "IMPROVE" }
    ]
  },
  {
    id: "RECOMMEND",
    text: "Would you recommend us to others?",
    type: 'singleChoice',
    options: [
      { id: 1, text: "Definitely", next: "COMMENTS" },
      { id: 2, text: "Probably", next: "COMMENTS" },
      { id: 3, text: "Maybe", next: "COMMENTS" },
      { id: 4, text: "Unlikely", next: "IMPROVE" },
      { id: 5, text: "Never", next: "IMPROVE" }
    ]
  },
  {
    id: "IMPROVE",
    text: "What could we improve?",
    type: 'freeText',
    freeTextPlaceholder: "Tell us how we can do better...",
    next: "COMMENTS"
  },
  {
    id: "COMMENTS",
    text: "Any other feedback?",
    type: 'freeText',
    freeTextPlaceholder: "Optional additional comments...",
    next: "end"
  }
];
```

### File: `Constructor.vue`
```javascript
import { customerSurveyQuestions } from './customerSurveyQuestions.js';

const pageTitle = ref('Customer Satisfaction Survey');
const surveyDisplayTitle = ref('Customer Satisfaction - ACME Corp');
const customWelcomeMessage = ref('Help us improve by sharing your experience!');
const currentSurveyQuestions = customerSurveyQuestions;
```

### File: `App.vue`
```javascript
const masterFirebaseCollectionName = ref("CustomerSatisfaction2024");
```

## 🎯 That's it! Your survey is ready!

Your new survey will have:
- ✅ Professional mobile-responsive design
- ✅ Admin dashboard with login
- ✅ Excel export functionality  
- ✅ Real-time data storage in Firebase
- ✅ Progress tracking and smart navigation

## 🔧 Advanced Customization

### Add your logo
Replace `src/assets/Alycelogo.webp` with your logo and update the path in Constructor.vue

### Change colors
Edit the CSS in App.vue to match your brand colors

### Modify admin password
Change `admin123` in `AdminDashboard.vue` line ~75

### Add more question types
See the full documentation in `SURVEY_TEMPLATE_README.md` for all available question types and advanced features.

---

🎉 **You now have a complete survey application!** Deploy it to any web hosting service or use it locally for field surveys. 