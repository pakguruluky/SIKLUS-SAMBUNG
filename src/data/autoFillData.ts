import { 
  Supervision, 
  SambungData, 
  SambungKegiatanAksi, 
  SambungMaknaiData, 
  SambungMaknaiPertanyaanList,
  SambungBerdayakanData,
  SambungSiklusBerdayakan,
  SambungUjiData,
  SambungUjiPraObservasi,
  SambungUjiObservasiPelaksanaan,
  SambungUjiPascaObservasi,
  SambungUjiKesimpulanTransformasi,
  SambungObservasiIndikator,
  SambungAngketMuridItem,
  SambungMatriksPerubahan,
  SambungRtlNyatakanItem,
  SambungKesimpulanAlurSambung,
  SambungTindakLanjutItem,
  SambungPengimbasanItem
} from '../types';
import { OBSERVASI_ITEMS } from './instrumentData';
import { 
  getTeacherDescriptiveDataDampak, 
  DEFAULT_DATA_DAMPAK, 
  DEFAULT_MATRIKS_BEFORE, 
  DEFAULT_MATRIKS_AFTER,
  createDefaultSambungForTeacher
} from './sambungSeed';

/**
 * Database Auto-Fill Instrumen Selidiki (Telaah RPP 22 Aspek, Pra-Observasi 8 Pertanyaan, Observasi 25 Aspek,
 * dan 4 Indikator Kesimpulan Selidiki RPP & Observasi) sesuai regulasi dan dokumen resmi pengawas pembina.
 */

export interface TeacherAutoFillData {
  rppUrl: string;
  lessonTitle: string;
  classGrade: string;
  semester: 'Ganjil' | 'Genap';
  
  // 1. Telaah RPP (22 Aspek, Skala 0, 1, 2, NA, Komentar Kritis)
  telaahScores: Record<number, number | 'NA'>;
  telaahComments: Record<number, string>;
  telaahFeedback: {
    kelebihan: string;
    perbaikan: string;
    rekomendasi: string;
  };

  // 2. Pra-Observasi (8 Pertanyaan Sesuai PDF Halaman 8-9)
  praObservasiAnswers: {
    q1_kd_indikator: string; // Tujuan pembelajaran apa yang disajikan & bagaimana dipahami murid
    q2_metode: string;       // Strategi / praktik pedagogis yang dipilih & alasannya
    q3_alat_bahan: string;   // Sumber belajar, media, atau teknologi yang digunakan
    q4_tahapan: string;      // Tahapan pembelajaran untuk memahami, mengaplikasi, merefleksi
    q5_persiapan: string;    // Desain berkesadaran, bermakna, menggembirakan
    q6_materi_sulit: string; // Materi sulit & antisipasi perbedaan murid
    q7_target_kompetensi: string; // Kompetensi & karakter yang diharapkan berkembang
    q8_perhatian_khusus: string;  // Fokus khusus agar murid aktif & bermakna
    supervisorNotes: string;
  };

  // 3. Observasi Pelaksanaan Pembelajaran (25 Aspek, Skala 0, 1, 2, Komentar Kritis)
  observasiScores: Record<string, { score: 0 | 1 | 2; note: string }>;
  observasiFeedback: {
    kelebihan: string;
    peningkatan: string;
    rekomendasi: string;
  };

  // 4. Kesimpulan Selidiki dari RPP dan Observasi (4 Indikator Kunci PDF Halaman 13-14)
  kesimpulanSelidiki: {
    guruBerorientasi: string; // 1. Guru berorientasi pada pengalaman belajar murid
    muridAktif: string;       // 2. Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan
    konteksNyata: string;     // 3. Pembelajaran terhubung dengan konteks nyata
    refleksiMurid: string;    // 4. Pembelajaran membiasakan murid melakukan refleksi
  };
}

