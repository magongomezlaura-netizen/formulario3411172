import React from 'react';
import { X, Scale, FileText, ShieldAlert, Award, ExternalLink } from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-emerald-900 text-white border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800/80 rounded-lg">
              <Scale className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Marco Normativo: Ley 594 de 2000</h3>
              <p className="text-xs text-emerald-200">Archivo General de la Nación (AGN) - República de Colombia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              ¿Por qué aplica a entidades públicas y privadas con funciones públicas?
            </p>
            <p className="text-slate-700 text-xs leading-relaxed">
              El <strong>Artículo 2° de la Ley 594 de 2000</strong> establece expresamente su aplicación a la Administración Pública en sus diferentes niveles 
              (nacional, departamental y municipal) y a las <strong>entidades privadas que cumplen funciones públicas</strong> (tales como Cámaras de Comercio, Notarías, 
              Curadurías Urbanas, prestadores de servicios públicos y contratistas del Estado respecto a los documentos derivados de dicha función).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <Award className="w-4 h-4 text-emerald-600" />
                Instrumentos Archivísticos Obligatorios
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>TRD:</strong> Tablas de Retención Documental (Acuerdo 004 de 2019).</li>
                <li><strong>TVD:</strong> Tablas de Valoración Documental para fondos acumulados.</li>
                <li><strong>PGD:</strong> Programa de Gestión Documental.</li>
                <li><strong>PINAR:</strong> Plan Institucional de Archivos.</li>
                <li><strong>CCD:</strong> Cuadro de Clasificación Documental.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Vigilancia, Control y Sanciones
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El Archivo General de la Nación y los Consejos Departamentales de Archivos ejercen facultades de inspección y vigilancia.
                El incumplimiento genera investigaciones disciplinarias por parte de la <strong>Procuraduría General de la Nación</strong> (falta grave contra el patrimonio documental) 
                y multas institucionales.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-sm text-slate-900 mb-3">Normatividad Conexa Clave</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-emerald-800">Decreto 1080 de 2015</span>
                  <p className="text-slate-500">Decreto Único Reglamentario del Sector Cultura (Título II: Patrimonio Archivístico).</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-emerald-800">Acuerdo AGN 002 de 2014</span>
                  <p className="text-slate-500">Criterios básicos para creación, organización y custodia de archivos en entidades públicas y privadas.</p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-emerald-800">Acuerdo AGN 049 de 2000</span>
                  <p className="text-slate-500">Condiciones de edificios, estantería y depósitos de archivo para garantizar preservación física.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-lg flex items-center justify-between">
            <span>Investigación aplicada al Departamento del Valle del Cauca • Usuario investigador: 13172327</span>
            <a
              href="https://www.archivogeneral.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
            >
              Portal AGN <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
