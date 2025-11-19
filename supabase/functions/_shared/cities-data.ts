/**
 * Liste complète des villes internationales pour l'autocomplétion
 * Couvre l'Europe, l'Amérique, l'Asie et l'Afrique
 */

export interface CityData {
  name: string;
  code?: string;
  country: string;
  continent: string;
  averagePrice?: number;
  priceRange?: string;
}

export const worldCities: CityData[] = [
  // === EUROPE ===
  // France
  { name: "Paris", code: "CDG", country: "France", continent: "Europe", averagePrice: 150, priceRange: "80-300€" },
  { name: "Marseille", code: "MRS", country: "France", continent: "Europe", averagePrice: 120, priceRange: "60-250€" },
  { name: "Lyon", code: "LYS", country: "France", continent: "Europe", averagePrice: 130, priceRange: "70-260€" },
  { name: "Nice", code: "NCE", country: "France", continent: "Europe", averagePrice: 140, priceRange: "75-280€" },
  { name: "Toulouse", code: "TLS", country: "France", continent: "Europe", averagePrice: 125, priceRange: "65-255€" },
  { name: "Bordeaux", code: "BOD", country: "France", continent: "Europe", averagePrice: 135, priceRange: "70-270€" },
  
  // Royaume-Uni
  { name: "Londres", code: "LHR", country: "Royaume-Uni", continent: "Europe", averagePrice: 180, priceRange: "100-350€" },
  { name: "Manchester", code: "MAN", country: "Royaume-Uni", continent: "Europe", averagePrice: 150, priceRange: "80-300€" },
  { name: "Birmingham", code: "BHX", country: "Royaume-Uni", continent: "Europe", averagePrice: 145, priceRange: "75-290€" },
  { name: "Édimbourg", code: "EDI", country: "Royaume-Uni", continent: "Europe", averagePrice: 155, priceRange: "85-310€" },
  { name: "Glasgow", code: "GLA", country: "Royaume-Uni", continent: "Europe", averagePrice: 150, priceRange: "80-305€" },
  
  // Allemagne
  { name: "Berlin", code: "BER", country: "Allemagne", continent: "Europe", averagePrice: 140, priceRange: "75-280€" },
  { name: "Munich", code: "MUC", country: "Allemagne", continent: "Europe", averagePrice: 155, priceRange: "85-310€" },
  { name: "Francfort", code: "FRA", country: "Allemagne", continent: "Europe", averagePrice: 145, priceRange: "80-295€" },
  { name: "Hambourg", code: "HAM", country: "Allemagne", continent: "Europe", averagePrice: 135, priceRange: "70-275€" },
  { name: "Cologne", code: "CGN", country: "Allemagne", continent: "Europe", averagePrice: 130, priceRange: "65-265€" },
  
  // Espagne
  { name: "Madrid", code: "MAD", country: "Espagne", continent: "Europe", averagePrice: 130, priceRange: "70-260€" },
  { name: "Barcelone", code: "BCN", country: "Espagne", continent: "Europe", averagePrice: 145, priceRange: "75-290€" },
  { name: "Séville", code: "SVQ", country: "Espagne", continent: "Europe", averagePrice: 120, priceRange: "60-250€" },
  { name: "Valence", code: "VLC", country: "Espagne", continent: "Europe", averagePrice: 125, priceRange: "65-255€" },
  { name: "Bilbao", code: "BIO", country: "Espagne", continent: "Europe", averagePrice: 130, priceRange: "68-260€" },
  
  // Italie
  { name: "Rome", code: "FCO", country: "Italie", continent: "Europe", averagePrice: 145, priceRange: "75-290€" },
  { name: "Milan", code: "MXP", country: "Italie", continent: "Europe", averagePrice: 155, priceRange: "85-310€" },
  { name: "Venise", code: "VCE", country: "Italie", continent: "Europe", averagePrice: 160, priceRange: "90-320€" },
  { name: "Florence", code: "FLR", country: "Italie", continent: "Europe", averagePrice: 140, priceRange: "75-285€" },
  { name: "Naples", code: "NAP", country: "Italie", continent: "Europe", averagePrice: 135, priceRange: "70-275€" },
  
  // Pays-Bas
  { name: "Amsterdam", code: "AMS", country: "Pays-Bas", continent: "Europe", averagePrice: 160, priceRange: "85-320€" },
  { name: "Rotterdam", code: "RTM", country: "Pays-Bas", continent: "Europe", averagePrice: 145, priceRange: "75-290€" },
  { name: "La Haye", country: "Pays-Bas", continent: "Europe", averagePrice: 140, priceRange: "70-280€" },
  
  // Belgique
  { name: "Bruxelles", code: "BRU", country: "Belgique", continent: "Europe", averagePrice: 140, priceRange: "75-280€" },
  { name: "Anvers", code: "ANR", country: "Belgique", continent: "Europe", averagePrice: 130, priceRange: "68-265€" },
  
  // Suisse
  { name: "Zurich", code: "ZRH", country: "Suisse", continent: "Europe", averagePrice: 185, priceRange: "110-360€" },
  { name: "Genève", code: "GVA", country: "Suisse", continent: "Europe", averagePrice: 180, priceRange: "105-355€" },
  { name: "Berne", country: "Suisse", continent: "Europe", averagePrice: 175, priceRange: "100-350€" },
  
  // Portugal
  { name: "Lisbonne", code: "LIS", country: "Portugal", continent: "Europe", averagePrice: 125, priceRange: "65-255€" },
  { name: "Porto", code: "OPO", country: "Portugal", continent: "Europe", averagePrice: 115, priceRange: "60-240€" },
  
  // Grèce
  { name: "Athènes", code: "ATH", country: "Grèce", continent: "Europe", averagePrice: 130, priceRange: "70-260€" },
  { name: "Thessalonique", code: "SKG", country: "Grèce", continent: "Europe", averagePrice: 120, priceRange: "60-250€" },
  
  // Autres Europe
  { name: "Vienne", code: "VIE", country: "Autriche", continent: "Europe", averagePrice: 150, priceRange: "80-300€" },
  { name: "Prague", code: "PRG", country: "République Tchèque", continent: "Europe", averagePrice: 135, priceRange: "70-275€" },
  { name: "Budapest", code: "BUD", country: "Hongrie", continent: "Europe", averagePrice: 125, priceRange: "65-255€" },
  { name: "Varsovie", code: "WAW", country: "Pologne", continent: "Europe", averagePrice: 130, priceRange: "68-265€" },
  { name: "Cracovie", code: "KRK", country: "Pologne", continent: "Europe", averagePrice: 120, priceRange: "60-250€" },
  { name: "Stockholm", code: "ARN", country: "Suède", continent: "Europe", averagePrice: 165, priceRange: "90-330€" },
  { name: "Copenhague", code: "CPH", country: "Danemark", continent: "Europe", averagePrice: 170, priceRange: "95-340€" },
  { name: "Oslo", code: "OSL", country: "Norvège", continent: "Europe", averagePrice: 175, priceRange: "100-350€" },
  { name: "Helsinki", code: "HEL", country: "Finlande", continent: "Europe", averagePrice: 160, priceRange: "85-320€" },
  { name: "Dublin", code: "DUB", country: "Irlande", continent: "Europe", averagePrice: 155, priceRange: "85-310€" },
  
  // === ASIE ===
  // Chine
  { name: "Pékin", code: "PEK", country: "Chine", continent: "Asie", averagePrice: 380, priceRange: "250-650€" },
  { name: "Shanghai", code: "PVG", country: "Chine", continent: "Asie", averagePrice: 390, priceRange: "260-670€" },
  { name: "Hong Kong", code: "HKG", country: "Hong Kong", continent: "Asie", averagePrice: 420, priceRange: "280-720€" },
  { name: "Guangzhou", code: "CAN", country: "Chine", continent: "Asie", averagePrice: 370, priceRange: "245-640€" },
  { name: "Chongqing", code: "CKG", country: "Chine", continent: "Asie", averagePrice: 360, priceRange: "240-630€" },
  { name: "Shenzhen", code: "SZX", country: "Chine", continent: "Asie", averagePrice: 375, priceRange: "250-645€" },
  { name: "Chengdu", code: "CTU", country: "Chine", continent: "Asie", averagePrice: 365, priceRange: "242-635€" },
  { name: "Xi'an", code: "XIY", country: "Chine", continent: "Asie", averagePrice: 355, priceRange: "235-625€" },
  
  // Japon
  { name: "Tokyo", code: "NRT", country: "Japon", continent: "Asie", averagePrice: 450, priceRange: "300-800€" },
  { name: "Osaka", code: "KIX", country: "Japon", continent: "Asie", averagePrice: 440, priceRange: "290-780€" },
  { name: "Kyoto", country: "Japon", continent: "Asie", averagePrice: 435, priceRange: "285-775€" },
  { name: "Nagoya", code: "NGO", country: "Japon", continent: "Asie", averagePrice: 425, priceRange: "280-760€" },
  
  // Corée du Sud
  { name: "Séoul", code: "ICN", country: "Corée du Sud", continent: "Asie", averagePrice: 400, priceRange: "265-700€" },
  { name: "Busan", code: "PUS", country: "Corée du Sud", continent: "Asie", averagePrice: 390, priceRange: "260-680€" },
  
  // Inde
  { name: "New Delhi", code: "DEL", country: "Inde", continent: "Asie", averagePrice: 350, priceRange: "230-600€" },
  { name: "Mumbai", code: "BOM", country: "Inde", continent: "Asie", averagePrice: 360, priceRange: "240-620€" },
  { name: "Bangalore", code: "BLR", country: "Inde", continent: "Asie", averagePrice: 355, priceRange: "235-610€" },
  { name: "Chennai", code: "MAA", country: "Inde", continent: "Asie", averagePrice: 345, priceRange: "230-595€" },
  { name: "Kolkata", code: "CCU", country: "Inde", continent: "Asie", averagePrice: 340, priceRange: "225-590€" },
  
  // Asie du Sud-Est
  { name: "Bangkok", code: "BKK", country: "Thaïlande", continent: "Asie", averagePrice: 320, priceRange: "210-550€" },
  { name: "Singapour", code: "SIN", country: "Singapour", continent: "Asie", averagePrice: 380, priceRange: "250-650€" },
  { name: "Kuala Lumpur", code: "KUL", country: "Malaisie", continent: "Asie", averagePrice: 310, priceRange: "205-540€" },
  { name: "Jakarta", code: "CGK", country: "Indonésie", continent: "Asie", averagePrice: 330, priceRange: "220-570€" },
  { name: "Manille", code: "MNL", country: "Philippines", continent: "Asie", averagePrice: 340, priceRange: "225-590€" },
  { name: "Hô Chi Minh-Ville", code: "SGN", country: "Vietnam", continent: "Asie", averagePrice: 315, priceRange: "210-545€" },
  { name: "Hanoï", code: "HAN", country: "Vietnam", continent: "Asie", averagePrice: 310, priceRange: "205-540€" },
  
  // Moyen-Orient
  { name: "Dubaï", code: "DXB", country: "Émirats Arabes Unis", continent: "Asie", averagePrice: 380, priceRange: "250-650€" },
  { name: "Abu Dhabi", code: "AUH", country: "Émirats Arabes Unis", continent: "Asie", averagePrice: 375, priceRange: "245-645€" },
  { name: "Doha", code: "DOH", country: "Qatar", continent: "Asie", averagePrice: 370, priceRange: "240-640€" },
  { name: "Istanbul", code: "IST", country: "Turquie", continent: "Asie", averagePrice: 240, priceRange: "150-450€" },
  { name: "Tel Aviv", code: "TLV", country: "Israël", continent: "Asie", averagePrice: 290, priceRange: "180-520€" },
  { name: "Beyrouth", code: "BEY", country: "Liban", continent: "Asie", averagePrice: 280, priceRange: "170-510€" },
  
  // === AFRIQUE ===
  // Afrique du Nord
  { name: "Le Caire", code: "CAI", country: "Égypte", continent: "Afrique", averagePrice: 320, priceRange: "200-550€" },
  { name: "Casablanca", code: "CMN", country: "Maroc", continent: "Afrique", averagePrice: 180, priceRange: "120-350€" },
  { name: "Marrakech", code: "RAK", country: "Maroc", continent: "Afrique", averagePrice: 175, priceRange: "115-345€" },
  { name: "Tunis", code: "TUN", country: "Tunisie", continent: "Afrique", averagePrice: 210, priceRange: "140-380€" },
  { name: "Alger", code: "ALG", country: "Algérie", continent: "Afrique", averagePrice: 220, priceRange: "150-400€" },
  { name: "Tripoli", code: "TIP", country: "Libye", continent: "Afrique", averagePrice: 280, priceRange: "180-500€" },
  
  // Afrique de l'Ouest
  { name: "Abidjan", code: "ABJ", country: "Côte d'Ivoire", continent: "Afrique", averagePrice: 450, priceRange: "250-800€" },
  { name: "Lagos", code: "LOS", country: "Nigeria", continent: "Afrique", averagePrice: 490, priceRange: "300-900€" },
  { name: "Accra", code: "ACC", country: "Ghana", continent: "Afrique", averagePrice: 470, priceRange: "270-820€" },
  { name: "Dakar", code: "DSS", country: "Sénégal", continent: "Afrique", averagePrice: 420, priceRange: "250-750€" },
  { name: "Lomé", code: "LFW", country: "Togo", continent: "Afrique", averagePrice: 480, priceRange: "280-850€" },
  { name: "Bamako", code: "BKO", country: "Mali", continent: "Afrique", averagePrice: 520, priceRange: "320-950€" },
  { name: "Ouagadougou", code: "OUA", country: "Burkina Faso", continent: "Afrique", averagePrice: 510, priceRange: "310-920€" },
  { name: "Conakry", code: "CKY", country: "Guinée", continent: "Afrique", averagePrice: 490, priceRange: "300-880€" },
  { name: "Abuja", code: "ABV", country: "Nigeria", continent: "Afrique", averagePrice: 485, priceRange: "295-870€" },
  { name: "Niamey", code: "NIM", country: "Niger", continent: "Afrique", averagePrice: 530, priceRange: "330-960€" },
  
  // Afrique de l'Est
  { name: "Nairobi", code: "NBO", country: "Kenya", continent: "Afrique", averagePrice: 550, priceRange: "350-950€" },
  { name: "Addis-Abeba", code: "ADD", country: "Éthiopie", continent: "Afrique", averagePrice: 480, priceRange: "300-850€" },
  { name: "Dar es Salaam", code: "DAR", country: "Tanzanie", continent: "Afrique", averagePrice: 580, priceRange: "380-1000€" },
  { name: "Kigali", code: "KGL", country: "Rwanda", continent: "Afrique", averagePrice: 570, priceRange: "370-990€" },
  { name: "Kampala", code: "EBB", country: "Ouganda", continent: "Afrique", averagePrice: 560, priceRange: "360-980€" },
  
  // Afrique Australe
  { name: "Johannesburg", code: "JNB", country: "Afrique du Sud", continent: "Afrique", averagePrice: 620, priceRange: "400-1100€" },
  { name: "Le Cap", code: "CPT", country: "Afrique du Sud", continent: "Afrique", averagePrice: 650, priceRange: "420-1150€" },
  { name: "Durban", code: "DUR", country: "Afrique du Sud", continent: "Afrique", averagePrice: 610, priceRange: "395-1090€" },
  
  // Afrique Centrale
  { name: "Kinshasa", code: "FIH", country: "RD Congo", continent: "Afrique", averagePrice: 590, priceRange: "390-1020€" },
  { name: "Douala", code: "DLA", country: "Cameroun", continent: "Afrique", averagePrice: 500, priceRange: "310-900€" },
  { name: "Yaoundé", code: "NSI", country: "Cameroun", continent: "Afrique", averagePrice: 495, priceRange: "305-895€" },
  { name: "Libreville", code: "LBV", country: "Gabon", continent: "Afrique", averagePrice: 510, priceRange: "320-920€" },
  
  // === AMÉRIQUE DU NORD ===
  // États-Unis
  { name: "New York", code: "JFK", country: "États-Unis", continent: "Amérique", averagePrice: 450, priceRange: "300-800€" },
  { name: "Los Angeles", code: "LAX", country: "États-Unis", continent: "Amérique", averagePrice: 480, priceRange: "320-850€" },
  { name: "Chicago", code: "ORD", country: "États-Unis", continent: "Amérique", averagePrice: 440, priceRange: "290-780€" },
  { name: "Miami", code: "MIA", country: "États-Unis", continent: "Amérique", averagePrice: 420, priceRange: "280-750€" },
  { name: "San Francisco", code: "SFO", country: "États-Unis", continent: "Amérique", averagePrice: 470, priceRange: "310-830€" },
  { name: "Las Vegas", code: "LAS", country: "États-Unis", continent: "Amérique", averagePrice: 410, priceRange: "270-740€" },
  { name: "Boston", code: "BOS", country: "États-Unis", continent: "Amérique", averagePrice: 445, priceRange: "295-790€" },
  { name: "Seattle", code: "SEA", country: "États-Unis", continent: "Amérique", averagePrice: 460, priceRange: "305-820€" },
  { name: "Washington DC", code: "IAD", country: "États-Unis", continent: "Amérique", averagePrice: 435, priceRange: "285-775€" },
  { name: "Atlanta", code: "ATL", country: "États-Unis", continent: "Amérique", averagePrice: 425, priceRange: "280-760€" },
  
  // Canada
  { name: "Toronto", code: "YYZ", country: "Canada", continent: "Amérique", averagePrice: 430, priceRange: "285-770€" },
  { name: "Vancouver", code: "YVR", country: "Canada", continent: "Amérique", averagePrice: 445, priceRange: "295-790€" },
  { name: "Montréal", code: "YUL", country: "Canada", continent: "Amérique", averagePrice: 425, priceRange: "280-760€" },
  
  // === AMÉRIQUE DU SUD ===
  { name: "São Paulo", code: "GRU", country: "Brésil", continent: "Amérique", averagePrice: 520, priceRange: "340-920€" },
  { name: "Rio de Janeiro", code: "GIG", country: "Brésil", continent: "Amérique", averagePrice: 530, priceRange: "350-940€" },
  { name: "Buenos Aires", code: "EZE", country: "Argentine", continent: "Amérique", averagePrice: 540, priceRange: "360-960€" },
  { name: "Lima", code: "LIM", country: "Pérou", continent: "Amérique", averagePrice: 510, priceRange: "330-910€" },
  { name: "Bogotá", code: "BOG", country: "Colombie", continent: "Amérique", averagePrice: 500, priceRange: "320-900€" },
  { name: "Santiago", code: "SCL", country: "Chili", continent: "Amérique", averagePrice: 550, priceRange: "370-980€" },
  
  // === AMÉRIQUE CENTRALE ===
  { name: "Mexico", code: "MEX", country: "Mexique", continent: "Amérique", averagePrice: 460, priceRange: "300-820€" },
  { name: "Cancún", code: "CUN", country: "Mexique", continent: "Amérique", averagePrice: 470, priceRange: "310-840€" },
  { name: "Panama City", code: "PTY", country: "Panama", continent: "Amérique", averagePrice: 480, priceRange: "315-850€" },
  
  // === OCÉANIE ===
  { name: "Sydney", code: "SYD", country: "Australie", continent: "Océanie", averagePrice: 680, priceRange: "450-1200€" },
  { name: "Melbourne", code: "MEL", country: "Australie", continent: "Océanie", averagePrice: 670, priceRange: "445-1180€" },
  { name: "Auckland", code: "AKL", country: "Nouvelle-Zélande", continent: "Océanie", averagePrice: 690, priceRange: "460-1220€" },
];

// Helper function pour filtrer les villes par continent
export function getCitiesByContinent(continent: string): CityData[] {
  return worldCities.filter(city => city.continent === continent);
}

// Helper function pour rechercher des villes
export function searchCities(query: string, limit: number = 10): CityData[] {
  const searchTerm = query.toLowerCase();
  return worldCities.filter(
    city =>
      city.name.toLowerCase().includes(searchTerm) ||
      city.code?.toLowerCase().includes(searchTerm) ||
      city.country.toLowerCase().includes(searchTerm)
  ).slice(0, limit);
}
