import { TelaahItem, ObservasiItemDef } from '../types';

export const TELAAH_ITEMS: TelaahItem[] = [
  {
    id: 1,
    category: 'Identitas RPP',
    aspect: 'Terdapat Satuan Pendidikan, Mata Pelajaran, Fase/Kelas, Materi Pokok, Alokasi Waktu yang jelas dan lengkap.',
  },
  {
    id: 2,
    category: 'Identifikasi (Opsional)',
    aspect: 'Murid (Opsional): Identifikasi kesiapan murid sebelum belajar, seperti pengetahuan awal, minat, latar belakang, dan kebutuhan belajar.',
    isOptional: true,
  },
  {
    id: 3,
    category: 'Identifikasi (Opsional)',
    aspect: 'Materi Pelajaran (Opsional): Menuliskan analisis materi pelajaran seperti jenis pengetahuan yang akan dicapai, relevansi nyata, tingkat kesulitan, struktur materi, nilai & karakter.',
    isOptional: true,
  },
  {
    id: 4,
    category: 'Dimensi Profil Lulusan',
    aspect: 'Terdapat Dimensi Profil Lulusan yang akan dicapai dalam pembelajaran, ditentukan selaras dengan tujuan dan kegiatan yang dilakukan.',
  },
  {
    id: 5,
    category: 'Keselarasan',
    aspect: 'Tujuan pembelajaran, langkah pembelajaran, dan asesmen pembelajaran sudah mengarah pada pencapaian Dimensi Profil Lulusan.',
  },
  {
    id: 6,
    category: 'Keselarasan',
    aspect: 'Tujuan pembelajaran, langkah pembelajaran, dan asesmen pembelajaran sudah selaras (saling terhubung secara utuh).',
  },
  {
    id: 7,
    category: 'Desain Pembelajaran',
    aspect: 'Tujuan Pembelajaran: Menuliskan tujuan pembelajaran yang mencakup kompetensi dan konten pada ruang lingkup materi dengan menggunakan kata kerja operasional yang relevan.',
  },
  {
    id: 8,
    category: 'Desain Pembelajaran',
    aspect: 'Praktik Pedagogis: Menuliskan Model/Strategi/Metode/Media/Sumber pembelajaran yang dipilih untuk mencapai tujuan belajar.',
  },
  {
    id: 9,
    category: 'Desain Pembelajaran',
    aspect: 'Lingkungan Pembelajaran: Menuliskan lingkungan pembelajaran yang ingin dikembangkan dalam budaya belajar, ruang fisik dan/atau ruang virtual tergambar pada langkah/asesmen.',
  },
  {
    id: 10,
    category: 'Desain Pembelajaran',
    aspect: 'Kemitraan Pembelajaran (Opsional): Menuliskan kegiatan kemitraan atau kolaborasi dalam dan/atau luar lingkup sekolah tergambar pada langkah dan/atau asesmen.',
    isOptional: true,
  },
  {
    id: 11,
    category: 'Desain Pembelajaran',
    aspect: 'Pemanfaatan Digital (Opsional): Menuliskan pemanfaatan teknologi digital untuk menciptakan pembelajaran interaktif, kolaboratif, kontekstual tergambar pada langkah/asesmen.',
    isOptional: true,
  },
  {
    id: 12,
    category: 'Pengalaman Belajar',
    aspect: 'Langkah memfasilitasi murid merasakan pengalaman belajar MEMAHAMI (terlibat aktif mengonstruksi pengetahuan mendalam konsep/materi dari berbagai sumber/konteks: menghubungkan pengetahuan baru, stimulasi berpikir, konteks nyata, eksploratif-kolaboratif, moral-etika, karakter).',
  },
  {
    id: 13,
    category: 'Pengalaman Belajar',
    aspect: 'Langkah memfasilitasi murid merasakan pengalaman belajar MENGAPLIKASI (mengaplikasikan pemahaman secara kontekstual dalam kehidupan nyata: menghubungkan konsep baru, penerapan situasi nyata, eksplorasi lanjut, berpikir kritis & mencari solusi inovatif).',
  },
  {
    id: 14,
    category: 'Pengalaman Belajar',
    aspect: 'Langkah memfasilitasi murid merasakan pengalaman belajar MEREFLEKSI (evaluasi & memaknai proses/hasil, tindak lanjut, kelola belajar mandiri: motivasi cara belajar, evaluasi diri, strategi berpikir, metakognisi, regulasi emosi).',
  },
  {
    id: 15,
    category: 'Pengalaman Belajar',
    aspect: 'Langkah memfasilitasi tindakan saling MEMULIAKAN antara Guru-Murid, Murid-Guru, Murid-Murid tercermin dalam bahasa verbal/nonverbal (menghargai keberagaman, budaya saling menghormati, adaptif inklusif).',
  },
  {
    id: 16,
    category: 'Pengalaman Belajar',
    aspect: 'Prinsip pembelajaran mendalam berupa berkesadaran, bermakna, dan/atau menggembirakan sudah tergambar pada setiap pengalaman belajar di langkah pembelajaran.',
  },
  {
    id: 17,
    category: 'Pengalaman Belajar',
    aspect: 'Perencanaan pembelajaran sudah mengakomodir pengalaman belajar yang sesuai dengan karakteristik peserta didik.',
  },
  {
    id: 18,
    category: 'Asesmen',
    aspect: 'Asesmen awal pembelajaran dilaksanakan untuk mendapatkan bukti kesiapan belajar emosional/mental, pengetahuan awal, kebutuhan belajar serta tindak lanjut hasil asesmen awal.',
  },
  {
    id: 19,
    category: 'Asesmen',
    aspect: 'Asesmen proses (formatif) dilaksanakan sesuai perencanaan memantau perkembangan belajar murid, umpan balik kontinyu timbal-balik melalui beragam teknik.',
  },
  {
    id: 20,
    category: 'Asesmen',
    aspect: 'Asesmen hasil pembelajaran (sumatif) direncanakan mengukur ketercapaian kompetensi dengan beragam cara (tes, portofolio, proyek, presentasi, dsb).',
  },
  {
    id: 21,
    category: 'Lampiran',
    aspect: 'Rubrik Penilaian: Terdapat kriteria ketercapaian tujuan pembelajaran (KKTP) dari masing-masing tujuan pembelajaran yang dinilai secara transparan.',
  },
  {
    id: 22,
    category: 'Lampiran',
    aspect: 'Lembar Kerja Murid (LKM/LKPD): Lembar kerja murid selaras dengan tujuan pembelajaran dan alur kegiatan pembelajaran.',
  },
];

