import React from 'react';
import { User, UserRole } from '../types';
import { Shield, User as UserIcon, Eye } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleRoleSelect = (role: UserRole) => {
    let user: User;
    switch (role) {
      case 'admin':
        user = { username: 'admin', name: 'Administrador Principal', role: 'admin' };
        break;
      case 'payer':
        user = { username: 'pagador', name: 'Operador de Pagos', role: 'payer' };
        break;
      case 'viewer':
        user = { username: 'visor', name: 'Auditor Visor', role: 'viewer' };
        break;
    }
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="bg-[#1e3a8a] p-8 md:w-1/2 flex flex-col justify-center text-white">
          <h1 className="text-3xl font-bold mb-4">FiscalControl Pro</h1>
          <p className="text-blue-200 mb-6">
            Sistema integral de gestión de pagos fiscales y parafiscales.
          </p>
          <div className="text-sm opacity-75">
            <p>• Control de Presupuestos</p>
            <p>• Historial Detallado</p>
            <p>• Integración Cloud</p>
          </div>
        </div>
        
        <div className="p-8 md:w-1/2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mb-6 text-center">Seleccione un rol para ingresar (Simulación)</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition group"
            >
              <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:bg-blue-200">
                <Shield className="w-6 h-6 text-[#1e3a8a]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Administrador</p>
                <p className="text-xs text-gray-500">Acceso total al sistema</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('payer')}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition group"
            >
              <div className="bg-green-100 p-2 rounded-full mr-4 group-hover:bg-green-200">
                <UserIcon className="w-6 h-6 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Pagador</p>
                <p className="text-xs text-gray-500">Registrar y notificar</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('viewer')}
              className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition group"
            >
              <div className="bg-purple-100 p-2 rounded-full mr-4 group-hover:bg-purple-200">
                <Eye className="w-6 h-6 text-purple-700" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Visor</p>
                <p className="text-xs text-gray-500">Solo lectura y estadísticas</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;