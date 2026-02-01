import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, X, LogOut, History, UserCircle } from 'lucide-react';
import PaymentForm from './components/PaymentForm';
import Dashboard from './components/Dashboard';
import PaymentHistory from './components/PaymentHistory';
import Login from './components/Login';
import { PaymentRecord, User } from './types';
import { DEFAULT_SCRIPT_URL } from './constants';
import { fetchPayments } from './services/sheetService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'history'>('dashboard');
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [scriptUrl, setScriptUrl] = useState(DEFAULT_SCRIPT_URL);

  useEffect(() => {
    // Attempt to load initial data if we have a URL, otherwise empty
    if (scriptUrl) {
      loadData();
    }
  }, [scriptUrl]);

  const loadData = async () => {
    const data = await fetchPayments(scriptUrl);
    if (data.length > 0) {
      setRecords(data);
    }
  };

  const handleAddRecord = (record: PaymentRecord) => {
    setRecords(prev => [...prev, record]);
  };

  const handleLogout = () => {
    setUser(null);
    setRecords([]); // Clear sensitive data on logout
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Permission Logic
  const canRegister = ['admin', 'payer'].includes(user.role);
  const canViewHistory = ['admin', 'payer', 'viewer'].includes(user.role);
  const canViewDashboard = ['admin', 'payer', 'viewer'].includes(user.role);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-[#1e3a8a] mr-8">FiscalControl</span>
              
              <div className="hidden md:flex space-x-2">
                {canViewDashboard && (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === 'dashboard' 
                        ? 'text-[#1e3a8a] bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </button>
                )}
                
                {canRegister && (
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === 'form' 
                        ? 'text-[#1e3a8a] bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </button>
                )}

                {canViewHistory && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === 'history' 
                        ? 'text-[#1e3a8a] bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Historial
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
               <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <UserCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium mr-1">{user.name}</span>
                  <span className="text-xs bg-gray-200 px-1 rounded uppercase">({user.role})</span>
               </div>

              {user.role === 'admin' && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Configuración Conexión"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'form' && canRegister && (
          <PaymentForm onAddRecord={handleAddRecord} scriptUrl={scriptUrl} />
        )}
        
        {activeTab === 'dashboard' && canViewDashboard && (
          <Dashboard records={records} />
        )}

        {activeTab === 'history' && canViewHistory && (
          <PaymentHistory records={records} />
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Configuración de Conexión</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Apps Script Web App URL
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Asegúrese de que el script tenga permisos "Anyone" para lectura y escritura.
              </p>
              <input
                type="text"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={loadData}
                className="text-blue-600 text-sm hover:underline"
              >
                Probar conexión y Descargar datos
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="bg-[#1e3a8a] text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;