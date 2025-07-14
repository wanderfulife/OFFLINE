<template>
  <div class="admin-dashboard-root">
    <button class="btn-signin" @click="showSignInModal = true">
      Admin
      <div class="connection-status" :class="{ 'online': isOnline, 'offline': !isOnline }">
        <div class="status-dot"></div>
        <span v-if="syncStatus.pendingCount > 0" class="pending-badge">{{ syncStatus.pendingCount }}</span>
      </div>
    </button>

    <!-- Sign In Modal -->
    <div v-if="showSignInModal" class="modal">
      <div class="modal-content signin-modal">
        <button class="close" @click="showSignInModal = false">&times;</button>
        <h2>Connexion Admin</h2>
        <input
          v-model="password"
          type="password"
          placeholder="Entrez le mot de passe"
          @keyup.enter="signIn"
          class="form-control"
        />
        <button @click="signIn" class="btn-next">Se connecter</button>
      </div>
    </div>

    <!-- Admin Dashboard Modal -->
    <div v-if="showAdminDashboard" class="admin-modal modal">
      <div class="modal-content">
        <div class="modal-header">
          <img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
          <h2>Tableau de Bord Admin</h2>
          <button class="close" @click="showAdminDashboard = false">&times;</button>
        </div>

        <div class="dashboard-content">
          <div class="dashboard-card total-card">
            <h3>Total des Enquêtes</h3>
            <p class="total-count">{{ totalSurveys }}</p>
          </div>

          <div class="dashboard-card surveyors-card">
            <h3>Enquêtes par Enquêteur</h3>
            <ul class="enqueteur-list">
              <li v-for="(count, name) in surveysByEnqueteur" :key="name">
                <span>{{ name }}</span>
                <span class="count">{{ count }}</span>
              </li>
               <div v-if="Object.keys(surveysByEnqueteur).length === 0" class="empty-state">
                Aucune enquête à afficher.
              </div>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="downloadData" class="btn-download">
            Télécharger les Données
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as XLSX from "xlsx";
import { templateSurveyQuestions as surveyQuestions } from "./surveyQuestions.js";
import { useOfflineStatus } from "../composables/useOfflineStatus.js";

const props = defineProps({
  activeFirebaseCollectionName: {
    type: String,
    required: true,
  },
});

const showSignInModal = ref(false);
const showAdminDashboard = ref(false);
const password = ref("");
const surveysByEnqueteur = ref({});
const totalSurveys = ref(0);

// Use offline status composable for connection indicator
const { isOnline, syncStatus } = useOfflineStatus();

const surveyCollectionRef = collection(db, props.activeFirebaseCollectionName);

const signIn = () => {
  if (password.value === "admin123") {
    showSignInModal.value = false;
    fetchAdminData();
    showAdminDashboard.value = true;
  } else {
    alert("Mot de passe incorrect");
  }
};

const fetchAdminData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);
    const surveys = querySnapshot.docs.map((doc) => doc.data());

    totalSurveys.value = surveys.length;

    surveysByEnqueteur.value = surveys.reduce((acc, survey) => {
      acc[survey.ENQUETEUR] = (acc[survey.ENQUETEUR] || 0) + 1;
      return acc;
    }, {});
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
};

