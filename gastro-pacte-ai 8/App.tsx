import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { 
  MessageCircle, 
  ClipboardList, 
  Mic, 
  Settings, 
  Send, 
  Loader2, 
  Stethoscope, 
  AlertCircle,
  FileText,
  StopCircle,
  PlayCircle,
  User,
  Clock,
  Activity,
  AlertTriangle,
  History,
  Pill,
  Utensils,
  Download,
  Thermometer,
  Scale
} from 'lucide-react';
import { Page, ChatMessage, GastroFormData, INITIAL_FORM_DATA } from './types';

// --- Constants ---
const MODEL_CHAT = "gemini-3-flash-preview";
const MODEL_ANALYSIS = "gemini-3-flash-preview";
const MODEL_AUDIO = "gemini-3-flash-preview"; 

const TUNISIAN_SYSTEM_PROMPT = `
Tu es un assistant médical tunisien virtuel pour un service de gastro-entérologie.
1. Tu parles UNIQUEMENT en Derja Tunisienne (dialecte tunisien, écrit en alphabet latin ou arabe selon l'input de l'utilisateur, mais préfère l'alphabet latin si l'utilisateur l'utilise).
2. Sois très chaleureux et empathique. Utilise des expressions comme "3aslema", "ya khouya", "labes 3lik", "inshallah labes".
3. Ton but est d'écouter les symptômes gastro-intestinaux.
4. Si l'utilisateur décrit des signes graves (sang dans les selles, évanouissement, douleur insupportable, perte de poids rapide), dis-lui gentiment mais fermement d'aller aux urgences immédiatement.
5. Ne fais pas de diagnostic médical définitif. Donne des conseils d'hygiène de vie simples si c'est bénin.
6. Reste concis.
7. CRUCIAL : Si tu penses que le patient doit voir un médecin ou aller aux urgences, dis-lui : "Ya 3ayech khouya/okhti, barra 3ammer el 'Pré-Consultation' (fil menu 3al lisar) bech t7adher dossier sghir l'tabib w terba7 wa9t." (Va remplir le formulaire Pré-Consultation dans le menu à gauche pour préparer un résumé pour le médecin et gagner du temps).
`;

const DOCTOR_TRANSCRIPTION_PROMPT = `
Tâche : Transcription verbatim (mot à mot) de l'audio en Français.

Instructions strictes :
1. Écris EXACTEMENT ce que tu entends dans l'audio.
2. NE PAS résumer, NE PAS reformuler, NE PAS structurer (pas de titres [MOTIF], etc.).
3. Si c'est une dictée médicale, transcris-la telle quelle.
4. N'invente aucun texte.
`;

const FORM_ANALYSIS_PROMPT = `
Agis comme un expert Gastro-entérologue Senior. 
Ta tâche est de rédiger une "Observation Médicale d'Entrée" structurée et professionnelle en FRANÇAIS pour le dossier hospitalier, basée sur les réponses détaillées du patient.

Voici les données cliniques structurées :
`;

// --- Helper Components ---

