import React, { useState } from 'react';
import { Supervision, UserProfile, SambungMaknaiPertanyaanList } from '../../types';
import { MAKNAI_COACHING_QUESTIONS } from '../../data/instrumentData';
import { generateTeacherMaknaiData } from '../../data/autoFillData';
import { X, Save, FileText, ShieldAlert, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';
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

  const maknaiSource = isPerbaikan && supervision.sambung?.uji?.pascaObservasi
    ? supervision.sambung.uji.pascaObservasi
    : supervision.sambung?.maknai;

  const pList: SambungMaknaiPertanyaanList = maknaiSource?.pertanyaanList || {};

  // 10 Pertanyaan Resmi MAKNAI Sesuai Dokumen Pengawas Pembina
  const [q1, setQ1] = useState(pList.q1 || sourceData?.q1_kesan || '');
  const [q2, setQ2] = useState(pList.q2 || sourceData?.q2_sesuai_rencana || '');
  const [q3, setQ3] = useState(pList.q3 || sourceData?.q3_hal_memuaskan || '');
  const [q4, setQ4] = useState(pList.q4 || sourceData?.q5_ketercapaian_tujuan || '');
  const [q5, setQ5] = useState(pList.q5 || sourceData?.q6_kesulitan_siswa || '');
  const [q6, setQ6] = useState(pList.q6 || sourceData?.q4_hal_kurang || '');
  const [q7, setQ7] = useState(pList.q7 || sourceData?.q7_alternatif_solusi || '');
  const [q8, setQ8] = useState(pList.q8 || '');
  const [q9, setQ9] = useState(pList.q9 || sourceData?.q9_pengembangan_diri || '');
  const [q10, setQ10] = useState(pList.q10 || sourceData?.q8_rencana_tindak_lanjut || '');

  const [generalImpression, setGeneralImpression] = useState(
    maknaiSource?.kesanUmum || sourceData?.generalImpression || ''
  );
  const [recommendations, setRecommendations] = useState(
    maknaiSource?.saranMasukan || sourceData?.recommendations || ''
  );

  // Coaching TIRTA state
  const [coachingTujuan, setCoachingTujuan] = useState(
    supervision.sambung?.maknai?.coaching?.tujuan || ''
  );
  const [coachingRealitas, setCoachingRealitas] = useState(
    supervision.sambung?.maknai?.coaching?.realitas || ''
  );
  const [coachingOpsi, setCoachingOpsi] = useState(
    supervision.sambung?.maknai?.coaching?.opsi || ''
  );
  const [coachingKomitmen, setCoachingKomitmen] = useState(
    supervision.sambung?.maknai?.coaching?.komitmen || ''
  );

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const isGuru = currentUser.role === 'guru';
  const isSupervisor = currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas' || currentUser.role === 'kepsek';

  if (!isOpen) return null;

  const handleAutoFillMaknai = () => {
    const generated = generateTeacherMaknaiData(supervision);
    if (generated.pertanyaanList) {
      setQ1(generated.pertanyaanList.q1 || '');
      setQ2(generated.pertanyaanList.q2 || '');
      setQ3(generated.pertanyaanList.q3 || '');
      setQ4(generated.pertanyaanList.q4 || '');
      setQ5(generated.pertanyaanList.q5 || '');
      setQ6(generated.pertanyaanList.q6 || '');
      setQ7(generated.pertanyaanList.q7 || '');
      setQ8(generated.pertanyaanList.q8 || '');
      setQ9(generated.pertanyaanList.q9 || '');
      setQ10(generated.pertanyaanList.q10 || '');
    }
    if (generated.kesanUmum) setGeneralImpression(generated.kesanUmum);
    if (generated.saranMasukan) setRecommendations(generated.saranMasukan);
    if (generated.coaching) {
      setCoachingTujuan(generated.coaching.tujuan || '');
      setCoachingRealitas(generated.coaching.realitas || '');
      setCoachingOpsi(generated.coaching.opsi || '');
      setCoachingKomitmen(generated.coaching.komitmen || '');
    }
    setSuccessToast('Refleksi MAKNAI berhasil diisi otomatis & selaras dengan hasil observasi kelas!');
    setTimeout(() => setSuccessToast(''), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupervisor) return;

    try {
      setSaving(true);
      const nowIso = new Date().toISOString();

      const pertanyaanPayload: SambungMaknaiPertanyaanList = {
        q1,
        q2,
        q3,
        q4,
        q5,
        q6,
        q7,
        q8,
        q9,
        q10,
      };

      // Compatibility payload for legacy reports
      const legacyPayload = {
        q1_kesan: q1,
        q2_sesuai_rencana: q2,
        q3_hal_memuaskan: q3,
        q4_hal_kurang: q6,
        q5_ketercapaian_tujuan: q4,
        q6_kesulitan_siswa: q5,
        q7_alternatif_solusi: q7,
        q8_rencana_tindak_lanjut: q10,
        q9_pengembangan_diri: q9,
        generalImpression,
        recommendations,
        completedAt: nowIso,
      };

      let updatedSambung = supervision.sambung;
      if (updatedSambung) {
        if (!isPerbaikan) {
          updatedSambung = {
            ...updatedSambung,
            maknai: {
              ...updatedSambung.maknai,
              tanggal: updatedSambung.maknai?.tanggal || nowIso.split('T')[0],
              pertanyaanList: pertanyaanPayload,
              kesanUmum: generalImpression,
              saranMasukan: recommendations,
              coaching: {
                tujuan: coachingTujuan,
                realitas: coachingRealitas,
                opsi: coachingOpsi,
                komitmen: coachingKomitmen,
              },
            },
            lastUpdated: nowIso,
          };
        } else {
          updatedSambung = {
            ...updatedSambung,
            uji: {
              ...updatedSambung.uji,
              pascaObservasi: {
                pertanyaanList: {
                  q1, q2, q3, q4, q5, q6, q7, q8, q9, q10
                },
                kesanUmum: generalImpression,
                saranMasukan: recommendations,
                completedAt: nowIso,
              },
            },
            lastUpdated: nowIso,
          };
        }
      }

      const updated: Supervision = isPerbaikan
        ? {
            ...supervision,
            pascaObservasiPerbaikan: legacyPayload,
            sambung: updatedSambung,
            updatedAt: nowIso,
          }
        : {
            ...supervision,
            pascaObservasi: legacyPayload,
            sambung: updatedSambung,
            updatedAt: nowIso,
          };

      await saveSupervision(updated);
      onSaved(updated);
      setSuccessToast('Hasil Pasca-Observasi & Dialog MAKNAI 10 Pertanyaan berhasil disimpan!');
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pasca-observasi.');
    } finally {
      setSaving(false);
    }
  };

  const getQuestionValue = (qId: string) => {
    switch (qId) {
      case 'q1': return q1;
      case 'q2': return q2;
      case 'q3': return q3;
      case 'q4': return q4;
      case 'q5': return q5;
      case 'q6': return q6;
      case 'q7': return q7;
      case 'q8': return q8;
      case 'q9': return q9;
      case 'q10': return q10;
      default: return '';
    }
  };

  const setQuestionValue = (qId: string, val: string) => {
    switch (qId) {
      case 'q1': setQ1(val); break;
      case 'q2': setQ2(val); break;
      case 'q3': setQ3(val); break;
      case 'q4': setQ4(val); break;
      case 'q5': setQ5(val); break;
      case 'q6': setQ6(val); break;
      case 'q7': setQ7(val); break;
      case 'q8': setQ8(val); break;
      case 'q9': setQ9(val); break;
      case 'q10': setQ10(val); break;
      default: break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`${isPerbaikan ? 'bg-indigo-800' : 'bg-blue-700'} text-white p-4 sm:p-5 flex items-center justify-between shrink-0 transition-colors`}>
          <div>
            <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <span>{isPerbaikan ? 'Tahap U (Uji) • Pasca-Observasi Setelah Perbaikan' : 'Tahap M (MAKNAI) • Dialog Coaching & Refleksi'}</span>
            </div>
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-200" />
              Instrumen Pasca-Observasi &amp; Refleksi MAKNAI (10 Pertanyaan Resmi)
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              Guru: <strong>{supervision.teacherName}</strong> &bull; Mapel: <strong>{supervision.subject}</strong> &bull; {supervision.classGrade} &bull; {supervision.schoolName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
            title="Tutup Modal"
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

        {successToast && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2 justify-center animate-fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          
          {/* Header Info & Auto-Fill Action */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-500 block font-medium">Mata Pelajaran &amp; Materi Pokok:</span>
              <span className="font-bold text-slate-900">{supervision.subject} &bull; {supervision.lessonTitle}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Skor Observasi Terkini:</span>
              <span className="font-extrabold text-blue-700 text-sm">
                {supervision.observasiKelas?.score ? `${supervision.observasiKelas.score}% (${supervision.observasiKelas.predicate})` : 'Belum dinilai'}
              </span>
            </div>

            {isSupervisor && (
              <button
                type="button"
                onClick={handleAutoFillMaknai}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Fill Refleksi MAKNAI Sesuai Hasil Observasi</span>
              </button>
            )}
          </div>

          {/* 10 Pertanyaan Resmi MAKNAI */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>10 Butir Pertanyaan Coaching &amp; Refleksi Pasca-Observasi (Dokumen Resmi Pengawas)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Menghubungkan proses pemahaman, aplikasi, refleksi metakognisi murid, serta butir observasi yang masih bernilai 0 atau 1.
              </p>
            </div>

            {MAKNAI_COACHING_QUESTIONS.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/40 transition-colors">
                <label className="block font-semibold text-slate-800 mb-1.5 leading-relaxed text-xs">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] mr-1.5">
                    {item.no}
                  </span>
                  {item.pertanyaan}
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={getQuestionValue(item.id)}
                  onChange={(e) => setQuestionValue(item.id, e.target.value)}
                  placeholder={`Tuliskan tanggapan dan refleksi nomor ${item.no}...`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-blue-600 bg-white text-xs disabled:bg-slate-100 leading-relaxed text-slate-900"
                />
              </div>
            ))}
          </div>

          {/* Kesepakatan Coaching Alur TIRTA */}
          <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-3">
            <div className="border-b border-emerald-200 pb-2">
              <h3 className="font-bold text-emerald-950 text-sm">
                Kesepakatan Coaching Alur TIRTA (Tujuan - Identifikasi/Realitas - Rencana/Opsi - Tanggung Jawab/Komitmen)
              </h3>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Dialog kemitraan antara Pengawas Pembina Kusnandar, M.Si dan guru untuk memberdayakan potensi murid.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-emerald-900 text-xs mb-1">
                  1. Tujuan: Pengalaman belajar apa yang ingin diciptakan untuk murid?
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={coachingTujuan}
                  onChange={(e) => setCoachingTujuan(e.target.value)}
                  placeholder="Pengalaman belajar mendalam yang ingin dicapai..."
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs disabled:bg-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 text-xs mb-1">
                  2. Realitas: Apa yang sudah berjalan baik dan tantangan nyata di kelas?
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={coachingRealitas}
                  onChange={(e) => setCoachingRealitas(e.target.value)}
                  placeholder="Kondisi riil antusiasme dan pemahaman murid saat ini..."
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs disabled:bg-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 text-xs mb-1">
                  3. Opsi: Apa alternatif strategi pembelajaran bermakna yang bisa dicoba?
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={coachingOpsi}
                  onChange={(e) => setCoachingOpsi(e.target.value)}
                  placeholder="Strategi inkuiri kontekstual, media interaktif, atau LKPD..."
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs disabled:bg-slate-100 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-900 text-xs mb-1">
                  4. Komitmen: Langkah konkret apa yang akan dicoba &amp; kapan ditinjau?
                </label>
                <textarea
                  rows={2}
                  disabled={!isSupervisor}
                  value={coachingKomitmen}
                  onChange={(e) => setCoachingKomitmen(e.target.value)}
                  placeholder="Komitmen uji coba di siklus Berdayakan dan batas waktu peninjauan..."
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs disabled:bg-slate-100 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Supervisor Kesan Umum & Saran */}
          <div className="bg-blue-50/70 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-3">
            <h3 className="font-bold text-blue-900 text-sm">
              Tanggapan, Kesan Umum &amp; Rekomendasi Pengawas Pembina (Kusnandar, M.Si)
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Kesan Umum Pengawas Pembina:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={generalImpression}
                onChange={(e) => setGeneralImpression(e.target.value)}
                placeholder="Apresiasi terhadap antusiasme pendidik dan komitmen memuliakan murid..."
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white focus:outline-blue-600 text-xs disabled:bg-slate-100 text-slate-900 leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 text-xs">
                Saran-Masukan &amp; Rekomendasi Pengawas Pembina:
              </label>
              <textarea
                rows={2}
                disabled={!isSupervisor}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Rekomendasi pengembangan profesionalisme guru dan penguatan deep learning..."
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white focus:outline-blue-600 text-xs disabled:bg-slate-100 text-slate-900 leading-relaxed"
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
                <span>{saving ? 'Menyimpan...' : 'Simpan Pasca-Observasi & MAKNAI'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
