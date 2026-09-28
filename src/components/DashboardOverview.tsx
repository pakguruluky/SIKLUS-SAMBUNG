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
  PieChart
} from 'lucide-react';
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
  onApproveTeacher,
  onOpenSambung,
  users = [],
}) => {
  const scoresChartRef = useRef<HTMLCanvasElement | null>(null);
  const completionChartRef = useRef<HTMLCanvasElement | null>(null);
  const statusDoughnutRef = useRef<HTMLCanvasElement | null>(null);

  const scoresChartInstance = useRef<ChartJS | null>(null);
  const completionChartInstance = useRef<ChartJS | null>(null);
  const statusChartInstance = useRef<ChartJS | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isKepsek = currentUser.role === 'kepsek';
  const isGuru = currentUser.role === 'guru';

  // Selected school filter for charts (Admin can filter specific school or All)
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');

  // Teacher approval state tracker
  const [approvedTeachersLocal, setApprovedTeachersLocal] = useState<Record<string, boolean>>({
    'teacher-dewi': true,
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
        const labels = targetSchools.map(s => s.name.replace('Kota Bandung', '').trim());
        
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
        const labels = targetSchools.map(s => s.name.replace('Kota Bandung', '').trim());

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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:14px_14px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SIKLUS SAMBUNG &bull; Pendampingan Mutu Guru SMA</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {currentUser.displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
              {isAdmin
                ? 'Portal Pengawasan & Pembinaan Akademik SMA binaan Kusnandar, M.Si'
                : isKepsek
                ? `Dashboard Supervisi Akademik Internal ${currentUser.schoolName || 'Satuan Pendidikan'}.`
                : `Ruang Kerja Guru & Portofolio Supervisi Pembelajaran ${currentUser.subject || ''} (${currentUser.schoolName || ''}).`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onOpenSambung && (
              <button
                onClick={() => onOpenSambung()}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Instrumen SAMBUNG</span>
              </button>
            )}
            {!isGuru && (
              <button
                onClick={onNewSupervision}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>+ Mulai Supervisi</span>
              </button>
            )}
            <button
              onClick={onNavigateSupervisions}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>{isGuru ? 'Lihat Portofolio Saya' : 'Lihat Semua Berkas'}</span>
            </button>
          </div>
        </div>
      </div>

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

          {/* SAMBUNG Banner card for Guru */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 rounded-2xl border border-indigo-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-amber-300 text-lg">
                S-G
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Apresiasi GTK 2026</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base">
                  Instrumen Strategi SAMBUNG Pembelajaran Anda
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Akses instrumen 7 tahap: <strong>S</strong>elidiki, <strong>A</strong>rahkan, <strong>M</strong>aknai, <strong>B</strong>erdayakan, <strong>U</strong>ji, <strong>N</strong>yatakan, dan <strong>G</strong>erakkan.
                </p>
              </div>
            </div>
            {onOpenSambung && (
              <button
                onClick={() => onOpenSambung(mySingleSupervision?.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-center"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Buka Portofolio SAMBUNG Saya</span>
              </button>
            )}
          </div>
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

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs max-h-56 overflow-y-auto">
                {supervisions.slice(0, 4).map((sup) => {
                  const isApproved = approvedTeachersLocal[sup.teacherId] ?? true;
                  return (
                    <div key={sup.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{sup.teacherName}</p>
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
              onClick={onNavigateSupervisions}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Nama Guru &amp; Mapel</th>
                  <th className="py-3 px-4">Sekolah</th>
                  <th className="py-3 px-4">Fase / Kelas</th>
                  <th className="py-3 px-4 text-center">Telaah RPP</th>
                  <th className="py-3 px-4 text-center">Revisi Perangkat</th>
                  <th className="py-3 px-4 text-center">Observasi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supervisions.slice(0, 5).map((sup) => {
                  const revisiDone = Boolean(sup.perangkatAjar?.revisi?.modulAjarRevisiUrl);
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{sup.teacherName}</p>
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
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sup.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sup.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {sup.status === 'completed' ? 'Selesai' : sup.status === 'in_progress' ? 'Proses Observasi' : 'Draf/Pengajuan'}
                        </span>
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
  );
};
