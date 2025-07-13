<script setup>
import { ref } from 'vue';
import Constructor from './components/Constructor.vue';
import AdminDashboard from './components/AdminDashboard.vue';

// Define the master Firebase collection name here
const masterFirebaseCollectionName = ref("Offline");
</script>

<template>
  <div id="app-container">
    <div class="survey-content-area">
      <Constructor :firebase-collection-override="masterFirebaseCollectionName" />
    </div>
    <div class="admin-section">
      <AdminDashboard :active-firebase-collection-name="masterFirebaseCollectionName" />
    </div>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background-color: #2a3b63; /* Consistent background */
  color: white;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Full viewport height */
}

.survey-content-area {
  flex-grow: 1; /* Takes up all available space, pushing footer down */
  display: flex;
  flex-direction: column; /* So SurveyTemplate can fill its height */
  /* justify-content: center; Align to top for survey form */
  /* align-items: flex-start; */ 
}

.admin-section {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2a3b63; /* Same as main background */
  padding: 20px 0; /* Some padding for spacing */
  margin: 0;
  border: none;
}

/* Reset/override specific styles for AdminDashboard's button if needed */
.btn-signin {
  /* Styles from AdminDashboard.vue might be fine, or adjust here */
  /* e.g., margin: 0; to ensure it's centered by flex container */
   margin-bottom: 0; /* Remove default margin if any from component */
}
</style>
