import React, { useEffect, useRef, useState, useMemo } from 'react';
import { School, Supervision, UserProfile } from '../types';
import { 
  Building2, 
  FileCheck2, 
  Award, 
  Clock, 
  TrendingUp, 
  Users, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FolderGit2,
  ChevronRight,
  UserCheck,
  Check,
  Filter,
  BarChart3,
  Layers,
  PieChart,
  PlusCircle,
  BookOpen,
  HardDrive,
  Pencil,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  Printer,
  GraduationCap,
  MoreVertical,
  X,
  FileText,
  Trash2
} from 'lucide-react';
import { EditGuruSupervisiModal } from './forms/EditGuruSupervisiModal';
import { KesimpulanSemuaGuruDashboard } from './KesimpulanSemuaGuruDashboard';
import { getSupervisionSambungProgress } from '../utils/sambungProgress';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  BarController,
  DoughnutController
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  BarController,
  DoughnutController
);

interface DashboardOverviewProps {
  schools: School[];
  supervisions: Supervision[];
  currentUser: UserProfile;
  onNavigateSupervisions: () => void;
  onNavigateSchools: () => void;
  onNewSupervision: () => void;
  onOpenForm?: (supervision: Supervision, stage: 'perangkat' | 'pra' | 'observasi' | 'pasca' | 'evaluasi') => void;
  onOpenPrint?: (supervision: Supervision) => void;
  onApproveTeacher?: (uid: string) => void;
  onOpenSambung?: (supervisionId?: string) => void;
  onOpenStorageModal?: () => void;
  onNavigateKesimpulan?: () => void;
  onUpdateSupervision?: (updated: Supervision) => void;
  onDeleteSupervision?: (id: string) => Promise<void> | void;
  users?: UserProfile[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  schools,
  supervisions,
  currentUser,
  onNavigateSupervisions,
  onNavigateSchools,
  onNewSupervision,
  onOpenForm,
  onOpenPrint,
  onApproveTeacher,
  onOpenSambung,
  onOpenStorageModal,
  onNavigateKesimpulan,
  onUpdateSupervision,
  onDeleteSupervision,
  users = [],
}) => {
  const getPredicateTag = (s: Supervision): string | null => {
    if (s.teacherName.includes('Hilmia')) return '[B, SB]';
    if (s.teacherName.includes('Sondang') || s.teacherName.includes('Kirana')) return '[SB, SB]';
    if (s.teacherName.includes('Alline') || s.teacherName.includes('Ivany')) return '[SB]';
    if (s.teacherName.includes('Iqbal') || s.teacherName.includes('Widya') || s.teacherName.includes('Saulina')) return '[B]';
    if (s.teacherName.includes('Lutfiana')) return '[C]';
    return null;
  };
  const scoresChartRef = useRef<HTMLCanvasElement | null>(null);
  const completionChartRef = useRef<HTMLCanvasElement | null>(null);
  const statusDoughnutRef = useRef<HTMLCanvasElement | null>(null);

  const scoresChartInstance = useRef<ChartJS | null>(null);
  const completionChartInstance = useRef<ChartJS | null>(null);
  const statusChartInstance = useRef<ChartJS | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isKepsek = currentUser.role === 'kepsek';
  const isGuru = currentUser.role === 'guru';

  // Active view tab: Data Seluruh Guru Supervisi (default), Kesimpulan Semua Guru, or Analitik Mutu Supervisi
  const [dashboardTab, setDashboardTab] = useState<'guru_supervisi' | 'kesimpulan' | 'analitik'>('guru_supervisi');

  // Filter & Search states for Data Seluruh Guru
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPredicate, setFilterPredicate] = useState<string>('all');
  const [teacherViewMode, setTeacherViewMode] = useState<'table' | 'card'>('table');
  const [editingTeacher, setEditingTeacher] = useState<Supervision | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Teacher approval state tracker
  const [approvedTeachersLocal, setApprovedTeachersLocal] = useState<Record<string, boolean>>({
    'teacher-sondang': true,
    'teacher-ahmad': true,
    'teacher-budi': true,
    'teacher-siti': true,
  });

  // Strict isolation: if Guru, only own supervisions
  const mySupervisions = useMemo(() => {
    if (isGuru) {
      return supervisions.filter(
        s => s.teacherId === currentUser.uid || s.teacherName.toLowerCase() === currentUser.displayName.toLowerCase()
      );
    }
    if (isKepsek) {
      return supervisions.filter(
        s => s.schoolId === currentUser.schoolId || s.schoolName === currentUser.schoolName
      );
    }
    return supervisions;
  }, [supervisions, isGuru, isKepsek, currentUser]);

  const mySingleSupervision = mySupervisions[0] || null;

  // Compute KPI statistics based on authorized records
  const totalSupervisions = mySupervisions.length;
  const completedSupervisions = mySupervisions.filter(s => s.status === 'completed').length;
  const inProgressSupervisions = mySupervisions.filter(s => s.status === 'in_progress').length;
  const submittedSupervisions = mySupervisions.filter(s => s.status === 'submitted' || s.status === 'draft').length;

  const validScores = mySupervisions
    .map(s => s.observasiKelas?.score)
    .filter((s): s is number => typeof s === 'number' && s > 0);
  const avgObsScore = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : '0.0';

  const validTelaahScores = mySupervisions
    .map(s => s.perangkatAjar?.telaahSummary?.finalScore)
    .filter((s): s is number => typeof s === 'number' && s > 0);
  const avgTelaahScore = validTelaahScores.length > 0
    ? (validTelaahScores.reduce((a, b) => a + b, 0) / validTelaahScores.length).toFixed(1)
    : '0.0';

  // Chart Rendering Logic using Chart.js
  useEffect(() => {
    if (isGuru) return; // Charts are dedicated for Admin and Headmasters

    // Target Schools for Charting
    let targetSchools = schools;
    if (isKepsek) {
      // Kepsek focuses on their school
      targetSchools = schools.filter(s => s.id === currentUser.schoolId || s.name === currentUser.schoolName);
      if (targetSchools.length === 0 && currentUser.schoolName) {
        targetSchools = [{
          id: currentUser.schoolId || 'sch-kepsek',
          name: currentUser.schoolName,
          npsn: '-',
          address: '',
          principalName: currentUser.displayName,
          accreditation: 'A',
          createdAt: '',
          createdBy: 'system'
        }];
      }
    } else if (selectedSchoolFilter !== 'all') {
      targetSchools = schools.filter(s => s.id === selectedSchoolFilter);
    }

    // -------------------------------------------------------------
    // CHART 1: AVERAGE SUPERVISION SCORES PER SCHOOL (ADMIN & KEPSEK)
    // -------------------------------------------------------------
    if (scoresChartRef.current) {
      if (scoresChartInstance.current) scoresChartInstance.current.destroy();

      if (isAdmin && selectedSchoolFilter === 'all') {
        // Multi-school comparison
        const labels = targetSchools.map(s => s.name);
        
        // 1. Avg Telaah RPP Scores
        const avgTelaahPerSchool = targetSchools.map(sch => {
          const match = supervisions.filter(s => 
            (s.schoolId === sch.id || s.schoolName === sch.name) &&
            s.perangkatAjar?.telaahSummary?.finalScore &&
            s.perangkatAjar.telaahSummary.finalScore > 0
          );
          if (match.length === 0) return 0;
          const sum = match.reduce((a, b) => a + (b.perangkatAjar.telaahSummary.finalScore || 0), 0);
          return parseFloat((sum / match.length).toFixed(1));
        });

        // 2. Avg Observasi Kelas Scores
        const avgObsPerSchool = targetSchools.map(sch => {
          const match = supervisions.filter(s => 
            (s.schoolId === sch.id || s.schoolName === sch.name) &&
            s.observasiKelas?.score &&
            s.observasiKelas.score > 0
          );
          if (match.length === 0) return 0;
          const sum = match.reduce((a, b) => a + (b.observasiKelas.score || 0), 0);
          return parseFloat((sum / match.length).toFixed(1));
        });

        // 3. Avg Evaluasi Tahunan Scores
        const avgEvaluasiPerSchool = targetSchools.map(sch => {
          const match = supervisions.filter(s => 
            (s.schoolId === sch.id || s.schoolName === sch.name) &&
            s.evaluasiTahunan?.finalAverageScore &&
            s.evaluasiTahunan.finalAverageScore > 0
          );
          if (match.length === 0) return 0;
          const sum = match.reduce((a, b) => a + (b.evaluasiTahunan.finalAverageScore || 0), 0);
          return parseFloat((sum / match.length).toFixed(1));
        });

        scoresChartInstance.current = new ChartJS(scoresChartRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Telaah Modul Ajar (RPP)',
                data: avgTelaahPerSchool,
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1.5,
                borderRadius: 6,
              },
              {
                label: 'Observasi Kelas (5M/HOTS)',
                data: avgObsPerSchool,
                backgroundColor: 'rgba(16, 185, 129, 0.85)',
                borderColor: 'rgb(5, 150, 105)',
                borderWidth: 1.5,
                borderRadius: 6,
              },
              {
                label: 'Evaluasi Tahunan',
                data: avgEvaluasiPerSchool,
                backgroundColor: 'rgba(168, 85, 247, 0.85)',
                borderColor: 'rgb(147, 51, 234)',
                borderWidth: 1.5,
                borderRadius: 6,
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} poin`
                }
              }
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: { stepSize: 20 },
                grid: { color: 'rgba(226, 232, 240, 0.6)' }
              },
              x: {
                grid: { display: false }
              }
            }
          }
        });
      } else {
        // Single School View (Kepsek or Admin single school drill-down):
        // Breakdown scores per Subject/Teacher in that school
        const currentTargetSchool = targetSchools[0];
        const schoolSupervisions = supervisions.filter(s => 
          s.schoolId === currentTargetSchool?.id || s.schoolName === currentTargetSchool?.name
        );

        const labels = schoolSupervisions.map(s => `${s.teacherName.split(',')[0]} (${s.subject})`);
        const telaahScores = schoolSupervisions.map(s => s.perangkatAjar?.telaahSummary?.finalScore || 0);
        const obsScores = schoolSupervisions.map(s => s.observasiKelas?.score || 0);

        scoresChartInstance.current = new ChartJS(scoresChartRef.current, {
          type: 'bar',
          data: {
            labels: labels.length > 0 ? labels : ['Belum Ada Guru Terdaftar'],
            datasets: [
              {
                label: 'Skor Telaah RPP',
                data: telaahScores.length > 0 ? telaahScores : [0],
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1.5,
                borderRadius: 6,
              },
              {
                label: 'Skor Observasi Kelas',
                data: obsScores.length > 0 ? obsScores : [0],
                backgroundColor: 'rgba(16, 185, 129, 0.85)',
                borderColor: 'rgb(5, 150, 105)',
                borderWidth: 1.5,
                borderRadius: 6,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} poin`
                }
              }
            },
            scales: {
              y: {
                min: 0,
                max: 100,
                ticks: { stepSize: 20 },
                grid: { color: 'rgba(226, 232, 240, 0.6)' }
              },
              x: {
                grid: { display: false }
              }
            }
          }
        });
      }
    }

    // -------------------------------------------------------------
    // CHART 2: COMPLETION STATUS PER SCHOOL (STACKED BAR CHART)
    // -------------------------------------------------------------
    if (completionChartRef.current) {
      if (completionChartInstance.current) completionChartInstance.current.destroy();

      if (isAdmin && selectedSchoolFilter === 'all') {
        const labels = targetSchools.map(s => s.name);

        const completedCounts = targetSchools.map(sch => 
          supervisions.filter(s => (s.schoolId === sch.id || s.schoolName === sch.name) && s.status === 'completed').length
        );
        const inProgressCounts = targetSchools.map(sch => 
          supervisions.filter(s => (s.schoolId === sch.id || s.schoolName === sch.name) && s.status === 'in_progress').length
        );
        const draftCounts = targetSchools.map(sch => 
          supervisions.filter(s => (s.schoolId === sch.id || s.schoolName === sch.name) && (s.status === 'draft' || s.status === 'submitted')).length
        );

        completionChartInstance.current = new ChartJS(completionChartRef.current, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Selesai Penuh',
                data: completedCounts,
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                borderColor: 'rgb(5, 150, 105)',
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: 'Dalam Proses Observasi',
                data: inProgressCounts,
                backgroundColor: 'rgba(245, 158, 11, 0.9)',
                borderColor: 'rgb(217, 119, 6)',
                borderWidth: 1,
                borderRadius: 4,
              },
              {
                label: 'Draf / Pengajuan Berkas',
                data: draftCounts,
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1,
                borderRadius: 4,
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                grid: { display: false }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { color: 'rgba(226, 232, 240, 0.6)' }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} berkas guru`
                }
              }
            }
          }
        });
      } else {
        // Single School / Kepsek View: Show status breakdown by Subject / Teacher
        const currentTargetSchool = targetSchools[0];
        const schoolSupervisions = supervisions.filter(s => 
          s.schoolId === currentTargetSchool?.id || s.schoolName === currentTargetSchool?.name
        );

        const labels = schoolSupervisions.map(s => `${s.teacherName.split(',')[0]} (${s.subject})`);
        const statusValues = schoolSupervisions.map(s => 
          s.status === 'completed' ? 3 : s.status === 'in_progress' ? 2 : 1
        );

        completionChartInstance.current = new ChartJS(completionChartRef.current, {
          type: 'bar',
          data: {
            labels: labels.length > 0 ? labels : ['Belum Ada Guru Terdaftar'],
            datasets: [
              {
                label: 'Tahap Kemajuan Supervisi (1=Draf, 2=Observasi, 3=Selesai)',
                data: statusValues.length > 0 ? statusValues : [0],
                backgroundColor: schoolSupervisions.map(s => 
                  s.status === 'completed' ? 'rgba(16, 185, 129, 0.85)' : s.status === 'in_progress' ? 'rgba(245, 158, 11, 0.85)' : 'rgba(99, 102, 241, 0.85)'
                ),
                borderRadius: 6,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 3,
                ticks: {
                  stepSize: 1,
                  callback: (val) => val === 3 ? 'Selesai' : val === 2 ? 'Observasi' : val === 1 ? 'Draf' : ''
                },
                grid: { color: 'rgba(226, 232, 240, 0.6)' }
              },
              x: { grid: { display: false } }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const val = ctx.raw as number;
                    return val === 3 ? ' Status: Selesai Penuh' : val === 2 ? ' Status: Dalam Proses Observasi' : ' Status: Draf / Pengajuan Berkas';
                  }
                }
              }
            }
          }
        });
      }
    }

    // -------------------------------------------------------------
    // CHART 3: STATUS BREAKDOWN DOUGHNUT
    // -------------------------------------------------------------
    if (statusDoughnutRef.current) {
      if (statusChartInstance.current) statusChartInstance.current.destroy();

      statusChartInstance.current = new ChartJS(statusDoughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Selesai Penuh', 'Dalam Proses (Observasi)', 'Draf / Pengajuan Baru'],
          datasets: [
            {
              data: [completedSupervisions, inProgressSupervisions, submittedSupervisions],
              backgroundColor: [
                'rgba(16, 185, 129, 0.9)',
                'rgba(245, 158, 11, 0.9)',
                'rgba(99, 102, 241, 0.9)',
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} berkas`
              }
            }
          },
          cutout: '65%'
        }
      });
    }

    return () => {
      if (scoresChartInstance.current) scoresChartInstance.current.destroy();
      if (completionChartInstance.current) completionChartInstance.current.destroy();
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [schools, supervisions, completedSupervisions, inProgressSupervisions, submittedSupervisions, isGuru, isKepsek, isAdmin, currentUser, selectedSchoolFilter]);

  const hasReviewedPerangkat = Boolean(mySingleSupervision?.perangkatAjar?.reviewedAt);
  const hasUploadedRevisi = Boolean(mySingleSupervision?.perangkatAjar?.revisi?.modulAjarRevisiUrl);

  const handleToggleTeacherApproval = (teacherId: string) => {
    setApprovedTeachersLocal(prev => {
      const nextState = !prev[teacherId];
      if (onApproveTeacher && nextState) {
        onApproveTeacher(teacherId);
      }
      return { ...prev, [teacherId]: nextState };
    });
  };

  // Unique schools for teacher filters
  const uniqueSchoolsList = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach(s => map.set(s.id, s.name));
    mySupervisions.forEach(s => {
      if (s.schoolId && s.schoolName) {
        map.set(s.schoolId, s.schoolName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [schools, mySupervisions]);

  // Filtered teachers list for Data Seluruh Guru view
  const filteredTeacherList = useMemo(() => {
    return mySupervisions.filter(s => {
      // School filter
      if (filterSchool !== 'all') {
        const schMatch = s.schoolId === filterSchool || s.schoolName.toLowerCase().trim() === filterSchool.toLowerCase().trim();
        if (!schMatch) return false;
      }
      // Status filter
      if (filterStatus !== 'all' && s.status !== filterStatus) {
        return false;
      }
      // Predicate filter
      if (filterPredicate !== 'all') {
        const tag = getPredicateTag(s) || '';
        if (filterPredicate === 'SB' && !tag.includes('SB')) return false;
        if (filterPredicate === 'B' && !tag.includes('B')) return false;
        if (filterPredicate === 'C' && !tag.includes('C')) return false;
      }
      // Search query
      if (teacherSearch.trim()) {
        const q = teacherSearch.toLowerCase().trim();
        const matchName = s.teacherName.toLowerCase().includes(q);
        const matchSubject = s.subject.toLowerCase().includes(q);
        const matchSchool = s.schoolName.toLowerCase().includes(q);
        const matchTopic = (s.lessonTitle || '').toLowerCase().includes(q);
        const matchNip = (s.teacherNip || '').toLowerCase().includes(q);
        const matchGrade = (s.classGrade || '').toLowerCase().includes(q);
        if (!matchName && !matchSubject && !matchSchool && !matchTopic && !matchNip && !matchGrade) {
          return false;
        }
      }
      return true;
    });
  }, [mySupervisions, filterSchool, filterStatus, filterPredicate, teacherSearch]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
              {isAdmin
                ? 'Pengawasan Pembina SMA · Kota Bogor'
                : isKepsek
                ? `Kepala Sekolah · ${currentUser.schoolName || 'Satuan Pendidikan'}`
                : `Guru Mata Pelajaran ${currentUser.subject || ''} · ${currentUser.schoolName || ''}`}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Selamat Datang, {currentUser.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Portal Supervisi Akademik & Pendampingan Mutu 7 Satuan Pendidikan SMA Binaan Resmi.'
                : isKepsek
                ? `Dashboard supervisi akademik dan pemantauan kinerja guru di ${currentUser.schoolName || 'satuan pendidikan'}.`
                : `Ruang kerja dan portofolio supervisi pembelajaran Kurikulum Merdeka.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {!isGuru && (
              <button
                onClick={onNewSupervision}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Mulai Supervisi</span>
              </button>
            )}
            {onOpenSambung && (
              <button
                onClick={() => onOpenSambung()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Instrumen SAMBUNG</span>
              </button>
            )}
            {onOpenStorageModal && (
              <button
                onClick={onOpenStorageModal}
                title="Status Database Firebase Firestore & Cadangan Sistem"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firebase &amp; Backup</span>
              </button>
            )}
            <button
              onClick={onOpenSambung ? () => onOpenSambung() : onNavigateSupervisions}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>{isGuru ? 'Buka Portofolio SAMBUNG' : 'Buka Instrumen SAMBUNG'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD VIEW SWITCHER (Data Seluruh Guru vs Kesimpulan Siklus vs Analitik Mutu) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setDashboardTab('guru_supervisi')}
          className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'guru_supervisi'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <GraduationCap className={`w-4 h-4 ${dashboardTab === 'guru_supervisi' ? 'text-amber-300' : 'text-indigo-600'}`} />
          <span>Data Seluruh Guru Supervisi</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            dashboardTab === 'guru_supervisi' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {mySupervisions.length} Guru Binaan
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('kesimpulan')}
          className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'kesimpulan'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${dashboardTab === 'kesimpulan' ? 'text-amber-300' : 'text-amber-500'}`} />
          <span>Kesimpulan Siklus SAMBUNG</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            dashboardTab === 'kesimpulan' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            Tabel Dampak &amp; Perubahan
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDashboardTab('analitik')}
          className={`flex-1 min-w-[220px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            dashboardTab === 'analitik'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analitik Mutu Supervisi</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            dashboardTab === 'analitik' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            Statistik &amp; Chart
          </span>
        </button>
      </div>

      {/* VIEW 1: DATA SELURUH GURU YANG TELAH DISUPERVISI & MENU EDIT */}
      {dashboardTab === 'guru_supervisi' && (
        <div className="space-y-6">
          {/* Header & Controls Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Rekapitulasi Supervisi Akademik Guru</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {filteredTeacherList.length} dari {mySupervisions.length} Guru
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  Data Seluruh Guru yang Telah Disupervisi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi lengkap guru binaan, capaian telaah modul ajar, observasi kelas, dan menu edit masing-masing guru.
                </p>
              </div>

              {/* View mode toggle & Mulai supervisi */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTeacherViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      teacherViewMode === 'table'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherViewMode('card')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      teacherViewMode === 'card'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu</span>
                  </button>
                </div>

                {!isGuru && (
                  <button
                    type="button"
                    onClick={onNewSupervision}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Supervisi Baru</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Terdata</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{mySupervisions.length} Guru</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Selesai Penuh</p>
                <p className="text-xl font-black text-emerald-800 mt-0.5">{completedSupervisions} Guru</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Dalam Observasi</p>
                <p className="text-xl font-black text-amber-800 mt-0.5">{inProgressSupervisions} Guru</p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Rata-rata Skor</p>
                <p className="text-xl font-black text-indigo-800 mt-0.5">{avgObsScore}% <span className="text-[11px] font-medium text-slate-500">/ {avgTelaahScore}</span></p>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari guru, NIP, mapel, materi..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-slate-50/50"
                />
                {teacherSearch && (
                  <button
                    type="button"
                    onClick={() => setTeacherSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* School Filter */}
              <div>
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Satuan Pendidikan ({schools.length} SMA)</option>
                  {uniqueSchoolsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Status Supervisi</option>
                  <option value="completed">Selesai Penuh (Completed)</option>
                  <option value="in_progress">Dalam Proses Observasi</option>
                  <option value="draft">Draf / Pengajuan Berkas</option>
                </select>
              </div>

              {/* Predicate Filter */}
              <div>
                <select
                  value={filterPredicate}
                  onChange={(e) => setFilterPredicate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Predikat Capaian</option>
                  <option value="SB">Sangat Baik / Amat Baik (SB / A)</option>
                  <option value="B">Baik (B)</option>
                  <option value="C">Cukup (C)</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {teacherViewMode === 'table' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[920px]">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-3 text-center w-10">No</th>
                      <th className="py-3.5 px-4">Nama Guru &amp; NIP</th>
                      <th className="py-3.5 px-4">Satuan Pendidikan</th>
                      <th className="py-3.5 px-4">Mapel &amp; Fase/Kelas</th>
                      <th className="py-3.5 px-4">Topik Pembelajaran</th>
                      <th className="py-3.5 px-4 text-center">Telaah RPP</th>
                      <th className="py-3.5 px-4 text-center">Observasi</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center w-48">Menu Edit Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeacherList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          Tidak ditemukan data guru yang sesuai kriteria pencarian / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTeacherList.map((sup, idx) => {
                        const tag = getPredicateTag(sup);
                        const modulUrl = sup.perangkatAjar?.driveLinks?.modulAjarUrl;
                        const isMenuOpen = activeMenuId === sup.id;

                        return (
                          <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs shrink-0 mt-0.5">
                                  {sup.teacherName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900">{sup.teacherName}</p>
                                    {tag && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        {tag}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    NIP: {sup.teacherNip || '-'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-800 block">{sup.schoolName}</span>
                              <span className="text-[10px] text-slate-400">Kota Bogor</span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-indigo-700 block">{sup.subject}</span>
                              <span className="text-[11px] text-slate-500">{sup.classGrade}</span>
                            </td>

                            <td className="py-3.5 px-4 max-w-[200px]">
                              <p className="text-slate-700 text-[11px] line-clamp-2 leading-relaxed" title={sup.lessonTitle}>
                                {sup.lessonTitle || '-'}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-black text-indigo-600 text-xs">
                                  {sup.perangkatAjar?.telaahSummary?.finalScore
                                    ? `${sup.perangkatAjar.telaahSummary.finalScore.toFixed(1)}`
                                    : '-'}
                                </span>
                                {sup.perangkatAjar?.telaahSummary?.predicate && (
                                  <span className="text-[9px] font-bold text-slate-500">
                                    {sup.perangkatAjar.telaahSummary.predicate}
                                  </span>
                                )}
                                {modulUrl && (
                                  <a
                                    href={modulUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 mt-0.5 font-medium"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>Modul</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="font-black text-emerald-600 text-xs">
                                  {sup.observasiKelas?.score ? `${sup.observasiKelas.score}%` : '-'}
                                </span>
                                {sup.observasiKelas?.predicate && (
                                  <span className="text-[9px] font-bold text-slate-500">
                                    {sup.observasiKelas.predicate}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                sup.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : sup.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {sup.status === 'completed'
                                  ? 'Selesai'
                                  : sup.status === 'in_progress'
                                  ? 'Observasi'
                                  : 'Draf'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="relative inline-flex items-center gap-1.5">
                                {/* Main Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => setEditingTeacher(sup)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                                  title={`Edit profil, mapel, materi, dan skor supervisi ${sup.teacherName}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit Guru</span>
                                </button>

                                {/* Dropdown menu for more options */}
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(isMenuOpen ? null : sup.id)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                                  title="Menu opsi dan tahapan supervisi lainnya"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {isMenuOpen && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-30"
                                      onClick={() => setActiveMenuId(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 w-56 text-left animate-in fade-in zoom-in-95 duration-100">
                                      <div className="px-3 py-1.5 border-b border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Pilihan Menu Edit Guru
                                        </p>
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                          {sup.teacherName}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          setEditingTeacher(sup);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                      >
                                        <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>Edit Profil &amp; Supervisi</span>
                                      </button>

                                      {onOpenForm && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onOpenForm(sup, 'perangkat');
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Telaah RPP (22 Aspek)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onOpenForm(sup, 'pra');
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Pra-Observasi (8 Aspek)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onOpenForm(sup, 'observasi');
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Observasi Kelas (24 Aspek)</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onOpenForm(sup, 'pasca');
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Pasca-Observasi &amp; RTL</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveMenuId(null);
                                              onOpenForm(sup, 'evaluasi');
                                            }}
                                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                          >
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit Evaluasi 1 Tahun</span>
                                          </button>
                                        </>
                                      )}

                                      <div className="border-t border-slate-100 my-1" />

                                      {onOpenSambung && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            onOpenSambung(sup.id);
                                          }}
                                          className="w-full px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                        >
                                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                          <span>Buka Siklus SAMBUNG</span>
                                        </button>
                                      )}

                                      {onOpenPrint && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            onOpenPrint(sup);
                                          }}
                                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Cetak Laporan Supervisi</span>
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD VIEW */}
          {teacherViewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeacherList.map((sup) => {
                const tag = getPredicateTag(sup);
                return (
                  <div key={sup.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                            {sup.teacherName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-sm leading-tight">{sup.teacherName}</h3>
                              {tag && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">{sup.subject} &bull; {sup.classGrade}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          sup.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sup.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {sup.status === 'completed' ? 'Selesai' : sup.status === 'in_progress' ? 'Observasi' : 'Draf'}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <p className="text-slate-600 font-medium">
                          🏫 <span className="font-semibold">{sup.schoolName}</span>
                        </p>
                        {sup.lessonTitle && (
                          <p className="text-slate-500 text-[11px] line-clamp-2">
                            📖 {sup.lessonTitle}
                          </p>
                        )}
                      </div>

                      {/* Score Boxes */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-800 block">Telaah RPP</span>
                          <span className="text-base font-black text-indigo-600">
                            {sup.perangkatAjar?.telaahSummary?.finalScore ? sup.perangkatAjar.telaahSummary.finalScore.toFixed(1) : '-'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-800 block">Observasi</span>
                          <span className="text-base font-black text-emerald-600">
                            {sup.observasiKelas?.score ? `${sup.observasiKelas.score}%` : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTeacher(sup)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Guru</span>
                      </button>

                      {onOpenSambung && (
                        <button
                          type="button"
                          onClick={() => onOpenSambung(sup.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition-colors"
                          title="Buka Portofolio SAMBUNG"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onOpenPrint && (
                        <button
                          type="button"
                          onClick={() => onOpenPrint(sup)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          title="Cetak Berkas"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DASHBOARD KESIMPULAN DARI SEMUA GURU */}
      {dashboardTab === 'kesimpulan' && (
        <KesimpulanSemuaGuruDashboard
          supervisions={supervisions}
          currentUser={currentUser}
          schools={schools}
          onOpenSambungTeacher={onOpenSambung}
          onOpenForm={onOpenForm}
          onOpenPrint={onOpenPrint}
          onUpdateSupervision={onUpdateSupervision}
        />
      )}

      {/* VIEW 3: ANALITIK KINERJA SUPERVISI & REKAP */}
      {dashboardTab === 'analitik' && (
        <div className="space-y-6">
      {/* SPECIAL GURU VIEW: Individual Status & Revision Notice */}
      {isGuru && mySingleSupervision && (
        <div className="space-y-4">
          {/* Post-review revision notification banner */}
          {hasReviewedPerangkat ? (
            <div className={`p-5 rounded-2xl border ${
              hasUploadedRevisi
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            } shadow-xs`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {hasUploadedRevisi ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm">
                      {hasUploadedRevisi
                        ? 'Perangkat Pembelajaran Hasil Revisi Telah Dikirim'
                        : 'Wajib: Unggah Perangkat Pembelajaran yang Telah Diperbaiki'}
                    </h3>
                    <p className="text-xs mt-0.5 text-slate-700 leading-relaxed">
                      {hasUploadedRevisi
                        ? `Anda telah memperbarui tautan modul ajar pada ${new Date(mySingleSupervision.perangkatAjar.revisi?.revisiSubmittedAt || '').toLocaleDateString('id-ID')}. Status revisi: ${mySingleSupervision.perangkatAjar.revisi?.revisiStatus === 'disetujui' ? 'Disetujui Pengawas' : 'Menunggu Verifikasi'}.`
                        : 'Perangkat pembelajaran Anda telah selesai ditelaah oleh Pengawas/Kepala Sekolah. Anda diwajibkan mengunggah modul ajar yang telah direvisi sesuai catatan umpan balik.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenForm && onOpenForm(mySingleSupervision, 'perangkat')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 ${
                    hasUploadedRevisi
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>{hasUploadedRevisi ? 'Perbarui Link Revisi' : 'Unggah Berkas Revisi Sekarang'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 border-2 border-indigo-300 text-indigo-950 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-0.5">
                      Tahap 1 Supervisi &bull; Sebelum Penilaian
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Unggah Berkas Perencanaan Pembelajaran Awal (CP, TP, ATP, &amp; Modul Ajar)
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Silakan unggah atau perbarui tautan Google Drive berkas perangkat ajar Anda sebelum jadwal telaah instrumen oleh Pengawas/Kepala Sekolah. Anda dapat menyimpan berkas bertahap secara berkala.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenForm && onOpenForm(mySingleSupervision, 'perangkat')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <FolderGit2 className="w-4 h-4" />
                  <span>Unggah Berkas Perencanaan Awal</span>
                </button>
              </div>
            </div>
          )}

          {/* Personal Score Summary Cards for Guru */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                1. Telaah RPP / Modul Ajar
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600">
                  {mySingleSupervision.perangkatAjar?.telaahSummary?.finalScore
                    ? `${mySingleSupervision.perangkatAjar.telaahSummary.finalScore.toFixed(1)}`
                    : 'Belum Dinilai'}
                </span>
                {mySingleSupervision.perangkatAjar?.telaahSummary?.predicate && (
                  <span className="text-xs font-bold text-slate-700">
                    ({mySingleSupervision.perangkatAjar.telaahSummary.predicate})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                Umpan balik: {mySingleSupervision.perangkatAjar?.feedback?.rekomendasi || 'Belum ada catatan supervisor'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                2. Skor Observasi Kelas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {mySingleSupervision.observasiKelas?.score
                    ? `${mySingleSupervision.observasiKelas.score}%`
                    : 'Belum Diobservasi'}
                </span>
                {mySingleSupervision.observasiKelas?.predicate && (
                  <span className="text-xs font-bold text-slate-700">
                    ({mySingleSupervision.observasiKelas.predicate})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                {mySingleSupervision.observasiKelas?.feedbackNotes || 'Observasi tatap muka kelas belum dijadwalkan'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                3. Evaluasi Kinerja 1 Tahun
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-600">
                  {mySingleSupervision.evaluasiTahunan?.finalAverageScore
                    ? `${mySingleSupervision.evaluasiTahunan.finalAverageScore}`
                    : 'Belum Dievaluasi'}
                </span>
                {mySingleSupervision.evaluasiTahunan?.finalGrade && (
                  <span className="text-xs font-bold text-slate-700">
                    ({mySingleSupervision.evaluasiTahunan.finalGrade})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                {mySingleSupervision.evaluasiTahunan?.summaryNotes || 'Rekap portofolio tahunan terintegrasi'}
              </p>
            </div>
          </div>

          {/* SAMBUNG Banner card for Guru with live stage progress */}
          {(() => {
            const myProg = getSupervisionSambungProgress(mySingleSupervision);
            return (
              <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-400 text-base shrink-0">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                        Instrumen Strategi SAMBUNG
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {myProg.statusBadge.text}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-white">
                      Portofolio Supervisi Klinis 7 Tahap Berkesinambungan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tahap Aktif: <strong className="text-indigo-300">Tahap {myProg.currentActiveStage} ({myProg.stages[myProg.currentActiveStage]?.name})</strong> &bull; {myProg.completedStagesCount} dari 7 tahap selesai.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-32 text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400 block mb-1">{myProg.overallPercent}% Tercapai</span>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${myProg.overallPercent}%` }} />
                    </div>
                  </div>
                  {onOpenSambung && (
                    <button
                      onClick={() => onOpenSambung(mySingleSupervision?.id)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-2 justify-center shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-white" />
                      <span>Buka Portofolio SAMBUNG</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* KPI Cards (for Admin & Kepsek) */}
      {!isGuru && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {isAdmin ? 'Target SMA Binaan' : 'Satuan Pendidikan'}
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {isAdmin ? schools.length : 1}
              </p>
              <p className="text-[11px] text-slate-400">
                {isAdmin ? 'Sekolah Pengawasan' : currentUser.schoolName}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Supervisi</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalSupervisions}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">{completedSupervisions} Selesai Penuh</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Observasi</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{avgObsScore}</p>
              <p className="text-[11px] text-slate-400">Skala 100 (24 Aspek Observasi)</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Telaah RPP</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{avgTelaahScore}</p>
              <p className="text-[11px] text-slate-400">22 Aspek Pembelajaran Mendalam</p>
            </div>
          </div>
        </div>
      )}

      {/* CHART.JS ANALYTICS DASHBOARD FOR ADMINS & HEADMASTERS */}
      {!isGuru && (
        <div className="space-y-6">
          
          {/* Chart Controls & Filter Header */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Visualisasi Analitik Mutu &amp; Keterlaksanaan Supervisi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? 'Perbandingan skor supervisi rata-rata dan kemajuan status per sekolah binaan.'
                  : `Visualisasi skor supervisi dan kemajuan guru di ${currentUser.schoolName || 'satuan pendidikan'}.`}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Filter Sekolah:</span>
                <select
                  value={selectedSchoolFilter}
                  onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-indigo-600"
                >
                  <option value="all">Semua SMA Binaan (Perbandingan)</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Average Supervision Scores per School */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Rata-rata Skor Supervisi {isAdmin && selectedSchoolFilter === 'all' ? 'Per Sekolah' : `(${currentUser.schoolName || 'Internal'})`}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Perbandingan Skor Telaah Perencanaan (RPP), Observasi Kelas, &amp; Evaluasi Tahunan (Skala 100)
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <canvas ref={scoresChartRef}></canvas>
              </div>
            </div>

            {/* Chart 2: Completion Status per School */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Status Penyelesaian Supervisi {isAdmin && selectedSchoolFilter === 'all' ? 'Per Sekolah' : `(${currentUser.schoolName || 'Internal'})`}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Distribusi berkas: Selesai Penuh, Proses Observasi, dan Draf / Pengajuan Berkas Guru
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <canvas ref={completionChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Chart 3 & Quick Approval Manager Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 3: Overall Distribution Doughnut */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-amber-600" />
                    <span>Rasio Keterlaksanaan</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">Persentase berkas rampung</p>
                </div>
              </div>
              <div className="h-56 w-full">
                <canvas ref={statusDoughnutRef}></canvas>
              </div>
            </div>

            {/* REQUIREMENT 2 HELPER: Persetujuan Akun Guru (Approved vs Pending) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Persetujuan Akun Guru (Kewenangan Pengawas &amp; Kepala Sekolah)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Guru hanya dapat mengunggah perangkat ajar setelah akunnya disetujui (Approved) oleh Kepala Sekolah/Pengawas.
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Verifikasi Berkas Aktif
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs max-h-72 overflow-y-auto">
                {supervisions.map((sup) => {
                  const isApproved = approvedTeachersLocal[sup.teacherId] ?? true;
                  return (
                    <div key={sup.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900">{sup.teacherName}</p>
                          {(() => {
                            const tag = getPredicateTag(sup);
                            return tag ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {tag}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <p className="text-[11px] text-slate-500">{sup.subject} &bull; {sup.schoolName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isApproved ? 'Disetujui (Approved)' : 'Menunggu Approval'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleTeacherApproval(sup.teacherId)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            isApproved
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                        >
                          {isApproved ? (
                            <span>Cabut Akses</span>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Setujui Akun</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                * Pengawas dan Kepala Sekolah hanya dapat melihat perangkat ajar yang diunggah. Guru dapat menyimpan berkas bertahap.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 2: REKAP SUPERVISI TERKINI HANYA MUNCUL D DASHBOARD PENGAWAS (ADMIN) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekap Supervisi Terkini</h3>
              <p className="text-xs text-slate-500">Kewenangan Pengawas Pembina melihat berkas guru aktif lintas sekolah</p>
            </div>
            <button
              onClick={onOpenSambung ? () => onOpenSambung() : onNavigateSupervisions}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Buka di SAMBUNG</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Nama Guru &amp; Mapel</th>
                  <th className="py-3 px-4">Sekolah</th>
                  <th className="py-3 px-4">Fase / Kelas</th>
                  <th className="py-3 px-4 text-center">Telaah RPP</th>
                  <th className="py-3 px-4 text-center">Revisi Perangkat</th>
                  <th className="py-3 px-4 text-center">Observasi</th>
                  <th className="py-3 px-4 text-center">Status &amp; Progres SAMBUNG</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySupervisions.map((sup) => {
                  const revisiDone = Boolean(sup.perangkatAjar?.revisi?.modulAjarRevisiUrl);
                  const sambungProg = getSupervisionSambungProgress(sup);
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900">{sup.teacherName}</p>
                          {(() => {
                            const tag = getPredicateTag(sup);
                            return tag ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {tag}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <p className="text-[11px] text-slate-500">{sup.subject}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{sup.schoolName}</td>
                      <td className="py-3 px-4 text-slate-600">{sup.classGrade}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-indigo-600">
                          {sup.perangkatAjar?.telaahSummary?.finalScore 
                            ? `${sup.perangkatAjar.telaahSummary.finalScore.toFixed(1)}` 
                            : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {revisiDone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Telah Direvisi
                          </span>
                        ) : sup.perangkatAjar?.reviewedAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Wajib Revisi
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-600">
                          {sup.observasiKelas?.score ? `${sup.observasiKelas.score}%` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center min-w-[170px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${sambungProg.statusBadge.bgColor} ${sambungProg.statusBadge.textColor} ${sambungProg.statusBadge.borderColor}`}>
                            {sambungProg.statusBadge.text}
                          </span>
                          <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className={`h-full transition-all ${
                                sambungProg.overallPercent === 100 
                                  ? 'bg-emerald-500' 
                                  : sambungProg.overallPercent > 0 
                                  ? 'bg-indigo-600' 
                                  : 'bg-blue-300'
                              }`} 
                              style={{ width: `${sambungProg.overallPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onOpenSambung && (
                            <button
                              type="button"
                              onClick={() => onOpenSambung(sup.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors inline-flex items-center gap-1"
                              title={`Buka siklus SAMBUNG untuk ${sup.teacherName}`}
                            >
                              <BookOpen className="w-3 h-3 text-indigo-600" />
                              <span>SAMBUNG</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingTeacher(sup)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-1 border border-slate-200"
                            title={`Edit data guru & hasil supervisi ${sup.teacherName}`}
                          >
                            <Pencil className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          {(currentUser.role === 'admin' || (currentUser.role as string) === 'pengawas') && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Hapus data supervisi guru "${sup.teacherName}" (${sup.subject} - ${sup.schoolName})?\n\nTindakan ini akan menghapus data supervisi secara permanen dari Firebase.`)) {
                                  if (onDeleteSupervision) {
                                    await onDeleteSupervision(sup.id);
                                  }
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors inline-flex items-center gap-1 border border-rose-200"
                              title={`Hapus data supervisi ${sup.teacherName}`}
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Modal Edit Data Guru & Supervisi */}
      {editingTeacher && (
        <EditGuruSupervisiModal
          isOpen={true}
          onClose={() => setEditingTeacher(null)}
          supervision={editingTeacher}
          schools={schools}
          currentUser={currentUser}
          onSaved={(updated) => {
            if (onUpdateSupervision) {
              onUpdateSupervision(updated);
            }
            setEditingTeacher(null);
          }}
          onOpenStageForm={onOpenForm}
          onOpenSambung={onOpenSambung}
          onOpenPrint={onOpenPrint}
        />
      )}
    </div>
  );
};
