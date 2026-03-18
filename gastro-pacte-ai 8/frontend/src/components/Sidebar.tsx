import React from 'react';
import { MessageCircle, ClipboardList, Mic, Stethoscope } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => (
  <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col items-center lg:items-stretch py-6 flex-shrink-0 z-10 transition-all">
    {/* Logo */}
    <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
      <div className="bg-teal-500 p-2 rounded-lg">
        <Stethoscope className="w-6 h-6 text-white" />
      </div>
      <span className="font-bold text-xl hidden lg:block">Gastro-Pacte</span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 space-y-2 px-2">
      <button
        onClick={() => onNavigate(Page.WELCOME)}
        className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${
          currentPage === Page.WELCOME
            ? 'bg-teal-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden lg:block font-medium">Chatbot Tunisien</span>
      </button>

      <button
        onClick={() => onNavigate(Page.FORM)}
        className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${
          currentPage === Page.FORM
            ? 'bg-teal-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <ClipboardList className="w-6 h-6" />
        <span className="hidden lg:block font-medium">Pré-Consultation</span>
      </button>

      <button
        onClick={() => onNavigate(Page.DOCTOR)}
        className={`w-full p-3 lg:px-4 rounded-lg flex items-center gap-3 transition-colors ${
          currentPage === Page.DOCTOR
            ? 'bg-teal-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Mic className="w-6 h-6" />
        <span className="hidden lg:block font-medium">Espace Docteur</span>
      </button>
    </nav>

    {/* Status indicator */}
    <div className="mt-auto px-4">
      <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="hidden lg:block text-xs text-slate-400">Gemini 1.5 Actif</span>
      </div>
    </div>
  </div>
);

export default Sidebar;
