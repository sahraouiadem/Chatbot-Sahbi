export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface GastroFormData {
  fullName: string;
  age: string;
  gender: string;
  motif: string;
  duration: string;
  painIntensity: string;
  painType: string;
  painTrigger: string;
  transit: string;
  stoolColor: string;
  upperDigestive: string;
  weightLoss: string;
  fever: string;
  history: string;
  familyHistory: string;
  meds: string;
  diet: string;
}
