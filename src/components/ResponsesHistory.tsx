import React, { useState, useMemo } from 'react';
import { SurveyResponse, GoogleSheetsConfig } from '../types/survey';
import {
  FileText,
  Search,
  Download,
  UploadCloud,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  Building,
  Check
} from 'lucide-react';
import { appendRowsToSpreadsheet, formatResponseRow } from '../services/googleSheets';

interface ResponsesHistoryProps {
  responses: SurveyResponse[];
  googleToken: string | null;
  sheetsConfig: GoogleSheetsConfig;
  onUpdateResponses: (updated: SurveyResponse[]) => void;
  onRequireSheetsLogin: () => void;
}

export const ResponsesHistory: React.FC<ResponsesHistoryProps> = ({
  responses,
  googleToken,
  sheetsConfig,
  onUpdateResponses,
  onRequireSheetsLogin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const q = searchTerm.toLowerCase();
      return (
        r.entityName.toLowerCase().includes(q) ||
        r.municipality.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        r.q1Cause.toLowerCase().includes(q) ||
        r.q2Cause.toLowerCase().includes(q) ||
        r.q3Cause.toLowerCase().includes(q)
      );
    });
  }, [responses, searchTerm]);

  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID',
      'Marca Temporal',
      'Usuario ID',
      'Investigador',
      'Entidad',
      'Tipo de Entidad',
      'Municipio',
      'Cargo',
      'Pregunta 1 (Causa Principal)',
      'Pregunta 2 (Obstáculo)',
      'Pregunta 3 (Prioridad)',
      'Nivel Cumplimiento (%)',
      'Observaciones',
      'Sincronizado a Sheets'
    ];

    const rows = responses.map((r) => [
      `"${r.id}"`,
      `"${r.timestamp}"`,
      `"${r.userId}"`,
      `"${r.userFullName}"`,
      `"${r.entityName.replace(/"/g, '""')}"`,
      `"${r.entityType === 'publica' ? 'Pública' : 'Privada con funciones públicas'}"`,
      `"${r.municipality}"`,
      `"${r.respondentRole.replace(/"/g, '""')}"`,
      `"${r.q1Cause.replace(/"/g, '""')}"`,
      `"${r.q2Cause.replace(/"/g, '""')}"`,
      `"${r.q3Cause.replace(/"/g, '""')}"`,
      `"${r.complianceLevel}%"`,
      `"${(r.observations || '').replace(/"/g, '""')}"`,
      `"${r.syncedToSheets ? 'Sí' : 'No'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `respuestas_ley594_valle_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncRow = async (row: SurveyResponse) => {
    if (!googleToken || !sheetsConfig.spreadsheetId) {
      onRequireSheetsLogin();
      return;
    }

    setSyncingId(row.id);
    setNotification(null);
    try {
      const formatted = formatResponseRow(row);
      await appendRowsToSpreadsheet(googleToken, sheetsConfig.spreadsheetId, [formatted]);

      const updated = responses.map((r) =>
        r.id === row.id ? { ...r, syncedToSheets: true } : r
      );
      onUpdateResponses(updated);
      setNotification({
        type: 'success',
        text: `Respuesta de "${row.entityName}" sincronizada con éxito en Google Sheets.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: `Error al enviar fila: ${err.message || 'Verifique conexión'}`
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDeleteId) return;
    const itemToDelete = responses.find((r) => r.id === confirmDeleteId);
    const updated = responses.filter((r) => r.id !== confirmDeleteId);
    onUpdateResponses(updated);
    setConfirmDeleteId(null);
    setNotification({
      type: 'success',
      text: `Respuesta de "${itemToDelete?.entityName || 'entidad'}" eliminada.`
    });
  };

  const handleCopyJSON = (row: SurveyResponse) => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    setCopiedId(row.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            Registro Histórico de Diagnósticos ({filteredResponses.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Respuestas recolectadas bajo la identificación de usuario <strong>13172327</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>

          {sheetsConfig.spreadsheetUrl && (
            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <span>Ver en Google Sheets</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <span>{notification.text}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por entidad, municipio, usuario 13172327 o causa específica..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>

      {/* Table view */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Fecha y Usuario</th>
              <th className="py-3 px-3">Entidad y Municipio</th>
              <th className="py-3 px-3">Causas Seleccionadas (P1, P2, P3)</th>
              <th className="py-3 px-3 text-center">Cumplimiento</th>
              <th className="py-3 px-3 text-center">Google Sheets</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredResponses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No se encontraron diagnósticos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredResponses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{r.timestamp}</div>
                    <div className="text-[11px] text-emerald-700 font-mono font-bold mt-0.5">
                      ID: {r.userId}
                    </div>
                  </td>

                  <td className="py-3 px-3 min-w-[180px]">
                    <div className="font-bold text-slate-900 line-clamp-1">{r.entityName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{r.municipality}</span>
                      <span>•</span>
                      <span className="font-medium">
                        {r.entityType === 'publica' ? 'Pública' : 'Privada c/ func.'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 max-w-[280px]">
                    <div className="space-y-1">
                      <div className="text-[11px] line-clamp-1">
                        <span className="font-bold text-emerald-800">P1 (Principal):</span> {r.q1Cause}
                      </div>
                      <div className="text-[11px] line-clamp-1">
                        <span className="font-bold text-teal-800">P2 (Obstáculo):</span> {r.q2Cause}
                      </div>
                      <div className="text-[11px] line-clamp-1">
                        <span className="font-bold text-blue-800">P3 (Prioridad):</span> {r.q3Cause}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="inline-block font-bold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {r.complianceLevel}%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {r.syncedToSheets ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sincronizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Pendiente
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {!r.syncedToSheets && (
                        <button
                          onClick={() => handleSyncRow(r)}
                          disabled={syncingId === r.id}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Enviar a Google Sheets"
                        >
                          <UploadCloud className={`w-4 h-4 ${syncingId === r.id ? 'animate-bounce' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyJSON(r)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copiar JSON"
                      >
                        {copiedId === r.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Explicit User Confirmation Modal for Destructive Delete Action */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">¿Eliminar este registro de diagnóstico?</h4>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Está a punto de borrar la respuesta perteneciente a la entidad{' '}
              <strong>{responses.find((r) => r.id === confirmDeleteId)?.entityName}</strong> registrada bajo el usuario{' '}
              <strong>13172327</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