export const TEACHER_AUTO_FILL_MAP: Record<string, TeacherAutoFillData> = {
  // 1. FISIKA - Sondang Asih Januarti, S.Pd. (SMAN 4 Bogor)
  fisika: {
    rppUrl: 'https://drive.google.com/file/d/1DemoModulAjarListrikDC/view?usp=sharing',
    lessonTitle: 'Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff',
    classGrade: 'Fase F / Kelas XI-Fisika 1',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
    },
    telaahComments: {
      1: 'Identitas modul lengkap, mencakup alokasi waktu dan fase F yang presisi.',
      2: 'Asesmen diagnostik awal kesiapan kognitif kelistrikan dasar teridentifikasi jelas.',
      3: 'Materi analisis hukum Ohm dan Kirchhoff tersusun runtut dan kontekstual.',
      4: 'Profil Pelajar Bergotong Royong dan Bernalar Kritis tertuang operasional.',
      5: 'Keselarasan tujuan, langkah eksperimen, dan instrumen unjuk kerja sangat padu.',
      7: 'Kata kerja operasional jelas: menganalisis, membuktikan, dan merumuskan.',
      8: 'Model Problem-Based Learning berbantuan simulasi virtual PhET terintegrasi kuat.',
      12: 'Pengalaman MEMAHAMI difasilitasi melalui investigasi hubungan V, I, dan R.',
      13: 'Pengalaman MENGAPLIKASI terwujud dalam perakitan sirkuit tertutup riil.',
      14: 'Pengalaman MEREFLEKSI memandu murid menarik makna efisiensi daya listrik.',
      15: 'Budaya saling memuliakan tercermin dalam pembagian peran kelompok praktikum.',
      16: 'Prinsip pembelajaran bermakna dan menggembirakan tergambar di setiap sintaks.',
      21: 'Rubrik penilaian KKTP memuat indikator objektif ketercapaian kompetensi.'
    },
    telaahFeedback: {
      kelebihan: 'Modul ajar mengintegrasikan konsep kontekstual hemat energi dengan simulasi PhET Circuit Construction Kit DC, rubrik unjuk kerja sangat operasional.',
      perbaikan: 'Perkuat kemitraan dengan teknisi instalasi kelistrikan atau praktisi panel surya untuk pengayaan projek aplikatif murid.',
      rekomendasi: 'Dapat dijadikan model praktik baik (Best Practice) bagi MGMP Fisika SMA Kota Bogor.'
    },
    praObservasiAnswers: {
      q1_kd_indikator: 'Menyelidiki hubungan kuat arus, tegangan, dan hambatan pada rangkaian tertutup serta membuktikan Hukum I dan II Kirchhoff melalui pengamatan empiris.',
      q2_metode: 'Problem-Based Learning dengan pendekatan Deep Learning (Bermakna, Berkesadaran, Menggembirakan) agar murid mengonstruksi pemahaman sains secara mandiri.',
      q3_alat_bahan: 'Simulasi virtual PhET Circuit Construction Kit DC, trainer breadboard rangkaian tertutup, multimeter digital, gawai, dan LKPD Eksploratif.',
      q4_tahapan: 'Pendahuluan kontekstual fenomena sekring rumah, Investigasi kelompok mengukur arus di percabangan, Pembuktian hukum Kirchhoff, Presentasi data, dan Refleksi bersama.',
      q5_persiapan: 'Menghubungkan sains dengan keamanan kelistrikan rumah tangga, membangun interaksi saling memuliakan, dan menyelipkan teka-teki pemantik rasa ingin tahu.',
      q6_materi_sulit: 'Menghitung loop majemuk pada diagram sirkuit; diantisipasi dengan visualisasi grafik interaktif PhET dan bimbingan bertingkat (scaffolding).',
      q7_target_kompetensi: 'Kemampuan bernalar kritis menganalisis data empiris dan gotong royong membagi tugas dalam eksperimen laboratorium.',
      q8_perhatian_khusus: 'Fokus pada keterlibatan murid yang cenderung pasif saat merangkai komponen dan pembagian peran berkeadilan dalam tim.',
      supervisorNotes: 'Rancangan pra-observasi sangat siap dan terstruktur. Fokus observasi kelas pada keaktifan eksperimen kelompok dan interaksi dialogis guru-murid.'
    },
    observasiScores: {
      '1': { score: 2, note: 'Tujuan mencakup nalar kritis dan gotong royong tampak nyata dalam aktivitas praktikum' },
      '2': { score: 2, note: 'Penilaian unjuk kerja terhubung langsung dengan target profil lulusan' },
      '3': { score: 2, note: 'Alur kegiatan sangat terstruktur: apersepsi aki/baterai, praktikum, hingga penarikan kesimpulan' },
      '4': { score: 2, note: 'Keterkaitan konsep kuat arus dengan instalasi kelistrikan rumah sangat kontekstual' },
      '5': { score: 2, note: 'Murid sangat antusias saat simulasi PhET dan perakitan sirkuit tertutup' },
      '6': { score: 2, note: 'Murid aktif bertanya dan mendiskusikan perbedaan nilai hambatan pengganti' },
      '7': { score: 2, note: 'Murid memecahkan kasus korsleting listrik dengan rumus Kirchhoff secara mandiri' },
      '8': { score: 2, note: 'Sesi refleksi berjalan mendalam mengenai keselamatan listrik di lingkungan sekitar' },
      '9': { score: 2, note: 'Sintaks Problem-Based Learning dijalankan konsisten dan efektif' },
      '10': { score: 2, note: 'Kerja sama antarmurid sangat seimbang dan saling membantu' },
      '11': { score: 2, note: 'Suasana kelas aman, tertib, dan inklusif bagi seluruh peserta didik' },
      '12': { score: 2, note: 'Teknologi digital PhET dan multimeter dimanfaatkan optimal oleh setiap kelompok' },
      '13': { score: 2, note: 'Budaya saling memuliakan dan toleransi pendapat terjaga kuat' },
      '14': { score: 2, note: 'Murid mengaitkan konsep baru dengan materi arus listrik statis pertemuan lalu' },
      '15': { score: 2, note: 'Murid diberi kebebasan memilih susunan sirkuit seri atau paralel untuk diuji' },
      '16': { score: 2, note: 'Seluruh kelompok berhasil membuktikan Hukum Kirchhoff dengan akurasi tinggi' },
      '17': { score: 2, note: 'Kemandirian belajar murid tinggi saat menganalisis hambatan geser' },
      '18': { score: 2, note: 'Guru berkeliling memberi bimbingan diferensiasi bagi kelompok yang memerlukan bantuan' },
      '19': { score: 2, note: 'Pengelolaan waktu dan dinamika kelas terkontrol sangat baik' },
      '20': { score: 2, note: 'Refleksi akhir mengacu pada pencapaian tujuan dan rencana penghematan daya' },
      '21': { score: 2, note: 'Penilaian formatif berjalan kontinyu disertai umpan balik apresiatif dari guru' },
      '22': { score: 2, note: 'Kuis formatif akhir 3 butir soal pemecahan masalah dituntaskan secara objektif' },
      '23': { score: 2, note: 'Hasil pengamatan langsung digunakan untuk memandu kesimpulan akhir pembelajaran' },
      '24': { score: 2, note: 'Arah pembelajaran selaras dengan visi SMAN 4 Bogor yang berorientasi mutu dan karakter' },
      '25': { score: 2, note: 'Guru mencatat evaluasi proses untuk perbaikan pembelajaran modul berikutnya' },
    },
    observasiFeedback: {
      kelebihan: 'Pengelolaan kelas sangat hidup, murid terlibat 100% dalam eksperimen interaktif dengan simulasi digital dan alat riil, budaya saling memuliakan terasa nyata.',
      peningkatan: 'Dapat ditambahkan pemantik studi kasus teknologi baterai kendaraan listrik (EV) untuk memperkaya wawasan energi terbarukan murid.',
      rekomendasi: 'Direkomendasikan menjadi model kelas terbuka (Open Class) bagi guru-guru rumpun sains di sekolah dan komunitas belajar.'
    },
    kesimpulanSelidiki: {
      guruBerorientasi: 'Guru bertransformasi menjadi fasilitator penyelidikan inkuiri aktif yang mendampingi murid menemukan konsep kelistrikan melalui simulasi interaktif PhET dan kit eksperimen.',
      muridAktif: 'Seluruh kelompok murid aktif merakit sirkuit listrik tertutup, mengukur besaran fisis secara empiris, dan berargumentasi ilmiah membuktikan Hukum Kirchhoff.',
      konteksNyata: 'Pembelajaran mengaitkan konsep arus dan hambatan dengan instalasi proteksi sekring rumah tangga, pencegahan korsleting, dan efisiensi konsumsi daya listrik.',
      refleksiMurid: 'Murid secara terstruktur merefleksikan makna pembelajaran bagi keselamatan diri dan merumuskan komitmen perilaku hemat energi dalam kehidupan sehari-hari.'
    }
  },

  // 2. BIOLOGI - Ivany Ratna Ekandini, S.Pd. (SMAS Rimba Madya)
  biologi: {
    rppUrl: 'https://drive.google.com/file/d/1DemoModulBiologiBioteknologi/view?usp=sharing',
    lessonTitle: 'Bioteknologi Konvensional & Modern: Fermentasi Pangan Lokal dan Rekayasa Genetika',
    classGrade: 'Fase F / Kelas XII-MIPA 2',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
    },
    telaahComments: {
      1: 'Identitas modul ajar bioteknologi terperinci dengan capaian pembelajaran fase F.',
      2: 'Kesiapan awal murid mengenai mikroorganisme dan genetika dipetakan dengan baik.',
      4: 'Profil Beriman & Bertakwa (Bioetika) serta Bernalar Kritis terintegrasi kuat.',
      8: 'Project-Based Learning pembuatan produk fermentasi pangan lokal terstruktur jelas.',
      13: 'Pengalaman MENGAPLIKASI terhubung nyata dengan pembuatan yoghurt dan tempe.',
      21: 'Rubrik penilaian produk dan laporan observasi ilmiah tersusun sistematis.'
    },
    telaahFeedback: {
      kelebihan: 'Integrasi kearifan lokal pangan fermentasi Bogor dengan prinsip bioteknologi modern sangat inovatif dan berorientasi kecakapan hidup.',
      perbaikan: 'Sertakan rubrik analisis dampak limbah proses fermentasi skala rumah tangga.',
      rekomendasi: 'Sangat layak didiseminasikan dalam forum MGMP Biologi Kota Bogor.'
    },
    praObservasiAnswers: {
      q1_kd_indikator: 'Menganalisis prinsip bioteknologi konvensional dan modern serta mengevaluasi dampaknya terhadap ketahanan pangan dan bioetika lingkungan.',
      q2_metode: 'Project-Based Learning terpadu inkuiri kontekstual untuk mendorong murid menghasilkan produk pangan fermentasi higienis dan bernilai ekonomis.',
      q3_alat_bahan: 'Bahan fermentasi lokal (kedelai, singkong, susu segar), ragi/starter bakteri, pH meter, mikroskop, tayangan interaktif Canva, dan LKPD Proyek.',
      q4_tahapan: 'Eksplorasi isu krisis pangan dunia, Desain protokol fermentasi, Praktik inokulasi mikroorganisme steril, Pengamatan perubahan biokimia, dan Presentasi evaluatif.',
      q5_persiapan: 'Menghubungkan biologi dengan industri pangan ramah lingkungan, menciptakan suasana percobaan higienis yang menyenangkan, dan memfasilitasi dialog etika sains.',
      q6_materi_sulit: 'Mekanisme rekombinasi DNA dan plasmid pada bioteknologi modern; diantisipasi dengan model visual 3D interaktif dan video animasi mekanisme CRISPR.',
      q7_target_kompetensi: 'Kreativitas merancang produk bioteknologi ramah lingkungan dan kepedulian terhadap keanekaragaman hayati nusantara.',
      q8_perhatian_khusus: 'Fokus pada penerapan prosedur sanitasi dan aseptik laboratorium agar produk fermentasi bebas dari kontaminan bakteri patogen.',
      supervisorNotes: 'Perencanaan sangat komprehensif. Observasi kelas akan memantau kedisiplinan protokol kerja laboratorium dan keaktifan analisis ilmiah murid.'
    },
    observasiScores: {
      '1': { score: 2, note: 'Tujuan pembelajaran bioetika dan keterampilan proses sains teramati jelas' },
      '2': { score: 2, note: 'Asesmen kinerja laboratorium selaras dengan target pencapaian murid' },
      '3': { score: 2, note: 'Alur kegiatan praktikum higienis dan terstruktur dari awal hingga akhir' },
      '4': { score: 2, note: 'Keterkaitan materi dengan produk UMKM tapai dan tempe Bogor sangat kuat' },
      '5': { score: 2, note: 'Murid bersemangat melakukan inokulasi mikroorganisme pada media kultur' },
      '6': { score: 2, note: 'Murid aktif mengamati koloni jamur tempe di bawah mikroskop dan berdiskusi' },
      '7': { score: 2, note: 'Murid menganalisis faktor suhu dan keasaman terhadap kecepatan fermentasi' },
      '8': { score: 2, note: 'Refleksi mendalam tentang keamanan pangan dan tanggung jawab saintis' },
      '9': { score: 2, note: 'Metode Project-Based Learning diterapkan dengan pendampingan optimal' },
      '10': { score: 2, note: 'Kolaborasi antarmurid dalam menjaga kebersihan meja kerja sangat baik' },
      '11': { score: 2, note: 'Laboratorium tertata rapi, aman, dan mematuhi SOP keselamatan kerja' },
      '12': { score: 2, note: 'Pemanfaatan gawai untuk mendokumentasikan tahapan fermentasi sangat efektif' },
      '13': { score: 2, note: 'Saling menghargai pembagian tugas pengamatan berkala antaranggotanya' },
      '14': { score: 2, note: 'Murid mengaitkan respirasi anaerob materi terdahulu dengan proses fermentasi' },
      '15': { score: 2, note: 'Murid menentukan inovasi varian rasa pangan fermentasi secara kreatif' },
      '16': { score: 2, note: 'Target pemahaman prinsip bioteknologi konvensional tercapai optimal' },
      '17': { score: 2, note: 'Murid mandiri mencatat perubahan aroma, tekstur, dan pH secara berkala' },
      '18': { score: 2, note: 'Guru memfasilitasi kebutuhan murid dengan bimbingan teknik aseptik yang sabar' },
      '19': { score: 2, note: 'Pengelolaan waktu kegiatan praktikum berjalan tertib dan tepat' },
      '20': { score: 2, note: 'Refleksi akhir mengaitkan ilmu biologi dengan peluang wirausaha generasi muda' },
      '21': { score: 2, note: 'Umpan balik formatif langsung diberikan saat murid melakukan teknik pipetasi' },
      '22': { score: 2, note: 'Penilaian laporan portofolio praktikum menggunakan kriteria rubrik transparan' },
      '23': { score: 2, note: 'Hasil diskusi kelas dijadikan dasar perbaikan formulasi proyek lanjutan' },
      '24': { score: 2, note: 'Pembelajaran selaras dengan visi SMAS Rimba Madya yang peduli lingkungan' },
      '25': { score: 2, note: 'Guru melakukan evaluasi reflektif terhadap keterlaksanaan proyek bioteknologi' },
    },
    observasiFeedback: {
      kelebihan: 'Penerapan protokol sains bioteknologi pangan sangat higienis, murid antusias dan berani berinovasi menciptakan produk fermentasi sehat.',
      peningkatan: 'Eksplorasi analisis perbandingan nilai gizi produk sebelum dan sesudah fermentasi dapat diperdalam.',
      rekomendasi: 'Layak ditampilkan dalam pameran karya ilmiah sekolah dan festival kewirausahaan siswa.'
    },
    kesimpulanSelidiki: {
      guruBerorientasi: 'Guru memfasilitasi pengalaman belajar inkuiri berbasis proyek fermentasi pangan lokal, memandu murid memahami peran mikroorganisme secara empiris.',
      muridAktif: 'Murid mandiri merancang protokol kerja, melakukan sterilisasi bahan, mengukur parameter fermentasi, dan menganalisis data perubahan biokimia.',
      konteksNyata: 'Pembelajaran berpijak pada potensi pangan lokal Kota Bogor dan solusi alternatif peningkatan nilai gizi serta ketahanan pangan keluarga.',
      refleksiMurid: 'Murid menyadari pentingnya higienitas pangan, etika bioteknologi, serta potensi wirausaha biologi berbasis kearifan lokal.'
    }
  },

  // 3. BAHASA INDONESIA - Alline Novianti, S.Pd. (SMAS IT Ummul Quro)
  bahasa_indonesia: {
    rppUrl: 'https://drive.google.com/file/d/1DemoModulAnekdotUmmulQuro/view?usp=sharing',
    lessonTitle: 'Teks Anekdot sebagai Kritik Sosial yang Santun Berbasis Komik Digital',
    classGrade: 'Fase E / Kelas X-A',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
    },
    telaahComments: {
      1: 'Identitas modul ajar teks anekdot tertata rapi dan jelas.',
      4: 'Dimensi Berkebinekaan Global dan Bernalar Kritis tertuang dalam analisis isu publik.',
      8: 'Model pembelajaran Discovery Learning dipadukan dengan produksi komik digital Canva.',
      12: 'Murid difasilitasi memahami struktur dan kaidah kebahasaan melalui teks otentik terkini.',
      13: 'Aktivitas mengaplikasikan kritik sosial santun melalui komik strip berjalan menarik.',
      21: 'Rubrik penilaian membedakan aspek kelucuan, substansi kritik, dan kesantunan bahasa.'
    },
    telaahFeedback: {
      kelebihan: 'Pendekatan kritis santun dalam penulisan teks anekdot sangat relevan dengan etika digital murid SMA masa kini.',
      perbaikan: 'Perkuat aspek peer-review antarteman sebelum karya komik digital dipublikasikan.',
      rekomendasi: 'Karya komik digital murid dapat diterbitkan menjadi e-majalah literasi sekolah.'
    },
    praObservasiAnswers: {
      q1_kd_indikator: 'Mengevaluasi gagasan dan pesan tersirat dalam teks anekdot serta menyusun teks anekdot dengan memperhatikan kaidah kesantunan berbahasa.',
      q2_metode: 'Genre-Based Approach dipadukan dengan teknik Workshop Menulis Kreatif berbasis platform desain grafis Canva.',
      q3_alat_bahan: 'Kliping komik strip digital, proyektor, gawai/laptop murid, template Canva Komik, dan rubrik asesmen kesantunan bahasa.',
      q4_tahapan: 'Dekonstruksi teks contoh, Analisis isu layanan publik terdekat, Curah ide kritik santun, Penulisan naskah, Pembuatan komik digital, dan Pameran galeri kelas.',
      q5_persiapan: 'Menghubungkan teks dengan pengalaman antrean kantin dan fasilitas sekolah, menciptakan humor yang mencerdaskan tanpa sarkasme atau perundungan.',
      q6_materi_sulit: 'Menjaga batas antara kritik membangun dan cemoohan; diantisipasi dengan pedoman etika komunikasi publik dan analisis contoh kasus nyata.',
      q7_target_kompetensi: 'Keterampilan literasi kritis, kepekaan sosial terhadap ketidakadilan, dan kesantunan berbahasa Indonesia.',
      q8_perhatian_khusus: 'Memastikan seluruh murid berani mengemukakan sudut pandang kritisnya dengan percaya diri dan tanpa rasa takut salah.',
      supervisorNotes: 'Rancangan sangat menarik. Fokus observasi kelas pada panduan guru dalam menanamkan kesantunan berbahasa saat murid menyusun kritik sosial.'
    },
    observasiScores: {
      '1': { score: 2, note: 'Tujuan pembelajaran literasi kritis dan kesantunan verbal terwujud nyata' },
      '2': { score: 2, note: 'Penilaian asesmen mencakup isi kritik, estetika komik, dan diksi santun' },
      '3': { score: 2, note: 'Alur kegiatan mengalir dinamis dari tayangan pemantik hingga pameran karya' },
      '4': { score: 2, note: 'Isu yang diangkat murid seputar kedisiplinan belajar dan lingkungan sekolah' },
      '5': { score: 2, note: 'Suasana kelas riang dan penuh tawa positif dari humor cerdas yang dibangun' },
      '6': { score: 2, note: 'Murid aktif membedah struktur orientasi, krisis, reaksi, dan koda' },
      '7': { score: 2, note: 'Murid menyusun naskah anekdot orisinal berdasarkan peristiwa nyata' },
      '8': { score: 2, note: 'Refleksi mendalam tentang dampak kata-kata di ruang media sosial' },
      '9': { score: 2, note: 'Pendekatan berbasis genre diterapkan sistematis dan kontekstual' },
      '10': { score: 2, note: 'Diskusi kelompok pembuatan komik kolaboratif berjalan saling mengapresiasi' },
      '11': { score: 2, note: 'Kelas kondusif dan menjunjung tinggi norma kesantunan berbicara' },
      '12': { score: 2, note: 'Aplikasi Canva dimanfaatkan murid dengan sangat terampil dan kreatif' },
      '13': { score: 2, note: 'Budaya saling menghormati gagasan tanpa mencela karya teman terawat baik' },
      '14': { score: 2, note: 'Murid mengaitkan materi teks eksposisi terdahulu dalam menyusun argumen kritik' },
      '15': { score: 2, note: 'Murid bebas memilih topik kritik sosial yang dirasa paling dekat dengan mereka' },
      '16': { score: 2, note: 'Capaian kompetensi menulis teks anekdot santun terpenuhi di atas KKM' },
      '17': { score: 2, note: 'Murid mandiri menyelesaikan penyusunan komik digital tepat waktu' },
      '18': { score: 2, note: 'Guru mendatangi tiap kelompok memberi saran pemilihan diksi yang lebih bijak' },
      '19': { score: 2, note: 'Manajemen alokasi waktu penulisan dan presentasi tertata rapi' },
      '20': { score: 2, note: 'Refleksi akhir menekankan integritas murid sebagai warganet yang bertanggung jawab' },
      '21': { score: 2, note: 'Guru memberikan umpan balik langsung pada draf dialog komik murid' },
      '22': { score: 2, note: 'Penilaian rekan sejawat (peer review) berjalan lancar menggunakan rubrik' },
      '23': { score: 2, note: 'Catatan telaah dijadikan bahan perbaikan draf komik sebelum finalisasi' },
      '24': { score: 2, note: 'Mendukung visi SMAS IT Ummul Quro dalam membentuk generasi berakhlak mulia' },
      '25': { score: 2, note: 'Guru mendokumentasikan praktik baik literasi komik untuk laporan refleksi' },
    },
    observasiFeedback: {
      kelebihan: 'Integrasi literasi digital Canva dengan penguatan karakter kesantunan berbahasa sangat berhasil memotivasi murid menuangkan kritik positif.',
      peningkatan: 'Alokasikan waktu lebih bagi murid untuk saling membaca karya antarkelompok secara mendalam.',
      rekomendasi: 'Karya anekdot komik digital sangat layak dipublikasikan di akun media sosial literasi sekolah.'
    },
    kesimpulanSelidiki: {
      guruBerorientasi: 'Guru merancang kegiatan belajar yang menantang murid berpikir kritis sekaligus menjaga marwah kesantunan bahasa dalam menyampaikan kritik sosial.',
      muridAktif: 'Murid aktif mengeksplorasi isu sosial sekitar, menulis dialog humor bermakna, dan merancang komik strip digital secara kolaboratif.',
      konteksNyata: 'Tema anekdot diangkat langsung dari fenomena keseharian murid: etika digital, antrean fasilitas umum, dan kepedulian lingkungan.',
      refleksiMurid: 'Murid menyadari kekuatan bahasa dalam mempengaruhi opini publik dan pentingnya menyampaikan kebenaran dengan cara yang santun dan bermartabat.'
    }
  },

  // 4. MATEMATIKA - Hilmia Fitriyani, S.Pd. (SMAN 4 Bogor)
  matematika: {
    rppUrl: 'https://drive.google.com/file/d/1DemoModulMatematikaFungsiKuadrat/view?usp=sharing',
    lessonTitle: 'Fungsi Kuadrat: Pemodelan Titik Ekstrem Maksimum/Minimum pada Masalah Arsitektur & Bisnis',
    classGrade: 'Fase E / Kelas X-3',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
    },
    telaahComments: {
      1: 'Identitas modul lengkap dengan alokasi waktu 3 JP yang terukur.',
      4: 'Profil Bernalar Kritis dan Mandiri tercermin dalam tahapan eksplorasi Geogebra.',
      8: 'Model Problem-Based Learning berbantuan aplikasi Geogebra interaktif.',
      12: 'Murid mengonstruksi sifat grafik parabola melalui penggeseran nilai koefisien a, b, dan c.',
      13: 'Pemodelan matematis lintasan parabola jembatan dan keuntungan maksimum UMKM sangat aplikatif.',
      21: 'Rubrik KKTP mencakup pemahaman konsep, keterampilan grafik, dan penalaran kontekstual.'
    },
    telaahFeedback: {
      kelebihan: 'Pemanfaatan software Geogebra secara dinamis membuat konsep abstrak fungsi kuadrat menjadi visual, konkret, dan mudah dipahami.',
      perbaikan: 'Berikan variasi soal diferensiasi bagi murid yang telah menguasai konsep lebih cepat.',
      rekomendasi: 'Dapat diimbaskan kepada guru matematika serumpun di SMAN 4 Bogor.'
    },
    praObservasiAnswers: {
      q1_kd_indikator: 'Menyelesaikan masalah kontekstual yang berkaitan dengan fungsi kuadrat melalui interpretasi karakteristik grafik parabola dan titik puncak.',
      q2_metode: 'Inquiry-Based Learning berbantuan aplikasi dinamik GeoGebra dan studi kasus optimalisasi keuntungan wirausaha.',
      q3_alat_bahan: 'Aplikasi GeoGebra (smartphone/laptop), lembar kerja penyelidikan kurva, proyektor, dan modul ajar digital.',
      q4_tahapan: 'Orientasi fenomena lintasan bola basket, Eksplorasi slider GeoGebra, Menemukan rumus titik puncak, Pemecahan masalah laba maksimum, dan Penarikan simpulan.',
      q5_persiapan: 'Menyajikan matematika sebagai alat bantu memecahkan persoalan nyata, menghilangkan kecemasan matematika (math anxiety) lewat visualisasi interaktif.',
      q6_materi_sulit: 'Menyusun model matematika dari narasi soal cerita; diantisipasi dengan diagram alur pemodelan langkah demi langkah.',
      q7_target_kompetensi: 'Kemampuan berpikir analitis logis, pemodelan matematis, dan ketelitian kalkulasi.',
      q8_perhatian_khusus: 'Mendampingi murid yang mengalami kendala dalam aljabar dasar saat menentukan koordinat titik potong sumbu.',
      supervisorNotes: 'Rancangan inovatif. Observasi kelas akan fokus pada bagaimana manipulasi slider GeoGebra oleh murid mempermudah penemuan konsep titik puncak.'
    },
    observasiScores: {
      '1': { score: 2, note: 'Tujuan pemodelan matematis dan karakter nalar logis tercapai nyata' },
      '2': { score: 2, note: 'Asesmen formatif mengukur pemahaman grafik dan penyelesaian model' },
      '3': { score: 2, note: 'Alur kegiatan terstruktur runtut dari kurva visual hingga perumusan aljabar' },
      '4': { score: 2, note: 'Studi kasus keuntungan penjualan merchandise sekolah sangat aplikatif' },
      '5': { score: 2, note: 'Murid takjub melihat grafik parabola berubah saat nilai koefisien digeser' },
      '6': { score: 2, note: 'Murid aktif mencoba koordinat titik puncak dan mendiskusikan nilainya' },
      '7': { score: 2, note: 'Murid berhasil menghitung tinggi maksimum peluru dan laba optimal UMKM' },
      '8': { score: 2, note: 'Refleksi akhir mengungkap matematika adalah bahasa sains yang sangat berguna' },
      '9': { score: 2, note: 'Model inkuiri terbimbing berjalan sukses memantik kemandirian murid' },
      '10': { score: 2, note: 'Interaksi kerja tim dalam menemukan titik ekstrem berjalan suportif' },
      '11': { score: 2, note: 'Suasana kelas tenang, fokus, dan bebas dari ketakutan berhitung' },
      '12': { score: 2, note: 'Penggunaan GeoGebra sangat lancar dan dikuasai murid dengan baik' },
      '13': { score: 2, note: 'Murid yang lebih cepat memahami membantu rekan satu kelompoknya dengan ramah' },
      '14': { score: 2, note: 'Materi persamaan kuadrat terdahulu dihubungkan dengan titik potong sumbu X' },
      '15': { score: 2, note: 'Murid memilih konteks masalah (arsitektur jembatan atau keuntungan usaha)' },
      '16': { score: 2, note: 'Lebih dari 90% murid menuntaskan asesmen kuis Geogebra dengan tepat' },
      '17': { score: 2, note: 'Murid mandiri menyelesaikan analisis fungsi kuadrat pada lembar kerja' },
      '18': { score: 2, note: 'Guru memberi pendampingan intensif bagi murid yang memerlukan penguatan faktorisasi' },
      '19': { score: 2, note: 'Waktu terjaga dengan disiplin sesuai alokasi RPP' },
      '20': { score: 2, note: 'Refleksi metakognitif menyimpulkan strategi mencari nilai optimum' },
      '21': { score: 2, note: 'Guru memberikan koreksi langsung saat murid mempresentasikan koordinat puncak' },
      '22': { score: 2, note: 'Kuis formatif akhir diselesaikan secara digital dengan transparansi nilai' },
      '23': { score: 2, note: 'Temuan kesulitan diintegrasikan sebagai agenda pengayaan pertemuan berikutnya' },
      '24': { score: 2, note: 'Mendukung visi sekolah menghasilkan lulusan unggul berdaya saing akademik' },
      '25': { score: 2, note: 'Guru mencatat keberhasilan integrasi TIK dalam jurnal refleksi mengajar' },
    },
    observasiFeedback: {
      kelebihan: 'Transformasi matematika abstrak menjadi visual interaktif menggunakan GeoGebra berhasil mendongkrak antusiasme dan pemahaman analitis murid.',
      peningkatan: 'Perlu ditambah latihan soal kontekstual dengan angka realitas yang lebih kompleks.',
      rekomendasi: 'Metode visualisasi Geogebra ini sangat direkomendasikan ditularkan ke guru matematika lainnya.'
    },
    kesimpulanSelidiki: {
      guruBerorientasi: 'Guru memfasilitasi eksplorasi visual interaktif berbantuan software GeoGebra, mengubah matematika dari hafalan rumus menjadi penemuan konsep bermakna.',
      muridAktif: 'Murid aktif menggeser parameter koefisien, menyelidiki pergerakan titik puncak parabola, dan memodelkan masalah optimalisasi laba usaha secara matematis.',
      konteksNyata: 'Pembelajaran mengaitkan fungsi kuadrat dengan bentuk lengkung arsitektur jembatan dan perhitungan keuntungan maksimum penjualan produk UMKM.',
      refleksiMurid: 'Murid merefleksikan bahwa matematika memiliki kegunaan praktis tinggi dalam memprediksi hasil optimal dan membuat keputusan strategis dalam kehidupan.'
    }
  },

  // 5. KIMIA - Mega Nur Alfira, S.Pd. (SMAN 2 Bogor)
  kimia: {
    rppUrl: 'https://drive.google.com/file/d/1DemoModulKimiaIkatanKepolaran/view?usp=sharing',
    lessonTitle: 'Ikatan Kimia & Kepolaran Senyawa: Penyelidikan Sifat Fisik dan Gaya Antarmolekul',
    classGrade: 'Fase F / Kelas XI-MIPA 3',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
    },
    telaahComments: {
      1: 'Identitas modul ajar ikatan kimia dan kepolaran lengkap dan sistematis.',
      4: 'Profil Bernalar Kritis dan Bergotong Royong tercermin dalam penyelidikan sifat polar.',
      8: 'Praktikum uji pembelokan aliran zat cair dengan penggaris bermuatan sangat memikat.',
      12: 'Murid memahami perbedaan ikatan kovalen polar dan nonpolar lewat observasi mikroskopis.',
      13: 'Kaitan polaritas air dengan pelarutan zat pembersih (sabun dan detergen) sangat nyata.',
      21: 'Rubrik penilaian ketercapaian tujuan pembelajaran (KKTP) operasional dan terukur.'
    },
    telaahFeedback: {
      kelebihan: 'Eksperimen sederhana pembelokan zat cair dengan listrik statis sangat efektif menjembatani pemahaman makroskopis ke tataran sub-mikroskopis.',
      perbaikan: 'Sertakan animasi 3D struktur molekul ruang menggunakan aplikasi MolView.',
      rekomendasi: 'Dapat dijadikan bahan diseminasi inovasi praktikum kimia murah dan bermakna.'
    },
    praObservasiAnswers: {
      q1_kd_indikator: 'Menganalisis proses pembentukan ikatan kovalen polar dan nonpolar serta menghubungkannya dengan sifat fisik kepolaran senyawa.',
      q2_metode: 'Guided Inquiry Laboratory dipadukan dengan pemodelan partikel sub-mikroskopis molekul.',
      q3_alat_bahan: 'Buret laboratorium, cairan uji (air, alkohol, aseton, minyak goreng), batang mika, kain wol, dan LKPD Eksperimen Kimia.',
      q4_tahapan: 'Demonstrasi air dan minyak yang tak bercampur, Eksperimen pembelokan kucuran cairan oleh muatan listrik, Analisis perbedaan keelektronegatifan, dan Kesimpulan konsep.',
      q5_persiapan: 'Menghubungkan kimia dengan fungsi sabun pencuci piring dalam mengangkat lemak, membangun rasa kagum terhadap keteraturan molekul ciptaan Tuhan.',
      q6_materi_sulit: 'Menghitung momen dipol dan bentuk geometri molekul asimetris; diantisipasi dengan model molimod fisik dan aplikasi visualisasi 3D.',
      q7_target_kompetensi: 'Keterampilan berpikir tingkat tinggi menganalisis hubungan struktur molekul dengan sifat makroskopis zat.',
      q8_perhatian_khusus: 'Kehati-hatian dalam penanganan cairan organik yang mudah menguap serta pembagian peran uji cairan antarmurid.',
      supervisorNotes: 'Rancangan sangat matang. Observasi tatap muka akan menilai kemampuan guru membimbing transisi representasi makroskopis ke sub-mikroskopis.'
    },
    observasiScores: {
      '1': { score: 2, note: 'Tujuan penguasaan konsep kimia dan pembentukan karakter ilmiah terwujud' },
      '2': { score: 2, note: 'Asesmen keterampilan laboratorium mencakup ketelitian pengukuran dan analisis' },
      '3': { score: 2, note: 'Langkah eksperimen terarah dengan panduan keselamatan kerja yang jelas' },
      '4': { score: 2, note: 'Contoh kerja sabun melarutkan lemak dihubungkan dengan sifat kepolaran zat' },
      '5': { score: 2, note: 'Murid sangat bersemangat saat melihat aliran air membelok mendekati batang mika' },
      '6': { score: 2, note: 'Murid aktif bertanya mengapa minyak goreng tidak membelok saat didekatkan muatan' },
      '7': { score: 2, note: 'Murid menyimpulkan kriteria senyawa polar berdasarkan perbedaan keelektronegatifan' },
      '8': { score: 2, note: 'Refleksi mengaitkan polaritas senyawa dengan kelestarian ekosistem air' },
      '9': { score: 2, note: 'Inkuiri terbimbing memancing murid menemukan kesimpulan secara mandiri' },
      '10': { score: 2, note: 'Kerja tim pembagian tugas pengisian buret dan pengamatan tetesan sangat kompak' },
      '11': { score: 2, note: 'Laboratorium kimia bersih, tertib, dan memiliki ventilasi udara yang baik' },
      '12': { score: 2, note: 'Alat peraga buret dan visualisasi molekul digunakan tepat guna' },
      '13': { score: 2, note: 'Interaksi menghargai pendapat antarmurid selama sesi diskusi hasil uji' },
      '14': { score: 2, note: 'Murid mengingat kembali konfigurasi elektron dan aturan oktet dengan baik' },
      '15': { score: 2, note: 'Murid bebas memilih cairan uji tambahan yang dibawa dari rumah' },
      '16': { score: 2, note: 'Semua kelompok berhasil mengklasifikasikan 4 senyawa uji dengan benar' },
      '17': { score: 2, note: 'Murid mencatat data pengamatan dan menggambar momen dipol secara mandiri' },
      '18': { score: 2, note: 'Guru mendampingi kelompok yang ragu dalam membaca skala buret secara teliti' },
      '19': { score: 2, note: 'Pengelolaan waktu eksperimen dan pembersihan alat berjalan teratur' },
      '20': { score: 2, note: 'Refleksi akhir merumuskan esensi keteraturan gaya antarmolekul di alam semesta' },
      '21': { score: 2, note: 'Umpan balik formatif diberikan pada saat murid menggambar arah vektor dipol' },
      '22': { score: 2, note: 'Penilaian unjuk kerja laboratorium dilaksanakan secara adil dan terukur' },
      '23': { score: 2, note: 'Hasil pengamatan dijadikan dasar penguatan konsep ikatan hidrogen pertemuan nanti' },
      '24': { score: 2, note: 'Selaras dengan komitmen SMAN 2 Bogor mencetak generasi cerdas berkarakter ilmiah' },
      '25': { score: 2, note: 'Guru mencatat evaluasi praktikum kimia untuk penyempurnaan LKPD' },
    },
    observasiFeedback: {
      kelebihan: 'Praktikum sederhana namun memiliki daya jelas konseptual yang sangat kuat dalam membuktikan kepolaran senyawa, antusiasme murid luar biasa.',
      peningkatan: 'Dapat ditambahkan pemodelan digital interaktif untuk memperlihatkan awan elektron secara dinamis.',
      rekomendasi: 'Sangat disarankan dibuat video panduan praktikum untuk dibagikan di komunitas MGMP Kimia.'
    },
    kesimpulanSelidiki: {
      guruBerorientasi: 'Guru memfasilitasi penyelidikan sifat kepolaran senyawa melalui eksperimen pembelokan kucuran cairan oleh muatan listrik yang sangat visual dan memikat.',
      muridAktif: 'Murid terampil menguji kepolaran berbagai cairan, mengukur sudut pembelokan, dan menganalisis perbedaan keelektronegatifan unsur secara ilmiah.',
      konteksNyata: 'Pembelajaran mengaitkan sifat kepolaran dengan mekanisme kerja sabun pembersih lemak dan fenomena kelarutan vitamin dalam tubuh.',
      refleksiMurid: 'Murid merefleksikan keindahan sains di balik sifat zat sehari-hari serta pentingnya pemilihan bahan kimia pembersih yang ramah lingkungan.'
    }
  }
};

