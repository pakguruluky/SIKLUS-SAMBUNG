import { SambungData, SambungDataDampakItem } from '../types';

export const ASPEK_SELIDIKI_DEFAULT = [
  'Tujuan dan kesadaran murid tentang belajar',
  'Konteks kehidupan nyata',
  'Aktivitas memahami dan mengaplikasikan',
  'Aktivitas merefleksikan dan menghubungkan',
  'Suasana menggembirakan',
  'Asesmen dan tindak lanjut',
];

export const INDIKATOR_U1_DEFAULT = [
  { id: 1, indikator: 'Murid memahami tujuan dan manfaat pembelajaran', dimensi: 'Berkesadaran' },
  { id: 2, indikator: 'Murid menyadari proses dan kemajuan belajarnya', dimensi: 'Berkesadaran' },
  { id: 3, indikator: 'Pembelajaran dikaitkan dengan pengalaman murid', dimensi: 'Bermakna' },
  { id: 4, indikator: 'Guru memakai konteks kehidupan nyata yang relevan', dimensi: 'Bermakna' },
  { id: 5, indikator: 'Suasana aman, positif; murid antusias dan berani mencoba', dimensi: 'Menggembirakan' },
  { id: 6, indikator: 'Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri', dimensi: 'Memahami' },
  { id: 7, indikator: 'Murid menerapkan pengetahuan pada tugas/masalah nyata', dimensi: 'Mengaplikasikan' },
  { id: 8, indikator: 'Murid diberi waktu merefleksikan dan memakai umpan balik', dimensi: 'Merefleksikan' },
  { id: 9, indikator: 'Murid menghubungkan pengetahuan dengan kehidupan nyata', dimensi: 'Menghubungkan' },
  { id: 10, indikator: 'Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut', dimensi: 'Asesmen & tindak lanjut' },
];

export const PERNYATAAN_U2_DEFAULT = [
  'Saya memahami tujuan dan manfaat pelajaran ini.',
  'Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.',
  'Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.',
  'Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.',
  'Saya merasa aman, senang, dan bersemangat selama pelajaran.',
];

export const BEFORE_AFTER_ASPEK_DEFAULT = [
  'Peran guru',
  'Aktivitas murid',
  'Konteks kehidupan nyata',
  'Refleksi murid',
];

export const DEFAULT_MATRIKS_BEFORE = {
  peranGuru: 'Berfokus pada penyampaian materi (transfer pengetahuan satu arah secara klasikal/ceramah).',
  aktivitasMurid: 'Lebih banyak menerima secara pasif, mendengarkan, mencatat penjelasan, dan minim inisiatif mandiri.',
  konteksNyata: 'Belum konsisten dikaitkan dengan kehidupan nyata; materi diajarkan sebatas konsep buku teks teoretis.',
  refleksiMurid: 'Belum rutin dilaksanakan; pembelajaran berakhir tanpa penarikan makna atau evaluasi diri murid.',
};

export const DEFAULT_MATRIKS_AFTER = {
  peranGuru: 'Merancang dan memfasilitasi pengalaman belajar murid, berperan sebagai coach dan pemandu inkuiri.',
  aktivitasMurid: 'Lebih aktif mengaplikasikan pengetahuan melalui studi kasus, penyelidikan kelompok, dan unjuk kerja.',
  konteksNyata: 'Mulai dirancang secara terstruktur dan terhubung langsung dengan fenomena serta konteks nyata murid.',
  refleksiMurid: 'Mulai menjadi bagian rutin pembelajaran; murid mengevaluasi proses pemahaman dan metakognisinya.',
};

export const DEFAULT_DATA_DAMPAK = [
  {
    indikator: 'Guru berorientasi pada pengalaman belajar murid',
    awal: '45%',
    akhir: '78%',
    makna: 'Proporsi guru yang menunjukkan praktik pembelajaran berpusat pada murid meningkat pesat.',
    deskripsiPenilaian: 'Guru bertransformasi dari metode ceramah instruksional menjadi fasilitator pengalaman belajar murid melalui panduan inkuiri dan pemecahan masalah nyata.',
    buktiKegiatan: 'Modul Ajar Pembelajaran Aktif, Lembar Telaah Pengawas',
  },
  {
    indikator: 'Murid aktif mengaplikasikan pengetahuan',
    awal: '45%',
    akhir: '89%',
    makna: 'Peserta didik aktif berkolaborasi, bereksperimen, dan memecahkan tantangan studi kasus.',
    deskripsiPenilaian: 'Keterlibatan murid di kelas meningkat drastis; murid tidak hanya mencatat melainkan mempraktikkan langsung konsep materi dalam kelompok kerja.',
    buktiKegiatan: 'LKPD Kolaboratif, Lembar Observasi Keterlibatan Murid',
  },
  {
    indikator: 'Pembelajaran terhubung dengan konteks nyata',
    awal: '56%',
    akhir: '89%',
    makna: 'Materi pembelajaran dikaitkan secara eksplisit dengan fenomena kehidupan sehari-hari.',
    deskripsiPenilaian: 'Guru menyajikan apersepsi kontekstual dan studi kasus kehidupan nyata sekitar sekolah/kota, menumbuhkan relevansi belajar yang tinggi bagi murid.',
    buktiKegiatan: 'Bahan Ajar Berbasis Masalah Riil, Dokumentasi Diskusi',
  },
  {
    indikator: 'Murid melakukan refleksi',
    awal: '33%',
    akhir: '78%',
    makna: 'Rutinitas metakognitif dan evaluasi diri murid terlaksana secara terstruktur di akhir sesi.',
    deskripsiPenilaian: 'Murid secara konsisten dibimbing mengisi instrumen refleksi diri untuk mengidentifikasi keberhasilan, kesulitan, dan makna pembelajaran bagi kehidupannya.',
    buktiKegiatan: 'Jurnal Refleksi Murid, Angket Suara Murid (U2)',
  },
];

/**
 * Menghasilkan informasi data dampak deskriptif spesifik untuk masing-masing guru binaan
 * yang selaras dengan mata pelajaran, materi, skor telaah modul ajar, dan observasi kelasnya.
 */
