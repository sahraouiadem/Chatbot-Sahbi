import { GastroFormData } from "../../frontend/src/types";

export interface MedicalRecord {
  recordId: string;
  timestamp: string;
  patient: {
    fullName: string;
    age: string;
    gender: string;
    file_details: GastroFormData;
  };
  medicalResume: string;
  status: "READY_FOR_REVIEW";
  source: "GASTRO_PACTE_APP_V1";
}

const STORAGE_KEY = "pacte_medical_records";

/**
 * Saves a generated medical résumé and the patient's form data.
 *
 * MVP implementation uses localStorage.
 * Future: replace the body with a real fetch() to the hospital server.
 */
export const saveToHospitalServer = async (
  resume: string,
  patientData: GastroFormData
): Promise<void> => {
  console.log("🔵 [SYSTEM] Processing medical record...");

  const record: MedicalRecord = {
    recordId: `REC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patient: {
      fullName: patientData.fullName,
      age: patientData.age,
      gender: patientData.gender,
      file_details: patientData,
    },
    medicalResume: resume,
    status: "READY_FOR_REVIEW",
    source: "GASTRO_PACTE_APP_V1",
  };

  // --- MVP: Local Storage ---
  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const records: MedicalRecord[] = existingData
      ? JSON.parse(existingData)
      : [];
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    console.log("✅ [MVP] Record saved successfully to Local Storage.");
  } catch (error) {
    console.error("❌ [MVP] Failed to save to Local Storage:", error);
  }

  // --- FUTURE: Hospital Server Integration ---
  /*
  const HOSPITAL_CONFIG = {
    IP: process.env.HOSPITAL_SERVER_IP || '192.168.1.100',
    PORT: process.env.HOSPITAL_SERVER_PORT || '8080',
    TOKEN: process.env.HOSPITAL_AUTH_TOKEN
  };
  await fetch(`http://${HOSPITAL_CONFIG.IP}:${HOSPITAL_CONFIG.PORT}/api/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HOSPITAL_CONFIG.TOKEN}`
    },
    body: JSON.stringify(record)
  });
  */

  await new Promise((resolve) => setTimeout(resolve, 1000));
};

/** Retrieve all saved records (for a future admin/review panel). */
export const getAllRecords = (): MedicalRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
