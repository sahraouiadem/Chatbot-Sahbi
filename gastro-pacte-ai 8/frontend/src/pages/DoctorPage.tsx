import React, { useState, useRef } from 'react';
import { Mic, Loader2, PlayCircle, StopCircle, Download } from 'lucide-react';
import { transcribeAudio } from '../../../backend/services/aiService';

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const DoctorPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('audio/webm');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let type = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm'))       type = 'audio/webm';
      else if (MediaRecorder.isTypeSupported('audio/mp4'))   type = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/ogg'))   type = 'audio/ogg';
      else if (MediaRecorder.isTypeSupported('audio/wav'))   type = 'audio/wav';

      setMimeType(type);

      const recorder = new MediaRecorder(stream, { mimeType: type });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert("Impossible d'accéder au microphone.");
    }
  };

  const stopAndTranscribe = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      setIsRecording(false);

      if (audioBlob.size === 0) {
        setTranscription("Erreur : L'enregistrement est vide. Veuillez vérifier votre microphone et réessayer.");
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        return;
      }

      setIsTranscribing(true);
      try {
        const base64 = await blobToBase64(audioBlob);
        const result = await transcribeAudio(base64, mimeType);
        setTranscription(result);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
          setTranscription("Erreur d'authentification : Vérifiez votre clé API Gemini dans .env.local.");
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
          setTranscription("Erreur réseau : Impossible de contacter l'API Gemini. Vérifiez votre connexion.");
        } else {
          setTranscription(`Erreur de transcription : ${msg}`);
        }
      } finally {
        setIsTranscribing(false);
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleDownload = () => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Observation_Medicale_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-100">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Mic className="w-6 h-6" /> Dictaphone Intelligent
          </h2>
          <p className="text-slate-400 mt-2">
            Enregistrez vos observations, l'IA formate le dossier.
          </p>
        </div>

        <div className="p-8 flex flex-col items-center gap-8">
          {/* Visualisation */}
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'bg-red-50 border-4 border-red-500 shadow-red-200 shadow-xl scale-110'
                : 'bg-slate-100 border-4 border-slate-200'
            }`}
          >
            {isRecording ? (
              <div className="w-16 h-16 bg-red-500 rounded-lg animate-pulse" />
            ) : (
              <Mic className="w-16 h-16 text-slate-400" />
            )}
          </div>

          {/* Controls */}
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
                onClick={stopAndTranscribe}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 bg-slate-800 hover:bg-slate-900 rounded-full flex items-center justify-center shadow-lg transition-all transform group-hover:-translate-y-1">
                  <StopCircle className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-600">Arrêter & Transcrire</span>
              </button>
            )}
          </div>

          {/* Loading state */}
          {isTranscribing && (
            <div className="flex items-center gap-3 text-teal-600 bg-teal-50 px-4 py-2 rounded-full">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Traitement audio avec Gemini...</span>
            </div>
          )}

          {/* Transcription result */}
          {transcription && (
            <div className="w-full mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Observation Générée
                </label>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:underline bg-teal-50 px-2 py-1 rounded border border-teal-100"
                >
                  <Download className="w-3 h-3" />
                  Télécharger
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {transcription}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;
