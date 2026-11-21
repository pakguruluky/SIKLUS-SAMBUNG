import React, { useState, useEffect } from 'react';
import { UserProfile, School, Role, Supervision } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
  Pencil,
  Eye,
  EyeOff,
  Key,
  Check,
  Wifi,
  WifiOff,
  Cloud,
  HardDrive
} from 'lucide-react';
import {
  fetchAllUsers,
  subscribeToUsers,
  addUserAccount,
  updateUserAccount,
  deleteUserAccount,
  saveSupervision,
  getOnlineMode,
  toggleOnlineMode,
  getHasPendingSync,
  getLastSyncTime
} from '../services/firebase';
import { createEmptySambungData } from '../data/sambungSeed';

interface UserManagementViewProps {
  currentUser: UserProfile;
  schools: School[];
  onUserAdded?: () => void;
  onUserUpdated?: (user: UserProfile) => void;
  onUserDeleted?: (uid: string) => Promise<void> | void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  schools,
  onUserAdded,
  onUserUpdated,
  onUserDeleted
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(() => getOnlineMode());
  const [isTogglingMode, setIsTogglingMode] = useState<boolean>(false);
  const [hasPendingSync, setHasPendingSync] = useState<boolean>(() => getHasPendingSync());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLastSyncTime());

  // Form states - Add User
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('pakkus');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<Role>('guru');
  const [newSchoolId, setNewSchoolId] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states - Edit User
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editRole, setEditRole] = useState<Role>('guru');
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editApprovalStatus, setEditApprovalStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [savingEditUser, setSavingEditUser] = useState(false);
  const [editFormError, setEditFormError] = useState('');

  const showToast = (message: string, duration = 4500) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, duration);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const all = await fetchAllUsers();
      setUsers(all);
    } catch (err) {
      console.warn('Notice loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Real-time subscription to Firebase Firestore users + local storage fallback
    const unsubscribe = subscribeToUsers((liveUsers) => {
      setUsers(liveUsers);
      setLoading(false);
    });

    // Also run an initial authoritative fetch when online
    if (getOnlineMode()) {
      fetchAllUsers()
        .then((all) => {
          if (all && all.length > 0) setUsers(all);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    const handleModeChange = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (typeof detail?.online === 'boolean') {
        setIsOnlineMode(detail.online);
      } else {
        setIsOnlineMode(getOnlineMode());
      }
      setHasPendingSync(getHasPendingSync());
    };
    const handleModified = () => setHasPendingSync(true);
    const handleSynced = () => {
      setHasPendingSync(false);
      setLastSyncTime(getLastSyncTime());
    };

    window.addEventListener('pakkus-online-mode-changed', handleModeChange);
    window.addEventListener('pakkus-local-data-modified', handleModified);
    window.addEventListener('pakkus-sync-completed', handleSynced);

    return () => {
      unsubscribe();
      window.removeEventListener('pakkus-online-mode-changed', handleModeChange);
      window.removeEventListener('pakkus-local-data-modified', handleModified);
      window.removeEventListener('pakkus-sync-completed', handleSynced);
    };
  }, []);

  const handleToggleOnlineMode = async () => {
    if (isTogglingMode) return;
    const nextOnline = !isOnlineMode;
    setIsTogglingMode(true);
    try {
      const result = await toggleOnlineMode(nextOnline);
      setIsOnlineMode(result.online);
      if (result.online) {
        setHasPendingSync(!result.synced);
        setLastSyncTime(result.lastSyncTime || getLastSyncTime());
        await loadUsers();
        if (onUserAdded) onUserAdded();
        if (result.synced) {
          showToast(
            `Mode ONLINE aktif! Terhubung realtime ke Firebase & ${result.usersCount} akun, ${result.schoolsCount} sekolah, ${result.supervisionsCount} supervisi otomatis tersinkron.`,
            5500
          );
        } else {
          showToast(
            'Mode ONLINE aktif. Terhubung ke database, namun sinkronisasi penuh akan dicoba kembali saat koneksi stabil.',
            5000
          );
        }
      } else {
        showToast(
          'Mode OFFLINE aktif. Perubahan data akan tersimpan di Local Storage dan otomatis tersinkron ke Firebase saat dipindahkan ke Online.',
          5000
        );
      }
    } catch (err: any) {
      console.warn('Toggle online/offline notice:', err);
      showToast('Gagal mengubah status koneksi. Silakan coba lagi.', 4000);
    } finally {
      setIsTogglingMode(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newUsername.trim()) {
      setFormError('Username wajib diisi.');
      return;
    }
    if (!newPassword.trim()) {
      setFormError('Kata sandi wajib diisi.');
      return;
    }
    if (!newDisplayName.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }
    if ((newRole === 'kepsek' || newRole === 'guru') && !newSchoolId) {
      setFormError('Harap pilih sekolah tempat bertugas.');
      return;
    }
    if (newRole === 'guru' && !newSubject.trim()) {
      setFormError('Mata pelajaran wajib diisi untuk peran Guru.');
      return;
    }

    setSavingUser(true);
    try {
      const selectedSchool = schools.find(s => s.id === newSchoolId);
      const cleanUsername = newUsername.trim().toLowerCase().replace(/\s+/g, '_');
      const uid = `user-${cleanUsername}-${Date.now()}`;

      const newUser: UserProfile = {
        uid,
        username: cleanUsername,
        password: newPassword.trim(),
        email: `${cleanUsername}@siklus-sambung.sch.id`,
        displayName: newDisplayName.trim(),
        role: newRole,
        schoolId: (newRole === 'admin' || newRole === 'pengawas') ? undefined : newSchoolId,
        schoolName: (newRole === 'admin' || newRole === 'pengawas') ? undefined : selectedSchool?.name,
        subject: newRole === 'guru' ? newSubject.trim() : undefined,
        nip: newNip.trim() || undefined,
        phone: newPhone.trim() || undefined,
        approvalStatus: 'approved',
        createdAt: new Date().toISOString()
      };

      await addUserAccount(newUser);

      // If user is a teacher, automatically bootstrap an active supervision portfolio
      if (newRole === 'guru') {
        const defaultSambung = createEmptySambungData(
          newUser.displayName,
          newUser.schoolName || 'SMAN 4 Bogor',
          newUser.subject || 'Fisika'
        );

        const newSup: Supervision = {
          id: `sup-${newUser.uid}`,
          schoolId: newUser.schoolId || 'sch-sman4',
          schoolName: newUser.schoolName || 'SMAN 4 Bogor',
          teacherId: newUser.uid,
          teacherName: newUser.displayName,
          teacherNip: newUser.nip || '',
          subject: newUser.subject || 'Mata Pelajaran',
          classGrade: 'Fase F / SMA',
          semester: 'Ganjil',
          schoolYear: '2025/2026',
          lessonTitle: `Pembelajaran Mendalam (Deep Learning) ${newUser.subject}`,
          status: 'draft',
          supervisorId: currentUser.uid,
          supervisorName: currentUser.displayName,
          supervisorRole: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isNewSupervision: true,
          sambung: defaultSambung,
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
              predicate: 'Belum Dinilai',
            },
            feedback: {
              kelebihan: '',
              perbaikan: '',
              rekomendasi: '',
            },
          },
          praObservasi: {
            interviewDurationMinutes: 15,
            q1_kd_indikator: '',
            q2_metode: '',
            q3_alat_bahan: '',
            q4_tahapan: '',
            q5_persiapan: '',
            q6_materi_sulit: '',
            q7_target_kompetensi: '',
            q8_perhatian_khusus: '',
            supervisorNotes: '',
          },
          observasiKelas: {
            items: {},
            totalYa: 0,
            totalAspek: 24,
            score: 0,
            predicate: 'Belum Dinilai',
            feedbackNotes: '',
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
            recommendations: '',
          },
          evaluasiTahunan: {
            hasilBelajar: { evidence: '', note: '', score: 0 },
            administrasi: { evidence: '', note: '', score: 0 },
            pengembanganDiri: { evidence: '', note: '', score: 0 },
            kedisiplinan: { evidence: '', note: '', score: 0 },
            rekomendasi: { notes: '', tindakLanjut: '', score: 0 },
            finalAverageScore: 0,
            finalGrade: 'Belum Dinilai',
            summaryNotes: '',
          },
        };
        await saveSupervision(newSup, isOnlineMode);
      }

      await loadUsers();
      setIsAddModalOpen(false);
      showToast(
        isOnlineMode
          ? `Akun ${newUser.displayName} (${cleanUsername}) berhasil didaftarkan dan tersimpan realtime ke Firebase!`
          : `Akun ${newUser.displayName} (${cleanUsername}) disimpan di Local Storage (Mode Offline). Akan otomatis tersinkron saat beralih ke Online.`
      );

      // Reset form
      setNewUsername('');
      setNewPassword('pakkus');
      setNewDisplayName('');
      setNewRole('guru');
      setNewSchoolId('');
      setNewSubject('');
      setNewNip('');
      setNewPhone('');

      if (onUserAdded) onUserAdded();
    } catch (err: any) {
      console.error(err);
      setFormError('Gagal menyimpan akun: ' + (err.message || ''));
    } finally {
      setSavingUser(false);
    }
  };

  const handleOpenEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setEditUsername(u.username || u.email.split('@')[0] || '');
    setEditPassword(u.password || 'pakkus');
    setEditDisplayName(u.displayName || '');
    setEditRole(u.role || 'guru');
    setEditSchoolId(u.schoolId || '');
    setEditSubject(u.subject || '');
    setEditNip(u.nip || '');
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditApprovalStatus(u.approvalStatus || 'approved');
    setShowEditPassword(false);
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError('');

    if (!editUsername.trim()) {
      setEditFormError('Username wajib diisi.');
      return;
    }
    if (!editPassword.trim()) {
      setEditFormError('Kata sandi wajib diisi.');
      return;
    }
    if (!editDisplayName.trim()) {
      setEditFormError('Nama lengkap wajib diisi.');
      return;
    }
    if ((editRole === 'kepsek' || editRole === 'guru') && !editSchoolId) {
      setEditFormError('Harap pilih sekolah tempat bertugas.');
      return;
    }
    if (editRole === 'guru' && !editSubject.trim()) {
      setEditFormError('Mata pelajaran wajib diisi untuk peran Guru.');
      return;
    }

    setSavingEditUser(true);
    try {
      const selectedSchool = schools.find(s => s.id === editSchoolId);
      const cleanUsername = editUsername.trim().toLowerCase().replace(/\s+/g, '_');

      const updatedUser: UserProfile = {
        ...editingUser,
        username: cleanUsername,
        password: editPassword.trim(),
        displayName: editDisplayName.trim(),
        role: editRole,
        schoolId: (editRole === 'admin' || (editRole as string) === 'pengawas') ? undefined : editSchoolId,
        schoolName: (editRole === 'admin' || (editRole as string) === 'pengawas') ? undefined : selectedSchool?.name,
        subject: editRole === 'guru' ? editSubject.trim() : undefined,
        nip: editNip.trim() || undefined,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || `${cleanUsername}@siklus-sambung.sch.id`,
        approvalStatus: editApprovalStatus,
        updatedAt: new Date().toISOString()
      };

      await updateUserAccount(updatedUser);

      // Update in state
      setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));

      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
      if (onUserAdded) {
        onUserAdded();
      }

      setIsEditModalOpen(false);
      setEditingUser(null);
      showToast(
        isOnlineMode
          ? `Akun ${updatedUser.displayName} (@${cleanUsername}) berhasil diperbarui dan tersimpan realtime di Firebase!`
          : `Akun ${updatedUser.displayName} (@${cleanUsername}) diperbarui di Local Storage (Mode Offline).`
      );
    } catch (err: any) {
      console.warn('Edit user error:', err);
      setEditFormError('Gagal memperbarui akun: ' + (err.message || ''));
    } finally {
      setSavingEditUser(false);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (user.username === 'pengawas' || user.uid === currentUser.uid) {
      showToast('Akun pengawas utama tidak dapat dihapus.', 3500);
      return;
    }
    if (!confirm(`Hapus akun ${user.displayName} (@${user.username})? Tindakan ini akan menghapus akun dan seluruh data supervisinya dari sistem.`)) {
      return;
    }
    try {
      await deleteUserAccount(user.uid);
      await loadUsers();
      if (onUserDeleted) {
        await onUserDeleted(user.uid);
      }
      showToast(
        isOnlineMode
          ? `Akun ${user.displayName} dan data supervisinya berhasil dihapus realtime dari Firebase.`
          : `Akun ${user.displayName} dihapus di Local Storage (akan disinkronkan saat pindah ke Online).`,
        3500
      );
    } catch (err) {
      console.warn('Delete user error:', err);
      showToast('Gagal menghapus akun.', 3500);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.schoolName && u.schoolName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.subject && u.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole =
      roleFilter === 'all' ||
      u.role === roleFilter ||
      (roleFilter === 'admin' && (u.role === 'admin' || (u.role as string) === 'pengawas'));

    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2 backdrop-blur-xs border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Otoritas Pengawas Pembina / Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen Pengguna &amp; Akun Real
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
              Pengawas dapat menambahkan akun baru untuk Pengawas, Kepala Sekolah, dan Guru Mata Pelajaran. Saat mode Online aktif, seluruh perubahan tersimpan otomatis secara realtime ke Firebase Database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tombol Toggle Online / Offline */}
            <button
              type="button"
              role="switch"
              aria-checked={isOnlineMode}
              disabled={isTogglingMode}
              onClick={handleToggleOnlineMode}
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-md ${
                isOnlineMode
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-400/50 shadow-emerald-500/10'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/50 shadow-amber-500/10'
              } ${isTogglingMode ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
              title={
                isOnlineMode
                  ? 'Mode Online aktif (Realtime Firebase). Klik untuk beralih ke mode Offline (Local Storage).'
                  : 'Mode Offline aktif (Local Storage). Klik untuk beralih ke Online & sinkronisasi otomatis ke Firebase.'
              }
            >
              {isTogglingMode ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300 shrink-0" />
              ) : isOnlineMode ? (
                <Wifi className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
              )}

              <div className="text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="tracking-wide">
                    {isTogglingMode ? 'Menyinkronkan...' : isOnlineMode ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <span className="block text-[10px] font-medium opacity-85">
                  {isOnlineMode ? 'Realtime Firebase' : 'Local Storage'}
                </span>
              </div>

              {/* Visual Switch Pill */}
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors border ${
                  isOnlineMode
                    ? 'bg-emerald-400 border-emerald-300'
                    : 'bg-slate-700 border-slate-500'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                    isOnlineMode ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={loadUsers}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
              title={isOnlineMode ? 'Perbarui data realtime dari Firebase' : 'Muat ulang data dari Local Storage'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-400/20 transition-all hover:scale-102"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Koneksi Database (Online Realtime vs Offline Local Storage) */}
      <div
        className={`rounded-2xl px-4 py-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isOnlineMode
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isOnlineMode ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isOnlineMode ? <Cloud className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
          </div>
          <div className="text-xs">
            <div className="font-bold flex flex-wrap items-center gap-2">
              <span>
                {isOnlineMode
                  ? 'Mode ONLINE Aktif — Terhubung Realtime ke Firebase Database'
                  : 'Mode OFFLINE Aktif — Data Tersimpan di Local Storage'}
              </span>
              {!isOnlineMode && hasPendingSync && (
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                  Ada perubahan lokal siap sinkron
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isOnlineMode
                ? `Setiap penambahan, perubahan, maupun penghapusan akun & data supervisi langsung tersimpan otomatis secara realtime ke Firebase.${
                    lastSyncTime
                      ? ` Sinkronisasi terakhir: ${new Date(lastSyncTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`
                      : ''
                  }`
                : 'Semua data yang Anda tambah atau ubah tersimpan aman di Local Storage perangkat. Pindahkan tombol ke ONLINE untuk menghubungkan dan menyinkronkan otomatis ke Firebase Database.'}
            </p>
          </div>
        </div>

        {!isOnlineMode && (
          <button
            type="button"
            disabled={isTogglingMode}
            onClick={handleToggleOnlineMode}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 transition-colors disabled:opacity-60"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>{isTogglingMode ? 'Menyinkronkan...' : 'Pindahkan ke Online & Sinkronkan'}</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, username, sekolah, mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'Semua Akun' },
            { key: 'admin', label: 'Pengawas / Admin' },
            { key: 'kepsek', label: 'Kepala Sekolah' },
            { key: 'guru', label: 'Guru Mapel' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Username &amp; Kredensial</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Satuan Pendidikan &amp; Tugas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin' || (u.role as string) === 'pengawas';
                  const isKepsek = u.role === 'kepsek';
                  const isGuru = u.role === 'guru';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{u.displayName}</div>
                        {u.nip && <div className="text-[11px] text-slate-500">NIP: {u.nip}</div>}
                        {u.phone && <div className="text-[11px] text-slate-400">WA: {u.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                          @{u.username || u.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Sandi: <span className="font-mono text-slate-600">{u.password || 'pakkus'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>Pengawas Pembina</span>
                          </span>
                        )}
                        {isKepsek && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Kepala Sekolah</span>
                          </span>
                        )}
                        {isGuru && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>Guru Mapel</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {u.schoolName || (isAdmin ? 'Semua Sekolah Binaan' : '-')}
                        </div>
                        {u.subject && (
                          <div className="text-[11px] text-indigo-600 font-medium">
                            Mata Pelajaran: {u.subject}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs shadow-2xs transition-all hover:scale-102"
                            title={`Edit Akun & Kredensial ${u.displayName}`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit</span>
                          </button>
                          {u.username !== 'pengawas' && u.uid !== currentUser.uid ? (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span 
                              className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60"
                              title="Akun Pengawas Utama Sistem"
                            >
                              Utama
                            </span>
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Tambah Akun Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-indigo-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran Akun (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('guru')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newRole === 'guru'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Guru Mapel
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('kepsek')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newRole === 'kepsek'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Kepala Sekolah
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newRole === 'admin'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pengawas / Admin
                  </button>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: guru_sondang"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan saat masuk aplikasi</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kata Sandi (Password)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Default: pakkus</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Contoh: Sondang Asih Januarti, S.Pd."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              {/* School selection */}
              {newRole !== 'admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Satuan Pendidikan (Sekolah Binaan)
                  </label>
                  <select
                    required
                    value={newSchoolId}
                    onChange={(e) => setNewSchoolId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                  >
                    <option value="">-- Pilih Satuan Pendidikan --</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject for Teacher */}
              {newRole === 'guru' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Contoh: Fisika, Matematika, Biologi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              )}

              {/* NIP & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    placeholder="18 digit NIP (opsional)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingUser ? 'Menyimpan...' : 'Simpan & Aktifkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                  <Pencil className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Akun Pengguna</h3>
                  <p className="text-[11px] text-amber-100/90">
                    Perbarui identitas, kredensial login, peran, dan sekolah penugasan
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {editFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              {/* User summary badge */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Akun ID:</div>
                  <div className="font-mono text-xs text-slate-700 font-semibold truncate max-w-[220px]">
                    {editingUser.uid}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Status Akun:</span>
                  <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    editApprovalStatus === 'approved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : editApprovalStatus === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {editApprovalStatus === 'approved' ? 'Aktif / Disetujui' : editApprovalStatus === 'pending' ? 'Menunggu' : 'Ditangguhkan'}
                  </span>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Peran Akun (Role)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('guru')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      editRole === 'guru'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Guru Mapel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('kepsek')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      editRole === 'kepsek'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Kepala Sekolah
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      editRole === 'admin' || (editRole as string) === 'pengawas'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pengawas / Admin
                  </button>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="username"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan saat masuk aplikasi</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditPassword('pakkus')}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Reset 'pakkus'
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Kata sandi akun"
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dapat diubah kapan saja</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Contoh: Sondang Asih Januarti, S.Pd."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              {/* School selection */}
              {editRole !== 'admin' && (editRole as string) !== 'pengawas' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Satuan Pendidikan (Sekolah Binaan)
                  </label>
                  <select
                    required
                    value={editSchoolId}
                    onChange={(e) => setEditSchoolId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                  >
                    <option value="">-- Pilih Satuan Pendidikan --</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-xl text-purple-900 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Akses Pengawas / Admin</span>
                    <span className="text-[11px] text-purple-700">Akun pengawas memiliki kewenangan pembinaan ke seluruh sekolah binaan secara otomatis.</span>
                  </div>
                </div>
              )}

              {/* Subject for Teacher */}
              {editRole === 'guru' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Contoh: Fisika, Matematika, Biologi"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              )}

              {/* NIP & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP (Nomor Induk Pegawai)
                  </label>
                  <input
                    type="text"
                    value={editNip}
                    onChange={(e) => setEditNip(e.target.value)}
                    placeholder="18 digit NIP (opsional)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
              </div>

              {/* Email & Approval Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Pengguna
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@sekolah.sch.id"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={editApprovalStatus}
                    onChange={(e) => setEditApprovalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                  >
                    <option value="approved">Aktif / Disetujui (Approved)</option>
                    <option value="pending">Menunggu Verifikasi (Pending)</option>
                    <option value="rejected">Dinonaktifkan (Rejected)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Tersimpan langsung ke Firebase &amp; Basis Data
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingEditUser}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingEditUser ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan Akun</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
