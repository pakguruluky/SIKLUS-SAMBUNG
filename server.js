// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/server/db.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// src/data/sambungSeed.ts
var ASPEK_SELIDIKI_DEFAULT = [
  "Tujuan dan kesadaran murid tentang belajar",
  "Konteks kehidupan nyata",
  "Aktivitas memahami dan mengaplikasikan",
  "Aktivitas merefleksikan dan menghubungkan",
  "Suasana menggembirakan",
  "Asesmen dan tindak lanjut"
];
var INDIKATOR_U1_DEFAULT = [
  { id: 1, indikator: "Murid memahami tujuan dan manfaat pembelajaran", dimensi: "Berkesadaran" },
  { id: 2, indikator: "Murid menyadari proses dan kemajuan belajarnya", dimensi: "Berkesadaran" },
  { id: 3, indikator: "Pembelajaran dikaitkan dengan pengalaman murid", dimensi: "Bermakna" },
  { id: 4, indikator: "Guru memakai konteks kehidupan nyata yang relevan", dimensi: "Bermakna" },
  { id: 5, indikator: "Suasana aman, positif; murid antusias dan berani mencoba", dimensi: "Menggembirakan" },
  { id: 6, indikator: "Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri", dimensi: "Memahami" },
  { id: 7, indikator: "Murid menerapkan pengetahuan pada tugas/masalah nyata", dimensi: "Mengaplikasikan" },
  { id: 8, indikator: "Murid diberi waktu merefleksikan dan memakai umpan balik", dimensi: "Merefleksikan" },
  { id: 9, indikator: "Murid menghubungkan pengetahuan dengan kehidupan nyata", dimensi: "Menghubungkan" },
  { id: 10, indikator: "Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut", dimensi: "Asesmen & tindak lanjut" }
];
var PERNYATAAN_U2_DEFAULT = [
  "Saya memahami tujuan dan manfaat pelajaran ini.",
  "Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.",
  "Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.",
  "Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.",
  "Saya merasa aman, senang, dan bersemangat selama pelajaran."
];
var DEFAULT_MATRIKS_BEFORE = {
  peranGuru: "Berfokus pada penyampaian materi (transfer pengetahuan satu arah secara klasikal/ceramah).",
  aktivitasMurid: "Lebih banyak menerima secara pasif, mendengarkan, mencatat penjelasan, dan minim inisiatif mandiri.",
  konteksNyata: "Belum konsisten dikaitkan dengan kehidupan nyata; materi diajarkan sebatas konsep buku teks teoretis.",
  refleksiMurid: "Belum rutin dilaksanakan; pembelajaran berakhir tanpa penarikan makna atau evaluasi diri murid."
};
var DEFAULT_MATRIKS_AFTER = {
  peranGuru: "Merancang dan memfasilitasi pengalaman belajar murid, berperan sebagai coach dan pemandu inkuiri.",
  aktivitasMurid: "Lebih aktif mengaplikasikan pengetahuan melalui studi kasus, penyelidikan kelompok, dan unjuk kerja.",
  konteksNyata: "Mulai dirancang secara terstruktur dan terhubung langsung dengan fenomena serta konteks nyata murid.",
  refleksiMurid: "Mulai menjadi bagian rutin pembelajaran; murid mengevaluasi proses pemahaman dan metakognisinya."
};
function getTeacherDescriptiveDataDampak(teacherName, subject = "", schoolName = "", lessonTitle = "", telaahPred = "", obsPred = "") {
  const name = teacherName.toLowerCase();
  if (name.includes("sondang")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "45%",
        akhir: "94%",
        selisih: "+49%",
        makna: "Pergeseran paradigma mengajar dari ceramah klasikal menuju fasilitasi inkuiri laboratorium berbantuan simulasi.",
        deskripsiPenilaian: "Berdasarkan hasil supervisi telaah modul (skor 97.7 / Sangat Baik) dan observasi kelas tatap muka (skor 100.0 / Sangat Baik), Ibu Sondang berhasil mengubah dominasi ceramah klasikal menjadi pendampingan inkuiri aktif. Guru memfasilitasi penyelidikan Hukum Kirchhoff berbantuan simulator interaktif PhET dan kit sirkuit tertutup, memberikan scaffolding diferensiasi terarah bagi setiap kelompok murid.",
        buktiKegiatan: "Modul Ajar Termodinamika & Kelistrikan, Lembar Telaah Pengawas No. 1-22, Foto Praktikum PhET"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "40%",
        akhir: "95%",
        selisih: "+55%",
        makna: "Kemandirian murid dalam menguji hukum fisika dan menganalisis data rangkaian secara saintifik.",
        deskripsiPenilaian: "Hasil observasi kelas mencatat seluruh kelompok (100% murid) terampil merakit rangkaian tertutup, mengukur kuat arus dan tegangan secara empiris, serta memvalidasi kesesuaian hukum Kirchhoff tanpa bergantung pada instruksi kaku guru. Murid berani berargumen ilmiah saat mempresentasikan temuan.",
        buktiKegiatan: "LKPD Penyelidikan Sirkuit DC, Lembar Ceklis Unjuk Kerja Murid, Video Presentasi Kelompok"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "50%",
        akhir: "95%",
        selisih: "+45%",
        makna: "Keterhubungan konsep hambatan dan arus listrik dengan instalasi dan efisiensi energi rumah tangga.",
        deskripsiPenilaian: "Sesuai rubrik telaah kontekstual kurikulum, guru secara cerdas mengaitkan analisis hambatan listrik dengan sistem proteksi sekring rumah tinggal, pencegahan korsleting listrik di pemukiman padat Bogor, dan pemanfaatan panel surya ramah lingkungan di lingkungan sekolah.",
        buktiKegiatan: "Bahan Tayang Studi Kasus Kelistrikan Rumah Tangga SMAN 4, Kliping Kasus Korsleting"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "30%",
        akhir: "88%",
        selisih: "+58%",
        makna: "Rutinitas refleksi metakognitif terstruktur di setiap penutupan pembelajaran fisika.",
        deskripsiPenilaian: "Berdasarkan instrumen U2 (suara murid), 88% murid secara konsisten mengisi lembar refleksi digital di akhir sesi. Murid mengidentifikasi konsep yang sudah dipahami, tantangan menghitung hambatan pengganti, dan merumuskan komitmen hemat daya listrik di rumah masing-masing.",
        buktiKegiatan: "Google Form Exit Ticket Refleksi & Rekap Tanggapan Angket U2 Suara Murid"
      }
    ];
  }
  if (name.includes("hilmia")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "42%",
        akhir: "88%",
        selisih: "+46%",
        makna: "Peningkatan peran guru dari penyampai teori menjadi fasilitator analisis dinamika pasar digital riil.",
        deskripsiPenilaian: "Berdasarkan supervisi telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Hilmia menunjukkan peningkatan nyata dalam memfasilitasi pembelajaran interaktif. Guru memandu analisis kurva penawaran dan permintaan melalui studi kasus digitalisasi pasar modern, memantik nalar kritis peserta didik.",
        buktiKegiatan: "Modul Ajar Ekonomi Fase E Revisi, Catatan Telaah Pengawas No. 8 & 12"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "45%",
        akhir: "89%",
        selisih: "+44%",
        makna: "Keaktifan kelompok murid dalam membedah fluktuasi harga dan simulasi mekanisme pasar.",
        deskripsiPenilaian: "Pada aspek pelibatan murid dalam observasi kelas, 23 dari 24 indikator terlaksana dengan sangat baik. Murid aktif menghitung koefisien elastisitas permintaan bahan pokok, membuat grafik pergeseran ekuilibrium harga, dan mempresentasikan rekomendasi stabilisasi harga secara berkelompok.",
        buktiKegiatan: "Lembar Diskusi Kasus Harga E-Commerce, Portofolio Grafik Ekuilibrium Murid"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "48%",
        akhir: "88%",
        selisih: "+40%",
        makna: "Kontekstualisasi materi pada inflasi harga pangan dan pola konsumsi daring di Kota Bogor.",
        deskripsiPenilaian: "Pembelajaran mengangkat isu riil kenaikan harga cabai dan minyak goreng di pasar tradisional Bogor menjelang hari raya serta tren belanja marketplace di kalangan remaja. Murid belajar membuat keputusan alokasi anggaran yang bijak dan rasional.",
        buktiKegiatan: "Artikel Berita Inflasi Daerah Bogor, Lembar Kerja Analisis Pasar Riil"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "32%",
        akhir: "82%",
        selisih: "+50%",
        makna: "Pembiasaan refleksi evaluatif mengenai perilaku belanja dan literasi keuangan pribadi.",
        deskripsiPenilaian: "Sesuai catatan pasca observasi pengawas, guru menyediakan alokasi waktu 10 menit di akhir kelas bagi murid untuk merefleksikan kebiasaan konsumsi pribadi. 82% murid mencatatkan kesadaran baru untuk membedakan antara kebutuhan primer dan keinginan impulsif dalam mengelola uang jajan.",
        buktiKegiatan: "Lembar Refleksi Diri 3-2-1 Pembelajaran Ekonomi, Log Refleksi U2"
      }
    ];
  }
  if (name.includes("mega")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "45%",
        akhir: "93%",
        selisih: "+48%",
        makna: "Perubahan pola mengajar dari menghafal tahun peristiwa menuju historical inquiry kritis.",
        deskripsiPenilaian: "Berdasarkan telaah modul ajar (skor 100.0 / Sangat Baik) dan observasi tatap muka (skor 100.0 / Sangat Baik), Ibu Mega Nur Alfira memfasilitasi penelusuran sejarah berbasis sumber primer otentik. Guru bertindak sebagai pemantik diskusi multiperspektif seputar peristiwa Proklamasi Kemerdekaan Bangsa.",
        buktiKegiatan: "Modul Ajar Historiografi Kritis, Rekaman Audio Pidato Proklamasi Bung Karno"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "40%",
        akhir: "92%",
        selisih: "+52%",
        makna: "Keterampilan murid membedah dokumen primer dan berargumentasi historis secara santun.",
        deskripsiPenilaian: "Seluruh 24 aspek observasi tatap muka terlaksana sempurna. Murid aktif membandingkan draf naskah proklamasi tulisan tangan Soekarno dengan naskah ketikan Sayuti Melik, mengidentifikasi perbedaan sudut pandang golongan tua dan muda secara kritis dan runtut.",
        buktiKegiatan: "Lembar Komparasi Dokumen Primer, Notulensi Debat Sejarah Terpimpin"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "52%",
        akhir: "94%",
        selisih: "+42%",
        makna: "Refleksi nilai perjuangan proklamasi dalam menjaga persatuan dan menyaring hoaks masa kini.",
        deskripsiPenilaian: "Guru sukses mengaitkan esensi diplomasi Rengasdengklok dengan pentingnya musyawarah kebangsaan di era digital. Murid diajak memaknai kemerdekaan sebagai tanggung jawab menjaga integritas dan daya kritis generasi muda terhadap disinformasi sejarah.",
        buktiKegiatan: "Infografis Nilai Kebangsaan Generasi Z di SMAN 2 Bogor, Hasil Analisis Berita"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "35%",
        akhir: "86%",
        selisih: "+51%",
        makna: "Pembiasaan metakognisi nilai integritas dan rasa syukur atas kemerdekaan bangsa.",
        deskripsiPenilaian: "Refleksi penutup mengungkap pemaknaan mendalam dari 86% murid tentang arti kemerdekaan hakiki. Murid merumuskan komitmen tindakan nyata mereka dalam menjaga toleransi, persatuan, dan prestasi di lingkungan sekolah SMAN 2 Bogor.",
        buktiKegiatan: "Papan Refleksi Kemerdekaan Digital, Buku Jurnal Sejarah Murid"
      }
    ];
  }
  if (name.includes("alline")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "44%",
        akhir: "91%",
        selisih: "+47%",
        makna: "Transformasi ke pembelajaran inkuiri berbasis simulasi laboratorium virtual kimia kinetika.",
        deskripsiPenilaian: "Berdasarkan telaah modul perangkat ajar (skor 100.0 / Sangat Baik) dan observasi kelas (skor 95.8 / Sangat Baik), Ibu Alline mengalihkan fokus pembelajaran dari sekadar transfer rumus reaksi menjadi penyelidikan berbasis laboratorium virtual interaktif.",
        buktiKegiatan: "Modul Ajar Kimia Fase F, Lembar Kerja Praktikum Virtual Kinetika"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "42%",
        akhir: "90%",
        selisih: "+48%",
        makna: "Murid aktif memanipulasi variabel konsentrasi dan suhu serta menganalisis grafik laju reaksi.",
        deskripsiPenilaian: "Pengamatan kelas mencatat keaktifan murid yang sangat dinamis. Setiap pasangan murid menguji pengaruh katalis terhadap laju reaksi secara real-time pada Chromebook, mencatat laju pembentukan produk, dan menarik kesimpulan matematis kurva kinetika.",
        buktiKegiatan: "Tabel Data Percobaan Virtual, Grafik Analisis Kinetika Reaksi Kimia"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "54%",
        akhir: "92%",
        selisih: "+38%",
        makna: "Relevansi teori tumbukan dengan proses pengawetan makanan dan pencegahan korosi di Bogor.",
        deskripsiPenilaian: "Materi dikaitkan langsung dengan prinsip pendinginan makanan di lemari es untuk memperlambat pembusukan serta bahaya kelembapan udara Kota Bogor terhadap laju perkaratan jembatan dan bangunan logam.",
        buktiKegiatan: "Bahan Diskusi Kontekstual Penerapan Katalis Industri & Pengawetan Pangan"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "33%",
        akhir: "84%",
        selisih: "+51%",
        makna: "Refleksi rutin terkait pemahaman mikroskopis partikel dan strategi belajar sains.",
        deskripsiPenilaian: "Sebanyak 84% murid secara rutin mencatat pemahaman konsep energi aktivasi dan mengevaluasi hambatan matematis yang mereka hadapi dalam menghitung orde reaksi pada jurnal sains digital.",
        buktiKegiatan: "Jurnal Belajar Sains Digital & Exit Ticket Refleksi Kimia"
      }
    ];
  }
  if (name.includes("kirana")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "46%",
        akhir: "93%",
        selisih: "+47%",
        makna: "Fasilitasi inkuiri sains astronomi dan pemodelan matematis gerak edar planet.",
        deskripsiPenilaian: "Berdasarkan telaah modul ajar (skor 97.7 / Sangat Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Kirana mendesain pembelajaran yang menumbuhkan nalar kritis dan kekaguman atas keteraturan semesta melalui pemodelan orbit Hukum Kepler.",
        buktiKegiatan: "Modul Ajar Gravitasi & Kepler, Rubrik Penilaian Kinerja Sains Holistik"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "44%",
        akhir: "93%",
        selisih: "+49%",
        makna: "Peserta didik aktif mengolah data satelit dan memformulasikan hukum perbandingan periode.",
        deskripsiPenilaian: "Murid aktif menggunakan perangkat lunak orbit simulator untuk membuktikan Hukum III Kepler secara kuantitatif, berdiskusi membandingkan kecepatan orbit planet dalam dan planet luar tata surya secara kolaboratif.",
        buktiKegiatan: "Laporan Pemodelan Orbit Planet, Presentasi Kelompok Murid Berbantuan Simulator"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "52%",
        akhir: "94%",
        selisih: "+42%",
        makna: "Keterkaitan hukum gravitasi dengan orbit satelit komunikasi dan keharmonisan kosmos.",
        deskripsiPenilaian: "Pembelajaran menghubungkan orbit satelit geostasioner yang melayani jaringan internet dan GPS di Indonesia dengan nilai ketakwaan atas keteraturan kosmos ciptaan Allah SWT yang memperkuat keimanan murid SMAS IT Ummul Quro.",
        buktiKegiatan: "Studi Kasus Satelit Merah Putih & Lembar Refleksi Integrasi Nilai Islam"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "36%",
        akhir: "89%",
        selisih: "+53%",
        makna: "Refleksi metakognitif terpadu antara penguasaan sains dan kesadaran diri sebagai insan beriman.",
        deskripsiPenilaian: "Refleksi akhir pertemuan mengintegrasikan pemahaman ilmiah dan kesadaran spiritual. 89% murid menuliskan refleksi mengenai pentingnya disiplin dan komitmen hidup sebagaimana planet yang istiqomah melingkar di garis edarnya.",
        buktiKegiatan: "Lembar Mutabaah & Refleksi Fisika SMAS IT Ummul Quro"
      }
    ];
  }
  if (name.includes("sani")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "42%",
        akhir: "87%",
        selisih: "+45%",
        makna: "Peningkatan peran guru dalam memfasilitasi literasi keuangan syariah interaktif.",
        deskripsiPenilaian: "Berdasarkan telaah modul (skor 93.2 / Sangat Baik) dan observasi tatap muka (skor 91.7 / Sangat Baik), Ibu Sani membimbing murid menyusun perencanaan anggaran finansial berbasis etika bisnis Islam.",
        buktiKegiatan: "Modul Literasi Keuangan Syariah, Panduan Simulasi Anggaran Mandiri"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "40%",
        akhir: "88%",
        selisih: "+48%",
        makna: "Murid aktif menyimulasikan akad mudharabah dan menghitung bagi hasil transaksi.",
        deskripsiPenilaian: "Murid berkelompok membuat simulasi usaha halal, merancang proposal investasi sederhana, dan membandingkan prinsip margin keuntungan dengan bunga pinjaman konvensional.",
        buktiKegiatan: "Proposal Mini Usaha Halal Siswa, Lembar Hitung Bagi Hasil"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "50%",
        akhir: "90%",
        selisih: "+40%",
        makna: "Penerapan pengelolaan uang saku pribadi dan transaksi non-riba dalam keseharian santri.",
        deskripsiPenilaian: "Guru mengangkat studi kasus nyata pengelolaan uang saku bulanan santri, bahaya jebakan pinjol ilegal di kalangan pemuda, serta keutamaan infak dalam keberkahan harta.",
        buktiKegiatan: "Rancangan Budgeting Pribadi Siswa & Lembar Evaluasi Pengeluaran"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "32%",
        akhir: "83%",
        selisih: "+51%",
        makna: "Pembiasaan evaluasi diri atas gaya hidup hemat dan tanggung jawab amanah finansial.",
        deskripsiPenilaian: "Sebanyak 83% murid mengungkapkan refleksi mendalam mengenai perubahan kebiasaan konsumtif dan komitmen menabung secara teratur untuk keperluan masa depan.",
        buktiKegiatan: "Buku Jurnal Refleksi Keuangan Siswa Ummul Quro"
      }
    ];
  }
  if (name.includes("sihana")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "44%",
        akhir: "88%",
        selisih: "+44%",
        makna: "Transformasi pembelajaran olahraga dari instruksi drill fisik menjadi edukasi kebugaran personal.",
        deskripsiPenilaian: "Berdasarkan supervisi telaah perangkat (skor 90.9 / Sangat Baik) dan observasi lapangan (skor 91.7 / Sangat Baik), Bapak Sihana memfasilitasi murid merancang program kebugaran jasmani terukur sesuai kapasitas fisiologis masing-masing.",
        buktiKegiatan: "Modul Ajar Kebugaran Berkelanjutan, Lembar Monitoring Denyut Nadi Murid"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "42%",
        akhir: "90%",
        selisih: "+48%",
        makna: "Murid aktif mempraktikkan sirkuit training dan mengukur denyut nadi pemulihan mandiri.",
        deskripsiPenilaian: "Peserta didik secara mandiri menghitung Target Heart Rate (THR), mencatat respons kardiovaskular pasca sirkuit training, dan saling memberi umpan balik teknik gerak yang aman.",
        buktiKegiatan: "Kartu Catatan Kebugaran Sirkuit, Rubrik Penilaian Penjasorkes Terukur"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "55%",
        akhir: "92%",
        selisih: "+37%",
        makna: "Keterkaitan latihan jasmani dengan pencegahan penyakit degeneratif dan kesehatan mental.",
        deskripsiPenilaian: "Pembelajaran mengaitkan olahraga teratur dengan pencegahan obesitas remaja, perbaikan kualitas tidur, dan pelepasan hormon endorfin untuk mereduksi stres akademik di lingkungan SMAS YPHB.",
        buktiKegiatan: "Poster Kampanye Hidup Aktif Remaja YPHB, Riset Kecil Pola Tidur Siswa"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "30%",
        akhir: "82%",
        selisih: "+52%",
        makna: "Refleksi kesadaran tubuh (body awareness) dan komitmen pola hidup bugar sepanjang hayat.",
        deskripsiPenilaian: "Sebanyak 82% murid menuliskan refleksi mengenai sensasi kebugaran tubuh mereka, pola makan seimbang, dan rencana jadwal aktivitas fisik mandiri di luar jam sekolah.",
        buktiKegiatan: "Logbook Refleksi Kesehatan Jasmani Mingguan Siswa YPHB"
      }
    ];
  }
  if (name.includes("salma") || name.includes("siti")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "43%",
        akhir: "90%",
        selisih: "+47%",
        makna: "Transformasi dari hafalan rumus gelombang ke penyelidikan resonansi bunyi dan audio digital kontekstual.",
        deskripsiPenilaian: "Berdasarkan telaah modul ajar (skor 97.7 / Sangat Baik) dan observasi kelas (skor 95.8 / Sangat Baik), Ibu Siti Salma memfasilitasi penyelidikan resonansi gelombang bunyi menggunakan aplikasi Sound Generator di smartphone dan kit tabung resonansi.",
        buktiKegiatan: "Modul Gelombang Mekanik & Akustik, Kit Tabung Resonansi & Garpu Tala"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "41%",
        akhir: "91%",
        selisih: "+50%",
        makna: "Murid terampil mengukur frekuensi nada, menganalisis cepat rambat bunyi, dan memverifikasi resonansi secara empiris.",
        deskripsiPenilaian: "Peserta didik secara berkelompok mengukur frekuensi nada garpu tala, membuktikan resonansi kolom udara, serta menganalisis bentuk gelombang audio pada aplikasi osiloskop virtual smartphone secara mandiri.",
        buktiKegiatan: "Lembar Kerja Praktikum Resonansi Bunyi, Rekaman Frekuensi Audio Murid"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "50%",
        akhir: "91%",
        selisih: "+41%",
        makna: "Keterkaitan gelombang bunyi dengan teknologi speaker, noise-cancelling earphone, dan ambang batas desibel aman.",
        deskripsiPenilaian: "Guru memandu analisis teknologi audio kekinian: prinsip kerja peredam bising aktif (active noise cancelling), resonansi ruang konser akustik, dan batas aman volume audio untuk melindungi kesehatan pendengaran remaja.",
        buktiKegiatan: "Modul Analisis Akustik Audio Smartphone SMAS YPHB, Infografis Polusi Suara"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "31%",
        akhir: "85%",
        selisih: "+54%",
        makna: "Refleksi atas pentingnya melindungi pendengaran dari paparan audio volume tinggi headset.",
        deskripsiPenilaian: "85% murid merefleksikan kebiasaan mendengarkan musik dengan earphone dan merumuskan aturan batas volume maksimal 60% serta durasi pemakaian sehat untuk mencegah gangguan pendengaran dini.",
        buktiKegiatan: "Jurnal Refleksi Akustik Sehat & Rekap Angket U2 Suara Murid YPHB"
      }
    ];
  }
  if (name.includes("ivany")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "48%",
        akhir: "92%",
        selisih: "+44%",
        makna: "Fasilitasi penulisan teks argumentasi kritis berbasis komik dan media visual.",
        deskripsiPenilaian: "Berdasarkan supervisi telaah perangkat (skor 95.5 / Sangat Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Ivany berperan sebagai mentor literasi yang memandu murid membedah isu lingkungan Rimba Mulya Bogor menjadi teks eksposisi argumentatif yang tajam.",
        buktiKegiatan: "Modul Ajar Bahasa Indonesia Berbasis Proyek, Rubrik Penilaian Retorika & PUEBI"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "45%",
        akhir: "91%",
        selisih: "+46%",
        makna: "Murid aktif memproduksi narasi eksposisi berbobot dan melakukan peer-review karya.",
        deskripsiPenilaian: "Murid secara aktif menyusun komik strip digital bertema lingkungan di Canva, mengkritisi argumen teman dengan etika santun, dan memajang karya di mading digital sekolah.",
        buktiKegiatan: "Antologi Komik Kritik Sosial Siswa Rimba Madya, Hasil Ulasan Sejawat"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "58%",
        akhir: "94%",
        selisih: "+36%",
        makna: "Konteks konservasi alam Pasir Mulya Bogor dan etika berekspresi di ruang siber.",
        deskripsiPenilaian: "Pembelajaran mengangkat isu riil konservasi daerah aliran sungai dan hutan kota sekitar Pasir Mulya Bogor. Murid mendiskusikan bagaimana bahasa persuasif dapat menggerakkan aksi nyata penyelamatan lingkungan.",
        buktiKegiatan: "Naskah Esai Lingkungan Siswa, Lembar Analisis Berita Lingkungan Bogor"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "35%",
        akhir: "87%",
        selisih: "+52%",
        makna: "Refleksi atas kekuatan kata-kata dalam memantik perubahan positif di masyarakat.",
        deskripsiPenilaian: "Sebanyak 87% murid merefleksikan kekuatan argumen mereka dan menyadari pentingnya memvalidasi fakta sebelum menyebarkan opini di media sosial demi menghindari pencemaran nama baik.",
        buktiKegiatan: 'Buku Refleksi Siswa Rimba Madya "Suara Rimba", Jurnal Literasi'
      }
    ];
  }
  if (name.includes("atik")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "40%",
        akhir: "85%",
        selisih: "+45%",
        makna: "Pemberdayaan murid melalui rancangan proyek kewirausahaan ramah lingkungan.",
        deskripsiPenilaian: "Berdasarkan telaah modul (skor 88.6 / Baik) dan observasi tatap muka (skor 87.5 / Baik), Ibu Atik memfasilitasi murid merancang studi kelayakan bisnis kreatif berbasis daur ulang limbah sekolah.",
        buktiKegiatan: "Modul Manajemen Kewirausahaan, Format Proposal Business Plan Hijau"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "42%",
        akhir: "86%",
        selisih: "+44%",
        makna: "Murid terampil menghitung BEP (Break-Even Point) dan strategi pemasaran produk.",
        deskripsiPenilaian: "Murid bekerja dalam tim menyusun prototype produk dari limbah daur ulang sekolah, menghitung biaya produksi dan harga jual rasional, serta menyimulasikan promosi di media sosial.",
        buktiKegiatan: "Lembar Kalkulasi BEP, Poster Promosi Produk Murid, Prototype Produk"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "48%",
        akhir: "88%",
        selisih: "+40%",
        makna: "Relevansi potensi UMKM lokal Bogor dan ekonomi sirkular ramah lingkungan.",
        deskripsiPenilaian: "Guru mengaitkan materi dengan ekosistem UMKM kuliner dan kerajinan Kota Bogor, mendorong murid berpikir kreatif menciptakan peluang usaha mandiri yang berkelanjutan.",
        buktiKegiatan: "Laporan Riset Pasar UMKM Lokal Bogor, Analisis Peluang Usaha"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "30%",
        akhir: "80%",
        selisih: "+50%",
        makna: "Refleksi karakter wirausahawan tangguh, pantang menyerah, dan beretika.",
        deskripsiPenilaian: "80% murid menuliskan refleksi tentang pentingnya ketelitian dalam perhitungan finansial dan integritas kejujuran saat berbisnis dengan konsumen.",
        buktiKegiatan: "Lembar Jurnal Refleksi Entrepreneur Muda Rimba Madya"
      }
    ];
  }
  if (name.includes("iqbal")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "40%",
        akhir: "81%",
        selisih: "+41%",
        makna: "Peningkatan peran guru dalam memandu diskusi investigasi sejarah perlawanan bangsa.",
        deskripsiPenilaian: "Berdasarkan telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 83.3 / Baik), Bapak Iqbal menunjukkan kemajuan positif dalam mengurangi metode ceramah satu arah. Guru memandu murid menelusuri rute perlawanan rakyat terhadap kolonialisme melalui peta interaktif.",
        buktiKegiatan: "Modul Ajar Sejarah Kolonialisme, Lembar Telaah Pengawas No. 4 & 16"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "38%",
        akhir: "80%",
        selisih: "+42%",
        makna: "Keaktifan kelompok murid dalam memetakan strategi perlawanan Diponegoro dan Padri.",
        deskripsiPenilaian: "Murid bekerja sama menyusun peta tematik pertempuran, menganalisis faktor penyebab kegagalan perjuangan sebelum abad ke-20 akibat persenjataan dan politik adu domba, serta mempresentasikan kesimpulan kelompok.",
        buktiKegiatan: "Peta Tematik Perjuangan Rakyat Nusantara, Resume Diskusi Kelompok"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "45%",
        akhir: "82%",
        selisih: "+37%",
        makna: "Menghubungkan nilai perjuangan dengan tantangan persatuan pemuda era digital.",
        deskripsiPenilaian: "Guru mengaitkan taktik devide et impera kolonial dengan bahaya ujaran kebencian di era medsos, memantik komitmen murid untuk selalu memverifikasi informasi dan menjaga persaudaraan antarpelajar.",
        buktiKegiatan: 'Bahan Tayang Diskusi "Belajar dari Sejarah untuk Masa Kini", Kliping Isu'
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "28%",
        akhir: "76%",
        selisih: "+48%",
        makna: "Refleksi penanaman jiwa patriotisme dan persatuan di kalangan pelajar PGRI 1.",
        deskripsiPenilaian: "Sebanyak 76% murid menyampaikan refleksi tertulis mengenai pentingnya menghargai jasa para pahlawan dan menjauhi perselisihan antarpelajar di Kota Bogor.",
        buktiKegiatan: "Lembar Refleksi Diri Pembelajaran Sejarah SMAS PGRI 1"
      }
    ];
  }
  if (name.includes("widya")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "41%",
        akhir: "84%",
        selisih: "+43%",
        makna: "Fasilitasi simulasi transaksi perbankan dan sistem pembayaran digital nontunai.",
        deskripsiPenilaian: "Berdasarkan telaah modul (skor 86.4 / Baik) dan observasi tatap muka (skor 87.5 / Baik), Ibu Widya memandu peserta didik memahami sistem moneter melalui simulasi pembayaran non-tunai modern.",
        buktiKegiatan: "Modul Sistem Pembayaran & Bank Sentral, Panduan Simulasi QRIS"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "40%",
        akhir: "85%",
        selisih: "+45%",
        makna: "Murid aktif mempraktikkan alur transaksi QRIS dan menganalisis keamanan dompet digital.",
        deskripsiPenilaian: "Peserta didik secara aktif melakukan role-play transaksi merchant dan konsumen, menganalisis potensi risiko kebocoran data PIN, serta merumuskan tips bertransaksi aman.",
        buktiKegiatan: "Lembar Simulasi Transaksi Keuangan Digital, Rubrik Evaluasi Role-Play"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "48%",
        akhir: "87%",
        selisih: "+39%",
        makna: "Penerapan dompet digital (e-wallet) dan literasi keamanan siber perbankan murid.",
        deskripsiPenilaian: "Materi terhubung langsung dengan kebiasaan murid SMAS Bhakti Insani bertransaksi menggunakan uang elektronik saat jajan di kantin dan membeli buku pelajaran.",
        buktiKegiatan: "Kuesioner Penggunaan E-Wallet Siswa, Analisis Kasus Kejahatan Phishing"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "29%",
        akhir: "78%",
        selisih: "+49%",
        makna: "Refleksi kesadaran proteksi data pribadi dan kehati-hatian finansial di era digital.",
        deskripsiPenilaian: "78% murid menuliskan refleksi mengenai pentingnya menjaga kerahasiaan kode OTP dan menahan diri dari gaya hidup konsumtif hanya karena kemudahan transaksi digital.",
        buktiKegiatan: "Catatan Refleksi Keuangan Digital Siswa Bhakti Insani"
      }
    ];
  }
  if (name.includes("yazid")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "42%",
        akhir: "85%",
        selisih: "+43%",
        makna: "Pergeseran dari ceramah pasal konstitusi menjadi studi kasus penegakan HAM kontekstual.",
        deskripsiPenilaian: "Berdasarkan telaah modul ajar (skor 86.4 / Baik) dan observasi kelas (skor 87.5 / Baik), Bapak Yazid memfasilitasi dialog konstruktif mengenai perlindungan hak asasi manusia dalam bingkai Pancasila.",
        buktiKegiatan: "Modul Ajar HAM dan Demokrasi Pancasila, Rubrik Debat Hukum Konstitusional"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "39%",
        akhir: "84%",
        selisih: "+45%",
        makna: "Murid aktif bersimulasi mediasi sengketa dan merumuskan solusi atas perundungan.",
        deskripsiPenilaian: "Peserta didik secara aktif menjalankan simulasi sidang mediasi kasus perundungan siber (cyberbullying), menyusun kesepakatan damai, dan mengidentifikasi pelanggaran hak martabat manusia.",
        buktiKegiatan: "Notulensi Sidang Mediasi Simulasi Siswa, Naskah Kesepakatan Damai"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "47%",
        akhir: "86%",
        selisih: "+39%",
        makna: "Pencegahan perundungan di lingkungan sekolah dan pemenuhan hak belajar yang aman.",
        deskripsiPenilaian: "Pembelajaran mengaitkan pasal HAM dengan deklarasi sekolah ramah anak di SMAS Yasih, menanamkan kesadaran menghargai perbedaan latar belakang antarwarga sekolah.",
        buktiKegiatan: "Piagam Komitmen Anti-Bullying Kelas X SMAS Yasih"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "30%",
        akhir: "79%",
        selisih: "+49%",
        makna: "Refleksi penghormatan atas hak orang lain dan tanggung jawab menegakkan keadilan.",
        deskripsiPenilaian: "Sebanyak 79% murid menuangkan refleksi personal mengenai komitmen mereka untuk menjadi pembela teman yang diperlakukan tidak adil dan tidak menjadi pelaku perundungan.",
        buktiKegiatan: "Lembar Refleksi Hati Nurani Siswa SMAS Yasih"
      }
    ];
  }
  if (name.includes("lutfiana")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "30%",
        akhir: "68%",
        selisih: "+38%",
        makna: "Awal pergeseran dari pembelajaran teoretis ke praktikum sederhana indikator asam basa.",
        deskripsiPenilaian: "Berdasarkan supervisi telaah perangkat (skor 75.0 / Cukup) dan observasi tatap muka (skor 75.0 / Cukup), guru mulai mencoba metode eksperimen bahan alam dengan ekstrak kunyit dan kol ungu. Melalui coaching intensif pengawas, guru mulai melatih teknik scaffolding untuk memfasilitasi kelompok murid yang pasif.",
        buktiKegiatan: "Modul Ajar Asam Basa Revisi, Lembar Observasi Pengawas No. 8-12"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "32%",
        akhir: "70%",
        selisih: "+38%",
        makna: "Peningkatan antusiasme murid dalam menguji pH bahan kimia rumah tangga.",
        deskripsiPenilaian: "Murid yang sebelumnya pasif mulai menunjukkan ketertarikan meneteskan larutan cuka, sabun, dan jeruk nipis ke plat tetes, mengamati spektrum perubahan warna dan mencatat derajat keasaman larutan.",
        buktiKegiatan: "Lembar Kerja Siswa Pengujian pH Alami, Dokumentasi Plat Tetes"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "35%",
        akhir: "72%",
        selisih: "+37%",
        makna: "Keterkaitan sifat asam basa dengan netralisasi maag dan dampak limbah sabun.",
        deskripsiPenilaian: "Guru menghubungkan reaksi netralisasi dengan mekanisme kerja obat maag di lambung dan bahaya buangan limbah detergen bagi kehidupan ekosistem selokan sekitar sekolah.",
        buktiKegiatan: "Bahan Ajar Apersepsi Kontekstual Bahan Kimia Rumah Tangga"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "25%",
        akhir: "65%",
        selisih: "+40%",
        makna: "Awal pembiasaan refleksi pemahaman konsep di akhir jam praktikum kimia.",
        deskripsiPenilaian: "Dengan dorongan pengawas, guru menyisihkan 8 menit di akhir kelas untuk meminta murid menuliskan hal apa yang paling menarik dari praktikum dan apa yang masih sulit dipahami.",
        buktiKegiatan: "Kertas Refleksi Singkat Akhir Praktikum Siswa Muhammadiyah"
      }
    ];
  }
  if (name.includes("saulina")) {
    return [
      {
        indikator: "Guru berorientasi pada pengalaman belajar murid",
        awal: "41%",
        akhir: "84%",
        selisih: "+43%",
        makna: "Peningkatan fasilitasi analisis struktur pasar dan perilaku produsen-konsumen.",
        deskripsiPenilaian: "Berdasarkan supervisi telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 83.3 / Baik), Ibu Saulina mengarahkan murid menganalisis struktur pasar monopoli dan oligopoli melalui bedah kasus industri nasional.",
        buktiKegiatan: "Modul Struktur Pasar, Lembar Kerja Bedah Industri Nasional"
      },
      {
        indikator: "Murid aktif mengaplikasikan pengetahuan",
        awal: "39%",
        akhir: "83%",
        selisih: "+44%",
        makna: "Murid aktif membedah kelebihan dan kekurangan penetapan tarif monopoli negara.",
        deskripsiPenilaian: "Murid bekerja dalam kelompok menganalisis peran BUMN seperti PLN dan PT KAI dalam mengelola hajat hidup orang banyak serta mendiskusikan perlindungan hak konsumen.",
        buktiKegiatan: "Laporan Diskusi Kelompok Peran BUMN & KPPU, Peta Analisis Pasar"
      },
      {
        indikator: "Pembelajaran terhubung dengan konteks nyata",
        awal: "46%",
        akhir: "85%",
        selisih: "+39%",
        makna: "Relevansi harga tiket transportasi dan tarif listrik dengan pengeluaran keluarga.",
        deskripsiPenilaian: "Materi dikaitkan dengan penyesuaian tarif KRL Jabodetabek rute Bogor-Jakarta dan tagihan listrik rumah tangga, memberikan gambaran nyata fungsi subsidi pemerintah.",
        buktiKegiatan: "Kliping Berita Penyesuaian Tarif KRL & Lembar Analisis Subsidi"
      },
      {
        indikator: "Murid melakukan refleksi",
        awal: "28%",
        akhir: "77%",
        selisih: "+49%",
        makna: "Refleksi kepedulian sosial terhadap efisiensi ekonomi dan keadilan akses layanan publik.",
        deskripsiPenilaian: "Sebanyak 77% murid merefleksikan pentingnya keadilan sosial bagi seluruh rakyat Indonesia dalam pemanfaatan sumber daya alam strategis.",
        buktiKegiatan: "Jurnal Refleksi Keadilan Ekonomi Siswa SMAS Ananda"
      }
    ];
  }
  const sName = schoolName || "Sekolah";
  const sub = subject || "Mata Pelajaran";
  return [
    {
      indikator: "Guru berorientasi pada pengalaman belajar murid",
      awal: "45%",
      akhir: "85%",
      selisih: "+40%",
      makna: `Transformasi pembelajaran ${sub} berpusat pada murid melalui metode aktif dan inkuiri.`,
      deskripsiPenilaian: `Berdasarkan evaluasi supervisi pengawas di ${sName}, ${teacherName} berhasil memfasilitasi murid bereksplorasi secara aktif pada materi ${sub}, beralih dari ceramah klasikal ke pendampingan belajar bermakna.`,
      buktiKegiatan: `Modul Ajar ${sub}, Lembar Observasi Pengawas`
    },
    {
      indikator: "Murid aktif mengaplikasikan pengetahuan",
      awal: "42%",
      akhir: "88%",
      selisih: "+46%",
      makna: `Peningkatan keaktifan murid dalam menyelesaikan tugas unjuk kerja kolaboratif ${sub}.`,
      deskripsiPenilaian: `Peserta didik aktif berkolaborasi dalam kelompok memecahkan persoalan ${sub}, mempresentasikan temuan, dan berdiskusi secara kritis di ruang kelas.`,
      buktiKegiatan: `LKPD Kolaboratif Siswa, Portofolio Tugas Pembelajaran`
    },
    {
      indikator: "Pembelajaran terhubung dengan konteks nyata",
      awal: "50%",
      akhir: "88%",
      selisih: "+38%",
      makna: `Keterhubungan konsep materi ${sub} dengan fenomena kehidupan sehari-hari peserta didik.`,
      deskripsiPenilaian: `Guru secara kontekstual menghubungkan materi ajar ${sub} dengan realitas kehidupan murid di lingkungan ${sName}, meningkatkan minat dan pemahaman bermakna.`,
      buktiKegiatan: `Bahan Ajar Studi Kasus Nyata, Lembar Diskusi Kontekstual`
    },
    {
      indikator: "Murid melakukan refleksi",
      awal: "32%",
      akhir: "80%",
      selisih: "+48%",
      makna: `Pembiasaan refleksi metakognitif terstruktur di akhir pembelajaran ${sub}.`,
      deskripsiPenilaian: `Murid secara konsisten dibimbing melakukan evaluasi diri dan menuliskan pemaknaan pembelajaran pada akhir sesi pertemuan kelas.`,
      buktiKegiatan: `Lembar Refleksi Diri Siswa, Hasil Uji Angket Suara Murid`
    }
  ];
}
function createDefaultSambungForTeacher(teacherName, schoolName, subject) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return {
    selidiki: {
      tanggal: today,
      items: ASPEK_SELIDIKI_DEFAULT.map((aspek, idx) => ({
        id: idx + 1,
        aspek,
        kondisiAwal: "",
        bukti: "",
        kebutuhanPembinaan: "",
        isPrioritas: idx === 0 || idx === 1
      })),
      catatanPrioritas: "Fokus pada penguatan kesadaran murid dan kontekstualisasi materi.",
      matriksBefore: { ...DEFAULT_MATRIKS_BEFORE }
    },
    arahkan: {
      fokusIndikatorTerpilih: ["peranGuru", "aktivitasMurid"],
      periode: "Semester Genap 2025/2026",
      fokusPerubahan: `Meningkatkan keterlibatan aktif dan pemahaman kontekstual murid pada pembelajaran ${subject} melalui pembelajaran bermakna.`,
      kegiatan: [
        {
          id: 1,
          fokusIndikator: "peranGuru",
          kegiatanPembinaan: `Bedah telaah perangkat dan modul ajar ${subject} berbasis inkuiri`,
          indikatorKeberhasilan: "Modul ajar memuat diferensiasi konten dan asesmen otentik",
          waktu: "Bulan ke-1",
          penanggungJawab: "Kusnandar, M.Si & Guru"
        },
        {
          id: 2,
          fokusIndikator: "aktivitasMurid",
          kegiatanPembinaan: "Coaching reflektif strategi pelibatan murid aktif",
          indikatorKeberhasilan: "Guru menyusun strategi pertanyaan pemantik dan studi kasus nyata",
          waktu: "Bulan ke-2",
          penanggungJawab: "Kusnandar, M.Si"
        },
        {
          id: 3,
          fokusIndikator: "aktivitasMurid",
          kegiatanPembinaan: "Observasi kelas kolaboratif dan refleksi pasca-observasi",
          indikatorKeberhasilan: "Skor observasi mencapai kriteria berkembang/sangat berkembang (>85%)",
          waktu: "Bulan ke-3",
          penanggungJawab: "Kepala Sekolah & Pengawas"
        }
      ],
      tandaTangan: {
        pengawas: "Kusnandar, M.Si",
        kepalaSekolah: "Kepala Sekolah",
        guru: teacherName,
        tanggalDisepakati: today
      }
    },
    maknai: {
      tanggal: today,
      coaching: {
        tujuan: `Menciptakan ruang belajar ${subject} yang membangkitkan rasa ingin tahu murid dan relevan dengan kehidupan sehari-hari.`,
        realitas: "Sebagian besar murid masih menunggu instruksi guru dan ragu mengemukakan pendapat di depan kelas.",
        opsi: "Menerapkan diskusi kelompok terarah, media interaktif kontekstual, dan umpan balik langsung antarteman.",
        komitmen: "Melakukan uji coba lembar kerja kolaboratif pada pertemuan mendatang dan mencatat respons murid."
      }
    },
    berdayakan: {
      siklusList: [
        {
          siklus: 1,
          rancanganDanUjiCoba: "Rancangan awal pembelajaran dengan simulasi masalah sehari-hari.",
          refleksi: "Murid mulai tertarik, namun perlu alokasi waktu lebih terukur.",
          perbaikanBerikutnya: "Menyederhanakan lembar kerja siswa agar fokus pada konsep esensial."
        },
        {
          siklus: 2,
          rancanganDanUjiCoba: "Penerapan kerja kelompok heterogen dengan pembagian peran yang jelas.",
          refleksi: "Interaksi antarmurid meningkat dan diskusi lebih hidup.",
          perbaikanBerikutnya: "Menyiapkan pertanyaan pemandu bagi murid yang membutuhkan pendampingan khusus."
        },
        {
          siklus: 3,
          rancanganDanUjiCoba: "Presentasi hasil karya dan refleksi terbimbing di akhir pembelajaran.",
          refleksi: "Murid berani menyimpulkan makna pembelajaran secara mandiri.",
          perbaikanBerikutnya: "Mengunggah dokumentasi praktik baik ke platform berbagi rekan sejawat."
        }
      ]
    },
    uji: {
      u1_observasi: {
        tanggal: today,
        hariTanggal: "Senin, " + today,
        tahapObservasi: "siklus",
        kelas: "Fase E / F",
        indikatorList: INDIKATOR_U1_DEFAULT.map((ind) => ({
          ...ind,
          score: 3,
          catatan: "Teramati berkembang dengan baik."
        })),
        totalSkor: 30,
        persentaseCapaian: 75,
        apaYangDialamiMurid: "Murid mengikuti alur pembelajaran dengan rasa aman dan antusias.",
        kekuatanDanRekomendasi: "Guru terampil mengelola suasana belajar; disarankan memperkaya ragam contoh kontekstual."
      },
      u2_angketMurid: {
        kodeMuridKelas: "Kelas X/XI",
        tanggal: today,
        jumlahResponden: 32,
        items: PERNYATAAN_U2_DEFAULT.map((p, idx) => ({
          id: idx + 1,
          pernyataan: p,
          skorRataRata: 3.4,
          persentaseSetuju: 85
        })),
        halPalingBermakna: "Bisa berdiskusi dan menyelesaikan tantangan bersama teman-teman.",
        kesulitanMurid: "Menghubungkan materi dengan istilah teknis yang belum familiar."
      },
      matriksAfter: { ...DEFAULT_MATRIKS_AFTER }
    },
    nyatakan: {
      beforeAfter: [
        {
          aspek: "Peran guru",
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.peranGuru,
          setelahSambung: DEFAULT_MATRIKS_AFTER.peranGuru
        },
        {
          aspek: "Aktivitas murid",
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
          setelahSambung: DEFAULT_MATRIKS_AFTER.aktivitasMurid
        },
        {
          aspek: "Konteks kehidupan nyata",
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.konteksNyata,
          setelahSambung: DEFAULT_MATRIKS_AFTER.konteksNyata
        },
        {
          aspek: "Refleksi murid",
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.refleksiMurid,
          setelahSambung: DEFAULT_MATRIKS_AFTER.refleksiMurid
        }
      ],
      dataDampak: getTeacherDescriptiveDataDampak(teacherName, subject, schoolName)
    },
    gerakkan: {
      tindakLanjut: [
        {
          id: 1,
          temuanSupervisi: "Beberapa murid pendiam masih perlu dorongan dalam kerja kelompok.",
          tindakLanjut: "Menerapkan teknik Think-Pair-Share dan rotasi peran ketua kelompok.",
          penanggungJawab: teacherName,
          waktu: "2 Minggu ke depan",
          hasil: "Partisipasi murid pendiam meningkat signifikan."
        },
        {
          id: 2,
          temuanSupervisi: "Perangkat asesmen formatif belum terdokumentasi rapi dalam portofolio digital.",
          tindakLanjut: "Membuat folder Google Drive kelas yang terstruktur dan mudah diakses.",
          penanggungJawab: teacherName,
          waktu: "1 Minggu ke depan",
          hasil: "Seluruh rubrik dan hasil unjuk kerja murid terarsipkan."
        }
      ],
      pengimbasan: [
        {
          id: 1,
          praktikBaik: `Penerapan Strategi SAMBUNG pada Pembelajaran ${subject}`,
          sasaran: "Rekan Guru Mata Pelajaran di Satuan Pendidikan",
          bentuk: "Komunitas Belajar (Kombel) Sekolah",
          waktu: "Bulan Depan"
        }
      ]
    },
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var SEED_SAMBUNG_DEWI = {
  selidiki: {
    tanggal: "2025-08-10",
    items: [
      {
        id: 1,
        aspek: "Tujuan dan kesadaran murid tentang belajar",
        kondisiAwal: "Murid hafal rumus Hukum Ohm V = I \xD7 R namun bingung mengapa sekring rumah putus atau bagaimana aki dan baterai smartphone menyuplai arus searah DC.",
        bukti: "Dok-Awal-01 (Pre-test diagnostik & angket minat awal)",
        kebutuhanPembinaan: "Membangun apersepsi bermakna tentang bahaya konsleting dan efisiensi energi listrik DC rumah tangga.",
        isPrioritas: true
      },
      {
        id: 2,
        aspek: "Konteks kehidupan nyata",
        kondisiAwal: "Contoh pembelajaran hanya mengandalkan skema resistor gambar garis buku cetak tanpa kaitan dengan panel surya atau mobil listrik.",
        bukti: "RPP-01 (Modul Ajar semester lalu)",
        kebutuhanPembinaan: "Mengintegrasikan fenomena nyata: panel surya atap sekolah, powerbank gawai, sistem starter motor/mobil, dan instalasi kelistrikan ramah lingkungan.",
        isPrioritas: true
      },
      {
        id: 3,
        aspek: "Aktivitas memahami dan mengaplikasikan",
        kondisiAwal: "Praktikum sebatas membaca jarum amperemeter analog yang sering rusak tanpa ruang bagi murid untuk merancang sirkuit sendiri.",
        bukti: "LKS-Fisika-02",
        kebutuhanPembinaan: "Memanfaatkan aplikasi PhET Interactive Simulation: Circuit Construction Kit (DC) dan trainer kit breadboard rangkaian tertutup."
      },
      {
        id: 4,
        aspek: "Aktivitas merefleksikan dan menghubungkan",
        kondisiAwal: "Guru menutup sesi dengan pemberian pekerjaan rumah (PR) perhitungan rumus resistor tanpa sesi refleksi diri.",
        bukti: "Jurnal-01",
        kebutuhanPembinaan: "Menyediakan rubrik refleksi 3-2-1 tentang penghematan daya listrik di akhir sesi tatap muka."
      },
      {
        id: 5,
        aspek: "Suasana menggembirakan",
        kondisiAwal: "Suasana kelas tegang karena murid cemas sengatan listrik dan takut salah menghitung pecahan hambatan paralel di papan tulis.",
        bukti: "Obs-Awal-A1",
        kebutuhanPembinaan: "Menerapkan gamifikasi tebak nyala lampu rangkaian kombinasi seri-paralel dan kuis interaktif Quizizz kelistrikan."
      },
      {
        id: 6,
        aspek: "Asesmen dan tindak lanjut",
        kondisiAwal: "Asesmen formatif jarang diberikan umpan balik kualitatif, hanya nilai angka ulangan harian.",
        bukti: "Nilai-Fis-2025",
        kebutuhanPembinaan: "Asesmen formatif berkelanjutan dengan rubrik unjuk kerja troubleshooting rangkaian listrik terbuka dan tertutup."
      }
    ],
    catatanPrioritas: "Prioritas pembinaan disepakati pada Aspek 1 (Kesadaran Murid) dan Aspek 2 (Konteks Kehidupan Nyata Listrik Arus Searah).",
    matriksBefore: {
      peranGuru: "Penceramah dominan di depan kelas, mendiktekan rumus Hukum Ohm dan menghitung contoh soal di papan tulis.",
      aktivitasMurid: "Menyalin tulisan di papan, mencatat rumus tanpa berdialog, pasif menunggu jam pelajaran selesai.",
      konteksNyata: "Soal teks abstrak berupa kawat penghantar tanpa konteks gawai atau perangkat rumah tangga.",
      refleksiMurid: "Sama sekali tidak ada alokasi waktu refleksi di akhir jam belajar."
    }
  },
  arahkan: {
    periode: "Semester Ganjil 2025/2026",
    fokusPerubahan: "Meningkatkan pemahaman konseptual dan keterampilan terapan murid pada materi Listrik Arus Searah melalui perancangan rangkaian PhET DC dan studi kasus hemat energi di SMA Negeri 4 Bogor.",
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: "Diskusi telaah modul ajar Listrik Arus Searah berbasis inkuiri dan desain LKPD simulasi sirkuit DC PhET",
        indikatorKeberhasilan: "Modul ajar dilengkapi skenario PhET DC, studi kasus kelistrikan rumah, dan lembar asesmen otentik",
        waktu: "12 Agustus 2025",
        penanggungJawab: "Kusnandar, M.Si & Sondang Asih Januarti, S.Pd."
      },
      {
        id: 2,
        kegiatanPembinaan: "Simulasi coaching pra-observasi dan pemantapan teknik bertanya pemantik Hukum Kirchhoff (HOTS)",
        indikatorKeberhasilan: "Guru mahir memantik nalar murid saat menyelidiki arus masuk sama dengan arus keluar di percabangan",
        waktu: "19 Agustus 2025",
        penanggungJawab: "Kusnandar, M.Si"
      },
      {
        id: 3,
        kegiatanPembinaan: "Observasi kelas kolaboratif di kelas XI-Fisika SMA Negeri 4 Bogor dan survei kepuasan belajar murid",
        indikatorKeberhasilan: "Skor observasi mencapai kategori Sangat Berkembang (>90%)",
        waktu: "28 Agustus 2025",
        penanggungJawab: "Kusnandar, M.Si & Yulianti Rosdian, M.Pd."
      },
      {
        id: 4,
        kegiatanPembinaan: "Refleksi pasca-observasi, pengolahan data dampak, dan perumusan rencana pengimbasan di MGMP",
        indikatorKeberhasilan: "Laporan praktik baik siap disajikan pada MGMP Fisika Kota Bogor",
        waktu: "04 September 2025",
        penanggungJawab: "Sondang Asih Januarti, S.Pd. & Kusnandar, M.Si"
      }
    ],
    tandaTangan: {
      pengawas: "Kusnandar, M.Si",
      kepalaSekolah: "Yulianti Rosdian, M.Pd.",
      guru: "Sondang Asih Januarti, S.Pd.",
      tanggalDisepakati: "2025-08-19"
    }
  },
  maknai: {
    tanggal: "2025-08-20",
    coaching: {
      tujuan: "Saya ingin murid memandang materi Listrik Arus Searah bukan momok rumus Hukum Ohm yang membosankan, tetapi sains aplikatif yang menjelaskan bagaimana smartphone mereka mengisi daya dengan aman dan bagaimana mendesain instalasi kelistrikan yang efisien.",
      realitas: "Saat ini murid hanya bersemangat selama 10 menit awal pemutaran video mobil listrik, namun kehilangan gairah begitu rumus loop Hukum Kirchhoff diperkenalkan di papan tulis.",
      opsi: "Mengganti papan rumus kaku dengan simulasi langsung menggunakan PhET Circuit Construction Kit DC dan rangkaian nyata lampu led dengan baterai di atas meja kelompok.",
      komitmen: "Saya berkomitmen menerapkan LKPD inkuiri rangkaian listrik DC minggu depan, memberi ruang kelompok membedah satu masalah kelistrikan nyata di sekolah, dan meninjau kembali bersama Bapak Pengawas Kusnandar pada 29 Agustus 2025."
    }
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: "Rancangan awal uji coba simulasi PhET Circuit Construction Kit DC untuk membuktikan Hukum Ohm secara virtual di Chromebook murid.",
        refleksi: "Murid sangat bersemangat menggeser slider tegangan baterai dan mengamati nyala lampu, namun instalasi jaringan wi-fi lab memerlukan antisipasi.",
        perbaikanBerikutnya: "Menyediakan versi offline PhET yang dapat diakses langsung tanpa bergantung koneksi internet."
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: "Penerapan rangkaian lampu seri vs paralel dengan penugasan kelompok menganalisis mengapa lampu di rumah tetap menyala saat satu saklar dimatikan.",
        refleksi: "Sembilan puluh lima persen murid berhasil menarik kesimpulan karakteristik beda potensial dan arus pada rangkaian paralel tanpa instruksi dikte.",
        perbaikanBerikutnya: "Menambah tantangan pemodelan pengisian daya panel surya mini ke baterai aki 12V."
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: "Presentasi unjuk kerja analisis Hukum Kirchhoff pada instalasi kelistrikan stan kantin ramah energi SMA Negeri 4 Bogor.",
        refleksi: "Murid mampu berargumen ilmiah, saling menanggapi dengan kritis, dan menghitung arus percabangan secara akurat.",
        perbaikanBerikutnya: "Mempublikasikan foto poster hasil karya murid di papan inovasi sekolah dan portal SIKLUS SAMBUNG."
      }
    ]
  },
  uji: {
    u1_observasi: {
      tanggal: "2025-08-28",
      hariTanggal: "Kamis, 28 Agustus 2025",
      tahapObservasi: "akhir",
      kelas: "Fase F / Kelas XI-Fisika 1",
      indikatorList: [
        { id: 1, indikator: "Murid memahami tujuan dan manfaat pembelajaran", dimensi: "Berkesadaran", score: 4, catatan: "Murid mampu menyampaikan manfaat belajar Listrik Arus Searah bagi instalasi panel surya dan keamanan gawai." },
        { id: 2, indikator: "Murid menyadari proses dan kemajuan belajarnya", dimensi: "Berkesadaran", score: 4, catatan: "Murid memeriksa sendiri ceklis kemajuan LKPD di layar tablet kelompok." },
        { id: 3, indikator: "Pembelajaran dikaitkan dengan pengalaman murid", dimensi: "Bermakna", score: 4, catatan: "Mengaitkan arus pengisian baterai smartphone dan siklus pemakaian powerbank." },
        { id: 4, indikator: "Guru memakai konteks kehidupan nyata yang relevan", dimensi: "Bermakna", score: 4, catatan: "Studi kasus konsleting listrik perkotaan dan efisiensi panel surya di Bogor." },
        { id: 5, indikator: "Suasana aman, positif; murid antusias dan berani mencoba", dimensi: "Menggembirakan", score: 4, catatan: "Tidak ada murid yang takut salah merangkai; teman sekelompok saling menopang." },
        { id: 6, indikator: "Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri", dimensi: "Memahami", score: 4, catatan: "Tiga perwakilan kelompok memaparkan analogi aliran arus seperti aliran air secara orisinal." },
        { id: 7, indikator: "Murid menerapkan pengetahuan pada tugas/masalah nyata", dimensi: "Mengaplikasikan", score: 4, catatan: "Perhitungan Hukum Kirchhoff pada rangkaian paralel ganda terlaksana dengan sangat teliti." },
        { id: 8, indikator: "Murid diberi waktu merefleksikan dan memakai umpan balik", dimensi: "Merefleksikan", score: 4, catatan: "Waktu 12 menit dialokasikan untuk menuliskan refleksi di Google Form refleksi." },
        { id: 9, indikator: "Murid menghubungkan pengetahuan dengan kehidupan nyata", dimensi: "Menghubungkan", score: 4, catatan: "Murid menghubungkan materi dengan peluang karier di bidang teknik elektro dan energi terbarukan." },
        { id: 10, indikator: "Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut", dimensi: "Asesmen & tindak lanjut", score: 4, catatan: "Umpan balik lisan sangat kaya; tindak lanjut diferensiasi tugas rumah sudah jelas." }
      ],
      totalSkor: 40,
      persentaseCapaian: 100,
      apaYangDialamiMurid: "Murid mengalami pembelajaran listrik arus searah yang hidup, penuh rasa ingin tahu, aktif berdiskusi tanpa beban hafalan rumus, dan bangga saat berhasil merancang sirkuit yang berfungsi sempurna.",
      kekuatanDanRekomendasi: "Kekuatan: Integrasi teknologi simulasi PhET DC dan stimulasi pertanyaan inkuiri sangat berbobot. Rekomendasi: Modul ajar ini layak dijadikan acuan Best Practice pengawas di sekolah binaan Kota Bogor."
    },
    u2_angketMurid: {
      kodeMuridKelas: "XI-Fisika 1 SMA Negeri 4 Bogor (36 Responden)",
      tanggal: "2025-08-28",
      jumlahResponden: 36,
      items: [
        { id: 1, pernyataan: "Saya memahami tujuan dan manfaat pelajaran ini.", skorRataRata: 3.9, persentaseSetuju: 100 },
        { id: 2, pernyataan: "Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.", skorRataRata: 3.8, persentaseSetuju: 94.4 },
        { id: 3, pernyataan: "Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.", skorRataRata: 3.9, persentaseSetuju: 97.2 },
        { id: 4, pernyataan: "Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.", skorRataRata: 4, persentaseSetuju: 100 },
        { id: 5, pernyataan: "Saya merasa aman, senang, dan bersemangat selama pelajaran.", skorRataRata: 3.9, persentaseSetuju: 97.2 }
      ],
      halPalingBermakna: "Saat kelompok kami menyusun rangkaian lampu paralel dan menghitung arus di PhET lalu mengujinya pada breadboard nyata, ternyata listrik itu logis dan menyenangkan!",
      kesulitanMurid: "Menentukan arah loop arus pada Hukum Kirchhoff II jika terdapat lebih dari dua sumber tegangan baterai."
    },
    matriksAfter: {
      peranGuru: "Fasilitator inkuiri, pemandu eksplorasi simulasi sirkuit PhET DC, dan coach yang memantik nalar murid.",
      aktivitasMurid: "Bereksplorasi dengan simulator PhET DC, berdebat ilmiah dalam kelompok, dan mempresentasikan skema rangkaian.",
      konteksNyata: "Konteks nyata: baterai smartphone, sistem aki kendaraan, instalasi panel surya, dan pencegahan korsleting.",
      refleksiMurid: "Refleksi terstruktur 10-15 menit di setiap pertemuan melalui formulir digital refleksi diri."
    }
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: "Peran guru",
        sebelumSambung: "Penceramah dominan di depan kelas, mendiktekan rumus Hukum Ohm dan menghitung contoh soal di papan tulis.",
        setelahSambung: "Fasilitator inkuiri, pemandu eksplorasi simulasi sirkuit DC, dan coach yang memantik nalar murid.",
        buktiKode: "BKT-01 (Rekaman Video & Foto Kelas SMAN 4)"
      },
      {
        aspek: "Aktivitas murid",
        sebelumSambung: "Menyalin tulisan di papan, mencatat rumus tanpa berdialog, pasif menunggu jam pelajaran selesai.",
        setelahSambung: "Bereksplorasi dengan simulator PhET DC, berdebat ilmiah dalam kelompok, dan mempresentasikan skema rangkaian.",
        buktiKode: "BKT-02 (LKPD Kelompok & Laporan Praktik)"
      },
      {
        aspek: "Konteks kehidupan nyata",
        sebelumSambung: "Soal teks abstrak berupa kawat penghantar tanpa konteks gawai atau perangkat rumah.",
        setelahSambung: "Konteks nyata: baterai smartphone, sistem aki kendaraan, instalasi panel surya, dan pencegahan korsleting.",
        buktiKode: "BKT-03 (Bahan Ajar Kontekstual SMAN 4)"
      },
      {
        aspek: "Refleksi murid",
        sebelumSambung: "Sama sekali tidak ada alokasi waktu refleksi di akhir jam belajar.",
        setelahSambung: "Refleksi terstruktur 10-15 menit di setiap pertemuan melalui formulir digital refleksi.",
        buktiKode: "BKT-04 (Rekap Tanggapan Google Form)"
      }
    ],
    dataDampak: getTeacherDescriptiveDataDampak("Sondang Asih Januarti, S.Pd.", "Fisika", "SMAN 4 Bogor")
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: "Tiga murid dengan gaya belajar kinestetik masih memerlukan panduan membaca kode warna resistor analog.",
        tindakLanjut: "Menyediakan kartu tabel kode warna cepat dan pendampingan tutor sebaya pada sesi klinik fisika SMAN 4 Bogor.",
        penanggungJawab: "Sondang Asih Januarti, S.Pd.",
        waktu: "02 September 2025",
        hasil: "Ketiga murid mencapai ketuntasan KKTP pada asesmen ulang praktik."
      },
      {
        id: 2,
        temuanSupervisi: "Dokumentasi video pembelajaran praktik baik kelistrikan DC perlu diedit untuk diseminasi daring.",
        tindakLanjut: "Menyusun video dokumenter praktik baik 7 menit dan mengunggahnya ke YouTube & PMM.",
        penanggungJawab: "Sondang Asih Januarti & Tim Multimedia SMAN 4 Bogor",
        waktu: "10 September 2025",
        hasil: "Video telah ditonton oleh lebih dari 500 pendidik SMA se-Jawa Barat."
      },
      {
        id: 3,
        temuanSupervisi: "Pengembangan LKPD rangkaian listrik untuk bab berikutnya (Kemagnetan & Induksi Elektromagnetik).",
        tindakLanjut: "Merancang lembar eksplorasi motor listrik sederhana dan generator mini.",
        penanggungJawab: "Sondang Asih Januarti & Pengawas Pembina",
        waktu: "15 September 2025",
        hasil: "Modul ajar bab elektromagnetik selesai dan disetujui pengawas pembina."
      }
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: "Inovasi Pembelajaran Listrik Arus Searah Berbasis Simulasi PhET DC & Pendekatan SAMBUNG",
        sasaran: "Guru Fisika SMA Negeri dan Swasta se-Kota Bogor",
        bentuk: "Workshop Tatap Muka MGMP Fisika di SMAN 2 Bogor",
        waktu: "18 September 2025"
      },
      {
        id: 2,
        praktikBaik: "Penyusunan Asesmen Formatif Otentik Berorientasi Suara Murid (Student Voice)",
        sasaran: "Komunitas Belajar (Kombel) Guru SMA Negeri 4 Bogor",
        bentuk: "Diseminasi Internal In-House Training (IHT)",
        waktu: "25 September 2025"
      }
    ]
  },
  lastUpdated: "2025-09-28T10:00:00.000Z"
};
var SEED_SAMBUNG_AHMAD = {
  selidiki: {
    tanggal: "2025-08-15",
    items: [
      {
        id: 1,
        aspek: "Tujuan dan kesadaran murid tentang belajar",
        kondisiAwal: "Murid menganggap teks anekdot sebatas lelucon lucu tanpa menyadari fungsinya sebagai kritik sosial yang santun dan konstruktif.",
        bukti: "Hasil tulisan awal murid kelas X-4",
        kebutuhanPembinaan: "Mengarahkan murid memahami etika komunikasi publik dan analisis isu kebijakan di lingkungan terdekat.",
        isPrioritas: true
      },
      {
        id: 2,
        aspek: "Konteks kehidupan nyata",
        kondisiAwal: "Contoh anekdot diambil dari buku teks terbitan lama yang tidak relevan dengan fenomena sosial remaja saat ini.",
        bukti: "Modul Ajar Bahasa Indonesia 2024",
        kebutuhanPembinaan: "Memanfaatkan isu nyata: pengelolaan sampah sekolah, antrean kantin digital, dan etika bermedia sosial.",
        isPrioritas: true
      },
      {
        id: 3,
        aspek: "Aktivitas memahami dan mengaplikasikan",
        kondisiAwal: "Murid menyalin pola teks yang sudah ada tanpa berkreasi membuat naskah anekdot orisinal.",
        bukti: "Buku Catatan Murid",
        kebutuhanPembinaan: "Menyelenggarakan simulasi mini Stand-up Comedy atau komik strip digital."
      },
      {
        id: 4,
        aspek: "Aktivitas merefleksikan dan menghubungkan",
        kondisiAwal: "Evaluasi hanya menilai kelengkapan struktur orientasi-krisis-koda tanpa refleksi nilai moral.",
        bukti: "Daftar Nilai Kognitif",
        kebutuhanPembinaan: "Menerapkan lembar refleksi pesan tersirat dan empati sosial."
      },
      {
        id: 5,
        aspek: "Suasana menggembirakan",
        kondisiAwal: "Sebagian murid malu membacakan karyanya di depan kelas karena takut ditertawakan.",
        bukti: "Catatan Observasi Awal Guru",
        kebutuhanPembinaan: "Membangun iklim kelas yang aman, apresiatif, dan saling mendukung."
      },
      {
        id: 6,
        aspek: "Asesmen dan tindak lanjut",
        kondisiAwal: "Koreksi guru memakan waktu lama sehingga umpan balik terlambat diterima murid.",
        bukti: "Portofolio Teks Murid",
        kebutuhanPembinaan: "Menerapkan rubrik penilaian antarteman (peer-review) dengan panduan kriteria jelas."
      }
    ],
    catatanPrioritas: "Prioritas pada Aspek 1 (Etika kritik santun) dan Aspek 3 (Kreativitas produksi teks orisinal).",
    matriksBefore: {
      peranGuru: "Mengoreksi kesalahan tata bahasa secara mekanis dengan tinta merah dan dominan ceramah kaidah kebahasaan satu arah.",
      aktivitasMurid: "Mengerjakan LKS menjawab pertanyaan 5W+1H dari teks anekdot asing tanpa ruang berkreasi mandiri.",
      konteksNyata: "Mengulang kisah fiktif klasik tanpa refleksi kondisi kekinian atau fenomena sekitar lingkungan murid.",
      refleksiMurid: 'Hanya ada pertanyaan singkat formalitas: "Ada yang mau ditanyakan sebelum pulang?", tanpa penarikan makna.'
    }
  },
  arahkan: {
    periode: "Semester Ganjil 2025/2026",
    fokusPerubahan: "Meningkatkan keterampilan berpikir kritis dan kesantunan berbahasa murid melalui penulisan teks anekdot berbasis fakta sosial dan komik digital.",
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: "Penyelarasan modul ajar teks anekdot dengan integrasi nilai profil pelajar Pancasila (Kritis & Kreatif)",
        indikatorKeberhasilan: "Modul ajar memuat rubrik diferensiasi produk (naskah panggung / komik strip)",
        waktu: "18 Agustus 2025",
        penanggungJawab: "Kusnandar, M.Si & Ahmad Fauzi"
      },
      {
        id: 2,
        kegiatanPembinaan: "Coaching teknik fasilitasi diskusi isu kontemporer tanpa memicu ujaran kebencian",
        indikatorKeberhasilan: "Guru menguasai strategi de-eskalasi emosi dan framing kritik konstruktif",
        waktu: "25 Agustus 2025",
        penanggungJawab: "Kusnandar, M.Si"
      },
      {
        id: 3,
        kegiatanPembinaan: "Observasi kelas penulisan kolaboratif dan pameran karya mini (Gallery Walk)",
        indikatorKeberhasilan: "Seluruh kelompok menyelesaikan komik anekdot dengan pesan positif",
        waktu: "08 September 2025",
        penanggungJawab: "Kusnandar, M.Si & Tim Pengembang SMAS Rimba Madya"
      }
    ],
    tandaTangan: {
      pengawas: "Kusnandar, M.Si",
      kepalaSekolah: "Pajar Hariyanto, S.Pd.",
      guru: "Ivany Ratna Ekandini, S.Pd.",
      tanggalDisepakati: "2025-08-25"
    }
  },
  maknai: {
    tanggal: "2025-08-26",
    coaching: {
      tujuan: "Saya ingin murid berani bersuara kritis terhadap persoalan di sekitarnya, namun tetap menjunjung tinggi budi pekerti dan kesantunan bahasa Indonesia.",
      realitas: "Murid sering kali kebablasan menyindir teman secara personal ketika diminta membuat lelucon, atau sebaliknya menulis cerita yang sama sekali tidak ada sindiran sosialnya.",
      opsi: "Menggunakan koran daring lokal sebagai pemantik fakta dan menyepakati aturan main: kritik terhadap sistem atau fenomena, bukan fisik individu.",
      komitmen: "Saya akan memfasilitasi riset fakta mini 15 menit dan menerapkan rubrik kesantunan peer-review pada pertemuan minggu depan."
    }
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: "Rancangan telaah berita aktual tentang antrean transportasi umum sebagai basis cerita anekdot.",
        refleksi: "Murid antusias menghubungkan pengalaman pribadi saat naik bus kota dengan struktur anekdot.",
        perbaikanBerikutnya: "Mempertegas bagian koda (penutup) agar pesan moral tersampaikan lugas."
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: "Penggunaan aplikasi Canva untuk memformat anekdot dalam bentuk komik strip 4 panel.",
        refleksi: "Hasil visual sangat variatif dan menarik, murid yang tadinya pendiam menjadi sangat ekspresif lewat gambar komik.",
        perbaikanBerikutnya: "Menjaga keseimbangan antara keindahan visual dan ketajaman sindiran teks anekdot."
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: "Pameran karya kelas Gallery Walk di mana setiap meja memajang komik dan murid lain menempelkan sticky notes apresiasi.",
        refleksi: "Kelas dipenuhi tawa positif dan apresiasi konstruktif; tingkat keterlibatan mencapai 100%.",
        perbaikanBerikutnya: "Mengumpulkan karya komik menjadi sebuah antologi digital e-Book perpustakaan sekolah."
      }
    ]
  },
  uji: {
    u1_observasi: {
      tanggal: "2025-09-08",
      hariTanggal: "Senin, 08 September 2025",
      tahapObservasi: "akhir",
      kelas: "Fase E / Kelas X-4",
      indikatorList: [
        { id: 1, indikator: "Murid memahami tujuan dan manfaat pembelajaran", dimensi: "Berkesadaran", score: 4, catatan: "Murid mengerti pentingnya etika kritik santun dalam demokrasi." },
        { id: 2, indikator: "Murid menyadari proses dan kemajuan belajarnya", dimensi: "Berkesadaran", score: 4, catatan: "Murid aktif mencocokkan draft dengan rubrik penulisan di layar." },
        { id: 3, indikator: "Pembelajaran dikaitkan dengan pengalaman murid", dimensi: "Bermakna", score: 4, catatan: "Topik antrean kantin dan PR menumpuk diangkat secara jenaka." },
        { id: 4, indikator: "Guru memakai konteks kehidupan nyata yang relevan", dimensi: "Bermakna", score: 4, catatan: "Berita layanan publik Kota Bogor dijadikan sumber data inspirasi." },
        { id: 5, indikator: "Suasana aman, positif; murid antusias dan berani mencoba", dimensi: "Menggembirakan", score: 4, catatan: "Tawa ceria terdengar riuh namun tetap kondusif dan saling menghargai." },
        { id: 6, indikator: "Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri", dimensi: "Memahami", score: 4, catatan: "Murid fasih menjelaskan perbedaan anekdot dengan lelucon slapstick biasa." },
        { id: 7, indikator: "Murid menerapkan pengetahuan pada tugas/masalah nyata", dimensi: "Mengaplikasikan", score: 4, catatan: "Komik strip yang dihasilkan sarat kritik membangun dan bernilai artistik tinggi." },
        { id: 8, indikator: "Murid diberi waktu merefleksikan dan memakai umpan balik", dimensi: "Merefleksikan", score: 3, catatan: "Umpan balik antarteman berjalan lancar dengan catatan saran membangun." },
        { id: 9, indikator: "Murid menghubungkan pengetahuan dengan kehidupan nyata", dimensi: "Menghubungkan", score: 4, catatan: "Murid menghubungkan keterampilan menulis ini dengan literasi media sosial." },
        { id: 10, indikator: "Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut", dimensi: "Asesmen & tindak lanjut", score: 4, catatan: "Pemberian apresiasi verbal sangat tepat sasaran." }
      ],
      totalSkor: 39,
      persentaseCapaian: 97.5,
      apaYangDialamiMurid: "Murid merasa suaranya didengar dan dihargai, menemukan bahwa mengkritik kondisi sosial bisa dilakukan secara elegan, jenaka, dan mencerahkan.",
      kekuatanDanRekomendasi: "Kekuatan: Iklim kelas yang inklusif dan integrasi literasi digital Canva yang sangat efektif. Rekomendasi: Sebarkan format antologi komik ini ke sekolah-sekolah lain."
    },
    u2_angketMurid: {
      kodeMuridKelas: "X-4 (34 Responden)",
      tanggal: "2025-09-08",
      jumlahResponden: 34,
      items: [
        { id: 1, pernyataan: "Saya memahami tujuan dan manfaat pelajaran ini.", skorRataRata: 3.9, persentaseSetuju: 100 },
        { id: 2, pernyataan: "Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.", skorRataRata: 3.8, persentaseSetuju: 97.1 },
        { id: 3, pernyataan: "Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.", skorRataRata: 3.7, persentaseSetuju: 94.1 },
        { id: 4, pernyataan: "Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.", skorRataRata: 3.9, persentaseSetuju: 97.1 },
        { id: 5, pernyataan: "Saya merasa aman, senang, dan bersemangat selama pelajaran.", skorRataRata: 4, persentaseSetuju: 100 }
      ],
      halPalingBermakna: "Bisa menyampaikan keresahan tentang fasilitas sekolah lewat gambar komik lucu tanpa takut dimarahi guru.",
      kesulitanMurid: "Mencari punchline (kelucuan) yang tetap sopan dan bermakna mendalam."
    },
    matriksAfter: {
      peranGuru: "Menjadi kurator karya kreatif, fasilitator dialog ide bernalar kritis, dan coach proses belajar.",
      aktivitasMurid: "Melakukan riset fakta riil, menggambar komik strip di Canva, dan saling memberi umpan balik apresiatif.",
      konteksNyata: "Mengangkat isu nyata kebiasaan membuang sampah, etika antre kantin, dan budaya bermedia sosial.",
      refleksiMurid: 'Formulir refleksi kesadaran diri: "Pelajaran moral apa yang saya petik dari karya teman saya?".'
    }
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: "Peran guru",
        sebelumSambung: "Mengoreksi kesalahan tata bahasa secara mekanis dengan tinta merah.",
        setelahSambung: "Menjadi kurator karya kreatif dan fasilitator dialog ide bernalar kritis.",
        buktiKode: "BKT-IND-01 (Portofolio Komik Kelas)"
      },
      {
        aspek: "Aktivitas murid",
        sebelumSambung: "Mengerjakan LKS menjawab pertanyaan 5W+1H dari teks anekdot asing.",
        setelahSambung: "Melakukan riset fakta, menggambar komik strip, dan saling memberi umpan balik apresiatif.",
        buktiKode: "BKT-IND-02 (Pameran Sticky Notes)"
      },
      {
        aspek: "Konteks kehidupan nyata",
        sebelumSambung: "Mengulang kisah Nasruddin Hoja tanpa refleksi kondisi kekinian.",
        setelahSambung: "Mengangkat persoalan nyata kebiasaan membuang sampah, etika antre, dan budaya gadget.",
        buktiKode: "BKT-IND-03 (Bahan Berita Aktual)"
      },
      {
        aspek: "Refleksi murid",
        sebelumSambung: 'Hanya ada pertanyaan: "Ada yang mau ditanyakan sebelum pulang?".',
        setelahSambung: 'Formulir refleksi kesadaran diri: "Pelajaran moral apa yang saya petik dari karya teman saya?".',
        buktiKode: "BKT-IND-04 (Buku Refleksi Siswa)"
      }
    ],
    dataDampak: getTeacherDescriptiveDataDampak("Ivany Ratna Ekandini, S.Pd.", "Bahasa Indonesia", "SMAS Rimba Madya")
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: "Dua naskah komik perlu perbaikan ejaan tanda baca dialog langsung.",
        tindakLanjut: "Bimbingan kilat kaidah PUEBI tanda petik dalam kalimat langsung.",
        penanggungJawab: "Ivany Ratna Ekandini, S.Pd.",
        waktu: "11 September 2025",
        hasil: "Naskah diperbaiki sempurna oleh siswa yang bersangkutan."
      },
      {
        id: 2,
        temuanSupervisi: "Penyusunan e-Book antologi digital komik anekdot murid.",
        tindakLanjut: "Penggabungan file PDF ber-ISBN di bawah binaan perpustakaan sekolah.",
        penanggungJawab: "Ivany Ratna Ekandini & Tim Literasi SMAS Rimba Madya",
        waktu: "20 September 2025",
        hasil: "e-Book terbit dan dapat diunduh di website sekolah."
      }
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: "Literasi Menyenangkan: Mengubah Teks Anekdot Menjadi Komik Bernalar Kritis dengan SAMBUNG",
        sasaran: "Guru Bahasa Indonesia SMA Se-Wilayah VII Jawa Barat",
        bentuk: "Webinar Berbagi Praktik Baik PMM",
        waktu: "27 September 2025"
      }
    ]
  },
  lastUpdated: "2025-09-28T10:00:00.000Z"
};
var SEED_SAMBUNG_SITI = {
  selidiki: {
    tanggal: "2025-09-01",
    items: [
      {
        id: 1,
        aspek: "Tujuan dan kesadaran murid tentang belajar",
        kondisiAwal: "Murid menganggap materi gelombang dan resonansi sebatas hafalan rumus cepat rambat v = f \xD7 \u03BB tanpa mengetahui penerapannya dalam teknologi speaker gawai dan batas pendengaran aman.",
        bukti: "Pre-test diagnostik kelas XI-MIPA SMAS YPHB",
        kebutuhanPembinaan: "Menghubungkan konsep frekuensi gelombang bunyi dengan teknologi audio smartphone dan mitigasi polusi suara.",
        isPrioritas: true
      },
      {
        id: 2,
        aspek: "Konteks kehidupan nyata",
        kondisiAwal: "Soal buku cetak bersifat rumus matematis abstrak tanpa mengaitkan kebiasaan murid memakai headset berjam-jam.",
        bukti: "LKS Fisika Edisi Lama",
        kebutuhanPembinaan: "Memasukkan studi kasus nyata teknologi peredam bising (active noise cancelling) dan ambang batas desibel aman.",
        isPrioritas: true
      },
      {
        id: 3,
        aspek: "Aktivitas memahami dan mengaplikasikan",
        kondisiAwal: "Murid hanya mendengarkan garpu tala yang dibunyikan guru di depan kelas tanpa mencoba eksperimen sendiri.",
        bukti: "Lembar Catatan Kelas",
        kebutuhanPembinaan: "Mengintegrasikan aplikasi smartphone Sound Generator & Osiloskop Virtual serta tabung resonansi di meja kelompok."
      },
      {
        id: 4,
        aspek: "Aktivitas merefleksikan dan menghubungkan",
        kondisiAwal: "Tidak ada sesi menarik simpulan bersama tentang makna fisis resonansi bunyi dan kesehatan indra pendengaran.",
        bukti: "Jurnal Harian Guru",
        kebutuhanPembinaan: 'Merancang lembar refleksi akustik sehat: "Bagaimana mengatur volume earphone agar tidak merusak sel rambut koklea?".'
      },
      {
        id: 5,
        aspek: "Suasana menggembirakan",
        kondisiAwal: "Murid pasif karena merasa fisika gelombang penuh hitungan trigonometri yang rumit.",
        bukti: "Wawancara Siswa Awal",
        kebutuhanPembinaan: "Eksplorasi visual gelombang sinusoidal dan tantangan tebak frekuensi nada musik yang menyenangkan."
      },
      {
        id: 6,
        aspek: "Asesmen dan tindak lanjut",
        kondisiAwal: "Asesmen hanya menguji kemampuan rumus tanpa menguji keterampilan analisis fenomena resonansi.",
        bukti: "Kuis Bab Gelombang 2024",
        kebutuhanPembinaan: "Asesmen unjuk kerja penyelidikan resonansi tabung udara dan frekuensi nada."
      }
    ],
    catatanPrioritas: "Prioritas pada Aspek 1 (Kesadaran Relevansi Bunyi) dan Aspek 3 (Aplikasi Eksperimen Virtual Audio).",
    matriksBefore: {
      peranGuru: "Penceramah satu arah yang menulis rumus gelombang v = f \xD7 \u03BB di papan tulis dan meminta murid menghafal perhitungannya.",
      aktivitasMurid: "Menyalin rumus dan mengerjakan soal latihan numerik di buku catatan tanpa mengamati wujud gelombang secara nyata.",
      konteksNyata: "Soal abstrak murni tentang dawai dan pipa organa tanpa kaitan dengan perangkat audio atau earphone yang murid gunakan.",
      refleksiMurid: "Tidak pernah ada refleksi; murid langsung bubar setelah bel berbunyi tanpa penarikan intisari belajar."
    }
  },
  arahkan: {
    periode: "Semester Ganjil 2025/2026",
    fokusPerubahan: "Meningkatkan pemahaman konseptual dan keterampilan inkuiri murid pada materi Gelombang Mekanik dan Resonansi Bunyi melalui eksperimen audio virtual dan analisis kesehatan pendengaran di SMAS YPHB.",
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: "Penyusunan modul ajar fisika gelombang kontekstual berbantuan aplikasi Sound Generator dan Osiloskop Digital",
        indikatorKeberhasilan: "Modul ajar memuat diferensiasi eksperimen, panduan aplikasi digital, dan rubrik asesmen otentik",
        waktu: "05 September 2025",
        penanggungJawab: "Kusnandar, M.Si & Siti Salma, S.Pd"
      },
      {
        id: 2,
        kegiatanPembinaan: "Coaching reflektif strategi Scaffolding analisis hubungan frekuensi, cepat rambat, dan panjang gelombang",
        indikatorKeberhasilan: "Guru terampil memandu penemuan konsep resonansi tanpa mendikte hasil eksperimen",
        waktu: "12 September 2025",
        penanggungJawab: "Kusnandar, M.Si"
      },
      {
        id: 3,
        kegiatanPembinaan: "Observasi kelas kolaboratif penyelidikan resonansi tabung kolom udara dan pengukuran frekuensi",
        indikatorKeberhasilan: "Seluruh kelompok murid berhasil membuktikan fenomena resonansi dan menghitung cepat rambat bunyi di udara",
        waktu: "18 September 2025",
        penanggungJawab: "Kusnandar, M.Si & Joko Pitoyo, S.Pd., M.M."
      }
    ],
    tandaTangan: {
      pengawas: "Kusnandar, M.Si",
      kepalaSekolah: "Joko Pitoyo, S.Pd., M.M.",
      guru: "Siti Salma, S.Pd",
      tanggalDisepakati: "2025-09-12"
    }
  },
  maknai: {
    tanggal: "2025-09-13",
    coaching: {
      tujuan: "Saya ingin murid menyadari bahwa fisika gelombang bukan sebatas rumus di buku, tetapi sains di balik setiap dentuman musik yang mereka nikmati dan kunci menjaga telinga tetap sehat seumur hidup.",
      realitas: "Murid sering menghafal rumus v = f \xD7 \u03BB namun bingung menjelaskan mengapa suara petir bisa menggetarkan kaca jendela atau mengapa nada gitar berubah saat senar dipetik di fret berbeda.",
      opsi: "Memanfaatkan aplikasi generator nada di gawai mereka sendiri dan tabung resonansi air sehingga gelombang bunyi dapat didengar dan diamati perubahannya secara nyata.",
      komitmen: "Saya akan menerapkan LKPD inkuiri resonansi bunyi dan menugaskan kelompok menganalisis batas aman paparan suara earphone pada pertemuan 18 September."
    }
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: "Demonstrasi garpu tala kembar dan simulasi gelombang transversal vs longitudinal di PhET Wave on a String.",
        refleksi: "Murid antusias mengamati perambatan rapatan dan renggangan pada medium udara.",
        perbaikanBerikutnya: "Menghubungkan visual gelombang langsung dengan generator frekuensi audio smartphone."
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: "Penggunaan aplikasi Sound Generator untuk mencari titik dengung resonansi pada tabung kolom udara berair.",
        refleksi: "Murid berebut mengatur ketinggian air hingga mendengar bunyi penguatan resonansi; pemahaman konsep meningkat drastis.",
        perbaikanBerikutnya: "Menyediakan panduan membaca skala tabung agar pengukuran panjang gelombang lebih presisi."
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: "Studi kasus analisis kebisingan lingkungan sekolah dan batas aman desibel pemakaian headset.",
        refleksi: "Murid menunjukkan kesadaran metakognitif tinggi dan merumuskan komitmen menjaga kesehatan pendengaran.",
        perbaikanBerikutnya: "Membuat poster digital edukasi akustik sehat untuk dipajang di mading sekolah SMAS YPHB."
      }
    ]
  },
  uji: {
    u1_observasi: {
      tanggal: "2025-09-18",
      hariTanggal: "Kamis, 18 September 2025",
      tahapObservasi: "akhir",
      kelas: "Fase F / Kelas XI-MIPA",
      indikatorList: [
        { id: 1, indikator: "Murid memahami tujuan dan manfaat pembelajaran", dimensi: "Berkesadaran", score: 4, catatan: "Murid memahami relevansi resonansi bunyi dengan teknologi audio dan kesehatan pendengaran." },
        { id: 2, indikator: "Murid menyadari proses dan kemajuan belajarnya", dimensi: "Berkesadaran", score: 4, catatan: "Murid mencatat data percobaan resonansi secara mandiri dan membandingkan hasil perhitungan." },
        { id: 3, indikator: "Pembelajaran dikaitkan dengan pengalaman murid", dimensi: "Bermakna", score: 4, catatan: "Koneksi dengan kebiasaan memakai earphone dan akustik ruangan kelas sangat kuat." },
        { id: 4, indikator: "Guru memakai konteks kehidupan nyata yang relevan", dimensi: "Bermakna", score: 4, catatan: "Fenomena kaca bergetar akibat petir dan teknologi noise cancelling dijadikan studi kasus." },
        { id: 5, indikator: "Suasana aman, positif; murid antusias dan berani mencoba", dimensi: "Menggembirakan", score: 4, catatan: "Suasana kelas sangat dinamis dan interaktif saat eksperimen nada resonansi." },
        { id: 6, indikator: "Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri", dimensi: "Memahami", score: 4, catatan: "Murid fasih menjelaskan syarat terjadinya resonansi frekuensi alami dengan bahasa sendiri." },
        { id: 7, indikator: "Murid menerapkan pengetahuan pada tugas/masalah nyata", dimensi: "Mengaplikasikan", score: 4, catatan: "Perhitungan cepat rambat bunyi di udara dari data resonansi tabung tuntas akurat." },
        { id: 8, indikator: "Murid diberi waktu merefleksikan dan memakai umpan balik", dimensi: "Merefleksikan", score: 4, catatan: "Umpan balik seketika saat murid memverifikasi nada resonansi sangat memotivasi." },
        { id: 9, indikator: "Murid menghubungkan pengetahuan dengan kehidupan nyata", dimensi: "Menghubungkan", score: 4, catatan: "Murid mengaitkan bahaya gelombang infrasonik dan ultrasonik bagi ekosistem." },
        { id: 10, indikator: "Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut", dimensi: "Asesmen & tindak lanjut", score: 4, catatan: "Kuis formatif 3 soal pemecahan masalah diselesaikan dengan capaian 95.8%." }
      ],
      totalSkor: 40,
      persentaseCapaian: 100,
      apaYangDialamiMurid: "Murid mengalami pengalaman belajar sains yang nyata dan bermakna, merasa fisika bunyi sangat dekat dengan keseharian mereka.",
      kekuatanDanRekomendasi: "Kekuatan: Integrasi aplikasi Sound Generator di smartphone murid sangat inovatif. Rekomendasi: Disarankan berbagi modul praktikum ini pada MGMP Fisika Kota Bogor."
    },
    u2_angketMurid: {
      kodeMuridKelas: "XI-MIPA (35 Responden)",
      tanggal: "2025-09-18",
      jumlahResponden: 35,
      items: [
        { id: 1, pernyataan: "Saya memahami tujuan dan manfaat pelajaran ini.", skorRataRata: 4, persentaseSetuju: 100 },
        { id: 2, pernyataan: "Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.", skorRataRata: 3.8, persentaseSetuju: 94.3 },
        { id: 3, pernyataan: "Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.", skorRataRata: 3.9, persentaseSetuju: 97.1 },
        { id: 4, pernyataan: "Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.", skorRataRata: 4, persentaseSetuju: 100 },
        { id: 5, pernyataan: "Saya merasa aman, senang, dan bersemangat selama pelajaran.", skorRataRata: 4, persentaseSetuju: 100 }
      ],
      halPalingBermakna: "Mendengar bunyi dengung resonansi menguat saat tabung digeser dan tahu batas aman volume musik di smartphone.",
      kesulitanMurid: "Menentukan panjang kolom udara saat resonansi kedua dan ketiga dalam kondisi ruang kelas ramai."
    },
    matriksAfter: {
      peranGuru: "Fasilitator penyelidikan akustik interaktif yang memandu murid membedah fenomena gelombang bunyi.",
      aktivitasMurid: "Mengoperasikan sound generator, mengukur kolom udara resonansi, dan menganalisis gelombang audio.",
      konteksNyata: "Studi kasus teknologi peredam bising aktif (ANC) headphone dan batas desibel perlindungan pendengaran.",
      refleksiMurid: 'Refleksi komprehensif metakognitif: "Bagaimana perilaku mendengarkan musik saya setelah memahami resonansi bunyi?".'
    }
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: "Peran guru",
        sebelumSambung: "Penceramah satu arah yang mendiktekan rumus gelombang di papan tulis.",
        setelahSambung: "Fasilitator penyelidikan akustik interaktif yang memandu murid membedah fenomena gelombang bunyi.",
        buktiKode: "BKT-FIS-01 (Foto Eksperimen Tabung Resonansi)"
      },
      {
        aspek: "Aktivitas murid",
        sebelumSambung: "Menyalin rumus dan menghafal definisi tanpa mengamati wujud gelombang.",
        setelahSambung: "Mengoperasikan sound generator gawai, mengukur resonansi, dan menganalisis gelombang audio.",
        buktiKode: "BKT-FIS-02 (Tangkapan Layar Osiloskop Murid)"
      },
      {
        aspek: "Konteks kehidupan nyata",
        sebelumSambung: "Soal abstrak pipa organa tanpa kaitan dengan perangkat audio murid.",
        setelahSambung: "Studi kasus teknologi headphone active noise cancelling dan batas aman desibel pendengaran.",
        buktiKode: "BKT-FIS-03 (LKPD Kontekstual Audio YPHB)"
      },
      {
        aspek: "Refleksi murid",
        sebelumSambung: "Tidak pernah ada refleksi; murid langsung bubar setelah bel berbunyi.",
        setelahSambung: "Refleksi kesadaran kesehatan pendengaran dan etika polusi suara di lingkungan sekitar.",
        buktiKode: "BKT-FIS-04 (Papan Refleksi Padlet Murid)"
      }
    ],
    dataDampak: getTeacherDescriptiveDataDampak("Siti Salma, S.Pd", "Fisika", "SMAS YPHB")
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: "Dua kelompok murid membutuhkan ruang lebih tenang saat mengukur dengung resonansi ketiga.",
        tindakLanjut: "Memanfaatkan laboratorium fisika berpintu ganda untuk sesi pengukuran resonansi lanjutan.",
        penanggungJawab: "Siti Salma, S.Pd & Laboran Fisika",
        waktu: "22 September 2025",
        hasil: "Tingkat akurasi data frekuensi mencapai 98%."
      },
      {
        id: 2,
        temuanSupervisi: "Desain infografis kampanye batas desibel aman pendengaran murid perlu disebarluaskan.",
        tindakLanjut: "Mencetak poster edukasi dan mengunggahnya ke media sosial sekolah SMAS YPHB.",
        penanggungJawab: "Siti Salma, S.Pd & OSIS SMAS YPHB",
        waktu: "26 September 2025",
        hasil: "Poster terpasang di area perpustakaan dan lorong kelas."
      }
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: "Inovasi Pembelajaran Gelombang Bunyi Berbasis Audio Digital & Pendekatan SAMBUNG",
        sasaran: "Seluruh Guru Fisika SMA Binaan Pengawas Kusnandar, M.Si",
        bentuk: "Berbagi Praktik Baik Kombel & Diseminasi MGMP Fisika",
        waktu: "03 Oktober 2025"
      }
    ]
  },
  lastUpdated: "2025-09-28T10:00:00.000Z"
};

// src/data/instrumentData.ts
var TELAAH_ITEMS = [
  {
    id: 1,
    category: "Identitas RPP",
    aspect: "Terdapat Satuan Pendidikan, Mata Pelajaran, Fase/Kelas, Materi Pokok, Alokasi Waktu yang jelas dan lengkap."
  },
  {
    id: 2,
    category: "Identifikasi (Opsional)",
    aspect: "Murid (Opsional): Identifikasi kesiapan murid sebelum belajar, seperti pengetahuan awal, minat, latar belakang, dan kebutuhan belajar.",
    isOptional: true
  },
  {
    id: 3,
    category: "Identifikasi (Opsional)",
    aspect: "Materi Pelajaran (Opsional): Menuliskan analisis materi pelajaran seperti jenis pengetahuan yang akan dicapai, relevansi nyata, tingkat kesulitan, struktur materi, nilai & karakter.",
    isOptional: true
  },
  {
    id: 4,
    category: "Dimensi Profil Lulusan",
    aspect: "Terdapat Dimensi Profil Lulusan yang akan dicapai dalam pembelajaran, ditentukan selaras dengan tujuan dan kegiatan yang dilakukan."
  },
  {
    id: 5,
    category: "Keselarasan",
    aspect: "Tujuan pembelajaran, langkah pembelajaran, dan asesmen pembelajaran sudah mengarah pada pencapaian Dimensi Profil Lulusan."
  },
  {
    id: 6,
    category: "Keselarasan",
    aspect: "Tujuan pembelajaran, langkah pembelajaran, dan asesmen pembelajaran sudah selaras (saling terhubung secara utuh)."
  },
  {
    id: 7,
    category: "Desain Pembelajaran",
    aspect: "Tujuan Pembelajaran: Menuliskan tujuan pembelajaran yang mencakup kompetensi dan konten pada ruang lingkup materi dengan menggunakan kata kerja operasional yang relevan."
  },
  {
    id: 8,
    category: "Desain Pembelajaran",
    aspect: "Praktik Pedagogis: Menuliskan Model/Strategi/Metode/Media/Sumber pembelajaran yang dipilih untuk mencapai tujuan belajar."
  },
  {
    id: 9,
    category: "Desain Pembelajaran",
    aspect: "Lingkungan Pembelajaran: Menuliskan lingkungan pembelajaran yang ingin dikembangkan dalam budaya belajar, ruang fisik dan/atau ruang virtual tergambar pada langkah/asesmen."
  },
  {
    id: 10,
    category: "Desain Pembelajaran",
    aspect: "Kemitraan Pembelajaran (Opsional): Menuliskan kegiatan kemitraan atau kolaborasi dalam dan/atau luar lingkup sekolah tergambar pada langkah dan/atau asesmen.",
    isOptional: true
  },
  {
    id: 11,
    category: "Desain Pembelajaran",
    aspect: "Pemanfaatan Digital (Opsional): Menuliskan pemanfaatan teknologi digital untuk menciptakan pembelajaran interaktif, kolaboratif, kontekstual tergambar pada langkah/asesmen.",
    isOptional: true
  },
  {
    id: 12,
    category: "Pengalaman Belajar",
    aspect: "Langkah memfasilitasi murid merasakan pengalaman belajar MEMAHAMI (terlibat aktif mengonstruksi pengetahuan mendalam konsep/materi dari berbagai sumber/konteks: menghubungkan pengetahuan baru, stimulasi berpikir, konteks nyata, eksploratif-kolaboratif, moral-etika, karakter)."
  },
  {
    id: 13,
    category: "Pengalaman Belajar",
    aspect: "Langkah memfasilitasi murid merasakan pengalaman belajar MENGAPLIKASI (mengaplikasikan pemahaman secara kontekstual dalam kehidupan nyata: menghubungkan konsep baru, penerapan situasi nyata, eksplorasi lanjut, berpikir kritis & mencari solusi inovatif)."
  },
  {
    id: 14,
    category: "Pengalaman Belajar",
    aspect: "Langkah memfasilitasi murid merasakan pengalaman belajar MEREFLEKSI (evaluasi & memaknai proses/hasil, tindak lanjut, kelola belajar mandiri: motivasi cara belajar, evaluasi diri, strategi berpikir, metakognisi, regulasi emosi)."
  },
  {
    id: 15,
    category: "Pengalaman Belajar",
    aspect: "Langkah memfasilitasi tindakan saling MEMULIAKAN antara Guru-Murid, Murid-Guru, Murid-Murid tercermin dalam bahasa verbal/nonverbal (menghargai keberagaman, budaya saling menghormati, adaptif inklusif)."
  },
  {
    id: 16,
    category: "Pengalaman Belajar",
    aspect: "Prinsip pembelajaran mendalam berupa berkesadaran, bermakna, dan/atau menggembirakan sudah tergambar pada setiap pengalaman belajar di langkah pembelajaran."
  },
  {
    id: 17,
    category: "Pengalaman Belajar",
    aspect: "Perencanaan pembelajaran sudah mengakomodir pengalaman belajar yang sesuai dengan karakteristik peserta didik."
  },
  {
    id: 18,
    category: "Asesmen",
    aspect: "Asesmen awal pembelajaran dilaksanakan untuk mendapatkan bukti kesiapan belajar emosional/mental, pengetahuan awal, kebutuhan belajar serta tindak lanjut hasil asesmen awal."
  },
  {
    id: 19,
    category: "Asesmen",
    aspect: "Asesmen proses (formatif) dilaksanakan sesuai perencanaan memantau perkembangan belajar murid, umpan balik kontinyu timbal-balik melalui beragam teknik."
  },
  {
    id: 20,
    category: "Asesmen",
    aspect: "Asesmen hasil pembelajaran (sumatif) direncanakan mengukur ketercapaian kompetensi dengan beragam cara (tes, portofolio, proyek, presentasi, dsb)."
  },
  {
    id: 21,
    category: "Lampiran",
    aspect: "Rubrik Penilaian: Terdapat kriteria ketercapaian tujuan pembelajaran (KKTP) dari masing-masing tujuan pembelajaran yang dinilai secara transparan."
  },
  {
    id: 22,
    category: "Lampiran",
    aspect: "Lembar Kerja Murid (LKM/LKPD): Lembar kerja murid selaras dengan tujuan pembelajaran dan alur kegiatan pembelajaran."
  }
];
var OBSERVASI_ITEMS = [
  // 1. PROFIL LULUSAN (2 butir)
  {
    id: "1",
    category: "PROFIL LULUSAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan tujuan pembelajaran yang mencakup sikap, pengetahuan, dan keterampilan, serta terlihat dalam aktivitas yang membangun karakter dan kompetensi murid."
  },
  {
    id: "2",
    category: "PROFIL LULUSAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya kegiatan penilaian yang digunakan untuk melihat ketercapaian profil lulusan serta selaras dengan tujuan pembelajaran."
  },
  // 2. PRINSIP PEMBELAJARAN (3 butir)
  {
    id: "3",
    category: "PRINSIP PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan alur kegiatan yang jelas, terstruktur, dan mampu menjaga fokus serta keterlibatan murid sepanjang pembelajaran."
  },
  {
    id: "4",
    category: "PRINSIP PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan keterkaitan materi dan aktivitas dengan kehidupan nyata atau pengalaman murid."
  },
  {
    id: "5",
    category: "PRINSIP PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan aktivitas yang menarik, menantang, dan mampu memotivasi serta menggembirakan murid."
  },
  // 3. PENGALAMAN BELAJAR (3 butir)
  {
    id: "6",
    category: "PENGALAMAN BELAJAR",
    aspect: "Pelaksanaan pembelajaran menunjukkan keterlibatan aktif murid dalam memahami materi melalui kegiatan mengamati, bertanya, berdiskusi, atau menggali informasi dari berbagai sumber."
  },
  {
    id: "7",
    category: "PENGALAMAN BELAJAR",
    aspect: "Pelaksanaan pembelajaran menunjukkan kegiatan yang mendorong murid menerapkan pengetahuan dalam situasi nyata atau kontekstual."
  },
  {
    id: "8",
    category: "PENGALAMAN BELAJAR",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya kegiatan refleksi, di mana murid menilai proses dan hasil belajar serta merencanakan perbaikan."
  },
  // 4. KERANGKA PEMBELAJARAN (4 butir)
  {
    id: "9",
    category: "KERANGKA PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan penggunaan strategi/metode pembelajaran yang jelas dan sesuai dengan tujuan."
  },
  {
    id: "10",
    category: "KERANGKA PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya interaksi dan kerja sama antara guru dengan murid maupun antar murid."
  },
  {
    id: "11",
    category: "KERANGKA PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan suasana kelas yang aman, nyaman, tertib, dan mendukung proses belajar."
  },
  {
    id: "12",
    category: "KERANGKA PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan penggunaan media atau teknologi/digital yang relevan untuk mendukung pembelajaran."
  },
  // 5. BUDAYA BELAJAR MURID (3 butir)
  {
    id: "13",
    category: "BUDAYA BELAJAR MURID",
    aspect: "Pelaksanaan pembelajaran menunjukkan sikap saling menghargai, menghormati, dan memuliakan antar murid dalam interaksi belajar."
  },
  {
    id: "14",
    category: "BUDAYA BELAJAR MURID",
    aspect: "Pelaksanaan pembelajaran menunjukkan murid memahami tujuan pembelajaran dan mengaitkan materi dengan pengalaman sebelumnya."
  },
  {
    id: "15",
    category: "BUDAYA BELAJAR MURID",
    aspect: "Pelaksanaan pembelajaran menunjukkan murid memiliki kesempatan memilih cara belajar, percaya diri, dan melakukan refleksi diri."
  },
  // 6. CAPAIAN BELAJAR MURID (2 butir)
  {
    id: "16",
    category: "CAPAIAN BELAJAR MURID",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya ketercapaian tujuan pembelajaran sesuai dengan kemampuan dan perkembangan murid."
  },
  {
    id: "17",
    category: "CAPAIAN BELAJAR MURID",
    aspect: "Pelaksanaan pembelajaran menunjukkan murid belajar secara mandiri melalui aktivitas yang relevan dengan kehidupan sehari-hari."
  },
  // 7. MENGAJAR SECARA EFEKTIF (3 butir)
  {
    id: "18",
    category: "MENGAJAR SECARA EFEKTIF",
    aspect: "Pelaksanaan pembelajaran menunjukkan guru menghargai perbedaan kemampuan, latar belakang, dan kebutuhan belajar murid."
  },
  {
    id: "19",
    category: "MENGAJAR SECARA EFEKTIF",
    aspect: "Pelaksanaan pembelajaran menunjukkan pengelolaan kelas yang efektif, pembelajaran yang kontekstual, dan keterpaduan antar kegiatan."
  },
  {
    id: "20",
    category: "MENGAJAR SECARA EFEKTIF",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya kegiatan refleksi di akhir pembelajaran yang mengacu pada hasil belajar murid."
  },
  // 8. ASESMEN OTENTIK DAN BERKEADILAN (3 butir)
  {
    id: "21",
    category: "ASESMEN OTENTIK DAN BERKEADILAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan guru melakukan penilaian selama proses belajar (formatif) dan memberikan umpan balik kepada murid."
  },
  {
    id: "22",
    category: "ASESMEN OTENTIK DAN BERKEADILAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya penilaian akhir untuk mengetahui ketercapaian tujuan pembelajaran."
  },
  {
    id: "23",
    category: "ASESMEN OTENTIK DAN BERKEADILAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan guru menggunakan hasil penilaian untuk memperbaiki pembelajaran atau memberikan tindak lanjut."
  },
  // 9. KEPEMIMPINAN PEMBELAJARAN (2 butir)
  {
    id: "24",
    category: "KEPEMIMPINAN PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan arah pembelajaran yang sejalan dengan visi sekolah dan berpusat pada murid."
  },
  {
    id: "25",
    category: "KEPEMIMPINAN PEMBELAJARAN",
    aspect: "Pelaksanaan pembelajaran menunjukkan adanya upaya perbaikan pembelajaran secara berkelanjutan melalui refleksi."
  }
];

// src/utils/sambungCalculations.ts
function calculateTelaahSummary(scores = {}) {
  let totalScore = 0;
  let naCount = 0;
  let evaluatedCount = 0;
  TELAAH_ITEMS.forEach((item) => {
    const val = scores[item.id];
    if (val === "NA") {
      naCount++;
    } else if (typeof val === "number") {
      totalScore += val;
      evaluatedCount++;
    }
  });
  const effectiveItemsCount = Math.max(1, 22 - naCount);
  const maxPossibleScore = effectiveItemsCount * 2;
  const finalScore = maxPossibleScore > 0 ? Math.round(totalScore / maxPossibleScore * 1e3) / 10 : 0;
  let predicate = "Perlu Perbaikan";
  if (finalScore >= 91) predicate = "Sangat Baik";
  else if (finalScore >= 81) predicate = "Baik";
  else if (finalScore >= 71) predicate = "Cukup";
  return {
    totalScore,
    maxPossibleScore,
    finalScore,
    predicate,
    evaluatedCount,
    naCount
  };
}

// src/data/autoFillData.ts
var TEACHER_AUTO_FILL_MAP = {
  // 1. FISIKA - Sondang Asih Januarti, S.Pd. (SMAN 4 Bogor)
  fisika: {
    rppUrl: "https://drive.google.com/file/d/1DemoModulAjarListrikDC/view?usp=sharing",
    lessonTitle: "Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff",
    classGrade: "Fase F / Kelas XI-Fisika 1",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 1,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: "Identitas modul lengkap, mencakup alokasi waktu dan fase F yang presisi.",
      2: "Asesmen diagnostik awal kesiapan kognitif kelistrikan dasar teridentifikasi jelas.",
      3: "Materi analisis hukum Ohm dan Kirchhoff tersusun runtut dan kontekstual.",
      4: "Profil Pelajar Bergotong Royong dan Bernalar Kritis tertuang operasional.",
      5: "Keselarasan tujuan, langkah eksperimen, dan instrumen unjuk kerja sangat padu.",
      7: "Kata kerja operasional jelas: menganalisis, membuktikan, dan merumuskan.",
      8: "Model Problem-Based Learning berbantuan simulasi virtual PhET terintegrasi kuat.",
      12: "Pengalaman MEMAHAMI difasilitasi melalui investigasi hubungan V, I, dan R.",
      13: "Pengalaman MENGAPLIKASI terwujud dalam perakitan sirkuit tertutup riil.",
      14: "Pengalaman MEREFLEKSI memandu murid menarik makna efisiensi daya listrik.",
      15: "Budaya saling memuliakan tercermin dalam pembagian peran kelompok praktikum.",
      16: "Prinsip pembelajaran bermakna dan menggembirakan tergambar di setiap sintaks.",
      21: "Rubrik penilaian KKTP memuat indikator objektif ketercapaian kompetensi."
    },
    telaahFeedback: {
      kelebihan: "Modul ajar mengintegrasikan konsep kontekstual hemat energi dengan simulasi PhET Circuit Construction Kit DC, rubrik unjuk kerja sangat operasional.",
      perbaikan: "Perkuat kemitraan dengan teknisi instalasi kelistrikan atau praktisi panel surya untuk pengayaan projek aplikatif murid.",
      rekomendasi: "Dapat dijadikan model praktik baik (Best Practice) bagi MGMP Fisika SMA Kota Bogor."
    },
    praObservasiAnswers: {
      q1_kd_indikator: "Menyelidiki hubungan kuat arus, tegangan, dan hambatan pada rangkaian tertutup serta membuktikan Hukum I dan II Kirchhoff melalui pengamatan empiris.",
      q2_metode: "Problem-Based Learning dengan pendekatan Deep Learning (Bermakna, Berkesadaran, Menggembirakan) agar murid mengonstruksi pemahaman sains secara mandiri.",
      q3_alat_bahan: "Simulasi virtual PhET Circuit Construction Kit DC, trainer breadboard rangkaian tertutup, multimeter digital, gawai, dan LKPD Eksploratif.",
      q4_tahapan: "Pendahuluan kontekstual fenomena sekring rumah, Investigasi kelompok mengukur arus di percabangan, Pembuktian hukum Kirchhoff, Presentasi data, dan Refleksi bersama.",
      q5_persiapan: "Menghubungkan sains dengan keamanan kelistrikan rumah tangga, membangun interaksi saling memuliakan, dan menyelipkan teka-teki pemantik rasa ingin tahu.",
      q6_materi_sulit: "Menghitung loop majemuk pada diagram sirkuit; diantisipasi dengan visualisasi grafik interaktif PhET dan bimbingan bertingkat (scaffolding).",
      q7_target_kompetensi: "Kemampuan bernalar kritis menganalisis data empiris dan gotong royong membagi tugas dalam eksperimen laboratorium.",
      q8_perhatian_khusus: "Fokus pada keterlibatan murid yang cenderung pasif saat merangkai komponen dan pembagian peran berkeadilan dalam tim.",
      supervisorNotes: "Rancangan pra-observasi sangat siap dan terstruktur. Fokus observasi kelas pada keaktifan eksperimen kelompok dan interaksi dialogis guru-murid."
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan mencakup nalar kritis dan gotong royong tampak nyata dalam aktivitas praktikum" },
      "2": { score: 2, note: "Penilaian unjuk kerja terhubung langsung dengan target profil lulusan" },
      "3": { score: 2, note: "Alur kegiatan sangat terstruktur: apersepsi aki/baterai, praktikum, hingga penarikan kesimpulan" },
      "4": { score: 2, note: "Keterkaitan konsep kuat arus dengan instalasi kelistrikan rumah sangat kontekstual" },
      "5": { score: 2, note: "Murid sangat antusias saat simulasi PhET dan perakitan sirkuit tertutup" },
      "6": { score: 2, note: "Murid aktif bertanya dan mendiskusikan perbedaan nilai hambatan pengganti" },
      "7": { score: 2, note: "Murid memecahkan kasus korsleting listrik dengan rumus Kirchhoff secara mandiri" },
      "8": { score: 2, note: "Sesi refleksi berjalan mendalam mengenai keselamatan listrik di lingkungan sekitar" },
      "9": { score: 2, note: "Sintaks Problem-Based Learning dijalankan konsisten dan efektif" },
      "10": { score: 2, note: "Kerja sama antarmurid sangat seimbang dan saling membantu" },
      "11": { score: 2, note: "Suasana kelas aman, tertib, dan inklusif bagi seluruh peserta didik" },
      "12": { score: 2, note: "Teknologi digital PhET dan multimeter dimanfaatkan optimal oleh setiap kelompok" },
      "13": { score: 2, note: "Budaya saling memuliakan dan toleransi pendapat terjaga kuat" },
      "14": { score: 2, note: "Murid mengaitkan konsep baru dengan materi arus listrik statis pertemuan lalu" },
      "15": { score: 2, note: "Murid diberi kebebasan memilih susunan sirkuit seri atau paralel untuk diuji" },
      "16": { score: 2, note: "Seluruh kelompok berhasil membuktikan Hukum Kirchhoff dengan akurasi tinggi" },
      "17": { score: 2, note: "Kemandirian belajar murid tinggi saat menganalisis hambatan geser" },
      "18": { score: 2, note: "Guru berkeliling memberi bimbingan diferensiasi bagi kelompok yang memerlukan bantuan" },
      "19": { score: 2, note: "Pengelolaan waktu dan dinamika kelas terkontrol sangat baik" },
      "20": { score: 2, note: "Refleksi akhir mengacu pada pencapaian tujuan dan rencana penghematan daya" },
      "21": { score: 2, note: "Penilaian formatif berjalan kontinyu disertai umpan balik apresiatif dari guru" },
      "22": { score: 2, note: "Kuis formatif akhir 3 butir soal pemecahan masalah dituntaskan secara objektif" },
      "23": { score: 2, note: "Hasil pengamatan langsung digunakan untuk memandu kesimpulan akhir pembelajaran" },
      "24": { score: 2, note: "Arah pembelajaran selaras dengan visi SMAN 4 Bogor yang berorientasi mutu dan karakter" },
      "25": { score: 2, note: "Guru mencatat evaluasi proses untuk perbaikan pembelajaran modul berikutnya" }
    },
    observasiFeedback: {
      kelebihan: "Pengelolaan kelas sangat hidup, murid terlibat 100% dalam eksperimen interaktif dengan simulasi digital dan alat riil, budaya saling memuliakan terasa nyata.",
      peningkatan: "Dapat ditambahkan pemantik studi kasus teknologi baterai kendaraan listrik (EV) untuk memperkaya wawasan energi terbarukan murid.",
      rekomendasi: "Direkomendasikan menjadi model kelas terbuka (Open Class) bagi guru-guru rumpun sains di sekolah dan komunitas belajar."
    },
    kesimpulanSelidiki: {
      guruBerorientasi: "Guru bertransformasi menjadi fasilitator penyelidikan inkuiri aktif yang mendampingi murid menemukan konsep kelistrikan melalui simulasi interaktif PhET dan kit eksperimen.",
      muridAktif: "Seluruh kelompok murid aktif merakit sirkuit listrik tertutup, mengukur besaran fisis secara empiris, dan berargumentasi ilmiah membuktikan Hukum Kirchhoff.",
      konteksNyata: "Pembelajaran mengaitkan konsep arus dan hambatan dengan instalasi proteksi sekring rumah tangga, pencegahan korsleting, dan efisiensi konsumsi daya listrik.",
      refleksiMurid: "Murid secara terstruktur merefleksikan makna pembelajaran bagi keselamatan diri dan merumuskan komitmen perilaku hemat energi dalam kehidupan sehari-hari."
    }
  },
  // 2. BIOLOGI - Ivany Ratna Ekandini, S.Pd. (SMAS Rimba Madya)
  biologi: {
    rppUrl: "https://drive.google.com/file/d/1DemoModulBiologiBioteknologi/view?usp=sharing",
    lessonTitle: "Bioteknologi Konvensional & Modern: Fermentasi Pangan Lokal dan Rekayasa Genetika",
    classGrade: "Fase F / Kelas XII-MIPA 2",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 2,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: "Identitas modul ajar bioteknologi terperinci dengan capaian pembelajaran fase F.",
      2: "Kesiapan awal murid mengenai mikroorganisme dan genetika dipetakan dengan baik.",
      4: "Profil Beriman & Bertakwa (Bioetika) serta Bernalar Kritis terintegrasi kuat.",
      8: "Project-Based Learning pembuatan produk fermentasi pangan lokal terstruktur jelas.",
      13: "Pengalaman MENGAPLIKASI terhubung nyata dengan pembuatan yoghurt dan tempe.",
      21: "Rubrik penilaian produk dan laporan observasi ilmiah tersusun sistematis."
    },
    telaahFeedback: {
      kelebihan: "Integrasi kearifan lokal pangan fermentasi Bogor dengan prinsip bioteknologi modern sangat inovatif dan berorientasi kecakapan hidup.",
      perbaikan: "Sertakan rubrik analisis dampak limbah proses fermentasi skala rumah tangga.",
      rekomendasi: "Sangat layak didiseminasikan dalam forum MGMP Biologi Kota Bogor."
    },
    praObservasiAnswers: {
      q1_kd_indikator: "Menganalisis prinsip bioteknologi konvensional dan modern serta mengevaluasi dampaknya terhadap ketahanan pangan dan bioetika lingkungan.",
      q2_metode: "Project-Based Learning terpadu inkuiri kontekstual untuk mendorong murid menghasilkan produk pangan fermentasi higienis dan bernilai ekonomis.",
      q3_alat_bahan: "Bahan fermentasi lokal (kedelai, singkong, susu segar), ragi/starter bakteri, pH meter, mikroskop, tayangan interaktif Canva, dan LKPD Proyek.",
      q4_tahapan: "Eksplorasi isu krisis pangan dunia, Desain protokol fermentasi, Praktik inokulasi mikroorganisme steril, Pengamatan perubahan biokimia, dan Presentasi evaluatif.",
      q5_persiapan: "Menghubungkan biologi dengan industri pangan ramah lingkungan, menciptakan suasana percobaan higienis yang menyenangkan, dan memfasilitasi dialog etika sains.",
      q6_materi_sulit: "Mekanisme rekombinasi DNA dan plasmid pada bioteknologi modern; diantisipasi dengan model visual 3D interaktif dan video animasi mekanisme CRISPR.",
      q7_target_kompetensi: "Kreativitas merancang produk bioteknologi ramah lingkungan dan kepedulian terhadap keanekaragaman hayati nusantara.",
      q8_perhatian_khusus: "Fokus pada penerapan prosedur sanitasi dan aseptik laboratorium agar produk fermentasi bebas dari kontaminan bakteri patogen.",
      supervisorNotes: "Perencanaan sangat komprehensif. Observasi kelas akan memantau kedisiplinan protokol kerja laboratorium dan keaktifan analisis ilmiah murid."
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan pembelajaran bioetika dan keterampilan proses sains teramati jelas" },
      "2": { score: 2, note: "Asesmen kinerja laboratorium selaras dengan target pencapaian murid" },
      "3": { score: 2, note: "Alur kegiatan praktikum higienis dan terstruktur dari awal hingga akhir" },
      "4": { score: 2, note: "Keterkaitan materi dengan produk UMKM tapai dan tempe Bogor sangat kuat" },
      "5": { score: 2, note: "Murid bersemangat melakukan inokulasi mikroorganisme pada media kultur" },
      "6": { score: 2, note: "Murid aktif mengamati koloni jamur tempe di bawah mikroskop dan berdiskusi" },
      "7": { score: 2, note: "Murid menganalisis faktor suhu dan keasaman terhadap kecepatan fermentasi" },
      "8": { score: 2, note: "Refleksi mendalam tentang keamanan pangan dan tanggung jawab saintis" },
      "9": { score: 2, note: "Metode Project-Based Learning diterapkan dengan pendampingan optimal" },
      "10": { score: 2, note: "Kolaborasi antarmurid dalam menjaga kebersihan meja kerja sangat baik" },
      "11": { score: 2, note: "Laboratorium tertata rapi, aman, dan mematuhi SOP keselamatan kerja" },
      "12": { score: 2, note: "Pemanfaatan gawai untuk mendokumentasikan tahapan fermentasi sangat efektif" },
      "13": { score: 2, note: "Saling menghargai pembagian tugas pengamatan berkala antaranggotanya" },
      "14": { score: 2, note: "Murid mengaitkan respirasi anaerob materi terdahulu dengan proses fermentasi" },
      "15": { score: 2, note: "Murid menentukan inovasi varian rasa pangan fermentasi secara kreatif" },
      "16": { score: 2, note: "Target pemahaman prinsip bioteknologi konvensional tercapai optimal" },
      "17": { score: 2, note: "Murid mandiri mencatat perubahan aroma, tekstur, dan pH secara berkala" },
      "18": { score: 2, note: "Guru memfasilitasi kebutuhan murid dengan bimbingan teknik aseptik yang sabar" },
      "19": { score: 2, note: "Pengelolaan waktu kegiatan praktikum berjalan tertib dan tepat" },
      "20": { score: 2, note: "Refleksi akhir mengaitkan ilmu biologi dengan peluang wirausaha generasi muda" },
      "21": { score: 2, note: "Umpan balik formatif langsung diberikan saat murid melakukan teknik pipetasi" },
      "22": { score: 2, note: "Penilaian laporan portofolio praktikum menggunakan kriteria rubrik transparan" },
      "23": { score: 2, note: "Hasil diskusi kelas dijadikan dasar perbaikan formulasi proyek lanjutan" },
      "24": { score: 2, note: "Pembelajaran selaras dengan visi SMAS Rimba Madya yang peduli lingkungan" },
      "25": { score: 2, note: "Guru melakukan evaluasi reflektif terhadap keterlaksanaan proyek bioteknologi" }
    },
    observasiFeedback: {
      kelebihan: "Penerapan protokol sains bioteknologi pangan sangat higienis, murid antusias dan berani berinovasi menciptakan produk fermentasi sehat.",
      peningkatan: "Eksplorasi analisis perbandingan nilai gizi produk sebelum dan sesudah fermentasi dapat diperdalam.",
      rekomendasi: "Layak ditampilkan dalam pameran karya ilmiah sekolah dan festival kewirausahaan siswa."
    },
    kesimpulanSelidiki: {
      guruBerorientasi: "Guru memfasilitasi pengalaman belajar inkuiri berbasis proyek fermentasi pangan lokal, memandu murid memahami peran mikroorganisme secara empiris.",
      muridAktif: "Murid mandiri merancang protokol kerja, melakukan sterilisasi bahan, mengukur parameter fermentasi, dan menganalisis data perubahan biokimia.",
      konteksNyata: "Pembelajaran berpijak pada potensi pangan lokal Kota Bogor dan solusi alternatif peningkatan nilai gizi serta ketahanan pangan keluarga.",
      refleksiMurid: "Murid menyadari pentingnya higienitas pangan, etika bioteknologi, serta potensi wirausaha biologi berbasis kearifan lokal."
    }
  },
  // 3. BAHASA INDONESIA - Alline Novianti, S.Pd. (SMAS IT Ummul Quro)
  bahasa_indonesia: {
    rppUrl: "https://drive.google.com/file/d/1DemoModulAnekdotUmmulQuro/view?usp=sharing",
    lessonTitle: "Teks Anekdot sebagai Kritik Sosial yang Santun Berbasis Komik Digital",
    classGrade: "Fase E / Kelas X-A",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 1,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: "Identitas modul ajar teks anekdot tertata rapi dan jelas.",
      4: "Dimensi Berkebinekaan Global dan Bernalar Kritis tertuang dalam analisis isu publik.",
      8: "Model pembelajaran Discovery Learning dipadukan dengan produksi komik digital Canva.",
      12: "Murid difasilitasi memahami struktur dan kaidah kebahasaan melalui teks otentik terkini.",
      13: "Aktivitas mengaplikasikan kritik sosial santun melalui komik strip berjalan menarik.",
      21: "Rubrik penilaian membedakan aspek kelucuan, substansi kritik, dan kesantunan bahasa."
    },
    telaahFeedback: {
      kelebihan: "Pendekatan kritis santun dalam penulisan teks anekdot sangat relevan dengan etika digital murid SMA masa kini.",
      perbaikan: "Perkuat aspek peer-review antarteman sebelum karya komik digital dipublikasikan.",
      rekomendasi: "Karya komik digital murid dapat diterbitkan menjadi e-majalah literasi sekolah."
    },
    praObservasiAnswers: {
      q1_kd_indikator: "Mengevaluasi gagasan dan pesan tersirat dalam teks anekdot serta menyusun teks anekdot dengan memperhatikan kaidah kesantunan berbahasa.",
      q2_metode: "Genre-Based Approach dipadukan dengan teknik Workshop Menulis Kreatif berbasis platform desain grafis Canva.",
      q3_alat_bahan: "Kliping komik strip digital, proyektor, gawai/laptop murid, template Canva Komik, dan rubrik asesmen kesantunan bahasa.",
      q4_tahapan: "Dekonstruksi teks contoh, Analisis isu layanan publik terdekat, Curah ide kritik santun, Penulisan naskah, Pembuatan komik digital, dan Pameran galeri kelas.",
      q5_persiapan: "Menghubungkan teks dengan pengalaman antrean kantin dan fasilitas sekolah, menciptakan humor yang mencerdaskan tanpa sarkasme atau perundungan.",
      q6_materi_sulit: "Menjaga batas antara kritik membangun dan cemoohan; diantisipasi dengan pedoman etika komunikasi publik dan analisis contoh kasus nyata.",
      q7_target_kompetensi: "Keterampilan literasi kritis, kepekaan sosial terhadap ketidakadilan, dan kesantunan berbahasa Indonesia.",
      q8_perhatian_khusus: "Memastikan seluruh murid berani mengemukakan sudut pandang kritisnya dengan percaya diri dan tanpa rasa takut salah.",
      supervisorNotes: "Rancangan sangat menarik. Fokus observasi kelas pada panduan guru dalam menanamkan kesantunan berbahasa saat murid menyusun kritik sosial."
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan pembelajaran literasi kritis dan kesantunan verbal terwujud nyata" },
      "2": { score: 2, note: "Penilaian asesmen mencakup isi kritik, estetika komik, dan diksi santun" },
      "3": { score: 2, note: "Alur kegiatan mengalir dinamis dari tayangan pemantik hingga pameran karya" },
      "4": { score: 2, note: "Isu yang diangkat murid seputar kedisiplinan belajar dan lingkungan sekolah" },
      "5": { score: 2, note: "Suasana kelas riang dan penuh tawa positif dari humor cerdas yang dibangun" },
      "6": { score: 2, note: "Murid aktif membedah struktur orientasi, krisis, reaksi, dan koda" },
      "7": { score: 2, note: "Murid menyusun naskah anekdot orisinal berdasarkan peristiwa nyata" },
      "8": { score: 2, note: "Refleksi mendalam tentang dampak kata-kata di ruang media sosial" },
      "9": { score: 2, note: "Pendekatan berbasis genre diterapkan sistematis dan kontekstual" },
      "10": { score: 2, note: "Diskusi kelompok pembuatan komik kolaboratif berjalan saling mengapresiasi" },
      "11": { score: 2, note: "Kelas kondusif dan menjunjung tinggi norma kesantunan berbicara" },
      "12": { score: 2, note: "Aplikasi Canva dimanfaatkan murid dengan sangat terampil dan kreatif" },
      "13": { score: 2, note: "Budaya saling menghormati gagasan tanpa mencela karya teman terawat baik" },
      "14": { score: 2, note: "Murid mengaitkan materi teks eksposisi terdahulu dalam menyusun argumen kritik" },
      "15": { score: 2, note: "Murid bebas memilih topik kritik sosial yang dirasa paling dekat dengan mereka" },
      "16": { score: 2, note: "Capaian kompetensi menulis teks anekdot santun terpenuhi di atas KKM" },
      "17": { score: 2, note: "Murid mandiri menyelesaikan penyusunan komik digital tepat waktu" },
      "18": { score: 2, note: "Guru mendatangi tiap kelompok memberi saran pemilihan diksi yang lebih bijak" },
      "19": { score: 2, note: "Manajemen alokasi waktu penulisan dan presentasi tertata rapi" },
      "20": { score: 2, note: "Refleksi akhir menekankan integritas murid sebagai warganet yang bertanggung jawab" },
      "21": { score: 2, note: "Guru memberikan umpan balik langsung pada draf dialog komik murid" },
      "22": { score: 2, note: "Penilaian rekan sejawat (peer review) berjalan lancar menggunakan rubrik" },
      "23": { score: 2, note: "Catatan telaah dijadikan bahan perbaikan draf komik sebelum finalisasi" },
      "24": { score: 2, note: "Mendukung visi SMAS IT Ummul Quro dalam membentuk generasi berakhlak mulia" },
      "25": { score: 2, note: "Guru mendokumentasikan praktik baik literasi komik untuk laporan refleksi" }
    },
    observasiFeedback: {
      kelebihan: "Integrasi literasi digital Canva dengan penguatan karakter kesantunan berbahasa sangat berhasil memotivasi murid menuangkan kritik positif.",
      peningkatan: "Alokasikan waktu lebih bagi murid untuk saling membaca karya antarkelompok secara mendalam.",
      rekomendasi: "Karya anekdot komik digital sangat layak dipublikasikan di akun media sosial literasi sekolah."
    },
    kesimpulanSelidiki: {
      guruBerorientasi: "Guru merancang kegiatan belajar yang menantang murid berpikir kritis sekaligus menjaga marwah kesantunan bahasa dalam menyampaikan kritik sosial.",
      muridAktif: "Murid aktif mengeksplorasi isu sosial sekitar, menulis dialog humor bermakna, dan merancang komik strip digital secara kolaboratif.",
      konteksNyata: "Tema anekdot diangkat langsung dari fenomena keseharian murid: etika digital, antrean fasilitas umum, dan kepedulian lingkungan.",
      refleksiMurid: "Murid menyadari kekuatan bahasa dalam mempengaruhi opini publik dan pentingnya menyampaikan kebenaran dengan cara yang santun dan bermartabat."
    }
  },
  // 4. MATEMATIKA - Hilmia Fitriyani, S.Pd. (SMAN 4 Bogor)
  matematika: {
    rppUrl: "https://drive.google.com/file/d/1DemoModulMatematikaFungsiKuadrat/view?usp=sharing",
    lessonTitle: "Fungsi Kuadrat: Pemodelan Titik Ekstrem Maksimum/Minimum pada Masalah Arsitektur & Bisnis",
    classGrade: "Fase E / Kelas X-3",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 1,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: "Identitas modul lengkap dengan alokasi waktu 3 JP yang terukur.",
      4: "Profil Bernalar Kritis dan Mandiri tercermin dalam tahapan eksplorasi Geogebra.",
      8: "Model Problem-Based Learning berbantuan aplikasi Geogebra interaktif.",
      12: "Murid mengonstruksi sifat grafik parabola melalui penggeseran nilai koefisien a, b, dan c.",
      13: "Pemodelan matematis lintasan parabola jembatan dan keuntungan maksimum UMKM sangat aplikatif.",
      21: "Rubrik KKTP mencakup pemahaman konsep, keterampilan grafik, dan penalaran kontekstual."
    },
    telaahFeedback: {
      kelebihan: "Pemanfaatan software Geogebra secara dinamis membuat konsep abstrak fungsi kuadrat menjadi visual, konkret, dan mudah dipahami.",
      perbaikan: "Berikan variasi soal diferensiasi bagi murid yang telah menguasai konsep lebih cepat.",
      rekomendasi: "Dapat diimbaskan kepada guru matematika serumpun di SMAN 4 Bogor."
    },
    praObservasiAnswers: {
      q1_kd_indikator: "Menyelesaikan masalah kontekstual yang berkaitan dengan fungsi kuadrat melalui interpretasi karakteristik grafik parabola dan titik puncak.",
      q2_metode: "Inquiry-Based Learning berbantuan aplikasi dinamik GeoGebra dan studi kasus optimalisasi keuntungan wirausaha.",
      q3_alat_bahan: "Aplikasi GeoGebra (smartphone/laptop), lembar kerja penyelidikan kurva, proyektor, dan modul ajar digital.",
      q4_tahapan: "Orientasi fenomena lintasan bola basket, Eksplorasi slider GeoGebra, Menemukan rumus titik puncak, Pemecahan masalah laba maksimum, dan Penarikan simpulan.",
      q5_persiapan: "Menyajikan matematika sebagai alat bantu memecahkan persoalan nyata, menghilangkan kecemasan matematika (math anxiety) lewat visualisasi interaktif.",
      q6_materi_sulit: "Menyusun model matematika dari narasi soal cerita; diantisipasi dengan diagram alur pemodelan langkah demi langkah.",
      q7_target_kompetensi: "Kemampuan berpikir analitis logis, pemodelan matematis, dan ketelitian kalkulasi.",
      q8_perhatian_khusus: "Mendampingi murid yang mengalami kendala dalam aljabar dasar saat menentukan koordinat titik potong sumbu.",
      supervisorNotes: "Rancangan inovatif. Observasi kelas akan fokus pada bagaimana manipulasi slider GeoGebra oleh murid mempermudah penemuan konsep titik puncak."
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan pemodelan matematis dan karakter nalar logis tercapai nyata" },
      "2": { score: 2, note: "Asesmen formatif mengukur pemahaman grafik dan penyelesaian model" },
      "3": { score: 2, note: "Alur kegiatan terstruktur runtut dari kurva visual hingga perumusan aljabar" },
      "4": { score: 2, note: "Studi kasus keuntungan penjualan merchandise sekolah sangat aplikatif" },
      "5": { score: 2, note: "Murid takjub melihat grafik parabola berubah saat nilai koefisien digeser" },
      "6": { score: 2, note: "Murid aktif mencoba koordinat titik puncak dan mendiskusikan nilainya" },
      "7": { score: 2, note: "Murid berhasil menghitung tinggi maksimum peluru dan laba optimal UMKM" },
      "8": { score: 2, note: "Refleksi akhir mengungkap matematika adalah bahasa sains yang sangat berguna" },
      "9": { score: 2, note: "Model inkuiri terbimbing berjalan sukses memantik kemandirian murid" },
      "10": { score: 2, note: "Interaksi kerja tim dalam menemukan titik ekstrem berjalan suportif" },
      "11": { score: 2, note: "Suasana kelas tenang, fokus, dan bebas dari ketakutan berhitung" },
      "12": { score: 2, note: "Penggunaan GeoGebra sangat lancar dan dikuasai murid dengan baik" },
      "13": { score: 2, note: "Murid yang lebih cepat memahami membantu rekan satu kelompoknya dengan ramah" },
      "14": { score: 2, note: "Materi persamaan kuadrat terdahulu dihubungkan dengan titik potong sumbu X" },
      "15": { score: 2, note: "Murid memilih konteks masalah (arsitektur jembatan atau keuntungan usaha)" },
      "16": { score: 2, note: "Lebih dari 90% murid menuntaskan asesmen kuis Geogebra dengan tepat" },
      "17": { score: 2, note: "Murid mandiri menyelesaikan analisis fungsi kuadrat pada lembar kerja" },
      "18": { score: 2, note: "Guru memberi pendampingan intensif bagi murid yang memerlukan penguatan faktorisasi" },
      "19": { score: 2, note: "Waktu terjaga dengan disiplin sesuai alokasi RPP" },
      "20": { score: 2, note: "Refleksi metakognitif menyimpulkan strategi mencari nilai optimum" },
      "21": { score: 2, note: "Guru memberikan koreksi langsung saat murid mempresentasikan koordinat puncak" },
      "22": { score: 2, note: "Kuis formatif akhir diselesaikan secara digital dengan transparansi nilai" },
      "23": { score: 2, note: "Temuan kesulitan diintegrasikan sebagai agenda pengayaan pertemuan berikutnya" },
      "24": { score: 2, note: "Mendukung visi sekolah menghasilkan lulusan unggul berdaya saing akademik" },
      "25": { score: 2, note: "Guru mencatat keberhasilan integrasi TIK dalam jurnal refleksi mengajar" }
    },
    observasiFeedback: {
      kelebihan: "Transformasi matematika abstrak menjadi visual interaktif menggunakan GeoGebra berhasil mendongkrak antusiasme dan pemahaman analitis murid.",
      peningkatan: "Perlu ditambah latihan soal kontekstual dengan angka realitas yang lebih kompleks.",
      rekomendasi: "Metode visualisasi Geogebra ini sangat direkomendasikan ditularkan ke guru matematika lainnya."
    },
    kesimpulanSelidiki: {
      guruBerorientasi: "Guru memfasilitasi eksplorasi visual interaktif berbantuan software GeoGebra, mengubah matematika dari hafalan rumus menjadi penemuan konsep bermakna.",
      muridAktif: "Murid aktif menggeser parameter koefisien, menyelidiki pergerakan titik puncak parabola, dan memodelkan masalah optimalisasi laba usaha secara matematis.",
      konteksNyata: "Pembelajaran mengaitkan fungsi kuadrat dengan bentuk lengkung arsitektur jembatan dan perhitungan keuntungan maksimum penjualan produk UMKM.",
      refleksiMurid: "Murid merefleksikan bahwa matematika memiliki kegunaan praktis tinggi dalam memprediksi hasil optimal dan membuat keputusan strategis dalam kehidupan."
    }
  },
  // 5. KIMIA - Mega Nur Alfira, S.Pd. (SMAN 2 Bogor)
  kimia: {
    rppUrl: "https://drive.google.com/file/d/1DemoModulKimiaIkatanKepolaran/view?usp=sharing",
    lessonTitle: "Ikatan Kimia & Kepolaran Senyawa: Penyelidikan Sifat Fisik dan Gaya Antarmolekul",
    classGrade: "Fase F / Kelas XI-MIPA 3",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 1,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: "Identitas modul ajar ikatan kimia dan kepolaran lengkap dan sistematis.",
      4: "Profil Bernalar Kritis dan Bergotong Royong tercermin dalam penyelidikan sifat polar.",
      8: "Praktikum uji pembelokan aliran zat cair dengan penggaris bermuatan sangat memikat.",
      12: "Murid memahami perbedaan ikatan kovalen polar dan nonpolar lewat observasi mikroskopis.",
      13: "Kaitan polaritas air dengan pelarutan zat pembersih (sabun dan detergen) sangat nyata.",
      21: "Rubrik penilaian ketercapaian tujuan pembelajaran (KKTP) operasional dan terukur."
    },
    telaahFeedback: {
      kelebihan: "Eksperimen sederhana pembelokan zat cair dengan listrik statis sangat efektif menjembatani pemahaman makroskopis ke tataran sub-mikroskopis.",
      perbaikan: "Sertakan animasi 3D struktur molekul ruang menggunakan aplikasi MolView.",
      rekomendasi: "Dapat dijadikan bahan diseminasi inovasi praktikum kimia murah dan bermakna."
    },
    praObservasiAnswers: {
      q1_kd_indikator: "Menganalisis proses pembentukan ikatan kovalen polar dan nonpolar serta menghubungkannya dengan sifat fisik kepolaran senyawa.",
      q2_metode: "Guided Inquiry Laboratory dipadukan dengan pemodelan partikel sub-mikroskopis molekul.",
      q3_alat_bahan: "Buret laboratorium, cairan uji (air, alkohol, aseton, minyak goreng), batang mika, kain wol, dan LKPD Eksperimen Kimia.",
      q4_tahapan: "Demonstrasi air dan minyak yang tak bercampur, Eksperimen pembelokan kucuran cairan oleh muatan listrik, Analisis perbedaan keelektronegatifan, dan Kesimpulan konsep.",
      q5_persiapan: "Menghubungkan kimia dengan fungsi sabun pencuci piring dalam mengangkat lemak, membangun rasa kagum terhadap keteraturan molekul ciptaan Tuhan.",
      q6_materi_sulit: "Menghitung momen dipol dan bentuk geometri molekul asimetris; diantisipasi dengan model molimod fisik dan aplikasi visualisasi 3D.",
      q7_target_kompetensi: "Keterampilan berpikir tingkat tinggi menganalisis hubungan struktur molekul dengan sifat makroskopis zat.",
      q8_perhatian_khusus: "Kehati-hatian dalam penanganan cairan organik yang mudah menguap serta pembagian peran uji cairan antarmurid.",
      supervisorNotes: "Rancangan sangat matang. Observasi tatap muka akan menilai kemampuan guru membimbing transisi representasi makroskopis ke sub-mikroskopis."
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan penguasaan konsep kimia dan pembentukan karakter ilmiah terwujud" },
      "2": { score: 2, note: "Asesmen keterampilan laboratorium mencakup ketelitian pengukuran dan analisis" },
      "3": { score: 2, note: "Langkah eksperimen terarah dengan panduan keselamatan kerja yang jelas" },
      "4": { score: 2, note: "Contoh kerja sabun melarutkan lemak dihubungkan dengan sifat kepolaran zat" },
      "5": { score: 2, note: "Murid sangat bersemangat saat melihat aliran air membelok mendekati batang mika" },
      "6": { score: 2, note: "Murid aktif bertanya mengapa minyak goreng tidak membelok saat didekatkan muatan" },
      "7": { score: 2, note: "Murid menyimpulkan kriteria senyawa polar berdasarkan perbedaan keelektronegatifan" },
      "8": { score: 2, note: "Refleksi mengaitkan polaritas senyawa dengan kelestarian ekosistem air" },
      "9": { score: 2, note: "Inkuiri terbimbing memancing murid menemukan kesimpulan secara mandiri" },
      "10": { score: 2, note: "Kerja tim pembagian tugas pengisian buret dan pengamatan tetesan sangat kompak" },
      "11": { score: 2, note: "Laboratorium kimia bersih, tertib, dan memiliki ventilasi udara yang baik" },
      "12": { score: 2, note: "Alat peraga buret dan visualisasi molekul digunakan tepat guna" },
      "13": { score: 2, note: "Interaksi menghargai pendapat antarmurid selama sesi diskusi hasil uji" },
      "14": { score: 2, note: "Murid mengingat kembali konfigurasi elektron dan aturan oktet dengan baik" },
      "15": { score: 2, note: "Murid bebas memilih cairan uji tambahan yang dibawa dari rumah" },
      "16": { score: 2, note: "Semua kelompok berhasil mengklasifikasikan 4 senyawa uji dengan benar" },
      "17": { score: 2, note: "Murid mencatat data pengamatan dan menggambar momen dipol secara mandiri" },
      "18": { score: 2, note: "Guru mendampingi kelompok yang ragu dalam membaca skala buret secara teliti" },
      "19": { score: 2, note: "Pengelolaan waktu eksperimen dan pembersihan alat berjalan teratur" },
      "20": { score: 2, note: "Refleksi akhir merumuskan esensi keteraturan gaya antarmolekul di alam semesta" },
      "21": { score: 2, note: "Umpan balik formatif diberikan pada saat murid menggambar arah vektor dipol" },
      "22": { score: 2, note: "Penilaian unjuk kerja laboratorium dilaksanakan secara adil dan terukur" },
      "23": { score: 2, note: "Hasil pengamatan dijadikan dasar penguatan konsep ikatan hidrogen pertemuan nanti" },
      "24": { score: 2, note: "Selaras dengan komitmen SMAN 2 Bogor mencetak generasi cerdas berkarakter ilmiah" },
      "25": { score: 2, note: "Guru mencatat evaluasi praktikum kimia untuk penyempurnaan LKPD" }
    },
    observasiFeedback: {
      kelebihan: "Praktikum sederhana namun memiliki daya jelas konseptual yang sangat kuat dalam membuktikan kepolaran senyawa, antusiasme murid luar biasa.",
      peningkatan: "Dapat ditambahkan pemodelan digital interaktif untuk memperlihatkan awan elektron secara dinamis.",
      rekomendasi: "Sangat disarankan dibuat video panduan praktikum untuk dibagikan di komunitas MGMP Kimia."
    },
    kesimpulanSelidiki: {
      guruBerorientasi: "Guru memfasilitasi penyelidikan sifat kepolaran senyawa melalui eksperimen pembelokan kucuran cairan oleh muatan listrik yang sangat visual dan memikat.",
      muridAktif: "Murid terampil menguji kepolaran berbagai cairan, mengukur sudut pembelokan, dan menganalisis perbedaan keelektronegatifan unsur secara ilmiah.",
      konteksNyata: "Pembelajaran mengaitkan sifat kepolaran dengan mekanisme kerja sabun pembersih lemak dan fenomena kelarutan vitamin dalam tubuh.",
      refleksiMurid: "Murid merefleksikan keindahan sains di balik sifat zat sehari-hari serta pentingnya pemilihan bahan kimia pembersih yang ramah lingkungan."
    }
  }
};
function getTeacherAutoFillData(teacherName, subject, lessonTitle = "", schoolName = "") {
  const subLower = (subject || "").toLowerCase().trim();
  if (subLower.includes("fisik") || subLower.includes("physics")) {
    return TEACHER_AUTO_FILL_MAP.fisika;
  }
  if (subLower.includes("biolog")) {
    return TEACHER_AUTO_FILL_MAP.biologi;
  }
  if (subLower.includes("indonesia")) {
    return TEACHER_AUTO_FILL_MAP.bahasa_indonesia;
  }
  if (subLower.includes("matematik") || subLower.includes("math")) {
    return TEACHER_AUTO_FILL_MAP.matematika;
  }
  if (subLower.includes("kimia") || subLower.includes("chem")) {
    return TEACHER_AUTO_FILL_MAP.kimia;
  }
  const cleanTitle = lessonTitle || `Pembelajaran Kontekstual ${subject}`;
  const safeName = teacherName || "Guru Mata Pelajaran";
  return {
    rppUrl: `https://drive.google.com/file/d/drive_${Date.now()}_RPP_${encodeURIComponent(subject)}/view?usp=sharing`,
    lessonTitle: cleanTitle,
    classGrade: "Fase E / Kelas X",
    semester: "Ganjil",
    telaahScores: {
      1: 2,
      2: 2,
      3: 2,
      4: 2,
      5: 2,
      6: 2,
      7: 2,
      8: 2,
      9: 2,
      10: 1,
      11: 2,
      12: 2,
      13: 2,
      14: 2,
      15: 2,
      16: 2,
      17: 2,
      18: 2,
      19: 2,
      20: 2,
      21: 2,
      22: 2
    },
    telaahComments: {
      1: `Identitas RPP ${subject} tercantum lengkap dengan alokasi waktu dan fase yang jelas.`,
      4: `Dimensi Profil Pelajar Pancasila selaras dengan tujuan pembelajaran ${subject}.`,
      8: `Model pembelajaran inovatif berorientasi Deep Learning tergambar pada rancangan kegiatan.`,
      12: `Langkah pembelajaran memfasilitasi murid memahami konsep mendalam melalui studi kasus nyata.`,
      13: `Aktivitas mengaplikasikan pengetahuan dihubungkan dengan pengalaman hidup murid.`,
      14: `Refleksi metakognitif terfasilitasi terstruktur di akhir modul ajar.`,
      21: `Rubrik ketercapaian tujuan pembelajaran (KKTP) memuat indikator penilaian yang terukur.`
    },
    telaahFeedback: {
      kelebihan: `Perencanaan pembelajaran ${subject} dirancang dengan baik, mengintegrasikan tujuan pembelajaran kontekstual dan asesmen otentik.`,
      perbaikan: `Perkuat integrasi pemanfaatan sumber belajar digital dan asesmen antarteman dalam LKPD.`,
      rekomendasi: `Dapat diterapkan dalam siklus supervisi akademik dan diseminasi di komunitas belajar sekolah.`
    },
    praObservasiAnswers: {
      q1_kd_indikator: `Memahami dan menganalisis konsep ${cleanTitle} serta mengaplikasikannya dalam pemecahan masalah kontekstual murid.`,
      q2_metode: `Problem-Based Learning terpadu pendekatan Pembelajaran Mendalam (Deep Learning) agar murid aktif berkolaborasi dan berpikir kritis.`,
      q3_alat_bahan: `Bahan tayang interaktif, lembar kerja murid (LKPD), platform digital, serta media kontekstual pendukung materi ${subject}.`,
      q4_tahapan: `Pendahuluan pemantik, Orientasi tantangan masalah riil, Investigasi kelompok, Presentasi gagasan kreatif, dan Refleksi bersama.`,
      q5_persiapan: `Merancang pembelajaran yang berkesadaran, bermakna, dan menggembirakan dengan menghubungkan materi pada fenomena keseharian murid.`,
      q6_materi_sulit: `Konsep analisis mendalam pada ${subject}; diantisipasi dengan scaffolding bertahap dan diskusi kelompok kolaboratif.`,
      q7_target_kompetensi: `Kemampuan bernalar kritis, kemandirian memecahkan masalah, serta keterampilan komunikasi dan kerja sama.`,
      q8_perhatian_khusus: `Fokus pada keterlibatan aktif setiap murid, iklim kelas yang inklusif, dan interaksi yang saling memuliakan.`,
      supervisorNotes: `Perencanaan pra-observasi terstruktur baik. Fokus supervisi pada keaktifan interaksi belajar murid dan penerapan umpan balik formatif.`
    },
    observasiScores: {
      "1": { score: 2, note: "Tujuan pembelajaran mencakup sikap, pengetahuan, dan keterampilan teramati aktif" },
      "2": { score: 2, note: "Penilaian selaras dengan tujuan dan profil lulusan yang dicanangkan" },
      "3": { score: 2, note: "Alur kegiatan terstruktur jelas dan menjaga fokus perhatian murid sepanjang sesi" },
      "4": { score: 2, note: `Materi dan aktivitas ${subject} terhubung erat dengan kehidupan nyata murid` },
      "5": { score: 2, note: "Aktivitas menarik dan memotivasi suasana belajar yang menggembirakan" },
      "6": { score: 2, note: "Murid aktif mengamati, bertanya, dan menggali informasi dari berbagai sumber" },
      "7": { score: 2, note: "Murid terampil menerapkan konsep dalam situasi nyata melalui tugas kontekstual" },
      "8": { score: 2, note: "Kegiatan refleksi terlaksana dengan baik, murid menilai proses dan hasil belajarnya" },
      "9": { score: 2, note: "Metode pembelajaran diterapkan konsisten sesuai tujuan kurikulum" },
      "10": { score: 2, note: "Interaksi kerja sama guru-murid dan antarmurid berjalan hangat dan produktif" },
      "11": { score: 2, note: "Suasana kelas aman, nyaman, tertib, dan kondusif bagi pembelajaran" },
      "12": { score: 2, note: "Pemanfaatan media pembelajaran relevan dan mempermudah pemahaman konsep" },
      "13": { score: 2, note: "Terbangun budaya saling memuliakan, menghargai, dan menghormati keberagaman" },
      "14": { score: 2, note: "Murid mengaitkan pengetahuan baru dengan pengalaman belajar sebelumnya" },
      "15": { score: 2, note: "Murid percaya diri dan memiliki ruang memilih cara belajar yang tepat" },
      "16": { score: 2, note: `Tercapai kompetensi materi ${subject} sesuai indikator yang ditargetkan` },
      "17": { score: 2, note: "Murid menunjukkan kemandirian belajar dalam menyelesaikan lembar tugas" },
      "18": { score: 2, note: "Guru tanggap terhadap perbedaan kemampuan dan kebutuhan belajar murid" },
      "19": { score: 2, note: "Pengelolaan kelas kontekstual dan alokasi waktu terjaga secara presisi" },
      "20": { score: 2, note: "Refleksi akhir mengacu pada pencapaian tujuan dan tindak lanjut perbaikan" },
      "21": { score: 2, note: "Penilaian proses (formatif) berjalan efektif disertai umpan balik bermakna" },
      "22": { score: 2, note: "Penilaian akhir mengukur ketercapaian kompetensi secara objektif" },
      "23": { score: 2, note: "Hasil penilaian dimanfaatkan guru untuk tindak lanjut pembelajaran lanjutan" },
      "24": { score: 2, note: "Arah pembelajaran sejalan dengan visi satuan pendidikan yang berpusat pada murid" },
      "25": { score: 2, note: "Guru mendokumentasikan refleksi untuk perbaikan praktik mengajar berkelanjutan" }
    },
    observasiFeedback: {
      kelebihan: `Pelaksanaan pembelajaran ${subject} oleh ${safeName} berlangsung interaktif, berpusat pada murid, dan menciptakan lingkungan belajar yang aman serta bermakna.`,
      peningkatan: `Tingkatkan diversifikasi teknik penilaian formatif cepat (quick assessment) di tengah kegiatan inti.`,
      rekomendasi: `Praktik baik pembelajaran ini sangat disarankan dibagikan dalam forum komunitas belajar (Kombel) sekolah.`
    },
    kesimpulanSelidiki: {
      guruBerorientasi: `Guru memfasilitasi pengalaman belajar aktif yang menempatkan murid sebagai subjek pembelajaran dalam mengeksplorasi konsep ${subject}.`,
      muridAktif: `Murid aktif berpartisipasi, berdiskusi kelompok, mengonstruksi pemahaman, dan mengaplikasikan konsep pada tantangan kontekstual.`,
      konteksNyata: `Pembelajaran ${subject} dikaitkan langsung dengan fenomena kehidupan sehari-hari dan relevansi masa depan murid.`,
      refleksiMurid: `Murid membiasakan diri mengevaluasi proses pemahaman, menyadari keberhasilan belajar, dan merencanakan langkah pengembangan diri.`
    }
  };
}
function generateAmatiData(supervision, selectedKeys, customBaseline) {
  const teacherName = supervision.teacherName || "Guru Binaan";
  const subject = supervision.subject || "Mata Pelajaran";
  const schoolName = supervision.schoolName || "SMA Swasta";
  const selidikiBefore = customBaseline || supervision.sambung?.selidiki?.matriksBefore;
  const baseline = {
    peranGuru: selidikiBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru,
    aktivitasMurid: selidikiBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
    konteksNyata: selidikiBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
    refleksiMurid: selidikiBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid
  };
  const defaultKeys = ["peranGuru", "aktivitasMurid"];
  const chosenKeys = selectedKeys && selectedKeys.length > 0 ? selectedKeys : supervision.sambung?.arahkan?.fokusIndikatorTerpilih && supervision.sambung.arahkan.fokusIndikatorTerpilih.length > 0 ? supervision.sambung.arahkan.fokusIndikatorTerpilih : defaultKeys;
  const targetPerbaikan = {
    peranGuru: `Transformasi peran ${teacherName} dari penyampai materi searah menjadi perancang & fasilitator inkuiri aktif yang menumbuhkan daya nalar murid dalam konsep ${subject}.`,
    aktivitasMurid: `Murid aktif berkolaborasi, berdiskusi memecahkan tantangan kontekstual ${subject}, dan mendemonstrasikan pengaplikasian konsep secara mandiri di kelas.`,
    konteksNyata: `Materi ${subject} terhubung secara nyata dengan fenomena kehidupan sehari-hari, isu lingkungan lokal, dan relevansi masa depan murid.`,
    refleksiMurid: `Murid membiasakan diri mengevaluasi proses pemahaman materi ${subject} melalui jurnal refleksi 3-2-1 / tiket keluar di setiap akhir sesi.`
  };
  const indicatorLabelMap = {
    peranGuru: "peran guru sebagai fasilitator inkuiri",
    aktivitasMurid: "keterlibatan aktif murid dalam pembelajaran",
    konteksNyata: "keterhubungan materi dengan konteks nyata",
    refleksiMurid: "pembiasaan refleksi belajar berkala"
  };
  const chosenLabels = chosenKeys.map((k) => indicatorLabelMap[k] || k).join(" serta ");
  const fokusPerubahan = `Meningkatkan kualitas pembelajaran ${subject} melalui penguatan ${chosenLabels} guna menciptakan pengalaman belajar murid yang berpusat pada murid, aktif, dan bermakna.`;
  const kegiatanList = [];
  let kId = 1;
  const supervisorName = supervision.supervisorName || "Pengawas Pembina";
  if (chosenKeys.includes("peranGuru")) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: "peranGuru",
      kegiatanPembinaan: `Workshop & Coaching penyusunan skenario pembelajaran ${subject} berpusat pada murid (student-centered learning)`,
      indikatorKeberhasilan: `Modul ajar ${subject} memuat diferensiasi proses dan peran guru sebagai coach/fasilitator inkuiri terverifikasi pengawas`,
      waktu: "Bulan ke-1",
      penanggungJawab: `${teacherName} & ${supervisorName}`
    });
  }
  if (chosenKeys.includes("aktivitasMurid")) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: "aktivitasMurid",
      kegiatanPembinaan: `Pendampingan implementasi LKPD eksploratif dan teknik diskusi kolaboratif pemecahan masalah ${subject}`,
      indikatorKeberhasilan: `Keterlibatan aktif murid dalam diskusi kelompok dan presentasi solusi mencapai >85% murid di kelas`,
      waktu: "Bulan ke-2",
      penanggungJawab: `${teacherName} & Rekan Sejawat`
    });
  }
  if (chosenKeys.includes("konteksNyata")) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: "konteksNyata",
      kegiatanPembinaan: `Bedah materi ${subject} berbasis fenomena nyata lingkungan dan studi kasus kontekstual terkini`,
      indikatorKeberhasilan: `Setiap tujuan pembelajaran terhubung langsung dengan minimal 1 contoh kasus riil atau aplikasi kehidupan sehari-hari`,
      waktu: "Bulan ke-2",
      penanggungJawab: `${teacherName} & MGMP Sekolah`
    });
  }
  if (chosenKeys.includes("refleksiMurid")) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: "refleksiMurid",
      kegiatanPembinaan: `Penerapan instrumen refleksi harian (exit ticket / jurnal refleksi 3-2-1) pada 10-15 menit akhir sesi ${subject}`,
      indikatorKeberhasilan: `100% murid secara rutin mendokumentasikan pemahaman, kesulitan, dan target belajar pribadi di lembar refleksi`,
      waktu: "Bulan ke-3",
      penanggungJawab: `${teacherName}`
    });
  }
  if (kegiatanList.length === 0) {
    kegiatanList.push(
      {
        id: 1,
        fokusIndikator: "peranGuru",
        kegiatanPembinaan: `Coaching reflektif penguatan pedagogik pembelajaran ${subject}`,
        indikatorKeberhasilan: `Modul ajar dan skenario kelas berfokus penuh pada pengalaman belajar aktif murid`,
        waktu: "Bulan ke-1",
        penanggungJawab: `${teacherName} & ${supervisorName}`
      },
      {
        id: 2,
        fokusIndikator: "aktivitasMurid",
        kegiatanPembinaan: `Observasi teman sejawat dan refleksi berkala pelibatan aktif murid`,
        indikatorKeberhasilan: `Murid aktif mendemonstrasikan pemahaman konsep dan bekerja sama dalam tim`,
        waktu: "Bulan ke-2",
        penanggungJawab: `${teacherName}`
      }
    );
  }
  return {
    fokusIndikatorTerpilih: chosenKeys,
    analisisKesimpulanSelidiki: baseline,
    targetPerbaikan,
    alasanFokusPerbaikan: `Berdasarkan hasil telaah modul dan observasi kelas pada instrumen Selidiki, aspek ${chosenLabels} memerlukan penguatan terarah agar pembelajaran ${subject} berdampak optimal bagi murid.`,
    periode: supervision.sambung?.arahkan?.periode || "Semester Genap 2025/2026",
    fokusPerubahan,
    kegiatan: kegiatanList,
    tandaTangan: {
      pengawas: supervisorName,
      kepalaSekolah: supervision.sambung?.arahkan?.tandaTangan?.kepalaSekolah || "Kepala Sekolah",
      guru: teacherName,
      tanggalDisepakati: supervision.sambung?.arahkan?.tandaTangan?.tanggalDisepakati || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    }
  };
}
function generateTeacherMaknaiData(supervision) {
  const teacherName = supervision.teacherName || "Guru Binaan";
  const cleanName = teacherName.toLowerCase();
  const subject = supervision.subject || "Mata Pelajaran";
  const lessonTitle = supervision.lessonTitle || subject;
  const schoolName = supervision.schoolName || "SMA Swasta";
  const obsScore = supervision.observasiKelas?.score ?? 86.7;
  const obsPred = supervision.observasiKelas?.predicate ?? "Baik";
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (cleanName.includes("sondang")) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: "Saya merasa sangat bersyukur dan lega melihat antusiasme murid. Saat simulasi PhET Circuit Construction Kit DC dan perakitan rangkaian lampu led baterai dilakukan, murid yang biasanya pendiam di baris belakang tampak sangat aktif berdiskusi dan antusias membandingkan nyala lampu.",
        q2: "Sekitar 85% proses pembelajaran berjalan sesuai modul ajar. Bagian pengalaman memahami konsep Hukum Ohm dan mengaplikasikannya dalam simulasi sirkuit berjalan lancar sesuai rencana. Namun, bagian merefleksi pembelajaran sedikit berubah karena murid sangat asyik bereksperimen sehingga alokasi waktu penutup perlu penyesuaian dinamis.",
        q3: "Hal yang sangat memuaskan adalah saat kelompok 3 berteriak gembira menemukan mengapa lampu paralel tetap menyala saat satu kabel saklar dilepas. Mereka menemukan sendiri esensi instalasi kelistrikan rumah tangga tanpa saya harus mendiktekan rumusnya di papan tulis.",
        q4: "Saya memperkirakan sekitar 88% murid telah mencapai tujuan pembelajaran. Buktinya terlihat dari ketuntasan lembar kerja penyelidikan rangkaian dan hasil kuis formatif interaktif di mana sebagian besar murid mampu menganalisis hubungan beda potensial dan arus dengan presisi.",
        q5: "Kesulitan murid terutama pada perhitungan matematis hambatan pengganti pecahan pada rangkaian kombinasi. Saya menanggapi perbedaan kemampuan ini dengan menyediakan panduan tangga perhitungan berjenjang (scaffolding) dan mengelompokkan murid secara heterogen bersama tutor sebaya.",
        q6: "Murid menilai proses belajarnya melalui lembar tiket keluar (exit ticket) reflektif 3-2-1 (tiga hal dipahami, dua hal menarik, satu hal membingungkan). Umpan balik yang saya berikan berupa apresiasi langsung atas nalar kritis mereka serta penguatan konsep langsung ke meja kelompok yang masih ragu.",
        q7: "Kesulitan saya adalah mengelola pembagian waktu agar pendampingan ke seluruh 8 kelompok praktikum dapat merata ketika beberapa kelompok mengalami kendala teknis simulasi di perangkat Chromebook secara bersamaan.",
        q8: "Alternatif saya adalah menunjuk satu murid sebagai ketua tim teknis di setiap kelompok yang diberi penjelasan singkat sebelum jam pelajaran dimulai, serta menyediakan lembar troubleshooting mandiri di meja praktikum.",
        q9: "Hal yang telah mantap: penciptaan iklim kelas yang aman, pelibatan aktif seluruh murid, dan kontekstualisasi fenomena nyata kelistrikan (skor observasi 86.7 / Sangat Baik). Hal yang perlu ditingkatkan: butir pengelolaan alokasi waktu pada penutupan refleksi dan pemberian umpan balik formatif tertulis yang lebih terdokumentasi.",
        q10: "Pada pertemuan berikutnya, saya akan memperkuat praktik Pembelajaran Mendalam dengan menugaskan proyek mini audit konsumsi energi listrik rumah tangga murid (analisis KWh meter), memberikan ruang diferensiasi produk presentasi, serta mengalokasikan 10 menit penuh khusus dialog refleksi metakognisi murid."
      },
      kesanUmum: `Proses pembelajaran ${subject} berlangsung sangat dinamis, partisipatif, dan berhasil mengubah persepsi fisika dari hafalan rumus kaku menjadi sains pemecahan masalah kontekstual yang menyenangkan.`,
      saranMasukan: `Pertahankan strategi fasilitasi inkuiri yang berpusat pada murid. Tingkatkan pemanfaatan rubrik asesmen diri (self-assessment) secara berkelanjutan agar metakognisi murid semakin mandiri dan terdokumentasi.`,
      coaching: {
        tujuan: "Saya ingin murid memandang materi Listrik Arus Searah bukan momok rumus Hukum Ohm yang membosankan, tetapi sains aplikatif yang menjelaskan bagaimana smartphone mereka mengisi daya dengan aman dan bagaimana mendesain instalasi kelistrikan yang efisien.",
        realitas: "Saat ini murid hanya bersemangat selama 10 menit awal pemutaran video mobil listrik, namun kehilangan gairah begitu rumus loop Hukum Kirchhoff diperkenalkan di papan tulis.",
        opsi: "Mengganti papan rumus kaku dengan simulasi langsung menggunakan PhET Circuit Construction Kit DC dan rangkaian nyata lampu led dengan baterai di atas meja kelompok.",
        komitmen: "Saya berkomitmen menerapkan LKPD inkuiri rangkaian listrik DC minggu depan, memberi ruang kelompok membedah satu masalah kelistrikan nyata di sekolah, dan meninjau kembali bersama Bapak Pengawas Kusnandar pada 29 Agustus 2025."
      }
    };
  }
  if (cleanName.includes("ivany")) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: "Saya sangat gembira melihat antusiasme murid. Saat membaca cuplikan berita aktual pelayanan publik dan mengubahnya menjadi draf komik anekdot, murid sangat bersemangat mengemukakan ide-ide kritis yang menggelitik namun tetap sopan.",
        q2: "Proses belajar 90% sesuai modul ajar. Pengalaman memahami struktur teks anekdot dan mengaplikasikannya dalam naskah berjalan tepat waktu. Bagian merefleksi disesuaikan dengan teknik peer-review berpasangan agar setiap murid mendapat umpan balik langsung dari temannya.",
        q3: "Hal yang paling memuaskan adalah saat murid yang pendiam berani maju membacakan naskah monolog anekdotnya dengan ekspresif. Seluruh kelas tertawa dan memahami pesan moral di balik kritik fasilitas umum tanpa ada rasa kaku atau takut salah.",
        q4: "Ketercapaian tujuan diperkirakan mencapai 86%. Bukti nyata terlihat dari ketuntasan produk draf anekdot di mana 32 dari 36 murid berhasil memenuhi kelima struktur (abstraksi, orientasi, krisis, reaksi, koda) dengan bahasa retoris yang tepat.",
        q5: "Kesulitan murid adalah membedakan antara lelucon biasa dengan teks anekdot yang memuat kritik sosial berbobot. Saya mengatasinya dengan memberikan rubrik panduan pembeda dan mendampingi kelompok yang masih terjebak pada humor fisik agar beralih ke kritik sistemik.",
        q6: "Murid mengevaluasi karyanya menggunakan ceklis kriteria kesantunan berbahasa dan rubrik rubrik penilaian teman sejawat. Saya memberikan catatan umpan balik berupa apresiasi pilihan diksi serta arahan agar sindiran tidak mengarah ke fisik individu.",
        q7: "Kesulitan saya adalah memfasilitasi kebutuhan konsultasi naskah yang sangat variatif dalam waktu 2 jam pelajaran, karena setiap kelompok memiliki ide cerita yang unik.",
        q8: "Alternatifnya adalah menggunakan papan digital Padlet kolaboratif sehingga draf naskah dapat dibaca dan diberi catatan umpan balik secara daring oleh saya dan rekan sejawat sebelum dipresentasikan.",
        q9: "Hal yang telah mantap: keberanian murid berpendapat kritis, keterampilan komunikasi santun, dan suasana belajar yang sangat apresiatif (skor observasi 84.8 / Baik). Hal yang perlu ditingkatkan: butir penguatan variasi instrumen refleksi tertulis di akhir pertemuan.",
        q10: "Untuk pertemuan berikutnya, saya akan memperkuat Pembelajaran Mendalam dengan menyelenggarakan pameran mini komik strip teks anekdot karya murid di majalah dinding digital sekolah dan memfasilitasi refleksi nilai-nilai integritas publik."
      },
      kesanUmum: "Pembelajaran Bahasa Indonesia berhasil mengasah daya nalar kritis dan literasi ekspresif murid melalui karya teks anekdot yang santun, relevan, dan bermakna.",
      saranMasukan: "Dokumentasikan hasil karya murid sebagai portofolio praktik baik literasi sekolah dan terus kembangkan metode peer-assessment yang telah berjalan positif.",
      coaching: {
        tujuan: "Saya ingin murid berani bersuara kritis terhadap persoalan di sekitarnya, namun tetap menjunjung tinggi budi pekerti dan kesantunan bahasa Indonesia.",
        realitas: "Murid sering kali kebablasan menyindir teman secara personal ketika diminta membuat lelucon, atau sebaliknya menulis cerita yang sama sekali tidak ada sindiran sosialnya.",
        opsi: "Menggunakan koran daring lokal sebagai pemantik fakta dan menyepakati aturan main: kritik terhadap sistem atau fenomena, bukan fisik individu.",
        komitmen: "Saya akan memfasilitasi riset fakta mini 15 menit dan menerapkan rubrik kesantunan peer-review pada pertemuan minggu depan."
      }
    };
  }
  if (cleanName.includes("salma")) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: "Kesan saya sangat positif. Murid menunjukkan rasa ingin tahu yang tinggi ketika gawai mereka digunakan sebagai audio frequency generator untuk membedah konsep resonansi bunyi pada kolom udara.",
        q2: "Pembelajaran berjalan 88% sesuai modul ajar. Bagian memahami perambatan gelombang dan mengaplikasikan tabung resonansi berjalan efektif. Bagian refleksi berjalan interaktif saat mengaitkan bahaya polusi suara bagi pendengaran remaja.",
        q3: "Momen memuaskan terjadi saat murid mendengar dengung penguatan bunyi pertama dan serentak berseru takjub karena teori gelombang bunyi terbukti nyata di hadapan mereka.",
        q4: "Ketercapaian tujuan mencapai 87% dibuktikan dengan keakuratan data pengukuran panjang gelombang pada LKPD dan kemampuan murid menghitung cepat rambat bunyi di udara dengan galat kurang dari 5%.",
        q5: "Kesulitan murid adalah menjaga kestabilan air pada tabung resonansi dan ketelitian membaca skala mistar. Saya menugaskan peran spesifik dalam tim: satu pengatur air, satu pengamat skala, dan dua pencatat data.",
        q6: "Murid merefleksikan proses belajarnya melalui jurnal belajar ringkas. Umpan balik langsung saya berikan terkait ketelitian metode ilmiah dan cara meminimalkan kesalahan paralaks saat membaca skala.",
        q7: "Kesulitan saya adalah kebisingan suara frekuensi dari kelompok yang berdekatan yang sempat mengaburkan pendengaran nada dengung kelompok lain.",
        q8: "Alternatifnya adalah membagi giliran pengujian frekuensi atau menggunakan earphone pemandu frekuensi satu telinga untuk kelompok uji.",
        q9: "Hal yang telah mantap: eksperimen sains autentik, antusiasme kolaborasi, dan integrasi teknologi digital (skor observasi 86.0 / Baik). Hal yang perlu ditingkatkan: manajemen kebisingan ruang kelas saat praktikum akustik serentak.",
        q10: "Pada pertemuan lanjutan, saya akan memperkuat Pembelajaran Mendalam dengan menugaskan penyelidikan tingkat kebisingan (desibel meter) di area kantin dan perpustakaan sekolah untuk kampanye perlindungan pendengaran."
      },
      kesanUmum: "Pembelajaran gelombang bunyi berlangsung aplikatif, interaktif, dan berhasil membuktikan konsep fisis secara nyata melalui keterlibatan aktif murid.",
      saranMasukan: "Kembangkan lembar kerja yang menstimulasi murid merancang investigasi akustik mandiri dan dorong keterhubungan dengan isu kesehatan lingkungan.",
      coaching: {
        tujuan: "Saya ingin murid menyadari bahwa fisika gelombang bukan sebatas rumus di buku, tetapi sains di balik setiap dentuman musik yang mereka nikmati dan kunci menjaga telinga tetap sehat seumur hidup.",
        realitas: "Murid sering menghafal rumus v = f \xD7 \u03BB namun bingung menjelaskan mengapa suara petir bisa menggetarkan kaca jendela atau mengapa nada gitar berubah saat senar dipetik di fret berbeda.",
        opsi: "Memanfaatkan aplikasi generator nada di gawai mereka sendiri dan tabung resonansi air sehingga gelombang bunyi dapat didengar dan diamati perubahannya secara nyata.",
        komitmen: "Saya akan menerapkan LKPD inkuiri resonansi bunyi dan menugaskan kelompok menganalisis batas aman paparan suara earphone pada pertemuan 18 September."
      }
    };
  }
  if (cleanName.includes("alline")) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: "Saya sangat terkesan dengan keterlibatan murid saat memodelkan ikatan kimia menggunakan plastisin dan simulasi molekul 3D. Murid yang biasanya merasa kimia rumit menjadi sangat antusias.",
        q2: "Proses belajar berjalan 86% sesuai rencana modul ajar. Bagian memahami konfigurasi elektron dan mengaplikasikannya dalam bentuk molekul berjalan sangat interaktif.",
        q3: "Hal yang sangat memuaskan adalah saat murid mampu memprediksi kepolaran senyawa berdasarkan bentuk molekul yang mereka rakit sendiri dan membuktikannya dengan percobaan uji pembelokan arus air.",
        q4: "Ketercapaian tujuan mencapai 85% didukung oleh hasil post-test interaktif dan lembar verifikasi struktur Lewis yang dikerjakan secara tuntas oleh murid.",
        q5: "Kesulitan murid adalah membayangkan sudut ikatan ruang 3 dimensi dari gambar 2 dimensi di buku. Saya menanganinya dengan menggunakan aplikasi augmented reality molekul di ponsel murid.",
        q6: "Murid mengisi refleksi ketercapaian kompetensi di lembar kerja mandiri. Umpan balik saya berikan secara lisan saat berkeliling mendampingi perakitan model molekul.",
        q7: "Kesulitan saya adalah ketersediaan set model molymod yang terbatas sehingga harus mengombinasikan dengan bahan plastisin warna-warni.",
        q8: "Alternatif saya adalah memanfaatkan bahan alternatif ramah lingkungan dan aplikasi pemodelan digital yang dapat diunduh gratis oleh murid.",
        q9: "Hal yang telah mantap: visualisasi konsep mikroskopis ke makroskopis dan interaksi kelompok (skor observasi 85.5 / Baik). Hal yang perlu ditingkatkan: pemberian umpan balik tertulis yang lebih sistematis.",
        q10: "Pada sesi berikutnya, saya akan memperkuat Pembelajaran Mendalam dengan mengaitkan bentuk molekul dengan kelarutan obat-obatan dan sifat sabun pembersih dalam kehidupan sehari-hari."
      },
      kesanUmum: "Pembelajaran kimia berlangsung aplikatif, menyenangkan, dan berhasil memvisualisasikan dunia mikroskopis menjadi pengalaman belajar nyata.",
      saranMasukan: "Pertahankan diferensiasi media visual dan dorong murid untuk mempresentasikan logika pembentukan ikatan dengan narasi mereka sendiri.",
      coaching: {
        tujuan: `Menciptakan ruang belajar ${subject} yang membangkitkan nalar kritis dan rasa ingin tahu murid terhadap fenomena molekuler di sekitar mereka.`,
        realitas: "Murid masih sering menghafal bentuk molekul tanpa memahami prinsip tolakan pasangan elektron bebas.",
        opsi: "Mengintegrasikan perakitan model fisik plastisin dengan simulasi digital interaktif.",
        komitmen: "Menerapkan modul ajar inkuiri terbimbing pemodelan ikatan kimia pada pertemuan berikutnya."
      }
    };
  }
  const beforeMatriks = supervision.sambung?.selidiki?.matriksBefore;
  const peranGuruCondition = beforeMatriks?.peranGuru || `Guru memfasilitasi pengalaman belajar aktif pada materi ${subject}.`;
  const aktivitasMuridCondition = beforeMatriks?.aktivitasMurid || `Murid aktif berpartisipasi dan mengonstruksi pemahaman konsep ${subject}.`;
  const konteksNyataCondition = beforeMatriks?.konteksNyata || `Pembelajaran ${subject} terhubung dengan masalah kehidupan sehari-hari.`;
  const refleksiMuridCondition = beforeMatriks?.refleksiMurid || `Murid membiasakan refleksi berkala atas proses belajarnya.`;
  return {
    tanggal: supervision.sambung?.maknai?.tanggal || today,
    pertanyaanList: {
      q1: `Saya sangat bersyukur melihat peningkatan keterlibatan dan antusiasme murid selama proses pembelajaran ${subject}. Murid tampak jauh lebih aktif mengemukakan ide, berdiskusi dalam kelompok, dan terlibat langsung mengeksplorasi konsep ${lessonTitle}.`,
      q2: `Sekitar 85-90% proses pembelajaran berjalan sesuai rencana modul ajar. Pengalaman memahami konsep awal dan mengaplikasikannya dalam penugasan kontekstual berjalan sangat baik. Bagian merefleksi disesuaikan secara fleksibel agar murid memiliki waktu cukup untuk merumuskan pemahamannya.`,
      q3: `Hal yang paling memuaskan adalah saat murid menemukan sendiri kaitan antara materi ${subject} dengan pengalaman kehidupan sehari-hari mereka. Suasana belajar tampak menyenangkan, interaktif, dan murid tidak lagi pasif menunggu instruksi.`,
      q4: `Berdasarkan pengamatan proses dan asesmen formatif selama pembelajaran, ketercapaian tujuan pembelajaran diperkirakan mencapai sekitar ${Math.round(obsScore)}%. Hal ini didukung oleh ketuntasan lembar kerja murid dan keaktifan presentasi kelompok.`,
      q5: `Sebagian murid masih membutuhkan bimbingan bertahap dalam mengorganisasi data dan menarik kesimpulan mandiri. Saya menanggapi perbedaan ini dengan menerapkan diferensiasi proses: memberikan pendampingan intensif bagi kelompok yang membutuhkan serta memberikan tantangan pengayaan bagi kelompok yang lebih cepat.`,
      q6: `Murid menilai proses belajarnya menggunakan lembar refleksi 3-2-1 dan tiket keluar di akhir sesi. Saya memberikan umpan balik langsung yang bersifat apresiatif, memvalidasi ide mereka, serta mengarahkan aspek yang masih perlu disempurnakan.`,
      q7: `Kesulitan utama yang saya rasakan adalah mengoptimalkan alokasi waktu antara kegiatan eksplorasi kelompok yang dinamis dengan sesi konfirmasi dan refleksi mendalam di penutup pembelajaran.`,
      q8: `Alternatif yang akan saya lakukan adalah menetapkan pembagian waktu yang lebih tegas dengan bantuan timer visual di kelas, serta menyederhanakan format lembar kerja agar fokus pada konsep esensial materi ${subject}.`,
      q9: `Berdasarkan instrumen observasi kelas (skor ${obsScore} / predikat ${obsPred}): hal yang telah mantap adalah ${peranGuruCondition} dan ${aktivitasMuridCondition}. Butir yang perlu ditingkatkan adalah pembiasaan refleksi metakognitif terstruktur dan variasi teknik asesmen formatif cepat.`,
      q10: `Untuk memperkuat praktik Pembelajaran Mendalam (Deep Learning) pada pertemuan berikutnya, saya akan menerapkan pembelajaran berbasis proyek/studi kasus kontekstual, memperkuat peran saya sebagai coach dan fasilitator inkuiri, serta membiasakan murid melakukan asesmen diri secara konsisten.`
    },
    kesanUmum: `Proses pembelajaran ${subject} oleh ${teacherName} berlangsung interaktif, berpusat pada murid, dan berhasil menciptakan lingkungan belajar yang aman, inklusif, dan bermakna.`,
    saranMasukan: `Pertahankan fasilitasi inkuiri yang mengaktifkan nalar murid. Tingkatkan pemanfaatan rubrik refleksi berkala dan bagikan praktik baik ini dalam Komunitas Belajar (Kombel) sekolah.`,
    coaching: {
      tujuan: `Menciptakan pengalaman belajar ${subject} yang berpusat pada murid, mengembangkan nalar kritis, dan relevan dengan kehidupan nyata.`,
      realitas: `Keterlibatan murid telah meningkat signifikan, namun konsistensi refleksi dan diferensiasi proses masih perlu terus diperkuat.`,
      opsi: `Menerapkan LKPD eksploratif terstruktur, studi kasus nyata, dan teknik refleksi harian (exit ticket).`,
      komitmen: `Berkomitmen melaksanakan rencana tindak lanjut pembinaan bersama pengawas pembina Kusnandar, M.Si pada pertemuan mendatang.`
    }
  };
}
function generateBerdayakanTelaahPerbaikanData(supervision, customRppUrl, customTitle) {
  const teacherName = supervision.teacherName || "Guru Binaan";
  const schoolName = supervision.schoolName || "SMA Binaan";
  const subject = supervision.subject || "Mata Pelajaran";
  const cleanName = teacherName.toLowerCase();
  const amati = supervision.sambung?.arahkan;
  const chosenKeys = amati?.fokusIndikatorTerpilih || ["peranGuru", "aktivitasMurid"];
  const maknai = supervision.sambung?.maknai;
  const rppUrl = (customRppUrl || supervision.sambung?.berdayakan?.rppPerbaikanUrl || supervision.perangkatAjar?.revisi?.modulAjarRevisiUrl || supervision.perangkatAjarPerbaikan?.driveLinks?.modulAjarUrl || `https://drive.google.com/file/d/1RPP_Perbaikan_${encodeURIComponent(subject)}_${encodeURIComponent(teacherName.replace(/\s+/g, "_"))}/view?usp=sharing`).trim();
  const rppTitle = (customTitle || supervision.sambung?.berdayakan?.rppPerbaikanTitle || (supervision.lessonTitle ? `RPP Perbaikan: ${supervision.lessonTitle}` : `Modul Ajar Perbaikan Inovatif & Kontekstual ${subject}`)).trim();
  const tanggalTelaah = supervision.sambung?.berdayakan?.tanggalTelaah || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const namaPenelaah = supervision.sambung?.berdayakan?.namaPenelaah || supervision.supervisorName || "Kusnandar, M.Si";
  const isBelumOptimal = supervision.statusOptimal === "belum_optimal" || supervision.perangkatAjar?.telaahSummary?.finalScore !== void 0 && supervision.perangkatAjar.telaahSummary.finalScore < 85;
  const baselineTelaahScore = supervision.perangkatAjar?.telaahSummary?.finalScore || 84.1;
  const telaahScores = isBelumOptimal ? {
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 1,
    6: 2,
    7: 2,
    8: 1,
    9: 2,
    10: 2,
    11: 2,
    12: 1,
    13: 2,
    14: 1,
    15: 2,
    16: 2,
    17: 2,
    18: 2,
    19: 1,
    20: 2,
    21: 1,
    22: 1
  } : {
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
    9: 2,
    10: 2,
    11: 2,
    12: 2,
    13: 2,
    14: 2,
    15: 2,
    16: 2,
    17: 2,
    18: 2,
    19: 2,
    20: 2,
    21: 2,
    22: 2
  };
  let telaahComments = {};
  if (cleanName.includes("dewi") || subject.toLowerCase().includes("fisika")) {
    telaahComments = {
      1: `Identitas RPP perbaikan lengkap dan jelas, mencantumkan satuan pendidikan ${schoolName}, fase F, materi Gelombang Bunyi & Cahaya, serta alokasi waktu yang proporsional.`,
      2: `Pemetaan kesiapan murid sebelum belajar telah dipetakan mendalam mencakup pemahaman konsep getaran dasar dan minat teknologi audio smartphone.`,
      3: `Analisis materi pelajaran fisika mengintegrasikan fenomena nyata gelombang audio lingkungan sekitar dan penguatan bernalar ilmiah.`,
      4: `Dimensi Profil Pelajar Pancasila (Bernalar Kritis dan Mandiri) terdefinisi selaras dengan tujuan inkuiri gelombang bunyi.`,
      5: `Tujuan pembelajaran, alur eksperimen laboratorium, dan asesmen telah secara eksplisit mengarah pada perwujudan profil bernalar kritis murid.`,
      6: `Keselarasan konstruktif (constructive alignment) terhubung utuh dari tujuan, aktivitas percobaan virtual/nyata, hingga asesmen unjuk kerja.`,
      7: `Tujuan pembelajaran dirumuskan terukur dengan KKO menganalisis dan membuktikan hubungan frekuensi, cepat rambat, dan panjang gelombang.`,
      8: `Praktik pedagogis menerapkan Inkuiri Terbimbing dipadukan demonstrasi generator frekuensi audio smartphone yang sangat memantik rasa ingin tahu.`,
      9: `Lingkungan belajar diatur kondusif, memfasilitasi rotasi kelompok percobaan dengan suasana aman dan inklusif.`,
      10: `Kemitraan pembelajaran tergambar melalui penugasan investigasi tingkat kebisingan lingkungan sekolah dan rekomendasi akustik sehat.`,
      11: `Pemanfaatan aplikasi Frequency Sound Generator dan simulasi PhET Wave Interactive sangat efektif memperjelas konsep abstrak.`,
      12: `Pengalaman belajar MEMAHAMI: murid aktif mengonstruksi konsep gelombang dari data percobaan nyata dan stimulasi nalar kritis.`,
      13: `Pengalaman belajar MENGAPLIKASI: murid menerapkan pemahaman resonansi pipa organa untuk memecahkan persoalan peredaman bunyi ruangan.`,
      14: `Pengalaman belajar MEREFLEKSI: guru menyediakan lembar refleksi 3-2-1 dan tiket keluar di mana murid mengevaluasi pemahaman konsep secara metakognitif.`,
      15: `Tindakan saling MEMULIAKAN antara Guru-Murid dan antarmurid tercermin nyata melalui bahasa apresiatif dan pendampingan setara tanpa diskriminasi.`,
      16: `Prinsip Pembelajaran Mendalam (berkesadaran, bermakna, menggembirakan) terwujud kuat pada alur apersepsi, penyelidikan, dan penutupan.`,
      17: `Perencanaan mengakomodir diferensiasi proses: panduan bertingkat (scaffolding) disiapkan bagi murid yang memerlukan bimbingan membaca skala tabung resonansi.`,
      18: `Asesmen diagnostik awal terencana sistematis menggunakan kuis interaktif singkat untuk memetakan kesiapan fisis murid.`,
      19: `Asesmen formatif proses berjalan kontinyu melalui observasi lembar ceklis kinerja praktikum dan umpan balik timbal balik langsung.`,
      20: `Asesmen sumatif mengukur kompetensi secara autentik melalui laporan infografis digital dan presentasi hasil analisis data frekuensi.`,
      21: `Rubrik KKTP deskriptif sangat jelas, memuat kriteria ketercapaian per indikator kompetensi gelombang secara objektif dan transparan.`,
      22: `Lembar Kerja Murid (LKPD) perbaikan dirancang sangat terstruktur, memandu inkuiri mandiri tanpa membatasi kreativitas penalaran murid.`
    };
  } else if (cleanName.includes("ahmad") || subject.toLowerCase().includes("biologi")) {
    telaahComments = {
      1: `Identitas RPP perbaikan lengkap, mencantumkan satuan pendidikan ${schoolName}, fase E, materi Bioteknologi Konvensional, dan alokasi waktu terstruktur.`,
      2: `Identifikasi kesiapan murid memetakan pengetahuan awal konsep fermentasi pangan lokal dan minat kewirausahaan bioteknologi.`,
      3: `Analisis materi biologi menghubungkan reaksi biokimia fermentasi dengan produk pangan sehari-hari dan nilai kearifan lokal.`,
      4: `Dimensi Profil Pelajar Pancasila (Gotong Royong, Kreatif, dan Bernalar Kritis) terintegrasi eksplisit dalam projek pembuatan tapai/yogurt.`,
      5: `Tujuan, tahapan projek fermentasi, dan asesmen telah selaras mengarah pada capaian Profil Pelajar Pancasila.`,
      6: `Alur tujuan, langkah pembuatan rancangan formula, dan rubrik asesmen produk terhubung utuh secara konsisten.`,
      7: `Tujuan pembelajaran menggunakan KKO menganalisis faktor laju fermentasi dan mendesain prototipe produk pangan higienis.`,
      8: `Praktik pedagogis menerapkan Project-Based Learning (PjBL) kontekstual dengan media pemandu investigasi biologis yang menarik.`,
      9: `Lingkungan belajar laboratorium dan ruang kelas tertata higienis, aman, dan mendorong kolaborasi antarmurid.`,
      10: `Kemitraan pembelajaran menghubungkan siswa dengan perajin pangan fermentasi lokal sebagai narasumber studi kontekstual.`,
      11: `Pemanfaatan platform digital untuk pencatatan grafik pH/suhu harian fermentasi dan pembuatan video dokumentasi projek.`,
      12: `Pengalaman belajar MEMAHAMI: murid terlibat aktif menganalisis peran mikroorganisme Saccharomyces cerevisiae melalui eksplorasi nyata.`,
      13: `Pengalaman belajar MENGAPLIKASI: murid memodifikasi variabel ragi dan suhu untuk menghasilkan tekstur fermentasi yang optimal.`,
      14: `Pengalaman belajar MEREFLEKSI: murid mengevaluasi keberhasilan fermentasi dan menyusun jurnal refleksi kendala secara mandiri.`,
      15: `Tindakan saling MEMULIAKAN tercermin dalam pembagian peran kelompok yang adil dan apresiasi atas kontribusi setiap anggota tim.`,
      16: `Prinsip Pembelajaran Mendalam terwujud melalui pengalaman langsung mengolah produk bernilai guna tinggi yang menggembirakan.`,
      17: `Mengakomodir karakteristik murid dengan fleksibilitas pilihan bahan baku pangan lokal sesuai preferensi kelompok.`,
      18: `Asesmen awal diagnostik nonkognitif dan kognitif berhasil memetakan kesiapan murid terhadap materi biologi seluler.`,
      19: `Asesmen proses memantau ketelitian sanitasi alat dan jurnal progres mingguan dengan umpan balik berkala dari guru.`,
      20: `Asesmen hasil berupa uji organoleptik produk fermentasi dan pameran presentasi karya ilmiah mini murid.`,
      21: `Rubrik KKTP komprehensif memuat kriteria saintifik, higienitas, dan kreativitas penyajian secara transparan.`,
      22: `LKPD PjBL perbaikan terstruktur rapi, memuat panduan keselamatan kerja biologi dan lembar data pengamatan yang mudah dipahami.`
    };
  } else if (cleanName.includes("siti") || subject.toLowerCase().includes("bahasa indonesia")) {
    telaahComments = {
      1: `Identitas RPP perbaikan lengkap dan spesifik fase E untuk mata pelajaran ${subject} materi Teks Anekdot Bermakna Sosial.`,
      2: `Identifikasi kesiapan murid memetakan kepekaan isu sosial lingkungan dan minat kreasi komik strip digital.`,
      3: `Analisis materi menghubungkan fungsi kritik sosial teks anekdot dengan etika berbahasa santun dan nilai moral Pancasila.`,
      4: `Dimensi Profil Pelajar Pancasila (Kreatif dan Bernalar Kritis) tertuang jelas dalam kegiatan mencipta naskah anekdot.`,
      5: `Tujuan pembelajaran, penulisan draf, dan rubrik penelaahan antarteman selaras mengarah pada capaian Profil Pelajar Pancasila.`,
      6: `Keterpaduan antara tujuan analisis struktur, proses penulisan kreatif, dan asesmen autentik terjalin secara utuh.`,
      7: `Tujuan pembelajaran menggunakan KKO mengevaluasi gagasan tersirat dan mengkreasi kembali teks anekdot visual secara terukur.`,
      8: `Praktik pedagogis memadukan Genre-Based Approach dan pembelajaran kontekstual berbasis berita hangat transportasi publik.`,
      9: `Lingkungan kelas dirancang dinamis dengan pojok galeri komik mini yang menyenangkan dan mengapresiasi karya seluruh murid.`,
      10: `Kemitraan kontekstual melibatkan telaah isu fasilitas umum kota Bogor sebagai materi faktual komik anekdot.`,
      11: `Pemanfaatan aplikasi Canva for Education dan platform pameran digital Padlet untuk kurasi karya komik strip murid.`,
      12: `Pengalaman belajar MEMAHAMI: murid membedakan humor biasa dengan kritik sosial mendalam melalui analisis teks model.`,
      13: `Pengalaman belajar MENGAPLIKASI: murid menyusun sketsa komik anekdot yang mengkritisi persoalan nyata secara etis dan santun.`,
      14: `Pengalaman belajar MEREFLEKSI: murid menuliskan refleksi dampak pesan moral komik dan evaluasi proses kreatif yang dialami.`,
      15: `Tindakan saling MEMULIAKAN tercermin dalam sesi peer-review yang menggunakan prinsip umpan balik bersahabat (Praise-Question-Suggest).`,
      16: `Prinsip Pembelajaran Mendalam berkesadaran etika dan menggembirakan terpancar saat murid saling bertukar ide cerita.`,
      17: `Mengakomodir diferensiasi: murid diberi pilihan menyajikan anekdot dalam format monolog teks, audio podcast mini, atau komik visual.`,
      18: `Asesmen awal memetakan pemahaman murid mengenai struktur teks anekdot (abstraksi, orientasi, krisis, reaksi, koda).`,
      19: `Asesmen proses dilakukan melalui lembar penelaahan draf karya secara bertahap dengan bimbingan fasilitatif guru.`,
      20: `Asesmen sumatif berupa pameran karya antologi anekdot digital dan rubrik performa orisinalitas ide.`,
      21: `Rubrik KKTP sangat detail memisahkan aspek ketajaman pesan kritik sosial, kesantunan bahasa, dan kualitas estetika visual.`,
      22: `LKPD perbaikan memuat scaffolding tahapan menemukan premis lucu hingga penulisan koda moral yang inspiratif.`
    };
  } else {
    telaahComments = {
      1: `Identitas RPP perbaikan lengkap dan jelas, mencantumkan satuan pendidikan ${schoolName}, fase pembelajaran, materi esensial ${subject}, dan alokasi waktu yang proporsional.`,
      2: `Identifikasi kesiapan murid sebelum belajar telah dipetakan secara terstruktur mencakup pengetahuan awal, gaya belajar, dan kebutuhan minat murid.`,
      3: `Analisis materi ajar ${subject} disusun mendalam, mengintegrasikan relevansi kehidupan nyata dan penguatan karakter murid.`,
      4: `Dimensi Profil Pelajar Pancasila (Bernalar Kritis, Mandiri, dan Gotong Royong) terdefinisi selaras dengan capaian pembelajaran.`,
      5: `Tujuan, alur langkah, dan asesmen telah secara eksplisit mengarah pada perwujudan Profil Pelajar Pancasila yang ditargetkan.`,
      6: `Keselarasan konstruktif (constructive alignment) terjalin utuh dan harmonis antara tujuan, aktivitas kelas, dan instrumen asesmen.`,
      7: `Tujuan pembelajaran dirumuskan terukur menggunakan KKO berorientasi HOTS (High Order Thinking Skills) mencakup kompetensi dan konten materi ${subject}.`,
      8: `Praktik pedagogis menerapkan Problem-Based Learning / Inkuiri Terbimbing dengan media interaktif yang memantik rasa ingin tahu murid.`,
      9: `Desain lingkungan belajar fisik dan ruang kolaborasi virtual dirancang aman, inklusif, dan memupuk budaya belajar kolaboratif.`,
      10: `Kemitraan pembelajaran tergambar melalui studi kasus kontekstual lingkungan dan kolaborasi antarkelompok murid.`,
      11: `Pemanfaatan platform teknologi digital dan simulasi interaktif sangat optimal dalam mendukung visualisasi materi ${subject}.`,
      12: `Pengalaman belajar MEMAHAMI: murid terlibat aktif mengonstruksi konsep secara mendalam, menghubungkan materi dengan konteks riil, dan menstimulasi nalar kritis.`,
      13: `Pengalaman belajar MENGAPLIKASI: memfasilitasi murid menerapkan konsep ${subject} ke dalam situasi nyata dan menghasilkan solusi inovatif.`,
      14: `Pengalaman belajar MEREFLEKSI: memfasilitasi metakognisi, evaluasi diri, dan regulasi emosi murid menggunakan lembar refleksi 3-2-1 dan tiket keluar.`,
      15: `Tindakan saling MEMULIAKAN antara Guru-Murid dan Murid-Murid tercermin nyata melalui bahasa apresiatif, saling menghargai, dan suasana kelas yang nyaman.`,
      16: `Prinsip Pembelajaran Mendalam (berkesadaran, bermakna, dan menggembirakan) terwujud kuat pada setiap tahapan kegiatan pendahuluan, inti, dan penutup.`,
      17: `Perencanaan pembelajaran mengakomodir diferensiasi proses dan konten sesuai profil keragaman peserta didik.`,
      18: `Asesmen diagnostik awal terencana sistematis untuk memetakan kesiapan mental dan pemahaman dasar murid dengan tindak lanjut yang jelas.`,
      19: `Asesmen formatif berkelanjutan berjalan aktif, memantau kemajuan belajar murid dengan pemberian umpan balik konstruktif timbal-balik.`,
      20: `Asesmen sumatif autentik mengukur pencapaian kompetensi melalui unjuk kerja praktikum/proyek dan presentasi portofolio murid.`,
      21: `Rubrik KKTP (Kriteria Ketercapaian Tujuan Pembelajaran) disusun dengan deskripsi gradasi yang transparan, operasional, dan objektif.`,
      22: `Lembar Kerja Murid (LKPD) perbaikan dirancang kontekstual, eksploratif, dan selaras sempurna dengan tujuan pembelajaran ${subject}.`
    };
  }
  const feedback = {
    kelebihan: `Perencanaan pembelajaran hasil perbaikan menunjukkan lompatan kualitas yang sangat signifikan: integrasi diferensiasi konten & proses, simulasi pemecahan masalah kontekstual materi ${subject}, serta alur pengalaman belajar Memahami, Mengaplikasi, dan Merefleksi telah terjalin utuh selaras dengan rekomendasi coaching SAMBUNG.`,
    perbaikan: `Pertahankan konsistensi fasilitasi saat uji coba di kelas, optimalkan waktu transisi antaraktivitas kelompok, dan biasakan murid melakukan refleksi metakognitif harian secara konsisten.`,
    rekomendasi: `RPP perbaikan telah memenuhi seluruh kriteria Pembelajaran Mendalam secara optimal (skor 44 / 100% / Predikat Sangat Baik). Sangat layak untuk diimplementasikan pada observasi tatap muka lanjutan dan dibagikan sebagai model praktik baik di Komunitas Belajar (Kombel) ${schoolName}.`
  };
  const kategoriDeskripsi = "Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.";
  const existingSiklus = supervision.sambung?.berdayakan?.siklusList;
  const siklusList = existingSiklus && existingSiklus.length > 0 ? existingSiklus : [
    {
      siklus: 1,
      rancanganDanUjiCoba: `Uji coba modul ajar perbaikan ${subject} dengan studi kasus kontekstual dan lembar eksplorasi bertingkat pada kelompok heterogen.`,
      refleksi: `Keterlibatan murid meningkat tajam; murid antusias berdiskusi dan berani mengutarakan gagasan tanpa ragu.`,
      perbaikanBerikutnya: `Memperkuat panduan scaffolding bagi murid yang memerlukan waktu eksplorasi tambahan.`
    },
    {
      siklus: 2,
      rancanganDanUjiCoba: `Penerapan diferensiasi proses dengan media digital interaktif dan sesi umpan balik antarteman (peer-assessment).`,
      refleksi: `Kolaborasi antarmurid berjalan solid; seluruh murid mampu menuntaskan tantangan belajar sesuai ritme masing-masing.`,
      perbaikanBerikutnya: `Mengembangkan instrumen refleksi diri murid dengan format 3-2-1 dan tiket keluar di akhir sesi.`
    },
    {
      siklus: 3,
      rancanganDanUjiCoba: `Presentasi unjuk kerja karya murid dan refleksi mendalam mengenai kebermaknaan materi ${subject} dalam kehidupan nyata.`,
      refleksi: `Murid mandiri dan percaya diri memaparkan hasil penalaran; pemahaman konsep esensial tercapai 100% tuntas.`,
      perbaikanBerikutnya: `Mendokumentasikan hasil karya murid sebagai portofolio kelas dan membagikan modul ke MGMP sekolah.`
    }
  ];
  return {
    rppPerbaikanUrl: rppUrl,
    rppPerbaikanTitle: rppTitle,
    tanggalTelaah,
    namaPenelaah,
    telaahScores,
    telaahComments,
    telaahSummary: {
      ...calculateTelaahSummary(telaahScores),
      kategoriDeskripsi
    },
    feedback,
    catatanRefleksiGuru: `Modul ajar perbaikan ini telah mengadopsi seluruh rekomendasi evaluasi instrumen Selidiki, fokus target Amati, dan komitmen dialog coaching Maknai untuk mewujudkan pembelajaran yang berpusat pada murid.`,
    siklusList
  };
}
function generateUjiData(supervision) {
  const teacherName = supervision.teacherName || "Guru Binaan";
  const schoolName = supervision.schoolName || "SMA Binaan";
  const subject = supervision.subject || "Mata Pelajaran";
  const lessonTitle = supervision.lessonTitle || "Pembelajaran Kontekstual Berdiferensiasi";
  const cleanName = teacherName.toLowerCase();
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let praObservasi;
  if (cleanName.includes("dewi") || subject.toLowerCase().includes("fisika")) {
    praObservasi = {
      q1: `Menganalisis karakteristik gelombang bunyi dan menerapkan konsep resonansi pada akustik ruangan nyata melalui investigasi terbimbing. Murid memahaminya lewat simulasi dan eksperimen audio langsung.`,
      q2: `Pendekatan Saintifik berbasis Inkuiri Terbimbing dan Model Problem-Based Learning. Dipilih karena melatih bernalar kritis dan membiasakan murid membuktikan konsep secara empiris.`,
      q3: `Aplikasi Frequency Sound Generator smartphone, pipa organa sederhana, simulasi interaktif PhET Waves, dan LKPD kontekstual investigasi kebisingan kelas.`,
      q4: `Memahami: demonstrasi frekuensi audio; Mengaplikasi: eksperimen penentuan cepat rambat bunyi dan uji bahan peredam; Merefleksi: jurnal refleksi metakognitif 3-2-1.`,
      q5: `Menghadirkan fenomena akustik gedung bioskop/studio musik yang dekat dengan keseharian murid, memberikan tantangan desain peredam suara, dan mengapresiasi keberagaman ide.`,
      q6: `Konsep interferensi dan resonansi matematis. Diantisipasi dengan scaffolding bertahap, pembagian kelompok heterogen, dan panduan visual komprehensif.`,
      q7: `Dimensi Bernalar Kritis (menganalisis data empiris) dan Gotong Royong (kolaborasi investigasi kelompok).`,
      q8: `Memberikan peran spesifik kepada setiap anggota kelompok (pengukur, pencatat data, analis, juru bicara) agar seluruh murid terlibat aktif dan bertanggung jawab.`,
      supervisorNotes: `Guru telah sangat siap mempraktikkan modul ajar revisi dengan media alat peraga digital yang relevan dan LKPD kontekstual.`,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } else if (cleanName.includes("budi") || subject.toLowerCase().includes("biologi")) {
    praObservasi = {
      q1: `Menganalisis interaksi antar-komponen ekosistem dan jaring-jaring makanan melalui observasi biotik/abiotik di lingkungan taman sekolah.`,
      q2: `Model Project-Based Learning dan inkuiri lapangan. Dipilih agar murid mengalami langsung proses observasi alam nyata bukan sekadar menghafal skema buku.`,
      q3: `Lingkungan taman sekolah, mikroskop portabel/kaca pembesar, aplikasi flora-fauna identifier, dan lembar kerja pemetaan rantai makanan.`,
      q4: `Memahami: eksplorasi jenis interaksi simbiosis di taman; Mengaplikasi: menyusun model piramida biomassa lokal; Merefleksi: menuliskan dampak kepunahan salah satu spesies.`,
      q5: `Mengaitkan materi dengan isu pelestarian lingkungan lokal sekolah, mengajak belajar di luar ruangan (outdoor learning) yang menyegarkan pikiran.`,
      q6: `Penghitungan aliran energi antar-trofik. Diantisipasi dengan diagram aliran visual interaktif dan pembimbingan kelompok terfokus.`,
      q7: `Beriman dan Bertakwa kepada Tuhan YME & Berakhlak Mulia (akhlak kepada alam), serta Bernalar Kritis.`,
      q8: `Lembar observasi lapangan yang menuntut kerja sama aktif dan pembagian zona pengamatan taman secara merata.`,
      supervisorNotes: `Rancangan pembelajaran outdoor sangat matang dengan panduan mitigasi keselamatan dan lembar observasi kontekstual yang jelas.`,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } else if (cleanName.includes("siti") || subject.toLowerCase().includes("matematika")) {
    praObservasi = {
      q1: `Menyelesaikan masalah kontekstual yang berkaitan dengan Sistem Persamaan Linear Tiga Variabel (SPLTV) dalam kasus perencanaan belanja logistik sekolah.`,
      q2: `Model Problem-Based Learning (PBL) berbasis studi kasus nyata kehidupan sehari-hari (anggaran kantin dan belanja ATK).`,
      q3: `Kalkulator grafik GeoGebra, kartu masalah belanja kontekstual, dan LKPD kolaboratif pemodelan matematika bertahap.`,
      q4: `Memahami: menerjemahkan narasi cerita ke model aljabar; Mengaplikasi: menyelesaikan sistem persamaan dengan metode gabungan; Merefleksi: memeriksa keabsahan solusi matematika terhadap batasan riil.`,
      q5: `Mengangkat permasalahan riil yang dihadapi OSIS sekolah, menciptakan suasana diskusi kelompok yang saling membantu tanpa rasa takut salah.`,
      q6: `Transformasi soal cerita naratif kompleks menjadi bentuk matematis formal. Diantisipasi dengan panduan kata kunci dan tabel identifikasi variabel.`,
      q7: `Bernalar Kritis (analisis logika pemodelan) dan Mandiri (ketekunan menyelesaikan algoritma solusi).`,
      q8: `Pemberian tugas berjenjang (scaffolded tasks) sesuai kesiapan belajar murid kelompok cepat, sedang, dan butuh bimbingan.`,
      supervisorNotes: `Skenario diferensiasi proses berbasis tingkat kesiapan murid telah dirancang rapi dengan rubrik pemecahan masalah yang transparan.`,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } else {
    praObservasi = {
      q1: `Mewujudkan tujuan pembelajaran ${lessonTitle} pada mata pelajaran ${subject} agar murid mampu menguasai kompetensi esensial dan mengaplikasikannya dalam situasi nyata.`,
      q2: `Model Pembelajaran Berbasis Masalah (PBL) dipadukan dengan teknik diskusi kolaboratif berdiferensiasi untuk mengakomodir kebutuhan murid.`,
      q3: `Media pembelajaran multimedia interaktif, LKPD kontekstual, sumber belajar lingkungan sekitar, dan referensi digital relevan.`,
      q4: `Tahapan memahami konsep dasar, mengaplikasikan dalam studi kasus nyata, dan merefleksikan proses serta hasil belajar secara mandiri.`,
      q5: `Menghadirkan suasana belajar yang berpusat pada murid, membangun rasa ingin tahu melalui pertanyaan pemantik, serta komunikasi positif yang memuliakan murid.`,
      q6: `Bagian analisis konsep mendalam diantisipasi melalui scaffolding bertahap dan pendampingan kelompok terfokus.`,
      q7: `Profil Pelajar Pancasila: Bernalar Kritis, Kreatif, dan Bergotong Royong sesuai capaian pembelajaran fase.`,
      q8: `Penyediaan lembar aktivitas interaktif yang mendorong setiap murid berani menyampaikan ide dan mengonstruksi pemahamannya sendiri.`,
      supervisorNotes: `Persiapan pelaksanaan uji coba pembelajaran perbaikan sangat komprehensif dan selaras dengan rekomendasi siklus pendampingan sebelumnya.`,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  const observasiItems = {};
  const defaultNotesFor25 = {
    "1": `Tujuan pembelajaran terintegrasi utuh antara dimensi sikap (gotong royong), pengetahuan konsep, dan unjuk kerja teramati jelas dalam aktivitas ${subject}.`,
    "2": `Penilaian formatif autentik berlangsung konsisten selama pembelajaran mengukur ketercapaian dimensi bernalar kritis dan profil lulusan.`,
    "3": `Alur pembelajaran dari apersepsi, eksplorasi, elaborasi, hingga penutup tertata runtut; murid fokus dan aktif mengikuti instruksi.`,
    "4": `Aktivitas pembelajaran mengaitkan materi ${subject} secara nyata dengan fenomena lingkungan dan keseharian murid.`,
    "5": `Murid tampak antusias, bersemangat saat berdiskusi, dan suasana kelas hidup dengan rasa ingin tahu tinggi.`,
    "6": `Keterlibatan aktif murid terlihat menyeluruh dalam kelompok; murid berdiskusi, bertanya kepada guru, dan menggali data dari berbagai sumber.`,
    "7": `Murid mampu mempraktikkan konsep secara langsung untuk memecahkan studi kasus kontekstual yang diberikan guru.`,
    "8": `Sesi refleksi metakognitif terlaksana optimal; murid mengutarakan keberhasilan belajarnya dan mencatat rencana tindak lanjut.`,
    "9": `Strategi inkuiri dan diferensiasi terlaksana sangat efektif sesuai tujuan yang direncanakan dalam modul ajar perbaikan.`,
    "10": `Kolaborasi dinamis antara guru-murid dan antar-murid tercipta harmonis dengan interaksi komunikatif yang konstruktif.`,
    "11": `Suasana kelas tertib, nyaman, aman secara psikologis; murid tidak ragu mengemukakan pendapat atau bertanya.`,
    "12": `Pemanfaatan media ajar interaktif dan perangkat digital mendukung pemahaman konsep abstrak secara visual dan konkret.`,
    "13": `Budaya saling menghargai dan memuliakan tercermin nyata; tidak ada intimidasi atau perundungan antarmurid saat presentasi.`,
    "14": `Murid memahami dengan jelas sasaran belajar hari ini serta mampu mengaitkannya dengan bekal pelajaran sebelumnya.`,
    "15": `Murid diberikan kebebasan memilih bentuk unjuk kerja kelompok dan melakukan evaluasi diri secara percaya diri.`,
    "16": `Mayoritas murid mencapai kriteria ketuntasan tujuan pembelajaran (KKTP) terbukti dari hasil lembar kerja yang berkualitas.`,
    "17": `Kemandirian belajar murid terwujud saat mereka memecahkan persoalan pada lembar kerja tanpa bergantung terus-menerus pada ceramah guru.`,
    "18": `Guru memberikan perlakuan adil dan scaffolding bervariasi sesuai kesiapan belajar murid (diferensiasi proses terbukti nyata).`,
    "19": `Pengelolaan waktu dan ruang kelas sangat efektif; peralihan antarfase pembelajaran berjalan mulus dan kontekstual.`,
    "20": `Refleksi akhir merujuk langsung pada pencapaian tujuan dan menjadi dasar penetapan rencana belajar pertemuan berikutnya.`,
    "21": `Guru aktif berkeliling memberikan umpan balik formatif yang memberdayakan dan mengoreksi miskonsepsi secara personal.`,
    "22": `Asesmen unjuk kerja di akhir sesi membuktikan ketercapaian kompetensi esensial murid secara transparan.`,
    "23": `Guru mencatat temuan asesmen untuk merancang pengayaan bagi kelompok cepat dan bimbingan penguatan bagi yang memerlukan.`,
    "24": `Praktik pembelajaran mencerminkan visi sekolah yang ramah anak, berorientasi masa depan, dan berpusat pada murid.`,
    "25": `Guru menunjukkan komitmen tinggi terhadap perbaikan berkelanjutan melalui refleksi mendalam pasca-observasi.`
  };
  const isBelumOptimalObs = supervision.statusOptimal === "belum_optimal" || supervision.observasiKelas?.score !== void 0 && supervision.observasiKelas.score < 85;
  let totalSkorUji = 0;
  OBSERVASI_ITEMS.forEach((it, idx) => {
    const itemScore = isBelumOptimalObs ? idx % 3 === 0 ? 1 : 2 : 2;
    totalSkorUji += itemScore;
    observasiItems[it.id] = {
      score: itemScore,
      note: itemScore === 2 ? defaultNotesFor25[it.id] || `Pelaksanaan pembelajaran pada aspek ${it.category} teramati terlaksana optimal di kelas ${teacherName}.` : `Aspek ${it.category} mulai berkembang, masih memerlukan pendampingan penguatan fasilitasi.`
    };
  });
  const persentaseCapaianUji = Math.round(totalSkorUji / 50 * 1e3) / 10;
  const predikatUji = persentaseCapaianUji >= 91 ? "Sangat Baik" : persentaseCapaianUji >= 81 ? "Baik" : persentaseCapaianUji >= 71 ? "Cukup" : "Perlu Perbaikan";
  const observasiPelaksanaan = {
    tanggal: today,
    hariTanggal: (/* @__PURE__ */ new Date()).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    kelas: supervision.classGrade || "Fase F / Kelas XI",
    items: observasiItems,
    totalSkor: totalSkorUji,
    maxPossibleScore: 50,
    persentaseCapaian: persentaseCapaianUji,
    predicate: predikatUji,
    kategoriMakna: persentaseCapaianUji >= 85 ? "Pembelajaran Sangat Berkembang (SB) & Berpusat Penuh Pada Pengalaman Murid" : "Pembelajaran Mulai Berkembang (B) - Memerlukan Penguatan Diferensiasi & Refleksi Mandiri",
    feedback: {
      kelebihan: `Transformasi praktik mengajar Ibu/Bapak ${teacherName} sangat nyata dan inspiratif! Guru berhasil beralih dari instruktur dominan menjadi fasilitator yang hangat dan memberdayakan. Murid terlibat aktif 100% dalam investigasi kelompok, diferensiasi proses terwujud nyata, dan iklim saling memuliakan di kelas sangat kental terasa.`,
      perbaikan: `Pengelolaan alokasi waktu saat sesi tanya jawab antarkelompok dapat diefisiensikan lebih lanjut dengan penetapan batasan waktu juru bicara, sehingga porsi penarikan simpulan mandiri oleh murid semakin mendalam.`,
      rekomendasi: `Pertahankan praktik pedagogis yang berpusat pada murid ini sebagai standar baku mengajar sehari-hari. Sangat direkomendasikan untuk mendiseminasikan video praktik baik dan modul ajar perbaikan ini dalam forum Komunitas Belajar (Kombel) ${schoolName} dan MGMP ${subject}.`
    },
    completedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const pascaObservasi = {
    pertanyaanList: {
      q1: `Sangat lega, puas, dan bersyukur. Saya melihat antusiasme murid yang luar biasa berbeda dibanding sebelum perbaikan. Murid aktif berdiskusi dan tidak ada yang pasif mengantuk.`,
      q2: `Alhamdulillah lebih dari 95% terlaksana sesuai modul ajar perbaikan. Tahap memahami, mengaplikasi, dan merefleksi berjalan berurutan, hanya sedikit penyesuaian waktu presentasi kelompok.`,
      q3: `Momen paling memuaskan adalah saat kelompok murid yang biasanya pendiam berhasil mempresentasikan hasil analisisnya dengan percaya diri dan mendapat tepuk tangan dari teman-temannya.`,
      q4: `Tujuan pembelajaran tercapai sangat baik. Terbukti dari hasil asesmen formatif lembar kerja kelompok di mana seluruh kelompok mampu mencapai indikator ketercapaian tujuan pembelajaran.`,
      q5: `Kesulitan awal murid adalah merumuskan kesimpulan analisis. Saya menanggapi dengan memberikan pertanyaan pemantik dan scaffolding bertahap tanpa mendikte jawabannya.`,
      q6: `Murid menggunakan lembar refleksi 3-2-1 untuk menilai pemahamannya. Umpan balik yang saya berikan bersifat apresiatif dan membimbing perbaikan konsep secara spesifik.`,
      q7: `Tantangan utama adalah menjaga ketepatan waktu agar seluruh sintaks model pembelajaran terselesaikan dengan proporsional.`,
      q8: `Saya akan memanfaatkan timer visual di layar proyektor dan menugaskan time-keeper di masing-masing kelompok pada pertemuan berikutnya.`,
      q9: `Hal yang telah mantap adalah keterlibatan aktif murid, diferensiasi LKPD, dan media kontekstual (skor 2 di seluruh butir). Hal yang terus dirawat adalah konsistensi budaya refleksi rutin.`,
      q10: `Saya akan mengimbaskan metode inkuiri berdiferensiasi ini ke materi pelajaran berikutnya dan berbagi pengalaman praktik baik ini kepada rekan sejawat di Kombel sekolah.`
    },
    kesanUmum: `Guru menunjukkan perkembangan kompetensi pedagogis yang luar biasa pasca pendampingan SAMBUNG. Suasana belajar sangat hidup, interaktif, dan berorientasi pada keberhasilan setiap murid.`,
    saranMasukan: `Lanjutkan konsistensi pembelajaran mendalam dan jadikan lembar refleksi murid sebagai rujukan berkelanjutan dalam merancang modul ajar berikutnya.`,
    completedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const u2Items = [
    {
      id: 1,
      pernyataan: "Guru membantu saya memahami hubungan materi pelajaran dengan kehidupan nyata dan lingkungan sehari-hari.",
      skorRataRata: 3.9,
      persentaseSetuju: 97.5
    },
    {
      id: 2,
      pernyataan: "Saya merasa dilibatkan secara aktif dalam diskusi, percobaan/eksplorasi, dan menemukan pemahaman bersama kelompok.",
      skorRataRata: 3.9,
      persentaseSetuju: 97.5
    },
    {
      id: 3,
      pernyataan: "Saya merasa didengarkan, dihargai, dan diperlakukan adil oleh guru serta teman-teman saat menyampaikan gagasan.",
      skorRataRata: 4,
      persentaseSetuju: 100
    },
    {
      id: 4,
      pernyataan: "Saya diberi ruang dan kesempatan untuk memilih cara belajar serta menyelesaikan tantangan sesuai minat saya.",
      skorRataRata: 3.8,
      persentaseSetuju: 95
    },
    {
      id: 5,
      pernyataan: "Saya diajak melakukan refleksi di akhir pelajaran untuk mengetahui apa yang sudah saya kuasai dan apa yang perlu saya perbaiki.",
      skorRataRata: 3.9,
      persentaseSetuju: 97.5
    }
  ];
  let quoteBermakna = `\u201CSaya senang sekali belajar ${subject} hari ini karena diajak melakukan analisis langsung dan berdiskusi seru dengan teman-teman, tidak membosankan seperti biasanya yang hanya mendengarkan penjelasan panjang.\u201D`;
  let quoteKesulitan = `\u201CAwalnya sempat bingung saat membedah soal studi kasus, tapi Ibu/Bapak Guru mendampingi kelompok kami dengan sabar memberi petunjuk tanpa langsung memberi kunci jawaban, sehingga kami bisa memecahkannya sendiri.\u201D`;
  if (cleanName.includes("dewi") || subject.toLowerCase().includes("fisika")) {
    quoteBermakna = `\u201CPaling seru saat uji coba suara dengan aplikasi generator frekuensi di HP! Saya jadi paham langsung kenapa suara di ruangan berkarpet tidak menggema seperti di ruangan kosong.\u201D`;
    quoteKesulitan = `\u201CSempat bingung waktu menghitung panjang gelombang resonansi, tapi setelah dibimbing Ibu Dewi dengan tabel perbandingan visual, kelompok kami jadi mengerti rumusnya.\u201D`;
  } else if (cleanName.includes("budi") || subject.toLowerCase().includes("biologi")) {
    quoteBermakna = `\u201CBelajar di taman sekolah sangat menyenangkan! Kami bisa melihat langsung contoh jaring-jaring makanan dan serangga penyerbuk di pohon bunga.\u201D`;
    quoteKesulitan = `\u201CSedikit kesulitan mengelompokkan jenis rantai makanan detritus, tapi lembar kerja bergambar sangat membantu kami menemukan jawabannya.\u201D`;
  } else if (cleanName.includes("siti") || subject.toLowerCase().includes("matematika")) {
    quoteBermakna = `\u201CMatematika jadi tidak menakutkan karena soal ceritanya tentang menghitung modal belanja kantin OSIS yang biasa kami jumpai sehari-hari!\u201D`;
    quoteKesulitan = `\u201CMenyusun tiga persamaan aljabar dari cerita agak rumit, tapi dengan kartu kata kunci yang disiapkan Bu Siti, kelompok kami berhasil menyelesaikannya.\u201D`;
  }
  const u1IndikatorList = [
    { id: 1, indikator: "Murid aktif mengonstruksi pemahaman melalui eksplorasi dan tanya jawab mendalam.", dimensi: "Memahami (Kognitif)", score: 4, catatan: "Murid secara mandiri menghubungkan konsep dengan data percobaan kelompok." },
    { id: 2, indikator: "Murid menerapkan pengetahuan materi untuk memecahkan persoalan kontekstual nyata.", dimensi: "Mengaplikasikan (Kontekstual)", score: 4, catatan: "Penerapan studi kasus lingkungan berjalan sangat aplikatif dan logis." },
    { id: 3, indikator: "Murid melakukan refleksi diri terhadap proses dan hasil belajar yang telah dicapai.", dimensi: "Merefleksi (Metakognisi)", score: 4, catatan: "Lembar refleksi terisi jujur, mendalam, dan memuat target perbaikan." },
    { id: 4, indikator: "Tercipta interaksi saling memuliakan antara guru-murid dan antarmurid di kelas.", dimensi: "Budaya Memuliakan", score: 4, catatan: "Komunikasi verbal dan nonverbal sangat positif, santun, dan suportif." },
    { id: 5, indikator: "Guru memfasilitasi kebutuhan belajar murid secara berdiferensiasi (proses/konten).", dimensi: "Diferensiasi Pembelajaran", score: 4, catatan: "Guru memberikan bimbingan proporsional pada kelompok yang memerlukan." },
    { id: 6, indikator: "Murid berkolaborasi secara produktif dalam kerja tim heterogen.", dimensi: "Gotong Royong & Kerja Sama", score: 4, catatan: "Seluruh anggota kelompok memiliki peran dan kontribusi konkret." },
    { id: 7, indikator: "Penggunaan media pembelajaran dan teknologi digital relevan meningkatkan motivasi.", dimensi: "Pemanfaatan Digital", score: 4, catatan: "Media interaktif digunakan secara aktif oleh murid, bukan sekadar pajangan." },
    { id: 8, indikator: "Asesmen formatif terintegrasi memberikan umpan balik tepat waktu sepanjang proses.", dimensi: "Asesmen Otentik", score: 4, catatan: "Guru memberikan feedback langsung saat memonitor diskusi kelompok." },
    { id: 9, indikator: "Murid menunjukkan inisiatif, keberanian berpendapat, dan nalar kritis mandiri.", dimensi: "Student Agency & Inisiatif", score: 4, catatan: "Murid berani menyanggah secara santun dan mengajukan pertanyaan kritis." },
    { id: 10, indikator: "Suasana kelas aman, tertib, inklusif, dan menyenangkan sepanjang pembelajaran.", dimensi: "Iklim Belajar Positif", score: 4, catatan: "Kelas dinamis, tertib, dan bebas dari rasa cemas atau takut salah." }
  ];
  const kesimpulanUji = {
    peranGuru: `Guru bertransformasi penuh dari penceramah materi satu arah menjadi fasilitator dan perancang pengalaman belajar mendalam. Mampu memantik nalar kritis murid melalui pertanyaan pemantik kontekstual dan memfasilitasi diferensiasi secara empatik.`,
    aktivitasMurid: `Murid bertransformasi dari penyimak pasif menjadi pembelajar aktif yang mengonstruksi pengetahuan secara mandiri dan kolaboratif, percaya diri dalam diskusi kelompok, serta terampil memecahkan masalah nyata.`,
    konteksNyata: `Pembelajaran terhubung erat dan terpadu secara autentik dengan fenomena kehidupan sehari-hari dan lingkungan sekitar murid, menjadikan pembelajaran bermakna dan aplikatif.`,
    refleksiMurid: `Refleksi menjadi budaya belajar rutin yang mengakar; murid terbiasa mengevaluasi proses pemahaman diri (metakognisi), mengenali capaian belajarnya, dan merencanakan langkah perbaikan berikutnya.`
  };
  const matriksAfter = {
    ...kesimpulanUji
  };
  return {
    praObservasi,
    observasiPelaksanaan,
    pascaObservasi,
    kesimpulanUji,
    u1_observasi: {
      tanggal: today,
      hariTanggal: observasiPelaksanaan.hariTanggal || today,
      tahapObservasi: "akhir",
      kelas: supervision.classGrade || "Fase F / Kelas XI",
      indikatorList: u1IndikatorList,
      totalSkor: 40,
      persentaseCapaian: 100,
      apaYangDialamiMurid: `Murid merasakan pengalaman belajar yang menyenangkan, menantang, dan bermakna. Mereka mengalami langsung bagaimana mengonstruksi konsep, berdiskusi memecahkan tantangan riil, dan merasakan dihargai potensinya oleh guru dan teman sekelas.`,
      kekuatanDanRekomendasi: `Kekuatan utama terletak pada kepiawaian guru mengelola dinamika kelompok dan pemanfaatan media kontekstual. Rekomendasi: pertahankan konsistensi ini dan dokumentasikan sebagai praktik baik sekolah.`
    },
    u2_angketMurid: {
      kodeMuridKelas: `${supervision.classGrade || "XI"}-SAMBUNG`,
      tanggal: today,
      jumlahResponden: 34,
      items: u2Items,
      halPalingBermakna: quoteBermakna,
      kesulitanMurid: quoteKesulitan
    },
    matriksAfter
  };
}
function generateGerakkanData(supervision) {
  const teacher = supervision.teacherName;
  const subject = supervision.subject || "Mata Pelajaran";
  const school = supervision.schoolName || "SMA Binaan";
  const lesson = supervision.lessonTitle || `Pembelajaran ${subject}`;
  const telaahScore = supervision.perangkatAjar?.telaahSummary?.finalScore ?? 92.5;
  const telaahPred = supervision.perangkatAjar?.telaahSummary?.predicate || "Sangat Baik";
  const obsScore = supervision.observasiKelas?.score ?? 94;
  const obsPred = supervision.observasiKelas?.predicate || "Sangat Baik";
  const supervisorName = supervision.supervisorName || "Pengawas Pembina";
  const before = supervision.sambung?.selidiki?.matriksBefore || DEFAULT_MATRIKS_BEFORE;
  const after = supervision.sambung?.uji?.matriksAfter || DEFAULT_MATRIKS_AFTER;
  const rtlNyatakan = [
    {
      id: 1,
      indikator: "Peran Guru: Berorientasi pada Pengalaman Belajar & Inkuiri Murid",
      hasilNyatakan: `Terbukti bertransformasi dari dominasi ceramah satu arah (${before.peranGuru}) menjadi perancang dan fasilitator pengalaman belajar murid melalui inkuiri aktif (${after.peranGuru}). Skor telaah modul: ${telaahScore} (${telaahPred}), Skor observasi kelas: ${obsScore}% (${obsPred}).`,
      rencanaTindakLanjut: `1. Mempertahankan dan mengoptimalkan peran sebagai fasilitator inkuiri dengan menerapkan teknik bertanya pemantik terbuka (open-ended questions) secara konsisten.
2. Menyusun 3 variasi panduan diferensiasi proses (tiered learning) agar setiap kelompok murid tertantang sesuai tingkat kesiapannya.
3. Mengalokasikan 10-15 menit pendampingan kelompok kecil (scaffolding klinis) bagi murid yang mengalami hambatan pemahaman.`,
      mitraKolaborasi: `Komunitas Belajar (Kombel) Guru ${subject} ${school}, MGMP Kabupaten Bogor, dan Pengawas Pembina ${supervisorName}`,
      waktuPelaksanaan: "2 Minggu ke depan (Awal unit materi baru)",
      buktiKeberhasilan: "Modul Ajar berdiferensiasi terverifikasi, rubrik scaffolding harian, lembar observasi teman sejawat",
      rekomendasiSupervisi: `Pengawas Pembina merekomendasikan ${teacher} menjadi narasumber/fasilitator model dalam Kombel internal sekolah untuk teknik scaffolding inkuiri.`
    },
    {
      id: 2,
      indikator: "Aktivitas Murid: Student Agency, Kolaborasi & Aplikasi Pengetahuan",
      hasilNyatakan: `Murid bertransformasi dari sekadar mendengar dan mencatat (${before.aktivitasMurid}) menjadi pelaku aktif yang mengaplikasikan konsep pengetahuan melalui investigasi kelompok dan unjuk kerja nyata (${after.aktivitasMurid}). Respon suara murid (U-2) menunjukkan 88%+ murid merasa antusias dan berani berpendapat.`,
      rencanaTindakLanjut: `1. Menerapkan model Pembelajaran Berbasis Masalah (PBL) dan Proyek (PjBL) secara berkelanjutan pada materi esensial ${subject}.
2. Memberikan kebebasan murid memilih bentuk produk tugas (suara & pilihan/student agency) baik video, poster infografis, maupun laporan ilmiah kontekstual.
3. Mengaktifkan peran rotasi kepemimpinan dalam kerja kelompok heterogen agar seluruh murid terlibat aktif.`,
      mitraKolaborasi: "Guru Bimbingan Konseling (BK), Wali Kelas, dan Tim Manajemen Kurikulum Sekolah",
      waktuPelaksanaan: "Setiap pertengahan capaian pembelajaran (CP) / Siklus 4-6 minggu",
      buktiKeberhasilan: "Portofolio artefak karya digital/fisik murid, lembar penilaian antarteman (peer-review), rekaman unjuk kerja murid",
      rekomendasiSupervisi: "Kepala Sekolah mendukung penyediaan ruang pameran karya murid (Gelar Karya Kelas) dan sarana media presentasi yang memadai."
    },
    {
      id: 3,
      indikator: "Konteks Kehidupan Nyata: Relevansi Materi dengan Isu Riil & Lingkungan",
      hasilNyatakan: `Pembelajaran berhasil mengaitkan materi secara eksplisit (${after.konteksNyata}) dari yang sebelumnya masih bersifat teoretis-tekstual (${before.konteksNyata}). Peningkatan pemahaman kontekstual murid naik lebih dari 40% pada data dampak.`,
      rencanaTindakLanjut: `1. Menyusun Bank Studi Kasus Kontekstual ${subject} berbasis kearifan lokal Jawa Barat, fenomena lingkungan hidup sekitar Bogor, dan perkembangan teknologi mutakhir.
2. Merancang Lembar Kerja Peserta Didik (LKPD) berbasis pemecahan masalah riil yang mengasah daya nalar kritis murid.
3. Mengundang praktisi/alumni atau mengadakan mini-observasi lapangan lingkungan sekolah bila relevan.`,
      mitraKolaborasi: `MGMP ${subject} Kabupaten Bogor, Tim Pengembang Kurikulum ${school}, dan Praktisi Lapangan/Alumni`,
      waktuPelaksanaan: "1 Bulan ke depan (Penyusunan modul bab selanjutnya)",
      buktiKeberhasilan: "Bank LKPD kontekstual terintegrasi isu lokal, dokumentasi investigasi murid di lingkungan sekolah",
      rekomendasiSupervisi: "Pengawas Sekolah mengarahkan integrasi projek lintas mata pelajaran (interdisipliner) untuk efisiensi beban belajar murid."
    },
    {
      id: 4,
      indikator: "Refleksi Murid: Metakognisi & Evaluasi Belajar Rutin Terstruktur",
      hasilNyatakan: `Refleksi telah melembaga menjadi budaya kelas rutin di setiap akhir pertemuan (${after.refleksiMurid}), berbeda dengan kondisi awal di mana refleksi belum terencana konsisten (${before.refleksiMurid}). Murid mampu mengenali kekuatannya dan memetakan kendala belajarnya.`,
      rencanaTindakLanjut: `1. Melembagakan Jurnal Refleksi Metakognisi Murid harian/mingguan dengan format bervariasi (Teknik 3-2-1, Traffic Light Cards, dan Google Forms).
2. Membaca dan menganalisis catatan refleksi murid untuk menentukan intervensi mengajar pada pertemuan berikutnya (Looping Refleksi-Aksi).
3. Memberikan umpan balik tertulis apresiatif pada catatan refleksi murid secara berkala untuk membangun kedekatan emosional belajar.`,
      mitraKolaborasi: "Tim Pembelajaran Mendalam (Deep Learning) Sekolah, Rekan Sejawat, dan Peserta Didik",
      waktuPelaksanaan: "Rutin setiap akhir jam pembelajaran tatap muka (10-15 menit)",
      buktiKeberhasilan: "Buku Jurnal Refleksi Murid terisi rapi, rekapan angket suara murid, catatan tindak lanjut umpan balik guru",
      rekomendasiSupervisi: "Jadikan data refleksi murid sebagai dasar evaluasi diri guru (Self-Regulated Teacher) dalam Penilaian Kinerja Guru (PKG)."
    }
  ];
  const tindakLanjut = [
    {
      id: 1,
      temuanSupervisi: `Optimalisasi Diferensiasi Proses: Masih terdapat beberapa murid yang membutuhkan waktu lebih lama dalam menyelesaikan penyelidikan inkuiri materi ${lesson}.`,
      tindakLanjut: `Menyusun panduan bertahap (scaffolding guide) dengan kartu bantuan konsep (hint cards) dan memanfaatkan tutor sebaya dalam kelompok belajar heterogen.`,
      penanggungJawab: teacher,
      waktu: "2 Minggu ke depan",
      hasil: "Seluruh kelompok murid mampu menuntaskan target pembelajaran dengan tingkat kepercayaan diri yang tinggi."
    },
    {
      id: 2,
      temuanSupervisi: `Pemanfaatan Media & TIK Interaktif: Integrasi teknologi sudah baik, namun perlu pengayaan simulasi virtual untuk materi abstrak.`,
      tindakLanjut: `Mengembangkan lembar panduan praktikum virtual interaktif dan memanfaatkan portal Rumah Belajar / PhET / Canva Edukasi secara terarah.`,
      penanggungJawab: teacher,
      waktu: "3 Minggu ke depan",
      hasil: "Keterlibatan visual dan pemahaman konsep sains/sosial abstrak murid meningkat signifikan."
    },
    {
      id: 3,
      temuanSupervisi: `Pendokumentasian Asesmen Portofolio Murid: Lembar hasil kerja murid perlu diarsipkan dalam portofolio digital yang mudah diakses orang tua dan murid.`,
      tindakLanjut: `Membuat repositori portofolio digital kelas (Google Sites / Google Drive terstruktur) untuk mendokumentasikan karya dan perkembangan murid sepanjang semester.`,
      penanggungJawab: teacher,
      waktu: "1 Bulan ke depan",
      hasil: "Portofolio digital murid tersusun rapi dan dapat dijadikan bahan pelaporan kemajuan belajar bagi orang tua."
    },
    {
      id: 4,
      temuanSupervisi: `Keberlanjutan Budaya Saling Memuliakan: Terciptanya iklim kelas yang aman, saling menghargai, dan bebas dari perundungan verbal saat presentasi.`,
      tindakLanjut: `Menyepakati kontrak belajar positif (Kesepakatan Kelas) di setiap awal semester dan memberikan apresiasi verbal/tertulis atas kontribusi setiap murid.`,
      penanggungJawab: teacher,
      waktu: "Berkelanjutan sepanjang tahun",
      hasil: "Suasana kelas kondusif, murid berani bertanya tanpa rasa takut salah, dan tercipta budaya saling memuliakan martabat murid."
    }
  ];
  const pengimbasan = [
    {
      id: 1,
      praktikBaik: `Penerapan Strategi Supervisi SAMBUNG Berorientasi Deep Learning pada Pembelajaran ${subject}`,
      sasaran: `Komunitas Belajar (Kombel) Pendidik & Tenaga Kependidikan ${school}`,
      bentuk: "Workshop & Berbagi Praktik Baik (In-House Sharing Session)",
      waktu: "Bulan Depan (Jadwal Rutin Kombel)"
    },
    {
      id: 2,
      praktikBaik: `Desain Modul Ajar Berdiferensiasi dan Rubrik Asesmen Autentik ${subject} SMA`,
      sasaran: `Musyawarah Guru Mata Pelajaran (MGMP) ${subject} Tingkat Kabupaten Bogor`,
      bentuk: "Presentasi Praktik Baik & Bedah Modul Ajar di MGMP",
      waktu: "Pertemuan Rutin MGMP Triwulan Berjalan"
    },
    {
      id: 3,
      praktikBaik: `Dokumentasi Aksi Nyata: Transformasi Pembelajaran Inkuiri dan Budaya Refleksi Murid`,
      sasaran: "Pendidik Seluruh Indonesia melalui Platform Merdeka Mengajar (PMM)",
      bentuk: "Publikasi Video Bukti Karya & Modul Ajar di PMM Kemendikbudristek",
      waktu: "Akhir Semester Berjalan"
    },
    {
      id: 4,
      praktikBaik: `Open Class Kolaboratif: Observasi Mengajar Teman Sejawat (Peer Coaching)`,
      sasaran: `Rekan Guru Serumpun di ${school}`,
      bentuk: "Penyelenggaraan Open Class dan Diskusi Refleksi Pasca-Mengajar Sejawat",
      waktu: "2 Bulan ke depan"
    }
  ];
  const kesimpulanAlurSambung = {
    selidikiBaseline: `Tahap SELIDIKI: Pemetaan awal telaah modul ajar dan wawancara pendahuluan menunjukkan guru ${teacher} memiliki penguasaan materi yang kuat namun proses belajar masih berpusat pada transfer konten ceramah instruksional. Murid pasif mencatat dan belum terbiasa melakukan refleksi metakognisi.`,
    amatiObservasi: `Tahap AMATI: Observasi tatap muka awal di kelas mengidentifikasi area amatan kritis, yakni perlunya pergeseran peran guru menjadi fasilitator inkuiri, peningkatan keterlibatan kolaboratif murid (student agency), dan penguatan konteks riil kehidupan sehari-hari murid.`,
    maknaiCoaching: `Tahap MAKNAI: Supervisor (${supervisorName}) melaksanakan dialog coaching reflektif pasca observasi dengan 10 pertanyaan mendalam. Guru menyadari akar persoalan dan membangun komitmen nyata untuk merestrukturisasi desain pembelajaran menjadi bermakna dan menggembirakan.`,
    berdayakanModul: `Tahap BERDAYAKAN: Guru menyusun dan menyempurnakan Modul Ajar Perbaikan ${lesson} yang berorientasi Pembelajaran Mendalam (Deep Learning). Modul ajar memuat diferensiasi konten/proses/produk, pertanyaan pemantik inkuiri, dan rubrik asesmen formatif autentik.`,
    ujiPembuktian: `Tahap UJI: Implementasi lapangan diuji secara terukur melalui wawancara pra-observasi 8 butir, observasi pelaksanaan 25 butir (Skor Capaian: ${obsScore}% / ${obsPred}), dialog refleksi pasca-observasi, serta angket suara murid (U-2) yang mencatat kepuasan dan antusiasme belajar murid di atas 85%.`,
    nyatakanDampak: `Tahap NYATAKAN: Pembuktian perubahan Before vs After dan data dampak kuantitatif-kualitatif membuktikan lonjakan signifikan: peran guru beralih ke fasilitator inkuiri, aktivitas murid bergeser dari pasif ke pengaplikasian pengetahuan riil, materi terhubung isu nyata, dan budaya refleksi melembaga.`,
    gerakkanKomitmen: `Tahap GERAKKAN: Seluruh hasil supervisi tidak berhenti sebagai dokumen administratif, melainkan diwujudkan dalam 5 Rencana Tindak Lanjut (RTL) Konkret berbasis hasil Nyatakan dan 4 agenda pengimbasan praktik baik di Kombel Sekolah, MGMP Kabupaten, dan PMM.`,
    catatanPengawas: `Apresiasi tinggi kepada ${teacher} atas integritas profesional, keterbukaan dalam coaching, dan komitmen menuntaskan seluruh 7 siklus SAMBUNG. Transformasi pembelajaran yang dicapai sangat signifikan dan layak dijadikan teladan praktik baik bagi guru-guru SMA lainnya. Teruslah menginspirasi dan memuliakan potensi murid! \u2014 ${supervisorName} (Pengawas Pembina).`,
    dukunganKepalaSekolah: `Pihak sekolah berkomitmen penuh menyediakan sarana prasarana penunjang, memfasilitasi waktu berbagi praktik baik di Komunitas Belajar (Kombel) sekolah, serta mendukung keikutsertaan guru dalam forum peningkatan keprofesian berkelanjutan.`
  };
  return {
    tindakLanjut,
    pengimbasan,
    rtlNyatakan,
    kesimpulanAlurSambung
  };
}

// src/data/seedData.ts
var SAMPLE_SUPERVISIONS = [
  {
    id: "sup-demo-01",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    teacherId: "teacher-sondang",
    teacherName: "Sondang Asih Januarti, S.Pd.",
    teacherNip: "19840512 200801 2 007",
    subject: "Fisika",
    classGrade: "Fase F / Kelas XI-Fisika 1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-15T08:30:00.000Z",
    updatedAt: "2025-09-10T11:45:00.000Z",
    sambung: SEED_SAMBUNG_DEWI,
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPATPFisikaSMA/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulAjarListrikDC/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanAjarDigital/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikAsesmenOtentik/view?usp=sharing"
      },
      submittedAt: "2025-08-20T09:00:00.000Z",
      telaahScores: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 1,
        11: 2,
        12: 2,
        13: 2,
        14: 2,
        15: 2,
        16: 2,
        17: 2,
        18: 2,
        19: 2,
        20: 2,
        21: 2,
        22: 2
      },
      telaahComments: {
        1: "Identitas modul sangat lengkap, mencakup alokasi waktu dan fase F yang tepat.",
        4: "Dimensi Bergotong Royong dan Bernalar Kritis tertuang jelas pada alur kegiatan.",
        8: "Model Problem-Based Learning (PBL) sangat relevan dengan materi Rangkaian Listrik Arus Searah (DC).",
        12: "Aktivitas mengonstruksi pemahaman disajikan runtut dari apersepsi kontekstual instalasi kelistrikan rumah dan baterai.",
        15: "Budaya saling memuliakan dan inklusivitas tampak dalam pembagian kelompok diskusi praktikum.",
        21: "Rubrik asesmen memuat KKTP dengan indikator operasional yang objektif."
      },
      telaahSummary: {
        totalScore: 43,
        maxPossibleScore: 44,
        finalScore: 97.7,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Modul ajar mengintegrasikan konsep kontekstual hemat energi dengan simulasi PhET Circuit Construction Kit DC, rubrik unjuk kerja sangat operasional.",
        perbaikan: "Perkuat kemitraan dengan teknisi instalasi kelistrikan atau praktisi panel surya untuk projek riil siswa.",
        rekomendasi: "Dapat dijadikan model praktik baik (Best Practice) bagi MGMP Fisika SMA Kota Bogor."
      },
      reviewedAt: "2025-08-25T14:00:00.000Z",
      reviewedBy: "Kusnandar, M.Si",
      revisi: {
        modulAjarRevisiUrl: "https://drive.google.com/file/d/1DemoModulFisikaListrikRevisi/view?usp=sharing",
        catatanRevisiGuru: "Telah ditambahkan integrasi projek hemat energi rumah tangga dan rubrik peer-review asesmen otentik.",
        revisiSubmittedAt: "2025-08-27T10:00:00.000Z",
        revisiStatus: "disetujui"
      }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis prinsip kelistrikan arus searah (DC), hukum Ohm, dan hukum Kirchhoff pada rangkaian tertutup serta penerapannya dalam kehidupan sehari-hari.",
      q2_metode: "Problem-Based Learning dengan pendekatan Deep Learning (Bermakna, Berkesadaran, Menggembirakan).",
      q3_alat_bahan: "Simulasi virtual PhET Circuit Construction Kit DC, trainer kit breadboard rangkaian tertutup, multimeter digital, dan LKPD Kolaboratif.",
      q4_tahapan: "Pendahuluan (Apersepsi & motivasi), Orientasi Masalah, Investigasi Mandiri & Kelompok, Penyajian Karya, Analisis & Evaluasi.",
      q5_persiapan: "Modul ajar lengkap, tayangan interaktif Canva, rubrik observasi profil pelajar Pancasila, dan LKPD digital.",
      q6_materi_sulit: "Menghitung loop majemuk pada diagram sirkuit Hukum II Kirchhoff; diantisipasi dengan grafik simulasi interaktif dan bimbingan scaffolding.",
      q7_target_kompetensi: "Kemampuan berpikir kritis menganalisis arus dan tegangan sirkuit tertutup serta kolaborasi kerja tim ilmiah.",
      q8_perhatian_khusus: "Fokus pada partisipasi murid yang cenderung pasif saat perakitan sirkuit kelompok dan pembagian peran berkeadilan.",
      supervisorNotes: "Kesiapan guru sangat matang, instrumen dan modul dirancang sistematis. Siap untuk observasi tatap muka di kelas.",
      completedAt: "2025-08-28T09:30:00.000Z"
    },
    observasiKelas: {
      items: {
        pendahuluan_1: { status: "Ya", note: "Doa, presensi teratur, apersepsi mengaitkan aki kendaraan dan baterai smartphone" },
        pendahuluan_2: { status: "Ya", note: "Motivasi sangat memantik rasa ingin tahu murid" },
        pendahuluan_3: { status: "Ya", note: "Tujuan & langkah jelas ditayangkan" },
        inti_penguasaan_1: { status: "Ya", note: "Penguasaan konsep kuat arus, tegangan, hambatan, dan hukum Kirchhoff sangat mendalam" },
        inti_penguasaan_2: { status: "Ya", note: "Keterkaitan dengan krisis energi dan bahaya korsleting listrik sangat aktual" },
        inti_penguasaan_3: { status: "Ya", note: "Waktu terjaga dengan presisi sesuai RPP" },
        inti_penguasaan_4: { status: "Ya", note: "Kelas tertib, interaksi guru-murid hangat dan penuh penghargaan" },
        pelibatan_1: { status: "Ya", note: "Seluruh kelompok aktif mencoba simulator PhET Circuit Kit dan merakit sirkuit tertutup" },
        pelibatan_2: { status: "Ya", note: "Guru berkeliling memberikan bimbingan bagi murid yang kesulitan" },
        pelibatan_3: { status: "Ya", note: "Kerja sama antaranggota kelompok tampak seimbang" },
        integrasi_1: { status: "Ya", note: "4C tampak nyata dalam sesi pemaparan hasil diskusi rangkaian" },
        integrasi_2: { status: "Ya", note: "Soal pemantik memicu nalar tingkat tinggi (HOTS)" },
        integrasi_3: { status: "Ya", note: "5M terintegrasi mulus dalam penyelidikan kuat arus pada percabangan" },
        integrasi_4: { status: "Ya", note: "Mencapai ranah metakognitif saat murid merefleksikan efisiensi daya listrik" },
        media_1: { status: "Ya", note: "Layar proyektor & Chromebook murid termanfaatkan optimal" },
        media_2: { status: "Ya", note: "Sumber belajar digital dan modul lokal berjalan harmonis" },
        media_3: { status: "Ya", note: "Murid mengoperasikan simulator mandiri" },
        penilaian_1: { status: "Ya", note: "Asesmen formatif berjalan melalui kuis singkat Quizziz" },
        penilaian_2: { status: "Ya", note: "Feedback seketika diberikan dengan kalimat mengapresiasi" },
        penilaian_3: { status: "Ya", note: "Lembar ceklis unjuk kerja terisi rapi oleh guru" },
        bahasa_1: { status: "Ya", note: "Bahasa santun, komunikatif, artikulatif" },
        bahasa_2: { status: "Ya", note: "Gestur ramah, tatapan menyeluruh ke seluruh sudut ruang" },
        penutup_1: { status: "Ya", note: "Siswa menyimpulkan sendiri esensi hukum Kirchhoff dan hukum Ohm" },
        penutup_2: { status: "Ya", note: "RTL diumumkan dan ditutup doa bersama" }
      },
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Pembelajaran berlangsung dinamis, menyenangkan, dan berpusat pada murid (student-centered). Penggunaan teknologi digital sangat mendukung pemahaman konsep abstrak fisika.",
      completedAt: "2025-09-02T11:15:00.000Z"
    },
    pascaObservasi: {
      q1_kesan: "Merasa lega dan puas karena siswa sangat antusias saat simulasi interaktif sirkuit DC dan merakit rangkaian.",
      q2_sesuai_rencana: "Ya, seluruh tahapan dalam modul ajar terlaksana tepat waktu.",
      q3_hal_memuaskan: "Dua siswa yang biasanya pendiam ikut aktif berbicara saat presentasi kelompok perakitan sirkuit.",
      q4_hal_kurang: "Waktu per kelompok untuk tanya jawab masih agak sempit karena antusiasme tinggi.",
      q5_ketercapaian_tujuan: "Sekitar 92% siswa berhasil mencapai kriteria ketercapaian tujuan asesmen formatif.",
      q6_kesulitan_siswa: "Beberapa siswa masih ragu menentukan tanda polaritas loop pada rangkaian tertutup majemuk.",
      q7_alternatif_solusi: "Diberikan video mikrolearning pengayaan berdurasi 3 menit analisis loop Kirchhoff di Google Classroom.",
      q8_rencana_tindak_lanjut: "Melanjutkan materi ke analisis daya listrik dan efisiensi energi rumah tangga pada pertemuan mendatang.",
      q9_pengembangan_diri: "Ingin mendalami pemanfaatan AI untuk asesmen diagnostik personal murid.",
      generalImpression: "Guru menunjukkan dedikasi dan kompetensi pedagogik serta profesional yang sangat unggul.",
      recommendations: "Disarankan menyusun tulisan karya ilmiah / best practice pembelajaran untuk kenaikan pangkat.",
      completedAt: "2025-09-05T13:30:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: {
        evidence: "94% peserta didik tuntas capaian pembelajaran semester; 2 siswa meraih perunggu OSN Fisika Kota.",
        note: "Pencapaian ketuntasan murid di atas rata-rata sekolah.",
        score: 95
      },
      administrasi: {
        evidence: "Dokumen CP, TP, ATP, Modul Ajar, Kisi-kisi Asesmen, dan Buku Nilai lengkap dan tersusun rapi.",
        note: "Administrasi guru sangat tertib dan tepat waktu diserahkan ke kurikulum.",
        score: 96
      },
      pengembanganDiri: {
        evidence: "Menyelesaikan 4 modul aksi nyata di PMM (Pelatihan Mandiri) dan aktif sebagai pengurus MGMP Fisika.",
        note: "Sangat proaktif dalam pengembangan kompetensi diri secara berkelanjutan.",
        score: 98
      },
      kedisiplinan: {
        evidence: "Tingkat kehadiran tatap muka 99.2%, selalu hadir tepat waktu sebelum bel berbunyi.",
        note: "Keteladanan etika kerja dan dedikasi menjadi panutan di satuan pendidikan.",
        score: 97
      },
      rekomendasi: {
        notes: "Direkomendasikan sebagai Guru Teladan Satuan Pendidikan dan dipromosikan sebagai Tim Pengembang Kurikulum Sekolah.",
        tindakLanjut: "Diberi kesempatan mengikuti bimbingan penulisan jurnal ilmiah terakreditasi tingkat provinsi.",
        score: 95
      },
      finalAverageScore: 96.2,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja tahunan sangat memuaskan, konsisten menunjukkan mutu pengajaran berkualitas tinggi.",
      completedAt: "2025-09-10T10:00:00.000Z"
    }
  },
  {
    id: "sup-demo-02",
    schoolId: "sch-rimba-madya",
    schoolName: "SMAS Rimba Madya",
    teacherId: "teacher-ivany",
    teacherName: "Ivany Ratna Ekandini, S.Pd.",
    teacherNip: "19870614 201203 2 006",
    subject: "Bahasa Indonesia",
    classGrade: "Fase E / Kelas X-1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Menulis Teks Anekdot Mengkritisi Kebijakan Publik Berdasarkan Fakta",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-18T09:00:00.000Z",
    updatedAt: "2025-09-12T14:20:00.000Z",
    sambung: SEED_SAMBUNG_AHMAD,
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPATPBhsIndo/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulTeksAnekdot/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanAjarAnekdot/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikMenulis/view?usp=sharing"
      },
      submittedAt: "2025-08-22T10:15:00.000Z",
      telaahScores: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 1,
        10: 1,
        11: 2,
        12: 2,
        13: 2,
        14: 1,
        15: 2,
        16: 2,
        17: 2,
        18: 2,
        19: 2,
        20: 2,
        21: 2,
        22: 2
      },
      telaahComments: {
        1: "Lengkap dan sesuai format Kurikulum Merdeka.",
        7: "Tujuan pembelajaran menggunakan KKO terukur menganalisis dan memproduksi teks.",
        14: "Refleksi dapat ditambah dengan panduan lembar regulasi emosi murid."
      },
      telaahSummary: {
        totalScore: 41,
        maxPossibleScore: 44,
        finalScore: 93.18,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Pemilihan tema kritik sosial faktual sangat memicu minat literasi kritis peserta didik.",
        perbaikan: "Sertakan contoh rubrik peer-review (penilaian antarteman) untuk draft teks anekdot.",
        rekomendasi: "Diteruskan ke tahap observasi pembelajaran tatap muka."
      },
      reviewedAt: "2025-08-26T11:00:00.000Z",
      reviewedBy: "Kusnandar, M.Si",
      revisi: {
        modulAjarRevisiUrl: "https://drive.google.com/file/d/1DemoModulAnekdotRevisi/view?usp=sharing",
        catatanRevisiGuru: "Telah ditambahkan rubrik peer-review antarteman dan panduan regulasi emosi murid sesuai catatan supervisor.",
        revisiSubmittedAt: "2025-08-28T08:00:00.000Z",
        revisiStatus: "sudah_diunggah"
      }
    },
    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: "Menganalisis struktur dan kebahasaan teks anekdot serta mengonstruksi naskah komik strip pendek.",
      q2_metode: "Project-Based Learning kolaboratif pembuatan infografis komik anekdot.",
      q3_alat_bahan: "Aplikasi Canva for Education, proyektor, cuplikan berita satir dan karikatur koran.",
      q4_tahapan: "Apersepsi humor bernas, bedah struktur teks, kerja kelompok kreatif, galeri karya berputar, umpan balik.",
      q5_persiapan: "RPP lengkap, lembar kerja kelompok, teks pembanding orisinal vs hoaks.",
      q6_materi_sulit: "Membedakan antara humor sekadar lelucon dengan humor kritik bersubstansi pesan etis.",
      q7_target_kompetensi: "Literasi kritis, kepekaan sosial, dan keterampilan komunikasi persuasif.",
      q8_perhatian_khusus: "Keterlibatan murid dalam memberikan kritik santun tanpa ujaran kebencian.",
      supervisorNotes: "Guru memiliki konsep yang jelas dalam membimbing etika berpendapat di ruang publik.",
      completedAt: "2025-08-29T10:00:00.000Z"
    },
    observasiKelas: {
      items: {
        pendahuluan_1: { status: "Ya", note: "Apersepsi ceria dengan tebak silang kata" },
        pendahuluan_2: { status: "Ya", note: "Mengaitkan pentingnya daya kritis pemuda" },
        pendahuluan_3: { status: "Ya", note: "Tujuan tersampaikan runut" },
        inti_penguasaan_1: { status: "Ya", note: "Penguasaan materi retorika sangat baik" },
        inti_penguasaan_2: { status: "Ya", note: "Menghubungkan dengan etika digital UU ITE" },
        inti_penguasaan_3: { status: "Ya", note: "Waktu sesuai jadwal" },
        inti_penguasaan_4: { status: "Ya", note: "Ruang kelas hidup dan hangat" },
        pelibatan_1: { status: "Ya", note: "Seluruh peserta didik aktif berargumen" },
        pelibatan_2: { status: "Ya", note: "Guru fasilitator yang luwes" },
        pelibatan_3: { status: "Ya", note: "Kerja kelompok berjalan guyub" },
        integrasi_1: { status: "Ya", note: "Kreativitas tinggi dalam komik mini" },
        integrasi_2: { status: "Ya", note: "Analisis logika satir berjalan tajam" },
        integrasi_3: { status: "Ya", note: "5M teraplikasi sistematis" },
        integrasi_4: { status: "Ya", note: "Tergambar dimensi afektif dan kognitif" },
        media_1: { status: "Ya", note: "Canva terhubung ke proyektor nirkabel" },
        media_2: { status: "Ya", note: "Pustaka digital sekolah digunakan" },
        media_3: { status: "Ya", note: "Murid menyunting karya secara real-time" },
        penilaian_1: { status: "Ya", note: "Ceklis asesmen proses aktif dipegang guru" },
        penilaian_2: { status: "Ya", note: "Umpan balik langsung saat kelompok bekerja" },
        penilaian_3: { status: "Ya", note: "Asesmen presentasi menggunakan rubrik jelas" },
        bahasa_1: { status: "Ya", note: "Pilihan kata baku dan kaya peribahasa" },
        bahasa_2: { status: "Ya", note: "Ekspresif dan menghibur" },
        penutup_1: { status: "Ya", note: "Refleksi bersama tentang batasan lelucon yang sehat" },
        penutup_2: { status: "Ya", note: "Tugas pajang karya di mading digital sekolah" }
      },
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Praktik pembelajaran yang sangat inspiratif dalam membudayakan literasi kritis dan kebebasan berekspresi santun.",
      completedAt: "2025-09-03T11:00:00.000Z"
    },
    pascaObservasi: {
      q1_kesan: "Sangat senang melihat antusiasme murid menuangkan ide humor berbasis realitas.",
      q2_sesuai_rencana: "Sesuai dengan target skenario modul.",
      q3_hal_memuaskan: "Karya teks anekdot murid bermutu tinggi dan sarat pesan moral.",
      q4_hal_kurang: "Penyimpanan berkas digital di beberapa gawai murid sempat mengalami kendala jaringan.",
      q5_ketercapaian_tujuan: "90% siswa tuntas membuat draf anekdot bermuatan kritik konstruktif.",
      q6_kesulitan_siswa: "Menentukan kata bermajas sindiran yang halus tanpa menyudutkan individu.",
      q7_alternatif_solusi: "Memberikan glosarium majas ironi, sinisme, dan sarkasme beserta contoh etis.",
      q8_rencana_tindak_lanjut: "Publikasi antologi teks anekdot kelas di blog literasi sekolah.",
      q9_pengembangan_diri: "Pelatihan menulis kreatif dan digital storytelling.",
      generalImpression: "Guru sangat berbakat dalam menghidupkan suasana apresiasi sastra dan bahasa.",
      recommendations: "Kembangkan kurasi karya siswa menjadi majalah dinding digital interaktif.",
      completedAt: "2025-09-08T14:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: {
        evidence: "Tingkat kelulusan asesmen sumatif bahasa 91%, juara 1 lomba cipta puisi tingkat kota.",
        note: "Hasil belajar konsisten di atas KKM/KKTP.",
        score: 92
      },
      administrasi: {
        evidence: "Perangkat ajar tersusun rapi dalam Google Drive terkelola.",
        note: "Ketertiban dokumen kurikulum sangat memuaskan.",
        score: 94
      },
      pengembanganDiri: {
        evidence: "Aktif dalam Kombel sekolah dan lulus 3 topik PMM.",
        note: "Semangat belajar dan berbagi sangat positif.",
        score: 93
      },
      kedisiplinan: {
        evidence: "Presensi 98.5%, aktif membimbing ekstrakurikuler jurnalistik.",
        note: "Dedikasi tinggi terhadap pembinaan minat murid.",
        score: 96
      },
      rekomendasi: {
        notes: "Direkomendasikan sebagai Pembina Mading Digital dan Pelatih Lomba Literasi Bahasa Indonesia.",
        tindakLanjut: "Diusulkan mengikuti bimtek penulisan modul ajar berbasis kearifan lokal Jawa Barat.",
        score: 93
      },
      finalAverageScore: 93.6,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja guru berkarakter unggul, menginspirasi budaya literasi sekolah.",
      completedAt: "2025-09-12T11:00:00.000Z"
    }
  },
  {
    id: "sup-demo-04",
    schoolId: "sch-sman2",
    schoolName: "SMAN 2 Bogor",
    teacherId: "teacher-alline",
    teacherName: "Alline Novianti, S.Pd.",
    teacherNip: "19890915 201402 2 003",
    subject: "Kimia",
    classGrade: "Fase F / Kelas XI-MIPA 1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Laju Reaksi dan Teori Tumbukan Berbasis Praktikum Virtual",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-09-02T08:00:00.000Z",
    updatedAt: "2025-09-18T10:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Alline Novianti, S.Pd.", "SMAN 2 Bogor", "Kimia"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoKimiaCPTP/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulKimia/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanAjarKimia/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoAsesmenKimia/view?usp=sharing"
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Identitas modul ajar lengkap dan selaras fase F", 8: "Integrasi laboratorium virtual sangat interaktif" },
      telaahSummary: { totalScore: 44, maxPossibleScore: 44, finalScore: 100, predicate: "Sangat Baik" },
      feedback: { kelebihan: "Integrasi laboratorium virtual sangat sistematis dan aman.", perbaikan: "Tambahkan pengayaan kinetika kimia lanjutan.", rekomendasi: "Model pembelajaran yang sangat baik." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis faktor yang mempengaruhi laju reaksi melalui simulasi virtual.",
      q2_metode: "Inquiry Learning terbimbing eksperimen virtual.",
      q3_alat_bahan: "Simulasi Lab Virtual Kinetika Kimia, tablet siswa.",
      q4_tahapan: "Pendahuluan kontekstual, simulasi variabel konsentrasi dan suhu, analisis grafik, kesimpulan.",
      q5_persiapan: "Modul ajar digital, LKPD virtual.",
      q6_materi_sulit: "Teori tumbukan efektif dan energi aktivasi.",
      q7_target_kompetensi: "Penalaran kritis dan keterampilan analisis sains.",
      q8_perhatian_khusus: "Kemandirian eksplorasi data eksperimen.",
      supervisorNotes: "Rancangan sangat baik dan siap diamati.",
      completedAt: "2025-09-08T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Interaksi pembelajaran sangat interaktif dan mendorong rasa ingin tahu murid."
    },
    pascaObservasi: {
      q1_kesan: "Pembelajaran berlangsung kondusif dan siswa antusias.",
      q2_sesuai_rencana: "Ya, seluruh tahapan praktikum virtual terlaksana tepat waktu.",
      q3_hal_memuaskan: "Pemahaman konsep laju reaksi meningkat tajam melalui visualisasi partikel.",
      q4_hal_kurang: "Dua komputer lab sempat mengalami kendala browser.",
      q5_ketercapaian_tujuan: "92% siswa tuntas asesmen formatif.",
      q6_kesulitan_siswa: "Menentukan orde reaksi berdasarkan data tabel eksperimen.",
      q7_alternatif_solusi: "Pemberian latihan bertingkat dan analogi visual grafik.",
      q8_rencana_tindak_lanjut: "Membahas bab kesetimbangan kimia pada pertemuan berikutnya.",
      q9_pengembangan_diri: "Pelatihan pengembangan media animasi kimia interaktif.",
      generalImpression: "Penguasaan konsep dan pengelolaan kelas sangat prima.",
      recommendations: "Bagikan lembar kerja simulasi kepada MGMP Kimia Kota Bogor.",
      completedAt: "2025-09-18T10:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 94%", note: "Sangat memuaskan", score: 95 },
      administrasi: { evidence: "Lengkap dan tertib", note: "Terorganisir baik", score: 96 },
      pengembanganDiri: { evidence: "Aktif di MGMP dan narasumber pelatihan", note: "Inspiratif", score: 98 },
      kedisiplinan: { evidence: "Presensi 100%", note: "Teladan", score: 98 },
      rekomendasi: { notes: "Direkomendasikan sebagai guru berprestasi tingkat provinsi", tindakLanjut: "Pengembangan modul ajar digital", score: 96 },
      finalAverageScore: 96.6,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja unggul dan sangat profesional."
    }
  },
  {
    id: "sup-demo-05",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    teacherId: "teacher-hilmia",
    teacherName: "Hilmia Fitriyani, S.Pd.",
    teacherNip: "19881120 201101 2 007",
    subject: "Ekonomi",
    classGrade: "Fase E / Kelas X-B",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Literasi Keuangan dan Kebijakan Fiskal Moneter dalam Perekonomian Digital",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-09-05T08:00:00.000Z",
    updatedAt: "2025-09-22T10:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Hilmia Fitriyani, S.Pd.", "SMAN 4 Bogor", "Ekonomi"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoEkonomiCPTP/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulEkonomi/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanAjarEkonomi/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoAsesmenEkonomi/view?usp=sharing"
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Modul terintegrasi kasus riil perbankan", 12: "Aktivitas kontekstual sangat relevan" },
      telaahSummary: { totalScore: 38, maxPossibleScore: 44, finalScore: 86.4, predicate: "Baik" },
      feedback: { kelebihan: "Studi kasus kontekstual perbankan digital dan inflasi riil.", perbaikan: "Tambahkan diferensiasi untuk siswa dengan minat bisnis.", rekomendasi: "Dapat dilanjutkan ke observasi tatap muka." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis peran dan fungsi kebijakan fiskal dan moneter dalam menjaga stabilitas nilai rupiah.",
      q2_metode: "Problem-Based Learning dengan studi kasus perbankan digital.",
      q3_alat_bahan: "Artikel berita tren inflasi, portal Bank Indonesia, LKPD analisis fiskal.",
      q4_tahapan: "Orientasi masalah ekonomi nyata, diskusi kelompok, perumusan argumen solusi, presentasi.",
      q5_persiapan: "Bahan ajar digital dan rubrik diskusi.",
      q6_materi_sulit: "Mekanisme transmisi kebijakan suku bunga acuan ke suku bunga perbankan komersial.",
      q7_target_kompetensi: "Kecakapan literasi finansial dan berpikir kritis.",
      q8_perhatian_khusus: "Keterlibatan seluruh anggota tim dalam menyusun laporan singkat.",
      supervisorNotes: "Perencanaan matang, relevan dengan dinamika ekonomi terkini.",
      completedAt: "2025-09-12T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Diskusi kelompok sangat hidup dengan analisis data ekonomi mutakhir."
    },
    pascaObservasi: {
      q1_kesan: "Siswa aktif memberikan argumen berbasis data neraca pembayaran.",
      q2_sesuai_rencana: "Ya, simulasi kebijakan moneter berjalan efektif.",
      q3_hal_memuaskan: "Kecakapan siswa menganalisis inflasi secara kritis sangat membanggakan.",
      q4_hal_kurang: "Waktu presentasi kelompok sedikit melebihi estimasi awal.",
      q5_ketercapaian_tujuan: "89% siswa memahami instrumen suku bunga acuan BI.",
      q6_kesulitan_siswa: "Membedakan dampak kebijakan ekspansif dan kontraktif.",
      q7_alternatif_solusi: "Membuat diagram alir sebab-akibat kebijakan moneter.",
      q8_rencana_tindak_lanjut: "Membahas kerja sama ekonomi internasional pada pertemuan berikut.",
      q9_pengembangan_diri: "Mengikuti seminar literasi keuangan Otoritas Jasa Keuangan (OJK).",
      generalImpression: "Pendekatan kontekstual sangat berhasil membangkitkan minat belajar siswa.",
      recommendations: "Kolaborasi dengan praktisi perbankan atau OJK.",
      completedAt: "2025-09-22T10:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 92%", note: "Sangat baik", score: 93 },
      administrasi: { evidence: "Lengkap dan tertib", note: "Rapi", score: 94 },
      pengembanganDiri: { evidence: "Aktif di Kombel Sekolah", note: "Produktif", score: 94 },
      kedisiplinan: { evidence: "Presensi 98%", note: "Tertib", score: 95 },
      rekomendasi: { notes: "Koordinator Pojok Literasi Finansial", tindakLanjut: "Workshop literasi pasar modal", score: 94 },
      finalAverageScore: 94,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja terbukti unggul dan inspiratif."
    }
  },
  {
    id: "sup-demo-06",
    schoolId: "sch-sman2",
    schoolName: "SMAN 2 Bogor",
    teacherId: "teacher-mega",
    teacherName: "Mega Nur Alfira, S.Pd.",
    teacherNip: "19910304 201602 2 005",
    subject: "Sejarah",
    classGrade: "Fase E / Kelas X-B",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Analisis Peristiwa Proklamasi Kemerdekaan dan Historiografi Kritis Bangsa",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-09-03T08:00:00.000Z",
    updatedAt: "2025-09-19T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Mega Nur Alfira, S.Pd.", "SMAN 2 Bogor", "Sejarah"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoSejarahCPTP/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulSejarah/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanSejarah/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoAsesmenSejarah/view?usp=sharing"
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Modul ajar memuat sumber primer sejarah otentik", 7: "Tujuan pembelajaran mengembangkan kemampuan bernalar historis" },
      telaahSummary: { totalScore: 44, maxPossibleScore: 44, finalScore: 100, predicate: "Sangat Baik" },
      feedback: { kelebihan: "Pemanfaatan arsip digital nasional sangat memperkaya wawasan murid.", perbaikan: "Tambahkan rubrik penilaian debat sejarah.", rekomendasi: "Model praktik baik bagi MGMP Sejarah." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis kronologi dan signifikansi peristiwa proklamasi kemerdekaan.",
      q2_metode: "Historical Inquiry berbantuan arsip foto dan audio otentik.",
      q3_alat_bahan: "Rekaman suara Bung Karno, dokumen teks proklamasi kliring, lembar analisis sumber.",
      q4_tahapan: "Apersepsi pemutaran audio, analisis multi-perspektif, diskusi kelompok, presentasi.",
      q5_persiapan: "Bahan tayang digital arsip nasional dan rubrik analitis.",
      q6_materi_sulit: "Membedakan fakta historis dengan opini historiografi sekunder.",
      q7_target_kompetensi: "Kecakapan berpikir kritis sejarah (historical thinking skills).",
      q8_perhatian_khusus: "Objektivitas siswa dalam membedah peran tokoh-tokoh pemuda.",
      supervisorNotes: "Rancangan kaya sumber otentik, sangat menarik.",
      completedAt: "2025-09-08T09:30:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Antusiasme murid sangat tinggi saat mendengarkan rekaman pidato asli dan membedah dokumen sumber primer."
    },
    pascaObservasi: {
      q1_kesan: "Siswa sangat aktif berdebat mengenai detik-detik peristiwa Rengasdengklok.",
      q2_sesuai_rencana: "Ya, alur inkuiri sejarah tuntas.",
      q3_hal_memuaskan: "Karya analisis perbandingan surat kabar sezaman sangat berkualitas.",
      q4_hal_kurang: "Dibutuhkan waktu ekstra untuk sesi tanya jawab.",
      q5_ketercapaian_tujuan: "95% siswa tuntas uji kompetensi berpikir historis.",
      q6_kesulitan_siswa: "Membaca ejaan bahasa Indonesia lama (Van Ophuijsen).",
      q7_alternatif_solusi: "Menyediakan panduan transliterasi ejaan lama.",
      q8_rencana_tindak_lanjut: "Kunjungan virtual ke Museum Naskah Proklamasi.",
      q9_pengembangan_diri: "Workshop metodologi penulisan sejarah lisan.",
      generalImpression: "Guru sangat menguasai materi dan mampu menyajikan sejarah secara hidup.",
      recommendations: "Giatkan proyek sejarah lisan keluarga bagi peserta didik.",
      completedAt: "2025-09-16T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 95%", note: "Sangat baik", score: 95 },
      administrasi: { evidence: "Lengkap dan tertib", note: "Teratur", score: 96 },
      pengembanganDiri: { evidence: "Pengurus aktif MGMP Sejarah Kota Bogor", note: "Aktif", score: 97 },
      kedisiplinan: { evidence: "Presensi 99%", note: "Disiplin", score: 97 },
      rekomendasi: { notes: "Direkomendasikan sebagai Fasilitator Pembelajaran Sejarah Kritis", tindakLanjut: "Penulisan modul ajar sejarah lokal Bogor", score: 96 },
      finalAverageScore: 96.2,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja sangat memuaskan dan berdedikasi tinggi."
    }
  },
  {
    id: "sup-demo-07",
    schoolId: "sch-pgri-1",
    schoolName: "SMAS PGRI 1",
    teacherId: "teacher-iqbal",
    teacherName: "Iqbal Aziz Andrianto",
    teacherNip: "19920822 201801 1 002",
    subject: "Sejarah",
    classGrade: "Fase E / Kelas X-IPS",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Konsep Dasar Ilmu Sejarah: Manusia, Ruang, dan Waktu",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-09-08T08:00:00.000Z",
    updatedAt: "2025-09-24T10:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Iqbal Aziz Andrianto", "SMAS PGRI 1", "Sejarah"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoPGRISejarah/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulPGRI/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanPGRI/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoAsesmenPGRI/view?usp=sharing"
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Penyusunan modul jelas dan terstruktur" },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: "Baik" },
      feedback: { kelebihan: "Koneksi dengan garis waktu sejarah lokal sangat baik.", perbaikan: "Perkuat kegiatan refleksi murid.", rekomendasi: "Diteruskan ke observasi kelas." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menjelaskan konsep manusia, ruang, dan waktu dalam dinamika perubahan sejarah.",
      q2_metode: "Discovery Learning dengan timeline interaktif.",
      q3_alat_bahan: "Peta kronologis, slide infografis sejarah, lembar kerja siswa.",
      q4_tahapan: "Stimulasi, identifikasi masalah, pengumpulan data, pengolahan, pembuktian.",
      q5_persiapan: "Media infografis garis waktu.",
      q6_materi_sulit: "Membedakan konsep sinkronik dan diakronik.",
      q7_target_kompetensi: "Kemampuan berpikir kronologis terstruktur.",
      q8_perhatian_khusus: "Keterlibatan siswa dalam menyusun garis waktu pribadi.",
      supervisorNotes: "Perencanaan sistematis dan terarah.",
      completedAt: "2025-09-14T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: "Baik (B)",
      feedbackNotes: "Pengelolaan kelas baik, murid antusias membuat garis waktu digital."
    },
    pascaObservasi: {
      q1_kesan: "Siswa aktif berpartisipasi dan memahami konsep diakronik.",
      q2_sesuai_rencana: "Ya, seluruh tahapan terlaksana sesuai RPP.",
      q3_hal_memuaskan: "Karya infografis timeline murid rapi dan informatif.",
      q4_hal_kurang: "Waktu simpulan akhir perlu dialokasikan lebih longgar.",
      q5_ketercapaian_tujuan: "90% siswa mencapai kriteria ketercapaian tujuan.",
      q6_kesulitan_siswa: "Mengkaitkan ruang geografis dengan peristiwa sejarah.",
      q7_alternatif_solusi: "Mempadukan Google Earth dengan narasi sejarah lokal.",
      q8_rencana_tindak_lanjut: "Membahas bab cara berpikir sinkronik pada pertemuan berikut.",
      q9_pengembangan_diri: "Pelatihan pembuatan media visual sejarah berbasis Canva for Education.",
      generalImpression: "Pendekatan mengajar komunikatif dan bersahabat.",
      recommendations: "Tingkatkan pemanfaatan teknologi geospasial dalam pembelajaran sejarah.",
      completedAt: "2025-09-20T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 91%", note: "Baik", score: 92 },
      administrasi: { evidence: "Lengkap dan tertib", note: "Rapi", score: 93 },
      pengembanganDiri: { evidence: "Aktif di Kombel Sekolah", note: "Positif", score: 93 },
      kedisiplinan: { evidence: "Presensi 98%", note: "Disiplin", score: 95 },
      rekomendasi: { notes: "Pembina Klub Literasi Sejarah Sekolah", tindakLanjut: "Pelatihan media pembelajaran digital", score: 93 },
      finalAverageScore: 93.2,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja guru muda yang energik dan berpotensi besar."
    }
  },
  {
    id: "sup-demo-ummul-sani",
    schoolId: "sch-ummul-quro",
    schoolName: "SMAS IT Ummul Quro",
    teacherId: "teacher-sani",
    teacherName: "Sani Ramadhanti Noor, S.E.",
    teacherNip: "19910418 201802 2 004",
    subject: "Ekonomi",
    classGrade: "Fase E / Kelas X-1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Kelangkaan Sumber Daya, Biaya Peluang dan Literasi Keuangan Syariah",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-20T08:00:00.000Z",
    updatedAt: "2025-09-15T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Sani Ramadhanti Noor, S.E.", "SMAS IT Ummul Quro", "Ekonomi"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPEkonomiUmmulQuro/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulEkonomiKelangkaan/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaLiterasiFinansial/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikStudiKasusEkonomi/view?usp=sharing"
      },
      submittedAt: "2025-08-24T09:30:00.000Z",
      telaahScores: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 2,
        13: 2,
        14: 2,
        15: 2,
        16: 2,
        17: 2,
        18: 2,
        19: 2,
        20: 2,
        21: 2,
        22: 2
      },
      telaahComments: {
        1: "Identitas modul ajar ekonomi fase E sangat lengkap, terintegrasi nilai keislaman dan etika.",
        6: "Profil Pelajar Pancasila Bernalar Kritis dan Mandiri tergambar jelas dalam lembar studi kasus.",
        12: "Pendekatan kontekstual pengelolaan uang saku dan literasi investasi syariah sangat relevan.",
        21: "Asesmen otentik berupa penyusunan skala prioritas kebutuhan siswa dengan rubrik jelas."
      },
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Modul ajar mengaitkan teori kelangkaan dengan fenomena riil gaya hidup konsumtif remaja serta solusinya dalam perspektif ekonomi berkelanjutan.",
        perbaikan: "Dapat ditambahkan simulasi aplikasi pencatat keuangan digital (fintech sehat).",
        rekomendasi: "Sangat layak dijadikan rujukan modul ekonomi inspiratif di wilayah binaan."
      },
      reviewedAt: "2025-08-28T13:00:00.000Z",
      reviewedBy: "Kusnandar, M.Si",
      revisi: {
        modulAjarRevisiUrl: "https://drive.google.com/file/d/1DemoModulEkonomiRevisi/view?usp=sharing",
        catatanRevisiGuru: "Telah ditambahkan lembar simulasi aplikasi pencatatan keuangan pribadi.",
        revisiSubmittedAt: "2025-08-30T10:00:00.000Z",
        revisiStatus: "disetujui"
      }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis konsep kelangkaan dan menentukan skala prioritas kebutuhan dalam kehidupan sehari-hari.",
      q2_metode: "Case-Based Learning dipadukan dengan diskusi kelompok terarah (FGD).",
      q3_alat_bahan: "Lembar Studi Kasus riil, video fenomena panic buying, aplikasi budgeting digital.",
      q4_tahapan: "Pendahuluan (Tanya jawab uang saku), Analisis Kasus Kelangkaan, Perumusan Solusi Skala Prioritas, Presentasi & Refleksi.",
      q5_persiapan: "Menyiapkan modul, skenario studi kasus pasar, dan rubrik kolaborasi.",
      q6_materi_sulit: "Membedakan antara konsep keinginan dan kebutuhan pokok.",
      q7_target_kompetensi: "Murid mampu menyusun anggaran pribadi berbasis skala prioritas.",
      q8_perhatian_khusus: "Memfasilitasi murid yang masih ragu berpendapat dalam diskusi.",
      supervisorNotes: "Rencana pembelajaran dirancang dengan sangat matang dan berpusat pada murid.",
      completedAt: "2025-08-29T10:30:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Interaksi kelas sangat aktif, siswa mendiskusikan anggaran belanja dengan antusias dan bernalar kritis."
    },
    pascaObservasi: {
      q1_kesan: "Suasana kelas sangat dinamis, seluruh murid berpartisipasi aktif dalam kelompok.",
      q2_sesuai_rencana: "Ya, seluruh tahapan terlaksana sesuai alokasi waktu 2 jam pelajaran.",
      q3_hal_memuaskan: "Murid mampu mengidentifikasi ilusi kebutuhan dan membuat skala prioritas yang realistis.",
      q4_hal_kurang: "Waktu presentasi kelompok sedikit tergeser karena antusiasme tanya jawab.",
      q5_ketercapaian_tujuan: "95% siswa mencapai kriteria ketuntasan tujuan pembelajaran (KKTP).",
      q6_kesulitan_siswa: "Menentukan pos tabungan darurat dalam anggaran kecil.",
      q7_alternatif_solusi: "Memberikan formula persentase 50-30-20 yang disederhanakan.",
      q8_rencana_tindak_lanjut: "Projek mini pencatatan arus kas pribadi selama 2 pekan.",
      q9_pengembangan_diri: "Mengikuti pelatihan Certified Financial Literacy Educator untuk guru SMA.",
      generalImpression: "Pembelajaran bermakna yang langsung dapat dipraktikkan murid dalam kehidupan nyata.",
      recommendations: "Kembangkan projek pencatatan keuangan ini menjadi pameran portofolio literasi finansial.",
      completedAt: "2025-09-03T11:30:00.000Z"
    },
    perangkatAjarPerbaikan: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCpTpAtpSondang/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulEkonomiRevisi/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoBahanAjarSondang/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoAsesmenSondang/view?usp=sharing"
      },
      submittedAt: "2025-08-30T10:00:00.000Z",
      telaahScores: {},
      telaahComments: {},
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Modul ajar perbaikan sangat kaya dengan simulasi studi kasus kontekstual dan integrasi literasi finansial.",
        perbaikan: "Terus pertahankan keterlibatan siswa aktif dalam pemecahan masalah ekonomi riil.",
        rekomendasi: "Sangat layak dijadikan rujukan modul ekonomi inspiratif di Komunitas Belajar SMA."
      },
      catatanRevisiGuru: "Telah ditambahkan lembar simulasi aplikasi pencatatan keuangan pribadi dan diferensiasi tugas.",
      reviewedAt: "2025-08-31T09:00:00.000Z",
      reviewedBy: "Kusnandar, M.Si"
    },
    praObservasiPerbaikan: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Penerapan simulasi perencanaan anggaran pribadi dan analisis dampak kelangkaan secara kontekstual.",
      q2_metode: "Case-Based Learning dipadukan dengan FGD dan presentasi interaktif terbimbing.",
      q3_alat_bahan: "Lembar Studi Kasus riil, kalkulator simulasi anggaran, aplikasi budgeting digital.",
      q4_tahapan: "Apersepsi interaktif, penyelidikan kasus riil, presentasi tim dan umpan balik antarkelompok.",
      q5_persiapan: "Menyiapkan modul perbaikan dan rubrik penilaian asesmen formatif.",
      q6_materi_sulit: "Analisis peluang biaya opportunitas dalam keputusan riil.",
      q7_target_kompetensi: "Murid mampu menyusun anggaran pribadi berbasis skala prioritas secara mandiri.",
      q8_perhatian_khusus: "Memfasilitasi murid yang memerlukan bimbingan tambahan dalam penghitungan pos tabungan.",
      supervisorNotes: "Rencana perbaikan sangat matang dan berpusat pada keterlibatan murid (Student Agency).",
      completedAt: "2025-09-01T08:30:00.000Z"
    },
    observasiKelasPerbaikan: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Praktik perbaikan di kelas sangat impresif. Murid sangat antusias, diskusi berjalan aktif dan mandiri, guru berperan optimal sebagai fasilitator.",
      completedAt: "2025-09-02T10:00:00.000Z"
    },
    pascaObservasiPerbaikan: {
      q1_kesan: "Suasana kelas jauh lebih hidup dan murid tidak lagi pasif menunggu instruksi.",
      q2_sesuai_rencana: "Ya, seluruh tahapan terlaksana tepat waktu.",
      q3_hal_memuaskan: "Seluruh murid mampu menyusun rencana keuangan mandiri yang realistis.",
      q4_hal_kurang: "Waktu refleksi akhir perlu diperpanjang 5 menit.",
      q5_ketercapaian_tujuan: "100% murid mencapai KKTP dan menghasilkan karya anggaran pribadi.",
      q6_kesulitan_siswa: "Siswa dengan cepat memahami konsep melalui studi kasus riil.",
      q7_alternatif_solusi: "Formula 50-30-20 sangat efektif membantu murid.",
      q8_rencana_tindak_lanjut: "Diseminasi modul ajar hasil perbaikan ke MGMP Ekonomi SMA Kota Bogor.",
      q9_pengembangan_diri: "Menjadi narasumber praktik baik kurikulum merdeka.",
      generalImpression: "Pembelajaran bermakna yang mengubah paradigma pengajaran menjadi berpusat pada murid.",
      recommendations: "Sangat direkomendasikan untuk didiseminasikan dalam forum Komunitas Belajar (Kombel) dan MGMP.",
      completedAt: "2025-09-03T11:30:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 95%, portofolio perencanaan anggaran siswa lengkap", note: "Sangat Baik", score: 95 },
      administrasi: { evidence: "Perangkat ajar lengkap dan tertata rapi di Google Drive", note: "Lengkap", score: 96 },
      pengembanganDiri: { evidence: "Sertifikat Bimtek Kurikulum Merdeka & Webinar Ekonomi Kreatif", note: "Aktif", score: 94 },
      kedisiplinan: { evidence: "Kehadiran 100%, konsisten membimbing siswa", note: "Teladan", score: 98 },
      rekomendasi: { notes: "Pertahankan inovasi pembelajaran berbasis masalah kontekstual", tindakLanjut: "Diseminasikan ke MGMP Ekonomi SMA Kota Bogor", score: 96 },
      finalAverageScore: 95.8,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Guru berdedikasi tinggi dengan penguasaan pedagogi dan materi ekonomi yang sangat kuat."
    }
  },
  {
    id: "sup-demo-ummul-kirana",
    schoolId: "sch-ummul-quro",
    schoolName: "SMAS IT Ummul Quro",
    teacherId: "teacher-kirana",
    teacherName: "Kirana Mahardhika, S.Pd, Gr.",
    teacherNip: "19930825 201903 2 009",
    subject: "Fisika",
    classGrade: "Fase F / Kelas XI-IPA",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Hukum Gravitasi Newton dan Dinamika Gerak Planet Melalui Eksperimen Interaktif",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-22T08:30:00.000Z",
    updatedAt: "2025-09-18T10:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Kirana Mahardhika, S.Pd, Gr.", "SMAS IT Ummul Quro", "Fisika"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPFisikaUmmulQuro/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulFisikaGravitasi/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaPraktikumFisika/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikPraktikumFisika/view?usp=sharing"
      },
      submittedAt: "2025-08-25T10:00:00.000Z",
      telaahScores: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 2,
        13: 2,
        14: 2,
        15: 2,
        16: 2,
        17: 2,
        18: 2,
        19: 2,
        20: 2,
        21: 2,
        22: 2
      },
      telaahComments: {
        1: "Identitas modul terstruktur sangat baik, mencakup keselamatan kerja laboratorium (K3).",
        8: "Model Inquiry-Based Learning dirancang runtut memandu penemuan konsep entalpi.",
        13: "Prinsip Kimia Hijau (Green Chemistry) terintegrasi pada pemilihan bahan praktikum aman.",
        21: "Rubrik penilaian kinerja praktikum memuat indikator keterampilan proses sains yang jelas."
      },
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Pemanfaatan kalorimeter bahan daur ulang (cangkir styrofoam tertutup) mengedukasi siswa bahwa praktikum kimia akurat dapat dilakukan secara hemat dan ramah lingkungan.",
        perbaikan: "Sediakan grafik digital suhu vs waktu menggunakan sensor termokopel atau smartphone.",
        rekomendasi: "Direkomendasikan sebagai praktik baik inovasi praktikum Kimia Kurikulum Merdeka."
      },
      reviewedAt: "2025-08-29T14:30:00.000Z",
      reviewedBy: "Kusnandar, M.Si",
      revisi: {
        modulAjarRevisiUrl: "https://drive.google.com/file/d/1DemoModulKimiaRevisi/view?usp=sharing",
        catatanRevisiGuru: "Telah dilengkapi panduan pencatatan data suhu digital menggunakan aplikasi mobile logger.",
        revisiSubmittedAt: "2025-09-01T08:00:00.000Z",
        revisiStatus: "disetujui"
      }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menjelaskan konsep perubahan entalpi reaksi pada tekanan tetap dan menentukan delta H reaksi melalui percobaan kalorimetri.",
      q2_metode: "Inquiry-Based Learning berbasis Eksperimen Hands-on di Laboratorium Kimia.",
      q3_alat_bahan: "Kalorimeter sederhana, Termometer presisi 0.1\xB0C, Larutan NaOH 1 M, Larutan HCl 1 M, Stopwatch, LKPD praktikum.",
      q4_tahapan: "Pra-lab (Keselamatan kerja & apersepsi), Pelaksanaan Eksperimen terpandu, Pengolahan Data & Perhitungan q larutan, Diskusi & Penarikan Kesimpulan.",
      q5_persiapan: "Standardisasi larutan uji, penyiapan alat ukur, dan briefing keselamatan laboratorium.",
      q6_materi_sulit: "Konversi tanda positif/negatif entalpi reaksi dan perhitungan kapasitas kalorimeter.",
      q7_target_kompetensi: "Siswa terampil merangkai alat kalorimeter dan menghitung nilai kalor reaksi penetralan.",
      q8_perhatian_khusus: "Memastikan penanganan larutan asam dan basa dilakukan dengan sarung tangan dan kacamata pengaman.",
      supervisorNotes: "Prosedur keselamatan kerja dan tujuan pembelajaran sangat rinci dan terstandar.",
      completedAt: "2025-08-31T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Praktikum berjalan sangat tertib, kolaborasi kelompok solid, dan siswa antusias menganalisis data kenaikan suhu."
    },
    pascaObservasi: {
      q1_kesan: "Sangat puas, data eksperimen seluruh kelompok menunjukkan galat kurang dari 5% dari nilai teoritis.",
      q2_sesuai_rencana: "Ya, seluruh rangkaian eksperimen dan pembersihan lab selesai tepat waktu.",
      q3_hal_memuaskan: "Keterampilan psikomotorik siswa dalam membaca miniskus termometer sangat teliti.",
      q4_hal_kurang: "Pengadukan larutan pada kelompok 3 sempat kurang merata sehingga kenaikan suhu agak lambat.",
      q5_ketercapaian_tujuan: "97% siswa tuntas memahami konsep eksoterm dan perhitungan kalor penetralan.",
      q6_kesulitan_siswa: "Menghubungkan kenaikan suhu larutan dengan pelepasan kalor sistem ke lingkungan.",
      q7_alternatif_solusi: "Menggunakan diagram energi animasi untuk memperjelas konsep arah perpindahan kalor.",
      q8_rencana_tindak_lanjut: "Membahas hukum Hess dan energi ikatan pada pertemuan berikutnya.",
      q9_pengembangan_diri: "Pelatihan Instrumentasi Spektrofotometri dan Kimia Komputasi Guru SMA.",
      generalImpression: "Pembelajaran sains yang otentik dan menumbuhkan nalar kritis siswa.",
      recommendations: "Tuliskan modul praktikum ini menjadi artikel ilmiah tindakan kelas.",
      completedAt: "2025-09-05T13:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 97%, nilai praktikum rata-rata 93", note: "Sangat Unggul", score: 96 },
      administrasi: { evidence: "Portofolio laporan praktikum dan modul ajar tersimpan rapi", note: "Sangat Tertib", score: 97 },
      pengembanganDiri: { evidence: "Lulus Sertifikasi Guru Penggerak & Pemakalah Seminar Sains", note: "Berprestasi", score: 98 },
      kedisiplinan: { evidence: "Hadir tepat waktu, teladan dalam tata tertib laboratorium", note: "Teladan", score: 99 },
      rekomendasi: { notes: "Pertahankan kepemimpinan pembelajaran sains yang inovatif", tindakLanjut: "Koordinator Laboratorium IPA SMAS IT Ummul Quro", score: 98 },
      finalAverageScore: 97.6,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Sosok guru pembelajar sejati, profesional, inovatif, dan menjadi inspirasi bagi siswa dan rekan sejawat."
    }
  },
  {
    id: "sup-demo-rimba-atik",
    schoolId: "sch-rimba-madya",
    schoolName: "SMAS Rimba Madya",
    teacherId: "teacher-atik",
    teacherName: "Atik Dwi Larasati, S.Pd.",
    teacherNip: "19891105 201504 2 003",
    subject: "Ekonomi",
    classGrade: "Fase F / Kelas XI-IPS",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Pendapatan Nasional: Menghitung PDB, PNB, Pendapatan Perkapita & Analisis Indeks Gini",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-25T08:00:00.000Z",
    updatedAt: "2025-09-16T12:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Atik Dwi Larasati, S.Pd.", "SMAS Rimba Madya", "Ekonomi"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPEkonomiRimbaMadya/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulPendapatanNasional/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaInfografisBPS/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikAnalisisDataEkonomi/view?usp=sharing"
      },
      submittedAt: "2025-08-28T09:00:00.000Z",
      telaahScores: {
        1: 2,
        2: 2,
        3: 2,
        4: 2,
        5: 2,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 1,
        11: 2,
        12: 2,
        13: 2,
        14: 2,
        15: 2,
        16: 2,
        17: 2,
        18: 2,
        19: 2,
        20: 2,
        21: 2,
        22: 2
      },
      telaahComments: {
        1: "Identitas modul jelas, indikator ketercapaian tujuan pembelajaran terukur.",
        4: "Menggunakan data riil Badan Pusat Statistik (BPS) Kota Bogor dan Nasional terbaru.",
        12: "Siswa dilatih menganalisis kurva Lorenz dan rasio Gini secara kritis.",
        21: "Rubrik asesmen tugas analisis komparasi pendapatan perkapita negara ASEAN sangat baik."
      },
      telaahSummary: {
        totalScore: 43,
        maxPossibleScore: 44,
        finalScore: 97.7,
        predicate: "Sangat Baik"
      },
      feedback: {
        kelebihan: "Pemanfaatan data statistik resmi BPS menjadikan pembelajaran ekonomi sangat kontekstual dan faktual.",
        perbaikan: "Sajikan komparasi dampak pandemi dan pemulihan ekonomi pada pendapatan masyarakat.",
        rekomendasi: "Dapat diteruskan ke tahapan observasi tatap muka."
      },
      reviewedAt: "2025-08-31T11:00:00.000Z",
      reviewedBy: "Kusnandar, M.Si",
      revisi: {
        modulAjarRevisiUrl: "https://drive.google.com/file/d/1DemoModulRimbaEkonomiRevisi/view?usp=sharing",
        catatanRevisiGuru: "Telah ditambahkan grafik tren pemulihan ekonomi nasional pasca-pandemi.",
        revisiSubmittedAt: "2025-09-02T10:00:00.000Z",
        revisiStatus: "disetujui"
      }
    },
    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: "Menganalisis konsep dan metode penghitungan pendapatan nasional serta mendeskripsikan distribusi pendapatan.",
      q2_metode: "Problem-Based Learning dengan pendekatan studi data statistik BPS.",
      q3_alat_bahan: "Infografis BPS, LKPD analisis data PDB, kalkulator, proyektor interaktif.",
      q4_tahapan: "Apersepsi perbedaan pendapatan individu vs nasional, Pembagian kelompok analisis komponen PDB, Presentasi kurva Lorenz, Penguatan konsep.",
      q5_persiapan: "Menyiapkan kumpulan data rilis PDB dan materi presentasi interaktif.",
      q6_materi_sulit: "Menghitung pendapatan disposibel (DI) dan memahami makna angka koefisien Gini.",
      q7_target_kompetensi: "Siswa mampu membedakan metode pendekatan produksi, pendapatan, dan pengeluaran.",
      q8_perhatian_khusus: "Membimbing siswa yang membutuhkan pendampingan perhitungan matematis.",
      supervisorNotes: "Kesiapan mengajar sangat baik, media berbasis data autentik.",
      completedAt: "2025-09-02T14:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Pengelolaan kelas sangat efektif, siswa antusias berdiskusi mengkaji ketimpangan ekonomi."
    },
    pascaObservasi: {
      q1_kesan: "Siswa sangat aktif saat menganalisis perbandingan PDB Indonesia dengan negara tetangga.",
      q2_sesuai_rencana: "Ya, seluruh skenario pembelajaran berjalan lancar.",
      q3_hal_memuaskan: "Pemahaman siswa tentang penyebab ketimpangan distribusi pendapatan sangat mendalam.",
      q4_hal_kurang: "Waktu untuk menghitung 3 metode PDB sekaligus agak padat.",
      q5_ketercapaian_tujuan: "94% siswa tuntas menyelesaikan soal latihan PDB dan NNI.",
      q6_kesulitan_siswa: "Menghafal rumus komponen transfer payment dan pajak langsung.",
      q7_alternatif_solusi: "Membuat jembatan keledai alur dari PDB menuju Pendapatan Disposibel.",
      q8_rencana_tindak_lanjut: "Melanjutkan ke materi pertumbuhan dan pembangunan ekonomi.",
      q9_pengembangan_diri: "Mengikuti seminar literasi ekonomi dan kebijakan fiskal Kemenkeu.",
      generalImpression: "Guru mengajar dengan penguasaan materi yang runtut, lugas, dan komunikatif.",
      recommendations: "Tingkatkan keterlibatan siswa dalam mengusulkan solusi kebijakan pengurangan kemiskinan.",
      completedAt: "2025-09-08T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 94%, nilai asesmen sumatif memuaskan", note: "Baik Sekali", score: 94 },
      administrasi: { evidence: "Kelengkapan administrasi pembelajaran sangat tertib", note: "Lengkap", score: 95 },
      pengembanganDiri: { evidence: "Aktif MGMP Ekonomi dan pelatihan pembelajaran digital", note: "Aktif", score: 95 },
      kedisiplinan: { evidence: "Kehadiran 100%, berintegritas tinggi", note: "Sangat Disiplin", score: 98 },
      rekomendasi: { notes: "Guru berpotensi besar memimpin MGMP tingkat wilayah", tindakLanjut: "Ikutsertakan dalam pelatihan penyusunan soal HOTS provinsi", score: 95 },
      finalAverageScore: 95.4,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja pengajaran sangat baik, teliti dalam asesmen, dan disenangi para peserta didik."
    }
  },
  {
    id: "sup-demo-yphb-sihana",
    schoolId: "sch-yphb",
    schoolName: "SMAS YPHB",
    teacherId: "teacher-sihana",
    teacherName: "Sihana, S.Pd.Gr.",
    teacherNip: "19880415 201502 1 004",
    subject: "Penjasorkes",
    classGrade: "Fase E / Kelas X-A",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Kebugaran Jasmani dan Pola Hidup Sehat Berkelanjutan Melalui Aktivitas Sirkuit Training",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-26T08:00:00.000Z",
    updatedAt: "2025-09-17T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Sihana, S.Pd.Gr.", "SMAS YPHB", "Penjasorkes"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPPenjasYPHB/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulPenjasYPHB/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaPenjasYPHB/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikPenjasYPHB/view?usp=sharing"
      },
      submittedAt: "2025-08-28T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Modul ajar Penjasorkes sangat lengkap, memperhatikan prinsip keselamatan dan inklusivitas fisik murid." },
      telaahSummary: { totalScore: 42, maxPossibleScore: 44, finalScore: 95.5, predicate: "Sangat Baik" },
      feedback: { kelebihan: "Sirkuit training dengan variasi intensitas melatih kemandirian kebugaran murid.", perbaikan: "Tambahkan lembar pencatatan denyut nadi mandiri.", rekomendasi: "Siap untuk observasi kelas tatap muka di lapangan." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Mempraktikkan dan menganalisis konsep latihan sirkuit training untuk peningkatan kebugaran jasmani.",
      q2_metode: "Demonstrasi kolaboratif dipadukan Circuit Training dan Peer-Assessment.",
      q3_alat_bahan: "Cone penanda pos, matras senam, stopwatch digital, lembar monitor denyut nadi.",
      q4_tahapan: "Pemanasan dinamis, Pengenalan 5 pos latihan, Rotasi sirkuit kelompok, Pendinginan dan refleksi denyut nadi.",
      q5_persiapan: "Peralatan lapangan tertata aman, modul ajar terdistribusi.",
      q6_materi_sulit: "Menghitung zona denyut nadi latihan (Training Heart Rate).",
      q7_target_kompetensi: "Kebugaran fisik, sportivitas, dan kesadaran gaya hidup sehat.",
      q8_perhatian_khusus: "Memperhatikan murid yang memiliki riwayat asma atau kelelahan berlebih.",
      supervisorNotes: "Rancangan aktivitas jasmani sangat memperhatikan standar keselamatan dan kesehatan murid.",
      completedAt: "2025-09-02T08:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Pengelolaan murid di lapangan sangat tertib, suasana menyenangkan dan penuh antusiasme."
    },
    pascaObservasi: {
      q1_kesan: "Sangat senang karena seluruh murid antusias menyelesaikan tantangan di setiap pos kebugaran.",
      q2_sesuai_rencana: "Ya, seluruh tahapan sirkuit terlaksana tepat waktu.",
      q3_hal_memuaskan: "Kekompakan antarteman saling menyemangati saat menyelesaikan pos latihan fisik.",
      q4_hal_kurang: "Dibutuhkan cadangan air minum tambahan di dekat pos latihan luar ruangan.",
      q5_ketercapaian_tujuan: "95% murid memahami cara mengukur kebugaran dan denyut nadi mandiri.",
      q6_kesulitan_siswa: "Menjaga ritme pernapasan yang stabil saat pos push-up dan lari zig-zag.",
      q7_alternatif_solusi: "Pemberian aba-aba irama musik tempo sedang sebagai pemandu ritme gerak.",
      q8_rencana_tindak_lanjut: "Penyusunan target program latihan kebugaran mandiri di rumah selama 2 pekan.",
      q9_pengembangan_diri: "Mengikuti pelatihan sertifikasi pelatih kebugaran remaja tingkat regional.",
      generalImpression: "Instruktur pembelajaran jasmani yang energik, mengedepankan nilai sportivitas dan kesehatan mental murid.",
      recommendations: "Kembangkan video tutorial sirkuit training mandiri untuk dibagikan di kanal edukasi sekolah.",
      completedAt: "2025-09-08T10:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "95% murid mencapai kriteria kebugaran jasmani baik, juara lomba senam kota", note: "Sangat Baik", score: 95 },
      administrasi: { evidence: "Modul ajar dan kartu catatan kebugaran murid terarsip rapi", note: "Tertib", score: 95 },
      pengembanganDiri: { evidence: "Aktif di MGMP PJOK Kota Bogor dan lulus modul pelatihan mandiri", note: "Inovatif", score: 96 },
      kedisiplinan: { evidence: "Presensi 100%, selalu hadir lebih awal mempersiapkan lapangan", note: "Teladan", score: 98 },
      rekomendasi: { notes: "Koordinator Pembina Prestasi Olahraga Sekolah", tindakLanjut: "Bimtek manajemen keolahragaan sekolah", score: 96 },
      finalAverageScore: 96,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja sangat profesional, berdedikasi membina fisik dan karakter murid."
    }
  },
  {
    id: "sup-demo-yphb-salma",
    schoolId: "sch-yphb",
    schoolName: "SMAS YPHB",
    teacherId: "teacher-siti-salma",
    teacherName: "Siti Salma, S.Pd",
    teacherNip: "19910712 201703 2 008",
    subject: "Fisika",
    classGrade: "Fase F / Kelas XI-MIPA",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Gelombang Mekanik dan Resonansi Bunyi dalam Teknologi Audio",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-27T08:00:00.000Z",
    updatedAt: "2025-09-18T10:00:00.000Z",
    sambung: SEED_SAMBUNG_SITI,
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPFisikaYPHB/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulFisikaYPHB/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaFisikaYPHB/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikFisikaYPHB/view?usp=sharing"
      },
      submittedAt: "2025-08-30T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Penyusunan modul fisika gelombang sangat kontekstual mengaitkan prinsip audio smartphone." },
      telaahSummary: { totalScore: 43, maxPossibleScore: 44, finalScore: 97.7, predicate: "Sangat Baik" },
      feedback: { kelebihan: "Integrasi simulasi gelombang visual membantu siswa memahami perambatan bunyi.", perbaikan: "Tambahkan pengayaan resonansi tabung pipa organa.", rekomendasi: "Sangat siap dilanjutkan ke observasi tatap muka." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis karakteristik gelombang mekanik dan resonansi bunyi dalam kehidupan sehari-hari.",
      q2_metode: "Inquiry-Based Learning berbasis Eksperimen Virtual dan Demonstrasi Garpu Tala.",
      q3_alat_bahan: "Aplikasi Sound Generator di smartphone, garpu tala, tabung resonansi, LKPD digital.",
      q4_tahapan: "Apersepsi fenomena kaca bergetar akibat petir, Eksperimen frekuensi nada, Analisis data, Simpulan.",
      q5_persiapan: "Menyiapkan modul ajar interaktif dan alat peraga akustik.",
      q6_materi_sulit: "Menghitung hubungan antara frekuensi, panjang gelombang, dan cepat rambat bunyi.",
      q7_target_kompetensi: "Kemampuan bernalar analitis sains dan pemecahan masalah fenomena gelombang.",
      q8_perhatian_khusus: "Membimbing murid yang membutuhkan penguatan perhitungan matematis gelombang.",
      supervisorNotes: "Rancangan pembelajaran fisika yang inovatif dan relevan dengan teknologi audio modern.",
      completedAt: "2025-09-03T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: "Amat Baik (A)",
      feedbackNotes: "Interaksi pembelajaran sangat hidup, murid antusias mencoba frekuensi audio pada smartphone masing-masing."
    },
    pascaObservasi: {
      q1_kesan: "Murid sangat takjub saat melihat resonansi bunyi mampu menggetarkan partikel garam pada membran speaker.",
      q2_sesuai_rencana: "Ya, seluruh tahapan terlaksana sesuai skenario RPP.",
      q3_hal_memuaskan: "Penalaran kritis murid saat membedakan bunyi ultrasonik dan audiosonik.",
      q4_hal_kurang: "Suara bising luar kelas sempat sedikit mengganggu pengukuran frekuensi rendah.",
      q5_ketercapaian_tujuan: "93% murid mencapai KKTP dalam kuis formatif gelombang bunyi.",
      q6_kesulitan_siswa: "Menerapkan formula pipa organa terbuka vs tertutup.",
      q7_alternatif_solusi: "Membuat animasi visual pola gelombang stasioner menggunakan simulasi PhET.",
      q8_rencana_tindak_lanjut: "Melanjutkan materi ke efek Doppler pada pertemuan berikutnya.",
      q9_pengembangan_diri: "Mengikuti pelatihan laboratorium fisika komputasi.",
      generalImpression: "Kompetensi pedagogik dan profesional guru sangat unggul.",
      recommendations: "Tuliskan modul eksperimen audio ini menjadi best practice MGMP Fisika.",
      completedAt: "2025-09-09T13:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 94%, nilai rata-rata asesmen sumatif fisika 91", note: "Sangat Baik", score: 95 },
      administrasi: { evidence: "Perangkat ajar kurikulum merdeka tersimpan lengkap dan tertata rapi", note: "Tertib", score: 96 },
      pengembanganDiri: { evidence: "Aktif di MGMP Fisika Kota Bogor dan menyelesaikan sertifikasi PMM", note: "Produktif", score: 96 },
      kedisiplinan: { evidence: "Presensi 100%, teladan dalam ketertiban", note: "Teladan", score: 98 },
      rekomendasi: { notes: "Direkomendasikan sebagai Fasilitator Pembelajaran Sains Kreatif", tindakLanjut: "Ikutsertakan dalam diseminasi best practice sains tingkat kota", score: 96 },
      finalAverageScore: 96.2,
      finalGrade: "Amat Baik (A)",
      summaryNotes: "Kinerja sangat prima dan berdedikasi tinggi dalam menginspirasi murid belajar sains."
    }
  },
  {
    id: "sup-demo-bhakti-widya",
    schoolId: "sch-bhakti-insani",
    schoolName: "SMAS Bhakti Insani",
    teacherId: "teacher-widya",
    teacherName: "Widya Anjani, S.Pd.",
    teacherNip: "19900518 201604 2 007",
    subject: "Ekonomi",
    classGrade: "Fase E / Kelas X-1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Manajemen dan Koperasi Sekolah dalam Menggerakkan Ekonomi Kerakyatan",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-28T08:00:00.000Z",
    updatedAt: "2025-09-19T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Widya Anjani, S.Pd.", "SMAS Bhakti Insani", "Ekonomi"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPEkonomiBhakti/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulEkonomiBhakti/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaEkonomiBhakti/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikEkonomiBhakti/view?usp=sharing"
      },
      submittedAt: "2025-08-31T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Modul terstruktur baik dan memuat nilai gotong royong ekonomi koperasi." },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: "Baik" },
      feedback: { kelebihan: "Studi kasus riil koperasi sekolah sangat aplikatif bagi murid.", perbaikan: "Perkaya lembar kerja dengan perhitungan Sisa Hasil Usaha (SHU).", rekomendasi: "Dapat dilanjutkan ke observasi tatap muka." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Mendeskripsikan peran koperasi dalam perekonomian Indonesia dan menyimulasikan pembagian SHU.",
      q2_metode: "Problem-Based Learning dengan simulasi Rapat Anggota Tahunan (RAT) mini.",
      q3_alat_bahan: "Laporan keuangan sederhana koperasi sekolah, lembar kerja hitung SHU, proyektor.",
      q4_tahapan: "Orientasi masalah ekonomi, Pembagian peran anggota koperasi, Simulasi perhitungan SHU, Presentasi hasil.",
      q5_persiapan: "Menyiapkan modul ajar dan data simulasi simpanan pokok dan wajib.",
      q6_materi_sulit: "Menghitung persentase jasa modal dan jasa anggota dalam pembagian SHU.",
      q7_target_kompetensi: "Literasi finansial, kerja sama tim, dan kepemimpinan demokratis.",
      q8_perhatian_khusus: "Memfasilitasi murid yang belum lancar kalkulasi proporsi keuangan.",
      supervisorNotes: "Perencanaan pembelajaran terstruktur dan mengedepankan asas kekeluargaan koperasi.",
      completedAt: "2025-09-04T08:30:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: "Baik (B)",
      feedbackNotes: "Suasana kelas tertib, murid berpartisipasi aktif dalam simulasi RAT koperasi sekolah."
    },
    pascaObservasi: {
      q1_kesan: "Cukup puas, murid memahami esensi bahwa koperasi bukan sekadar toko melainkan badan usaha berasas kekeluargaan.",
      q2_sesuai_rencana: "Ya, simulasi pembagian SHU selesai sesuai alokasi waktu 2 JP.",
      q3_hal_memuaskan: "Keseriusan murid saat memverifikasi kebenaran nominal simpanan dan jasa anggota.",
      q4_hal_kurang: "Dua kelompok membutuhkan waktu agak lama dalam kalkulasi persentase jasa modal.",
      q5_ketercapaian_tujuan: "88% murid tuntas menghitung pembagian SHU.",
      q6_kesulitan_siswa: "Membedakan antara simpanan sukarela dengan simpanan wajib.",
      q7_alternatif_solusi: "Membuat tabel komparasi ciri masing-masing simpanan koperasi.",
      q8_rencana_tindak_lanjut: "Kunjungan observasi langsung ke operasional koperasi karyawan/sekolah.",
      q9_pengembangan_diri: "Mengikuti workshop akuntansi koperasi digital.",
      generalImpression: "Guru komunikatif dan mampu mengaitkan teori ekonomi dengan praktik nyata di sekolah.",
      recommendations: "Tingkatkan keterlibatan aktif siswa dalam mengelola pojok literasi koperasi sekolah.",
      completedAt: "2025-09-10T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 90%, nilai formatif memuaskan", note: "Baik", score: 90 },
      administrasi: { evidence: "Perangkat pembelajaran lengkap dan tersusun tertib", note: "Rapi", score: 92 },
      pengembanganDiri: { evidence: "Aktif di Kombel Sekolah dan webinar literasi ekonomi", note: "Positif", score: 92 },
      kedisiplinan: { evidence: "Presensi 98%, disiplin dan bertanggung jawab", note: "Baik", score: 95 },
      rekomendasi: { notes: "Pembina Koperasi Siswa SMAS Bhakti Insani", tindakLanjut: "Pelatihan kewirausahaan koperasi sekolah", score: 92 },
      finalAverageScore: 92.2,
      finalGrade: "Baik (B)",
      summaryNotes: "Kinerja pengajaran baik, berdedikasi dalam mendampingi murid."
    }
  },
  {
    id: "sup-demo-yasih-yazid",
    schoolId: "sch-yasih",
    schoolName: "SMAS Yasih",
    teacherId: "teacher-yazid",
    teacherName: "Yazid Ali Hamdi",
    teacherNip: "19920921 201801 1 005",
    subject: "PKn",
    classGrade: "Fase E / Kelas X-A",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Nilai-Nilai Pancasila dalam Penyelenggaraan Negara dan Kehidupan Bermasyarakat",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-29T08:00:00.000Z",
    updatedAt: "2025-09-20T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Yazid Ali Hamdi", "SMAS Yasih", "PKn"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPPKnYasih/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulPKnYasih/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaPKnYasih/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikPKnYasih/view?usp=sharing"
      },
      submittedAt: "2025-09-02T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Penyusunan modul terarah pada penguatan Profil Pelajar Pancasila dan penegakan hukum berkeadilan." },
      telaahSummary: { totalScore: 38, maxPossibleScore: 44, finalScore: 86.4, predicate: "Baik" },
      feedback: { kelebihan: "Studi kasus aktual hak asasi manusia dan toleransi beragama sangat relevan.", perbaikan: "Tambahkan rubrik penilaian musyawarah mufakat.", rekomendasi: "Diteruskan ke observasi kelas tatap muka." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis penerapan nilai-nilai Pancasila dalam perumusan kebijakan publik dan interaksi sosial.",
      q2_metode: "Case-Based Learning dipadukan Diskusi Panel Pro-Kontra Kebijakan Publik.",
      q3_alat_bahan: "Artikel berita aktual, lembar kerja analisis kasus, slide infografis konstitusi.",
      q4_tahapan: "Apersepsi nilai sila ke-4 dan ke-5, Pembagian klaster studi kasus, Diskusi argumen, Perumusan konsensus.",
      q5_persiapan: "Menyiapkan modul ajar dan rubrik keaktifan berpendapat santun.",
      q6_materi_sulit: "Mengharmonisasikan hak asasi individu dengan kewajiban warga negara dalam hukum nasional.",
      q7_target_kompetensi: "Kecakapan berpikir kritis kewarganegaraan (civic critical thinking) dan toleransi.",
      q8_perhatian_khusus: "Mendorong murid yang pasif agar berani menyuarakan sudut pandang etis.",
      supervisorNotes: "Rancangan sangat berorientasi penguatan karakter kebangsaan dan demokratis.",
      completedAt: "2025-09-05T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 21,
      totalAspek: 24,
      score: 87.5,
      predicate: "Baik (B)",
      feedbackNotes: "Diskusi panel berjalan hangat, murid menghargai perbedaan pandangan dengan etika komunikasi santun."
    },
    pascaObservasi: {
      q1_kesan: "Sangat mengapresiasi kedewasaan berpikir murid saat membahas isu toleransi dan keadilan sosial.",
      q2_sesuai_rencana: "Ya, alur diskusi panel terlaksana tuntas.",
      q3_hal_memuaskan: "Murid mampu mengidentifikasi solusi berbasis musyawarah mufakat.",
      q4_hal_kurang: "Waktu untuk sesi tanggapan penonton panelis terasa singkat.",
      q5_ketercapaian_tujuan: "91% murid mencapai KKTP analisis nilai konstitusi.",
      q6_kesulitan_siswa: "Menghubungkan pasal undang-undang dasar dengan penerapannya pada kasus hukum nyata.",
      q7_alternatif_solusi: "Membuat glosarium pasal-pasal kunci hak dan kewajiban warga negara.",
      q8_rencana_tindak_lanjut: "Projek mini kampanye toleransi dan anti-bullying di media sosial sekolah.",
      q9_pengembangan_diri: "Pelatihan mediasi resolusi konflik dan pendidikan kewarganegaraan transformatif.",
      generalImpression: "Sosok pendidik yang mengayomi, mengedepankan keteladanan etika moral Pancasila.",
      recommendations: "Giatkan proyek kepemimpinan murid dalam forum OSIS dan kegiatan kepanduan.",
      completedAt: "2025-09-12T13:30:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 91%, proyek aksi nyata kebinekaan siswa berjalan sukses", note: "Baik Sekali", score: 92 },
      administrasi: { evidence: "Dokumen RPP dan lembar asesmen otentik tersusun rapi", note: "Tertib", score: 93 },
      pengembanganDiri: { evidence: "Aktif di MGMP PPKn dan seminar wawasan kebangsaan", note: "Positif", score: 93 },
      kedisiplinan: { evidence: "Presensi 98%, teladan dalam ketepatan waktu", note: "Disiplin", score: 96 },
      rekomendasi: { notes: "Pembina MPK dan Pendidikan Karakter Siswa", tindakLanjut: "Bimtek penguatan wawasan kebangsaan provinsi", score: 93 },
      finalAverageScore: 93.4,
      finalGrade: "Baik (B)",
      summaryNotes: "Kinerja terbukti baik, memiliki kepemimpinan moral yang kuat di satuan pendidikan."
    }
  },
  {
    id: "sup-demo-muhammadiyah-lutfiana",
    schoolId: "sch-muhammadiyah",
    schoolName: "SMAS Muhammadiyah",
    teacherId: "teacher-lutfiana",
    teacherName: "Lutfiana Faridh Fadillah",
    teacherNip: "19931205 201902 2 006",
    subject: "Kimia",
    classGrade: "Fase F / Kelas XI-IPA",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Ikatan Kimia dan Bentuk Molekul dengan Pendekatan Model Tiga Dimensi Sederhana",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-30T08:00:00.000Z",
    updatedAt: "2025-09-22T10:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Lutfiana Faridh Fadillah", "SMAS Muhammadiyah", "Kimia"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPKimiaMuhammadiyah/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulKimiaMuhammadiyah/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaKimiaMuhammadiyah/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikKimiaMuhammadiyah/view?usp=sharing"
      },
      submittedAt: "2025-09-03T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 2, 9: 1, 10: 2, 11: 1, 12: 2, 13: 1, 14: 1, 15: 2, 16: 1, 17: 2, 18: 1, 19: 1, 20: 2, 21: 1, 22: 2 },
      telaahComments: { 1: "Modul ajar memuat alur pembelajaran dasar, perlu penguatan pada diferensiasi konten dan rubrik unjuk kerja praktikum." },
      telaahSummary: { totalScore: 31, maxPossibleScore: 44, finalScore: 70.5, predicate: "Cukup" },
      feedback: { kelebihan: "Pemanfaatan plastisin untuk model molekul 3D sudah baik.", perbaikan: "Perjelas rubrik kriteria ketercapaian tujuan pembelajaran (KKTP) dan lembar asesmen formatif berkala.", rekomendasi: "Perlu pendampingan berkala (coaching) oleh pengawas sebelum observasi lanjutan." }
    },
    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: "Menjelaskan teori domain elektron dan meramalkan bentuk molekul kovalen sederhana.",
      q2_metode: "Demonstrasi guru dipadukan kerja kelompok merangkai plastisin dan tusuk gigi.",
      q3_alat_bahan: "Plastisin aneka warna, tusuk gigi, lembar kerja pengamatan bentuk molekul.",
      q4_tahapan: "Pendahuluan instruksi, Pemodelan molekul air dan metana, Diskusi kelompok, Simpulan.",
      q5_persiapan: "Menyiapkan bahan plastisin dan modul cetak.",
      q6_materi_sulit: "Menentukan pasangan elektron bebas (PEB) vs pasangan elektron ikatan (PEI).",
      q7_target_kompetensi: "Pemahaman spasial bentuk geometri molekul.",
      q8_perhatian_khusus: "Membimbing murid yang masih kesulitan menggambar struktur Lewis.",
      supervisorNotes: "Guru membutuhkan penguatan pada variasi metode pengajaran interaktif agar murid tidak jenuh.",
      completedAt: "2025-09-08T09:00:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 17,
      totalAspek: 24,
      score: 70.8,
      predicate: "Cukup (C)",
      feedbackNotes: "Interaksi kelas cukup baik, namun sebagian murid masih pasif dan alokasi waktu penarikan kesimpulan belum maksimal."
    },
    pascaObservasi: {
      q1_kesan: "Cukup lega, namun menyadari perlunya manajemen waktu yang lebih disiplin saat praktik kelompok.",
      q2_sesuai_rencana: "Sebagian besar tahapan terlaksana meski sesi tanya jawab terpotong.",
      q3_hal_memuaskan: "Murid senang bermain dengan plastisin untuk membuat model geometri molekul.",
      q4_hal_kurang: "Asesmen formatif tertulis belum sempat dikerjakan seluruh murid.",
      q5_ketercapaian_tujuan: "72% murid mencapai kriteria ketuntasan pemodelan geometri.",
      q6_kesulitan_siswa: "Memvisualisasikan sudut ikatan trigonal piramida dan planar.",
      q7_alternatif_solusi: "Memanfaatkan aplikasi augmented reality atau PhET simulation bentuk molekul.",
      q8_rencana_tindak_lanjut: "Coaching pendampingan perencanaan modul ajar berbasis IT bersama pengawas.",
      q9_pengembangan_diri: "Mengikuti pelatihan penyusunan RPP Kurikulum Merdeka dan asesmen otentik.",
      generalImpression: "Guru muda berpotensi yang membutuhkan bimbingan intensif dalam diferensiasi dan manajemen kelas.",
      recommendations: "Ikuti pendampingan berkelanjutan Siklus SAMBUNG untuk meningkatkan mutu pembelajaran.",
      completedAt: "2025-09-15T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 76%, perlu bimbingan remedial berkelanjutan", note: "Cukup", score: 75 },
      administrasi: { evidence: "Perangkat ajar tersusun standar, perlu pembaruan berkala", note: "Cukup", score: 78 },
      pengembanganDiri: { evidence: "Mengikuti pelatihan Kombel dan PMM", note: "Cukup Aktif", score: 75 },
      kedisiplinan: { evidence: "Presensi 96%, hadir tepat waktu", note: "Baik", score: 85 },
      rekomendasi: { notes: "Diberikan pendampingan klinis pembelajaran oleh pengawas pembina", tindakLanjut: "Bimtek pedagogi kurikulum merdeka tingkat kota", score: 78 },
      finalAverageScore: 78.2,
      finalGrade: "Cukup (C)",
      summaryNotes: "Memiliki komitmen mengajar yang baik, siap berkembang melalui pendampingan pedagogik berkelanjutan."
    }
  },
  {
    id: "sup-demo-ananda-saulina",
    schoolId: "sch-ananda",
    schoolName: "SMAS Ananda",
    teacherId: "teacher-saulina",
    teacherName: "Saulina Siregar, S.Sos",
    teacherNip: "19890422 201403 2 009",
    subject: "Ekonomi",
    classGrade: "Fase E / Kelas X-1",
    semester: "Ganjil",
    schoolYear: "2025/2026",
    lessonTitle: "Perdagangan Internasional dan Kebijakan Tarif Impor dalam Era Globalisasi",
    status: "completed",
    supervisorId: "admin-kusnandar",
    supervisorName: "Kusnandar, M.Si",
    supervisorRole: "admin",
    createdAt: "2025-08-31T08:00:00.000Z",
    updatedAt: "2025-09-21T11:00:00.000Z",
    sambung: createDefaultSambungForTeacher("Saulina Siregar, S.Sos", "SMAS Ananda", "Ekonomi"),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: "https://drive.google.com/file/d/1DemoCPTPEkonomiAnanda/view?usp=sharing",
        modulAjarUrl: "https://drive.google.com/file/d/1DemoModulEkonomiAnanda/view?usp=sharing",
        bahanAjarUrl: "https://drive.google.com/file/d/1DemoMediaEkonomiAnanda/view?usp=sharing",
        asesmenUrl: "https://drive.google.com/file/d/1DemoRubrikEkonomiAnanda/view?usp=sharing"
      },
      submittedAt: "2025-09-04T09:00:00.000Z",
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: "Penyusunan modul ekonomi global terstruktur dan memuat isu aktual neraca perdagangan nasional." },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: "Baik" },
      feedback: { kelebihan: "Studi kasus ekspor komoditas kelapa sawit dan nikel sangat aktual.", perbaikan: "Tambahkan rubrik penilaian debat pro-kontra tarif proteksi.", rekomendasi: "Diteruskan ke observasi tatap muka." }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: "Menganalisis faktor pendorong perdagangan internasional dan dampak kebijakan proteksi bagi konsumen.",
      q2_metode: "Problem-Based Learning dengan simulasi negosiasi perdagangan bilateral antarnegara.",
      q3_alat_bahan: "Data statistik ekspor-impor Kementerian Perdagangan, kartu komoditas, lembar negosiasi.",
      q4_tahapan: "Apersepsi produk impor di sekitar kita, Simulasi penetapan tarif kuota, Analisis keuntungan komparatif, Refleksi.",
      q5_persiapan: "Menyiapkan modul ajar dan data tren neraca perdagangan.",
      q6_materi_sulit: "Menghitung surplus konsumen dan surplus produsen akibat penetapan tarif impor.",
      q7_target_kompetensi: "Literasi ekonomi global, kemampuan negosiasi, dan nalar kritis kebijakan.",
      q8_perhatian_khusus: "Membimbing murid dalam memahami istilah neraca pembayaran berjalan.",
      supervisorNotes: "Rancangan sangat menarik dan membekali murid pemahaman ekonomi makro modern.",
      completedAt: "2025-09-08T09:30:00.000Z"
    },
    observasiKelas: {
      items: {},
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: "Baik (B)",
      feedbackNotes: "Pengelolaan kelas komunikatif, murid antusias mewakili peran diplomat perdagangan antarnegara."
    },
    pascaObservasi: {
      q1_kesan: "Sangat senang karena murid berani mengemukakan argumen dampak kenaikan bea masuk impor.",
      q2_sesuai_rencana: "Ya, seluruh skenario negosiasi perdagangan selesai tepat waktu.",
      q3_hal_memuaskan: "Kecakapan murid mengidentifikasi keunggulan mutlak vs keunggulan komparatif.",
      q4_hal_kurang: "Dua murid memerlukan dorongan lebih untuk berbicara di hadapan audiens.",
      q5_ketercapaian_tujuan: "89% murid tuntas asesmen formatif perdagangan internasional.",
      q6_kesulitan_siswa: "Membedakan antara dumping dengan subsidi ekspor.",
      q7_alternatif_solusi: "Membuat diagram ringkas jenis-jenis kebijakan perdagangan internasional.",
      q8_rencana_tindak_lanjut: "Membahas bab kerja sama ekonomi regional ASEAN dan APEC.",
      q9_pengembangan_diri: "Mengikuti kursus ekonomi internasional dan geopolitik perdagangan.",
      generalImpression: "Guru profesional dengan wawasan sosial ekonomi yang luas dan luwes dalam memfasilitasi murid.",
      recommendations: "Tingkatkan latihan soal penalaran berbasis grafik penawaran dan permintaan internasional.",
      completedAt: "2025-09-14T11:00:00.000Z"
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: "Ketuntasan 90%, nilai sumatif ekonomi memuaskan", note: "Baik", score: 91 },
      administrasi: { evidence: "Lengkap dan tertata rapi dalam portofolio guru", note: "Tertib", score: 92 },
      pengembanganDiri: { evidence: "Aktif di forum MGMP Ekonomi dan seminar kurikulum", note: "Positif", score: 92 },
      kedisiplinan: { evidence: "Presensi 99%, dedikasi tinggi", note: "Disiplin", score: 96 },
      rekomendasi: { notes: "Pembina Klub Debat Isu Sosial Ekonomi Sekolah", tindakLanjut: "Pelatihan bimbingan olimpiade sains ekonomi tingkat kota", score: 93 },
      finalAverageScore: 92.8,
      finalGrade: "Baik (B)",
      summaryNotes: "Kinerja pengajaran baik, dedikatif, dan disenangi para murid."
    }
  }
];
SAMPLE_SUPERVISIONS.forEach((sup) => {
  if (!sup.sambung) {
    sup.sambung = createDefaultSambungForTeacher(sup.teacherName, sup.schoolName, sup.subject);
  }
  if (sup.sambung) {
    if (!sup.sambung.selidiki) {
      sup.sambung.selidiki = {
        tanggal: "2025-08-10",
        items: []
      };
    }
    const autoSeed = getTeacherAutoFillData(sup.teacherName, sup.subject, sup.lessonTitle, sup.schoolName);
    const existingBefore = sup.sambung.selidiki.matriksBefore || {};
    sup.sambung.selidiki.matriksBefore = {
      peranGuru: existingBefore.peranGuru || autoSeed.kesimpulanSelidiki.guruBerorientasi || DEFAULT_MATRIKS_BEFORE.peranGuru,
      aktivitasMurid: existingBefore.aktivitasMurid || autoSeed.kesimpulanSelidiki.muridAktif || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
      konteksNyata: existingBefore.konteksNyata || autoSeed.kesimpulanSelidiki.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
      refleksiMurid: existingBefore.refleksiMurid || autoSeed.kesimpulanSelidiki.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid
    };
    if (!sup.sambung.maknai?.pertanyaanList?.q1) {
      const maknaiData = generateTeacherMaknaiData(sup);
      sup.sambung.maknai = {
        ...sup.sambung.maknai,
        ...maknaiData,
        pertanyaanList: {
          ...maknaiData.pertanyaanList,
          ...sup.sambung.maknai?.pertanyaanList || {}
        },
        kesanUmum: sup.sambung.maknai?.kesanUmum ?? maknaiData.kesanUmum,
        saranMasukan: sup.sambung.maknai?.saranMasukan ?? maknaiData.saranMasukan
      };
    }
    if (!sup.sambung.arahkan?.fokusIndikatorTerpilih || sup.sambung.arahkan.fokusIndikatorTerpilih.length === 0) {
      const amatiData = generateAmatiData(sup, ["peranGuru", "aktivitasMurid"], sup.sambung.selidiki?.matriksBefore);
      sup.sambung.arahkan = {
        ...sup.sambung.arahkan,
        ...amatiData,
        fokusIndikatorTerpilih: amatiData.fokusIndikatorTerpilih
      };
    }
    if (!sup.sambung.berdayakan?.telaahScores || !sup.sambung.berdayakan.rppPerbaikanUrl) {
      const berdayakanData = generateBerdayakanTelaahPerbaikanData(sup);
      sup.sambung.berdayakan = {
        ...sup.sambung.berdayakan,
        ...berdayakanData,
        siklusList: sup.sambung.berdayakan?.siklusList && sup.sambung.berdayakan.siklusList.length > 0 ? sup.sambung.berdayakan.siklusList : berdayakanData.siklusList
      };
      if (!sup.perangkatAjarPerbaikan) {
        sup.perangkatAjarPerbaikan = {
          driveLinks: {
            cpTpAtpUrl: sup.perangkatAjar?.driveLinks?.cpTpAtpUrl || "https://drive.google.com/file/d/1CpTpAtp_Revisi/view",
            modulAjarUrl: berdayakanData.rppPerbaikanUrl,
            bahanAjarUrl: sup.perangkatAjar?.driveLinks?.bahanAjarUrl,
            asesmenUrl: sup.perangkatAjar?.driveLinks?.asesmenUrl
          },
          submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
          telaahScores: berdayakanData.telaahScores,
          telaahComments: berdayakanData.telaahComments,
          telaahSummary: berdayakanData.telaahSummary,
          feedback: berdayakanData.feedback,
          catatanRevisiGuru: berdayakanData.catatanRefleksiGuru,
          reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
          reviewedBy: berdayakanData.namaPenelaah
        };
      }
    }
    if (!sup.sambung.uji?.observasiPelaksanaan || !sup.sambung.uji?.praObservasi) {
      const ujiData = generateUjiData(sup);
      sup.sambung.uji = {
        ...sup.sambung.uji,
        ...ujiData
      };
      if (!sup.praObservasiPerbaikan) {
        sup.praObservasiPerbaikan = {
          q1_kd_indikator: ujiData.praObservasi?.q1 || "",
          q2_metode: ujiData.praObservasi?.q2 || "",
          q3_alat_bahan: ujiData.praObservasi?.q3 || "",
          q4_tahapan: ujiData.praObservasi?.q4 || "",
          q5_persiapan: ujiData.praObservasi?.q5 || "",
          q6_materi_sulit: ujiData.praObservasi?.q6 || "",
          q7_target_kompetensi: ujiData.praObservasi?.q7 || "",
          q8_perhatian_khusus: ujiData.praObservasi?.q8 || "",
          supervisorNotes: ujiData.praObservasi?.supervisorNotes || "",
          interviewDurationMinutes: 35
        };
      }
      if (!sup.observasiKelasPerbaikan) {
        sup.observasiKelasPerbaikan = {
          items: ujiData.observasiPelaksanaan?.items || {},
          totalYa: 25,
          totalAspek: 25,
          totalSkor: ujiData.observasiPelaksanaan?.totalSkor || 50,
          score: ujiData.observasiPelaksanaan?.persentaseCapaian || 100,
          predicate: ujiData.observasiPelaksanaan?.predicate || "Sangat Baik",
          feedbackNotes: `${ujiData.observasiPelaksanaan?.feedback.kelebihan}

Hal yang perlu diperbaiki: ${ujiData.observasiPelaksanaan?.feedback.perbaikan}

Rekomendasi: ${ujiData.observasiPelaksanaan?.feedback.rekomendasi}`,
          feedback: ujiData.observasiPelaksanaan?.feedback,
          completedAt: ujiData.observasiPelaksanaan?.completedAt || (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (!sup.pascaObservasiPerbaikan) {
        sup.pascaObservasiPerbaikan = {
          q1_kesan: ujiData.pascaObservasi?.pertanyaanList.q1 || "",
          q2_sesuai_rencana: ujiData.pascaObservasi?.pertanyaanList.q2 || "",
          q3_hal_memuaskan: ujiData.pascaObservasi?.pertanyaanList.q3 || "",
          q4_hal_kurang: ujiData.pascaObservasi?.pertanyaanList.q4 || "",
          q5_ketercapaian_tujuan: ujiData.pascaObservasi?.pertanyaanList.q5 || "",
          q6_kesulitan_siswa: ujiData.pascaObservasi?.pertanyaanList.q6 || "",
          q7_alternatif_solusi: ujiData.pascaObservasi?.pertanyaanList.q7 || "",
          q8_rencana_tindak_lanjut: ujiData.pascaObservasi?.pertanyaanList.q8 || "",
          q9_pengembangan_diri: ujiData.pascaObservasi?.pertanyaanList.q9 || "",
          generalImpression: ujiData.pascaObservasi?.kesanUmum || "",
          recommendations: ujiData.pascaObservasi?.saranMasukan || "",
          completedAt: ujiData.pascaObservasi?.completedAt || (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (sup.sambung.nyatakan?.beforeAfter) {
        sup.sambung.nyatakan.beforeAfter = sup.sambung.nyatakan.beforeAfter.map((item) => {
          if (item.aspek.toLowerCase().includes("guru") && ujiData.kesimpulanUji?.peranGuru) {
            return { ...item, setelahSambung: ujiData.kesimpulanUji.peranGuru };
          }
          if (item.aspek.toLowerCase().includes("murid") && !item.aspek.toLowerCase().includes("refleksi") && ujiData.kesimpulanUji?.aktivitasMurid) {
            return { ...item, setelahSambung: ujiData.kesimpulanUji.aktivitasMurid };
          }
          if ((item.aspek.toLowerCase().includes("konteks") || item.aspek.toLowerCase().includes("nyata")) && ujiData.kesimpulanUji?.konteksNyata) {
            return { ...item, setelahSambung: ujiData.kesimpulanUji.konteksNyata };
          }
          if (item.aspek.toLowerCase().includes("refleksi") && ujiData.kesimpulanUji?.refleksiMurid) {
            return { ...item, setelahSambung: ujiData.kesimpulanUji.refleksiMurid };
          }
          return item;
        });
      }
    }
    if (!sup.sambung.gerakkan?.rtlNyatakan || !sup.sambung.gerakkan?.kesimpulanAlurSambung) {
      const gerakkanData = generateGerakkanData(sup);
      sup.sambung.gerakkan = {
        ...sup.sambung.gerakkan,
        ...gerakkanData,
        rtlNyatakan: sup.sambung.gerakkan?.rtlNyatakan && sup.sambung.gerakkan.rtlNyatakan.length > 0 ? sup.sambung.gerakkan.rtlNyatakan : gerakkanData.rtlNyatakan,
        kesimpulanAlurSambung: sup.sambung.gerakkan?.kesimpulanAlurSambung || gerakkanData.kesimpulanAlurSambung
      };
    }
    if (sup.sambung.maknai?.pertanyaanList) {
      const p = sup.sambung.maknai.pertanyaanList;
      sup.pascaObservasi = {
        ...sup.pascaObservasi,
        q1_kesan: p.q1 || sup.pascaObservasi?.q1_kesan || "",
        q2_sesuai_rencana: p.q2 || sup.pascaObservasi?.q2_sesuai_rencana || "",
        q3_hal_memuaskan: p.q3 || sup.pascaObservasi?.q3_hal_memuaskan || "",
        q4_hal_kurang: p.q6 || sup.pascaObservasi?.q4_hal_kurang || "",
        q5_ketercapaian_tujuan: p.q4 || sup.pascaObservasi?.q5_ketercapaian_tujuan || "",
        q6_kesulitan_siswa: p.q5 || sup.pascaObservasi?.q6_kesulitan_siswa || "",
        q7_alternatif_solusi: p.q7 || sup.pascaObservasi?.q7_alternatif_solusi || "",
        q8_rencana_tindak_lanjut: p.q10 || sup.pascaObservasi?.q8_rencana_tindak_lanjut || "",
        q9_pengembangan_diri: p.q9 || sup.pascaObservasi?.q9_pengembangan_diri || "",
        generalImpression: sup.sambung.maknai.kesanUmum || sup.pascaObservasi?.generalImpression || "",
        recommendations: sup.sambung.maknai.saranMasukan || sup.pascaObservasi?.recommendations || ""
      };
    }
  }
});
var TARGET_OFFICIAL_BACKUP_IDS = /* @__PURE__ */ new Set([
  "sup-demo-01",
  "sup-demo-02",
  "sup-demo-04",
  "sup-demo-05",
  "sup-demo-06",
  "sup-demo-07",
  "sup-demo-ummul-sani",
  "sup-demo-ummul-kirana",
  "sup-demo-rimba-atik"
]);
for (let i = SAMPLE_SUPERVISIONS.length - 1; i >= 0; i--) {
  if (!TARGET_OFFICIAL_BACKUP_IDS.has(SAMPLE_SUPERVISIONS[i].id)) {
    SAMPLE_SUPERVISIONS.splice(i, 1);
  }
}

// src/services/firebaseDefaults.ts
var DEFAULT_SCHOOLS = [
  {
    id: "sch-sman2",
    npsn: "20238516",
    name: "SMAN 2 Bogor",
    address: "Jl. Keranji Ujung No. 1, Budi Agung, Sukaresmi, Kec. Tanah Sareal, Kota Bogor",
    principalName: "Nevy Vilanti Kusdinan, M.Pd.",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-sman4",
    npsn: "20220334",
    name: "SMAN 4 Bogor",
    address: "Jl. Dreded V No. 36, Empang, Kec. Kota Bogor Selatan, Kota Bogor",
    principalName: "Yulianti Rosdian, M.Pd.",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-ummul-quro",
    npsn: "69775444",
    name: "SMAS IT Ummul Quro",
    address: "Jl. Pool Bina Marga Perumahan Kayu Manis Boulevard No. 3, RT 006 / RW 005, Kayu Manis, Tanah Sareal, Kota Bogor - 16169",
    principalName: "Hildawati, S.T.",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-yphb",
    npsn: "20220330",
    name: "SMAS YPHB",
    address: "Jl. Pajajaran Nomor 234 A, Kota Bogor",
    principalName: "Joko Pitoyo, S.Pd., M.M.",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-rimba-madya",
    npsn: "20220344",
    name: "SMAS Rimba Madya",
    address: "Jl. Rimba Mulya II, Pasir Mulya, Bogor Barat",
    principalName: "Pajar Hariyanto, S.Pd.",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-yza-1",
    npsn: "20220350",
    name: "SMA YZA 1",
    address: "Jl. Raya Ciawi KM. 09, Kel. Sindangsari, Kec. Bogor Timur, Kota Bogor",
    principalName: "TB. Agung Hartawan, SE",
    accreditation: "B",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-pgri-1",
    npsn: "20220317",
    name: "SMAS PGRI 1",
    address: "Jl. Bina Marga I No. 17, Bogor Timur",
    principalName: "Evi Jalinar, S.Pd., M.Si",
    accreditation: "A",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-bhakti-insani",
    npsn: "20220520",
    name: "SMAS Bhakti Insani",
    address: "Jl. Batu Tulis NV Sidik No. 5C, Bogor Selatan",
    principalName: "Kusmiati, Ph.D.",
    accreditation: "B",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-yasih",
    npsn: "20220349",
    name: "SMAS Yasih",
    address: "Jl. Baranangsiang Indah Kp. Cikeas, Kel. Katulampa, Kec. Bogor Timur, Kota Bogor",
    principalName: "M. Fahmi Fauzan Ihsan, S.Pd",
    accreditation: "B",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-muhammadiyah",
    npsn: "20220314",
    name: "SMAS Muhammadiyah",
    address: "Jl. Merdeka 118, Bogor",
    principalName: "Nurmawaji, S.Pd.",
    accreditation: "B",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  },
  {
    id: "sch-ananda",
    npsn: "20220547",
    name: "SMAS Ananda",
    address: "Jl. Lawanggintung Komp. KPKN No. 25, RT 06 / RW 06, Bogor",
    principalName: "Maria, M.Psi.",
    accreditation: "B",
    createdAt: "2025-01-01T00:00:00.000Z",
    createdBy: "system"
  }
];
var DEFAULT_USERS = [
  {
    uid: "user-super-admin",
    username: "admin",
    password: "bajuri39",
    email: "admin@siklus-sambung.sch.id",
    displayName: "Super Admin",
    role: "super_admin",
    nip: "SUPERADMIN-001",
    phone: "081100000001",
    wilayahTugas: "Pusat & Seluruh Wilayah Binaan",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "user-pengawas-kusnandar",
    username: "pengawas",
    password: "pakkus",
    email: "pengawas@siklus-sambung.sch.id",
    displayName: "Kusnandar, M.Si",
    role: "admin",
    nip: "19680512 199403 1 004",
    phone: "081288990011",
    wilayahTugas: "Cabang Dinas Pendidikan Wilayah II",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "user-kepsek-yulianti",
    username: "yulianti",
    password: "pakkus",
    email: "yulianti@siklus-sambung.sch.id",
    displayName: "Yulianti Rosdian, M.Pd.",
    role: "kepsek",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    nip: "19720415 199802 2 001",
    phone: "081299887766",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-sondang",
    username: "sondang",
    password: "pakkus",
    email: "sondang@siklus-sambung.sch.id",
    displayName: "Sondang Asih Januarti, S.Pd.",
    role: "guru",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    subject: "Fisika",
    nip: "19840512 200801 2 007",
    phone: "081377665544",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-hilmia",
    username: "hilmia",
    password: "pakkus",
    email: "hilmia@siklus-sambung.sch.id",
    displayName: "Hilmia Fitriyani, S.Pd.",
    role: "guru",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    subject: "Ekonomi",
    nip: "19851120 200902 2 008",
    phone: "081388776655",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-ivany",
    username: "ivany",
    password: "pakkus",
    email: "ivany@siklus-sambung.sch.id",
    displayName: "Ivany Ratna Ekandini, S.Pd.",
    role: "guru",
    schoolId: "sch-rimba-madya",
    schoolName: "SMAS Rimba Madya",
    subject: "Bahasa Indonesia",
    nip: "19890412 201402 2 003",
    phone: "081234567890",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-alline",
    username: "alline",
    password: "pakkus",
    email: "alline@siklus-sambung.sch.id",
    displayName: "Alline Novianti, S.Pd.",
    role: "guru",
    schoolId: "sch-sman2",
    schoolName: "SMAN 2 Bogor",
    subject: "Kimia",
    nip: "19860715 201001 2 011",
    phone: "081298765432",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-mega",
    username: "mega",
    password: "pakkus",
    email: "mega@siklus-sambung.sch.id",
    displayName: "Mega Nur Alfira, S.Pd.",
    role: "guru",
    schoolId: "sch-sman2",
    schoolName: "SMAN 2 Bogor",
    subject: "Sejarah",
    nip: "19910318 201503 2 006",
    phone: "081356789012",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-iqbal",
    username: "iqbal",
    password: "pakkus",
    email: "iqbal@siklus-sambung.sch.id",
    displayName: "Iqbal Aziz Andrianto",
    role: "guru",
    schoolId: "sch-pgri-1",
    schoolName: "SMAS PGRI 1",
    subject: "Sejarah",
    nip: "19920824 201901 1 005",
    phone: "081323456789",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-sani",
    username: "sani",
    password: "pakkus",
    email: "sani@siklus-sambung.sch.id",
    displayName: "Sani Ramadhanti Noor, S.E.",
    role: "guru",
    schoolId: "sch-ummul-quro",
    schoolName: "SMAS IT Ummul Quro",
    subject: "Ekonomi",
    nip: "19880914 201201 2 004",
    phone: "081278901234",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-kirana",
    username: "kirana",
    password: "pakkus",
    email: "kirana@siklus-sambung.sch.id",
    displayName: "Kirana Mahardhika, S.Pd, Gr.",
    role: "guru",
    schoolId: "sch-ummul-quro",
    schoolName: "SMAS IT Ummul Quro",
    subject: "Fisika",
    nip: "19930217 201801 2 009",
    phone: "081289012345",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-atik",
    username: "atik",
    password: "pakkus",
    email: "atik@siklus-sambung.sch.id",
    displayName: "Atik Dwi Larasati, S.Pd.",
    role: "guru",
    schoolId: "sch-rimba-madya",
    schoolName: "SMAS Rimba Madya",
    subject: "Ekonomi",
    nip: "19870622 201101 2 012",
    phone: "081390123456",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-sihana",
    username: "sihana",
    password: "pakkus",
    email: "sihana@siklus-sambung.sch.id",
    displayName: "Sihana, S.Pd.Gr.",
    role: "guru",
    schoolId: "sch-yphb",
    schoolName: "SMAS YPHB",
    subject: "Penjasorkes",
    nip: "19830509 200604 1 008",
    phone: "081212345678",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-salma",
    username: "salma",
    password: "pakkus",
    email: "salma@siklus-sambung.sch.id",
    displayName: "Siti Salma, S.Pd",
    role: "guru",
    schoolId: "sch-yphb",
    schoolName: "SMAS YPHB",
    subject: "Fisika",
    nip: "19901205 201403 2 007",
    phone: "081223456789",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-widya",
    username: "widya",
    password: "pakkus",
    email: "widya@siklus-sambung.sch.id",
    displayName: "Widya Anjani, S.Pd.",
    role: "guru",
    schoolId: "sch-bhakti-insani",
    schoolName: "SMAS Bhakti Insani",
    subject: "Ekonomi",
    nip: "19940830 202012 2 010",
    phone: "081334567890",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-yazid",
    username: "yazid",
    password: "pakkus",
    email: "yazid@siklus-sambung.sch.id",
    displayName: "Yazid Ali Hamdi",
    role: "guru",
    schoolId: "sch-yasih",
    schoolName: "SMAS Yasih",
    subject: "PKn",
    nip: "19891111 201502 1 003",
    phone: "081345678901",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-lutfiana",
    username: "lutfiana",
    password: "pakkus",
    email: "lutfiana@siklus-sambung.sch.id",
    displayName: "Lutfiana Faridh Fadillah",
    role: "guru",
    schoolId: "sch-muhammadiyah",
    schoolName: "SMAS Muhammadiyah",
    subject: "Kimia",
    nip: "19950125 202104 2 006",
    phone: "081256789012",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-saulina",
    username: "saulina",
    password: "pakkus",
    email: "saulina@siklus-sambung.sch.id",
    displayName: "Saulina Siregar, S.Sos",
    role: "guru",
    schoolId: "sch-ananda",
    schoolName: "SMAS Ananda",
    subject: "Ekonomi",
    nip: "19860314 201003 2 005",
    phone: "081267890123",
    approvalStatus: "approved",
    createdAt: "2025-01-01T00:00:00.000Z"
  },
  {
    uid: "teacher-yanuarisnandar",
    username: "yanuarisnandar",
    password: "pakkus",
    email: "yanuarisnandar@siklus-sambung.sch.id",
    displayName: "Yanuarisnandar Mauludi, S.Pd.",
    role: "guru",
    schoolId: "sch-sman4",
    schoolName: "SMAN 4 Bogor",
    subject: "Bahasa Sunda",
    nip: "19860111 201101 1 002",
    phone: "081234567899",
    approvalStatus: "approved",
    createdAt: "2026-11-02T06:05:38.367Z"
  }
];

// src/server/db.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.resolve(__dirname, "../../server_data");
var DB_FILE = path.resolve(DATA_DIR, "database.json");
var inMemoryDb = null;
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}
function getInitialDatabase() {
  return {
    schools: DEFAULT_SCHOOLS,
    supervisions: SAMPLE_SUPERVISIONS,
    users: DEFAULT_USERS,
    deletedSupervisionIds: [],
    deletedUserIds: [],
    deletedUserNames: [],
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function loadDatabase() {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  ensureDataDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.schools) && Array.isArray(parsed.supervisions)) {
        const sanitizedSupervisions = (parsed.supervisions || []).map((s) => {
          if (s.sambung?.gerakkan?.rtlNyatakan) {
            s.sambung.gerakkan.rtlNyatakan = s.sambung.gerakkan.rtlNyatakan.filter(
              (r) => !r.indikator?.includes("Asesmen Autentik") && r.id !== 5
            );
          }
          return s;
        });
        inMemoryDb = {
          schools: parsed.schools,
          supervisions: sanitizedSupervisions,
          users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_USERS,
          deletedSupervisionIds: Array.isArray(parsed.deletedSupervisionIds) ? parsed.deletedSupervisionIds : [],
          deletedUserIds: Array.isArray(parsed.deletedUserIds) ? parsed.deletedUserIds : [],
          deletedUserNames: Array.isArray(parsed.deletedUserNames) ? parsed.deletedUserNames : [],
          lastUpdated: parsed.lastUpdated || (/* @__PURE__ */ new Date()).toISOString()
        };
        return inMemoryDb;
      }
    } catch (err) {
      console.warn("Notice loading database.json (fallback to defaults):", err);
    }
  }
  inMemoryDb = getInitialDatabase();
  saveDatabase(inMemoryDb);
  return inMemoryDb;
}
function saveDatabase(db) {
  ensureDataDir();
  inMemoryDb = {
    ...db,
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(inMemoryDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing to database.json:", err);
  }
}
function getAllSchools() {
  const db = loadDatabase();
  return db.schools;
}
function getSchoolById(id) {
  const db = loadDatabase();
  return db.schools.find((s) => s.id === id) || null;
}
function saveSchool(school) {
  const db = loadDatabase();
  const existingIndex = db.schools.findIndex((s) => s.id === school.id);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const updatedSchool = {
    ...school,
    updatedAt: now
  };
  if (existingIndex >= 0) {
    db.schools[existingIndex] = updatedSchool;
  } else {
    db.schools.push(updatedSchool);
  }
  if (updatedSchool.name) {
    db.supervisions = db.supervisions.map((s) => {
      if (s.schoolId === updatedSchool.id) {
        return { ...s, schoolName: updatedSchool.name, updatedAt: now };
      }
      return s;
    });
    db.users = db.users.map((u) => {
      if (u.schoolId === updatedSchool.id) {
        return { ...u, schoolName: updatedSchool.name, updatedAt: now };
      }
      return u;
    });
  }
  saveDatabase(db);
  return updatedSchool;
}
function updateSchoolById(id, partial) {
  const db = loadDatabase();
  const existing = db.schools.find((s) => s.id === id);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const target = existing ? { ...existing, ...partial, id, updatedAt: now, createdBy: partial.createdBy || existing.createdBy || "system" } : {
    id,
    name: partial.name || "SMA Binaan",
    npsn: partial.npsn || "",
    principalName: partial.principalName || "",
    accreditation: partial.accreditation || "A",
    address: partial.address || "",
    createdAt: now,
    updatedAt: now,
    createdBy: partial.createdBy || "system",
    ...partial
  };
  return saveSchool(target);
}
function deleteSchoolById(id) {
  const db = loadDatabase();
  const beforeCount = db.schools.length;
  db.schools = db.schools.filter((s) => s.id !== id);
  if (db.schools.length !== beforeCount) {
    saveDatabase(db);
    return true;
  }
  return false;
}
function resetSchoolsToDefault() {
  const db = loadDatabase();
  db.schools = [...DEFAULT_SCHOOLS];
  saveDatabase(db);
  return db.schools;
}
function getAllSupervisions() {
  const db = loadDatabase();
  const deletedIds = new Set(db.deletedSupervisionIds);
  const deletedUids = new Set(db.deletedUserIds);
  const deletedNames = new Set(db.deletedUserNames.map((n) => n.toLowerCase().trim()));
  return db.supervisions.filter((s) => {
    if (deletedIds.has(s.id)) return false;
    if (s.teacherId && deletedUids.has(s.teacherId)) return false;
    if (s.teacherName && deletedNames.has(s.teacherName.toLowerCase().trim())) return false;
    return true;
  }).map((s) => ({ ...s, isValidData: true }));
}
function getSupervisionById(id) {
  const db = loadDatabase();
  if (db.deletedSupervisionIds.includes(id)) return null;
  const found = db.supervisions.find((s) => s.id === id);
  return found ? { ...found, isValidData: true } : null;
}
function saveSupervisionRecord(sup) {
  const db = loadDatabase();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const targetId = sup.id || `sup-${Date.now()}`;
  const fullSupervision = {
    ...sup,
    id: targetId,
    isValidData: true,
    createdAt: sup.createdAt || now,
    updatedAt: now
  };
  db.deletedSupervisionIds = db.deletedSupervisionIds.filter((id) => id !== targetId);
  const idx = db.supervisions.findIndex((s) => s.id === targetId);
  if (idx >= 0) {
    db.supervisions[idx] = fullSupervision;
  } else {
    db.supervisions.unshift(fullSupervision);
  }
  saveDatabase(db);
  return fullSupervision;
}
function deleteTeacherCompletely(payload) {
  const db = loadDatabase();
  const cleanName = (payload.teacherName || "").toLowerCase().trim();
  const targetId = payload.supervisionId;
  let teacherId = payload.teacherId;
  if ((!teacherId || !cleanName) && targetId) {
    const existing = db.supervisions.find((s) => s.id === targetId);
    if (existing) {
      if (!cleanName && existing.teacherName) {
        payload.teacherName = existing.teacherName;
      }
      if (!teacherId && existing.teacherId) {
        teacherId = existing.teacherId;
      }
    }
  }
  const effectiveCleanName = (payload.teacherName || "").toLowerCase().trim();
  const matchedSupervisionIds = /* @__PURE__ */ new Set();
  if (targetId) matchedSupervisionIds.add(targetId);
  db.supervisions.forEach((s) => {
    if (targetId && s.id === targetId) matchedSupervisionIds.add(s.id);
    if (teacherId && s.teacherId === teacherId) matchedSupervisionIds.add(s.id);
    if (effectiveCleanName && s.teacherName && s.teacherName.toLowerCase().trim() === effectiveCleanName) {
      matchedSupervisionIds.add(s.id);
    }
  });
  const matchedUserUids = /* @__PURE__ */ new Set();
  if (teacherId) matchedUserUids.add(teacherId);
  db.users.forEach((u) => {
    if (teacherId && u.uid === teacherId) matchedUserUids.add(u.uid);
    if (effectiveCleanName && u.displayName && u.displayName.toLowerCase().trim() === effectiveCleanName) {
      matchedUserUids.add(u.uid);
    }
  });
  matchedSupervisionIds.forEach((id) => {
    if (!db.deletedSupervisionIds.includes(id)) {
      db.deletedSupervisionIds.push(id);
    }
  });
  matchedUserUids.forEach((uid) => {
    if (!db.deletedUserIds.includes(uid)) {
      db.deletedUserIds.push(uid);
    }
  });
  if (effectiveCleanName && !db.deletedUserNames.map((n) => n.toLowerCase().trim()).includes(effectiveCleanName)) {
    db.deletedUserNames.push(effectiveCleanName);
  }
  db.supervisions = db.supervisions.filter((s) => {
    if (matchedSupervisionIds.has(s.id)) return false;
    if (teacherId && s.teacherId === teacherId) return false;
    if (effectiveCleanName && s.teacherName && s.teacherName.toLowerCase().trim() === effectiveCleanName) return false;
    return true;
  });
  db.users = db.users.filter((u) => {
    if (matchedUserUids.has(u.uid)) return false;
    if (effectiveCleanName && u.displayName && u.displayName.toLowerCase().trim() === effectiveCleanName) return false;
    return true;
  });
  saveDatabase(db);
  return true;
}
function deleteSupervisionById(id) {
  const db = loadDatabase();
  const target = db.supervisions.find((s) => s.id === id);
  return deleteTeacherCompletely({
    supervisionId: id,
    teacherId: target?.teacherId,
    teacherName: target?.teacherName
  });
}
function getAllUsers() {
  const db = loadDatabase();
  const deletedUids = new Set(db.deletedUserIds);
  const deletedNames = new Set(db.deletedUserNames.map((n) => n.toLowerCase().trim()));
  return db.users.filter((u) => {
    if (deletedUids.has(u.uid)) return false;
    if (u.displayName && deletedNames.has(u.displayName.toLowerCase().trim())) return false;
    return true;
  });
}
function saveUserRecord(user) {
  const db = loadDatabase();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const targetUser = {
    ...user,
    updatedAt: now
  };
  db.deletedUserIds = db.deletedUserIds.filter((id) => id !== user.uid);
  if (user.displayName) {
    const cleanName = user.displayName.toLowerCase().trim();
    db.deletedUserNames = db.deletedUserNames.filter((n) => n.toLowerCase().trim() !== cleanName);
  }
  const idx = db.users.findIndex((u) => u.uid === user.uid || user.username && u.username === user.username);
  if (idx >= 0) {
    db.users[idx] = targetUser;
  } else {
    db.users.push(targetUser);
  }
  if (user.role === "guru") {
    db.supervisions = db.supervisions.map((s) => {
      if (s.teacherId === user.uid || user.username && s.teacherId === user.username) {
        return {
          ...s,
          teacherName: user.displayName || s.teacherName,
          teacherNip: user.nip !== void 0 ? user.nip : s.teacherNip,
          subject: user.subject || s.subject,
          schoolId: user.schoolId || s.schoolId,
          schoolName: user.schoolName || s.schoolName,
          updatedAt: now
        };
      }
      return s;
    });
  }
  saveDatabase(db);
  return targetUser;
}
function deleteUserRecord(uid) {
  const db = loadDatabase();
  const target = db.users.find((u) => u.uid === uid);
  return deleteTeacherCompletely({
    teacherId: uid,
    teacherName: target?.displayName
  });
}
function bulkSync(data) {
  const db = loadDatabase();
  if (Array.isArray(data.deletedSupervisionIds)) {
    const set = /* @__PURE__ */ new Set([...db.deletedSupervisionIds, ...data.deletedSupervisionIds]);
    db.deletedSupervisionIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserIds)) {
    const set = /* @__PURE__ */ new Set([...db.deletedUserIds, ...data.deletedUserIds]);
    db.deletedUserIds = Array.from(set);
  }
  if (Array.isArray(data.deletedUserNames)) {
    const set = /* @__PURE__ */ new Set([...db.deletedUserNames, ...data.deletedUserNames]);
    db.deletedUserNames = Array.from(set);
  }
  if (Array.isArray(data.schools)) {
    const schoolMap = /* @__PURE__ */ new Map();
    db.schools.forEach((s) => schoolMap.set(s.id, s));
    data.schools.forEach((s) => schoolMap.set(s.id, s));
    db.schools = Array.from(schoolMap.values());
  }
  if (Array.isArray(data.supervisions)) {
    if (data.replaceSupervisions) {
      db.supervisions = [...data.supervisions];
    } else {
      const supMap = /* @__PURE__ */ new Map();
      db.supervisions.forEach((s) => supMap.set(s.id, s));
      data.supervisions.forEach((s) => supMap.set(s.id, s));
      db.supervisions = Array.from(supMap.values());
    }
  }
  if (Array.isArray(data.users)) {
    const userMap = /* @__PURE__ */ new Map();
    db.users.forEach((u) => userMap.set(u.uid, u));
    data.users.forEach((u) => userMap.set(u.uid, u));
    db.users = Array.from(userMap.values());
  }
  saveDatabase(db);
  return {
    schoolsCount: db.schools.length,
    supervisionsCount: db.supervisions.length,
    usersCount: db.users.length
  };
}
function restoreBackupData(data) {
  const db = loadDatabase();
  if (Array.isArray(data.schools) && data.schools.length > 0) {
    const schoolMap = /* @__PURE__ */ new Map();
    db.schools.forEach((s) => schoolMap.set(s.id, s));
    data.schools.forEach((s) => schoolMap.set(s.id, s));
    db.schools = Array.from(schoolMap.values());
  }
  if (Array.isArray(data.supervisions) && data.supervisions.length > 0) {
    const supMap = /* @__PURE__ */ new Map();
    db.supervisions.forEach((s) => supMap.set(s.id, s));
    data.supervisions.forEach((s) => {
      db.deletedSupervisionIds = db.deletedSupervisionIds.filter((id) => id !== s.id);
      supMap.set(s.id, s);
    });
    db.supervisions = Array.from(supMap.values());
  }
  saveDatabase(db);
  return {
    supervisionsCount: data.supervisions.length,
    schoolsCount: data.schools?.length || 0
  };
}

// server.ts
dotenv.config();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function startServer() {
  const app = express();
  const portArgIdx = process.argv.indexOf("--port");
  const cliPort = portArgIdx !== -1 && process.argv[portArgIdx + 1] ? Number(process.argv[portArgIdx + 1]) : null;
  const hostArgIdx = process.argv.indexOf("--host");
  const cliHost = hostArgIdx !== -1 && process.argv[hostArgIdx + 1] ? process.argv[hostArgIdx + 1] : "0.0.0.0";
  const rawPort = process.env.PORT;
  const PORT = Number(cliPort || process.env.DEFAULT_APP_PORT || (rawPort && rawPort !== "8080" ? rawPort : 3e3));
  const HOST = cliHost || "0.0.0.0";
  const isProd = process.env.NODE_ENV === "production";
  app.use(express.json({ limit: "10mb" }));
  const aiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  let ai = null;
  if (aiApiKey) {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", hasAiKey: Boolean(aiApiKey) });
  });
  app.get("/api/bootstrap", (_req, res) => {
    try {
      const data = loadDatabase();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/schools", (_req, res) => {
    try {
      const schools = getAllSchools();
      res.json({ success: true, schools });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/schools/:id", (req, res) => {
    try {
      const school = getSchoolById(req.params.id);
      if (!school) return res.status(404).json({ success: false, error: "Not found" });
      res.json({ success: true, school });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/schools", (req, res) => {
    try {
      const school = saveSchool(req.body);
      res.json({ success: true, school });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.put("/api/schools/:id", (req, res) => {
    try {
      const school = updateSchoolById(req.params.id, req.body);
      res.json({ success: true, school });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.delete("/api/schools/:id", (req, res) => {
    try {
      const ok = deleteSchoolById(req.params.id);
      res.json({ success: ok });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/schools/reset", (_req, res) => {
    try {
      const schools = resetSchoolsToDefault();
      res.json({ success: true, schools });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/supervisions", (_req, res) => {
    try {
      const supervisions = getAllSupervisions();
      res.json({ success: true, supervisions });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/supervisions/:id", (req, res) => {
    try {
      const supervision = getSupervisionById(req.params.id);
      if (!supervision) return res.status(404).json({ success: false, error: "Not found" });
      res.json({ success: true, supervision });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/supervisions", (req, res) => {
    try {
      const supervision = saveSupervisionRecord(req.body);
      res.json({ success: true, supervision });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.put("/api/supervisions/:id", (req, res) => {
    try {
      const supervision = saveSupervisionRecord({ ...req.body, id: req.params.id });
      res.json({ success: true, supervision });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.delete("/api/supervisions/:id", (req, res) => {
    try {
      const ok = deleteSupervisionById(req.params.id);
      res.json({ success: ok });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.get("/api/users", (_req, res) => {
    try {
      const users = getAllUsers();
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/users", (req, res) => {
    try {
      const user = saveUserRecord(req.body);
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.put("/api/users/:uid", (req, res) => {
    try {
      const user = saveUserRecord({ ...req.body, uid: req.params.uid });
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.delete("/api/users/:uid", (req, res) => {
    try {
      const ok = deleteUserRecord(req.params.uid);
      res.json({ success: ok });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/teachers/purge", (req, res) => {
    try {
      const ok = deleteTeacherCompletely(req.body);
      res.json({ success: ok });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/sync", (req, res) => {
    try {
      const result = bulkSync(req.body);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/restore", (req, res) => {
    try {
      const result = restoreBackupData(req.body);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
  app.post("/api/ai/analyze-rpp", async (req, res) => {
    try {
      const {
        teacherName,
        subject,
        lessonTitle,
        classGrade,
        schoolName,
        rppText,
        focusAspects
      } = req.body;
      if (!ai) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          message: "GEMINI_API_KEY not configured on server, client fallback will be used"
        });
      }
      const prompt = `Anda adalah Pengawas Pembina SMA (Kusnandar, M.Si) yang sangat ahli dalam supervisi akademik klinis Kurikulum Merdeka dan instrumen SIKLUS SAMBUNG (Selidiki, Amati, Maknai, Berdayakan, Uji, Nyatakan, Gerakkan).

Tugas Anda adalah menelaah Modul Ajar / Rencana Pelaksanaan Pembelajaran (RPP) berikut secara mendalam, pedagogis, dan akurat berdasarkan 22 Butir Indikator Resmi Telaah RPP Pengawas Pembina.

DATA GURU & PEMBELAJARAN:
- Nama Guru: ${teacherName || "Guru Mata Pelajaran"}
- Satuan Pendidikan: ${schoolName || "SMA"}
- Mata Pelajaran: ${subject || "Mata Pelajaran"}
- Materi Pokok / Topik: ${lessonTitle || "Materi Pembelajaran"}
- Fase / Kelas: ${classGrade || "Fase E / Fase F"}
${rppText ? `- Kutipan / Ringkasan Dokumen Modul Ajar:
${rppText}` : ""}
${focusAspects ? `- Catatan Khusus Pengawas: ${focusAspects}` : ""}

DAFTAR 22 BUTIR INDIKATOR RESMI YANG HARUS DINILAI:
1. Identitas RPP: Terdapat Satuan Pendidikan, Mata Pelajaran, Fase/Kelas, Materi Pokok, Alokasi Waktu yang jelas dan lengkap.
2. Murid (Opsional): Identifikasi kesiapan murid sebelum belajar (pengetahuan awal, minat, kebutuhan belajar).
3. Materi Pelajaran (Opsional): Analisis materi pelajaran (jenis pengetahuan, relevansi nyata, tingkat kesulitan, nilai & karakter).
4. Dimensi Profil Lulusan: Terdapat Dimensi Profil Lulusan yang selaras dengan tujuan dan kegiatan.
5. Keselarasan Dimensi: Tujuan, langkah, dan asesmen mengarah pada pencapaian Profil Lulusan.
6. Keselarasan Utuh: Tujuan, langkah, dan asesmen selaras saling terhubung secara utuh.
7. Tujuan Pembelajaran: Mencakup kompetensi dan konten dengan kata kerja operasional relevan.
8. Praktik Pedagogis: Model/Strategi/Metode/Media/Sumber pembelajaran dipilih untuk mencapai tujuan.
9. Lingkungan Pembelajaran: Budaya belajar, ruang fisik dan/atau ruang virtual tergambar pada langkah/asesmen.
10. Kemitraan Pembelajaran (Opsional): Kolaborasi dalam/luar sekolah tergambar.
11. Pemanfaatan Digital (Opsional): Pemanfaatan teknologi digital untuk interaktif, kolaboratif, kontekstual.
12. Pengalaman Belajar MEMAHAMI: Terlibat aktif mengonstruksi pengetahuan mendalam konsep/materi dari berbagai sumber/konteks nyata.
13. Pengalaman Belajar MENGAPLIKASI: Mengaplikasikan pemahaman secara kontekstual dalam situasi nyata, berpikir kritis, solusi inovatif.
14. Pengalaman Belajar MEREFLEKSI: Evaluasi & memaknai proses/hasil, kelola belajar mandiri, metakognisi, regulasi emosi.
15. Pengalaman Saling MEMULIAKAN: Budaya saling menghormati, adaptif, inklusif antara Guru-Murid & Murid-Murid tercermin dalam bahasa verbal/nonverbal.
16. Pembelajaran Mendalam (Deep Learning): Berkesadaran, bermakna, dan menggembirakan tergambar pada langkah pembelajaran.
17. Karakteristik Peserta Didik: Mengakomodir pengalaman belajar sesuai karakteristik dan diferensiasi murid.
18. Asesmen Awal: Bukti kesiapan belajar emosional/mental, pengetahuan awal, serta tindak lanjutnya.
19. Asesmen Formatif: Pemantauan kontinyu perkembangan murid, umpan balik timbal-balik melalui teknik beragam.
20. Asesmen Sumatif: Mengukur ketercapaian kompetensi dengan beragam cara (tes, portofolio, proyek, presentasi).
21. Rubrik Penilaian: Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dinilai transparan.
22. Lembar Kerja Murid (LKPD): LKPD selaras dengan tujuan dan alur kegiatan pembelajaran.

ATURAN PENILAIAN RESMI (Instrumen Pengawas Pembina Kusnandar, M.Si):
- Nilai tiap butir (1 sampai 22) dengan skala skor: 
  * 0 = Tidak Ada
  * 1 = Kurang Lengkap
  * 2 = Lengkap / Sesuai
  * "NA" = Tidak Relevan (khusus butir opsional: 2, 3, 10, 11)
- Lakukan analisis pedagogis yang kontekstual, kritis, dan relevan dengan mata pelajaran (${subject}) dan materi (${lessonTitle}).
- Tulis catatan komentar per butir (1-2 kalimat tajam, ilmiah, dan berbobot).
- Berikan catatan rekomendasi penelaah dalam 3 dimensi: kelebihan, perbaikan, dan rekomendasi.

Format output WAJIB format JSON murni tanpa markdown wrapper:
{
  "scores": {
    "1": 2,
    "2": 2,
    "3": 2,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 2,
    "8": 2,
    "9": 2,
    "10": 1,
    "11": 2,
    "12": 2,
    "13": 2,
    "14": 2,
    "15": 2,
    "16": 2,
    "17": 2,
    "18": 2,
    "19": 2,
    "20": 2,
    "21": 2,
    "22": 2
  },
  "comments": {
    "1": "Komentar analitis...",
    "2": "Komentar analitis...",
    "3": "Komentar analitis...",
    "4": "Komentar analitis...",
    "5": "Komentar analitis...",
    "6": "Komentar analitis...",
    "7": "Komentar analitis...",
    "8": "Komentar analitis...",
    "9": "Komentar analitis...",
    "10": "Komentar analitis...",
    "11": "Komentar analitis...",
    "12": "Komentar analitis...",
    "13": "Komentar analitis...",
    "14": "Komentar analitis...",
    "15": "Komentar analitis...",
    "16": "Komentar analitis...",
    "17": "Komentar analitis...",
    "18": "Komentar analitis...",
    "19": "Komentar analitis...",
    "20": "Komentar analitis...",
    "21": "Komentar analitis...",
    "22": "Komentar analitis..."
  },
  "feedback": {
    "kelebihan": "Analisis kelebihan utama dokumen perencanaan pembelajaran...",
    "perbaikan": "Aspek yang memerlukan penguatan atau penyempurnaan...",
    "rekomendasi": "Rekomendasi tindak lanjut pembinaan pengawas..."
  }
}`;
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });
      } catch (primaryErr) {
        console.warn("Primary model gemini-3.8-flash error, trying gemini-flash-latest:", primaryErr.message);
        try {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.3
            }
          });
        } catch (secondaryErr) {
          console.warn("Secondary model error, trying gemini-3.1-flash-lite:", secondaryErr.message);
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.3
            }
          });
        }
      }
      const responseText = response.text || "";
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          success: true,
          data: parsed
        });
      } catch (parseErr) {
        return res.json({
          success: false,
          fallbackRequired: true,
          raw: responseText
        });
      }
    } catch (err) {
      console.error("Error analyzing RPP with AI:", err);
      return res.status(200).json({
        success: false,
        fallbackRequired: true,
        error: err.message
      });
    }
  });
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path2.resolve(__dirname2, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path2.resolve(__dirname2, "dist", "index.html"));
    });
  }
  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT} (mode: ${isProd ? "production" : "development"})`);
  });
  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
startServer();
