import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Lock, 
  Trash2,
  Download,
  CheckCircle2,
  Mail,
  User as UserIcon,
  HardDrive,
  Users as UsersIcon,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import KveCard from '../components/KveCard';
import Modal from '../components/Modal';
import { useGarosStore } from '../store/useGarosStore';

const UsersView: React.FC = () => {
  const usersList = useGarosStore((s) => s.usersList);
  const addUser = useGarosStore((s) => s.addUser);
  const updateUserQuota = useGarosStore((s) => s.updateUserQuota);
  const toggleUserStatus = useGarosStore((s) => s.toggleUserStatus);
  const softDeleteUser = useGarosStore((s) => s.softDeleteUser);
  const restoreUser = useGarosStore((s) => s.restoreUser);
  const updateUserRole = useGarosStore((s) => s.updateUserRole);
  const userRole = useGarosStore((s) => s.userRole);
  const addToast = useGarosStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator' | 'user'>('user');
  const [newQuota, setNewQuota] = useState('250');

  // Quota Edit State
  const [editQuotaVal, setEditQuotaVal] = useState('250');

  const handleCreateUser = () => {
    if (!newUsername.trim() || !newEmail.trim()) {
      addToast('Campos Obrigatórios', 'Por favor preencha nome e e-mail do usuário.', 'warning');
      return;
    }
    addUser({
      username: newUsername.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: 'active',
      quotaUsed: 0,
      quotaLimit: Number(newQuota) || 250,
      lastActivity: 'Agora mesmo',
    });
    setIsNewUserModalOpen(false);
    setNewUsername('');
    setNewEmail('');
  };

  const editingUser = usersList.find((u) => u.id === editingUserId);

  const handleSaveQuota = () => {
    if (!editingUser) return;
    const num = Number(editQuotaVal);
    if (isNaN(num) || num < 1 || num > 5000) {
      addToast('Valor de Cota Inválido', 'Digite um valor numérico entre 1 GB e 5000 GB.', 'warning');
      return;
    }
    updateUserQuota(editingUser.id, num);
    setEditingUserId(null);
  };

  const handleExportUsers = () => {
    const jsonStr = JSON.stringify(usersList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garos-users-export-${Date.now()}.json`;
    a.click();
    addToast('Exportação Concluída', 'Relatório em JSON baixado com sucesso.', 'info');
  };

  const activeUsers = usersList.filter((u) => !u.softDeleted);
  const softDeletedUsers = usersList.filter((u) => u.softDeleted);

  const totalQuotaAllocated = activeUsers.reduce((acc, u) => acc + u.quotaLimit, 0);
  const totalQuotaUsed = activeUsers.reduce((acc, u) => acc + u.quotaUsed, 0);
  const criticalUsersCount = activeUsers.filter((u) => u.quotaUsed / u.quotaLimit >= 0.8).length;

  const filteredUsers = activeUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KveCard className="glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total de Usuários Ativos</p>
              <p className="text-2xl font-black text-white">{activeUsers.length}</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <UsersIcon size={22} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {activeUsers.filter((u) => u.status === 'active').length} Liberados / {activeUsers.filter((u) => u.status === 'blocked').length} Bloqueados
          </p>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Armazenamento Alocado</p>
              <p className="text-2xl font-black text-white">{totalQuotaUsed} <span className="text-sm font-normal text-slate-400">/ {totalQuotaAllocated} GB</span></p>
            </div>
            <div className="p-3 bg-kve-accent/10 rounded-xl text-kve-accent">
              <HardDrive size={22} />
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-sky-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.round((totalQuotaUsed / Math.max(1, totalQuotaAllocated)) * 100))}%` }} 
            />
          </div>
        </KveCard>

        <KveCard className="glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alertas de Cota (&gt;80%)</p>
              <p className={`text-2xl font-black ${criticalUsersCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {criticalUsersCount} {criticalUsersCount === 1 ? 'Usuário' : 'Usuários'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${criticalUsersCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {criticalUsersCount > 0 ? 'Atingiram limite de alerta da cota alocada' : 'Todas as cotas dentro do limite seguro'}
          </p>
        </KveCard>
      </div>

      {/* Action Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou papel..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900/50 border border-slate-800 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none w-full sm:w-72 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportUsers}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white flex items-center gap-2 text-xs font-mono font-bold"
          >
            <Download size={16} /> Exportar JSON
          </button>
          <button 
            onClick={() => setIsNewUserModalOpen(true)}
            disabled={userRole === 'user'}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-extrabold transition-all flex items-center gap-2 shadow-lg ${
              userRole === 'user'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-900/40'
            }`}
          >
            <UserPlus size={16} /> NOVO USUÁRIO
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Usuário</th>
                <th className="p-4">Papel / Permissões</th>
                <th className="p-4">Status de Acesso</th>
                <th className="p-4">Gestão de Cota (GB)</th>
                <th className="p-4">Última Atividade</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-xs uppercase">
                    Nenhum usuário ativo encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const quotaPercent = Math.round((user.quotaUsed / Math.max(1, user.quotaLimit)) * 100);
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{user.username}</p>
                            <p className="text-[10px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          disabled={userRole === 'user'}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-200 focus:outline-none uppercase"
                        >
                          <option value="user">User</option>
                          <option value="operator">Operator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={userRole === 'user'}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Liberado</span>
                            </>
                          ) : (
                            <>
                              <Lock size={12} />
                              <span>Bloqueado</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="w-48 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-400">{user.quotaUsed} GB / {user.quotaLimit} GB</span>
                            <span className={quotaPercent >= 80 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{quotaPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                quotaPercent >= 80 ? 'bg-amber-400' : 'bg-sky-400'
                              }`}
                              style={{ width: `${Math.min(100, quotaPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-400">{user.lastActivity}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUserId(user.id);
                              setEditQuotaVal(user.quotaLimit.toString());
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-mono font-bold flex items-center gap-1"
                          >
                            <Sliders size={13} />
                            <span>Cota</span>
                          </button>
                          <button
                            onClick={() => softDeleteUser(user.id)}
                            disabled={userRole === 'user'}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                            title="Remover (Soft Delete 30 dias)"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Soft-Deleted Users Section with 30-Day Retention Badge */}
      {softDeletedUsers.length > 0 && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <Clock size={16} />
            <span>LIXEIRA DE USUÁRIOS (RETENÇÃO 30 DIAS):</span>
          </div>
          <div className="divide-y divide-slate-800/80">
            {softDeletedUsers.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white">{u.username}</span>
                  <span className="text-slate-500 ml-2">({u.email})</span>
                  <span className="ml-3 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px]">
                    Removido em: {u.deletedAt}
                  </span>
                </div>
                <button
                  onClick={() => restoreUser(u.id)}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restaurar</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New User Modal */}
      <Modal 
        isOpen={isNewUserModalOpen} 
        onClose={() => setIsNewUserModalOpen(false)}
        title="Cadastrar Novo Usuário / Operador"
        type="info"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsNewUserModalOpen(false)} className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white">CANCELAR</button>
            <button onClick={handleCreateUser} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-mono font-extrabold text-xs">CRIAR USUÁRIO</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500" 
                placeholder="ex: operator-02" 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500" 
                placeholder="ex: operator@garos.internal" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Role Initial</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              >
                <option value="user">User</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cota (GB)</label>
              <input 
                type="number" 
                value={newQuota}
                onChange={(e) => setNewQuota(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none" 
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Quota Edit Modal with Presets */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUserId(null)}
          title={`Ajuste de Cota de Disco: ${editingUser.username}`}
          type="info"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingUserId(null)} className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white">CANCELAR</button>
              <button onClick={handleSaveQuota} className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-mono font-extrabold text-xs">SALVAR COTA</button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-1.5">
                Cota Limite de Armazenamento (GB)
              </label>
              <input
                type="number"
                value={editQuotaVal}
                onChange={(e) => setEditQuotaVal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-widest">Presets Rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {['100', '250', '500', '1000', '2000'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setEditQuotaVal(val)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                      editQuotaVal === val
                        ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {val} GB
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Uso Atual em Disco:</span>
              <span className="font-bold text-white">{editingUser.quotaUsed} GB</span>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default UsersView;