/**
 * Menghasilkan data auto-fill lengkap untuk guru mana pun berdasarkan nama guru, mapel, dan materi.
 * Jika mapel spesifik belum terdaftar di map khusus, fungsi ini akan menghasilkan data terpersonalisasi
 * yang kontekstual, komprehensif, dan selaras dengan standar instrumen pengawas pembina.
 */
export function getTeacherAutoFillData(
  teacherName: string,
  subject: string,
  lessonTitle: string = '',
  schoolName: string = ''
): TeacherAutoFillData {
  const subLower = (subject || '').toLowerCase().trim();

  // Match predefined subjects
  if (subLower.includes('fisik') || subLower.includes('physics')) {
    return TEACHER_AUTO_FILL_MAP.fisika;
  }
  if (subLower.includes('biolog')) {
    return TEACHER_AUTO_FILL_MAP.biologi;
  }
  if (subLower.includes('indonesia')) {
    return TEACHER_AUTO_FILL_MAP.bahasa_indonesia;
  }
  if (subLower.includes('matematik') || subLower.includes('math')) {
    return TEACHER_AUTO_FILL_MAP.matematika;
  }
  if (subLower.includes('kimia') || subLower.includes('chem')) {
    return TEACHER_AUTO_FILL_MAP.kimia;
  }

  // Fallback intelligent tailored generator for ANY subject / teacher
  const cleanTitle = lessonTitle || `Pembelajaran Kontekstual ${subject}`;
  const safeName = teacherName || 'Guru Mata Pelajaran';

  return {
    rppUrl: `https://drive.google.com/file/d/drive_${Date.now()}_RPP_${encodeURIComponent(subject)}/view?usp=sharing`,
    lessonTitle: cleanTitle,
    classGrade: 'Fase E / Kelas X',
    semester: 'Ganjil',
    telaahScores: {
      1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
      12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
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
      '1': { score: 2, note: 'Tujuan pembelajaran mencakup sikap, pengetahuan, dan keterampilan teramati aktif' },
      '2': { score: 2, note: 'Penilaian selaras dengan tujuan dan profil lulusan yang dicanangkan' },
      '3': { score: 2, note: 'Alur kegiatan terstruktur jelas dan menjaga fokus perhatian murid sepanjang sesi' },
      '4': { score: 2, note: `Materi dan aktivitas ${subject} terhubung erat dengan kehidupan nyata murid` },
      '5': { score: 2, note: 'Aktivitas menarik dan memotivasi suasana belajar yang menggembirakan' },
      '6': { score: 2, note: 'Murid aktif mengamati, bertanya, dan menggali informasi dari berbagai sumber' },
      '7': { score: 2, note: 'Murid terampil menerapkan konsep dalam situasi nyata melalui tugas kontekstual' },
      '8': { score: 2, note: 'Kegiatan refleksi terlaksana dengan baik, murid menilai proses dan hasil belajarnya' },
      '9': { score: 2, note: 'Metode pembelajaran diterapkan konsisten sesuai tujuan kurikulum' },
      '10': { score: 2, note: 'Interaksi kerja sama guru-murid dan antarmurid berjalan hangat dan produktif' },
      '11': { score: 2, note: 'Suasana kelas aman, nyaman, tertib, dan kondusif bagi pembelajaran' },
      '12': { score: 2, note: 'Pemanfaatan media pembelajaran relevan dan mempermudah pemahaman konsep' },
      '13': { score: 2, note: 'Terbangun budaya saling memuliakan, menghargai, dan menghormati keberagaman' },
      '14': { score: 2, note: 'Murid mengaitkan pengetahuan baru dengan pengalaman belajar sebelumnya' },
      '15': { score: 2, note: 'Murid percaya diri dan memiliki ruang memilih cara belajar yang tepat' },
      '16': { score: 2, note: `Tercapai kompetensi materi ${subject} sesuai indikator yang ditargetkan` },
      '17': { score: 2, note: 'Murid menunjukkan kemandirian belajar dalam menyelesaikan lembar tugas' },
      '18': { score: 2, note: 'Guru tanggap terhadap perbedaan kemampuan dan kebutuhan belajar murid' },
      '19': { score: 2, note: 'Pengelolaan kelas kontekstual dan alokasi waktu terjaga secara presisi' },
      '20': { score: 2, note: 'Refleksi akhir mengacu pada pencapaian tujuan dan tindak lanjut perbaikan' },
      '21': { score: 2, note: 'Penilaian proses (formatif) berjalan efektif disertai umpan balik bermakna' },
      '22': { score: 2, note: 'Penilaian akhir mengukur ketercapaian kompetensi secara objektif' },
      '23': { score: 2, note: 'Hasil penilaian dimanfaatkan guru untuk tindak lanjut pembelajaran lanjutan' },
      '24': { score: 2, note: 'Arah pembelajaran sejalan dengan visi satuan pendidikan yang berpusat pada murid' },
      '25': { score: 2, note: 'Guru mendokumentasikan refleksi untuk perbaikan praktik mengajar berkelanjutan' },
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

/**
 * Deteksi cerdas mapel dan nama guru dari nama file RPP yang diunggah
 */
export function parseRppFileName(fileName: string): { subject?: string; teacherName?: string } {
  const clean = (fileName || '').toLowerCase();
  let subject: string | undefined = undefined;
  let teacherName: string | undefined = undefined;

  if (clean.includes('fisik') || clean.includes('physics')) subject = 'Fisika';
  else if (clean.includes('biolog')) subject = 'Biologi';
  else if (clean.includes('kimia') || clean.includes('chem')) subject = 'Kimia';
  else if (clean.includes('matematik') || clean.includes('math')) subject = 'Matematika';
  else if (clean.includes('indonesia')) subject = 'Bahasa Indonesia';
  else if (clean.includes('inggris') || clean.includes('english')) subject = 'Bahasa Inggris';
  else if (clean.includes('ekonomi')) subject = 'Ekonomi';
  else if (clean.includes('geografi')) subject = 'Geografi';
  else if (clean.includes('sejarah')) subject = 'Sejarah';
  else if (clean.includes('sosiologi')) subject = 'Sosiologi';
  else if (clean.includes('ppkn') || clean.includes('pancasila')) subject = 'PPKn';

  if (clean.includes('sondang')) teacherName = 'Sondang Asih Januarti, S.Pd.';
  else if (clean.includes('ivany')) teacherName = 'Ivany Ratna Ekandini, S.Pd.';
  else if (clean.includes('alline')) teacherName = 'Alline, S.Pd.';
  else if (clean.includes('hilmia')) teacherName = 'Hilmia Fitriyani, S.Pd.';
  else if (clean.includes('kirana')) teacherName = 'Kirana Mahardhika, S.Pd, Gr.';
  else if (clean.includes('salma')) teacherName = 'Siti Salma, S.Pd';

  return { subject, teacherName };
}

/**
 * Menerapkan auto-fill instrumen selidiki lengkap berdasarkan file RPP yang diunggah
 * sesuai mapel dan gurunya masing-masing, serta menghubungkan langsung dengan nilai akhir
 * kesimpulan siklus sambung (Tab Nyatakan / Data Dampak).
 */
export function applyAutoFillToSupervision(
  supervision: Supervision,
  rppUrlOrFileName?: string,
  customSubject?: string,
  customTeacherName?: string
): Supervision {
  const teacherName = customTeacherName || supervision.teacherName;
  const subject = customSubject || supervision.subject;
  const lessonTitle = supervision.lessonTitle;
  const schoolName = supervision.schoolName;

  const auto = getTeacherAutoFillData(teacherName, subject, lessonTitle, schoolName);

  // 1. Hitung Telaah RPP 22 Aspek
  const scores = auto.telaahScores;
  const comments = auto.telaahComments;
  let totalScore = 0;
  Object.values(scores).forEach(v => {
    if (typeof v === 'number') totalScore += v;
  });
  const maxPossibleScore = 44;
  const finalScore = Math.round((totalScore / maxPossibleScore) * 1000) / 10;
  const predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 
    finalScore >= 91 ? 'Sangat Baik' : finalScore >= 81 ? 'Baik' : 'Cukup';

  // 2. Hitung Observasi Kelas 25 Aspek
  const obsItems: Record<string, { score: number; note: string }> = {};
  let totalObsScore = 0;
  Object.entries(auto.observasiScores).forEach(([k, v]) => {
    obsItems[k] = { score: v.score, note: v.note };
    totalObsScore += v.score;
  });
  const obsMax = 50;
  const obsFinalScore = Math.round((totalObsScore / obsMax) * 1000) / 10;
  const obsPredicate = obsFinalScore >= 91 ? 'Sangat Baik' : obsFinalScore >= 81 ? 'Baik' : 'Cukup';

  const rppLink = rppUrlOrFileName?.trim() || auto.rppUrl;

  // 3. Hubungkan ke Sambung Selidiki (Before) & Nyatakan (Kesimpulan Akhir Siklus SAMBUNG)
  const existingSambung = supervision.sambung;
  const beforeMatriks = {
    peranGuru: auto.kesimpulanSelidiki.guruBerorientasi,
    aktivitasMurid: auto.kesimpulanSelidiki.muridAktif,
    konteksNyata: auto.kesimpulanSelidiki.konteksNyata,
    refleksiMurid: auto.kesimpulanSelidiki.refleksiMurid,
  };

  const afterMatriks = existingSambung?.uji?.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };

  // Sinkronkan data dampak deskriptif yang menghubungkan telaah modul & observasi dengan dampak murid
  const updatedDataDampak = getTeacherDescriptiveDataDampak(
    teacherName,
    subject,
    schoolName,
    lessonTitle,
    predicate,
    obsPredicate
  );

  // 4. Hubungkan berkesinambungan ke Tahap A (AMATI): Pemilihan Fokus Perbaikan dari 4 Indikator Selidiki
  const amatiData = generateAmatiData(supervision, ['peranGuru', 'aktivitasMurid'], beforeMatriks);

  // 5. Hubungkan berkesinambungan ke Tahap M (MAKNAI): Coaching & Refleksi Pasca Observasi 10 Pertanyaan
  const maknaiData = generateTeacherMaknaiData(supervision);

  // Draf objek sementara supervisi untuk membangkitkan B, U, G secara kohesif
  const intermediateSup: Supervision = {
    ...supervision,
    teacherName,
    subject,
    perangkatAjar: {
      ...supervision.perangkatAjar,
      driveLinks: {
        cpTpAtpUrl: supervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || '',
        modulAjarUrl: rppLink,
        bahanAjarUrl: supervision.perangkatAjar?.driveLinks?.bahanAjarUrl || '',
        asesmenUrl: supervision.perangkatAjar?.driveLinks?.asesmenUrl || '',
      },
      submittedAt: supervision.perangkatAjar?.submittedAt || new Date().toISOString(),
      telaahScores: scores,
      telaahComments: comments,
      telaahSummary: {
        totalScore,
        maxPossibleScore,
        finalScore,
        predicate,
      },
      feedback: auto.telaahFeedback,
      reviewedAt: new Date().toISOString(),
      reviewedBy: supervision.perangkatAjar?.reviewedBy || 'Kusnandar, M.Si (Pengawas Pembina)',
    },
    praObservasi: {
      interviewDurationMinutes: 35,
      q1_kd_indikator: auto.praObservasiAnswers.q1_kd_indikator,
      q2_metode: auto.praObservasiAnswers.q2_metode,
      q3_alat_bahan: auto.praObservasiAnswers.q3_alat_bahan,
      q4_tahapan: auto.praObservasiAnswers.q4_tahapan,
      q5_persiapan: auto.praObservasiAnswers.q5_persiapan,
      q6_materi_sulit: auto.praObservasiAnswers.q6_materi_sulit,
      q7_target_kompetensi: auto.praObservasiAnswers.q7_target_kompetensi,
      q8_perhatian_khusus: auto.praObservasiAnswers.q8_perhatian_khusus,
      supervisorNotes: auto.praObservasiAnswers.supervisorNotes,
      completedAt: new Date().toISOString(),
    },
    observasiKelas: {
      items: obsItems,
      totalAspek: 25,
      totalSkor: totalObsScore,
      score: obsFinalScore,
      predicate: obsPredicate,
      feedback: {
        kelebihan: auto.observasiFeedback.kelebihan,
        peningkatan: auto.observasiFeedback.peningkatan,
        rekomendasi: auto.observasiFeedback.rekomendasi,
      },
      completedAt: new Date().toISOString(),
    },
  };

  // 6. Hubungkan ke Tahap B (BERDAYAKAN): RPP Perbaikan Deep Learning & Telaah Ulang 22 Aspek
  const berdayakanData = generateBerdayakanTelaahPerbaikanData(intermediateSup);

  // 7. Hubungkan ke Tahap U (UJI): Pembuktian Pra, Observasi 25 Aspek, Pasca, Angket & Kesimpulan Transformasi
  const ujiData = generateUjiData(intermediateSup);

  const finalAfterMatriks = ujiData.kesimpulanUji
    ? {
        peranGuru: ujiData.kesimpulanUji.peranGuru,
        aktivitasMurid: ujiData.kesimpulanUji.aktivitasMurid,
        konteksNyata: ujiData.kesimpulanUji.konteksNyata,
        refleksiMurid: ujiData.kesimpulanUji.refleksiMurid,
      }
    : afterMatriks;

  // 8. Hubungkan ke Tahap G (GERAKKAN): RTL Nyatakan dari temuan uji & Kesimpulan Alur SAMBUNG
  const intermediateWithUji: Supervision = {
    ...intermediateSup,
    sambung: {
      selidiki: {
        tanggal: existingSambung?.selidiki?.tanggal || new Date().toISOString().split('T')[0],
        items: existingSambung?.selidiki?.items || [],
        catatanPrioritas: `Prioritas pembinaan guru ${teacherName} pada mata pelajaran ${subject} adalah optimalisasi diferensiasi proses dan penguatan asesmen otentik kontekstual.`,
        matriksBefore: beforeMatriks,
      },
      arahkan: { ...(existingSambung?.arahkan || {}), ...amatiData },
      maknai: { ...(existingSambung?.maknai || {}), ...maknaiData },
      berdayakan: { ...(existingSambung?.berdayakan || {}), ...berdayakanData },
      uji: ujiData,
      nyatakan: {
        beforeAfter: [
          { aspek: 'Peran guru', sebelumSambung: beforeMatriks.peranGuru, setelahSambung: finalAfterMatriks.peranGuru },
          { aspek: 'Aktivitas murid', sebelumSambung: beforeMatriks.aktivitasMurid, setelahSambung: finalAfterMatriks.aktivitasMurid },
          { aspek: 'Konteks kehidupan nyata', sebelumSambung: beforeMatriks.konteksNyata, setelahSambung: finalAfterMatriks.konteksNyata },
          { aspek: 'Refleksi murid', sebelumSambung: beforeMatriks.refleksiMurid, setelahSambung: finalAfterMatriks.refleksiMurid },
        ],
        dataDampak: updatedDataDampak,
      },
      gerakkan: {
        tindakLanjut: [],
        pengimbasan: [],
      },
    },
  };

  const gerakkanData = generateGerakkanData(intermediateWithUji);

  const updatedSambung: SambungData = {
    selidiki: {
      tanggal: existingSambung?.selidiki?.tanggal || new Date().toISOString().split('T')[0],
      items: existingSambung?.selidiki?.items || [],
      catatanPrioritas: `Prioritas pembinaan guru ${teacherName} pada mata pelajaran ${subject} adalah optimalisasi diferensiasi proses dan penguatan asesmen otentik kontekstual.`,
      matriksBefore: beforeMatriks,
    },
    arahkan: {
      ...(existingSambung?.arahkan || {}),
      ...amatiData,
    },
    maknai: {
      ...(existingSambung?.maknai || {}),
      ...maknaiData,
    },
    berdayakan: {
      ...(existingSambung?.berdayakan || {}),
      ...berdayakanData,
    },
    uji: {
      ...(existingSambung?.uji || {}),
      ...ujiData,
    },
    nyatakan: {
      beforeAfter: [
        { aspek: 'Peran guru', sebelumSambung: beforeMatriks.peranGuru, setelahSambung: finalAfterMatriks.peranGuru },
        { aspek: 'Aktivitas murid', sebelumSambung: beforeMatriks.aktivitasMurid, setelahSambung: finalAfterMatriks.aktivitasMurid },
        { aspek: 'Konteks kehidupan nyata', sebelumSambung: beforeMatriks.konteksNyata, setelahSambung: finalAfterMatriks.konteksNyata },
        { aspek: 'Refleksi murid', sebelumSambung: beforeMatriks.refleksiMurid, setelahSambung: finalAfterMatriks.refleksiMurid },
      ],
      dataDampak: updatedDataDampak,
    },
    gerakkan: {
      ...(existingSambung?.gerakkan || {}),
      ...gerakkanData,
    },
    lastUpdated: new Date().toISOString(),
  };

  const updatedSupervision: Supervision = {
    ...intermediateSup,
    status: supervision.status === 'draft' ? 'in_progress' : supervision.status,
    pascaObservasi: {
      q1_kesan: maknaiData.pertanyaanList?.q1 || '',
      q2_sesuai_rencana: maknaiData.pertanyaanList?.q2 || '',
      q3_hal_memuaskan: maknaiData.pertanyaanList?.q3 || '',
      q4_hal_kurang: maknaiData.pertanyaanList?.q6 || '',
      q5_ketercapaian_tujuan: maknaiData.pertanyaanList?.q4 || '',
      q6_kesulitan_siswa: maknaiData.pertanyaanList?.q5 || '',
      q7_alternatif_solusi: maknaiData.pertanyaanList?.q7 || '',
      q8_rencana_tindak_lanjut: maknaiData.pertanyaanList?.q10 || '',
      q9_pengembangan_diri: maknaiData.pertanyaanList?.q9 || '',
      generalImpression: maknaiData.kesanUmum || '',
      recommendations: maknaiData.saranMasukan || '',
      completedAt: new Date().toISOString(),
    },
    perangkatAjarPerbaikan: {
      driveLinks: {
        cpTpAtpUrl: supervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || '',
        modulAjarUrl: berdayakanData.rppPerbaikanUrl,
        bahanAjarUrl: supervision.perangkatAjar?.driveLinks?.bahanAjarUrl,
        asesmenUrl: supervision.perangkatAjar?.driveLinks?.asesmenUrl,
      },
      submittedAt: new Date().toISOString(),
      telaahScores: berdayakanData.telaahScores,
      telaahComments: berdayakanData.telaahComments,
      telaahSummary: berdayakanData.telaahSummary,
      feedback: berdayakanData.feedback,
      catatanRevisiGuru: berdayakanData.catatanRefleksiGuru,
      reviewedAt: new Date().toISOString(),
      reviewedBy: berdayakanData.namaPenelaah,
    },
    praObservasiPerbaikan: {
      interviewDurationMinutes: 35,
      q1_kd_indikator: ujiData.praObservasi?.q1 || '',
      q2_metode: ujiData.praObservasi?.q2 || '',
      q3_alat_bahan: ujiData.praObservasi?.q3 || '',
      q4_tahapan: ujiData.praObservasi?.q4 || '',
      q5_persiapan: ujiData.praObservasi?.q5 || '',
      q6_materi_sulit: ujiData.praObservasi?.q6 || '',
      q7_target_kompetensi: ujiData.praObservasi?.q7 || '',
      q8_perhatian_khusus: ujiData.praObservasi?.q8 || '',
      supervisorNotes: ujiData.praObservasi?.supervisorNotes || '',
      completedAt: new Date().toISOString(),
    },
    observasiKelasPerbaikan: {
      items: ujiData.observasiPelaksanaan?.items || {},
      totalAspek: 25,
      totalYa: 25,
      totalSkor: ujiData.observasiPelaksanaan?.totalSkor || 50,
      score: ujiData.observasiPelaksanaan?.persentaseCapaian || 100,
      predicate: ujiData.observasiPelaksanaan?.predicate || 'Sangat Baik',
      feedbackNotes: `${ujiData.observasiPelaksanaan?.feedback.kelebihan}\n\nHal yang perlu diperbaiki: ${ujiData.observasiPelaksanaan?.feedback.perbaikan}\n\nRekomendasi: ${ujiData.observasiPelaksanaan?.feedback.rekomendasi}`,
      feedback: ujiData.observasiPelaksanaan?.feedback,
      completedAt: ujiData.observasiPelaksanaan?.completedAt || new Date().toISOString(),
    },
    pascaObservasiPerbaikan: {
      q1_kesan: ujiData.pascaObservasi?.pertanyaanList.q1 || '',
      q2_sesuai_rencana: ujiData.pascaObservasi?.pertanyaanList.q2 || '',
      q3_hal_memuaskan: ujiData.pascaObservasi?.pertanyaanList.q3 || '',
      q4_hal_kurang: ujiData.pascaObservasi?.pertanyaanList.q4 || '',
      q5_ketercapaian_tujuan: ujiData.pascaObservasi?.pertanyaanList.q5 || '',
      q6_kesulitan_siswa: ujiData.pascaObservasi?.pertanyaanList.q6 || '',
      q7_alternatif_solusi: ujiData.pascaObservasi?.pertanyaanList.q7 || '',
      q8_rencana_tindak_lanjut: ujiData.pascaObservasi?.pertanyaanList.q8 || '',
      q9_pengembangan_diri: ujiData.pascaObservasi?.pertanyaanList.q9 || '',
      generalImpression: ujiData.pascaObservasi?.kesanUmum || '',
      recommendations: ujiData.pascaObservasi?.saranMasukan || '',
      completedAt: ujiData.pascaObservasi?.completedAt || new Date().toISOString(),
    },
    sambung: updatedSambung,
    updatedAt: new Date().toISOString(),
  };

  return updatedSupervision;
}

/**
 * TAHAP A • AMATI: Memilih fokus perbaikan dari empat indikator di Kesimpulan Selidiki.
 * Memeriksa instrumen sebelumnya (Telaah RPP, Pra-Observasi, Observasi, Kesimpulan Selidiki)
 * dan mengisikan data secara otomatis serta berkesinambungan.
 */
export function generateAmatiData(
  supervision: Supervision,
  selectedKeys?: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid' | string)[],
  customBaseline?: { peranGuru: string; aktivitasMurid: string; konteksNyata: string; refleksiMurid: string }
) {
  const teacherName = supervision.teacherName || 'Guru Binaan';
  const subject = supervision.subject || 'Mata Pelajaran';
  const schoolName = supervision.schoolName || 'SMA Swasta';
  const selidikiBefore = customBaseline || supervision.sambung?.selidiki?.matriksBefore;

  // 1. Periksa dan ambil kondisi awal berkesinambungan dari Kesimpulan Selidiki
  const baseline = {
    peranGuru: selidikiBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru,
    aktivitasMurid: selidikiBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
    konteksNyata: selidikiBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
    refleksiMurid: selidikiBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
  };

  // 2. Tentukan fokus perbaikan terpilih (default: 2 indikator kunci dari Kesimpulan Selidiki)
  const defaultKeys: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid')[] = ['peranGuru', 'aktivitasMurid'];
  const chosenKeys = selectedKeys && selectedKeys.length > 0
    ? selectedKeys
    : (supervision.sambung?.arahkan?.fokusIndikatorTerpilih && supervision.sambung.arahkan.fokusIndikatorTerpilih.length > 0
        ? supervision.sambung.arahkan.fokusIndikatorTerpilih
        : defaultKeys);

  // 3. Target perbaikan terperinci per indikator untuk mata pelajaran ini
  const targetPerbaikan = {
    peranGuru: `Transformasi peran ${teacherName} dari penyampai materi searah menjadi perancang & fasilitator inkuiri aktif yang menumbuhkan daya nalar murid dalam konsep ${subject}.`,
    aktivitasMurid: `Murid aktif berkolaborasi, berdiskusi memecahkan tantangan kontekstual ${subject}, dan mendemonstrasikan pengaplikasian konsep secara mandiri di kelas.`,
    konteksNyata: `Materi ${subject} terhubung secara nyata dengan fenomena kehidupan sehari-hari, isu lingkungan lokal, dan relevansi masa depan murid.`,
    refleksiMurid: `Murid membiasakan diri mengevaluasi proses pemahaman materi ${subject} melalui jurnal refleksi 3-2-1 / tiket keluar di setiap akhir sesi.`,
  };

  // 4. Rumuskan 1 kalimat fokus perubahan yang berkesinambungan
  const indicatorLabelMap: Record<string, string> = {
    peranGuru: 'peran guru sebagai fasilitator inkuiri',
    aktivitasMurid: 'keterlibatan aktif murid dalam pembelajaran',
    konteksNyata: 'keterhubungan materi dengan konteks nyata',
    refleksiMurid: 'pembiasaan refleksi belajar berkala',
  };
  const chosenLabels = chosenKeys.map(k => indicatorLabelMap[k] || k).join(' serta ');

  const fokusPerubahan = `Meningkatkan kualitas pembelajaran ${subject} melalui penguatan ${chosenLabels} guna menciptakan pengalaman belajar murid yang berpusat pada murid, aktif, dan bermakna.`;

  // 5. Matriks rencana aksi pembinaan terstruktur berkesinambungan
  const kegiatanList: SambungKegiatanAksi[] = [];
  let kId = 1;

  if (chosenKeys.includes('peranGuru')) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: 'peranGuru',
      kegiatanPembinaan: `Workshop & Coaching penyusunan skenario pembelajaran ${subject} berpusat pada murid (student-centered learning)`,
      indikatorKeberhasilan: `Modul ajar ${subject} memuat diferensiasi proses dan peran guru sebagai coach/fasilitator inkuiri terverifikasi pengawas`,
      waktu: 'Bulan ke-1',
      penanggungJawab: `${teacherName} & Kusnandar, M.Si`,
    });
  }

  if (chosenKeys.includes('aktivitasMurid')) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: 'aktivitasMurid',
      kegiatanPembinaan: `Pendampingan implementasi LKPD eksploratif dan teknik diskusi kolaboratif pemecahan masalah ${subject}`,
      indikatorKeberhasilan: `Keterlibatan aktif murid dalam diskusi kelompok dan presentasi solusi mencapai >85% murid di kelas`,
      waktu: 'Bulan ke-2',
      penanggungJawab: `${teacherName} & Rekan Sejawat`,
    });
  }

  if (chosenKeys.includes('konteksNyata')) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: 'konteksNyata',
      kegiatanPembinaan: `Bedah materi ${subject} berbasis fenomena nyata lingkungan dan studi kasus kontekstual terkini`,
      indikatorKeberhasilan: `Setiap tujuan pembelajaran terhubung langsung dengan minimal 1 contoh kasus riil atau aplikasi kehidupan sehari-hari`,
      waktu: 'Bulan ke-2',
      penanggungJawab: `${teacherName} & MGMP Sekolah`,
    });
  }

  if (chosenKeys.includes('refleksiMurid')) {
    kegiatanList.push({
      id: kId++,
      fokusIndikator: 'refleksiMurid',
      kegiatanPembinaan: `Penerapan instrumen refleksi harian (exit ticket / jurnal refleksi 3-2-1) pada 10-15 menit akhir sesi ${subject}`,
      indikatorKeberhasilan: `100% murid secara rutin mendokumentasikan pemahaman, kesulitan, dan target belajar pribadi di lembar refleksi`,
      waktu: 'Bulan ke-3',
      penanggungJawab: `${teacherName}`,
    });
  }

  if (kegiatanList.length === 0) {
    kegiatanList.push(
      {
        id: 1,
        fokusIndikator: 'peranGuru',
        kegiatanPembinaan: `Coaching reflektif penguatan pedagogik pembelajaran ${subject}`,
        indikatorKeberhasilan: `Modul ajar dan skenario kelas berfokus penuh pada pengalaman belajar aktif murid`,
        waktu: 'Bulan ke-1',
        penanggungJawab: `${teacherName} & Kusnandar, M.Si`,
      },
      {
        id: 2,
        fokusIndikator: 'aktivitasMurid',
        kegiatanPembinaan: `Observasi teman sejawat dan refleksi berkala pelibatan aktif murid`,
        indikatorKeberhasilan: `Murid aktif mendemonstrasikan pemahaman konsep dan bekerja sama dalam tim`,
        waktu: 'Bulan ke-2',
        penanggungJawab: `${teacherName}`,
      }
    );
  }

  return {
    fokusIndikatorTerpilih: chosenKeys,
    analisisKesimpulanSelidiki: baseline,
    targetPerbaikan,
    alasanFokusPerbaikan: `Berdasarkan hasil telaah modul dan observasi kelas pada instrumen Selidiki, aspek ${chosenLabels} memerlukan penguatan terarah agar pembelajaran ${subject} berdampak optimal bagi murid.`,
    periode: supervision.sambung?.arahkan?.periode || 'Semester Genap 2025/2026',
    fokusPerubahan,
    kegiatan: kegiatanList,
    tandaTangan: {
      pengawas: 'Kusnandar, M.Si',
      kepalaSekolah: supervision.sambung?.arahkan?.tandaTangan?.kepalaSekolah || 'Kepala Sekolah',
      guru: teacherName,
      tanggalDisepakati: supervision.sambung?.arahkan?.tandaTangan?.tanggalDisepakati || new Date().toISOString().split('T')[0],
    },
  };
}

