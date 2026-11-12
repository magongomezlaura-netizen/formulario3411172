import React from 'react';
import { Landmark, User, FileText, CheckCircle2, Cloud, CloudOff, Info, Lock, Unlock, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentUserId: string;
  onOpenUserModal: () => void;
  onOpenLegalModal: () => void;
  googleUser: FirebaseUser | null;
  hasSheetsConfig: boolean;
  sheetsUrl: string | null;
  activeView: 'form' | 'responses';
  onChangeView: (view: 'form' | 'responses') => void;
  isUnlocked: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUserId,
  onOpenUserModal,
  onOpenLegalModal,
  googleUser,
  hasSheetsConfig,
  sheetsUrl,
  activeView,
  onChangeView,
  isUnlocked
}) => {
  return (
    <header className="bg-slate-900 border-b border-emerald-950 text-white shadow-lg sticky top-0 z-30">
      {/* Top Colombian / Valle del Cauca Institutional Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 py-1.5 px-4 text-[11px] font-medium text-emerald-200 border-b border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>REPÚBLICA DE COLOMBIA • DEPARTAMENTO DEL VALLE DEL CAUCA</span>
          <span className="hidden md:inline text-emerald-400">|</span>
          <span className="hidden md:inline">SISTEMA NACIONAL DE ARCHIVOS (SNA) • LEY 594 DE 2000</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLegalModal}
            className="inline-flex items-center gap-1 text-emerald-200 hover:text-white hover:underline transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Consultar Marco Normativo y Sanciones</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title & Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md ring-2 ring-emerald-500/30 shrink-0">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Diagnóstico de Gestión Documental
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Valle del Cauca
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              Evaluación de causas de incumplimiento en entidades públicas y privadas con funciones públicas (Ley 594 de 2000)
            </p>
          </div>
        </div>

        {/* View Switcher: Formulario SEPARADO de Respuestas */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => onChangeView('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'form'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Formulario</span>
          </button>

          <button
            onClick={() => onChangeView('responses')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'responses'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {isUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>2. Respuestas y Sheets</span>
          </button>
        </div>

        {/* User Badge & Google Sheets Quick Pass */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* User Button: 13172327 */}
          <button
            onClick={onOpenUserModal}
            type="button"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-xs text-slate-200 transition-all shadow-sm"
            title="Identificación de usuario para envío de respuestas"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-700 group-hover:bg-emerald-600 flex items-center justify-center text-white shrink-0 font-bold transition-colors">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  Usuario
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="font-mono font-bold text-white text-xs">
                {currentUserId}
              </div>
            </div>
          </button>

          {/* Quick Direct Pass to Google Sheets if available */}
          {sheetsUrl && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
              title="Pase directo a la hoja de cálculo de Google"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pase Directo Sheets</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
