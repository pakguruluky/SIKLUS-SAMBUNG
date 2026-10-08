import React, { useState } from 'react';
import { Supervision, UserProfile } from '../../types';
import { PASCA_OBSERVASI_QUESTIONS } from '../../data/instrumentData';
import { X, Save, FileText, ShieldAlert } from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface PascaObservasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
  currentUser: UserProfile;
  onSaved: (updated: Supervision) => void;
  mode?: 'awal' | 'perbaikan';
}

export const PascaObservasiModal: React.FC<PascaObservasiModalProps> = ({
  isOpen,
  onClose,
  supervision,
  currentUser,
  onSaved,
  mode = 'awal',
}) => {
  const isPerbaikan = mode === 'perbaikan';
  const sourceData = isPerbaikan && supervision.pascaObservasiPerbaikan
    ? supervision.pascaObservasiPerbaikan
    : supervision.pascaObservasi;

  const [q1, setQ1] = useState(sourceData?.q1_kesan || '');
  const [q2, setQ2] = useState(sourceData?.q2_sesuai_rencana || '');
  const [q3, setQ3] = useState(sourceData?.q3_hal_memuaskan || '');
  const [q4, setQ4] = useState(sourceData?.q4_hal_kurang || '');
  const [q5, setQ5] = useState(sourceData?.q5_ketercapaian_tujuan || '');
  const [q6, setQ6] = useState(sourceData?.q6_kesulitan_siswa || '');
  const [q7, setQ7] = useState(sourceData?.q7_alternatif_solusi || '');
  const [q8, setQ8] = useState(sourceData?.q8_rencana_tindak_lanjut || '');
  const [q9, setQ9] = useState(sourceData?.q9_pengembangan_diri || '');

  const [generalImpression, setGeneralImpression] = useState(
    sourceData?.generalImpression || ''
  );
  const [recommendations, setRecommendations] = useState(
    sourceData?.recommendations || ''
  );

  const [saving, setSaving] = useState(false);

  const isGuru = currentUser.role === 'guru';
  const isSupervisor = currentUser.role === 'admin' || currentUser.role === 'kepsek';

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupervisor) return;

    try {
      setSaving(true);
      const dataPayload = {
        q1_kesan: q1,
        q2_sesuai_rencana: q2,
        q3_hal_memuaskan: q3,
        q4_hal_kurang: q4,
        q5_ketercapaian_tujuan: q5,
        q6_kesulitan_siswa: q6,
        q7_alternatif_solusi: q7,
        q8_rencana_tindak_lanjut: q8,
        q9_pengembangan_diri: q9,
        generalImpression,
        recommendations,
        completedAt: new Date().toISOString(),
      };

      const updated: Supervision = isPerbaikan
        ? {
            ...supervision,
            pascaObservasiPerbaikan: dataPayload,
          }
        : {
            ...supervision,
            pascaObservasi: dataPayload,
          };

      await saveSupervision(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pasca-observasi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`${isPerbaikan ? 'bg-indigo-800' : 'bg-blue-700'} text-white p-4 sm:p-5 flex items-center justify-between shrink-0 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>{isPerbaikan ? 'Tahap U (Uji) &bull; Data Setelah Perbaikan' : 'Tahap S (Selidiki) &bull; Data Awal'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-200" />
              Instrumen Wawancara Pasca-Observasi &amp; Refleksi {isPerbaikan ? '(Setelah Ada Perbaikan)' : '(Kondisi Awal)'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Guru: {supervision.teacherName} &bull; Mapel: {supervision.subject} &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isGuru && (
          <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Mode Lihat Guru:</strong> Anda melihat hasil wawancara pasca-observasi, refleksi dan saran supervisor tanpa dapat mengubah.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Header Info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Mata Pelajaran &amp; Kelas:</span>
              <span className="font-bold text-slate-800">{supervision.subject} ({supervision.classGrade})</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Skor Observasi Kelas:</span>
              <span className="font-extrabold text-emerald-600">{supervision.observasiKelas?.score ? `${supervision.observasiKelas.score}%` : 'Belum diisi'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Penilai:</span>
              <span className="font-bold text-slate-800">{supervision.supervisorName}</span>
            </div>
          </div>

          {/* 9 Questions */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[0].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                placeholder="Bagikan rasa lega, kepuasan, atau dinamika yang dirasakan selama mengajar..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[1].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                placeholder="Kesesuaian dengan modul ajar/RPP, apakah ada improvisasi yang dilakukan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[2].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                placeholder="Momen interaksi murid yang paling membanggakan, antusiasme, hasil karya..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[3].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q4}
                onChange={(e) => setQ4(e.target.value)}
                placeholder="Aspek pengelolaan waktu, keaktifan sebagian murid, atau alat peraga..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[4].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q5}
                onChange={(e) => setQ5(e.target.value)}
                placeholder="Persentase ketercapaian kriteria KKTP berdasarkan respon dan asesmen formatif..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[5].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q6}
                onChange={(e) => setQ6(e.target.value)}
                placeholder="Hambatan kognitif atau teknis yang dialami murid saat proses belajar..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[6].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q7}
                onChange={(e) => setQ7(e.target.value)}
                placeholder="Langkah diferensiasi atau remedial yang diambil untuk mengatasi hambatan tersebut..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[7].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q8}
                onChange={(e) => setQ8(e.target.value)}
                placeholder="Rencana tindak lanjut (RTL) konkret pada jam pembelajaran berikutnya..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                {PASCA_OBSERVASI_QUESTIONS[8].label}
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={q9}
                onChange={(e) => setQ9(e.target.value)}
                placeholder="Kebutuhan pelatihan mandiri, kombel, atau penguasaan teknologi penunjang..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Supervisor Kesan Umum & Saran */}
          <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-3">
            <h3 className="font-bold text-blue-900 text-sm">
              Tanggapan &amp; Kesimpulan Supervisor
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kesan Umum Supervisor:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={generalImpression}
                onChange={(e) => setGeneralImpression(e.target.value)}
                placeholder="Apresiasi terhadap antusiasme pendidik dan komitmen memuliakan murid..."
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Saran-Masukan &amp; Rekomendasi Supervisor:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Rekomendasi pengembangan profesionalisme guru secara berkelanjutan..."
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white focus:outline-blue-600 text-xs disabled:bg-slate-100"
              />
            </div>
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
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pasca-Observasi'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
