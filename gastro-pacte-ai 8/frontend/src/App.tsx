import React, { useState } from 'react';
import { Page } from './types';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';
import FormPage from './pages/FormPage';
import DoctorPage from './pages/DoctorPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.WELCOME);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentPage === Page.WELCOME && <ChatPage />}
        {currentPage === Page.FORM    && <FormPage />}
        {currentPage === Page.DOCTOR  && <DoctorPage />}
      </main>
    </div>
  );
}