/**
 * Terapkan pengisian otomatis Tahap A (AMATI) secara berkesinambungan ke objek supervisi
 */
export function applyAmatiAutoFillToSupervision(
  supervision: Supervision,
  selectedKeys?: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid' | string)[]
): Supervision {
  const amatiData = generateAmatiData(supervision, selectedKeys);
  const existingSambung = supervision.sambung || createDefaultSambungForTeacher(
    supervision.teacherName,
    supervision.schoolName,
    supervision.subject
  );

  const updatedSambung: SambungData = {
    ...existingSambung,
    arahkan: {
      ...existingSambung.arahkan,
      ...amatiData,
    },
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...supervision,
    sambung: updatedSambung,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * TAHAP M • MAKNAI: COACHING DAN REFLEKSI PASCA OBSERVASI (10 PERTANYAAN)
 * Berdasarkan dokumen resmi instrumen pengawas pembina Kusnandar, M.Si.
 * Jawaban disesuaikan secara otomatis dan berkesinambungan dengan hasil observasi kelas,
 * profil mata pelajaran guru, dan kesimpulan akhir siklus SAMBUNG.
 */
export function generateTeacherMaknaiData(supervision: Supervision): SambungMaknaiData {
  const teacherName = supervision.teacherName || 'Guru Binaan';
  const cleanName = teacherName.toLowerCase();
  const subject = supervision.subject || 'Mata Pelajaran';
  const lessonTitle = supervision.lessonTitle || subject;
  const schoolName = supervision.schoolName || 'SMA Swasta';
  const obsScore = supervision.observasiKelas?.score ?? 86.7;
  const obsPred = supervision.observasiKelas?.predicate ?? 'Baik';
  const today = new Date().toISOString().split('T')[0];

  // 1. Data khusus Ibu Sondang Asih Januarti, S.Pd. (Fisika / SMAN 2 Bogor)
  if (cleanName.includes('sondang')) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: 'Saya merasa sangat bersyukur dan lega melihat antusiasme murid. Saat simulasi PhET Circuit Construction Kit DC dan perakitan rangkaian lampu led baterai dilakukan, murid yang biasanya pendiam di baris belakang tampak sangat aktif berdiskusi dan antusias membandingkan nyala lampu.',
        q2: 'Sekitar 85% proses pembelajaran berjalan sesuai modul ajar. Bagian pengalaman memahami konsep Hukum Ohm dan mengaplikasikannya dalam simulasi sirkuit berjalan lancar sesuai rencana. Namun, bagian merefleksi pembelajaran sedikit berubah karena murid sangat asyik bereksperimen sehingga alokasi waktu penutup perlu penyesuaian dinamis.',
        q3: 'Hal yang sangat memuaskan adalah saat kelompok 3 berteriak gembira menemukan mengapa lampu paralel tetap menyala saat satu kabel saklar dilepas. Mereka menemukan sendiri esensi instalasi kelistrikan rumah tangga tanpa saya harus mendiktekan rumusnya di papan tulis.',
        q4: 'Saya memperkirakan sekitar 88% murid telah mencapai tujuan pembelajaran. Buktinya terlihat dari ketuntasan lembar kerja penyelidikan rangkaian dan hasil kuis formatif interaktif di mana sebagian besar murid mampu menganalisis hubungan beda potensial dan arus dengan presisi.',
        q5: 'Kesulitan murid terutama pada perhitungan matematis hambatan pengganti pecahan pada rangkaian kombinasi. Saya menanggapi perbedaan kemampuan ini dengan menyediakan panduan tangga perhitungan berjenjang (scaffolding) dan mengelompokkan murid secara heterogen bersama tutor sebaya.',
        q6: 'Murid menilai proses belajarnya melalui lembar tiket keluar (exit ticket) reflektif 3-2-1 (tiga hal dipahami, dua hal menarik, satu hal membingungkan). Umpan balik yang saya berikan berupa apresiasi langsung atas nalar kritis mereka serta penguatan konsep langsung ke meja kelompok yang masih ragu.',
        q7: 'Kesulitan saya adalah mengelola pembagian waktu agar pendampingan ke seluruh 8 kelompok praktikum dapat merata ketika beberapa kelompok mengalami kendala teknis simulasi di perangkat Chromebook secara bersamaan.',
        q8: 'Alternatif saya adalah menunjuk satu murid sebagai ketua tim teknis di setiap kelompok yang diberi penjelasan singkat sebelum jam pelajaran dimulai, serta menyediakan lembar troubleshooting mandiri di meja praktikum.',
        q9: 'Hal yang telah mantap: penciptaan iklim kelas yang aman, pelibatan aktif seluruh murid, dan kontekstualisasi fenomena nyata kelistrikan (skor observasi 86.7 / Sangat Baik). Hal yang perlu ditingkatkan: butir pengelolaan alokasi waktu pada penutupan refleksi dan pemberian umpan balik formatif tertulis yang lebih terdokumentasi.',
        q10: 'Pada pertemuan berikutnya, saya akan memperkuat praktik Pembelajaran Mendalam dengan menugaskan proyek mini audit konsumsi energi listrik rumah tangga murid (analisis KWh meter), memberikan ruang diferensiasi produk presentasi, serta mengalokasikan 10 menit penuh khusus dialog refleksi metakognisi murid.',
      },
      kesanUmum: `Proses pembelajaran ${subject} berlangsung sangat dinamis, partisipatif, dan berhasil mengubah persepsi fisika dari hafalan rumus kaku menjadi sains pemecahan masalah kontekstual yang menyenangkan.`,
      saranMasukan: `Pertahankan strategi fasilitasi inkuiri yang berpusat pada murid. Tingkatkan pemanfaatan rubrik asesmen diri (self-assessment) secara berkelanjutan agar metakognisi murid semakin mandiri dan terdokumentasi.`,
      coaching: {
        tujuan: 'Saya ingin murid memandang materi Listrik Arus Searah bukan momok rumus Hukum Ohm yang membosankan, tetapi sains aplikatif yang menjelaskan bagaimana smartphone mereka mengisi daya dengan aman dan bagaimana mendesain instalasi kelistrikan yang efisien.',
        realitas: 'Saat ini murid hanya bersemangat selama 10 menit awal pemutaran video mobil listrik, namun kehilangan gairah begitu rumus loop Hukum Kirchhoff diperkenalkan di papan tulis.',
        opsi: 'Mengganti papan rumus kaku dengan simulasi langsung menggunakan PhET Circuit Construction Kit DC dan rangkaian nyata lampu led dengan baterai di atas meja kelompok.',
        komitmen: 'Saya berkomitmen menerapkan LKPD inkuiri rangkaian listrik DC minggu depan, memberi ruang kelompok membedah satu masalah kelistrikan nyata di sekolah, dan meninjau kembali bersama Bapak Pengawas Kusnandar pada 29 Agustus 2025.',
      },
    };
  }

  // 2. Data khusus Ibu Ivany Ratna Ekandini, S.Pd. (Bahasa Indonesia / SMAN 4 Bogor)
  if (cleanName.includes('ivany')) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: 'Saya sangat gembira melihat antusiasme murid. Saat membaca cuplikan berita aktual pelayanan publik dan mengubahnya menjadi draf komik anekdot, murid sangat bersemangat mengemukakan ide-ide kritis yang menggelitik namun tetap sopan.',
        q2: 'Proses belajar 90% sesuai modul ajar. Pengalaman memahami struktur teks anekdot dan mengaplikasikannya dalam naskah berjalan tepat waktu. Bagian merefleksi disesuaikan dengan teknik peer-review berpasangan agar setiap murid mendapat umpan balik langsung dari temannya.',
        q3: 'Hal yang paling memuaskan adalah saat murid yang pendiam berani maju membacakan naskah monolog anekdotnya dengan ekspresif. Seluruh kelas tertawa dan memahami pesan moral di balik kritik fasilitas umum tanpa ada rasa kaku atau takut salah.',
        q4: 'Ketercapaian tujuan diperkirakan mencapai 86%. Bukti nyata terlihat dari ketuntasan produk draf anekdot di mana 32 dari 36 murid berhasil memenuhi kelima struktur (abstraksi, orientasi, krisis, reaksi, koda) dengan bahasa retoris yang tepat.',
        q5: 'Kesulitan murid adalah membedakan antara lelucon biasa dengan teks anekdot yang memuat kritik sosial berbobot. Saya mengatasinya dengan memberikan rubrik panduan pembeda dan mendampingi kelompok yang masih terjebak pada humor fisik agar beralih ke kritik sistemik.',
        q6: 'Murid mengevaluasi karyanya menggunakan ceklis kriteria kesantunan berbahasa dan rubrik rubrik penilaian teman sejawat. Saya memberikan catatan umpan balik berupa apresiasi pilihan diksi serta arahan agar sindiran tidak mengarah ke fisik individu.',
        q7: 'Kesulitan saya adalah memfasilitasi kebutuhan konsultasi naskah yang sangat variatif dalam waktu 2 jam pelajaran, karena setiap kelompok memiliki ide cerita yang unik.',
        q8: 'Alternatifnya adalah menggunakan papan digital Padlet kolaboratif sehingga draf naskah dapat dibaca dan diberi catatan umpan balik secara daring oleh saya dan rekan sejawat sebelum dipresentasikan.',
        q9: 'Hal yang telah mantap: keberanian murid berpendapat kritis, keterampilan komunikasi santun, dan suasana belajar yang sangat apresiatif (skor observasi 84.8 / Baik). Hal yang perlu ditingkatkan: butir penguatan variasi instrumen refleksi tertulis di akhir pertemuan.',
        q10: 'Untuk pertemuan berikutnya, saya akan memperkuat Pembelajaran Mendalam dengan menyelenggarakan pameran mini komik strip teks anekdot karya murid di majalah dinding digital sekolah dan memfasilitasi refleksi nilai-nilai integritas publik.',
      },
      kesanUmum: 'Pembelajaran Bahasa Indonesia berhasil mengasah daya nalar kritis dan literasi ekspresif murid melalui karya teks anekdot yang santun, relevan, dan bermakna.',
      saranMasukan: 'Dokumentasikan hasil karya murid sebagai portofolio praktik baik literasi sekolah dan terus kembangkan metode peer-assessment yang telah berjalan positif.',
      coaching: {
        tujuan: 'Saya ingin murid berani bersuara kritis terhadap persoalan di sekitarnya, namun tetap menjunjung tinggi budi pekerti dan kesantunan bahasa Indonesia.',
        realitas: 'Murid sering kali kebablasan menyindir teman secara personal ketika diminta membuat lelucon, atau sebaliknya menulis cerita yang sama sekali tidak ada sindiran sosialnya.',
        opsi: 'Menggunakan koran daring lokal sebagai pemantik fakta dan menyepakati aturan main: kritik terhadap sistem atau fenomena, bukan fisik individu.',
        komitmen: 'Saya akan memfasilitasi riset fakta mini 15 menit dan menerapkan rubrik kesantunan peer-review pada pertemuan minggu depan.',
      },
    };
  }

  // 3. Data khusus Ibu Siti Salma, S.Pd (Fisika / Gelombang Bunyi / SMAN 2 Bogor)
  if (cleanName.includes('salma')) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: 'Kesan saya sangat positif. Murid menunjukkan rasa ingin tahu yang tinggi ketika gawai mereka digunakan sebagai audio frequency generator untuk membedah konsep resonansi bunyi pada kolom udara.',
        q2: 'Pembelajaran berjalan 88% sesuai modul ajar. Bagian memahami perambatan gelombang dan mengaplikasikan tabung resonansi berjalan efektif. Bagian refleksi berjalan interaktif saat mengaitkan bahaya polusi suara bagi pendengaran remaja.',
        q3: 'Momen memuaskan terjadi saat murid mendengar dengung penguatan bunyi pertama dan serentak berseru takjub karena teori gelombang bunyi terbukti nyata di hadapan mereka.',
        q4: 'Ketercapaian tujuan mencapai 87% dibuktikan dengan keakuratan data pengukuran panjang gelombang pada LKPD dan kemampuan murid menghitung cepat rambat bunyi di udara dengan galat kurang dari 5%.',
        q5: 'Kesulitan murid adalah menjaga kestabilan air pada tabung resonansi dan ketelitian membaca skala mistar. Saya menugaskan peran spesifik dalam tim: satu pengatur air, satu pengamat skala, dan dua pencatat data.',
        q6: 'Murid merefleksikan proses belajarnya melalui jurnal belajar ringkas. Umpan balik langsung saya berikan terkait ketelitian metode ilmiah dan cara meminimalkan kesalahan paralaks saat membaca skala.',
        q7: 'Kesulitan saya adalah kebisingan suara frekuensi dari kelompok yang berdekatan yang sempat mengaburkan pendengaran nada dengung kelompok lain.',
        q8: 'Alternatifnya adalah membagi giliran pengujian frekuensi atau menggunakan earphone pemandu frekuensi satu telinga untuk kelompok uji.',
        q9: 'Hal yang telah mantap: eksperimen sains autentik, antusiasme kolaborasi, dan integrasi teknologi digital (skor observasi 86.0 / Baik). Hal yang perlu ditingkatkan: manajemen kebisingan ruang kelas saat praktikum akustik serentak.',
        q10: 'Pada pertemuan lanjutan, saya akan memperkuat Pembelajaran Mendalam dengan menugaskan penyelidikan tingkat kebisingan (desibel meter) di area kantin dan perpustakaan sekolah untuk kampanye perlindungan pendengaran.',
      },
      kesanUmum: 'Pembelajaran gelombang bunyi berlangsung aplikatif, interaktif, dan berhasil membuktikan konsep fisis secara nyata melalui keterlibatan aktif murid.',
      saranMasukan: 'Kembangkan lembar kerja yang menstimulasi murid merancang investigasi akustik mandiri dan dorong keterhubungan dengan isu kesehatan lingkungan.',
      coaching: {
        tujuan: 'Saya ingin murid menyadari bahwa fisika gelombang bukan sebatas rumus di buku, tetapi sains di balik setiap dentuman musik yang mereka nikmati dan kunci menjaga telinga tetap sehat seumur hidup.',
        realitas: 'Murid sering menghafal rumus v = f × λ namun bingung menjelaskan mengapa suara petir bisa menggetarkan kaca jendela atau mengapa nada gitar berubah saat senar dipetik di fret berbeda.',
        opsi: 'Memanfaatkan aplikasi generator nada di gawai mereka sendiri dan tabung resonansi air sehingga gelombang bunyi dapat didengar dan diamati perubahannya secara nyata.',
        komitmen: 'Saya akan menerapkan LKPD inkuiri resonansi bunyi dan menugaskan kelompok menganalisis batas aman paparan suara earphone pada pertemuan 18 September.',
      },
    };
  }

  // 4. Data khusus Ibu Alline Novianti, S.Pd. (Kimia / SMAN 2 Bogor)
  if (cleanName.includes('alline')) {
    return {
      tanggal: supervision.sambung?.maknai?.tanggal || today,
      pertanyaanList: {
        q1: 'Saya sangat terkesan dengan keterlibatan murid saat memodelkan ikatan kimia menggunakan plastisin dan simulasi molekul 3D. Murid yang biasanya merasa kimia rumit menjadi sangat antusias.',
        q2: 'Proses belajar berjalan 86% sesuai rencana modul ajar. Bagian memahami konfigurasi elektron dan mengaplikasikannya dalam bentuk molekul berjalan sangat interaktif.',
        q3: 'Hal yang sangat memuaskan adalah saat murid mampu memprediksi kepolaran senyawa berdasarkan bentuk molekul yang mereka rakit sendiri dan membuktikannya dengan percobaan uji pembelokan arus air.',
        q4: 'Ketercapaian tujuan mencapai 85% didukung oleh hasil post-test interaktif dan lembar verifikasi struktur Lewis yang dikerjakan secara tuntas oleh murid.',
        q5: 'Kesulitan murid adalah membayangkan sudut ikatan ruang 3 dimensi dari gambar 2 dimensi di buku. Saya menanganinya dengan menggunakan aplikasi augmented reality molekul di ponsel murid.',
        q6: 'Murid mengisi refleksi ketercapaian kompetensi di lembar kerja mandiri. Umpan balik saya berikan secara lisan saat berkeliling mendampingi perakitan model molekul.',
        q7: 'Kesulitan saya adalah ketersediaan set model molymod yang terbatas sehingga harus mengombinasikan dengan bahan plastisin warna-warni.',
        q8: 'Alternatif saya adalah memanfaatkan bahan alternatif ramah lingkungan dan aplikasi pemodelan digital yang dapat diunduh gratis oleh murid.',
        q9: 'Hal yang telah mantap: visualisasi konsep mikroskopis ke makroskopis dan interaksi kelompok (skor observasi 85.5 / Baik). Hal yang perlu ditingkatkan: pemberian umpan balik tertulis yang lebih sistematis.',
        q10: 'Pada sesi berikutnya, saya akan memperkuat Pembelajaran Mendalam dengan mengaitkan bentuk molekul dengan kelarutan obat-obatan dan sifat sabun pembersih dalam kehidupan sehari-hari.',
      },
      kesanUmum: 'Pembelajaran kimia berlangsung aplikatif, menyenangkan, dan berhasil memvisualisasikan dunia mikroskopis menjadi pengalaman belajar nyata.',
      saranMasukan: 'Pertahankan diferensiasi media visual dan dorong murid untuk mempresentasikan logika pembentukan ikatan dengan narasi mereka sendiri.',
      coaching: {
        tujuan: `Menciptakan ruang belajar ${subject} yang membangkitkan nalar kritis dan rasa ingin tahu murid terhadap fenomena molekuler di sekitar mereka.`,
        realitas: 'Murid masih sering menghafal bentuk molekul tanpa memahami prinsip tolakan pasangan elektron bebas.',
        opsi: 'Mengintegrasikan perakitan model fisik plastisin dengan simulasi digital interaktif.',
        komitmen: 'Menerapkan modul ajar inkuiri terbimbing pemodelan ikatan kimia pada pertemuan berikutnya.',
      },
    };
  }

  // 5. Data Universal Cerdas Otomatis Sesuai Mata Pelajaran & Kesimpulan Akhir
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
      q10: `Untuk memperkuat praktik Pembelajaran Mendalam (Deep Learning) pada pertemuan berikutnya, saya akan menerapkan pembelajaran berbasis proyek/studi kasus kontekstual, memperkuat peran saya sebagai coach dan fasilitator inkuiri, serta membiasakan murid melakukan asesmen diri secara konsisten.`,
    },
    kesanUmum: `Proses pembelajaran ${subject} oleh ${teacherName} berlangsung interaktif, berpusat pada murid, dan berhasil menciptakan lingkungan belajar yang aman, inklusif, dan bermakna.`,
    saranMasukan: `Pertahankan fasilitasi inkuiri yang mengaktifkan nalar murid. Tingkatkan pemanfaatan rubrik refleksi berkala dan bagikan praktik baik ini dalam Komunitas Belajar (Kombel) sekolah.`,
    coaching: {
      tujuan: `Menciptakan pengalaman belajar ${subject} yang berpusat pada murid, mengembangkan nalar kritis, dan relevan dengan kehidupan nyata.`,
      realitas: `Keterlibatan murid telah meningkat signifikan, namun konsistensi refleksi dan diferensiasi proses masih perlu terus diperkuat.`,
      opsi: `Menerapkan LKPD eksploratif terstruktur, studi kasus nyata, dan teknik refleksi harian (exit ticket).`,
      komitmen: `Berkomitmen melaksanakan rencana tindak lanjut pembinaan bersama pengawas pembina Kusnandar, M.Si pada pertemuan mendatang.`,
    },
  };
}

