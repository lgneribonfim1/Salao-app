
import React, { useState, useEffect } from 'react';
import { User, UserRole, Service, Appointment } from './types';
import { MOCK_USERS, MOCK_SERVICES, INITIAL_APPOINTMENTS } from './constants';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import ProfessionalDashboard from './components/ProfessionalDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bg_users');
    if (saved) return JSON.parse(saved);
    return MOCK_USERS.map(u => ({ ...u, password: '123456', serviceIds: u.role === UserRole.PROFESSIONAL ? ['s1', 's2'] : [] }));
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('bg_services');
    return saved ? JSON.parse(saved) : MOCK_SERVICES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bg_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('bg_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bg_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('bg_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleImportData = (data: any) => {
    if (data.bg_users) setUsers(data.bg_users);
    if (data.bg_services) setServices(data.bg_services);
    if (data.bg_appointments) setAppointments(data.bg_appointments);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (user && user.password === passwordInput) {
      setCurrentUser(user);
      setError('');
    } else {
      setError('Email ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  const addAppointment = (newApp: Appointment) => {
    setAppointments(prev => [...prev, newApp]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const addService = (newService: Service) => {
    setServices(prev => [...prev, newService]);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">BelezaGestão</h1>
            <p className="text-gray-500 mt-2 font-medium">Sistema de Gestão Interna</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input 
                type="email" 
                required
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="seu@email.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Senha</label>
              <input 
                type="password" 
                required
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="******"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95"
            >
              Entrar no Sistema
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
            Acesso Restrito a Funcionários
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      {currentUser.role === UserRole.ADMIN && (
        <AdminDashboard 
          users={users} 
          services={services} 
          appointments={appointments} 
          onAddAppointment={addAppointment}
          onUpdateStatus={updateAppointmentStatus}
          onUpdateUser={updateUser}
          onAddUser={addUser}
          onDeleteUser={deleteUser}
          onUpdateService={updateService}
          onAddService={addService}
          onDeleteService={deleteService}
          onImportData={handleImportData}
        />
      )}
      {currentUser.role === UserRole.RECEPTIONIST && (
        <ReceptionistDashboard 
          users={users} 
          services={services} 
          appointments={appointments} 
          onAddAppointment={addAppointment}
          onUpdateStatus={updateAppointmentStatus}
        />
      )}
      {currentUser.role === UserRole.PROFESSIONAL && (
        <ProfessionalDashboard 
          user={currentUser} 
          services={services} 
          appointments={appointments} 
          onAddAppointment={addAppointment}
          onUpdateStatus={updateAppointmentStatus}
        />
      )}
    </Layout>
  );
};

export default App;
