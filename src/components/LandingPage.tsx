import React from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet, 
  Compass, 
  FileText, 
  Award, 
  Printer, 
  Users, 
  ArrowRight,
  Sparkles,
  School,
  FolderGit2
} from 'lucide-react';
import { Role } from '../types';

interface LandingPageProps {
  onOpenAuth: () => void;
  onQuickDemoLogin: (role: Role) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onQuickDemoLogin,
}) => {
  return (
    <div className="flex-1 bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-medium mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            SIKLUS <span className="text-indigo-400">SAMBUNG</span>
          </h1>
          <p className="text-xl sm:text-2xl font-light text-indigo-200 italic mb-6">
            &ldquo;Mendampingi Guru, Meningkatkan Mutu.&rdquo;
          </p>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Platform supervisi akademik terintegrasi berstandar Kurikulum Merdeka dan Sekolah Model Pembelajaran Mendalam (PM). Dirancang khusus untuk memfasilitasi telaah modul ajar, observasi kelas interaktif, evaluasi tahunan, serta cetak laporan resmi berstandar Dinas Pendidikan.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 max-w-xl mx-auto mb-10 shadow-lg backdrop-blur-xs">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
              Diinisiasi &amp; Dibina Oleh:
            </p>
            <p className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Kusnandar, M.Si
            </p>
            <p className="text-xs text-indigo-300 mt-0.5">Pengawas Pembina &amp; Pengembang Mutu SMA</p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenAuth}
              className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-102"
            >
              <span>Masuk / Daftar Akun</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Uji Coba Cepat Tanpa Ketik (Mode Simulasi Peran):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onQuickDemoLogin('admin')}
                className="px-4 py-3 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 text-left transition-all hover:border-purple-400 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300">Pengawas / Admin</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kusnandar, M.Si</p>
              </button>

              <button
                onClick={() => onQuickDemoLogin('kepsek')}
                className="px-4 py-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-left transition-all hover:border-emerald-400 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">Kepala Sekolah</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dra. Hj. Yeni Suryani (SMAN 4 Bogor)</p>
              </button>

              <button
                onClick={() => onQuickDemoLogin('guru')}
                className="px-4 py-3 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/30 text-blue-200 text-left transition-all hover:border-blue-400 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-blue-300">Guru Mata Pelajaran</span>
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sondang Asih Januarti, S.Pd. (Fisika)</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Stage Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
            Alur Kerja &amp; Instrumen Lengkap
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            5 Tahapan Supervisi Akademik Berkelanjutan
          </p>
          <p className="text-base text-slate-600 mt-3">
            Sesuai regulasi terbaru instrumen telaah perencanaan dan observasi sekolah model berorientasi Pembelajaran Mendalam (Deep Learning).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              Perangkat Ajar &amp; Telaah
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Guru menyematkan tautan Google Drive (CP, TP, ATP, Modul Ajar/RPP). Supervisor menilai 22 aspek telaah standar dengan skala 0, 1, 2, atau N/A serta komentar kritis otomatis.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Kalkulasi nilai otomatis &amp; predikat (86-100 Sangat Baik)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Form umpan balik kelebihan &amp; rekomendasi revisi</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              Pra-Observasi (Wawancara)
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Wawancara pendahuluan antara supervisor dan guru mencakup 8 butir pertanyaan kesiapan: metode, media, tahapan sintaks, materi rawan sulit, dan target Profil Pelajar.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Pencatatan durasi wawancara &amp; catatan khusus</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Penetapan fokus amatan sebelum masuk kelas</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Observasi Kelas Interaktif
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Pengamatan tatap muka di ruang kelas meliputi 8 kategori (24 aspek amatan) dengan opsi Ya/Tidak dan catatan deskriptif per indikator.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rumus otomatis: Skor = (Total Ya / Total Aspek) &times; 100</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Integrasi 5M, HOTS, 4C, dan dimensi budaya saling memuliakan</span>
              </li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              4
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Pasca-Observasi (Refleksi)
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Dialog konstruktif paska pembelajaran melalui 9 pertanyaan evaluasi diri, identifikasi kesulitan murid, alternatif solusi, dan rencana tindak lanjut (RTL).
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Kesan umum supervisor &amp; apresiasi kemajuan guru</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Rekomendasi pengembangan keprofesian guru</span>
              </li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              5
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Evaluasi 1 Tahun Pelajaran
            </h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Penilaian kinerja komprehensif tahunan merangkum 5 komponen: Hasil Belajar Murid, Administrasi, Pengembangan Diri (PMM/Kombel), Kedisiplinan, dan Rekomendasi Karir.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Verifikasi bukti fisik &amp; skor terbobot 1 tahun</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Rekomendasi PAK, sertifikasi, &amp; pembinaan</span>
              </li>
            </ul>
          </div>

          {/* Card 6 - Print System */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Printer className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-white">
                Sistem Cetak Laporan Resmi
              </h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                Menghasilkan berkas cetak siap tanda tangan (Kop Surat Resmi, tabel bergaris presisi, kolom tanda tangan Guru, Kepala Sekolah, dan Pengawas Pembina).
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-indigo-200 border-t border-slate-700 pt-3">
              <p>&bull; Opsi 1: Laporan Perangkat Ajar Saja</p>
              <p>&bull; Opsi 2: Laporan Observasi Kelas (Pra, Obs, Pasca)</p>
              <p>&bull; Opsi 3: Laporan Evaluasi 1 Tahun</p>
              <p>&bull; Opsi 4: Laporan Komprehensif Lengkap</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Roles Breakdown */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">
              Hak Akses &amp; Multi-Role
            </h2>
            <p className="text-3xl font-extrabold text-slate-900">
              Peran Pengguna dalam SIKLUS SAMBUNG
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Pengawas / Admin</h3>
                  <p className="text-xs text-slate-500">Kusnandar, M.Si</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Akses pengawasan lintas seluruh SMA binaan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Registrasi data sekolah target (NPSN, Alamat, Akreditasi).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Pemeriksaan berkas, pemberian skor, serta review komprehensif.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Kepala Sekolah</h3>
                  <p className="text-xs text-slate-500">Supervisor Internal Satuan Pendidikan</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Terhubung dengan ID SMA masing-masing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Melakukan supervisi rutin untuk guru di sekolahnya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Memvalidasi evaluasi tahunan dan menandatangani laporan resmi.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Guru Mata Pelajaran</h3>
                  <p className="text-xs text-slate-500">Pendidik Sasaran Supervisi</p>
                </div>
              </div>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Registrasi mandiri memilih sekolah yang telah terdaftar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Unggah berkas link Google Drive dan melihat masukan telaah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Mengisi lembar pra/pasca wawancara dan mengunduh sertifikat/laporan.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