/**
 * Menerapkan pengisian otomatis Tahap M (MAKNAI) secara berkesinambungan ke objek supervisi
 */
export function applyMaknaiAutoFillToSupervision(supervision: Supervision): Supervision {
  const maknaiData = generateTeacherMaknaiData(supervision);
  const existingSambung = supervision.sambung || createDefaultSambungForTeacher(
    supervision.teacherName,
    supervision.schoolName,
    supervision.subject
  );

  const updatedSambung: SambungData = {
    ...existingSambung,
    maknai: {
      ...existingSambung.maknai,
      ...maknaiData,
    },
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...supervision,
    sambung: updatedSambung,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * TAHAP B • BERDAYAKAN:
 * Input RPP Perbaikan & Telaah Kembali Secara Otomatis (22 Aspek Telaah Perencanaan Pembelajaran)
 * Sesuai Dokumen Resmi Pengawas Pembina Kusnandar, M.Si.
 * 
 * Menghubungkan secara berkesinambungan:
 * 1. SELIDIKI: Kelemahan/catatan telaah awal & observasi baseline.
 * 2. AMATI: Fokus perbaikan terpilih (peran guru, aktivitas murid, konteks nyata, refleksi murid).
 * 3. MAKNAI: Kesepakatan coaching alur TIRTA dan 10 pertanyaan refleksi pasca-observasi.
 * 4. KESIMPULAN AKHIR: RPP hasil revisi mencapai predikat "Sangat Baik" (skor 100% / 44 dari 44).
 */
export function generateBerdayakanTelaahPerbaikanData(
  supervision: Supervision,
  customRppUrl?: string,
  customTitle?: string
): SambungBerdayakanData {
  const teacherName = supervision.teacherName || 'Guru Binaan';
  const schoolName = supervision.schoolName || 'SMA Binaan';
  const subject = supervision.subject || 'Mata Pelajaran';
  const cleanName = teacherName.toLowerCase();

  // 1. Dapatkan fokus Amati dan komitmen Maknai
  const amati = supervision.sambung?.arahkan;
  const chosenKeys = amati?.fokusIndikatorTerpilih || ['peranGuru', 'aktivitasMurid'];
  const maknai = supervision.sambung?.maknai;

  // 2. Tentukan tautan berkas dan judul RPP Perbaikan
  const rppUrl = (
    customRppUrl ||
    supervision.sambung?.berdayakan?.rppPerbaikanUrl ||
    supervision.perangkatAjar?.revisi?.modulAjarRevisiUrl ||
    supervision.perangkatAjarPerbaikan?.driveLinks?.modulAjarUrl ||
    `https://drive.google.com/file/d/1RPP_Perbaikan_${encodeURIComponent(subject)}_${encodeURIComponent(teacherName.replace(/\s+/g, '_'))}/view?usp=sharing`
  ).trim();

  const rppTitle = (
    customTitle ||
    supervision.sambung?.berdayakan?.rppPerbaikanTitle ||
    (supervision.lessonTitle ? `RPP Perbaikan: ${supervision.lessonTitle}` : `Modul Ajar Perbaikan Inovatif & Kontekstual ${subject}`)
  ).trim();

  const tanggalTelaah = supervision.sambung?.berdayakan?.tanggalTelaah || new Date().toISOString().split('T')[0];
  const namaPenelaah = supervision.sambung?.berdayakan?.namaPenelaah || supervision.supervisorName || 'Kusnandar, M.Si';

  // 3. Skor 22 Aspek Telaah Perencanaan Pembelajaran Perbaikan (Skor optimal 2 untuk seluruh aspek)
  const telaahScores: Record<number, number | 'NA'> = {
    1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
    12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
  };

  // 4. Komentar Kritis Spesifik yang Menghubungkan Selidiki, Amati, Maknai, dan Hasil Kesimpulan
  let telaahComments: Record<number, string> = {};

  if (cleanName.includes('dewi') || subject.toLowerCase().includes('fisika')) {
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
      22: `Lembar Kerja Murid (LKPD) perbaikan dirancang sangat terstruktur, memandu inkuiri mandiri tanpa membatasi kreativitas penalaran murid.`,
    };
  } else if (cleanName.includes('ahmad') || subject.toLowerCase().includes('biologi')) {
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
      22: `LKPD PjBL perbaikan terstruktur rapi, memuat panduan keselamatan kerja biologi dan lembar data pengamatan yang mudah dipahami.`,
    };
  } else if (cleanName.includes('siti') || subject.toLowerCase().includes('bahasa indonesia')) {
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
      22: `LKPD perbaikan memuat scaffolding tahapan menemukan premis lucu hingga penulisan koda moral yang inspiratif.`,
    };
  } else {
    // Generik berbasis mata pelajaran & fokus Amati-Maknai
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
      22: `Lembar Kerja Murid (LKPD) perbaikan dirancang kontekstual, eksploratif, dan selaras sempurna dengan tujuan pembelajaran ${subject}.`,
    };
  }

  // 5. Umpan Balik Perencanaan Pembelajaran (Halaman 7 PDF)
  const feedback = {
    kelebihan: `Perencanaan pembelajaran hasil perbaikan menunjukkan lompatan kualitas yang sangat signifikan: integrasi diferensiasi konten & proses, simulasi pemecahan masalah kontekstual materi ${subject}, serta alur pengalaman belajar Memahami, Mengaplikasi, dan Merefleksi telah terjalin utuh selaras dengan rekomendasi coaching SAMBUNG.`,
    perbaikan: `Pertahankan konsistensi fasilitasi saat uji coba di kelas, optimalkan waktu transisi antaraktivitas kelompok, dan biasakan murid melakukan refleksi metakognitif harian secara konsisten.`,
    rekomendasi: `RPP perbaikan telah memenuhi seluruh kriteria Pembelajaran Mendalam secara optimal (skor 44 / 100% / Predikat Sangat Baik). Sangat layak untuk diimplementasikan pada observasi tatap muka lanjutan dan dibagikan sebagai model praktik baik di Komunitas Belajar (Kombel) ${schoolName}.`
  };

  const kategoriDeskripsi = 'Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.';

  // 6. Siklus Berdayakan yang Terhubung Langsung dengan Perbaikan RPP
  const existingSiklus = supervision.sambung?.berdayakan?.siklusList;
  const siklusList: SambungSiklusBerdayakan[] = (existingSiklus && existingSiklus.length > 0)
    ? existingSiklus
    : [
        {
          siklus: 1,
          rancanganDanUjiCoba: `Uji coba modul ajar perbaikan ${subject} dengan studi kasus kontekstual dan lembar eksplorasi bertingkat pada kelompok heterogen.`,
          refleksi: `Keterlibatan murid meningkat tajam; murid antusias berdiskusi dan berani mengutarakan gagasan tanpa ragu.`,
          perbaikanBerikutnya: `Memperkuat panduan scaffolding bagi murid yang memerlukan waktu eksplorasi tambahan.`,
        },
        {
          siklus: 2,
          rancanganDanUjiCoba: `Penerapan diferensiasi proses dengan media digital interaktif dan sesi umpan balik antarteman (peer-assessment).`,
          refleksi: `Kolaborasi antarmurid berjalan solid; seluruh murid mampu menuntaskan tantangan belajar sesuai ritme masing-masing.`,
          perbaikanBerikutnya: `Mengembangkan instrumen refleksi diri murid dengan format 3-2-1 dan tiket keluar di akhir sesi.`,
        },
        {
          siklus: 3,
          rancanganDanUjiCoba: `Presentasi unjuk kerja karya murid dan refleksi mendalam mengenai kebermaknaan materi ${subject} dalam kehidupan nyata.`,
          refleksi: `Murid mandiri dan percaya diri memaparkan hasil penalaran; pemahaman konsep esensial tercapai 100% tuntas.`,
          perbaikanBerikutnya: `Mendokumentasikan hasil karya murid sebagai portofolio kelas dan membagikan modul ke MGMP sekolah.`,
        },
      ];

  return {
    rppPerbaikanUrl: rppUrl,
    rppPerbaikanTitle: rppTitle,
    tanggalTelaah,
    namaPenelaah,
    telaahScores,
    telaahComments,
    telaahSummary: {
      totalScore: 44,
      maxPossibleScore: 44,
      finalScore: 100,
      predicate: 'Sangat Baik',
      kategoriDeskripsi,
    },
    feedback,
    catatanRefleksiGuru: `Modul ajar perbaikan ini telah mengadopsi seluruh rekomendasi evaluasi instrumen Selidiki, fokus target Amati, dan komitmen dialog coaching Maknai untuk mewujudkan pembelajaran yang berpusat pada murid.`,
    siklusList,
  };
}

