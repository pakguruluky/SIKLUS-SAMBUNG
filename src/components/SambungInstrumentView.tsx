import React, { useState, useEffect, useMemo } from 'react';
import { Supervision, UserProfile, School, SambungData } from '../types';
import { createDefaultSambungForTeacher } from '../data/sambungSeed';
import { saveSupervision } from '../services/firebase';
import { SambungPrintModal } from './SambungPrintModal';
import { 
  CheckCircle2, 
  Search, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  User, 
  School as SchoolIcon, 
  BookOpen, 
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Smile,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SambungInstrumentViewProps {
  supervisions: Supervision[];
  currentUser: UserProfile;
  schools: School[];
  onUpdateSupervision: (updated: Supervision) => void;
  initialSupervisionId?: string;
}

type TabType = 'S' | 'A' | 'M' | 'B' | 'U' | 'N' | 'G';

export const SambungInstrumentView: React.FC<SambungInstrumentViewProps> = ({
  supervisions,
  currentUser,
  schools,
  onUpdateSupervision,
  initialSupervisionId,
}) => {
  // Filter supervisions according to role
  const availableSupervisions = useMemo(() => {
    if (currentUser.role === 'guru') {
      return supervisions.filter(
        (s) => s.teacherId === currentUser.uid || s.teacherName.toLowerCase() === currentUser.displayName.toLowerCase()
      );
    } else if (currentUser.role === 'kepsek') {
      return supervisions.filter(
        (s) => s.schoolId === currentUser.schoolId || s.schoolName === currentUser.schoolName
      );
    }
    return supervisions;
  }, [supervisions, currentUser]);

  // Selected supervision
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      return initialSupervisionId;
    }
    return availableSupervisions[0]?.id || '';
  });

  // Current active SAMBUNG letter tab
  const [activeTab, setActiveTab] = useState<TabType>('S');
  const [uSubTab, setUSubTab] = useState<'u1' | 'u2'>('u1');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active supervision object
  const currentSupervision = useMemo(() => {
    const found = availableSupervisions.find((s) => s.id === selectedId);
    if (!found) return availableSupervisions[0] || null;
    return found;
  }, [availableSupervisions, selectedId]);

  // Local draft of SambungData for immediate responsiveness
  const [sambungDraft, setSambungDraft] = useState<SambungData | null>(null);

  useEffect(() => {
    if (currentSupervision) {
      if (currentSupervision.sambung) {
        setSambungDraft(JSON.parse(JSON.stringify(currentSupervision.sambung)));
      } else {
        const defaultSambung = createDefaultSambungForTeacher(
          currentSupervision.teacherName,
          currentSupervision.schoolName,
          currentSupervision.subject
        );
        setSambungDraft(defaultSambung);
      }
    }
  }, [currentSupervision?.id]);

  if (!currentSupervision || !sambungDraft) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Compass className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Supervisi Guru</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {currentUser.role === 'guru'
            ? 'Anda belum memiliki instrumen supervisi aktif. Hubungi pengawas pembina Kusnandar, M.Si atau kepala sekolah untuk memulai.'
            : 'Belum ada guru yang terdaftar dalam daftar supervisi. Mulai supervisi baru untuk mengaktifkan siklus SAMBUNG.'}
        </p>
      </div>
    );
  }

  // Save handler
  const handleSave = async () => {
    if (!currentSupervision || !sambungDraft) return;
    setIsSaving(true);

    try {
      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: {
          ...sambungDraft,
          lastUpdated: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      await saveSupervision(updatedSupervision);
      onUpdateSupervision(updatedSupervision);
      setSaveToast(`Instrumen SAMBUNG untuk ${currentSupervision.teacherName} berhasil disimpan!`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan data.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Tab definitions
  const TABS_CONFIG: { key: TabType; letter: string; name: string; title: string; subtitle: string; color: string }[] = [
    {
      key: 'S',
      letter: 'S',
      name: 'SELIDIKI',
      title: 'S — Lembar Pemetaan Pembelajaran',
      subtitle: 'SELIDIKI — diisi dari telaah perangkat, observasi awal, dan dialog',
      color: 'bg-indigo-600',
    },
    {
      key: 'A',
      letter: 'A',
      name: 'ARAHKAN',
      title: 'A — Rencana Aksi Pembinaan Pembelajaran',
      subtitle: 'ARAHKAN — disepakati bersama kepala sekolah dan guru',
      color: 'bg-blue-600',
    },
    {
      key: 'M',
      letter: 'M',
      name: 'MAKNAI',
      title: 'M — Lembar Coaching (Dialog Reflektif)',
      subtitle: 'MAKNAI — pembinaan dimulai dari dialog, bukan instruksi',
      color: 'bg-emerald-600',
    },
    {
      key: 'B',
      letter: 'B',
      name: 'BERDAYAKAN',
      title: 'B — Lembar Rancang – Coba – Refleksi – Perbaiki',
      subtitle: 'BERDAYAKAN — diisi guru; mencakup memahami, mengaplikasikan, merefleksikan, menghubungkan',
      color: 'bg-amber-600',
    },
    {
      key: 'U',
      letter: 'U',
      name: 'UJI',
      title: 'U — UJI: Observasi Kelas & Suara Murid',
      subtitle: 'U-1 Observasi Kelas SAMBUNG & U-2 Angket Refleksi Murid',
      color: 'bg-purple-600',
    },
    {
      key: 'N',
      letter: 'N',
      name: 'NYATAKAN',
      title: 'N — Before–After dan Data Dampak',
      subtitle: 'NYATAKAN — setiap perubahan harus disertai bukti nyata',
      color: 'bg-rose-600',
    },
    {
      key: 'G',
      letter: 'G',
      name: 'GERAKKAN',
      title: 'G — Tindak Lanjut dan Pengimbasan',
      subtitle: 'GERAKKAN — hasil supervisi tidak berhenti sebagai catatan',
      color: 'bg-cyan-600',
    },
  ];

  // Recalculate U-1 Observasi Total
  const handleU1ScoreChange = (indikatorId: number, newScore: 1 | 2 | 3 | 4) => {
    if (!sambungDraft) return;
    const updatedList = sambungDraft.uji.u1_observasi.indikatorList.map((ind) =>
      ind.id === indikatorId ? { ...ind, score: newScore } : ind
    );
    const newTotal = updatedList.reduce((sum, item) => sum + item.score, 0);
    const newPct = (newTotal / 40) * 100;

    setSambungDraft({
      ...sambungDraft,
      uji: {
        ...sambungDraft.uji,
        u1_observasi: {
          ...sambungDraft.uji.u1_observasi,
          indikatorList: updatedList,
          totalSkor: newTotal,
          persentaseCapaian: newPct,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl font-black tracking-tighter">SAMBUNG</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Lampiran Praktik Baik &bull; Apresiasi GTK 2026 Pengawas Sekolah SMA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instrumen Siklus Strategi SAMBUNG
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-3xl leading-relaxed">
              Supervisi berkesinambungan oleh <strong>Kusnandar, M.Si</strong> berbasis 7 tahapan:{' '}
              <span className="font-semibold text-white">S</span>elidiki &bull;{' '}
              <span className="font-semibold text-white">A</span>rahkan &bull;{' '}
              <span className="font-semibold text-white">M</span>aknai &bull;{' '}
              <span className="font-semibold text-white">B</span>erdayakan &bull;{' '}
              <span className="font-semibold text-white">U</span>ji &bull;{' '}
              <span className="font-semibold text-white">N</span>yatakan &bull;{' '}
              <span className="font-semibold text-white">G</span>erakkan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>Cetak Portofolio Guru Ini</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-400/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEACHER SELECTOR & IDENTITY CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        {/* If supervisor or kepsek, show teacher switcher */}
        {currentUser.role !== 'guru' && (
          <div className="mb-5 pb-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Guru Yang Dinilai / Disupervisi:
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hasil instrumen dan penilaian otomatis keluar sesuai dengan nama guru yang dipilih.
                </p>
              </div>

              {/* Search filter for teacher */}
              {availableSupervisions.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama guru / mapel..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Quick chips of teachers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {availableSupervisions
                .filter(
                  (s) =>
                    !teacherSearch ||
                    s.teacherName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.subject.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.schoolName.toLowerCase().includes(teacherSearch.toLowerCase())
                )
                .map((sup) => {
                  const isSelected = sup.id === selectedId;
                  return (
                    <button
                      key={sup.id}
                      onClick={() => setSelectedId(sup.id)}
                      className={`px-3 py-2 rounded-xl text-left transition-all shrink-0 border flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {sup.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{sup.teacherName}</p>
                        <p className={`text-[10px] leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {sup.subject} &bull; {sup.schoolName}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Selected Teacher Profile Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-xs">
              {currentSupervision.teacherName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentSupervision.teacherName}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {currentSupervision.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentSupervision.classGrade}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
                  {currentSupervision.schoolName}
                </span>
                <span>NIP: {currentSupervision.teacherNip || '-'}</span>
                <span>Pengawas Pembina: <strong className="text-slate-700">Kusnandar, M.Si</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics of this teacher's SAMBUNG */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Skor U-1 Observasi</span>
              <span className="text-base font-extrabold text-indigo-600">
                {sambungDraft.uji.u1_observasi.totalSkor} / 40
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Suara Murid (U-2)</span>
              <span className="text-base font-extrabold text-emerald-600">
                {sambungDraft.uji.u2_angketMurid.items.length > 0
                  ? (
                      sambungDraft.uji.u2_angketMurid.items.reduce((s, i) => s + i.persentaseSetuju, 0) /
                      sambungDraft.uji.u2_angketMurid.items.length
                    ).toFixed(1)
                  : '0'}%
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                {sambungDraft.uji.u2_angketMurid.jumlahResponden} Murid
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Siklus Berdayakan</span>
              <span className="text-base font-extrabold text-amber-600">
                {sambungDraft.berdayakan.siklusList.length} Siklus
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Rancang-Refleksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* S - A - M - B - U - N - G TAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mb-1 ${
                    isActive ? 'bg-white text-indigo-900' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.letter}
                </div>
                <span className="text-xs font-bold tracking-tight leading-none">{tab.name}</span>
                <span
                  className={`text-[9px] mt-0.5 leading-none ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {tab.key === 'S' && 'Pemetaan'}
                  {tab.key === 'A' && 'Aksi Pembinaan'}
                  {tab.key === 'M' && 'Coaching'}
                  {tab.key === 'B' && 'Rancang-Coba'}
                  {tab.key === 'U' && 'Observasi & Murid'}
                  {tab.key === 'N' && 'Before-After'}
                  {tab.key === 'G' && 'Tindak Lanjut'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        
        {/* ==================================================== */}
        {/* TAB S: SELIDIKI — LEMBAR PEMETAAN PEMBELAJARAN */}
        {/* ==================================================== */}
        {activeTab === 'S' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
                  TAHAP S &bull; SELIDIKI
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Pemetaan Pembelajaran
                </h3>
                <p className="text-xs text-slate-500">
                  Diisi dari telaah perangkat, observasi awal, dan dialog bersama guru {currentSupervision.teacherName}.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Tanggal Pemetaan:</span>
                <input
                  type="date"
                  value={sambungDraft.selidiki.tanggal}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      selidiki: { ...sambungDraft.selidiki, tanggal: e.target.value },
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center w-12">No</th>
                    <th className="py-2.5 px-3 text-left w-56">Aspek</th>
                    <th className="py-2.5 px-3 text-left">Kondisi Awal</th>
                    <th className="py-2.5 px-3 text-left w-48">Bukti (Kode/Foto/Karya)</th>
                    <th className="py-2.5 px-3 text-left">Kebutuhan Pembinaan</th>
                    <th className="py-2.5 px-3 text-center w-24">Prioritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sambungDraft.selidiki.items.map((item, idx) => (
                    <tr key={item.id} className={item.isPrioritas ? 'bg-amber-50/40' : ''}>
                      <td className="py-3 px-3 text-center font-bold text-slate-500">{item.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900 align-top">
                        {item.aspek}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <textarea
                          rows={2}
                          value={item.kondisiAwal}
                          onChange={(e) => {
                            const newItems = [...sambungDraft.selidiki.items];
                            newItems[idx].kondisiAwal = e.target.value;
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, items: newItems },
                            });
                          }}
                          placeholder="Deskripsikan kondisi awal murid & guru..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                        />
                      </td>
                      <td className="py-3 px-3 align-top">
                        <input
                          type="text"
                          value={item.bukti}
                          onChange={(e) => {
                            const newItems = [...sambungDraft.selidiki.items];
                            newItems[idx].bukti = e.target.value;
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, items: newItems },
                            });
                          }}
                          placeholder="Contoh: Dok-01, Pretest"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                        />
                      </td>
                      <td className="py-3 px-3 align-top">
                        <textarea
                          rows={2}
                          value={item.kebutuhanPembinaan}
                          onChange={(e) => {
                            const newItems = [...sambungDraft.selidiki.items];
                            newItems[idx].kebutuhanPembinaan = e.target.value;
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, items: newItems },
                            });
                          }}
                          placeholder="Kebutuhan pembinaan guru..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                        />
                      </td>
                      <td className="py-3 px-3 text-center align-top">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!item.isPrioritas}
                            onChange={(e) => {
                              const newItems = [...sambungDraft.selidiki.items];
                              newItems[idx].isPrioritas = e.target.checked;
                              setSambungDraft({
                                ...sambungDraft,
                                selidiki: { ...sambungDraft.selidiki, items: newItems },
                              });
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="text-[11px] font-medium text-slate-700">Prioritas</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  Panduan Catatan Prioritas Pembinaan:
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Tandai aspek yang paling banyak perlu penguatan sebagai prioritas pembinaan untuk melangkah ke tahap A (Arahkan).
              </p>
              <textarea
                rows={2}
                value={sambungDraft.selidiki.catatanPrioritas || ''}
                onChange={(e) =>
                  setSambungDraft({
                    ...sambungDraft,
                    selidiki: { ...sambungDraft.selidiki, catatanPrioritas: e.target.value },
                  })
                }
                placeholder="Tuliskan catatan kesimpulan aspek prioritas pembinaan..."
                className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-indigo-600 bg-white"
              />
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB A: ARAHKAN — RENCANA AKSI PEMBINAAN */}
        {/* ==================================================== */}
        {activeTab === 'A' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-1">
                TAHAP A &bull; ARAHKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Rencana Aksi Pembinaan Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Disepakati bersama kepala sekolah, pengawas pembina (Kusnandar, M.Si), dan guru {currentSupervision.teacherName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode Pelaksanaan:
                </label>
                <input
                  type="text"
                  value={sambungDraft.arahkan.periode}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: { ...sambungDraft.arahkan, periode: e.target.value },
                    })
                  }
                  placeholder="Contoh: Semester Ganjil 2025/2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sekolah / Satuan Pendidikan:
                </label>
                <input
                  type="text"
                  disabled
                  value={currentSupervision.schoolName}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600"
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-indigo-950">
                Fokus Perubahan (Satu kalimat: berdasarkan kebutuhan, realistis, terukur, berdampak pada murid):
              </label>
              <textarea
                rows={2}
                value={sambungDraft.arahkan.fokusPerubahan}
                onChange={(e) =>
                  setSambungDraft({
                    ...sambungDraft,
                    arahkan: { ...sambungDraft.arahkan, fokusPerubahan: e.target.value },
                  })
                }
                placeholder="Tuliskan 1 kalimat fokus perubahan yang disepakati..."
                className="w-full px-3 py-2 rounded-lg border border-indigo-300 text-xs focus:outline-indigo-600 bg-white leading-relaxed italic"
              />
            </div>

            {/* Kegiatan Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Matriks Kegiatan Pembinaan:
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newKegiatan = [
                      ...sambungDraft.arahkan.kegiatan,
                      {
                        id: Date.now(),
                        kegiatanPembinaan: '',
                        indikatorKeberhasilan: '',
                        waktu: 'Bulan ke-...',
                        penanggungJawab: `${currentSupervision.teacherName} & Pengawas`,
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: { ...sambungDraft.arahkan, kegiatan: newKegiatan },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3 text-left">Kegiatan Pembinaan</th>
                      <th className="py-2.5 px-3 text-left">Indikator Keberhasilan</th>
                      <th className="py-2.5 px-3 text-left w-36">Waktu</th>
                      <th className="py-2.5 px-3 text-left w-48">Penanggung Jawab</th>
                      <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.arahkan.kegiatan.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.kegiatanPembinaan}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].kegiatanPembinaan = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Nama kegiatan..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.indikatorKeberhasilan}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].indikatorKeberhasilan = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Ukuran capaian..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Tanggal / Waktu..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.penanggungJawab}
                            onChange={(e) => {
                              const list = [...sambungDraft.arahkan.kegiatan];
                              list[idx].penanggungJawab = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                              });
                            }}
                            placeholder="Nama PJ..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {sambungDraft.arahkan.kegiatan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.arahkan.kegiatan.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kesepakatan Tanda Tangan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Pengawas Sekolah</span>
                <p className="font-bold text-xs text-slate-900">Kusnandar, M.Si</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">Disepakati Pembina</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Kepala Sekolah</span>
                <input
                  type="text"
                  value={sambungDraft.arahkan.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: {
                        ...sambungDraft.arahkan,
                        tandaTangan: {
                          pengawas: 'Kusnandar, M.Si',
                          guru: currentSupervision.teacherName,
                          tanggalDisepakati: new Date().toISOString().split('T')[0],
                          kepalaSekolah: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full text-center text-xs font-bold text-slate-900 border-b border-dashed border-slate-300 bg-transparent py-0.5"
                />
                <p className="text-[10px] text-slate-500 mt-1">{currentSupervision.schoolName}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Guru Mata Pelajaran</span>
                <p className="font-bold text-xs text-slate-900">{currentSupervision.teacherName}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-1">{currentSupervision.subject}</p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB M: MAKNAI — LEMBAR COACHING (DIALOG REFLEKTIF) */}
        {/* ==================================================== */}
        {activeTab === 'M' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                  TAHAP M &bull; MAKNAI
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Coaching (Dialog Reflektif)
                </h3>
                <p className="text-xs text-slate-500">
                  Pembinaan dimulai dari dialog, bukan instruksi. Guru menemukan solusi mandiri dengan panduan coach Kusnandar, M.Si.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Tanggal Dialog:</span>
                <input
                  type="date"
                  value={sambungDraft.maknai.tanggal}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: { ...sambungDraft.maknai, tanggal: e.target.value },
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-indigo-600"
                />
              </div>
            </div>

            {/* 4 Coaching Stages */}
            <div className="grid grid-cols-1 gap-4">
              {/* 1. Tujuan */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-xs uppercase">
                    1. Tujuan
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Pengalaman belajar seperti apa yang ingin diciptakan untuk murid?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.tujuan}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, tujuan: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai tujuan pengalaman belajar murid..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 2. Realitas */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs uppercase">
                    2. Realitas
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Apa yang sudah berjalan baik? Bagaimana kita tahu murid benar-benar belajar?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.realitas}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, realitas: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai realitas kondisi pembelajaran saat ini..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 3. Opsi */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs uppercase">
                    3. Opsi
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Apa yang membuat pembelajaran bermakna bagi murid? Apa yang bisa dicoba?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.opsi}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, opsi: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan guru mengenai ide, opsi alternatif, dan inovasi yang bisa dicoba..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>

              {/* 4. Komitmen */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-xs uppercase">
                    4. Komitmen
                  </span>
                  <span className="text-xs font-semibold text-slate-700 italic">
                    &ldquo;Langkah kecil apa yang akan dicoba? Dukungan apa yang dibutuhkan? Kapan kita tinjau?&rdquo;
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={sambungDraft.maknai.coaching.komitmen}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      maknai: {
                        ...sambungDraft.maknai,
                        coaching: { ...sambungDraft.maknai.coaching, komitmen: e.target.value },
                      },
                    })
                  }
                  placeholder="Catatan komitmen tindakan konkret guru dan jadwal peninjauan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB B: BERDAYAKAN — LEMBAR RANCANG-COBA-REFLEKSI-PERBAIKI */}
        {/* ==================================================== */}
        {activeTab === 'B' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold mb-1">
                  TAHAP B &bull; BERDAYAKAN
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lembar Rancang &ndash; Coba &ndash; Refleksi &ndash; Perbaiki
                </h3>
                <p className="text-xs text-slate-500">
                  Diisi guru; rancangan mencakup memahami, mengaplikasikan, merefleksikan, dan menghubungkan materi {currentSupervision.subject}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextSiklus = sambungDraft.berdayakan.siklusList.length + 1;
                  setSambungDraft({
                    ...sambungDraft,
                    berdayakan: {
                      ...sambungDraft.berdayakan,
                      siklusList: [
                        ...sambungDraft.berdayakan.siklusList,
                        {
                          siklus: nextSiklus,
                          rancanganDanUjiCoba: '',
                          refleksi: '',
                          perbaikanBerikutnya: '',
                        },
                      ],
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siklus</span>
              </button>
            </div>

            <div className="space-y-4">
              {sambungDraft.berdayakan.siklusList.map((item, idx) => (
                <div
                  key={item.siklus}
                  className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-xs">
                        S{item.siklus}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">Siklus {item.siklus}</h4>
                    </div>

                    {sambungDraft.berdayakan.siklusList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = sambungDraft.berdayakan.siklusList.filter((_, i) => i !== idx);
                          // Reindex
                          const reindexed = filtered.map((s, i) => ({ ...s, siklus: i + 1 }));
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: reindexed },
                          });
                        }}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Siklus</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rancangan &amp; Hasil Uji Coba pada Murid:
                      </label>
                      <textarea
                        rows={4}
                        value={item.rancanganDanUjiCoba}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].rancanganDanUjiCoba = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Rancangan aktivitas uji coba dan respons murid..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Refleksi (Berhasil / Belum, Mengapa):
                      </label>
                      <textarea
                        rows={4}
                        value={item.refleksi}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].refleksi = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Evaluasi guru terhadap keberhasilan atau kendala..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Perbaikan Berikutnya:
                      </label>
                      <textarea
                        rows={4}
                        value={item.perbaikanBerikutnya}
                        onChange={(e) => {
                          const updated = [...sambungDraft.berdayakan.siklusList];
                          updated[idx].perbaikanBerikutnya = e.target.value;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: { ...sambungDraft.berdayakan, siklusList: updated },
                          });
                        }}
                        placeholder="Langkah modifikasi dan perbaikan untuk siklus berikutnya..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB U: UJI — OBSERVASI KELAS (U-1) & ANGKET MURID (U-2) */}
        {/* ==================================================== */}
        {activeTab === 'U' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold mb-1">
                TAHAP U &bull; UJI
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Uji: Observasi Kelas &amp; Suara Murid
              </h3>
              <p className="text-xs text-slate-500">
                Kombinasi observasi pembelajaran langsung dan refleksi suara murid (Student Agency).
              </p>

              {/* Subtab switcher */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUSubTab('u1')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    uSubTab === 'u1'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  U-1: Observasi Kelas SAMBUNG ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
                </button>
                <button
                  type="button"
                  onClick={() => setUSubTab('u2')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    uSubTab === 'u2'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  U-2: Angket Refleksi Murid ({sambungDraft.uji.u2_angketMurid.jumlahResponden} Responden)
                </button>
              </div>
            </div>

            {/* SUBTAB U-1 */}
            {uSubTab === 'u1' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hari &amp; Tanggal:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.hariTanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, hariTanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kelas yang Diobservasi:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.kelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tahap Observasi:</label>
                    <select
                      value={sambungDraft.uji.u1_observasi.tahapObservasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: {
                              ...sambungDraft.uji.u1_observasi,
                              tahapObservasi: e.target.value as 'awal' | 'siklus' | 'akhir',
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-900"
                    >
                      <option value="awal">Observasi Awal (Baseline)</option>
                      <option value="siklus">Observasi Siklus Pembinaan</option>
                      <option value="akhir">Observasi Akhir (Evaluasi)</option>
                    </select>
                  </div>
                </div>

                {/* Score bar */}
                <div className="p-4 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-200">Hasil Penilaian Observasi Kelas SAMBUNG</p>
                    <p className="text-xl font-extrabold">
                      {sambungDraft.uji.u1_observasi.totalSkor} / 40{' '}
                      <span className="text-sm font-normal text-indigo-300">
                        ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200 block uppercase font-bold">Kategori Mutu</span>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                      {sambungDraft.uji.u1_observasi.persentaseCapaian >= 85
                        ? 'Sangat Berkembang (SB)'
                        : sambungDraft.uji.u1_observasi.persentaseCapaian >= 70
                        ? 'Berkembang (B)'
                        : 'Mulai Berkembang (MB)'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala: 1 = belum tampak; 2 = mulai berkembang (sebagian kecil murid); 3 = berkembang (sebagian besar murid); 4 = sangat berkembang (murid berinisiatif, terbukti pada karya/ucapan).
                </div>

                {/* 10 Indikator Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-center">
                        <th className="py-2.5 px-2 w-8">No</th>
                        <th className="py-2.5 px-3 text-left">Indikator</th>
                        <th className="py-2.5 px-3 text-left w-36">Dimensi</th>
                        <th className="py-2.5 px-2 w-12">1</th>
                        <th className="py-2.5 px-2 w-12">2</th>
                        <th className="py-2.5 px-2 w-12">3</th>
                        <th className="py-2.5 px-2 w-12">4</th>
                        <th className="py-2.5 px-3 text-left w-64">Catatan Pengamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u1_observasi.indikatorList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.indikator}</td>
                          <td className="py-2 px-3 text-indigo-700 font-semibold">{item.dimensi}</td>
                          {[1, 2, 3, 4].map((val) => (
                            <td key={val} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name={`ind_${item.id}`}
                                checked={item.score === val}
                                onChange={() => handleU1ScoreChange(item.id, val as 1 | 2 | 3 | 4)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.catatan}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u1_observasi.indikatorList];
                                list[idx].catatan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u1_observasi: { ...sambungDraft.uji.u1_observasi, indikatorList: list },
                                  },
                                });
                              }}
                              placeholder="Catatan bukti teramati..."
                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Apa yang dialami murid?
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.apaYangDialamiMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, apaYangDialamiMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Uraikan pengalaman belajar yang dialami murid..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kekuatan dan rekomendasi:
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.kekuatanDanRekomendasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kekuatanDanRekomendasi: e.target.value },
                          },
                        })
                      }
                      placeholder="Catatan kekuatan pembelajaran dan saran rekomendasi..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB U-2 */}
            {uSubTab === 'u2' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kode Murid / Kelas:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u2_angketMurid.kodeMuridKelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kodeMuridKelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tanggal Pengisian:</label>
                    <input
                      type="date"
                      value={sambungDraft.uji.u2_angketMurid.tanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, tanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Jumlah Murid Responden:</label>
                    <input
                      type="number"
                      value={sambungDraft.uji.u2_angketMurid.jumlahResponden}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: {
                              ...sambungDraft.uji.u2_angketMurid,
                              jumlahResponden: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala Likert Murid: 1 = sangat tidak setuju; 2 = tidak setuju; 3 = setuju; 4 = sangat setuju. % setuju = jumlah murid yang memilih 3 atau 4 dibagi jumlah responden &times; 100%.
                </div>

                {/* 5 Pernyataan */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left">Pernyataan Suara Murid</th>
                        <th className="py-2.5 px-3 text-center w-36">Rata-rata Skor (1-4)</th>
                        <th className="py-2.5 px-3 text-center w-40">% Setuju (Pilihan 3 &amp; 4)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u2_angketMurid.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{item.pernyataan}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="4"
                              value={item.skorRataRata}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u2_angketMurid.items];
                                list[idx].skorRataRata = parseFloat(e.target.value) || 0;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 text-center font-bold rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={item.persentaseSetuju}
                                onChange={(e) => {
                                  const list = [...sambungDraft.uji.u2_angketMurid.items];
                                  list[idx].persentaseSetuju = parseFloat(e.target.value) || 0;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    uji: {
                                      ...sambungDraft.uji,
                                      u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                    },
                                  });
                                }}
                                className="w-20 px-2 py-1 text-center font-bold text-indigo-700 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                              />
                              <span className="font-bold text-slate-500">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-950">
                      Hal yang paling bermakna bagi saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.halPalingBermakna}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, halPalingBermakna: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan orisinal murid tentang hal yang paling bermakna..."
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>

                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Kesulitan saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.kesulitanMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kesulitanMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan kesulitan murid yang perlu diatasi guru..."
                      className="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB N: NYATAKAN — BEFORE-AFTER & DATA DAMPAK */}
        {/* ==================================================== */}
        {activeTab === 'N' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                TAHAP N &bull; NYATAKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Before&ndash;After dan Data Dampak
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan harus disertai bukti konkret dari pembelajaran guru {currentSupervision.teacherName}.
              </p>
            </div>

            {/* 1. Before-After Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Matriks Perubahan Before &ndash; After
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-left w-48">Aspek Perubahan</th>
                      <th className="py-2.5 px-3 text-left">Sebelum SAMBUNG</th>
                      <th className="py-2.5 px-3 text-left">Setelah SAMBUNG</th>
                      <th className="py-2.5 px-3 text-left w-44">Bukti (Kode/Arsip)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.nyatakan.beforeAfter.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-bold text-slate-900 align-top bg-slate-50/40">
                          {item.aspek}
                        </td>
                        <td className="py-3 px-3 align-top">
                          <textarea
                            rows={2}
                            value={item.sebelumSambung}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.beforeAfter];
                              list[idx].sebelumSambung = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, beforeAfter: list },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <textarea
                            rows={2}
                            value={item.setelahSambung}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.beforeAfter];
                              list[idx].setelahSambung = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, beforeAfter: list },
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <input
                            type="text"
                            value={item.buktiKode}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.beforeAfter];
                              list[idx].buktiKode = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, beforeAfter: list },
                              });
                            }}
                            placeholder="Contoh: BKT-01"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Data Dampak Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                2. Data Dampak (Awal, Akhir, Selisih, Sumber)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-left">Indikator Data Dampak</th>
                      <th className="py-2.5 px-3 text-center w-28">Awal</th>
                      <th className="py-2.5 px-3 text-center w-28">Akhir</th>
                      <th className="py-2.5 px-3 text-center w-28">Selisih</th>
                      <th className="py-2.5 px-3 text-left w-52">Sumber Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.nyatakan.dataDampak.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{row.indikator}</td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="text"
                            value={row.awal}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.dataDampak];
                              list[idx].awal = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                              });
                            }}
                            className="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="text"
                            value={row.akhir}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.dataDampak];
                              list[idx].akhir = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                              });
                            }}
                            className="w-20 px-2 py-1 text-center font-bold text-slate-900 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="text"
                            value={row.selisih}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.dataDampak];
                              list[idx].selisih = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                              });
                            }}
                            className="w-20 px-2 py-1 text-center font-bold text-emerald-700 rounded-lg border border-emerald-200 bg-emerald-50 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={row.sumber}
                            onChange={(e) => {
                              const list = [...sambungDraft.nyatakan.dataDampak];
                              list[idx].sumber = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-2">
                * Gunakan data nyata. Jika data tertentu tidak tersedia, tulis sebagai keterbatasan, jangan diisi angka perkiraan.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB G: GERAKKAN — TINDAK LANJUT & PENGIMBASAN */}
        {/* ==================================================== */}
        {activeTab === 'G' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-xs font-bold mb-1">
                TAHAP G &bull; GERAKKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tindak Lanjut dan Pengimbasan
              </h3>
              <p className="text-xs text-slate-500">
                Hasil supervisi tidak berhenti sebagai catatan. Diwujudkan dalam rencana tindak lanjut dan pengimbasan praktik baik.
              </p>
            </div>

            {/* 1. Tabel Tindak Lanjut */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Rencana Tindak Lanjut Temuan Supervisi
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [
                      ...sambungDraft.gerakkan.tindakLanjut,
                      {
                        id: Date.now(),
                        temuanSupervisi: '',
                        tindakLanjut: '',
                        penanggungJawab: currentSupervision.teacherName,
                        waktu: '1 Minggu ke depan',
                        hasil: '',
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: newList },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tindak Lanjut</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3 text-left">Temuan Supervisi</th>
                      <th className="py-2.5 px-3 text-left">Tindak Lanjut</th>
                      <th className="py-2.5 px-3 text-left w-40">Penanggung Jawab</th>
                      <th className="py-2.5 px-3 text-left w-32">Waktu</th>
                      <th className="py-2.5 px-3 text-left w-48">Hasil</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.gerakkan.tindakLanjut.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.temuanSupervisi}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].temuanSupervisi = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Catatan temuan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.tindakLanjut}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].tindakLanjut = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Aksi tindak lanjut..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.penanggungJawab}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].penanggungJawab = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.hasil}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.tindakLanjut];
                              list[idx].hasil = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                              });
                            }}
                            placeholder="Hasil perbaikan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {sambungDraft.gerakkan.tindakLanjut.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.gerakkan.tindakLanjut.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Tabel Diseminasi & Pengimbasan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Diseminasi &amp; Pengimbasan Praktik Baik
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const newList = [
                      ...sambungDraft.gerakkan.pengimbasan,
                      {
                        id: Date.now(),
                        praktikBaik: '',
                        sasaran: 'Komunitas Belajar (Kombel)',
                        bentuk: 'Berbagi Praktik Baik',
                        waktu: 'Bulan Depan',
                      },
                    ];
                    setSambungDraft({
                      ...sambungDraft,
                      gerakkan: { ...sambungDraft.gerakkan, pengimbasan: newList },
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pengimbasan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 text-left">Praktik Baik yang Diimbaskan</th>
                      <th className="py-2.5 px-3 text-left w-56">Sasaran</th>
                      <th className="py-2.5 px-3 text-left w-52">Bentuk (MGMP, Berbagi, Publikasi)</th>
                      <th className="py-2.5 px-3 text-left w-36">Waktu</th>
                      <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.gerakkan.pengimbasan.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.praktikBaik}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].praktikBaik = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Judul / topik praktik baik..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.sasaran}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].sasaran = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Sasaran pengimbasan..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.bentuk}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].bentuk = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            placeholder="Contoh: MGMP, Webinar PMM"
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.waktu}
                            onChange={(e) => {
                              const list = [...sambungDraft.gerakkan.pengimbasan];
                              list[idx].waktu = e.target.value;
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                              });
                            }}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {sambungDraft.gerakkan.pengimbasan.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const list = sambungDraft.gerakkan.pengimbasan.filter((_, i) => i !== idx);
                                setSambungDraft({
                                  ...sambungDraft,
                                  gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Floating/Fixed Bar for Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>
            Portofolio SAMBUNG Aktif:{' '}
            <strong className="text-white">{currentSupervision.teacherName}</strong> ({currentSupervision.subject})
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak Dokumen</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Data SAMBUNG'}</span>
          </button>
        </div>
      </div>

      {/* PRINT MODAL */}
      <SambungPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        supervision={{
          ...currentSupervision,
          sambung: sambungDraft,
        }}
      />
    </div>
  );
};
