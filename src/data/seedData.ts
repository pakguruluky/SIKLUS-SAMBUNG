import { Supervision } from '../types';

export const SAMPLE_SUPERVISIONS: Supervision[] = [
  {
    id: 'sup-demo-dewi-awal',
    schoolId: 'sch-sman1',
    schoolName: 'SMAN 1 Kota Bandung',
    teacherId: 'teacher-dewi',
    teacherName: 'Dewi Kartika, S.Pd., M.Pfis.',
    teacherNip: '19840512 200801 2 007',
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-MIPA 2',
    semester: 'Genap',
    schoolYear: '2025/2026',
    lessonTitle: 'Gelombang Mekanik & Resonansi Bunyi (Sebelum Penilaian)',
    status: 'draft',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'H. Kusnandar, M.Si.',
    supervisorRole: 'admin',
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',

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
    schoolId: 'sch-sman1',
    schoolName: 'SMAN 1 Kota Bandung',
    teacherId: 'teacher-dewi',
    teacherName: 'Dewi Kartika, S.Pd., M.Pfis.',
    teacherNip: '19840512 200801 2 007',
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-MIPA 1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Termodinamika & Hukum Kekekalan Energi Berbasis Masalah Nyata',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'H. Kusnandar, M.Si.',
    supervisorRole: 'admin',
    createdAt: '2025-08-15T08:30:00.000Z',
    updatedAt: '2025-09-10T11:45:00.000Z',

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
        rekomendasi: 'Dapat dijadikan model praktik baik (Best Practice) bagi MGMP Fisika SMA Kota Bandung.'
      },
      reviewedAt: '2025-08-25T14:00:00.000Z',
      reviewedBy: 'H. Kusnandar, M.Si.',
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
    schoolId: 'sch-sman2',
    schoolName: 'SMAN 2 Kota Bandung',
    teacherId: 'teacher-budi',
    teacherName: 'Budi Santoso, S.Pd.',
    teacherNip: '19890214 201502 1 004',
    subject: 'Bahasa Indonesia',
    classGrade: 'Fase E / Kelas X-3',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Menulis Teks Anekdot Mengkritisi Kebijakan Publik Berdasarkan Fakta',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'H. Kusnandar, M.Si.',
    supervisorRole: 'admin',
    createdAt: '2025-08-18T09:00:00.000Z',
    updatedAt: '2025-09-12T14:20:00.000Z',

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
      reviewedBy: 'H. Kusnandar, M.Si.',
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
    schoolId: 'sch-sman1',
    schoolName: 'SMAN 1 Kota Bandung',
    teacherId: 'teacher-ahmad',
    teacherName: 'Ahmad Fauzi, M.Pd.',
    teacherNip: '19790623 200501 1 008',
    subject: 'Matematika',
    classGrade: 'Fase E / Kelas X-A',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Eksplorasi Fungsi Eksponensial dalam Pertumbuhan Mikroorganisme dan Investasi',
    status: 'in_progress',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'H. Kusnandar, M.Si.',
    supervisorRole: 'admin',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z',

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
      reviewedBy: 'H. Kusnandar, M.Si.'
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
  }
];