export function getTeacherDescriptiveDataDampak(
  teacherName: string,
  subject: string = '',
  schoolName: string = '',
  lessonTitle: string = '',
  telaahPred: string = '',
  obsPred: string = ''
): SambungDataDampakItem[] {
  const name = teacherName.toLowerCase();

  // 1. SMAN 4 BOGOR: Sondang Asih Januarti, S.Pd. (Fisika) [SB, SB]
  if (name.includes('sondang')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '45%',
        akhir: '94%',
        selisih: '+49%',
        makna: 'Pergeseran paradigma mengajar dari ceramah klasikal menuju fasilitasi inkuiri laboratorium berbantuan simulasi.',
        deskripsiPenilaian: 'Berdasarkan hasil supervisi telaah modul (skor 97.7 / Sangat Baik) dan observasi kelas tatap muka (skor 100.0 / Sangat Baik), Ibu Sondang berhasil mengubah dominasi ceramah klasikal menjadi pendampingan inkuiri aktif. Guru memfasilitasi penyelidikan Hukum Kirchhoff berbantuan simulator interaktif PhET dan kit sirkuit tertutup, memberikan scaffolding diferensiasi terarah bagi setiap kelompok murid.',
        buktiKegiatan: 'Modul Ajar Termodinamika & Kelistrikan, Lembar Telaah Pengawas No. 1-22, Foto Praktikum PhET',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '40%',
        akhir: '95%',
        selisih: '+55%',
        makna: 'Kemandirian murid dalam menguji hukum fisika dan menganalisis data rangkaian secara saintifik.',
        deskripsiPenilaian: 'Hasil observasi kelas mencatat seluruh kelompok (100% murid) terampil merakit rangkaian tertutup, mengukur kuat arus dan tegangan secara empiris, serta memvalidasi kesesuaian hukum Kirchhoff tanpa bergantung pada instruksi kaku guru. Murid berani berargumen ilmiah saat mempresentasikan temuan.',
        buktiKegiatan: 'LKPD Penyelidikan Sirkuit DC, Lembar Ceklis Unjuk Kerja Murid, Video Presentasi Kelompok',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '50%',
        akhir: '95%',
        selisih: '+45%',
        makna: 'Keterhubungan konsep hambatan dan arus listrik dengan instalasi dan efisiensi energi rumah tangga.',
        deskripsiPenilaian: 'Sesuai rubrik telaah kontekstual kurikulum, guru secara cerdas mengaitkan analisis hambatan listrik dengan sistem proteksi sekring rumah tinggal, pencegahan korsleting listrik di pemukiman padat Bogor, dan pemanfaatan panel surya ramah lingkungan di lingkungan sekolah.',
        buktiKegiatan: 'Bahan Tayang Studi Kasus Kelistrikan Rumah Tangga SMAN 4, Kliping Kasus Korsleting',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '30%',
        akhir: '88%',
        selisih: '+58%',
        makna: 'Rutinitas refleksi metakognitif terstruktur di setiap penutupan pembelajaran fisika.',
        deskripsiPenilaian: 'Berdasarkan instrumen U2 (suara murid), 88% murid secara konsisten mengisi lembar refleksi digital di akhir sesi. Murid mengidentifikasi konsep yang sudah dipahami, tantangan menghitung hambatan pengganti, dan merumuskan komitmen hemat daya listrik di rumah masing-masing.',
        buktiKegiatan: 'Google Form Exit Ticket Refleksi & Rekap Tanggapan Angket U2 Suara Murid',
      },
    ];
  }

  // 2. SMAN 4 BOGOR: Hilmia Fitriyani, S.Pd. (Ekonomi) [B, SB]
  if (name.includes('hilmia')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '42%',
        akhir: '88%',
        selisih: '+46%',
        makna: 'Peningkatan peran guru dari penyampai teori menjadi fasilitator analisis dinamika pasar digital riil.',
        deskripsiPenilaian: 'Berdasarkan supervisi telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Hilmia menunjukkan peningkatan nyata dalam memfasilitasi pembelajaran interaktif. Guru memandu analisis kurva penawaran dan permintaan melalui studi kasus digitalisasi pasar modern, memantik nalar kritis peserta didik.',
        buktiKegiatan: 'Modul Ajar Ekonomi Fase E Revisi, Catatan Telaah Pengawas No. 8 & 12',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '45%',
        akhir: '89%',
        selisih: '+44%',
        makna: 'Keaktifan kelompok murid dalam membedah fluktuasi harga dan simulasi mekanisme pasar.',
        deskripsiPenilaian: 'Pada aspek pelibatan murid dalam observasi kelas, 23 dari 24 indikator terlaksana dengan sangat baik. Murid aktif menghitung koefisien elastisitas permintaan bahan pokok, membuat grafik pergeseran ekuilibrium harga, dan mempresentasikan rekomendasi stabilisasi harga secara berkelompok.',
        buktiKegiatan: 'Lembar Diskusi Kasus Harga E-Commerce, Portofolio Grafik Ekuilibrium Murid',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '48%',
        akhir: '88%',
        selisih: '+40%',
        makna: 'Kontekstualisasi materi pada inflasi harga pangan dan pola konsumsi daring di Kota Bogor.',
        deskripsiPenilaian: 'Pembelajaran mengangkat isu riil kenaikan harga cabai dan minyak goreng di pasar tradisional Bogor menjelang hari raya serta tren belanja marketplace di kalangan remaja. Murid belajar membuat keputusan alokasi anggaran yang bijak dan rasional.',
        buktiKegiatan: 'Artikel Berita Inflasi Daerah Bogor, Lembar Kerja Analisis Pasar Riil',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '32%',
        akhir: '82%',
        selisih: '+50%',
        makna: 'Pembiasaan refleksi evaluatif mengenai perilaku belanja dan literasi keuangan pribadi.',
        deskripsiPenilaian: 'Sesuai catatan pasca observasi pengawas, guru menyediakan alokasi waktu 10 menit di akhir kelas bagi murid untuk merefleksikan kebiasaan konsumsi pribadi. 82% murid mencatatkan kesadaran baru untuk membedakan antara kebutuhan primer dan keinginan impulsif dalam mengelola uang jajan.',
        buktiKegiatan: 'Lembar Refleksi Diri 3-2-1 Pembelajaran Ekonomi, Log Refleksi U2',
      },
    ];
  }

  // 3. SMAN 2 BOGOR: Mega Nur Alfira, S.Pd. (Sejarah) [SB]
  if (name.includes('mega')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '45%',
        akhir: '93%',
        selisih: '+48%',
        makna: 'Perubahan pola mengajar dari menghafal tahun peristiwa menuju historical inquiry kritis.',
        deskripsiPenilaian: 'Berdasarkan telaah modul ajar (skor 100.0 / Sangat Baik) dan observasi tatap muka (skor 100.0 / Sangat Baik), Ibu Mega Nur Alfira memfasilitasi penelusuran sejarah berbasis sumber primer otentik. Guru bertindak sebagai pemantik diskusi multiperspektif seputar peristiwa Proklamasi Kemerdekaan Bangsa.',
        buktiKegiatan: 'Modul Ajar Historiografi Kritis, Rekaman Audio Pidato Proklamasi Bung Karno',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '40%',
        akhir: '92%',
        selisih: '+52%',
        makna: 'Keterampilan murid membedah dokumen primer dan berargumentasi historis secara santun.',
        deskripsiPenilaian: 'Seluruh 24 aspek observasi tatap muka terlaksana sempurna. Murid aktif membandingkan draf naskah proklamasi tulisan tangan Soekarno dengan naskah ketikan Sayuti Melik, mengidentifikasi perbedaan sudut pandang golongan tua dan muda secara kritis dan runtut.',
        buktiKegiatan: 'Lembar Komparasi Dokumen Primer, Notulensi Debat Sejarah Terpimpin',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '52%',
        akhir: '94%',
        selisih: '+42%',
        makna: 'Refleksi nilai perjuangan proklamasi dalam menjaga persatuan dan menyaring hoaks masa kini.',
        deskripsiPenilaian: 'Guru sukses mengaitkan esensi diplomasi Rengasdengklok dengan pentingnya musyawarah kebangsaan di era digital. Murid diajak memaknai kemerdekaan sebagai tanggung jawab menjaga integritas dan daya kritis generasi muda terhadap disinformasi sejarah.',
        buktiKegiatan: 'Infografis Nilai Kebangsaan Generasi Z di SMAN 2 Bogor, Hasil Analisis Berita',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '35%',
        akhir: '86%',
        selisih: '+51%',
        makna: 'Pembiasaan metakognisi nilai integritas dan rasa syukur atas kemerdekaan bangsa.',
        deskripsiPenilaian: 'Refleksi penutup mengungkap pemaknaan mendalam dari 86% murid tentang arti kemerdekaan hakiki. Murid merumuskan komitmen tindakan nyata mereka dalam menjaga toleransi, persatuan, dan prestasi di lingkungan sekolah SMAN 2 Bogor.',
        buktiKegiatan: 'Papan Refleksi Kemerdekaan Digital, Buku Jurnal Sejarah Murid',
      },
    ];
  }

  // 4. SMAN 2 BOGOR: Alline Novianti, S.Pd. (Kimia) [SB]
  if (name.includes('alline')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '44%',
        akhir: '91%',
        selisih: '+47%',
        makna: 'Transformasi ke pembelajaran inkuiri berbasis simulasi laboratorium virtual kimia kinetika.',
        deskripsiPenilaian: 'Berdasarkan telaah modul perangkat ajar (skor 100.0 / Sangat Baik) dan observasi kelas (skor 95.8 / Sangat Baik), Ibu Alline mengalihkan fokus pembelajaran dari sekadar transfer rumus reaksi menjadi penyelidikan berbasis laboratorium virtual interaktif.',
        buktiKegiatan: 'Modul Ajar Kimia Fase F, Lembar Kerja Praktikum Virtual Kinetika',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '42%',
        akhir: '90%',
        selisih: '+48%',
        makna: 'Murid aktif memanipulasi variabel konsentrasi dan suhu serta menganalisis grafik laju reaksi.',
        deskripsiPenilaian: 'Pengamatan kelas mencatat keaktifan murid yang sangat dinamis. Setiap pasangan murid menguji pengaruh katalis terhadap laju reaksi secara real-time pada Chromebook, mencatat laju pembentukan produk, dan menarik kesimpulan matematis kurva kinetika.',
        buktiKegiatan: 'Tabel Data Percobaan Virtual, Grafik Analisis Kinetika Reaksi Kimia',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '54%',
        akhir: '92%',
        selisih: '+38%',
        makna: 'Relevansi teori tumbukan dengan proses pengawetan makanan dan pencegahan korosi di Bogor.',
        deskripsiPenilaian: 'Materi dikaitkan langsung dengan prinsip pendinginan makanan di lemari es untuk memperlambat pembusukan serta bahaya kelembapan udara Kota Bogor terhadap laju perkaratan jembatan dan bangunan logam.',
        buktiKegiatan: 'Bahan Diskusi Kontekstual Penerapan Katalis Industri & Pengawetan Pangan',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '33%',
        akhir: '84%',
        selisih: '+51%',
        makna: 'Refleksi rutin terkait pemahaman mikroskopis partikel dan strategi belajar sains.',
        deskripsiPenilaian: 'Sebanyak 84% murid secara rutin mencatat pemahaman konsep energi aktivasi dan mengevaluasi hambatan matematis yang mereka hadapi dalam menghitung orde reaksi pada jurnal sains digital.',
        buktiKegiatan: 'Jurnal Belajar Sains Digital & Exit Ticket Refleksi Kimia',
      },
    ];
  }

  // 5. SMAS IT UMMUL QURO: Kirana Mahardhika, S.Pd, Gr. (Fisika) [SB, SB]
  if (name.includes('kirana')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '46%',
        akhir: '93%',
        selisih: '+47%',
        makna: 'Fasilitasi inkuiri sains astronomi dan pemodelan matematis gerak edar planet.',
        deskripsiPenilaian: 'Berdasarkan telaah modul ajar (skor 97.7 / Sangat Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Kirana mendesain pembelajaran yang menumbuhkan nalar kritis dan kekaguman atas keteraturan semesta melalui pemodelan orbit Hukum Kepler.',
        buktiKegiatan: 'Modul Ajar Gravitasi & Kepler, Rubrik Penilaian Kinerja Sains Holistik',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '44%',
        akhir: '93%',
        selisih: '+49%',
        makna: 'Peserta didik aktif mengolah data satelit dan memformulasikan hukum perbandingan periode.',
        deskripsiPenilaian: 'Murid aktif menggunakan perangkat lunak orbit simulator untuk membuktikan Hukum III Kepler secara kuantitatif, berdiskusi membandingkan kecepatan orbit planet dalam dan planet luar tata surya secara kolaboratif.',
        buktiKegiatan: 'Laporan Pemodelan Orbit Planet, Presentasi Kelompok Murid Berbantuan Simulator',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '52%',
        akhir: '94%',
        selisih: '+42%',
        makna: 'Keterkaitan hukum gravitasi dengan orbit satelit komunikasi dan keharmonisan kosmos.',
        deskripsiPenilaian: 'Pembelajaran menghubungkan orbit satelit geostasioner yang melayani jaringan internet dan GPS di Indonesia dengan nilai ketakwaan atas keteraturan kosmos ciptaan Allah SWT yang memperkuat keimanan murid SMAS IT Ummul Quro.',
        buktiKegiatan: 'Studi Kasus Satelit Merah Putih & Lembar Refleksi Integrasi Nilai Islam',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '36%',
        akhir: '89%',
        selisih: '+53%',
        makna: 'Refleksi metakognitif terpadu antara penguasaan sains dan kesadaran diri sebagai insan beriman.',
        deskripsiPenilaian: 'Refleksi akhir pertemuan mengintegrasikan pemahaman ilmiah dan kesadaran spiritual. 89% murid menuliskan refleksi mengenai pentingnya disiplin dan komitmen hidup sebagaimana planet yang istiqomah melingkar di garis edarnya.',
        buktiKegiatan: 'Lembar Mutabaah & Refleksi Fisika SMAS IT Ummul Quro',
      },
    ];
  }

  // 6. SMAS IT UMMUL QURO: Sani Ramadhanti Noor, S.E. (Ekonomi)
  if (name.includes('sani')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '42%',
        akhir: '87%',
        selisih: '+45%',
        makna: 'Peningkatan peran guru dalam memfasilitasi literasi keuangan syariah interaktif.',
        deskripsiPenilaian: 'Berdasarkan telaah modul (skor 93.2 / Sangat Baik) dan observasi tatap muka (skor 91.7 / Sangat Baik), Ibu Sani membimbing murid menyusun perencanaan anggaran finansial berbasis etika bisnis Islam.',
        buktiKegiatan: 'Modul Literasi Keuangan Syariah, Panduan Simulasi Anggaran Mandiri',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '40%',
        akhir: '88%',
        selisih: '+48%',
        makna: 'Murid aktif menyimulasikan akad mudharabah dan menghitung bagi hasil transaksi.',
        deskripsiPenilaian: 'Murid berkelompok membuat simulasi usaha halal, merancang proposal investasi sederhana, dan membandingkan prinsip margin keuntungan dengan bunga pinjaman konvensional.',
        buktiKegiatan: 'Proposal Mini Usaha Halal Siswa, Lembar Hitung Bagi Hasil',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '50%',
        akhir: '90%',
        selisih: '+40%',
        makna: 'Penerapan pengelolaan uang saku pribadi dan transaksi non-riba dalam keseharian santri.',
        deskripsiPenilaian: 'Guru mengangkat studi kasus nyata pengelolaan uang saku bulanan santri, bahaya jebakan pinjol ilegal di kalangan pemuda, serta keutamaan infak dalam keberkahan harta.',
        buktiKegiatan: 'Rancangan Budgeting Pribadi Siswa & Lembar Evaluasi Pengeluaran',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '32%',
        akhir: '83%',
        selisih: '+51%',
        makna: 'Pembiasaan evaluasi diri atas gaya hidup hemat dan tanggung jawab amanah finansial.',
        deskripsiPenilaian: 'Sebanyak 83% murid mengungkapkan refleksi mendalam mengenai perubahan kebiasaan konsumtif dan komitmen menabung secara teratur untuk keperluan masa depan.',
        buktiKegiatan: 'Buku Jurnal Refleksi Keuangan Siswa Ummul Quro',
      },
    ];
  }

  // 7. SMAS YPHB: Sihana, S.Pd.Gr. (Penjasorkes)
  if (name.includes('sihana')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '44%',
        akhir: '88%',
        selisih: '+44%',
        makna: 'Transformasi pembelajaran olahraga dari instruksi drill fisik menjadi edukasi kebugaran personal.',
        deskripsiPenilaian: 'Berdasarkan supervisi telaah perangkat (skor 90.9 / Sangat Baik) dan observasi lapangan (skor 91.7 / Sangat Baik), Bapak Sihana memfasilitasi murid merancang program kebugaran jasmani terukur sesuai kapasitas fisiologis masing-masing.',
        buktiKegiatan: 'Modul Ajar Kebugaran Berkelanjutan, Lembar Monitoring Denyut Nadi Murid',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '42%',
        akhir: '90%',
        selisih: '+48%',
        makna: 'Murid aktif mempraktikkan sirkuit training dan mengukur denyut nadi pemulihan mandiri.',
        deskripsiPenilaian: 'Peserta didik secara mandiri menghitung Target Heart Rate (THR), mencatat respons kardiovaskular pasca sirkuit training, dan saling memberi umpan balik teknik gerak yang aman.',
        buktiKegiatan: 'Kartu Catatan Kebugaran Sirkuit, Rubrik Penilaian Penjasorkes Terukur',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '55%',
        akhir: '92%',
        selisih: '+37%',
        makna: 'Keterkaitan latihan jasmani dengan pencegahan penyakit degeneratif dan kesehatan mental.',
        deskripsiPenilaian: 'Pembelajaran mengaitkan olahraga teratur dengan pencegahan obesitas remaja, perbaikan kualitas tidur, dan pelepasan hormon endorfin untuk mereduksi stres akademik di lingkungan SMAS YPHB.',
        buktiKegiatan: 'Poster Kampanye Hidup Aktif Remaja YPHB, Riset Kecil Pola Tidur Siswa',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '30%',
        akhir: '82%',
        selisih: '+52%',
        makna: 'Refleksi kesadaran tubuh (body awareness) dan komitmen pola hidup bugar sepanjang hayat.',
        deskripsiPenilaian: 'Sebanyak 82% murid menuliskan refleksi mengenai sensasi kebugaran tubuh mereka, pola makan seimbang, dan rencana jadwal aktivitas fisik mandiri di luar jam sekolah.',
        buktiKegiatan: 'Logbook Refleksi Kesehatan Jasmani Mingguan Siswa YPHB',
      },
    ];
  }

  // 8. SMAS YPHB: Siti Salma, S.Pd (Fisika)
  if (name.includes('salma') || name.includes('siti')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '43%',
        akhir: '90%',
        selisih: '+47%',
        makna: 'Transformasi dari hafalan rumus optik ke praktikum pembiasan cahaya kontekstual.',
        deskripsiPenilaian: 'Berdasarkan telaah modul ajar (skor 95.5 / Sangat Baik) dan observasi kelas (skor 95.8 / Sangat Baik), Ibu Siti Salma memfasilitasi penyelidikan pembentukan bayangan optik menggunakan bangku optik dan sumber cahaya laser interaktif.',
        buktiKegiatan: 'Modul Optika Geometri, Kit Praktikum Pembiasan & Lensa Cembung-Cekung',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '41%',
        akhir: '91%',
        selisih: '+50%',
        makna: 'Murid terampil mengukur jarak fokus dan menganalisis cacat mata miopi serta hipermetropi.',
        deskripsiPenilaian: 'Peserta didik secara berkelompok menentukan jarak bayangan lensa cembung dan cekung, menggambar diagram sinar istimewa secara presisi, dan memverifikasi rumus pembuat lensa secara empiris.',
        buktiKegiatan: 'Lembar Kerja Praktikum Optika, Diagram Pembentukan Bayangan Murid',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '50%',
        akhir: '91%',
        selisih: '+41%',
        makna: 'Keterkaitan lensa dengan kamera smartphone, kacamata koreksi, dan mikroskop.',
        deskripsiPenilaian: 'Guru mengajak murid membongkar prinsip kerja modul multi-lensa pada kamera gawai dan cara lensa koreksi membantu murid penderita rabun jauh melihat tulisan di proyektor kelas dengan tajam.',
        buktiKegiatan: 'Modul Analisis Lensa Kamera Ponsel Pintar, Panduan Cacat Mata',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '31%',
        akhir: '85%',
        selisih: '+54%',
        makna: 'Refleksi atas pentingnya menjaga kesehatan indra penglihatan dari paparan layar gawai.',
        deskripsiPenilaian: '85% murid merefleksikan cara kerja indra penglihatan dan merumuskan aturan jeda 20-20-20 untuk mengistirahatkan mata dari kelelahan akibat paparan layar gadget.',
        buktiKegiatan: 'Jurnal Refleksi Optika & Kartu Edukasi Mata Sehat Siswa YPHB',
      },
    ];
  }

  // 9. SMAS RIMBA MADYA: Ivany Ratna Ekandini, S.Pd. (Bahasa Indonesia) [SB]
  if (name.includes('ivany')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '48%',
        akhir: '92%',
        selisih: '+44%',
        makna: 'Fasilitasi penulisan teks argumentasi kritis berbasis komik dan media visual.',
        deskripsiPenilaian: 'Berdasarkan supervisi telaah perangkat (skor 95.5 / Sangat Baik) dan observasi tatap muka (skor 95.8 / Sangat Baik), Ibu Ivany berperan sebagai mentor literasi yang memandu murid membedah isu lingkungan Rimba Mulya Bogor menjadi teks eksposisi argumentatif yang tajam.',
        buktiKegiatan: 'Modul Ajar Bahasa Indonesia Berbasis Proyek, Rubrik Penilaian Retorika & PUEBI',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '45%',
        akhir: '91%',
        selisih: '+46%',
        makna: 'Murid aktif memproduksi narasi eksposisi berbobot dan melakukan peer-review karya.',
        deskripsiPenilaian: 'Murid secara aktif menyusun komik strip digital bertema lingkungan di Canva, mengkritisi argumen teman dengan etika santun, dan memajang karya di mading digital sekolah.',
        buktiKegiatan: 'Antologi Komik Kritik Sosial Siswa Rimba Madya, Hasil Ulasan Sejawat',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '58%',
        akhir: '94%',
        selisih: '+36%',
        makna: 'Konteks konservasi alam Pasir Mulya Bogor dan etika berekspresi di ruang siber.',
        deskripsiPenilaian: 'Pembelajaran mengangkat isu riil konservasi daerah aliran sungai dan hutan kota sekitar Pasir Mulya Bogor. Murid mendiskusikan bagaimana bahasa persuasif dapat menggerakkan aksi nyata penyelamatan lingkungan.',
        buktiKegiatan: 'Naskah Esai Lingkungan Siswa, Lembar Analisis Berita Lingkungan Bogor',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '35%',
        akhir: '87%',
        selisih: '+52%',
        makna: 'Refleksi atas kekuatan kata-kata dalam memantik perubahan positif di masyarakat.',
        deskripsiPenilaian: 'Sebanyak 87% murid merefleksikan kekuatan argumen mereka dan menyadari pentingnya memvalidasi fakta sebelum menyebarkan opini di media sosial demi menghindari pencemaran nama baik.',
        buktiKegiatan: 'Buku Refleksi Siswa Rimba Madya "Suara Rimba", Jurnal Literasi',
      },
    ];
  }

  // 10. SMAS RIMBA MADYA: Atik Dwi Larasati, S.Pd. (Ekonomi)
  if (name.includes('atik')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '40%',
        akhir: '85%',
        selisih: '+45%',
        makna: 'Pemberdayaan murid melalui rancangan proyek kewirausahaan ramah lingkungan.',
        deskripsiPenilaian: 'Berdasarkan telaah modul (skor 88.6 / Baik) dan observasi tatap muka (skor 87.5 / Baik), Ibu Atik memfasilitasi murid merancang studi kelayakan bisnis kreatif berbasis daur ulang limbah sekolah.',
        buktiKegiatan: 'Modul Manajemen Kewirausahaan, Format Proposal Business Plan Hijau',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '42%',
        akhir: '86%',
        selisih: '+44%',
        makna: 'Murid terampil menghitung BEP (Break-Even Point) dan strategi pemasaran produk.',
        deskripsiPenilaian: 'Murid bekerja dalam tim menyusun prototype produk dari limbah daur ulang sekolah, menghitung biaya produksi dan harga jual rasional, serta menyimulasikan promosi di media sosial.',
        buktiKegiatan: 'Lembar Kalkulasi BEP, Poster Promosi Produk Murid, Prototype Produk',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '48%',
        akhir: '88%',
        selisih: '+40%',
        makna: 'Relevansi potensi UMKM lokal Bogor dan ekonomi sirkular ramah lingkungan.',
        deskripsiPenilaian: 'Guru mengaitkan materi dengan ekosistem UMKM kuliner dan kerajinan Kota Bogor, mendorong murid berpikir kreatif menciptakan peluang usaha mandiri yang berkelanjutan.',
        buktiKegiatan: 'Laporan Riset Pasar UMKM Lokal Bogor, Analisis Peluang Usaha',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '30%',
        akhir: '80%',
        selisih: '+50%',
        makna: 'Refleksi karakter wirausahawan tangguh, pantang menyerah, dan beretika.',
        deskripsiPenilaian: '80% murid menuliskan refleksi tentang pentingnya ketelitian dalam perhitungan finansial dan integritas kejujuran saat berbisnis dengan konsumen.',
        buktiKegiatan: 'Lembar Jurnal Refleksi Entrepreneur Muda Rimba Madya',
      },
    ];
  }

  // 11. SMAS PGRI 1: Iqbal Aziz Andrianto (Sejarah) [B]
  if (name.includes('iqbal')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '40%',
        akhir: '81%',
        selisih: '+41%',
        makna: 'Peningkatan peran guru dalam memandu diskusi investigasi sejarah perlawanan bangsa.',
        deskripsiPenilaian: 'Berdasarkan telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 83.3 / Baik), Bapak Iqbal menunjukkan kemajuan positif dalam mengurangi metode ceramah satu arah. Guru memandu murid menelusuri rute perlawanan rakyat terhadap kolonialisme melalui peta interaktif.',
        buktiKegiatan: 'Modul Ajar Sejarah Kolonialisme, Lembar Telaah Pengawas No. 4 & 16',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '38%',
        akhir: '80%',
        selisih: '+42%',
        makna: 'Keaktifan kelompok murid dalam memetakan strategi perlawanan Diponegoro dan Padri.',
        deskripsiPenilaian: 'Murid bekerja sama menyusun peta tematik pertempuran, menganalisis faktor penyebab kegagalan perjuangan sebelum abad ke-20 akibat persenjataan dan politik adu domba, serta mempresentasikan kesimpulan kelompok.',
        buktiKegiatan: 'Peta Tematik Perjuangan Rakyat Nusantara, Resume Diskusi Kelompok',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '45%',
        akhir: '82%',
        selisih: '+37%',
        makna: 'Menghubungkan nilai perjuangan dengan tantangan persatuan pemuda era digital.',
        deskripsiPenilaian: 'Guru mengaitkan taktik devide et impera kolonial dengan bahaya ujaran kebencian di era medsos, memantik komitmen murid untuk selalu memverifikasi informasi dan menjaga persaudaraan antarpelajar.',
        buktiKegiatan: 'Bahan Tayang Diskusi "Belajar dari Sejarah untuk Masa Kini", Kliping Isu',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '28%',
        akhir: '76%',
        selisih: '+48%',
        makna: 'Refleksi penanaman jiwa patriotisme dan persatuan di kalangan pelajar PGRI 1.',
        deskripsiPenilaian: 'Sebanyak 76% murid menyampaikan refleksi tertulis mengenai pentingnya menghargai jasa para pahlawan dan menjauhi perselisihan antarpelajar di Kota Bogor.',
        buktiKegiatan: 'Lembar Refleksi Diri Pembelajaran Sejarah SMAS PGRI 1',
      },
    ];
  }

  // 12. SMAS BHAKTI INSANI: Widya Anjani, S.Pd. (Ekonomi) [B]
  if (name.includes('widya')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '41%',
        akhir: '84%',
        selisih: '+43%',
        makna: 'Fasilitasi simulasi transaksi perbankan dan sistem pembayaran digital nontunai.',
        deskripsiPenilaian: 'Berdasarkan telaah modul (skor 86.4 / Baik) dan observasi tatap muka (skor 87.5 / Baik), Ibu Widya memandu peserta didik memahami sistem moneter melalui simulasi pembayaran non-tunai modern.',
        buktiKegiatan: 'Modul Sistem Pembayaran & Bank Sentral, Panduan Simulasi QRIS',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '40%',
        akhir: '85%',
        selisih: '+45%',
        makna: 'Murid aktif mempraktikkan alur transaksi QRIS dan menganalisis keamanan dompet digital.',
        deskripsiPenilaian: 'Peserta didik secara aktif melakukan role-play transaksi merchant dan konsumen, menganalisis potensi risiko kebocoran data PIN, serta merumuskan tips bertransaksi aman.',
        buktiKegiatan: 'Lembar Simulasi Transaksi Keuangan Digital, Rubrik Evaluasi Role-Play',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '48%',
        akhir: '87%',
        selisih: '+39%',
        makna: 'Penerapan dompet digital (e-wallet) dan literasi keamanan siber perbankan murid.',
        deskripsiPenilaian: 'Materi terhubung langsung dengan kebiasaan murid SMAS Bhakti Insani bertransaksi menggunakan uang elektronik saat jajan di kantin dan membeli buku pelajaran.',
        buktiKegiatan: 'Kuesioner Penggunaan E-Wallet Siswa, Analisis Kasus Kejahatan Phishing',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '29%',
        akhir: '78%',
        selisih: '+49%',
        makna: 'Refleksi kesadaran proteksi data pribadi dan kehati-hatian finansial di era digital.',
        deskripsiPenilaian: '78% murid menuliskan refleksi mengenai pentingnya menjaga kerahasiaan kode OTP dan menahan diri dari gaya hidup konsumtif hanya karena kemudahan transaksi digital.',
        buktiKegiatan: 'Catatan Refleksi Keuangan Digital Siswa Bhakti Insani',
      },
    ];
  }

  // 13. SMAS YASIH: Yazid Ali Hamdi (PKn)
  if (name.includes('yazid')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '42%',
        akhir: '85%',
        selisih: '+43%',
        makna: 'Pergeseran dari ceramah pasal konstitusi menjadi studi kasus penegakan HAM kontekstual.',
        deskripsiPenilaian: 'Berdasarkan telaah modul ajar (skor 86.4 / Baik) dan observasi kelas (skor 87.5 / Baik), Bapak Yazid memfasilitasi dialog konstruktif mengenai perlindungan hak asasi manusia dalam bingkai Pancasila.',
        buktiKegiatan: 'Modul Ajar HAM dan Demokrasi Pancasila, Rubrik Debat Hukum Konstitusional',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '39%',
        akhir: '84%',
        selisih: '+45%',
        makna: 'Murid aktif bersimulasi mediasi sengketa dan merumuskan solusi atas perundungan.',
        deskripsiPenilaian: 'Peserta didik secara aktif menjalankan simulasi sidang mediasi kasus perundungan siber (cyberbullying), menyusun kesepakatan damai, dan mengidentifikasi pelanggaran hak martabat manusia.',
        buktiKegiatan: 'Notulensi Sidang Mediasi Simulasi Siswa, Naskah Kesepakatan Damai',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '47%',
        akhir: '86%',
        selisih: '+39%',
        makna: 'Pencegahan perundungan di lingkungan sekolah dan pemenuhan hak belajar yang aman.',
        deskripsiPenilaian: 'Pembelajaran mengaitkan pasal HAM dengan deklarasi sekolah ramah anak di SMAS Yasih, menanamkan kesadaran menghargai perbedaan latar belakang antarwarga sekolah.',
        buktiKegiatan: 'Piagam Komitmen Anti-Bullying Kelas X SMAS Yasih',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '30%',
        akhir: '79%',
        selisih: '+49%',
        makna: 'Refleksi penghormatan atas hak orang lain dan tanggung jawab menegakkan keadilan.',
        deskripsiPenilaian: 'Sebanyak 79% murid menuangkan refleksi personal mengenai komitmen mereka untuk menjadi pembela teman yang diperlakukan tidak adil dan tidak menjadi pelaku perundungan.',
        buktiKegiatan: 'Lembar Refleksi Hati Nurani Siswa SMAS Yasih',
      },
    ];
  }

  // 14. SMAS MUHAMMADIYAH: Lutfiana Faridh Fadillah (Kimia) [C]
  if (name.includes('lutfiana')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '30%',
        akhir: '68%',
        selisih: '+38%',
        makna: 'Awal pergeseran dari pembelajaran teoretis ke praktikum sederhana indikator asam basa.',
        deskripsiPenilaian: 'Berdasarkan supervisi telaah perangkat (skor 75.0 / Cukup) dan observasi tatap muka (skor 75.0 / Cukup), guru mulai mencoba metode eksperimen bahan alam dengan ekstrak kunyit dan kol ungu. Melalui coaching intensif pengawas, guru mulai melatih teknik scaffolding untuk memfasilitasi kelompok murid yang pasif.',
        buktiKegiatan: 'Modul Ajar Asam Basa Revisi, Lembar Observasi Pengawas No. 8-12',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '32%',
        akhir: '70%',
        selisih: '+38%',
        makna: 'Peningkatan antusiasme murid dalam menguji pH bahan kimia rumah tangga.',
        deskripsiPenilaian: 'Murid yang sebelumnya pasif mulai menunjukkan ketertarikan meneteskan larutan cuka, sabun, dan jeruk nipis ke plat tetes, mengamati spektrum perubahan warna dan mencatat derajat keasaman larutan.',
        buktiKegiatan: 'Lembar Kerja Siswa Pengujian pH Alami, Dokumentasi Plat Tetes',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '35%',
        akhir: '72%',
        selisih: '+37%',
        makna: 'Keterkaitan sifat asam basa dengan netralisasi maag dan dampak limbah sabun.',
        deskripsiPenilaian: 'Guru menghubungkan reaksi netralisasi dengan mekanisme kerja obat maag di lambung dan bahaya buangan limbah detergen bagi kehidupan ekosistem selokan sekitar sekolah.',
        buktiKegiatan: 'Bahan Ajar Apersepsi Kontekstual Bahan Kimia Rumah Tangga',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '25%',
        akhir: '65%',
        selisih: '+40%',
        makna: 'Awal pembiasaan refleksi pemahaman konsep di akhir jam praktikum kimia.',
        deskripsiPenilaian: 'Dengan dorongan pengawas, guru menyisihkan 8 menit di akhir kelas untuk meminta murid menuliskan hal apa yang paling menarik dari praktikum dan apa yang masih sulit dipahami.',
        buktiKegiatan: 'Kertas Refleksi Singkat Akhir Praktikum Siswa Muhammadiyah',
      },
    ];
  }

  // 15. SMAS ANANDA: Saulina Siregar, S.Sos (Ekonomi) [B]
  if (name.includes('saulina')) {
    return [
      {
        indikator: 'Guru berorientasi pada pengalaman belajar murid',
        awal: '41%',
        akhir: '84%',
        selisih: '+43%',
        makna: 'Peningkatan fasilitasi analisis struktur pasar dan perilaku produsen-konsumen.',
        deskripsiPenilaian: 'Berdasarkan supervisi telaah modul (skor 84.1 / Baik) dan observasi tatap muka (skor 83.3 / Baik), Ibu Saulina mengarahkan murid menganalisis struktur pasar monopoli dan oligopoli melalui bedah kasus industri nasional.',
        buktiKegiatan: 'Modul Struktur Pasar, Lembar Kerja Bedah Industri Nasional',
      },
      {
        indikator: 'Murid aktif mengaplikasikan pengetahuan',
        awal: '39%',
        akhir: '83%',
        selisih: '+44%',
        makna: 'Murid aktif membedah kelebihan dan kekurangan penetapan tarif monopoli negara.',
        deskripsiPenilaian: 'Murid bekerja dalam kelompok menganalisis peran BUMN seperti PLN dan PT KAI dalam mengelola hajat hidup orang banyak serta mendiskusikan perlindungan hak konsumen.',
        buktiKegiatan: 'Laporan Diskusi Kelompok Peran BUMN & KPPU, Peta Analisis Pasar',
      },
      {
        indikator: 'Pembelajaran terhubung dengan konteks nyata',
        awal: '46%',
        akhir: '85%',
        selisih: '+39%',
        makna: 'Relevansi harga tiket transportasi dan tarif listrik dengan pengeluaran keluarga.',
        deskripsiPenilaian: 'Materi dikaitkan dengan penyesuaian tarif KRL Jabodetabek rute Bogor-Jakarta dan tagihan listrik rumah tangga, memberikan gambaran nyata fungsi subsidi pemerintah.',
        buktiKegiatan: 'Kliping Berita Penyesuaian Tarif KRL & Lembar Analisis Subsidi',
      },
      {
        indikator: 'Murid melakukan refleksi',
        awal: '28%',
        akhir: '77%',
        selisih: '+49%',
        makna: 'Refleksi kepedulian sosial terhadap efisiensi ekonomi dan keadilan akses layanan publik.',
        deskripsiPenilaian: 'Sebanyak 77% murid merefleksikan pentingnya keadilan sosial bagi seluruh rakyat Indonesia dalam pemanfaatan sumber daya alam strategis.',
        buktiKegiatan: 'Jurnal Refleksi Keadilan Ekonomi Siswa SMAS Ananda',
      },
    ];
  }

  // Fallback generik dinamis yang tetap menyelaraskan mata pelajaran dan nama guru
  const sName = schoolName || 'Sekolah';
  const sub = subject || 'Mata Pelajaran';
  return [
    {
      indikator: 'Guru berorientasi pada pengalaman belajar murid',
      awal: '45%',
      akhir: '85%',
      selisih: '+40%',
      makna: `Transformasi pembelajaran ${sub} berpusat pada murid melalui metode aktif dan inkuiri.`,
      deskripsiPenilaian: `Berdasarkan evaluasi supervisi pengawas di ${sName}, ${teacherName} berhasil memfasilitasi murid bereksplorasi secara aktif pada materi ${sub}, beralih dari ceramah klasikal ke pendampingan belajar bermakna.`,
      buktiKegiatan: `Modul Ajar ${sub}, Lembar Observasi Pengawas`,
    },
    {
      indikator: 'Murid aktif mengaplikasikan pengetahuan',
      awal: '42%',
      akhir: '88%',
      selisih: '+46%',
      makna: `Peningkatan keaktifan murid dalam menyelesaikan tugas unjuk kerja kolaboratif ${sub}.`,
      deskripsiPenilaian: `Peserta didik aktif berkolaborasi dalam kelompok memecahkan persoalan ${sub}, mempresentasikan temuan, dan berdiskusi secara kritis di ruang kelas.`,
      buktiKegiatan: `LKPD Kolaboratif Siswa, Portofolio Tugas Pembelajaran`,
    },
    {
      indikator: 'Pembelajaran terhubung dengan konteks nyata',
      awal: '50%',
      akhir: '88%',
      selisih: '+38%',
      makna: `Keterhubungan konsep materi ${sub} dengan fenomena kehidupan sehari-hari peserta didik.`,
      deskripsiPenilaian: `Guru secara kontekstual menghubungkan materi ajar ${sub} dengan realitas kehidupan murid di lingkungan ${sName}, meningkatkan minat dan pemahaman bermakna.`,
      buktiKegiatan: `Bahan Ajar Studi Kasus Nyata, Lembar Diskusi Kontekstual`,
    },
    {
      indikator: 'Murid melakukan refleksi',
      awal: '32%',
      akhir: '80%',
      selisih: '+48%',
      makna: `Pembiasaan refleksi metakognitif terstruktur di akhir pembelajaran ${sub}.`,
      deskripsiPenilaian: `Murid secara konsisten dibimbing melakukan evaluasi diri dan menuliskan pemaknaan pembelajaran pada akhir sesi pertemuan kelas.`,
      buktiKegiatan: `Lembar Refleksi Diri Siswa, Hasil Uji Angket Suara Murid`,
    },
  ];
}

