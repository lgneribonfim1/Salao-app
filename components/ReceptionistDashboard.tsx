
import React, { useState, useEffect } from 'react';
import { User, Service, Appointment } from '../types';

interface ReceptionistDashboardProps {
  users: User[];
  services: Service[];
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ users, services, appointments, onAddAppointment, onUpdateStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    professionalId: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00'
  });

  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // Update available services when professional changes
  useEffect(() => {
    if (formData.professionalId) {
      const prof = users.find(u => u.id === formData.professionalId);
      if (prof && prof.serviceIds) {
        const filtered = services.filter(s => prof.serviceIds?.includes(s.id));
        setAvailableServices(filtered);
      } else {
        setAvailableServices([]);
      }
    } else {
      setAvailableServices([]);
    }
  }, [formData.professionalId, users, services]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: 'SCHEDULED'
    };
    onAddAppointment(newApp);
    setShowModal(false);
  };

  const professionals = users.filter(u => u.role === 'PROFESSIONAL');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Agenda Geral</h2>
        <button 
          onClick={() => {
            setFormData({ ...formData, professionalId: '', serviceId: '' });
            setShowModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center"
        >
          <span className="mr-2">+</span> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.sort((a, b) => a.time.localeCompare(b.time)).map(app => {
          const prof = professionals.find(p => p.id === app.professionalId);
          const service = services.find(s => s.id === app.serviceId);
          
          return (
            <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-700 font-bold text-center min-w-[80px]">
                  <p className="text-xs uppercase">Hora</p>
                  <p className="text-lg">{app.time}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{app.clientName}</h4>
                  <p className="text-sm text-gray-500">{service?.name} • com {prof?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                  app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {app.status}
                </span>
                {app.status === 'SCHEDULED' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onUpdateStatus(app.id, 'COMPLETED')}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition"
                    >
                      Concluir
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(app.id, 'CANCELLED')}
                      className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Agendar Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    required
                    type="date" 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input 
                    required
                    type="time" 
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <select 
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.professionalId}
                  onChange={e => setFormData({...formData, professionalId: e.target.value, serviceId: ''})}
                >
                  <option value="">Selecione...</option>
                  {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serviço disponível para este profissional</label>
                <select 
                  required
                  disabled={!formData.professionalId}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  value={formData.serviceId}
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="">{formData.professionalId ? 'Selecione o serviço...' : 'Selecione um profissional primeiro'}</option>
                  {availableServices.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>)}
                </select>
                {formData.professionalId && availableServices.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">Este profissional não possui serviços vinculados.</p>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!formData.serviceId}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
