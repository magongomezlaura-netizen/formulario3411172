import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSheetsConfig, SurveyResponse } from '../types/survey';
import {
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  Link2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { googleSignIn, logoutGoogle } from '../services/firebase';
import { createGoogleSpreadsheet, appendRowsToSpreadsheet, formatResponseRow } from '../services/googleSheets';

interface GoogleSheetsConnectBarProps {
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  onGoogleAuthChange: (user: FirebaseUser | null, token: string | null) => void;
  sheetsConfig: GoogleSheetsConfig;
  onUpdateSheetsConfig: (newConfig: GoogleSheetsConfig) => void;
  responses: SurveyResponse[];
  onBatchSynced: (updatedResponses: SurveyResponse[]) => void;
}

export const GoogleSheetsConnectBar: React.FC<GoogleSheetsConnectBarProps> = ({
  googleUser,
  googleToken,
  onGoogleAuthChange,
  sheetsConfig,
  onUpdateSheetsConfig,
  responses,
  onBatchSynced
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onGoogleAuthChange(res.user, res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Sesión iniciada con Google (${res.user.email}). Permisos de Google Sheets concedidos.`
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: 'Inicio de sesión cancelado. Puede volver a intentarlo cuando lo requiera.'
        });
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        setStatusMessage({
          type: 'info',
          text: 'Ventana de Google cerrada. Haga clic en Iniciar Sesión para conectar su cuenta.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `No se pudo conectar con Google: ${err.message || 'Intente nuevamente'}`
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      onGoogleAuthChange(null, null);
      setStatusMessage({ type: 'info', text: 'Sesión de Google cerrada.' });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!googleToken) {
      setStatusMessage({
        type: 'error',
        text: 'La sesión actual requiere renovar la autorización del token. Haga clic en "Conectar Google" a continuación.'
      });
      return;
    }

    setIsCreatingSheet(true);
    setStatusMessage(null);
    try {
      const title = `Diagnóstico Ley 594 Valle del Cauca - Usuario 13172327 (${new Date().toLocaleDateString('es-CO')})`;
      const result = await createGoogleSpreadsheet(googleToken, title);
      
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId: result.spreadsheetId,
        spreadsheetTitle: result.title,
        spreadsheetUrl: result.spreadsheetUrl,
        lastSyncTimestamp: new Date().toISOString()
      };

      onUpdateSheetsConfig(newConfig);

      // Now sync all existing responses into the newly created sheet
      if (responses.length > 0) {
        const rows = responses.map(formatResponseRow);
        await appendRowsToSpreadsheet(googleToken, result.spreadsheetId, rows);
        const updated = responses.map((r, idx) => ({
          ...r,
          syncedToSheets: true,
          sheetsRowIndex: idx + 2
        }));
        onBatchSynced(updated);
      }

      setStatusMessage({
        type: 'success',
        text: `¡Hoja de cálculo creada exitosamente en su Google Drive y ${responses.length} respuesta(s) exportadas!`
      });
    } catch (err: any) {
      console.error('Error al crear hoja:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al crear hoja de cálculo. Verifique los permisos de su cuenta.'
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleLinkExistingSheet = (e: React.FormEvent) => {
    e.preventDefault();
    const input = customSheetInput.trim();
    if (!input) return;

    // Extract ID if a full Google Sheets URL was pasted
    let extractedId = input;
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    const newConfig: GoogleSheetsConfig = {
      spreadsheetId: extractedId,
      spreadsheetTitle: `Hoja Vinculada (${extractedId.substring(0, 8)}...)`,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${extractedId}/edit`,
      lastSyncTimestamp: new Date().toISOString()
    };

    onUpdateSheetsConfig(newConfig);
    setShowLinkInput(false);
    setCustomSheetInput('');
    setStatusMessage({
      type: 'success',
      text: `Hoja de cálculo vinculada con ID: ${extractedId}.`
    });
  };

  const handleSyncAllPending = async () => {
    if (!googleToken || !sheetsConfig.spreadsheetId) {
      setStatusMessage({
        type: 'error',
        text: 'Inicie sesión con Google y configure una hoja de cálculo primero.'
      });
      return;
    }

    const pending = responses.filter((r) => !r.syncedToSheets);
    if (pending.length === 0) {
      setStatusMessage({
        type: 'info',
        text: 'Todas las respuestas registradas ya se encuentran sincronizadas con Google Sheets.'
      });
      return;
    }

    setIsSyncingAll(true);
    setStatusMessage(null);
    try {
      const rows = pending.map(formatResponseRow);
      await appendRowsToSpreadsheet(googleToken, sheetsConfig.spreadsheetId, rows);

      const updated = responses.map((r) => ({
        ...r,
        syncedToSheets: true
      }));
      onBatchSynced(updated);

      onUpdateSheetsConfig({
        ...sheetsConfig,
        lastSyncTimestamp: new Date().toISOString()
      });

      setStatusMessage({
        type: 'success',
        text: `¡Se enviaron con éxito ${pending.length} respuesta(s) a su hoja de cálculo!`
      });
    } catch (err: any) {
      console.error('Error al sincronizar:', err);
      setStatusMessage({
        type: 'error',
        text: `Error de sincronización: ${err.message || 'Verifique la conexión'}`
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const pendingCount = responses.filter((r) => !r.syncedToSheets).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Status info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Integración con Google Sheets
              </h2>
              {googleUser ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Conectado con {googleUser.email}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                  <AlertCircle className="w-3 h-3 text-amber-600" /> Requiere Conexión
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Las respuestas diligenciadas por el usuario <strong>13172327</strong> se exportan en tiempo real a una hoja de cálculo en su Google Drive.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {!googleUser || !googleToken ? (
            /* Sign in with Google / Re-authorize Token */
            <button
              onClick={handleLogin}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-sm transition-all hover:shadow hover:border-slate-400 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>
                {isSigningIn
                  ? 'Conectando con Google...'
                  : googleUser
                  ? 'Conceder Permisos de Google Sheets'
                  : 'Iniciar Sesión con Google'}
              </span>
            </button>
          ) : (
            <>
              {sheetsConfig.spreadsheetId ? (
                <>
                  <a
                    href={sheetsConfig.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Abrir en Google Sheets</span>
                    <ExternalLink className="w-3 h-3 text-emerald-200" />
                  </a>

                  {pendingCount > 0 && (
                    <button
                      onClick={handleSyncAllPending}
                      disabled={isSyncingAll}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                      <span>Sincronizar {pendingCount} pendientes</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleCreateNewSheet}
                  disabled={isCreatingSheet}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  <PlusCircle className={`w-4 h-4 ${isCreatingSheet ? 'animate-spin' : ''}`} />
                  <span>{isCreatingSheet ? 'Creando Hoja...' : 'Crear Hoja en Google Drive'}</span>
                </button>
              )}

              <button
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Vincular a otra hoja o cambiar ID"
              >
                <Link2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Cerrar sesión de Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sheet Details row if connected */}
      {sheetsConfig.spreadsheetId && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Hoja vinculada:</span>
            <span className="text-emerald-700 font-medium truncate max-w-xs">{sheetsConfig.spreadsheetTitle}</span>
            <span className="text-slate-400 font-mono text-[11px]">({sheetsConfig.spreadsheetId.substring(0, 14)}...)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              {responses.length} fila(s) totales registradas
            </span>
            {!showLinkInput && (
              <button
                onClick={handleCreateNewSheet}
                disabled={isCreatingSheet}
                className="text-[11px] text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                + Crear nueva hoja
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom Link Input Drawer */}
      {showLinkInput && (
        <form onSubmit={handleLinkExistingSheet} className="mt-3.5 pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={customSheetInput}
            onChange={(e) => setCustomSheetInput(e.target.value)}
            placeholder="Pegue aquí el enlace de su hoja de cálculo o el ID (ej: 1BxiMVs0XR...)"
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Vincular Hoja
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`mt-3.5 p-3 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border border-rose-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
            {(statusMessage.text.includes('Permisos') || statusMessage.text.includes('renovar')) && (
              <button
                type="button"
                onClick={handleLogin}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Autorizar Permisos en Google
              </button>
            )}
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold shrink-0 ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
