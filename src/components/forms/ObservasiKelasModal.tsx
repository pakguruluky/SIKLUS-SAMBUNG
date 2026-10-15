import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { OBSERVASI_ITEMS } from '../../data/instrumentData';
import { getTeacherDescriptiveDataDampak } from '../../data/sambungSeed';
import { X, Save, CheckCircle2, FileSpreadsheet, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface ObservasiKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
  mode?: 'awal' | 'perbaikan';
}

export const ObservasiKelasModal: React.FC<ObservasiKelasModalProps> = ({
  isOpen,
  onClose,
  supervision,
  currentUser,
  onSaved,
  mode = 'awal',
}) => {
  const isPerbaikan = mode === 'perbaikan';
  const sourceData = isPerbaikan && supervision.observasiKelasPerbaikan
    ? supervision.observasiKelasPerbaikan
    : supervision.observasiKelas;

  // Initialize items from sourceData or auto-fill defaults
  const [items, setItems] = useState<Record<string, { score?: number; note: string; status?: 'Ya' | 'Tidak' }>>(() => {
    if (sourceData?.items && Object.keys(sourceData.items).length > 0) {
      const normalized: Record<string, { score: number; note: string; status?: 'Ya' | 'Tidak' }> = {};
      Object.entries(sourceData.items).forEach(([key, val]) => {
        const sc = val.score !== undefined ? val.score : (val.status === 'Ya' ? 2 : 0);
        normalized[key] = {
          score: sc,
          note: val.note || '',
          status: sc >= 1 ? 'Ya' : 'Tidak',
        };
      });
      return normalized;
    }
    // Tanpa auto-fill otomatis: inisialisasi kosong untuk diisi supervisor
    const emptyScores: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note: string }> = {};
    OBSERVASI_ITEMS.forEach(it => {
      emptyScores[it.id] = { score: undefined, note: '', status: undefined };
    });
    return emptyScores;
  });

  // 3-point Feedback Implementasi Pembelajaran (PDF Hal 12)
  const [kelebihan, setKelebihan] = useState(
    sourceData?.feedback?.kelebihan || sourceData?.feedbackNotes || ''
  );
  const [peningkatan, setPeningkatan] = useState(
    sourceData?.feedback?.peningkatan || ''
  );
  const [rekomendasi, setRekomendasi] = useState(
    sourceData?.feedback?.rekomendasi || ''
  );

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const isGuru = currentUser.role === 'guru';
  const isSupervisor = currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas' || currentUser.role === 'kepsek';

  if (!isOpen) return null;

  // Auto calculate Skor & Predikat (PDF Hal 13)
  // Max Skor: 25 aspek * 2 = 50
  const totalAspek = OBSERVASI_ITEMS.length; // 25
  const maxPossibleScore = totalAspek * 2; // 50
  let totalScore = 0;
  let totalYa = 0;
  let hasScoredAny = false;

  OBSERVASI_ITEMS.forEach(it => {
    const itState = items[it.id];
    if (itState?.score !== undefined) {
      hasScoredAny = true;
      const sc = Number(itState.score);
      totalScore += sc;
      if (sc >= 1) {
        totalYa += 1;
      }
    }
  });

  const scorePercent = hasScoredAny ? parseFloat(((totalScore / maxPossibleScore) * 100).toFixed(1)) : 0;
  
  // Predikat resmi sesuai dokumen PDF Halaman 13:
  // 90–100 : Sangat Baik
  // 80–89  : Baik
  // 70–79  : Cukup
  // <70    : Perlu Perbaikan
  let predicate = 'Belum Dinilai';
  if (hasScoredAny) {
    if (scorePercent >= 90) predicate = 'Sangat Baik';
    else if (scorePercent >= 80) predicate = 'Baik';
    else if (scorePercent >= 70) predicate = 'Cukup';
    else predicate = 'Perlu Perbaikan';
  }

  const handleScoreChange = (id: string, scoreVal: number) => {
    if (!isSupervisor) return;
    setItems(prev => ({
      ...prev,
      [id]: {
        score: scoreVal,
        note: prev[id]?.note || '',
        status: scoreVal >= 1 ? 'Ya' : 'Tidak',
      }
    }));
  };

  const handleNoteChange = (id: string, noteVal: string) => {
    if (!isSupervisor) return;
    setItems(prev => ({
      ...prev,
      [id]: {
        score: prev[id]?.score,
        note: noteVal,
        status: prev[id]?.score !== undefined ? (prev[id].score! >= 1 ? 'Ya' : 'Tidak') : undefined,
      }
    }));
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupervisor) return;

    try {
      setSaving(true);
      const combinedNotes = `${kelebihan}\n\nHal yang perlu ditingkatkan: ${peningkatan}\n\nRekomendasi: ${rekomendasi}`.trim();

      const dataPayload = {
        items,
        totalYa,
        totalAspek,
        totalSkor: totalScore,
        score: scorePercent,
        predicate,
        feedbackNotes: combinedNotes,
        feedback: {
          kelebihan: kelebihan.trim(),
          peningkatan: peningkatan.trim(),
          rekomendasi: rekomendasi.trim(),
        },
        completedAt: new Date().toISOString(),
      };

      let updatedSambung = supervision.sambung;
      if (!isPerbaikan && updatedSambung) {
        const syncedDampak = getTeacherDescriptiveDataDampak(
          supervision.teacherName,
          supervision.subject,
          supervision.schoolName,
          supervision.lessonTitle,
          supervision.perangkatAjar?.telaahSummary?.predicate,
          predicate
        );
        updatedSambung = {
          ...updatedSambung,
          nyatakan: {
            ...updatedSambung.nyatakan,
            dataDampak: syncedDampak,
          },
          lastUpdated: new Date().toISOString(),
        };
      }

      const updated: Supervision = isPerbaikan
        ? {
            ...supervision,
            observasiKelasPerbaikan: dataPayload,
          }
        : {
            ...supervision,
            observasiKelas: dataPayload,
            sambung: updatedSambung,
            status: 'in_progress',
          };

      await saveSupervision(updated);
      onSaved(updated);
      setSuccessToast('Hasil observasi kelas 25 aspek berhasil disimpan ke Cloud Database!');
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan observasi kelas.');
    } finally {
      setSaving(false);
    }
  };

  // Group items by category (9 Kategori Resmi dari PDF)
  const categories = Array.from(new Set(OBSERVASI_ITEMS.map(i => i.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`${isPerbaikan ? 'bg-teal-800' : 'bg-emerald-800'} text-white p-4 sm:p-5 flex items-center justify-between shrink-0 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>{isPerbaikan ? 'Tahap U (Uji) • Observasi Pasca-Perbaikan' : 'Tahap S (Selidiki) • Observasi Pelaksanaan Pembelajaran Awal'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
              Instrumen Observasi Pelaksanaan Pembelajaran (25 Aspek)
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              Guru: <strong>{supervision.teacherName}</strong> &bull; Mapel: <strong>{supervision.subject}</strong> &bull; {supervision.classGrade} &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert for Guru vs Supervisor */}
        {isGuru && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Lihat Guru:</strong> Anda hanya dapat melihat hasil observasi dan komentar kritis pengawas tanpa mengubah skor penilaian.
            </span>
          </div>
        )}

        {successToast && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2 justify-center animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          
          {/* Real-time Score Banner & Auto-Fill Action */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Kalkulasi Skor Otomatis (Skala 0, 1, 2)</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Nilai Akhir Observasi: {totalScore} / {maxPossibleScore} ({scorePercent}%)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kriteria Skala: <strong>2</strong> (Terlaksana secara optimal), <strong>1</strong> (Terlaksana sebagian/belum optimal), <strong>0</strong> (Belum terlaksana).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="text-center px-3.5 py-1.5 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Skor Total</span>
                <p className="text-base font-black text-emerald-700">{totalScore} / 50</p>
              </div>

              <div className="text-center px-4 py-1.5 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Persentase</span>
                <p className="text-lg font-black text-emerald-700">{scorePercent}%</p>
              </div>

              <div className="text-center px-3.5 py-1.5 bg-white rounded-xl border border-emerald-300 shadow-2xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Predikat</span>
                <p className="text-xs font-black text-emerald-800">{predicate}</p>
              </div>
            </div>
          </div>

          {/* 25 Aspek Checklist Table categorized by 9 Domains from PDF */}
          <div className="space-y-6">
            {categories.map((cat, catIdx) => {
              const catItems = OBSERVASI_ITEMS.filter(i => i.category === cat);
              return (
                <div key={catIdx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200 flex items-center justify-between">
                    <span>{catIdx + 1}. {cat}</span>
                    <span className="text-[10px] text-slate-500 font-normal normal-case">
                      {catItems.length} Aspek Pengamatan
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {catItems.map((item) => {
                      const itemState = items[item.id] || { score: undefined, note: '' };
                      const currentScore = itemState.score;

                      return (
                        <div key={item.id} className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          {/* Item Aspect Description */}
                          <div className="flex-1 pr-2">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {item.id}
                              </span>
                              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                {item.aspect}
                              </p>
                            </div>
                          </div>

                          {/* Controls: Skala 0, 1, 2 & Komentar Kritis */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                            {/* Skala 0, 1, 2 Button Group */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                disabled={!isSupervisor}
                                onClick={() => handleScoreChange(item.id, 0)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentScore === 0
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                                title="0: Belum terlaksana"
                              >
                                0 (Belum)
                              </button>

                              <button
                                type="button"
                                disabled={!isSupervisor}
                                onClick={() => handleScoreChange(item.id, 1)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentScore === 1
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                                title="1: Terlaksana sebagian / belum optimal"
                              >
                                1 (Sebagian)
                              </button>

                              <button
                                type="button"
                                disabled={!isSupervisor}
                                onClick={() => handleScoreChange(item.id, 2)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  currentScore === 2
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                                title="2: Terlaksana secara optimal"
                              >
                                2 (Optimal)
                              </button>
                            </div>

                            {/* Komentar Kritis */}
                            <input
                              type="text"
                              disabled={!isSupervisor}
                              value={itemState.note || ''}
                              onChange={(e) => handleNoteChange(item.id, e.target.value)}
                              placeholder="Komentar kritis & catatan fakta di kelas..."
                              className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white disabled:bg-slate-100 disabled:text-slate-600"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: Umpan Balik Implementasi Pembelajaran (PDF Halaman 12) */}
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                Umpan Balik Implementasi Pembelajaran (Pengawas / Kepala Sekolah)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Refleksi dan rekomendasi resmi berdasarkan temuan observasi kelas 25 aspek di atas.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. Tuliskan kelebihan Pelaksanaan Pembelajaran:
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={kelebihan}
                  onChange={(e) => setKelebihan(e.target.value)}
                  placeholder="Uraikan kelebihan dan kekuatan praktik mengajar guru di kelas..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 text-xs disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  2. Tuliskan hal yang perlu ditingkatkan dari Pelaksanaan Pembelajaran:
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={peningkatan}
                  onChange={(e) => setPeningkatan(e.target.value)}
                  placeholder="Uraikan aspek yang masih belum optimal dan membutuhkan penguatan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 text-xs disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  3. Tuliskan rekomendasi dan perbaikan pelaksanaan pembelajaran sesuai prinsip Pembelajaran Mendalam:
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={rekomendasi}
                  onChange={(e) => setRekomendasi(e.target.value)}
                  placeholder="Rekomendasi tindak lanjut siklus perbaikan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 text-xs disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              Tutup
            </button>
            {isSupervisor && (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan ke Cloud...' : 'Simpan Observasi Kelas (25 Aspek)'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
