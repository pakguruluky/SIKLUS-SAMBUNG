import React, { useState } from 'react';
import { Supervision, UserProfile, School } from '../../types';
import { X, CheckCircle, GraduationCap, Building2 } from 'lucide-react';
import { saveSupervision } from '../../services/firebase';

interface NewSupervisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  schools: School[];
  onCreated: (newSup: Supervision) => void;
}

const PRESET_TEACHERS: Record<string, Array<{ name: string; nip?: string; subject: string; classGrade: string }>> = {
  'sch-ummul-quro': [
    { name: 'Sani Ramadhanti Noor, S.E.', nip: '19910418 201802 2 004', subject: 'Ekonomi', classGrade: 'Fase E / Kelas X-1' },
    { name: 'Kirana Mahardhika, S.Pd, Gr.', nip: '19930825 201903 2 009', subject: 'Kimia', classGrade: 'Fase F / Kelas XI-IPA' },
  ],
  'sch-rimba-madya': [
    { name: 'Atik Dwi Larasati, S.Pd.', nip: '19891105 201504 2 003', subject: 'Ekonomi', classGrade: 'Fase F / Kelas XI-IPS' },
    { name: 'Ivany Ratna Ekandini, S.Pd.', nip: '19870614 201203 2 006', subject: 'Bahasa Indonesia', classGrade: 'Fase E / Kelas X-1' },
  ],
  'sch-sman4': [
    { name: 'Sondang Asih Januarti, S.Pd.', nip: '19840512 200801 2 007', subject: 'Fisika', classGrade: 'Fase F / Kelas XI-Fisika 1' },
    { name: 'Risna Aryanti, M.Pd.', nip: '19820315 200604 2 011', subject: 'Biologi', classGrade: 'Fase F / Kelas XI-Biologi' },
    { name: 'Hilmia Fitriyani, S.Pd.', nip: '19900821 201503 2 005', subject: 'Matematika', classGrade: 'Fase E / Kelas X-5' },
  ],
  'sch-sman2': [
    { name: 'Alline Novianti, S.Pd.', nip: '19861112 201001 2 008', subject: 'Bahasa Inggris', classGrade: 'Fase E / Kelas X-B' },
    { name: 'Mega Nur Alfira, S.Pd.', nip: '19920114 201602 2 003', subject: 'Sosiologi', classGrade: 'Fase F / Kelas XI-Sains Sosial' },
  ],
  'sch-pgri-1': [
    { name: 'Iqbal Aziz Andrianto', nip: '19940710 202012 1 002', subject: 'Informatika', classGrade: 'Fase E / Kelas X-RPL' },
    { name: 'Fatma Rita, S.Si.', nip: '19810915 200501 2 009', subject: 'Prakarya & Kewirausahaan', classGrade: 'Fase F / Kelas XI-PKWU' },
  ],
};

