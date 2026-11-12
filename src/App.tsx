import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { UserGateView } from './components/UserGateView';
import { UserSessionModal } from './components/UserSessionModal';
import { LegalInfoModal } from './components/LegalInfoModal';
import { SurveyResponse, GoogleSheetsConfig } from './types/survey';
import { INITIAL_RESPONSES } from './data/causes';
import { initAuth, setAccessToken } from './services/firebase';
import { Shield } from 'lucide-react';

const RESPONSES_STORAGE_KEY = 'valle_cauca_ley594_responses_v1';
const SHEETS_CONFIG_KEY = 'valle_cauca_ley594_sheets_config_v1';
const USER_ID_KEY = 'valle_cauca_ley594_user_id';
const USER_NAME_KEY = 'valle_cauca_ley594_user_name';
const UNLOCKED_SESSION_KEY = 'valle_cauca_unlocked_13172327';

export default function App() {
  // User Session: User explicitly specified: 13172327
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(USER_ID_KEY) || '13172327';
  });
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return localStorage.getItem(USER_NAME_KEY) || 'Usuario 13172327 (Investigador)';
  });

  // View state: 'form' (Formulario SEPARADO) vs 'responses' (Respuestas protegidas)
  const [activeView, setActiveView] = useState<'form' | 'responses'>('form');

  // Gate state: only unlocked by entering user "13172327"
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(UNLOCKED_SESSION_KEY) === 'true';
  });

  // Google Auth & Sheets Token
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Sheets Config
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem(SHEETS_CONFIG_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      spreadsheetId: null,
      spreadsheetTitle: 'Diagnóstico Gestión Documental - Valle del Cauca (Usuario 13172327)',
      spreadsheetUrl: null,
      lastSyncTimestamp: null
    };
  });

  // Survey responses
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem(RESPONSES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_RESPONSES;
  });

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        if (token) {
          setGoogleToken(token);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save responses to localStorage
  useEffect(() => {
    localStorage.setItem(RESPONSES_STORAGE_KEY, JSON.stringify(responses));
  }, [responses]);

  // Save sheets config to localStorage
  useEffect(() => {
    localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  // Save user ID to localStorage
  useEffect(() => {
    localStorage.setItem(USER_ID_KEY, currentUserId);
    localStorage.setItem(USER_NAME_KEY, currentUserName);
  }, [currentUserId, currentUserName]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem(UNLOCKED_SESSION_KEY, 'true');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem(UNLOCKED_SESSION_KEY);
  };

  const handleUpdateUser = (newId: string, newName: string) => {
    setCurrentUserId(newId);
    setCurrentUserName(newName);
  };

  const handleAddResponse = (newResponse: SurveyResponse) => {
    setResponses((prev) => [newResponse, ...prev]);
  };

  const handleGoogleAuthChange = (user: FirebaseUser | null, token: string | null) => {
    setGoogleUser(user);
    setGoogleToken(token);
    setAccessToken(token);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* Institutional Top Header with separated view navigation */}
      <Header
        currentUserId={currentUserId}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        googleUser={googleUser}
        hasSheetsConfig={!!sheetsConfig.spreadsheetId}
        sheetsUrl={sheetsConfig.spreadsheetUrl}
        activeView={activeView}
        onChangeView={(view) => setActiveView(view)}
        isUnlocked={isUnlocked}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* SEPARATED VIEW 1: Formulario de Diagnóstico (Solo el formulario) */}
        {activeView === 'form' && (
          <div className="space-y-6 animate-fade-in">
            <SurveyForm
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              googleToken={googleToken}
              sheetsConfig={sheetsConfig}
              onAddResponse={handleAddResponse}
              onRequireSheetsLogin={() => {
                setActiveView('responses');
              }}
            />
          </div>
        )}

        {/* SEPARATED VIEW 2: Respuestas y Google Sheets (Protegido por usuario 13172327) */}
        {activeView === 'responses' && (
          <UserGateView
            isUnlocked={isUnlocked}
            onUnlock={handleUnlock}
            onLock={handleLock}
            currentUserId={currentUserId}
            googleUser={googleUser}
            googleToken={googleToken}
            onGoogleAuthChange={handleGoogleAuthChange}
            sheetsConfig={sheetsConfig}
            onUpdateSheetsConfig={setSheetsConfig}
            responses={responses}
            onBatchSynced={(updated) => setResponses(updated)}
            onUpdateResponses={setResponses}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Investigación de Gestión Documental en el Valle del Cauca • Lineamientos del Archivo General de la Nación (Ley 594 de 2000)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="text-emerald-400 hover:underline font-mono font-bold"
            >
              Usuario: {currentUserId}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Normatividad AGN
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserSessionModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onUpdateUser={handleUpdateUser}
      />

      <LegalInfoModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
