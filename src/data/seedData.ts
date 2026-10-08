import { Supervision } from '../types';
import { 
  SEED_SAMBUNG_DEWI, 
  SEED_SAMBUNG_AHMAD, 
  SEED_SAMBUNG_SITI,
  createDefaultSambungForTeacher 
} from './sambungSeed';

export const SAMPLE_SUPERVISIONS: Supervision[] = [
  {
    id: 'sup-demo-dewi-awal',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    teacherId: 'teacher-sondang',
    teacherName: 'Sondang Asih Januarti, S.Pd.',
    teacherNip: '19840512 200801 2 007',
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-Fisika 2',
    semester: 'Genap',
    schoolYear: '2025/2026',
    lessonTitle: 'Listrik Arus Searah (Sebelum Penilaian)',
    status: 'draft',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    sambung: SEED_SAMBUNG_DEWI,

    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: '',
        modulAjarUrl: '',
        bahanAjarUrl: '',
        asesmenUrl: '',
      },
      telaahScores: {},
      telaahComments: {},
      telaahSummary: {
        totalScore: 0,
        maxPossibleScore: 44,
        finalScore: 0,
        predicate: 'Perlu Perbaikan'
      },
      feedback: {
        kelebihan: '',
        perbaikan: '',
        rekomendasi: ''
      }
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
      supervisorNotes: ''
    },
    observasiKelas: {
      items: {},
      totalYa: 0,
      totalAspek: 24,
      score: 0,
      predicate: '-',
      feedbackNotes: ''
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
      recommendations: ''
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: '', note: '', score: 0 },
      administrasi: { evidence: '', note: '', score: 0 },
      pengembanganDiri: { evidence: '', note: '', score: 0 },
      kedisiplinan: { evidence: '', note: '', score: 0 },
      rekomendasi: { notes: '', tindakLanjut: '', score: 0 },
      finalAverageScore: 0,
      finalGrade: '-',
      summaryNotes: ''
    }
  },
  {
    id: 'sup-demo-01',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    teacherId: 'teacher-sondang',
    teacherName: 'Sondang Asih Januarti, S.Pd.',
    teacherNip: '19840512 200801 2 007',
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-Fisika 1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Listrik Arus Searah: Rangkaian Tertutup & Analisis Hukum Kirchhoff',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-15T08:30:00.000Z',
    updatedAt: '2025-09-10T11:45:00.000Z',
    sambung: SEED_SAMBUNG_DEWI,

    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPATPFisikaSMA/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulAjarTermodinamika/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarDigital/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikAsesmenOtentik/view?usp=sharing',
      },
      submittedAt: '2025-08-20T09:00:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
        12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Identitas modul sangat lengkap, mencakup alokasi waktu dan fase F yang tepat.',
        4: 'Dimensi Bergotong Royong dan Bernalar Kritis tertuang jelas pada alur kegiatan.',
        8: 'Model Problem-Based Learning (PBL) sangat relevan dengan materi Termodinamika.',
        12: 'Aktivitas mengonstruksi pemahaman disajikan runtut dari apersepsi kontekstual mesin pendingin.',
        15: 'Budaya saling memuliakan dan inklusivitas tampak dalam pembagian kelompok diskusi.',
        21: 'Rubrik asesmen memuat KKTP dengan indikator operasional yang objektif.'
      },
      telaahSummary: {
        totalScore: 43,
        maxPossibleScore: 44,
        finalScore: 97.7,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Modul ajar mengintegrasikan konsep kontekstual hemat energi dengan simulasi PhET interactive simulation, rubrik penilaian kinerja sangat operasional.',
        perbaikan: 'Perkuat kemitraan dengan industri atau praktisi pendingin/AC untuk projek riil siswa.',
        rekomendasi: 'Dapat dijadikan model praktik baik (Best Practice) bagi MGMP Fisika SMA Kota Bogor.'
      },
      reviewedAt: '2025-08-25T14:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si',
      revisi: {
        modulAjarRevisiUrl: 'https://drive.google.com/file/d/1DemoModulFisikaRevisi/view?usp=sharing',
        catatanRevisiGuru: 'Telah ditambahkan integrasi projek hemat energi dan rubrik peer-review asesmen otentik.',
        revisiSubmittedAt: '2025-08-27T10:00:00.000Z',
        revisiStatus: 'disetujui',
      },
    },

    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis hukum-hukum termodinamika dan penerapannya dalam siklus Carnot serta efisiensi mesin.',
      q2_metode: 'Problem-Based Learning dengan pendekatan Deep Learning (Bermakna, Berkesadaran, Menggembirakan).',
      q3_alat_bahan: 'Simulasi virtual PhET Thermodynamics, LKPD Kolaboratif, Termometer digital dan wadah kalorimeter sederhana.',
      q4_tahapan: 'Pendahuluan (Apersepsi & motivasi), Orientasi Masalah, Investigasi Mandiri & Kelompok, Penyajian Karya, Analisis & Evaluasi.',
      q5_persiapan: 'Modul ajar lengkap, tayangan interaktif Canva, rubrik observasi profil pelajar Pancasila, dan LKPD digital.',
      q6_materi_sulit: 'Menghitung siklus termodinamika pada diagram P-V; diantisipasi dengan grafik interaktif dan bimbingan scaffolding.',
      q7_target_kompetensi: 'Kemampuan berpikir kritis menganalisis efisiensi mesin serta kolaborasi kerja tim ilmiah.',
      q8_perhatian_khusus: 'Fokus pada partisipasi murid yang cenderung pasif saat diskusi kelompok dan pembagian peran berkeadilan.',
      supervisorNotes: 'Kesiapan guru sangat matang, instrumen dan modul dirancang sistematis. Siap untuk observasi tatap muka di kelas.',
      completedAt: '2025-08-28T09:30:00.000Z'
    },

    observasiKelas: {
      items: {
        pendahuluan_1: { status: 'Ya', note: 'Doa, presensi teratur, apersepsi mengaitkan kulkas di rumah' },
        pendahuluan_2: { status: 'Ya', note: 'Motivasi sangat memantik rasa ingin tahu murid' },
        pendahuluan_3: { status: 'Ya', note: 'Tujuan & langkah jelas ditayangkan' },
        inti_penguasaan_1: { status: 'Ya', note: 'Penguasaan konsep energi dan entropi sangat mendalam' },
        inti_penguasaan_2: { status: 'Ya', note: 'Keterkaitan dengan krisis energi global sangat aktual' },
        inti_penguasaan_3: { status: 'Ya', note: 'Waktu terjaga dengan presisi sesuai RPP' },
        inti_penguasaan_4: { status: 'Ya', note: 'Kelas tertib, interaksi guru-murid hangat dan penuh penghargaan' },
        pelibatan_1: { status: 'Ya', note: 'Seluruh kelompok aktif mencoba simulator PhET' },
        pelibatan_2: { status: 'Ya', note: 'Guru berkeliling memberikan bimbingan bagi murid yang kesulitan' },
        pelibatan_3: { status: 'Ya', note: 'Kerja sama antaranggota kelompok tampak seimbang' },
        integrasi_1: { status: 'Ya', note: '4C tampak nyata dalam sesi pemaparan hasil diskusi' },
        integrasi_2: { status: 'Ya', note: 'Soal pemantik memicu nalar tingkat tinggi (HOTS)' },
        integrasi_3: { status: 'Ya', note: '5M terintegrasi mulus dalam penyelidikan siklus gas' },
        integrasi_4: { status: 'Ya', note: 'Mencapai ranah metakognitif saat murid merefleksikan efisiensi energi' },
        media_1: { status: 'Ya', note: 'Layar proyektor & Chromebook murid termanfaatkan optimal' },
        media_2: { status: 'Ya', note: 'Sumber belajar digital dan modul lokal berjalan harmonis' },
        media_3: { status: 'Ya', note: 'Murid mengoperasikan simulator mandiri' },
        penilaian_1: { status: 'Ya', note: 'Asesmen formatif berjalan melalui kuis singkat Quizziz' },
        penilaian_2: { status: 'Ya', note: 'Feedback seketika diberikan dengan kalimat mengapresiasi' },
        penilaian_3: { status: 'Ya', note: 'Lembar ceklis unjuk kerja terisi rapi oleh guru' },
        bahasa_1: { status: 'Ya', note: 'Bahasa santun, komunikatif, artikulatif' },
        bahasa_2: { status: 'Ya', note: 'Gestur ramah, tatapan menyeluruh ke seluruh sudut ruang' },
        penutup_1: { status: 'Ya', note: 'Siswa menyimpulkan sendiri esensi hukum termodinamika' },
        penutup_2: { status: 'Ya', note: 'RTL diumumkan dan ditutup doa bersama' }
      },
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Pembelajaran berlangsung dinamis, menyenangkan, dan berpusat pada murid (student-centered). Penggunaan teknologi digital sangat mendukung pemahaman konsep abstrak fisika.',
      completedAt: '2025-09-02T11:15:00.000Z'
    },

    pascaObservasi: {
      q1_kesan: 'Merasa lega dan puas karena siswa sangat antusias saat simulasi interaktif termodinamika.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan dalam modul ajar terlaksana tepat waktu.',
      q3_hal_memuaskan: 'Dua siswa yang biasanya pendiam ikut aktif berbicara saat presentasi kelompok.',
      q4_hal_kurang: 'Waktu per kelompok untuk tanya jawab masih agak sempit karena antusiasme tinggi.',
      q5_ketercapaian_tujuan: 'Sekitar 92% siswa berhasil mencapai kriteria ketercapaian tujuan asesmen formatif.',
      q6_kesulitan_siswa: 'Beberapa siswa masih ragu membaca kemiringan kurva adiabatik vs isotermik.',
      q7_alternatif_solusi: 'Diberikan video mikrolearning pengayaan berdurasi 3 menit di Google Classroom.',
      q8_rencana_tindak_lanjut: 'Melanjutkan materi ke efisiensi mesin pendingin Refrigerator pada pertemuan mendatang.',
      q9_pengembangan_diri: 'Ingin mendalami pemanfaatan AI untuk asesmen diagnostik personal murid.',
      generalImpression: 'Guru menunjukkan dedikasi dan kompetensi pedagogik serta profesional yang sangat unggul.',
      recommendations: 'Disarankan menyusun tulisan karya ilmiah / best practice pembelajaran untuk kenaikan pangkat.',
      completedAt: '2025-09-05T13:30:00.000Z'
    },

    evaluasiTahunan: {
      hasilBelajar: {
        evidence: '94% peserta didik tuntas capaian pembelajaran semester; 2 siswa meraih perunggu OSN Fisika Kota.',
        note: 'Pencapaian ketuntasan murid di atas rata-rata sekolah.',
        score: 95
      },
      administrasi: {
        evidence: 'Dokumen CP, TP, ATP, Modul Ajar, Kisi-kisi Asesmen, dan Buku Nilai lengkap dan tersusun rapi.',
        note: 'Administrasi guru sangat tertib dan tepat waktu diserahkan ke kurikulum.',
        score: 96
      },
      pengembanganDiri: {
        evidence: 'Menyelesaikan 4 modul aksi nyata di PMM (Pelatihan Mandiri) dan aktif sebagai pengurus MGMP Fisika.',
        note: 'Sangat proaktif dalam pengembangan kompetensi diri secara berkelanjutan.',
        score: 98
      },
      kedisiplinan: {
        evidence: 'Tingkat kehadiran tatap muka 99.2%, selalu hadir tepat waktu sebelum bel berbunyi.',
        note: 'Keteladanan etika kerja dan dedikasi menjadi panutan di satuan pendidikan.',
        score: 97
      },
      rekomendasi: {
        notes: 'Direkomendasikan sebagai Guru Teladan Satuan Pendidikan dan dipromosikan sebagai Tim Pengembang Kurikulum Sekolah.',
        tindakLanjut: 'Diberi kesempatan mengikuti bimbingan penulisan jurnal ilmiah terakreditasi tingkat provinsi.',
        score: 95
      },
      finalAverageScore: 96.2,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja tahunan sangat memuaskan, konsisten menunjukkan mutu pengajaran berkualitas tinggi.',
      completedAt: '2025-09-10T10:00:00.000Z'
    }
  },
  {
    id: 'sup-demo-02',
    schoolId: 'sch-rimba-madya',
    schoolName: 'SMAS Rimba Madya',
    teacherId: 'teacher-ivany',
    teacherName: 'Ivany Ratna Ekandini, S.Pd.',
    teacherNip: '19870614 201203 2 006',
    subject: 'Bahasa Indonesia',
    classGrade: 'Fase E / Kelas X-1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Menulis Teks Anekdot Mengkritisi Kebijakan Publik Berdasarkan Fakta',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-18T09:00:00.000Z',
    updatedAt: '2025-09-12T14:20:00.000Z',
    sambung: SEED_SAMBUNG_AHMAD,

    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPATPBhsIndo/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulTeksAnekdot/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarAnekdot/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikMenulis/view?usp=sharing',
      },
      submittedAt: '2025-08-22T10:15:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 1, 10: 1, 11: 2,
        12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Lengkap dan sesuai format Kurikulum Merdeka.',
        7: 'Tujuan pembelajaran menggunakan KKO terukur menganalisis dan memproduksi teks.',
        14: 'Refleksi dapat ditambah dengan panduan lembar regulasi emosi murid.'
      },
      telaahSummary: {
        totalScore: 41,
        maxPossibleScore: 44,
        finalScore: 93.18,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Pemilihan tema kritik sosial faktual sangat memicu minat literasi kritis peserta didik.',
        perbaikan: 'Sertakan contoh rubrik peer-review (penilaian antarteman) untuk draft teks anekdot.',
        rekomendasi: 'Diteruskan ke tahap observasi pembelajaran tatap muka.'
      },
      reviewedAt: '2025-08-26T11:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si',
      revisi: {
        modulAjarRevisiUrl: 'https://drive.google.com/file/d/1DemoModulAnekdotRevisi/view?usp=sharing',
        catatanRevisiGuru: 'Telah ditambahkan rubrik peer-review antarteman dan panduan regulasi emosi murid sesuai catatan supervisor.',
        revisiSubmittedAt: '2025-08-28T08:00:00.000Z',
        revisiStatus: 'sudah_diunggah',
      },
    },

    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: 'Menganalisis struktur dan kebahasaan teks anekdot serta mengonstruksi naskah komik strip pendek.',
      q2_metode: 'Project-Based Learning kolaboratif pembuatan infografis komik anekdot.',
      q3_alat_bahan: 'Aplikasi Canva for Education, proyektor, cuplikan berita satir dan karikatur koran.',
      q4_tahapan: 'Apersepsi humor bernas, bedah struktur teks, kerja kelompok kreatif, galeri karya berputar, umpan balik.',
      q5_persiapan: 'RPP lengkap, lembar kerja kelompok, teks pembanding orisinal vs hoaks.',
      q6_materi_sulit: 'Membedakan antara humor sekadar lelucon dengan humor kritik bersubstansi pesan etis.',
      q7_target_kompetensi: 'Literasi kritis, kepekaan sosial, dan keterampilan komunikasi persuasif.',
      q8_perhatian_khusus: 'Keterlibatan murid dalam memberikan kritik santun tanpa ujaran kebencian.',
      supervisorNotes: 'Guru memiliki konsep yang jelas dalam membimbing etika berpendapat di ruang publik.',
      completedAt: '2025-08-29T10:00:00.000Z'
    },

    observasiKelas: {
      items: {
        pendahuluan_1: { status: 'Ya', note: 'Apersepsi ceria dengan tebak silang kata' },
        pendahuluan_2: { status: 'Ya', note: 'Mengaitkan pentingnya daya kritis pemuda' },
        pendahuluan_3: { status: 'Ya', note: 'Tujuan tersampaikan runut' },
        inti_penguasaan_1: { status: 'Ya', note: 'Penguasaan materi retorika sangat baik' },
        inti_penguasaan_2: { status: 'Ya', note: 'Menghubungkan dengan etika digital UU ITE' },
        inti_penguasaan_3: { status: 'Ya', note: 'Waktu sesuai jadwal' },
        inti_penguasaan_4: { status: 'Ya', note: 'Ruang kelas hidup dan hangat' },
        pelibatan_1: { status: 'Ya', note: 'Seluruh peserta didik aktif berargumen' },
        pelibatan_2: { status: 'Ya', note: 'Guru fasilitator yang luwes' },
        pelibatan_3: { status: 'Ya', note: 'Kerja kelompok berjalan guyub' },
        integrasi_1: { status: 'Ya', note: 'Kreativitas tinggi dalam komik mini' },
        integrasi_2: { status: 'Ya', note: 'Analisis logika satir berjalan tajam' },
        integrasi_3: { status: 'Ya', note: '5M teraplikasi sistematis' },
        integrasi_4: { status: 'Ya', note: 'Tergambar dimensi afektif dan kognitif' },
        media_1: { status: 'Ya', note: 'Canva terhubung ke proyektor nirkabel' },
        media_2: { status: 'Ya', note: 'Pustaka digital sekolah digunakan' },
        media_3: { status: 'Ya', note: 'Murid menyunting karya secara real-time' },
        penilaian_1: { status: 'Ya', note: 'Ceklis asesmen proses aktif dipegang guru' },
        penilaian_2: { status: 'Ya', note: 'Umpan balik langsung saat kelompok bekerja' },
        penilaian_3: { status: 'Ya', note: 'Asesmen presentasi menggunakan rubrik jelas' },
        bahasa_1: { status: 'Ya', note: 'Pilihan kata baku dan kaya peribahasa' },
        bahasa_2: { status: 'Ya', note: 'Ekspresif dan menghibur' },
        penutup_1: { status: 'Ya', note: 'Refleksi bersama tentang batasan lelucon yang sehat' },
        penutup_2: { status: 'Ya', note: 'Tugas pajang karya di mading digital sekolah' }
      },
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Praktik pembelajaran yang sangat inspiratif dalam membudayakan literasi kritis dan kebebasan berekspresi santun.',
      completedAt: '2025-09-03T11:00:00.000Z'
    },

    pascaObservasi: {
      q1_kesan: 'Sangat senang melihat antusiasme murid menuangkan ide humor berbasis realitas.',
      q2_sesuai_rencana: 'Sesuai dengan target skenario modul.',
      q3_hal_memuaskan: 'Karya teks anekdot murid bermutu tinggi dan sarat pesan moral.',
      q4_hal_kurang: 'Penyimpanan berkas digital di beberapa gawai murid sempat mengalami kendala jaringan.',
      q5_ketercapaian_tujuan: '90% siswa tuntas membuat draf anekdot bermuatan kritik konstruktif.',
      q6_kesulitan_siswa: 'Menentukan kata bermajas sindiran yang halus tanpa menyudutkan individu.',
      q7_alternatif_solusi: 'Memberikan glosarium majas ironi, sinisme, dan sarkasme beserta contoh etis.',
      q8_rencana_tindak_lanjut: 'Publikasi antologi teks anekdot kelas di blog literasi sekolah.',
      q9_pengembangan_diri: 'Pelatihan menulis kreatif dan digital storytelling.',
      generalImpression: 'Guru sangat berbakat dalam menghidupkan suasana apresiasi sastra dan bahasa.',
      recommendations: 'Kembangkan kurasi karya siswa menjadi majalah dinding digital interaktif.',
      completedAt: '2025-09-08T14:00:00.000Z'
    },

    evaluasiTahunan: {
      hasilBelajar: {
        evidence: 'Tingkat kelulusan asesmen sumatif bahasa 91%, juara 1 lomba cipta puisi tingkat kota.',
        note: 'Hasil belajar konsisten di atas KKM/KKTP.',
        score: 92
      },
      administrasi: {
        evidence: 'Perangkat ajar tersusun rapi dalam Google Drive terkelola.',
        note: 'Ketertiban dokumen kurikulum sangat memuaskan.',
        score: 94
      },
      pengembanganDiri: {
        evidence: 'Aktif dalam Kombel sekolah dan lulus 3 topik PMM.',
        note: 'Semangat belajar dan berbagi sangat positif.',
        score: 93
      },
      kedisiplinan: {
        evidence: 'Presensi 98.5%, aktif membimbing ekstrakurikuler jurnalistik.',
        note: 'Dedikasi tinggi terhadap pembinaan minat murid.',
        score: 96
      },
      rekomendasi: {
        notes: 'Direkomendasikan sebagai Pembina Mading Digital dan Pelatih Lomba Literasi Bahasa Indonesia.',
        tindakLanjut: 'Diusulkan mengikuti bimtek penulisan modul ajar berbasis kearifan lokal Jawa Barat.',
        score: 93
      },
      finalAverageScore: 93.6,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja guru berkarakter unggul, menginspirasi budaya literasi sekolah.',
      completedAt: '2025-09-12T11:00:00.000Z'
    }
  },
  {
    id: 'sup-demo-03',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    teacherId: 'teacher-risna',
    teacherName: 'Risna Aryanti, M.Pd.',
    teacherNip: '19820418 200801 2 011',
    subject: 'Matematika',
    classGrade: 'Fase E / Kelas X-A',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Eksplorasi Fungsi Eksponensial dalam Pertumbuhan Mikroorganisme dan Investasi',
    status: 'in_progress',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z',
    sambung: SEED_SAMBUNG_SITI,

    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoMatematikaCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEksponen/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoGeogebraEksponen/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikMatematika/view?usp=sharing',
      },
      submittedAt: '2025-09-05T08:30:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
        12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Format modul memuat diferensiasi konten dan proses.',
        8: 'Penggunaan GeoGebra sangat efektif untuk memvisualisasikan kurva grafik eksponensial.',
        19: 'Asesmen formatif berkala memonitor pemahaman bertahap aljabar.'
      },
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Modul komprehensif, dilengkapi lembar eksplorasi GeoGebra interaktif dan lembar studi kasus investasi perbankan.',
        perbaikan: 'Sediakan latihan bertingkat (scaffolding) untuk siswa yang masih lambat pada operasi perpangkatan dasar.',
        rekomendasi: 'Lanjut ke tahap pra-observasi dan kunjungan kelas tatap muka.'
      },
      reviewedAt: '2025-09-10T09:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si'
    },

    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Mengidentifikasi sifat-sifat eksponen dan menyelesaikan pemodelan masalah pertumbuhan.',
      q2_metode: 'Discovery Learning berbantuan lembar kerja eksplorasi GeoGebra.',
      q3_alat_bahan: 'Aplikasi GeoGebra, spreadsheet kalkulasi bunga majemuk, tablet/laptop sekolah.',
      q4_tahapan: 'Stimulasi pola pembelahan sel, pengumpulan data, pengolahan grafik, pembuktian formula, generalisasi.',
      q5_persiapan: 'Modul ajar, LKPD grafis, tes diagnostik kognitif awal.',
      q6_materi_sulit: 'Menghubungkan bentuk eksponen pecahan dengan akar; diantisipasi dengan diagram visual balok.',
      q7_target_kompetensi: 'Kemampuan bernalar logis kuantitatif dan pemodelan matematis dunia nyata.',
      q8_perhatian_khusus: 'Kemandirian siswa dalam mencoba mengubah parameter a dan b pada kurva y = a(b)^x.',
      supervisorNotes: 'Rancangan sangat terstruktur dan siap diobservasi pada sesi kelas minggu depan.',
      completedAt: '2025-09-15T09:00:00.000Z'
    },

    observasiKelas: {
      items: {
        pendahuluan_1: { status: 'Ya', note: 'Berdoa dan cek kesiapan alat hitung' },
        pendahuluan_2: { status: 'Ya', note: 'Motivasi melalui video pertumbuhan bakteri E. coli' },
        pendahuluan_3: { status: 'Ya', note: 'Tujuan dan rubrik disampaikan gamblang' },
        inti_penguasaan_1: { status: 'Ya', note: 'Materi eksponen dikuasai dengan runtut' },
        inti_penguasaan_2: { status: 'Ya', note: 'Koneksi dengan bidang biologi dan perbankan sangat kuat' },
        inti_penguasaan_3: { status: 'Ya', note: 'Sesuai dengan alokasi waktu 2 JP' },
        inti_penguasaan_4: { status: 'Ya', note: 'Suasana belajar aktif tanpa rasa takut matematika' },
        pelibatan_1: { status: 'Ya', note: 'Murid berebut menggeser slider GeoGebra di papan interaktif' },
        pelibatan_2: { status: 'Ya', note: 'Umpan balik personal saat murid menghitung manual' },
        pelibatan_3: { status: 'Ya', note: 'Pasangan teman sebangku saling mengecek hasil' },
        integrasi_1: { status: 'Ya', note: '4C tampak saat murid mempresentasikan rumus temuan' },
        integrasi_2: { status: 'Ya', note: 'Soal prediksi populasi 10 tahun mendatang (HOTS)' },
        integrasi_3: { status: 'Ya', note: 'Penyelidikan data tabel ke grafik (5M)' },
        integrasi_4: { status: 'Ya', note: 'Prosedural dan konseptual seimbang' },
        media_1: { status: 'Ya', note: 'GeoGebra Classroom berjalan lancar' },
        media_2: { status: 'Ya', note: 'Lembar kerja analog dan digital berdampingan' },
        media_3: { status: 'Ya', note: 'Murid menyimulasikan data secara mandiri' },
        penilaian_1: { status: 'Ya', note: 'Guru mencatat lembar observasi partisipasi' },
        penilaian_2: { status: 'Ya', note: 'Umpan balik konstruktif bila ada kekeliruan tanda minus' },
        penilaian_3: { status: 'Ya', note: 'Kuis 3 soal dikerjakan di akhir sesi' },
        bahasa_1: { status: 'Ya', note: 'Bahasa Indonesia baku dan istilah matematis tepat' },
        bahasa_2: { status: 'Ya', note: 'Artikulasi tenang dan mengayomi' },
        penutup_1: { status: 'Ya', note: 'Rangkuman disimpulkan bersama dua orang siswa' },
        penutup_2: { status: 'Ya', note: 'Pemberian tantangan mandiri di rumah' }
      },
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Pembelajaran matematika yang kontekstual, membumi, dan berhasil mengubah persepsi siswa bahwa matematika itu rumit menjadi menyenangkan.',
      completedAt: '2025-09-20T11:00:00.000Z'
    },

    pascaObservasi: {
      q1_kesan: 'Cukup puas, respons siswa terhadap penggunaan GeoGebra melebihi ekspektasi.',
      q2_sesuai_rencana: 'Ya, semua sintaks Discovery Learning terlaksana.',
      q3_hal_memuaskan: 'Semua kelompok berhasil menemukan konsep basis pertumbuhan b > 1.',
      q4_hal_kurang: 'Dua siswa perlu bimbingan tambahan saat mengoperasikan aplikasi.',
      q5_ketercapaian_tujuan: 'Sekitar 88% tuntas kuis pemodelan pertumbuhan.',
      q6_kesulitan_siswa: 'Menyusun model matematika dari kalimat cerita yang panjang.',
      q7_alternatif_solusi: 'Membuat peta konsep pengubahan kalimat naratif menjadi simbol aljabar.',
      q8_rencana_tindak_lanjut: 'Membahas peluruhan radioaktif pada pertemuan berikutnya.',
      q9_pengembangan_diri: 'Ingin memperdalam integrasi Python untuk visualisasi data sains SMA.',
      generalImpression: 'Pendekatan mengajar guru sangat inovatif dan berorientasi pemahaman konseptual mendalam.',
      recommendations: 'Bagikan lembar kerja GeoGebra ini kepada rekan guru matematika dalam forum MGMP.',
      completedAt: '2025-09-22T13:00:00.000Z'
    },

    evaluasiTahunan: {
      hasilBelajar: {
        evidence: '90% murid mencapai target KKTP, pembimbing klub olimpiade matematika.',
        note: 'Capaian prestasi membanggakan.',
        score: 93
      },
      administrasi: {
        evidence: 'Perangkat lengkap CP, TP, ATP, Modul, dan daftar nilai digital.',
        note: 'Dokumen sangat rapi.',
        score: 95
      },
      pengembanganDiri: {
        evidence: 'Narasumber workshop GeoGebra tingkat kota dan menyelesaikan aksi nyata PMM.',
        note: 'Kontribusi luar biasa bagi komunitas guru.',
        score: 97
      },
      kedisiplinan: {
        evidence: 'Presensi 99%, senantiasa hadir memberikan bimbingan remedial bagi murid.',
        note: 'Dedikasi tinggi terhadap pelayanan murid.',
        score: 96
      },
      rekomendasi: {
        notes: 'Direkomendasikan sebagai Instruktur Pembelajaran Digital dan Koordinator Laboratorium Komputer.',
        tindakLanjut: 'Diusulkan mengikuti seleksi Guru Berprestasi tingkat Provinsi.',
        score: 95
      },
      finalAverageScore: 95.2,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja sangat profesional, berintegritas, dan inovatif.',
      completedAt: '2025-09-25T10:00:00.000Z'
    }
  },
  {
    id: 'sup-demo-04',
    schoolId: 'sch-sman2',
    schoolName: 'SMAN 2 Bogor',
    teacherId: 'teacher-alline',
    teacherName: 'Alline Novianti, S.Pd.',
    teacherNip: '19890915 201402 2 003',
    subject: 'Kimia',
    classGrade: 'Fase F / Kelas XI-MIPA 1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Laju Reaksi dan Teori Tumbukan Berbasis Praktikum Virtual',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-02T08:00:00.000Z',
    updatedAt: '2025-09-18T10:00:00.000Z',
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoKimiaCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulKimia/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarKimia/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenKimia/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Identitas modul ajar lengkap dan selaras fase F', 8: 'Integrasi laboratorium virtual sangat interaktif' },
      telaahSummary: { totalScore: 44, maxPossibleScore: 44, finalScore: 100, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Integrasi laboratorium virtual sangat sistematis dan aman.', perbaikan: 'Tambahkan pengayaan kinetika kimia lanjutan.', rekomendasi: 'Model pembelajaran yang sangat baik.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis faktor yang mempengaruhi laju reaksi melalui simulasi virtual.',
      q2_metode: 'Inquiry Learning terbimbing eksperimen virtual.',
      q3_alat_bahan: 'Simulasi Lab Virtual Kinetika Kimia, tablet siswa.',
      q4_tahapan: 'Pendahuluan kontekstual, simulasi variabel konsentrasi dan suhu, analisis grafik, kesimpulan.',
      q5_persiapan: 'Modul ajar digital, LKPD virtual.',
      q6_materi_sulit: 'Teori tumbukan efektif dan energi aktivasi.',
      q7_target_kompetensi: 'Penalaran kritis dan keterampilan analisis sains.',
      q8_perhatian_khusus: 'Kemandirian eksplorasi data eksperimen.',
      supervisorNotes: 'Rancangan sangat baik dan siap diamati.',
      completedAt: '2025-09-08T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Interaksi pembelajaran sangat interaktif dan mendorong rasa ingin tahu murid.'
    },
    pascaObservasi: {
      q1_kesan: 'Pembelajaran berlangsung kondusif dan siswa antusias.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan praktikum virtual terlaksana tepat waktu.',
      q3_hal_memuaskan: 'Pemahaman konsep laju reaksi meningkat tajam melalui visualisasi partikel.',
      q4_hal_kurang: 'Dua komputer lab sempat mengalami kendala browser.',
      q5_ketercapaian_tujuan: '92% siswa tuntas asesmen formatif.',
      q6_kesulitan_siswa: 'Menentukan orde reaksi berdasarkan data tabel eksperimen.',
      q7_alternatif_solusi: 'Pemberian latihan bertingkat dan analogi visual grafik.',
      q8_rencana_tindak_lanjut: 'Membahas bab kesetimbangan kimia pada pertemuan berikutnya.',
      q9_pengembangan_diri: 'Pelatihan pengembangan media animasi kimia interaktif.',
      generalImpression: 'Penguasaan konsep dan pengelolaan kelas sangat prima.',
      recommendations: 'Bagikan lembar kerja simulasi kepada MGMP Kimia Kota Bogor.',
      completedAt: '2025-09-18T10:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 94%', note: 'Sangat memuaskan', score: 95 },
      administrasi: { evidence: 'Lengkap dan tertib', note: 'Terorganisir baik', score: 96 },
      pengembanganDiri: { evidence: 'Aktif di MGMP dan narasumber pelatihan', note: 'Inspiratif', score: 98 },
      kedisiplinan: { evidence: 'Presensi 100%', note: 'Teladan', score: 98 },
      rekomendasi: { notes: 'Direkomendasikan sebagai guru berprestasi tingkat provinsi', tindakLanjut: 'Pengembangan modul ajar digital', score: 96 },
      finalAverageScore: 96.6,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja unggul dan sangat profesional.'
    }
  },
  {
    id: 'sup-demo-05',
    schoolId: 'sch-sman4',
    schoolName: 'SMAN 4 Bogor',
    teacherId: 'teacher-hilmia',
    teacherName: 'Hilmia Fitriyani, S.Pd.',
    teacherNip: '19881120 201101 2 007',
    subject: 'Ekonomi',
    classGrade: 'Fase E / Kelas X-B',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Literasi Keuangan dan Kebijakan Fiskal Moneter dalam Perekonomian Digital',
    status: 'in_progress',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-05T08:00:00.000Z',
    updatedAt: '2025-09-22T10:00:00.000Z',
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoEkonomiCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomi/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarEkonomi/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenEkonomi/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Modul terintegrasi kasus riil perbankan', 12: 'Aktivitas kontekstual sangat relevan' },
      telaahSummary: { totalScore: 43, maxPossibleScore: 44, finalScore: 97.7, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Studi kasus kontekstual perbankan digital dan inflasi riil.', perbaikan: 'Tambahkan diferensiasi untuk siswa dengan minat bisnis.', rekomendasi: 'Dapat dilanjutkan ke observasi tatap muka.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis peran dan fungsi kebijakan fiskal dan moneter dalam menjaga stabilitas nilai rupiah.',
      q2_metode: 'Problem-Based Learning dengan studi kasus perbankan digital.',
      q3_alat_bahan: 'Artikel berita tren inflasi, portal Bank Indonesia, LKPD analisis fiskal.',
      q4_tahapan: 'Orientasi masalah ekonomi nyata, diskusi kelompok, perumusan argumen solusi, presentasi.',
      q5_persiapan: 'Bahan ajar digital dan rubrik diskusi.',
      q6_materi_sulit: 'Mekanisme transmisi kebijakan suku bunga acuan ke suku bunga perbankan komersial.',
      q7_target_kompetensi: 'Kecakapan literasi finansial dan berpikir kritis.',
      q8_perhatian_khusus: 'Keterlibatan seluruh anggota tim dalam menyusun laporan singkat.',
      supervisorNotes: 'Perencanaan matang, relevan dengan dinamika ekonomi terkini.',
      completedAt: '2025-09-12T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Diskusi kelompok sangat hidup dengan analisis data ekonomi mutakhir.'
    },
    pascaObservasi: {
      q1_kesan: 'Siswa aktif memberikan argumen berbasis data neraca pembayaran.',
      q2_sesuai_rencana: 'Ya, simulasi kebijakan moneter berjalan efektif.',
      q3_hal_memuaskan: 'Kecakapan siswa menganalisis inflasi secara kritis sangat membanggakan.',
      q4_hal_kurang: 'Waktu presentasi kelompok sedikit melebihi estimasi awal.',
      q5_ketercapaian_tujuan: '89% siswa memahami instrumen suku bunga acuan BI.',
      q6_kesulitan_siswa: 'Membedakan dampak kebijakan ekspansif dan kontraktif.',
      q7_alternatif_solusi: 'Membuat diagram alir sebab-akibat kebijakan moneter.',
      q8_rencana_tindak_lanjut: 'Membahas kerja sama ekonomi internasional pada pertemuan berikut.',
      q9_pengembangan_diri: 'Mengikuti seminar literasi keuangan Otoritas Jasa Keuangan (OJK).',
      generalImpression: 'Pendekatan kontekstual sangat berhasil membangkitkan minat belajar siswa.',
      recommendations: 'Kolaborasi dengan praktisi perbankan atau OJK.',
      completedAt: '2025-09-22T10:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 92%', note: 'Sangat baik', score: 93 },
      administrasi: { evidence: 'Lengkap dan tertib', note: 'Rapi', score: 94 },
      pengembanganDiri: { evidence: 'Aktif di Kombel Sekolah', note: 'Produktif', score: 94 },
      kedisiplinan: { evidence: 'Presensi 98%', note: 'Tertib', score: 95 },
      rekomendasi: { notes: 'Koordinator Pojok Literasi Finansial', tindakLanjut: 'Workshop literasi pasar modal', score: 94 },
      finalAverageScore: 94.0,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja terbukti unggul dan inspiratif.'
    }
  },
  {
    id: 'sup-demo-06',
    schoolId: 'sch-sman2',
    schoolName: 'SMAN 2 Bogor',
    teacherId: 'teacher-mega',
    teacherName: 'Mega Nur Alfira, S.Pd.',
    teacherNip: '19910304 201602 2 005',
    subject: 'Sejarah',
    classGrade: 'Fase E / Kelas X-B',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Analisis Peristiwa Proklamasi Kemerdekaan dan Historiografi Kritis Bangsa',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-03T08:00:00.000Z',
    updatedAt: '2025-09-19T11:00:00.000Z',
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoSejarahCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulSejarah/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanSejarah/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenSejarah/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Modul ajar memuat sumber primer sejarah otentik', 7: 'Tujuan pembelajaran mengembangkan kemampuan bernalar historis' },
      telaahSummary: { totalScore: 44, maxPossibleScore: 44, finalScore: 100, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Pemanfaatan arsip digital nasional sangat memperkaya wawasan murid.', perbaikan: 'Tambahkan rubrik penilaian debat sejarah.', rekomendasi: 'Model praktik baik bagi MGMP Sejarah.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis kronologi dan signifikansi peristiwa proklamasi kemerdekaan.',
      q2_metode: 'Historical Inquiry berbantuan arsip foto dan audio otentik.',
      q3_alat_bahan: 'Rekaman suara Bung Karno, dokumen teks proklamasi kliring, lembar analisis sumber.',
      q4_tahapan: 'Apersepsi pemutaran audio, analisis multi-perspektif, diskusi kelompok, presentasi.',
      q5_persiapan: 'Bahan tayang digital arsip nasional dan rubrik analitis.',
      q6_materi_sulit: 'Membedakan fakta historis dengan opini historiografi sekunder.',
      q7_target_kompetensi: 'Kecakapan berpikir kritis sejarah (historical thinking skills).',
      q8_perhatian_khusus: 'Objektivitas siswa dalam membedah peran tokoh-tokoh pemuda.',
      supervisorNotes: 'Rancangan kaya sumber otentik, sangat menarik.',
      completedAt: '2025-09-08T09:30:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Antusiasme murid sangat tinggi saat mendengarkan rekaman pidato asli dan membedah dokumen sumber primer.'
    },
    pascaObservasi: {
      q1_kesan: 'Siswa sangat aktif berdebat mengenai detik-detik peristiwa Rengasdengklok.',
      q2_sesuai_rencana: 'Ya, alur inkuiri sejarah tuntas.',
      q3_hal_memuaskan: 'Karya analisis perbandingan surat kabar sezaman sangat berkualitas.',
      q4_hal_kurang: 'Dibutuhkan waktu ekstra untuk sesi tanya jawab.',
      q5_ketercapaian_tujuan: '95% siswa tuntas uji kompetensi berpikir historis.',
      q6_kesulitan_siswa: 'Membaca ejaan bahasa Indonesia lama (Van Ophuijsen).',
      q7_alternatif_solusi: 'Menyediakan panduan transliterasi ejaan lama.',
      q8_rencana_tindak_lanjut: 'Kunjungan virtual ke Museum Naskah Proklamasi.',
      q9_pengembangan_diri: 'Workshop metodologi penulisan sejarah lisan.',
      generalImpression: 'Guru sangat menguasai materi dan mampu menyajikan sejarah secara hidup.',
      recommendations: 'Giatkan proyek sejarah lisan keluarga bagi peserta didik.',
      completedAt: '2025-09-16T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 95%', note: 'Sangat baik', score: 95 },
      administrasi: { evidence: 'Lengkap dan tertib', note: 'Teratur', score: 96 },
      pengembanganDiri: { evidence: 'Pengurus aktif MGMP Sejarah Kota Bogor', note: 'Aktif', score: 97 },
      kedisiplinan: { evidence: 'Presensi 99%', note: 'Disiplin', score: 97 },
      rekomendasi: { notes: 'Direkomendasikan sebagai Fasilitator Pembelajaran Sejarah Kritis', tindakLanjut: 'Penulisan modul ajar sejarah lokal Bogor', score: 96 },
      finalAverageScore: 96.2,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja sangat memuaskan dan berdedikasi tinggi.'
    }
  },
  {
    id: 'sup-demo-07',
    schoolId: 'sch-pgri-1',
    schoolName: 'SMAS PGRI 1',
    teacherId: 'teacher-iqbal',
    teacherName: 'Iqbal Aziz Andrianto',
    teacherNip: '19920822 201801 1 002',
    subject: 'Sejarah',
    classGrade: 'Fase E / Kelas X-IPS',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Konsep Dasar Ilmu Sejarah: Manusia, Ruang, dan Waktu',
    status: 'in_progress',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-08T08:00:00.000Z',
    updatedAt: '2025-09-24T10:00:00.000Z',
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoPGRISejarah/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPGRI/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanPGRI/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenPGRI/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Penyusunan modul jelas dan terstruktur' },
      telaahSummary: { totalScore: 42, maxPossibleScore: 44, finalScore: 95.5, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Koneksi dengan garis waktu sejarah lokal sangat baik.', perbaikan: 'Perkuat kegiatan refleksi murid.', rekomendasi: 'Diteruskan ke observasi kelas.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menjelaskan konsep manusia, ruang, dan waktu dalam dinamika perubahan sejarah.',
      q2_metode: 'Discovery Learning dengan timeline interaktif.',
      q3_alat_bahan: 'Peta kronologis, slide infografis sejarah, lembar kerja siswa.',
      q4_tahapan: 'Stimulasi, identifikasi masalah, pengumpulan data, pengolahan, pembuktian.',
      q5_persiapan: 'Media infografis garis waktu.',
      q6_materi_sulit: 'Membedakan konsep sinkronik dan diakronik.',
      q7_target_kompetensi: 'Kemampuan berpikir kronologis terstruktur.',
      q8_perhatian_khusus: 'Keterlibatan siswa dalam menyusun garis waktu pribadi.',
      supervisorNotes: 'Perencanaan sistematis dan terarah.',
      completedAt: '2025-09-14T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Pengelolaan kelas baik, murid antusias membuat garis waktu digital.'
    },
    pascaObservasi: {
      q1_kesan: 'Siswa aktif berpartisipasi dan memahami konsep diakronik.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan terlaksana sesuai RPP.',
      q3_hal_memuaskan: 'Karya infografis timeline murid rapi dan informatif.',
      q4_hal_kurang: 'Waktu simpulan akhir perlu dialokasikan lebih longgar.',
      q5_ketercapaian_tujuan: '90% siswa mencapai kriteria ketercapaian tujuan.',
      q6_kesulitan_siswa: 'Mengkaitkan ruang geografis dengan peristiwa sejarah.',
      q7_alternatif_solusi: 'Memadukan Google Earth dengan narasi sejarah lokal.',
      q8_rencana_tindak_lanjut: 'Membahas bab cara berpikir sinkronik pada pertemuan berikut.',
      q9_pengembangan_diri: 'Pelatihan pembuatan media visual sejarah berbasis Canva for Education.',
      generalImpression: 'Pendekatan mengajar komunikatif dan bersahabat.',
      recommendations: 'Tingkatkan pemanfaatan teknologi geospasial dalam pembelajaran sejarah.',
      completedAt: '2025-09-20T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 91%', note: 'Baik', score: 92 },
      administrasi: { evidence: 'Lengkap dan tertib', note: 'Rapi', score: 93 },
      pengembanganDiri: { evidence: 'Aktif di Kombel Sekolah', note: 'Positif', score: 93 },
      kedisiplinan: { evidence: 'Presensi 98%', note: 'Disiplin', score: 95 },
      rekomendasi: { notes: 'Pembina Klub Literasi Sejarah Sekolah', tindakLanjut: 'Pelatihan media pembelajaran digital', score: 93 },
      finalAverageScore: 93.2,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja guru muda yang energik dan berpotensi besar.'
    }
  },
  {
    id: 'sup-demo-08',
    schoolId: 'sch-pgri-1',
    schoolName: 'SMAS PGRI 1',
    teacherId: 'teacher-fatma',
    teacherName: 'Fatma Rita, S.Si.',
    teacherNip: '19830514 200902 2 004',
    subject: 'PKWU',
    classGrade: 'Fase F / Kelas XI',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Inovasi Produk Olahan Pangan Nabati Khas Daerah dan Analisis Titik Impas (BEP)',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-04T08:00:00.000Z',
    updatedAt: '2025-09-21T11:30:00.000Z',
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoPKWUCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPKWU/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanPKWU/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenPKWU/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Kewirausahaan kontekstual berbasis potensi lokal Jawa Barat', 12: 'Simulasi perhitungan BEP riil' },
      telaahSummary: { totalScore: 44, maxPossibleScore: 44, finalScore: 100, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Integrasi konsep sains pangan dan kalkulasi bisnis sangat aplikatif.', perbaikan: 'Tambahkan panduan uji organoleptik makanan.', rekomendasi: 'Model kewirausahaan kreatif yang unggul.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Merancang produk pangan bernilai jual dan menghitung break even point.',
      q2_metode: 'Project-Based Learning dengan unjuk kerja perancangan produk.',
      q3_alat_bahan: 'Bahan baku pangan lokal, lembar kalkulasi biaya produksi, template kemasan.',
      q4_tahapan: 'Penentuan tema produk, perancangan prototipe, perhitungan biaya modal & BEP, gelar karya mini.',
      q5_persiapan: 'Rubrik penilaian produk dan kelayakan bisnis.',
      q6_materi_sulit: 'Kalkulasi fixed cost vs variable cost dalam produksi skala rumah tangga.',
      q7_target_kompetensi: 'Jiwa wirausaha mandiri, kolaborasi, dan kecakapan berhitung bisnis.',
      q8_perhatian_khusus: 'Aspek kebersihan sanitasi dan ketepatan perhitungan margin harga.',
      supervisorNotes: 'Rancangan sangat berorientasi kemandirian wirausaha murid.',
      completedAt: '2025-09-09T08:30:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Murid sangat bersemangat mempresentasikan prototipe kemasan dan rincian BEP produk olahan pangan lokal.'
    },
    pascaObservasi: {
      q1_kesan: 'Kreativitas murid dalam mendesain branding dan kemasan produk luar biasa.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan unjuk kerja terlaksana dengan aman dan higienis.',
      q3_hal_memuaskan: 'Perhitungan BEP setiap kelompok sangat akurat dan masuk akal.',
      q4_hal_kurang: 'Ruang pameran gelar karya mini terasa sempit karena banyaknya produk murid.',
      q5_ketercapaian_tujuan: '96% siswa menguasai formula penentuan harga jual dan titik impas.',
      q6_kesulitan_siswa: 'Menghitung penyusutan alat dalam biaya operasional.',
      q7_alternatif_solusi: 'Memberikan lembar spreadsheet otomatis dengan formula siap pakai.',
      q8_rencana_tindak_lanjut: 'Bazar kewirausahaan sekolah pada hari ulang tahun satuan pendidikan.',
      q9_pengembangan_diri: 'Pelatihan sertifikasi halal dan izin P-IRT untuk UMKM sekolah.',
      generalImpression: 'Pembelajaran PKWU yang sangat aplikatif, melatih murid berjiwa wirausaha mandiri.',
      recommendations: 'Daftarkan karya kemasan terbaik murid ke pameran karya siswa tingkat kota.',
      completedAt: '2025-09-17T11:30:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 96%, produk murid dipasarkan di koperasi sekolah', note: 'Sangat membanggakan', score: 96 },
      administrasi: { evidence: 'Lengkap CP, TP, Modul Projek, dan daftar nilai otentik', note: 'Tertib', score: 96 },
      pengembanganDiri: { evidence: 'Koordinator Bazar Kreatif Siswa dan lulus modul PMM Kewirausahaan', note: 'Inovatif', score: 97 },
      kedisiplinan: { evidence: 'Presensi 100%, teladan dalam ketertiban', note: 'Sangat disiplin', score: 98 },
      rekomendasi: { notes: 'Koordinator Inkubator Bisnis dan Koperasi Siswa', tindakLanjut: 'Bimtek kewirausahaan digital provinsi', score: 97 },
      finalAverageScore: 96.8,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja unggul, kreatif, dan berdampak nyata bagi karakter kemandirian murid.'
    }
  },
  {
    id: 'sup-demo-ummul-sani',
    schoolId: 'sch-ummul-quro',
    schoolName: 'SMAS IT Ummul Quro',
    teacherId: 'teacher-sani',
    teacherName: 'Sani Ramadhanti Noor, S.E.',
    teacherNip: '19910418 201802 2 004',
    subject: 'Ekonomi',
    classGrade: 'Fase E / Kelas X-1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Kelangkaan Sumber Daya, Biaya Peluang dan Literasi Keuangan Syariah',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-20T08:00:00.000Z',
    updatedAt: '2025-09-15T11:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Sani Ramadhanti Noor, S.E.', 'SMAS IT Ummul Quro', 'Ekonomi'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPEkonomiUmmulQuro/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomiKelangkaan/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaLiterasiFinansial/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikStudiKasusEkonomi/view?usp=sharing',
      },
      submittedAt: '2025-08-24T09:30:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
        12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Identitas modul ajar ekonomi fase E sangat lengkap, terintegrasi nilai keislaman dan etika.',
        6: 'Profil Pelajar Pancasila Bernalar Kritis dan Mandiri tergambar jelas dalam lembar studi kasus.',
        12: 'Pendekatan kontekstual pengelolaan uang saku dan literasi investasi syariah sangat relevan.',
        21: 'Asesmen otentik berupa penyusunan skala prioritas kebutuhan siswa dengan rubrik jelas.'
      },
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Modul ajar mengaitkan teori kelangkaan dengan fenomena riil gaya hidup konsumtif remaja serta solusinya dalam perspektif ekonomi berkelanjutan.',
        perbaikan: 'Dapat ditambahkan simulasi aplikasi pencatat keuangan digital (fintech sehat).',
        rekomendasi: 'Sangat layak dijadikan rujukan modul ekonomi inspiratif di wilayah binaan.'
      },
      reviewedAt: '2025-08-28T13:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si',
      revisi: {
        modulAjarRevisiUrl: 'https://drive.google.com/file/d/1DemoModulEkonomiRevisi/view?usp=sharing',
        catatanRevisiGuru: 'Telah ditambahkan lembar simulasi aplikasi pencatatan keuangan pribadi.',
        revisiSubmittedAt: '2025-08-30T10:00:00.000Z',
        revisiStatus: 'disetujui'
      }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis konsep kelangkaan dan menentukan skala prioritas kebutuhan dalam kehidupan sehari-hari.',
      q2_metode: 'Case-Based Learning dipadukan dengan diskusi kelompok terarah (FGD).',
      q3_alat_bahan: 'Lembar Studi Kasus riil, video fenomena panic buying, aplikasi budgeting digital.',
      q4_tahapan: 'Pendahuluan (Tanya jawab uang saku), Analisis Kasus Kelangkaan, Perumusan Solusi Skala Prioritas, Presentasi & Refleksi.',
      q5_persiapan: 'Menyiapkan modul, skenario studi kasus pasar, dan rubrik kolaborasi.',
      q6_materi_sulit: 'Membedakan antara konsep keinginan dan kebutuhan pokok.',
      q7_target_kompetensi: 'Murid mampu menyusun anggaran pribadi berbasis skala prioritas.',
      q8_perhatian_khusus: 'Memfasilitasi murid yang masih ragu berpendapat dalam diskusi.',
      supervisorNotes: 'Rencana pembelajaran dirancang dengan sangat matang dan berpusat pada murid.',
      completedAt: '2025-08-29T10:30:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Interaksi kelas sangat aktif, siswa mendiskusikan anggaran belanja dengan antusias dan bernalar kritis.'
    },
    pascaObservasi: {
      q1_kesan: 'Suasana kelas sangat dinamis, seluruh murid berpartisipasi aktif dalam kelompok.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan terlaksana sesuai alokasi waktu 2 jam pelajaran.',
      q3_hal_memuaskan: 'Murid mampu mengidentifikasi ilusi kebutuhan dan membuat skala prioritas yang realistis.',
      q4_hal_kurang: 'Waktu presentasi kelompok sedikit tergeser karena antusiasme tanya jawab.',
      q5_ketercapaian_tujuan: '95% siswa mencapai kriteria ketuntasan tujuan pembelajaran (KKTP).',
      q6_kesulitan_siswa: 'Menentukan pos tabungan darurat dalam anggaran kecil.',
      q7_alternatif_solusi: 'Memberikan formula persentase 50-30-20 yang disederhanakan.',
      q8_rencana_tindak_lanjut: 'Projek mini pencatatan arus kas pribadi selama 2 pekan.',
      q9_pengembangan_diri: 'Mengikuti pelatihan Certified Financial Literacy Educator untuk guru SMA.',
      generalImpression: 'Pembelajaran bermakna yang langsung dapat dipraktikkan murid dalam kehidupan nyata.',
      recommendations: 'Kembangkan projek pencatatan keuangan ini menjadi pameran portofolio literasi finansial.',
      completedAt: '2025-09-03T11:30:00.000Z'
    },
    perangkatAjarPerbaikan: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCpTpAtpSondang/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomiRevisi/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarSondang/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenSondang/view?usp=sharing'
      },
      submittedAt: '2025-08-30T10:00:00.000Z',
      telaahScores: {},
      telaahComments: {},
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Modul ajar perbaikan sangat kaya dengan simulasi studi kasus kontekstual dan integrasi literasi finansial.',
        perbaikan: 'Terus pertahankan keterlibatan siswa aktif dalam pemecahan masalah ekonomi riil.',
        rekomendasi: 'Sangat layak dijadikan rujukan modul ekonomi inspiratif di Komunitas Belajar SMA.'
      },
      catatanRevisiGuru: 'Telah ditambahkan lembar simulasi aplikasi pencatatan keuangan pribadi dan diferensiasi tugas.',
      reviewedAt: '2025-08-31T09:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si'
    },
    praObservasiPerbaikan: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Penerapan simulasi perencanaan anggaran pribadi dan analisis dampak kelangkaan secara kontekstual.',
      q2_metode: 'Case-Based Learning dipadukan dengan FGD dan presentasi interaktif terbimbing.',
      q3_alat_bahan: 'Lembar Studi Kasus riil, kalkulator simulasi anggaran, aplikasi budgeting digital.',
      q4_tahapan: 'Apersepsi interaktif, penyelidikan kasus riil, presentasi tim dan umpan balik antarkelompok.',
      q5_persiapan: 'Menyiapkan modul perbaikan dan rubrik penilaian asesmen formatif.',
      q6_materi_sulit: 'Analisis peluang biaya opportunitas dalam keputusan riil.',
      q7_target_kompetensi: 'Murid mampu menyusun anggaran pribadi berbasis skala prioritas secara mandiri.',
      q8_perhatian_khusus: 'Memfasilitasi murid yang memerlukan bimbingan tambahan dalam penghitungan pos tabungan.',
      supervisorNotes: 'Rencana perbaikan sangat matang dan berpusat pada keterlibatan murid (Student Agency).',
      completedAt: '2025-09-01T08:30:00.000Z'
    },
    observasiKelasPerbaikan: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Praktik perbaikan di kelas sangat impresif. Murid sangat antusias, diskusi berjalan aktif dan mandiri, guru berperan optimal sebagai fasilitator.',
      completedAt: '2025-09-02T10:00:00.000Z'
    },
    pascaObservasiPerbaikan: {
      q1_kesan: 'Suasana kelas jauh lebih hidup dan murid tidak lagi pasif menunggu instruksi.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan terlaksana tepat waktu.',
      q3_hal_memuaskan: 'Seluruh murid mampu menyusun rencana keuangan mandiri yang realistis.',
      q4_hal_kurang: 'Waktu refleksi akhir perlu diperpanjang 5 menit.',
      q5_ketercapaian_tujuan: '100% murid mencapai KKTP dan menghasilkan karya anggaran pribadi.',
      q6_kesulitan_siswa: 'Siswa dengan cepat memahami konsep melalui studi kasus riil.',
      q7_alternatif_solusi: 'Formula 50-30-20 sangat efektif membantu murid.',
      q8_rencana_tindak_lanjut: 'Diseminasi modul ajar hasil perbaikan ke MGMP Ekonomi SMA Kota Bogor.',
      q9_pengembangan_diri: 'Menjadi narasumber praktik baik kurikulum merdeka.',
      generalImpression: 'Pembelajaran bermakna yang mengubah paradigma pengajaran menjadi berpusat pada murid.',
      recommendations: 'Sangat direkomendasikan untuk didiseminasikan dalam forum Komunitas Belajar (Kombel) dan MGMP.',
      completedAt: '2025-09-03T11:30:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 95%, portofolio perencanaan anggaran siswa lengkap', note: 'Sangat Baik', score: 95 },
      administrasi: { evidence: 'Perangkat ajar lengkap dan tertata rapi di Google Drive', note: 'Lengkap', score: 96 },
      pengembanganDiri: { evidence: 'Sertifikat Bimtek Kurikulum Merdeka & Webinar Ekonomi Kreatif', note: 'Aktif', score: 94 },
      kedisiplinan: { evidence: 'Kehadiran 100%, konsisten membimbing siswa', note: 'Teladan', score: 98 },
      rekomendasi: { notes: 'Pertahankan inovasi pembelajaran berbasis masalah kontekstual', tindakLanjut: 'Diseminasikan ke MGMP Ekonomi SMA Kota Bogor', score: 96 },
      finalAverageScore: 95.8,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Guru berdedikasi tinggi dengan penguasaan pedagogi dan materi ekonomi yang sangat kuat.'
    }
  },
  {
    id: 'sup-demo-ummul-kirana',
    schoolId: 'sch-ummul-quro',
    schoolName: 'SMAS IT Ummul Quro',
    teacherId: 'teacher-kirana',
    teacherName: 'Kirana Mahardhika, S.Pd, Gr.',
    teacherNip: '19930825 201903 2 009',
    subject: 'Kimia',
    classGrade: 'Fase F / Kelas XI-IPA',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Termokimia: Penentuan Perubahan Entalpi Reaksi Melalui Eksperimen Kalorimeter Sederhana Ramah Lingkungan',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-22T08:30:00.000Z',
    updatedAt: '2025-09-18T10:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Kirana Mahardhika, S.Pd, Gr.', 'SMAS IT Ummul Quro', 'Kimia'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPKimiaUmmulQuro/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulKimiaTermokimia/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaPraktikumKimia/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikPraktikumKalorimeter/view?usp=sharing',
      },
      submittedAt: '2025-08-25T10:00:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
        12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Identitas modul terstruktur sangat baik, mencakup keselamatan kerja laboratorium (K3).',
        8: 'Model Inquiry-Based Learning dirancang runtut memandu penemuan konsep entalpi.',
        13: 'Prinsip Kimia Hijau (Green Chemistry) terintegrasi pada pemilihan bahan praktikum aman.',
        21: 'Rubrik penilaian kinerja praktikum memuat indikator keterampilan proses sains yang jelas.'
      },
      telaahSummary: {
        totalScore: 44,
        maxPossibleScore: 44,
        finalScore: 100,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Pemanfaatan kalorimeter bahan daur ulang (cangkir styrofoam tertutup) mengedukasi siswa bahwa praktikum kimia akurat dapat dilakukan secara hemat dan ramah lingkungan.',
        perbaikan: 'Sediakan grafik digital suhu vs waktu menggunakan sensor termokopel atau smartphone.',
        rekomendasi: 'Direkomendasikan sebagai praktik baik inovasi praktikum Kimia Kurikulum Merdeka.'
      },
      reviewedAt: '2025-08-29T14:30:00.000Z',
      reviewedBy: 'Kusnandar, M.Si',
      revisi: {
        modulAjarRevisiUrl: 'https://drive.google.com/file/d/1DemoModulKimiaRevisi/view?usp=sharing',
        catatanRevisiGuru: 'Telah dilengkapi panduan pencatatan data suhu digital menggunakan aplikasi mobile logger.',
        revisiSubmittedAt: '2025-09-01T08:00:00.000Z',
        revisiStatus: 'disetujui'
      }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menjelaskan konsep perubahan entalpi reaksi pada tekanan tetap dan menentukan delta H reaksi melalui percobaan kalorimetri.',
      q2_metode: 'Inquiry-Based Learning berbasis Eksperimen Hands-on di Laboratorium Kimia.',
      q3_alat_bahan: 'Kalorimeter sederhana, Termometer presisi 0.1°C, Larutan NaOH 1 M, Larutan HCl 1 M, Stopwatch, LKPD praktikum.',
      q4_tahapan: 'Pra-lab (Keselamatan kerja & apersepsi), Pelaksanaan Eksperimen terpandu, Pengolahan Data & Perhitungan q larutan, Diskusi & Penarikan Kesimpulan.',
      q5_persiapan: 'Standardisasi larutan uji, penyiapan alat ukur, dan briefing keselamatan laboratorium.',
      q6_materi_sulit: 'Konversi tanda positif/negatif entalpi reaksi dan perhitungan kapasitas kalorimeter.',
      q7_target_kompetensi: 'Siswa terampil merangkai alat kalorimeter dan menghitung nilai kalor reaksi penetralan.',
      q8_perhatian_khusus: 'Memastikan penanganan larutan asam dan basa dilakukan dengan sarung tangan dan kacamata pengaman.',
      supervisorNotes: 'Prosedur keselamatan kerja dan tujuan pembelajaran sangat rinci dan terstandar.',
      completedAt: '2025-08-31T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Praktikum berjalan sangat tertib, kolaborasi kelompok solid, dan siswa antusias menganalisis data kenaikan suhu.'
    },
    pascaObservasi: {
      q1_kesan: 'Sangat puas, data eksperimen seluruh kelompok menunjukkan galat kurang dari 5% dari nilai teoritis.',
      q2_sesuai_rencana: 'Ya, seluruh rangkaian eksperimen dan pembersihan lab selesai tepat waktu.',
      q3_hal_memuaskan: 'Keterampilan psikomotorik siswa dalam membaca miniskus termometer sangat teliti.',
      q4_hal_kurang: 'Pengadukan larutan pada kelompok 3 sempat kurang merata sehingga kenaikan suhu agak lambat.',
      q5_ketercapaian_tujuan: '97% siswa tuntas memahami konsep eksoterm dan perhitungan kalor penetralan.',
      q6_kesulitan_siswa: 'Menghubungkan kenaikan suhu larutan dengan pelepasan kalor sistem ke lingkungan.',
      q7_alternatif_solusi: 'Menggunakan diagram energi animasi untuk memperjelas konsep arah perpindahan kalor.',
      q8_rencana_tindak_lanjut: 'Membahas hukum Hess dan energi ikatan pada pertemuan berikutnya.',
      q9_pengembangan_diri: 'Pelatihan Instrumentasi Spektrofotometri dan Kimia Komputasi Guru SMA.',
      generalImpression: 'Pembelajaran sains yang otentik dan menumbuhkan nalar kritis siswa.',
      recommendations: 'Tuliskan modul praktikum ini menjadi artikel ilmiah tindakan kelas.',
      completedAt: '2025-09-05T13:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 97%, nilai praktikum rata-rata 93', note: 'Sangat Unggul', score: 96 },
      administrasi: { evidence: 'Portofolio laporan praktikum dan modul ajar tersimpan rapi', note: 'Sangat Tertib', score: 97 },
      pengembanganDiri: { evidence: 'Lulus Sertifikasi Guru Penggerak & Pemakalah Seminar Sains', note: 'Berprestasi', score: 98 },
      kedisiplinan: { evidence: 'Hadir tepat waktu, teladan dalam tata tertib laboratorium', note: 'Teladan', score: 99 },
      rekomendasi: { notes: 'Pertahankan kepemimpinan pembelajaran sains yang inovatif', tindakLanjut: 'Koordinator Laboratorium IPA SMAS IT Ummul Quro', score: 98 },
      finalAverageScore: 97.6,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Sosok guru pembelajar sejati, profesional, inovatif, dan menjadi inspirasi bagi siswa dan rekan sejawat.'
    }
  },
  {
    id: 'sup-demo-rimba-atik',
    schoolId: 'sch-rimba-madya',
    schoolName: 'SMAS Rimba Madya',
    teacherId: 'teacher-atik',
    teacherName: 'Atik Dwi Larasati, S.Pd.',
    teacherNip: '19891105 201504 2 003',
    subject: 'Ekonomi',
    classGrade: 'Fase F / Kelas XI-IPS',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Pendapatan Nasional: Menghitung PDB, PNB, Pendapatan Perkapita & Analisis Indeks Gini',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-25T08:00:00.000Z',
    updatedAt: '2025-09-16T12:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Atik Dwi Larasati, S.Pd.', 'SMAS Rimba Madya', 'Ekonomi'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPEkonomiRimbaMadya/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPendapatanNasional/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaInfografisBPS/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikAnalisisDataEkonomi/view?usp=sharing',
      },
      submittedAt: '2025-08-28T09:00:00.000Z',
      telaahScores: {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 1, 11: 2,
        12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2
      },
      telaahComments: {
        1: 'Identitas modul jelas, indikator ketercapaian tujuan pembelajaran terukur.',
        4: 'Menggunakan data riil Badan Pusat Statistik (BPS) Kota Bogor dan Nasional terbaru.',
        12: 'Siswa dilatih menganalisis kurva Lorenz dan rasio Gini secara kritis.',
        21: 'Rubrik asesmen tugas analisis komparasi pendapatan perkapita negara ASEAN sangat baik.'
      },
      telaahSummary: {
        totalScore: 43,
        maxPossibleScore: 44,
        finalScore: 97.7,
        predicate: 'Sangat Baik'
      },
      feedback: {
        kelebihan: 'Pemanfaatan data statistik resmi BPS menjadikan pembelajaran ekonomi sangat kontekstual dan faktual.',
        perbaikan: 'Sajikan komparasi dampak pandemi dan pemulihan ekonomi pada pendapatan masyarakat.',
        rekomendasi: 'Dapat diteruskan ke tahapan observasi tatap muka.'
      },
      reviewedAt: '2025-08-31T11:00:00.000Z',
      reviewedBy: 'Kusnandar, M.Si',
      revisi: {
        modulAjarRevisiUrl: 'https://drive.google.com/file/d/1DemoModulRimbaEkonomiRevisi/view?usp=sharing',
        catatanRevisiGuru: 'Telah ditambahkan grafik tren pemulihan ekonomi nasional pasca-pandemi.',
        revisiSubmittedAt: '2025-09-02T10:00:00.000Z',
        revisiStatus: 'disetujui'
      }
    },
    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: 'Menganalisis konsep dan metode penghitungan pendapatan nasional serta mendeskripsikan distribusi pendapatan.',
      q2_metode: 'Problem-Based Learning dengan pendekatan studi data statistik BPS.',
      q3_alat_bahan: 'Infografis BPS, LKPD analisis data PDB, kalkulator, proyektor interaktif.',
      q4_tahapan: 'Apersepsi perbedaan pendapatan individu vs nasional, Pembagian kelompok analisis komponen PDB, Presentasi kurva Lorenz, Penguatan konsep.',
      q5_persiapan: 'Menyiapkan kumpulan data rilis PDB dan materi presentasi interaktif.',
      q6_materi_sulit: 'Menghitung pendapatan disposibel (DI) dan memahami makna angka koefisien Gini.',
      q7_target_kompetensi: 'Siswa mampu membedakan metode pendekatan produksi, pendapatan, dan pengeluaran.',
      q8_perhatian_khusus: 'Membimbing siswa yang membutuhkan pendampingan perhitungan matematis.',
      supervisorNotes: 'Kesiapan mengajar sangat baik, media berbasis data autentik.',
      completedAt: '2025-09-02T14:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 24,
      totalAspek: 24,
      score: 100,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Pengelolaan kelas sangat efektif, siswa antusias berdiskusi mengkaji ketimpangan ekonomi.'
    },
    pascaObservasi: {
      q1_kesan: 'Siswa sangat aktif saat menganalisis perbandingan PDB Indonesia dengan negara tetangga.',
      q2_sesuai_rencana: 'Ya, seluruh skenario pembelajaran berjalan lancar.',
      q3_hal_memuaskan: 'Pemahaman siswa tentang penyebab ketimpangan distribusi pendapatan sangat mendalam.',
      q4_hal_kurang: 'Waktu untuk menghitung 3 metode PDB sekaligus agak padat.',
      q5_ketercapaian_tujuan: '94% siswa tuntas menyelesaikan soal latihan PDB dan NNI.',
      q6_kesulitan_siswa: 'Menghafal rumus komponen transfer payment dan pajak langsung.',
      q7_alternatif_solusi: 'Membuat jembatan keledai alur dari PDB menuju Pendapatan Disposibel.',
      q8_rencana_tindak_lanjut: 'Melanjutkan ke materi pertumbuhan dan pembangunan ekonomi.',
      q9_pengembangan_diri: 'Mengikuti seminar literasi ekonomi dan kebijakan fiskal Kemenkeu.',
      generalImpression: 'Guru mengajar dengan penguasaan materi yang runtut, lugas, dan komunikatif.',
      recommendations: 'Tingkatkan keterlibatan siswa dalam mengusulkan solusi kebijakan pengurangan kemiskinan.',
      completedAt: '2025-09-08T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 94%, nilai asesmen sumatif memuaskan', note: 'Baik Sekali', score: 94 },
      administrasi: { evidence: 'Kelengkapan administrasi pembelajaran sangat tertib', note: 'Lengkap', score: 95 },
      pengembanganDiri: { evidence: 'Aktif MGMP Ekonomi dan pelatihan pembelajaran digital', note: 'Aktif', score: 95 },
      kedisiplinan: { evidence: 'Kehadiran 100%, berintegritas tinggi', note: 'Sangat Disiplin', score: 98 },
      rekomendasi: { notes: 'Guru berpotensi besar memimpin MGMP tingkat wilayah', tindakLanjut: 'Ikutsertakan dalam pelatihan penyusunan soal HOTS provinsi', score: 95 },
      finalAverageScore: 95.4,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja pengajaran sangat baik, teliti dalam asesmen, dan disenangi para peserta didik.'
    }
  }
];