/**
 * Creates empty or default template SambungData for any new teacher
 */
export function createDefaultSambungForTeacher(
  teacherName: string,
  schoolName: string,
  subject: string
): SambungData {
  const today = new Date().toISOString().split('T')[0];
  return {
    selidiki: {
      tanggal: today,
      items: ASPEK_SELIDIKI_DEFAULT.map((aspek, idx) => ({
        id: idx + 1,
        aspek,
        kondisiAwal: '',
        bukti: '',
        kebutuhanPembinaan: '',
        isPrioritas: idx === 0 || idx === 1,
      })),
      catatanPrioritas: 'Fokus pada penguatan kesadaran murid dan kontekstualisasi materi.',
      matriksBefore: { ...DEFAULT_MATRIKS_BEFORE },
    },
    arahkan: {
      periode: 'Semester Genap 2025/2026',
      fokusPerubahan: `Meningkatkan keterlibatan aktif dan pemahaman kontekstual murid pada pembelajaran ${subject} melalui pembelajaran bermakna.`,
      kegiatan: [
        {
          id: 1,
          kegiatanPembinaan: `Bedah telaah perangkat dan modul ajar ${subject} berbasis inkuiri`,
          indikatorKeberhasilan: 'Modul ajar memuat diferensiasi konten dan asesmen otentik',
          waktu: 'Bulan ke-1',
          penanggungJawab: 'Kusnandar, M.Si & Guru',
        },
        {
          id: 2,
          kegiatanPembinaan: 'Coaching reflektif strategi pelibatan murid aktif',
          indikatorKeberhasilan: 'Guru menyusun strategi pertanyaan pemantik dan studi kasus nyata',
          waktu: 'Bulan ke-2',
          penanggungJawab: 'Kusnandar, M.Si',
        },
        {
          id: 3,
          kegiatanPembinaan: 'Observasi kelas kolaboratif dan refleksi pasca-observasi',
          indikatorKeberhasilan: 'Skor observasi mencapai kriteria berkembang/sangat berkembang (>85%)',
          waktu: 'Bulan ke-3',
          penanggungJawab: 'Kepala Sekolah & Pengawas',
        },
      ],
      tandaTangan: {
        pengawas: 'Kusnandar, M.Si',
        kepalaSekolah: 'Kepala Sekolah',
        guru: teacherName,
        tanggalDisepakati: today,
      },
    },
    maknai: {
      tanggal: today,
      coaching: {
        tujuan: `Menciptakan ruang belajar ${subject} yang membangkitkan rasa ingin tahu murid dan relevan dengan kehidupan sehari-hari.`,
        realitas: 'Sebagian besar murid masih menunggu instruksi guru dan ragu mengemukakan pendapat di depan kelas.',
        opsi: 'Menerapkan diskusi kelompok terarah, media interaktif kontekstual, dan umpan balik langsung antarteman.',
        komitmen: 'Melakukan uji coba lembar kerja kolaboratif pada pertemuan mendatang dan mencatat respons murid.',
      },
    },
    berdayakan: {
      siklusList: [
        {
          siklus: 1,
          rancanganDanUjiCoba: 'Rancangan awal pembelajaran dengan simulasi masalah sehari-hari.',
          refleksi: 'Murid mulai tertarik, namun perlu alokasi waktu lebih terukur.',
          perbaikanBerikutnya: 'Menyederhanakan lembar kerja siswa agar fokus pada konsep esensial.',
        },
        {
          siklus: 2,
          rancanganDanUjiCoba: 'Penerapan kerja kelompok heterogen dengan pembagian peran yang jelas.',
          refleksi: 'Interaksi antarmurid meningkat dan diskusi lebih hidup.',
          perbaikanBerikutnya: 'Menyiapkan pertanyaan pemandu bagi murid yang membutuhkan pendampingan khusus.',
        },
        {
          siklus: 3,
          rancanganDanUjiCoba: 'Presentasi hasil karya dan refleksi terbimbing di akhir pembelajaran.',
          refleksi: 'Murid berani menyimpulkan makna pembelajaran secara mandiri.',
          perbaikanBerikutnya: 'Mengunggah dokumentasi praktik baik ke platform berbagi rekan sejawat.',
        },
      ],
    },
    uji: {
      u1_observasi: {
        tanggal: today,
        hariTanggal: 'Senin, ' + today,
        tahapObservasi: 'siklus',
        kelas: 'Fase E / F',
        indikatorList: INDIKATOR_U1_DEFAULT.map(ind => ({
          ...ind,
          score: 3 as 1 | 2 | 3 | 4,
          catatan: 'Teramati berkembang dengan baik.',
        })),
        totalSkor: 30,
        persentaseCapaian: 75.0,
        apaYangDialamiMurid: 'Murid mengikuti alur pembelajaran dengan rasa aman dan antusias.',
        kekuatanDanRekomendasi: 'Guru terampil mengelola suasana belajar; disarankan memperkaya ragam contoh kontekstual.',
      },
      u2_angketMurid: {
        kodeMuridKelas: 'Kelas X/XI',
        tanggal: today,
        jumlahResponden: 32,
        items: PERNYATAAN_U2_DEFAULT.map((p, idx) => ({
          id: idx + 1,
          pernyataan: p,
          skorRataRata: 3.4,
          persentaseSetuju: 85.0,
        })),
        halPalingBermakna: 'Bisa berdiskusi dan menyelesaikan tantangan bersama teman-teman.',
        kesulitanMurid: 'Menghubungkan materi dengan istilah teknis yang belum familiar.',
      },
      matriksAfter: { ...DEFAULT_MATRIKS_AFTER },
    },
    nyatakan: {
      beforeAfter: [
        {
          aspek: 'Peran guru',
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.peranGuru,
          setelahSambung: DEFAULT_MATRIKS_AFTER.peranGuru,
        },
        {
          aspek: 'Aktivitas murid',
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
          setelahSambung: DEFAULT_MATRIKS_AFTER.aktivitasMurid,
        },
        {
          aspek: 'Konteks kehidupan nyata',
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.konteksNyata,
          setelahSambung: DEFAULT_MATRIKS_AFTER.konteksNyata,
        },
        {
          aspek: 'Refleksi murid',
          sebelumSambung: DEFAULT_MATRIKS_BEFORE.refleksiMurid,
          setelahSambung: DEFAULT_MATRIKS_AFTER.refleksiMurid,
        },
      ],
      dataDampak: getTeacherDescriptiveDataDampak(teacherName, subject, schoolName),
    },
    gerakkan: {
      tindakLanjut: [
        {
          id: 1,
          temuanSupervisi: 'Beberapa murid pendiam masih perlu dorongan dalam kerja kelompok.',
          tindakLanjut: 'Menerapkan teknik Think-Pair-Share dan rotasi peran ketua kelompok.',
          penanggungJawab: teacherName,
          waktu: '2 Minggu ke depan',
          hasil: 'Partisipasi murid pendiam meningkat signifikan.',
        },
        {
          id: 2,
          temuanSupervisi: 'Perangkat asesmen formatif belum terdokumentasi rapi dalam portofolio digital.',
          tindakLanjut: 'Membuat folder Google Drive kelas yang terstruktur dan mudah diakses.',
          penanggungJawab: teacherName,
          waktu: '1 Minggu ke depan',
          hasil: 'Seluruh rubrik dan hasil unjuk kerja murid terarsipkan.',
        },
      ],
      pengimbasan: [
        {
          id: 1,
          praktikBaik: `Penerapan Strategi SAMBUNG pada Pembelajaran ${subject}`,
          sasaran: 'Rekan Guru Mata Pelajaran di Satuan Pendidikan',
          bentuk: 'Komunitas Belajar (Kombel) Sekolah',
          waktu: 'Bulan Depan',
        },
      ],
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Rich realistic SAMBUNG Data for Teacher 1: Sondang Asih Januarti, S.Pd. (Fisika - Listrik Arus Searah)
 */
export const SEED_SAMBUNG_DEWI: SambungData = {
  selidiki: {
    tanggal: '2025-08-10',
    items: [
      {
        id: 1,
        aspek: 'Tujuan dan kesadaran murid tentang belajar',
        kondisiAwal: 'Murid hafal rumus Hukum Ohm V = I × R namun bingung mengapa sekring rumah putus atau bagaimana aki dan baterai smartphone menyuplai arus searah DC.',
        bukti: 'Dok-Awal-01 (Pre-test diagnostik & angket minat awal)',
        kebutuhanPembinaan: 'Membangun apersepsi bermakna tentang bahaya konsleting dan efisiensi energi listrik DC rumah tangga.',
        isPrioritas: true,
      },
      {
        id: 2,
        aspek: 'Konteks kehidupan nyata',
        kondisiAwal: 'Contoh pembelajaran hanya mengandalkan skema resistor gambar garis buku cetak tanpa kaitan dengan panel surya atau mobil listrik.',
        bukti: 'RPP-01 (Modul Ajar semester lalu)',
        kebutuhanPembinaan: 'Mengintegrasikan fenomena nyata: panel surya atap sekolah, powerbank gawai, sistem starter motor/mobil, dan instalasi kelistrikan ramah lingkungan.',
        isPrioritas: true,
      },
      {
        id: 3,
        aspek: 'Aktivitas memahami dan mengaplikasikan',
        kondisiAwal: 'Praktikum sebatas membaca jarum amperemeter analog yang sering rusak tanpa ruang bagi murid untuk merancang sirkuit sendiri.',
        bukti: 'LKS-Fisika-02',
        kebutuhanPembinaan: 'Memanfaatkan aplikasi PhET Interactive Simulation: Circuit Construction Kit (DC) dan trainer kit breadboard rangkaian tertutup.',
      },
      {
        id: 4,
        aspek: 'Aktivitas merefleksikan dan menghubungkan',
        kondisiAwal: 'Guru menutup sesi dengan pemberian pekerjaan rumah (PR) perhitungan rumus resistor tanpa sesi refleksi diri.',
        bukti: 'Jurnal-01',
        kebutuhanPembinaan: 'Menyediakan rubrik refleksi 3-2-1 tentang penghematan daya listrik di akhir sesi tatap muka.',
      },
      {
        id: 5,
        aspek: 'Suasana menggembirakan',
        kondisiAwal: 'Suasana kelas tegang karena murid cemas sengatan listrik dan takut salah menghitung pecahan hambatan paralel di papan tulis.',
        bukti: 'Obs-Awal-A1',
        kebutuhanPembinaan: 'Menerapkan gamifikasi tebak nyala lampu rangkaian kombinasi seri-paralel dan kuis interaktif Quizizz kelistrikan.',
      },
      {
        id: 6,
        aspek: 'Asesmen dan tindak lanjut',
        kondisiAwal: 'Asesmen formatif jarang diberikan umpan balik kualitatif, hanya nilai angka ulangan harian.',
        bukti: 'Nilai-Fis-2025',
        kebutuhanPembinaan: 'Asesmen formatif berkelanjutan dengan rubrik unjuk kerja troubleshooting rangkaian listrik terbuka dan tertutup.',
      },
    ],
    catatanPrioritas: 'Prioritas pembinaan disepakati pada Aspek 1 (Kesadaran Murid) dan Aspek 2 (Konteks Kehidupan Nyata Listrik Arus Searah).',
    matriksBefore: {
      peranGuru: 'Penceramah dominan di depan kelas, mendiktekan rumus Hukum Ohm dan menghitung contoh soal di papan tulis.',
      aktivitasMurid: 'Menyalin tulisan di papan, mencatat rumus tanpa berdialog, pasif menunggu jam pelajaran selesai.',
      konteksNyata: 'Soal teks abstrak berupa kawat penghantar tanpa konteks gawai atau perangkat rumah tangga.',
      refleksiMurid: 'Sama sekali tidak ada alokasi waktu refleksi di akhir jam belajar.',
    },
  },
  arahkan: {
    periode: 'Semester Ganjil 2025/2026',
    fokusPerubahan: 'Meningkatkan pemahaman konseptual dan keterampilan terapan murid pada materi Listrik Arus Searah melalui perancangan rangkaian PhET DC dan studi kasus hemat energi di SMA Negeri 4 Bogor.',
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: 'Diskusi telaah modul ajar Listrik Arus Searah berbasis inkuiri dan desain LKPD simulasi sirkuit DC PhET',
        indikatorKeberhasilan: 'Modul ajar dilengkapi skenario PhET DC, studi kasus kelistrikan rumah, dan lembar asesmen otentik',
        waktu: '12 Agustus 2025',
        penanggungJawab: 'Kusnandar, M.Si & Sondang Asih Januarti, S.Pd.',
      },
      {
        id: 2,
        kegiatanPembinaan: 'Simulasi coaching pra-observasi dan pemantapan teknik bertanya pemantik Hukum Kirchhoff (HOTS)',
        indikatorKeberhasilan: 'Guru mahir memantik nalar murid saat menyelidiki arus masuk sama dengan arus keluar di percabangan',
        waktu: '19 Agustus 2025',
        penanggungJawab: 'Kusnandar, M.Si',
      },
      {
        id: 3,
        kegiatanPembinaan: 'Observasi kelas kolaboratif di kelas XI-Fisika SMA Negeri 4 Bogor dan survei kepuasan belajar murid',
        indikatorKeberhasilan: 'Skor observasi mencapai kategori Sangat Berkembang (>90%)',
        waktu: '28 Agustus 2025',
        penanggungJawab: 'Kusnandar, M.Si & Dra. Hj. Yeni Suryani, M.Pd.',
      },
      {
        id: 4,
        kegiatanPembinaan: 'Refleksi pasca-observasi, pengolahan data dampak, dan perumusan rencana pengimbasan di MGMP',
        indikatorKeberhasilan: 'Laporan praktik baik siap disajikan pada MGMP Fisika Kota Bogor',
        waktu: '04 September 2025',
        penanggungJawab: 'Sondang Asih Januarti, S.Pd. & Kusnandar, M.Si',
      },
    ],
    tandaTangan: {
      pengawas: 'Kusnandar, M.Si',
      kepalaSekolah: 'Dra. Hj. Yeni Suryani, M.Pd.',
      guru: 'Sondang Asih Januarti, S.Pd.',
      tanggalDisepakati: '2025-08-19',
    },
  },
  maknai: {
    tanggal: '2025-08-20',
    coaching: {
      tujuan: 'Saya ingin murid memandang materi Listrik Arus Searah bukan momok rumus Hukum Ohm yang membosankan, tetapi sains aplikatif yang menjelaskan bagaimana smartphone mereka mengisi daya dengan aman dan bagaimana mendesain instalasi kelistrikan yang efisien.',
      realitas: 'Saat ini murid hanya bersemangat selama 10 menit awal pemutaran video mobil listrik, namun kehilangan gairah begitu rumus loop Hukum Kirchhoff diperkenalkan di papan tulis.',
      opsi: 'Mengganti papan rumus kaku dengan simulasi langsung menggunakan PhET Circuit Construction Kit DC dan rangkaian nyata lampu led dengan baterai di atas meja kelompok.',
      komitmen: 'Saya berkomitmen menerapkan LKPD inkuiri rangkaian listrik DC minggu depan, memberi ruang kelompok membedah satu masalah kelistrikan nyata di sekolah, dan meninjau kembali bersama Bapak Pengawas Kusnandar pada 29 Agustus 2025.',
    },
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: 'Rancangan awal uji coba simulasi PhET Circuit Construction Kit DC untuk membuktikan Hukum Ohm secara virtual di Chromebook murid.',
        refleksi: 'Murid sangat bersemangat menggeser slider tegangan baterai dan mengamati nyala lampu, namun instalasi jaringan wi-fi lab memerlukan antisipasi.',
        perbaikanBerikutnya: 'Menyediakan versi offline PhET yang dapat diakses langsung tanpa bergantung koneksi internet.',
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: 'Penerapan rangkaian lampu seri vs paralel dengan penugasan kelompok menganalisis mengapa lampu di rumah tetap menyala saat satu saklar dimatikan.',
        refleksi: 'Sembilan puluh lima persen murid berhasil menarik kesimpulan karakteristik beda potensial dan arus pada rangkaian paralel tanpa instruksi dikte.',
        perbaikanBerikutnya: 'Menambah tantangan pemodelan pengisian daya panel surya mini ke baterai aki 12V.',
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: 'Presentasi unjuk kerja analisis Hukum Kirchhoff pada instalasi kelistrikan stan kantin ramah energi SMA Negeri 4 Bogor.',
        refleksi: 'Murid mampu berargumen ilmiah, saling menanggapi dengan kritis, dan menghitung arus percabangan secara akurat.',
        perbaikanBerikutnya: 'Mempublikasikan foto poster hasil karya murid di papan inovasi sekolah dan portal SIKLUS SAMBUNG.',
      },
    ],
  },
  uji: {
    u1_observasi: {
      tanggal: '2025-08-28',
      hariTanggal: 'Kamis, 28 Agustus 2025',
      tahapObservasi: 'akhir',
      kelas: 'Fase F / Kelas XI-Fisika 1',
      indikatorList: [
        { id: 1, indikator: 'Murid memahami tujuan dan manfaat pembelajaran', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid mampu menyampaikan manfaat belajar Listrik Arus Searah bagi instalasi panel surya dan keamanan gawai.' },
        { id: 2, indikator: 'Murid menyadari proses dan kemajuan belajarnya', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid memeriksa sendiri ceklis kemajuan LKPD di layar tablet kelompok.' },
        { id: 3, indikator: 'Pembelajaran dikaitkan dengan pengalaman murid', dimensi: 'Bermakna', score: 4, catatan: 'Mengaitkan arus pengisian baterai smartphone dan siklus pemakaian powerbank.' },
        { id: 4, indikator: 'Guru memakai konteks kehidupan nyata yang relevan', dimensi: 'Bermakna', score: 4, catatan: 'Studi kasus konsleting listrik perkotaan dan efisiensi panel surya di Bogor.' },
        { id: 5, indikator: 'Suasana aman, positif; murid antusias dan berani mencoba', dimensi: 'Menggembirakan', score: 4, catatan: 'Tidak ada murid yang takut salah merangkai; teman sekelompok saling menopang.' },
        { id: 6, indikator: 'Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri', dimensi: 'Memahami', score: 4, catatan: 'Tiga perwakilan kelompok memaparkan analogi aliran arus seperti aliran air secara orisinal.' },
        { id: 7, indikator: 'Murid menerapkan pengetahuan pada tugas/masalah nyata', dimensi: 'Mengaplikasikan', score: 4, catatan: 'Perhitungan Hukum Kirchhoff pada rangkaian paralel ganda terlaksana dengan sangat teliti.' },
        { id: 8, indikator: 'Murid diberi waktu merefleksikan dan memakai umpan balik', dimensi: 'Merefleksikan', score: 4, catatan: 'Waktu 12 menit dialokasikan untuk menuliskan refleksi di Google Form refleksi.' },
        { id: 9, indikator: 'Murid menghubungkan pengetahuan dengan kehidupan nyata', dimensi: 'Menghubungkan', score: 4, catatan: 'Murid menghubungkan materi dengan peluang karier di bidang teknik elektro dan energi terbarukan.' },
        { id: 10, indikator: 'Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut', dimensi: 'Asesmen & tindak lanjut', score: 4, catatan: 'Umpan balik lisan sangat kaya; tindak lanjut diferensiasi tugas rumah sudah jelas.' },
      ],
      totalSkor: 40,
      persentaseCapaian: 100.0,
      apaYangDialamiMurid: 'Murid mengalami pembelajaran listrik arus searah yang hidup, penuh rasa ingin tahu, aktif berdiskusi tanpa beban hafalan rumus, dan bangga saat berhasil merancang sirkuit yang berfungsi sempurna.',
      kekuatanDanRekomendasi: 'Kekuatan: Integrasi teknologi simulasi PhET DC dan stimulasi pertanyaan inkuiri sangat berbobot. Rekomendasi: Modul ajar ini layak dijadikan acuan Best Practice pengawas di sekolah binaan Kota Bogor.',
    },
    u2_angketMurid: {
      kodeMuridKelas: 'XI-Fisika 1 SMA Negeri 4 Bogor (36 Responden)',
      tanggal: '2025-08-28',
      jumlahResponden: 36,
      items: [
        { id: 1, pernyataan: 'Saya memahami tujuan dan manfaat pelajaran ini.', skorRataRata: 3.9, persentaseSetuju: 100.0 },
        { id: 2, pernyataan: 'Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.', skorRataRata: 3.8, persentaseSetuju: 94.4 },
        { id: 3, pernyataan: 'Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.', skorRataRata: 3.9, persentaseSetuju: 97.2 },
        { id: 4, pernyataan: 'Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.', skorRataRata: 4.0, persentaseSetuju: 100.0 },
        { id: 5, pernyataan: 'Saya merasa aman, senang, dan bersemangat selama pelajaran.', skorRataRata: 3.9, persentaseSetuju: 97.2 },
      ],
      halPalingBermakna: 'Saat kelompok kami menyusun rangkaian lampu paralel dan menghitung arus di PhET lalu mengujinya pada breadboard nyata, ternyata listrik itu logis dan menyenangkan!',
      kesulitanMurid: 'Menentukan arah loop arus pada Hukum Kirchhoff II jika terdapat lebih dari dua sumber tegangan baterai.',
    },
    matriksAfter: {
      peranGuru: 'Fasilitator inkuiri, pemandu eksplorasi simulasi sirkuit PhET DC, dan coach yang memantik nalar murid.',
      aktivitasMurid: 'Bereksplorasi dengan simulator PhET DC, berdebat ilmiah dalam kelompok, dan mempresentasikan skema rangkaian.',
      konteksNyata: 'Konteks nyata: baterai smartphone, sistem aki kendaraan, instalasi panel surya, dan pencegahan korsleting.',
      refleksiMurid: 'Refleksi terstruktur 10-15 menit di setiap pertemuan melalui formulir digital refleksi diri.',
    },
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: 'Peran guru',
        sebelumSambung: 'Penceramah dominan di depan kelas, mendiktekan rumus Hukum Ohm dan menghitung contoh soal di papan tulis.',
        setelahSambung: 'Fasilitator inkuiri, pemandu eksplorasi simulasi sirkuit DC, dan coach yang memantik nalar murid.',
        buktiKode: 'BKT-01 (Rekaman Video & Foto Kelas SMAN 4)',
      },
      {
        aspek: 'Aktivitas murid',
        sebelumSambung: 'Menyalin tulisan di papan, mencatat rumus tanpa berdialog, pasif menunggu jam pelajaran selesai.',
        setelahSambung: 'Bereksplorasi dengan simulator PhET DC, berdebat ilmiah dalam kelompok, dan mempresentasikan skema rangkaian.',
        buktiKode: 'BKT-02 (LKPD Kelompok & Laporan Praktik)',
      },
      {
        aspek: 'Konteks kehidupan nyata',
        sebelumSambung: 'Soal teks abstrak berupa kawat penghantar tanpa konteks gawai atau perangkat rumah.',
        setelahSambung: 'Konteks nyata: baterai smartphone, sistem aki kendaraan, instalasi panel surya, dan pencegahan korsleting.',
        buktiKode: 'BKT-03 (Bahan Ajar Kontekstual SMAN 4)',
      },
      {
        aspek: 'Refleksi murid',
        sebelumSambung: 'Sama sekali tidak ada alokasi waktu refleksi di akhir jam belajar.',
        setelahSambung: 'Refleksi terstruktur 10-15 menit di setiap pertemuan melalui formulir digital refleksi.',
        buktiKode: 'BKT-04 (Rekap Tanggapan Google Form)',
      },
    ],
    dataDampak: getTeacherDescriptiveDataDampak('Sondang Asih Januarti, S.Pd.', 'Fisika', 'SMAN 4 Bogor'),
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: 'Tiga murid dengan gaya belajar kinestetik masih memerlukan panduan membaca kode warna resistor analog.',
        tindakLanjut: 'Menyediakan kartu tabel kode warna cepat dan pendampingan tutor sebaya pada sesi klinik fisika SMAN 4 Bogor.',
        penanggungJawab: 'Sondang Asih Januarti, S.Pd.',
        waktu: '02 September 2025',
        hasil: 'Ketiga murid mencapai ketuntasan KKTP pada asesmen ulang praktik.',
      },
      {
        id: 2,
        temuanSupervisi: 'Dokumentasi video pembelajaran praktik baik kelistrikan DC perlu diedit untuk diseminasi daring.',
        tindakLanjut: 'Menyusun video dokumenter praktik baik 7 menit dan mengunggahnya ke YouTube & PMM.',
        penanggungJawab: 'Sondang Asih Januarti & Tim Multimedia SMAN 4 Bogor',
        waktu: '10 September 2025',
        hasil: 'Video telah ditonton oleh lebih dari 500 pendidik SMA se-Jawa Barat.',
      },
      {
        id: 3,
        temuanSupervisi: 'Pengembangan LKPD rangkaian listrik untuk bab berikutnya (Kemagnetan & Induksi Elektromagnetik).',
        tindakLanjut: 'Merancang lembar eksplorasi motor listrik sederhana dan generator mini.',
        penanggungJawab: 'Sondang Asih Januarti & Pengawas Pembina',
        waktu: '15 September 2025',
        hasil: 'Modul ajar bab elektromagnetik selesai dan disetujui pengawas pembina.',
      },
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: 'Inovasi Pembelajaran Listrik Arus Searah Berbasis Simulasi PhET DC & Pendekatan SAMBUNG',
        sasaran: 'Guru Fisika SMA Negeri dan Swasta se-Kota Bogor',
        bentuk: 'Workshop Tatap Muka MGMP Fisika di SMAN 2 Bogor',
        waktu: '18 September 2025',
      },
      {
        id: 2,
        praktikBaik: 'Penyusunan Asesmen Formatif Otentik Berorientasi Suara Murid (Student Voice)',
        sasaran: 'Komunitas Belajar (Kombel) Guru SMA Negeri 4 Bogor',
        bentuk: 'Diseminasi Internal In-House Training (IHT)',
        waktu: '25 September 2025',
      },
    ],
  },
  lastUpdated: '2025-09-28T10:00:00.000Z',
};

