import { PaymentRecord } from '../types';

// Helper to make the request
const makeRequest = async (url: string, payload: any) => {
  try {
    // Note: Google Apps Script Web App returns opaque response with no-cors.
    // However, to READ data, we usually need CORS support or use a proxy.
    // For this demo, we assume the user sets "Anyone" access which sometimes allows simple CORS 
    // or we handle the 'write' blindly and 'read' with best effort.
    
    // For a robust React app + GAS, we send a POST for everything.
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // If opaque, we can't parse JSON. This is a limitation of client-side GAS calls without a proxy.
    // For the purpose of this simulation, if we are in "demo mode" (no URL), we handle it locally in App.tsx.
    // If URL is present, we try to parse.
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("API Call Error:", error);
    return null;
  }
};

export const saveToSheet = async (record: PaymentRecord, scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl) return true; // Offline mode

  // We use no-cors for writing to ensure it doesn't fail on browser network checks if GAS doesn't send headers
  // But strictly, we want to use the makeRequest logic. 
  // For 'Write' operations, strict success confirmation is hard without CORS headers from GAS.
  
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', data: record }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain prevents preflight
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const fetchPayments = async (scriptUrl: string): Promise<PaymentRecord[]> => {
  if (!scriptUrl) return [];

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'read' }),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    
    const result = await response.json();
    if (result.result === 'success') {
      return result.data.map((item: any) => ({
        ...item,
        // Ensure dates are strings for the UI
        dateRegistered: new Date(item.dateRegistered).toISOString().split('T')[0],
        paymentDateReal: new Date(item.paymentDateReal).toISOString().split('T')[0],
      }));
    }
    return [];
  } catch (e) {
    console.warn("Could not fetch from cloud (CORS might be blocking or script not deployed correctly). Using local state.");
    return [];
  }
};