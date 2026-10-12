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
  // 1. PROFIL LULUSAN (2 butir)
  {
    id: '1',
    category: 'PROFIL LULUSAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan tujuan pembelajaran yang mencakup sikap, pengetahuan, dan keterampilan, serta terlihat dalam aktivitas yang membangun karakter dan kompetensi murid.',
  },
  {
    id: '2',
    category: 'PROFIL LULUSAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya kegiatan penilaian yang digunakan untuk melihat ketercapaian profil lulusan serta selaras dengan tujuan pembelajaran.',
  },

  // 2. PRINSIP PEMBELAJARAN (3 butir)
  {
    id: '3',
    category: 'PRINSIP PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan alur kegiatan yang jelas, terstruktur, dan mampu menjaga fokus serta keterlibatan murid sepanjang pembelajaran.',
  },
  {
    id: '4',
    category: 'PRINSIP PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan keterkaitan materi dan aktivitas dengan kehidupan nyata atau pengalaman murid.',
  },
  {
    id: '5',
    category: 'PRINSIP PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan aktivitas yang menarik, menantang, dan mampu memotivasi serta menggembirakan murid.',
  },

  // 3. PENGALAMAN BELAJAR (3 butir)
  {
    id: '6',
    category: 'PENGALAMAN BELAJAR',
    aspect: 'Pelaksanaan pembelajaran menunjukkan keterlibatan aktif murid dalam memahami materi melalui kegiatan mengamati, bertanya, berdiskusi, atau menggali informasi dari berbagai sumber.',
  },
  {
    id: '7',
    category: 'PENGALAMAN BELAJAR',
    aspect: 'Pelaksanaan pembelajaran menunjukkan kegiatan yang mendorong murid menerapkan pengetahuan dalam situasi nyata atau kontekstual.',
  },
  {
    id: '8',
    category: 'PENGALAMAN BELAJAR',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya kegiatan refleksi, di mana murid menilai proses dan hasil belajar serta merencanakan perbaikan.',
  },

  // 4. KERANGKA PEMBELAJARAN (4 butir)
  {
    id: '9',
    category: 'KERANGKA PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan penggunaan strategi/metode pembelajaran yang jelas dan sesuai dengan tujuan.',
  },
  {
    id: '10',
    category: 'KERANGKA PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya interaksi dan kerja sama antara guru dengan murid maupun antar murid.',
  },
  {
    id: '11',
    category: 'KERANGKA PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan suasana kelas yang aman, nyaman, tertib, dan mendukung proses belajar.',
  },
  {
    id: '12',
    category: 'KERANGKA PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan penggunaan media atau teknologi/digital yang relevan untuk mendukung pembelajaran.',
  },

  // 5. BUDAYA BELAJAR MURID (3 butir)
  {
    id: '13',
    category: 'BUDAYA BELAJAR MURID',
    aspect: 'Pelaksanaan pembelajaran menunjukkan sikap saling menghargai, menghormati, dan memuliakan antar murid dalam interaksi belajar.',
  },
  {
    id: '14',
    category: 'BUDAYA BELAJAR MURID',
    aspect: 'Pelaksanaan pembelajaran menunjukkan murid memahami tujuan pembelajaran dan mengaitkan materi dengan pengalaman sebelumnya.',
  },
  {
    id: '15',
    category: 'BUDAYA BELAJAR MURID',
    aspect: 'Pelaksanaan pembelajaran menunjukkan murid memiliki kesempatan memilih cara belajar, percaya diri, dan melakukan refleksi diri.',
  },

  // 6. CAPAIAN BELAJAR MURID (2 butir)
  {
    id: '16',
    category: 'CAPAIAN BELAJAR MURID',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya ketercapaian tujuan pembelajaran sesuai dengan kemampuan dan perkembangan murid.',
  },
  {
    id: '17',
    category: 'CAPAIAN BELAJAR MURID',
    aspect: 'Pelaksanaan pembelajaran menunjukkan murid belajar secara mandiri melalui aktivitas yang relevan dengan kehidupan sehari-hari.',
  },

  // 7. MENGAJAR SECARA EFEKTIF (3 butir)
  {
    id: '18',
    category: 'MENGAJAR SECARA EFEKTIF',
    aspect: 'Pelaksanaan pembelajaran menunjukkan guru menghargai perbedaan kemampuan, latar belakang, dan kebutuhan belajar murid.',
  },
  {
    id: '19',
    category: 'MENGAJAR SECARA EFEKTIF',
    aspect: 'Pelaksanaan pembelajaran menunjukkan pengelolaan kelas yang efektif, pembelajaran yang kontekstual, dan keterpaduan antar kegiatan.',
  },
  {
    id: '20',
    category: 'MENGAJAR SECARA EFEKTIF',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya kegiatan refleksi di akhir pembelajaran yang mengacu pada hasil belajar murid.',
  },

  // 8. ASESMEN OTENTIK DAN BERKEADILAN (3 butir)
  {
    id: '21',
    category: 'ASESMEN OTENTIK DAN BERKEADILAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan guru melakukan penilaian selama proses belajar (formatif) dan memberikan umpan balik kepada murid.',
  },
  {
    id: '22',
    category: 'ASESMEN OTENTIK DAN BERKEADILAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya penilaian akhir untuk mengetahui ketercapaian tujuan pembelajaran.',
  },
  {
    id: '23',
    category: 'ASESMEN OTENTIK DAN BERKEADILAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan guru menggunakan hasil penilaian untuk memperbaiki pembelajaran atau memberikan tindak lanjut.',
  },

  // 9. KEPEMIMPINAN PEMBELAJARAN (2 butir)
  {
    id: '24',
    category: 'KEPEMIMPINAN PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan arah pembelajaran yang sejalan dengan visi sekolah dan berpusat pada murid.',
  },
  {
    id: '25',
    category: 'KEPEMIMPINAN PEMBELAJARAN',
    aspect: 'Pelaksanaan pembelajaran menunjukkan adanya upaya perbaikan pembelajaran secara berkelanjutan melalui refleksi.',
  },
];

