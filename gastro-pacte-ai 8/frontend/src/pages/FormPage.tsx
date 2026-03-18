import React, { useState } from 'react';
import {
  ClipboardList,
  Loader2,
  FileText,
  Stethoscope,
  AlertCircle,
  Clock,
  User,
  Activity,
  AlertTriangle,
  History,
  Pill,
  Thermometer,
  Scale,
} from 'lucide-react';
import { GastroFormData, INITIAL_FORM_DATA } from '../types';
import { analyzeForm } from '../../../backend/services/aiService';
import { saveToHospitalServer } from '../../../backend/services/storageService';
import Button from '../components/Button';
import InputField from '../components/InputField';

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState<GastroFormData>(INITIAL_FORM_DATA);
  const [formAnalysis, setFormAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const update = (field: keyof GastroFormData) => (val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setFormAnalysis(null);
    try {
      const result = await analyzeForm(formData);
      setFormAnalysis(result);
      await saveToHospitalServer(result, formData);
    } catch {
      setFormAnalysis("Erreur lors de l'analyse ou de la connexion serveur.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          {/* Title */}
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
            {/* Section 1 — Identité */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> 1. Identité du Patient
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Nom et Prénom"
                  placeholder="Ben Ahmed Walid"
                  value={formData.fullName}
                  onChange={update('fullName')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Âge"
                    placeholder="Ex: 45 ans"
                    value={formData.age}
                    onChange={update('age')}
                  />
                  <InputField
                    label="Sexe"
                    placeholder="H / F"
                    value={formData.gender}
                    onChange={update('gender')}
                  />
                </div>
              </div>
            </div>

            {/* Section 2 — Douleur */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 2. Caractéristiques de la Douleur
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Motif Principal (En 1 mot)"
                  placeholder="Ex: Épigastralgie, Dysphagie, Diarrhée..."
                  value={formData.motif}
                  onChange={update('motif')}
                  icon={<AlertCircle className="w-4 h-4" />}
                />
                <InputField
                  label="Depuis combien de temps ?"
                  placeholder="Ex: Aigu (2 jours), Chronique (3 mois)..."
                  value={formData.duration}
                  onChange={update('duration')}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField
                  label="Intensité Douleur"
                  placeholder="Note de 1 à 10"
                  type="number"
                  value={formData.painIntensity}
                  onChange={update('painIntensity')}
                />
                <InputField
                  label="Type de Douleur"
                  placeholder="Ex: Brûlure, Crampe, Torsion, Coup de poignard"
                  value={formData.painType}
                  onChange={update('painType')}
                />
                <InputField
                  label="Facteur Déclenchant / Calmant"
                  placeholder="Ex: À jeun, Post-prandiale (après repas), Nocturne"
                  value={formData.painTrigger}
                  onChange={update('painTrigger')}
                />
              </div>
            </div>

            {/* Section 3 — Transit */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> 3. Transit & Digestion
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Transit Intestinal"
                  placeholder="Ex: Diarrhée liquide, Constipation opiniâtre, Alternance, Faux besoins"
                  value={formData.transit}
                  onChange={update('transit')}
                />
                <InputField
                  label="Aspect des Selles (Crucial)"
                  placeholder="Ex: Méléna (Noir goudron), Rectorragie (Sang rouge), Décolorées (Blanc/Mastic), Glaireuses"
                  value={formData.stoolColor}
                  onChange={update('stoolColor')}
                  icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                />
              </div>
              <InputField
                label="Signes Digestifs Hauts"
                placeholder="Ex: Vomissements (Alimentaires/Bilieux), Hématémèse (Sang), Dysphagie (Blocage), Pyrosis (Remontées acides)"
                value={formData.upperDigestive}
                onChange={update('upperDigestive')}
                multiline
              />
            </div>

            {/* Section 4 — Signes d'alerte */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm font-bold text-red-700 uppercase mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4" /> 4. Signes d'Alerte Généraux
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Perte de Poids (Quantifiée)"
                  placeholder="Ex: -5kg en 2 mois, Stable, Anorexie (perte d'appétit)"
                  value={formData.weightLoss}
                  onChange={update('weightLoss')}
                />
                <InputField
                  label="Fièvre / Signes infectieux"
                  placeholder="Ex: Fièvre > 38.5°C, Frissons, Sueurs nocturnes"
                  value={formData.fever}
                  onChange={update('fever')}
                  icon={<Thermometer className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Section 5 — Antécédents */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> 5. Terrain & Antécédents
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Antécédents Personnels"
                  placeholder="Ex: Ulcère gastro-duodénal, Lithiase vésiculaire, Chirurgie bariatrique..."
                  value={formData.history}
                  onChange={update('history')}
                  multiline
                />
                <InputField
                  label="Antécédents Familiaux (1er degré)"
                  placeholder="Ex: Cancer Colorectal (Père), Maladie de Crohn (Frère), Polypose..."
                  value={formData.familyHistory}
                  onChange={update('familyHistory')}
                  multiline
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Traitements en cours"
                  placeholder="Ex: AINS (Voltarène/Aspirine), Anticoagulants, IPP..."
                  value={formData.meds}
                  onChange={update('meds')}
                  icon={<Pill className="w-4 h-4" />}
                />
                <InputField
                  label="Mode de Vie / Toxiques"
                  placeholder="Ex: Tabagisme (PA), Alcoolisme chronique, Consommation d'épices..."
                  value={formData.diet}
                  onChange={update('diet')}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full md:w-auto text-lg py-3 px-8 shadow-md"
            >
              {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
              {isAnalyzing ? 'Analyse Clinique IA...' : 'Générer Observation Médicale'}
            </Button>
          </div>
        </div>

        {/* Analysis Result */}
        {formAnalysis && (
          <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 shadow-md">
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
  );
};

export default FormPage;
