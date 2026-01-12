
import { User, UserRole, Service, Appointment } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Admin', email: 'admin@salao.com', role: UserRole.ADMIN },
  { id: '2', name: 'Carla Recepcionista', email: 'recepcao@salao.com', role: UserRole.RECEPTIONIST },
  { id: '3', name: 'Bruna Cabelos', email: 'bruna@salao.com', role: UserRole.PROFESSIONAL, commissionRate: 0.5 },
  { id: '4', name: 'Diego Unhas', email: 'diego@salao.com', role: UserRole.PROFESSIONAL, commissionRate: 0.4 },
];

export const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Corte Feminino', price: 120 },
  { id: 's2', name: 'Manicure', price: 45 },
  { id: 's3', name: 'Coloração', price: 200 },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', professionalId: '3', serviceId: 's1', clientName: 'Maria Silva', date: '2023-11-20', time: '14:00', status: 'COMPLETED' },
  { id: 'a2', professionalId: '4', serviceId: 's2', clientName: 'Joana Santos', date: '2023-11-20', time: '15:00', status: 'SCHEDULED' },
];
