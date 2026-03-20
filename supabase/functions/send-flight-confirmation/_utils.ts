// Simple QR code SVG generator
export async function generateQRCodeSVG(data: string): Promise<string> {
  const size = 200;
  const modules = 25;
  const moduleSize = size / modules;
  
  const hash = Array.from(data).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let paths = '';
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      const value = (x * y + hash + x + y) % 2;
      if (value === 0) {
        paths += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#000"/>`;
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#fff"/>
      ${paths}
    </svg>
  `;
}

interface TicketData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingId: string;
  flight: {
    airline: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    class: string;
  };
  departureDate: string;
  returnDate?: string;
  passengers: number;
  totalPrice: number;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  currency: string;
  qrCodeSvg: string;
}

export function generateTicketHTML(data: TicketData): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    bookingId,
    flight,
    departureDate,
    returnDate,
    passengers,
    totalPrice,
    passportNumber,
    passportIssueDate,
    passportExpiryDate,
    currency,
    qrCodeSvg,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
          }
          .ticket-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          .ticket-header h1 {
            font-size: 36px;
            margin-bottom: 10px;
          }
          .ticket-header p {
            font-size: 18px;
            opacity: 0.9;
          }
          .ticket-body {
            padding: 40px;
          }
          .route-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 30px 0;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 12px;
          }
          .airport {
            text-align: center;
            flex: 1;
          }
          .airport-code {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
          }
          .airport-name {
            font-size: 14px;
            color: #666;
          }
          .flight-arrow {
            font-size: 32px;
            color: #764ba2;
            margin: 0 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .info-item {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .info-value {
            font-size: 18px;
            font-weight: 600;
            color: #333;
          }
          .qr-section {
            margin-top: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            text-align: center;
          }
          .qr-section h3 {
            margin-bottom: 20px;
            color: #333;
          }
          .qr-code {
            display: inline-block;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .barcode {
            margin-top: 30px;
            text-align: center;
          }
          .barcode-lines {
            display: flex;
            justify-content: center;
            gap: 2px;
            margin: 15px 0;
          }
          .barcode-line {
            width: 3px;
            background: #333;
          }
          .booking-ref {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: #333;
            letter-spacing: 4px;
          }
          .footer {
            padding: 30px;
            background: #f8f9fa;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .important-notice {
            margin-top: 30px;
            padding: 20px;
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
          }
          .important-notice h4 {
            color: #856404;
            margin-bottom: 10px;
          }
          .important-notice ul {
            list-style: none;
            color: #856404;
          }
          .important-notice li {
            margin: 8px 0;
            padding-left: 20px;
            position: relative;
          }
          .important-notice li:before {
            content: "⚠️";
            position: absolute;
            left: 0;
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <h1>✈️ Billet d'Avion</h1>
            <p>Bossiz Travel - Votre partenaire voyage</p>
          </div>

          <div class="ticket-body">
            <div class="route-section">
              <div class="airport">
                <div class="airport-code">${flight.from}</div>
                <div class="airport-name">Départ</div>
              </div>
              <div class="flight-arrow">✈️</div>
              <div class="airport">
                <div class="airport-code">${flight.to}</div>
                <div class="airport-name">Arrivée</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Passager</div>
                <div class="info-value">${customerName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">N° Réservation</div>
                <div class="info-value">${bookingId.substring(0, 8).toUpperCase()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date de départ</div>
                <div class="info-value">${new Date(departureDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              ${returnDate ? `
              <div class="info-item">
                <div class="info-label">Date de retour</div>
                <div class="info-value">${new Date(returnDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              ` : ''}
              <div class="info-item">
                <div class="info-label">Compagnie</div>
                <div class="info-value">${flight.airline}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Classe</div>
                <div class="info-value">${flight.class}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Passagers</div>
                <div class="info-value">${passengers}</div>
              </div>
              <div class="info-item">
                <div class="info-label">N° Passeport</div>
                <div class="info-value">${passportNumber}</div>
              </div>
            </div>

            <div class="qr-section">
              <h3>Scannez ce code à l'aéroport</h3>
              <div class="qr-code">
                ${qrCodeSvg}
              </div>
            </div>

            <div class="barcode">
              <div class="barcode-lines">
                ${Array(50).fill(0).map((_, i) => 
                  `<div class="barcode-line" style="height: ${Math.random() > 0.5 ? '60' : '40'}px"></div>`
                ).join('')}
              </div>
              <div class="booking-ref">${bookingId.substring(0, 8).toUpperCase()}</div>
            </div>

            <div class="important-notice">
              <h4>⚠️ Informations importantes</h4>
              <ul>
                <li>Présentez-vous à l'aéroport au moins 2 heures avant le départ</li>
                <li>Vérifiez la validité de votre passeport (validité min. 6 mois)</li>
                <li>Conservez ce billet et votre pièce d'identité</li>
                <li>En cas de problème, contactez notre service client</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>Prix total: ${totalPrice.toLocaleString()} ${currency}</p>
            <p style="margin-top: 10px;">Merci d'avoir choisi Bossiz Travel</p>
            <p style="margin-top: 5px;">Email: ${customerEmail} | Tél: ${customerPhone}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