const Button = ({ 
  onClick, 
  disabled, 
  children, 
  variant = 'primary',
  className = '' 
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  children?: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
}) => {
  const variants = {
    primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm",
    secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const InputField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  multiline = false,
  icon,
  type = "text"
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  multiline?: boolean;
  icon?: React.ReactNode;
  type?: string;
}) => {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5">
        {icon && <span className="text-teal-600">{icon}</span>}
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all min-h-[80px] text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

// --- Database Function ---
const saveToHospitalServer = async (resume: string, patientData: GastroFormData) => {
  console.log("🔵 [SYSTEM] Processing medical record...");

  // 1. Prepare the Data Payload
  const record = {
    recordId: `REC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patient: {
      fullName: patientData.fullName,
      age: patientData.age,
      gender: patientData.gender,
      file_details: patientData
    },
    medicalResume: resume,
    status: 'READY_FOR_REVIEW',
    source: 'GASTRO_PACTE_APP_V1'
  };

  // --- MVP IMPLEMENTATION: Local Storage ---
  try {
    const existingData = localStorage.getItem('pacte_medical_records');
    const records = existingData ? JSON.parse(existingData) : [];
    records.push(record);
    localStorage.setItem('pacte_medical_records', JSON.stringify(records));
    console.log("✅ [MVP] Record saved successfully to Local Storage.");
  } catch (error) {
    console.error("❌ [MVP] Failed to save to Local Storage:", error);
  }

  // --- FUTURE IMPLEMENTATION: Hospital Server Integration ---
  /*
  const HOSPITAL_CONFIG = {
    IP: process.env.HOSPITAL_SERVER_IP || '192.168.1.100', 
    PORT: process.env.HOSPITAL_SERVER_PORT || '8080',
    TOKEN: process.env.HOSPITAL_AUTH_TOKEN
  };
  // ... fetch implementation ...
  */

  await new Promise(resolve => setTimeout(resolve, 1000));
};


// --- Main App Component ---

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.WELCOME);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '3aslema! Labes 3lik? Ena l\'assistant mte3ek. Chnowa t7ess lyoum?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<GastroFormData>(INITIAL_FORM_DATA);
  const [formAnalysis, setFormAnalysis] = useState<string | null>(null);
  const [isFormAnalyzing, setIsFormAnalyzing] = useState(false);

  // Doctor Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioTranscription, setAudioTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingMimeType, setRecordingMimeType] = useState<string>('audio/webm');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- API Helper ---
  const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  };

  // --- Chat Handler ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = getAiClient();
      
      const historyText = messages.slice(-6).map(m => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`).join('\n');
      const prompt = `${TUNISIAN_SYSTEM_PROMPT}\n\nHistorique de la conversation:\n${historyText}\n\nPatient: ${userMsg.text}\nAssistant:`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: MODEL_CHAT,
        contents: prompt,
      });

      const text = response.text || "Samahni, ma fhemtekch (Erreur technique).";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Erreur de connexion. Vérifiez votre clé API.", isError: true }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Form Analysis Handler ---
  const handleAnalyzeForm = async () => {
    setIsFormAnalyzing(true);
    setFormAnalysis(null);

    try {
      const ai = getAiClient();
      const prompt = `${FORM_ANALYSIS_PROMPT}
      
      --- 1. IDENTITÉ ---
      Nom: ${formData.fullName} | Âge: ${formData.age} | Sexe: ${formData.gender}

      --- 2. MOTIF ET DOULEUR ---
      Motif Principal: ${formData.motif}
      Durée: ${formData.duration}
      Intensité Douleur (0-10): ${formData.painIntensity}
      Type de Douleur: ${formData.painType} (ex: Brûlure, Crampe)
      Facteurs Déclenchants/Calmants: ${formData.painTrigger}

      --- 3. SIGNES DIGESTIFS ---
      Transit: ${formData.transit}
      Aspect des Selles: ${formData.stoolColor}
      Signes Hauts (Vomissements/Dysphagie): ${formData.upperDigestive}
      
      --- 4. SIGNES GÉNÉRAUX ---
      Perte de poids: ${formData.weightLoss}
      Fièvre/Frissons: ${formData.fever}
      
      --- 5. CONTEXTE ---
      Antécédents Personnels: ${formData.history}
      Antécédents Familiaux: ${formData.familyHistory}
      Traitements: ${formData.meds}
      Habitudes (Tabac/Alcool): ${formData.diet}
      
      INSTRUCTION: Rédige une "Observation Médicale" très structurée (Motif, HDM, Signes Fonctionnels, Signes Généraux, Terrain) en langage médical professionnel.`;

      const response = await ai.models.generateContent({
        model: MODEL_ANALYSIS,
        contents: prompt
      });

      const generatedText = response.text || "Aucune analyse générée.";
      setFormAnalysis(generatedText);

      await saveToHospitalServer(generatedText, formData);

    } catch (error) {
      setFormAnalysis("Erreur lors de l'analyse ou de la connexion serveur.");
    } finally {
      setIsFormAnalyzing(false);
    }
  };

  // --- Audio Recording Handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
      
      setRecordingMimeType(mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Impossible d'accéder au microphone.");
    }
  };

  const stopRecordingAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: recordingMimeType });
      setIsRecording(false);

      if (audioBlob.size === 0) {
        setAudioTranscription("Erreur : L'enregistrement est vide. Veuillez vérifier votre microphone et réessayer.");
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        return;
      }

      setIsTranscribing(true);
      
      try {
        const base64Audio = await blobToBase64(audioBlob);
        const ai = getAiClient();
        
        const response = await ai.models.generateContent({
          model: MODEL_AUDIO,
          contents: [
            { inlineData: { mimeType: recordingMimeType, data: base64Audio } },
            { text: DOCTOR_TRANSCRIPTION_PROMPT }
          ],
        });

        setAudioTranscription(response.text || "Transcription vide — l'audio ne contenait pas de parole détectable.");
      } catch (error) {
        console.error("Erreur transcription audio:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('API key') || message.includes('401') || message.includes('403')) {
          setAudioTranscription("Erreur d'authentification : Vérifiez votre clé API Gemini dans .env.local.");
        } else if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
          setAudioTranscription("Erreur réseau : Impossible de contacter l'API Gemini. Vérifiez votre connexion.");
        } else {
          setAudioTranscription(`Erreur de transcription : ${message}`);
        }
      } finally {
        setIsTranscribing(false);
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      }
    };
    mediaRecorderRef.current.stop();
  };

  const handleDownloadTranscription = () => {
    if (!audioTranscription) return;
    const blob = new Blob([audioTranscription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Observation_Medicale_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // --- Rendering ---

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Mobile Responsive */}
      <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col items-center lg:items-stretch py-6 flex-shrink-0 z-10 transition-all">
        <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
          <div className="bg-teal-500 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl hidden lg:block">Gastro-Pacte</span>
        </div>

        <nav className="flex-1 space-y-2 px-2">
          <button 
            onClick={() => setCurrentPage(Page.WELCOME)}
            className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${currentPage === Page.WELCOME ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Chatbot Tunisien</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage(Page.FORM)}
            className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${currentPage === Page.FORM ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <ClipboardList className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Pré-Consultation</span>
          </button>

          <button 
            onClick={() => setCurrentPage(Page.DOCTOR)}
            className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${currentPage === Page.DOCTOR ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Mic className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Espace Docteur</span>
          </button>
        </nav>

        <div className="mt-auto px-4">
          <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-center lg:justify-start gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="hidden lg:block text-xs text-slate-400">Gemini 1.5 Actif</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        
        {/* Page 1: Chatbot */}
        {currentPage === Page.WELCOME && (
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-white shadow-xl lg:my-4 lg:rounded-2xl overflow-hidden border border-slate-200">
            <div className="bg-teal-600 p-4 text-white shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Assistant PACTE</h2>
                <p className="text-teal-100 text-xs">Support en Dialecte Tunisien</p>
              </div>
              <MessageCircle className="w-5 h-5 opacity-80" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-hide">
              <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm max-w-[80%]">
                    <p className="leading-relaxed">3aslema! Ena l'assistant mta3ek. Si 3andek wji3a wala 9ala9, a7kili. Si lezem temchi l'tabib, n9ollek t3ammer formulaire bech t7adher dossier mte3ek.</p>
                  </div>
              </div>
              {messages.slice(1).map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-teal-600 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.isError && <AlertCircle className="w-4 h-4 mt-2 text-red-300" />}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span className="text-slate-400 text-sm">Yekteb...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ahki m3aya houni..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
                />
                <Button onClick={handleSendMessage} disabled={isChatLoading || !chatInput.trim()} className="rounded-xl px-6">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Page 2: Gastro Form */}
        {currentPage === Page.FORM && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-7 h-7 text-teal-600" />
                    Formulaire Pré-Consultation (Recherche Gastro)
                  </h2>
                  <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    Hopital-Connect: OFFLINE
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Section 1: Identité */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" /> 1. Identité du Patient
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                        label="Nom et Prénom" 
                        placeholder="Ben Ahmed Walid" 
                        value={formData.fullName} 
                        onChange={(v) => setFormData({...formData, fullName: v})}
                      />
                       <div className="grid grid-cols-2 gap-4">
                        <InputField 
                          label="Âge" 
                          placeholder="Ex: 45 ans" 
                          value={formData.age} 
                          onChange={(v) => setFormData({...formData, age: v})}
                        />
                        <InputField 
                          label="Sexe" 
                          placeholder="H / F" 
                          value={formData.gender} 
                          onChange={(v) => setFormData({...formData, gender: v})}
                        />
                       </div>
                    </div>
                  </div>

                  {/* Section 2: Douleur & Motif */}
                  <div>
                    <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> 2. Caractéristiques de la Douleur
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                       <InputField 
                        label="Motif Principal (En 1 mot)" 
                        placeholder="Ex: Épigastralgie, Dysphagie, Diarrhée..." 
                        value={formData.motif} 
                        onChange={(v) => setFormData({...formData, motif: v})}
                        icon={<AlertCircle className="w-4 h-4" />}
                      />
                      <InputField 
                        label="Depuis combien de temps ?" 
                        placeholder="Ex: Aigu (2 jours), Chronique (3 mois)..." 
                        value={formData.duration} 
                        onChange={(v) => setFormData({...formData, duration: v})}
                        icon={<Clock className="w-4 h-4" />}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <InputField 
                        label="Intensité Douleur" 
                        placeholder="Note de 1 à 10" 
                        type="number"
                        value={formData.painIntensity} 
                        onChange={(v) => setFormData({...formData, painIntensity: v})}
                      />
                       <InputField 
                        label="Type de Douleur" 
                        placeholder="Ex: Brûlure, Crampe, Torsion, Coup de poignard" 
                        value={formData.painType} 
                        onChange={(v) => setFormData({...formData, painType: v})}
                      />
                       <InputField 
                        label="Facteur Déclenchant / Calmant" 
                        placeholder="Ex: À jeun, Post-prandiale (après repas), Nocturne" 
                        value={formData.painTrigger} 
                        onChange={(v) => setFormData({...formData, painTrigger: v})}
                      />
                    </div>
                  </div>

                   {/* Section 3: Signes Digestifs Spécifiques */}
                   <div>
                    <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> 3. Transit & Digestion
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                        label="Transit Intestinal" 
                        placeholder="Ex: Diarrhée liquide, Constipation opiniâtre, Alternance, Faux besoins" 
                        value={formData.transit} 
                        onChange={(v) => setFormData({...formData, transit: v})}
                      />
                       <InputField 
                        label="Aspect des Selles (Crucial)" 
                        placeholder="Ex: Méléna (Noir goudron), Rectorragie (Sang rouge), Décolorées (Blanc/Mastic), Glaireuses" 
                        value={formData.stoolColor} 
                        onChange={(v) => setFormData({...formData, stoolColor: v})}
                        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                      />
                    </div>
                     <InputField 
                        label="Signes Digestifs Hauts" 
                        placeholder="Ex: Vomissements (Alimentaires/Bilieux), Hématémèse (Sang), Dysphagie (Blocage), Pyrosis (Remontées acides)" 
                        value={formData.upperDigestive} 
                        onChange={(v) => setFormData({...formData, upperDigestive: v})}
                        multiline
                      />
                  </div>

                  {/* Section 4: Signes Généraux */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="text-sm font-bold text-red-700 uppercase mb-4 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> 4. Signes d'Alerte Généraux
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                        label="Perte de Poids (Quantifiée)" 
                        placeholder="Ex: -5kg en 2 mois, Stable, Anorexie (perte d'appétit)" 
                        value={formData.weightLoss} 
                        onChange={(v) => setFormData({...formData, weightLoss: v})}
                      />
                      <InputField 
                        label="Fièvre / Signes infectieux" 
                        placeholder="Ex: Fièvre > 38.5°C, Frissons, Sueurs nocturnes" 
                        value={formData.fever} 
                        onChange={(v) => setFormData({...formData, fever: v})}
                         icon={<Thermometer className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Section 5: Contexte */}
                  <div>
                    <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                      <History className="w-4 h-4" /> 5. Terrain & Antécédents
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                        label="Antécédents Personnels" 
                        placeholder="Ex: Ulcère gastro-duodénal, Lithiase vésiculaire, Chirurgie bariatrique..." 
                        value={formData.history} 
                        onChange={(v) => setFormData({...formData, history: v})}
                        multiline
                      />
                      <InputField 
                        label="Antécédents Familiaux (1er degré)" 
                        placeholder="Ex: Cancer Colorectal (Père), Maladie de Crohn (Frère), Polypose..." 
                        value={formData.familyHistory} 
                        onChange={(v) => setFormData({...formData, familyHistory: v})}
                        multiline
                      />
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                      <InputField 
                          label="Traitements en cours" 
                          placeholder="Ex: AINS (Voltarène/Aspirine), Anticoagulants, IPP..." 
                          value={formData.meds} 
                          onChange={(v) => setFormData({...formData, meds: v})}
                          icon={<Pill className="w-4 h-4" />}
                        />
                        <InputField 
                          label="Mode de Vie / Toxiques" 
                          placeholder="Ex: Tabagisme (PA), Alcoolisme chronique, Consommation d'épices..." 
                          value={formData.diet} 
                          onChange={(v) => setFormData({...formData, diet: v})}
                        />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <Button onClick={handleAnalyzeForm} disabled={isFormAnalyzing} className="w-full md:w-auto text-lg py-3 px-8 shadow-md">
                    {isFormAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    {isFormAnalyzing ? 'Analyse Clinique IA...' : 'Générer Observation Médicale'}
                  </Button>
                </div>
              </div>

              {formAnalysis && (
                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                      <Stethoscope className="w-6 h-6" />
                      Synthèse Médicale (Générée par IA)
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold border border-green-200">
                      SAUVEGARDÉ (MOCK)
                    </span>
                  </div>
                 
                  <div className="bg-white p-6 rounded-lg border border-teal-100 shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                      {formAnalysis}
                    </pre>
                  </div>
                  <p className="text-xs text-center text-teal-600 mt-4 opacity-70">
                    Ce document est une aide à la décision et ne remplace pas l'examen clinique.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page 3: Doctor Dictaphone */}
        {currentPage === Page.DOCTOR && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-100">
             <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 text-white p-6 text-center">
                  <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Mic className="w-6 h-6" />
                    Dictaphone Intelligent
                  </h2>
                  <p className="text-slate-400 mt-2">Enregistrez vos observations, l'IA formate le dossier.</p>
                </div>

                <div className="p-8 flex flex-col items-center gap-8">
                  {/* Recording Status Visualization */}
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-50 border-4 border-red-500 shadow-red-200 shadow-xl scale-110' : 'bg-slate-100 border-4 border-slate-200'}`}>
                    {isRecording ? (
                      <div className="w-16 h-16 bg-red-500 rounded-lg animate-pulse" />
                    ) : (
                      <Mic className="w-16 h-16 text-slate-400" />
                    )}
                  </div>

                  <div className="flex gap-4 w-full justify-center">
                    {!isRecording ? (
                      <button 
                        onClick={startRecording}
                        disabled={isTranscribing}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 transition-all transform group-hover:-translate-y-1">
                          <PlayCircle className="w-8 h-8 text-white fill-current" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Enregistrer</span>
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecordingAndTranscribe}
                        className="flex flex-col items-center gap-2 group"
                      >
                         <div className="w-16 h-16 bg-slate-800 hover:bg-slate-900 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:-translate-y-1">
                          <StopCircle className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-600">Arrêter & Transcrire</span>
                      </button>
                    )}
                  </div>

                  {isTranscribing && (
                     <div className="flex items-center gap-3 text-teal-600 bg-teal-50 px-4 py-2 rounded-full">
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span className="font-medium">Traitement audio avec Gemini...</span>
                     </div>
                  )}

                  {audioTranscription && (
                    <div className="w-full mt-4 animate-slide-up">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Observation Générée</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleDownloadTranscription}
                            className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:underline bg-teal-50 px-2 py-1 rounded border border-teal-100"
                          >
                            <Download className="w-3 h-3" />
                            Télécharger
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                        {audioTranscription}
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}