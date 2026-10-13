import React from 'react';
import { Supervision } from '../types';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';
import { DEFAULT_MATRIKS_BEFORE, DEFAULT_MATRIKS_AFTER } from '../data/sambungSeed';
import { MAKNAI_COACHING_QUESTIONS, TELAAH_ITEMS, OBSERVASI_ITEMS, PRA_OBSERVASI_QUESTIONS, PASCA_OBSERVASI_QUESTIONS } from '../data/instrumentData';
import { generateTeacherMaknaiData, generateBerdayakanTelaahPerbaikanData, generateUjiData, generateGerakkanData } from '../data/autoFillData';

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
                    <td className="border border-slate-300 px-3 py-1.5 font-bold">AMATI</td>
                    <td className="border border-slate-300 px-3 py-1.5">A — Memilih Fokus Perbaikan &amp; Rencana Aksi</td>
                    <td className="border border-slate-300 px-3 py-1.5">Memilih fokus perbaikan dari 4 indikator Kesimpulan Selidiki</td>
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
          {/* S — LEMBAR PEMETAAN & INSTRUMEN SELIDIKI */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                S
              </span>
              <div>
                <h3 className="font-bold text-sm">Tahap S — SELIDIKI: Instrumen Supervisi &amp; Kesimpulan Kondisi Awal</h3>
                <p className="text-[10px] text-indigo-200">
                  1. Telaah RPP (22 Indikator) &bull; 2. Praobservasi (8 Pertanyaan) &bull; 3. Observasi Kelas (25 Indikator) &bull; 4. Kesimpulan SELIDIKI
                </p>
              </div>
            </div>

            <div className="text-xs mb-3 space-y-0.5">
              <p><strong>Sekolah / Guru / Mata pelajaran :</strong> {supervision.schoolName} / {supervision.teacherName} / {supervision.subject}</p>
              <p><strong>Tanggal Pemetaan :</strong> {sambung.selidiki.tanggal}</p>
            </div>

            {/* Ringkasan 3 Instrumen Data Awal Selidiki */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
              <div className="border border-slate-300 p-2 rounded bg-slate-50">
                <span className="font-bold text-slate-800 block">1. Telaah RPP (22 Indikator)</span>
                <span className="text-slate-600 block mt-0.5">
                  Nilai: <strong>{supervision.perangkatAjar?.telaahSummary?.finalScore?.toFixed(1) || '0'}%</strong> ({supervision.perangkatAjar?.telaahSummary?.predicate || 'Perlu Perbaikan'})
                </span>
                <span className="text-slate-500 block text-[9px]">Skor Mentah: {supervision.perangkatAjar?.telaahSummary?.totalScore || 0} / 44</span>
              </div>
              <div className="border border-slate-300 p-2 rounded bg-slate-50">
                <span className="font-bold text-slate-800 block">2. Praobservasi (8 Pertanyaan)</span>
                <span className="text-slate-600 block mt-0.5">
                  Durasi: <strong>{supervision.praObservasi?.interviewDurationMinutes || 30} Menit</strong>
                </span>
                <span className="text-slate-500 block text-[9px]">Status: {supervision.praObservasi?.completedAt ? 'Wawancara Terlaksana' : 'Terencana'}</span>
              </div>
              <div className="border border-slate-300 p-2 rounded bg-slate-50">
                <span className="font-bold text-slate-800 block">3. Observasi Kelas (25 Indikator)</span>
                <span className="text-slate-600 block mt-0.5">
                  Capaian: <strong>{supervision.observasiKelas?.score?.toFixed(1) || '0'}%</strong> ({supervision.observasiKelas?.predicate || 'Kurang'})
                </span>
                <span className="text-slate-500 block text-[9px]">Aspek Terpenuhi: {supervision.observasiKelas?.totalYa || 0} / 25</span>
              </div>
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
            <p className="text-[10px] text-slate-500 italic mb-4">
              Tandai aspek yang paling banyak perlu penguatan sebagai prioritas pembinaan. {sambung.selidiki.catatanPrioritas && `(Catatan: ${sambung.selidiki.catatanPrioritas})`}
            </p>

            {/* Tabel Kesimpulan Selidiki: Indikator dan Selidiki */}
            <div className="mt-3 pt-3 border-t border-slate-300">
              <h4 className="font-bold text-xs text-slate-900 mb-1">
                Kesimpulan Selidiki: Tabel Indikator dan Selidiki (Kondisi Awal / Baseline Guru)
              </h4>
              <p className="text-[10px] text-slate-600 mb-2">
                Rangkuman 4 indikator kunci kondisi awal pembelajaran guru berdasarkan hasil telaah modul ajar, pra-observasi, observasi kelas tatap muka, dan pasca-observasi awal.
              </p>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-60 text-left">Indikator Pembelajaran</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-left">Kesimpulan Selidiki (Kondisi Awal / Baseline)</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-52 text-left">Arah Transformasi Sasaran</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">1</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Guru berorientasi pada pengalaman belajar murid
                      <span className="block text-[9px] text-indigo-700 font-normal">Aspek: Peran Guru</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                      {sambung.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-indigo-900 text-[10px]">
                      &rarr; Dari ceramah materi menuju perancang pengalaman belajar aktif murid
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">2</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Murid aktif mengaplikasikan pengetahuan
                      <span className="block text-[9px] text-purple-700 font-normal">Aspek: Aktivitas Murid</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                      {sambung.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-purple-900 text-[10px]">
                      &rarr; Dari penerima pasif menuju aktif mengaplikasikan pengetahuan kontekstual
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">3</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Pembelajaran terhubung dengan konteks kehidupan nyata murid
                      <span className="block text-[9px] text-amber-700 font-normal">Aspek: Konteks Nyata</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                      {sambung.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-amber-900 text-[10px]">
                      &rarr; Dari belum konsisten menjadi mulai dirancang terhubung situasi riil
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">4</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Refleksi menjadi bagian rutin dalam proses pembelajaran
                      <span className="block text-[9px] text-blue-700 font-normal">Aspek: Refleksi Murid</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">
                      {sambung.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-blue-900 text-[10px]">
                      &rarr; Dari belum rutin menjadi bagian integral pembelajaran harian
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* A — AMATI: MEMILIH FOKUS PERBAIKAN DARI KESIMPULAN SELIDIKI */}
          <div className="page-break-after">
            <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
              <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                A
              </span>
              <div>
                <h3 className="font-bold text-sm">A — Memilih Fokus Perbaikan &amp; Rencana Aksi Pembinaan</h3>
                <p className="text-[10px] text-indigo-200">AMATI — Memilih fokus perbaikan dari empat indikator di Kesimpulan Selidiki</p>
              </div>
            </div>

            <div className="text-xs mb-3 space-y-1">
              <div className="flex justify-between">
                <p><strong>Sekolah :</strong> {supervision.schoolName}</p>
                <p><strong>Periode :</strong> {sambung.arahkan.periode}</p>
              </div>

              {/* Tabel 4 Indikator Kesimpulan Selidiki */}
              <div className="mt-2 mb-3">
                <p className="text-[11px] font-bold text-slate-800 mb-1">
                  Pilihan Fokus Perbaikan dari 4 Indikator Kesimpulan Selidiki:
                </p>
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="border border-slate-300 px-2 py-1 text-center w-8">No</th>
                      <th className="border border-slate-300 px-2 py-1 text-left w-36">Indikator</th>
                      <th className="border border-slate-300 px-2 py-1 text-left">Kondisi Awal (Kesimpulan Selidiki)</th>
                      <th className="border border-slate-300 px-2 py-1 text-center w-28">Status Fokus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        no: 1,
                        key: 'peranGuru',
                        name: 'Peran Guru',
                        baseline: sambung.selidiki.matriksBefore?.peranGuru || 'Berfokus pada penyampaian materi klasikal/ceramah.',
                      },
                      {
                        no: 2,
                        key: 'aktivitasMurid',
                        name: 'Aktivitas Murid',
                        baseline: sambung.selidiki.matriksBefore?.aktivitasMurid || 'Lebih banyak menerima pasif dan mencatat.',
                      },
                      {
                        no: 3,
                        key: 'konteksNyata',
                        name: 'Konteks Nyata',
                        baseline: sambung.selidiki.matriksBefore?.konteksNyata || 'Belum konsisten dikaitkan dengan konteks nyata.',
                      },
                      {
                        no: 4,
                        key: 'refleksiMurid',
                        name: 'Refleksi Murid',
                        baseline: sambung.selidiki.matriksBefore?.refleksiMurid || 'Belum rutin menjadi bagian pembelajaran harian.',
                      },
                    ].map(item => {
                      const isChosen = (sambung.arahkan.fokusIndikatorTerpilih || ['peranGuru', 'aktivitasMurid']).includes(item.key as any);
                      return (
                        <tr key={item.key} className={isChosen ? 'bg-blue-50/50' : ''}>
                          <td className="border border-slate-300 px-2 py-1 text-center font-bold">{item.no}</td>
                          <td className="border border-slate-300 px-2 py-1 font-semibold">{item.name}</td>
                          <td className="border border-slate-300 px-2 py-1 italic">{item.baseline}</td>
                          <td className="border border-slate-300 px-2 py-1 text-center font-bold text-blue-800">
                            {isChosen ? '✓ Fokus Terpilih' : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

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

          {/* M — LEMBAR REFLEKSI & COACHING PASCA OBSERVASI (MAKNAI) */}
          {(() => {
            const autoMaknai = generateTeacherMaknaiData(supervision);
            const currentPertanyaan = sambung.maknai?.pertanyaanList || autoMaknai.pertanyaanList;
            const currentKesanUmum = sambung.maknai?.kesanUmum ?? autoMaknai.kesanUmum;
            const currentSaranMasukan = sambung.maknai?.saranMasukan ?? autoMaknai.saranMasukan;

            return (
              <div className="page-break-after">
                <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
                  <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                    M
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">M — Lembar Refleksi &amp; Coaching Pasca Observasi (MAKNAI)</h3>
                    <p className="text-[10px] text-indigo-200">
                      Sesuai Dokumen Resmi Pengawas Pembina Kusnandar, M.Si — 10 Pertanyaan Refleksi Pasca Observasi &amp; Dialog Coaching
                    </p>
                  </div>
                </div>

                <div className="text-xs mb-3 flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                  <p><strong>Nama Guru :</strong> {supervision.teacherName} (NIP. {supervision.teacherNip || '-'})</p>
                  <p><strong>Mata Pelajaran :</strong> {supervision.subject}</p>
                  <p><strong>Sekolah :</strong> {supervision.schoolName}</p>
                  <p><strong>Tanggal :</strong> {sambung.maknai.tanggal || new Date().toISOString().split('T')[0]}</p>
                </div>

                {/* 10 Pertanyaan Coaching & Refleksi */}
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    10 Pertanyaan Refleksi Pasca Observasi (Jawaban Guru Disesuaikan dengan Hasil Observasi &amp; Kesimpulan Akhir):
                  </p>
                  <table className="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-2 py-1.5 text-center w-8">No</th>
                        <th className="border border-slate-300 px-2 py-1.5 text-left w-5/12">Pertanyaan Coaching &amp; Refleksi</th>
                        <th className="border border-slate-300 px-2 py-1.5 text-left">Jawaban / Refleksi Guru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MAKNAI_COACHING_QUESTIONS.map((item) => {
                        const currentList = currentPertanyaan || {};
                        const autoList = autoMaknai.pertanyaanList || {};
                        const answerText = currentList[item.id] || autoList[item.id] || '-';
                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-600 align-top">
                              {item.no}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 font-semibold text-slate-900 align-top leading-snug">
                              {item.pertanyaan}
                            </td>
                            <td className="border border-slate-300 px-2 py-1.5 text-slate-800 align-top leading-relaxed whitespace-pre-wrap">
                              {answerText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Kesan Umum & Saran Masukan */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-[10px]">
                  <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50">
                    <p className="font-bold text-slate-900 mb-1">Kesan Umum:</p>
                    <p className="italic text-slate-700 leading-relaxed">{currentKesanUmum || '-'}</p>
                  </div>
                  <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50">
                    <p className="font-bold text-slate-900 mb-1">Saran &amp; Masukan Pengawas / Kepala Sekolah:</p>
                    <p className="italic text-slate-700 leading-relaxed">{currentSaranMasukan || '-'}</p>
                  </div>
                </div>

                {/* Lembar Coaching TIRTA */}
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    Dialog Reflektif Alur TIRTA (Tujuan, Realitas, Opsi, Komitmen):
                  </p>
                  <table className="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-2 py-1 w-20 text-left">Tahap</th>
                        <th className="border border-slate-300 px-2 py-1 w-48 text-left">Pertanyaan Pemantik</th>
                        <th className="border border-slate-300 px-2 py-1 text-left">Catatan Guru</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1.5 font-bold text-indigo-950 bg-slate-50">Tujuan</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-700 italic">Pengalaman belajar seperti apa yang ingin diciptakan untuk murid?</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{sambung.maknai.coaching?.tujuan || autoMaknai.coaching?.tujuan || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1.5 font-bold text-indigo-950 bg-slate-50">Realitas</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-700 italic">Apa yang sudah berjalan baik? Bagaimana kita tahu murid benar-benar belajar?</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{sambung.maknai.coaching?.realitas || autoMaknai.coaching?.realitas || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1.5 font-bold text-indigo-950 bg-slate-50">Opsi</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-700 italic">Apa yang membuat pembelajaran bermakna bagi murid? Apa yang bisa dicoba?</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{sambung.maknai.coaching?.opsi || autoMaknai.coaching?.opsi || '-'}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1.5 font-bold text-indigo-950 bg-slate-50">Komitmen</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-700 italic">Langkah kecil apa yang akan dicoba? Dukungan apa yang dibutuhkan? Kapan kita tinjau?</td>
                        <td className="border border-slate-300 px-2 py-1.5 text-slate-800">{sambung.maknai.coaching?.komitmen || autoMaknai.coaching?.komitmen || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tanda Tangan */}
                <div className="grid grid-cols-3 text-center text-xs pt-3 border-t border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-700 mb-12">Pengawas Pembina,</p>
                    <p className="font-bold underline text-slate-900">Kusnandar, M.Si</p>
                    <p className="text-[10px] text-slate-500">NIP. 19680315 199412 1 002</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-12">Kepala Sekolah,</p>
                    <p className="font-bold underline text-slate-900">{sambung.arahkan?.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}</p>
                    <p className="text-[10px] text-slate-500">{supervision.schoolName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-12">Guru Mata Pelajaran,</p>
                    <p className="font-bold underline text-slate-900">{supervision.teacherName}</p>
                    <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* B — TELAAH PERENCANAAN PEMBELAJARAN (BERDAYAKAN) */}
          {(() => {
            const autoBer = generateBerdayakanTelaahPerbaikanData(supervision);
            const ber = sambung.berdayakan || autoBer;
            const scores: Record<number, number | 'NA'> = ber.telaahScores || autoBer.telaahScores || {};
            const comments: Record<number, string> = ber.telaahComments || autoBer.telaahComments || {};
            const feedback = {
              kelebihan: ber.feedback?.kelebihan || autoBer.feedback?.kelebihan || '',
              perbaikan: ber.feedback?.perbaikan || autoBer.feedback?.perbaikan || '',
              rekomendasi: ber.feedback?.rekomendasi || autoBer.feedback?.rekomendasi || '',
            };

            let totalSkor = 0;
            let maxSkor = 0;
            TELAAH_ITEMS.forEach((item) => {
              const val = scores[item.id];
              if (val !== 'NA' && val !== undefined) {
                totalSkor += Number(val);
                maxSkor += 2;
              }
            });
            const finalScore = maxSkor > 0 ? parseFloat(((totalSkor / maxSkor) * 100).toFixed(1)) : 100;
            let predikat = 'Sangat Baik';
            let deskripsi = 'Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.';
            if (finalScore >= 86) {
              predikat = 'Sangat Baik';
              deskripsi = 'Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.';
            } else if (finalScore >= 76) {
              predikat = 'Baik';
              deskripsi = 'Perencanaan pembelajaran telah memenuhi sebagian besar kriteria, namun masih terdapat beberapa komponen yang perlu diperkuat agar lebih utuh dan selaras.';
            } else if (finalScore >= 66) {
              predikat = 'Cukup';
              deskripsi = 'Perencanaan pembelajaran telah memiliki komponen dasar, tetapi beberapa aspek penting belum terpenuhi secara optimal, terutama aspek keselarasan, pengalaman belajar, atau asesmen.';
            } else {
              predikat = 'Perlu Perbaikan';
              deskripsi = 'Perencanaan pembelajaran belum memenuhi sejumlah kriteria penting dan memerlukan penguatan pada komponen dasar maupun keterkaitan antarkomponen.';
            }

            return (
              <div className="page-break-after">
                <div className="flex items-center gap-3 mb-3 bg-amber-900 text-white p-2.5 rounded-lg mt-8">
                  <span className="w-7 h-7 rounded-md bg-white text-amber-900 font-extrabold flex items-center justify-center text-sm">
                    B
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">TELAAH PERENCANAAN PEMBELAJARAN (RPP PERBAIKAN)</h3>
                    <p className="text-[10px] text-amber-200">
                      BERDAYAKAN — Input RPP Perbaikan, telaah kembali secara otomatis (22 Aspek Telaah Perencanaan Pembelajaran)
                    </p>
                  </div>
                </div>

                {/* IDENTITAS (Halaman 1 PDF) */}
                <div className="border border-slate-300 p-3 rounded-lg text-[11px] mb-3 bg-slate-50 space-y-1">
                  <p className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">Identitas Perencanaan Pembelajaran</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <p><strong>Nama Guru :</strong> {supervision.teacherName}</p>
                    <p><strong>Mata Pelajaran :</strong> {supervision.subject}</p>
                    <p><strong>Kelas / Fase :</strong> {supervision.classGrade}</p>
                    <p><strong>Sekolah :</strong> {supervision.schoolName}</p>
                    <p className="col-span-2"><strong>Judul Rencana Pembelajaran :</strong> {ber.rppPerbaikanTitle || autoBer.rppPerbaikanTitle}</p>
                    <p><strong>Tanggal Telaah :</strong> {ber.tanggalTelaah || new Date().toISOString().split('T')[0]}</p>
                    <p><strong>Nama Penelaah :</strong> {ber.namaPenelaah || 'Kusnandar, M.Si'}</p>
                    {ber.rppPerbaikanUrl && (
                      <p className="col-span-2 text-indigo-700 truncate">
                        <strong>Tautan Berkas RPP (Drive) :</strong> {ber.rppPerbaikanUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* TABEL 22 ASPEK (Halaman 2-6 PDF) */}
                <table className="w-full border-collapse border border-slate-300 text-[10px] mb-3">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                      <th className="border border-slate-300 px-1 py-1.5 w-6" rowSpan={2}>No</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left" rowSpan={2}>Aspek yang diamati</th>
                      <th className="border border-slate-300 px-1 py-1" colSpan={4}>Skala</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left w-56" rowSpan={2}>Komentar Kritis</th>
                    </tr>
                    <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                      <th className="border border-slate-300 px-1 py-0.5 w-5">0</th>
                      <th className="border border-slate-300 px-1 py-0.5 w-5">1</th>
                      <th className="border border-slate-300 px-1 py-0.5 w-5">2</th>
                      <th className="border border-slate-300 px-1 py-0.5 w-7">N/A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TELAAH_ITEMS.map((item) => {
                      const val = scores[item.id] !== undefined ? scores[item.id] : 2;
                      const cmt = comments[item.id] || (autoBer.telaahComments ? autoBer.telaahComments[item.id] : '') || '-';
                      return (
                        <tr key={item.id}>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold">{item.id}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-800">
                            <span className="font-bold block text-[9px] text-amber-800 uppercase">{item.category}</span>
                            {item.aspect}
                          </td>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-700">
                            {val === 0 ? '✓' : ''}
                          </td>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-700">
                            {val === 1 ? '✓' : ''}
                          </td>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold text-emerald-700 bg-emerald-50/40">
                            {val === 2 ? '✓' : ''}
                          </td>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-700">
                            {val === 'NA' ? '✓' : ''}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-800 text-[9.5px] leading-tight">
                            {cmt}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={2} className="border border-slate-300 px-2 py-1.5 text-right uppercase">
                        Total Skor:
                      </td>
                      <td colSpan={4} className="border border-slate-300 px-2 py-1.5 text-center font-extrabold text-amber-800">
                        {totalSkor} / {maxSkor}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-slate-700 text-[10px]">
                        Skor Maksimal: {maxSkor} Poin
                      </td>
                    </tr>
                    <tr className="bg-amber-50 font-bold">
                      <td colSpan={2} className="border border-slate-300 px-2 py-1.5 text-right uppercase text-amber-900">
                        Nilai Akhir dan Predikat:
                      </td>
                      <td colSpan={4} className="border border-slate-300 px-2 py-1.5 text-center font-extrabold text-emerald-800 text-xs">
                        {finalScore.toFixed(1)}%
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-emerald-800 font-extrabold uppercase">
                        {predikat}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* DESKRIPSI KATEGORI (Halaman 8 PDF) */}
                <div className="border border-slate-300 p-2.5 rounded-lg text-[10px] mb-3 bg-white">
                  <p><strong>Deskripsi Hasil Telaah :</strong> &ldquo;{deskripsi}&rdquo;</p>
                </div>

                {/* UMPAN BALIK PERENCANAAN PEMBELAJARAN (Halaman 7 PDF) */}
                <div className="border border-slate-300 p-3 rounded-lg text-[10px] mb-3 bg-slate-50 space-y-2">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Umpan Balik Perencanaan Pembelajaran
                  </p>
                  <div>
                    <p className="font-semibold text-slate-800">1. Tuliskan kelebihan Perencanaan Pembelajaran:</p>
                    <p className="text-slate-700 italic pl-3 pt-0.5">{feedback.kelebihan}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">2. Tuliskan hal yang perlu ditingkatkan dari Perencanaan Pembelajaran:</p>
                    <p className="text-slate-700 italic pl-3 pt-0.5">{feedback.perbaikan}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">3. Tuliskan rekomendasi dan lanjutkan dengan revisi perencanaan pembelajaran sesuai prinsip Pembelajaran Mendalam:</p>
                    <p className="text-slate-700 italic pl-3 pt-0.5">{feedback.rekomendasi}</p>
                  </div>
                </div>

                {/* KETENTUAN SKOR (Halaman 7 PDF) */}
                <table className="w-full border-collapse border border-slate-300 text-[9px] mb-3">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <th className="border border-slate-300 px-2 py-1 w-10 text-center">Skor</th>
                      <th className="border border-slate-300 px-2 py-1 w-44">Keterangan</th>
                      <th className="border border-slate-300 px-2 py-1">Kriteria Umum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-2 py-1 text-center font-bold">2</td>
                      <td className="border border-slate-300 px-2 py-1 font-semibold">Terpenuhi secara optimal</td>
                      <td className="border border-slate-300 px-2 py-1">Indikator tersedia, lengkap, jelas, relevan, dan selaras dengan perencanaan pembelajaran.</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-2 py-1 text-center font-bold">1</td>
                      <td className="border border-slate-300 px-2 py-1 font-semibold">Terpenuhi sebagian / belum optimal</td>
                      <td className="border border-slate-300 px-2 py-1">Indikator sudah ada, tetapi belum lengkap, belum jelas, belum konsisten, atau belum sepenuhnya selaras.</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-2 py-1 text-center font-bold">0</td>
                      <td className="border border-slate-300 px-2 py-1 font-semibold">Belum terpenuhi</td>
                      <td className="border border-slate-300 px-2 py-1">Indikator belum ada, belum tergambar, atau tidak sesuai dengan yang dipersyaratkan.</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-2 py-1 text-center font-bold">N/A</td>
                      <td className="border border-slate-300 px-2 py-1 font-semibold">Tidak relevan</td>
                      <td className="border border-slate-300 px-2 py-1">Tidak menuliskan di RPP karena opsional dan tidak diperhitungkan dalam skor.</td>
                    </tr>
                  </tbody>
                </table>

                {/* SIKLUS BERDAYAKAN (LEMBAR RANCANG-COBA-REFLEKSI-PERBAIKI) */}
                <div className="mb-4">
                  <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1.5">
                    Lembar Rancang &ndash; Coba &ndash; Refleksi &ndash; Perbaiki (Siklus Implementasi Kelas)
                  </p>
                  <table className="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-2 py-1.5 w-16 text-center">Siklus</th>
                        <th className="border border-slate-300 px-2 py-1.5 text-left">Rancangan dan hasil uji coba pada murid</th>
                        <th className="border border-slate-300 px-2 py-1.5 text-left">Refleksi (berhasil / belum, mengapa)</th>
                        <th className="border border-slate-300 px-2 py-1.5 text-left">Perbaikan berikutnya</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ber.siklusList.map((item) => (
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

                {/* Tanda Tangan Penelaah & Guru */}
                <div className="grid grid-cols-2 gap-8 text-[11px] pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Guru Yang Ditelaah,</p>
                    <p className="font-bold underline">{supervision.teacherName}</p>
                    <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Penelaah / Pengawas Pembina,</p>
                    <p className="font-bold underline">{ber.namaPenelaah || 'Kusnandar, M.Si'}</p>
                    <p className="text-[10px] text-slate-500">NIP. 196805121994121001</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAHAP U • INSTRUMEN RESMI WAWANCARA PRA-OBSERVASI PERBAIKAN */}
          {/* ========================================================= */}
          {(() => {
            const autoUji = generateUjiData(supervision);
            const pra = sambung.uji?.praObservasi || autoUji.praObservasi;
            if (!pra) return null;

            return (
              <div className="page-break-after">
                <div className="flex items-center gap-3 mb-3 bg-purple-900 text-white p-2.5 rounded-lg">
                  <span className="w-7 h-7 rounded-md bg-white text-purple-900 font-extrabold flex items-center justify-center text-sm">
                    U
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">Wawancara Pra-Observasi Pembelajaran Perbaikan</h3>
                    <p className="text-[10px] text-purple-200">UJI &bull; Instrumen Resmi Pengawas Pembina Kusnandar, M.Si (8 Butir Pertanyaan)</p>
                  </div>
                </div>

                <div className="text-xs mb-3 space-y-0.5 grid grid-cols-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p><strong>Sekolah / Guru :</strong> {supervision.schoolName} / {supervision.teacherName}</p>
                  <p><strong>Mata Pelajaran / Kelas :</strong> {supervision.subject} / {supervision.classGrade}</p>
                  <p><strong>Fokus Pembinaan :</strong> Implementasi Modul Ajar Revisi &amp; Student Agency</p>
                  <p><strong>Pengawas Pembina :</strong> Kusnandar, M.Si</p>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px] mb-3">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                      <th className="border border-slate-300 px-2 py-1.5 w-64 text-left">Pertanyaan Wawancara Pra-Observasi</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Tanggapan / Jawaban Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRA_OBSERVASI_QUESTIONS.map((q, idx) => {
                      const qKey = q.id as keyof typeof pra;
                      const ans = (pra[qKey] as string) || (autoUji.praObservasi?.[qKey] as string) || '-';

                      return (
                        <tr key={q.id}>
                          <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-300 px-2 py-1.5 font-semibold text-slate-800 bg-slate-50/50">{q.label}</td>
                          <td className="border border-slate-300 px-2 py-1.5 text-slate-900">{ans}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="p-2.5 border border-slate-300 rounded bg-slate-50 text-xs mb-3">
                  <p className="font-bold text-slate-800 mb-1">Catatan Kesepakatan &amp; Pengamatan Pengawas:</p>
                  <p className="text-slate-700 italic">{pra.supervisorNotes || autoUji.praObservasi?.supervisorNotes || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs pt-2">
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Guru Yang Diobservasi,</p>
                    <p className="font-bold underline">{supervision.teacherName}</p>
                    <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Pengawas Pembina,</p>
                    <p className="font-bold underline">Kusnandar, M.Si</p>
                    <p className="text-[10px] text-slate-500">NIP. 196805121994121001</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAHAP U • INSTRUMEN RESMI OBSERVASI KELAS (25 ASPEK) */}
          {/* ========================================================= */}
          {(() => {
            const autoUji = generateUjiData(supervision);
            const obs = sambung.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
            if (!obs) return null;

            return (
              <div className="page-break-after">
                <div className="flex items-center gap-3 mb-3 bg-emerald-900 text-white p-2.5 rounded-lg">
                  <span className="w-7 h-7 rounded-md bg-white text-emerald-900 font-extrabold flex items-center justify-center text-sm">
                    U
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">Observasi Pelaksanaan Pembelajaran Perbaikan</h3>
                    <p className="text-[10px] text-emerald-200">UJI &bull; Instrumen Resmi Pengawas Pembina Kusnandar, M.Si (25 Butir / 9 Kategori)</p>
                  </div>
                </div>

                <div className="text-xs mb-2 space-y-0.5 grid grid-cols-3 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p><strong>Sekolah / Guru :</strong> {supervision.schoolName} / {supervision.teacherName}</p>
                  <p><strong>Mata Pelajaran :</strong> {supervision.subject} ({supervision.classGrade})</p>
                  <p><strong>Total Skor :</strong> {obs.totalSkor} / 50 ({obs.persentaseCapaian}% &bull; {obs.predicate})</p>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[10px] mb-3">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold text-center">
                      <th className="border border-slate-300 px-1 py-1 w-6">No</th>
                      <th className="border border-slate-300 px-2 py-1 text-left">Aspek Pembelajaran (9 Kategori)</th>
                      <th className="border border-slate-300 px-1.5 py-1 w-12">Terlaksana</th>
                      <th className="border border-slate-300 px-1.5 py-1 w-12">Skor (0-2)</th>
                      <th className="border border-slate-300 px-2 py-1 text-left w-52">Catatan Bukti Pengamatan di Kelas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OBSERVASI_ITEMS.map((item) => {
                      const itemState = obs.items?.[item.id] || autoUji.observasiPelaksanaan?.items?.[item.id] || { score: 2, note: '' };
                      const sc = itemState.score !== undefined ? itemState.score : 2;

                      return (
                        <tr key={item.id}>
                          <td className="border border-slate-300 px-1 py-1 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="border border-slate-300 px-2 py-1">
                            <span className="text-[9px] text-purple-700 font-bold block uppercase">{item.category}</span>
                            <span>{item.aspect}</span>
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 text-center font-bold text-emerald-700">
                            {sc >= 1 ? 'Ya' : 'Tidak'}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 text-center font-extrabold">
                            {sc}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700">{itemState.note || '-'}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={3} className="border border-slate-300 px-2 py-1.5 text-right">
                        Total Skor Capaian (Maks 50):
                      </td>
                      <td className="border border-slate-300 px-1.5 py-1.5 text-center text-xs text-emerald-800">
                        {obs.totalSkor}
                      </td>
                      <td className="border border-slate-300 px-2 py-1.5 text-xs text-emerald-900">
                        Capaian: {obs.persentaseCapaian}% &bull; Predikat: {obs.predicate}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* 3-Point Feedback */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="font-bold text-emerald-800 mb-0.5">1. Kelebihan yang Diamati:</p>
                    <p className="text-[10px] text-slate-700 leading-snug">{obs.feedback?.kelebihan || '-'}</p>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="font-bold text-amber-800 mb-0.5">2. Aspek Perlu Peningkatan:</p>
                    <p className="text-[10px] text-slate-700 leading-snug">{obs.feedback?.perbaikan || '-'}</p>
                  </div>
                  <div className="p-2 border border-slate-200 rounded bg-slate-50">
                    <p className="font-bold text-indigo-800 mb-0.5">3. Rekomendasi Tindak Lanjut:</p>
                    <p className="text-[10px] text-slate-700 leading-snug">{obs.feedback?.rekomendasi || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs pt-1">
                  <div className="text-center">
                    <p className="text-slate-500 mb-10">Guru Yang Diobservasi,</p>
                    <p className="font-bold underline">{supervision.teacherName}</p>
                    <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-10">Pengawas Pembina,</p>
                    <p className="font-bold underline">Kusnandar, M.Si</p>
                    <p className="text-[10px] text-slate-500">NIP. 196805121994121001</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* TAHAP U • INSTRUMEN RESMI PASCA-OBSERVASI & REFLEKSI */}
          {/* ========================================================= */}
          {(() => {
            const autoUji = generateUjiData(supervision);
            const pasca = sambung.uji?.pascaObservasi || autoUji.pascaObservasi;
            if (!pasca) return null;

            return (
              <div className="page-break-after">
                <div className="flex items-center gap-3 mb-3 bg-indigo-900 text-white p-2.5 rounded-lg">
                  <span className="w-7 h-7 rounded-md bg-white text-indigo-900 font-extrabold flex items-center justify-center text-sm">
                    U
                  </span>
                  <div>
                    <h3 className="font-bold text-sm">Evaluasi &amp; Refleksi Pasca-Observasi Perbaikan</h3>
                    <p className="text-[10px] text-indigo-200">UJI &bull; Dialog Coaching Alur TIRTA &amp; Komitmen Tindak Lanjut</p>
                  </div>
                </div>

                <div className="text-xs mb-3 space-y-0.5 grid grid-cols-2 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <p><strong>Sekolah / Guru :</strong> {supervision.schoolName} / {supervision.teacherName}</p>
                  <p><strong>Mata Pelajaran / Kelas :</strong> {supervision.subject} / {supervision.classGrade}</p>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px] mb-3">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                      <th className="border border-slate-300 px-2 py-1.5 w-64 text-left">Pertanyaan Dialog Pasca-Observasi</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Refleksi Guru &amp; Catatan Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PASCA_OBSERVASI_QUESTIONS.map((q, idx) => {
                      const qKey = q.id as keyof typeof pasca.pertanyaanList;
                      const ans = pasca.pertanyaanList?.[qKey] || autoUji.pascaObservasi?.pertanyaanList?.[qKey] || '-';

                      return (
                        <tr key={q.id}>
                          <td className="border border-slate-300 px-2 py-1.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-300 px-2 py-1.5 font-semibold text-slate-800 bg-slate-50/50">{q.label}</td>
                          <td className="border border-slate-300 px-2 py-1.5 text-slate-900">{ans}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <p className="font-bold text-slate-800 mb-1">Kesan Umum Guru:</p>
                    <p className="text-slate-700 text-[11px] italic leading-relaxed">{pasca.kesanUmum || '-'}</p>
                  </div>
                  <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <p className="font-bold text-slate-800 mb-1">Rekomendasi Diseminasi Pengawas (Kusnandar, M.Si):</p>
                    <p className="text-slate-700 text-[11px] italic leading-relaxed">{pasca.saranMasukan || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-xs pt-2">
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Guru Yang Diobservasi,</p>
                    <p className="font-bold underline">{supervision.teacherName}</p>
                    <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-500 mb-12">Pengawas Pembina,</p>
                    <p className="font-bold underline">Kusnandar, M.Si</p>
                    <p className="text-[10px] text-slate-500">NIP. 196805121994121001</p>
                  </div>
                </div>
              </div>
            );
          })()}

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

            {/* Tabel Kesimpulan Uji: Indikator dan Uji */}
            <div className="mt-3 pt-3 border-t border-slate-300">
              <h4 className="font-bold text-xs text-slate-900 mb-1">
                Kesimpulan Hasil Uji: Tabel Indikator dan Uji (Kondisi Setelah Perbaikan / Hasil Uji Coba)
              </h4>
              <p className="text-[10px] text-slate-600 mb-2">
                Rangkuman 4 indikator kunci kondisi setelah perbaikan guru dari hasil telaah modul revisi, observasi tatap muka verifikasi, angket suara murid (U-2), dan pasca-observasi.
              </p>
              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-60 text-left">Indikator Pembelajaran</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-left">Kesimpulan Uji (Kondisi Setelah Perbaikan)</th>
                    <th className="border border-slate-300 px-2 py-1.5 w-44 text-center">Status Pembuktian Uji</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">1</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Guru berorientasi pada pengalaman belajar murid
                      <span className="block text-[9px] text-indigo-700 font-normal">Aspek: Peran Guru</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium">
                      {sambung.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-emerald-800 font-bold text-[10px] bg-emerald-50/40">
                      Terverifikasi Uji Lapangan
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">2</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Murid aktif mengaplikasikan pengetahuan
                      <span className="block text-[9px] text-purple-700 font-normal">Aspek: Aktivitas Murid</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium">
                      {sambung.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-emerald-800 font-bold text-[10px] bg-emerald-50/40">
                      Terverifikasi Uji Lapangan
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">3</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Pembelajaran terhubung dengan konteks kehidupan nyata murid
                      <span className="block text-[9px] text-amber-700 font-normal">Aspek: Konteks Nyata</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium">
                      {sambung.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-emerald-800 font-bold text-[10px] bg-emerald-50/40">
                      Terverifikasi Uji Lapangan
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">4</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-900 bg-slate-50/50">
                      Refleksi menjadi bagian rutin dalam proses pembelajaran
                      <span className="block text-[9px] text-blue-700 font-normal">Aspek: Refleksi Murid</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-800 font-medium">
                      {sambung.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center text-emerald-800 font-bold text-[10px] bg-emerald-50/40">
                      Terverifikasi Uji Lapangan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

            <h4 className="font-bold text-xs text-slate-800 mb-1">
              1. Tabel Kesimpulan Nyatakan: Indikator, Selidiki (Before) dan Uji (After)
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-[11px] mb-4">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="border border-slate-300 px-2 py-1.5 w-8 text-center">No</th>
                  <th className="border border-slate-300 px-2 py-1.5 w-48 text-left">Indikator Pembelajaran</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Selidiki (Before)</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left">Uji (After)</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left w-48">Arah Transformasi yang Terlihat</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">1</td>
                  <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800 bg-slate-50/40">
                    Guru berorientasi pada pengalaman belajar murid
                    <span className="block text-[9px] text-indigo-700 font-normal">Aspek: Peran Guru</span>
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {sambung.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-900 font-medium">
                    {sambung.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-indigo-900 text-[10px]">
                    Dari ceramah materi menuju perancang pengalaman belajar aktif murid
                  </td>
                </tr>
                {/* Row 2 */}
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">2</td>
                  <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800 bg-slate-50/40">
                    Murid aktif mengaplikasikan pengetahuan
                    <span className="block text-[9px] text-purple-700 font-normal">Aspek: Aktivitas Murid</span>
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {sambung.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-900 font-medium">
                    {sambung.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-purple-900 text-[10px]">
                    Dari penerima pasif menuju aktif mengaplikasikan pengetahuan
                  </td>
                </tr>
                {/* Row 3 */}
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">3</td>
                  <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800 bg-slate-50/40">
                    Pembelajaran terhubung dengan konteks kehidupan nyata murid
                    <span className="block text-[9px] text-amber-700 font-normal">Aspek: Konteks Nyata</span>
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {sambung.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-900 font-medium">
                    {sambung.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-amber-900 text-[10px]">
                    Dari belum konsisten menjadi mulai dirancang terhubung situasi riil
                  </td>
                </tr>
                {/* Row 4 */}
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">4</td>
                  <td className="border border-slate-300 px-2 py-1.5 font-bold text-slate-800 bg-slate-50/40">
                    Refleksi menjadi bagian rutin dalam proses pembelajaran
                    <span className="block text-[9px] text-blue-700 font-normal">Aspek: Refleksi Murid</span>
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {sambung.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-900 font-medium">
                    {sambung.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-blue-900 text-[10px]">
                    Dari belum rutin menjadi bagian integral pembelajaran harian
                  </td>
                </tr>
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

          {/* G — GERAKKAN: RENCANA TINDAK LANJUT DARI HASIL NYATAKAN & PENGIMBASAN */}
          <div className="page-break-after">
            {(() => {
              const defaultGerakkan = generateGerakkanData(supervision);
              const effectiveRtl = (sambung.gerakkan.rtlNyatakan && sambung.gerakkan.rtlNyatakan.length > 0)
                ? sambung.gerakkan.rtlNyatakan
                : defaultGerakkan.rtlNyatakan;
              const effectiveAlur = sambung.gerakkan.kesimpulanAlurSambung || defaultGerakkan.kesimpulanAlurSambung;

              return (
                <div>
                  <div className="flex items-center gap-3 mb-3 bg-cyan-900 text-white p-2.5 rounded-lg">
                    <span className="w-7 h-7 rounded-md bg-white text-cyan-900 font-extrabold flex items-center justify-center text-sm">
                      G
                    </span>
                    <div>
                      <h3 className="font-bold text-sm">
                        GERAKKAN: Rencana Tindak Lanjut dari Hasil Nyatakan &amp; Kesimpulan
                      </h3>
                      <p className="text-[10px] text-cyan-200">
                        Sesuai Instrumen Resmi Pengawas Pembina Kusnandar, M.Si &bull; Menghubungkan Selidiki, Amati, Maknai, Berdayakan, Uji, dan Nyatakan
                      </p>
                    </div>
                  </div>

                  {/* 1. MATRIKS KETERHUBUNGAN ALUR SAMBUNG */}
                  <h4 className="font-bold text-xs text-slate-800 mb-1">
                    1. Matriks Keterhubungan Alur Supervisi SAMBUNG (Selidiki s.d. Gerakkan)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-2 py-1 text-center w-8">Tahap</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-28">Nama Tahap</th>
                        <th className="border border-slate-300 px-2 py-1 text-left">Fokus Keterhubungan &amp; Bukti Terverifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-indigo-700 bg-indigo-50/40">S</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Selidiki (Baseline)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.selidikiBaseline}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-blue-700 bg-blue-50/40">A</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Amati (Fokus Awal)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.amatiObservasi}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-emerald-700 bg-emerald-50/40">M</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Maknai (Coaching)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.maknaiCoaching}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-amber-700 bg-amber-50/40">B</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Berdayakan (Modul)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.berdayakanModul}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-purple-700 bg-purple-50/40">U</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Uji (Lapangan 25 Aspek)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.ujiPembuktian}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-rose-700 bg-rose-50/40">N</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Nyatakan (Data Dampak)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">{effectiveAlur.nyatakanDampak}</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold text-cyan-800 bg-cyan-50/60">G</td>
                        <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900">Gerakkan (RTL Nyatakan)</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-900 font-medium bg-cyan-50/20">{effectiveAlur.gerakkanKomitmen}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 2. TABEL RENCANA TINDAK LANJUT BERDASARKAN HASIL NYATAKAN */}
                  <h4 className="font-bold text-xs text-slate-800 mb-1">
                    2. Tabel Rencana Tindak Lanjut Berdasarkan Hasil Nyatakan &amp; Kesimpulan (5 Indikator Transformasi)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-1.5 py-1 text-center w-7">No</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-36">Fokus Transformasi</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-48">Rangkuman Hasil Nyatakan &amp; Uji</th>
                        <th className="border border-slate-300 px-2 py-1 text-left">Rencana Tindak Lanjut Konkret (Guru)</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-32">Mitra &amp; Sasaran</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-24">Waktu &amp; Bukti</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-40">Rekomendasi Supervisi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveRtl.map((item, idx) => (
                        <tr key={item.id || idx} className="align-top">
                          <td className="border border-slate-300 px-1.5 py-1 text-center font-semibold">{idx + 1}</td>
                          <td className="border border-slate-300 px-2 py-1 font-bold text-slate-900 bg-slate-50/40">
                            {item.indikator}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700 bg-cyan-50/15 leading-snug">
                            {item.hasilNyatakan}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 font-medium text-slate-900 whitespace-pre-line leading-snug">
                            {item.rencanaTindakLanjut}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700 leading-snug">
                            {item.mitraKolaborasi}
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700 leading-snug">
                            <span className="font-semibold block">{item.waktuPelaksanaan}</span>
                            <span className="text-[9px] text-slate-500 italic mt-0.5 block">{item.buktiKeberhasilan}</span>
                          </td>
                          <td className="border border-slate-300 px-2 py-1 text-amber-950 bg-amber-50/20 leading-snug">
                            {item.rekomendasiSupervisi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 3. TINDAK LANJUT TEMUAN SUPERVISI LAPANGAN */}
                  <h4 className="font-bold text-xs text-slate-800 mb-1">
                    3. Rencana Tindak Lanjut Temuan Observasi Lapangan
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-4">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-1.5 py-1 w-7 text-center">No</th>
                        <th className="border border-slate-300 px-2 py-1 text-left">Temuan Supervisi</th>
                        <th className="border border-slate-300 px-2 py-1 text-left">Aksi Tindak Lanjut</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-36">Penanggung Jawab</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-24">Waktu</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-44">Target Hasil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sambung.gerakkan.tindakLanjut.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="border border-slate-300 px-1.5 py-1 text-center font-semibold">{idx + 1}</td>
                          <td className="border border-slate-300 px-2 py-1 font-medium text-slate-900">{item.temuanSupervisi}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700">{item.tindakLanjut}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700">{item.penanggungJawab}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.waktu}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-800 font-medium">{item.hasil}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 4. DISEMINASI & PENGIMBASAN PRAKTIK BAIK */}
                  <h4 className="font-bold text-xs text-slate-800 mb-1">
                    4. Diseminasi &amp; Pengimbasan Praktik Baik di Komunitas Belajar
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10px] mb-6">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold">
                        <th className="border border-slate-300 px-2 py-1 text-left">Praktik Baik yang Diimbaskan</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-52">Sasaran Komunitas</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-52">Bentuk Diseminasi</th>
                        <th className="border border-slate-300 px-2 py-1 text-left w-32">Linimasa Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sambung.gerakkan.pengimbasan.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="border border-slate-300 px-2 py-1 font-semibold text-slate-900">{item.praktikBaik}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700">{item.sasaran}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-700">{item.bentuk}</td>
                          <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.waktu}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* CATATAN PENGESAHAN PENGUATAN SUPERVISOR */}
                  <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg mb-6 text-[10px]">
                    <strong className="text-slate-900 block mb-0.5">Catatan Resmi Pengawas Pembina Kusnandar, M.Si:</strong>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{effectiveAlur.catatanPengawas}"
                    </p>
                  </div>

                  {/* PENGESAHAN TRIPARTIT AKHIR */}
                  <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <p className="text-slate-600 mb-14">Guru Mata Pelajaran,<br/>(Pihak I Komitmen RTL)</p>
                      <p className="font-bold underline text-slate-900">{supervision.teacherName}</p>
                      <p className="text-[10px] text-slate-500">NIP. {supervision.teacherNip || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-14">Mengetahui,<br/>Kepala Sekolah {supervision.schoolName}</p>
                      <p className="font-bold underline text-slate-900">Kepala {supervision.schoolName}</p>
                      <p className="text-[10px] text-slate-500">NIP. 19700101 199503 1 002</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-14">Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Pengawas Sekolah Pembina SMA,</p>
                      <p className="font-bold underline text-slate-900">Kusnandar, M.Si</p>
                      <p className="text-[10px] text-slate-500">Pengawas Pembina Disdik Prov. Jawa Barat</p>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-[9px] text-slate-400 print:text-slate-500">
                    Dokumen Portofolio Resmi Strategi SAMBUNG (Tahap G - Gerakkan) &bull; Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA &bull; Pengawas Kusnandar, M.Si
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
};
