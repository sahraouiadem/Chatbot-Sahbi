import { GastroFormData } from '../types';

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
  status: 'READY_FOR_REVIEW';
  source: 'GASTRO_PACTE_APP_V1';
}

const STORAGE_KEY = 'pacte_medical_records';

export const saveToHospitalServer = async (
  resume: string,
  patientData: GastroFormData
): Promise<void> => {
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
    status: 'READY_FOR_REVIEW',
    source: 'GASTRO_PACTE_APP_V1',
  };

  try {
    const existingData = localStorage.getItem(STORAGE_KEY);
    const records: MedicalRecord[] = existingData ? JSON.parse(existingData) : [];
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    throw new Error(
      `Sauvegarde locale indisponible: ${error instanceof Error ? error.message : 'erreur inconnue'}`
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const getAllRecords = (): MedicalRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
