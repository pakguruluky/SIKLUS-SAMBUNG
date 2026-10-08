import { Supervision } from '../types';
import { 
  SEED_SAMBUNG_DEWI, 
  SEED_SAMBUNG_AHMAD, 
  SEED_SAMBUNG_SITI,
  createDefaultSambungForTeacher 
} from './sambungSeed';

export const SAMPLE_SUPERVISIONS: Supervision[] = [
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
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-05T08:00:00.000Z',
    updatedAt: '2025-09-22T10:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Hilmia Fitriyani, S.Pd.', 'SMAN 4 Bogor', 'Ekonomi'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoEkonomiCPTP/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomi/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanAjarEkonomi/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenEkonomi/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Modul terintegrasi kasus riil perbankan', 12: 'Aktivitas kontekstual sangat relevan' },
      telaahSummary: { totalScore: 38, maxPossibleScore: 44, finalScore: 86.4, predicate: 'Baik' },
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
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-09-08T08:00:00.000Z',
    updatedAt: '2025-09-24T10:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Iqbal Aziz Andrianto', 'SMAS PGRI 1', 'Sejarah'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoPGRISejarah/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPGRI/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoBahanPGRI/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoAsesmenPGRI/view?usp=sharing',
      },
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Penyusunan modul jelas dan terstruktur' },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: 'Baik' },
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
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: 'Baik (B)',
      feedbackNotes: 'Pengelolaan kelas baik, murid antusias membuat garis waktu digital.'
    },
    pascaObservasi: {
      q1_kesan: 'Siswa aktif berpartisipasi dan memahami konsep diakronik.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan terlaksana sesuai RPP.',
      q3_hal_memuaskan: 'Karya infografis timeline murid rapi dan informatif.',
      q4_hal_kurang: 'Waktu simpulan akhir perlu dialokasikan lebih longgar.',
      q5_ketercapaian_tujuan: '90% siswa mencapai kriteria ketercapaian tujuan.',
      q6_kesulitan_siswa: 'Mengkaitkan ruang geografis dengan peristiwa sejarah.',
      q7_alternatif_solusi: 'Mempadukan Google Earth dengan narasi sejarah lokal.',
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
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-IPA',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Hukum Gravitasi Newton dan Dinamika Gerak Planet Melalui Eksperimen Interaktif',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-22T08:30:00.000Z',
    updatedAt: '2025-09-18T10:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Kirana Mahardhika, S.Pd, Gr.', 'SMAS IT Ummul Quro', 'Fisika'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPFisikaUmmulQuro/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulFisikaGravitasi/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaPraktikumFisika/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikPraktikumFisika/view?usp=sharing',
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
  },
  {
    id: 'sup-demo-yphb-sihana',
    schoolId: 'sch-yphb',
    schoolName: 'SMAS YPHB',
    teacherId: 'teacher-sihana',
    teacherName: 'Sihana, S.Pd.Gr.',
    teacherNip: '19880415 201502 1 004',
    subject: 'Penjasorkes',
    classGrade: 'Fase E / Kelas X-A',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Kebugaran Jasmani dan Pola Hidup Sehat Berkelanjutan Melalui Aktivitas Sirkuit Training',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-26T08:00:00.000Z',
    updatedAt: '2025-09-17T11:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Sihana, S.Pd.Gr.', 'SMAS YPHB', 'Penjasorkes'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPPenjasYPHB/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPenjasYPHB/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaPenjasYPHB/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikPenjasYPHB/view?usp=sharing',
      },
      submittedAt: '2025-08-28T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Modul ajar Penjasorkes sangat lengkap, memperhatikan prinsip keselamatan dan inklusivitas fisik murid.' },
      telaahSummary: { totalScore: 42, maxPossibleScore: 44, finalScore: 95.5, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Sirkuit training dengan variasi intensitas melatih kemandirian kebugaran murid.', perbaikan: 'Tambahkan lembar pencatatan denyut nadi mandiri.', rekomendasi: 'Siap untuk observasi kelas tatap muka di lapangan.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Mempraktikkan dan menganalisis konsep latihan sirkuit training untuk peningkatan kebugaran jasmani.',
      q2_metode: 'Demonstrasi kolaboratif dipadukan Circuit Training dan Peer-Assessment.',
      q3_alat_bahan: 'Cone penanda pos, matras senam, stopwatch digital, lembar monitor denyut nadi.',
      q4_tahapan: 'Pemanasan dinamis, Pengenalan 5 pos latihan, Rotasi sirkuit kelompok, Pendinginan dan refleksi denyut nadi.',
      q5_persiapan: 'Peralatan lapangan tertata aman, modul ajar terdistribusi.',
      q6_materi_sulit: 'Menghitung zona denyut nadi latihan (Training Heart Rate).',
      q7_target_kompetensi: 'Kebugaran fisik, sportivitas, dan kesadaran gaya hidup sehat.',
      q8_perhatian_khusus: 'Memperhatikan murid yang memiliki riwayat asma atau kelelahan berlebih.',
      supervisorNotes: 'Rancangan aktivitas jasmani sangat memperhatikan standar keselamatan dan kesehatan murid.',
      completedAt: '2025-09-02T08:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Pengelolaan murid di lapangan sangat tertib, suasana menyenangkan dan penuh antusiasme.'
    },
    pascaObservasi: {
      q1_kesan: 'Sangat senang karena seluruh murid antusias menyelesaikan tantangan di setiap pos kebugaran.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan sirkuit terlaksana tepat waktu.',
      q3_hal_memuaskan: 'Kekompakan antarteman saling menyemangati saat menyelesaikan pos latihan fisik.',
      q4_hal_kurang: 'Dibutuhkan cadangan air minum tambahan di dekat pos latihan luar ruangan.',
      q5_ketercapaian_tujuan: '95% murid memahami cara mengukur kebugaran dan denyut nadi mandiri.',
      q6_kesulitan_siswa: 'Menjaga ritme pernapasan yang stabil saat pos push-up dan lari zig-zag.',
      q7_alternatif_solusi: 'Pemberian aba-aba irama musik tempo sedang sebagai pemandu ritme gerak.',
      q8_rencana_tindak_lanjut: 'Penyusunan target program latihan kebugaran mandiri di rumah selama 2 pekan.',
      q9_pengembangan_diri: 'Mengikuti pelatihan sertifikasi pelatih kebugaran remaja tingkat regional.',
      generalImpression: 'Instruktur pembelajaran jasmani yang energik, mengedepankan nilai sportivitas dan kesehatan mental murid.',
      recommendations: 'Kembangkan video tutorial sirkuit training mandiri untuk dibagikan di kanal edukasi sekolah.',
      completedAt: '2025-09-08T10:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: '95% murid mencapai kriteria kebugaran jasmani baik, juara lomba senam kota', note: 'Sangat Baik', score: 95 },
      administrasi: { evidence: 'Modul ajar dan kartu catatan kebugaran murid terarsip rapi', note: 'Tertib', score: 95 },
      pengembanganDiri: { evidence: 'Aktif di MGMP PJOK Kota Bogor dan lulus modul pelatihan mandiri', note: 'Inovatif', score: 96 },
      kedisiplinan: { evidence: 'Presensi 100%, selalu hadir lebih awal mempersiapkan lapangan', note: 'Teladan', score: 98 },
      rekomendasi: { notes: 'Koordinator Pembina Prestasi Olahraga Sekolah', tindakLanjut: 'Bimtek manajemen keolahragaan sekolah', score: 96 },
      finalAverageScore: 96.0,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja sangat profesional, berdedikasi membina fisik dan karakter murid.'
    }
  },
  {
    id: 'sup-demo-yphb-salma',
    schoolId: 'sch-yphb',
    schoolName: 'SMAS YPHB',
    teacherId: 'teacher-siti-salma',
    teacherName: 'Siti Salma, S.Pd',
    teacherNip: '19910712 201703 2 008',
    subject: 'Fisika',
    classGrade: 'Fase F / Kelas XI-MIPA',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Gelombang Mekanik dan Resonansi Bunyi dalam Teknologi Audio',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-27T08:00:00.000Z',
    updatedAt: '2025-09-18T10:00:00.000Z',
    sambung: SEED_SAMBUNG_SITI,
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPFisikaYPHB/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulFisikaYPHB/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaFisikaYPHB/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikFisikaYPHB/view?usp=sharing',
      },
      submittedAt: '2025-08-30T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Penyusunan modul fisika gelombang sangat kontekstual mengaitkan prinsip audio smartphone.' },
      telaahSummary: { totalScore: 43, maxPossibleScore: 44, finalScore: 97.7, predicate: 'Sangat Baik' },
      feedback: { kelebihan: 'Integrasi simulasi gelombang visual membantu siswa memahami perambatan bunyi.', perbaikan: 'Tambahkan pengayaan resonansi tabung pipa organa.', rekomendasi: 'Sangat siap dilanjutkan ke observasi tatap muka.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis karakteristik gelombang mekanik dan resonansi bunyi dalam kehidupan sehari-hari.',
      q2_metode: 'Inquiry-Based Learning berbasis Eksperimen Virtual dan Demonstrasi Garpu Tala.',
      q3_alat_bahan: 'Aplikasi Sound Generator di smartphone, garpu tala, tabung resonansi, LKPD digital.',
      q4_tahapan: 'Apersepsi fenomena kaca bergetar akibat petir, Eksperimen frekuensi nada, Analisis data, Simpulan.',
      q5_persiapan: 'Menyiapkan modul ajar interaktif dan alat peraga akustik.',
      q6_materi_sulit: 'Menghitung hubungan antara frekuensi, panjang gelombang, dan cepat rambat bunyi.',
      q7_target_kompetensi: 'Kemampuan bernalar analitis sains dan pemecahan masalah fenomena gelombang.',
      q8_perhatian_khusus: 'Membimbing murid yang membutuhkan penguatan perhitungan matematis gelombang.',
      supervisorNotes: 'Rancangan pembelajaran fisika yang inovatif dan relevan dengan teknologi audio modern.',
      completedAt: '2025-09-03T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 23,
      totalAspek: 24,
      score: 95.8,
      predicate: 'Amat Baik (A)',
      feedbackNotes: 'Interaksi pembelajaran sangat hidup, murid antusias mencoba frekuensi audio pada smartphone masing-masing.'
    },
    pascaObservasi: {
      q1_kesan: 'Murid sangat takjub saat melihat resonansi bunyi mampu menggetarkan partikel garam pada membran speaker.',
      q2_sesuai_rencana: 'Ya, seluruh tahapan terlaksana sesuai skenario RPP.',
      q3_hal_memuaskan: 'Penalaran kritis murid saat membedakan bunyi ultrasonik dan audiosonik.',
      q4_hal_kurang: 'Suara bising luar kelas sempat sedikit mengganggu pengukuran frekuensi rendah.',
      q5_ketercapaian_tujuan: '93% murid mencapai KKTP dalam kuis formatif gelombang bunyi.',
      q6_kesulitan_siswa: 'Menerapkan formula pipa organa terbuka vs tertutup.',
      q7_alternatif_solusi: 'Membuat animasi visual pola gelombang stasioner menggunakan simulasi PhET.',
      q8_rencana_tindak_lanjut: 'Melanjutkan materi ke efek Doppler pada pertemuan berikutnya.',
      q9_pengembangan_diri: 'Mengikuti pelatihan laboratorium fisika komputasi.',
      generalImpression: 'Kompetensi pedagogik dan profesional guru sangat unggul.',
      recommendations: 'Tuliskan modul eksperimen audio ini menjadi best practice MGMP Fisika.',
      completedAt: '2025-09-09T13:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 94%, nilai rata-rata asesmen sumatif fisika 91', note: 'Sangat Baik', score: 95 },
      administrasi: { evidence: 'Perangkat ajar kurikulum merdeka tersimpan lengkap dan tertata rapi', note: 'Tertib', score: 96 },
      pengembanganDiri: { evidence: 'Aktif di MGMP Fisika Kota Bogor dan menyelesaikan sertifikasi PMM', note: 'Produktif', score: 96 },
      kedisiplinan: { evidence: 'Presensi 100%, teladan dalam ketertiban', note: 'Teladan', score: 98 },
      rekomendasi: { notes: 'Direkomendasikan sebagai Fasilitator Pembelajaran Sains Kreatif', tindakLanjut: 'Ikutsertakan dalam diseminasi best practice sains tingkat kota', score: 96 },
      finalAverageScore: 96.2,
      finalGrade: 'Amat Baik (A)',
      summaryNotes: 'Kinerja sangat prima dan berdedikasi tinggi dalam menginspirasi murid belajar sains.'
    }
  },
  {
    id: 'sup-demo-bhakti-widya',
    schoolId: 'sch-bhakti-insani',
    schoolName: 'SMAS Bhakti Insani',
    teacherId: 'teacher-widya',
    teacherName: 'Widya Anjani, S.Pd.',
    teacherNip: '19900518 201604 2 007',
    subject: 'Ekonomi',
    classGrade: 'Fase E / Kelas X-1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Manajemen dan Koperasi Sekolah dalam Menggerakkan Ekonomi Kerakyatan',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-28T08:00:00.000Z',
    updatedAt: '2025-09-19T11:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Widya Anjani, S.Pd.', 'SMAS Bhakti Insani', 'Ekonomi'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPEkonomiBhakti/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomiBhakti/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaEkonomiBhakti/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikEkonomiBhakti/view?usp=sharing',
      },
      submittedAt: '2025-08-31T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Modul terstruktur baik dan memuat nilai gotong royong ekonomi koperasi.' },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: 'Baik' },
      feedback: { kelebihan: 'Studi kasus riil koperasi sekolah sangat aplikatif bagi murid.', perbaikan: 'Perkaya lembar kerja dengan perhitungan Sisa Hasil Usaha (SHU).', rekomendasi: 'Dapat dilanjutkan ke observasi tatap muka.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Mendeskripsikan peran koperasi dalam perekonomian Indonesia dan menyimulasikan pembagian SHU.',
      q2_metode: 'Problem-Based Learning dengan simulasi Rapat Anggota Tahunan (RAT) mini.',
      q3_alat_bahan: 'Laporan keuangan sederhana koperasi sekolah, lembar kerja hitung SHU, proyektor.',
      q4_tahapan: 'Orientasi masalah ekonomi, Pembagian peran anggota koperasi, Simulasi perhitungan SHU, Presentasi hasil.',
      q5_persiapan: 'Menyiapkan modul ajar dan data simulasi simpanan pokok dan wajib.',
      q6_materi_sulit: 'Menghitung persentase jasa modal dan jasa anggota dalam pembagian SHU.',
      q7_target_kompetensi: 'Literasi finansial, kerja sama tim, dan kepemimpinan demokratis.',
      q8_perhatian_khusus: 'Memfasilitasi murid yang belum lancar kalkulasi proporsi keuangan.',
      supervisorNotes: 'Perencanaan pembelajaran terstruktur dan mengedepankan asas kekeluargaan koperasi.',
      completedAt: '2025-09-04T08:30:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: 'Baik (B)',
      feedbackNotes: 'Suasana kelas tertib, murid berpartisipasi aktif dalam simulasi RAT koperasi sekolah.'
    },
    pascaObservasi: {
      q1_kesan: 'Cukup puas, murid memahami esensi bahwa koperasi bukan sekadar toko melainkan badan usaha berasas kekeluargaan.',
      q2_sesuai_rencana: 'Ya, simulasi pembagian SHU selesai sesuai alokasi waktu 2 JP.',
      q3_hal_memuaskan: 'Keseriusan murid saat memverifikasi kebenaran nominal simpanan dan jasa anggota.',
      q4_hal_kurang: 'Dua kelompok membutuhkan waktu agak lama dalam kalkulasi persentase jasa modal.',
      q5_ketercapaian_tujuan: '88% murid tuntas menghitung pembagian SHU.',
      q6_kesulitan_siswa: 'Membedakan antara simpanan sukarela dengan simpanan wajib.',
      q7_alternatif_solusi: 'Membuat tabel komparasi ciri masing-masing simpanan koperasi.',
      q8_rencana_tindak_lanjut: 'Kunjungan observasi langsung ke operasional koperasi karyawan/sekolah.',
      q9_pengembangan_diri: 'Mengikuti workshop akuntansi koperasi digital.',
      generalImpression: 'Guru komunikatif dan mampu mengaitkan teori ekonomi dengan praktik nyata di sekolah.',
      recommendations: 'Tingkatkan keterlibatan aktif siswa dalam mengelola pojok literasi koperasi sekolah.',
      completedAt: '2025-09-10T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 90%, nilai formatif memuaskan', note: 'Baik', score: 90 },
      administrasi: { evidence: 'Perangkat pembelajaran lengkap dan tersusun tertib', note: 'Rapi', score: 92 },
      pengembanganDiri: { evidence: 'Aktif di Kombel Sekolah dan webinar literasi ekonomi', note: 'Positif', score: 92 },
      kedisiplinan: { evidence: 'Presensi 98%, disiplin dan bertanggung jawab', note: 'Baik', score: 95 },
      rekomendasi: { notes: 'Pembina Koperasi Siswa SMAS Bhakti Insani', tindakLanjut: 'Pelatihan kewirausahaan koperasi sekolah', score: 92 },
      finalAverageScore: 92.2,
      finalGrade: 'Baik (B)',
      summaryNotes: 'Kinerja pengajaran baik, berdedikasi dalam mendampingi murid.'
    }
  },
  {
    id: 'sup-demo-yasih-yazid',
    schoolId: 'sch-yasih',
    schoolName: 'SMAS Yasih',
    teacherId: 'teacher-yazid',
    teacherName: 'Yazid Ali Hamdi',
    teacherNip: '19920921 201801 1 005',
    subject: 'PKn',
    classGrade: 'Fase E / Kelas X-A',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Nilai-Nilai Pancasila dalam Penyelenggaraan Negara dan Kehidupan Bermasyarakat',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-29T08:00:00.000Z',
    updatedAt: '2025-09-20T11:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Yazid Ali Hamdi', 'SMAS Yasih', 'PKn'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPPKnYasih/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulPKnYasih/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaPKnYasih/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikPKnYasih/view?usp=sharing',
      },
      submittedAt: '2025-09-02T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Penyusunan modul terarah pada penguatan Profil Pelajar Pancasila dan penegakan hukum berkeadilan.' },
      telaahSummary: { totalScore: 38, maxPossibleScore: 44, finalScore: 86.4, predicate: 'Baik' },
      feedback: { kelebihan: 'Studi kasus aktual hak asasi manusia dan toleransi beragama sangat relevan.', perbaikan: 'Tambahkan rubrik penilaian musyawarah mufakat.', rekomendasi: 'Diteruskan ke observasi kelas tatap muka.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis penerapan nilai-nilai Pancasila dalam perumusan kebijakan publik dan interaksi sosial.',
      q2_metode: 'Case-Based Learning dipadukan Diskusi Panel Pro-Kontra Kebijakan Publik.',
      q3_alat_bahan: 'Artikel berita aktual, lembar kerja analisis kasus, slide infografis konstitusi.',
      q4_tahapan: 'Apersepsi nilai sila ke-4 dan ke-5, Pembagian klaster studi kasus, Diskusi argumen, Perumusan konsensus.',
      q5_persiapan: 'Menyiapkan modul ajar dan rubrik keaktifan berpendapat santun.',
      q6_materi_sulit: 'Mengharmonisasikan hak asasi individu dengan kewajiban warga negara dalam hukum nasional.',
      q7_target_kompetensi: 'Kecakapan berpikir kritis kewarganegaraan (civic critical thinking) dan toleransi.',
      q8_perhatian_khusus: 'Mendorong murid yang pasif agar berani menyuarakan sudut pandang etis.',
      supervisorNotes: 'Rancangan sangat berorientasi penguatan karakter kebangsaan dan demokratis.',
      completedAt: '2025-09-05T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 21,
      totalAspek: 24,
      score: 87.5,
      predicate: 'Baik (B)',
      feedbackNotes: 'Diskusi panel berjalan hangat, murid menghargai perbedaan pandangan dengan etika komunikasi santun.'
    },
    pascaObservasi: {
      q1_kesan: 'Sangat mengapresiasi kedewasaan berpikir murid saat membahas isu toleransi dan keadilan sosial.',
      q2_sesuai_rencana: 'Ya, alur diskusi panel terlaksana tuntas.',
      q3_hal_memuaskan: 'Murid mampu mengidentifikasi solusi berbasis musyawarah mufakat.',
      q4_hal_kurang: 'Waktu untuk sesi tanggapan penonton panelis terasa singkat.',
      q5_ketercapaian_tujuan: '91% murid mencapai KKTP analisis nilai konstitusi.',
      q6_kesulitan_siswa: 'Menghubungkan pasal undang-undang dasar dengan penerapannya pada kasus hukum nyata.',
      q7_alternatif_solusi: 'Membuat glosarium pasal-pasal kunci hak dan kewajiban warga negara.',
      q8_rencana_tindak_lanjut: 'Projek mini kampanye toleransi dan anti-bullying di media sosial sekolah.',
      q9_pengembangan_diri: 'Pelatihan mediasi resolusi konflik dan pendidikan kewarganegaraan transformatif.',
      generalImpression: 'Sosok pendidik yang mengayomi, mengedepankan keteladanan etika moral Pancasila.',
      recommendations: 'Giatkan proyek kepemimpinan murid dalam forum OSIS dan kegiatan kepanduan.',
      completedAt: '2025-09-12T13:30:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 91%, proyek aksi nyata kebinekaan siswa berjalan sukses', note: 'Baik Sekali', score: 92 },
      administrasi: { evidence: 'Dokumen RPP dan lembar asesmen otentik tersusun rapi', note: 'Tertib', score: 93 },
      pengembanganDiri: { evidence: 'Aktif di MGMP PPKn dan seminar wawasan kebangsaan', note: 'Positif', score: 93 },
      kedisiplinan: { evidence: 'Presensi 98%, teladan dalam ketepatan waktu', note: 'Disiplin', score: 96 },
      rekomendasi: { notes: 'Pembina MPK dan Pendidikan Karakter Siswa', tindakLanjut: 'Bimtek penguatan wawasan kebangsaan provinsi', score: 93 },
      finalAverageScore: 93.4,
      finalGrade: 'Baik (B)',
      summaryNotes: 'Kinerja terbukti baik, memiliki kepemimpinan moral yang kuat di satuan pendidikan.'
    }
  },
  {
    id: 'sup-demo-muhammadiyah-lutfiana',
    schoolId: 'sch-muhammadiyah',
    schoolName: 'SMAS Muhammadiyah',
    teacherId: 'teacher-lutfiana',
    teacherName: 'Lutfiana Faridh Fadillah',
    teacherNip: '19931205 201902 2 006',
    subject: 'Kimia',
    classGrade: 'Fase F / Kelas XI-IPA',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Ikatan Kimia dan Bentuk Molekul dengan Pendekatan Model Tiga Dimensi Sederhana',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-30T08:00:00.000Z',
    updatedAt: '2025-09-22T10:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Lutfiana Faridh Fadillah', 'SMAS Muhammadiyah', 'Kimia'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPKimiaMuhammadiyah/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulKimiaMuhammadiyah/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaKimiaMuhammadiyah/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikKimiaMuhammadiyah/view?usp=sharing',
      },
      submittedAt: '2025-09-03T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 2, 9: 1, 10: 2, 11: 1, 12: 2, 13: 1, 14: 1, 15: 2, 16: 1, 17: 2, 18: 1, 19: 1, 20: 2, 21: 1, 22: 2 },
      telaahComments: { 1: 'Modul ajar memuat alur pembelajaran dasar, perlu penguatan pada diferensiasi konten dan rubrik unjuk kerja praktikum.' },
      telaahSummary: { totalScore: 31, maxPossibleScore: 44, finalScore: 70.5, predicate: 'Cukup' },
      feedback: { kelebihan: 'Pemanfaatan plastisin untuk model molekul 3D sudah baik.', perbaikan: 'Perjelas rubrik kriteria ketercapaian tujuan pembelajaran (KKTP) dan lembar asesmen formatif berkala.', rekomendasi: 'Perlu pendampingan berkala (coaching) oleh pengawas sebelum observasi lanjutan.' }
    },
    praObservasi: {
      interviewDurationMinutes: 25,
      q1_kd_indikator: 'Menjelaskan teori domain elektron dan meramalkan bentuk molekul kovalen sederhana.',
      q2_metode: 'Demonstrasi guru dipadukan kerja kelompok merangkai plastisin dan tusuk gigi.',
      q3_alat_bahan: 'Plastisin aneka warna, tusuk gigi, lembar kerja pengamatan bentuk molekul.',
      q4_tahapan: 'Pendahuluan instruksi, Pemodelan molekul air dan metana, Diskusi kelompok, Simpulan.',
      q5_persiapan: 'Menyiapkan bahan plastisin dan modul cetak.',
      q6_materi_sulit: 'Menentukan pasangan elektron bebas (PEB) vs pasangan elektron ikatan (PEI).',
      q7_target_kompetensi: 'Pemahaman spasial bentuk geometri molekul.',
      q8_perhatian_khusus: 'Membimbing murid yang masih kesulitan menggambar struktur Lewis.',
      supervisorNotes: 'Guru membutuhkan penguatan pada variasi metode pengajaran interaktif agar murid tidak jenuh.',
      completedAt: '2025-09-08T09:00:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 17,
      totalAspek: 24,
      score: 70.8,
      predicate: 'Cukup (C)',
      feedbackNotes: 'Interaksi kelas cukup baik, namun sebagian murid masih pasif dan alokasi waktu penarikan kesimpulan belum maksimal.'
    },
    pascaObservasi: {
      q1_kesan: 'Cukup lega, namun menyadari perlunya manajemen waktu yang lebih disiplin saat praktik kelompok.',
      q2_sesuai_rencana: 'Sebagian besar tahapan terlaksana meski sesi tanya jawab terpotong.',
      q3_hal_memuaskan: 'Murid senang bermain dengan plastisin untuk membuat model geometri molekul.',
      q4_hal_kurang: 'Asesmen formatif tertulis belum sempat dikerjakan seluruh murid.',
      q5_ketercapaian_tujuan: '72% murid mencapai kriteria ketuntasan pemodelan geometri.',
      q6_kesulitan_siswa: 'Memvisualisasikan sudut ikatan trigonal piramida dan planar.',
      q7_alternatif_solusi: 'Memanfaatkan aplikasi augmented reality atau PhET simulation bentuk molekul.',
      q8_rencana_tindak_lanjut: 'Coaching pendampingan perencanaan modul ajar berbasis IT bersama pengawas.',
      q9_pengembangan_diri: 'Mengikuti pelatihan penyusunan RPP Kurikulum Merdeka dan asesmen otentik.',
      generalImpression: 'Guru muda berpotensi yang membutuhkan bimbingan intensif dalam diferensiasi dan manajemen kelas.',
      recommendations: 'Ikuti pendampingan berkelanjutan Siklus SAMBUNG untuk meningkatkan mutu pembelajaran.',
      completedAt: '2025-09-15T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 76%, perlu bimbingan remedial berkelanjutan', note: 'Cukup', score: 75 },
      administrasi: { evidence: 'Perangkat ajar tersusun standar, perlu pembaruan berkala', note: 'Cukup', score: 78 },
      pengembanganDiri: { evidence: 'Mengikuti pelatihan Kombel dan PMM', note: 'Cukup Aktif', score: 75 },
      kedisiplinan: { evidence: 'Presensi 96%, hadir tepat waktu', note: 'Baik', score: 85 },
      rekomendasi: { notes: 'Diberikan pendampingan klinis pembelajaran oleh pengawas pembina', tindakLanjut: 'Bimtek pedagogi kurikulum merdeka tingkat kota', score: 78 },
      finalAverageScore: 78.2,
      finalGrade: 'Cukup (C)',
      summaryNotes: 'Memiliki komitmen mengajar yang baik, siap berkembang melalui pendampingan pedagogik berkelanjutan.'
    }
  },
  {
    id: 'sup-demo-ananda-saulina',
    schoolId: 'sch-ananda',
    schoolName: 'SMAS Ananda',
    teacherId: 'teacher-saulina',
    teacherName: 'Saulina Siregar, S.Sos',
    teacherNip: '19890422 201403 2 009',
    subject: 'Ekonomi',
    classGrade: 'Fase E / Kelas X-1',
    semester: 'Ganjil',
    schoolYear: '2025/2026',
    lessonTitle: 'Perdagangan Internasional dan Kebijakan Tarif Impor dalam Era Globalisasi',
    status: 'completed',
    supervisorId: 'admin-kusnandar',
    supervisorName: 'Kusnandar, M.Si',
    supervisorRole: 'admin',
    createdAt: '2025-08-31T08:00:00.000Z',
    updatedAt: '2025-09-21T11:00:00.000Z',
    sambung: createDefaultSambungForTeacher('Saulina Siregar, S.Sos', 'SMAS Ananda', 'Ekonomi'),
    perangkatAjar: {
      driveLinks: {
        cpTpAtpUrl: 'https://drive.google.com/file/d/1DemoCPTPEkonomiAnanda/view?usp=sharing',
        modulAjarUrl: 'https://drive.google.com/file/d/1DemoModulEkonomiAnanda/view?usp=sharing',
        bahanAjarUrl: 'https://drive.google.com/file/d/1DemoMediaEkonomiAnanda/view?usp=sharing',
        asesmenUrl: 'https://drive.google.com/file/d/1DemoRubrikEkonomiAnanda/view?usp=sharing',
      },
      submittedAt: '2025-09-04T09:00:00.000Z',
      telaahScores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 1, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 2, 14: 1, 15: 2, 16: 2, 17: 2, 18: 2, 19: 1, 20: 2, 21: 2, 22: 2 },
      telaahComments: { 1: 'Penyusunan modul ekonomi global terstruktur dan memuat isu aktual neraca perdagangan nasional.' },
      telaahSummary: { totalScore: 37, maxPossibleScore: 44, finalScore: 84.1, predicate: 'Baik' },
      feedback: { kelebihan: 'Studi kasus ekspor komoditas kelapa sawit dan nikel sangat aktual.', perbaikan: 'Tambahkan rubrik penilaian debat pro-kontra tarif proteksi.', rekomendasi: 'Diteruskan ke observasi tatap muka.' }
    },
    praObservasi: {
      interviewDurationMinutes: 30,
      q1_kd_indikator: 'Menganalisis faktor pendorong perdagangan internasional dan dampak kebijakan proteksi bagi konsumen.',
      q2_metode: 'Problem-Based Learning dengan simulasi negosiasi perdagangan bilateral antarnegara.',
      q3_alat_bahan: 'Data statistik ekspor-impor Kementerian Perdagangan, kartu komoditas, lembar negosiasi.',
      q4_tahapan: 'Apersepsi produk impor di sekitar kita, Simulasi penetapan tarif kuota, Analisis keuntungan komparatif, Refleksi.',
      q5_persiapan: 'Menyiapkan modul ajar dan data tren neraca perdagangan.',
      q6_materi_sulit: 'Menghitung surplus konsumen dan surplus produsen akibat penetapan tarif impor.',
      q7_target_kompetensi: 'Literasi ekonomi global, kemampuan negosiasi, dan nalar kritis kebijakan.',
      q8_perhatian_khusus: 'Membimbing murid dalam memahami istilah neraca pembayaran berjalan.',
      supervisorNotes: 'Rancangan sangat menarik dan membekali murid pemahaman ekonomi makro modern.',
      completedAt: '2025-09-08T09:30:00.000Z'
    },
    observasiKelas: {
      items: {},
      totalYa: 20,
      totalAspek: 24,
      score: 83.3,
      predicate: 'Baik (B)',
      feedbackNotes: 'Pengelolaan kelas komunikatif, murid antusias mewakili peran diplomat perdagangan antarnegara.'
    },
    pascaObservasi: {
      q1_kesan: 'Sangat senang karena murid berani mengemukakan argumen dampak kenaikan bea masuk impor.',
      q2_sesuai_rencana: 'Ya, seluruh skenario negosiasi perdagangan selesai tepat waktu.',
      q3_hal_memuaskan: 'Kecakapan murid mengidentifikasi keunggulan mutlak vs keunggulan komparatif.',
      q4_hal_kurang: 'Dua murid memerlukan dorongan lebih untuk berbicara di hadapan audiens.',
      q5_ketercapaian_tujuan: '89% murid tuntas asesmen formatif perdagangan internasional.',
      q6_kesulitan_siswa: 'Membedakan antara dumping dengan subsidi ekspor.',
      q7_alternatif_solusi: 'Membuat diagram ringkas jenis-jenis kebijakan perdagangan internasional.',
      q8_rencana_tindak_lanjut: 'Membahas bab kerja sama ekonomi regional ASEAN dan APEC.',
      q9_pengembangan_diri: 'Mengikuti kursus ekonomi internasional dan geopolitik perdagangan.',
      generalImpression: 'Guru profesional dengan wawasan sosial ekonomi yang luas dan luwes dalam memfasilitasi murid.',
      recommendations: 'Tingkatkan latihan soal penalaran berbasis grafik penawaran dan permintaan internasional.',
      completedAt: '2025-09-14T11:00:00.000Z'
    },
    evaluasiTahunan: {
      hasilBelajar: { evidence: 'Ketuntasan 90%, nilai sumatif ekonomi memuaskan', note: 'Baik', score: 91 },
      administrasi: { evidence: 'Lengkap dan tertata rapi dalam portofolio guru', note: 'Tertib', score: 92 },
      pengembanganDiri: { evidence: 'Aktif di forum MGMP Ekonomi dan seminar kurikulum', note: 'Positif', score: 92 },
      kedisiplinan: { evidence: 'Presensi 99%, dedikasi tinggi', note: 'Disiplin', score: 96 },
      rekomendasi: { notes: 'Pembina Klub Debat Isu Sosial Ekonomi Sekolah', tindakLanjut: 'Pelatihan bimbingan olimpiade sains ekonomi tingkat kota', score: 93 },
      finalAverageScore: 92.8,
      finalGrade: 'Baik (B)',
      summaryNotes: 'Kinerja pengajaran baik, dedikatif, dan disenangi para murid.'
    }
  }
];
