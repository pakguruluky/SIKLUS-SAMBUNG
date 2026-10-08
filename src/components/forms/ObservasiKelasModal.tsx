import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { OBSERVASI_ITEMS } from '../../data/instrumentData';
import { X, Save, CheckCircle2, FileSpreadsheet, Award, ShieldAlert } from 'lucide-react';
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

  const [items, setItems] = useState<Record<string, { status: 'Ya' | 'Tidak'; note: string }>>(
    sourceData?.items || {}
  );
  const [feedbackNotes, setFeedbackNotes] = useState(
    sourceData?.feedbackNotes || ''
  );
  const [saving, setSaving] = useState(false);

  const isGuru = currentUser.role === 'guru';
  const isSupervisor = currentUser.role === 'admin' || currentUser.role === 'kepsek';

  if (!isOpen) return null;

  // Auto calculate: Skor = (Total "Ya" / Total Aspek) * 100
  const totalAspek = OBSERVASI_ITEMS.length;
  let totalYa = 0;
  OBSERVASI_ITEMS.forEach(it => {
    if (items[it.id]?.status === 'Ya') {
      totalYa += 1;
    }
  });

  const score = parseFloat(((totalYa / totalAspek) * 100).toFixed(1));
  let predicate = 'Kurang (D)';
  if (score >= 90) predicate = 'Amat Baik (A)';
  else if (score >= 80) predicate = 'Baik (B)';
  else if (score >= 70) predicate = 'Cukup (C)';

  const handleStatusChange = (id: string, status: 'Ya' | 'Tidak') => {
    if (!isSupervisor) return;
    setItems(prev => ({
      ...prev,
      [id]: {
        status,
        note: prev[id]?.note || ''
      }
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    if (!isSupervisor) return;
    setItems(prev => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || 'Tidak',
        note
      }
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupervisor) return;

    try {
      setSaving(true);
      const dataPayload = {
        items,
        totalYa,
        totalAspek,
        score,
        predicate,
        feedbackNotes,
        completedAt: new Date().toISOString(),
      };

      const updated: Supervision = isPerbaikan
        ? {
            ...supervision,
            observasiKelasPerbaikan: dataPayload,
          }
        : {
            ...supervision,
            observasiKelas: dataPayload,
            status: 'in_progress',
          };

      await saveSupervision(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan observasi kelas.');
    } finally {
      setSaving(false);
    }
  };

  // Group items by category
  const categories = Array.from(new Set(OBSERVASI_ITEMS.map(i => i.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`${isPerbaikan ? 'bg-teal-700' : 'bg-emerald-700'} text-white p-4 sm:p-5 flex items-center justify-between shrink-0 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>{isPerbaikan ? 'Tahap U (Uji) &bull; Data Setelah Perbaikan' : 'Tahap S (Selidiki) &bull; Data Awal'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
              Instrumen Observasi Kelas Tatap Muka {isPerbaikan ? '(Setelah Ada Perbaikan)' : '(Kondisi Awal)'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Guru: {supervision.teacherName} &bull; {supervision.subject} &bull; {supervision.classGrade}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isGuru && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Lihat Guru:</strong> Anda melihat hasil observasi kelas tatap muka dan skor keterlaksanaan (Hanya Supervisor yang berwenang menilai).
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Real-time Score Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Kalkulasi Skor Observasi Otomatis</span>
              <p className="text-xs text-emerald-700 mt-0.5">
                Rumus: Skor = (Total Keterpenuhan &quot;Ya&quot; / {totalAspek} Aspek) &times; 100
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-1 bg-white rounded-xl border border-emerald-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total &quot;Ya&quot;</span>
                <p className="text-base font-extrabold text-emerald-700">{totalYa} / {totalAspek}</p>
              </div>

              <div className="text-center px-4 py-1 bg-white rounded-xl border border-emerald-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Skor Observasi</span>
                <p className="text-lg font-black text-emerald-700">{score}%</p>
              </div>

              <div className="text-center px-3 py-1 bg-white rounded-xl border border-emerald-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Predikat</span>
                <p className="text-xs font-extrabold text-emerald-800">{predicate}</p>
              </div>
            </div>
          </div>

          {/* Categorized Checklist Items */}
          <div className="space-y-6">
            {categories.map((cat, idx) => {
              const catItems = OBSERVASI_ITEMS.filter(i => i.category === cat);
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-200">
                    {cat}
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    {catItems.map((item) => {
                      const itemState = items[item.id] || { status: 'Tidak', note: '' };
                      return (
                        <div key={item.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1 pr-2">
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                              {item.aspect}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                            {/* Radio buttons Ya / Tidak */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <label
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  isSupervisor ? 'cursor-pointer' : 'cursor-default opacity-85'
                                } transition-all ${
                                  itemState.status === 'Ya'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status_${item.id}`}
                                  value="Ya"
                                  disabled={!isSupervisor}
                                  checked={itemState.status === 'Ya'}
                                  onChange={() => handleStatusChange(item.id, 'Ya')}
                                  className="sr-only"
                                />
                                Ya
                              </label>

                              <label
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  isSupervisor ? 'cursor-pointer' : 'cursor-default opacity-85'
                                } transition-all ${
                                  itemState.status === 'Tidak'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`status_${item.id}`}
                                  value="Tidak"
                                  disabled={!isSupervisor}
                                  checked={itemState.status === 'Tidak'}
                                  onChange={() => handleStatusChange(item.id, 'Tidak')}
                                  className="sr-only"
                                />
                                Tidak
                              </label>
                            </div>

                            {/* Catatan Per Aspek */}
                            <input
                              type="text"
                              disabled={!isSupervisor}
                              value={itemState.note}
                              onChange={(e) => handleNoteChange(item.id, e.target.value)}
                              placeholder="Catatan fakta di kelas..."
                              className="w-full sm:w-56 px-2.5 py-1 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-white disabled:bg-slate-100"
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

          {/* Feedback Notes */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              Masukan &amp; Catatan Supervisor terhadap Pelaksanaan Pembelajaran:
            </label>
            <textarea
              rows={3}
              disabled={!isSupervisor}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Berikan ringkasan apresiasi suasana kelas, interaksi siswa, dan poin penting penguatan..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-emerald-600 text-xs disabled:bg-slate-100"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-xs"
            >
              Tutup
            </button>
            {!isGuru && (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Observasi Kelas'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
