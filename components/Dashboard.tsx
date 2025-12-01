import React, { useMemo, useState, useRef } from 'react';
import { LensRecord, UserProfile } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText, Database, Clock, Filter, Calendar, Search, X } from 'lucide-react';
import { exportToTXT, exportToPDF } from '../utils/export';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MOCK_COMPANIES } from '../services/authService';

interface DashboardProps {
  data: LensRecord[];
  currentUser: UserProfile;
}

const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
const INDICE_OPTIONS = [
  '1.49',
  '1.53 - Trivex',
  '1.56',
  '1.59 - Poly',
  '1.60',
  '1.61',
  '1.67',
  '1.74'
];
// Include 'Incolor' here so users can filter 1.49 records effectively
const TRATAMENTO_OPTIONS = ['AR', 'Filtro Azul (verde)', 'BlueCut (azul)', 'Incolor'];

// Helper for formatting diopters: +0.00, +2.00, -1.00
const formatDioptria = (val: number | string) => {
  const num = Number(val);
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}`;
};

const KPICard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
  <div className={`p-4 rounded-xl border border-transparent ${color} bg-opacity-50`}>
    <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ChartCard = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-md font-bold text-gray-800 mb-6">{title}</h3>
    {children}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data, currentUser }) => {
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterIndice, setFilterIndice] = useState('');
  const [filterTratamento, setFilterTratamento] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Refs for Date Inputs to programmatically trigger picker
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Helper to parse date inputs (YYYY-MM-DD) to local midnight Date object
  const parseLocalDay = (dateStr: string) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // -- Filtering Logic --
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Parse ISO string safely using native Date
      const itemDate = new Date(item.data_registro);

      // Date Range Filter
      if (startDate) {
        const start = parseLocalDay(startDate);
        if (start && itemDate < start) return false;
      }
      if (endDate) {
        const end = parseLocalDay(endDate);
        if (end) {
          // Set to end of day
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }

      // Exact Match Filters
      if (filterIndice && item.indice !== filterIndice) return false;
      if (filterTratamento && item.tratamento !== filterTratamento) return false;

      // Company Filter (Admin only)
      if (isAdmin && filterCompany && item.company_id !== filterCompany) return false;

      return true;
    });
  }, [data, startDate, endDate, filterIndice, filterTratamento, filterCompany, isAdmin]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterIndice('');
    setFilterTratamento('');
    setFilterCompany('');
  };

  const hasActiveFilters = startDate || endDate || filterIndice || filterTratamento || filterCompany;

  // -- Statistics Calculation (Based on filteredData) --
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const indiceCount: Record<string, number> = {};
    const tratamentoCount: Record<string, number> = {};
    const esfCount: Record<string, number> = {};
    const cilCount: Record<string, number> = {};
    let totalPecas = 0;

    filteredData.forEach(r => {
      const qty = r.quantidade || 1;
      totalPecas += qty;

      indiceCount[r.indice] = (indiceCount[r.indice] || 0) + qty;
      tratamentoCount[r.tratamento] = (tratamentoCount[r.tratamento] || 0) + qty;
      esfCount[r.esf] = (esfCount[r.esf] || 0) + qty;
      cilCount[r.cil] = (cilCount[r.cil] || 0) + qty;
    });

    const getTop = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return {
      total: filteredData.length,
      totalPecas: totalPecas,
      topIndice: getTop(indiceCount),
      topTratamento: getTop(tratamentoCount),
      topEsf: getTop(esfCount),
      topCil: getTop(cilCount),
    };
  }, [filteredData]);

  // -- Charts Data --
  const chartsData = useMemo(() => {
    const byIndice = Object.entries(
      filteredData.reduce((acc, curr) => {
        const qty = curr.quantidade || 1;
        acc[curr.indice] = (acc[curr.indice] || 0) + qty;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const byTratamento = Object.entries(
      filteredData.reduce((acc, curr) => {
        const qty = curr.quantidade || 1;
        acc[curr.tratamento] = (acc[curr.tratamento] || 0) + qty;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return { byIndice, byTratamento };
  }, [filteredData]);

  // -- Ranking Logic --
  const ranking = useMemo(() => {
    const comboMap = new Map<string, { count: number, indice: string, tratamento: string, esf: number, cil: number, company_id: string }>();

    filteredData.forEach(r => {
      const key = `${r.indice}|${r.tratamento}|${r.esf}|${r.cil}`;
      const qty = r.quantidade || 1;
      if (!comboMap.has(key)) {
        comboMap.set(key, { count: 0, indice: r.indice, tratamento: r.tratamento, esf: r.esf, cil: r.cil, company_id: r.company_id });
      }
      comboMap.get(key)!.count += qty;
    });

    return Array.from(comboMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredData]);

  // Helper function to reliably trigger the browser's date picker
  const triggerDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    try {
      if (ref.current) {
        // 'showPicker' is the modern standard supported by Chrome, Edge, Firefox, Safari 16+
        if ('showPicker' in HTMLInputElement.prototype) {
          ref.current.showPicker();
        } else {
          // Fallback
          ref.current.focus();
        }
      }
    } catch (error) {
      console.error("Error opening date picker:", error);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6 pb-10">

      {/* Header & Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Visão Geral</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToTXT(filteredData, startDate, endDate)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            disabled={filteredData.length === 0}
          >
            <FileText size={16} /> TXT
          </button>
          <button
            onClick={() => exportToPDF('dashboard-content')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            disabled={filteredData.length === 0}
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-3 text-gray-500 text-sm font-semibold uppercase tracking-wide">
          <Filter size={14} /> Filtros de Análise
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <X size={12} /> Limpar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range - START */}
          <div className="relative group cursor-pointer" onClick={() => triggerDatePicker(startDateRef)}>
            <label className="block text-xs font-medium text-gray-500 mb-1 cursor-pointer">De:</label>
            <div className="relative cursor-pointer">
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                // We use triggerDatePicker on click to ensure picker opens
                onClick={(e) => {
                  e.stopPropagation(); // prevent double bubble if parent has click
                  triggerDatePicker(startDateRef);
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500 bg-white text-gray-900 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                placeholder="dd/mm/aaaa"
              />
              <Calendar className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={14} />
            </div>
          </div>

          {/* Date Range - END */}
          <div className="relative group cursor-pointer" onClick={() => triggerDatePicker(endDateRef)}>
            <label className="block text-xs font-medium text-gray-500 mb-1 cursor-pointer">Até:</label>
            <div className="relative cursor-pointer">
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerDatePicker(endDateRef);
                }}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500 bg-white text-gray-900 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                placeholder="dd/mm/aaaa"
              />
              <Calendar className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={14} />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Índice:</label>
            <select
              value={filterIndice}
              onChange={(e) => setFilterIndice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500 bg-white text-gray-900 cursor-pointer"
            >
              <option value="">Todos</option>
              {INDICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tratamento:</label>
            <select
              value={filterTratamento}
              onChange={(e) => setFilterTratamento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-500 bg-white text-gray-900 cursor-pointer"
            >
              <option value="">Todos</option>
              {TRATAMENTO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Admin Company Filter */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Empresa (Admin):</label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-900 cursor-pointer"
              >
                <option value="">Todas as Empresas</option>
                {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <Search size={48} className="mb-4 opacity-50" />
          <p className="text-lg">Nenhum registro encontrado com estes filtros.</p>
          <button onClick={clearFilters} className="mt-2 text-slate-600 hover:underline cursor-pointer">Limpar Filtros</button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <KPICard title="Total Lançamentos" value={stats.total} color="bg-gray-50 text-gray-700" />
            <KPICard title="Total Peças" value={stats.totalPecas} color="bg-slate-100 text-slate-700" />
            <KPICard title="Top Índice" value={stats.topIndice} color="bg-indigo-50 text-indigo-700" />
            <KPICard title="Top Tratamento" value={stats.topTratamento} color="bg-purple-50 text-purple-700" />
            <KPICard title="Top ESF" value={formatDioptria(stats.topEsf)} color="bg-emerald-50 text-emerald-700" />
            <KPICard title="Top CIL" value={formatDioptria(stats.topCil)} color="bg-red-50 text-red-700" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Faltas por Índice">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartsData.byIndice} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribuição de Tratamentos">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartsData.byTratamento}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartsData.byTratamento.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Ranking Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-md font-bold text-gray-800 mb-4">Top 5 Faltas Recorrentes (Filtro Atual)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    {isAdmin && <th className="px-4 py-3">Empresa</th>}
                    <th className="px-4 py-3">Índice</th>
                    <th className="px-4 py-3">Tratamento</th>
                    <th className="px-4 py-3">ESF</th>
                    <th className="px-4 py-3">CIL</th>
                    <th className="px-4 py-3 text-right">Qtd. Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((row, idx) => {
                    const compName = MOCK_COMPANIES.find(c => c.id === row.company_id)?.name || '-';
                    return (
                      <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{idx + 1}</td>
                        {isAdmin && <td className="px-4 py-3 text-xs text-gray-500">{compName}</td>}
                        <td className="px-4 py-3 text-gray-700">{row.indice}</td>
                        <td className="px-4 py-3 text-gray-700">{row.tratamento}</td>
                        <td className="px-4 py-3 font-mono text-gray-900">
                          {formatDioptria(row.esf)}
                        </td>
                        <td className="px-4 py-3 font-mono text-red-600">
                          {formatDioptria(row.cil)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">{row.count}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full History List Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-slate-600" />
              <h3 className="text-md font-bold text-gray-800">Histórico de Registros</h3>
              <span className="text-xs font-normal text-gray-400 ml-auto">Exibindo {filteredData.length} registro(s)</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3">Data / Hora</th>
                    {isAdmin && <th className="px-4 py-3">Empresa</th>}
                    <th className="px-4 py-3">Índice</th>
                    <th className="px-4 py-3">Tratamento</th>
                    <th className="px-4 py-3">ESF</th>
                    <th className="px-4 py-3">CIL</th>
                    <th className="px-4 py-3 text-right">Qtd.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((row) => {
                    const compName = MOCK_COMPANIES.find(c => c.id === row.company_id)?.name || '-';
                    return (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {format(new Date(row.data_registro), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-[150px] truncate" title={compName}>
                            {compName}
                          </td>
                        )}
                        <td className="px-4 py-3 font-medium text-gray-900">{row.indice}</td>
                        <td className="px-4 py-3 text-gray-700">{row.tratamento}</td>
                        <td className="px-4 py-3 font-mono text-gray-900">
                          {formatDioptria(row.esf)}
                        </td>
                        <td className="px-4 py-3 font-mono text-red-600">
                          {formatDioptria(row.cil)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {row.quantidade || 1}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* API Info for N8N */}
      <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
        <span className="font-bold">Integração API:</span> Endpoint virtual para n8n disponível em <code>services/lensService.ts</code> via função <code>getRankingLentesAPI()</code>.
        Exemplo de retorno JSON implementado conforme especificação.
      </div>
    </div>
  );
};