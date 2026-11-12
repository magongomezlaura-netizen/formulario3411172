import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { SurveyResponse, GoogleSheetsConfig } from '../types/survey';
import { GoogleSheetsConnectBar } from './GoogleSheetsConnectBar';
import { ResultsDashboard } from './ResultsDashboard';
import { ResponsesHistory } from './ResponsesHistory';
import {
  Lock,
  Unlock,
  KeyRound,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  ListOrdered,
  LogOut,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UserGateViewProps {
  isUnlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
  currentUserId: string;
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  onGoogleAuthChange: (user: FirebaseUser | null, token: string | null) => void;
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSheetsConfig: (newConfig: GoogleSheetsConfig) => void;
  responses: SurveyResponse[];
  onBatchSynced: (updated: SurveyResponse[]) => void;
  onUpdateResponses: (updated: SurveyResponse[]) => void;
}

export const UserGateView: React.FC<UserGateViewProps> = ({
  isUnlocked,
  onUnlock,
  onLock,
  currentUserId,
  googleUser,
  googleToken,
  onGoogleAuthChange,
  sheetsConfig,
  onUpdateSheetsConfig,
  responses,
  onBatchSynced,
  onUpdateResponses
}) => {
  const [userInput, setUserInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'history'>('dashboard');

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = userInput.trim();
    if (trimmed === '13172327') {
      onUnlock();
      setUserInput('');
    } else {
      setErrorMessage('Número de usuario incorrecto. Solo el usuario "13172327" tiene autorización para acceder a las respuestas y la hoja de cálculo de Google.');
    }
  };

  // IF LOCKED: Show the authentication gate
  if (!isUnlocked) {
    return (
      <div className="max-w-xl mx-auto my-10 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold">
              Acceso Restringido a Respuestas y Hoja de Cálculo
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-md mx-auto">
              Para consultar las respuestas de las entidades del Valle del Cauca y acceder a la hoja de cálculo de Google, ingrese con su número de usuario <strong>13172327</strong>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleValidate} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Número de Usuario Autorizado:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ingrese 13172327"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  autoFocus
                  required
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                <span>Usuario asignado por la investigación: <strong>13172327</strong></span>
                <button
                  type="button"
                  onClick={() => setUserInput('13172327')}
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Autocompletar 13172327
                </button>
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar con Usuario 13172327 (Pase Directo)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Security note */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
            Seguridad conforme al Sistema Nacional de Archivos (SNA) y Ley 594 de 2000.
          </div>
        </div>
      </div>
    );
  }

  // IF UNLOCKED: Show the responses, stats, and direct pass to Google Sheets!
  return (
    <div className="space-y-6 animate-fade-in">
      {/* DIRECT PASS TO GOOGLE SHEETS BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-emerald-700/60 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-emerald-950">
                Pase Directo Activo
              </span>
              <span className="text-xs text-emerald-200 font-mono font-semibold">
                Usuario: 13172327
              </span>
            </div>
            <h2 className="text-lg font-bold mt-1">
              Hoja de Cálculo de Google (Ley 594 de 2000)
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Acceso directo a las respuestas sincronizadas en su Google Drive para el Valle del Cauca.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {sheetsConfig.spreadsheetUrl ? (
            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-transform transform hover:-translate-y-0.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-950" />
              <span>Abrir Hoja de Cálculo en Google Sheets</span>
              <ExternalLink className="w-4 h-4 text-emerald-950" />
            </a>
          ) : (
            <span className="text-xs text-emerald-200 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-600/40">
              Configure o cree la hoja a continuación para el pase directo
            </span>
          )}

          <button
            onClick={onLock}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            title="Bloquear acceso de respuestas"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Bloquear Acceso</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Connection Bar */}
      <GoogleSheetsConnectBar
        googleUser={googleUser}
        googleToken={googleToken}
        onGoogleAuthChange={onGoogleAuthChange}
        sheetsConfig={sheetsConfig}
        onUpdateSheetsConfig={onUpdateSheetsConfig}
        responses={responses}
        onBatchSynced={onBatchSynced}
      />

      {/* Sub Tabs: Dashboard vs Raw History */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-2xs px-2 pt-2 gap-2">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'dashboard'
              ? 'border-emerald-700 text-emerald-850 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          <span>Panel de Estadísticas y Resultados ({responses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'history'
              ? 'border-emerald-700 text-emerald-850 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4 text-emerald-700" />
          <span>Tabla Histórica de Respuestas y Exportación</span>
        </button>
      </div>

      {activeSubTab === 'dashboard' ? (
        <ResultsDashboard responses={responses} />
      ) : (
        <ResponsesHistory
          responses={responses}
          googleToken={googleToken}
          sheetsConfig={sheetsConfig}
          onUpdateResponses={onUpdateResponses}
          onRequireSheetsLogin={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};
