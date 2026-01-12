
import React from 'react';
import { UserRole, User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">BelezaGestão</span>
              <span className="bg-indigo-500 px-2 py-0.5 rounded text-xs uppercase font-medium">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-sm opacity-90">Olá, {user.name}</span>
              <button 
                onClick={onLogout}
                className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-4 text-center text-gray-500 text-xs">
        &copy; 2024 BelezaGestão. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Layout;
