import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  onUpdateUser: (newId: string, newName: string) => void;
}

export const UserSessionModal: React.FC<UserSessionModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  onUpdateUser
}) => {
  const [userIdInput, setUserIdInput] = useState(currentUserId);
  const [userNameInput, setUserNameInput] = useState(currentUserName);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim()) return;
    onUpdateUser(userIdInput.trim(), userNameInput.trim() || `Usuario ${userIdInput.trim()}`);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 900);
  };

  const handleResetToDefault = () => {
    setUserIdInput('13172327');
    setUserNameInput('Usuario 13172327 (Investigador)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Identificación de Usuario</h3>
              <p className="text-xs text-slate-300">Responsable del Registro y Envío a Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong>Usuario Autorizado: 13172327</strong>
              <p className="text-emerald-800 mt-0.5">
                Todas las respuestas diligenciadas se registrarán con este identificador y quedarán consignadas en la columna de autoría de la hoja de cálculo de Google.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Identificador de Usuario / Cédula / Código:
            </label>
            <div className="relative">
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                placeholder="13172327"
                required
              />
              <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Usuario predeterminado según solicitud: <strong>13172327</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nombre o Cargo del Investigador:
            </label>
            <input
              type="text"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              placeholder="Investigador / Auditor Ley 594"
            />
          </div>

          {successMsg && (
            <div className="p-2.5 bg-emerald-100 text-emerald-900 text-xs font-medium rounded-lg text-center">
              ✓ Usuario actualizado correctamente
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer a 13172327
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Guardar Usuario
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
