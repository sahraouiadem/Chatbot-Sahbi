interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const process:
  | {
      env: {
        GEMINI_API_KEY?: string;
        API_KEY?: string;
      };
    }
  | undefined;
