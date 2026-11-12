import React, { useState } from 'react';
import { SURVEY_CAUSES, VALLE_MUNICIPALITIES } from '../data/causes';
import { SurveyResponse, GoogleSheetsConfig } from '../types/survey';
import {
  Send,
  Building,
  MapPin,
  Briefcase,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Users,
  Package,
  MonitorX,
  FileQuestion,
  TrendingDown,
  Building2,
  Gauge,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { appendRowsToSpreadsheet, formatResponseRow } from '../services/googleSheets';

interface SurveyFormProps {
  currentUserId: string;
  currentUserName: string;
  googleToken: string | null;
  sheetsConfig: GoogleSheetsConfig;
  onAddResponse: (response: SurveyResponse) => void;
  onRequireSheetsLogin: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  currentUserId,
  currentUserName,
  googleToken,
  sheetsConfig,
  onAddResponse,
  onRequireSheetsLogin
}) => {
  // Form fields
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState<'publica' | 'privada_funciones_publicas'>('publica');
  const [municipality, setMunicipality] = useState('Cali (Distrito Especial)');
  const [respondentRole, setRespondentRole] = useState('Responsable de Gestión Documental / Archivo');
  const [complianceLevel, setComplianceLevel] = useState<number>(50);
  
  // The 3 required multiple-choice questions with the 6 causes
  const [q1Cause, setQ1Cause] = useState<string>('');
  const [q2Cause, setQ2Cause] = useState<string>('');
  const [q3Cause, setQ3Cause] = useState<string>('');
  const [observations, setObservations] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ id: string; syncedToSheets: boolean; errorNotice?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCauseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Package':
        return <Package className="w-4 h-4" />;
      case 'MonitorX':
        return <MonitorX className="w-4 h-4" />;
      case 'FileQuestion':
        return <FileQuestion className="w-4 h-4" />;
      case 'TrendingDown':
        return <TrendingDown className="w-4 h-4" />;
      case 'Building2':
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!entityName.trim()) {
      setErrorMessage('Por favor ingrese el nombre de la entidad del Valle del Cauca.');
      return;
    }
    if (!q1Cause) {
      setErrorMessage('Por favor seleccione una opción para la Pregunta 1 (Causa principal).');
      return;
    }
    if (!q2Cause) {
      setErrorMessage('Por favor seleccione una opción para la Pregunta 2 (Mayor obstáculo operativo).');
      return;
    }
    if (!q3Cause) {
      setErrorMessage('Por favor seleccione una opción para la Pregunta 3 (Prioridad de intervención).');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
      now.getSeconds()
    ).padStart(2, '0')}`;

    const newResponse: SurveyResponse = {
      id: `resp-${Date.now()}`,
      timestamp: formattedTimestamp,
      userId: currentUserId,
      userFullName: currentUserName,
      entityName: entityName.trim(),
      entityType,
      municipality,
      respondentRole: respondentRole.trim(),
      q1Cause,
      q2Cause,
      q3Cause,
      complianceLevel,
      observations: observations.trim(),
      syncedToSheets: false
    };

    let synced = false;
    let syncErrorNotice: string | undefined;

    // Send directly to Google Sheets if connected and configured
    if (googleToken && sheetsConfig.spreadsheetId) {
      try {
        const row = formatResponseRow(newResponse);
        await appendRowsToSpreadsheet(googleToken, sheetsConfig.spreadsheetId, [row]);
        newResponse.syncedToSheets = true;
        synced = true;
      } catch (sheetsErr: any) {
        console.warn('Advertencia al enviar a Google Sheets:', sheetsErr);
        syncErrorNotice = sheetsErr.message || 'Se requiere reconectar los permisos de Google Sheets.';
      }
    }

    onAddResponse(newResponse);
    setIsSubmitting(false);
    setSuccessResult({ id: newResponse.id, syncedToSheets: synced, errorNotice: syncErrorNotice });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    // Reset questions for next submission, keep entity/municipality context if filling multiple
    setQ1Cause('');
    setQ2Cause('');
    setQ3Cause('');
    setObservations('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Form Top Title */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-300">
              Formulario de Investigación y Diagnóstico
            </span>
            <h2 className="text-xl font-bold mt-0.5">
              ¿Por qué no se aplica correctamente la Gestión Documental en el Valle del Cauca?
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-3xl leading-relaxed">
              Estudio sobre las causas determinantes de incumplimiento de la <strong>Ley 594 de 2000</strong> y decretos reglamentarios del Archivo General de la Nación (AGN) en entidades públicas y privadas que cumplen funciones públicas.
            </p>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] uppercase text-emerald-400 block font-semibold">
              Registrando con Usuario:
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {currentUserId}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* SECTION 1: Entidad e Identificación */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Building className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
              1. Caracterización de la Entidad en el Valle del Cauca
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Entidad u Organización <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Ej: Alcaldía Municipal de Palmira, Notaría 2da de Cali, Hospital..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Municipio del Valle del Cauca <span className="text-rose-500">*</span>:
              </label>
              <div className="relative">
                <select
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white appearance-none"
                >
                  {VALLE_MUNICIPALITIES.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Naturaleza Jurídica de la Entidad <span className="text-rose-500">*</span>:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    entityType === 'publica'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="entityType"
                    checked={entityType === 'publica'}
                    onChange={() => setEntityType('publica')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Entidad Pública (Alcaldías, Secretarías, EICE)</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    entityType === 'privada_funciones_publicas'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="entityType"
                    checked={entityType === 'privada_funciones_publicas'}
                    onChange={() => setEntityType('privada_funciones_publicas')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Privada con funciones públicas (Cámaras, Notarías, etc.)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Rol de quien suministra la información:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={respondentRole}
                  onChange={(e) => setRespondentRole(e.target.value)}
                  placeholder="Ej: Líder de Gestión Documental, Jurídico, Control Interno..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <Briefcase className="absolute right-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Compliance perception gauge slider */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-700" />
                Nivel estimado de cumplimiento de la Ley 594 de 2000 en la entidad:
              </label>
              <span className="font-bold text-sm text-emerald-800 px-2.5 py-0.5 rounded-lg bg-emerald-100">
                {complianceLevel}% de cumplimiento
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={complianceLevel}
              onChange={(e) => setComplianceLevel(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>0% (Incumplimiento total / Sin TRD)</span>
              <span>50% (Organización parcial)</span>
              <span>100% (TRD aprobadas y convalidación AGN)</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: PREGUNTA 1 */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Pregunta 1: Causa Principal de Incumplimiento Normativo
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  ¿Cuál considera usted que es la <strong>causa principal o factor más crítico</strong> por el cual en las empresas y entidades del Valle del Cauca no se aplica correctamente la gestión documental según la Ley 594 de 2000 y sus decretos reglamentarios?
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SURVEY_CAUSES.map((cause) => {
              const isSelected = q1Cause === cause.label;
              return (
                <label
                  key={`q1-${cause.id}`}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="q1Cause"
                    value={cause.label}
                    checked={isSelected}
                    onChange={(e) => setQ1Cause(e.target.value)}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    required
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {getCauseIcon(cause.iconName)}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {cause.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                      {cause.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: PREGUNTA 2 */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Pregunta 2: Mayor Obstáculo Operativo y de Recursos
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  En el desarrollo cotidiano de los procesos archivísticos (producción, recepción, distribución, trámite, organización, consulta, conservación y disposición final), ¿cuál de las siguientes causas genera el <strong>mayor obstáculo operativo y retraso técnico</strong>?
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SURVEY_CAUSES.map((cause) => {
              const isSelected = q2Cause === cause.label;
              return (
                <label
                  key={`q2-${cause.id}`}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="q2Cause"
                    value={cause.label}
                    checked={isSelected}
                    onChange={(e) => setQ2Cause(e.target.value)}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {getCauseIcon(cause.iconName)}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {cause.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                      {cause.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: PREGUNTA 3 */}
        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Pregunta 3: Causa Prioritaria que Requiere Intervención Urgente
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Si la administración departamental del Valle del Cauca y los directivos de las entidades fueran a destinar presupuesto y planes de choque prioritarios, ¿en cuál de estas causas se debería <strong>intervenir de manera urgente</strong> para superar el rezago archivístico?
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SURVEY_CAUSES.map((cause) => {
              const isSelected = q3Cause === cause.label;
              return (
                <label
                  key={`q3-${cause.id}`}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="q3Cause"
                    value={cause.label}
                    checked={isSelected}
                    onChange={(e) => setQ3Cause(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 rounded-md ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {getCauseIcon(cause.iconName)}
                      </span>
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {cause.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
                      {cause.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: Observaciones / Notas cualitativas */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700">
            Observaciones o Justificación Adicional (Opcional):
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            placeholder="Describa detalles específicos de la entidad (ej: estado de las TRD, fondos acumulados, humedad en depósitos, presupuesto asignado al archivo)..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success message with Direct Pass to Google Sheets */}
        {successResult && (
          <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 space-y-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ¡Respuesta enviada exitosamente con el Usuario 13172327!
            </div>
            <p className="text-emerald-800 leading-relaxed">
              {successResult.syncedToSheets
                ? 'La información ha sido registrada y enviada directamente a su hoja de cálculo de Google.'
                : successResult.errorNotice
                ? `La información ha sido guardada con el usuario 13172327. Nota sobre Google Sheets: ${successResult.errorNotice}`
                : 'La información ha sido registrada correctamente con su usuario 13172327.'}
            </p>

            {sheetsConfig.spreadsheetUrl && (
              <div className="pt-2">
                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Pase Directo: Abrir en Google Sheets Ahora</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* SUBMISSION FOOTER & BUTTON: STRICTLY ALIGNED TO THE RIGHT SIDE */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 w-full sm:w-auto text-left">
            <span className="font-semibold text-slate-700">Autorización AGN:</span> Registro exclusivo bajo la cédula/código{' '}
            <strong className="text-emerald-800 font-mono">13172327</strong>
          </div>

          {/* Right-aligned container */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end ml-auto">
            {!googleToken && (
              <button
                type="button"
                onClick={onRequireSheetsLogin}
                className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                Conectar Google Sheets
              </button>
            )}

            {/* BUTTON WITH USER 13172327 ON THE RIGHT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
              <span>
                {isSubmitting
                  ? 'Enviando a Google Sheets...'
                  : 'Usuario: 13172327 • Enviar Respuestas'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