/**
 * Rich realistic SAMBUNG Data for Teacher 2: Ahmad Fauzi, S.Pd. (Bahasa Indonesia)
 */
export const SEED_SAMBUNG_AHMAD: SambungData = {
  selidiki: {
    tanggal: '2025-08-15',
    items: [
      {
        id: 1,
        aspek: 'Tujuan dan kesadaran murid tentang belajar',
        kondisiAwal: 'Murid menganggap teks anekdot sebatas lelucon lucu tanpa menyadari fungsinya sebagai kritik sosial yang santun dan konstruktif.',
        bukti: 'Hasil tulisan awal murid kelas X-4',
        kebutuhanPembinaan: 'Mengarahkan murid memahami etika komunikasi publik dan analisis isu kebijakan di lingkungan terdekat.',
        isPrioritas: true,
      },
      {
        id: 2,
        aspek: 'Konteks kehidupan nyata',
        kondisiAwal: 'Contoh anekdot diambil dari buku teks terbitan lama yang tidak relevan dengan fenomena sosial remaja saat ini.',
        bukti: 'Modul Ajar Bahasa Indonesia 2024',
        kebutuhanPembinaan: 'Memanfaatkan isu nyata: pengelolaan sampah sekolah, antrean kantin digital, dan etika bermedia sosial.',
        isPrioritas: true,
      },
      {
        id: 3,
        aspek: 'Aktivitas memahami dan mengaplikasikan',
        kondisiAwal: 'Murid menyalin pola teks yang sudah ada tanpa berkreasi membuat naskah anekdot orisinal.',
        bukti: 'Buku Catatan Murid',
        kebutuhanPembinaan: 'Menyelenggarakan simulasi mini Stand-up Comedy atau komik strip digital.',
      },
      {
        id: 4,
        aspek: 'Aktivitas merefleksikan dan menghubungkan',
        kondisiAwal: 'Evaluasi hanya menilai kelengkapan struktur orientasi-krisis-koda tanpa refleksi nilai moral.',
        bukti: 'Daftar Nilai Kognitif',
        kebutuhanPembinaan: 'Menerapkan lembar refleksi pesan tersirat dan empati sosial.',
      },
      {
        id: 5,
        aspek: 'Suasana menggembirakan',
        kondisiAwal: 'Sebagian murid malu membacakan karyanya di depan kelas karena takut ditertawakan.',
        bukti: 'Catatan Observasi Awal Guru',
        kebutuhanPembinaan: 'Membangun iklim kelas yang aman, apresiatif, dan saling mendukung.',
      },
      {
        id: 6,
        aspek: 'Asesmen dan tindak lanjut',
        kondisiAwal: 'Koreksi guru memakan waktu lama sehingga umpan balik terlambat diterima murid.',
        bukti: 'Portofolio Teks Murid',
        kebutuhanPembinaan: 'Menerapkan rubrik penilaian antarteman (peer-review) dengan panduan kriteria jelas.',
      },
    ],
    catatanPrioritas: 'Prioritas pada Aspek 1 (Etika kritik santun) dan Aspek 3 (Kreativitas produksi teks orisinal).',
    matriksBefore: {
      peranGuru: 'Mengoreksi kesalahan tata bahasa secara mekanis dengan tinta merah dan dominan ceramah kaidah kebahasaan satu arah.',
      aktivitasMurid: 'Mengerjakan LKS menjawab pertanyaan 5W+1H dari teks anekdot asing tanpa ruang berkreasi mandiri.',
      konteksNyata: 'Mengulang kisah fiktif klasik tanpa refleksi kondisi kekinian atau fenomena sekitar lingkungan murid.',
      refleksiMurid: 'Hanya ada pertanyaan singkat formalitas: "Ada yang mau ditanyakan sebelum pulang?", tanpa penarikan makna.',
    },
  },
  arahkan: {
    periode: 'Semester Ganjil 2025/2026',
    fokusPerubahan: 'Meningkatkan keterampilan berpikir kritis dan kesantunan berbahasa murid melalui penulisan teks anekdot berbasis fakta sosial dan komik digital.',
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: 'Penyelarasan modul ajar teks anekdot dengan integrasi nilai profil pelajar Pancasila (Kritis & Kreatif)',
        indikatorKeberhasilan: 'Modul ajar memuat rubrik diferensiasi produk (naskah panggung / komik strip)',
        waktu: '18 Agustus 2025',
        penanggungJawab: 'Kusnandar, M.Si & Ahmad Fauzi',
      },
      {
        id: 2,
        kegiatanPembinaan: 'Coaching teknik fasilitasi diskusi isu kontemporer tanpa memicu ujaran kebencian',
        indikatorKeberhasilan: 'Guru menguasai strategi de-eskalasi emosi dan framing kritik konstruktif',
        waktu: '25 Agustus 2025',
        penanggungJawab: 'Kusnandar, M.Si',
      },
      {
        id: 3,
        kegiatanPembinaan: 'Observasi kelas penulisan kolaboratif dan pameran karya mini (Gallery Walk)',
        indikatorKeberhasilan: 'Seluruh kelompok menyelesaikan komik anekdot dengan pesan positif',
        waktu: '08 September 2025',
        penanggungJawab: 'Kusnandar, M.Si & Tim Pengembang SMAS Rimba Madya',
      },
    ],
    tandaTangan: {
      pengawas: 'Kusnandar, M.Si',
      kepalaSekolah: 'Pajar Hariyanto, S.Pd.',
      guru: 'Ivany Ratna Ekandini, S.Pd.',
      tanggalDisepakati: '2025-08-25',
    },
  },
  maknai: {
    tanggal: '2025-08-26',
    coaching: {
      tujuan: 'Saya ingin murid berani bersuara kritis terhadap persoalan di sekitarnya, namun tetap menjunjung tinggi budi pekerti dan kesantunan bahasa Indonesia.',
      realitas: 'Murid sering kali kebablasan menyindir teman secara personal ketika diminta membuat lelucon, atau sebaliknya menulis cerita yang sama sekali tidak ada sindiran sosialnya.',
      opsi: 'Menggunakan koran daring lokal sebagai pemantik fakta dan menyepakati aturan main: kritik terhadap sistem atau fenomena, bukan fisik individu.',
      komitmen: 'Saya akan memfasilitasi riset fakta mini 15 menit dan menerapkan rubrik kesantunan peer-review pada pertemuan minggu depan.',
    },
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: 'Rancangan telaah berita aktual tentang antrean transportasi umum sebagai basis cerita anekdot.',
        refleksi: 'Murid antusias menghubungkan pengalaman pribadi saat naik bus kota dengan struktur anekdot.',
        perbaikanBerikutnya: 'Mempertegas bagian koda (penutup) agar pesan moral tersampaikan lugas.',
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: 'Penggunaan aplikasi Canva untuk memformat anekdot dalam bentuk komik strip 4 panel.',
        refleksi: 'Hasil visual sangat variatif dan menarik, murid yang tadinya pendiam menjadi sangat ekspresif lewat gambar komik.',
        perbaikanBerikutnya: 'Menjaga keseimbangan antara keindahan visual dan ketajaman sindiran teks anekdot.',
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: 'Pameran karya kelas Gallery Walk di mana setiap meja memajang komik dan murid lain menempelkan sticky notes apresiasi.',
        refleksi: 'Kelas dipenuhi tawa positif dan apresiasi konstruktif; tingkat keterlibatan mencapai 100%.',
        perbaikanBerikutnya: 'Mengumpulkan karya komik menjadi sebuah antologi digital e-Book perpustakaan sekolah.',
      },
    ],
  },
  uji: {
    u1_observasi: {
      tanggal: '2025-09-08',
      hariTanggal: 'Senin, 08 September 2025',
      tahapObservasi: 'akhir',
      kelas: 'Fase E / Kelas X-4',
      indikatorList: [
        { id: 1, indikator: 'Murid memahami tujuan dan manfaat pembelajaran', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid mengerti pentingnya etika kritik santun dalam demokrasi.' },
        { id: 2, indikator: 'Murid menyadari proses dan kemajuan belajarnya', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid aktif mencocokkan draft dengan rubrik penulisan di layar.' },
        { id: 3, indikator: 'Pembelajaran dikaitkan dengan pengalaman murid', dimensi: 'Bermakna', score: 4, catatan: 'Topik antrean kantin dan PR menumpuk diangkat secara jenaka.' },
        { id: 4, indikator: 'Guru memakai konteks kehidupan nyata yang relevan', dimensi: 'Bermakna', score: 4, catatan: 'Berita layanan publik Kota Bogor dijadikan sumber data inspirasi.' },
        { id: 5, indikator: 'Suasana aman, positif; murid antusias dan berani mencoba', dimensi: 'Menggembirakan', score: 4, catatan: 'Tawa ceria terdengar riuh namun tetap kondusif dan saling menghargai.' },
        { id: 6, indikator: 'Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri', dimensi: 'Memahami', score: 4, catatan: 'Murid fasih menjelaskan perbedaan anekdot dengan lelucon slapstick biasa.' },
        { id: 7, indikator: 'Murid menerapkan pengetahuan pada tugas/masalah nyata', dimensi: 'Mengaplikasikan', score: 4, catatan: 'Komik strip yang dihasilkan sarat kritik membangun dan bernilai artistik tinggi.' },
        { id: 8, indikator: 'Murid diberi waktu merefleksikan dan memakai umpan balik', dimensi: 'Merefleksikan', score: 3, catatan: 'Umpan balik antarteman berjalan lancar dengan catatan saran membangun.' },
        { id: 9, indikator: 'Murid menghubungkan pengetahuan dengan kehidupan nyata', dimensi: 'Menghubungkan', score: 4, catatan: 'Murid menghubungkan keterampilan menulis ini dengan literasi media sosial.' },
        { id: 10, indikator: 'Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut', dimensi: 'Asesmen & tindak lanjut', score: 4, catatan: 'Pemberian apresiasi verbal sangat tepat sasaran.' },
      ],
      totalSkor: 39,
      persentaseCapaian: 97.5,
      apaYangDialamiMurid: 'Murid merasa suaranya didengar dan dihargai, menemukan bahwa mengkritik kondisi sosial bisa dilakukan secara elegan, jenaka, dan mencerahkan.',
      kekuatanDanRekomendasi: 'Kekuatan: Iklim kelas yang inklusif dan integrasi literasi digital Canva yang sangat efektif. Rekomendasi: Sebarkan format antologi komik ini ke sekolah-sekolah lain.',
    },
    u2_angketMurid: {
      kodeMuridKelas: 'X-4 (34 Responden)',
      tanggal: '2025-09-08',
      jumlahResponden: 34,
      items: [
        { id: 1, pernyataan: 'Saya memahami tujuan dan manfaat pelajaran ini.', skorRataRata: 3.9, persentaseSetuju: 100.0 },
        { id: 2, pernyataan: 'Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.', skorRataRata: 3.8, persentaseSetuju: 97.1 },
        { id: 3, pernyataan: 'Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.', skorRataRata: 3.7, persentaseSetuju: 94.1 },
        { id: 4, pernyataan: 'Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.', skorRataRata: 3.9, persentaseSetuju: 97.1 },
        { id: 5, pernyataan: 'Saya merasa aman, senang, dan bersemangat selama pelajaran.', skorRataRata: 4.0, persentaseSetuju: 100.0 },
      ],
      halPalingBermakna: 'Bisa menyampaikan keresahan tentang fasilitas sekolah lewat gambar komik lucu tanpa takut dimarahi guru.',
      kesulitanMurid: 'Mencari punchline (kelucuan) yang tetap sopan dan bermakna mendalam.',
    },
    matriksAfter: {
      peranGuru: 'Menjadi kurator karya kreatif, fasilitator dialog ide bernalar kritis, dan coach proses belajar.',
      aktivitasMurid: 'Melakukan riset fakta riil, menggambar komik strip di Canva, dan saling memberi umpan balik apresiatif.',
      konteksNyata: 'Mengangkat isu nyata kebiasaan membuang sampah, etika antre kantin, dan budaya bermedia sosial.',
      refleksiMurid: 'Formulir refleksi kesadaran diri: "Pelajaran moral apa yang saya petik dari karya teman saya?".',
    },
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: 'Peran guru',
        sebelumSambung: 'Mengoreksi kesalahan tata bahasa secara mekanis dengan tinta merah.',
        setelahSambung: 'Menjadi kurator karya kreatif dan fasilitator dialog ide bernalar kritis.',
        buktiKode: 'BKT-IND-01 (Portofolio Komik Kelas)',
      },
      {
        aspek: 'Aktivitas murid',
        sebelumSambung: 'Mengerjakan LKS menjawab pertanyaan 5W+1H dari teks anekdot asing.',
        setelahSambung: 'Melakukan riset fakta, menggambar komik strip, dan saling memberi umpan balik apresiatif.',
        buktiKode: 'BKT-IND-02 (Pameran Sticky Notes)',
      },
      {
        aspek: 'Konteks kehidupan nyata',
        sebelumSambung: 'Mengulang kisah Nasruddin Hoja tanpa refleksi kondisi kekinian.',
        setelahSambung: 'Mengangkat persoalan nyata kebiasaan membuang sampah, etika antre, dan budaya gadget.',
        buktiKode: 'BKT-IND-03 (Bahan Berita Aktual)',
      },
      {
        aspek: 'Refleksi murid',
        sebelumSambung: 'Hanya ada pertanyaan: "Ada yang mau ditanyakan sebelum pulang?".',
        setelahSambung: 'Formulir refleksi kesadaran diri: "Pelajaran moral apa yang saya petik dari karya teman saya?".',
        buktiKode: 'BKT-IND-04 (Buku Refleksi Siswa)',
      },
    ],
    dataDampak: getTeacherDescriptiveDataDampak('Ivany Ratna Ekandini, S.Pd.', 'Bahasa Indonesia', 'SMAS Rimba Madya'),
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: 'Dua naskah komik perlu perbaikan ejaan tanda baca dialog langsung.',
        tindakLanjut: 'Bimbingan kilat kaidah PUEBI tanda petik dalam kalimat langsung.',
        penanggungJawab: 'Ivany Ratna Ekandini, S.Pd.',
        waktu: '11 September 2025',
        hasil: 'Naskah diperbaiki sempurna oleh siswa yang bersangkutan.',
      },
      {
        id: 2,
        temuanSupervisi: 'Penyusunan e-Book antologi digital komik anekdot murid.',
        tindakLanjut: 'Penggabungan file PDF ber-ISBN di bawah binaan perpustakaan sekolah.',
        penanggungJawab: 'Ivany Ratna Ekandini & Tim Literasi SMAS Rimba Madya',
        waktu: '20 September 2025',
        hasil: 'e-Book terbit dan dapat diunduh di website sekolah.',
      },
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: 'Literasi Menyenangkan: Mengubah Teks Anekdot Menjadi Komik Bernalar Kritis dengan SAMBUNG',
        sasaran: 'Guru Bahasa Indonesia SMA Se-Wilayah VII Jawa Barat',
        bentuk: 'Webinar Berbagi Praktik Baik PMM',
        waktu: '27 September 2025',
      },
    ],
  },
  lastUpdated: '2025-09-28T10:00:00.000Z',
};

