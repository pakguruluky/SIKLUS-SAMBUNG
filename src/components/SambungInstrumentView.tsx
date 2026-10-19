import React, { useState, useEffect, useMemo } from 'react';
import { 
  Supervision, 
  UserProfile, 
  School, 
  SambungData, 
  SambungMaknaiPertanyaanList,
  SambungUjiPraObservasi,
  SambungUjiObservasiPelaksanaan,
  SambungUjiPascaObservasi,
  SambungRtlNyatakanItem,
  SambungKesimpulanAlurSambung,
  SambungMatriksPerubahan,
  SambungBeforeAfterItem
} from '../types';
import { 
  createDefaultSambungForTeacher, 
  createEmptySambungData,
  DEFAULT_DATA_DAMPAK,
  DEFAULT_MATRIKS_BEFORE,
  DEFAULT_MATRIKS_AFTER,
  getTeacherDescriptiveDataDampak
} from '../data/sambungSeed';
import { getSupervisionSambungProgress, StageKey } from '../utils/sambungProgress';
import { saveSupervision } from '../services/firebase';
import { analyzeTelaahRppWithAI } from '../services/aiService';
import { SambungPrintModal } from './SambungPrintModal';
import { PerangkatAjarModal } from './forms/PerangkatAjarModal';
import { PraObservasiModal } from './forms/PraObservasiModal';
import { ObservasiKelasModal } from './forms/ObservasiKelasModal';
import { PascaObservasiModal } from './forms/PascaObservasiModal';
import { 
  CheckCircle2, 
  Search, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  User, 
  Users,
  School as SchoolIcon, 
  BookOpen, 
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Smile,
  Compass,
  Layers,
  ChevronRight,
  FolderGit2,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  Clock,
  Award,
  ShieldCheck,
  UploadCloud,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Target,
  Lock,
  Zap,
  CheckCheck,
  Eye,
  CheckSquare,
  Filter,
  Share2,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { 
  applyAutoFillToSupervision, 
  parseRppFileName, 
  getTeacherAutoFillData,
  generateAmatiData, 
  applyAmatiAutoFillToSupervision,
  generateTeacherMaknaiData,
  applyMaknaiAutoFillToSupervision,
  generateBerdayakanTelaahPerbaikanData,
  applyBerdayakanAutoFillToSupervision,
  generateUjiData,
  applyUjiAutoFillToSupervision,
  generateGerakkanData,
  applyGerakkanAutoFillToSupervision
} from '../data/autoFillData';
import { 
  MAKNAI_COACHING_QUESTIONS, 
  TELAAH_ITEMS, 
  OBSERVASI_ITEMS, 
  PRA_OBSERVASI_QUESTIONS,
  PASCA_OBSERVASI_QUESTIONS,
  KESIMPULAN_SELIDIKI_INDIKATOR
} from '../data/instrumentData';

interface SambungInstrumentViewProps {
  supervisions: Supervision[];
  currentUser: UserProfile;
  schools: School[];
  onUpdateSupervision: (updated: Supervision) => void;
  initialSupervisionId?: string;
}

type TabType = 'S' | 'A' | 'M' | 'B' | 'U' | 'N' | 'G';

export const SambungInstrumentView: React.FC<SambungInstrumentViewProps> = ({
  supervisions,
  currentUser,
  schools,
  onUpdateSupervision,
  initialSupervisionId,
}) => {
  const canEdit = currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas';

  // Filter supervisions according to role
  const availableSupervisions = useMemo(() => {
    if (currentUser.role === 'guru') {
      const match = supervisions.filter(
        (s) => s.teacherId === currentUser.uid ||
               s.teacherName.toLowerCase().trim() === currentUser.displayName?.toLowerCase().trim()
      );
      if (match.length > 0) return match;
      return supervisions.slice(0, 1);
    } else if (currentUser.role === 'kepsek') {
      const userSch = (currentUser.schoolName || '').toLowerCase().trim();
      return supervisions.filter(
        (s) => (currentUser.schoolId && s.schoolId === currentUser.schoolId) ||
               (userSch && (s.schoolName.toLowerCase().trim().includes(userSch) || userSch.includes(s.schoolName.toLowerCase().trim())))
      );
    }
    return supervisions;
  }, [supervisions, currentUser]);

  // Selected supervision
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      return initialSupervisionId;
    }
    return availableSupervisions[0]?.id || '';
  });

  // Current active SAMBUNG letter tab
  const [activeTab, setActiveTab] = useState<TabType>('S');
  const [sSubTab, setSSubTab] = useState<'telaah_rpp' | 'pra_observasi' | 'observasi_kelas' | 'kesimpulan_selidiki'>('telaah_rpp');
  const [uSubTab, setUSubTab] = useState<'pra_observasi' | 'observasi_25' | 'pasca_observasi' | 'kesimpulan_uji'>('pra_observasi');
  const [gSubTab, setGSubTab] = useState<'rtl_nyatakan' | 'benang_merah' | 'pengimbasan' | 'pengesahan'>('rtl_nyatakan');
  const [isAutoFillingUji, setIsAutoFillingUji] = useState(false);
  const [isAutoFillingGerakkan, setIsAutoFillingGerakkan] = useState(false);
  const [isAnalyzingTelaahAI, setIsAnalyzingTelaahAI] = useState(false);
  const [activeSupervisiModal, setActiveSupervisiModal] = useState<{
    stage: 'perangkat' | 'pra' | 'observasi' | 'pasca';
    mode: 'awal' | 'perbaikan';
  } | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [lockedWarning, setLockedWarning] = useState<string | null>(null);

  // Active supervision object
  const currentSupervision = useMemo(() => {
    const found = availableSupervisions.find((s) => s.id === selectedId);
    if (!found) return availableSupervisions[0] || null;
    return found;
  }, [availableSupervisions, selectedId]);

  // Local draft of SambungData for immediate responsiveness
  const [sambungDraft, setSambungDraft] = useState<SambungData | null>(null);

  // Real-time sequential stage progression info
  const sambungProgress = useMemo(() => {
    if (!currentSupervision) return null;
    const liveSupervision: Supervision = {
      ...currentSupervision,
      sambung: sambungDraft || currentSupervision.sambung,
    };
    return getSupervisionSambungProgress(liveSupervision);
  }, [currentSupervision, sambungDraft]);

  const handleTabClick = (targetTab: TabType) => {
    if (!sambungProgress) {
      setActiveTab(targetTab);
      return;
    }
    const check = sambungProgress.canProceedTo(targetTab as StageKey);
    if (!check.allowed) {
      setLockedWarning(check.lockedReason || 'Tahap ini masih terkunci.');
      return;
    }
    setLockedWarning(null);
    setActiveTab(targetTab);
  };

  useEffect(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      setSelectedId(initialSupervisionId);
    }
  }, [initialSupervisionId, availableSupervisions]);

  useEffect(() => {
    if (currentSupervision) {
      const isSeedSupervision = Boolean(currentSupervision.id && currentSupervision.id.startsWith('sup-demo-'));
      const isNew = Boolean((currentSupervision as any).isNewSupervision);

      if (currentSupervision.sambung) {
        const cloned: SambungData = JSON.parse(JSON.stringify(currentSupervision.sambung));

        // If it is a newly added / custom supervision, preserve its blank instruments exactly without injecting demo mock text
        if (isNew || !isSeedSupervision) {
          setSambungDraft(cloned);
          return;
        }

        // Filter out removed beforeAfter aspects
        if (cloned.nyatakan?.beforeAfter) {
          cloned.nyatakan.beforeAfter = cloned.nyatakan.beforeAfter.filter(
            item => item.aspek !== 'Asesmen dan umpan balik' && item.aspek !== 'Tindak lanjut supervisi'
          );
        }

        // Ensure selidiki.matriksBefore is initialized
        if (!cloned.selidiki.matriksBefore) {
          const peran = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('peran'))?.sebelumSambung;
          const aktivitas = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('aktivitas'))?.sebelumSambung;
          const konteks = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('konteks'))?.sebelumSambung;
          const refleksi = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('refleksi'))?.sebelumSambung;
          cloned.selidiki.matriksBefore = {
            peranGuru: peran || DEFAULT_MATRIKS_BEFORE.peranGuru,
            aktivitasMurid: aktivitas || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
            konteksNyata: konteks || DEFAULT_MATRIKS_BEFORE.konteksNyata,
            refleksiMurid: refleksi || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
          };
        }

        // Ensure uji.matriksAfter is initialized
        if (!cloned.uji.matriksAfter) {
          const peran = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('peran'))?.setelahSambung;
          const aktivitas = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('aktivitas'))?.setelahSambung;
          const konteks = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('konteks'))?.setelahSambung;
          const refleksi = cloned.nyatakan?.beforeAfter?.find(x => x.aspek.toLowerCase().includes('refleksi'))?.setelahSambung;
          cloned.uji.matriksAfter = {
            peranGuru: peran || DEFAULT_MATRIKS_AFTER.peranGuru,
            aktivitasMurid: aktivitas || DEFAULT_MATRIKS_AFTER.aktivitasMurid,
            konteksNyata: konteks || DEFAULT_MATRIKS_AFTER.konteksNyata,
            refleksiMurid: refleksi || DEFAULT_MATRIKS_AFTER.refleksiMurid,
          };
        }

        // Ensure nyatakan.beforeAfter has the standard 4 aspects with preserved text & buktiKode
        const curBeforeAfter = cloned.nyatakan?.beforeAfter || [];
        const defaultBukti = [
          'BKT-01 (Rekaman Video & Foto Praktik Kelas)',
          'BKT-02 (LKPD Kelompok & Hasil Kerja Murid)',
          'BKT-03 (Laporan Studi Kasus & Konteks Nyata)',
          'BKT-04 (Lembar Refleksi Diri & Exit Ticket)',
        ];
        const defaultAspects = [
          { key: 'peranGuru', label: 'Peran guru', bkt: defaultBukti[0] },
          { key: 'aktivitasMurid', label: 'Aktivitas murid', bkt: defaultBukti[1] },
          { key: 'konteksNyata', label: 'Konteks kehidupan nyata', bkt: defaultBukti[2] },
          { key: 'refleksiMurid', label: 'Refleksi murid', bkt: defaultBukti[3] },
        ];

        cloned.nyatakan = {
          ...cloned.nyatakan,
          beforeAfter: defaultAspects.map((asp) => {
            const existing = curBeforeAfter.find(x => x.aspek.toLowerCase().includes(asp.label.toLowerCase().slice(0, 5)));
            return {
              aspek: asp.label,
              sebelumSambung: existing?.sebelumSambung || (cloned.selidiki?.matriksBefore as any)?.[asp.key] || (DEFAULT_MATRIKS_BEFORE as any)[asp.key],
              setelahSambung: existing?.setelahSambung || (cloned.uji?.matriksAfter as any)?.[asp.key] || (DEFAULT_MATRIKS_AFTER as any)[asp.key],
              buktiKode: existing?.buktiKode || asp.bkt,
            };
          }),
        };

        // Ensure dataDampak has the 4 standard indicators with teacher-specific descriptive assessment data
        if (
          !cloned.nyatakan ||
          !cloned.nyatakan.dataDampak ||
          cloned.nyatakan.dataDampak.length === 0 ||
          !cloned.nyatakan.dataDampak.some(d => d.indikator.includes('Guru berorientasi'))
        ) {
          cloned.nyatakan = {
            ...cloned.nyatakan,
            dataDampak: getTeacherDescriptiveDataDampak(
              currentSupervision.teacherName,
              currentSupervision.subject,
              currentSupervision.schoolName,
              currentSupervision.lessonTitle,
              currentSupervision.perangkatAjar?.telaahSummary?.predicate,
              currentSupervision.observasiKelas?.predicate
            ),
          };
        } else {
          // If dataDampak exists but lacks deskripsiPenilaian, merge teacher-specific descriptive data
          const teacherSpecific = getTeacherDescriptiveDataDampak(
            currentSupervision.teacherName,
            currentSupervision.subject,
            currentSupervision.schoolName,
            currentSupervision.lessonTitle,
            currentSupervision.perangkatAjar?.telaahSummary?.predicate,
            currentSupervision.observasiKelas?.predicate
          );
          cloned.nyatakan = {
            ...cloned.nyatakan,
            dataDampak: cloned.nyatakan.dataDampak.map((item, idx) => {
              const match = teacherSpecific[idx] || teacherSpecific.find(t => t.indikator === item.indikator);
              return {
                ...item,
                deskripsiPenilaian: item.deskripsiPenilaian || match?.deskripsiPenilaian,
                buktiKegiatan: item.buktiKegiatan || match?.buktiKegiatan,
                selisih: item.selisih || match?.selisih,
              };
            }),
          };
        }
        setSambungDraft(cloned);
      } else {
        if (isNew || !isSeedSupervision) {
          const empty = createEmptySambungData(
            currentSupervision.teacherName,
            currentSupervision.schoolName,
            currentSupervision.subject
          );
          setSambungDraft(empty);
        } else {
          const defaultSambung = createDefaultSambungForTeacher(
            currentSupervision.teacherName,
            currentSupervision.schoolName,
            currentSupervision.subject
          );
          const maknaiInit = generateTeacherMaknaiData(currentSupervision);
          defaultSambung.maknai = {
            ...defaultSambung.maknai,
            ...maknaiInit,
          };
          setSambungDraft(defaultSambung);
        }
      }
    }
  }, [currentSupervision]);

  // Debounced auto-save for sambungDraft to Firebase Cloud so edits on any device persist automatically
  useEffect(() => {
    if (!canEdit || !currentSupervision || !sambungDraft) return;

    const draftJson = JSON.stringify(sambungDraft);
    const originalJson = JSON.stringify(currentSupervision.sambung);
    if (draftJson === originalJson) return;

    const timer = setTimeout(async () => {
      try {
        const updated: Supervision = {
          ...currentSupervision,
          sambung: sambungDraft,
          updatedAt: new Date().toISOString(),
        };
        await saveSupervision(updated);
        onUpdateSupervision(updated);
      } catch (err) {
        console.warn('Debounced cloud auto-save notice:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [sambungDraft, canEdit, currentSupervision?.id]);

  const [isAutoFillingSelidiki, setIsAutoFillingSelidiki] = useState(false);

  const handleAutoFillSelidiki = async (file?: File) => {
    if (!currentSupervision) return;
    setIsAutoFillingSelidiki(true);
    try {
      let rppLink: string | undefined = undefined;
      let detectedSubj: string | undefined = undefined;
      let detectedTeacher: string | undefined = undefined;

      if (file) {
        const cleanName = encodeURIComponent(file.name.replace(/\s+/g, '_'));
        rppLink = `https://drive.google.com/file/d/drive_${Date.now()}_${cleanName}/view?usp=sharing`;
        const parsed = parseRppFileName(file.name);
        detectedSubj = parsed.subject;
        detectedTeacher = parsed.teacherName;
      }

      const updated = applyAutoFillToSupervision(
        currentSupervision,
        rppLink,
        detectedSubj || currentSupervision.subject,
        detectedTeacher || currentSupervision.teacherName
      );

      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }

      await saveSupervision(updated);
      onUpdateSupervision(updated);

      setSaveToast(
        `Instrumen Selidiki (Telaah RPP 22 Aspek, Pra-Observasi, Observasi) berhasil diisi otomatis sesuai mapel ${updated.subject} & guru ${updated.teacherName}, dan terhubung ke Nilai Akhir Siklus SAMBUNG di Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling selidiki:', err);
      alert('Gagal mengisi otomatis instrumen selidiki.');
    } finally {
      setIsAutoFillingSelidiki(false);
    }
  };

  // --- Section Helpers for Selidiki Menus ---
  const calculateTelaahSummary = (scores: Record<number, number | 'NA'>) => {
    let total = 0;
    let count = 0;
    TELAAH_ITEMS.forEach((item) => {
      const scoreVal = scores[item.id];
      if (typeof scoreVal === 'number') {
        total += scoreVal;
        count++;
      }
    });
    const maxScore = count > 0 ? count * 2 : 44;
    const finalScore = maxScore > 0 ? Math.round((total / maxScore) * 1000) / 10 : 0;
    let predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
    if (finalScore >= 91) predicate = 'Sangat Baik';
    else if (finalScore >= 81) predicate = 'Baik';
    else if (finalScore >= 71) predicate = 'Cukup';
    return { totalScore: total, maxPossibleScore: maxScore, finalScore, predicate };
  };

  const handleUpdateTelaahScore = (itemId: number, score: number | 'NA') => {
    if (!canEdit || !currentSupervision) return;
    const nextScores = { ...(currentSupervision.perangkatAjar?.telaahScores || {}), [itemId]: score };
    const summary = calculateTelaahSummary(nextScores);
    const updated: Supervision = {
      ...currentSupervision,
      perangkatAjar: {
        ...currentSupervision.perangkatAjar,
        driveLinks: currentSupervision.perangkatAjar?.driveLinks || { cpTpAtpUrl: '', modulAjarUrl: '' },
        telaahScores: nextScores,
        telaahComments: currentSupervision.perangkatAjar?.telaahComments || {},
        feedback: currentSupervision.perangkatAjar?.feedback || { kelebihan: '', perbaikan: '', rekomendasi: '' },
        telaahSummary: summary,
        reviewedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleUpdateTelaahComment = (itemId: number, comment: string) => {
    if (!canEdit || !currentSupervision) return;
    const nextComments = { ...(currentSupervision.perangkatAjar?.telaahComments || {}), [itemId]: comment };
    const updated: Supervision = {
      ...currentSupervision,
      perangkatAjar: {
        ...currentSupervision.perangkatAjar,
        driveLinks: currentSupervision.perangkatAjar?.driveLinks || { cpTpAtpUrl: '', modulAjarUrl: '' },
        telaahScores: currentSupervision.perangkatAjar?.telaahScores || {},
        feedback: currentSupervision.perangkatAjar?.feedback || { kelebihan: '', perbaikan: '', rekomendasi: '' },
        telaahSummary: currentSupervision.perangkatAjar?.telaahSummary || calculateTelaahSummary(currentSupervision.perangkatAjar?.telaahScores || {}),
        telaahComments: nextComments,
        reviewedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleUpdateTelaahFeedback = (field: 'kelebihan' | 'perbaikan' | 'rekomendasi', value: string) => {
    if (!canEdit || !currentSupervision) return;
    const currentFb = currentSupervision.perangkatAjar?.feedback || { kelebihan: '', perbaikan: '', rekomendasi: '' };
    const updated: Supervision = {
      ...currentSupervision,
      perangkatAjar: {
        ...currentSupervision.perangkatAjar,
        driveLinks: currentSupervision.perangkatAjar?.driveLinks || { cpTpAtpUrl: '', modulAjarUrl: '' },
        telaahScores: currentSupervision.perangkatAjar?.telaahScores || {},
        telaahComments: currentSupervision.perangkatAjar?.telaahComments || {},
        telaahSummary: currentSupervision.perangkatAjar?.telaahSummary || calculateTelaahSummary(currentSupervision.perangkatAjar?.telaahScores || {}),
        feedback: {
          ...currentFb,
          [field]: value,
        },
        reviewedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleUpdateTelaahDriveUrl = (url: string) => {
    if (!canEdit || !currentSupervision) return;
    const currentLinks = currentSupervision.perangkatAjar?.driveLinks || { cpTpAtpUrl: '', modulAjarUrl: '' };
    const updated: Supervision = {
      ...currentSupervision,
      perangkatAjar: {
        ...currentSupervision.perangkatAjar,
        telaahScores: currentSupervision.perangkatAjar?.telaahScores || {},
        telaahComments: currentSupervision.perangkatAjar?.telaahComments || {},
        telaahSummary: currentSupervision.perangkatAjar?.telaahSummary || calculateTelaahSummary(currentSupervision.perangkatAjar?.telaahScores || {}),
        feedback: currentSupervision.perangkatAjar?.feedback || { kelebihan: '', perbaikan: '', rekomendasi: '' },
        driveLinks: {
          ...currentLinks,
          modulAjarUrl: url,
        },
        submittedAt: currentSupervision.perangkatAjar?.submittedAt || new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleSaveTelaahRppSection = async () => {
    if (!currentSupervision) return;
    try {
      setIsSaving(true);
      await saveSupervision(currentSupervision);
      setSaveToast('Telaah RPP (22 Indikator) berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan ke Firebase.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillTelaahOnly = async () => {
    if (!currentSupervision) return;
    const auto = getTeacherAutoFillData(currentSupervision.teacherName, currentSupervision.subject, currentSupervision.lessonTitle, currentSupervision.schoolName);
    const summary = calculateTelaahSummary(auto.telaahScores);
    const updated: Supervision = {
      ...currentSupervision,
      perangkatAjar: {
        ...currentSupervision.perangkatAjar,
        driveLinks: {
          cpTpAtpUrl: currentSupervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || 'https://drive.google.com/file/d/1CpTpAtp_Awal/view',
          modulAjarUrl: currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl || auto.rppUrl,
        },
        telaahScores: auto.telaahScores,
        telaahComments: auto.telaahComments,
        telaahSummary: summary,
        feedback: auto.telaahFeedback,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Kusnandar, M.Si',
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
    await saveSupervision(updated);
    setSaveToast('Telaah RPP (22 Indikator) berhasil diisi otomatis & tersimpan ke Firebase!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleAiAnalyzeTelaahRPP = async () => {
    if (!currentSupervision) return;
    setIsAnalyzingTelaahAI(true);
    try {
      const aiResult = await analyzeTelaahRppWithAI({
        teacherName: currentSupervision.teacherName,
        subject: currentSupervision.subject,
        lessonTitle: currentSupervision.lessonTitle,
        classGrade: currentSupervision.classGrade,
        schoolName: currentSupervision.schoolName,
        rppText: currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl || '',
        focusAspects: currentSupervision.perangkatAjar?.feedback?.rekomendasi || '',
      });

      const summary = calculateTelaahSummary(aiResult.scores);
      const auto = getTeacherAutoFillData(
        currentSupervision.teacherName,
        currentSupervision.subject,
        currentSupervision.lessonTitle,
        currentSupervision.schoolName
      );

      const updated: Supervision = {
        ...currentSupervision,
        perangkatAjar: {
          ...currentSupervision.perangkatAjar,
          driveLinks: {
            cpTpAtpUrl: currentSupervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || 'https://drive.google.com/file/d/1CpTpAtp_Awal/view',
            modulAjarUrl: currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl || auto.rppUrl,
          },
          telaahScores: aiResult.scores,
          telaahComments: aiResult.comments,
          telaahSummary: summary,
          feedback: aiResult.feedback,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Kusnandar, M.Si (Pengawas Pembina)',
        },
        updatedAt: new Date().toISOString(),
      };

      onUpdateSupervision(updated);
      await saveSupervision(updated);
      setSaveToast(
        `✨ Telaah RPP (22 Indikator) berhasil dianalisis dengan Kecerdasan AI (${aiResult.source === 'ai_gemini' ? 'Gemini 3.8 Flash' : 'Pedagogical AI Engine'}) & tersimpan permanen di Database Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error analyzing Telaah RPP with AI:', err);
      setSaveToast('Gagal memproses analisis AI. Silakan periksa koneksi atau isi manual.');
      setTimeout(() => setSaveToast(null), 4000);
    } finally {
      setIsAnalyzingTelaahAI(false);
    }
  };

  // Praobservasi helpers
  const handleUpdatePraQuestion = (field: string, value: string) => {
    if (!canEdit || !currentSupervision) return;
    const curPra = currentSupervision.praObservasi || {
      interviewDurationMinutes: 30,
      q1_kd_indikator: '',
      q2_metode: '',
      q3_alat_bahan: '',
      q4_tahapan: '',
      q5_persiapan: '',
      q6_materi_sulit: '',
      q7_target_kompetensi: '',
      q8_perhatian_khusus: '',
      supervisorNotes: '',
    };
    const updated: Supervision = {
      ...currentSupervision,
      praObservasi: {
        ...curPra,
        [field]: value,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleSavePraObservasiSection = async () => {
    if (!currentSupervision) return;
    try {
      setIsSaving(true);
      await saveSupervision(currentSupervision);
      setSaveToast('Praobservasi (8 Pertanyaan) berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan ke Firebase.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillPraOnly = async () => {
    if (!currentSupervision) return;
    const auto = getTeacherAutoFillData(currentSupervision.teacherName, currentSupervision.subject, currentSupervision.lessonTitle, currentSupervision.schoolName);
    const updated: Supervision = {
      ...currentSupervision,
      praObservasi: {
        interviewDurationMinutes: 35,
        ...auto.praObservasiAnswers,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
    await saveSupervision(updated);
    setSaveToast('Praobservasi (8 Pertanyaan) berhasil diisi otomatis & tersimpan ke Firebase!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Observasi Kelas helpers
  const calculateObservasiSummary = (items: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note: string }>) => {
    let totalYa = 0;
    let totalSkor = 0;
    OBSERVASI_ITEMS.forEach((item) => {
      const it = items[item.id];
      if (it) {
        if (it.status === 'Ya' || (typeof it.score === 'number' && it.score > 0)) {
          totalYa++;
        }
        if (typeof it.score === 'number') {
          totalSkor += it.score;
        } else if (it.status === 'Ya') {
          totalSkor += 2;
        }
      }
    });
    const totalAspek = 25;
    const maxScore = 50;
    const scorePct = Math.round((totalSkor / maxScore) * 1000) / 10;
    let predicate = 'Kurang';
    if (scorePct >= 91) predicate = 'Sangat Baik';
    else if (scorePct >= 81) predicate = 'Baik';
    else if (scorePct >= 71) predicate = 'Cukup';
    return { totalYa, totalAspek, totalSkor, score: scorePct, predicate };
  };

  const handleUpdateObservasiItem = (itemId: string, score: 0 | 1 | 2, note?: string) => {
    if (!canEdit || !currentSupervision) return;
    const curItems = currentSupervision.observasiKelas?.items || {};
    const existing = curItems[itemId] || { status: 'Tidak', score: 0, note: '' };
    const nextItems = {
      ...curItems,
      [itemId]: {
        ...existing,
        score,
        status: score > 0 ? ('Ya' as const) : ('Tidak' as const),
        note: note !== undefined ? note : existing.note,
      },
    };
    const sum = calculateObservasiSummary(nextItems);
    const updated: Supervision = {
      ...currentSupervision,
      observasiKelas: {
        ...currentSupervision.observasiKelas,
        items: nextItems,
        totalYa: sum.totalYa,
        totalAspek: sum.totalAspek,
        totalSkor: sum.totalSkor,
        score: sum.score,
        predicate: sum.predicate,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleUpdateObservasiFeedback = (field: 'kelebihan' | 'peningkatan' | 'rekomendasi', val: string) => {
    if (!canEdit || !currentSupervision) return;
    const curFb = currentSupervision.observasiKelas?.feedback || { kelebihan: '', peningkatan: '', rekomendasi: '' };
    const updatedFb = { ...curFb, [field]: val };
    const feedbackNotes = `${updatedFb.kelebihan}\n\nHal yang perlu diperbaiki: ${updatedFb.peningkatan}\n\nRekomendasi: ${updatedFb.rekomendasi}`;
    const updated: Supervision = {
      ...currentSupervision,
      observasiKelas: {
        ...currentSupervision.observasiKelas,
        feedback: updatedFb,
        feedbackNotes,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
  };

  const handleSaveObservasiSection = async () => {
    if (!currentSupervision) return;
    try {
      setIsSaving(true);
      await saveSupervision(currentSupervision);
      setSaveToast('Observasi Kelas (25 Indikator) berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan ke Firebase.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillObservasiOnly = async () => {
    if (!currentSupervision) return;
    const auto = getTeacherAutoFillData(currentSupervision.teacherName, currentSupervision.subject, currentSupervision.lessonTitle, currentSupervision.schoolName);
    const obsItems: Record<string, { status?: 'Ya' | 'Tidak'; score?: number; note: string }> = {};
    Object.entries(auto.observasiScores).forEach(([k, v]) => {
      obsItems[k] = { status: v.score > 0 ? 'Ya' : 'Tidak', score: v.score, note: v.note };
    });
    const sum = calculateObservasiSummary(obsItems);
    const feedbackNotes = `${auto.observasiFeedback.kelebihan}\n\nHal yang perlu diperbaiki: ${auto.observasiFeedback.peningkatan}\n\nRekomendasi: ${auto.observasiFeedback.rekomendasi}`;
    const updated: Supervision = {
      ...currentSupervision,
      observasiKelas: {
        items: obsItems,
        totalYa: sum.totalYa,
        totalAspek: sum.totalAspek,
        totalSkor: sum.totalSkor,
        score: sum.score,
        predicate: sum.predicate,
        feedback: auto.observasiFeedback,
        feedbackNotes,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    onUpdateSupervision(updated);
    await saveSupervision(updated);
    setSaveToast('Observasi Kelas (25 Indikator) berhasil diisi otomatis & tersimpan ke Firebase!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // --- Kesimpulan Selidiki Helpers (4 Indikator Kunci) ---
  const handleUpdateKesimpulanIndikator = (
    field: 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid',
    value: string
  ) => {
    if (!canEdit || !currentSupervision || !sambungDraft) return;

    const curMatriks = sambungDraft.selidiki?.matriksBefore || DEFAULT_MATRIKS_BEFORE;
    const nextMatriks: SambungMatriksPerubahan = {
      ...curMatriks,
      [field]: value,
    };

    const updatedSelidiki = {
      ...sambungDraft.selidiki,
      matriksBefore: nextMatriks,
    };

    // Synchronize to Nyatakan beforeAfter so it immediately reflects across elements
    const curBeforeAfter = sambungDraft.nyatakan?.beforeAfter || [];
    const nextBeforeAfter = curBeforeAfter.map(item => {
      if (field === 'peranGuru' && item.aspek.toLowerCase().includes('peran')) {
        return { ...item, sebelumSambung: value };
      }
      if (field === 'aktivitasMurid' && item.aspek.toLowerCase().includes('aktivitas')) {
        return { ...item, sebelumSambung: value };
      }
      if (field === 'konteksNyata' && item.aspek.toLowerCase().includes('konteks')) {
        return { ...item, sebelumSambung: value };
      }
      if (field === 'refleksiMurid' && item.aspek.toLowerCase().includes('refleksi')) {
        return { ...item, sebelumSambung: value };
      }
      return item;
    });

    const updatedDraft: SambungData = {
      ...sambungDraft,
      selidiki: updatedSelidiki,
      nyatakan: {
        ...sambungDraft.nyatakan,
        beforeAfter: nextBeforeAfter,
      },
    };

    setSambungDraft(updatedDraft);
  };

  const handleSaveKesimpulanSelidiki = async () => {
    if (!currentSupervision || !sambungDraft) return;
    try {
      setIsSaving(true);
      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: sambungDraft,
        updatedAt: new Date().toISOString(),
      };
      await saveSupervision(updatedSupervision);
      onUpdateSupervision(updatedSupervision);
      setSaveToast('Kesimpulan Selidiki (4 Indikator) berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan ke Firebase.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillKesimpulanSelidiki = async () => {
    if (!currentSupervision || !sambungDraft) return;
    try {
      setIsSaving(true);
      const auto = getTeacherAutoFillData(
        currentSupervision.teacherName,
        currentSupervision.subject,
        currentSupervision.lessonTitle,
        currentSupervision.schoolName
      );

      const newMatriksBefore: SambungMatriksPerubahan = {
        peranGuru: auto.kesimpulanSelidiki.guruBerorientasi,
        aktivitasMurid: auto.kesimpulanSelidiki.muridAktif,
        konteksNyata: auto.kesimpulanSelidiki.konteksNyata,
        refleksiMurid: auto.kesimpulanSelidiki.refleksiMurid,
      };

      const updatedSelidiki = {
        ...sambungDraft.selidiki,
        matriksBefore: newMatriksBefore,
      };

      const autoUji = generateUjiData(currentSupervision);
      const afterPeran = sambungDraft.uji?.matriksAfter?.peranGuru || autoUji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru;
      const afterAktif = sambungDraft.uji?.matriksAfter?.aktivitasMurid || autoUji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid;
      const afterKonteks = sambungDraft.uji?.matriksAfter?.konteksNyata || autoUji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata;
      const afterRefleksi = sambungDraft.uji?.matriksAfter?.refleksiMurid || autoUji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid;

      const updatedBeforeAfter: SambungBeforeAfterItem[] = [
        {
          aspek: 'Peran Guru (Guru berorientasi pada pengalaman belajar murid)',
          sebelumSambung: newMatriksBefore.peranGuru,
          setelahSambung: afterPeran,
          buktiKode: 'S1-U1',
        },
        {
          aspek: 'Aktivitas Murid (Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan)',
          sebelumSambung: newMatriksBefore.aktivitasMurid,
          setelahSambung: afterAktif,
          buktiKode: 'S2-U2',
        },
        {
          aspek: 'Konteks Nyata (Pembelajaran terhubung dengan konteks nyata)',
          sebelumSambung: newMatriksBefore.konteksNyata,
          setelahSambung: afterKonteks,
          buktiKode: 'S3-U3',
        },
        {
          aspek: 'Refleksi Murid (Pembelajaran membiasakan murid melakukan refleksi)',
          sebelumSambung: newMatriksBefore.refleksiMurid,
          setelahSambung: afterRefleksi,
          buktiKode: 'S4-U4',
        },
      ];

      const updatedDraft: SambungData = {
        ...sambungDraft,
        selidiki: updatedSelidiki,
        nyatakan: {
          ...sambungDraft.nyatakan,
          beforeAfter: updatedBeforeAfter,
        },
        lastUpdated: new Date().toISOString(),
      };

      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: updatedDraft,
        updatedAt: new Date().toISOString(),
      };

      setSambungDraft(updatedDraft);
      onUpdateSupervision(updatedSupervision);
      await saveSupervision(updatedSupervision);
      setSaveToast('Kesimpulan Selidiki (4 Indikator) berhasil disintesis otomatis & tersimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyinkronkan data.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Kesimpulan Uji Helpers (4 Indikator Kunci Pasca Intervensi) ---
  const handleUpdateKesimpulanUjiIndikator = (
    field: 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid',
    value: string
  ) => {
    if (!canEdit || !currentSupervision || !sambungDraft) return;

    const curMatriks = sambungDraft.uji?.matriksAfter || DEFAULT_MATRIKS_AFTER;
    const nextMatriks: SambungMatriksPerubahan = {
      ...curMatriks,
      [field]: value,
    };

    const updatedUji = {
      ...sambungDraft.uji,
      matriksAfter: nextMatriks,
    };

    // Synchronize to Nyatakan beforeAfter (setelahSambung column) so it immediately reflects across elements
    const curBeforeAfter = sambungDraft.nyatakan?.beforeAfter || [];
    const nextBeforeAfter = curBeforeAfter.map(item => {
      if (field === 'peranGuru' && item.aspek.toLowerCase().includes('peran')) {
        return { ...item, setelahSambung: value };
      }
      if (field === 'aktivitasMurid' && item.aspek.toLowerCase().includes('aktivitas')) {
        return { ...item, setelahSambung: value };
      }
      if (field === 'konteksNyata' && item.aspek.toLowerCase().includes('konteks')) {
        return { ...item, setelahSambung: value };
      }
      if (field === 'refleksiMurid' && item.aspek.toLowerCase().includes('refleksi')) {
        return { ...item, setelahSambung: value };
      }
      return item;
    });

    const updatedDraft: SambungData = {
      ...sambungDraft,
      uji: updatedUji,
      nyatakan: {
        ...sambungDraft.nyatakan,
        beforeAfter: nextBeforeAfter,
      },
    };

    setSambungDraft(updatedDraft);
  };

  const handleSaveKesimpulanUji = async () => {
    if (!currentSupervision || !sambungDraft) return;
    try {
      setIsSaving(true);
      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: sambungDraft,
        updatedAt: new Date().toISOString(),
      };
      await saveSupervision(updatedSupervision);
      onUpdateSupervision(updatedSupervision);
      setSaveToast('Kesimpulan Uji (4 Indikator) berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan ke Firebase.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFillKesimpulanUji = async () => {
    if (!currentSupervision || !sambungDraft) return;
    try {
      setIsSaving(true);
      const autoUji = generateUjiData(currentSupervision);
      const newMatriksAfter: SambungMatriksPerubahan = {
        peranGuru: autoUji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru,
        aktivitasMurid: autoUji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid,
        konteksNyata: autoUji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata,
        refleksiMurid: autoUji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid,
      };

      const updatedUji = {
        ...sambungDraft.uji,
        matriksAfter: newMatriksAfter,
      };

      // Keep Nyatakan Before-After synchronized
      const curBeforeAfter = sambungDraft.nyatakan?.beforeAfter || [];
      const nextBeforeAfter = curBeforeAfter.map(item => {
        if (item.aspek.toLowerCase().includes('peran')) {
          return { ...item, setelahSambung: newMatriksAfter.peranGuru };
        }
        if (item.aspek.toLowerCase().includes('aktivitas')) {
          return { ...item, setelahSambung: newMatriksAfter.aktivitasMurid };
        }
        if (item.aspek.toLowerCase().includes('konteks')) {
          return { ...item, setelahSambung: newMatriksAfter.konteksNyata };
        }
        if (item.aspek.toLowerCase().includes('refleksi')) {
          return { ...item, setelahSambung: newMatriksAfter.refleksiMurid };
        }
        return item;
      });

      const updatedDraft: SambungData = {
        ...sambungDraft,
        uji: updatedUji,
        nyatakan: {
          ...sambungDraft.nyatakan,
          beforeAfter: nextBeforeAfter,
        },
        lastUpdated: new Date().toISOString(),
      };

      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: updatedDraft,
        updatedAt: new Date().toISOString(),
      };

      setSambungDraft(updatedDraft);
      onUpdateSupervision(updatedSupervision);
      await saveSupervision(updatedSupervision);
      setSaveToast('Kesimpulan Uji berhasil disintesis dari Telaah RPP Berdayakan & Observasi Uji, serta tersimpan ke Firebase!');
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyinkronkan data.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const [isAutoFillingAmati, setIsAutoFillingAmati] = useState(false);

  const handleAutoFillAmati = async (chosenKeys?: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid')[]) => {
    if (!currentSupervision) return;
    setIsAutoFillingAmati(true);
    try {
      const keysToUse = chosenKeys || sambungDraft?.arahkan?.fokusIndikatorTerpilih || ['peranGuru', 'aktivitasMurid'];
      const updated = applyAmatiAutoFillToSupervision(currentSupervision, keysToUse);

      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }

      await saveSupervision(updated);
      onUpdateSupervision(updated);

      setSaveToast(
        `Tahap A (AMATI): Fokus perbaikan dari 4 indikator Kesimpulan Selidiki berhasil diperiksa dan diisikan otomatis berkesinambungan dengan instrumen sebelumnya di Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling amati:', err);
      alert('Gagal mengisi otomatis fokus perbaikan Tahap Amati.');
    } finally {
      setIsAutoFillingAmati(false);
    }
  };

  const handleToggleIndikatorAmati = (key: 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid') => {
    if (!currentSupervision || !sambungDraft) return;
    const currentKeys = (
      sambungDraft.arahkan?.fokusIndikatorTerpilih && sambungDraft.arahkan.fokusIndikatorTerpilih.length > 0
        ? [...sambungDraft.arahkan.fokusIndikatorTerpilih]
        : ['peranGuru', 'aktivitasMurid']
    ) as ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid')[];

    let newKeys: ('peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid')[];
    if (currentKeys.includes(key)) {
      if (currentKeys.length <= 1) {
        newKeys = currentKeys;
      } else {
        newKeys = currentKeys.filter(k => k !== key);
      }
    } else {
      newKeys = [...currentKeys, key];
    }

    const generated = generateAmatiData(currentSupervision, newKeys, sambungDraft.selidiki?.matriksBefore);
    setSambungDraft({
      ...sambungDraft,
      arahkan: {
        ...sambungDraft.arahkan,
        fokusIndikatorTerpilih: newKeys,
        analisisKesimpulanSelidiki: generated.analisisKesimpulanSelidiki,
        targetPerbaikan: generated.targetPerbaikan,
        alasanFokusPerbaikan: generated.alasanFokusPerbaikan,
        fokusPerubahan: generated.fokusPerubahan,
        kegiatan: generated.kegiatan,
      },
    });
  };

  const [isAutoFillingMaknai, setIsAutoFillingMaknai] = useState(false);
  const [isAutoFillingBerdayakan, setIsAutoFillingBerdayakan] = useState(false);

  const handleAutoFillMaknai = async () => {
    if (!currentSupervision) return;
    setIsAutoFillingMaknai(true);
    try {
      const updated = applyMaknaiAutoFillToSupervision(currentSupervision);
      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }
      await saveSupervision(updated);
      onUpdateSupervision(updated);
      setSaveToast(
        `Tahap M (MAKNAI): 10 Pertanyaan Coaching & Refleksi Pasca Observasi berhasil disinkronkan otomatis sesuai hasil observasi dan kesimpulan akhir di Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling maknai:', err);
      alert('Gagal menyinkronkan instrumen Maknai.');
    } finally {
      setIsAutoFillingMaknai(false);
    }
  };

  const handleAutoFillBerdayakan = async (customUrl?: string, customTitle?: string) => {
    if (!currentSupervision) return;
    setIsAutoFillingBerdayakan(true);
    try {
      const updated = applyBerdayakanAutoFillToSupervision(currentSupervision, customUrl, customTitle);
      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }
      await saveSupervision(updated);
      onUpdateSupervision(updated);
      setSaveToast(
        `Tahap B (BERDAYAKAN): Telaah RPP Perbaikan 22 Aspek berhasil dianalisis otomatis dan tersimpan permanen ke Database Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling berdayakan:', err);
      alert('Gagal menyinkronkan instrumen Berdayakan.');
    } finally {
      setIsAutoFillingBerdayakan(false);
    }
  };

  const handleAutoFillUji = async () => {
    if (!currentSupervision) return;
    setIsAutoFillingUji(true);
    try {
      const updated = applyUjiAutoFillToSupervision(currentSupervision);
      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }
      await saveSupervision(updated);
      onUpdateSupervision(updated);
      setSaveToast(
        `Tahap U (UJI): Instrumen Wawancara Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi, dan 4 Indikator Transformasi berhasil disinkronkan otomatis sesuai hasil kesimpulan dan tersimpan di Database Firebase!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling uji:', err);
      alert('Gagal menyinkronkan instrumen Uji.');
    } finally {
      setIsAutoFillingUji(false);
    }
  };

  const handleAutoFillGerakkan = async () => {
    if (!currentSupervision) return;
    setIsAutoFillingGerakkan(true);
    try {
      const updated = applyGerakkanAutoFillToSupervision(currentSupervision);
      if (updated.sambung) {
        setSambungDraft(updated.sambung);
      }
      await saveSupervision(updated);
      onUpdateSupervision(updated);
      setSaveToast(
        `Tahap G (GERAKKAN): Rencana Tindak Lanjut dari Hasil Nyatakan & Kesimpulan, Matriks Alur SAMBUNG (S->G), dan Pengimbasan Praktik Baik berhasil disinkronkan otomatis dan tersimpan di Database!`
      );
      setTimeout(() => setSaveToast(null), 5000);
    } catch (err) {
      console.error('Error auto-filling gerakkan:', err);
      alert('Gagal menyinkronkan instrumen Gerakkan.');
    } finally {
      setIsAutoFillingGerakkan(false);
    }
  };

  if (!currentSupervision || !sambungDraft) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Compass className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Supervisi Guru</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {currentUser.role === 'guru'
            ? 'Anda belum memiliki instrumen supervisi aktif. Hubungi pengawas pembina Kusnandar, M.Si atau kepala sekolah untuk memulai.'
            : 'Belum ada guru yang terdaftar dalam daftar supervisi. Mulai supervisi baru untuk mengaktifkan siklus SAMBUNG.'}
        </p>
      </div>
    );
  }

  // Save handler
  const handleSave = async () => {
    if (!canEdit) {
      setSaveToast('Peran Anda (Guru) hanya dapat melihat hasil supervisi ini tanpa mengubahnya.');
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }
    if (!currentSupervision || !sambungDraft) return;
    setIsSaving(true);

    try {
      // Pastikan data Maknai (10 pertanyaan) dan Amati terisi lengkap sebelum dikirim ke Firebase
      const maknaiAuto = generateTeacherMaknaiData(currentSupervision);
      const ensuredMaknai = {
        ...sambungDraft.maknai,
        tanggal: sambungDraft.maknai?.tanggal || new Date().toISOString().split('T')[0],
        pertanyaanList: {
          ...maknaiAuto.pertanyaanList,
          ...(sambungDraft.maknai?.pertanyaanList || {}),
        },
        kesanUmum: sambungDraft.maknai?.kesanUmum ?? maknaiAuto.kesanUmum,
        saranMasukan: sambungDraft.maknai?.saranMasukan ?? maknaiAuto.saranMasukan,
        coaching: {
          tujuan: sambungDraft.maknai?.coaching?.tujuan || maknaiAuto.coaching?.tujuan || '',
          realitas: sambungDraft.maknai?.coaching?.realitas || maknaiAuto.coaching?.realitas || '',
          opsi: sambungDraft.maknai?.coaching?.opsi || maknaiAuto.coaching?.opsi || '',
          komitmen: sambungDraft.maknai?.coaching?.komitmen || maknaiAuto.coaching?.komitmen || '',
        },
      };

      const ensuredArahkan = {
        ...sambungDraft.arahkan,
        fokusIndikatorTerpilih: sambungDraft.arahkan?.fokusIndikatorTerpilih && sambungDraft.arahkan.fokusIndikatorTerpilih.length > 0
          ? sambungDraft.arahkan.fokusIndikatorTerpilih
          : ['peranGuru', 'aktivitasMurid'],
      };

      const autoBerdayakan = generateBerdayakanTelaahPerbaikanData(currentSupervision);
      const ensuredBerdayakan = {
        ...autoBerdayakan,
        ...sambungDraft.berdayakan,
        rppPerbaikanUrl: sambungDraft.berdayakan?.rppPerbaikanUrl || autoBerdayakan.rppPerbaikanUrl,
        rppPerbaikanTitle: sambungDraft.berdayakan?.rppPerbaikanTitle || autoBerdayakan.rppPerbaikanTitle,
        tanggalTelaah: sambungDraft.berdayakan?.tanggalTelaah || autoBerdayakan.tanggalTelaah,
        namaPenelaah: sambungDraft.berdayakan?.namaPenelaah || autoBerdayakan.namaPenelaah,
        telaahScores: sambungDraft.berdayakan?.telaahScores || autoBerdayakan.telaahScores,
        telaahComments: {
          ...autoBerdayakan.telaahComments,
          ...(sambungDraft.berdayakan?.telaahComments || {}),
        },
        telaahSummary: sambungDraft.berdayakan?.telaahSummary || autoBerdayakan.telaahSummary,
        feedback: {
          kelebihan: sambungDraft.berdayakan?.feedback?.kelebihan || autoBerdayakan.feedback?.kelebihan || '',
          perbaikan: sambungDraft.berdayakan?.feedback?.perbaikan || autoBerdayakan.feedback?.perbaikan || '',
          rekomendasi: sambungDraft.berdayakan?.feedback?.rekomendasi || autoBerdayakan.feedback?.rekomendasi || '',
        },
        siklusList: (sambungDraft.berdayakan?.siklusList && sambungDraft.berdayakan.siklusList.length > 0)
          ? sambungDraft.berdayakan.siklusList
          : autoBerdayakan.siklusList,
      };

      const autoUji = generateUjiData(currentSupervision);
      const ensuredUji = {
        ...autoUji,
        ...sambungDraft.uji,
        praObservasi: sambungDraft.uji?.praObservasi || autoUji.praObservasi,
        observasiPelaksanaan: sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan,
        pascaObservasi: sambungDraft.uji?.pascaObservasi || autoUji.pascaObservasi,
        kesimpulanUji: sambungDraft.uji?.kesimpulanUji || autoUji.kesimpulanUji,
        matriksAfter: sambungDraft.uji?.matriksAfter || autoUji.matriksAfter,
      };

      const updatedDraft: SambungData = {
        ...sambungDraft,
        arahkan: ensuredArahkan,
        maknai: ensuredMaknai,
        berdayakan: ensuredBerdayakan,
        uji: ensuredUji,
        lastUpdated: new Date().toISOString(),
      };

      const updatedSupervision: Supervision = {
        ...currentSupervision,
        sambung: updatedDraft,
        perangkatAjarPerbaikan: {
          driveLinks: {
            cpTpAtpUrl: currentSupervision.perangkatAjarPerbaikan?.driveLinks?.cpTpAtpUrl || currentSupervision.perangkatAjar?.driveLinks?.cpTpAtpUrl || 'https://drive.google.com/file/d/1CpTpAtp_Revisi/view',
            modulAjarUrl: ensuredBerdayakan.rppPerbaikanUrl,
            bahanAjarUrl: currentSupervision.perangkatAjarPerbaikan?.driveLinks?.bahanAjarUrl || currentSupervision.perangkatAjar?.driveLinks?.bahanAjarUrl,
            asesmenUrl: currentSupervision.perangkatAjarPerbaikan?.driveLinks?.asesmenUrl || currentSupervision.perangkatAjar?.driveLinks?.asesmenUrl,
          },
          submittedAt: currentSupervision.perangkatAjarPerbaikan?.submittedAt || new Date().toISOString(),
          telaahScores: ensuredBerdayakan.telaahScores,
          telaahComments: ensuredBerdayakan.telaahComments,
          telaahSummary: ensuredBerdayakan.telaahSummary,
          feedback: ensuredBerdayakan.feedback,
          catatanRevisiGuru: ensuredBerdayakan.catatanRefleksiGuru,
          reviewedAt: new Date().toISOString(),
          reviewedBy: ensuredBerdayakan.namaPenelaah,
        },
        praObservasiPerbaikan: ensuredUji.praObservasi ? {
          q1_kd_indikator: ensuredUji.praObservasi.q1,
          q2_metode: ensuredUji.praObservasi.q2,
          q3_alat_bahan: ensuredUji.praObservasi.q3,
          q4_tahapan: ensuredUji.praObservasi.q4,
          q5_persiapan: ensuredUji.praObservasi.q5,
          q6_materi_sulit: ensuredUji.praObservasi.q6,
          q7_target_kompetensi: ensuredUji.praObservasi.q7,
          q8_perhatian_khusus: ensuredUji.praObservasi.q8,
          supervisorNotes: ensuredUji.praObservasi.supervisorNotes || '',
          interviewDurationMinutes: 35,
        } : currentSupervision.praObservasiPerbaikan,
        observasiKelasPerbaikan: ensuredUji.observasiPelaksanaan ? {
          items: ensuredUji.observasiPelaksanaan.items,
          totalYa: 25,
          totalAspek: 25,
          totalSkor: ensuredUji.observasiPelaksanaan.totalSkor,
          score: ensuredUji.observasiPelaksanaan.persentaseCapaian,
          predicate: ensuredUji.observasiPelaksanaan.predicate,
          feedbackNotes: `${ensuredUji.observasiPelaksanaan.feedback.kelebihan}\n\nHal yang perlu diperbaiki: ${ensuredUji.observasiPelaksanaan.feedback.perbaikan}\n\nRekomendasi: ${ensuredUji.observasiPelaksanaan.feedback.rekomendasi}`,
          feedback: ensuredUji.observasiPelaksanaan.feedback,
          completedAt: ensuredUji.observasiPelaksanaan.completedAt || new Date().toISOString(),
        } : currentSupervision.observasiKelasPerbaikan,
        pascaObservasiPerbaikan: ensuredUji.pascaObservasi ? {
          q1_kesan: ensuredUji.pascaObservasi.pertanyaanList.q1,
          q2_sesuai_rencana: ensuredUji.pascaObservasi.pertanyaanList.q2,
          q3_hal_memuaskan: ensuredUji.pascaObservasi.pertanyaanList.q3,
          q4_hal_kurang: ensuredUji.pascaObservasi.pertanyaanList.q4,
          q5_ketercapaian_tujuan: ensuredUji.pascaObservasi.pertanyaanList.q5,
          q6_kesulitan_siswa: ensuredUji.pascaObservasi.pertanyaanList.q6,
          q7_alternatif_solusi: ensuredUji.pascaObservasi.pertanyaanList.q7,
          q8_rencana_tindak_lanjut: ensuredUji.pascaObservasi.pertanyaanList.q8,
          q9_pengembangan_diri: ensuredUji.pascaObservasi.pertanyaanList.q9,
          generalImpression: ensuredUji.pascaObservasi.kesanUmum,
          recommendations: ensuredUji.pascaObservasi.saranMasukan,
          completedAt: ensuredUji.pascaObservasi.completedAt || new Date().toISOString(),
        } : currentSupervision.pascaObservasiPerbaikan,
        updatedAt: new Date().toISOString(),
      };

      await saveSupervision(updatedSupervision);
      onUpdateSupervision(updatedSupervision);
      setSambungDraft(updatedDraft);
      setSaveToast(`Instrumen SAMBUNG (Amati, Maknai, Berdayakan, & Uji) untuk ${currentSupervision.teacherName} berhasil disimpan ke Database Firebase!`);
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      console.error(err);
      setSaveToast('Gagal menyimpan data.');
      setTimeout(() => setSaveToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Tab definitions
  const TABS_CONFIG: { key: TabType; letter: string; name: string; title: string; subtitle: string; color: string }[] = [
    {
      key: 'S',
      letter: 'S',
      name: 'SELIDIKI',
      title: 'S — Penyelidikan Kondisi Awal & Supervisi Akademik',
      subtitle: 'SELIDIKI — 1. Telaah RPP (22 Indikator), 2. Praobservasi (8 Pertanyaan), 3. Observasi Kelas (25 Indikator), 4. Kesimpulan SELIDIKI',
      color: 'bg-indigo-600',
    },
    {
      key: 'A',
      letter: 'A',
      name: 'AMATI',
      title: 'A — Memilih Fokus Perbaikan Pembelajaran',
      subtitle: 'AMATI — Memilih fokus perbaikan dari empat indikator di Kesimpulan Selidiki',
      color: 'bg-blue-600',
    },
    {
      key: 'M',
      letter: 'M',
      name: 'MAKNAI',
      title: 'M — Coaching dan Refleksi Pasca Observasi',
      subtitle: 'MAKNAI — Coaching dan Refleksi Guru, JAWABAN terisikan otomatis dari hasil observasi',
      color: 'bg-emerald-600',
    },
    {
      key: 'B',
      letter: 'B',
      name: 'BERDAYAKAN',
      title: 'B — Lembar Rancang – Coba – Refleksi – Perbaiki',
      subtitle: 'BERDAYAKAN — diisi guru; mencakup memahami, mengaplikasikan, merefleksikan, menghubungkan',
      color: 'bg-amber-600',
    },
    {
      key: 'U',
      letter: 'U',
      name: 'UJI',
      title: 'U — UJI: Observasi Kelas & Supervisi Perbaikan',
      subtitle: 'Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi, & Kesimpulan Hasil Uji',
      color: 'bg-purple-600',
    },
    {
      key: 'N',
      letter: 'N',
      name: 'NYATAKAN',
      title: 'N — Before–After dan Data Dampak',
      subtitle: 'NYATAKAN — setiap perubahan harus disertai bukti nyata',
      color: 'bg-rose-600',
    },
    {
      key: 'G',
      letter: 'G',
      name: 'GERAKKAN',
      title: 'G — GERAKKAN: Rencana Tindak Lanjut dari Hasil Nyatakan',
      subtitle: 'GERAKKAN — Buatkan Rencana Tindak Lanjut dari hasil Nyatakan & Kesimpulan Transformasi',
      color: 'bg-cyan-600',
    },
  ];

  const renderStageGateFooter = (currentStageKey: StageKey, nextStageKey?: StageKey, onCustomSave?: () => void) => {
    if (!sambungProgress) return null;
    const currentDetail = sambungProgress.stages[currentStageKey];
    const nextDetail = nextStageKey ? sambungProgress.stages[nextStageKey] : null;

    return (
      <div className="mt-8 p-4 sm:p-5 rounded-2xl border-2 transition-all shadow-xs bg-slate-50/80 border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                currentDetail.isComplete 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {currentDetail.isComplete ? 'Tahap Ini Lengkap' : 'Progres Belum Lengkap'}
              </span>
              <span className="text-xs font-bold text-slate-700">
                Tahap {currentDetail.letter} &bull; {currentDetail.name} ({currentDetail.progressPercent}% terisi)
              </span>
            </div>

            {!currentDetail.isComplete && currentDetail.missingReasons.length > 0 && (
              <p className="text-xs text-rose-700 font-medium mt-1 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>Syarat Lanjut ke Tahap Berikutnya: {currentDetail.missingReasons[0]}</span>
              </p>
            )}

            {currentDetail.isComplete && nextDetail && (
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Seluruh instrumen Tahap {currentDetail.letter} telah lengkap. Anda dapat lanjut ke Tahap {nextDetail.letter} ({nextDetail.name}).</span>
              </p>
            )}

            {currentDetail.isComplete && !nextDetail && (
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Seluruh siklus SAMBUNG (7 tahap) telah selesai dan tersimpan di database.</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {canEdit && (
              <button
                type="button"
                onClick={onCustomSave || handleSave}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Tahap Ini'}</span>
              </button>
            )}

            {nextStageKey && nextDetail && (
              <button
                type="button"
                onClick={() => handleTabClick(nextStageKey)}
                disabled={!currentDetail.isComplete}
                title={
                  currentDetail.isComplete
                    ? `Lanjutkan ke Tahap ${nextDetail.letter} (${nextDetail.name})`
                    : `Lengkapi Tahap ${currentDetail.letter} terlebih dahulu untuk membuka Tahap ${nextDetail.letter}`
                }
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-xs ${
                  currentDetail.isComplete
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {!currentDetail.isComplete && <Lock className="w-3.5 h-3.5" />}
                <span>Lanjut ke Tahap {nextDetail.letter} ({nextDetail.name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <span className="text-9xl font-black tracking-tighter">SAMBUNG</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Informasi Pengawasan, Pendampingan, dan Evaluasi Guru SMA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instrumen Siklus Strategi SAMBUNG
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-3xl leading-relaxed">
              Supervisi berkesinambungan oleh <strong>Kusnandar, M.Si</strong> berbasis 7 tahapan:{' '}
              <span className="font-semibold text-white">S</span>elidiki &bull;{' '}
              <span className="font-semibold text-white">A</span>rahkan &bull;{' '}
              <span className="font-semibold text-white">M</span>aknai &bull;{' '}
              <span className="font-semibold text-white">B</span>erdayakan &bull;{' '}
              <span className="font-semibold text-white">U</span>ji &bull;{' '}
              <span className="font-semibold text-white">N</span>yatakan &bull;{' '}
              <span className="font-semibold text-white">G</span>erakkan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            {currentUser.role === 'guru' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'awal' })}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Perangkat Ajar &amp; Telaah (Sebelum)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'perbaikan' })}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Perangkat Ajar &amp; Telaah (Sesudah)</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>Cetak Portofolio Guru Ini</span>
            </button>

            {canEdit ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-400/20 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 text-white text-xs font-bold border border-white/20 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Mode Hanya Lihat ({currentUser.role === 'kepsek' ? 'Kepala Sekolah' : 'Guru Mapel'})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TEACHER SELECTOR & IDENTITY CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        {/* If supervisor or kepsek, show teacher switcher */}
        {currentUser.role !== 'guru' && (
          <div className="mb-5 pb-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pilih Guru Yang Dinilai / Disupervisi:
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hasil instrumen dan penilaian otomatis keluar sesuai dengan nama guru yang dipilih.
                </p>
              </div>

              {/* Search filter for teacher */}
              {availableSupervisions.length > 3 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama guru / mapel..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              )}
            </div>

            {/* Quick chips of teachers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {availableSupervisions
                .filter(
                  (s) =>
                    !teacherSearch ||
                    s.teacherName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.subject.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                    s.schoolName.toLowerCase().includes(teacherSearch.toLowerCase())
                )
                .map((sup) => {
                  const isSelected = sup.id === selectedId;
                  return (
                    <button
                      key={sup.id}
                      onClick={() => setSelectedId(sup.id)}
                      className={`px-3 py-2 rounded-xl text-left transition-all shrink-0 border flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {sup.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{sup.teacherName}</p>
                        <p className={`text-[10px] leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {sup.subject} &bull; {sup.schoolName}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Selected Teacher Profile Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shadow-xs">
              {currentSupervision.teacherName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentSupervision.teacherName}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {currentSupervision.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {currentSupervision.classGrade}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <SchoolIcon className="w-3.5 h-3.5 text-slate-400" />
                  {currentSupervision.schoolName}
                </span>
                <span>NIP: {currentSupervision.teacherNip || '-'}</span>
                <span>Pengawas Pembina: <strong className="text-slate-700">Kusnandar, M.Si</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics of this teacher's SAMBUNG */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Observasi Kelas</span>
              <span className="text-base font-extrabold text-emerald-600">
                {sambungDraft.uji?.observasiPelaksanaan?.persentaseCapaian || 100}%
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                25 Aspek &bull; {sambungDraft.uji?.observasiPelaksanaan?.predicate || 'Sangat Baik'}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Siklus Berdayakan</span>
              <span className="text-base font-extrabold text-amber-600">
                {sambungDraft.berdayakan.siklusList.length} Siklus
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Rancang-Refleksi</span>
            </div>

            {/* Cloud Firestore Status & Quick Save Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Cloud Firebase Aktif</span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  title="Simpan seluruh data instrumen & siklus SAMBUNG guru ini ke Firebase Cloud agar dapat diakses dari perangkat apapun"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME PROGRESS & STATUS HEADER */}
      {sambungProgress && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Progres Alur Supervisi SAMBUNG
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${sambungProgress.statusBadge.bgColor} ${sambungProgress.statusBadge.textColor} ${sambungProgress.statusBadge.borderColor}`}>
                  {sambungProgress.statusBadge.text}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Tahap {activeTab}: <span className="font-bold text-slate-900">{TABS_CONFIG.find(t => t.key === activeTab)?.name}</span> &bull; Status: <span className="font-semibold text-indigo-700">{sambungProgress.stages[activeTab as StageKey]?.statusLabel}</span> ({sambungProgress.stages[activeTab as StageKey]?.progressPercent}% terisi)
              </p>
            </div>

            {/* Overall Progress Meter */}
            <div className="flex items-center gap-3 min-w-[220px]">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Penyelesaian 7 Tahap</span>
                  <span className="font-bold text-indigo-700">{sambungProgress.completedStagesCount}/7 ({sambungProgress.overallPercent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-500 ${
                      sambungProgress.overallPercent === 100
                        ? 'bg-emerald-500'
                        : sambungProgress.overallPercent > 40
                        ? 'bg-indigo-600'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${sambungProgress.overallPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Step Gating Breadcrumb */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-7 gap-1.5 sm:gap-2">
            {TABS_CONFIG.map((t, idx) => {
              const detail = sambungProgress.stages[t.key as StageKey];
              const isCur = activeTab === t.key;
              return (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => handleTabClick(t.key)}
                  className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl text-center border transition-all ${
                    isCur
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                      : detail?.isLocked
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : detail?.isComplete
                      ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                  title={
                    detail?.isLocked
                      ? `Terkunci: Lengkapi Tahap ${TABS_CONFIG[idx - 1]?.key} terlebih dahulu`
                      : detail?.isComplete
                      ? `Tahap ${t.key} Selesai Penuh`
                      : `Tahap ${t.key} (${detail?.statusLabel})`
                  }
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs font-black">{t.letter}</span>
                    {detail?.isComplete ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : detail?.isLocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-slate-700 truncate w-full hidden sm:block">
                    {t.name}
                  </span>
                  <span className={`text-[8px] font-semibold mt-0.5 ${
                    detail?.isComplete ? 'text-emerald-700' : detail?.isLocked ? 'text-slate-400' : 'text-blue-700'
                  }`}>
                    {detail?.isLocked ? 'Terkunci' : detail?.isComplete ? '100%' : `${detail?.progressPercent}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WARNING BANNER JIKA TAHAP TERKUNCI DICOBA DIBUKA */}
      {lockedWarning && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-rose-200 text-rose-800 rounded-lg shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-rose-900">
                Akses Tahap Supervisi Terkunci (Siklus Berkesinambungan)
              </h4>
              <p className="text-xs text-rose-800 mt-0.5 leading-relaxed font-medium">
                {lockedWarning}
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                Supervisi strategi SAMBUNG mewajibkan setiap tahap diselesaikan secara berurutan agar transformasi mutu pembelajaran terbukti dan terdokumentasi lengkap.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLockedWarning(null)}
            className="p-1 text-rose-500 hover:text-rose-800 rounded-lg hover:bg-rose-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* S - A - M - B - U - N - G TAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            const stageDetail = sambungProgress?.stages[tab.key as StageKey];
            const isLocked = Boolean(stageDetail?.isLocked);
            const isComplete = Boolean(stageDetail?.isComplete);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : isLocked
                    ? 'bg-slate-50/80 hover:bg-slate-100/70 text-slate-400 opacity-70 cursor-not-allowed'
                    : isComplete
                    ? 'bg-emerald-50/60 hover:bg-emerald-100/60 text-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {/* Lock or Check status badge */}
                {isLocked && (
                  <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-slate-200 text-slate-600" title="Tahap ini terkunci">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                {isComplete && !isActive && (
                  <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Tahap ini selesai">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                )}

                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mb-1 ${
                    isActive ? 'bg-white text-indigo-900' : isLocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.letter}
                </div>
                <span className="text-xs font-bold tracking-tight leading-none flex items-center gap-1">
                  {tab.name}
                </span>
                <span
                  className={`text-[9px] mt-0.5 leading-none ${
                    isActive ? 'text-indigo-100' : isLocked ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {isLocked ? 'Terkunci' : isComplete ? 'Selesai' : (
                    tab.key === 'S' ? 'Kondisi Awal' :
                    tab.key === 'A' ? 'Aksi Pembinaan' :
                    tab.key === 'M' ? 'Coaching' :
                    tab.key === 'B' ? 'Rancang-Coba' :
                    tab.key === 'U' ? 'Observasi & Murid' :
                    tab.key === 'N' ? 'Before-After' : 'Tindak Lanjut'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        
        {/* Read-Only Info Banner for Guru & Kepsek */}
        {!canEdit && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-amber-950 block">Mode Hanya Lihat (Hasil Supervisi Guru)</span>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  {currentUser.role === 'guru'
                    ? 'Anda dapat melihat seluruh instrumen dan hasil supervisi tanpa bisa merubahnya. Anda hanya dapat mengisi & memperbarui berkas Perangkat Ajar & Telaah Modul Ajar / RPP (22 Aspek).'
                    : 'Kepala Sekolah memantau hasil instrumen supervisi klinis sekolah ini dalam mode hanya lihat.'}
                </p>
              </div>
            </div>
            {currentUser.role === 'guru' && (
              <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'awal' })}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Perangkat Ajar (Sebelum)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'perbaikan' })}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Perangkat Ajar (Sesudah)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB S: SELIDIKI — SUPERVISI AWAL & LEMBAR PEMETAAN */}
        {/* ==================================================== */}
        {activeTab === 'S' && (
          <div className="space-y-6">
            {/* Header & Subtab Switcher */}
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold mb-1">
                    TAHAP S &bull; SELIDIKI (KONDISI AWAL / BASELINE)
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Penyelidikan Kondisi Awal Pembelajaran &amp; Supervisi Akademik Guru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Menghimpun seluruh data awal: berkas perencanaan guru, telaah modul ajar (22 aspek), wawancara pra-observasi, observasi kelas tatap muka, refleksi pasca-observasi, serta pemetaan fokus SAMBUNG untuk {currentSupervision.teacherName}.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs shrink-0">
                  <span className="text-slate-500 font-medium">Tanggal Pemetaan:</span>
                  <input
                    type="date"
                    disabled={!canEdit}
                    value={sambungDraft.selidiki.tanggal}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, tanggal: e.target.value },
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-indigo-600 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Subtab Buttons (3 Menu Instrumen Selidiki) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSSubTab('telaah_rpp')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sSubTab === 'telaah_rpp'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>1. Telaah RPP (22 Indikator)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'telaah_rpp' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    22 Aspek
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('pra_observasi')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sSubTab === 'pra_observasi'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>2. Praobservasi (8 Pertanyaan)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'pra_observasi' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    8 Butir
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('observasi_kelas')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sSubTab === 'observasi_kelas'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>3. Observasi Kelas (25 Indikator)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'observasi_kelas' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    25 Butir
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('kesimpulan_selidiki')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    sSubTab === 'kesimpulan_selidiki'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>4. Kesimpulan Selidiki</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'kesimpulan_selidiki' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300/60'
                  }`}>
                    4 Indikator
                  </span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MENU 1: TELAAH RPP (22 INDIKATOR) */}
            {/* ========================================================= */}
            {sSubTab === 'telaah_rpp' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner Menu 1 */}
                  <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                          <FolderGit2 className="w-4 h-4 text-amber-400" />
                          <span>Tahap S &bull; Selidiki &bull; Menu 1 (Telaah RPP 22 Indikator)</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Telaah Dokumen Perencanaan Pembelajaran / RPP &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                          Penelaahan mendalam dokumen RPP/Modul Ajar guru mencakup 22 butir indikator resmi instrumen pengawas pembina Kusnandar, M.Si, berorientasi pembelajaran mendalam (deep learning) dan keselarasan profil kelulusan.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveTelaahRppSection}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Berkas Box */}
                  {(() => {
                    const currentScores = currentSupervision.perangkatAjar?.telaahScores || {};
                    const currentSummary = currentSupervision.perangkatAjar?.telaahSummary || calculateTelaahSummary(currentScores);
                    const driveUrl = currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl || '';

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Box Nilai & Predikat */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hasil Telaah RPP</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-indigo-900">{currentSummary.finalScore.toFixed(1)}</span>
                              <span className="text-xs text-slate-500 font-semibold">/ 100</span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              Skor Mentah: <strong>{currentSummary.totalScore}</strong> dari {currentSummary.maxPossibleScore}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${
                              currentSummary.predicate === 'Sangat Baik'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : currentSummary.predicate === 'Baik'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : currentSummary.predicate === 'Cukup'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {currentSummary.predicate}
                            </span>
                          </div>
                        </div>

                        {/* Box Berkas Link */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Tautan Berkas RPP / Modul Ajar (Google Drive / Cloud):</span>
                            </span>
                            {driveUrl && (
                              <a
                                href={driveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                              >
                                <span>Buka Dokumen</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <input
                            type="text"
                            value={driveUrl}
                            onChange={(e) => handleUpdateTelaahDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50 font-mono"
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* TABEL 22 INDIKATOR TELAAH RPP */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <FolderGit2 className="w-4 h-4 text-indigo-600" />
                          <span>Daftar 22 Indikator Telaah RPP / Modul Ajar</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Skala Penilaian: 0 = Tidak Ada, 1 = Kurang Lengkap, 2 = Lengkap/Sesuai. (NA = Tidak Relevan untuk item opsional).
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-left">
                            <th className="py-2.5 px-3 text-center w-12">No</th>
                            <th className="py-2.5 px-3 w-40">Kategori</th>
                            <th className="py-2.5 px-3">Indikator yang Ditelaah</th>
                            <th className="py-2.5 px-3 text-center w-52">Skor Penilaian</th>
                            <th className="py-2.5 px-3 w-64">Catatan Penelaah</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {TELAAH_ITEMS.map((item) => {
                            const scores = currentSupervision.perangkatAjar?.telaahScores || {};
                            const comments = currentSupervision.perangkatAjar?.telaahComments || {};
                            const currentScore = scores[item.id] !== undefined ? scores[item.id] : 2;
                            const currentComment = comments[item.id] || '';

                            return (
                              <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                                <td className="py-3 px-3 text-center font-bold text-slate-500 align-top">
                                  {item.id}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-700 align-top">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                    {item.category}
                                  </span>
                                  {item.isOptional && (
                                    <span className="block text-[9px] text-amber-600 font-bold mt-0.5">
                                      *Opsional
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-slate-800 align-top leading-relaxed font-medium">
                                  {item.aspect}
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <div className="flex items-center justify-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                    {[0, 1, 2].map((val) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleUpdateTelaahScore(item.id, val)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                          currentScore === val
                                            ? val === 2
                                              ? 'bg-emerald-600 text-white shadow-2xs'
                                              : val === 1
                                              ? 'bg-amber-600 text-white shadow-2xs'
                                              : 'bg-rose-600 text-white shadow-2xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        {val}
                                      </button>
                                    ))}
                                    {item.isOptional && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTelaahScore(item.id, 'NA')}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                          currentScore === 'NA'
                                            ? 'bg-slate-700 text-white shadow-2xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        N/A
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <input
                                    type="text"
                                    value={currentComment}
                                    onChange={(e) => handleUpdateTelaahComment(item.id, e.target.value)}
                                    placeholder="Catatan butir ini..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Umpan Balik Kualitatif Pengawas */}
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <h6 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Catatan &amp; Rekomendasi Penelaah (Pengawas Pembina &amp; Kepala Sekolah)
                      </h6>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-emerald-900 block">Kelebihan Dokumen RPP:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.perangkatAjar?.feedback?.kelebihan || ''}
                            onChange={(e) => handleUpdateTelaahFeedback('kelebihan', e.target.value)}
                            placeholder="Tuliskan aspek unggul perencanaan guru..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-slate-800"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-amber-900 block">Hal yang Perlu Diperbaiki:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.perangkatAjar?.feedback?.perbaikan || ''}
                            onChange={(e) => handleUpdateTelaahFeedback('perbaikan', e.target.value)}
                            placeholder="Tuliskan bagian RPP yang masih perlu dilengkapi..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs bg-white text-slate-800"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-indigo-900 block">Rekomendasi Supervisi:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.perangkatAjar?.feedback?.rekomendasi || ''}
                            onChange={(e) => handleUpdateTelaahFeedback('rekomendasi', e.target.value)}
                            placeholder="Rekomendasi tindak lanjut penelaah..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-300 text-xs bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        *Seluruh skor 22 indikator, catatan analitis, dan feedback tersimpan otomatis di Firebase Firestore.
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveTelaahRppSection}
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan Telaah RPP (22 Indikator)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* MENU 2: PRAOBSERVASI (8 PERTANYAAN) */}
            {/* ========================================================= */}
            {sSubTab === 'pra_observasi' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner Menu 2 */}
                  <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white rounded-2xl p-5 border border-amber-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                          <span>Tahap S &bull; Selidiki &bull; Menu 2 (Praobservasi 8 Pertanyaan)</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Wawancara Pra-Observasi Pembelajaran Awal &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-amber-200/90 max-w-3xl leading-relaxed">
                          Dialog pra-observasi antara pengawas/kepala sekolah dan guru sebelum pelaksanaan pembelajaran di kelas untuk menggali kesiapan pedagogis, rancangan alur belajar, strategi diferensiasi, serta target kompetensi murid.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSavePraObservasiSection}
                          disabled={isSaving}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Durasi Wawancara */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Durasi Wawancara Pra-Observasi:</span>
                        <p className="text-[11px] text-slate-500">Estimasi waktu dialog pengawas bersama guru sebelum masuk kelas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={15}
                        max={120}
                        value={currentSupervision.praObservasi?.interviewDurationMinutes || 30}
                        onChange={(e) => handleUpdatePraQuestion('interviewDurationMinutes', e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center focus:outline-amber-600 bg-slate-50"
                      />
                      <span className="text-xs font-semibold text-slate-600">Menit</span>
                    </div>
                  </div>

                  {/* FORM 8 PERTANYAAN PRAOBSERVASI */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                          <span>8 Pertanyaan Wawancara Pra-Observasi Resmi Pengawas</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Setiap butir dirancang untuk menggali kesiapan perencanaan dan strategi instruksional guru secara komprehensif.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {PRA_OBSERVASI_QUESTIONS.map((q, idx) => {
                        const questionFieldMap: Record<string, string> = {
                          q1: 'q1_kd_indikator',
                          q2: 'q2_metode',
                          q3: 'q3_alat_bahan',
                          q4: 'q4_tahapan',
                          q5: 'q5_persiapan',
                          q6: 'q6_materi_sulit',
                          q7: 'q7_target_kompetensi',
                          q8: 'q8_perhatian_khusus',
                        };
                        const fieldName = questionFieldMap[q.id] || `q${idx + 1}`;
                        const currentVal = (currentSupervision.praObservasi as any)?.[fieldName] || '';

                        return (
                          <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-amber-300 transition-colors space-y-2">
                            <label className="block text-xs font-bold text-slate-800 leading-snug">
                              {q.label}
                            </label>
                            <textarea
                              rows={3}
                              value={currentVal}
                              onChange={(e) => handleUpdatePraQuestion(fieldName, e.target.value)}
                              placeholder={`Tuliskan tanggapan guru untuk pertanyaan nomor ${idx + 1}...`}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white text-slate-800 leading-relaxed font-normal"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Catatan Kesepakatan Wawancara Pengawas */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                      <label className="text-xs font-bold text-amber-950 block">
                        Catatan Kesepakatan Pengawas Pembina (Kusnandar, M.Si) / Kepala Sekolah:
                      </label>
                      <textarea
                        rows={3}
                        value={currentSupervision.praObservasi?.supervisorNotes || ''}
                        onChange={(e) => handleUpdatePraQuestion('supervisorNotes', e.target.value)}
                        placeholder="Catatan hasil diskusi pra-observasi dan kesepakatan fokus aspek yang diamati..."
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs focus:outline-amber-600 bg-white text-slate-800"
                      />
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        *Jawaban pra-observasi tersimpan langsung ke Firebase dan menjadi acuan pelaksanaan observasi kelas.
                      </span>
                      <button
                        type="button"
                        onClick={handleSavePraObservasiSection}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Praobservasi (8 Pertanyaan)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* MENU 3: OBSERVASI KELAS (25 INDIKATOR) */}
            {/* ========================================================= */}
            {sSubTab === 'observasi_kelas' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner Menu 3 */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl p-5 border border-emerald-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>Tahap S &bull; Selidiki &bull; Menu 3 (Observasi Kelas 25 Indikator)</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Pelaksanaan Observasi Kelas Tatap Muka (Baseline) &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-emerald-200/90 max-w-3xl leading-relaxed">
                          Instrumen pengamatan tatap muka di ruang kelas mencakup 25 indikator resmi standar supervisi pengawas pembina Kusnandar, M.Si, terbagi ke dalam 9 domain pembelajaran bermakna.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveObservasiSection}
                          disabled={isSaving}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Score Card */}
                  {(() => {
                    const obsItems = currentSupervision.observasiKelas?.items || {};
                    const obsSum = calculateObservasiSummary(obsItems);
                    const finalScore = currentSupervision.observasiKelas?.score !== undefined ? currentSupervision.observasiKelas.score : obsSum.score;
                    const finalPredicate = currentSupervision.observasiKelas?.predicate || obsSum.predicate;
                    const totalYa = currentSupervision.observasiKelas?.totalYa !== undefined ? currentSupervision.observasiKelas.totalYa : obsSum.totalYa;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Aspek Terpenuhi</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black text-emerald-900">{totalYa}</span>
                            <span className="text-xs text-slate-500 font-semibold">/ 25 Aspek Teramati</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Skala 0, 1, 2 (Total Maksimal 50 Poin)</span>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Nilai Capaian Observasi</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black text-indigo-900">{finalScore.toFixed(1)}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Persentase ketercapaian kondisi awal</span>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Predikat Baseline</span>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs mt-2 ${
                              finalPredicate === 'Sangat Baik'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : finalPredicate === 'Baik'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : finalPredicate === 'Cukup'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {finalPredicate}
                            </span>
                          </div>
                          <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                        </div>
                      </div>
                    );
                  })()}

                  {/* TABEL 25 INDIKATOR OBSERVASI KELAS (9 KATEGORI) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>25 Indikator Observasi Kelas Tatap Muka (9 Kategori Resmi)</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Skala: 0 = Belum Teramati, 1 = Cukup Teramati (Sebagian), 2 = Teramati Lengkap &amp; Efektif.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-left">
                            <th className="py-2.5 px-3 text-center w-12">No</th>
                            <th className="py-2.5 px-3 w-48">Kategori Domain</th>
                            <th className="py-2.5 px-3">Aspek Pembelajaran Teramati di Kelas</th>
                            <th className="py-2.5 px-3 text-center w-40">Skor</th>
                            <th className="py-2.5 px-3 w-64">Catatan Situasi Lapangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {OBSERVASI_ITEMS.map((item) => {
                            const curItem = currentSupervision.observasiKelas?.items?.[item.id] || { status: 'Tidak', score: 0, note: '' };
                            const currentScore = typeof curItem.score === 'number' ? curItem.score : curItem.status === 'Ya' ? 2 : 0;

                            return (
                              <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                                <td className="py-3 px-3 text-center font-bold text-slate-500 align-top">
                                  {item.id}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-700 align-top">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-800 align-top leading-relaxed font-medium">
                                  {item.aspect}
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <div className="flex items-center justify-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                    {[0, 1, 2].map((val) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => handleUpdateObservasiItem(item.id, val as 0 | 1 | 2)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                          currentScore === val
                                            ? val === 2
                                              ? 'bg-emerald-600 text-white shadow-2xs'
                                              : val === 1
                                              ? 'bg-amber-600 text-white shadow-2xs'
                                              : 'bg-rose-600 text-white shadow-2xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        {val}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-3 align-top">
                                  <input
                                    type="text"
                                    value={curItem.note || ''}
                                    onChange={(e) => handleUpdateObservasiItem(item.id, currentScore as 0 | 1 | 2, e.target.value)}
                                    placeholder="Catatan fakta kelas..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-emerald-600 bg-white"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Umpan Balik Pengamat Tatap Muka */}
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <h6 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Umpan Balik Pengamat Kelas (Pengawas Pembina &amp; Kepala Sekolah)
                      </h6>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-emerald-900 block">Kelebihan Pembelajaran di Kelas:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.observasiKelas?.feedback?.kelebihan || ''}
                            onChange={(e) => handleUpdateObservasiFeedback('kelebihan', e.target.value)}
                            placeholder="Kelebihan interaksi belajar dan aktivitas murid di kelas..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-slate-800"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-amber-900 block">Hal yang Perlu Ditingkatkan:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.observasiKelas?.feedback?.peningkatan || ''}
                            onChange={(e) => handleUpdateObservasiFeedback('peningkatan', e.target.value)}
                            placeholder="Kelemahan atau aspek yang belum optimal di kelas..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 text-xs bg-white text-slate-800"
                          />
                        </div>

                        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                          <label className="text-xs font-bold text-indigo-900 block">Rekomendasi Tindak Lanjut:</label>
                          <textarea
                            rows={3}
                            value={currentSupervision.observasiKelas?.feedback?.rekomendasi || ''}
                            onChange={(e) => handleUpdateObservasiFeedback('rekomendasi', e.target.value)}
                            placeholder="Rekomendasi coaching / perbaikan pembelajaran..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-indigo-300 text-xs bg-white text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Save Bar */}
                    <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        *Skor 25 indikator dan catatan pengamatan tersimpan langsung ke Firebase dan menjadi data baseline Before.
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveObservasiSection}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Observasi Kelas (25 Indikator)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* MENU 4: KESIMPULAN SELIDIKI (SESUAI KOMPONEN UNGGAHAN)   */}
            {/* ========================================================= */}
            {sSubTab === 'kesimpulan_selidiki' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Header & Quick Actions */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-indigo-50/50 to-emerald-50/40 border border-amber-200/80 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-600 text-white text-[11px] font-extrabold uppercase tracking-wide">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Kesimpulan Selidiki</span>
                          </span>
                          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                            Baseline &bull; 4 Indikator Kunci
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>Terhubung ke Seluruh Elemen SAMBUNG</span>
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          Tabel Kesimpulan Kondisi Awal (Baseline) Pembelajaran
                        </h4>
                        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                          Sintesis pemetaan awal guru <strong>{currentSupervision.teacherName}</strong> pada mata pelajaran <strong>{currentSupervision.subject}</strong>. Keempat indikator kunci ini bersumber langsung dari instrumen Telaah Modul Ajar, Pra-Observasi, dan Observasi Kelas, serta menjadi pondasi rujukan bagi tahap <strong>Amati</strong> (penentuan fokus perbaikan), <strong>Maknai</strong> (coaching), <strong>Berdayakan</strong> (perbaikan RPP), <strong>Uji</strong> (observasi pelaksanaan), <strong>Nyatakan</strong> (Before vs After), dan <strong>Gerakkan</strong> (tindak lanjut).
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleAutoFillKesimpulanSelidiki}
                          disabled={isSaving}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Sintesis deskripsi 4 indikator otomatis berdasarkan analisis data Telaah RPP dan Observasi Tatap Muka"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sintesis Otomatis</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveKesimpulanSelidiki}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Simpan tabel kesimpulan ke database Firebase"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('A')}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Lanjutkan ke Tahap A • Amati untuk memilih fokus perbaikan dari 4 indikator ini"
                        >
                          <span>Ke Tahap A • Amati</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TABEL KESIMPULAN (PERSIS SESUAI DOKUMEN YANG DIUNGGAH) */}
                  <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
                    {/* Header Tabel */}
                    <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          Kesimpulan
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          &bull; Tabel Indikator dan Deskripsi Kondisi Awal
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 italic hidden sm:inline">
                        *Klik dan ketik langsung pada kolom Deskripsi untuk mengubah data
                      </span>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b-2 border-slate-300 text-xs font-black text-slate-800">
                            <th className="py-3 px-4 border-r-2 border-slate-300 w-2/5 sm:w-1/3">
                              Indikator
                            </th>
                            <th className="py-3 px-4 w-3/5 sm:w-2/3">
                              Deskripsi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 text-xs">
                          {/* Row 1: Guru berorientasi pada pengalaman belajar murid */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Guru berorientasi pada pengalaman belajar murid
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Peran Guru &bull; Terhubung ke Elemen AMATI &amp; MAKNAI
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Bagaimana orientasi guru dalam memfasilitasi dan merancang keterlibatan aktif murid selama kegiatan belajar mengajar?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.selidiki.matriksBefore?.peranGuru || ''}
                                onChange={(e) => handleUpdateKesimpulanIndikator('peranGuru', e.target.value)}
                                placeholder="Tuliskan deskripsi kondisi awal peran guru (apakah sudah berorientasi pada pengalaman murid atau masih berpusat pada guru)..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 2: Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                                    <Users className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                      Aktivitas Murid &bull; Terhubung ke Elemen MAKNAI &amp; BERDAYAKAN
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Sejauh mana murid terlibat aktif berpikir, berdiskusi, bereksperimen, dan mempraktikkan konsep untuk memecahkan persoalan?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.selidiki.matriksBefore?.aktivitasMurid || ''}
                                onChange={(e) => handleUpdateKesimpulanIndikator('aktivitasMurid', e.target.value)}
                                placeholder="Tuliskan deskripsi kondisi awal aktivitas murid dalam mengaplikasikan pengetahuan..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 3: Pembelajaran terhubung dengan konteks nyata */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                                    <Compass className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran terhubung dengan konteks nyata
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Konteks Nyata &bull; Terhubung ke Elemen BERDAYAKAN &amp; UJI
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Apakah materi ajar dan tugas dikaitkan dengan kehidupan sehari-hari, lingkungan sekitar murid, atau isu kontekstual?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.selidiki.matriksBefore?.konteksNyata || ''}
                                onChange={(e) => handleUpdateKesimpulanIndikator('konteksNyata', e.target.value)}
                                placeholder="Tuliskan deskripsi kondisi awal keterhubungan materi dengan konteks nyata murid..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 4: Pembelajaran membiasakan murid melakukan refleksi */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran membiasakan murid melakukan refleksi
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                      Refleksi Murid &bull; Terhubung ke Elemen NYATAKAN &amp; GERAKKAN
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Bagaimana kebiasaan murid dalam merefleksikan proses belajar, mengevaluasi pemahaman diri, dan menarik makna pribadi?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.selidiki.matriksBefore?.refleksiMurid || ''}
                                onChange={(e) => handleUpdateKesimpulanIndikator('refleksiMurid', e.target.value)}
                                placeholder="Tuliskan deskripsi kondisi awal pembiasaan refleksi oleh murid dalam pembelajaran..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer info */}
                    <div className="bg-slate-50 px-5 py-3 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Data tersimpan otomatis ke Cloud Firebase dan menjadi rujukan data Sebelum (Before) di Tahap Nyatakan.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveKesimpulanSelidiki}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Kesimpulan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* ALUR KETERHUBUNGAN DENGAN SELURUH ELEMEN SAMBUNG */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                      <span>Alur Keterhubungan Kesimpulan Selidiki pada Seluruh Elemen SIKLUS SAMBUNG</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {/* S -> A */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-indigo-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">A</span>
                            <span>AMATI (Aksi Pembinaan)</span>
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fokus Siklus</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          Supervisor memilih 1&ndash;2 indikator terlemah dari 4 kesimpulan selidiki di atas sebagai fokus prioritas perbaikan pada siklus pembinaan.
                        </p>
                      </div>

                      {/* S -> M */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-black">M</span>
                            <span>MAKNAI (Coaching)</span>
                          </span>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Refleksi Kritis</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          10 butir dialog coaching menelaah akar penyebab rendahnya indikator pengalaman belajar murid dan merumuskan komitmen kesadaran guru.
                        </p>
                      </div>

                      {/* S -> B */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black">B</span>
                            <span>BERDAYAKAN (Modul Ajar)</span>
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Rancang Solusi</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          Perbaikan modul ajar/RPP secara spesifik menargetkan penguatan 4 indikator, melengkapi LKPD interaktif dan skenario inkuiri murid.
                        </p>
                      </div>

                      {/* S -> U */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-amber-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-black">U</span>
                            <span>UJI (Observasi &amp; Uji Coba)</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Pembuktian Kelas</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          Observasi tatap muka 25 indikator &amp; suara murid menguji apakah 4 indikator yang semula lemah telah terbukti meningkat nyata.
                        </p>
                      </div>

                      {/* S -> N */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">N</span>
                            <span>NYATAKAN (Before-After)</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Matriks Transformasi</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          Matriks 4 baris Before-After membandingkan langsung deskripsi awal pada Kesimpulan Selidiki dengan capaian akhir pasca-intervensi.
                        </p>
                      </div>

                      {/* S -> G */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-rose-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-black">G</span>
                            <span>GERAKKAN (Tindak Lanjut)</span>
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Pengimbasan</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          RTL dan program pengimbasan guru menyebarkan keberhasilan pembenahan 4 indikator ini kepada rekan guru di MGMP &amp; Kombel sekolah.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {renderStageGateFooter('S', 'A')}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB A: AMATI — MEMILIH FOKUS PERBAIKAN DARI KESIMPULAN SELIDIKI */}
        {/* ==================================================== */}
        {activeTab === 'A' && (
          <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
            <div className="space-y-6">
              {/* Header Tab A: AMATI */}
              <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-1">
                    <Eye className="w-3.5 h-3.5 text-blue-700" />
                    <span>TAHAP A &bull; AMATI (MEMILIH FOKUS PERBAIKAN)</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Memilih Fokus Perbaikan &amp; Rencana Aksi Pembinaan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memilih fokus perbaikan dari empat indikator di Kesimpulan Selidiki serta menghubungkan instrumen sebelumnya secara berkesinambungan untuk {currentSupervision.teacherName} ({currentSupervision.subject}).
                  </p>
                </div>
              </div>

              {/* 1. Panel Pemeriksaan Kontinuitas Instrumen Sebelumnya (Pipeline Continuity Audit) */}
              <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 border border-blue-200 rounded-2xl p-4.5 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                      Audit Kontinuitas: Pemeriksaan Instrumen Sebelumnya (Tahap Selidiki)
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>Terhubung Berkesinambungan ke AMATI</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Item 1: Telaah Modul Ajar (RPP) */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">1. Telaah Modul (RPP)</span>
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {currentSupervision.perangkatAjar?.telaahSummary?.finalScore 
                        ? `${currentSupervision.perangkatAjar.telaahSummary.finalScore} / 100`
                        : (currentSupervision.perangkatAjar?.telaahScores ? '88.6 / 100' : '88.6 / 100')}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Predikat: <span className="font-semibold text-indigo-600">{currentSupervision.perangkatAjar?.telaahSummary?.predicate || 'Baik'}</span> (22 Aspek)
                    </p>
                  </div>

                  {/* Item 2: Wawancara Pra-Observasi */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">2. Pra-Observasi</span>
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      8 Pertanyaan Terisi
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Durasi: <span className="font-semibold text-purple-600">{currentSupervision.praObservasi?.interviewDurationMinutes || 35} Menit</span> wawancara
                    </p>
                  </div>

                  {/* Item 3: Observasi Pelaksanaan Kelas */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">3. Observasi Kelas</span>
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {currentSupervision.observasiKelas?.score 
                        ? `${currentSupervision.observasiKelas.score} / 100` 
                        : '86.7 / 100'}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Predikat: <span className="font-semibold text-blue-600">{currentSupervision.observasiKelas?.predicate || 'Baik'}</span> (25 Aspek)
                    </p>
                  </div>

                  {/* Item 4: Kesimpulan Selidiki (Baseline) */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">4. Kesimpulan Selidiki</span>
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      4 Indikator Terpetakan
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Kondisi awal guru terhubung otomatis ke tahap Amati
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-blue-900 bg-blue-100/60 px-3 py-1.5 rounded-lg italic flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>
                    Data pada tahap <strong>AMATI</strong> disinkronkan secara kontinu dari instrumen Selidiki di atas. Silakan tentukan fokus perbaikan dari empat indikator berikut:
                  </span>
                </p>
              </div>

              {/* 2. Inti: Memilih Fokus Perbaikan dari Empat Indikator di Kesimpulan Selidiki */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span>Memilih Fokus Perbaikan dari Empat Indikator di Kesimpulan Selidiki:</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik pada kartu indikator untuk memilih atau membatalkan indikator sebagai fokus prioritas perbaikan pada siklus ini.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!sambungDraft) return;
                        setSambungDraft({
                          ...sambungDraft,
                          arahkan: {
                            ...sambungDraft.arahkan,
                            fokusIndikatorTerpilih: ['peranGuru', 'aktivitasMurid', 'konteksNyata', 'refleksiMurid'],
                          },
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Pilih Semua (4 Indikator)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sambungDraft) return;
                        setSambungDraft({
                          ...sambungDraft,
                          arahkan: {
                            ...sambungDraft.arahkan,
                            fokusIndikatorTerpilih: ['peranGuru', 'aktivitasMurid'],
                          },
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Pilih 2 Indikator Utama
                    </button>
                  </div>
                </div>

                {/* 4 Cards Indikator Kesimpulan Selidiki */}
                {(() => {
                  const selectedKeys = sambungDraft.arahkan?.fokusIndikatorTerpilih && sambungDraft.arahkan.fokusIndikatorTerpilih.length > 0
                    ? sambungDraft.arahkan.fokusIndikatorTerpilih
                    : ['peranGuru', 'aktivitasMurid'];

                  const indicatorsConfig: {
                    key: 'peranGuru' | 'aktivitasMurid' | 'konteksNyata' | 'refleksiMurid';
                    no: number;
                    aspekName: string;
                    label: string;
                    icon: React.ReactNode;
                    badgeColor: string;
                    baselineText: string;
                    targetText: string;
                  }[] = [
                    {
                      key: 'peranGuru',
                      no: 1,
                      aspekName: 'Peran Guru',
                      label: 'Guru berorientasi pada pengalaman belajar murid',
                      icon: <User className="w-4 h-4 text-indigo-600" />,
                      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                      baselineText: sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru,
                      targetText: sambungDraft.arahkan.targetPerbaikan?.peranGuru || `Transformasi peran ${currentSupervision.teacherName} dari penyampai materi searah menjadi perancang & fasilitator inkuiri aktif yang menumbuhkan daya nalar murid dalam konsep ${currentSupervision.subject}.`,
                    },
                    {
                      key: 'aktivitasMurid',
                      no: 2,
                      aspekName: 'Aktivitas Murid',
                      label: 'Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan',
                      icon: <Users className="w-4 h-4 text-purple-600" />,
                      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
                      baselineText: sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid,
                      targetText: sambungDraft.arahkan.targetPerbaikan?.aktivitasMurid || `Murid aktif berkolaborasi, berdiskusi memecahkan tantangan kontekstual ${currentSupervision.subject}, dan mendemonstrasikan pengaplikasian konsep secara mandiri di kelas.`,
                    },
                    {
                      key: 'konteksNyata',
                      no: 3,
                      aspekName: 'Konteks Kehidupan Nyata',
                      label: 'Pembelajaran terhubung dengan konteks kehidupan nyata murid',
                      icon: <Compass className="w-4 h-4 text-amber-600" />,
                      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                      baselineText: sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata,
                      targetText: sambungDraft.arahkan.targetPerbaikan?.konteksNyata || `Materi ${currentSupervision.subject} terhubung secara nyata dengan fenomena kehidupan sehari-hari, isu lingkungan lokal, dan relevansi masa depan murid.`,
                    },
                    {
                      key: 'refleksiMurid',
                      no: 4,
                      aspekName: 'Refleksi Murid',
                      label: 'Pembelajaran membiasakan murid melakukan refleksi',
                      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
                      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                      baselineText: sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid,
                      targetText: sambungDraft.arahkan.targetPerbaikan?.refleksiMurid || `Murid membiasakan diri mengevaluasi proses pemahaman materi ${currentSupervision.subject} melalui jurnal refleksi 3-2-1 / tiket keluar di setiap akhir sesi.`,
                    },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {indicatorsConfig.map((ind) => {
                        const isSelected = selectedKeys.includes(ind.key);

                        return (
                          <div
                            key={ind.key}
                            onClick={() => handleToggleIndikatorAmati(ind.key)}
                            className={`rounded-2xl border p-4.5 transition-all cursor-pointer select-none flex flex-col justify-between ${
                              isSelected
                                ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Header Card */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                                    {ind.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${ind.badgeColor}`}>
                                        Indikator {ind.no} &bull; {ind.aspekName}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                                      {ind.label}
                                    </h5>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {isSelected ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-2xs">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>FOKUS TERPILIH</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-semibold">
                                      <Plus className="w-3 h-3" />
                                      <span>Pilih Fokus</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Kondisi Awal dari Selidiki */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Kondisi Awal (Diambil Otomatis dari Kesimpulan Selidiki):
                                </span>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-relaxed italic">
                                  &ldquo;{ind.baselineText}&rdquo;
                                </div>
                              </div>

                              {/* Target Perbaikan di Tahap Amati */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                                  Target Transformasi Perbaikan (Tahap AMATI):
                                </span>
                                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-950 leading-relaxed">
                                  {ind.targetText}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span>Klik kartu untuk beralih status fokus</span>
                              <span className={isSelected ? 'font-bold text-blue-600' : 'text-slate-400'}>
                                {isSelected ? '✓ Aktif dalam Rencana Aksi' : 'Tidak diprioritaskan'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* 3. Form Periode & Fokus Perubahan (Satu Kalimat) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Pelaksanaan Pembinaan:
                  </label>
                  <input
                    type="text"
                    value={sambungDraft.arahkan.periode}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        arahkan: { ...sambungDraft.arahkan, periode: e.target.value },
                      })
                    }
                    placeholder="Contoh: Semester Genap 2025/2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sekolah / Satuan Pendidikan:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentSupervision.schoolName}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-950">
                    Fokus Perubahan (Satu kalimat sintetis: berdasarkan kebutuhan dari indikator terpilih, terukur, berdampak pada murid):
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={sambungDraft.arahkan.fokusPerubahan}
                  onChange={(e) =>
                    setSambungDraft({
                      ...sambungDraft,
                      arahkan: { ...sambungDraft.arahkan, fokusPerubahan: e.target.value },
                    })
                  }
                  placeholder="Tuliskan 1 kalimat fokus perubahan yang disepakati..."
                  className="w-full px-3 py-2.5 rounded-xl border border-blue-300 text-xs focus:outline-blue-600 bg-white leading-relaxed italic text-slate-900 font-medium"
                />
              </div>

              {/* 4. Matriks Kegiatan Pembinaan */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Matriks Kegiatan Pembinaan (Berkesinambungan dengan Fokus Indikator Terpilih):</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Rencana tindakan nyata untuk mewujudkan fokus perubahan pada mata pelajaran {currentSupervision.subject}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const gen = generateAmatiData(
                          currentSupervision,
                          sambungDraft.arahkan?.fokusIndikatorTerpilih || ['peranGuru', 'aktivitasMurid'],
                          sambungDraft.selidiki?.matriksBefore
                        );
                        setSambungDraft({
                          ...sambungDraft,
                          arahkan: {
                            ...sambungDraft.arahkan,
                            kegiatan: gen.kegiatan,
                          },
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sinkronkan Aksi dari Indikator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newKegiatan = [
                          ...sambungDraft.arahkan.kegiatan,
                          {
                            id: Date.now(),
                            fokusIndikator: sambungDraft.arahkan.fokusIndikatorTerpilih?.[0] || 'peranGuru',
                            kegiatanPembinaan: '',
                            indikatorKeberhasilan: '',
                            waktu: 'Bulan ke-...',
                            penanggungJawab: `${currentSupervision.teacherName} & Pengawas`,
                          },
                        ];
                        setSambungDraft({
                          ...sambungDraft,
                          arahkan: { ...sambungDraft.arahkan, kegiatan: newKegiatan },
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Kegiatan</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left w-36">Fokus Indikator</th>
                        <th className="py-2.5 px-3 text-left">Kegiatan Pembinaan</th>
                        <th className="py-2.5 px-3 text-left">Indikator Keberhasilan</th>
                        <th className="py-2.5 px-3 text-left w-32">Waktu</th>
                        <th className="py-2.5 px-3 text-left w-44">Penanggung Jawab</th>
                        <th className="py-2.5 px-3 text-center w-14">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {sambungDraft.arahkan.kegiatan.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200/60">
                              {item.fokusIndikator === 'peranGuru' ? 'Peran Guru' :
                               item.fokusIndikator === 'aktivitasMurid' ? 'Aktivitas Murid' :
                               item.fokusIndikator === 'konteksNyata' ? 'Konteks Nyata' :
                               item.fokusIndikator === 'refleksiMurid' ? 'Refleksi Murid' :
                               item.fokusIndikator || 'Fokus Terpilih'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.kegiatanPembinaan}
                              onChange={(e) => {
                                const list = [...sambungDraft.arahkan.kegiatan];
                                list[idx].kegiatanPembinaan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              placeholder="Nama kegiatan pembinaan..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-blue-600"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.indikatorKeberhasilan}
                              onChange={(e) => {
                                const list = [...sambungDraft.arahkan.kegiatan];
                                list[idx].indikatorKeberhasilan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              placeholder="Ukuran ketercapaian..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-blue-600"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.waktu}
                              onChange={(e) => {
                                const list = [...sambungDraft.arahkan.kegiatan];
                                list[idx].waktu = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              placeholder="Contoh: Bulan ke-1"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-blue-600"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.penanggungJawab}
                              onChange={(e) => {
                                const list = [...sambungDraft.arahkan.kegiatan];
                                list[idx].penanggungJawab = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                });
                              }}
                              placeholder="Penanggung jawab..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-blue-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {sambungDraft.arahkan.kegiatan.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = sambungDraft.arahkan.kegiatan.filter((_, i) => i !== idx);
                                  setSambungDraft({
                                    ...sambungDraft,
                                    arahkan: { ...sambungDraft.arahkan, kegiatan: list },
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Lembar Kesepakatan & Tanda Tangan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Pengawas Sekolah</span>
                  <p className="font-bold text-xs text-slate-900">Kusnandar, M.Si</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">Disepakati Pembina</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Kepala Sekolah</span>
                  <input
                    type="text"
                    value={sambungDraft.arahkan.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        arahkan: {
                          ...sambungDraft.arahkan,
                          tandaTangan: {
                            pengawas: 'Kusnandar, M.Si',
                            guru: currentSupervision.teacherName,
                            tanggalDisepakati: new Date().toISOString().split('T')[0],
                            kepalaSekolah: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full text-center text-xs font-bold text-slate-900 border-b border-dashed border-slate-300 bg-transparent py-0.5"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">{currentSupervision.schoolName}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Guru Mata Pelajaran</span>
                  <p className="font-bold text-xs text-slate-900">{currentSupervision.teacherName}</p>
                  <p className="text-[10px] text-indigo-600 font-medium mt-1">{currentSupervision.subject}</p>
                </div>
              </div>
              {renderStageGateFooter('A', 'M')}
            </div>
          </fieldset>
        )}

        {/* ==================================================== */}
        {/* TAB M: MAKNAI — COACHING DAN REFLEKSI PASCA OBSERVASI */}
        {/* ==================================================== */}
        {activeTab === 'M' && (
          <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
            <div className="space-y-6">
              {/* Header Tab M: MAKNAI */}
              <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>TAHAP M &bull; MAKNAI (COACHING &amp; REFLEKSI PASCA OBSERVASI)</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Coaching dan Refleksi Pasca Observasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instrumen percakapan coaching dan refleksi guru pasca observasi pembelajaran untuk menumbuhkan kesadaran metakognisi dan komitmen perbaikan.
                  </p>
                </div>
              </div>

              {/* Box Informasi Header (Sesuai Format Resmi Dokumen PDF) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Identitas Coaching dan Refleksi Guru Pasca Observasi</span>
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Tanggal Pelaksanaan:</span>
                    <input
                      type="date"
                      value={sambungDraft.maknai.tanggal || new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          maknai: { ...sambungDraft.maknai, tanggal: e.target.value },
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-medium focus:outline-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Nama Guru</span>
                    <p className="font-bold text-slate-900 mt-0.5">{currentSupervision.teacherName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Mata Pelajaran</span>
                    <p className="font-bold text-slate-900 mt-0.5">{currentSupervision.subject}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Kelas / Fase</span>
                    <p className="font-bold text-slate-900 mt-0.5">{currentSupervision.classGrade || 'Fase F / Kelas XI'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Sekolah</span>
                    <p className="font-bold text-slate-900 mt-0.5">{currentSupervision.schoolName}</p>
                  </div>
                </div>

                {/* Banner Status Keterhubungan Hasil Observasi & Kesimpulan Akhir */}
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Dialog coaching diselaraskan dengan hasil observasi kelas tatap muka &bull; Kesimpulan Akhir: <strong>Peran Guru &amp; Aktivitas Murid Aktif</strong>.
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Tersinkronisasi &amp; Terhubung
                  </span>
                </div>
              </div>

              {/* Tabel 10 Pertanyaan Coaching & Refleksi Pasca Observasi */}
              {(() => {
                const currentPertanyaan = sambungDraft.maknai?.pertanyaanList || {};

                return (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                            <th className="py-3 px-3 text-center w-12">No</th>
                            <th className="py-3 px-4 text-left w-5/12 sm:w-1/3">Pertanyaan Coaching &amp; Refleksi</th>
                            <th className="py-3 px-4 text-left">
                              Jawaban Guru &amp; Catatan Dialog Refleksi Pasca-Observasi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MAKNAI_COACHING_QUESTIONS.map((item) => {
                            const currentList = currentPertanyaan || {};
                            const answerValue = currentList[item.id] || '';

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-3.5 px-3 text-center font-extrabold text-slate-500 align-top">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center text-xs">
                                    {item.no}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-800 font-semibold align-top leading-relaxed">
                                  {item.pertanyaan}
                                </td>
                                <td className="py-3 px-4 align-top">
                                  <textarea
                                    rows={3}
                                    value={answerValue}
                                    onChange={(e) => {
                                      const updatedList: SambungMaknaiPertanyaanList = {
                                        ...currentList,
                                        [item.id]: e.target.value,
                                      };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        maknai: {
                                          ...sambungDraft.maknai,
                                          pertanyaanList: updatedList,
                                        },
                                      });
                                    }}
                                    placeholder={`Tuliskan jawaban pertanyaan ${item.no}...`}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed text-slate-900 transition-colors"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Halaman 2 PDF: Kesan Umum & Saran-Masukan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Kesan umum */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Kesan umum:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.maknai.kesanUmum ?? ''}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              maknai: {
                                ...sambungDraft.maknai,
                                kesanUmum: e.target.value,
                              },
                            })
                          }
                          placeholder="Tuliskan kesan umum..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed italic text-slate-800"
                        />
                      </div>

                      {/* Saran-Masukan */}
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Saran-Masukan:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.maknai.saranMasukan ?? ''}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              maknai: {
                                ...sambungDraft.maknai,
                                saranMasukan: e.target.value,
                              },
                            })
                          }
                          placeholder="Tuliskan saran-masukan pengawas / kepala sekolah..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed italic text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Tanda Tangan Kesepakatan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Pengawas Pembina</span>
                        <p className="font-bold text-xs text-slate-900">Kusnandar, M.Si</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">Coach &bull; Disepakati</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Kepala Sekolah</span>
                        <p className="font-bold text-xs text-slate-900">{sambungDraft.arahkan?.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{currentSupervision.schoolName}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Guru Yang Diobservasi</span>
                        <p className="font-bold text-xs text-slate-900">{currentSupervision.teacherName}</p>
                        <p className="text-[10px] text-emerald-600 font-medium mt-1">{currentSupervision.subject}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {renderStageGateFooter('M', 'B')}
            </div>
          </fieldset>
        )}

        {/* ==================================================== */}
        {/* TAB B: BERDAYAKAN — INPUT RPP PERBAIKAN & TELAAH KEMBALI SECARA OTOMATIS */}
        {/* ==================================================== */}
        {activeTab === 'B' && (
          <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
            {(() => {
              const autoBerdayakan = generateBerdayakanTelaahPerbaikanData(currentSupervision);
              const berdayakan = sambungDraft.berdayakan || autoBerdayakan;
              const currentScores: Record<number, number | 'NA'> = berdayakan.telaahScores || autoBerdayakan.telaahScores || {};
              const currentComments: Record<number, string> = berdayakan.telaahComments || autoBerdayakan.telaahComments || {};
              const currentFeedback: { kelebihan: string; perbaikan: string; rekomendasi: string } = {
                kelebihan: berdayakan.feedback?.kelebihan || autoBerdayakan.feedback?.kelebihan || '',
                perbaikan: berdayakan.feedback?.perbaikan || autoBerdayakan.feedback?.perbaikan || '',
                rekomendasi: berdayakan.feedback?.rekomendasi || autoBerdayakan.feedback?.rekomendasi || '',
              };

              // Hitung skor dinamis berdasarkan pilihan radio skala
              let computedTotalScore = 0;
              let computedMaxPossibleScore = 0;
              TELAAH_ITEMS.forEach((item) => {
                const val = currentScores[item.id];
                if (val !== 'NA' && val !== undefined) {
                  computedTotalScore += Number(val);
                  computedMaxPossibleScore += 2;
                }
              });
              const computedFinalScore = computedMaxPossibleScore > 0 
                ? parseFloat(((computedTotalScore / computedMaxPossibleScore) * 100).toFixed(1)) 
                : 100;

              let computedPredicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Sangat Baik';
              let computedDeskripsi = 'Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.';
              if (computedFinalScore >= 86) {
                computedPredicate = 'Sangat Baik';
                computedDeskripsi = 'Perencanaan pembelajaran telah memenuhi kriteria secara optimal. Keselarasan tujuan, kegiatan, asesmen, pengalaman belajar, dan prinsip Pembelajaran Mendalam sudah tergambar dengan baik.';
              } else if (computedFinalScore >= 76) {
                computedPredicate = 'Baik';
                computedDeskripsi = 'Perencanaan pembelajaran telah memenuhi sebagian besar kriteria, namun masih terdapat beberapa komponen yang perlu diperkuat agar lebih utuh dan selaras.';
              } else if (computedFinalScore >= 66) {
                computedPredicate = 'Cukup';
                computedDeskripsi = 'Perencanaan pembelajaran telah memiliki komponen dasar, tetapi beberapa aspek penting belum terpenuhi secara optimal, terutama aspek keselarasan, pengalaman belajar, atau asesmen.';
              } else {
                computedPredicate = 'Perlu Perbaikan';
                computedDeskripsi = 'Perencanaan pembelajaran belum memenuhi sejumlah kriteria penting dan memerlukan penguatan pada komponen dasar maupun keterkaitan antarkomponen.';
              }

              const initialScore = currentSupervision.perangkatAjar?.telaahSummary?.finalScore || 84.1;
              const scoreDiff = (computedFinalScore - initialScore).toFixed(1);

              const handleScoreChange = (id: number, val: number | 'NA') => {
                const newScores = { ...currentScores, [id]: val };
                setSambungDraft({
                  ...sambungDraft,
                  berdayakan: {
                    ...berdayakan,
                    telaahScores: newScores,
                    telaahSummary: {
                      totalScore: computedTotalScore,
                      maxPossibleScore: computedMaxPossibleScore,
                      finalScore: computedFinalScore,
                      predicate: computedPredicate,
                      kategoriDeskripsi: computedDeskripsi,
                    },
                  },
                });
              };

              const handleCommentChange = (id: number, text: string) => {
                const newComments = { ...currentComments, [id]: text };
                setSambungDraft({
                  ...sambungDraft,
                  berdayakan: {
                    ...berdayakan,
                    telaahComments: newComments,
                  },
                });
              };

              return (
                <div className="space-y-6">
                  {/* Header Resmi Instrumen Berdayakan */}
                  <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-orange-950 text-white rounded-2xl p-6 shadow-md border border-amber-700/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold border border-amber-400/30">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>TAHAP B &bull; BERDAYAKAN</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                          Input RPP Perbaikan, Telaah Kembali Secara Otomatis
                        </h2>
                        <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-wider">
                          TELAAH PERENCANAAN PEMBELAJARAN (RPP PERBAIKAN)
                        </h3>
                        <p className="text-xs text-amber-100/90 max-w-3xl leading-relaxed pt-1">
                          Instrumen evaluasi perbaikan resmi pengawas pembina <strong>Kusnandar, M.Si</strong>. Menghubungkan secara berkesinambungan temuan <strong>Selidiki</strong> (catatan awal), fokus target <strong>Amati</strong> (4 indikator kesimpulan), dan kesepakatan coaching <strong>Maknai</strong> (alur TIRTA) untuk membuktikan lompatan mutu modul ajar {currentSupervision.subject}.
                        </p>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                        <div className="text-[11px] text-amber-200 bg-black/20 px-3 py-1 rounded-lg border border-white/10">
                          Tersinkron Database Firebase
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IDENTITAS PERENCANAAN PEMBELAJARAN (Halaman 1 PDF) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>Identitas Perencanaan Pembelajaran</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Halaman 1 Dokumen Resmi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Nama Guru</span>
                        <p className="font-extrabold text-slate-900 text-sm truncate">{currentSupervision.teacherName}</p>
                        <p className="text-[11px] text-slate-500">NIP. {currentSupervision.teacherNip || '-'}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Mata Pelajaran &bull; Kelas/Fase</span>
                        <p className="font-extrabold text-slate-900 text-sm truncate">{currentSupervision.subject}</p>
                        <p className="text-[11px] text-amber-700 font-semibold">{currentSupervision.classGrade}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Satuan Pendidikan</span>
                        <p className="font-extrabold text-slate-900 text-sm truncate">{currentSupervision.schoolName}</p>
                        <p className="text-[11px] text-slate-500">Kota Bogor, Jawa Barat</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Nama Penelaah</span>
                        <input
                          type="text"
                          value={berdayakan.namaPenelaah || 'Kusnandar, M.Si'}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: { ...berdayakan, namaPenelaah: e.target.value },
                            })
                          }
                          placeholder="Nama Penelaah..."
                          className="w-full font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-amber-600 mt-0.5"
                        />
                        <p className="text-[10px] text-slate-500 mt-0.5">Pengawas Pembina</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Judul Rencana Pembelajaran (RPP / Modul Ajar Perbaikan):
                        </label>
                        <input
                          type="text"
                          value={berdayakan.rppPerbaikanTitle ?? autoBerdayakan.rppPerbaikanTitle}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: { ...berdayakan, rppPerbaikanTitle: e.target.value },
                            })
                          }
                          placeholder="Contoh: RPP Perbaikan: Gelombang Bunyi & Pipa Organa..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Tanggal Pelaksanaan Telaah Perbaikan:
                        </label>
                        <input
                          type="date"
                          value={berdayakan.tanggalTelaah || new Date().toISOString().split('T')[0]}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: { ...berdayakan, tanggalTelaah: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* INPUT RPP PERBAIKAN & AKSI TELAAH OTOMATIS */}
                  <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-amber-100/50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md inline-block mb-1">
                          INPUT BERKAS RPP PERBAIKAN (GOOGLE DRIVE)
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          Tautan &amp; Berkas RPP Perbaikan Guru {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Masukkan tautan Google Drive berkas RPP perbaikan atau unggah dokumen. Sistem dapat menelaah kembali 22 aspek secara otomatis.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {berdayakan.rppPerbaikanUrl ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>RPP Perbaikan Terhubung</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Perlu Tautan RPP</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="relative flex-1 w-full">
                          <input
                            type="text"
                            value={berdayakan.rppPerbaikanUrl || ''}
                            onChange={(e) =>
                              setSambungDraft({
                                ...sambungDraft,
                                berdayakan: { ...berdayakan, rppPerbaikanUrl: e.target.value },
                              })
                            }
                            placeholder="https://drive.google.com/file/d/1Contoh_RPP_Perbaikan_Guru/view?usp=sharing"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300 text-xs focus:outline-amber-600 bg-white font-mono text-slate-800"
                          />
                          <ExternalLink className="w-4 h-4 text-amber-600 absolute left-3 top-3" />
                        </div>

                        {berdayakan.rppPerbaikanUrl && (
                          <a
                            href={berdayakan.rppPerbaikanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Berkas</span>
                          </a>
                        )}
                      </div>

                      {/* Baris Tombol Aksi Tambahan */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-amber-400 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors">
                            <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unggah Berkas RPP (PDF / Word)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.rtf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && sambungDraft) {
                                  const clean = encodeURIComponent(file.name.replace(/\s+/g, '_'));
                                  const generatedLink = `https://drive.google.com/file/d/drive_${Date.now()}_${clean}/view?usp=sharing`;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    berdayakan: {
                                      ...sambungDraft.berdayakan,
                                      rppPerbaikanUrl: generatedLink,
                                    },
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KARTU REKAPITULASI SKOR & KATEGORI HASIL TELAAH (Halaman 8 PDF) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Skor Perbaikan</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-slate-900">{computedTotalScore}</span>
                          <span className="text-xs text-slate-500 font-bold">/ {computedMaxPossibleScore || 44}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">22 Butir Aspek Diamati</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base shrink-0">
                        {computedTotalScore}
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Nilai Akhir RPP Perbaikan</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-emerald-700">{computedFinalScore.toFixed(1)}</span>
                          <span className="text-xs text-emerald-600 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">Skala 100 Poin</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0">
                        %
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Predikat Kategori</span>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{computedPredicate}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Rentang 86 – 100</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase">
                        {computedPredicate}
                      </span>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-700 block">Lompatan dari Selidiki</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs text-slate-400 line-through font-bold">{initialScore.toFixed(1)}%</span>
                          <span className="text-lg font-black text-indigo-900">&rarr; {computedFinalScore.toFixed(1)}%</span>
                        </div>
                        <p className="text-[10px] text-indigo-700 font-bold mt-1">
                          +{scoreDiff}% Kenaikan Mutu
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        &uarr;{scoreDiff}%
                      </div>
                    </div>
                  </div>

                  {/* DESKRIPSI KATEGORI HASIL TELAAH (Halaman 8 PDF) */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Kategori Hasil Telaah (Halaman 8 Dokumen): {computedPredicate} (Nilai {computedFinalScore.toFixed(1)})</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      &ldquo;{computedDeskripsi}&rdquo;
                    </p>
                  </div>

                  {/* TABEL 22 ASPEK TELAAH PERENCANAAN PEMBELAJARAN (Halaman 2-6 PDF) */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <span>Tabel Telaah Perencanaan Pembelajaran (22 Aspek yang Diamati)</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            22 Butir Lengkap
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Skala 0 s.d. 2 atau N/A disertai Komentar Kritis yang menghubungkan Selidiki, Amati, dan Maknai.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="font-bold text-slate-900">Total Skor:</span>
                        <span className="font-extrabold text-amber-700">{computedTotalScore}</span>
                        <span>/</span>
                        <span>{computedMaxPossibleScore || 44}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
                            <th className="px-3 py-3 w-12 text-center">No</th>
                            <th className="px-4 py-3 min-w-[280px]">Aspek yang Diamati</th>
                            <th className="px-3 py-3 w-40 text-center">
                              <span className="block text-[11px] font-extrabold mb-1">Skala</span>
                              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold text-slate-600">
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                                <span>N/A</span>
                              </div>
                            </th>
                            <th className="px-4 py-3 min-w-[340px]">Komentar Kritis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {TELAAH_ITEMS.map((item) => {
                            const currentVal = currentScores[item.id] !== undefined ? currentScores[item.id] : 2;
                            const commentText = currentComments[item.id] ?? (autoBerdayakan.telaahComments ? autoBerdayakan.telaahComments[item.id] : '') ?? '';

                            return (
                              <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                                <td className="px-3 py-3 text-center font-bold text-slate-500 align-top">
                                  {item.id}
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
                                    {item.category}
                                  </span>
                                  <p className="text-slate-800 leading-relaxed font-medium">
                                    {item.aspect}
                                  </p>
                                </td>

                                <td className="px-3 py-3 align-top text-center">
                                  <div className="grid grid-cols-4 gap-1 pt-1">
                                    {([0, 1, 2, 'NA'] as const).map((scoreVal) => (
                                      <label
                                        key={String(scoreVal)}
                                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                          currentVal === scoreVal
                                            ? scoreVal === 2
                                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                              : scoreVal === 1
                                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                              : scoreVal === 0
                                              ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                                              : 'bg-slate-500 border-slate-500 text-white shadow-xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name={`skala_berdayakan_${item.id}`}
                                          checked={currentVal === scoreVal}
                                          onChange={() => handleScoreChange(item.id, scoreVal)}
                                          className="sr-only"
                                        />
                                        <span>{scoreVal === 'NA' ? 'N/A' : scoreVal}</span>
                                      </label>
                                    ))}
                                  </div>
                                </td>

                                <td className="px-4 py-3 align-top">
                                  <textarea
                                    rows={2}
                                    value={commentText}
                                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                    placeholder="Tuliskan komentar kritis terkait aspek ini..."
                                    className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800 leading-relaxed"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* UMPAN BALIK PERENCANAAN PEMBELAJARAN (Halaman 7 PDF) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                        <MessageSquare className="w-4 h-4 text-amber-600" />
                        <span>Umpan Balik Perencanaan Pembelajaran (Halaman 7 Dokumen)</span>
                      </div>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-semibold">
                        Evaluasi Kualitatif
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          1. Tuliskan kelebihan Perencanaan Pembelajaran:
                        </label>
                        <textarea
                          rows={3}
                          value={currentFeedback.kelebihan}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: {
                                ...berdayakan,
                                feedback: { ...currentFeedback, kelebihan: e.target.value },
                              },
                            })
                          }
                          placeholder="Tuliskan kelebihan perencanaan pembelajaran..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          2. Tuliskan hal yang perlu ditingkatkan dari Perencanaan Pembelajaran:
                        </label>
                        <textarea
                          rows={3}
                          value={currentFeedback.perbaikan}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: {
                                ...berdayakan,
                                feedback: { ...currentFeedback, perbaikan: e.target.value },
                              },
                            })
                          }
                          placeholder="Tuliskan hal yang perlu ditingkatkan..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          3. Tuliskan rekomendasi dan lanjutkan dengan revisi perencanaan pembelajaran sesuai prinsip Pembelajaran Mendalam:
                        </label>
                        <textarea
                          rows={3}
                          value={currentFeedback.rekomendasi}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: {
                                ...berdayakan,
                                feedback: { ...currentFeedback, rekomendasi: e.target.value },
                              },
                            })
                          }
                          placeholder="Tuliskan rekomendasi kelanjutan pembelajaran mendalam..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Catatan Refleksi &amp; Komitmen Guru Binaan Terhadap Perbaikan RPP:
                        </label>
                        <textarea
                          rows={2}
                          value={berdayakan.catatanRefleksiGuru ?? autoBerdayakan.catatanRefleksiGuru}
                          onChange={(e) =>
                            setSambungDraft({
                              ...sambungDraft,
                              berdayakan: {
                                ...berdayakan,
                                catatanRefleksiGuru: e.target.value,
                              },
                            })
                          }
                          placeholder="Catatan refleksi guru terhadap perbaikan modul..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-slate-50/50 hover:bg-white focus:bg-white leading-relaxed italic text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* KETENTUAN SKOR (Halaman 7 PDF) */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs">
                    <span className="font-bold text-slate-800 block mb-2">Ketentuan Skor (Halaman 7 Dokumen):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="font-extrabold text-emerald-700 block">Skor 2: Terpenuhi secara optimal</span>
                        <p className="text-slate-600 mt-0.5">Indikator tersedia, lengkap, jelas, relevan, dan selaras dengan perencanaan pembelajaran.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="font-extrabold text-amber-700 block">Skor 1: Terpenuhi sebagian / belum optimal</span>
                        <p className="text-slate-600 mt-0.5">Indikator sudah ada, tetapi belum lengkap, belum jelas, belum konsisten, atau belum sepenuhnya selaras.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="font-extrabold text-rose-700 block">Skor 0: Belum terpenuhi</span>
                        <p className="text-slate-600 mt-0.5">Indikator belum ada, belum tergambar, atau tidak sesuai dengan yang dipersyaratkan.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <span className="font-extrabold text-slate-700 block">N/A: Tidak relevan</span>
                        <p className="text-slate-600 mt-0.5">Tidak menuliskan di RPP karena opsional dan tidak diperhitungkan dalam skor.</p>
                      </div>
                    </div>
                  </div>

                  {/* LEMBAR RANCANG - COBA - REFLEKSI - PERBAIKI (SIKLUS BERDAYAKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          Lembar Rancang &ndash; Coba &ndash; Refleksi &ndash; Perbaiki (Siklus Implementasi Kelas)
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Diisi guru; rancangan implementasi RPP perbaikan mencakup memahami, mengaplikasikan, merefleksikan, dan menghubungkan materi {currentSupervision.subject}.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextSiklus = berdayakan.siklusList.length + 1;
                          setSambungDraft({
                            ...sambungDraft,
                            berdayakan: {
                              ...berdayakan,
                              siklusList: [
                                ...berdayakan.siklusList,
                                {
                                  siklus: nextSiklus,
                                  rancanganDanUjiCoba: '',
                                  refleksi: '',
                                  perbaikanBerikutnya: '',
                                },
                              ],
                            },
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Siklus</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {berdayakan.siklusList.map((item, idx) => (
                        <div
                          key={item.siklus}
                          className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-extrabold flex items-center justify-center text-xs">
                                S{item.siklus}
                              </span>
                              <h5 className="text-sm font-bold text-slate-900">Siklus {item.siklus}</h5>
                            </div>

                            {berdayakan.siklusList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = berdayakan.siklusList.filter((_, i) => i !== idx);
                                  const reindexed = filtered.map((s, i) => ({ ...s, siklus: i + 1 }));
                                  setSambungDraft({
                                    ...sambungDraft,
                                    berdayakan: { ...berdayakan, siklusList: reindexed },
                                  });
                                }}
                                className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Siklus</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Rancangan &amp; Hasil Uji Coba pada Murid:
                              </label>
                              <textarea
                                rows={4}
                                value={item.rancanganDanUjiCoba}
                                onChange={(e) => {
                                  const updated = [...berdayakan.siklusList];
                                  updated[idx].rancanganDanUjiCoba = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    berdayakan: { ...berdayakan, siklusList: updated },
                                  });
                                }}
                                placeholder="Rancangan aktivitas uji coba dan respons murid..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Refleksi (Berhasil / Belum, Mengapa):
                              </label>
                              <textarea
                                rows={4}
                                value={item.refleksi}
                                onChange={(e) => {
                                  const updated = [...berdayakan.siklusList];
                                  updated[idx].refleksi = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    berdayakan: { ...berdayakan, siklusList: updated },
                                  });
                                }}
                                placeholder="Evaluasi guru terhadap keberhasilan atau kendala..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Perbaikan Berikutnya:
                              </label>
                              <textarea
                                rows={4}
                                value={item.perbaikanBerikutnya}
                                onChange={(e) => {
                                  const updated = [...berdayakan.siklusList];
                                  updated[idx].perbaikanBerikutnya = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    berdayakan: { ...berdayakan, siklusList: updated },
                                  });
                                }}
                                placeholder="Langkah modifikasi dan perbaikan untuk siklus berikutnya..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-amber-600 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TANDA TANGAN KESEPAKATAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Penelaah / Pengawas Pembina</span>
                      <p className="font-bold text-xs text-slate-900">{berdayakan.namaPenelaah || 'Kusnandar, M.Si'}</p>
                      <p className="text-[10px] text-amber-700 font-medium mt-1">Disetujui &amp; Disahkan</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Kepala Sekolah</span>
                      <p className="font-bold text-xs text-slate-900">{sambungDraft.arahkan?.tandaTangan?.kepalaSekolah || 'Kepala Sekolah'}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{currentSupervision.schoolName}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Guru Yang Diobservasi</span>
                      <p className="font-bold text-xs text-slate-900">{currentSupervision.teacherName}</p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">{currentSupervision.subject}</p>
                    </div>
                  </div>

                  {/* TOMBOL SIMPAN TAHAP B */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Menyimpan ke Firebase...' : 'Simpan Tahap B (Berdayakan) ke Firebase'}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
            {renderStageGateFooter('B', 'U')}
          </fieldset>
        )}

        {/* ==================================================== */}
        {/* TAB U: UJI — OBSERVASI KELAS & SUPERVISI PERBAIKAN */}
        {/* ==================================================== */}
        {activeTab === 'U' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold mb-1">
                    TAHAP U &bull; UJI
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Uji: Observasi Kelas &amp; Supervisi Perbaikan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pembuktian lapangan perbaikan pembelajaran guru {currentSupervision.teacherName} menggunakan instrumen resmi Pengawas Pembina Kusnandar, M.Si, terhubung koheren dari Selidiki, Amati, Maknai, Berdayakan dan selaras dengan hasil kesimpulan.
                  </p>
                </div>

                {/* Toolbar Aksi Tahap U */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Cetak Tahap U</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Tahap U'}</span>
                  </button>
                </div>
              </div>

              {/* Subtab switcher (3 Subtabs Uji: Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi) */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUSubTab('pra_observasi')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'pra_observasi'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>1. Wawancara Pra-Observasi</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'pra_observasi' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                  }`}>
                    8 Butir
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('observasi_25')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'observasi_25'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>2. Observasi Kelas (25 Aspek)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'observasi_25' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sambungDraft.uji?.observasiPelaksanaan?.persentaseCapaian || 100}% &bull; {sambungDraft.uji?.observasiPelaksanaan?.predicate || 'Sangat Baik'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('pasca_observasi')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'pasca_observasi'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>3. Pasca-Observasi &amp; Refleksi</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'pasca_observasi' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    Refleksi &amp; RTL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('kesimpulan_uji')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    uSubTab === 'kesimpulan_uji'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>4. Kesimpulan Uji</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'kesimpulan_uji' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300/60'
                  }`}>
                    4 Indikator
                  </span>
                </button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SUBTAB 1: INSTRUMEN RESMI WAWANCARA PRA-OBSERVASI PERBAIKAN */}
            {/* ========================================================= */}
            {uSubTab === 'pra_observasi' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                          <span>Instrumen Resmi Pengawas Pembina Kusnandar, M.Si &bull; Wawancara Pra-Observasi</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Wawancara Pra-Observasi Pembelajaran Perbaikan &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                          Dialog pra-observasi menggali kesiapan pedagogis guru dalam mengimplementasikan Modul Ajar revisi, rancangan alur pembelajaran kontekstual, strategi pelibatan aktif murid (Student Agency), dan antisipasi materi menantang.
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                        <span className="text-purple-200">Mata Pelajaran:</span>
                        <span className="font-bold text-amber-300">{currentSupervision.subject} ({currentSupervision.classGrade})</span>
                      </div>
                    </div>
                  </div>

                  {/* Form 8 Pertanyaan */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                          <span>8 Butir Pertanyaan Dialog Wawancara Pra-Observasi</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Data ini otomatis diselaraskan dengan Modul Ajar Revisi hasil Tahap Berdayakan dan siklus Selidiki, Amati, Maknai.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const auto = generateUjiData(currentSupervision);
                          if (auto.praObservasi) {
                            setSambungDraft({
                              ...sambungDraft,
                              uji: {
                                ...sambungDraft.uji,
                                praObservasi: auto.praObservasi,
                              },
                            });
                            setSaveToast('Template pertanyaan Pra-Observasi berhasil dipulihkan!');
                            setTimeout(() => setSaveToast(null), 3000);
                          }
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Pulihkan Template Jawaban</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {PRA_OBSERVASI_QUESTIONS.map((q, idx) => {
                        const qKey = q.id as 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8';
                        const autoUji = generateUjiData(currentSupervision);
                        const currentVal = ((sambungDraft.uji?.praObservasi && sambungDraft.uji.praObservasi[qKey]) || 
                                            (autoUji.praObservasi && autoUji.praObservasi[qKey]) || '') as string;

                        return (
                          <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-purple-300 transition-colors space-y-2">
                            <label className="block text-xs font-bold text-slate-800 leading-snug">
                              {q.label}
                            </label>
                            <textarea
                              rows={3}
                              value={currentVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                const basePra = sambungDraft.uji?.praObservasi || autoUji.praObservasi || {
                                  q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: ''
                                };
                                const updatedPra: SambungUjiPraObservasi = {
                                  ...basePra,
                                  [qKey]: val,
                                };
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    praObservasi: updatedPra,
                                  },
                                });
                              }}
                              placeholder={`Jawaban guru untuk butir ${idx + 1}...`}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-purple-600 bg-white text-slate-800 leading-relaxed font-normal"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Catatan Kesepakatan Wawancara Pengawas */}
                    <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                      <label className="block text-xs font-bold text-amber-950 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>Catatan Kesepakatan &amp; Arahan Pengawas Pembina (Kusnandar, M.Si):</span>
                      </label>
                      <textarea
                        rows={3}
                        value={
                          sambungDraft.uji?.praObservasi?.supervisorNotes ||
                          generateUjiData(currentSupervision).praObservasi?.supervisorNotes ||
                          'Guru telah sangat siap mempraktikkan modul ajar revisi dengan media kontekstual dan LKPD diferensiasi.'
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoUji = generateUjiData(currentSupervision);
                          const updatedPra: SambungUjiPraObservasi = {
                            ...(sambungDraft.uji?.praObservasi || autoUji.praObservasi || {
                              q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: ''
                            }),
                            supervisorNotes: val,
                          };
                          setSambungDraft({
                            ...sambungDraft,
                            uji: {
                              ...sambungDraft.uji,
                              praObservasi: updatedPra,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs focus:outline-amber-600 bg-white text-slate-800 italic"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Terintegrasi dengan Formulir Pra-Observasi Perbaikan</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Pra-Observasi ke Firebase'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 3: INSTRUMEN RESMI OBSERVASI PEMBELAJARAN (25 BUTIR) */}
            {/* ========================================================= */}
            {uSubTab === 'observasi_25' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-emerald-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                          <span>Instrumen Resmi Supervisi Tatap Muka Pengawas Pembina Kusnandar, M.Si</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Observasi Pelaksanaan Pembelajaran Perbaikan &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-emerald-200/90 max-w-3xl leading-relaxed">
                          Penilaian 25 butir instrumen supervisi klinis dalam 9 kategori kompetensi. Menguji keterlaksanaan diferensiasi proses, penguatan nalar kritis murid, iklim belajar yang aman dan menyenangkan, serta asesmen formatif berkelanjutan.
                        </p>
                      </div>

                      {/* Score Summary Box */}
                      {(() => {
                        const autoUji = generateUjiData(currentSupervision);
                        const obs = sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
                        const totalScore = obs?.totalSkor || 50;
                        const pct = obs?.persentaseCapaian || 100;
                        const pred = obs?.predicate || 'Sangat Baik';

                        return (
                          <div className="shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center min-w-[170px]">
                            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Skor &amp; Predikat</span>
                            <div className="text-2xl font-extrabold text-white mt-0.5">
                              {totalScore} <span className="text-xs font-normal text-emerald-300">/ 50 ({pct}%)</span>
                            </div>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-400 text-slate-950">
                              {pred}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 25 Aspek dalam 9 Kategori */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                          <span>25 Butir Indikator Observasi Kelas (9 Kategori)</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Skala: 0 = Tidak Tampak, 1 = Mulai Tampak / Kurang, 2 = Sangat Berkembang / Maksimal (Maks 50 Skor).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const auto = generateUjiData(currentSupervision);
                          if (auto.observasiPelaksanaan) {
                            setSambungDraft({
                              ...sambungDraft,
                              uji: {
                                ...sambungDraft.uji,
                                observasiPelaksanaan: auto.observasiPelaksanaan,
                              },
                            });
                            setSaveToast('Skor dan catatan 25 butir observasi berhasil dipulihkan!');
                            setTimeout(() => setSaveToast(null), 3000);
                          }
                        }}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Pulihkan Skor &amp; Catatan Observasi</span>
                      </button>
                    </div>

                    {/* Group by category */}
                    {(() => {
                      const autoUji = generateUjiData(currentSupervision);
                      const currentObs = sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
                      const categories = Array.from(new Set(OBSERVASI_ITEMS.map((it) => it.category)));

                      const updateItem = (id: string, score: number, note: string) => {
                        const existingItems = currentObs?.items || {};
                        const updatedItems = {
                          ...existingItems,
                          [id]: { score, note },
                        };
                        let sumScore = 0;
                        OBSERVASI_ITEMS.forEach((it) => {
                          const sc = updatedItems[it.id]?.score !== undefined ? Number(updatedItems[it.id].score) : 2;
                          sumScore += sc;
                        });
                        const pct = parseFloat(((sumScore / 50) * 100).toFixed(1));
                        let pred: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = 'Perlu Perbaikan';
                        if (pct >= 90) pred = 'Sangat Baik';
                        else if (pct >= 80) pred = 'Baik';
                        else if (pct >= 70) pred = 'Cukup';

                        const baseObs = currentObs || autoUji.observasiPelaksanaan;
                        const updatedObs: SambungUjiObservasiPelaksanaan = {
                          ...baseObs,
                          maxPossibleScore: baseObs?.maxPossibleScore || 50,
                          feedback: baseObs?.feedback || { kelebihan: '', perbaikan: '', rekomendasi: '' },
                          items: updatedItems,
                          totalSkor: sumScore,
                          persentaseCapaian: pct,
                          predicate: pred,
                        };

                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            observasiPelaksanaan: updatedObs,
                          },
                        });
                      };

                      return (
                        <div className="space-y-6">
                          {categories.map((cat, catIdx) => {
                            const catItems = OBSERVASI_ITEMS.filter((it) => it.category === cat);
                            return (
                              <div key={cat} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-purple-700 text-white font-bold text-xs flex items-center justify-center">
                                      {catIdx + 1}
                                    </span>
                                    <h6 className="font-extrabold text-xs text-slate-800 tracking-wide uppercase">
                                      {cat}
                                    </h6>
                                  </div>
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    {catItems.length} Aspek Penilaian
                                  </span>
                                </div>

                                <div className="divide-y divide-slate-100 bg-white">
                                  {catItems.map((item) => {
                                    const state = currentObs?.items?.[item.id] || { score: 2, note: '' };
                                    const curScore = state.score !== undefined ? state.score : 2;
                                    const curNote = state.note || '';

                                    return (
                                      <div key={item.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-3">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                                          <div className="flex items-start gap-2.5 flex-1">
                                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                              {item.id}
                                            </span>
                                            <div>
                                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                                {item.aspect}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Score Selector (0, 1, 2) */}
                                          <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
                                            <span className="text-[11px] text-slate-500 font-medium mr-1">Skor:</span>
                                            {[0, 1, 2].map((val) => (
                                              <button
                                                key={val}
                                                type="button"
                                                onClick={() => updateItem(item.id, val, curNote)}
                                                className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${
                                                  curScore === val
                                                    ? val === 2
                                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                                      : val === 1
                                                      ? 'bg-amber-500 text-white shadow-2xs'
                                                      : 'bg-rose-500 text-white shadow-2xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                              >
                                                {val}
                                              </button>
                                            ))}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ml-1 ${
                                              curScore === 2
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : curScore === 1
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-rose-100 text-rose-800'
                                            }`}>
                                              {curScore === 2 ? 'Sangat Baik' : curScore === 1 ? 'Mulai Tampak' : 'Belum Tampak'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Catatan Bukti Pengamatan */}
                                        <div>
                                          <input
                                            type="text"
                                            value={curNote}
                                            onChange={(e) => updateItem(item.id, curScore, e.target.value)}
                                            placeholder="Catatan bukti pengamatan konkret di kelas..."
                                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-emerald-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-800"
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* 3-Point Feedback Resmi Supervisi (PDF Hal 12-13) */}
                    <div className="pt-4 border-t border-slate-200 space-y-4">
                      <h6 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>3-Point Feedback Observasi Implementasi Pembelajaran (Dokumen Resmi Halaman 12-13)</span>
                      </h6>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Kelebihan */}
                        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                          <label className="block text-xs font-bold text-emerald-950">
                            1. Kelebihan yang Diamati (Kekuatan Guru):
                          </label>
                          <textarea
                            rows={4}
                            value={
                              sambungDraft.uji?.observasiPelaksanaan?.feedback?.kelebihan ||
                              generateUjiData(currentSupervision).observasiPelaksanaan?.feedback?.kelebihan ||
                              ''
                            }
                            onChange={(e) => {
                              const autoUji = generateUjiData(currentSupervision);
                              const baseObs = sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
                              if (!baseObs) return;
                              const updatedObs: SambungUjiObservasiPelaksanaan = {
                                ...baseObs,
                                feedback: {
                                  ...baseObs.feedback,
                                  kelebihan: e.target.value,
                                },
                              };
                              setSambungDraft({
                                ...sambungDraft,
                                uji: { ...sambungDraft.uji, observasiPelaksanaan: updatedObs },
                              });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs focus:outline-emerald-600 bg-white"
                          />
                        </div>

                        {/* Perbaikan */}
                        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                          <label className="block text-xs font-bold text-amber-950">
                            2. Aspek yang Perlu Peningkatan:
                          </label>
                          <textarea
                            rows={4}
                            value={
                              sambungDraft.uji?.observasiPelaksanaan?.feedback?.perbaikan ||
                              generateUjiData(currentSupervision).observasiPelaksanaan?.feedback?.perbaikan ||
                              ''
                            }
                            onChange={(e) => {
                              const autoUji = generateUjiData(currentSupervision);
                              const baseObs = sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
                              if (!baseObs) return;
                              const updatedObs: SambungUjiObservasiPelaksanaan = {
                                ...baseObs,
                                feedback: {
                                  ...baseObs.feedback,
                                  perbaikan: e.target.value,
                                },
                              };
                              setSambungDraft({
                                ...sambungDraft,
                                uji: { ...sambungDraft.uji, observasiPelaksanaan: updatedObs },
                              });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-amber-600 bg-white"
                          />
                        </div>

                        {/* Rekomendasi */}
                        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-1.5">
                          <label className="block text-xs font-bold text-indigo-950">
                            3. Rekomendasi Tindak Lanjut Pengawas:
                          </label>
                          <textarea
                            rows={4}
                            value={
                              sambungDraft.uji?.observasiPelaksanaan?.feedback?.rekomendasi ||
                              generateUjiData(currentSupervision).observasiPelaksanaan?.feedback?.rekomendasi ||
                              ''
                            }
                            onChange={(e) => {
                              const autoUji = generateUjiData(currentSupervision);
                              const baseObs = sambungDraft.uji?.observasiPelaksanaan || autoUji.observasiPelaksanaan;
                              if (!baseObs) return;
                              const updatedObs: SambungUjiObservasiPelaksanaan = {
                                ...baseObs,
                                feedback: {
                                  ...baseObs.feedback,
                                  rekomendasi: e.target.value,
                                },
                              };
                              setSambungDraft({
                                ...sambungDraft,
                                uji: { ...sambungDraft.uji, observasiPelaksanaan: updatedObs },
                              });
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-indigo-300 text-xs focus:outline-indigo-600 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Otomatis mensinkronkan data observasi ke Formulir Supervisi Perbaikan</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Observasi Kelas ke Firebase'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 4: INSTRUMEN RESMI PASCA-OBSERVASI & COACHING */}
            {/* ========================================================= */}
            {uSubTab === 'pasca_observasi' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span>Instrumen Resmi Pengawas Pembina Kusnandar, M.Si &bull; Pasca-Observasi &amp; Refleksi</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white">
                          Refleksi &amp; Evaluasi Pasca-Observasi Perbaikan &bull; {currentSupervision.teacherName}
                        </h4>
                        <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                          Sesi dialog refleksi pasca-observasi mengevaluasi keberhasilan implementasi pembelajaran perbaikan, ketercapaian tujuan, keaktifan partisipasi murid, dan menyepakati komitmen aksi keberlanjutan serta diseminasi praktik baik ke Komunitas Belajar (Kombel).
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                        <span className="text-indigo-200">Hasil Evaluasi:</span>
                        <span className="font-bold text-emerald-300">Tercapai &amp; Memuaskan</span>
                      </div>
                    </div>
                  </div>

                  {/* Form 10 Pertanyaan Pasca-Observasi */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span>10 Butir Pertanyaan Dialog Pasca-Observasi &amp; Coaching Alur TIRTA</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Refleksi mendalam guru bersama Pengawas Pembina Kusnandar, M.Si setelah pelaksanaan pembelajaran di kelas.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const auto = generateUjiData(currentSupervision);
                          if (auto.pascaObservasi) {
                            setSambungDraft({
                              ...sambungDraft,
                              uji: {
                                ...sambungDraft.uji,
                                pascaObservasi: auto.pascaObservasi,
                              },
                            });
                            setSaveToast('Catatan refleksi Pasca-Observasi berhasil dipulihkan!');
                            setTimeout(() => setSaveToast(null), 3000);
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors self-start sm:self-auto flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Pulihkan Template Refleksi</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const autoUji = generateUjiData(currentSupervision);
                        const curPasca = sambungDraft.uji?.pascaObservasi || autoUji.pascaObservasi;
                        if (!curPasca) return null;
                        const questions = [
                          ...PASCA_OBSERVASI_QUESTIONS,
                          {
                            id: 'q10',
                            label: '10. Komitmen aksi nyata keberlanjutan dan rencana diseminasi praktik baik ke Komunitas Belajar (Kombel) / MGMP:',
                          },
                        ];

                        return questions.map((q, idx) => {
                          const qKey = q.id as keyof typeof curPasca.pertanyaanList;
                          const currentVal = (curPasca.pertanyaanList && curPasca.pertanyaanList[qKey]) || 
                                             (autoUji.pascaObservasi?.pertanyaanList && autoUji.pascaObservasi.pertanyaanList[qKey]) || '';

                          return (
                            <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition-colors space-y-2">
                              <label className="block text-xs font-bold text-slate-800 leading-snug">
                                {q.label}
                              </label>
                              <textarea
                                rows={3}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updatedPasca: SambungUjiPascaObservasi = {
                                    ...curPasca,
                                    pertanyaanList: {
                                      ...curPasca.pertanyaanList,
                                      [qKey]: val,
                                    },
                                  };
                                  setSambungDraft({
                                    ...sambungDraft,
                                    uji: {
                                      ...sambungDraft.uji,
                                      pascaObservasi: updatedPasca,
                                    },
                                  });
                                }}
                                placeholder={`Tanggapan reflektif butir ${idx + 1}...`}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white text-slate-800 leading-relaxed font-normal"
                              />
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Kesan Umum & Rekomendasi Diseminasi Pengawas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                        <label className="block text-xs font-bold text-indigo-950 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-700" />
                          <span>Kesan Umum Guru Terhadap Hasil Perubahan:</span>
                        </label>
                        <textarea
                          rows={3}
                          value={
                            sambungDraft.uji?.pascaObservasi?.kesanUmum ||
                            generateUjiData(currentSupervision).pascaObservasi?.kesanUmum ||
                            'Guru merasa jauh lebih percaya diri; murid merespons dengan penuh antusiasme.'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const autoUji = generateUjiData(currentSupervision);
                            const basePasca = sambungDraft.uji?.pascaObservasi || autoUji.pascaObservasi;
                            if (!basePasca) return;
                            setSambungDraft({
                              ...sambungDraft,
                              uji: {
                                ...sambungDraft.uji,
                                pascaObservasi: { ...basePasca, kesanUmum: val },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-xs focus:outline-indigo-600 bg-white text-slate-800"
                        />
                      </div>

                      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-2">
                        <label className="block text-xs font-bold text-purple-950 flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-700" />
                          <span>Rekomendasi Diseminasi &amp; Komitmen Pengawas (Kusnandar, M.Si):</span>
                        </label>
                        <textarea
                          rows={3}
                          value={
                            sambungDraft.uji?.pascaObservasi?.saranMasukan ||
                            generateUjiData(currentSupervision).pascaObservasi?.saranMasukan ||
                            'Praktik baik perbaikan ini sangat layak didiseminasikan dalam Komunitas Belajar (Kombel) sekolah dan forum MGMP.'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const autoUji = generateUjiData(currentSupervision);
                            const basePasca = sambungDraft.uji?.pascaObservasi || autoUji.pascaObservasi;
                            if (!basePasca) return;
                            setSambungDraft({
                              ...sambungDraft,
                              uji: {
                                ...sambungDraft.uji,
                                pascaObservasi: { ...basePasca, saranMasukan: val },
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-purple-300 text-xs focus:outline-purple-600 bg-white text-slate-800 italic"
                        />
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Terintegrasi dengan Formulir Pasca-Observasi Perbaikan</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Pasca-Observasi ke Firebase'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 4: KESIMPULAN UJI (SESUAI KOMPONEN UNGGAHAN)       */}
            {/* ========================================================= */}
            {uSubTab === 'kesimpulan_uji' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                  {/* Header & Quick Action Bar */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-emerald-50/50 to-indigo-50/40 border border-purple-200/80 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wide">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Kesimpulan Uji</span>
                          </span>
                          <span className="text-[11px] font-bold text-purple-900 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded">
                            Hasil Uji Coba Lapangan &bull; 4 Indikator
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>Tersinkronkan ke Tahap NYATAKAN (After)</span>
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          Kesimpulan Uji diambil dari telaah RPP Berdayakan dan Observasi di UJI
                        </h4>
                        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                          Sintesis capaian akhir (kondisi setelah perbaikan) guru <strong>{currentSupervision.teacherName}</strong> pada mata pelajaran <strong>{currentSupervision.subject}</strong>. Data ini dirumuskan dari perpaduan hasil <em>Telaah Modul Ajar Perbaikan (Tahap B &bull; Berdayakan)</em> serta <em>Observasi Kelas Tatap Muka 25 Aspek (Tahap U &bull; Uji)</em>, dan otomatis menjadi data rujukan kolom <strong>Setelah SAMBUNG (After)</strong> di Tahap Nyatakan.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleAutoFillKesimpulanUji}
                          disabled={isSaving}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Sintesis deskripsi 4 indikator otomatis berdasarkan perpaduan hasil Telaah RPP Berdayakan dan Observasi Kelas di Uji"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Sintesis Otomatis Uji</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveKesimpulanUji}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Simpan tabel kesimpulan uji ke database Firebase"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan Kesimpulan Uji'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('N')}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Lanjutkan ke Tahap N • Nyatakan untuk melihat perbandingan Before vs After secara menyeluruh"
                        >
                          <span>Ke Tahap N • Nyatakan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Sumber Data Penarikan Kesimpulan Uji */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">1. Telaah RPP Berdayakan (B)</span>
                        <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {sambungDraft.berdayakan?.telaahSummary?.finalScore || 95.5} / 100
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Predikat: <strong className="text-blue-600">{sambungDraft.berdayakan?.telaahSummary?.predicate || 'Sangat Baik'}</strong> (Desain RPP Revisi)
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">2. Observasi Kelas di UJI (U)</span>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {sambungDraft.uji?.observasiPelaksanaan?.persentaseCapaian || 100}%
                      </p>
                      <p className="text-[11px] text-slate-500">
                        25 Aspek &bull; Predikat: <strong className="text-emerald-600">{sambungDraft.uji?.observasiPelaksanaan?.predicate || 'Sangat Baik'}</strong>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">3. Pasca-Observasi &amp; Refleksi</span>
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm">
                        10 Pertanyaan Lengkap
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Komitmen &amp; Kesadaran Guru Terwujud
                      </p>
                    </div>
                  </div>

                  {/* TABEL KESIMPULAN UJI (SESUAI KOMPONEN UNGGAHAN) */}
                  <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm overflow-hidden">
                    {/* Header Tabel */}
                    <div className="bg-slate-100 px-5 py-3 border-b-2 border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">
                          Kesimpulan Uji diambil dari telaah RPP Berdayakan dan Observasi di UJI
                        </h4>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Tabel Indikator dan Deskripsi Kondisi Akhir (Setelah Supervisi SAMBUNG)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 italic shrink-0">
                        *Klik dan ketik langsung pada kolom Deskripsi untuk mengubah data
                      </span>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b-2 border-slate-300 text-xs font-black text-slate-800">
                            <th className="py-3 px-4 border-r-2 border-slate-300 w-2/5 sm:w-1/3">
                              Indikator
                            </th>
                            <th className="py-3 px-4 w-3/5 sm:w-2/3">
                              Deskripsi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 text-xs">
                          {/* Row 1: Guru berorientasi pada pengalaman belajar murid */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Guru berorientasi pada pengalaman belajar murid
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      Peran Guru &bull; Capaian Setelah Supervisi
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Bagaimana transformasi peran guru setelah pendampingan klinis? Apakah guru telah berhasil menjadi fasilitator inkuiri aktif yang memuliakan murid?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.uji?.matriksAfter?.peranGuru || ''}
                                onChange={(e) => handleUpdateKesimpulanUjiIndikator('peranGuru', e.target.value)}
                                placeholder="Tuliskan deskripsi hasil uji peran guru setelah perbaikan (menjadi fasilitator inkuiri aktif, mendampingi murid menemukan konsep)..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 2: Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                                    <Users className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran menghasilkan murid aktif mengaplikasikan pengetahuan
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                      Aktivitas Murid &bull; Capaian Setelah Supervisi
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Sejauh mana murid terbukti antusias berpikir kritis, berdiskusi kelompok, menguji hipotesis, dan mempraktikkan materi pembelajaran?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.uji?.matriksAfter?.aktivitasMurid || ''}
                                onChange={(e) => handleUpdateKesimpulanUjiIndikator('aktivitasMurid', e.target.value)}
                                placeholder="Tuliskan deskripsi hasil uji keaktifan murid dalam mengaplikasikan pengetahuan pada pembelajaran di kelas..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 3: Pembelajaran terhubung dengan konteks nyata */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                                    <Compass className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran terhubung dengan konteks nyata
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Konteks Nyata &bull; Capaian Setelah Supervisi
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Bagaimana materi ajar dan tugas telah dikaitkan secara nyata dengan kehidupan sehari-hari, lingkungan sekitar murid, atau isu kontekstual?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.uji?.matriksAfter?.konteksNyata || ''}
                                onChange={(e) => handleUpdateKesimpulanUjiIndikator('konteksNyata', e.target.value)}
                                placeholder="Tuliskan deskripsi hasil uji keterhubungan materi dengan konteks riil kehidupan murid..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>

                          {/* Row 4: Pembelajaran membiasakan murid melakukan refleksi */}
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 align-top border-r-2 border-slate-300 bg-slate-50/30">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      Pembelajaran membiasakan murid melakukan refleksi
                                    </p>
                                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                      Refleksi Murid &bull; Capaian Setelah Supervisi
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                                  Bagaimana pembiasaan refleksi telah membudaya, di mana murid mampu mengevaluasi proses belajarnya dan merumuskan makna pribadi?
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <textarea
                                rows={4}
                                disabled={!canEdit}
                                value={sambungDraft.uji?.matriksAfter?.refleksiMurid || ''}
                                onChange={(e) => handleUpdateKesimpulanUjiIndikator('refleksiMurid', e.target.value)}
                                placeholder="Tuliskan deskripsi hasil uji pembiasaan refleksi murid (menggunakan jurnal refleksi, lembar metakognisi, atau umpan balik terstruktur)..."
                                className="w-full p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-xs text-slate-800 leading-relaxed resize-y bg-white disabled:bg-slate-50 disabled:text-slate-600 transition-all font-medium"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer info */}
                    <div className="bg-slate-50 px-5 py-3 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Data tersimpan otomatis ke Cloud Firebase dan langsung mengisi kolom 'Setelah SAMBUNG (After)' pada Tahap Nyatakan.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveKesimpulanUji}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Kesimpulan Uji'}</span>
                      </button>
                    </div>
                  </div>

                  {/* KARTU PREVIEW KOMPARASI BEFORE (SELIDIKI) VS AFTER (UJI) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                        <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                        <span>Korelasi Kesimpulan: Selidiki (Kondisi Awal) vs Uji (Kondisi Akhir)</span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Siap diverifikasi di Tahap N (Nyatakan)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Before Box */}
                      <div className="p-4 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                          <span className="font-extrabold text-amber-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black">S</span>
                            <span>Kesimpulan Selidiki (Before)</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Baseline Awal</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          <li><strong>Peran Guru:</strong> {sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}</li>
                          <li><strong>Aktivitas Murid:</strong> {sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}</li>
                          <li><strong>Konteks Nyata:</strong> {sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}</li>
                          <li><strong>Refleksi Murid:</strong> {sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}</li>
                        </ul>
                      </div>

                      {/* After Box */}
                      <div className="p-4 rounded-xl bg-white border border-purple-200/90 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                          <span className="font-extrabold text-purple-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center text-[10px] font-black">U</span>
                            <span>Kesimpulan Uji (After)</span>
                          </span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Capaian Teruji</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-600">
                          <li><strong>Peran Guru:</strong> {sambungDraft.uji?.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}</li>
                          <li><strong>Aktivitas Murid:</strong> {sambungDraft.uji?.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}</li>
                          <li><strong>Konteks Nyata:</strong> {sambungDraft.uji?.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}</li>
                          <li><strong>Refleksi Murid:</strong> {sambungDraft.uji?.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}
            {renderStageGateFooter('U', 'N')}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB N: NYATAKAN — BEFORE-AFTER & DATA DAMPAK */}
        {/* ==================================================== */}
        {activeTab === 'N' && (
          <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
            <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold mb-1">
                TAHAP N &bull; NYATAKAN
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Perubahan Pembelajaran (Before&ndash;After)
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan harus disertai bukti konkret dari pembelajaran guru {currentSupervision.teacherName}.
              </p>
            </div>

            {/* Tabel Perubahan (Before–After) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-rose-600" />
                    <span>Tabel Perubahan Pembelajaran (Before&ndash;After)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Membandingkan kondisi pembelajaran guru <strong>{currentSupervision.teacherName}</strong> sebelum supervisi (Before) dan setelah pendampingan supervisi SAMBUNG (After) pada 4 aspek perubahan, disertai bukti kode artefak pendukung.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const before = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                      const after = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                      const curBA = sambungDraft.nyatakan?.beforeAfter || [];
                      const defaultBKT = [
                        'BKT-01 (Rekaman Video & Foto Praktik Kelas)',
                        'BKT-02 (LKPD Kelompok & Hasil Kerja Murid)',
                        'BKT-03 (Laporan Studi Kasus & Konteks Nyata)',
                        'BKT-04 (Lembar Refleksi Diri & Exit Ticket)',
                      ];
                      setSambungDraft({
                        ...sambungDraft,
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          beforeAfter: [
                            { aspek: 'Peran guru', sebelumSambung: before.peranGuru, setelahSambung: after.peranGuru, buktiKode: curBA[0]?.buktiKode || defaultBKT[0] },
                            { aspek: 'Aktivitas murid', sebelumSambung: before.aktivitasMurid, setelahSambung: after.aktivitasMurid, buktiKode: curBA[1]?.buktiKode || defaultBKT[1] },
                            { aspek: 'Konteks kehidupan nyata', sebelumSambung: before.konteksNyata, setelahSambung: after.konteksNyata, buktiKode: curBA[2]?.buktiKode || defaultBKT[2] },
                            { aspek: 'Refleksi murid', sebelumSambung: before.refleksiMurid, setelahSambung: after.refleksiMurid, buktiKode: curBA[3]?.buktiKode || defaultBKT[3] },
                          ],
                        },
                      });
                      setSaveToast('Deskripsi Before-After berhasil diselaraskan!');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Selaraskan dari Selidiki &amp; Uji</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <th className="py-3 px-3.5 text-center w-12">No</th>
                      <th className="py-3 px-3.5 text-left w-52">Aspek Perubahan</th>
                      <th className="py-3 px-3.5 text-left">Sebelum Supervisi SAMBUNG (Before)</th>
                      <th className="py-3 px-3.5 text-left">Setelah Supervisi SAMBUNG (After)</th>
                      <th className="py-3 px-3.5 text-left w-64">Bukti / Kode Artefak Pendukung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Row 1: Peran Guru */}
                    <tr className="hover:bg-slate-50/50 align-top">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">1</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Peran Guru</span>
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Aspek 1 &bull; Pola Mengajar</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[0]?.sebelumSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[0]) curList[0] = { ...curList[0], sebelumSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30 text-slate-800"
                          placeholder="Deskripsi peran guru sebelum supervisi SAMBUNG..."
                        />
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[0]?.setelahSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[0]) curList[0] = { ...curList[0], setelahSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi peran guru setelah supervisi SAMBUNG..."
                        />
                      </td>
                      <td className="py-3 px-3.5 bg-indigo-50/20">
                        <input
                          type="text"
                          value={sambungDraft.nyatakan?.beforeAfter?.[0]?.buktiKode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[0]) curList[0] = { ...curList[0], buktiKode: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-indigo-600 bg-white font-medium text-indigo-900"
                          placeholder="Contoh: BKT-01 (Rekaman Video & Foto Kelas)"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Kode bukti fisik pelaksanaan</span>
                      </td>
                    </tr>

                    {/* Row 2: Aktivitas Murid */}
                    <tr className="hover:bg-slate-50/50 align-top">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">2</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Aktivitas Murid</span>
                            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Aspek 2 &bull; Keterlibatan Belajar</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[1]?.sebelumSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[1]) curList[1] = { ...curList[1], sebelumSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30 text-slate-800"
                          placeholder="Deskripsi aktivitas murid sebelum supervisi SAMBUNG..."
                        />
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[1]?.setelahSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[1]) curList[1] = { ...curList[1], setelahSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi aktivitas murid setelah supervisi SAMBUNG..."
                        />
                      </td>
                      <td className="py-3 px-3.5 bg-purple-50/20">
                        <input
                          type="text"
                          value={sambungDraft.nyatakan?.beforeAfter?.[1]?.buktiKode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[1]) curList[1] = { ...curList[1], buktiKode: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-indigo-600 bg-white font-medium text-purple-900"
                          placeholder="Contoh: BKT-02 (LKPD Kelompok & Laporan Praktik)"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Kode bukti fisik pelaksanaan</span>
                      </td>
                    </tr>

                    {/* Row 3: Konteks Kehidupan Nyata */}
                    <tr className="hover:bg-slate-50/50 align-top">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">3</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Konteks Kehidupan Nyata</span>
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Aspek 3 &bull; Relevansi Kontekstual</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[2]?.sebelumSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[2]) curList[2] = { ...curList[2], sebelumSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30 text-slate-800"
                          placeholder="Deskripsi keterkaitan konteks nyata sebelum supervisi..."
                        />
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[2]?.setelahSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[2]) curList[2] = { ...curList[2], setelahSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi keterkaitan konteks nyata setelah supervisi..."
                        />
                      </td>
                      <td className="py-3 px-3.5 bg-amber-50/20">
                        <input
                          type="text"
                          value={sambungDraft.nyatakan?.beforeAfter?.[2]?.buktiKode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[2]) curList[2] = { ...curList[2], buktiKode: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-indigo-600 bg-white font-medium text-amber-900"
                          placeholder="Contoh: BKT-03 (Laporan Studi Kasus Murid)"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Kode bukti fisik pelaksanaan</span>
                      </td>
                    </tr>

                    {/* Row 4: Refleksi Murid */}
                    <tr className="hover:bg-slate-50/50 align-top">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400">4</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Refleksi Murid</span>
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Aspek 4 &bull; Budaya Metakognisi</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[3]?.sebelumSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[3]) curList[3] = { ...curList[3], sebelumSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30 text-slate-800"
                          placeholder="Deskripsi rutinitas refleksi sebelum supervisi..."
                        />
                      </td>
                      <td className="py-3 px-3.5">
                        <textarea
                          rows={3}
                          value={sambungDraft.nyatakan?.beforeAfter?.[3]?.setelahSambung || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[3]) curList[3] = { ...curList[3], setelahSambung: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi rutinitas refleksi setelah supervisi..."
                        />
                      </td>
                      <td className="py-3 px-3.5 bg-blue-50/20">
                        <input
                          type="text"
                          value={sambungDraft.nyatakan?.beforeAfter?.[3]?.buktiKode || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curList = [...(sambungDraft.nyatakan?.beforeAfter || [])];
                            if (curList[3]) curList[3] = { ...curList[3], buktiKode: val };
                            setSambungDraft({
                              ...sambungDraft,
                              nyatakan: { ...sambungDraft.nyatakan, beforeAfter: curList },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-indigo-600 bg-white font-medium text-blue-900"
                          placeholder="Contoh: BKT-04 (Lembar Refleksi & Exit Ticket)"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Kode bukti fisik pelaksanaan</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {renderStageGateFooter('N', 'G')}
            </div>
          </div>
        </fieldset>
      )}

        {/* ==================================================== */}
        {/* ==================================================== */}
        {/* TAB G: GERAKKAN — RENCANA TINDAK LANJUT DARI HASIL NYATAKAN & PENGIMBASAN */}
        {/* ==================================================== */}
        {activeTab === 'G' && (
          <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
            <div className="space-y-6">
              {/* Header Tab G */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800 text-xs font-bold mb-1">
                      TAHAP G &bull; GERAKKAN
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Gerakkan: Buatkan Rencana Tindak Lanjut dari Hasil Nyatakan
                    </h3>
                    <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
                      Rencana Tindak Lanjut (RTL) yang dibangun secara koheren dan berkesinambungan, menghubungkan seluruh alur SAMBUNG: temuan <strong>Selidiki (S)</strong>, catatan <strong>Amati (A)</strong>, kesepakatan coaching <strong>Maknai (M)</strong>, modul perbaikan <strong>Berdayakan (B)</strong>, pembuktian lapangan <strong>Uji (U)</strong>, data pembuktian <strong>Nyatakan (N)</strong>, dan diselaraskan penuh dengan <strong>Kesimpulan Transformasi Pembelajaran</strong> untuk guru {currentSupervision.teacherName} ({currentSupervision.subject} &bull; {currentSupervision.schoolName}).
                    </p>
                  </div>

                  {/* Toolbar Aksi Tahap G */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Cetak Tahap G</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Tahap G'}</span>
                    </button>
                  </div>
                </div>

                {/* Subtab Switcher Tab G (4 Subtabs) */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setGSubTab('rtl_nyatakan')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gSubTab === 'rtl_nyatakan'
                        ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>1. RTL dari Hasil Nyatakan (Utama)</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">5 Fokus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGSubTab('benang_merah')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gSubTab === 'benang_merah'
                        ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2. Benang Merah Alur SAMBUNG (S s.d. G)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGSubTab('pengimbasan')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gSubTab === 'pengimbasan'
                        ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>3. Diseminasi &amp; Pengimbasan Praktik Baik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGSubTab('pengesahan')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      gSubTab === 'pengesahan'
                        ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>4. Lembar Pengesahan Tripartit</span>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SUBTAB 1: RTL DARI HASIL NYATAKAN (INSTRUMEN UTAMA)      */}
              {/* ========================================================= */}
              {gSubTab === 'rtl_nyatakan' && (() => {
                const effectiveRtlList = (sambungDraft.gerakkan.rtlNyatakan && sambungDraft.gerakkan.rtlNyatakan.length > 0)
                  ? sambungDraft.gerakkan.rtlNyatakan
                  : generateGerakkanData(currentSupervision).rtlNyatakan;

                return (
                  <div className="space-y-6">
                    {/* Banner Pengantar Sesuai Unggahan User */}
                    <div className="bg-gradient-to-r from-cyan-50 via-teal-50 to-indigo-50 border border-cyan-200 rounded-2xl p-4.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-cyan-700 text-white font-extrabold text-[11px] tracking-wide">
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>INSTRUMEN RESMI TAHAP GERAKKAN</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            Rencana Tindak Lanjut Berdasarkan Hasil Nyatakan &amp; Kesimpulan Transformasi
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                            Diisi secara sistematis menghubungkan 5 indikator perubahan yang telah dinyatakan dan diverifikasi di Tahap Nyatakan menjadi rencana aksi nyata guru <strong>{currentSupervision.teacherName}</strong> bersama komunitas belajar dan pengawas pembina.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const generated = generateGerakkanData(currentSupervision);
                              setSambungDraft({
                                ...sambungDraft,
                                gerakkan: {
                                  ...sambungDraft.gerakkan,
                                  rtlNyatakan: generated.rtlNyatakan,
                                  kesimpulanAlurSambung: generated.kesimpulanAlurSambung,
                                },
                              });
                              setSaveToast('Data RTL berhasil disinkronkan ulang dari hasil Nyatakan dan Uji!');
                              setTimeout(() => setSaveToast(null), 3000);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-cyan-300 bg-white hover:bg-cyan-50 text-cyan-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Sinkronkan Ulang dari Nyatakan</span>
                          </button>
                        </div>
                      </div>

                      {/* Status Terkini Supervisi */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-cyan-200/60 text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                          Materi Pokok: <strong className="text-cyan-900">{currentSupervision.lessonTitle || currentSupervision.subject}</strong>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                          Skor Telaah Modul: {currentSupervision.perangkatAjar?.telaahSummary?.finalScore ?? 92.5}/100 ({currentSupervision.perangkatAjar?.telaahSummary?.predicate || 'Sangat Baik'})
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                          Skor Observasi Kelas: {currentSupervision.observasiKelas?.score ?? 94.0}/100 ({currentSupervision.observasiKelas?.predicate || 'Sangat Baik'})
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold">
                          Pengawas Pembina: Kusnandar, M.Si
                        </span>
                      </div>
                    </div>

                    {/* TABEL UTAMA: RENCANA TINDAK LANJUT DARI HASIL NYATAKAN */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-700" />
                          <span>Tabel Rencana Tindak Lanjut Berdasarkan Hasil Nyatakan &amp; Kesimpulan (5 Indikator Transformasi)</span>
                        </h4>

                        <button
                          type="button"
                          onClick={() => {
                            const currentList = sambungDraft.gerakkan.rtlNyatakan || effectiveRtlList;
                            const newItem: SambungRtlNyatakanItem = {
                              id: Date.now(),
                              indikator: 'Indikator Transformasi Tambahan',
                              hasilNyatakan: 'Deskripsi hasil capaian pada tahap Nyatakan...',
                              rencanaTindakLanjut: 'Rencana aksi konkret yang akan dilaksanakan guru...',
                              mitraKolaborasi: 'Komunitas Belajar (Kombel) / Rekan Sejawat',
                              waktuPelaksanaan: '1 Bulan ke depan',
                              buktiKeberhasilan: 'Dokumentasi bukti fisik pelaksanaan',
                              rekomendasiSupervisi: 'Rekomendasi pendampingan supervisor',
                            };
                            setSambungDraft({
                              ...sambungDraft,
                              gerakkan: {
                                ...sambungDraft.gerakkan,
                                rtlNyatakan: [...currentList, newItem],
                              },
                            });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Indikator RTL</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse rounded-2xl overflow-hidden border border-slate-200 bg-white">
                          <thead>
                            <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                              <th className="py-3 px-3 text-center w-10">No</th>
                              <th className="py-3 px-3 text-left w-52">Fokus Transformasi (Hasil Nyatakan)</th>
                              <th className="py-3 px-3 text-left w-64">Rangkuman Hasil Nyatakan &amp; Kesimpulan Uji</th>
                              <th className="py-3 px-3 text-left">Rencana Tindak Lanjut Konkret (Aksi Guru)</th>
                              <th className="py-3 px-3 text-left w-48">Mitra Kolaborasi</th>
                              <th className="py-3 px-3 text-left w-36">Waktu &amp; Bukti Keberhasilan</th>
                              <th className="py-3 px-3 text-left w-52">Rekomendasi Supervisi (Kusnandar, M.Si)</th>
                              <th className="py-3 px-2 text-center w-10">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {effectiveRtlList.map((item, idx) => (
                              <tr key={item.id || idx} className="hover:bg-slate-50/60 align-top">
                                <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                
                                {/* Fokus Transformasi */}
                                <td className="py-3 px-3 bg-slate-50/50">
                                  <textarea
                                    rows={3}
                                    value={item.indikator}
                                    onChange={(e) => {
                                      const list = [...effectiveRtlList];
                                      list[idx] = { ...list[idx], indikator: e.target.value };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                      });
                                    }}
                                    className="w-full font-bold text-slate-900 bg-transparent border-0 focus:ring-1 focus:ring-cyan-500 rounded p-1 text-xs resize-y"
                                  />
                                </td>

                                {/* Rangkuman Hasil Nyatakan & Uji */}
                                <td className="py-3 px-3 bg-cyan-50/20">
                                  <textarea
                                    rows={4}
                                    value={item.hasilNyatakan}
                                    onChange={(e) => {
                                      const list = [...effectiveRtlList];
                                      list[idx] = { ...list[idx], hasilNyatakan: e.target.value };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                      });
                                    }}
                                    className="w-full text-slate-700 bg-white/70 border border-cyan-200/80 rounded-lg p-2 text-xs focus:outline-cyan-600 resize-y leading-relaxed"
                                    placeholder="Temuan Before vs After di Tahap Nyatakan..."
                                  />
                                </td>

                                {/* Rencana Tindak Lanjut Konkret */}
                                <td className="py-3 px-3">
                                  <textarea
                                    rows={4}
                                    value={item.rencanaTindakLanjut}
                                    onChange={(e) => {
                                      const list = [...effectiveRtlList];
                                      list[idx] = { ...list[idx], rencanaTindakLanjut: e.target.value };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                      });
                                    }}
                                    className="w-full font-medium text-slate-900 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:border-cyan-600 focus:outline-none resize-y leading-relaxed"
                                    placeholder="Langkah aksi nyata guru..."
                                  />
                                </td>

                                {/* Mitra Kolaborasi */}
                                <td className="py-3 px-3">
                                  <textarea
                                    rows={3}
                                    value={item.mitraKolaborasi}
                                    onChange={(e) => {
                                      const list = [...effectiveRtlList];
                                      list[idx] = { ...list[idx], mitraKolaborasi: e.target.value };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                      });
                                    }}
                                    className="w-full text-slate-700 bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-cyan-600 resize-y"
                                    placeholder="Kombel, MGMP, Pengawas..."
                                  />
                                </td>

                                {/* Waktu & Bukti Keberhasilan */}
                                <td className="py-3 px-3 space-y-1.5">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Waktu:</span>
                                    <input
                                      type="text"
                                      value={item.waktuPelaksanaan}
                                      onChange={(e) => {
                                        const list = [...effectiveRtlList];
                                        list[idx] = { ...list[idx], waktuPelaksanaan: e.target.value };
                                        setSambungDraft({
                                          ...sambungDraft,
                                          gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                                      placeholder="Target waktu..."
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Bukti:</span>
                                    <textarea
                                      rows={2}
                                      value={item.buktiKeberhasilan}
                                      onChange={(e) => {
                                        const list = [...effectiveRtlList];
                                        list[idx] = { ...list[idx], buktiKeberhasilan: e.target.value };
                                        setSambungDraft({
                                          ...sambungDraft,
                                          gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                        });
                                      }}
                                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 resize-y"
                                      placeholder="Indikator capaian..."
                                    />
                                  </div>
                                </td>

                                {/* Rekomendasi Supervisi */}
                                <td className="py-3 px-3 bg-amber-50/20">
                                  <textarea
                                    rows={4}
                                    value={item.rekomendasiSupervisi}
                                    onChange={(e) => {
                                      const list = [...effectiveRtlList];
                                      list[idx] = { ...list[idx], rekomendasiSupervisi: e.target.value };
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                      });
                                    }}
                                    className="w-full text-slate-800 bg-white/80 border border-amber-200 rounded-lg p-2 text-xs focus:outline-amber-600 resize-y leading-relaxed"
                                    placeholder="Rekomendasi dari Pengawas Kusnandar, M.Si..."
                                  />
                                </td>

                                {/* Aksi Hapus */}
                                <td className="py-3 px-2 text-center">
                                  {effectiveRtlList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = effectiveRtlList.filter((_, i) => i !== idx);
                                        setSambungDraft({
                                          ...sambungDraft,
                                          gerakkan: { ...sambungDraft.gerakkan, rtlNyatakan: list },
                                        });
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                      title="Hapus baris"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* TABEL PELENGKAP: RENCANA TINDAK LANJUT TEMUAN SUPERVISI LAPANGAN */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600" />
                            <span>Tabel Tindak Lanjut Temuan Observasi &amp; Supervisi Klinis</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Pencatatan temuan spesifik kelas dan langkah konkrit yang diambil penanggung jawab dalam kurun waktu terdekat.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const currentList = sambungDraft.gerakkan.tindakLanjut;
                            const newList = [
                              ...currentList,
                              {
                                id: Date.now(),
                                temuanSupervisi: '',
                                tindakLanjut: '',
                                penanggungJawab: currentSupervision.teacherName,
                                waktu: '1 Minggu ke depan',
                                hasil: '',
                              },
                            ];
                            setSambungDraft({
                              ...sambungDraft,
                              gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: newList },
                            });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Temuan</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <thead>
                            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                              <th className="py-2.5 px-3 text-center w-12">No</th>
                              <th className="py-2.5 px-3 text-left">Temuan Supervisi Lapangan</th>
                              <th className="py-2.5 px-3 text-left">Aksi Tindak Lanjut</th>
                              <th className="py-2.5 px-3 text-left w-40">Penanggung Jawab</th>
                              <th className="py-2.5 px-3 text-left w-36">Waktu</th>
                              <th className="py-2.5 px-3 text-left w-52">Target Hasil</th>
                              <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sambungDraft.gerakkan.tindakLanjut.map((item, idx) => (
                              <tr key={item.id || idx}>
                                <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.temuanSupervisi}
                                    onChange={(e) => {
                                      const list = [...sambungDraft.gerakkan.tindakLanjut];
                                      list[idx].temuanSupervisi = e.target.value;
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                      });
                                    }}
                                    placeholder="Catatan temuan..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.tindakLanjut}
                                    onChange={(e) => {
                                      const list = [...sambungDraft.gerakkan.tindakLanjut];
                                      list[idx].tindakLanjut = e.target.value;
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                      });
                                    }}
                                    placeholder="Aksi tindak lanjut..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.penanggungJawab}
                                    onChange={(e) => {
                                      const list = [...sambungDraft.gerakkan.tindakLanjut];
                                      list[idx].penanggungJawab = e.target.value;
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.waktu}
                                    onChange={(e) => {
                                      const list = [...sambungDraft.gerakkan.tindakLanjut];
                                      list[idx].waktu = e.target.value;
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                      });
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.hasil}
                                    onChange={(e) => {
                                      const list = [...sambungDraft.gerakkan.tindakLanjut];
                                      list[idx].hasil = e.target.value;
                                      setSambungDraft({
                                        ...sambungDraft,
                                        gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                      });
                                    }}
                                    placeholder="Hasil perbaikan..."
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {sambungDraft.gerakkan.tindakLanjut.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = sambungDraft.gerakkan.tindakLanjut.filter((_, i) => i !== idx);
                                        setSambungDraft({
                                          ...sambungDraft,
                                          gerakkan: { ...sambungDraft.gerakkan, tindakLanjut: list },
                                        });
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================= */}
              {/* SUBTAB 2: BENANG MERAH ALUR SAMBUNG (S SAMPAI G)          */}
              {/* ========================================================= */}
              {gSubTab === 'benang_merah' && (() => {
                const alur = sambungDraft.gerakkan.kesimpulanAlurSambung || generateGerakkanData(currentSupervision).kesimpulanAlurSambung;

                return (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase">
                          Alur Berkesinambungan
                        </span>
                        <h4 className="text-base font-bold text-white">
                          Matriks Keterhubungan 7 Tahap Supervisi SAMBUNG (S &rarr; A &rarr; M &rarr; B &rarr; U &rarr; N &rarr; G)
                        </h4>
                      </div>
                      <p className="text-xs text-indigo-100/90 leading-relaxed max-w-4xl">
                        Supervisi akademik bermakna menghubungkan temuan awal dari <strong>Selidiki</strong> hingga pembuktian lapangan di <strong>Uji &amp; Nyatakan</strong>, dan bermuara pada aksi konkret pada tahap <strong>Gerakkan</strong>. Setiap tahap memiliki bukti fisik terverifikasi.
                      </p>
                    </div>

                    {/* 7 Pipeline Cards Visual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 1. S - Selidiki */}
                      <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">S</span>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">Tahap 1 &bull; Selidiki</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Baseline &amp; Telaah Modul Awal</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.selidikiBaseline}
                        </p>
                      </div>

                      {/* 2. A - Amati */}
                      <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">A</span>
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Tahap 2 &bull; Amati</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Observasi Awal &amp; Fokus Prioritas</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.amatiObservasi}
                        </p>
                      </div>

                      {/* 3. M - Maknai */}
                      <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">M</span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Tahap 3 &bull; Maknai</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Dialog Coaching Pasca-Observasi</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.maknaiCoaching}
                        </p>
                      </div>

                      {/* 4. B - Berdayakan */}
                      <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">B</span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase">Tahap 4 &bull; Berdayakan</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Modul Perbaikan Deep Learning</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.berdayakanModul}
                        </p>
                      </div>

                      {/* 5. U - Uji */}
                      <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">U</span>
                          <span className="text-[10px] font-bold text-purple-600 uppercase">Tahap 5 &bull; Uji</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Pembuktian Kelas (Observasi 25 Aspek)</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.ujiPembuktian}
                        </p>
                      </div>

                      {/* 6. N - Nyatakan */}
                      <div className="bg-white rounded-2xl border border-rose-200 p-4 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center">N</span>
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Tahap 6 &bull; Nyatakan</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">Bukti Nyata Before vs After</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alur.nyatakanDampak}
                        </p>
                      </div>
                    </div>

                    {/* Step 7 (G - Gerakkan) Full Width */}
                    <div className="bg-gradient-to-r from-cyan-50 via-teal-50 to-indigo-50 border-2 border-cyan-400/80 rounded-2xl p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-cyan-700 text-white font-extrabold text-xs flex items-center justify-center">G</span>
                        <div>
                          <span className="text-[10px] font-bold text-cyan-800 uppercase block">Tahap 7 &bull; Gerakkan (RTL dari Hasil Nyatakan &amp; Pengimbasan)</span>
                          <h5 className="font-extrabold text-sm text-slate-900">Aksi Berkelanjutan: Melembagakan Perubahan di Kelas &amp; Komunitas</h5>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-9">
                        {alur.gerakkanKomitmen}
                      </p>
                    </div>

                    {/* Catatan Naratif Supervisor & Sekolah */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Catatan Resmi Pengawas Pembina Kusnandar, M.Si</span>
                        </span>
                        <textarea
                          rows={4}
                          value={alur.catatanPengawas}
                          onChange={(e) => {
                            const newAlur = { ...alur, catatanPengawas: e.target.value };
                            setSambungDraft({
                              ...sambungDraft,
                              gerakkan: { ...sambungDraft.gerakkan, kesimpulanAlurSambung: newAlur },
                            });
                          }}
                          className="w-full text-xs text-slate-800 bg-indigo-50/30 border border-indigo-200 rounded-xl p-3 focus:outline-indigo-600 leading-relaxed resize-y"
                        />
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                          <SchoolIcon className="w-4 h-4 text-slate-600" />
                          <span>Dukungan Manajemen &amp; Kepala Sekolah</span>
                        </span>
                        <textarea
                          rows={4}
                          value={alur.dukunganKepalaSekolah || ''}
                          onChange={(e) => {
                            const newAlur = { ...alur, dukunganKepalaSekolah: e.target.value };
                            setSambungDraft({
                              ...sambungDraft,
                              gerakkan: { ...sambungDraft.gerakkan, kesimpulanAlurSambung: newAlur },
                            });
                          }}
                          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-slate-600 leading-relaxed resize-y"
                          placeholder="Komitmen sarana, kebijakan, dan ruang berbagi dari kepala sekolah..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================= */}
              {/* SUBTAB 3: DISEMINASI & PENGIMBASAN PRAKTIK BAIK            */}
              {/* ========================================================= */}
              {gSubTab === 'pengimbasan' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-teal-600" />
                        <span>Diseminasi &amp; Pengimbasan Praktik Baik Komunitas</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Mewujudkan dampak supervisi berkelanjutan dengan menyebarluaskan hasil karya dan transformasi pembelajaran guru ke komunitas yang lebih luas.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newList = [
                          ...sambungDraft.gerakkan.pengimbasan,
                          {
                            id: Date.now(),
                            praktikBaik: `Praktik Baik Pembelajaran ${currentSupervision.subject}`,
                            sasaran: 'Komunitas Belajar (Kombel)',
                            bentuk: 'Berbagi Praktik Baik',
                            waktu: 'Bulan Depan',
                          },
                        ];
                        setSambungDraft({
                          ...sambungDraft,
                          gerakkan: { ...sambungDraft.gerakkan, pengimbasan: newList },
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pengimbasan</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse rounded-xl overflow-hidden border border-slate-200 bg-white">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                          <th className="py-2.5 px-3 text-center w-12">No</th>
                          <th className="py-2.5 px-3 text-left">Praktik Baik yang Diimbaskan</th>
                          <th className="py-2.5 px-3 text-left w-64">Sasaran Komunitas</th>
                          <th className="py-2.5 px-3 text-left w-56">Bentuk Diseminasi</th>
                          <th className="py-2.5 px-3 text-left w-44">Linimasa Waktu</th>
                          <th className="py-2.5 px-3 text-center w-12">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sambungDraft.gerakkan.pengimbasan.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.praktikBaik}
                                onChange={(e) => {
                                  const list = [...sambungDraft.gerakkan.pengimbasan];
                                  list[idx].praktikBaik = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                  });
                                }}
                                placeholder="Judul / topik praktik baik..."
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.sasaran}
                                onChange={(e) => {
                                  const list = [...sambungDraft.gerakkan.pengimbasan];
                                  list[idx].sasaran = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                  });
                                }}
                                placeholder="Sasaran pengimbasan..."
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.bentuk}
                                onChange={(e) => {
                                  const list = [...sambungDraft.gerakkan.pengimbasan];
                                  list[idx].bentuk = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                  });
                                }}
                                placeholder="Contoh: MGMP, Workshop Kombel, Webinar PMM"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={item.waktu}
                                onChange={(e) => {
                                  const list = [...sambungDraft.gerakkan.pengimbasan];
                                  list[idx].waktu = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {sambungDraft.gerakkan.pengimbasan.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = sambungDraft.gerakkan.pengimbasan.filter((_, i) => i !== idx);
                                    setSambungDraft({
                                      ...sambungDraft,
                                      gerakkan: { ...sambungDraft.gerakkan, pengimbasan: list },
                                    });
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUBTAB 4: LEMBAR PENGESAHAN TRIPARTIT                     */}
              {/* ========================================================= */}
              {gSubTab === 'pengesahan' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center max-w-2xl mx-auto space-y-2">
                    <Award className="w-10 h-10 text-cyan-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Pengesahan Rencana Tindak Lanjut &amp; Kesimpulan Portofolio SAMBUNG
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Dokumen ini menjadi bukti komitmen formal pelaksanaan Rencana Tindak Lanjut hasil supervisi akademik berkelanjutan yang disahkan oleh Guru, Kepala Sekolah, dan Pengawas Pembina.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Tanda Tangan Guru */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center flex flex-col justify-between h-64 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pihak I: Guru Mata Pelajaran</span>
                        <p className="text-xs text-slate-600 mt-1">Yang Menyatakan Komitmen RTL,</p>
                      </div>
                      <div className="border-b border-dashed border-slate-300 w-36 mx-auto my-4 text-slate-300 text-[10px]">
                        (Tanda Tangan Digital)
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 underline">{currentSupervision.teacherName}</p>
                        <p className="text-[11px] text-slate-500">NIP. {currentSupervision.teacherNip || '-'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{currentSupervision.schoolName}</p>
                      </div>
                    </div>

                    {/* Tanda Tangan Kepala Sekolah */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center flex flex-col justify-between h-64 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pihak II: Satuan Pendidikan</span>
                        <p className="text-xs text-slate-600 mt-1">Mengetahui &amp; Menyetujui Dukungan,</p>
                        <p className="text-[11px] font-semibold text-slate-700">Kepala {currentSupervision.schoolName}</p>
                      </div>
                      <div className="border-b border-dashed border-slate-300 w-36 mx-auto my-4 text-slate-300 text-[10px]">
                        (Tanda Tangan / Cap Sekolah)
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 underline">Kepala Sekolah {currentSupervision.schoolName}</p>
                        <p className="text-[11px] text-slate-500">NIP. 19700101 199503 1 002</p>
                      </div>
                    </div>

                    {/* Tanda Tangan Pengawas Pembina */}
                    <div className="bg-gradient-to-b from-cyan-50/40 to-white rounded-2xl border-2 border-cyan-200 p-5 text-center flex flex-col justify-between h-64 shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Pihak III: Pembina &amp; Pengawas</span>
                        <p className="text-xs text-slate-600 mt-1">Bogor, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-[11px] font-bold text-indigo-950">Pengawas Sekolah Pembina SMA,</p>
                      </div>
                      <div className="border-b border-dashed border-cyan-400 w-36 mx-auto my-4 text-cyan-400 text-[10px]">
                        (Tervalidasi Sistem SAMBUNG)
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 underline">Kusnandar, M.Si</p>
                        <p className="text-[11px] text-slate-600 font-medium">NIP. 19680512 199403 1 004</p>
                        <p className="text-[10px] text-cyan-800 font-semibold mt-0.5">Pengawas Pembina Disdik Prov. Jawa Barat</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {renderStageGateFooter('G')}
            </div>
          </fieldset>
        )}

      </div>

      {/* Bottom Floating/Fixed Bar for Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>
            Portofolio SAMBUNG Aktif:{' '}
            <strong className="text-white">{currentSupervision.teacherName}</strong> ({currentSupervision.subject})
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Cetak Dokumen</span>
          </button>
          {canEdit ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Data SAMBUNG'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Mode Hanya Lihat ({currentUser.role === 'guru' ? 'Guru Mapel' : 'Kepala Sekolah'})</span>
            </div>
          )}
        </div>
      </div>

      {/* PRINT MODAL */}
      <SambungPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        supervision={{
          ...currentSupervision,
          sambung: sambungDraft,
        }}
      />

      {/* ACADEMIC SUPERVISION MODALS (AWAL & PERBAIKAN) */}
      {activeSupervisiModal?.stage === 'perangkat' && (
        <PerangkatAjarModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data telaah & evaluasi modul ajar (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'pra' && (
        <PraObservasiModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data wawancara pra-observasi (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'observasi' && (
        <ObservasiKelasModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data observasi kelas (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}

      {activeSupervisiModal?.stage === 'pasca' && (
        <PascaObservasiModal
          isOpen={true}
          onClose={() => setActiveSupervisiModal(null)}
          supervision={currentSupervision}
          currentUser={currentUser}
          mode={activeSupervisiModal.mode}
          onSaved={(updated) => {
            onUpdateSupervision(updated);
            setActiveSupervisiModal(null);
            setSaveToast(`Data pasca-observasi (${activeSupervisiModal.mode === 'perbaikan' ? 'setelah perbaikan' : 'data awal'}) berhasil disimpan!`);
            setTimeout(() => setSaveToast(null), 3000);
          }}
        />
      )}
    </div>
  );
};
