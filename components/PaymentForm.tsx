import React, { useState } from 'react';
import { Save, Share2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { PaymentRecord, PaymentType } from '../types';
import { PAYMENT_TYPES, INITIAL_FORM_STATE } from '../constants';
import { saveToSheet } from '../services/sheetService';

interface PaymentFormProps {
  onAddRecord: (record: PaymentRecord) => void;
  scriptUrl: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onAddRecord, scriptUrl }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      ...formData,
      status: 'Pending'
    };

    // Save to Google Sheet (if configured)
    const success = await saveToSheet(newRecord, scriptUrl);
    
    // In this demo, we assume success to keep UI fluid, or rely on the return
    onAddRecord(newRecord);
    setLastId(newRecord.id);
    setFormData(INITIAL_FORM_STATE);
    
    if (success) {
      showNotification("Registro guardado exitosamente.", 'success');
    } else {
      showNotification("Guardado localmente. Error conectando a la nube.", 'error');
    }
    setLoading(false);
  };

  const handleWhatsApp = () => {
    if (!lastId) {
      showNotification("Primero registre un pago para notificar.", 'error');
      return;
    }
    
    const message = `*Notificación de Pago Realizado*%0A%0A` +
      `*Organismo:* ${formData.organism || 'N/A'}%0A` +
      `*Descripción:* ${formData.description || 'N/A'}%0A` +
      `*Tipo:* ${formData.paymentType}%0A` +
      `*Monto:* $${formData.amount.toFixed(2)}%0A` +
      `*Fecha:* ${formData.paymentDateReal}%0A` +
      `*Municipio:* ${formData.municipality || 'General'}%0A%0A` +
      `_Enviado desde el Sistema de Gestión Administrativa._`;

    // If a phone number was entered, use it directly
    const url = formData.contactPhone 
      ? `https://wa.me/${formData.contactPhone.replace(/\D/g,'')}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 relative">
      {/* Header matching the image */}
      <div className="bg-[#1e3a8a] text-white p-6 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide">Registro de Pagos y Servicios</h2>
        <p className="text-blue-200 text-sm mt-1">Control Fiscal y Parafiscal</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {/* Section 1: Detalles del Organismo */}
        <div>
          <h3 className="text-xs font-bold text-[#1e3a8a] uppercase mb-4 border-b pb-1">Detalles del Organismo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Fecha de Registro</label>
              <input
                type="date"
                name="dateRegistered"
                value={formData.dateRegistered}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Organismo (Ej: SENIAT)</label>
              <input
                type="text"
                name="organism"
                value={formData.organism}
                onChange={handleChange}
                placeholder="Organismo"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Información Financiera */}
        <div>
          <h3 className="text-xs font-bold text-[#1e3a8a] uppercase mb-4 border-b pb-1">Información Financiera</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Tipo de Pago</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PAYMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Monto Total</label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Fecha Real de Pago</label>
              <input
                type="date"
                name="paymentDateReal"
                value={formData.paymentDateReal}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Descripción del Pago</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ej: Pago de retenciones ISLR mes Julio"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Teléfono (WhatsApp)</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="Ej: 584121234567"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Incluya código de país sin símbolos (Ej: 58...)</p>
            </div>
          </div>
        </div>

        {/* Section 3: Unidad Tributaria / Ubicación */}
        <div>
          <h3 className="text-xs font-bold text-[#1e3a8a] uppercase mb-4 border-b pb-1">Unidad Tributaria / Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Código Unidad</label>
              <input
                type="text"
                name="unitCode"
                value={formData.unitCode}
                onChange={handleChange}
                placeholder="Código"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Nombre Unidad</label>
              <input
                type="text"
                name="unitName"
                value={formData.unitName}
                onChange={handleChange}
                placeholder="Nombre Unidad"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Municipio</label>
              <input
                type="text"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                placeholder="Municipio"
                className="w-full border border-gray-300 rounded p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1e3a8a] hover:bg-blue-800 text-white font-semibold py-4 rounded shadow transition duration-200 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Registrar Pago
          </button>
          
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded shadow transition duration-200 flex justify-center items-center gap-2"
          >
            <Share2 size={20} />
            Notificar (Manual)
          </button>
        </div>

      </form>

      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-2xl text-white flex items-center gap-3 transition-all duration-500 transform translate-y-0 z-50 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 text-center text-gray-500 text-xs border-t">
        © 2025 Sistema de Gestión Administrativa
      </div>
    </div>
  );
};

export default PaymentForm;