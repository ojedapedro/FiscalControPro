/**
 * Google Apps Script for FiscalControl Pro
 * Deploy this as a Web App with access set to "Anyone".
 */

// Define Column Indices (0-based) for easier maintenance
const COL = {
  ID: 0,
  DATE_REG: 1,
  ORGANISM: 2,
  TYPE: 3,
  AMOUNT: 4,
  DATE_REAL: 5,
  UNIT_CODE: 6,
  UNIT_NAME: 7,
  MUNICIPALITY: 8,
  STATUS: 9,
  DESCRIPTION: 10,
  PHONE: 11,
  TIMESTAMP: 12
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const request = JSON.parse(e.postData.contents);
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- ACTION: CREATE (Register Payment) ---
    if (!request.action || request.action === 'create') {
      const sheetName = 'RegistroPagos';
      let sheet = doc.getSheetByName(sheetName);

      if (!sheet) {
        sheet = doc.insertSheet(sheetName);
        sheet.appendRow([
          'ID', 'Fecha Registro', 'Organismo', 'Tipo Pago', 'Monto', 
          'Fecha Pago Real', 'Código Unidad', 'Nombre Unidad', 'Municipio', 
          'Estado', 'Descripción', 'Teléfono', 'Timestamp'
        ]);
        sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
      }

      sheet.appendRow([
        request.data.id,
        request.data.dateRegistered,
        request.data.organism,
        request.data.paymentType,
        request.data.amount,
        request.data.paymentDateReal,
        request.data.unitCode,
        request.data.unitName,
        request.data.municipality,
        request.data.status || 'Pending',
        request.data.description || '',
        request.data.contactPhone || '',
        new Date()
      ]);

      return createJSONOutput({ 'result': 'success', 'row': sheet.getLastRow() });
    }

    // --- ACTION: READ (Get History) ---
    if (request.action === 'read') {
      const sheet = doc.getSheetByName('RegistroPagos');
      if (!sheet) {
        return createJSONOutput({ 'result': 'success', 'data': [] });
      }

      const rows = sheet.getDataRange().getValues();
      const data = rows.slice(1).map(row => {
        return {
          id: row[COL.ID],
          dateRegistered: row[COL.DATE_REG], 
          organism: row[COL.ORGANISM],
          paymentType: row[COL.TYPE],
          amount: Number(row[COL.AMOUNT]),
          paymentDateReal: row[COL.DATE_REAL],
          unitCode: row[COL.UNIT_CODE],
          unitName: row[COL.UNIT_NAME],
          municipality: row[COL.MUNICIPALITY],
          status: row[COL.STATUS],
          description: row[COL.DESCRIPTION],
          contactPhone: row[COL.PHONE]
        };
      });

      return createJSONOutput({ 'result': 'success', 'data': data });
    }
    
    // --- ACTION: TRIGGER SETUP (Optional: Call this once via client or run manually) ---
    if (request.action === 'setupTrigger') {
      setupTrigger();
      return createJSONOutput({ 'result': 'success', 'message': 'Daily trigger setup complete' });
    }

    return createJSONOutput({ 'result': 'error', 'message': 'Invalid action' });

  } catch (e) {
    return createJSONOutput({ 'result': 'error', 'error': e.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * UTILITY: Run this function MANUALLY once from the Apps Script Editor
 * to set up the automatic daily check.
 */
function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  // Avoid duplicates
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'checkUpcomingPayments') {
      return; 
    }
  }
  
  ScriptApp.newTrigger('checkUpcomingPayments')
      .timeBased()
      .everyDays(1)
      .atHour(8) // Run at 8 AM
      .create();
}

/**
 * AUTOMATIC TASK: Checks for payments due in 3 days.
 * This function is triggered by the time-driven trigger.
 */
function checkUpcomingPayments() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = doc.getSheetByName('RegistroPagos');
  if (!sheet) return;

  const rows = sheet.getDataRange().getValues();
  // Skip header
  if (rows.length < 2) return;

  const today = new Date();
  // Normalize today to start of day
  today.setHours(0, 0, 0, 0);

  // We loop starting from index 1 (row 2)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const status = row[COL.STATUS];
    const paymentDateString = row[COL.DATE_REAL];
    const phone = row[COL.PHONE];
    const organism = row[COL.ORGANISM];
    const amount = row[COL.AMOUNT];

    // Only check pending payments with a phone number
    if (status === 'Pending' && phone) {
      const paymentDate = new Date(paymentDateString);
      paymentDate.setHours(0, 0, 0, 0);

      // Calculate difference in days
      const diffTime = paymentDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // IF due in exactly 3 days
      if (diffDays === 3) {
        const message = `🔔 *Recordatorio de Pago* 🔔\n\nEl pago para *${organism}* por un monto de *$${amount}* vence en 3 días (${paymentDateString}).\n\nPor favor tome sus previsiones.`;
        sendWhatsAppNotification(phone, message);
      }
    }
  }
}

/**
 * SEND WHATSAPP: Connects to an external API.
 * NOTE: Google Apps Script cannot open 'wa.me' links automatically.
 * You MUST use a Gateway API like CallMeBot, Twilio, or Meta API.
 */
function sendWhatsAppNotification(phone, message) {
  // --- OPTION 1: CALLMEBOT (Free for personal use) ---
  // You need to get an API Key from CallMeBot for the specific number.
  // const apiKey = 'YOUR_API_KEY'; 
  // const encodedMessage = encodeURIComponent(message);
  // const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
  
  // --- OPTION 2: Placeholder (Log for now) ---
  console.log(`[SIMULATION] Sending WhatsApp to ${phone}: ${message}`);
  
  // To make this work, uncomment lines below and use a real API service
  /*
  try {
    UrlFetchApp.fetch(url);
  } catch (e) {
    console.error("Error sending WhatsApp: " + e.toString());
    // Fallback: Send Email to Admin
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: "Fallo envío WhatsApp - Pago Próximo",
      htmlBody: `No se pudo enviar WhatsApp al ${phone}. <br>Mensaje: ${message}`
    });
  }
  */
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return createJSONOutput({ 'status': 'alive', 'message': 'Use POST to interact with data' });
}