export const OBSERVASI_ITEMS: ObservasiItemDef[] = [
  // 1. Kegiatan Pendahuluan (3 items)
  {
    id: 'pendahuluan_1',
    category: '1. Kegiatan Pendahuluan',
    aspect: 'Menyiapkan peserta didik secara psikis dan fisik untuk mengikuti proses pembelajaran (berdoa, presensi, kesepakatan kelas, ice breaking/apersepsi).',
  },
  {
    id: 'pendahuluan_2',
    category: '1. Kegiatan Pendahuluan',
    aspect: 'Memberi motivasi belajar peserta didik secara kontekstual sesuai manfaat materi dalam kehidupan nyata.',
  },
  {
    id: 'pendahuluan_3',
    category: '1. Kegiatan Pendahuluan',
    aspect: 'Menyampaikan tujuan pembelajaran, cakupan materi, langkah kegiatan, dan teknik penilaian yang akan dilakukan.',
  },

  // 2. Kegiatan Inti - Penguasaan & Pengelolaan (4 items)
  {
    id: 'inti_penguasaan_1',
    category: '2. Kegiatan Inti - Penguasaan & Pengelolaan',
    aspect: 'Menunjukkan penguasaan materi pembelajaran secara mendalam, akurat, dan runtut sesuai disiplin ilmu.',
  },
  {
    id: 'inti_penguasaan_2',
    category: '2. Kegiatan Inti - Penguasaan & Pengelolaan',
    aspect: 'Mengaitkan materi pembelajaran dengan pengetahuan lain yang relevan, sains, teknologi, dan kehidupan nyata murid.',
  },
  {
    id: 'inti_penguasaan_3',
    category: '2. Kegiatan Inti - Penguasaan & Pengelolaan',
    aspect: 'Melaksanakan pembelajaran sesuai dengan alokasi waktu yang direncanakan dan alur sintaks model yang dipilih.',
  },
  {
    id: 'inti_penguasaan_4',
    category: '2. Kegiatan Inti - Penguasaan & Pengelolaan',
    aspect: 'Mengelola kelas secara kondusif, dinamis, aman, inklusif, dan membangun suasana saling memuliakan.',
  },

  // 3. Pelibatan Peserta (3 items)
  {
    id: 'pelibatan_1',
    category: '3. Pelibatan Peserta Didik',
    aspect: 'Menumbuhkan partisipasi aktif dan antusiasme peserta didik melalui kegiatan eksplorasi, tanya jawab, atau diskusi.',
  },
  {
    id: 'pelibatan_2',
    category: '3. Pelibatan Peserta Didik',
    aspect: 'Merespons pertanyaan, gagasan, atau kesulitan peserta didik secara positif, konstruktif, dan merata.',
  },
  {
    id: 'pelibatan_3',
    category: '3. Pelibatan Peserta Didik',
    aspect: 'Memfasilitasi kerja sama antarmurid dalam kelompok secara berkeadilan tanpa diskriminasi.',
  },

  // 4. Integrasi Saintifik (5M), HOTS, 4C, Dimensi Pengetahuan (4 items)
  {
    id: 'integrasi_1',
    category: '4. Integrasi HOTS, 4C & Pendekatan Mendalam',
    aspect: 'Memfasilitasi keterampilan abad 21 (4C: Berpikir Kritis, Kreatif, Kolaborasi, Komunikasi) dalam aktivitas belajar.',
  },
  {
    id: 'integrasi_2',
    category: '4. Integrasi HOTS, 4C & Pendekatan Mendalam',
    aspect: 'Mendorong peserta didik memecahkan masalah kontekstual berbasis Higher Order Thinking Skills (HOTS).',
  },
  {
    id: 'integrasi_3',
    category: '4. Integrasi HOTS, 4C & Pendekatan Mendalam',
    aspect: 'Mengintegrasikan tahapan mengamati, menanya, mencoba/menalar, dan mengomunikasikan (Saintifik / 5M).',
  },
  {
    id: 'integrasi_4',
    category: '4. Integrasi HOTS, 4C & Pendekatan Mendalam',
    aspect: 'Menyentuh dimensi pengetahuan faktual, konseptual, prosedural, hingga metakognitif.',
  },

  // 5. Pemanfaatan Media/Sumber Belajar (3 items)
  {
    id: 'media_1',
    category: '5. Pemanfaatan Media & Sumber Belajar',
    aspect: 'Menunjukkan keterampilan pemanfaatan media/alat bantu visual, audio, atau multimedia digital secara efektif.',
  },
  {
    id: 'media_2',
    category: '5. Pemanfaatan Media & Sumber Belajar',
    aspect: 'Memanfaatkan sumber belajar beragam (buku teks, internet, lingkungan sekitar, artefak nyata).',
  },
  {
    id: 'media_3',
    category: '5. Pemanfaatan Media & Sumber Belajar',
    aspect: 'Melibatkan peserta didik secara langsung dalam eksplorasi penggunaan media dan bahan ajar.',
  },

  // 6. Pelaksanaan Penilaian (3 items)
  {
    id: 'penilaian_1',
    category: '6. Pelaksanaan Penilaian Proses & Hasil',
    aspect: 'Melakukan pemantauan dan asesmen formatif selama proses pembelajaran berlangsung untuk memantau kemajuan.',
  },
  {
    id: 'penilaian_2',
    category: '6. Pelaksanaan Penilaian Proses & Hasil',
    aspect: 'Memberikan umpan balik (feedback) langsung yang spesifik, memotivasi, dan konstruktif kepada murid.',
  },
  {
    id: 'penilaian_3',
    category: '6. Pelaksanaan Penilaian Proses & Hasil',
    aspect: 'Melakukan penilaian akhir/sumatif atau refleksi ketercapaian tujuan pembelajaran menggunakan instrumen yang tepat.',
  },

  // 7. Penggunaan Bahasa (2 items)
  {
    id: 'bahasa_1',
    category: '7. Penggunaan Bahasa & Komunikasi',
    aspect: 'Menggunakan bahasa Indonesia yang baik, benar, santun, lugas, dan mudah dipahami oleh murid.',
  },
  {
    id: 'bahasa_2',
    category: '7. Penggunaan Bahasa & Komunikasi',
    aspect: 'Menyampaikan intonasi suara, artikulasi, dan gerak tubuh (bahasa nonverbal) yang mendukung rasa nyaman dan hormat.',
  },

  // 8. Kegiatan Penutup (2 items)
  {
    id: 'penutup_1',
    category: '8. Kegiatan Penutup',
    aspect: 'Memfasilitasi peserta didik membuat rangkuman/kesimpulan dan melakukan refleksi mendalam terhadap kegiatan hari ini.',
  },
  {
    id: 'penutup_2',
    category: '8. Kegiatan Penutup',
    aspect: 'Menyampaikan tindak lanjut (remedial/pengayaan/tugas) dan informasi agenda pembelajaran pertemuan berikutnya, ditutup salam/doa.',
  },
];

