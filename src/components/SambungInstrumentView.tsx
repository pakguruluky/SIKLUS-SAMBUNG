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
  SambungKesimpulanAlurSambung
} from '../types';
import { 
  createDefaultSambungForTeacher, 
  DEFAULT_DATA_DAMPAK,
  DEFAULT_MATRIKS_BEFORE,
  DEFAULT_MATRIKS_AFTER,
  getTeacherDescriptiveDataDampak
} from '../data/sambungSeed';
import { saveSupervision } from '../services/firebase';
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
  ArrowRightLeft
} from 'lucide-react';
import { 
  applyAutoFillToSupervision, 
  parseRppFileName, 
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
  PASCA_OBSERVASI_QUESTIONS
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
  const [sSubTab, setSSubTab] = useState<'supervisi_awal' | 'pemetaan' | 'kesimpulan_before'>('supervisi_awal');
  const [uSubTab, setUSubTab] = useState<'supervisi_perbaikan' | 'pra_observasi' | 'observasi_25' | 'pasca_observasi' | 'u1' | 'u2' | 'kesimpulan_after'>('supervisi_perbaikan');
  const [gSubTab, setGSubTab] = useState<'rtl_nyatakan' | 'benang_merah' | 'pengimbasan' | 'pengesahan'>('rtl_nyatakan');
  const [isAutoFillingUji, setIsAutoFillingUji] = useState(false);
  const [isAutoFillingGerakkan, setIsAutoFillingGerakkan] = useState(false);
  const [activeSupervisiModal, setActiveSupervisiModal] = useState<{
    stage: 'perangkat' | 'pra' | 'observasi' | 'pasca';
    mode: 'awal' | 'perbaikan';
  } | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active supervision object
  const currentSupervision = useMemo(() => {
    const found = availableSupervisions.find((s) => s.id === selectedId);
    if (!found) return availableSupervisions[0] || null;
    return found;
  }, [availableSupervisions, selectedId]);

  // Local draft of SambungData for immediate responsiveness
  const [sambungDraft, setSambungDraft] = useState<SambungData | null>(null);

  useEffect(() => {
    if (initialSupervisionId && availableSupervisions.some((s) => s.id === initialSupervisionId)) {
      setSelectedId(initialSupervisionId);
    }
  }, [initialSupervisionId, availableSupervisions]);

  useEffect(() => {
    if (currentSupervision) {
      if (currentSupervision.sambung) {
        const cloned: SambungData = JSON.parse(JSON.stringify(currentSupervision.sambung));
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

        // Always synchronize Nyatakan Before-After from Selidiki & Uji conclusions
        const beforeSync = cloned.selidiki.matriksBefore;
        const afterSync = cloned.uji.matriksAfter;
        cloned.nyatakan = {
          ...cloned.nyatakan,
          beforeAfter: [
            { aspek: 'Peran guru', sebelumSambung: beforeSync.peranGuru, setelahSambung: afterSync.peranGuru },
            { aspek: 'Aktivitas murid', sebelumSambung: beforeSync.aktivitasMurid, setelahSambung: afterSync.aktivitasMurid },
            { aspek: 'Konteks kehidupan nyata', sebelumSambung: beforeSync.konteksNyata, setelahSambung: afterSync.konteksNyata },
            { aspek: 'Refleksi murid', sebelumSambung: beforeSync.refleksiMurid, setelahSambung: afterSync.refleksiMurid },
          ],
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
        // Pastikan instrumen Maknai (10 pertanyaan) sudah terisi otomatis sesuai hasil observasi & kesimpulan akhir
        if (!cloned.maknai?.pertanyaanList?.q1) {
          const maknaiInit = generateTeacherMaknaiData(currentSupervision);
          cloned.maknai = {
            ...cloned.maknai,
            ...maknaiInit,
          };
        }
        setSambungDraft(cloned);
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
  }, [currentSupervision?.id]);

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
        `Tahap U (UJI): Instrumen Wawancara Pra-Observasi, Observasi 25 Aspek, Pasca-Observasi, Angket Suara Murid, dan 4 Indikator Transformasi berhasil disinkronkan otomatis sesuai hasil kesimpulan dan tersimpan di Database!`
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
      title: 'S — Lembar Pemetaan Pembelajaran',
      subtitle: 'SELIDIKI — diisi dari telaah perangkat, observasi awal, dan dialog',
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
      title: 'U — UJI: Observasi Kelas & Suara Murid',
      subtitle: 'U-1 Observasi Kelas SAMBUNG & U-2 Angket Refleksi Murid',
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

  // Recalculate U-1 Observasi Total
  const handleU1ScoreChange = (indikatorId: number, newScore: 1 | 2 | 3 | 4) => {
    if (!sambungDraft) return;
    const updatedList = sambungDraft.uji.u1_observasi.indikatorList.map((ind) =>
      ind.id === indikatorId ? { ...ind, score: newScore } : ind
    );
    const newTotal = updatedList.reduce((sum, item) => sum + item.score, 0);
    const newPct = (newTotal / 40) * 100;

    setSambungDraft({
      ...sambungDraft,
      uji: {
        ...sambungDraft.uji,
        u1_observasi: {
          ...sambungDraft.uji.u1_observasi,
          indikatorList: updatedList,
          totalSkor: newTotal,
          persentaseCapaian: newPct,
        },
      },
    });
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
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Skor U-1 Observasi</span>
              <span className="text-base font-extrabold text-indigo-600">
                {sambungDraft.uji.u1_observasi.totalSkor} / 40
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Suara Murid (U-2)</span>
              <span className="text-base font-extrabold text-emerald-600">
                {sambungDraft.uji.u2_angketMurid.items.length > 0
                  ? (
                      sambungDraft.uji.u2_angketMurid.items.reduce((s, i) => s + i.persentaseSetuju, 0) /
                      sambungDraft.uji.u2_angketMurid.items.length
                    ).toFixed(1)
                  : '0'}%
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">
                {sambungDraft.uji.u2_angketMurid.jumlahResponden} Murid
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Siklus Berdayakan</span>
              <span className="text-base font-extrabold text-amber-600">
                {sambungDraft.berdayakan.siklusList.length} Siklus
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Rancang-Refleksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* S - A - M - B - U - N - G TAB NAVIGATION BAR */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm mb-1 ${
                    isActive ? 'bg-white text-indigo-900' : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {tab.letter}
                </div>
                <span className="text-xs font-bold tracking-tight leading-none">{tab.name}</span>
                <span
                  className={`text-[9px] mt-0.5 leading-none ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {tab.key === 'S' && 'Pemetaan'}
                  {tab.key === 'A' && 'Aksi Pembinaan'}
                  {tab.key === 'M' && 'Coaching'}
                  {tab.key === 'B' && 'Rancang-Coba'}
                  {tab.key === 'U' && 'Observasi & Murid'}
                  {tab.key === 'N' && 'Before-After'}
                  {tab.key === 'G' && 'Tindak Lanjut'}
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

              {/* Subtab Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSSubTab('supervisi_awal')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'supervisi_awal'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>1. Instrumen Supervisi Akademik (Data Awal Guru)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'supervisi_awal' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Tahap Awal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('pemetaan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'pemetaan'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>2. Lembar Pemetaan Aspek Pembelajaran SAMBUNG (6 Aspek)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSSubTab('kesimpulan_before')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    sSubTab === 'kesimpulan_before'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>3. Kesimpulan Selidiki: Tabel Indikator &amp; Selidiki</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    sSubTab === 'kesimpulan_before' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Indikator Kunci
                  </span>
                </button>
              </div>
            </div>

            {/* SUBTAB 1: INSTRUMEN SUPERVISI AKADEMIK AWAL (4 TAHAP) */}
            {sSubTab === 'supervisi_awal' && (
              <div className="space-y-6">
                {/* Banner Penjelasan Data Awal */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Baseline Data Awal Sebelum Pendampingan Siklus SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Portofolio Supervisi Akademik Kondisi Awal Guru: {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                        Data ini mencakup unggah dan telaah berkas perencanaan awal (22 aspek telaah RPP/Modul), dialog wawancara pra-observasi, observasi tatap muka pembelajaran di kelas, serta umpan balik pasca-observasi sebagai acuan perancangan intervensi coaching SAMBUNG.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-indigo-200">Status Portofolio:</span>
                      <span className="font-bold text-emerald-300">
                        {currentSupervision.observasiKelas?.score ? 'Supervisi Awal Terlaksana' : 'Draf / Proses Pengisian'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PANEL OTOMATISASI INSTRUMEN SELIDIKI BERDASARKAN BERKAS RPP */}
                <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border-2 border-indigo-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Otomatisasi Instrumen Selidiki Berdasarkan Berkas RPP</span>
                      </div>
                      <h5 className="text-sm sm:text-base font-extrabold text-slate-900">
                        Otomatisasi Instrumen Selidiki: {currentSupervision.teacherName} ({currentSupervision.subject})
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        Sesuai ketentuan, <strong>hanya berkas RPP saja yang diunggah</strong>. Anda dapat mengunggah berkas RPP lokal atau langsung menjalankan analisis otomatis untuk mengisi: <strong>Telaah RPP 22 Aspek</strong>, <strong>Pra-Observasi 8 Pertanyaan</strong>, <strong>Observasi Kelas 25 Aspek</strong>, dan menghubungkannya ke <strong>Nilai Akhir Siklus SAMBUNG</strong>. Tersimpan di Firebase.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs">
                        <UploadCloud className="w-4 h-4 text-indigo-600" />
                        <span>Unggah File RPP (.pdf/.doc)</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAutoFillSelidiki(file);
                          }}
                          className="sr-only"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={isAutoFillingSelidiki}
                        onClick={() => handleAutoFillSelidiki()}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
                          isAutoFillingSelidiki
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        }`}
                      >
                        {isAutoFillingSelidiki ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menganalisis RPP &amp; Menyinkronkan...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>⚡ Isi Otomatis Selidiki &amp; Siklus SAMBUNG</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl && (
                    <div className="flex items-center gap-2 text-xs bg-white/70 px-3 py-1.5 rounded-xl border border-indigo-100 text-slate-700">
                      <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Berkas RPP Tertaut:</span>
                      <a
                        href={currentSupervision.perangkatAjar.driveLinks.modulAjarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-bold hover:underline truncate max-w-md"
                      >
                        {currentSupervision.perangkatAjar.driveLinks.modulAjarUrl}
                      </a>
                    </div>
                  )}
                </div>

                {/* Grid 4 Cards Supervisi Awal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* CARD 1: PERANGKAT AJAR (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 1
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Perangkat Ajar &amp; Telaah Modul Ajar / RPP (22 Aspek)
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.perangkatAjar?.telaahSummary?.finalScore ? (
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-indigo-700">
                              {currentSupervision.perangkatAjar.telaahSummary.finalScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {currentSupervision.perangkatAjar.telaahSummary.predicate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                            Belum Ditelaah
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Sesuai ketentuan, hanya berkas RPP yang diunggah. Unggah berkas RPP / Modul Ajar (Google Drive atau file lokal), telaah 22 aspek, serta umpan balik pengawas.
                      </p>

                      {/* Detail Berkas Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Berkas RPP / Modul Ajar:</span>
                          {currentSupervision.perangkatAjar?.driveLinks?.modulAjarUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.driveLinks.modulAjarUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat di Drive</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Belum diunggah</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">CP / TP / ATP:</span>
                          {currentSupervision.perangkatAjar?.driveLinks?.cpTpAtpUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.driveLinks.cpTpAtpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat di Drive</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditautkan</span>
                          )}
                        </div>

                        {currentSupervision.perangkatAjar?.feedback?.kelebihan && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Catatan Umpan Balik Pengawas / Kepala Sekolah:</span>
                            <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                              &ldquo;{currentSupervision.perangkatAjar.feedback.kelebihan}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.perangkatAjar?.reviewedAt
                          ? `Ditelaah: ${new Date(currentSupervision.perangkatAjar.reviewedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu verifikasi pengawas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Unggah Berkas & Telaah 22 Aspek' : 'Unggah & Isi Telaah (22 Aspek)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: PRA-OBSERVASI (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 2
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Wawancara Pra-Observasi Pembelajaran Awal
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.praObservasi?.completedAt ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Selesai
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
                            Belum Diisi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog kesiapan guru sebelum mengajar, kesepakatan fokus aspek yang diobservasi, materi esensial/sulit, dan target kompetensi murid.
                      </p>

                      {/* Detail Pra-Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Fokus KD / Indikator:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.praObservasi?.q1_kd_indikator || 'Belum diisikan'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-500 text-[11px]">Metode Pembelajaran:</span>
                            <p className="text-slate-800 font-semibold truncate">
                              {currentSupervision.praObservasi?.q2_metode || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[11px]">Durasi Wawancara:</span>
                            <p className="text-slate-800 font-semibold">
                              {currentSupervision.praObservasi?.interviewDurationMinutes || 30} Menit
                            </p>
                          </div>
                        </div>

                        {currentSupervision.praObservasi?.supervisorNotes && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px]">Catatan Pengawas:</span>
                            <p className="text-slate-600 text-[11px] italic line-clamp-1">
                              &ldquo;{currentSupervision.praObservasi.supervisorNotes}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.praObservasi?.completedAt
                          ? `Tanggal: ${new Date(currentSupervision.praObservasi.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu wawancara pra-observasi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pra', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Hasil Wawancara Pra-Observasi' : 'Isi & Buka Pra-Observasi Awal'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: OBSERVASI KELAS (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 3
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pelaksanaan Observasi Kelas Awal (Tatap Muka Baseline)
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.observasiKelas?.score ? (
                          <div className="text-right shrink-0">
                            <span className="text-base font-extrabold text-emerald-700">
                              {currentSupervision.observasiKelas.score}%
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {currentSupervision.observasiKelas.predicate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                            Belum Dilaksanakan
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Instrumen pengamatan tatap muka di ruang kelas pada kondisi riil awal untuk mengukur interaksi belajar sebelum strategi SAMBUNG dijalankan.
                      </p>

                      {/* Detail Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Aspek Teramati Terpenuhi:</span>
                          <span className="font-bold text-slate-900">
                            {currentSupervision.observasiKelas?.totalYa || 0} / {currentSupervision.observasiKelas?.totalAspek || 24} Aspek ({(
                              ((currentSupervision.observasiKelas?.totalYa || 0) / (currentSupervision.observasiKelas?.totalAspek || 24)) * 100
                            ).toFixed(1)}%)
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block mb-0.5">Catatan Pengamat Kondisi Awal di Kelas:</span>
                          <p className="text-slate-700 text-[11px] bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {currentSupervision.observasiKelas?.feedbackNotes || 'Belum ada catatan pengamatan kelas tatap muka.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.observasiKelas?.completedAt
                          ? `Observasi: ${new Date(currentSupervision.observasiKelas.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu observasi kelas'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'observasi', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Hasil Observasi Kelas Tatap Muka' : 'Isi & Buka Observasi Kelas Awal'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 4: PASCA-OBSERVASI (DATA AWAL) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Data Awal &bull; Tahap 4
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Refleksi &amp; Umpan Balik Pasca-Observasi Awal
                            </h5>
                          </div>
                        </div>

                        {currentSupervision.pascaObservasi?.completedAt ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Refleksi Lengkap
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
                            Belum Refleksi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog refleksi guru setelah pembelajaran awal, evaluasi kesulitan murid, serta penyusunan rekomendasi perbaikan awal.
                      </p>

                      {/* Detail Pasca-Observasi Awal */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Kesan Umum Guru:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.pascaObservasi?.q1_kesan || 'Belum diisi'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block">Kesulitan / Kendala Siswa:</span>
                          <p className="text-slate-800 font-medium line-clamp-1 mt-0.5">
                            {currentSupervision.pascaObservasi?.q6_kesulitan_siswa || '-'}
                          </p>
                        </div>

                        {currentSupervision.pascaObservasi?.recommendations && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px]">Rekomendasi Awal Pengawas:</span>
                            <p className="text-slate-600 text-[11px] italic line-clamp-2">
                              &ldquo;{currentSupervision.pascaObservasi.recommendations}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.pascaObservasi?.completedAt
                          ? `Tanggal: ${new Date(currentSupervision.pascaObservasi.completedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu refleksi pasca-observasi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pasca', mode: 'awal' })}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Hasil Refleksi Pasca-Observasi' : 'Isi & Buka Pasca-Observasi Awal'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: LEMBAR PEMETAAN ASPEK SAMBUNG (6 ASPEK) */}
            {sSubTab === 'pemetaan' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Tabel Pemetaan Aspek Pembelajaran SIKLUS SAMBUNG
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Diisi bersama guru berdasarkan temuan telaah perangkat ajar awal, wawancara pra-observasi, dan observasi tatap muka baseline di atas.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left w-56">Aspek</th>
                        <th className="py-2.5 px-3 text-left">Kondisi Awal</th>
                        <th className="py-2.5 px-3 text-left w-48">Bukti (Kode/Foto/Karya)</th>
                        <th className="py-2.5 px-3 text-left">Kebutuhan Pembinaan</th>
                        <th className="py-2.5 px-3 text-center w-24">Prioritas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.selidiki.items.map((item, idx) => (
                        <tr key={item.id} className={item.isPrioritas ? 'bg-amber-50/40' : ''}>
                          <td className="py-3 px-3 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900 align-top">
                            {item.aspek}
                          </td>
                          <td className="py-3 px-3 align-top">
                            <textarea
                              rows={2}
                              value={item.kondisiAwal}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].kondisiAwal = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Deskripsikan kondisi awal murid & guru..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 align-top">
                            <input
                              type="text"
                              value={item.bukti}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].bukti = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Contoh: Dok-01, Pretest"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 align-top">
                            <textarea
                              rows={2}
                              value={item.kebutuhanPembinaan}
                              onChange={(e) => {
                                const newItems = [...sambungDraft.selidiki.items];
                                newItems[idx].kebutuhanPembinaan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  selidiki: { ...sambungDraft.selidiki, items: newItems },
                                });
                              }}
                              placeholder="Kebutuhan pembinaan guru..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                            />
                          </td>
                          <td className="py-3 px-3 text-center align-top">
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!item.isPrioritas}
                                onChange={(e) => {
                                  const newItems = [...sambungDraft.selidiki.items];
                                  newItems[idx].isPrioritas = e.target.checked;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    selidiki: { ...sambungDraft.selidiki, items: newItems },
                                  });
                                }}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                              <span className="text-[11px] font-medium text-slate-700">Prioritas</span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">
                      Panduan Catatan Prioritas Pembinaan:
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Tandai aspek yang paling banyak perlu penguatan sebagai prioritas pembinaan untuk melangkah ke tahap A (Amati).
                  </p>
                  <textarea
                    rows={2}
                    value={sambungDraft.selidiki.catatanPrioritas || ''}
                    onChange={(e) =>
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, catatanPrioritas: e.target.value },
                      })
                    }
                    placeholder="Tuliskan catatan kesimpulan aspek prioritas pembinaan..."
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs focus:outline-indigo-600 bg-white"
                  />
                </div>
              </div>
              </fieldset>
            )}

            {/* SUBTAB 3: KESIMPULAN DATA AWAL — MATRIKS PERUBAHAN BEFORE */}
            {sSubTab === 'kesimpulan_before' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                {/* Banner Penjelasan */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Kesimpulan Baseline &bull; Kondisi Awal Sebelum Siklus SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Kesimpulan Selidiki: TABEL INDIKATOR &amp; SELIDIKI &bull; {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-indigo-200/90 max-w-3xl leading-relaxed">
                        Data kesimpulan kondisi awal pembelajaran guru ini dirangkum dari telaah modul ajar, pra-observasi, observasi kelas baseline, dan pasca-observasi awal. Menyajikan 4 indikator kunci kondisi awal (Selidiki) yang otomatis menjadi data Before pembanding langsung pada Tahap Uji dan Tahap Nyatakan.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-indigo-200">Status Data:</span>
                      <span className="font-bold text-emerald-300">Baseline Terpetakan</span>
                    </div>
                  </div>
                </div>

                {/* Koneksi ke Nilai Akhir Siklus SAMBUNG */}
                <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Terhubung ke Nilai Akhir Kesimpulan Siklus SAMBUNG</span>
                    </div>
                    <p className="text-[11px] text-slate-600 max-w-xl">
                      Data 4 indikator Selidiki di bawah ini secara otomatis menjadi kolom <em>Selidiki (Before)</em> pada Tab Nyatakan, data dampak kuantitatif murid, dan dashboard rekapitulasi pengawas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!sambungDraft) return;
                      const before = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                      const after = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                      const updatedDataDampak = getTeacherDescriptiveDataDampak(
                        currentSupervision.teacherName,
                        currentSupervision.subject,
                        currentSupervision.schoolName,
                        currentSupervision.lessonTitle,
                        currentSupervision.perangkatAjar?.telaahSummary?.predicate,
                        currentSupervision.observasiKelas?.predicate
                      );
                      setSambungDraft({
                        ...sambungDraft,
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          beforeAfter: [
                            { aspek: 'Peran guru', sebelumSambung: before.peranGuru, setelahSambung: after.peranGuru },
                            { aspek: 'Aktivitas murid', sebelumSambung: before.aktivitasMurid, setelahSambung: after.aktivitasMurid },
                            { aspek: 'Konteks kehidupan nyata', sebelumSambung: before.konteksNyata, setelahSambung: after.konteksNyata },
                            { aspek: 'Refleksi murid', sebelumSambung: before.refleksiMurid, setelahSambung: after.refleksiMurid },
                          ],
                          dataDampak: updatedDataDampak,
                        },
                      });
                      setSaveToast('Kesimpulan Selidiki berhasil disinkronkan ke Nilai Akhir Kesimpulan Siklus SAMBUNG!');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan ke Nilai Akhir Siklus SAMBUNG</span>
                  </button>
                </div>

                {/* 4 Cards Matriks Perubahan Before */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CARD 1: PERAN GURU */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Aspek 1 &bull; Peran Guru (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Fokus Peran Pendidik di Ruang Kelas
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80 text-[11px] text-indigo-900">
                        <strong>Indikator Transformasi:</strong> Dari berfokus pada penyampaian materi menuju pengalaman belajar murid
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Peran Guru:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, peranGuru: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan bagaimana peran guru pada pembelajaran awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 2: AKTIVITAS MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                              Aspek 2 &bull; Aktivitas Murid (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pola Keterlibatan &amp; Aksi Belajar Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/80 text-[11px] text-purple-900">
                        <strong>Indikator Transformasi:</strong> Dari lebih banyak menerima pasif menjadi lebih aktif mengaplikasikan pengetahuan
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Aktivitas Murid:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, aktivitasMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan aktivitas murid pada kondisi awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 3: KONTEKS KEHIDUPAN NYATA */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Aspek 3 &bull; Konteks Nyata (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Keterhubungan Materi dengan Dunia Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-amber-900">
                        <strong>Indikator Transformasi:</strong> Dari belum konsisten menjadi mulai dirancang dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Konteks Nyata:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, konteksNyata: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan bagaimana keterhubungan materi dengan konteks nyata pada awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 4: REFLEKSI MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Aspek 4 &bull; Refleksi Murid (Before)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Pembiasaan Refleksi &amp; Metakognisi
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Kondisi Awal
                        </span>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 text-[11px] text-blue-900">
                        <strong>Indikator Transformasi:</strong> Dari belum rutin menjadi mulai menjadi bagian pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Awal Refleksi Murid:
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            const updatedMatriks = { ...cur, refleksiMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan pembiasaan refleksi murid pada awal..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom BEFORE Tahap Nyatakan.
                    </p>
                  </div>
                </div>

                {/* TABEL KESIMPULAN SELIDIKI: INDIKATOR DAN SELIDIKI */}
                <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>Tabel Kesimpulan Selidiki: Indikator &amp; Selidiki (Kondisi Awal / Baseline Guru)</span>
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rekapitulasi 4 indikator kunci hasil supervisi akademik kondisi awal (baseline) untuk {currentSupervision.teacherName}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = { ...DEFAULT_MATRIKS_BEFORE };
                        setSambungDraft({
                          ...sambungDraft,
                          selidiki: { ...sambungDraft.selidiki, matriksBefore: cur },
                          nyatakan: {
                            ...sambungDraft.nyatakan,
                            beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item => {
                              if (item.aspek.toLowerCase().includes('peran')) return { ...item, sebelumSambung: cur.peranGuru };
                              if (item.aspek.toLowerCase().includes('aktivitas')) return { ...item, sebelumSambung: cur.aktivitasMurid };
                              if (item.aspek.toLowerCase().includes('konteks')) return { ...item, sebelumSambung: cur.konteksNyata };
                              if (item.aspek.toLowerCase().includes('refleksi')) return { ...item, sebelumSambung: cur.refleksiMurid };
                              return item;
                            }),
                          },
                        });
                        setSaveToast('Template standar kesimpulan awal berhasil dipulihkan!');
                        setTimeout(() => setSaveToast(null), 3000);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors self-start sm:self-auto"
                    >
                      Pulihkan Deskripsi Standar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5 w-12 text-center">No</th>
                          <th className="py-3 px-3.5 w-60">Indikator Pembelajaran</th>
                          <th className="py-3 px-3.5">Kesimpulan Selidiki (Kondisi Awal / Baseline Guru)</th>
                          <th className="py-3 px-3.5 w-56 text-center">Arah Transformasi Sasaran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Row 1: Peran Guru */}
                        <tr className="hover:bg-indigo-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">1</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Guru berorientasi pada pengalaman belajar murid</span>
                                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Aspek: Peran Guru</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 align-top">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-xs">
                              {sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center text-indigo-700 font-semibold bg-indigo-50/30 text-xs align-top">
                            <span className="inline-block p-2 rounded-lg bg-white border border-indigo-200/80 font-bold text-indigo-900 leading-snug">
                              &rarr; Dari ceramah materi menuju perancang pengalaman belajar aktif murid
                            </span>
                          </td>
                        </tr>

                        {/* Row 2: Aktivitas Murid */}
                        <tr className="hover:bg-purple-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">2</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Murid aktif mengaplikasikan pengetahuan</span>
                                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Aspek: Aktivitas Murid</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 align-top">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-xs">
                              {sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center text-purple-700 font-semibold bg-purple-50/30 text-xs align-top">
                            <span className="inline-block p-2 rounded-lg bg-white border border-purple-200/80 font-bold text-purple-900 leading-snug">
                              &rarr; Dari penerima pasif menuju aktif mengaplikasikan pengetahuan kontekstual
                            </span>
                          </td>
                        </tr>

                        {/* Row 3: Konteks Nyata */}
                        <tr className="hover:bg-amber-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">3</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Pembelajaran terhubung dengan konteks kehidupan nyata murid</span>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Aspek: Konteks Nyata</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 align-top">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-xs">
                              {sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center text-amber-700 font-semibold bg-amber-50/30 text-xs align-top">
                            <span className="inline-block p-2 rounded-lg bg-white border border-amber-200/80 font-bold text-amber-900 leading-snug">
                              &rarr; Dari belum konsisten menjadi mulai dirancang terhubung situasi riil
                            </span>
                          </td>
                        </tr>

                        {/* Row 4: Refleksi Murid */}
                        <tr className="hover:bg-blue-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">4</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Refleksi menjadi bagian rutin dalam proses pembelajaran</span>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Aspek: Refleksi Murid</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-700 align-top">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed text-xs">
                              {sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center text-blue-700 font-semibold bg-blue-50/30 text-xs align-top">
                            <span className="inline-block p-2 rounded-lg bg-white border border-blue-200/80 font-bold text-blue-900 leading-snug">
                              &rarr; Dari belum rutin menjadi bagian integral pembelajaran harian
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </fieldset>
            )}
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoFillAmati()}
                    disabled={isAutoFillingAmati}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isAutoFillingAmati ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{isAutoFillingAmati ? 'Memeriksa & Mengisi...' : 'Periksa & Isikan Otomatis Berkesinambungan'}</span>
                  </button>
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
                      onClick={() => handleAutoFillAmati(['peranGuru', 'aktivitasMurid', 'konteksNyata', 'refleksiMurid'])}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                    >
                      Pilih Semua (4 Indikator)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFillAmati(['peranGuru', 'aktivitasMurid'])}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      Rekomendasi Utama (2 Indikator)
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
                          fokusPerubahan: gen.fokusPerubahan,
                        },
                      });
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Sintesiskan Otomatis
                  </button>
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
                    Coaching dan Refleksi Guru, <strong>JAWABAN terisikan otomatis dari hasil observasi</strong> dan disesuaikan dengan kesimpulan akhir siklus SAMBUNG.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutoFillMaknai()}
                    disabled={isAutoFillingMaknai}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isAutoFillingMaknai ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{isAutoFillingMaknai ? 'Menyinkronkan...' : 'Sinkronkan Jawaban dari Hasil Observasi & Kesimpulan'}</span>
                  </button>
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
                      Jawaban diselaraskan dengan Skor Observasi Kelas: <strong>{currentSupervision.observasiKelas?.score ?? 86.7}/100</strong> ({currentSupervision.observasiKelas?.predicate ?? 'Baik'}) &bull; Kesimpulan Akhir: <strong>Peran Guru &amp; Aktivitas Murid Aktif</strong>.
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Otomatis Terisi &amp; Terhubung
                  </span>
                </div>
              </div>

              {/* Tabel 10 Pertanyaan Coaching & Refleksi Pasca Observasi */}
              {(() => {
                const autoGenerated = generateTeacherMaknaiData(currentSupervision);
                const currentPertanyaan = sambungDraft.maknai?.pertanyaanList || autoGenerated.pertanyaanList;

                return (
                  <div className="space-y-4">
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                            <th className="py-3 px-3 text-center w-12">No</th>
                            <th className="py-3 px-4 text-left w-5/12 sm:w-1/3">Pertanyaan Coaching &amp; Refleksi</th>
                            <th className="py-3 px-4 text-left">
                              Jawaban Guru (Terisi Otomatis dari Hasil Observasi &amp; Disesuaikan Kesimpulan Akhir)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MAKNAI_COACHING_QUESTIONS.map((item) => {
                            const currentList = currentPertanyaan || {};
                            const autoList = autoGenerated.pertanyaanList || {};
                            const answerValue = currentList[item.id] || autoList[item.id] || '';

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
                          value={sambungDraft.maknai.kesanUmum ?? autoGenerated.kesanUmum}
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
                          value={sambungDraft.maknai.saranMasukan ?? autoGenerated.saranMasukan}
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
                        <button
                          type="button"
                          onClick={() => handleAutoFillBerdayakan()}
                          disabled={isAutoFillingBerdayakan}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                          title="Analisis otomatis 22 aspek telaah RPP perbaikan dan sinkronkan ke Firebase"
                        >
                          <Zap className={`w-4 h-4 text-slate-950 ${isAutoFillingBerdayakan ? 'animate-spin' : ''}`} />
                          <span>{isAutoFillingBerdayakan ? 'Menganalisis RPP...' : 'Telaah Kembali Secara Otomatis'}</span>
                        </button>

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
                                if (file) {
                                  const clean = encodeURIComponent(file.name.replace(/\s+/g, '_'));
                                  const generatedLink = `https://drive.google.com/file/d/drive_${Date.now()}_${clean}/view?usp=sharing`;
                                  handleAutoFillBerdayakan(generatedLink, `RPP Perbaikan: ${file.name}`);
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const sampleUrl = `https://drive.google.com/file/d/1Contoh_Modul_Ajar_Revisi_${encodeURIComponent(currentSupervision.subject)}_${encodeURIComponent(currentSupervision.teacherName.replace(/\s+/g, '_'))}/view?usp=sharing`;
                              handleAutoFillBerdayakan(sampleUrl);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>Gunakan Contoh RPP Perbaikan Guru Ini</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAutoFillBerdayakan()}
                          disabled={isAutoFillingBerdayakan}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer ml-auto"
                        >
                          <Zap className={`w-3.5 h-3.5 text-amber-200 ${isAutoFillingBerdayakan ? 'animate-spin' : ''}`} />
                          <span>{isAutoFillingBerdayakan ? 'Sedang Menganalisis...' : 'Telaah Kembali Secara Otomatis'}</span>
                        </button>
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
          </fieldset>
        )}

        {/* ==================================================== */}
        {/* TAB U: UJI — OBSERVASI KELAS (U-1) & ANGKET MURID (U-2) */}
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
                    Uji: Observasi Kelas, Instrumen Supervisi &amp; Suara Murid
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pembuktian lapangan perbaikan pembelajaran guru {currentSupervision.teacherName} menggunakan instrumen resmi Pengawas Pembina Kusnandar, M.Si, terhubung koheren dari Selidiki, Amati, Maknai, Berdayakan dan selaras dengan hasil kesimpulan.
                  </p>
                </div>

                {/* Toolbar Aksi Tahap U */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAutoFillUji}
                    disabled={isAutoFillingUji}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-purple-400/40"
                    title="Otomatis mengisi Pra-Observasi, 25 Butir Observasi, Pasca-Observasi, Angket Murid & Matriks After yang selaras dari Selidiki sampai Berdayakan"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-300 ${isAutoFillingUji ? 'animate-spin' : ''}`} />
                    <span>{isAutoFillingUji ? 'Menyinkronkan Instrumen Uji...' : 'Isi & Sinkronkan Otomatis Tahap UJI'}</span>
                  </button>

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

              {/* Subtab switcher (7 Subtabs Lengkap) */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setUSubTab('supervisi_perbaikan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'supervisi_perbaikan'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>1. Ikhtisar 4 Tahap Perbaikan</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'supervisi_perbaikan' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    4 Tahap
                  </span>
                </button>

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
                  <span>2. Wawancara Pra-Observasi</span>
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
                  <span>3. Observasi Kelas (25 Aspek)</span>
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
                  <span>4. Pasca-Observasi &amp; Refleksi</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'pasca_observasi' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    Refleksi &amp; RTL
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('u1')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'u1'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>5. U-1: Observasi SAMBUNG ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('u2')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'u2'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                  <span>6. U-2: Suara Murid ({sambungDraft.uji.u2_angketMurid.jumlahResponden} Murid)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUSubTab('kesimpulan_after')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    uSubTab === 'kesimpulan_after'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>7. Kesimpulan Hasil Uji (4 Indikator)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    uSubTab === 'kesimpulan_after' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Matriks After
                  </span>
                </button>
              </div>
            </div>

            {/* SUBTAB 1: SUPERVISI AKADEMIK PASCA PERBAIKAN */}
            {uSubTab === 'supervisi_perbaikan' && (
              <div className="space-y-6">
                {/* Banner Penjelasan Data Setelah Perbaikan */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Data Hasil Perbaikan &bull; Pasca Pendampingan SIKLUS SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Supervisi Akademik Setelah Ada Perbaikan Guru: {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                        Data ini membuktikan dampak nyata siklus perbaikan pembelajaran: berkas modul ajar revisi, telaah evaluasi perbaikan (22 aspek telaah), dialog wawancara pra-observasi lanjutan, observasi kelas tatap muka verifikasi lapangan, dan evaluasi pasca-observasi.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-purple-200">Status Siklus:</span>
                      <span className="font-bold text-emerald-300">
                        {currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui' ? 'Perbaikan Terverifikasi' : 'Tahap Verifikasi Perbaikan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid 4 Cards Supervisi Setelah Ada Perbaikan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* CARD 1: PERANGKAT AJAR (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 1
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Perangkat Ajar: Modul Ajar Revisi &amp; Telaah Evaluasi (22 Aspek)
                            </h5>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disetujui
                            </span>
                          ) : currentSupervision.perangkatAjar?.revisi?.modulAjarRevisiUrl ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Sudah Diunggah
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Perlu Unggah Revisi
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Unggah dan evaluasi modul ajar hasil perbaikan guru yang telah mengakomodasi rekomendasi coaching SAMBUNG, telaah 22 aspek siklus perbaikan, serta catatan persetujuan pengawas.
                      </p>

                      {/* Detail Modul Revisi */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Berkas Modul Ajar Revisi (Drive):</span>
                          {currentSupervision.perangkatAjar?.revisi?.modulAjarRevisiUrl ? (
                            <a
                              href={currentSupervision.perangkatAjar.revisi.modulAjarRevisiUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 font-bold hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              <span>Lihat Modul Revisi</span>
                            </a>
                          ) : (
                            <span className="text-amber-700 font-medium italic">Belum diunggah guru</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                          <span className="font-semibold text-slate-600">Skor Telaah Evaluasi Perbaikan:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 line-through text-[11px]">
                              Awal: {currentSupervision.perangkatAjar?.telaahSummary?.finalScore ? currentSupervision.perangkatAjar.telaahSummary.finalScore.toFixed(1) : '-'}
                            </span>
                            <span className="font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                              Perbaikan: {currentSupervision.perangkatAjarPerbaikan?.telaahSummary?.finalScore 
                                ? currentSupervision.perangkatAjarPerbaikan.telaahSummary.finalScore.toFixed(1)
                                : currentSupervision.perangkatAjar?.revisi?.revisiStatus === 'disetujui'
                                ? Math.min(100, (currentSupervision.perangkatAjar?.telaahSummary?.finalScore || 90) + 5).toFixed(1)
                                : 'Siap Ditelaah'}
                            </span>
                          </div>
                        </div>

                        {currentSupervision.perangkatAjar?.revisi?.catatanRevisiGuru && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-bold text-slate-700 block text-[11px] mb-0.5">Catatan Refleksi Perbaikan Guru:</span>
                            <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                              &ldquo;{currentSupervision.perangkatAjar.revisi.catatanRevisiGuru}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {currentSupervision.perangkatAjar?.revisi?.revisiSubmittedAt
                          ? `Diunggah: ${new Date(currentSupervision.perangkatAjar.revisi.revisiSubmittedAt).toLocaleDateString('id-ID')}`
                          : 'Perlu verifikasi revisi'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'perangkat', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Unggah Berkas Revisi & Telaah 22 Aspek' : 'Unggah & Isi Telaah Perbaikan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: PRA-OBSERVASI (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 2
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Wawancara Pra-Observasi Siklus Perbaikan
                            </h5>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Dialog kesiapan guru mempraktikkan inovasi pembelajaran dan strategi diferensiasi baru hasil coaching SAMBUNG pada pertemuan tatap muka berikutnya.
                      </p>

                      {/* Detail Pra-Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Fokus Peningkatan Pembelajaran:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.praObservasiPerbaikan?.q1_kd_indikator || 'Penerapan diferensiasi proses dan lembar eksplorasi kontekstual berbasis studi kasus riil.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                          <div>
                            <span className="text-slate-500 text-[11px]">Metode Baru:</span>
                            <p className="text-slate-800 font-semibold truncate">
                              {currentSupervision.praObservasiPerbaikan?.q2_metode || 'Problem-Based Learning kontekstual'}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[11px]">Kesiapan Guru:</span>
                            <p className="text-slate-800 font-semibold text-emerald-700">
                              Sangat Siap &amp; Tervalidasi
                            </p>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px]">Catatan Pengawas:</span>
                          <p className="text-slate-600 text-[11px] italic line-clamp-1">
                            &ldquo;{currentSupervision.praObservasiPerbaikan?.supervisorNotes || 'Guru siap mempraktikkan langkah perbaikan dengan rancangan media yang sangat menarik.'}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Siklus lanjutan pembelajaran
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pra', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Wawancara Pra-Observasi Perbaikan' : 'Isi & Buka Pra-Observasi Perbaikan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: OBSERVASI KELAS (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 3
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Observasi Kelas Pasca-Perbaikan (Verifikasi Lapangan)
                            </h5>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-extrabold text-emerald-700">
                            {currentSupervision.observasiKelasPerbaikan?.score 
                              ? `${currentSupervision.observasiKelasPerbaikan.score}%`
                              : currentSupervision.observasiKelas?.score 
                              ? `${Math.min(100, currentSupervision.observasiKelas.score + 10)}%`
                              : '95.0%'}
                          </span>
                          <span className="text-[10px] text-emerald-600 block font-semibold">
                            Amat Baik (A) &bull; Meningkat
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600">
                        Pengamatan langsung di ruang kelas tatap muka untuk memverifikasi secara objektif perubahan praktik mengajar dan peningkatan keaktifan murid setelah pendampingan.
                      </p>

                      {/* Detail Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-600">Perbandingan Skor Observasi:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 line-through text-[11px]">
                              Awal: {currentSupervision.observasiKelas?.score ? `${currentSupervision.observasiKelas.score}%` : '-'}
                            </span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                              Perbaikan: {currentSupervision.observasiKelasPerbaikan?.score 
                                ? `${currentSupervision.observasiKelasPerbaikan.score}%`
                                : currentSupervision.observasiKelas?.score 
                                ? `${Math.min(100, currentSupervision.observasiKelas.score + 10)}%`
                                : '95.0%'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block mb-0.5">Catatan Pengamat Verifikasi Lapangan:</span>
                          <p className="text-slate-700 text-[11px] bg-white p-2 rounded-lg border border-slate-200 line-clamp-2">
                            {currentSupervision.observasiKelasPerbaikan?.feedbackNotes || 'Perubahan sangat nyata: murid tidak lagi pasif mencatat, melainkan antusias berdiskusi dalam kelompok dan berani mengemukakan argumen kritis.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Verifikasi praktik kelas
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'observasi', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Observasi Kelas Perbaikan' : 'Isi & Buka Observasi Perbaikan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 4: PASCA-OBSERVASI (SETELAH PERBAIKAN) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                              Data Setelah Perbaikan &bull; Tahap 4
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Refleksi &amp; Evaluasi Pasca-Observasi Perbaikan
                            </h5>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai Evaluasi
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Evaluasi komprehensif atas keberhasilan perbaikan pembelajaran, refleksi kepuasan guru, pencapaian murid, dan rekomendasi diseminasi ke komunitas belajar.
                      </p>

                      {/* Detail Pasca-Observasi Perbaikan */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-slate-600 block">Kesan Guru Terhadap Perubahan:</span>
                          <p className="text-slate-800 font-medium line-clamp-2 mt-0.5">
                            {currentSupervision.pascaObservasiPerbaikan?.q1_kesan || 'Guru merasa jauh lebih percaya diri; murid merespons dengan penuh antusiasme dan tidak ada yang pasif.'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-600 block">Ketercapaian Tujuan Pembelajaran:</span>
                          <p className="text-slate-800 font-medium line-clamp-1 mt-0.5">
                            {currentSupervision.pascaObservasiPerbaikan?.q5_ketercapaian_tujuan || 'Lebih dari 90% murid mencapai indikator KKTP dan menguasai konsep kontekstual.'}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px]">Rekomendasi Diseminasi Pengawas:</span>
                          <p className="text-slate-600 text-[11px] italic line-clamp-2">
                            &ldquo;{currentSupervision.pascaObservasiPerbaikan?.recommendations || 'Praktik baik perbaikan ini sangat layak didiseminasikan dalam Komunitas Belajar (Kombel) sekolah dan forum MGMP.'}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Evaluasi keberlanjutan
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveSupervisiModal({ stage: 'pasca', mode: 'perbaikan' })}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{currentUser.role === 'guru' ? 'Lihat Refleksi Pasca-Observasi Perbaikan' : 'Isi & Buka Pasca-Observasi Perbaikan'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* SUBTAB 2: INSTRUMEN RESMI WAWANCARA PRA-OBSERVASI PERBAIKAN */}
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

            {/* SUBTAB U-1 */}
            {uSubTab === 'u1' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Hari &amp; Tanggal:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.hariTanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, hariTanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kelas yang Diobservasi:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u1_observasi.kelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tahap Observasi:</label>
                    <select
                      value={sambungDraft.uji.u1_observasi.tahapObservasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: {
                              ...sambungDraft.uji.u1_observasi,
                              tahapObservasi: e.target.value as 'awal' | 'siklus' | 'akhir',
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-900"
                    >
                      <option value="awal">Observasi Awal (Baseline)</option>
                      <option value="siklus">Observasi Siklus Pembinaan</option>
                      <option value="akhir">Observasi Akhir (Evaluasi)</option>
                    </select>
                  </div>
                </div>

                {/* Score bar */}
                <div className="p-4 bg-indigo-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-200">Hasil Penilaian Observasi Kelas SAMBUNG</p>
                    <p className="text-xl font-extrabold">
                      {sambungDraft.uji.u1_observasi.totalSkor} / 40{' '}
                      <span className="text-sm font-normal text-indigo-300">
                        ({sambungDraft.uji.u1_observasi.persentaseCapaian.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200 block uppercase font-bold">Kategori Mutu</span>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                      {sambungDraft.uji.u1_observasi.persentaseCapaian >= 85
                        ? 'Sangat Berkembang (SB)'
                        : sambungDraft.uji.u1_observasi.persentaseCapaian >= 70
                        ? 'Berkembang (B)'
                        : 'Mulai Berkembang (MB)'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala: 1 = belum tampak; 2 = mulai berkembang (sebagian kecil murid); 3 = berkembang (sebagian besar murid); 4 = sangat berkembang (murid berinisiatif, terbukti pada karya/ucapan).
                </div>

                {/* 10 Indikator Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-center">
                        <th className="py-2.5 px-2 w-8">No</th>
                        <th className="py-2.5 px-3 text-left">Indikator</th>
                        <th className="py-2.5 px-3 text-left w-36">Dimensi</th>
                        <th className="py-2.5 px-2 w-12">1</th>
                        <th className="py-2.5 px-2 w-12">2</th>
                        <th className="py-2.5 px-2 w-12">3</th>
                        <th className="py-2.5 px-2 w-12">4</th>
                        <th className="py-2.5 px-3 text-left w-64">Catatan Pengamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u1_observasi.indikatorList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.indikator}</td>
                          <td className="py-2 px-3 text-indigo-700 font-semibold">{item.dimensi}</td>
                          {[1, 2, 3, 4].map((val) => (
                            <td key={val} className="py-2 px-2 text-center">
                              <input
                                type="radio"
                                name={`ind_${item.id}`}
                                checked={item.score === val}
                                onChange={() => handleU1ScoreChange(item.id, val as 1 | 2 | 3 | 4)}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.catatan}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u1_observasi.indikatorList];
                                list[idx].catatan = e.target.value;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u1_observasi: { ...sambungDraft.uji.u1_observasi, indikatorList: list },
                                  },
                                });
                              }}
                              placeholder="Catatan bukti teramati..."
                              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Apa yang dialami murid?
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.apaYangDialamiMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, apaYangDialamiMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Uraikan pengalaman belajar yang dialami murid..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kekuatan dan rekomendasi:
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u1_observasi.kekuatanDanRekomendasi}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u1_observasi: { ...sambungDraft.uji.u1_observasi, kekuatanDanRekomendasi: e.target.value },
                          },
                        })
                      }
                      placeholder="Catatan kekuatan pembelajaran dan saran rekomendasi..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600"
                    />
                  </div>
                </div>
              </div>
              </fieldset>
            )}

            {/* SUBTAB U-2 */}
            {uSubTab === 'u2' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Kode Murid / Kelas:</label>
                    <input
                      type="text"
                      value={sambungDraft.uji.u2_angketMurid.kodeMuridKelas}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kodeMuridKelas: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tanggal Pengisian:</label>
                    <input
                      type="date"
                      value={sambungDraft.uji.u2_angketMurid.tanggal}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, tanggal: e.target.value },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Jumlah Murid Responden:</label>
                    <input
                      type="number"
                      value={sambungDraft.uji.u2_angketMurid.jumlahResponden}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: {
                              ...sambungDraft.uji.u2_angketMurid,
                              jumlahResponden: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Skala Likert Murid: 1 = sangat tidak setuju; 2 = tidak setuju; 3 = setuju; 4 = sangat setuju. % setuju = jumlah murid yang memilih 3 atau 4 dibagi jumlah responden &times; 100%.
                </div>

                {/* 5 Pernyataan */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2.5 px-3 text-center w-12">No</th>
                        <th className="py-2.5 px-3 text-left">Pernyataan Suara Murid</th>
                        <th className="py-2.5 px-3 text-center w-36">Rata-rata Skor (1-4)</th>
                        <th className="py-2.5 px-3 text-center w-40">% Setuju (Pilihan 3 &amp; 4)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sambungDraft.uji.u2_angketMurid.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-500">{item.id}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{item.pernyataan}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="4"
                              value={item.skorRataRata}
                              onChange={(e) => {
                                const list = [...sambungDraft.uji.u2_angketMurid.items];
                                list[idx].skorRataRata = parseFloat(e.target.value) || 0;
                                setSambungDraft({
                                  ...sambungDraft,
                                  uji: {
                                    ...sambungDraft.uji,
                                    u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                  },
                                });
                              }}
                              className="w-20 px-2 py-1 text-center font-bold rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={item.persentaseSetuju}
                                onChange={(e) => {
                                  const list = [...sambungDraft.uji.u2_angketMurid.items];
                                  list[idx].persentaseSetuju = parseFloat(e.target.value) || 0;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    uji: {
                                      ...sambungDraft.uji,
                                      u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, items: list },
                                    },
                                  });
                                }}
                                className="w-20 px-2 py-1 text-center font-bold text-indigo-700 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600"
                              />
                              <span className="font-bold text-slate-500">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-950">
                      Hal yang paling bermakna bagi saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.halPalingBermakna}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, halPalingBermakna: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan orisinal murid tentang hal yang paling bermakna..."
                      className="w-full px-3 py-2 rounded-lg border border-emerald-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>

                  <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1.5">
                    <label className="block text-xs font-bold text-rose-950">
                      Kesulitan saya adalah &hellip;
                    </label>
                    <textarea
                      rows={3}
                      value={sambungDraft.uji.u2_angketMurid.kesulitanMurid}
                      onChange={(e) =>
                        setSambungDraft({
                          ...sambungDraft,
                          uji: {
                            ...sambungDraft.uji,
                            u2_angketMurid: { ...sambungDraft.uji.u2_angketMurid, kesulitanMurid: e.target.value },
                          },
                        })
                      }
                      placeholder="Kutipan kesulitan murid yang perlu diatasi guru..."
                      className="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs focus:outline-indigo-600 bg-white italic"
                    />
                  </div>
                </div>
              </div>
              </fieldset>
            )}

            {/* SUBTAB 4: KESIMPULAN HASIL UJI — MATRIKS PERUBAHAN AFTER */}
            {uSubTab === 'kesimpulan_after' && (
              <fieldset disabled={!canEdit} className="contents border-0 p-0 m-0">
                <div className="space-y-6">
                {/* Banner Penjelasan */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-purple-800/60 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Kesimpulan Hasil Evaluasi &bull; Dampak Perbaikan SIKLUS SAMBUNG</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        Kesimpulan Hasil Uji Coba: TABEL INDIKATOR &amp; UJI &bull; {currentSupervision.teacherName}
                      </h4>
                      <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
                        Data kesimpulan kondisi setelah perbaikan ini dirumuskan dari hasil telaah modul ajar revisi, pra-observasi lanjutan, observasi kelas tatap muka verifikasi lapangan, angket suara murid (U-2), dan pasca-observasi perbaikan. Menyajikan 4 indikator kunci kondisi hasil uji coba (Uji) yang otomatis dipaparkan di Tahap Nyatakan.
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-medium">
                      <span className="text-purple-200">Status Siklus:</span>
                      <span className="font-bold text-emerald-300">Hasil Terverifikasi</span>
                    </div>
                  </div>
                </div>

                {/* 4 Cards Matriks Perubahan After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CARD 1: PERAN GURU */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                              Aspek 1 &bull; Peran Guru (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Fasilitasi &amp; Pengalaman Belajar Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/80 text-[11px] text-purple-900">
                        <strong>Arah Transformasi:</strong> Menuju perancang dan fasilitator pengalaman belajar aktif murid
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Peran Guru):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, peranGuru: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan peran guru setelah adanya pendampingan SAMBUNG..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 2: AKTIVITAS MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Aspek 2 &bull; Aktivitas Murid (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Aplikasi Pengetahuan &amp; Kolaborasi Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/80 text-[11px] text-emerald-900">
                        <strong>Arah Transformasi:</strong> Menuju lebih aktif mengaplikasikan pengetahuan secara kontekstual
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Aktivitas Murid):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, aktivitasMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan aktivitas murid setelah adanya perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 3: KONTEKS KEHIDUPAN NYATA */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              Aspek 3 &bull; Konteks Nyata (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Desain Pembelajaran Relevan Dunia Nyata
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-amber-900">
                        <strong>Arah Transformasi:</strong> Menuju mulai dirancang secara terstruktur dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Konteks Nyata):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, konteksNyata: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan keterhubungan konteks nyata setelah perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>

                  {/* CARD 4: REFLEKSI MURID */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              Aspek 4 &bull; Refleksi Murid (After)
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-0.5">
                              Budaya Refleksi Metakognitif Murid
                            </h5>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Setelah SAMBUNG
                        </span>
                      </div>

                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 text-[11px] text-blue-900">
                        <strong>Arah Transformasi:</strong> Menuju mulai menjadi bagian rutin dan terintegrasi dalam pembelajaran
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          Deskripsi Kondisi Setelah Perbaikan (Refleksi Murid):
                        </label>
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const cur = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            const updatedMatriks = { ...cur, refleksiMurid: val };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: updatedMatriks },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-indigo-600 bg-white"
                          placeholder="Jelaskan pembiasaan refleksi murid setelah perbaikan..."
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                      *Otomatis disinkronkan ke kolom AFTER Tahap Nyatakan.
                    </p>
                  </div>
                </div>

                {/* TABEL KESIMPULAN UJI: INDIKATOR DAN UJI */}
                <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-slate-100 pb-3">
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <span>Tabel Kesimpulan Uji: Indikator &amp; Uji (Kondisi Setelah Perbaikan / Hasil Uji Coba)</span>
                      </h5>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rekapitulasi 4 indikator kunci kondisi setelah perbaikan hasil uji coba lapangan untuk {currentSupervision.teacherName}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = { ...DEFAULT_MATRIKS_AFTER };
                        setSambungDraft({
                          ...sambungDraft,
                          uji: { ...sambungDraft.uji, matriksAfter: cur },
                          nyatakan: {
                            ...sambungDraft.nyatakan,
                            beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item => {
                              if (item.aspek.toLowerCase().includes('peran')) return { ...item, setelahSambung: cur.peranGuru };
                              if (item.aspek.toLowerCase().includes('aktivitas')) return { ...item, setelahSambung: cur.aktivitasMurid };
                              if (item.aspek.toLowerCase().includes('konteks')) return { ...item, setelahSambung: cur.konteksNyata };
                              if (item.aspek.toLowerCase().includes('refleksi')) return { ...item, setelahSambung: cur.refleksiMurid };
                              return item;
                            }),
                          },
                        });
                        setSaveToast('Template standar kesimpulan hasil uji berhasil dipulihkan!');
                        setTimeout(() => setSaveToast(null), 3000);
                      }}
                      className="text-xs text-purple-600 hover:text-purple-800 font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors self-start sm:self-auto"
                    >
                      Pulihkan Deskripsi Standar
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <thead className="bg-slate-100/90 text-slate-800 font-bold uppercase text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5 w-12 text-center">No</th>
                          <th className="py-3 px-3.5 w-60">Indikator Pembelajaran</th>
                          <th className="py-3 px-3.5">Kesimpulan Uji (Kondisi Setelah Perbaikan / Hasil Uji Coba)</th>
                          <th className="py-3 px-3.5 w-48 text-center">Status Pembuktian Uji</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Row 1: Peran Guru */}
                        <tr className="hover:bg-purple-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">1</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Guru berorientasi pada pengalaman belajar murid</span>
                                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Aspek: Peran Guru</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-900 align-top">
                            <div className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-200/80 leading-relaxed text-xs font-medium">
                              {sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center align-top">
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                              Terverifikasi Uji Lapangan
                            </span>
                          </td>
                        </tr>

                        {/* Row 2: Aktivitas Murid */}
                        <tr className="hover:bg-emerald-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">2</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Murid aktif mengaplikasikan pengetahuan</span>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Aspek: Aktivitas Murid</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-900 align-top">
                            <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 leading-relaxed text-xs font-medium">
                              {sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center align-top">
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                              Terverifikasi Uji Lapangan
                            </span>
                          </td>
                        </tr>

                        {/* Row 3: Konteks Nyata */}
                        <tr className="hover:bg-amber-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">3</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Pembelajaran terhubung dengan konteks kehidupan nyata murid</span>
                                <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Aspek: Konteks Nyata</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-900 align-top">
                            <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/80 leading-relaxed text-xs font-medium">
                              {sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center align-top">
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                              Terverifikasi Uji Lapangan
                            </span>
                          </td>
                        </tr>

                        {/* Row 4: Refleksi Murid */}
                        <tr className="hover:bg-blue-50/20">
                          <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">4</td>
                          <td className="py-3 px-3.5 font-bold text-slate-900 bg-slate-50/60 align-top">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold text-slate-900 block leading-snug">Refleksi menjadi bagian rutin dalam proses pembelajaran</span>
                                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Aspek: Refleksi Murid</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-900 align-top">
                            <div className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-200/80 leading-relaxed text-xs font-medium">
                              {sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center align-top">
                            <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                              Terverifikasi Uji Lapangan
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </fieldset>
            )}
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
                Before&ndash;After dan Data Dampak
              </h3>
              <p className="text-xs text-slate-500">
                Setiap perubahan harus disertai bukti konkret dari pembelajaran guru {currentSupervision.teacherName}.
              </p>
            </div>

            {/* 1. Tabel Kesimpulan Nyatakan: Indikator, Selidiki (Before) dan Uji (After) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span>1. Tabel Kesimpulan Nyatakan: Indikator, Selidiki (Before) dan Uji (After)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Menghubungkan secara komparatif data kesimpulan Tahap Selidiki (Before) dan Tahap Uji (After) per indikator pembelajaran untuk {currentSupervision.teacherName}.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const before = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                      const after = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                      setSambungDraft({
                        ...sambungDraft,
                        selidiki: { ...sambungDraft.selidiki, matriksBefore: before },
                        uji: { ...sambungDraft.uji, matriksAfter: after },
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          beforeAfter: [
                            { aspek: 'Peran guru', sebelumSambung: before.peranGuru, setelahSambung: after.peranGuru },
                            { aspek: 'Aktivitas murid', sebelumSambung: before.aktivitasMurid, setelahSambung: after.aktivitasMurid },
                            { aspek: 'Konteks kehidupan nyata', sebelumSambung: before.konteksNyata, setelahSambung: after.konteksNyata },
                            { aspek: 'Refleksi murid', sebelumSambung: before.refleksiMurid, setelahSambung: after.refleksiMurid },
                          ],
                        },
                      });
                      setSaveToast('Data deskripsi Before-After berhasil disinkronkan dari Selidiki & Uji!');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sinkronkan Ulang dari Selidiki &amp; Uji</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse rounded-2xl overflow-hidden border border-slate-200 bg-white">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px]">
                      <th className="py-3 px-3.5 text-center w-12">No</th>
                      <th className="py-3 px-3.5 text-left w-56">Indikator Pembelajaran</th>
                      <th className="py-3 px-3.5 text-left">Selidiki (Before)</th>
                      <th className="py-3 px-3.5 text-left">Uji (After)</th>
                      <th className="py-3 px-3.5 text-left w-64">Arah Transformasi yang Terlihat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Row 1: Peran Guru */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">1</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Guru berorientasi pada pengalaman belajar murid</span>
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Aspek: Peran Guru</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.peranGuru || DEFAULT_MATRIKS_BEFORE.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, peranGuru: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal peran guru..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.peranGuru || DEFAULT_MATRIKS_AFTER.peranGuru}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, peranGuru: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('peran') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan peran guru..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-indigo-50/30">
                        <span className="font-semibold text-indigo-900 block leading-snug">
                          Dari berfokus pada penyampaian materi menuju pengalaman belajar murid
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Guru beralih dari ceramah satu arah menjadi coach inkuiri dan fasilitator.
                        </p>
                      </td>
                    </tr>

                    {/* Row 2: Aktivitas Murid */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">2</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Murid aktif mengaplikasikan pengetahuan</span>
                            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Aspek: Aktivitas Murid</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.aktivitasMurid || DEFAULT_MATRIKS_BEFORE.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, aktivitasMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal aktivitas murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.aktivitasMurid || DEFAULT_MATRIKS_AFTER.aktivitasMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, aktivitasMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('aktivitas') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan aktivitas murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-purple-50/30">
                        <span className="font-semibold text-purple-900 block leading-snug">
                          Dari lebih banyak menerima menjadi lebih aktif mengaplikasikan pengetahuan
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Murid terlibat aktif dalam eksplorasi mandiri, diskusi kelompok, dan simulasi nyata.
                        </p>
                      </td>
                    </tr>

                    {/* Row 3: Konteks Kehidupan Nyata */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">3</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Compass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Pembelajaran terhubung dengan konteks kehidupan nyata murid</span>
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Aspek: Konteks Nyata</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.konteksNyata || DEFAULT_MATRIKS_BEFORE.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, konteksNyata: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal konteks nyata..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.konteksNyata || DEFAULT_MATRIKS_AFTER.konteksNyata}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, konteksNyata: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('konteks') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan konteks nyata..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-amber-50/30">
                        <span className="font-semibold text-amber-900 block leading-snug">
                          Dari belum konsisten menjadi mulai dirancang dalam pembelajaran
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Materi dihubungkan langsung dengan studi kasus nyata, isu lingkungan, dan kehidupan sehari-hari.
                        </p>
                      </td>
                    </tr>

                    {/* Row 4: Refleksi Murid */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 text-center font-bold text-slate-400 align-top">4</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900 align-top bg-slate-50/60">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-snug">Refleksi menjadi bagian rutin dalam proses pembelajaran</span>
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Aspek: Refleksi Murid</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.selidiki.matriksBefore?.refleksiMurid || DEFAULT_MATRIKS_BEFORE.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curBefore = sambungDraft.selidiki.matriksBefore || { ...DEFAULT_MATRIKS_BEFORE };
                            setSambungDraft({
                              ...sambungDraft,
                              selidiki: { ...sambungDraft.selidiki, matriksBefore: { ...curBefore, refleksiMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, sebelumSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-indigo-600 bg-slate-50/30"
                          placeholder="Deskripsi kondisi awal refleksi murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top">
                        <textarea
                          rows={3}
                          value={sambungDraft.uji.matriksAfter?.refleksiMurid || DEFAULT_MATRIKS_AFTER.refleksiMurid}
                          onChange={(e) => {
                            const val = e.target.value;
                            const curAfter = sambungDraft.uji.matriksAfter || { ...DEFAULT_MATRIKS_AFTER };
                            setSambungDraft({
                              ...sambungDraft,
                              uji: { ...sambungDraft.uji, matriksAfter: { ...curAfter, refleksiMurid: val } },
                              nyatakan: {
                                ...sambungDraft.nyatakan,
                                beforeAfter: sambungDraft.nyatakan.beforeAfter.map(item =>
                                  item.aspek.toLowerCase().includes('refleksi') ? { ...item, setelahSambung: val } : item
                                ),
                              },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 text-xs focus:outline-indigo-600 bg-purple-50/20 font-medium text-slate-900"
                          placeholder="Deskripsi kondisi setelah perbaikan refleksi murid..."
                        />
                      </td>
                      <td className="py-3 px-3.5 align-top bg-blue-50/30">
                        <span className="font-semibold text-blue-900 block leading-snug">
                          Dari belum rutin menjadi mulai menjadi bagian pembelajaran
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Refleksi terbimbing 10-15 menit di setiap sesi melatih kemandirian dan kesadaran proses belajar murid.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Data Dampak Table (Sesuai File / Gambar yang Diunggah) */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-indigo-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <TrendingUp className="w-3 h-3 text-indigo-600" />
                    <span>Terhubung Hasil Supervisi Pengawas</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>2. Data Dampak Pembelajaran Murid (Indikator Kuantitatif &amp; Makna)</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Informasi deskriptif dan capaian kuantitatif untuk <strong>{currentSupervision.teacherName}</strong> ({currentSupervision.subject} &bull; {currentSupervision.schoolName}) yang diselaraskan dengan hasil telaah perangkat dan observasi kelas.
                  </p>
                  
                  {/* Status Penilaian Guru Badge */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold shadow-2xs">
                      Materi: <strong className="text-indigo-900">{currentSupervision.lessonTitle || 'Materi Pokok Pembelajaran'}</strong>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      Skor Telaah Modul: <strong>{currentSupervision.perangkatAjar?.telaahSummary?.finalScore ?? '-'}/100</strong> ({currentSupervision.perangkatAjar?.telaahSummary?.predicate || 'Belum Dinilai'})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                      Skor Observasi Kelas: <strong>{currentSupervision.observasiKelas?.score ?? '-'}/100</strong> ({currentSupervision.observasiKelas?.predicate || 'Belum Diobservasi'})
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = getTeacherDescriptiveDataDampak(
                        currentSupervision.teacherName,
                        currentSupervision.subject,
                        currentSupervision.schoolName,
                        currentSupervision.lessonTitle,
                        currentSupervision.perangkatAjar?.telaahSummary?.predicate,
                        currentSupervision.observasiKelas?.predicate
                      );
                      setSambungDraft({
                        ...sambungDraft,
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          dataDampak: updated,
                        },
                      });
                      setSaveToast(`Informasi deskriptif berhasil diselaraskan dengan penilaian ${currentSupervision.teacherName}!`);
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sinkronkan Deskripsi Sesuai Penilaian Guru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSambungDraft({
                        ...sambungDraft,
                        nyatakan: {
                          ...sambungDraft.nyatakan,
                          dataDampak: DEFAULT_DATA_DAMPAK.map(d => ({ ...d })),
                        },
                      });
                      setSaveToast('Indikator standar data dampak berhasil dipulihkan!');
                      setTimeout(() => setSaveToast(null), 3000);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs text-center transition-colors cursor-pointer"
                  >
                    Pulihkan Standar
                  </button>
                </div>
              </div>

              {/* TABEL DATA DAMPAK DENGAN INFORMASI DESKRIPTIF PENILAIAN */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200 text-xs">
                      <th className="py-3 px-4 text-left w-64">Indikator &amp; Bukti Kegiatan</th>
                      <th className="py-3 px-3 text-center w-28">Kondisi Awal</th>
                      <th className="py-3 px-3 text-center w-36">Setelah SAMBUNG</th>
                      <th className="py-3 px-4 text-left">Makna &amp; Uraian Deskriptif Hasil Penilaian Pengawas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sambungDraft.nyatakan.dataDampak.map((row, idx) => {
                      const valAwal = parseFloat((row.awal || '').replace(/[^0-9.]/g, '')) || 0;
                      const valAkhir = parseFloat((row.akhir || '').replace(/[^0-9.]/g, '')) || 0;
                      const delta = valAkhir - valAwal;

                      const dimensionLabels = [
                        'Dimensi Orientasi & Pengalaman Belajar',
                        'Dimensi Kemandirian & Pengaplikasian HOTS',
                        'Dimensi Relevansi Konteks Kehidupan Riil',
                        'Dimensi Metakognisi & Rutinitas Refleksi'
                      ];

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors align-top">
                          {/* Indikator & Bukti Kegiatan */}
                          <td className="py-4 px-4 bg-slate-50/40 border-r border-slate-100">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={row.indikator}
                                  onChange={(e) => {
                                    const list = [...sambungDraft.nyatakan.dataDampak];
                                    list[idx].indikator = e.target.value;
                                    setSambungDraft({
                                      ...sambungDraft,
                                      nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                    });
                                  }}
                                  className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:bg-white focus:outline-hidden text-xs bg-transparent font-extrabold text-slate-900 leading-snug"
                                />
                              </div>

                              <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                                {dimensionLabels[idx] || 'Dimensi Mutu Pembelajaran'}
                              </span>

                              {/* Bukti Dokumen/Kegiatan Input */}
                              <div className="pt-1">
                                <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                  Bukti Pendukung / Artefak:
                                </span>
                                <input
                                  type="text"
                                  value={row.buktiKegiatan || ''}
                                  placeholder="Contoh: Modul Ajar, Foto PhET, Lembar Refleksi U2..."
                                  onChange={(e) => {
                                    const list = [...sambungDraft.nyatakan.dataDampak];
                                    list[idx].buktiKegiatan = e.target.value;
                                    setSambungDraft({
                                      ...sambungDraft,
                                      nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                    });
                                  }}
                                  className="w-full px-2 py-1 text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </td>

                          {/* Kondisi Awal */}
                          <td className="py-4 px-3 text-center">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Sebelum
                              </span>
                              <div className="inline-block px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-800 text-xs shadow-2xs">
                                <input
                                  type="text"
                                  value={row.awal}
                                  onChange={(e) => {
                                    const list = [...sambungDraft.nyatakan.dataDampak];
                                    list[idx].awal = e.target.value;
                                    setSambungDraft({
                                      ...sambungDraft,
                                      nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                    });
                                  }}
                                  className="w-12 text-center font-black text-slate-800 focus:outline-none bg-transparent"
                                />
                              </div>
                            </div>
                          </td>

                          {/* Setelah SAMBUNG */}
                          <td className="py-4 px-3 text-center">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                                Sesudah
                              </span>
                              <div className="inline-block px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 font-extrabold text-emerald-800 text-xs shadow-2xs">
                                <input
                                  type="text"
                                  value={row.akhir}
                                  onChange={(e) => {
                                    const list = [...sambungDraft.nyatakan.dataDampak];
                                    list[idx].akhir = e.target.value;
                                    setSambungDraft({
                                      ...sambungDraft,
                                      nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                    });
                                  }}
                                  className="w-12 text-center font-black text-emerald-800 focus:outline-none bg-transparent"
                                />
                              </div>
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200 mt-0.5">
                                +{delta}%
                              </span>
                            </div>
                          </td>

                          {/* Makna & Uraian Deskriptif Hasil Penilaian Pengawas */}
                          <td className="py-4 px-4 space-y-2">
                            {/* Ringkasan Makna */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                                Ringkasan Makna Perubahan:
                              </span>
                              <div className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 shadow-2xs">
                                <input
                                  type="text"
                                  value={row.makna || ''}
                                  onChange={(e) => {
                                    const list = [...sambungDraft.nyatakan.dataDampak];
                                    list[idx].makna = e.target.value;
                                    setSambungDraft({
                                      ...sambungDraft,
                                      nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                    });
                                  }}
                                  placeholder="Ringkasan makna perubahan singkat..."
                                  className="w-full text-xs font-semibold text-slate-800 focus:outline-none bg-transparent"
                                />
                              </div>
                            </div>

                            {/* Uraian Deskriptif Spesifik Berdasarkan Penilaian Guru */}
                            <div>
                              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block mb-1">
                                Uraian Deskriptif Hasil Penilaian Supervisi ({currentSupervision.teacherName}):
                              </span>
                              <textarea
                                value={row.deskripsiPenilaian || ''}
                                rows={3}
                                onChange={(e) => {
                                  const list = [...sambungDraft.nyatakan.dataDampak];
                                  list[idx].deskripsiPenilaian = e.target.value;
                                  setSambungDraft({
                                    ...sambungDraft,
                                    nyatakan: { ...sambungDraft.nyatakan, dataDampak: list },
                                  });
                                }}
                                placeholder={`Tuliskan uraian deskriptif bagaimana ${currentSupervision.teacherName} bertransformasi pada indikator ini sesuai hasil supervisi telaah modul dan observasi kelas...`}
                                className="w-full text-xs text-slate-800 bg-indigo-50/40 border border-indigo-200/80 rounded-xl p-2.5 focus:border-indigo-600 focus:bg-white focus:outline-none transition-all resize-y leading-relaxed"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 italic mt-1">
                *Data deskriptif di atas terhubung langsung dengan penilaian telaah modul ajar dan observasi tatap muka pengawas sekolah untuk {currentSupervision.teacherName}.
              </p>
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
                      onClick={handleAutoFillGerakkan}
                      disabled={isAutoFillingGerakkan}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-700 hover:from-cyan-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 border border-cyan-400/40"
                      title="Otomatis menyinkronkan temuan Selidiki, Amati, Maknai, Berdayakan, Uji, dan Nyatakan ke dalam 5 RTL Terstruktur & Program Pengimbasan"
                    >
                      <Sparkles className={`w-4 h-4 text-amber-300 ${isAutoFillingGerakkan ? 'animate-spin' : ''}`} />
                      <span>{isAutoFillingGerakkan ? 'Menyinkronkan Instrumen Gerakkan...' : 'Isi & Sinkronkan Otomatis Tahap GERAKKAN'}</span>
                    </button>

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
                        <h5 className="font-bold text-xs text-slate-900">Pembuktian Kelas (25 Aspek &amp; Suara Murid)</h5>
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