/**
 * Rich realistic SAMBUNG Data for Teacher 3: Siti Nurhaliza, M.Pd. (Matematika)
 */
export const SEED_SAMBUNG_SITI: SambungData = {
  selidiki: {
    tanggal: '2025-09-01',
    items: [
      {
        id: 1,
        aspek: 'Tujuan dan kesadaran murid tentang belajar',
        kondisiAwal: 'Murid menganggap materi eksponensial hanya latihan hitung pangkat tanpa mengetahui relevansinya dengan pertumbuhan populasi dan keuangan perbankan.',
        bukti: 'Pre-test diagnostik kelas X-MIPA 1',
        kebutuhanPembinaan: 'Menghubungkan konsep f(x) = a^x dengan pemodelan bunga majemuk investasi dan penyebaran virus.',
        isPrioritas: true,
      },
      {
        id: 2,
        aspek: 'Konteks kehidupan nyata',
        kondisiAwal: 'Soal buku cetak bersifat angka abstrak murni x dan y.',
        bukti: 'LKS Matematika Edisi Lama',
        kebutuhanPembinaan: 'Memasukkan data riil pertumbuhan bakteri dan simulasi cicilan perbankan.',
        isPrioritas: true,
      },
      {
        id: 3,
        aspek: 'Aktivitas memahami dan mengaplikasikan',
        kondisiAwal: 'Murid menggambar grafik secara manual di kertas berpetak yang memakan waktu lama.',
        bukti: 'Lembar Pekerjaan Rumah',
        kebutuhanPembinaan: 'Mengintegrasikan perangkat lunak dinamis GeoGebra Classroom di tablet/laptop.',
      },
      {
        id: 4,
        aspek: 'Aktivitas merefleksikan dan menghubungkan',
        kondisiAwal: 'Tidak ada sesi menarik simpulan bersama tentang makna fisis kurva pertumbuhan eksponensial.',
        bukti: 'Jurnal Harian Guru',
        kebutuhanPembinaan: 'Merancang lembar refleksi grafik: "Apa yang terjadi jika basis nilai a < 1 vs a > 1?".',
      },
      {
        id: 5,
        aspek: 'Suasana menggembirakan',
        kondisiAwal: 'Murid tegang karena persepsi bahwa matematika itu rumit dan penuh hafalan rumus.',
        bukti: 'Wawancara Siswa Awal',
        kebutuhanPembinaan: 'Eksplorasi visual interaktif dengan slider GeoGebra yang menyenangkan.',
      },
      {
        id: 6,
        aspek: 'Asesmen dan tindak lanjut',
        kondisiAwal: 'Asesmen hanya menguji kemampuan aljabar tanpa menguji nalar pemodelan grafik.',
        bukti: 'Kuis Bab 1',
        kebutuhanPembinaan: 'Asesmen unjuk kerja pemodelan data nyata dengan GeoGebra.',
      },
    ],
    catatanPrioritas: 'Prioritas pada Aspek 2 (Konteks kehidupan nyata) dan Aspek 3 (Aplikasi GeoGebra).',
    matriksBefore: {
      peranGuru: 'Mencontohkan cara berhitung rumus manual di papan tulis dan murid mencatat berulang kali.',
      aktivitasMurid: 'Mengeplot titik koordinat secara manual dengan pensil dan penggaris berjam-jam tanpa analisis makna.',
      konteksNyata: 'Soal abstrak f(x) = 2^x tanpa kaitan dengan realitas kehidupan dan aplikasi dunia nyata.',
      refleksiMurid: 'Tidak pernah ada refleksi; murid langsung berkemas setelah bel berbunyi tanpa penarikan intisari belajar.',
    },
  },
  arahkan: {
    periode: 'Semester Ganjil 2025/2026',
    fokusPerubahan: 'Meningkatkan literasi numerasi dan daya nalar matematis murid pada fungsi eksponen melalui pemodelan visual GeoGebra dan studi kasus pertumbuhan data riil.',
    kegiatan: [
      {
        id: 1,
        kegiatanPembinaan: 'Penyusunan modul ajar matematika diferensiasi dengan Lembar Kerja GeoGebra Classroom',
        indikatorKeberhasilan: 'Modul ajar dilengkapi tautan simulasi interaktif yang siap pakai di gawai murid',
        waktu: '05 September 2025',
        penanggungJawab: 'Kusnandar, M.Si & Siti Salma, S.Pd',
      },
      {
        id: 2,
        kegiatanPembinaan: 'Coaching reflektif strategi Scaffolding bagi murid yang mengalami hambatan berhitung',
        indikatorKeberhasilan: 'Guru terampil memberikan panduan bertahap tanpa mendikte jawaban akhir',
        waktu: '12 September 2025',
        penanggungJawab: 'Kusnandar, M.Si',
      },
      {
        id: 3,
        kegiatanPembinaan: 'Observasi kelas kolaboratif dan analisis respons belajar murid melalui dashboard GeoGebra',
        indikatorKeberhasilan: 'Seluruh murid berhasil memodelkan kurva pertumbuhan mikroorganisme',
        waktu: '20 September 2025',
        penanggungJawab: 'Kusnandar, M.Si & Pengawas',
      },
    ],
    tandaTangan: {
      pengawas: 'Kusnandar, M.Si',
      kepalaSekolah: 'Joko Pitoyo, S.Pd., M.M.',
      guru: 'Siti Salma, S.Pd',
      tanggalDisepakati: '2025-09-12',
    },
  },
  maknai: {
    tanggal: '2025-09-13',
    coaching: {
      tujuan: 'Saya ingin murid tersenyum ketika belajar matematika, memahami bahwa grafik eksponen ada di setiap aspek kehidupan: dari pertumbuhan tanaman hingga investasi masa depan mereka.',
      realitas: 'Murid sering menghabiskan 30 menit hanya untuk mengeplot titik di kertas grafik dan lelah sebelum mereka sempat menganalisis maknanya.',
      opsi: 'Membiarkan komputer GeoGebra menangani plot titik secara instan, sehingga waktu murid dialihkan sepenuhnya untuk menganalisis perilaku grafik dan tren pertumbuhan.',
      komitmen: 'Saya akan menerapkan lembar kerja GeoGebra interaktif dan memberi ruang bagi murid memprediksi masa depan berdasarkan tren grafik pada pertemuan 20 September.',
    },
  },
  berdayakan: {
    siklusList: [
      {
        siklus: 1,
        rancanganDanUjiCoba: 'Pengenalan fungsi eksponen dasar menggunakan simulasi lipatan kertas A4 (2^n).',
        refleksi: 'Murid sangat takjub melihat ketebalan kertas membubung tinggi hanya dalam 10 kali lipatan.',
        perbaikanBerikutnya: 'Menghubungkan langsung hasil lipatan kertas ke dalam tabel nilai x dan y di GeoGebra.',
      },
      {
        siklus: 2,
        rancanganDanUjiCoba: 'Penggunaan slider nilai a pada fungsi f(x) = a^x di GeoGebra Classroom.',
        refleksi: 'Murid berebut menggeser slider dan langsung memahami mengapa kurva naik tajam jika a > 1 dan melandai turun jika 0 < a < 1.',
        perbaikanBerikutnya: 'Menyediakan kasus peluruhan radioaktif bagi kelompok yang tuntas lebih cepat (pengayaan).',
      },
      {
        siklus: 3,
        rancanganDanUjiCoba: 'Projek mini menghitung saldo investasi tabungan rencana dengan bunga majemuk.',
        refleksi: 'Literasi keuangan murid meningkat drastis; murid mampu membandingkan skema perbankan secara kritis.',
        perbaikanBerikutnya: 'Mengunggah rekaman layar presentasi pemodelan murid sebagai portofolio digital.',
      },
    ],
  },
  uji: {
    u1_observasi: {
      tanggal: '2025-09-20',
      hariTanggal: 'Sabtu, 20 September 2025',
      tahapObservasi: 'akhir',
      kelas: 'Fase E / Kelas X-MIPA 1',
      indikatorList: [
        { id: 1, indikator: 'Murid memahami tujuan dan manfaat pembelajaran', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid memahami kegunaan grafik eksponen dalam memprediksi data masa depan.' },
        { id: 2, indikator: 'Murid menyadari proses dan kemajuan belajarnya', dimensi: 'Berkesadaran', score: 4, catatan: 'Murid memantau progres tugas langsung pada dashboard interaktif.' },
        { id: 3, indikator: 'Pembelajaran dikaitkan dengan pengalaman murid', dimensi: 'Bermakna', score: 4, catatan: 'Koneksi dengan tabungan masa depan dan laju populasi sangat kuat.' },
        { id: 4, indikator: 'Guru memakai konteks kehidupan nyata yang relevan', dimensi: 'Bermakna', score: 4, catatan: 'Data resmi pertumbuhan populasi BPS dijadikan studi kasus.' },
        { id: 5, indikator: 'Suasana aman, positif; murid antusias dan berani mencoba', dimensi: 'Menggembirakan', score: 4, catatan: 'Suasana kelas sangat dinamis tanpa ada rasa takut terhadap matematika.' },
        { id: 6, indikator: 'Murid mengeksplorasi dan menjelaskan konsep dengan kata sendiri', dimensi: 'Memahami', score: 4, catatan: 'Murid lancar menguraikan makna asimtot datar dengan bahasa sendiri.' },
        { id: 7, indikator: 'Murid menerapkan pengetahuan pada tugas/masalah nyata', dimensi: 'Mengaplikasikan', score: 4, catatan: 'Pemodelan eksponensial di GeoGebra akurat dan tuntas tepat waktu.' },
        { id: 8, indikator: 'Murid diberi waktu merefleksikan dan memakai umpan balik', dimensi: 'Merefleksikan', score: 4, catatan: 'Umpan balik personal saat murid mengeksplorasi slider sangat efektif.' },
        { id: 9, indikator: 'Murid menghubungkan pengetahuan dengan kehidupan nyata', dimensi: 'Menghubungkan', score: 4, catatan: 'Mengaitkan peluruhan eksponensial dengan efektivitas obat dalam darah.' },
        { id: 10, indikator: 'Guru memakai asesmen formatif, umpan balik, dan merencanakan tindak lanjut', dimensi: 'Asesmen & tindak lanjut', score: 4, catatan: 'Kuis singkat 3 soal pemodelan dikerjakan dengan hasil sangat memuaskan.' },
      ],
      totalSkor: 40,
      persentaseCapaian: 100.0,
      apaYangDialamiMurid: 'Murid mengalami sensasi "Aha-moment" saat melihat grafik bergerak mulus di GeoGebra, merasa matematika itu logis, masuk akal, dan aplikatif.',
      kekuatanDanRekomendasi: 'Kekuatan: Integrasi teknologi GeoGebra sangat matang dan terencana. Rekomendasi: Disarankan menjadi narasumber pelatihan guru matematika tingkat kota.',
    },
    u2_angketMurid: {
      kodeMuridKelas: 'X-MIPA 1 (35 Responden)',
      tanggal: '2025-09-20',
      jumlahResponden: 35,
      items: [
        { id: 1, pernyataan: 'Saya memahami tujuan dan manfaat pelajaran ini.', skorRataRata: 4.0, persentaseSetuju: 100.0 },
        { id: 2, pernyataan: 'Saya mengerti materi dan dapat menjelaskannya dengan kata-kata sendiri.', skorRataRata: 3.8, persentaseSetuju: 94.3 },
        { id: 3, pernyataan: 'Saya dapat menggunakan pengetahuan ini untuk menyelesaikan tugas atau masalah nyata.', skorRataRata: 3.9, persentaseSetuju: 97.1 },
        { id: 4, pernyataan: 'Saya dapat menghubungkan materi ini dengan kehidupan sehari-hari saya.', skorRataRata: 4.0, persentaseSetuju: 100.0 },
        { id: 5, pernyataan: 'Saya merasa aman, senang, dan bersemangat selama pelajaran.', skorRataRata: 4.0, persentaseSetuju: 100.0 },
      ],
      halPalingBermakna: 'Menggeser slider GeoGebra dan melihat grafik eksponen langsung melengkung, jadi paham kenapa uang tabungan bisa berlipat ganda dengan bunga majemuk.',
      kesulitanMurid: 'Menyusun model matematika jika variabel waktu t dinyatakan dalam hitungan bulan bukan tahun.',
    },
    matriksAfter: {
      peranGuru: 'Fasilitator simulasi digital yang menantang murid memprediksi pola kurva grafik dan tren pertumbuhan.',
      aktivitasMurid: 'Memanipulasi parameter di GeoGebra, menganalisis kecepatan pertumbuhan, dan membandingkan skema finansial.',
      konteksNyata: 'Studi kasus resmi pertumbuhan koloni bakteri biologi dan peramalan investasi bunga majemuk perbankan.',
      refleksiMurid: 'Refleksi komprehensif metakognitif: "Mengapa eksponensial lebih cepat melaju daripada fungsi linier?".',
    },
  },
  nyatakan: {
    beforeAfter: [
      {
        aspek: 'Peran guru',
        sebelumSambung: 'Mencontohkan cara berhitung manual di papan tulis dan murid mencatat berulang kali.',
        setelahSambung: 'Fasilitator simulasi digital yang menantang murid memprediksi pola kurva grafik.',
        buktiKode: 'BKT-MAT-01 (Screenshot Kelas GeoGebra)',
      },
      {
        aspek: 'Aktivitas murid',
        sebelumSambung: 'Mengeplot titik koordinat secara manual dengan pensil dan penggaris berjam-jam.',
        setelahSambung: 'Memanipulasi parameter di gawai, menganalisis kecepatan pertumbuhan, dan membandingkan skema finansial.',
        buktiKode: 'BKT-MAT-02 (Tautan GeoGebra Classroom)',
      },
      {
        aspek: 'Konteks kehidupan nyata',
        sebelumSambung: 'Soal abstrak f(x) = 2^x tanpa kaitan dengan realitas kehidupan.',
        setelahSambung: 'Studi kasus resmi pertumbuhan koloni bakteri biologi dan peramalan investasi perbankan.',
        buktiKode: 'BKT-MAT-03 (LKPD Kontekstual BPS)',
      },
      {
        aspek: 'Refleksi murid',
        sebelumSambung: 'Tidak pernah ada refleksi; murid langsung bubar setelah bel berbunyi.',
        setelahSambung: 'Refleksi komprehensif: "Mengapa eksponensial lebih cepat melaju daripada fungsi linier?".',
        buktiKode: 'BKT-MAT-04 (Papan Refleksi Jamboard)',
      },
    ],
    dataDampak: getTeacherDescriptiveDataDampak('Siti Salma, S.Pd', 'Fisika', 'SMAS YPHB'),
  },
  gerakkan: {
    tindakLanjut: [
      {
        id: 1,
        temuanSupervisi: 'Dua siswa memerlukan gawai cadangan saat baterai tablet habis.',
        tindakLanjut: 'Menyediakan fasilitas charging station dan dua unit Chromebook cadangan di ruang kelas.',
        penanggungJawab: 'Siti Nurhaliza & Laboran Komputer',
        waktu: '22 September 2025',
        hasil: 'Kesiapan fasilitas gawai di kelas mencapai 100%.',
      },
      {
        id: 2,
        temuanSupervisi: 'Integrasi materi lanjutan logaritma dengan data gempa bumi skala Richter.',
        tindakLanjut: 'Merancang lembar aktivitas interaktif hubungan fungsi eksponen dan logaritma.',
        penanggungJawab: 'Siti Nurhaliza, M.Pd.',
        waktu: '26 September 2025',
        hasil: 'LKPD logaritma selesai dan siap digunakan pekan depan.',
      },
    ],
    pengimbasan: [
      {
        id: 1,
        praktikBaik: 'Digitalisasi Pembelajaran Eksponen dengan GeoGebra Classroom Berbasis Strategi SAMBUNG',
        sasaran: 'Seluruh Guru Matematika SMA Binaan Pengawas Kusnandar, M.Si',
        bentuk: 'Pelatihan Daring & Berbagi Aksi Nyata PMM',
        waktu: '03 Oktober 2025',
      },
    ],
  },
  lastUpdated: '2025-09-28T10:00:00.000Z',
};
