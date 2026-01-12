
import React, { useState, useMemo } from 'react';
import { User, Service, Appointment, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import ReceptionistDashboard from './ReceptionistDashboard';

interface AdminDashboardProps {
  users: User[];
  services: Service[];
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onUpdateUser: (user: User) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onUpdateService: (service: Service) => void;
  onAddService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onImportData?: (data: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  services, 
  appointments, 
  onAddAppointment, 
  onUpdateStatus,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onUpdateService,
  onAddService,
  onDeleteService,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'agenda' | 'staff' | 'services' | 'reports' | 'settings'>('finance');
  const [reportPeriod, setReportPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUserForm, setCurrentUserForm] = useState<Partial<User>>({});

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      if (reportPeriod === 'day') return appDate.toDateString() === now.toDateString();
      if (reportPeriod === 'month') return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      if (reportPeriod === 'year') return appDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [appointments, reportPeriod]);

  const stats = useMemo(() => filteredAppointments.reduce((acc, app) => {
    const service = services.find(s => s.id === app.serviceId);
    if (!service || app.status !== 'COMPLETED') return acc;
    
    const prof = users.find(u => u.id === app.professionalId);
    const commRate = prof?.commissionRate || 0;
    const comm = service.price * commRate;
    
    acc.totalRevenue += service.price;
    acc.totalCommissions += comm;
    acc.netProfit += (service.price - comm);
    acc.count++;
    return acc;
  }, { totalRevenue: 0, totalCommissions: 0, netProfit: 0, count: 0 }), [filteredAppointments, services, users]);

  const chartData = users.filter(u => u.role === UserRole.PROFESSIONAL).map(prof => {
    const profApps = filteredAppointments.filter(a => a.professionalId === prof.id && a.status === 'COMPLETED');
    const revenue = profApps.reduce((sum, a) => sum + (services.find(s => s.id === a.serviceId)?.price || 0), 0);
    const comm = revenue * (prof.commissionRate || 0);
    return { name: prof.name, Faturamento: revenue, Comissão: comm };
  });

  const exportBackup = () => {
    const data = {
      bg_users: users,
      bg_services: services,
      bg_appointments: appointments,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_beleza_gestao_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.bg_users && json.bg_services && json.bg_appointments) {
          if (onImportData) onImportData(json);
          alert('Dados importados com sucesso! O sistema irá reiniciar.');
          window.location.reload();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenUserModal = (user?: User) => {
    if (user) setCurrentUserForm({ ...user });
    else setCurrentUserForm({ id: Date.now().toString(), name: '', email: '', password: '', role: UserRole.PROFESSIONAL, commissionRate: 0.5, serviceIds: [] });
    setShowUserModal(true);
  };

  const toggleServiceInForm = (serviceId: string) => {
    const currentServices = currentUserForm.serviceIds || [];
    const newServices = currentServices.includes(serviceId) ? currentServices.filter(id => id !== serviceId) : [...currentServices, serviceId];
    setCurrentUserForm({ ...currentUserForm, serviceIds: newServices });
  };

  const saveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userToSave = currentUserForm as User;
    users.find(u => u.id === userToSave.id) ? onUpdateUser(userToSave) : onAddUser(userToSave);
    setShowUserModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 md:space-x-4 border-b overflow-x-auto no-scrollbar">
        {[
          { id: 'finance', label: 'Dashboard' },
          { id: 'reports', label: 'Relatórios' },
          { id: 'agenda', label: 'Agenda' },
          { id: 'staff', label: 'Equipe' },
          { id: 'services', label: 'Serviços' },
          { id: 'settings', label: 'Sistema' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 px-4 whitespace-nowrap transition-all ${activeTab === tab.id ? 'border-b-2 border-indigo-600 font-bold text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Faturamento Bruto</span>
              <p className="text-3xl font-black text-indigo-600 mt-2">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Comissões Devidas</span>
              <p className="text-3xl font-black text-orange-500 mt-2">R$ {stats.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lucro do Salão</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">R$ {stats.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
              <h3 className="font-bold text-gray-800 mb-6">Produção por Profissional</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="Faturamento" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Comissão" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-4">Gerenciamento de Dados (Fase de Testes)</h3>
            <p className="text-gray-500 mb-8 text-sm">
              Como o sistema está em fase de testes locais, os dados são salvos apenas neste navegador. 
              Para levar os dados para outro computador ou celular, use as opções abaixo:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-2">Exportar Backup</h4>
                <p className="text-xs text-indigo-700 mb-4">Gera um arquivo com todos os clientes, agendamentos e configurações atuais.</p>
                <button 
                  onClick={exportBackup}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                >
                  Baixar Arquivo JSON
                </button>
              </div>

              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-2">Importar Dados</h4>
                <p className="text-xs text-emerald-700 mb-4">Carrega dados de um arquivo de backup. <span className="font-bold text-red-600 underline">Atenção:</span> Isso apagará os dados atuais deste aparelho.</p>
                <label className="block">
                  <span className="sr-only">Escolher arquivo</span>
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={handleImport}
                    className="block w-full text-sm text-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start space-x-3">
              <div className="bg-orange-200 text-orange-700 p-2 rounded-lg font-bold">!</div>
              <div>
                <p className="text-xs text-orange-800 font-bold uppercase">Dica para Multi-Acesso:</p>
                <p className="text-xs text-orange-700">Para sincronização automática em tempo real entre celulares, o próximo passo é a integração com o banco de dados Supabase (Nuvem).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Relatórios de Desempenho</h2>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['day', 'month', 'year', 'all'].map(p => (
                <button key={p} onClick={() => setReportPeriod(p as any)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${reportPeriod === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{p}</button>
              ))}
            </div>
          </div>
          {/* Tabela de relatórios já existente no código anterior ficaria aqui */}
        </div>
      )}

      {activeTab === 'agenda' && (
        <ReceptionistDashboard users={users} services={services} appointments={appointments} onAddAppointment={onAddAppointment} onUpdateStatus={onUpdateStatus} />
      )}

      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Equipe</h2>
            <button onClick={() => handleOpenUserModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition">+ Adicionar</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{u.name}</h4>
                  <p className="text-xs text-gray-400 mb-4">{u.email} | {u.role}</p>
                </div>
                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                  <button onClick={() => handleOpenUserModal(u)} className="text-indigo-600 text-xs font-bold">Editar</button>
                  <button onClick={() => onDeleteUser(u.id)} className="text-red-500 text-xs font-bold">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-4">
           <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Serviços</h2>
            <button onClick={() => onAddService({ id: Date.now().toString(), name: 'Novo Serviço', price: 0 })} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition">+ Novo Serviço</button>
          </div>
          <div className="bg-white rounded-2xl border overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Serviço</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Preço</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold">{s.name}</td>
                      <td className="px-6 py-4">R$ {s.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDeleteService(s.id)} className="text-red-500 text-xs font-bold hover:underline">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-2xl font-black text-gray-900 mb-6">{currentUserForm.id ? 'Configurar Perfil' : 'Novo Colaborador'}</h3>
            <form onSubmit={saveUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Nome Completo</label>
                  <input required type="text" className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={currentUserForm.name || ''} onChange={e => setCurrentUserForm({...currentUserForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-1">Função</label>
                  <select className="w-full p-3 border border-gray-100 bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={currentUserForm.role} onChange={e => setCurrentUserForm({...currentUserForm, role: e.target.value as UserRole})}>
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.RECEPTIONIST}>Recepcionista</option>
                    <option value={UserRole.PROFESSIONAL}>Profissional</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 pt-6 border-t">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
