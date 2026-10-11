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
  Sparkles
} from 'lucide-react';
import { fetchAllUsers, addUserAccount, deleteUserAccount, saveSupervision } from '../services/firebase';
import { createDefaultSambungForTeacher } from '../data/sambungSeed';

interface UserManagementViewProps {
  currentUser: UserProfile;
  schools: School[];
  onUserAdded?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  schools,
  onUserAdded
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
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

  const loadUsers = async () => {
    setLoading(true);
    try {
      const all = await fetchAllUsers();
      setUsers(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
        const defaultSambung = createDefaultSambungForTeacher(
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
              predicate: 'Perlu Perbaikan',
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
            predicate: 'Kurang (D)',
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
            hasilBelajar: { evidence: '', note: '', score: 90 },
            administrasi: { evidence: '', note: '', score: 90 },
            pengembanganDiri: { evidence: '', note: '', score: 90 },
            kedisiplinan: { evidence: '', note: '', score: 90 },
            rekomendasi: { notes: '', tindakLanjut: '', score: 90 },
            finalAverageScore: 90,
            finalGrade: 'Amat Baik (A)',
            summaryNotes: '',
          },
        };
        await saveSupervision(newSup);
      }

      await loadUsers();
      setIsAddModalOpen(false);
      setToastMessage(`Akun ${newUser.displayName} (${cleanUsername}) berhasil didaftarkan dan disimpan ke Firebase!`);
      setTimeout(() => setToastMessage(null), 4000);

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

  const handleDelete = async (user: UserProfile) => {
    if (user.username === 'pengawas' || user.uid === currentUser.uid) {
      alert('Akun pengawas utama tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Hapus akun ${user.displayName} (@${user.username})? Tindakan ini akan menghapus akun dari basis data.`)) {
      return;
    }
    try {
      await deleteUserAccount(user.uid);
      await loadUsers();
      setToastMessage(`Akun ${user.displayName} berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus akun.');
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
              Pengawas dapat menambahkan akun baru untuk Pengawas, Kepala Sekolah, dan Guru Mata Pelajaran. Semua akun tersimpan langsung di Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
              title="Perbarui data dari Firebase"
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
                        {u.username !== 'pengawas' && u.uid !== currentUser.uid ? (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Akun Utama</span>
                        )}
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
    </div>
  );
};
