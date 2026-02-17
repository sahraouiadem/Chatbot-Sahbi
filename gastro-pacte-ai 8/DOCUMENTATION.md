## 1. Vue d'ensemble du projet

Nom: Gastro-Pacte AI
Description: Assistant médical intelligent pour la gastro-entérologie avec chatbot tunisien, pré-consultation et dictaphone médecin.

Objectif:
Gastro-Pacte AI est conçu comme un assistant médical dédié aux services de gastro-entérologie des hôpitaux tunisiens. L'application vise à fluidifier le parcours patient et à assister les médecins dans leurs tâches administratives et de diagnostic préliminaire.

Fonctionnalités clés:
1. Chatbot en dialecte tunisien: Un assistant conversationnel qui interagit avec les patients en Derja tunisienne pour recueillir les symptômes.
2. Formulaire de pré-consultation: Un questionnaire structuré permettant de préparer l'examen clinique.
3. Dictaphone intelligent: Un outil de transcription audio pour les médecins, optimisé pour les comptes-rendus médicaux.

Utilisateurs cibles:
- Patients (interaction avec le chatbot et le formulaire).
- Médecins (utilisation du dictaphone et consultation des résumés générés).

Le projet a été créé via Google AI Studio et exploite la puissance des modèles Gemini.

## 2. Stack Technique

L'application est une Single Page Application (SPA) moderne fonctionnant intégralement côté client.

- Framework: React 19.2.4 avec TypeScript 5.8.
- Outils de build: Vite 6.2 (serveur de développement et bundler).
- IA: SDK @google/genai pour l'intégration directe de l'API Gemini.
- Styles: Tailwind CSS (chargé via CDN dans index.html).
- Icônes: Lucide React.
- Architecture: 100% client-side, sans backend dédié.
- Persistance: localStorage pour le MVP (avec une structure préparée pour une intégration serveur hospitalier).

## 3. Structure du Projet

Le projet suit une structure simple et plate:

- index.html: Point d'entrée principal. Il contient le chargement du CDN Tailwind, la police Inter et les import maps pour la gestion des modules ESM.
- index.tsx: Point de montage React utilisant le mode StrictMode.
- App.tsx: Composant monolithique contenant l'intégralité de la logique de l'application (794 lignes), incluant les composants, les gestionnaires d'événements, l'état et l'interface utilisateur.
- types.ts: Définitions des types TypeScript, notamment l'énumération Page, l'interface ChatMessage, l'interface GastroFormData et l'objet INITIAL_FORM_DATA.
- metadata.json: Métadonnées de l'application pour AI Studio (nom, description, autorisations pour le microphone).
- vite.config.ts: Configuration de Vite gérant l'injection des variables d'environnement (GEMINI_API_KEY mappé sur process.env.API_KEY).
- package.json: Liste des dépendances et scripts de commande.
- tsconfig.json: Configuration de TypeScript (ES2022, résolution de modules de type bundler, react-jsx).

## 4. Architecture Applicative

L'application repose sur une architecture monolithique centrée sur le fichier App.tsx. Il n'y a pas de fichiers de composants séparés.

### 4.1 Navigation (Pages)

La navigation est gérée par l'énumération Page et un rendu conditionnel au sein du composant principal, sans bibliothèque de routage externe.

| Page | Valeur Enum | Description |
|------|-----------|-------------|
| Chatbot Tunisien | Page.WELCOME | Interface de discussion avec l'IA parlant le dialecte tunisien. |
| Pré-Consultation | Page.FORM | Formulaire structuré pour l'anamnèse en gastro-entérologie. |
| Espace Docteur | Page.DOCTOR | Outil de dictée audio avec transcription automatique par l'IA. |

La barre latérale (Sidebar) est de couleur "dark slate" et propose une navigation par icônes. Elle est responsive (icônes seules sur mobile, libellés complets sur écrans larges). Un indicateur de statut "Gemini 1.5 Actif" est présent en bas de la barre.

### 4.2 Composants internes (dans App.tsx)

- Button: Composant de bouton générique supportant plusieurs variantes (primary/teal, secondary, danger, ghost).
- InputField: Champ de saisie avec label et icône optionnelle, gérant les types texte, nombre et multiligne (textarea).
- App: Composant racine orchestrant l'état global et les trois vues principales.

