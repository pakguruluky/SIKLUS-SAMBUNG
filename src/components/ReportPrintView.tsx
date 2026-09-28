import React, { useState } from 'react';
import { Supervision } from '../types';
import { TELAAH_ITEMS, OBSERVASI_ITEMS, PRA_OBSERVASI_QUESTIONS, PASCA_OBSERVASI_QUESTIONS, EVALUASI_TAHUNAN_COMPONENTS } from '../data/instrumentData';
import { X, Printer, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';

interface ReportPrintViewProps {
  supervision: Supervision;
  onClose: () => void;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({
  supervision,
  onClose,
}) => {
  const [reportScope, setReportScope] = useState<'all' | 'perangkat' | 'observasi' | 'evaluasi'>('all');

  const handlePrint = () => {
    window.print();
  };

  const telaah = supervision.perangkatAjar;
  const pra = supervision.praObservasi;
  const obs = supervision.observasiKelas;
  const pasca = supervision.pascaObservasi;
  const evl = supervision.evaluasiTahunan;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto flex flex-col items-center p-2 sm:p-6">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="sticky top-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 max-w-4xl w-full no-print mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div className="h-5 w-px bg-slate-200"></div>
          <span className="text-xs font-bold text-slate-800 hidden sm:inline">
            Pratinjau Dokumen Resmi Supervisi
          </span>
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setReportScope('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              reportScope === 'all' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lengkap (Semua Tahap)
          </button>
          <button
            onClick={() => setReportScope('perangkat')}
            className={`px-3 py-1 rounded-lg transition-all ${
              reportScope === 'perangkat' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perangkat Ajar Saja
          </button>
          <button
            onClick={() => setReportScope('observasi')}
            className={`px-3 py-1 rounded-lg transition-all ${
              reportScope === 'observasi' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Observasi Kelas Saja
          </button>
          <button
            onClick={() => setReportScope('evaluasi')}
            className={`px-3 py-1 rounded-lg transition-all ${
              reportScope === 'evaluasi' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evaluasi 1 Tahun
          </button>
        </div>

        {/* Print button */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Printable Sheet (Simulating Official A4 Paper) */}
      <div className="printable-area bg-white text-slate-900 max-w-4xl w-full p-8 sm:p-12 shadow-2xl rounded-xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
        
        {/* Official Kop Surat */}
        <div className="official-kop text-center border-b-2 border-black pb-3 mb-6">
          <h2 className="text-sm font-bold tracking-widest uppercase">
            PEMERINTAH DAERAH PROVINSI JAWA BARAT
          </h2>
          <h2 className="text-sm font-bold tracking-wider uppercase">
            DINAS PENDIDIKAN &bull; CABANG DINAS PENDIDIKAN WILAYAH VII
          </h2>
          <h1 className="text-base sm:text-lg font-black tracking-wide uppercase mt-0.5">
            {supervision.schoolName}
          </h1>
          <p className="text-[11px] text-slate-600">
            Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA (SIKLUS SAMBUNG)
          </p>
        </div>

        {/* Title of Document */}
        <div className="text-center mb-6">
          <h3 className="text-base font-extrabold uppercase tracking-wide underline underline-offset-4">
            {reportScope === 'all' && 'LAPORAN KOMPREHENSIF SUPERVISI AKADEMIK GURU'}
            {reportScope === 'perangkat' && 'INSTRUMEN TELAAH PERENCANAAN PEMBELAJARAN (MODUL AJAR)'}
            {reportScope === 'observasi' && 'REKAPITULASI OBSERVASI PELAKSANAAN PEMBELAJARAN (PRA, OBS, PASCA)'}
            {reportScope === 'evaluasi' && 'LAPORAN EVALUASI KINERJA TAHUNAN & PORTOFOLIO GURU'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Tahun Pelajaran: {supervision.schoolYear} &bull; Semester: {supervision.semester}
          </p>
        </div>

        {/* Identity Table */}
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-300">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Nama Guru</span>
              <span className="font-bold text-slate-900">: {supervision.teacherName}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Satuan Pendidikan</span>
              <span className="font-bold text-slate-900">: {supervision.schoolName}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">NIP / NUPTK</span>
              <span className="font-medium text-slate-800">: {supervision.teacherNip || '-'}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Kelas / Fase</span>
              <span className="font-medium text-slate-800">: {supervision.classGrade}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Mata Pelajaran</span>
              <span className="font-bold text-slate-900">: {supervision.subject}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Supervisor / Pengawas</span>
              <span className="font-bold text-slate-900">: {supervision.supervisorName}</span>
            </div>
            <div className="flex col-span-2">
              <span className="w-36 font-semibold text-slate-600">Materi Pokok / Judul</span>
              <span className="font-medium text-slate-800 italic">: {supervision.lessonTitle}</span>
            </div>
          </div>
        </div>

        {/* SCOPE 1: PERANGKAT AJAR */}
        {(reportScope === 'all' || reportScope === 'perangkat') && (
          <div className="mb-8 print-avoid-break">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 p-2 border border-slate-300 mb-2">
              I. TELAAH PERENCANAAN PEMBELAJARAN (22 ASPEK PEMBELAJARAN MENDALAM)
            </h4>

            {/* Links preview */}
            <div className="mb-3 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
              <p><strong>Tautan Modul Ajar Awal (Sebelum Penilaian):</strong> {telaah?.driveLinks?.modulAjarUrl || '-'}</p>
              <p><strong>Tautan CP/TP/ATP:</strong> {telaah?.driveLinks?.cpTpAtpUrl || '-'}</p>
              {telaah?.revisi?.modulAjarRevisiUrl && (
                <div className="mt-2 pt-2 border-t border-slate-300 text-emerald-900 bg-emerald-50/70 p-2 rounded">
                  <p className="font-bold text-emerald-800">Tautan Modul Ajar Hasil Revisi (Setelah Penilaian):</p>
                  <p className="font-mono text-slate-800">{telaah.revisi.modulAjarRevisiUrl}</p>
                  {telaah.revisi.catatanRevisiGuru && (
                    <p className="mt-1"><strong>Catatan Perbaikan Guru:</strong> {telaah.revisi.catatanRevisiGuru}</p>
                  )}
                  {telaah.revisi.revisiSubmittedAt && (
                    <p className="text-[10px] text-slate-600">Diunggah: {new Date(telaah.revisi.revisiSubmittedAt).toLocaleDateString('id-ID')}</p>
                  )}
                </div>
              )}
            </div>

            <table className="w-full text-[11px] border-collapse border border-slate-400 mb-3">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-400 p-1.5 w-8">No</th>
                  <th className="border border-slate-400 p-1.5 text-left">Aspek yang Diamati</th>
                  <th className="border border-slate-400 p-1.5 w-14">Skala (0-2)</th>
                  <th className="border border-slate-400 p-1.5 w-52 text-left">Komentar Kritis</th>
                </tr>
              </thead>
              <tbody>
                {TELAAH_ITEMS.map((item) => {
                  const scoreVal = telaah?.telaahScores?.[item.id];
                  const commentVal = telaah?.telaahComments?.[item.id];
                  return (
                    <tr key={item.id}>
                      <td className="border border-slate-400 p-1.5 text-center font-medium">{item.id}</td>
                      <td className="border border-slate-400 p-1.5">
                        <span className="font-semibold text-slate-700">[{item.category}]</span> {item.aspect}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold">
                        {scoreVal !== undefined ? (scoreVal === 'NA' ? 'N/A' : scoreVal) : '-'}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-slate-700 italic">
                        {commentVal || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Telaah Summary Pill */}
            <div className="bg-slate-50 p-3 rounded border border-slate-300 flex justify-between items-center text-xs mb-3">
              <div>
                <span>Total Skor Diperoleh: <strong>{telaah?.telaahSummary?.totalScore || 0}</strong> dari maks {telaah?.telaahSummary?.maxPossibleScore || 44}</span>
              </div>
              <div>
                <span className="text-sm font-extrabold text-indigo-900">
                  Nilai Akhir: {telaah?.telaahSummary?.finalScore?.toFixed(1) || 0} (Predikat: {telaah?.telaahSummary?.predicate || '-'})
                </span>
              </div>
            </div>

            {/* Feedback Telaah */}
            <div className="border border-slate-300 rounded p-3 text-xs space-y-1.5 bg-slate-50">
              <p><strong>Kelebihan Perencanaan:</strong> {telaah?.feedback?.kelebihan || '-'}</p>
              <p><strong>Hal yang Perlu Ditingkatkan:</strong> {telaah?.feedback?.perbaikan || '-'}</p>
              <p><strong>Rekomendasi Revisi:</strong> {telaah?.feedback?.rekomendasi || '-'}</p>
            </div>
          </div>
        )}

        {/* SCOPE 2: OBSERVASI KELAS (PRA, OBS, PASCA) */}
        {(reportScope === 'all' || reportScope === 'observasi') && (
          <div className="mb-8 print-avoid-break">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 p-2 border border-slate-300 mb-2">
              II. PRA-OBSERVASI, OBSERVASI KELAS &amp; PASCA-OBSERVASI
            </h4>

            {/* A. Pra-Observasi */}
            <div className="mb-4">
              <h5 className="font-bold text-xs text-slate-900 mb-1">A. Hasil Wawancara Pra-Observasi (Waktu: {pra?.interviewDurationMinutes || 30} Menit)</h5>
              <div className="space-y-1 text-[11px] bg-slate-50 p-3 rounded border border-slate-300">
                <p><strong>1. KD/CP &amp; TP:</strong> {pra?.q1_kd_indikator || '-'}</p>
                <p><strong>2. Metode &amp; Alasan:</strong> {pra?.q2_metode || '-'}</p>
                <p><strong>3. Alat/Bahan/Media &amp; Alasan:</strong> {pra?.q3_alat_bahan || '-'}</p>
                <p><strong>4. Tahapan Pembelajaran:</strong> {pra?.q4_tahapan || '-'}</p>
                <p><strong>5. Persiapan Tertulis:</strong> {pra?.q5_persiapan || '-'}</p>
                <p><strong>6. Materi Rawan Sulit:</strong> {pra?.q6_materi_sulit || '-'}</p>
                <p><strong>7. Target Karakter/Profil Pelajar:</strong> {pra?.q7_target_kompetensi || '-'}</p>
                <p><strong>8. Perhatian Khusus Supervisor:</strong> {pra?.q8_perhatian_khusus || '-'}</p>
                <p className="mt-1 text-slate-800 font-semibold">Catatan Pra-Observasi: {pra?.supervisorNotes || '-'}</p>
              </div>
            </div>

            {/* B. Observasi Kelas */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <h5 className="font-bold text-xs text-slate-900">B. Lembar Observasi Pelaksanaan Pembelajaran (24 Aspek)</h5>
                <span className="font-extrabold text-xs text-emerald-800">
                  Skor: {obs?.score || 0}% ({obs?.totalYa || 0}/{obs?.totalAspek || 24} Ya - {obs?.predicate || '-'})
                </span>
              </div>

              <table className="w-full text-[11px] border-collapse border border-slate-400 mb-2">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-400 p-1 w-8">No</th>
                    <th className="border border-slate-400 p-1 text-left">Aspek Pengamatan Pembelajaran</th>
                    <th className="border border-slate-400 p-1 w-16">Keterlaksanaan</th>
                    <th className="border border-slate-400 p-1 w-48 text-left">Catatan Fakta Lapangan</th>
                  </tr>
                </thead>
                <tbody>
                  {OBSERVASI_ITEMS.map((item, idx) => {
                    const st = obs?.items?.[item.id];
                    return (
                      <tr key={item.id}>
                        <td className="border border-slate-400 p-1 text-center font-medium">{idx + 1}</td>
                        <td className="border border-slate-400 p-1">
                          <span className="font-semibold text-slate-700">[{item.category}]</span> {item.aspect}
                        </td>
                        <td className="border border-slate-400 p-1 text-center font-bold">
                          {st?.status || '-'}
                        </td>
                        <td className="border border-slate-400 p-1 text-slate-700 italic">
                          {st?.note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-300 text-xs">
                <strong>Masukan / Catatan Pelaksanaan:</strong> {obs?.feedbackNotes || '-'}
              </div>
            </div>

            {/* C. Pasca Observasi */}
            <div>
              <h5 className="font-bold text-xs text-slate-900 mb-1">C. Refleksi &amp; Dialog Pasca-Observasi</h5>
              <div className="space-y-1 text-[11px] bg-slate-50 p-3 rounded border border-slate-300">
                <p><strong>1. Kesan Guru:</strong> {pasca?.q1_kesan || '-'}</p>
                <p><strong>2. Kesesuaian Rencana:</strong> {pasca?.q2_sesuai_rencana || '-'}</p>
                <p><strong>3. Hal yang Memuaskan:</strong> {pasca?.q3_hal_memuaskan || '-'}</p>
                <p><strong>4. Hal yang Perlu Dibenahi:</strong> {pasca?.q4_hal_kurang || '-'}</p>
                <p><strong>5. Ketercapaian Tujuan Murid:</strong> {pasca?.q5_ketercapaian_tujuan || '-'}</p>
                <p><strong>6. Kesulitan Belajar Murid:</strong> {pasca?.q6_kesulitan_siswa || '-'}</p>
                <p><strong>7. Alternatif Pemecahan:</strong> {pasca?.q7_alternatif_solusi || '-'}</p>
                <p><strong>8. Rencana Tindak Lanjut (RTL):</strong> {pasca?.q8_rencana_tindak_lanjut || '-'}</p>
                <p><strong>9. Kebutuhan Pengembangan Diri:</strong> {pasca?.q9_pengembangan_diri || '-'}</p>
                <p className="mt-1"><strong>Kesan Umum Supervisor:</strong> {pasca?.generalImpression || '-'}</p>
                <p><strong>Saran-Masukan:</strong> {pasca?.recommendations || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* SCOPE 3: EVALUASI 1 TAHUN */}
        {(reportScope === 'all' || reportScope === 'evaluasi') && (
          <div className="mb-8 print-avoid-break">
            <h4 className="text-xs font-bold uppercase tracking-wider bg-slate-200 p-2 border border-slate-300 mb-2">
              III. EVALUASI KINERJA 1 TAHUN PELAJARAN (5 KOMPONEN PORTOFOLIO)
            </h4>

            <table className="w-full text-[11px] border-collapse border border-slate-400 mb-3">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-400 p-1.5 w-8">No</th>
                  <th className="border border-slate-400 p-1.5 text-left">Komponen Penilaian Kinerja</th>
                  <th className="border border-slate-400 p-1.5 text-left">Bukti Fisik / Indikator</th>
                  <th className="border border-slate-400 p-1.5 w-16">Skor (100)</th>
                  <th className="border border-slate-400 p-1.5 text-left">Catatan Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">1</td>
                  <td className="border border-slate-400 p-1.5 font-bold">Hasil Belajar Murid</td>
                  <td className="border border-slate-400 p-1.5">{evl?.hasilBelajar?.evidence || '-'}</td>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">{evl?.hasilBelajar?.score || 90}</td>
                  <td className="border border-slate-400 p-1.5">{evl?.hasilBelajar?.note || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">2</td>
                  <td className="border border-slate-400 p-1.5 font-bold">Administrasi &amp; Perangkat Ajar</td>
                  <td className="border border-slate-400 p-1.5">{evl?.administrasi?.evidence || '-'}</td>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">{evl?.administrasi?.score || 90}</td>
                  <td className="border border-slate-400 p-1.5">{evl?.administrasi?.note || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">3</td>
                  <td className="border border-slate-400 p-1.5 font-bold">Pengembangan Keprofesian (PKB)</td>
                  <td className="border border-slate-400 p-1.5">{evl?.pengembanganDiri?.evidence || '-'}</td>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">{evl?.pengembanganDiri?.score || 90}</td>
                  <td className="border border-slate-400 p-1.5">{evl?.pengembanganDiri?.note || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">4</td>
                  <td className="border border-slate-400 p-1.5 font-bold">Kedisiplinan &amp; Etika Pendidik</td>
                  <td className="border border-slate-400 p-1.5">{evl?.kedisiplinan?.evidence || '-'}</td>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">{evl?.kedisiplinan?.score || 90}</td>
                  <td className="border border-slate-400 p-1.5">{evl?.kedisiplinan?.note || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">5</td>
                  <td className="border border-slate-400 p-1.5 font-bold">Rekomendasi &amp; Tindak Lanjut</td>
                  <td className="border border-slate-400 p-1.5">{evl?.rekomendasi?.tindakLanjut || '-'}</td>
                  <td className="border border-slate-400 p-1.5 text-center font-bold">{evl?.rekomendasi?.score || 90}</td>
                  <td className="border border-slate-400 p-1.5">{evl?.rekomendasi?.notes || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Final Tahunan Summary */}
            <div className="bg-slate-100 p-3 rounded border border-slate-300 flex justify-between items-center text-xs">
              <span className="font-semibold">Skor Rata-Rata Kinerja Tahunan: <strong>{evl?.finalAverageScore || 90}</strong></span>
              <span className="font-extrabold text-sm text-purple-900">Predikat: {evl?.finalGrade || 'Amat Baik (A)'}</span>
            </div>
            {evl?.summaryNotes && (
              <p className="text-xs text-slate-700 italic mt-2">
                <strong>Ringkasan Eksekutif:</strong> {evl.summaryNotes}
              </p>
            )}
          </div>
        )}

        {/* Official 3-Column Signature Section */}
        <div className="signature-block mt-12 grid grid-cols-3 gap-4 text-center text-xs print-avoid-break">
          <div>
            <p className="text-slate-500 mb-1">Guru yang Disupervisi,</p>
            <div className="signature-space h-16"></div>
            <p className="font-bold underline text-slate-900">{supervision.teacherName}</p>
            <p className="text-[11px] text-slate-600">NIP. {supervision.teacherNip || '...................................'}</p>
          </div>

          <div>
            <p className="text-slate-500 mb-1">Mengetahui,<br/>Kepala {supervision.schoolName}</p>
            <div className="signature-space h-16"></div>
            <p className="font-bold underline text-slate-900">Kepala Satuan Pendidikan</p>
            <p className="text-[11px] text-slate-600">NIP. ...................................</p>
          </div>

          <div>
            <p className="text-slate-500 mb-1">Bandung, {todayStr}<br/>Pengawas Sekolah Pembina,</p>
            <div className="signature-space h-16"></div>
            <p className="font-bold underline text-slate-900">Kusnandar, M.Si</p>
            <p className="text-[11px] text-slate-600">Pengawas Pembina SMA Prov. Jawa Barat</p>
          </div>
        </div>

        {/* Footer print watermark */}
        <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 print-footer">
          <p>Dokumen Resmi Hasil Supervisi Akademik &bull; Dicetak melalui Aplikasi SIKLUS SAMBUNG SMA &bull; @copyright by Pak Kus &amp; Pak GuruAI</p>
        </div>
      </div>
    </div>
  );
};
