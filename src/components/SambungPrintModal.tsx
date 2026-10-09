import React from 'react';
import { Supervision } from '../types';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface SambungPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  supervision: Supervision;
}

export const SambungPrintModal: React.FC<SambungPrintModalProps> = ({
  isOpen,
  onClose,
  supervision,
}) => {
  if (!isOpen || !supervision.sambung) return null;

  const sambung = supervision.sambung;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col my-4 print:my-0 print:shadow-none print:w-full print:rounded-none">
        {/* Modal Controls - Hidden during print */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              SS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cetak Portofolio Instrumen SAMBUNG
              </h2>
              <p className="text-xs text-slate-500">
                {supervision.teacherName} &bull; {supervision.subject} &bull; {supervision.schoolName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 print:p-4 space-y-10 text-slate-900 font-sans text-xs leading-relaxed overflow-y-auto">
          
          {/* COVER & INTRODUCTORY SHEET */}
          <div className="border-b border-slate-300 pb-8 page-break-after">
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide text-slate-900">
                INSTRUMEN STRATEGI SAMBUNG
              </h1>
              <p className="text-xs font-medium text-slate-600 mt-1 italic">
                Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA
              </p>
              <div className="h-0.5 w-32 bg-indigo-600 mx-auto mt-2"></div>
            </div>

            {/* Identitas Guru & Sekolah */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p><span className="font-semibold text-slate-600">Nama Guru:</span> <strong className="text-slate-900">{supervision.teacherName}</strong></p>
                <p><span className="font-semibold text-slate-600">NIP:</span> {supervision.teacherNip || '-'}</p>
                <p><span className="font-semibold text-slate-600">Mata Pelajaran:</span> {supervision.subject}</p>
              </div>
              <div>
                <p><span className="font-semibold text-slate-600">Sekolah:</span> {supervision.schoolName}</p>
                <p><span className="font-semibold text-slate-600">Kelas / Fase:</span> {supervision.classGrade}</p>
                <p><span className="font-semibold text-slate-600">Pengawas Pembina:</span> <strong>Kusnandar, M.Si</strong></p>
              </div>
            </div>

            {/* Tabel Akronim SAMBUNG (Page 1 Top) */}
            <div className="mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                Ringkasan Tahapan Strategi SAMBUNG
              </h3>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-left font-bold text-slate-800">
                    <th className="border border-slate-300 px-3 py-2 w-28">Tahap</th>
                    <th className="border border-slate-300 px-3 py-2">Instrumen</th>
                    <th className="border border-slate-300 px-3 py-2">Hasil / Bukti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">SELIDIKI</td>
                    <td className="border border-slate-300 px-3 py-1.5">S — Lembar Pemetaan</td>
                    <td className="border border-slate-300 px-3 py-1.5">Peta kebutuhan pembelajaran</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">ARAHKAN</td>
                    <td className="border border-slate-300 px-3 py-1.5">A — Rencana Aksi Pembinaan</td>
                    <td className="border border-slate-300 px-3 py-1.5">Fokus perubahan yang disepakati</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">MAKNAI</td>
                    <td className="border border-slate-300 px-3 py-1.5">M — Lembar Coaching</td>
                    <td className="border border-slate-300 px-3 py-1.5">Komitmen guru</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">BERDAYAKAN</td>
                    <td className="border border-slate-300 px-3 py-1.5">B — Lembar Rancang–Coba–Refleksi</td>
                    <td className="border border-slate-300 px-3 py-1.5">Catatan uji coba dan refleksi guru</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">UJI</td>
                    <td className="border border-slate-300 px-3 py-1.5">U-1 Observasi Kelas; U-2 Angket Murid</td>
                    <td className="border border-slate-300 px-3 py-1.5">Skor pembelajaran dan suara murid</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">NYATAKAN</td>
                    <td className="border border-slate-300 px-3 py-1.5">N — Before–After dan Data Dampak</td>
                    <td className="border border-slate-300 px-3 py-1.5">Bukti perubahan</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">GERAKKAN</td>
                    <td className="border border-slate-300 px-3 py-1.5">G — Tindak Lanjut dan Pengimbasan</td>
                    <td className="border border-slate-300 px-3 py-1.5">RTL terpantau</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-slate-500 italic mt-2">
                * Isi dengan data nyata sekolah binaan. Tulis kode/inisial murid, bukan nama lengkap. Simpan bukti (foto, karya, catatan) dan cantumkan kodenya pada kolom Bukti.
              </p>
            </div>
          </div>

          {/* S — LEMBAR PEMETAAN PEMBELAJARAN */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                S
              </span>
              <div>
                <h3 className="font-bold text-sm">Lembar Pemetaan Pembelajaran</h3>
                <p className="text-[10px] text-indigo-200">SELIDIKI — diisi dari telaah perangkat, observasi awal, dan dialog</p>
              </div>
            </div>

            <div className="text-xs mb-3 space-y-0.5">
              <p><strong>Sekolah / Guru / Mata pelajaran :</strong> {supervision.schoolName} / {supervision.teacherName} / {supervision.subject}</p>
              <p><strong>Tanggal :</strong> {sambung.selidiki.tanggal}</p>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-2">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-48 text-left">Aspek</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Kondisi awal</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-36">Bukti</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Kebutuhan pembinaan</th>
                </tr>
              </thead>
              <tbody>
                {sambung.selidiki.items.map((item) => (
                  <tr key={item.id} className={item.isPrioritas ? 'bg-amber-50/50' : ''}>
                    <td className="border border-slate-300 px-2 py-2 text-center font-semibold">
                      {item.id}
                      {item.isPrioritas && <span className="block text-[9px] text-amber-700 font-bold">*Prioritas</span>}
                    </td>
                    <td className="border border-slate-300 px-2 py-2 font-medium">{item.aspek}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-700">{item.kondisiAwal || '-'}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-600">{item.bukti || '-'}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-700">{item.kebutuhanPembinaan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 italic">
              Tandai aspek yang paling banyak perlu penguatan sebagai prioritas pembinaan. {sambung.selidiki.catatanPrioritas && `(Catatan: ${sambung.selidiki.catatanPrioritas})`}
            </p>
          </div>

          {/* A — RENCANA AKSI PEMBINAAN PEMBELAJARAN */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                A
              </span>
              <div>
                <h3 className="font-bold text-sm">Rencana Aksi Pembinaan Pembelajaran</h3>
                <p className="text-[10px] text-indigo-200">ARAHKAN — disepakati bersama kepala sekolah dan guru</p>
              </div>
            </div>

            <div className="text-xs mb-3 space-y-0.5">
              <p><strong>Sekolah :</strong> {supervision.schoolName}</p>
              <p><strong>Periode :</strong> {sambung.arahkan.periode}</p>
              <p className="mt-1">
                <strong>Fokus perubahan</strong> (satu kalimat: berdasarkan kebutuhan, realistis, terukur, berdampak pada murid):
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg italic text-slate-800 font-medium">
                &ldquo;{sambung.arahkan.fokusPerubahan}&rdquo;
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-6">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Kegiatan pembinaan</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Indikator keberhasilan</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-28">Waktu</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-36">Penanggung jawab</th>
                </tr>
              </thead>
              <tbody>
                {sambung.arahkan.kegiatan.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="border border-slate-300 px-2 py-2 text-center font-semibold">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-2 font-medium">{item.kegiatanPembinaan}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-700">{item.indikatorKeberhasilan}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-600">{item.waktu}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-700">{item.penanggungJawab}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kolom 3 Tanda Tangan */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs mt-8">
              <div>
                <p className="font-semibold text-slate-700 mb-14">Pengawas Sekolah,</p>
                <p className="font-bold underline text-slate-900">Kusnandar, M.Si</p>
                <p className="text-[10px] text-slate-500">NIP. 19680712 199412 1 002</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-14">Kepala Sekolah,</p>
                <p className="font-bold underline text-slate-900">{sambung.arahkan.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}</p>
                <p className="text-[10px] text-slate-500">{supervision.schoolName}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700 mb-14">Guru,</p>
                <p className="font-bold underline text-slate-900">{supervision.teacherName}</p>
                <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
              </div>
            </div>
          </div>

          {/* M — LEMBAR COACHING (DIALOG REFLEKTIF) */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                M
              </span>
              <div>
                <h3 className="font-bold text-sm">Lembar Coaching (Dialog Reflektif)</h3>
                <p className="text-[10px] text-indigo-200">MAKNAI — pembinaan dimulai dari dialog, bukan instruksi</p>
              </div>
            </div>

            <div className="text-xs mb-3 space-y-0.5">
              <p><strong>Nama Guru / Mata pelajaran :</strong> {supervision.teacherName} / {supervision.subject}</p>
              <p><strong>Tanggal :</strong> {sambung.maknai.tanggal}</p>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-8">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-24 text-left">Tahap</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-60 text-left">Pertanyaan pemantik</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Catatan guru</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-bold text-indigo-950 bg-slate-50/50">Tujuan</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-700 italic">Pengalaman belajar seperti apa yang ingin diciptakan untuk murid?</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-800">{sambung.maknai.coaching.tujuan || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-bold text-indigo-950 bg-slate-50/50">Realitas</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-700 italic">Apa yang sudah berjalan baik? Bagaimana kita tahu murid benar-benar belajar?</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-800">{sambung.maknai.coaching.realitas || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-bold text-indigo-950 bg-slate-50/50">Opsi</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-700 italic">Apa yang membuat pembelajaran bermakna bagi murid? Apa yang bisa dicoba?</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-800">{sambung.maknai.coaching.opsi || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-bold text-indigo-950 bg-slate-50/50">Komitmen</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-700 italic">Langkah kecil apa yang akan dicoba? Dukungan apa yang dibutuhkan? Kapan kita tinjau?</td>
                  <td className="border border-slate-300 px-2 py-2 text-slate-800">{sambung.maknai.coaching.komitmen || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* B — LEMBAR RANCANG-COBA-REFLEKSI-PERBAIKI */}
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg mt-8">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                B
              </span>
              <div>
                <h3 className="font-bold text-sm">Lembar Rancang &ndash; Coba &ndash; Refleksi &ndash; Perbaiki</h3>
                <p className="text-[10px] text-indigo-200">BERDAYAKAN — diisi guru; rancangan mencakup memahami, mengaplikasikan, merefleksikan, menghubungkan</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-16 text-center">Siklus</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Rancangan dan hasil uji coba pada murid</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Refleksi (berhasil / belum, mengapa)</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Perbaikan berikutnya</th>
                </tr>
              </thead>
              <tbody>
                {sambung.berdayakan.siklusList.map((item) => (
                  <tr key={item.siklus}>
                    <td className="border border-slate-300 px-2 py-2 text-center font-bold">Siklus {item.siklus}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800">{item.rancanganDanUjiCoba || '-'}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-700">{item.refleksi || '-'}</td>
                    <td className="border border-slate-300 px-2 py-2 text-slate-800 font-medium">{item.perbaikanBerikutnya || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* U-1 — OBSERVASI KELAS SAMBUNG */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                U-1
              </span>
              <div>
                <h3 className="font-bold text-sm">Observasi Kelas SAMBUNG</h3>
                <p className="text-[10px] text-indigo-200">UJI — amati apa yang dilakukan guru dan apa yang dialami murid</p>
              </div>
            </div>

            <div className="text-xs mb-2 space-y-0.5 grid grid-cols-2">
              <p><strong>Sekolah / Guru / Kelas :</strong> {supervision.schoolName} / {supervision.teacherName} / {sambung.uji.u1_observasi.kelas || supervision.classGrade}</p>
              <p><strong>Hari, tanggal :</strong> {sambung.uji.u1_observasi.hariTanggal}</p>
              <p><strong>Observasi :</strong> {sambung.uji.u1_observasi.tahapObservasi.toUpperCase()}</p>
            </div>
            <p className="text-[10px] text-slate-500 italic mb-2">
              Skala: 1 = belum tampak; 2 = mulai berkembang (sebagian kecil murid); 3 = berkembang (sebagian besar murid); 4 = sangat berkembang (murid berinisiatif, terbukti pada karya/ucapan).
            </p>

            <table className="w-full border-collapse border border-slate-300 text-[10px] mb-3">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                  <th className="border border-slate-300 px-1.5 py-1 w-6">No</th>
                  <th className="border border-slate-300 px-2 py-1 text-left">Indikator</th>
                  <th className="border border-slate-300 px-2 py-1 w-24 text-left">Dimensi</th>
                  <th className="border border-slate-300 px-1 py-1 w-6">1</th>
                  <th className="border border-slate-300 px-1 py-1 w-6">2</th>
                  <th className="border border-slate-300 px-1 py-1 w-6">3</th>
                  <th className="border border-slate-300 px-1 py-1 w-6">4</th>
                  <th className="border border-slate-300 px-2 py-1 text-left w-48">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {sambung.uji.u1_observasi.indikatorList.map((ind) => (
                  <tr key={ind.id}>
                    <td className="border border-slate-300 px-1.5 py-1 text-center font-semibold">{ind.id}</td>
                    <td className="border border-slate-300 px-2 py-1">{ind.indikator}</td>
                    <td className="border border-slate-300 px-2 py-1 font-medium text-slate-600">{ind.dimensi}</td>
                    <td className={`border border-slate-300 px-1 py-1 text-center ${ind.score === 1 ? 'font-bold bg-slate-200' : ''}`}>{ind.score === 1 ? '✓' : ''}</td>
                    <td className={`border border-slate-300 px-1 py-1 text-center ${ind.score === 2 ? 'font-bold bg-slate-200' : ''}`}>{ind.score === 2 ? '✓' : ''}</td>
                    <td className={`border border-slate-300 px-1 py-1 text-center ${ind.score === 3 ? 'font-bold bg-slate-200' : ''}`}>{ind.score === 3 ? '✓' : ''}</td>
                    <td className={`border border-slate-300 px-1 py-1 text-center ${ind.score === 4 ? 'font-bold bg-slate-200' : ''}`}>{ind.score === 4 ? '✓' : ''}</td>
                    <td className="border border-slate-300 px-2 py-1 text-slate-600">{ind.catatan}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-300 px-2 py-1.5 text-right">
                    Jumlah skor (maks. 40):
                  </td>
                  <td colSpan={4} className="border border-slate-300 px-2 py-1.5 text-center text-sm text-indigo-700">
                    {sambung.uji.u1_observasi.totalSkor}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-xs text-indigo-800">
                    Capaian: {sambung.uji.u1_observasi.persentaseCapaian.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                <p className="font-bold text-slate-800 mb-1">Apa yang dialami murid?</p>
                <p className="text-slate-700 text-[11px] leading-relaxed">{sambung.uji.u1_observasi.apaYangDialamiMurid || '-'}</p>
              </div>
              <div className="p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                <p className="font-bold text-slate-800 mb-1">Kekuatan dan rekomendasi:</p>
                <p className="text-slate-700 text-[11px] leading-relaxed">{sambung.uji.u1_observasi.kekuatanDanRekomendasi || '-'}</p>
              </div>
            </div>
          </div>

          {/* U-2 — ANGKET REFLEKSI MURID */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                U-2
              </span>
              <div>
                <h3 className="font-bold text-sm">Angket Refleksi Murid</h3>
                <p className="text-[10px] text-indigo-200">UJI — suara murid; tulis kode/inisial saja ({sambung.uji.u2_angketMurid.jumlahResponden} responden)</p>
              </div>
            </div>

            <div className="text-xs mb-2 space-y-0.5">
              <p><strong>Kode murid / Kelas :</strong> {sambung.uji.u2_angketMurid.kodeMuridKelas}</p>
              <p><strong>Tanggal :</strong> {sambung.uji.u2_angketMurid.tanggal}</p>
            </div>
            <p className="text-[10px] text-slate-500 italic mb-2">
              Lingkari: 1 = sangat tidak setuju; 2 = tidak setuju; 3 = setuju; 4 = sangat setuju.
            </p>

            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-3">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Pernyataan</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-32 text-center">Rata-rata Skor</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-36 text-center">% Setuju (Pilihan 3 &amp; 4)</th>
                </tr>
              </thead>
              <tbody>
                {sambung.uji.u2_angketMurid.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">{item.id}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{item.pernyataan}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-medium">{item.skorRataRata.toFixed(1)} / 4.0</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-indigo-700">{item.persentaseSetuju.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-3 py-1.5 w-56 text-left">Lengkapi kalimat</th>
                  <th className="border border-slate-300 px-3 py-1.5 text-left">Jawaban murid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-3 py-2 font-medium bg-slate-50/50">Hal yang paling bermakna bagi saya adalah &hellip;</td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-800 italic">&ldquo;{sambung.uji.u2_angketMurid.halPalingBermakna || '-'}&rdquo;</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 px-3 py-2 font-medium bg-slate-50/50">Kesulitan saya adalah &hellip;</td>
                  <td className="border border-slate-300 px-3 py-2 text-slate-800 italic">&ldquo;{sambung.uji.u2_angketMurid.kesulitanMurid || '-'}&rdquo;</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* N — BEFORE-AFTER DAN DATA DAMPAK */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                N
              </span>
              <div>
                <h3 className="font-bold text-sm">Before&ndash;After dan Data Dampak</h3>
                <p className="text-[10px] text-indigo-200">NYATAKAN — setiap perubahan harus disertai bukti</p>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-800 mb-1">1. Matriks Perubahan Before &ndash; After</h4>
            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-40 text-left">Aspek Perubahan</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Sebelum SAMBUNG</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Setelah SAMBUNG</th>
                </tr>
              </thead>
              <tbody>
                {sambung.nyatakan.beforeAfter
                  .filter(item => item.aspek !== 'Asesmen dan umpan balik' && item.aspek !== 'Tindak lanjut supervisi')
                  .map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800 bg-slate-50/40">{item.aspek}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.sebelumSambung}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-900 font-medium">{item.setelahSambung}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="font-bold text-xs text-slate-800 mb-2">2. Data Dampak Pembelajaran Murid (Tabel Rekapitulasi)</h4>

            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-48">Indikator</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-20 text-center">Awal</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-24 text-center">Setelah SAMBUNG</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Makna &amp; Informasi Deskriptif Penilaian Guru</th>
                </tr>
              </thead>
              <tbody>
                {sambung.nyatakan.dataDampak.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium text-slate-800 align-top">
                      <div className="font-bold text-slate-900">{row.indikator}</div>
                      {row.buktiKegiatan && (
                        <div className="text-[10px] text-slate-500 mt-1 italic">
                          Bukti: {row.buktiKegiatan}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-slate-600 font-semibold align-top">{row.awal}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-emerald-800 bg-emerald-50/30 align-top">
                      <div>{row.akhir}</div>
                      {row.selisih && (
                        <span className="text-[9px] text-emerald-700 font-bold">{row.selisih}</span>
                      )}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700 align-top space-y-1">
                      <div className="font-bold text-slate-900">{row.makna || '-'}</div>
                      {row.deskripsiPenilaian && (
                        <div className="text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 mt-1 leading-relaxed">
                          <strong className="text-indigo-900">Deskripsi Penilaian Pengawas: </strong>
                          {row.deskripsiPenilaian}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 italic mt-1">
              Gunakan data nyata. Jika data tertentu tidak tersedia, tulis sebagai keterbatasan, jangan diisi angka perkiraan.
            </p>
          </div>

          {/* G — TINDAK LANJUT DAN PENGIMBASAN */}
          <div>
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                G
              </span>
              <div>
                <h3 className="font-bold text-sm">Tindak Lanjut dan Pengimbasan</h3>
                <p className="text-[10px] text-indigo-200">GERAKKAN — hasil supervisi tidak berhenti sebagai catatan</p>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-800 mb-1">1. Rencana Tindak Lanjut Temuan</h4>
            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Temuan supervisi</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Tindak lanjut</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-36">Penanggung jawab</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-24">Waktu</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {sambung.gerakkan.tindakLanjut.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">{idx + 1}</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium">{item.temuanSupervisi}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{item.tindakLanjut}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{item.penanggungJawab}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.waktu}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium">{item.hasil}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="font-bold text-xs text-slate-800 mb-1">2. Diseminasi &amp; Pengimbasan Praktik Baik</h4>
            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-8">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Praktik baik yang diimbaskan</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Sasaran</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-48">Bentuk (MGMP, berbagi, publikasi)</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-28">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {sambung.gerakkan.pengimbasan.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="border border-slate-300 px-2 py-1.5 font-semibold text-slate-900">{item.praktikBaik}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{item.sasaran}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{item.bentuk}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.waktu}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PENGESAHAN AKHIR */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-slate-600 mb-12">Mengetahui,<br/>Guru Mata Pelajaran,</p>
                <p className="font-bold underline text-slate-900">{supervision.teacherName}</p>
                <p className="text-[11px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-12">Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Pengawas Sekolah Pembina SMA,</p>
                <p className="font-bold underline text-slate-900">Kusnandar, M.Si</p>
                <p className="text-[11px] text-slate-500">Pengawas Pembina Disdik Prov. Jawa Barat</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400 print:text-slate-500">
              Dokumen Portofolio Resmi Strategi SAMBUNG &bull; Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA &bull; Pengawas Kusnandar, M.Si
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