export const PRA_OBSERVASI_QUESTIONS = [
  { id: 'q1', label: '1. KD / Capaian Pembelajaran (CP) dan Indikator / Tujuan Pembelajaran (TP) apa yang akan disajikan?' },
  { id: 'q2', label: '2. Metode pembelajaran apa yang Bapak/Ibu pilih untuk menyajikan materi ini, dan apa alasannya?' },
  { id: 'q3', label: '3. Alat, bahan, dan sumber belajar apa saja yang disiapkan, dan apa alasannya?' },
  { id: 'q4', label: '4. Bagaimana tahapan atau langkah-langkah pembelajaran yang direncanakan dari awal hingga akhir?' },
  { id: 'q5', label: '5. Persiapan tertulis apa saja yang telah Bapak/Ibu buat (Modul Ajar/RPP, LKPD, Instrumen Penilaian)?' },
  { id: 'q6', label: '6. Materi bagian mana yang diperkirakan akan sulit dipahami oleh siswa, dan apa antisipasi Bapak/Ibu?' },
  { id: 'q7', label: '7. Target kompetensi atau karakter (Profil Pelajar) apa yang paling diharapkan tercapai pada sesi ini?' },
  { id: 'q8', label: '8. Aspek atau fokus perhatian khusus apa yang Bapak/Ibu harapkan untuk diamati secara mendalam oleh Supervisor?' },
];