/**
 * Terapkan pengisian otomatis Tahap B (BERDAYAKAN) secara berkesinambungan ke objek supervisi,
 * sekaligus menyinkronkan data ke perangkatAjarPerbaikan dan database.
 */
export function applyBerdayakanAutoFillToSupervision(
  supervision: Supervision,
  customRppUrl?: string,
  customTitle?: string
): Supervision {
  const berdayakanData = generateBerdayakanTelaahPerbaikanData(supervision, customRppUrl, customTitle);
  const existingSambung = supervision.sambung || createDefaultSambungForTeacher(
    supervision.teacherName,
    supervision.schoolName,
    supervision.subject
  );

  const updatedSambung: SambungData = {
    ...existingSambung,
    berdayakan: {
      ...existingSambung.berdayakan,
      ...berdayakanData,
    },
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...supervision,
    sambung: updatedSambung,
    perangkatAjarPerbaikan: {
      driveLinks: {
        cpTpAtpUrl: supervision.perangkatAjarPerbaikan?.driveLinks?.cpTpAtpUrl || supervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || 'https://drive.google.com/file/d/1CpTpAtp_Revisi/view',
        modulAjarUrl: berdayakanData.rppPerbaikanUrl || 'https://drive.google.com/file/d/1ModulAjar_Revisi/view',
        bahanAjarUrl: supervision.perangkatAjarPerbaikan?.driveLinks?.bahanAjarUrl || supervision.perangkatAjar?.driveLinks?.bahanAjarUrl || 'https://drive.google.com/file/d/1BahanAjar_Revisi/view',
        asesmenUrl: supervision.perangkatAjarPerbaikan?.driveLinks?.asesmenUrl || supervision.perangkatAjar?.driveLinks?.asesmenUrl || 'https://drive.google.com/file/d/1Asesmen_Revisi/view',
      },
      submittedAt: new Date().toISOString(),
      telaahScores: berdayakanData.telaahScores,
      telaahComments: berdayakanData.telaahComments,
      telaahSummary: berdayakanData.telaahSummary,
      feedback: berdayakanData.feedback,
      catatanRevisiGuru: berdayakanData.catatanRefleksiGuru || `Modul ajar perbaikan telah menyempurnakan aspek diferensiasi, asesmen autentik, dan pengalaman belajar mendalam sesuai arahan pendampingan SAMBUNG.`,
      reviewedAt: new Date().toISOString(),
      reviewedBy: berdayakanData.namaPenelaah,
    },
    perangkatAjar: {
      ...supervision.perangkatAjar,
      revisi: {
        ...supervision.perangkatAjar?.revisi,
        modulAjarRevisiUrl: berdayakanData.rppPerbaikanUrl,
        catatanRevisiGuru: `RPP Perbaikan telah ditelaah kembali secara optimal dan selaras dengan siklus Selidiki, Amati, Maknai.`,
        revisiSubmittedAt: new Date().toISOString(),
        revisiStatus: 'disetujui',
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * TAHAP U • UJI:
 * Otomatisasi Instrumen Uji Coba Lapangan (Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi, Angket Suara Murid, dan Kesimpulan Transformasi).
 * Secara koheren menghubungkan:
 * 1. SELIDIKI: Kelemahan awal modul ajar & observasi awal (baseline)
 * 2. AMATI: Fokus perubahan dan rencana kegiatan aksi pembinaan
 * 3. MAKNAI: Kesepakatan coaching alur TIRTA & 10 pertanyaan refleksi
 * 4. BERDAYAKAN: Hasil telaah RPP perbaikan 22 aspek & siklus rancang-coba
 * 5. UJI & KESIMPULAN: Pembuktian di ruang kelas dan perumusan 4 indikator transformasi akhir (Peran Guru, Aktivitas Murid, Konteks Nyata, Refleksi Murid)
 */
export function generateUjiData(supervision: Supervision): SambungUjiData {
  const teacherName = supervision.teacherName || 'Guru Binaan';
  const schoolName = supervision.schoolName || 'SMA Binaan';
  const subject = supervision.subject || 'Mata Pelajaran';
  const lessonTitle = supervision.lessonTitle || 'Pembelajaran Kontekstual Berdiferensiasi';
  const cleanName = teacherName.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  // 1. Data Pra-Observasi Perbaikan (8 Butir Pertanyaan)
  let praObservasi: SambungUjiPraObservasi;
  if (cleanName.includes('dewi') || subject.toLowerCase().includes('fisika')) {
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
      completedAt: new Date().toISOString(),
    };
  } else if (cleanName.includes('budi') || subject.toLowerCase().includes('biologi')) {
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
      completedAt: new Date().toISOString(),
    };
  } else if (cleanName.includes('siti') || subject.toLowerCase().includes('matematika')) {
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
      completedAt: new Date().toISOString(),
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
      completedAt: new Date().toISOString(),
    };
  }

  // 2. Data Observasi Pelaksanaan Pembelajaran (25 Butir OBSERVASI_ITEMS)
  // Menghasilkan skor 2 (Tampak Nyata/Membudaya) untuk seluruh 25 butir (Skor 50/50, 100%, Sangat Baik)
  const observasiItems: Record<string, { score: number; note: string }> = {};

  const defaultNotesFor25: Record<string, string> = {
    '1': `Tujuan pembelajaran terintegrasi utuh antara dimensi sikap (gotong royong), pengetahuan konsep, dan unjuk kerja teramati jelas dalam aktivitas ${subject}.`,
    '2': `Penilaian formatif autentik berlangsung konsisten selama pembelajaran mengukur ketercapaian dimensi bernalar kritis dan profil lulusan.`,
    '3': `Alur pembelajaran dari apersepsi, eksplorasi, elaborasi, hingga penutup tertata runtut; murid fokus dan aktif mengikuti instruksi.`,
    '4': `Aktivitas pembelajaran mengaitkan materi ${subject} secara nyata dengan fenomena lingkungan dan keseharian murid.`,
    '5': `Murid tampak antusias, bersemangat saat berdiskusi, dan suasana kelas hidup dengan rasa ingin tahu tinggi.`,
    '6': `Keterlibatan aktif murid terlihat menyeluruh dalam kelompok; murid berdiskusi, bertanya kepada guru, dan menggali data dari berbagai sumber.`,
    '7': `Murid mampu mempraktikkan konsep secara langsung untuk memecahkan studi kasus kontekstual yang diberikan guru.`,
    '8': `Sesi refleksi metakognitif terlaksana optimal; murid mengutarakan keberhasilan belajarnya dan mencatat rencana tindak lanjut.`,
    '9': `Strategi inkuiri dan diferensiasi terlaksana sangat efektif sesuai tujuan yang direncanakan dalam modul ajar perbaikan.`,
    '10': `Kolaborasi dinamis antara guru-murid dan antar-murid tercipta harmonis dengan interaksi komunikatif yang konstruktif.`,
    '11': `Suasana kelas tertib, nyaman, aman secara psikologis; murid tidak ragu mengemukakan pendapat atau bertanya.`,
    '12': `Pemanfaatan media ajar interaktif dan perangkat digital mendukung pemahaman konsep abstrak secara visual dan konkret.`,
    '13': `Budaya saling menghargai dan memuliakan tercermin nyata; tidak ada intimidasi atau perundungan antarmurid saat presentasi.`,
    '14': `Murid memahami dengan jelas sasaran belajar hari ini serta mampu mengaitkannya dengan bekal pelajaran sebelumnya.`,
    '15': `Murid diberikan kebebasan memilih bentuk unjuk kerja kelompok dan melakukan evaluasi diri secara percaya diri.`,
    '16': `Mayoritas murid mencapai kriteria ketuntasan tujuan pembelajaran (KKTP) terbukti dari hasil lembar kerja yang berkualitas.`,
    '17': `Kemandirian belajar murid terwujud saat mereka memecahkan persoalan pada lembar kerja tanpa bergantung terus-menerus pada ceramah guru.`,
    '18': `Guru memberikan perlakuan adil dan scaffolding bervariasi sesuai kesiapan belajar murid (diferensiasi proses terbukti nyata).`,
    '19': `Pengelolaan waktu dan ruang kelas sangat efektif; peralihan antarfase pembelajaran berjalan mulus dan kontekstual.`,
    '20': `Refleksi akhir merujuk langsung pada pencapaian tujuan dan menjadi dasar penetapan rencana belajar pertemuan berikutnya.`,
    '21': `Guru aktif berkeliling memberikan umpan balik formatif yang memberdayakan dan mengoreksi miskonsepsi secara personal.`,
    '22': `Asesmen unjuk kerja di akhir sesi membuktikan ketercapaian kompetensi esensial murid secara transparan.`,
    '23': `Guru mencatat temuan asesmen untuk merancang pengayaan bagi kelompok cepat dan bimbingan penguatan bagi yang memerlukan.`,
    '24': `Praktik pembelajaran mencerminkan visi sekolah yang ramah anak, berorientasi masa depan, dan berpusat pada murid.`,
    '25': `Guru menunjukkan komitmen tinggi terhadap perbaikan berkelanjutan melalui refleksi mendalam pasca-observasi.`,
  };

  OBSERVASI_ITEMS.forEach(it => {
    observasiItems[it.id] = {
      score: 2,
      note: defaultNotesFor25[it.id] || `Pelaksanaan pembelajaran pada aspek ${it.category} teramati terlaksana optimal dan membudaya di kelas ${teacherName}.`,
    };
  });

  const observasiPelaksanaan: SambungUjiObservasiPelaksanaan = {
    tanggal: today,
    hariTanggal: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    kelas: supervision.classGrade || 'Fase F / Kelas XI',
    items: observasiItems,
    totalSkor: 50,
    maxPossibleScore: 50,
    persentaseCapaian: 100,
    predicate: 'Sangat Baik',
    kategoriMakna: 'Pembelajaran Sangat Berkembang (SB) & Berpusat Penuh Pada Pengalaman Murid',
    feedback: {
      kelebihan: `Transformasi praktik mengajar Ibu/Bapak ${teacherName} sangat nyata dan inspiratif! Guru berhasil beralih dari instruktur dominan menjadi fasilitator yang hangat dan memberdayakan. Murid terlibat aktif 100% dalam investigasi kelompok, diferensiasi proses terwujud nyata, dan iklim saling memuliakan di kelas sangat kental terasa.`,
      perbaikan: `Pengelolaan alokasi waktu saat sesi tanya jawab antarkelompok dapat diefisiensikan lebih lanjut dengan penetapan batasan waktu juru bicara, sehingga porsi penarikan simpulan mandiri oleh murid semakin mendalam.`,
      rekomendasi: `Pertahankan praktik pedagogis yang berpusat pada murid ini sebagai standar baku mengajar sehari-hari. Sangat direkomendasikan untuk mendiseminasikan video praktik baik dan modul ajar perbaikan ini dalam forum Komunitas Belajar (Kombel) ${schoolName} dan MGMP ${subject}.`,
    },
    completedAt: new Date().toISOString(),
  };

  // 3. Data Pasca-Observasi Perbaikan (10 Pertanyaan Coaching & Refleksi)
  const pascaObservasi: SambungUjiPascaObservasi = {
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
      q10: `Saya akan mengimbaskan metode inkuiri berdiferensiasi ini ke materi pelajaran berikutnya dan berbagi pengalaman praktik baik ini kepada rekan sejawat di Kombel sekolah.`,
    },
    kesanUmum: `Guru menunjukkan perkembangan kompetensi pedagogis yang luar biasa pasca pendampingan SAMBUNG. Suasana belajar sangat hidup, interaktif, dan berorientasi pada keberhasilan setiap murid.`,
    saranMasukan: `Lanjutkan konsistensi pembelajaran mendalam dan jadikan lembar refleksi murid sebagai rujukan berkelanjutan dalam merancang modul ajar berikutnya.`,
    completedAt: new Date().toISOString(),
  };

  // 4. Data Angket Suara Murid (U-2: Student Agency)
  const u2Items: SambungAngketMuridItem[] = [
    {
      id: 1,
      pernyataan: 'Guru membantu saya memahami hubungan materi pelajaran dengan kehidupan nyata dan lingkungan sehari-hari.',
      skorRataRata: 3.9,
      persentaseSetuju: 97.5,
    },
    {
      id: 2,
      pernyataan: 'Saya merasa dilibatkan secara aktif dalam diskusi, percobaan/eksplorasi, dan menemukan pemahaman bersama kelompok.',
      skorRataRata: 3.9,
      persentaseSetuju: 97.5,
    },
    {
      id: 3,
      pernyataan: 'Saya merasa didengarkan, dihargai, dan diperlakukan adil oleh guru serta teman-teman saat menyampaikan gagasan.',
      skorRataRata: 4.0,
      persentaseSetuju: 100.0,
    },
    {
      id: 4,
      pernyataan: 'Saya diberi ruang dan kesempatan untuk memilih cara belajar serta menyelesaikan tantangan sesuai minat saya.',
      skorRataRata: 3.8,
      persentaseSetuju: 95.0,
    },
    {
      id: 5,
      pernyataan: 'Saya diajak melakukan refleksi di akhir pelajaran untuk mengetahui apa yang sudah saya kuasai dan apa yang perlu saya perbaiki.',
      skorRataRata: 3.9,
      persentaseSetuju: 97.5,
    },
  ];

  let quoteBermakna = `“Saya senang sekali belajar ${subject} hari ini karena diajak melakukan analisis langsung dan berdiskusi seru dengan teman-teman, tidak membosankan seperti biasanya yang hanya mendengarkan penjelasan panjang.”`;
  let quoteKesulitan = `“Awalnya sempat bingung saat membedah soal studi kasus, tapi Ibu/Bapak Guru mendampingi kelompok kami dengan sabar memberi petunjuk tanpa langsung memberi kunci jawaban, sehingga kami bisa memecahkannya sendiri.”`;

  if (cleanName.includes('dewi') || subject.toLowerCase().includes('fisika')) {
    quoteBermakna = `“Paling seru saat uji coba suara dengan aplikasi generator frekuensi di HP! Saya jadi paham langsung kenapa suara di ruangan berkarpet tidak menggema seperti di ruangan kosong.”`;
    quoteKesulitan = `“Sempat bingung waktu menghitung panjang gelombang resonansi, tapi setelah dibimbing Ibu Dewi dengan tabel perbandingan visual, kelompok kami jadi mengerti rumusnya.”`;
  } else if (cleanName.includes('budi') || subject.toLowerCase().includes('biologi')) {
    quoteBermakna = `“Belajar di taman sekolah sangat menyenangkan! Kami bisa melihat langsung contoh jaring-jaring makanan dan serangga penyerbuk di pohon bunga.”`;
    quoteKesulitan = `“Sedikit kesulitan mengelompokkan jenis rantai makanan detritus, tapi lembar kerja bergambar sangat membantu kami menemukan jawabannya.”`;
  } else if (cleanName.includes('siti') || subject.toLowerCase().includes('matematika')) {
    quoteBermakna = `“Matematika jadi tidak menakutkan karena soal ceritanya tentang menghitung modal belanja kantin OSIS yang biasa kami jumpai sehari-hari!”`;
    quoteKesulitan = `“Menyusun tiga persamaan aljabar dari cerita agak rumit, tapi dengan kartu kata kunci yang disiapkan Bu Siti, kelompok kami berhasil menyelesaikannya.”`;
  }

  // 5. Data U-1 Observasi Kompatibilitas (10 Indikator Skor 4)
  const u1IndikatorList: SambungObservasiIndikator[] = [
    { id: 1, indikator: 'Murid aktif mengonstruksi pemahaman melalui eksplorasi dan tanya jawab mendalam.', dimensi: 'Memahami (Kognitif)', score: 4, catatan: 'Murid secara mandiri menghubungkan konsep dengan data percobaan kelompok.' },
    { id: 2, indikator: 'Murid menerapkan pengetahuan materi untuk memecahkan persoalan kontekstual nyata.', dimensi: 'Mengaplikasikan (Kontekstual)', score: 4, catatan: 'Penerapan studi kasus lingkungan berjalan sangat aplikatif dan logis.' },
    { id: 3, indikator: 'Murid melakukan refleksi diri terhadap proses dan hasil belajar yang telah dicapai.', dimensi: 'Merefleksi (Metakognisi)', score: 4, catatan: 'Lembar refleksi terisi jujur, mendalam, dan memuat target perbaikan.' },
    { id: 4, indikator: 'Tercipta interaksi saling memuliakan antara guru-murid dan antarmurid di kelas.', dimensi: 'Budaya Memuliakan', score: 4, catatan: 'Komunikasi verbal dan nonverbal sangat positif, santun, dan suportif.' },
    { id: 5, indikator: 'Guru memfasilitasi kebutuhan belajar murid secara berdiferensiasi (proses/konten).', dimensi: 'Diferensiasi Pembelajaran', score: 4, catatan: 'Guru memberikan bimbingan proporsional pada kelompok yang memerlukan.' },
    { id: 6, indikator: 'Murid berkolaborasi secara produktif dalam kerja tim heterogen.', dimensi: 'Gotong Royong & Kerja Sama', score: 4, catatan: 'Seluruh anggota kelompok memiliki peran dan kontribusi konkret.' },
    { id: 7, indikator: 'Penggunaan media pembelajaran dan teknologi digital relevan meningkatkan motivasi.', dimensi: 'Pemanfaatan Digital', score: 4, catatan: 'Media interaktif digunakan secara aktif oleh murid, bukan sekadar pajangan.' },
    { id: 8, indikator: 'Asesmen formatif terintegrasi memberikan umpan balik tepat waktu sepanjang proses.', dimensi: 'Asesmen Otentik', score: 4, catatan: 'Guru memberikan feedback langsung saat memonitor diskusi kelompok.' },
    { id: 9, indikator: 'Murid menunjukkan inisiatif, keberanian berpendapat, dan nalar kritis mandiri.', dimensi: 'Student Agency & Inisiatif', score: 4, catatan: 'Murid berani menyanggah secara santun dan mengajukan pertanyaan kritis.' },
    { id: 10, indikator: 'Suasana kelas aman, tertib, inklusif, dan menyenangkan sepanjang pembelajaran.', dimensi: 'Iklim Belajar Positif', score: 4, catatan: 'Kelas dinamis, tertib, dan bebas dari rasa cemas atau takut salah.' },
  ];

  // 6. Matriks Perubahan & Kesimpulan Transformasi (4 Indikator Kunci)
  const kesimpulanUji: SambungUjiKesimpulanTransformasi = {
    peranGuru: `Guru bertransformasi penuh dari penceramah materi satu arah menjadi fasilitator dan perancang pengalaman belajar mendalam. Mampu memantik nalar kritis murid melalui pertanyaan pemantik kontekstual dan memfasilitasi diferensiasi secara empatik.`,
    aktivitasMurid: `Murid bertransformasi dari penyimak pasif menjadi pembelajar aktif yang mengonstruksi pengetahuan secara mandiri dan kolaboratif, percaya diri dalam diskusi kelompok, serta terampil memecahkan masalah nyata.`,
    konteksNyata: `Pembelajaran terhubung erat dan terpadu secara autentik dengan fenomena kehidupan sehari-hari dan lingkungan sekitar murid, menjadikan pembelajaran bermakna dan aplikatif.`,
    refleksiMurid: `Refleksi menjadi budaya belajar rutin yang mengakar; murid terbiasa mengevaluasi proses pemahaman diri (metakognisi), mengenali capaian belajarnya, dan merencanakan langkah perbaikan berikutnya.`,
  };

  const matriksAfter: SambungMatriksPerubahan = {
    ...kesimpulanUji,
  };

  return {
    praObservasi,
    observasiPelaksanaan,
    pascaObservasi,
    kesimpulanUji,
    u1_observasi: {
      tanggal: today,
      hariTanggal: observasiPelaksanaan.hariTanggal || today,
      tahapObservasi: 'akhir',
      kelas: supervision.classGrade || 'Fase F / Kelas XI',
      indikatorList: u1IndikatorList,
      totalSkor: 40,
      persentaseCapaian: 100.0,
      apaYangDialamiMurid: `Murid merasakan pengalaman belajar yang menyenangkan, menantang, dan bermakna. Mereka mengalami langsung bagaimana mengonstruksi konsep, berdiskusi memecahkan tantangan riil, dan merasakan dihargai potensinya oleh guru dan teman sekelas.`,
      kekuatanDanRekomendasi: `Kekuatan utama terletak pada kepiawaian guru mengelola dinamika kelompok dan pemanfaatan media kontekstual. Rekomendasi: pertahankan konsistensi ini dan dokumentasikan sebagai praktik baik sekolah.`,
    },
    u2_angketMurid: {
      kodeMuridKelas: `${supervision.classGrade || 'XI'}-SAMBUNG`,
      tanggal: today,
      jumlahResponden: 34,
      items: u2Items,
      halPalingBermakna: quoteBermakna,
      kesulitanMurid: quoteKesulitan,
    },
    matriksAfter,
  };
}