export const NewSupervisionModal: React.FC<NewSupervisionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  schools,
  onCreated,
}) => {
  const [schoolId, setSchoolId] = useState(currentUser.schoolId || (schools[0]?.id || ''));
  const [teacherName, setTeacherName] = useState(
    currentUser.role === 'guru' ? currentUser.displayName : ''
  );
  const [teacherNip, setTeacherNip] = useState(
    currentUser.role === 'guru' ? (currentUser.nip || '') : ''
  );
  const [subject, setSubject] = useState(
    currentUser.role === 'guru' ? (currentUser.subject || '') : ''
  );
  const [classGrade, setClassGrade] = useState('Fase E / Kelas X');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [schoolYear, setSchoolYear] = useState('2025/2026');
  const [lessonTitle, setLessonTitle] = useState('');
  const [supervisorName, setSupervisorName] = useState(
    currentUser.role === 'admin' 
      ? 'Kusnandar, M.Si' 
      : currentUser.role === 'kepsek' 
      ? currentUser.displayName 
      : 'Kusnandar, M.Si'
  );

  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !subject || !lessonTitle) {
      setErrMsg('Nama Guru, Mata Pelajaran, dan Judul Rencana Pembelajaran wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setErrMsg('');
      const selectedSchool = schools.find(s => s.id === schoolId) || schools[0];

      const newSup: Omit<Supervision, 'id'> = {
        schoolId: selectedSchool?.id || 'sch-default',
        schoolName: selectedSchool?.name || 'SMA Binaan',
        teacherId: currentUser.role === 'guru' ? currentUser.uid : `teacher-${Date.now()}`,
        teacherName,
        teacherNip,
        subject,
        classGrade,
        semester,
        schoolYear,
        lessonTitle,
        status: 'draft',
        supervisorId: currentUser.role === 'admin' || currentUser.role === 'kepsek' ? currentUser.uid : 'admin-kusnandar',
        supervisorName,
        supervisorRole: currentUser.role === 'admin' ? 'admin' : currentUser.role === 'kepsek' ? 'kepsek' : 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        perangkatAjar: {
          driveLinks: {
            cpTpAtpUrl: '',
            modulAjarUrl: '',
          },
          telaahScores: {},
          telaahComments: {},
          telaahSummary: {
            totalScore: 0,
            maxPossibleScore: 44,
            finalScore: 0,
            predicate: 'Perlu Perbaikan',
          },
          feedback: {
            kelebihan: '',
            perbaikan: '',
            rekomendasi: '',
          },
        },
        praObservasi: {
          interviewDurationMinutes: 30,
          q1_kd_indikator: '',
          q2_metode: '',
          q3_alat_bahan: '',
          q4_tahapan: '',
          q5_persiapan: '',
          q6_materi_sulit: '',
          q7_target_kompetensi: '',
          q8_perhatian_khusus: '',
          supervisorNotes: '',
        },
        observasiKelas: {
          items: {},
          totalYa: 0,
          totalAspek: 24,
          score: 0,
          predicate: 'Kurang (D)',
          feedbackNotes: '',
        },
        pascaObservasi: {
          q1_kesan: '',
          q2_sesuai_rencana: '',
          q3_hal_memuaskan: '',
          q4_hal_kurang: '',
          q5_ketercapaian_tujuan: '',
          q6_kesulitan_siswa: '',
          q7_alternatif_solusi: '',
          q8_rencana_tindak_lanjut: '',
          q9_pengembangan_diri: '',
          generalImpression: '',
          recommendations: '',
        },
        evaluasiTahunan: {
          hasilBelajar: { evidence: '', note: '', score: 90 },
          administrasi: { evidence: '', note: '', score: 90 },
          pengembanganDiri: { evidence: '', note: '', score: 90 },
          kedisiplinan: { evidence: '', note: '', score: 90 },
          rekomendasi: { notes: '', tindakLanjut: '', score: 90 },
          finalAverageScore: 90,
          finalGrade: 'Amat Baik (A)',
          summaryNotes: '',
        },
      };

      const newId = await saveSupervision(newSup);
      onCreated({ id: newId, ...newSup });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrMsg(err.message || 'Gagal membuat rekam supervisi baru.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="bg-indigo-700 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Mulai Rekam Supervisi Akademik Baru</h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Isi data awal pendampingan dan perencanaan mengajar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              {errMsg}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Satuan Pendidikan SMA Target *
            </label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              disabled={currentUser.role === 'guru' || currentUser.role === 'kepsek'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-indigo-600 disabled:bg-slate-100"
            >
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name} (NPSN: {s.npsn})</option>
              ))}
            </select>

            {PRESET_TEACHERS[schoolId] && currentUser.role !== 'guru' && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[10px] text-slate-400 font-medium">Pilih Cepat Guru Sasaran:</span>
                {PRESET_TEACHERS[schoolId].map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setTeacherName(t.name);
                      setTeacherNip(t.nip || '');
                      setSubject(t.subject);
                      setClassGrade(t.classGrade);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 transition-colors"
                  >
                    + {t.name} ({t.subject})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Guru Sasaran *
              </label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Nama Guru dan Gelar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP / NUPTK Guru
              </label>
              <input
                type="text"
                value={teacherNip}
                onChange={(e) => setTeacherNip(e.target.value)}
                placeholder="1984..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mata Pelajaran *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Fisika, Biologi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fase / Kelas
              </label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                placeholder="Contoh: Fase E / Kelas X-A"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-indigo-600"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Pelajaran
              </label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="2025/2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Materi Pokok / Judul Perencanaan Pembelajaran *
            </label>
            <input
              type="text"
              required
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Contoh: Termodinamika & Hukum Kekekalan Energi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Supervisor / Penilai
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="Kusnandar, M.Si"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{saving ? 'Membuat...' : 'Buat Berkas Supervisi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