export const PASCA_OBSERVASI_QUESTIONS = [
  { id: 'q1', label: '1. Bagaimana kesan Bapak/Ibu setelah menyajikan materi pelajaran pada kelas tadi?' },
  { id: 'q2', label: '2. Apakah proses pelaksanaan pembelajaran tadi sudah sesuai dengan yang direncanakan dalam modul/RPP?' },
  { id: 'q3', label: '3. Hal-hal positif atau memuaskan apa yang Bapak/Ibu rasakan selama proses pembelajaran tadi?' },
  { id: 'q4', label: '4. Hal-hal apa yang dirasa masih kurang optimal atau perlu perbaikan ke depan?' },
  { id: 'q5', label: '5. Menurut perkiraan Bapak/Ibu, sejauh mana ketercapaian tujuan pembelajaran peserta didik hari ini?' },
  { id: 'q6', label: '6. Kesulitan atau hambatan apa yang dialami siswa saat mengikuti kegiatan pembelajaran tadi?' },
  { id: 'q7', label: '7. Alternatif solusi apa yang telah atau akan diambil untuk mengatasi kesulitan belajar siswa tersebut?' },
  { id: 'q8', label: '8. Apa rencana tindak lanjut (RTL) Bapak/Ibu untuk pertemuan kelas selanjutnya?' },
  { id: 'q9', label: '9. Identifikasi kebutuhan peningkatan kompetensi atau pengembangan diri apa yang Bapak/Ibu perlukan?' },
];

export const EVALUASI_TAHUNAN_COMPONENTS = [
  {
    key: 'hasilBelajar',
    title: '1. Komponen Hasil Belajar Murid',
    desc: 'Ketuntasan tujuan pembelajaran, capaian asesmen sumatif, portofolio hasil karya murid, dan peningkatan prestasi akademik/non-akademik.',
    evidencePlaceholder: 'Contoh bukti: Leger nilai sumatif, portofolio projek murid, data ketuntasan capaian pembelajaran...',
  },
  {
    key: 'administrasi',
    title: '2. Komponen Administrasi & Perangkat Ajar',
    desc: 'Kelengkapan dan ketertiban dokumen CP, TP, ATP, Modul Ajar/RPP, Program Tahunan (Prota), Program Semester (Promes), Jurnal Mengajar, dan Daftar Hadir.',
    evidencePlaceholder: 'Contoh bukti: Dokumen lengkap perangkat ajar terverifikasi kepala sekolah, buku agenda guru...',
  },
  {
    key: 'pengembanganDiri',
    title: '3. Komponen Pengembangan Keprofesian Berkelanjutan (PKB)',
    desc: 'Keikutsertaan dalam pelatihan mandiri PMM, komunitas belajar (Kombel) sekolah, MGMP, webinar pendidikan, serta pembuatan karya inovasi pembelajaran.',
    evidencePlaceholder: 'Contoh bukti: Sertifikat aksi nyata PMM, sertifikat pelatihan MGMP, laporan karya ilmiah/inovatif...',
  },
  {
    key: 'kedisiplinan',
    title: '4. Komponen Kedisiplinan & Etika Profesi',
    desc: 'Ketepatan kehadiran di kelas, kepatuhan jam kerja, keteladanan sikap, hubungan kolegial dengan rekan sejawat, dan dedikasi kepada murid.',
    evidencePlaceholder: 'Contoh bukti: Rekapitulasi absensi finger/digital, catatan pembinaan guru, umpan balik rekan sejawat...',
  },
  {
    key: 'rekomendasi',
    title: '5. Rekomendasi & Tindak Lanjut Tahunan',
    desc: 'Penetapan rekomendasi kenaikan pangkat, pemenuhan beban jam mengajar, usulan penugasan khusus, dan peta jalan pembinaan tahun berikutnya.',
    evidencePlaceholder: 'Catatan tindak lanjut supervisi pengawas dan kepala sekolah...',
  },
];
