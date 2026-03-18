export enum Page {
  WELCOME = 'WELCOME',
  FORM = 'FORM',
  DOCTOR = 'DOCTOR'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface GastroFormData {
  // Identity
  fullName: string;
  age: string;
  gender: string;

  // Chief Complaint
  motif: string;
  duration: string;

  // Pain Specifics
  painIntensity: string; // 1-10
  painType: string;      // Brûlure, Crampe, Torsion
  painTrigger: string;   // À jeun, Après repas, La nuit

  // Digestive Signs
  transit: string;        // Diarrhée, Constipation, Alternance
  stoolColor: string;     // Noir, Rouge, Glaireux, Normal
  upperDigestive: string; // Vomissements, Dysphagie, Pyrosis

  // General Signs
  weightLoss: string;  // Kg perdus / Durée
  fever: string;       // Température, Frissons

  // Context
  history: string;
  familyHistory: string;
  meds: string;
  diet: string;
}

export const INITIAL_FORM_DATA: GastroFormData = {
  fullName: '',
  age: '',
  gender: '',
  motif: '',
  duration: '',
  painIntensity: '',
  painType: '',
  painTrigger: '',
  transit: '',
  stoolColor: '',
  upperDigestive: '',
  weightLoss: '',
  fever: '',
  history: '',
  familyHistory: '',
  meds: '',
  diet: '',
};