## 5. Intégration IA (Google Gemini)

### 5.1 Configuration

- Modèle utilisé: gemini-3-flash-preview pour l'ensemble des fonctionnalités.
- Clé API: Récupérée depuis la variable d'environnement GEMINI_API_KEY.
- Instanciation: Le client est créé via new GoogleGenAI({ apiKey: process.env.API_KEY }) à chaque requête (pas de singleton).

### 5.2 Chatbot (TUNISIAN_SYSTEM_PROMPT)

Le prompt système définit le comportement suivant:
- Langue: Exclusivement en Derja tunisienne, de préférence en alphabet latin.
- Ton: Chaleureux et empathique (utilisation d'expressions comme "3aslema", "ya khouya").
- Rôle: Écouter les symptômes gastro-intestinaux.
- Sécurité: Redirection immédiate vers les urgences en cas de signes de gravité (sang dans les selles, évanouissement, douleur intense, perte de poids rapide).
- Limites: Ne jamais poser de diagnostic définitif.
- Orientation: Suggérer de remplir le formulaire de pré-consultation si une visite médicale est nécessaire.
- Historique: Les 6 derniers messages sont concaténés dans le prompt pour maintenir le contexte.

### 5.3 Formulaire d'analyse (FORM_ANALYSIS_PROMPT)

Le prompt instruit le modèle pour agir en tant que gastro-entérologue senior. Il génère une "Observation Médicale d'Entrée" structurée en français avec les sections suivantes:
- Identité
- Motif / Douleur
- Signes Digestifs
- Signes Généraux
- Contexte

Le résultat est sauvegardé dans le localStorage via la fonction simulée saveToHospitalServer().

### 5.4 Transcription Audio (DOCTOR_TRANSCRIPTION_PROMPT)

Le modèle effectue une transcription fidèle (verbatim). Les instructions sont strictes: pas de résumé, pas de formatage ajouté, pas d'invention.
Le flux audio est capturé via l'API MediaRecorder, converti en Blob puis en Base64, et envoyé comme inlineData.
L'application tente de détecter le type MIME supporté dans l'ordre: webm, mp4, ogg, wav. Le résultat est téléchargeable au format .txt.

## 6. Flux de Données

### 6.1 Flux du Chat
1. Saisie utilisateur -> setChatInput.
2. Appel à handleSendMessage().
3. Construction du prompt (système + 6 derniers messages + message actuel).
4. Appel à GoogleGenAI.models.generateContent().
5. Réception de la réponse -> ajout au tableau messages -> rendu.

### 6.2 Flux du Formulaire
1. Saisie des données dans l'objet GastroFormData.
2. Appel à handleAnalyzeForm().
3. Construction du prompt (FORM_ANALYSIS_PROMPT + données du formulaire).
4. Appel à GoogleGenAI.models.generateContent().
5. Réception de la réponse -> setFormAnalysis -> affichage du compte-rendu.
6. Appel à saveToHospitalServer() -> stockage dans localStorage.

### 6.3 Flux Audio
1. startRecording() -> MediaRecorder.start().
2. Accumulation des audioChunks.
3. stopRecordingAndTranscribe() -> MediaRecorder.stop().
4. Conversion Blob -> Base64.
5. Appel à GoogleGenAI avec inlineData.
6. Réception de la transcription -> setAudioTranscription -> affichage et option de téléchargement.

## 7. Gestion d'État (State Management)

L'état est centralisé dans le composant App via des hooks useState.

| Variable d'État | Type | Rôle |
|---------------|------|---------|
| currentPage | Page | Page active dans la navigation. |
| chatInput | string | Texte en cours de saisie dans le chat. |
| messages | ChatMessage[] | Historique de la conversation. |
| isChatLoading | boolean | État de chargement de la réponse du chatbot. |
| formData | GastroFormData | Valeurs actuelles du formulaire. |
| formAnalysis | string \| null | Analyse médicale générée. |
| isFormAnalyzing | boolean | État de chargement de l'analyse du formulaire. |
| isRecording | boolean | Indicateur d'enregistrement audio en cours. |
| audioTranscription | string \| null | Transcription générée. |
| isTranscribing | boolean | État de chargement de la transcription. |
| recordingMimeType | string | Type MIME audio détecté. |

Références (Refs):
- mediaRecorderRef: Instance du MediaRecorder.
- audioChunksRef: Accumulateur des segments de données audio.
- messagesEndRef: Référence pour le défilement automatique vers le bas du chat.

## 8. Persistance des Données

### MVP actuel: localStorage
Les enregistrements sont stockés sous la clé pacte_medical_records. Chaque entrée contient:
- recordId
- timestamp
- patient (données d'identité)
- medicalResume (l'analyse générée)
- status: 'READY_FOR_REVIEW'
- source: 'GASTRO_PACTE_APP_V1'

Il n'y a pas de chiffrement ni de mécanisme de migration de données pour le moment.

### Future prévue: Intégration serveur hospitalier
Le code commenté dans saveToHospitalServer() préfigure une intégration HTTP avec des paramètres tels que HOSPITAL_SERVER_IP, HOSPITAL_SERVER_PORT et HOSPITAL_AUTH_TOKEN.

## 9. Configuration & Variables d'Environnement

| Variable | Fichier | Usage |
|----------|---------|-------|
| GEMINI_API_KEY | .env.local | Clé API Google Gemini. |

Vite injecte cette clé sous process.env.API_KEY et process.env.GEMINI_API_KEY via la directive define de sa configuration.

## 10. Démarrage Rapide

```bash
# 1. Cloner le repo
git clone <repo-url>
cd "gastro-pacte-ai 8"

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
echo "GEMINI_API_KEY=AIzaSyD1PRnrGuyPcfoMzwmKBq_-XkRrZJS_Ajs" > .env.local

# 4. Lancer en mode développement
npm run dev
# L'application est accessible sur http://localhost:3000

# 5. Build de production
npm run build

# 6. Prévisualiser le build
npm run preview
```

## 11. Limitations Connues & Points d'Attention

1. Architecture monolithique: L'intégralité de la logique réside dans App.tsx (794 lignes), ce qui complique la maintenance.
2. Pas de routing: La navigation par rendu conditionnel empêche le "deep linking" et l'utilisation des boutons précédent/suivant du navigateur.
3. Instanciation du client IA: Un nouveau client GoogleGenAI est créé à chaque appel au lieu d'utiliser un singleton.
4. Historique de chat limité: Seuls les 6 derniers messages sont conservés, et l'API multi-turn native de Gemini n'est pas exploitée.
5. Exposition de la clé API: La clé est incluse dans le bundle JavaScript client. Un proxy backend est nécessaire pour une mise en production sécurisée.
6. Absence de tests: Aucun test unitaire, d'intégration ou de bout en bout (e2e).
7. Gestion d'erreurs minimale: Les erreurs sont principalement logguées en console ou affichées de manière brute.
8. Absence de validation: Le formulaire de pré-consultation ne possède aucune validation de champ côté client.
9. Tailwind via CDN: Chargé par balise script, ce qui empêche l'optimisation (purge CSS) lors du build de production.
10. Pas de i18n: Les textes de l'interface sont écrits en dur en français et tunisien.
11. Sécurité des données: Le localStorage n'est pas chiffré, ce qui est problématique pour des données médicales sensibles.
12. Nommage du répertoire: La présence d'un espace dans "gastro-pacte-ai 8" peut engendrer des erreurs dans certains environnements CLI.

## 12. Pistes d'Amélioration

1. Refactorisation: Découper App.tsx en composants isolés (ChatPage, FormPage, DoctorPage, Sidebar, etc.).
2. Routage: Implémenter React Router pour une navigation standard.
3. Sécurité: Mettre en place un backend (Express ou FastAPI) pour agir en tant que proxy vers l'API Gemini.
4. Optimisation IA: Utiliser l'API multi-turn native de Gemini pour une meilleure gestion du contexte de discussion.
5. Formulaires: Intégrer une bibliothèque comme react-hook-form ou Zod pour la validation des données.
6. Stockage: Chiffrer les données locales ou migrer vers une base de données IndexedDB.
7. Qualité de code: Ajouter une suite de tests avec Vitest et React Testing Library.
8. Performance: Installer Tailwind CSS via PostCSS pour bénéficier du tree-shaking.
9. Intégration hospitalière: Finaliser l'implémentation de la communication avec le serveur hospitalier.
10. Authentification: Ajouter un système de connexion pour sécuriser l'accès aux données des patients.