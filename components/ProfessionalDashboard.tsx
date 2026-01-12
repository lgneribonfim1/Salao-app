
import React, { useState, useMemo } from 'react';
import { User, Service, Appointment } from '../types';
import ReceptionistDashboard from './ReceptionistDashboard';

interface ProfessionalDashboardProps {
  user: User;
  services: Service[];
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ 
  user, 
  services, 
  appointments,
  onAddAppointment,
  onUpdateStatus
}) => {
  const [view, setView] = useState<'overview' | 'agenda'>('overview');
  const [reportPeriod, setReportPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');

  // Filter only my appointments and by selected period
  const filteredApps = useMemo(() => {
    const now = new Date();
    return appointments.filter(app => {
      if (app.professionalId !== user.id) return false;
      
      const appDate = new Date(app.date);
      if (reportPeriod === 'day') return appDate.toDateString() === now.toDateString();
      if (reportPeriod === 'month') return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
      if (reportPeriod === 'year') return appDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [appointments, user.id, reportPeriod]);

  const stats = useMemo(() => filteredApps.reduce((acc, app) => {
    const service = services.find(s => s.id === app.serviceId);
    if (!service || app.status !== 'COMPLETED') return acc;
    
    const val = service.price;
    const comm = val * (user.commissionRate || 0);
    
    acc.totalValue += val;
    acc.totalCommission += comm;
    acc.count++;
    return acc;
  }, { totalValue: 0, totalCommission: 0, count: 0 }), [filteredApps, services, user.commissionRate]);

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 md:space-x-4 border-b">
        <button 
          onClick={() => setView('overview')} 
          className={`pb-2 px-4 transition-all ${view === 'overview' ? 'border-b-2 border-indigo-600 font-bold text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Meu Relatório Financeiro
        </button>
        <button 
          onClick={() => setView('agenda')} 
          className={`pb-2 px-4 transition-all ${view === 'agenda' ? 'border-b-2 border-indigo-600 font-bold text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Minha Agenda
        </button>
      </div>

      {view === 'overview' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Period Selector */}
          <div className="bg-white p-4 rounded-2xl border flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-gray-700 hidden sm:inline">Período:</span>
            <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
              {[
                {id: 'day', label: 'Hoje'},
                {id: 'month', label: 'Mês'},
                {id: 'year', label: 'Ano'},
                {id: 'all', label: 'Tudo'}
              ].map(p => (
                <button 
                  key={p.id}
                  onClick={() => setReportPeriod(p.id as any)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${reportPeriod === p.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="opacity-80 text-xs font-black uppercase tracking-widest">Minha Comissão</p>
                <p className="text-4xl font-black mt-1">R$ {stats.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="mt-4 flex items-center space-x-2">
                   <span className="bg-indigo-500 px-2 py-1 rounded-lg text-[10px] font-bold">TAXA: {(user.commissionRate || 0) * 100}%</span>
                   <span className="text-xs opacity-80">{stats.count} serviços concluídos</span>
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Produção Total Bruta</p>
              <p className="text-3xl font-black text-gray-800 mt-1">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="mt-2 text-xs text-gray-400 font-medium">Valor total dos serviços realizados por você.</p>
            </div>
          </div>

          {/* Detailed Appointments Table for Transparency */}
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <div className="p-6 border-b bg-gray-50/30">
              <h3 className="font-black text-gray-800 uppercase text-sm tracking-tighter">Histórico de Atendimentos Concluídos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Serviço</th>
                    <th className="px-6 py-4 text-right">Valor Bruto</th>
                    <th className="px-6 py-4 text-right">Minha Parte</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredApps.filter(a => a.status === 'COMPLETED').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Nenhum serviço concluído neste período.</td>
                    </tr>
                  ) : (
                    filteredApps.filter(a => a.status === 'COMPLETED').map(app => {
                      const s = services.find(serv => serv.id === app.serviceId);
                      const val = s?.price || 0;
                      const comm = val * (user.commissionRate || 0);
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-xs">{new Date(app.date).toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{app.clientName}</td>
                          <td className="px-6 py-4 text-gray-500">{s?.name}</td>
                          <td className="px-6 py-4 text-right font-medium">R$ {val.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-black text-indigo-600">R$ {comm.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-300">
           <ReceptionistDashboard 
            users={[user]} 
            services={services} 
            appointments={appointments.filter(a => a.professionalId === user.id)} 
            onAddAppointment={onAddAppointment}
            onUpdateStatus={onUpdateStatus}
          />
        </div>
      )}
    </div>
  );
};

export default ProfessionalDashboard;
