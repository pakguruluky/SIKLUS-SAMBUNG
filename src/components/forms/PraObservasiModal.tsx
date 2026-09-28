import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { PRA_OBSERVASI_QUESTIONS } from '../../data/instrumentData';
import { X, Save, Clock, Compass, ShieldAlert } from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface PraObservasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
}

export const PraObservasiModal: React.FC<PraObservasiModalProps> = ({
  isOpen,
  onClose,
  supervision,
  currentUser,
  onSaved,
}) => {
  const [duration, setDuration] = useState<number>(
    supervision.praObservasi?.interviewDurationMinutes || 30
  );
  const [q1, setQ1] = useState(supervision.praObservasi?.q1_kd_indikator || '');
  const [q2, setQ2] = useState(supervision.praObservasi?.q2_metode || '');
  const [q3, setQ3] = useState(supervision.praObservasi?.q3_alat_bahan || '');
  const [q4, setQ4] = useState(supervision.praObservasi?.q4_tahapan || '');
  const [q5, setQ5] = useState(supervision.praObservasi?.q5_persiapan || '');
  const [q6, setQ6] = useState(supervision.praObservasi?.q6_materi_sulit || '');
  const [q7, setQ7] = useState(supervision.praObservasi?.q7_target_kompetensi || '');
  const [q8, setQ8] = useState(supervision.praObservasi?.q8_perhatian_khusus || '');
  const [notes, setNotes] = useState(supervision.praObservasi?.supervisorNotes || '');
  const [saving, setSaving] = useState(false);

  const isGuru = currentUser.role === 'guru';

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuru) return; // Guru cannot modify

    try {
      setSaving(true);
      const updated: Supervision = {
        ...supervision,
        praObservasi: {
          interviewDurationMinutes: Number(duration),
          q1_kd_indikator: q1,
          q2_metode: q2,
          q3_alat_bahan: q3,
          q4_tahapan: q4,
          q5_persiapan: q5,
          q6_materi_sulit: q6,
          q7_target_kompetensi: q7,
          q8_perhatian_khusus: q8,
          supervisorNotes: notes,
          completedAt: new Date().toISOString(),
        },
        status: supervision.status === 'draft' || supervision.status === 'submitted' ? 'in_progress' : supervision.status,
      };

      await saveSupervision(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pra-observasi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>Tahap 2 Supervisi Akademik</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-200" />
              Instrumen Wawancara Pra-Observasi Pembelajaran
            </h2>
            <p className="text-xs text-amber-100 mt-0.5">
              Guru: {supervision.teacherName} &bull; {supervision.subject} &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-amber-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isGuru && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Lihat Guru:</strong> Anda hanya dapat melihat catatan wawancara pra-observasi dan tidak dapat mengubah nilai.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Header Metadata Grid */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Satuan Pendidikan:</span>
              <span className="font-bold text-slate-800">{supervision.schoolName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nama Guru:</span>
              <span className="font-bold text-slate-800">{supervision.teacherName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Mata Pelajaran:</span>
              <span className="font-bold text-slate-800">{supervision.subject}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Kelas / Semester:</span>
              <span className="font-bold text-slate-800">{supervision.classGrade} / {supervision.semester}</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 max-w-sm">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-bold text-amber-900">Waktu Wawancara (Menit):</label>
              <input
                type="number"
                min="10"
                max="120"
                disabled={isGuru}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 bg-white rounded-lg border border-amber-300 text-xs font-bold text-slate-800 focus:outline-amber-600 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* 8 Questions */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[0].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                placeholder="Tuliskan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) spesifik..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[1].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                placeholder="Contoh: Problem-Based Learning karena materi menuntut pemecahan masalah kontekstual..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[2].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                placeholder="Sebutkan media, platform digital, alat praktikum, LKPD dan alasannya..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[3].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q4}
                onChange={(e) => setQ4(e.target.value)}
                placeholder="Sintaks alur pembelajaran: Pendahuluan, Kegiatan Inti, dan Penutup..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[4].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q5}
                onChange={(e) => setQ5(e.target.value)}
                placeholder="Daftar berkas administrasi tertulis yang telah disiapkan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[5].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q6}
                onChange={(e) => setQ6(e.target.value)}
                placeholder="Prediksi konsep yang menantang dan strategi scaffolding..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[6].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q7}
                onChange={(e) => setQ7(e.target.value)}
                placeholder="Karakter Profil Pelajar Pancasila, kompetensi literasi numerasi..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PRA_OBSERVASI_QUESTIONS[7].label}
              </label>
              <textarea
                rows={2}
                disabled={isGuru}
                value={q8}
                onChange={(e) => setQ8(e.target.value)}
                placeholder="Fokus khusus yang ingin dinilai (misal diferensiasi proses, partisipasi murid pasif)..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-indigo-600 text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Supervisor Notes */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
            <label className="block font-bold text-amber-900 mb-1">
              Catatan &amp; Rekomendasi Khusus Supervisor (Pra-Kunjungan):
            </label>
            <textarea
              rows={2}
              disabled={isGuru}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kesepakatan waktu amatan kelas, fokus supervisi, dan saran teknis..."
              className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white focus:outline-amber-600 text-xs disabled:bg-slate-100"
            />
          </div>

          {/* Buttons */}
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
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pra-Observasi'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