/**
 * Menerapkan Auto-Fill Tahap Uji ke Supervisi:
 * Memperbarui `supervision.sambung.uji`, menyinkronkan data supervisi perbaikan,
 * dan memperbarui tabel Sebelum-Setelah serta Data Dampak pada Tahap Nyatakan.
 */
export function applyUjiAutoFillToSupervision(supervision: Supervision): Supervision {
  const existingSambung = supervision.sambung || createDefaultSambungForTeacher(
    supervision.teacherName,
    supervision.schoolName,
    supervision.subject
  );

  const ujiData = generateUjiData(supervision);

  // Perbarui beforeAfter pada Tahap Nyatakan agar selaras sempurna dengan hasil kesimpulan
  const currentBeforeAfter = existingSambung.nyatakan?.beforeAfter || [];
  const updatedBeforeAfter = currentBeforeAfter.map(item => {
    if (item.aspek.toLowerCase().includes('guru')) {
      return { ...item, setelahSambung: ujiData.kesimpulanUji?.peranGuru || item.setelahSambung };
    }
    if (item.aspek.toLowerCase().includes('murid') && !item.aspek.toLowerCase().includes('refleksi')) {
      return { ...item, setelahSambung: ujiData.kesimpulanUji?.aktivitasMurid || item.setelahSambung };
    }
    if (item.aspek.toLowerCase().includes('konteks') || item.aspek.toLowerCase().includes('nyata')) {
      return { ...item, setelahSambung: ujiData.kesimpulanUji?.konteksNyata || item.setelahSambung };
    }
    if (item.aspek.toLowerCase().includes('refleksi')) {
      return { ...item, setelahSambung: ujiData.kesimpulanUji?.refleksiMurid || item.setelahSambung };
    }
    return item;
  });

  const updatedSambung: SambungData = {
    ...existingSambung,
    uji: {
      ...existingSambung.uji,
      ...ujiData,
    },
    nyatakan: {
      ...existingSambung.nyatakan,
      beforeAfter: updatedBeforeAfter,
    },
    lastUpdated: new Date().toISOString(),
  };

  return {
    ...supervision,
    sambung: updatedSambung,
    // Sinkronkan ke formulir supervisi perbaikan
    praObservasiPerbaikan: {
      q1_kd_indikator: ujiData.praObservasi?.q1 || '',
      q2_metode: ujiData.praObservasi?.q2 || '',
      q3_alat_bahan: ujiData.praObservasi?.q3 || '',
      q4_tahapan: ujiData.praObservasi?.q4 || '',
      q5_persiapan: ujiData.praObservasi?.q5 || '',
      q6_materi_sulit: ujiData.praObservasi?.q6 || '',
      q7_target_kompetensi: ujiData.praObservasi?.q7 || '',
      q8_perhatian_khusus: ujiData.praObservasi?.q8 || '',
      supervisorNotes: ujiData.praObservasi?.supervisorNotes || '',
      interviewDurationMinutes: 35,
    },
    observasiKelasPerbaikan: {
      items: ujiData.observasiPelaksanaan?.items || {},
      totalYa: 25,
      totalAspek: 25,
      totalSkor: ujiData.observasiPelaksanaan?.totalSkor || 50,
      score: ujiData.observasiPelaksanaan?.persentaseCapaian || 100,
      predicate: ujiData.observasiPelaksanaan?.predicate || 'Sangat Baik',
      feedbackNotes: `${ujiData.observasiPelaksanaan?.feedback.kelebihan}\n\nHal yang perlu diperbaiki: ${ujiData.observasiPelaksanaan?.feedback.perbaikan}\n\nRekomendasi: ${ujiData.observasiPelaksanaan?.feedback.rekomendasi}`,
      feedback: ujiData.observasiPelaksanaan?.feedback,
      completedAt: ujiData.observasiPelaksanaan?.completedAt || new Date().toISOString(),
    },
    pascaObservasiPerbaikan: {
      q1_kesan: ujiData.pascaObservasi?.pertanyaanList.q1 || '',
      q2_sesuai_rencana: ujiData.pascaObservasi?.pertanyaanList.q2 || '',
      q3_hal_memuaskan: ujiData.pascaObservasi?.pertanyaanList.q3 || '',
      q4_hal_kurang: ujiData.pascaObservasi?.pertanyaanList.q4 || '',
      q5_ketercapaian_tujuan: ujiData.pascaObservasi?.pertanyaanList.q5 || '',
      q6_kesulitan_siswa: ujiData.pascaObservasi?.pertanyaanList.q6 || '',
      q7_alternatif_solusi: ujiData.pascaObservasi?.pertanyaanList.q7 || '',
      q8_rencana_tindak_lanjut: ujiData.pascaObservasi?.pertanyaanList.q8 || '',
      q9_pengembangan_diri: ujiData.pascaObservasi?.pertanyaanList.q9 || '',
      generalImpression: ujiData.pascaObservasi?.kesanUmum || '',
      recommendations: ujiData.pascaObservasi?.saranMasukan || '',
      completedAt: ujiData.pascaObservasi?.completedAt || new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Menghasilkan instrumen Tahap G (GERAKKAN): Rencana Tindak Lanjut dari Hasil Nyatakan & Kesimpulan,
 * serta rencana diseminasi & pengimbasan praktik baik yang menghubungkan seluruh alur SAMBUNG
 * (Selidiki -> Amati -> Maknai -> Berdayakan -> Uji -> Nyatakan -> Gerakkan).
 */
export function generateGerakkanData(supervision: Supervision): {
  tindakLanjut: SambungTindakLanjutItem[];
  pengimbasan: SambungPengimbasanItem[];
  rtlNyatakan: SambungRtlNyatakanItem[];
  kesimpulanAlurSambung: SambungKesimpulanAlurSambung;
} {
  const teacher = supervision.teacherName;
  const subject = supervision.subject || 'Mata Pelajaran';
  const school = supervision.schoolName || 'SMA Binaan';
  const lesson = supervision.lessonTitle || `Pembelajaran ${subject}`;
  const telaahScore = supervision.perangkatAjar?.telaahSummary?.finalScore ?? 92.5;
  const telaahPred = supervision.perangkatAjar?.telaahSummary?.predicate || 'Sangat Baik';
  const obsScore = supervision.observasiKelas?.score ?? 94.0;
  const obsPred = supervision.observasiKelas?.predicate || 'Sangat Baik';
  
  // Mengambil data before & after nyata yang ada di draft
  const before = supervision.sambung?.selidiki?.matriksBefore || DEFAULT_MATRIKS_BEFORE;
  const after = supervision.sambung?.uji?.matriksAfter || DEFAULT_MATRIKS_AFTER;

  // 1. Instrumen Utama: Rencana Tindak Lanjut Berdasarkan Hasil Nyatakan & Kesimpulan Uji
  const rtlNyatakan: SambungRtlNyatakanItem[] = [
    {
      id: 1,
      indikator: 'Peran Guru: Berorientasi pada Pengalaman Belajar & Inkuiri Murid',
      hasilNyatakan: `Terbukti bertransformasi dari dominasi ceramah satu arah (${before.peranGuru}) menjadi perancang dan fasilitator pengalaman belajar murid melalui inkuiri aktif (${after.peranGuru}). Skor telaah modul: ${telaahScore} (${telaahPred}), Skor observasi kelas: ${obsScore}% (${obsPred}).`,
      rencanaTindakLanjut: `1. Mempertahankan dan mengoptimalkan peran sebagai fasilitator inkuiri dengan menerapkan teknik bertanya pemantik terbuka (open-ended questions) secara konsisten.\n2. Menyusun 3 variasi panduan diferensiasi proses (tiered learning) agar setiap kelompok murid tertantang sesuai tingkat kesiapannya.\n3. Mengalokasikan 10-15 menit pendampingan kelompok kecil (scaffolding klinis) bagi murid yang mengalami hambatan pemahaman.`,
      mitraKolaborasi: `Komunitas Belajar (Kombel) Guru ${subject} ${school}, MGMP Kabupaten Bogor, dan Pengawas Pembina Kusnandar, M.Si`,
      waktuPelaksanaan: '2 Minggu ke depan (Awal unit materi baru)',
      buktiKeberhasilan: 'Modul Ajar berdiferensiasi terverifikasi, rubrik scaffolding harian, lembar observasi teman sejawat',
      rekomendasiSupervisi: `Pengawas Pembina merekomendasikan ${teacher} menjadi narasumber/fasilitator model dalam Kombel internal sekolah untuk teknik scaffolding inkuiri.`,
    },
    {
      id: 2,
      indikator: 'Aktivitas Murid: Student Agency, Kolaborasi & Aplikasi Pengetahuan',
      hasilNyatakan: `Murid bertransformasi dari sekadar mendengar dan mencatat (${before.aktivitasMurid}) menjadi pelaku aktif yang mengaplikasikan konsep pengetahuan melalui investigasi kelompok dan unjuk kerja nyata (${after.aktivitasMurid}). Respon suara murid (U-2) menunjukkan 88%+ murid merasa antusias dan berani berpendapat.`,
      rencanaTindakLanjut: `1. Menerapkan model Pembelajaran Berbasis Masalah (PBL) dan Proyek (PjBL) secara berkelanjutan pada materi esensial ${subject}.\n2. Memberikan kebebasan murid memilih bentuk produk tugas (suara & pilihan/student agency) baik video, poster infografis, maupun laporan ilmiah kontekstual.\n3. Mengaktifkan peran rotasi kepemimpinan dalam kerja kelompok heterogen agar seluruh murid terlibat aktif.`,
      mitraKolaborasi: 'Guru Bimbingan Konseling (BK), Wali Kelas, dan Tim Manajemen Kurikulum Sekolah',
      waktuPelaksanaan: 'Setiap pertengahan capaian pembelajaran (CP) / Siklus 4-6 minggu',
      buktiKeberhasilan: 'Portofolio artefak karya digital/fisik murid, lembar penilaian antarteman (peer-review), rekaman unjuk kerja murid',
      rekomendasiSupervisi: 'Kepala Sekolah mendukung penyediaan ruang pameran karya murid (Gelar Karya Kelas) dan sarana media presentasi yang memadai.',
    },
    {
      id: 3,
      indikator: 'Konteks Kehidupan Nyata: Relevansi Materi dengan Isu Riil & Lingkungan',
      hasilNyatakan: `Pembelajaran berhasil mengaitkan materi secara eksplisit (${after.konteksNyata}) dari yang sebelumnya masih bersifat teoretis-tekstual (${before.konteksNyata}). Peningkatan pemahaman kontekstual murid naik lebih dari 40% pada data dampak.`,
      rencanaTindakLanjut: `1. Menyusun Bank Studi Kasus Kontekstual ${subject} berbasis kearifan lokal Jawa Barat, fenomena lingkungan hidup sekitar Bogor, dan perkembangan teknologi mutakhir.\n2. Merancang Lembar Kerja Peserta Didik (LKPD) berbasis pemecahan masalah riil yang mengasah daya nalar kritis murid.\n3. Mengundang praktisi/alumni atau mengadakan mini-observasi lapangan lingkungan sekolah bila relevan.`,
      mitraKolaborasi: `MGMP ${subject} Kabupaten Bogor, Tim Pengembang Kurikulum ${school}, dan Praktisi Lapangan/Alumni`,
      waktuPelaksanaan: '1 Bulan ke depan (Penyusunan modul bab selanjutnya)',
      buktiKeberhasilan: 'Bank LKPD kontekstual terintegrasi isu lokal, dokumentasi investigasi murid di lingkungan sekolah',
      rekomendasiSupervisi: 'Pengawas Sekolah mengarahkan integrasi projek lintas mata pelajaran (interdisipliner) untuk efisiensi beban belajar murid.',
    },
    {
      id: 4,
      indikator: 'Refleksi Murid: Metakognisi & Evaluasi Belajar Rutin Terstruktur',
      hasilNyatakan: `Refleksi telah melembaga menjadi budaya kelas rutin di setiap akhir pertemuan (${after.refleksiMurid}), berbeda dengan kondisi awal di mana refleksi belum terencana konsisten (${before.refleksiMurid}). Murid mampu mengenali kekuatannya dan memetakan kendala belajarnya.`,
      rencanaTindakLanjut: `1. Melembagakan Jurnal Refleksi Metakognisi Murid harian/mingguan dengan format bervariasi (Teknik 3-2-1, Traffic Light Cards, dan Google Forms).\n2. Membaca dan menganalisis catatan refleksi murid untuk menentukan intervensi mengajar pada pertemuan berikutnya (Looping Refleksi-Aksi).\n3. Memberikan umpan balik tertulis apresiatif pada catatan refleksi murid secara berkala untuk membangun kedekatan emosional belajar.`,
      mitraKolaborasi: 'Tim Pembelajaran Mendalam (Deep Learning) Sekolah, Rekan Sejawat, dan Peserta Didik',
      waktuPelaksanaan: 'Rutin setiap akhir jam pembelajaran tatap muka (10-15 menit)',
      buktiKeberhasilan: 'Buku Jurnal Refleksi Murid terisi rapi, rekapan angket suara murid, catatan tindak lanjut umpan balik guru',
      rekomendasiSupervisi: 'Jadikan data refleksi murid sebagai dasar evaluasi diri guru (Self-Regulated Teacher) dalam Penilaian Kinerja Guru (PKG).',
    },
    {
      id: 5,
      indikator: 'Asesmen Autentik Formatif & Tindak Lanjut Diferensiasi',
      hasilNyatakan: `Terselenggaranya asesmen autentik yang tidak hanya mengukur capaian akhir (assessment of learning), melainkan memantau proses (assessment for & as learning) dengan rubrik transparan. Skor ketercapaian aspek asesmen telaah dan observasi mencapai predikat ${obsPred}.`,
      rencanaTindakLanjut: `1. Mengembangkan instrumen asesmen diagnostik kognitif dan non-kognitif sebelum memulai bab baru.\n2. Menggunakan aplikasi asesmen formatif interaktif (Quizizz, Kahoot, Google Form) dengan analisis butir soal instan untuk pemetaan kelompok remidial dan pengayaan.\n3. Melaksanakan program tindak lanjut klinis bagi murid yang belum tuntas tanpa menambah beban psikologis.`,
      mitraKolaborasi: `Pengawas Pembina Kusnandar, M.Si, Koordinator Penilaian Sekolah, dan Rekan Guru ${subject}`,
      waktuPelaksanaan: 'Berkala di awal, tengah, dan akhir unit pembelajaran',
      buktiKeberhasilan: 'Kisi-kisi dan rubrik asesmen autentik, laporan hasil analisis diagnostik, portofolio remidial & pengayaan terstruktur',
      rekomendasiSupervisi: 'Pengawas Pembina melakukan supervisi berkala terhadap kesahihan dan reliabilitas rubrik asesmen formatif kurikulum.',
    },
  ];

  // 2. Rencana Tindak Lanjut Temuan Supervisi
  const tindakLanjut: SambungTindakLanjutItem[] = [
    {
      id: 1,
      temuanSupervisi: `Optimalisasi Diferensiasi Proses: Masih terdapat beberapa murid yang membutuhkan waktu lebih lama dalam menyelesaikan penyelidikan inkuiri materi ${lesson}.`,
      tindakLanjut: `Menyusun panduan bertahap (scaffolding guide) dengan kartu bantuan konsep (hint cards) dan memanfaatkan tutor sebaya dalam kelompok belajar heterogen.`,
      penanggungJawab: teacher,
      waktu: '2 Minggu ke depan',
      hasil: 'Seluruh kelompok murid mampu menuntaskan target pembelajaran dengan tingkat kepercayaan diri yang tinggi.',
    },
    {
      id: 2,
      temuanSupervisi: `Pemanfaatan Media & TIK Interaktif: Integrasi teknologi sudah baik, namun perlu pengayaan simulasi virtual untuk materi abstrak.`,
      tindakLanjut: `Mengembangkan lembar panduan praktikum virtual interaktif dan memanfaatkan portal Rumah Belajar / PhET / Canva Edukasi secara terarah.`,
      penanggungJawab: teacher,
      waktu: '3 Minggu ke depan',
      hasil: 'Keterlibatan visual dan pemahaman konsep sains/sosial abstrak murid meningkat signifikan.',
    },
    {
      id: 3,
      temuanSupervisi: `Pendokumentasian Asesmen Portofolio Murid: Lembar hasil kerja murid perlu diarsipkan dalam portofolio digital yang mudah diakses orang tua dan murid.`,
      tindakLanjut: `Membuat repositori portofolio digital kelas (Google Sites / Google Drive terstruktur) untuk mendokumentasikan karya dan perkembangan murid sepanjang semester.`,
      penanggungJawab: teacher,
      waktu: '1 Bulan ke depan',
      hasil: 'Portofolio digital murid tersusun rapi dan dapat dijadikan bahan pelaporan kemajuan belajar bagi orang tua.',
    },
    {
      id: 4,
      temuanSupervisi: `Keberlanjutan Budaya Saling Memuliakan: Terciptanya iklim kelas yang aman, saling menghargai, dan bebas dari perundungan verbal saat presentasi.`,
      tindakLanjut: `Menyepakati kontrak belajar positif (Kesepakatan Kelas) di setiap awal semester dan memberikan apresiasi verbal/tertulis atas kontribusi setiap murid.`,
      penanggungJawab: teacher,
      waktu: 'Berkelanjutan sepanjang tahun',
      hasil: 'Suasana kelas kondusif, murid berani bertanya tanpa rasa takut salah, dan tercipta budaya saling memuliakan martabat murid.',
    },
  ];

  // 3. Diseminasi & Pengimbasan Praktik Baik Komunitas
  const pengimbasan: SambungPengimbasanItem[] = [
    {
      id: 1,
      praktikBaik: `Penerapan Strategi Supervisi SAMBUNG Berorientasi Deep Learning pada Pembelajaran ${subject}`,
      sasaran: `Komunitas Belajar (Kombel) Pendidik & Tenaga Kependidikan ${school}`,
      bentuk: 'Workshop & Berbagi Praktik Baik (In-House Sharing Session)',
      waktu: 'Bulan Depan (Jadwal Rutin Kombel)',
    },
    {
      id: 2,
      praktikBaik: `Desain Modul Ajar Berdiferensiasi dan Rubrik Asesmen Autentik ${subject} SMA`,
      sasaran: `Musyawarah Guru Mata Pelajaran (MGMP) ${subject} Tingkat Kabupaten Bogor`,
      bentuk: 'Presentasi Praktik Baik & Bedah Modul Ajar di MGMP',
      waktu: 'Pertemuan Rutin MGMP Triwulan Berjalan',
    },
    {
      id: 3,
      praktikBaik: `Dokumentasi Aksi Nyata: Transformasi Pembelajaran Inkuiri dan Budaya Refleksi Murid`,
      sasaran: 'Pendidik Seluruh Indonesia melalui Platform Merdeka Mengajar (PMM)',
      bentuk: 'Publikasi Video Bukti Karya & Modul Ajar di PMM Kemendikbudristek',
      waktu: 'Akhir Semester Berjalan',
    },
    {
      id: 4,
      praktikBaik: `Open Class Kolaboratif: Observasi Mengajar Teman Sejawat (Peer Coaching)`,
      sasaran: `Rekan Guru Serumpun di ${school}`,
      bentuk: 'Penyelenggaraan Open Class dan Diskusi Refleksi Pasca-Mengajar Sejawat',
      waktu: '2 Bulan ke depan',
    },
  ];

  // 4. Matriks Kesimpulan Alur SAMBUNG (S - A - M - B - U - N -> G)
  const kesimpulanAlurSambung: SambungKesimpulanAlurSambung = {
    selidikiBaseline: `Tahap SELIDIKI: Pemetaan awal telaah modul ajar dan wawancara pendahuluan menunjukkan guru ${teacher} memiliki penguasaan materi yang kuat namun proses belajar masih berpusat pada transfer konten ceramah instruksional. Murid pasif mencatat dan belum terbiasa melakukan refleksi metakognisi.`,
    amatiObservasi: `Tahap AMATI: Observasi tatap muka awal di kelas mengidentifikasi area amatan kritis, yakni perlunya pergeseran peran guru menjadi fasilitator inkuiri, peningkatan keterlibatan kolaboratif murid (student agency), dan penguatan konteks riil kehidupan sehari-hari murid.`,
    maknaiCoaching: `Tahap MAKNAI: Supervisor (Pengawas Kusnandar, M.Si) melaksanakan dialog coaching reflektif pasca observasi dengan 10 pertanyaan mendalam. Guru menyadari akar persoalan dan membangun komitmen nyata untuk merestrukturisasi desain pembelajaran menjadi bermakna dan menggembirakan.`,
    berdayakanModul: `Tahap BERDAYAKAN: Guru menyusun dan menyempurnakan Modul Ajar Perbaikan ${lesson} yang berorientasi Pembelajaran Mendalam (Deep Learning). Modul ajar memuat diferensiasi konten/proses/produk, pertanyaan pemantik inkuiri, dan rubrik asesmen formatif autentik.`,
    ujiPembuktian: `Tahap UJI: Implementasi lapangan diuji secara terukur melalui wawancara pra-observasi 8 butir, observasi pelaksanaan 25 butir (Skor Capaian: ${obsScore}% / ${obsPred}), dialog refleksi pasca-observasi, serta angket suara murid (U-2) yang mencatat kepuasan dan antusiasme belajar murid di atas 85%.`,
    nyatakanDampak: `Tahap NYATAKAN: Pembuktian perubahan Before vs After dan data dampak kuantitatif-kualitatif membuktikan lonjakan signifikan: peran guru beralih ke fasilitator inkuiri, aktivitas murid bergeser dari pasif ke pengaplikasian pengetahuan riil, materi terhubung isu nyata, dan budaya refleksi melembaga.`,
    gerakkanKomitmen: `Tahap GERAKKAN: Seluruh hasil supervisi tidak berhenti sebagai dokumen administratif, melainkan diwujudkan dalam 5 Rencana Tindak Lanjut (RTL) Konkret berbasis hasil Nyatakan dan 4 agenda pengimbasan praktik baik di Kombel Sekolah, MGMP Kabupaten, dan PMM.`,
    catatanPengawas: `Apresiasi tinggi kepada ${teacher} atas integritas profesional, keterbukaan dalam coaching, dan komitmen menuntaskan seluruh 7 siklus SAMBUNG. Transformasi pembelajaran yang dicapai sangat signifikan dan layak dijadikan teladan praktik baik bagi guru-guru SMA lainnya. Teruslah menginspirasi dan memuliakan potensi murid! — Kusnandar, M.Si (Pengawas Pembina).`,
    dukunganKepalaSekolah: `Pihak sekolah berkomitmen penuh menyediakan sarana prasarana penunjang, memfasilitasi waktu berbagi praktik baik di Komunitas Belajar (Kombel) sekolah, serta mendukung keikutsertaan guru dalam forum peningkatan keprofesian berkelanjutan.`,
  };

  return {
    tindakLanjut,
    pengimbasan,
    rtlNyatakan,
    kesimpulanAlurSambung,
  };
}

/**
 * Menyinkronkan dan menerapkan hasil generateGerakkanData ke dalam objek supervisi.
 */
export function applyGerakkanAutoFillToSupervision(supervision: Supervision): Supervision {
  const gerakkanData = generateGerakkanData(supervision);
  const curSambung = supervision.sambung || createDefaultSambungForTeacher(
    supervision.teacherName,
    supervision.subject,
    supervision.schoolName
  );

  return {
    ...supervision,
    sambung: {
      ...curSambung,
      gerakkan: {
        tindakLanjut: gerakkanData.tindakLanjut,
        pengimbasan: gerakkanData.pengimbasan,
        rtlNyatakan: gerakkanData.rtlNyatakan,
        kesimpulanAlurSambung: gerakkanData.kesimpulanAlurSambung,
      },
      lastUpdated: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
}


