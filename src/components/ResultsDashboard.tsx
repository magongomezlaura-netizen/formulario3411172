import React, { useState, useMemo } from 'react';
import { SurveyResponse } from '../types/survey';
import { SURVEY_CAUSES, VALLE_MUNICIPALITIES } from '../data/causes';
import {
  BarChart3,
  PieChart,
  Building,
  TrendingUp,
  AlertTriangle,
  Award,
  Filter,
  CheckCircle2,
  Users,
  Package,
  MonitorX,
  FileQuestion,
  TrendingDown,
  Building2
} from 'lucide-react';

interface ResultsDashboardProps {
  responses: SurveyResponse[];
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ responses }) => {
  const [filterType, setFilterType] = useState<'all' | 'publica' | 'privada_funciones_publicas'>('all');
  const [filterMunicipality, setFilterMunicipality] = useState<string>('all');
  const [activeQuestionTab, setActiveQuestionTab] = useState<'q1' | 'q2' | 'q3'>('q1');

  // Filtered dataset
  const filteredData = useMemo(() => {
    return responses.filter((r) => {
      const matchType = filterType === 'all' || r.entityType === filterType;
      const matchMun = filterMunicipality === 'all' || r.municipality === filterMunicipality;
      return matchType && matchMun;
    });
  }, [responses, filterType, filterMunicipality]);

  // Statistics calculation for the 6 causes
  const causeStats = useMemo(() => {
    const total = filteredData.length;
    const stats: Record<string, { q1: number; q2: number; q3: number }> = {};

    SURVEY_CAUSES.forEach((c) => {
      stats[c.label] = { q1: 0, q2: 0, q3: 0 };
    });

    filteredData.forEach((r) => {
      if (stats[r.q1Cause]) stats[r.q1Cause].q1 += 1;
      if (stats[r.q2Cause]) stats[r.q2Cause].q2 += 1;
      if (stats[r.q3Cause]) stats[r.q3Cause].q3 += 1;
    });

    return SURVEY_CAUSES.map((c) => {
      const q1Count = stats[c.label]?.q1 || 0;
      const q2Count = stats[c.label]?.q2 || 0;
      const q3Count = stats[c.label]?.q3 || 0;
      return {
        ...c,
        q1Count,
        q1Percent: total ? Math.round((q1Count / total) * 100) : 0,
        q2Count,
        q2Percent: total ? Math.round((q2Count / total) * 100) : 0,
        q3Count,
        q3Percent: total ? Math.round((q3Count / total) * 100) : 0
      };
    });
  }, [filteredData]);

  // Average compliance score
  const avgCompliance = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + (curr.complianceLevel || 0), 0);
    return Math.round(sum / filteredData.length);
  }, [filteredData]);

  // Sort causes for current tab
  const sortedCauses = useMemo(() => {
    return [...causeStats].sort((a, b) => {
      if (activeQuestionTab === 'q1') return b.q1Count - a.q1Count;
      if (activeQuestionTab === 'q2') return b.q2Count - a.q2Count;
      return b.q3Count - a.q3Count;
    });
  }, [causeStats, activeQuestionTab]);

  const topCause = sortedCauses[0];

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

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Evaluaciones
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {filteredData.length}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Entidades en Valle del Cauca
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cumplimiento Promedio
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {avgCompliance}%
            </div>
            <span className="text-[11px] text-amber-600 font-medium">
              Ley 594 de 2000 (AGN)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Causa #1 Más Votada
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[150px]" title={topCause?.label}>
              {topCause?.shortLabel || 'N/A'}
            </div>
            <span className="text-[11px] text-slate-500">
              {topCause ? `${topCause.q1Percent}% de menciones` : 'Sin datos'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cobertura Territorial
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {new Set(filteredData.map((d) => d.municipality)).size}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Municipios diagnosticados
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filtrar Resultados:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Entity Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas las naturalezas jurídicas</option>
            <option value="publica">Solo Entidades Públicas</option>
            <option value="privada_funciones_publicas">Solo Privadas con funciones públicas</option>
          </select>

          {/* Municipality Filter */}
          <select
            value={filterMunicipality}
            onChange={(e) => setFilterMunicipality(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos los Municipios del Valle</option>
            {VALLE_MUNICIPALITIES.map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>

          {(filterType !== 'all' || filterMunicipality !== 'all') && (
            <button
              onClick={() => {
                setFilterType('all');
                setFilterMunicipality('all');
              }}
              className="text-xs text-rose-600 hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Question Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              Distribución de Respuestas por Causa Evaluada
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Análisis comparativo de las 6 causas establecidas en la investigación del Valle del Cauca.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveQuestionTab('q1')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionTab === 'q1'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pregunta 1 (Causa Principal)
            </button>
            <button
              onClick={() => setActiveQuestionTab('q2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionTab === 'q2'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pregunta 2 (Obstáculo)
            </button>
            <button
              onClick={() => setActiveQuestionTab('q3')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionTab === 'q3'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pregunta 3 (Prioridad)
            </button>
          </div>
        </div>

        {/* Cause Bars Ranking */}
        <div className="space-y-4">
          {sortedCauses.map((item, index) => {
            const count =
              activeQuestionTab === 'q1'
                ? item.q1Count
                : activeQuestionTab === 'q2'
                ? item.q2Count
                : item.q3Count;
            const percent =
              activeQuestionTab === 'q1'
                ? item.q1Percent
                : activeQuestionTab === 'q2'
                ? item.q2Percent
                : item.q3Percent;

            const barColor =
              index === 0
                ? 'bg-emerald-600'
                : index === 1
                ? 'bg-teal-600'
                : index === 2
                ? 'bg-blue-600'
                : index === 3
                ? 'bg-indigo-500'
                : index === 4
                ? 'bg-amber-500'
                : 'bg-slate-500';

            return (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      #{index + 1}
                    </span>
                    <span className="p-1 rounded-md bg-white border border-slate-200 text-slate-600">
                      {getCauseIcon(item.iconName)}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-7 sm:pl-0">
                    <span className="text-xs font-semibold text-slate-500">
                      {count} voto(s)
                    </span>
                    <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 pl-7">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Methodological Context Footer */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Interpretación Normativa y Diagnóstica (AGN - Valle del Cauca):</strong>
            <p className="mt-0.5 text-slate-700">
              Los datos recopilados por el usuario investigador <strong>13172327</strong> permiten fundamentar informes de auditoría y diagnósticos institucionales según los requerimientos del Consejo Departamental de Archivos del Valle del Cauca y el Archivo General de la Nación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
