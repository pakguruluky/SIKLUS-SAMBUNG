import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { EVALUASI_TAHUNAN_COMPONENTS } from '../../data/instrumentData';
import { X, Save, Award, CheckCircle2, FileCheck, ShieldAlert } from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface EvaluasiTahunanModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
}

export const EvaluasiTahunanModal: React.FC<EvaluasiTahunanModalProps> = ({
  isOpen,
  onClose,
  supervision,
  currentUser,
  onSaved,
}) => {
  const [hasilBelajarEvidence, setHasilBelajarEvidence] = useState(
    supervision.evaluasiTahunan?.hasilBelajar?.evidence || ''
  );
  const [hasilBelajarNote, setHasilBelajarNote] = useState(
    supervision.evaluasiTahunan?.hasilBelajar?.note || ''
  );
  const [hasilBelajarScore, setHasilBelajarScore] = useState<number>(
    supervision.evaluasiTahunan?.hasilBelajar?.score || 90
  );

  const [admEvidence, setAdmEvidence] = useState(
    supervision.evaluasiTahunan?.administrasi?.evidence || ''
  );
  const [admNote, setAdmNote] = useState(
    supervision.evaluasiTahunan?.administrasi?.note || ''
  );
  const [admScore, setAdmScore] = useState<number>(
    supervision.evaluasiTahunan?.administrasi?.score || 92
  );

  const [pkbEvidence, setPkbEvidence] = useState(
    supervision.evaluasiTahunan?.pengembanganDiri?.evidence || ''
  );
  const [pkbNote, setPkbNote] = useState(
    supervision.evaluasiTahunan?.pengembanganDiri?.note || ''
  );
  const [pkbScore, setPkbScore] = useState<number>(
    supervision.evaluasiTahunan?.pengembanganDiri?.score || 90
  );

  const [disiplinEvidence, setDisiplinEvidence] = useState(
    supervision.evaluasiTahunan?.kedisiplinan?.evidence || ''
  );
  const [disiplinNote, setDisiplinNote] = useState(
    supervision.evaluasiTahunan?.kedisiplinan?.note || ''
  );
  const [disiplinScore, setDisiplinScore] = useState<number>(
    supervision.evaluasiTahunan?.kedisiplinan?.score || 95
  );

  const [rekomendasiNotes, setRekomendasiNotes] = useState(
    supervision.evaluasiTahunan?.rekomendasi?.notes || ''
  );
  const [rekomendasiTindakLanjut, setRekomendasiTindakLanjut] = useState(
    supervision.evaluasiTahunan?.rekomendasi?.tindakLanjut || ''
  );
  const [rekomendasiScore, setRekomendasiScore] = useState<number>(
    supervision.evaluasiTahunan?.rekomendasi?.score || 92
  );

  const [summaryNotes, setSummaryNotes] = useState(
    supervision.evaluasiTahunan?.summaryNotes || ''
  );

  const [saving, setSaving] = useState(false);

  const isGuru = currentUser.role === 'guru';
  const isSupervisor = currentUser.role === 'admin' || currentUser.role === 'kepsek';

  if (!isOpen) return null;

  // Calculate average score of 5 components
  const scores = [hasilBelajarScore, admScore, pkbScore, disiplinScore, rekomendasiScore];
  const finalAverageScore = parseFloat(
    (scores.reduce((a, b) => a + Number(b), 0) / scores.length).toFixed(1)
  );

  let finalGrade = 'Cukup (C)';
  if (finalAverageScore >= 90) finalGrade = 'Amat Baik (A)';
  else if (finalAverageScore >= 80) finalGrade = 'Baik (B)';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupervisor) return;

    try {
      setSaving(true);
      const updated: Supervision = {
        ...supervision,
        evaluasiTahunan: {
          hasilBelajar: {
            evidence: hasilBelajarEvidence,
            note: hasilBelajarNote,
            score: Number(hasilBelajarScore),
          },
          administrasi: {
            evidence: admEvidence,
            note: admNote,
            score: Number(admScore),
          },
          pengembanganDiri: {
            evidence: pkbEvidence,
            note: pkbNote,
            score: Number(pkbScore),
          },
          kedisiplinan: {
            evidence: disiplinEvidence,
            note: disiplinNote,
            score: Number(disiplinScore),
          },
          rekomendasi: {
            notes: rekomendasiNotes,
            tindakLanjut: rekomendasiTindakLanjut,
            score: Number(rekomendasiScore),
          },
          finalAverageScore,
          finalGrade,
          summaryNotes,
          completedAt: new Date().toISOString(),
        },
        status: 'completed',
      };

      await saveSupervision(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan evaluasi 1 tahun.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-purple-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>Tahap 5 Supervisi Akademik</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-200" />
              Evaluasi Kinerja 1 Tahun Pelajaran &amp; Portofolio
            </h2>
            <p className="text-xs text-purple-100 mt-0.5">
              Guru: {supervision.teacherName} &bull; TP {supervision.schoolYear} &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-purple-200 hover:text-white hover:bg-purple-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isGuru && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Mode Lihat Guru:</strong> Anda melihat rekapitulasi evaluasi tahunan portofolio dan predikat kinerja akhir (Hanya Supervisor yang berwenang menilai).
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* Real-time Final Score Pill */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-purple-900 block">Kompilasi Nilai Kinerja Tahunan</span>
              <p className="text-xs text-purple-700 mt-0.5">
                Mengintegrasikan 5 komponen portofolio, kedisiplinan, dan pengembangan keprofesian
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-1.5 bg-white rounded-xl border border-purple-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Skor Rata-Rata</span>
                <p className="text-lg font-black text-purple-800">{finalAverageScore}</p>
              </div>

              <div className="text-center px-4 py-1.5 bg-white rounded-xl border border-purple-300">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Predikat Kinerja</span>
                <p className="text-sm font-extrabold text-purple-900">{finalGrade}</p>
              </div>
            </div>
          </div>

          {/* 5 Components */}
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Hasil Belajar */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {EVALUASI_TAHUNAN_COMPONENTS[0].title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{EVALUASI_TAHUNAN_COMPONENTS[0].desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isSupervisor}
                    value={hasilBelajarScore}
                    onChange={(e) => setHasilBelajarScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-purple-800 rounded-lg border border-slate-300 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bukti Fisik / Indikator Capaian:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={hasilBelajarEvidence}
                    onChange={(e) => setHasilBelajarEvidence(e.target.value)}
                    placeholder={EVALUASI_TAHUNAN_COMPONENTS[0].evidencePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catatan Penilai:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={hasilBelajarNote}
                    onChange={(e) => setHasilBelajarNote(e.target.value)}
                    placeholder="Catatan kemajuan prestasi peserta didik..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 2. Administrasi */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {EVALUASI_TAHUNAN_COMPONENTS[1].title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{EVALUASI_TAHUNAN_COMPONENTS[1].desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isSupervisor}
                    value={admScore}
                    onChange={(e) => setAdmScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-purple-800 rounded-lg border border-slate-300 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bukti Fisik / Indikator Capaian:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={admEvidence}
                    onChange={(e) => setAdmEvidence(e.target.value)}
                    placeholder={EVALUASI_TAHUNAN_COMPONENTS[1].evidencePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catatan Penilai:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={admNote}
                    onChange={(e) => setAdmNote(e.target.value)}
                    placeholder="Ketertiban dan kelengkapan dokumen ajar..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pengembangan Diri */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {EVALUASI_TAHUNAN_COMPONENTS[2].title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{EVALUASI_TAHUNAN_COMPONENTS[2].desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isSupervisor}
                    value={pkbScore}
                    onChange={(e) => setPkbScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-purple-800 rounded-lg border border-slate-300 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bukti Fisik / Indikator Capaian:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={pkbEvidence}
                    onChange={(e) => setPkbEvidence(e.target.value)}
                    placeholder={EVALUASI_TAHUNAN_COMPONENTS[2].evidencePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catatan Penilai:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={pkbNote}
                    onChange={(e) => setPkbNote(e.target.value)}
                    placeholder="Keikutsertaan pelatihan mandiri dan karya guru..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 4. Kedisiplinan */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {EVALUASI_TAHUNAN_COMPONENTS[3].title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{EVALUASI_TAHUNAN_COMPONENTS[3].desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isSupervisor}
                    value={disiplinScore}
                    onChange={(e) => setDisiplinScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-purple-800 rounded-lg border border-slate-300 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bukti Fisik / Indikator Capaian:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={disiplinEvidence}
                    onChange={(e) => setDisiplinEvidence(e.target.value)}
                    placeholder={EVALUASI_TAHUNAN_COMPONENTS[3].evidencePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catatan Penilai:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={disiplinNote}
                    onChange={(e) => setDisiplinNote(e.target.value)}
                    placeholder="Ketepatan kehadiran dan etika pendidik..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 5. Rekomendasi & Tindak Lanjut Tahunan */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {EVALUASI_TAHUNAN_COMPONENTS[4].title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{EVALUASI_TAHUNAN_COMPONENTS[4].desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">Skor:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!isSupervisor}
                    value={rekomendasiScore}
                    onChange={(e) => setRekomendasiScore(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-purple-800 rounded-lg border border-slate-300 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catatan Rekomendasi Karir/Tugas:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={rekomendasiNotes}
                    onChange={(e) => setRekomendasiNotes(e.target.value)}
                    placeholder="Usulan penugasan khusus, kenaikan pangkat, atau bimbingan..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rencana Tindak Lanjut Pembinaan:</label>
                  <textarea
                    rows={2}
                    disabled={!isSupervisor}
                    value={rekomendasiTindakLanjut}
                    onChange={(e) => setRekomendasiTindakLanjut(e.target.value)}
                    placeholder="Pelatihan tindak lanjut tahun depan..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-purple-600 disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kesimpulan Akhir */}
          <div className="bg-purple-50/70 p-4 sm:p-5 rounded-2xl border border-purple-200 space-y-2">
            <label className="block font-bold text-purple-900 text-xs">
              Kesimpulan Akhir &amp; Ringkasan Eksekutif Supervisi Tahunan:
            </label>
            <textarea
              rows={3}
              disabled={!isSupervisor}
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Rangkuman menyeluruh atas dedikasi dan mutu pengajaran guru selama 1 tahun pelajaran..."
              className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white focus:outline-purple-600 text-xs disabled:bg-slate-100"
            />
          </div>

          {/* Actions */}
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
                className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan & Tetapkan Evaluasi Tahunan'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
