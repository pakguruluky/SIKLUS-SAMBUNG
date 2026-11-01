import React, { useState, useMemo } from 'react';
import { Supervision, IndikatorKunciType } from '../types';
import { 
  getFourIndicatorsOptimalBreakdown, 
  FourIndicatorsBreakdownItem,
  INDIKATOR_LABELS 
} from '../utils/sambungCalculations';
import { 
  FileSpreadsheet, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Users, 
  Compass, 
  Sparkles, 
  ArrowUpRight, 
  Download, 
  Printer, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal, 
  Layers,
  Award,
  Info
} from 'lucide-react';

interface TabelDanGrafikKohorBerpasanganProps {
  supervisions: Supervision[];
  selectedSchool?: string;
  onOpenTeacher?: (supervisionId: string) => void;
  onOpenPrint?: (supervision?: Supervision) => void;
  className?: string;
}

export const TabelDanGrafikKohorBerpasangan: React.FC<TabelDanGrafikKohorBerpasanganProps> = ({
  supervisions,
  selectedSchool = 'all',
  onOpenTeacher,
  onOpenPrint,
  className = '',
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'chart_only' | 'table_only'>('both');
  const [chartStyle, setChartStyle] = useState<'vertical_bars' | 'horizontal_bars' | 'growth_trajectory'>('vertical_bars');
  const [expandedRow, setExpandedRow] = useState<IndikatorKunciType | null>(null);

  // 1. Calculate the dynamic 4-indicators breakdown from the live cohort supervisions
  const breakdown = useMemo(() => {
    return getFourIndicatorsOptimalBreakdown(supervisions);
  }, [supervisions]);

  const totalKohor = supervisions.length;

  // 2. Structured rows for the 4 transformation indicators
  const indicatorKeys: IndikatorKunciType[] = ['peranGuru', 'aktivitasMurid', 'konteksNyata', 'refleksiMurid'];

  const rows = useMemo(() => {
    return indicatorKeys.map((key, idx) => {
      const item: FourIndicatorsBreakdownItem = breakdown[key];
      const beforePct = item?.selidiki?.optimalPercentage ?? 0;
      const beforeCount = item?.selidiki?.optimalCount ?? 0;
      const afterPct = item?.uji?.optimalPercentage ?? 0;
      const afterCount = item?.uji?.optimalCount ?? 0;
      const deltaPp = Math.round((afterPct - beforePct) * 10) / 10;
      
      // Exact indicator standard names from research instrument
      const indicatorDisplayTitles: Record<IndikatorKunciType, string> = {
        peranGuru: 'Guru berorientasi pada pengalaman belajar murid',
        aktivitasMurid: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
        konteksNyata: 'Pembelajaran terhubung dengan konteks nyata',
        refleksiMurid: 'Pembelajaran membiasakan murid melakukan refleksi',
      };

      const title = indicatorDisplayTitles[key];
      const sign = deltaPp > 0 ? '+' : '';
      
      let statusAnalisis = '';
      if (deltaPp > 0) {
        statusAnalisis = `Meningkat sebesar +${deltaPp} poin persentase (${beforePct}% → ${afterPct}%) pada kohor berpasangan yang sama (${totalKohor} guru).`;
      } else if (deltaPp === 0) {
        statusAnalisis = `Stabil pada ${beforePct}% dengan seluruh guru (${totalKohor} guru) berstatus optimal pada kohor berpasangan.`;
      } else {
        statusAnalisis = `Mengalami penyesuaian sebesar ${deltaPp} poin persentase (${beforePct}% → ${afterPct}%) pada kohor berpasangan (${totalKohor} guru).`;
      }

      return {
        no: idx + 1,
        key,
        title,
        shortTitle: INDIKATOR_LABELS[key]?.shortTitle || title,
        beforePct,
        beforeCount,
        afterPct,
        afterCount,
        totalKohor,
        deltaPp,
        sign,
        statusAnalisis,
        item,
      };
    });
  }, [breakdown, totalKohor]);

  // 3. Aggregate statistics across the cohort
  const cohortStats = useMemo(() => {
    if (rows.length === 0) return { avgBefore: 0, avgAfter: 0, avgDelta: 0, topIndicator: '' };
    const avgBefore = Math.round((rows.reduce((sum, r) => sum + r.beforePct, 0) / rows.length) * 10) / 10;
    const avgAfter = Math.round((rows.reduce((sum, r) => sum + r.afterPct, 0) / rows.length) * 10) / 10;
    const avgDelta = Math.round((avgAfter - avgBefore) * 10) / 10;
    const sorted = [...rows].sort((a, b) => b.deltaPp - a.deltaPp);
    const top = sorted[0];

    return {
      avgBefore,
      avgAfter,
      avgDelta,
      topIndicator: top ? `${top.shortTitle} (+${top.deltaPp} pp)` : '-',
    };
  }, [rows]);

  // Export table to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Indikator Utama',
      'BEFORE (%)',
      'Optimal (Before)',
      'AFTER (%)',
      'Optimal (After)',
      'Kohor Guru Berpasangan',
      'Selisih (% Poin)',
      'Status Analisis'
    ];
    
    const csvRows = [
      ['Tabel Rekapitulasi Komparasi Kohor Berpasangan'],
      ['Kriteria Optimal: Status Optimal pada 4 Indikator Transformasi Pembelajaran (Selidiki vs Uji)'],
      [`Total Kohor: ${totalKohor} Guru | Sekolah: ${selectedSchool === 'all' ? 'Semua Sekolah' : selectedSchool}`],
      [],
      headers,
      ...rows.map(r => [
        r.no,
        `"${r.title}"`,
        `${r.beforePct}%`,
        `${r.beforeCount} guru`,
        `${r.afterPct}%`,
        `${r.afterCount} guru`,
        `${r.totalKohor} guru`,
        `${r.sign}${r.deltaPp} pp`,
        `"${r.statusAnalisis}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_komparasi_kohor_berpasangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ========================================================================= */}
      {/* 1. KONTROL TAMPILAN & AKSI EKSPOR                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveViewTab('both')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'both' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tabel &amp; Grafik Bersama</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('chart_only')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'chart_only' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hanya Grafik</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('table_only')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'table_only' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
              <span>Hanya Tabel</span>
            </button>
          </div>

          {(activeViewTab === 'both' || activeViewTab === 'chart_only') && (
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartStyle('vertical_bars')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'vertical_bars' ? 'bg-white text-indigo-900 font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grafik Berdiri (Batang Tegak)
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('horizontal_bars')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'horizontal_bars' ? 'bg-white text-indigo-900 font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grafik Mendatar (Horizontal)
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('growth_trajectory')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'growth_trajectory' ? 'bg-white text-indigo-900 font-extrabold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Trajektori Pertumbuhan
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Ekspor Rekapitulasi ke file Excel/CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          {onOpenPrint && (
            <button
              type="button"
              onClick={() => onOpenPrint()}
              className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABEL REKAPITULASI KOMPARASI KOHOR BERPASANGAN (PERSIS DOKUMEN PENGAWAS) */}
      {/* ========================================================================= */}
      {(activeViewTab === 'both' || activeViewTab === 'table_only') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Tabel */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200/60 shadow-2xs">
                <FileSpreadsheet className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Tabel Rekapitulasi Komparasi Kohor Berpasangan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dihitung otomatis dari evaluasi 4 indikator kunci kondisi awal (Tahap Selidiki) vs hasil uji coba klinis (Tahap Uji)
                </p>
              </div>
            </div>

            {/* Note Kriteria Optimal (Menggantikan Kriteria Terpenuhi) */}
            <div className="text-left md:text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Kriteria Optimal:</strong> Skor komposit indikator &ge; 80% (Predikat Baik &amp; Sangat Baik)
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Konten 9 Kolom */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/90 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12 font-bold text-slate-600">No</th>
                  <th className="py-3.5 px-4 text-left font-bold text-slate-800">Indikator Utama</th>
                  <th className="py-3.5 px-3 text-center w-28 font-bold text-slate-800">
                    BEFORE<br /><span className="text-[10px] text-slate-500 font-medium">(%)</span>
                  </th>
                  <th className="py-3.5 px-3 text-center w-36 font-bold text-slate-800 bg-slate-100/50">
                    Optimal<br /><span className="text-[10px] text-slate-500 font-medium">(Before)</span>
                  </th>
                  <th className="py-3.5 px-3 text-center w-28 font-bold text-emerald-900">
                    AFTER<br /><span className="text-[10px] text-emerald-600 font-medium">(%)</span>
                  </th>
                  <th className="py-3.5 px-3 text-center w-36 font-bold text-emerald-900 bg-emerald-50/40">
                    Optimal<br /><span className="text-[10px] text-emerald-700 font-medium">(After)</span>
                  </th>
                  <th className="py-3.5 px-3 text-center w-36 font-bold text-indigo-900 bg-indigo-50/30">
                    Kohor Guru<br /><span className="text-[10px] text-indigo-600 font-medium">Berpasangan</span>
                  </th>
                  <th className="py-3.5 px-3 text-center w-28 font-bold text-emerald-900">
                    Selisih<br /><span className="text-[10px] text-slate-500 font-medium">(% Poin)</span>
                  </th>
                  <th className="py-3.5 px-4 text-left font-bold text-slate-800 w-80">Status Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {rows.map((row) => {
                  const isExpanded = expandedRow === row.key;
                  return (
                    <React.Fragment key={row.key}>
                      <tr 
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/20' : ''
                        }`}
                        onClick={() => setExpandedRow(isExpanded ? null : row.key)}
                        title="Klik untuk melihat rincian nama guru pada indikator ini"
                      >
                        {/* 1. No */}
                        <td className="py-4 px-4 text-center font-bold text-slate-400">
                          {row.no}
                        </td>

                        {/* 2. Indikator Utama */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug">
                              {row.title}
                            </span>
                            <span className="text-slate-400 shrink-0">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                        </td>

                        {/* 3. BEFORE (%) */}
                        <td className="py-4 px-3 text-center font-black text-slate-900 text-sm">
                          {row.beforePct}%
                        </td>

                        {/* 4. Optimal (Before) */}
                        <td className="py-4 px-3 text-center font-extrabold text-slate-800 bg-slate-100/30 text-xs sm:text-[13px]">
                          {row.beforeCount} guru
                        </td>

                        {/* 5. AFTER (%) */}
                        <td className="py-4 px-3 text-center font-black text-emerald-700 text-sm">
                          {row.afterPct}%
                        </td>

                        {/* 6. Optimal (After) */}
                        <td className="py-4 px-3 text-center font-black text-emerald-700 bg-emerald-50/40 text-xs sm:text-[13px]">
                          {row.afterCount} guru
                        </td>

                        {/* 7. Kohor Guru Berpasangan */}
                        <td className="py-4 px-3 text-center font-black text-indigo-700 bg-indigo-50/20 text-xs sm:text-[13px]">
                          {row.totalKohor} guru
                        </td>

                        {/* 8. Selisih (% Poin) */}
                        <td className="py-4 px-3 text-center font-black text-emerald-600 text-sm">
                          {row.sign}{row.deltaPp} pp
                        </td>

                        {/* 9. Status Analisis */}
                        <td className="py-4 px-4 text-[11px] leading-relaxed text-slate-600">
                          {row.statusAnalisis}
                        </td>
                      </tr>

                      {/* Baris Rincian Guru Terbuka (Drilldown) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={9} className="py-3 px-6 border-y border-indigo-100 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1 text-xs">
                              {/* Before Drilldown */}
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                  <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span>Guru Optimal di Tahap Selidiki (Baseline):</span>
                                  </span>
                                  <span className="font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px]">
                                    {row.beforeCount} dari {row.totalKohor} Guru ({row.beforePct}%)
                                  </span>
                                </div>
                                {row.item.selidiki.optimalTeachers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {row.item.selidiki.optimalTeachers.map((t) => (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => onOpenTeacher && onOpenTeacher(t.id)}
                                        className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-800 text-[11px] font-semibold border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                                        title={`Buka supervisi ${t.teacherName} (${t.subject})`}
                                      >
                                        <span>{t.teacherName}</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Belum ada guru optimal di tahap awal.</span>
                                )}
                              </div>

                              {/* After Drilldown */}
                              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2">
                                <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                                  <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Guru Optimal di Tahap Uji (Pasca Pendampingan):</span>
                                  </span>
                                  <span className="font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px]">
                                    {row.afterCount} dari {row.totalKohor} Guru ({row.afterPct}%)
                                  </span>
                                </div>
                                {row.item.uji.optimalTeachers.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {row.item.uji.optimalTeachers.map((t) => (
                                      <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => onOpenTeacher && onOpenTeacher(t.id)}
                                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                                        title={`Buka supervisi ${t.teacherName} (${t.subject})`}
                                      >
                                        <span>{t.teacherName}</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Belum ada guru optimal di tahap uji.</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Tabel: Rangkuman Kesimpulan Kohor */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Kohor Berpasangan: <strong>{totalKohor} Guru Terbina</strong> pada instrumen supervisi yang sama.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Rata-rata Kenaikan Kohor:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
                +{cohortStats.avgDelta} pp
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GRAFIK KOMPARASI KOHOR BERPASANGAN ("KEMUDIAN BUAT GRAFIKNYA")          */}
      {/* ========================================================================= */}
      {(activeViewTab === 'both' || activeViewTab === 'chart_only') && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          {/* Header Grafik */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-emerald-200">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Grafik Komparasi Optimal Kohor Berpasangan</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Visualisasi Persentase Guru Optimal: Before (Selidiki) vs After (Uji)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Menggambarkan lompatan persentase guru berstatus <strong>Optimal</strong> pada 4 indikator utama sebelum supervisi vs sesudah supervisi klinis.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-400 border border-slate-500/30" />
                <span className="text-slate-600">Before (Selidiki)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xs" />
                <span className="text-emerald-800">After (Uji)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
                  +pp
                </span>
                <span className="text-slate-600">Selisih Poin Persentase</span>
              </div>
            </div>
          </div>

          {/* 4 Cards Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Rata-rata Baseline (Before)</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 block">{cohortStats.avgBefore}%</span>
              <span className="text-[10px] text-slate-400">Guru Optimal Kondisi Awal</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Rata-rata Akhir (After)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5 block">{cohortStats.avgAfter}%</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Guru Optimal Pasca Uji</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Kenaikan Rata-rata Kohor</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-800 mt-0.5 block">+{cohortStats.avgDelta} pp</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Poin Persentase Transformasi</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Lompatan Tertinggi</span>
              <span className="text-sm font-black text-amber-900 mt-1 block truncate">{cohortStats.topIndicator}</span>
              <span className="text-[10px] text-amber-700">Akselerasi Paling Signifikan</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RENDER MODE A: GRAFIK BERDIRI (BATANG TEGAK / VERTICAL COLUMNS)           */}
          {/* ========================================================================= */}
          {chartStyle === 'vertical_bars' && (
            <div className="space-y-6 pt-2">
              {/* Paired Cohort Info Banner */}
              <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/90 rounded-2xl p-4 border border-indigo-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs space-y-0.5">
                  <h5 className="font-extrabold text-indigo-950">
                    Perbandingan Kohor Berpasangan (Paired Cohort):
                  </h5>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Hanya guru yang memiliki data tersimpan lengkap dan valid pada kedua tahap (SELIDIKI &amp; UJI) yang diikutsertakan dalam perbandingan agregat. Dengan demikian, persentase awal (BEFORE) dan akhir (AFTER) dihitung dari kelompok guru yang persis sama ({totalKohor} guru dalam kohor berpasangan).
                  </p>
                </div>
              </div>

              {/* Main Vertical Chart Area */}
              <div className="bg-slate-50/80 rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base sm:text-lg">
                      Perubahan Praktik Pembelajaran dalam Siklus SAMBUNG
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Persentase ketercapaian optimal 4 indikator utama sebelum dan sesudah pendampingan pada kohor berpasangan ({totalKohor} guru)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-xl border border-indigo-200">
                      Grafik Batang Berdiri (Tegak)
                    </span>
                  </div>
                </div>

                {/* Vertical Bars Chart Container */}
                <div className="relative pt-6">
                  {/* Background Gridlines */}
                  <div className="absolute inset-x-0 top-6 bottom-32 pointer-events-none flex flex-col justify-between z-0">
                    <div className="border-b border-dashed border-slate-200 text-[10px] text-slate-400 font-mono text-left pl-1">
                      100%
                    </div>
                    <div className="border-b border-dashed border-slate-200 text-[10px] text-slate-400 font-mono text-left pl-1">
                      75%
                    </div>
                    <div className="border-b border-dashed border-slate-200 text-[10px] text-slate-400 font-mono text-left pl-1">
                      50%
                    </div>
                    <div className="border-b border-dashed border-slate-200 text-[10px] text-slate-400 font-mono text-left pl-1">
                      25%
                    </div>
                    <div className="border-b border-slate-300 text-[10px] text-slate-400 font-mono text-left pl-1">
                      0%
                    </div>
                  </div>

                  {/* 4 Indicator Columns standing upright */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                    {rows.map((row) => (
                      <div
                        key={row.key}
                        className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        {/* Top: Delta Growth Badge */}
                        <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                            Indikator #{row.no}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 shadow-2xs">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                            <span>+{row.deltaPp} pp</span>
                          </span>
                        </div>

                        {/* Middle: Standing Vertical Bars ("Grafik Berdiri") */}
                        <div className="h-64 sm:h-72 w-full flex items-end justify-center gap-4 sm:gap-6 border-b border-slate-200 pb-2 relative px-2">
                          {/* 1. Bar BEFORE (Berdiri) */}
                          <div className="flex flex-col items-center h-full justify-end group">
                            {/* Value label on top of bar */}
                            <span className="text-[11px] font-black text-slate-700 mb-1 group-hover:scale-110 transition-transform">
                              {row.beforePct}%
                            </span>
                            <div className="w-11 sm:w-14 bg-slate-100 h-full rounded-t-xl flex items-end p-0.5 relative overflow-hidden">
                              <div
                                style={{ height: `${Math.max(6, row.beforePct)}%` }}
                                className="w-full bg-slate-500 hover:bg-slate-600 rounded-t-lg transition-all duration-700 shadow-xs flex flex-col justify-between items-center py-1.5"
                              >
                                <span className="text-[9px] font-black text-white/90">
                                  B
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-600 mt-1.5 uppercase tracking-wider">
                              BEFORE
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">
                              ({row.beforeCount}/{row.totalKohor} guru)
                            </span>
                          </div>

                          {/* 2. Bar AFTER (Berdiri) */}
                          <div className="flex flex-col items-center h-full justify-end group">
                            {/* Value label on top of bar */}
                            <span className="text-[11px] font-black text-emerald-700 mb-1 group-hover:scale-110 transition-transform">
                              {row.afterPct}%
                            </span>
                            <div className="w-11 sm:w-14 bg-emerald-50/80 h-full rounded-t-xl flex items-end p-0.5 relative overflow-hidden border border-emerald-200/40">
                              <div
                                style={{ height: `${Math.max(6, row.afterPct)}%` }}
                                className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-700 hover:to-teal-500 rounded-t-lg transition-all duration-700 shadow-md flex flex-col justify-between items-center py-1.5"
                              >
                                <span className="text-[9px] font-black text-white">
                                  A
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 mt-1.5 uppercase tracking-wider">
                              AFTER
                            </span>
                            <span className="text-[9px] text-emerald-700 font-bold">
                              ({row.afterCount}/{row.totalKohor} guru)
                            </span>
                          </div>
                        </div>

                        {/* Bottom: Indicator Title & Details */}
                        <div className="space-y-1.5 pt-1">
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-[13px] leading-snug line-clamp-2">
                            {row.title}
                          </h5>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Before:</span>
                              <strong className="text-slate-800">{row.beforePct}% ({row.beforeCount}/{row.totalKohor} guru)</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-700 font-semibold">After:</span>
                              <strong className="text-emerald-700 font-black">{row.afterPct}% ({row.afterCount}/{row.totalKohor} guru)</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RENDER MODE B: GRAFIK MENDATAR (HORIZONTAL BARS)                          */}
          {/* ========================================================================= */}
          {chartStyle === 'horizontal_bars' && (
            <div className="space-y-4 pt-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/60 border border-slate-200/90 hover:border-indigo-300 hover:bg-slate-50 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
                        {row.no}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug">
                          {row.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Kohor Berpasangan: {row.totalKohor} Guru
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 shadow-2xs">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        <span>+{row.deltaPp} pp</span>
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bars */}
                  <div className="space-y-2 pt-1">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded bg-slate-500" />
                          <span>BEFORE (Selidiki)</span>
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {row.beforePct}% ({row.beforeCount} dari {row.totalKohor} guru optimal)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden relative">
                        <div
                          style={{ width: `${Math.max(5, row.beforePct)}%` }}
                          className="h-full bg-slate-500 rounded-full transition-all duration-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded bg-emerald-500" />
                          <span>AFTER (Uji)</span>
                        </span>
                        <span className="font-black text-emerald-700">
                          {row.afterPct}% ({row.afterCount} dari {row.totalKohor} guru optimal)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden relative">
                        <div
                          style={{ width: `${Math.max(5, row.afterPct)}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-700 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
                    <strong className="text-slate-700">Analisis:</strong> {row.statusAnalisis}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Render Mode B: Trajectory Growth Slope */}
          {chartStyle === 'growth_trajectory' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                      Indikator #{row.no}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">
                      {row.title}
                    </h4>
                  </div>

                  {/* Slope Diagram Box */}
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Before</span>
                        <span className="text-base font-black text-slate-800">{row.beforePct}%</span>
                        <span className="text-[10px] text-slate-500 block">{row.beforeCount} guru</span>
                      </div>

                      <div className="flex flex-col items-center">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 mt-0.5">
                          +{row.deltaPp} pp
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 uppercase block font-bold">After</span>
                        <span className="text-base font-black text-emerald-700">{row.afterPct}%</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">{row.afterCount} guru</span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div
                        style={{ width: `${row.beforePct}%` }}
                        className="h-full bg-slate-300 absolute left-0 top-0"
                      />
                      <div
                        style={{ width: `${row.afterPct}%` }}
                        className="h-full bg-emerald-500 absolute left-0 top-0 opacity-80"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    {row.statusAnalisis}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