export const PRA_OBSERVASI_QUESTIONS = [
  { 
    id: 'q1', 
    label: '1. Tujuan pembelajaran apa yang akan Saudara sajikan? Bagaimana tujuan tersebut akan dipahami murid dan diwujudkan dalam pengalaman belajar mereka?' 
  },
  { 
    id: 'q2', 
    label: '2. Strategi atau praktik pedagogis apa yang akan Saudara gunakan? Mengapa strategi tersebut dipilih sesuai tujuan dan kebutuhan belajar murid?' 
  },
  { 
    id: 'q3', 
    label: '3. Sumber belajar, media, atau teknologi apa yang akan Saudara gunakan? Bagaimana penggunaannya membantu murid memahami dan mengaplikasikan pengetahuan?' 
  },
  { 
    id: 'q4', 
    label: '4. Bagaimana tahapan pembelajaran yang akan Saudara sajikan untuk memberikan pengalaman memahami, mengaplikasi, dan merefleksi?' 
  },
  { 
    id: 'q5', 
    label: '5. Bagaimana Saudara merancang pembelajaran agar berlangsung secara berkesadaran, bermakna, dan menggembirakan bagi murid?' 
  },
  { 
    id: 'q6', 
    label: '6. Bagian atau materi apa yang diperkirakan sulit bagi murid? Bagaimana Saudara mengantisipasi perbedaan kemampuan, kebutuhan, dan karakteristik murid?' 
  },
  { 
    id: 'q7', 
    label: '7. Kompetensi dan karakter apa yang diharapkan berkembang pada murid setelah mengikuti pembelajaran?' 
  },
  { 
    id: 'q8', 
    label: '8. Hal apa yang secara khusus perlu diperhatikan dalam pembelajaran ini agar murid aktif, terlibat, dan memperoleh pengalaman belajar yang bermakna?' 
  },
];

export const KESIMPULAN_SELIDIKI_INDIKATOR = [
  { id: 1, label: 'Guru berorientasi pada pengalaman belajar murid', key: 'peranGuru' },
  { id: 2, label: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan', key: 'aktivitasMurid' },
  { id: 3, label: 'Pembelajaran terhubung dengan konteks nyata', key: 'konteksNyata' },
  { id: 4, label: 'Pembelajaran membiasakan murid melakukan refleksi', key: 'refleksiMurid' },
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

/**
 * Instrumen Resmi MAKNAI: COACHING DAN REFLEKSI PASCA OBSERVASI
 * Sesuai Dokumen PDF Pengawas Pembina (10 Pertanyaan + Kesan umum & Saran-Masukan)
 */
export const MAKNAI_COACHING_QUESTIONS = [
  {
    id: 'q1',
    no: 1,
    pertanyaan: 'Bagaimana kesan Saudara setelah menyajikan pembelajaran ini, terutama terkait keterlibatan dan antusiasme murid?'
  },
  {
    id: 'q2',
    no: 2,
    pertanyaan: 'Apakah proses pembelajaran sudah sesuai dengan yang direncanakan? Pada bagian mana dari pengalaman memahami, mengaplikasi, dan merefleksi pembelajaran berjalan sesuai rencana, dan bagian mana yang berubah?'
  },
  {
    id: 'q3',
    no: 3,
    pertanyaan: 'Dapatkah Saudara menceritakan hal-hal yang dirasakan memuaskan, misalnya saat murid terlihat aktif, menemukan makna, dan senang belajar?'
  },
  {
    id: 'q4',
    no: 4,
    pertanyaan: 'Bagaimana perkiraan Saudara mengenai ketercapaian tujuan pembelajaran, dan bukti apa dari penilaian selama proses belajar yang mendukung perkiraan tersebut?'
  },
  {
    id: 'q5',
    no: 5,
    pertanyaan: 'Apa yang menjadi kesulitan murid? Bagaimana Saudara menanggapi perbedaan kemampuan dan kebutuhan belajar mereka selama pembelajaran?'
  },
  {
    id: 'q6',
    no: 6,
    pertanyaan: 'Bagaimana murid menilai proses dan hasil belajarnya sendiri melalui refleksi, dan umpan balik apa yang Saudara berikan kepada mereka?'
  },
  {
    id: 'q7',
    no: 7,
    pertanyaan: 'Apa yang menjadi kesulitan Saudara dalam melaksanakan pembelajaran ini?'
  },
  {
    id: 'q8',
    no: 8,
    pertanyaan: 'Adakah alternatif lain untuk mengatasi kesulitan Saudara?'
  },
  {
    id: 'q9',
    no: 9,
    pertanyaan: 'Marilah bersama-sama kita identifikasi hal-hal yang telah mantap dan hal-hal yang perlu ditingkatkan, berdasarkan kegiatan yang baru saja Saudara lakukan dan hasil pengamatan pada instrumen observasi, terutama butir yang masih bernilai 0 atau 1.'
  },
  {
    id: 'q10',
    no: 10,
    pertanyaan: 'Dengan demikian, apa yang akan Saudara lakukan pada pertemuan berikutnya untuk memperkuat praktik Pembelajaran Mendalam?'
  }
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
