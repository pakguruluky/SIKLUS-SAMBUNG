import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client if key exists
  const aiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (aiApiKey) {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', hasAiKey: Boolean(aiApiKey) });
  });

  // AI-powered Telaah RPP 22 Indikator Analysis Endpoint
  app.post('/api/ai/analyze-rpp', async (req, res) => {
    try {
      const {
        teacherName,
        subject,
        lessonTitle,
        classGrade,
        schoolName,
        rppText,
        focusAspects,
      } = req.body;

      if (!ai) {
        return res.status(200).json({
          success: false,
          fallbackRequired: true,
          message: 'GEMINI_API_KEY not configured on server, client fallback will be used',
        });
      }

      const prompt = `Anda adalah Pengawas Pembina SMA (Kusnandar, M.Si) yang sangat ahli dalam supervisi akademik klinis Kurikulum Merdeka dan instrumen SIKLUS SAMBUNG (Selidiki, Amati, Maknai, Berdayakan, Uji, Nyatakan, Gerakkan).

Tugas Anda adalah menelaah Modul Ajar / Rencana Pelaksanaan Pembelajaran (RPP) berikut secara mendalam, pedagogis, dan akurat berdasarkan 22 Butir Indikator Resmi Telaah RPP Pengawas Pembina.

DATA GURU & PEMBELAJARAN:
- Nama Guru: ${teacherName || 'Guru Mata Pelajaran'}
- Satuan Pendidikan: ${schoolName || 'SMA'}
- Mata Pelajaran: ${subject || 'Mata Pelajaran'}
- Materi Pokok / Topik: ${lessonTitle || 'Materi Pembelajaran'}
- Fase / Kelas: ${classGrade || 'Fase E / Fase F'}
${rppText ? `- Kutipan / Ringkasan Dokumen Modul Ajar:\n${rppText}` : ''}
${focusAspects ? `- Catatan Khusus Pengawas: ${focusAspects}` : ''}

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
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model gemini-3.8-flash error, trying gemini-flash-latest:', primaryErr.message);
        try {
          response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
        } catch (secondaryErr: any) {
          console.warn('Secondary model error, trying gemini-3.1-flash-lite:', secondaryErr.message);
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
        }
      }

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (parseErr) {
        return res.json({
          success: false,
          fallbackRequired: true,
          raw: responseText,
        });
      }
    } catch (err: any) {
      console.error('Error analyzing RPP with AI:', err);
      return res.status(200).json({
        success: false,
        fallbackRequired: true,
        error: err.message,
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
