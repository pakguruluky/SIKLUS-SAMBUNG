import React, { useState } from 'react';
import { School, UserProfile } from '../types';
import { Building2, Plus, Edit2, Check, X, Search, ShieldCheck, MapPin, School as SchoolIcon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { addSchool, updateSchool, resetToDefaultSchools } from '../services/firebase';

interface SchoolManagementProps {
  schools: School[];
  currentUser: UserProfile;
  onRefreshSchools: () => Promise<void>;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  schools,
  currentUser,
  onRefreshSchools,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingDefaults, setSyncingDefaults] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [npsn, setNpsn] = useState('');
  const [address, setAddress] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [accreditation, setAccreditation] = useState<'A' | 'B' | 'C' | 'Belum Terakreditasi'>('A');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSyncDefaults = async () => {
    try {
      setSyncingDefaults(true);
      setSyncSuccessMsg('');
      await resetToDefaultSchools();
      await onRefreshSchools();
      setSyncSuccessMsg('11 Satuan Pendidikan Binaan Resmi berhasil disinkronkan ke basis data!');
      setTimeout(() => setSyncSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal menyinkronkan data default: ' + (err.message || ''));
    } finally {
      setSyncingDefaults(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSchool(null);
    setName('');
    setNpsn('');
    setAddress('');
    setPrincipalName('');
    setAccreditation('A');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: School) => {
    setEditingSchool(sch);
    setName(sch.name);
    setNpsn(sch.npsn);
    setAddress(sch.address);
    setPrincipalName(sch.principalName);
    setAccreditation(sch.accreditation);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !npsn || !principalName) {
      setErrorMsg('Nama sekolah, NPSN, dan Nama Kepala Sekolah wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      if (editingSchool) {
        await updateSchool(editingSchool.id, {
          name,
          npsn,
          address,
          principalName,
          accreditation,
        });
      } else {
        await addSchool({
          name,
          npsn,
          address,
          principalName,
          accreditation,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.uid,
        });
      }

      await onRefreshSchools();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyimpan data sekolah.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.npsn.includes(searchTerm) ||
    s.principalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Kewenangan Pengawas / Admin</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Daftar Satuan Pendidikan Target Binaan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data sekolah SMA untuk memungkinkan Kepala Sekolah dan Guru melakukan registrasi supervisi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleSyncDefaults}
            disabled={syncingDefaults}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm transition-all disabled:opacity-50"
            title="Sinkronkan seluruh 7 SMA Binaan Resmi sesuai daftar tabel"
          >
            <RefreshCw className={`w-4 h-4 ${syncingDefaults ? 'animate-spin' : ''}`} />
            <span>{syncingDefaults ? 'Menyinkronkan...' : 'Sinkronkan 7 SMA Resmi'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sekolah Target</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama SMA, NPSN, atau Kepala Sekolah..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
          />
        </div>
      </div>

      {/* Table of Schools */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nama SMA</th>
                <th className="py-3.5 px-4">NPSN</th>
                <th className="py-3.5 px-4">Kepala Sekolah</th>
                <th className="py-3.5 px-4">Alamat</th>
                <th className="py-3.5 px-4 text-center">Akreditasi</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map((sch) => (
                <tr key={sch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold">
                        <SchoolIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900">{sch.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{sch.npsn}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{sch.principalName}</td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={sch.address}>
                    {sch.address || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Akreditasi {sch.accreditation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenEdit(sch)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                      title="Edit Data Sekolah"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada sekolah target yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-indigo-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {editingSchool ? 'Edit Data Sekolah Target' : 'Tambah Satuan Pendidikan Target'}
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Lengkapi identitas resmi SMA binaan pengawas
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Satuan Pendidikan SMA *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SMA Negeri 4 Bogor"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NPSN (8 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value)}
                    placeholder="Contoh: 20220304"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peringkat Akreditasi
                  </label>
                  <select
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600 bg-white"
                  >
                    <option value="A">Terakreditasi A (Unggul)</option>
                    <option value="B">Terakreditasi B (Baik)</option>
                    <option value="C">Terakreditasi C (Cukup)</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah &amp; Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Yeni Suryani, M.Pd."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Dreded No. 36, Empang, Kota Bogor"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
