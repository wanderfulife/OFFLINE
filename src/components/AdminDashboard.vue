<template>
  <div class="admin-dashboard-root">
    <button class="btn-signin" @click="showSignInModal = true">
      connexion admin
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
          class="form-control"
        />
        <button @click="signIn" class="btn-signin">Se connecter</button>
      </div>
    </div>

    <!-- Admin Dashboard Modal -->
    <div v-if="showAdminDashboard" class="modal">
      <div class="modal-content admin-dashboard">
        <button class="close" @click="showAdminDashboard = false">
          &times;
        </button>
        <img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
        <h2>Tableau de Bord Admin</h2>
        <div class="dashboard-content">
          <div class="dashboard-card total">
            <h3>Total des Enquêtes</h3>
            <p class="big-number">{{ totalSurveys }}</p>
          </div>
          <div class="dashboard-card">
            <h3>Enquêtes par Enquêteur</h3>
            <ul>
              <li v-for="(count, name) in surveysByEnqueteur" :key="name">
                <span>{{ name }}</span>
                <span class="count">{{ count }}</span>
              </li>
            </ul>
          </div>

        </div>
        <button @click="downloadData" class="btn-download">
          Télécharger les Données
        </button>
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  max-width: 100px;
  margin: 0 auto 1.5rem auto;
  display: block;
}

.btn-signin {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--button-bg);
  color: var(--text-light);
  border: 1px solid transparent;
  padding: 8px 16px;
  border-radius: 999px; /* Pill shape */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.btn-signin:hover {
  background-color: var(--button-hover-bg);
  color: var(--primary-text);
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
}
.connection-status.online .status-dot {
  background-color: #22c55e; /* Online Green */
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  50% { box-shadow: 0 0 0 5px rgba(34, 197, 94, 0); }
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
  border: 1px solid var(--button-bg);
}

.signin-modal {
  display: flex;
  flex-direction: column;
}

.admin-dashboard {
  text-align: center;
}

.dashboard-content {
  margin: 2rem 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.dashboard-card {
  background-color: var(--primary-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius-md);
}

.dashboard-card h3 {
  margin-top: 0;
  font-size: 1rem;
  color: var(--text-light);
  border-bottom: 1px solid var(--button-bg);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.dashboard-card p.big-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--primary-text);
  margin: 0;
}

.dashboard-card ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.dashboard-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--button-bg);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.dashboard-card li .count {
  font-weight: bold;
  background-color: var(--primary-accent);
  color: var(--primary-text);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
}

.btn-download {
  width: 100%;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: var(--secondary-accent);
  color: var(--primary-text);
  border: 1px solid var(--secondary-accent);
}

.btn-download:hover {
  filter: brightness(1.1);
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
}

.form-control {
  margin: 1rem 0;
  width: 100%;
}
</style>