import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

/**
 * =====================================================================
 * 1. FARMER PROFILES & PARCEL LOCATION DATA
 * =====================================================================
 */
export async function saveFarmerProfile(userId, profileData) {
  if (!userId) return null;

  const dataToSave = {
    ...profileData,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, dataToSave, { merge: true });
    } catch (err) {
      console.warn("Firestore error saving farmer profile:", err);
    }
  }

  // Fallback to local storage for demo mode
  localStorage.setItem(`agrinexus_profile_${userId}`, JSON.stringify(dataToSave));
  return dataToSave;
}

export async function getFarmerProfile(userId) {
  if (!userId) return null;

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (err) {
      console.warn("Firestore error fetching profile:", err);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(`agrinexus_profile_${userId}`);
  return stored ? JSON.parse(stored) : null;
}

/**
 * =====================================================================
 * 2. SOIL HEALTH CARDS
 * =====================================================================
 */
export async function saveSoilCardToFirestore(userId, soilCardData) {
  const record = {
    userId: userId || 'demo_farmer',
    district: soilCardData.region_name || 'Gorakhpur',
    soilType: soilCardData.soil_type || 'Alluvial',
    parameters: soilCardData.parameters || {},
    sourceType: soilCardData.source_type || 'uploaded_card',
    savedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'soil_cards');
      const docRef = await addDoc(colRef, record);
      return { id: docRef.id, ...record };
    } catch (err) {
      console.warn("Firestore error saving soil card:", err);
    }
  }

  // Local fallback
  const existing = JSON.parse(localStorage.getItem('agrinexus_soil_cards') || '[]');
  existing.unshift(record);
  localStorage.setItem('agrinexus_soil_cards', JSON.stringify(existing));
  return record;
}

export async function getUserSoilCards(userId) {
  if (isFirebaseConfigured && db && userId) {
    try {
      const colRef = collection(db, 'soil_cards');
      const q = query(colRef, where('userId', '==', userId));
      const querySnap = await getDocs(q);
      const list = [];
      querySnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      return list;
    } catch (err) {
      console.warn("Firestore error getting soil cards:", err);
    }
  }

  const stored = localStorage.getItem('agrinexus_soil_cards');
  return stored ? JSON.parse(stored) : [];
}

/**
 * =====================================================================
 * 3. PERSONALIZED FARM PLANS
 * =====================================================================
 */
export async function saveFarmPlanToFirestore(userId, farmPlan) {
  const record = {
    userId: userId || 'demo_farmer',
    district: farmPlan.district || 'Gorakhpur',
    selectedCropId: farmPlan.crop_recommendation?.id || 'rice',
    cropName: farmPlan.crop_recommendation?.name || 'Rice',
    farmPlanData: farmPlan,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'farm_plans');
      const docRef = await addDoc(colRef, record);
      return { id: docRef.id, ...record };
    } catch (err) {
      console.warn("Firestore error saving farm plan:", err);
    }
  }

  const existing = JSON.parse(localStorage.getItem('agrinexus_farm_plans') || '[]');
  existing.unshift(record);
  localStorage.setItem('agrinexus_farm_plans', JSON.stringify(existing));
  return record;
}

/**
 * =====================================================================
 * 4. CROP DISEASE DIAGNOSIS HISTORY
 * =====================================================================
 */
export async function saveDiseaseScanToFirestore(userId, diseaseData) {
  const record = {
    userId: userId || 'demo_farmer',
    cropType: diseaseData.crop_type || 'General',
    diseaseName: diseaseData.disease_detected || 'Unknown',
    confidence: diseaseData.confidence || 0.92,
    organicRemedy: diseaseData.organic_remedy || '',
    chemicalRemedy: diseaseData.chemical_remedy || '',
    scannedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'disease_scans');
      const docRef = await addDoc(colRef, record);
      return { id: docRef.id, ...record };
    } catch (err) {
      console.warn("Firestore error saving disease scan:", err);
    }
  }

  const existing = JSON.parse(localStorage.getItem('agrinexus_disease_scans') || '[]');
  existing.unshift(record);
  localStorage.setItem('agrinexus_disease_scans', JSON.stringify(existing));
  return record;
}

/**
 * =====================================================================
 * 5. FARM AI COPILOT CHAT HISTORY
 * =====================================================================
 */
export async function saveCopilotMessageToFirestore(userId, chatMessage) {
  const record = {
    userId: userId || 'demo_farmer',
    sender: chatMessage.sender || 'user',
    text: chatMessage.text || '',
    provenance: chatMessage.provenance || null,
    timestamp: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'copilot_chats');
      await addDoc(colRef, record);
    } catch (err) {
      console.warn("Firestore error saving chat message:", err);
    }
  }

  const existing = JSON.parse(localStorage.getItem('agrinexus_copilot_chats') || '[]');
  existing.push(record);
  localStorage.setItem('agrinexus_copilot_chats', JSON.stringify(existing));
}