const downloadData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);
    const rawData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestore_id: doc.id,
    }));

    console.log("Raw survey data from Firestore:", rawData);

    // Define core headers that should appear first and in this order
    const coreHeaders = [
      "ID_questionnaire",
      "ENQUETEUR",
      "DATE",
      "JOUR",
      "HEURE_DEBUT",
      "HEURE_FIN",
    ];

    // Add "POSTE_TRAVAIL" to excludedKeys to prevent it from appearing as a separate column
    const excludedKeys = ["firestore_id", "firebase_timestamp", "S1", "POSTE_TRAVAIL"];
    const surveyQuestionOrder = surveyQuestions.map(q => q.id);
    const posteTravailActualId = "POSTE"; // As specified by user

    let allKeys = new Set();
    rawData.forEach(docData => {
      Object.keys(docData).forEach(key => {
        if (!excludedKeys.includes(key)) {
          allKeys.add(key);
        }
      });
    });

    // Build the header order
    let orderedHeaders = [...coreHeaders];
    
    // Add the "POSTE" question (if it exists in data and is the designated one)
    if (allKeys.has(posteTravailActualId) && !orderedHeaders.includes(posteTravailActualId)) {
      orderedHeaders.push(posteTravailActualId);
    }

    // Add remaining survey questions in their defined order, excluding already added "POSTE"
    surveyQuestionOrder.forEach(questionId => {
      if (allKeys.has(questionId) && !orderedHeaders.includes(questionId) && !excludedKeys.includes(questionId)) {
        orderedHeaders.push(questionId);
        
        // Add related commune fields immediately after
        const codeInseeField = `${questionId}_CODE_INSEE`;
        const communeLibreField = `${questionId}_COMMUNE_LIBRE`;
        if (allKeys.has(codeInseeField) && !orderedHeaders.includes(codeInseeField)) {
          orderedHeaders.push(codeInseeField);
        }
        if (allKeys.has(communeLibreField) && !orderedHeaders.includes(communeLibreField)) {
          orderedHeaders.push(communeLibreField);
        }
      }
    });

    // Add any other keys that might exist but weren't in core or surveyQuestionOrder (e.g., old POSTE_TRAVAIL if it's still in some documents)
    // and ensure they are not excluded or already added.
    const remainingKeys = Array.from(allKeys).filter(
      key => !orderedHeaders.includes(key) && !excludedKeys.includes(key)
    ).sort();
    orderedHeaders = [...orderedHeaders, ...remainingKeys];
    
    // Final header list for the sheet
    const finalHeaderOrder = orderedHeaders;

    const data = rawData.map((docData) => {
      const processedData = {};
      finalHeaderOrder.forEach(header => {
        if (!excludedKeys.includes(header)) { // Should be redundant as finalHeaderOrder is filtered
          let value = docData[header] !== undefined ? docData[header] : "";
          if (Array.isArray(value)) {
            value = value.join(", ");
          }
          processedData[header] = value;
        }
      });
      return processedData;
    });

    console.log("Processed data for Excel:", data);
    console.log("Final Header Order for Excel:", finalHeaderOrder);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data, { header: finalHeaderOrder });

    const colWidths = finalHeaderOrder.map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Data");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    XLSX.writeFile(workbook, `${props.activeFirebaseCollectionName}_Survey_Data_${timestamp}.xlsx`);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading data:", error);
  }
};

onMounted(() => {
  // Initialization logic if needed
});
</script>

<style scoped>
.admin-dashboard-root {
  /* This div is now a simple container, positioning is handled by App.vue */
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-signin {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--button-bg);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 999px; /* Pill shape */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.btn-signin:hover {
  background-color: var(--button-hover-bg);
  color: var(--primary-text);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 5px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ef4444; /* Offline Red */
  transition: background-color 0.3s ease;
}
.connection-status.online .status-dot {
  background-color: #22c55e; /* Online Green */
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 7px rgba(34, 197, 94, 0); }
}

.pending-badge {
  background-color: #f59e0b; /* Amber */
  color: #1e293b;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1;
}

/* Base modal styles reused for both sign-in and dashboard */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001; /* Higher than the root button */
}

.signin-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-content {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  position: relative;
  border: 1px solid var(--button-bg);
}

.signin-modal .form-control {
  margin-bottom: 0.5rem;
}

.signin-modal .btn-next {
  width: 100%;
  margin-top: 0.5rem;
}

.signin-modal .close,
.modal-header .close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  padding: 0.5rem;
  margin: -0.5rem;
  line-height: 1;
  font-size: 2rem;
  font-weight: 300;
  color: var(--text-light);
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.signin-modal .close:hover,
.modal-header .close:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #fff;
}

/* Base Modal styles */
.admin-modal .modal-content {
  background-color: var(--modal-bg);
  color: var(--primary-text);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  max-height: 85vh; /* Limit height to prevent overflow on small screens */
  overflow: hidden; /* Prevent content from spilling */
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0; /* Reset padding for new structure */
}

.modal-header {
  padding: 1.5rem;
  text-align: center;
  position: relative;
  border-bottom: 1px solid var(--border-color);
}

.modal-header .logo {
  max-width: 100px;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

/* This style is now combined with the signin-modal close button style above */
/*
.modal-header .close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
  color: var(--text-light);
  opacity: 0.7;
  transition: opacity 0.2s;
}
.modal-header .close:hover {
  opacity: 1;
}
*/

/* Main Dashboard Content */
.dashboard-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto; /* Make the content area scroll if needed */
  flex-grow: 1;
}

.dashboard-card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.dashboard-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

/* Total Surveys Card */
.total-card .total-count {
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin: 0;
  color: var(--primary-text);
}

/* Surveyors Card */
.surveyors-card {
  flex-grow: 1; /* Allow this card to take more space if needed */
  min-height: 150px; /* Ensure it has some height even when empty */
  overflow: hidden; /* Hide overflow from children */
}

.enqueteur-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto; /* THIS IS THE KEY: Make the list scrollable */
  flex-grow: 1;
}

.enqueteur-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 1rem;
}

.enqueteur-list li:last-child {
  border-bottom: none;
}

.enqueteur-list .count {
  background-color: var(--secondary-accent);
  color: var(--primary-text);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  min-width: 24px;
  text-align: center;
}

.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 2rem 0;
}


/* Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-download {
  display: block;
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: filter 0.2s;
  background-color: var(--primary-accent);
  color: var(--primary-text);
  border: none;
}

.btn-download:hover {
  filter: brightness(1.1);
}
</style>