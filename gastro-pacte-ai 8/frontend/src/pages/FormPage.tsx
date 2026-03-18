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

type Lang = 'fr' | 'ar';

const TEXT = {
  fr: {
    pageTitle: 'Formulaire Pré-Consultation (Recherche Gastro)',
    langLabel: 'Langue:',
    langFr: 'Français',
    langAr: 'العربية (تونسي)',
    sec1: '1. Identité du Patient',
    fullName: 'Nom et Prénom',
    fullNamePh: 'Ben Ahmed Walid',
    age: 'Âge',
    agePh: 'Ex: 45 ans',
    gender: 'Sexe',
    genderPh: 'H / F',
    sec2: '2. Caractéristiques de la Douleur',
    motif: 'Motif Principal (En 1 mot)',
    motifPh: 'Ex: Épigastralgie, Dysphagie, Diarrhée...',
    duration: 'Depuis combien de temps ?',
    durationPh: 'Ex: Aigu (2 jours), Chronique (3 mois)...',
    intensity: 'Intensité Douleur',
    intensityPh: 'Note de 1 à 10',
    painType: 'Type de Douleur',
    painTypePh: 'Ex: Brûlure, Crampe, Torsion, Coup de poignard',
    trigger: 'Facteur Déclenchant / Calmant',
    triggerPh: 'Ex: À jeun, Post-prandiale (après repas), Nocturne',
    sec3: '3. Transit & Digestion',
    transit: 'Transit Intestinal',
    transitPh: 'Ex: Diarrhée liquide, Constipation opiniâtre, Alternance, Faux besoins',
    stool: 'Aspect des Selles (Crucial)',
    stoolPh: 'Ex: Méléna (Noir goudron), Rectorragie (Sang rouge), Décolorées (Blanc/Mastic), Glaireuses',
    upper: 'Signes Digestifs Hauts',
    upperPh: 'Ex: Vomissements (Alimentaires/Bilieux), Hématémèse (Sang), Dysphagie (Blocage), Pyrosis (Remontées acides)',
    sec4: "4. Signes d'Alerte Généraux",
    weight: 'Perte de Poids (Quantifiée)',
    weightPh: "Ex: -5kg en 2 mois, Stable, Anorexie (perte d'appétit)",
    fever: 'Fièvre / Signes infectieux',
    feverPh: 'Ex: Fièvre > 38.5°C, Frissons, Sueurs nocturnes',
    sec5: '5. Terrain & Antécédents',
    history: 'Antécédents Personnels',
    historyPh: 'Ex: Ulcère gastro-duodénal, Lithiase vésiculaire, Chirurgie bariatrique...',
    family: 'Antécédents Familiaux (1er degré)',
    familyPh: 'Ex: Cancer Colorectal (Père), Maladie de Crohn (Frère), Polypose...',
    meds: 'Traitements en cours',
    medsPh: 'Ex: AINS (Voltarène/Aspirine), Anticoagulants, IPP...',
    lifestyle: 'Mode de Vie / Toxiques',
    lifestylePh: "Ex: Tabagisme (PA), Alcoolisme chronique, Consommation d'épices...",
    analyzing: 'Analyse Clinique IA...',
    submit: 'Générer Observation Médicale',
    analysisTitle: 'Synthèse Médicale (Générée par IA)',
    saved: 'SAUVEGARDÉ (MOCK)',
    disclaimer: "Ce document est une aide à la décision et ne remplace pas l'examen clinique.",
    analysisError: "Erreur lors de l'analyse ou de la connexion serveur.",
  },
  ar: {
    pageTitle: 'استمارة ما قبل الاستشارة (أمراض الجهاز الهضمي)',
    langLabel: 'اللغة:',
    langFr: 'Français',
    langAr: 'العربية (تونسي)',
    sec1: '1. هوية المريض',
    fullName: 'الاسم واللقب',
    fullNamePh: 'بن أحمد وليد',
    age: 'العمر',
    agePh: 'مثال: 45 سنة',
    gender: 'الجنس',
    genderPh: 'ذكر / أنثى',
    sec2: '2. خصائص الوجيعة',
    motif: 'السبب الرئيسي (في كلمة)',
    motifPh: 'مثال: وجيعة فم المعدة، صعوبة بلع، إسهال...',
    duration: 'منذ متى؟',
    durationPh: 'مثال: حاد (يومين)، مزمن (3 شهور)...',
    intensity: 'شدة الوجيعة',
    intensityPh: 'من 1 حتى 10',
    painType: 'نوع الوجيعة',
    painTypePh: 'مثال: حرقة، تشنج، لويان، طعنة',
    trigger: 'شنوّا يزيدها/ينقصها',
    triggerPh: 'مثال: على الريق، بعد الماكلة، بالليل',
    sec3: '3. العبور والهضم',
    transit: 'حالة العبور المعوي',
    transitPh: 'مثال: إسهال سائل، إمساك شديد، تناوب، إحساس بالحاجة',
    stool: 'شكل البراز (مهم)',
    stoolPh: 'مثال: أسود قطراني، دم أحمر، فاتح برشة، مخاطي',
    upper: 'علامات هضمية علوية',
    upperPh: 'مثال: تقيّؤ (غذائي/صفراوي)، تقيّؤ دموي، صعوبة بلع، حرقة وارتجاع',
    sec4: '4. علامات إنذار عامة',
    weight: 'نقصان الوزن (بالكمية)',
    weightPh: 'مثال: -5 كلغ في شهرين، ثابت، نقص شهية',
    fever: 'سخانة / علامات عدوى',
    feverPh: 'مثال: سخانة أكثر من 38.5، قشعريرة، تعرّق ليلي',
    sec5: '5. السوابق والخلفية الصحية',
    history: 'سوابق شخصية',
    historyPh: 'مثال: قرحة معدية، حصى المرارة، جراحة سمنة...',
    family: 'سوابق عائلية (درجة أولى)',
    familyPh: 'مثال: سرطان قولون (الأب)، كرون (الأخ)، بوليبوز...',
    meds: 'العلاجات الحالية',
    medsPh: 'مثال: مضادات الالتهاب، مميّعات دم، IPP...',
    lifestyle: 'نمط العيش / المواد',
    lifestylePh: 'مثال: تدخين، كحول، أكلات حارة برشة...',
    analyzing: 'جاري التحليل بالذكاء الاصطناعي...',
    submit: 'إخراج الملاحظة الطبية',
    analysisTitle: 'الخلاصة الطبية (مولّدة بالذكاء الاصطناعي)',
    saved: 'محفوظ (تجريبي)',
    disclaimer: 'هذه الوثيقة مساعدة ولا تعوّض الفحص السريري.',
    analysisError: 'صار خطأ أثناء التحليل أو الاتصال بالسيرفر.',
  },
} as const;

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState<GastroFormData>(INITIAL_FORM_DATA);
  const [formAnalysis, setFormAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lang, setLang] = useState<Lang>('fr');

  const t = TEXT[lang];
  const isArabic = lang === 'ar';

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
      setFormAnalysis(t.analysisError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200" dir={isArabic ? 'rtl' : 'ltr'}>
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-teal-600" />
              {t.pageTitle}
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">{t.langLabel}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
              >
                <option value="fr">{t.langFr}</option>
                <option value="ar">{t.langAr}</option>
              </select>
              <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Hopital-Connect: OFFLINE
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1 — Identité */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <User className="w-4 h-4" /> {t.sec1}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.fullName}
                  placeholder={t.fullNamePh}
                  value={formData.fullName}
                  onChange={update('fullName')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label={t.age}
                    placeholder={t.agePh}
                    value={formData.age}
                    onChange={update('age')}
                  />
                  <InputField
                    label={t.gender}
                    placeholder={t.genderPh}
                    value={formData.gender}
                    onChange={update('gender')}
                  />
                </div>
              </div>
            </div>

            {/* Section 2 — Douleur */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t.sec2}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.motif}
                  placeholder={t.motifPh}
                  value={formData.motif}
                  onChange={update('motif')}
                  icon={<AlertCircle className="w-4 h-4" />}
                />
                <InputField
                  label={t.duration}
                  placeholder={t.durationPh}
                  value={formData.duration}
                  onChange={update('duration')}
                  icon={<Clock className="w-4 h-4" />}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <InputField
                  label={t.intensity}
                  placeholder={t.intensityPh}
                  type="number"
                  value={formData.painIntensity}
                  onChange={update('painIntensity')}
                />
                <InputField
                  label={t.painType}
                  placeholder={t.painTypePh}
                  value={formData.painType}
                  onChange={update('painType')}
                />
                <InputField
                  label={t.trigger}
                  placeholder={t.triggerPh}
                  value={formData.painTrigger}
                  onChange={update('painTrigger')}
                />
              </div>
            </div>

            {/* Section 3 — Transit */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t.sec3}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.transit}
                  placeholder={t.transitPh}
                  value={formData.transit}
                  onChange={update('transit')}
                />
                <InputField
                  label={t.stool}
                  placeholder={t.stoolPh}
                  value={formData.stoolColor}
                  onChange={update('stoolColor')}
                  icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                />
              </div>
              <InputField
                label={t.upper}
                placeholder={t.upperPh}
                value={formData.upperDigestive}
                onChange={update('upperDigestive')}
                multiline
              />
            </div>

            {/* Section 4 — Signes d'alerte */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm font-bold text-red-700 uppercase mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4" /> {t.sec4}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.weight}
                  placeholder={t.weightPh}
                  value={formData.weightLoss}
                  onChange={update('weightLoss')}
                />
                <InputField
                  label={t.fever}
                  placeholder={t.feverPh}
                  value={formData.fever}
                  onChange={update('fever')}
                  icon={<Thermometer className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Section 5 — Antécédents */}
            <div>
              <h3 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> {t.sec5}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.history}
                  placeholder={t.historyPh}
                  value={formData.history}
                  onChange={update('history')}
                  multiline
                />
                <InputField
                  label={t.family}
                  placeholder={t.familyPh}
                  value={formData.familyHistory}
                  onChange={update('familyHistory')}
                  multiline
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label={t.meds}
                  placeholder={t.medsPh}
                  value={formData.meds}
                  onChange={update('meds')}
                  icon={<Pill className="w-4 h-4" />}
                />
                <InputField
                  label={t.lifestyle}
                  placeholder={t.lifestylePh}
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
              {isAnalyzing ? t.analyzing : t.submit}
            </Button>
          </div>
        </div>

        {/* Analysis Result */}
        {formAnalysis && (
          <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 shadow-md" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                <Stethoscope className="w-6 h-6" />
                {t.analysisTitle}
              </h3>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold border border-green-200">
                {t.saved}
              </span>
            </div>
            <div className="bg-white p-6 rounded-lg border border-teal-100 shadow-inner">
              <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                {formAnalysis}
              </pre>
            </div>
            <p className="text-xs text-center text-teal-600 mt-4 opacity-70">
              {t.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPage;
