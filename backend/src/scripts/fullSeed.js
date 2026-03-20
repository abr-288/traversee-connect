const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fullSeed() {
  try {
    console.log('🧹 Nettoyage de la base de données...');
    
    await prisma.ticketResponse.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.quoteRequest.deleteMany({});
    await prisma.loginLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    console.log('✅ Base de données nettoyée.');

    const adminPassword = await bcrypt.hash('Admin@2026!', 10);
    await prisma.user.create({
      data: {
        email: 'admin@onesky.com',
        password: adminPassword,
        name: 'Administrateur OneSky',
        role: 'ADMIN',
        company: 'ONESKY CORPORATE',
        phone: '+33 1 00 00 00 00'
      }
    });

    await prisma.setting.create({
      data: {
        id: 'global',
        siteName: 'ONESKY',
        contactEmail: 'contact@onesky.space',
        supportEmail: 'support@onesky.space',
        footerText: '© 2026 ONESKY - Intelligence Géospatiale & Services Satellitaires'
      }
    });

    const pages = [
      { id: 'index', title: 'Accueil' },
      { id: 'about', title: 'À Propos' },
      { id: 'technology', title: 'Technologie' },
      { id: 'solutions', title: 'Solutions' },
      { id: 'datasat', title: 'DataSAT' },
      { id: 'contact', title: 'Contact' }
    ];

    for (const page of pages) {
      await prisma.page.create({ data: page });
    }

    const products = [
      {
        id: "sky-loupe",
        name: "SKY LOUPE",
        tagline: "Suivi des constructions & contrôle des permis",
        description: "Plateforme de télédétection dédiée au suivi des constructions et au contrôle des permis de construire.",
        fullDescription: "SKY LOUPE est notre solution phare pour la surveillance urbaine. En combinant l'imagerie très haute résolution et des algorithmes de détection de changements par Deep Learning, SKY LOUPE permet aux autorités de suivre l'évolution des constructions en temps réel.",
        image: "https://img.freepik.com/free-photo/palace-china_1127-4067.jpg",
        color: "primary",
        features: [
            { title: "Détection automatique", desc: "Identification instantanée des nouvelles dalles." },
            { title: "Superposition Cadastrale", desc: "Comparaison directe entre l'image satellite et le plan cadastral." }
        ],
        useCases: [
            { title: "Urbanisme", desc: "Identifier les constructions sans permis." },
            { title: "Fiscalité", desc: "Mise à jour des bases de données fiscales foncières." }
        ],
        specifications: ["Résolution : 30cm à 50cm", "Fréquence : Hebdomadaire", "Format : Dashboard"]
      },
      {
        id: "sky-sentinel",
        name: "SKY SENTINEL",
        tagline: "Gestion des frontières & veille territoriale",
        description: "Système d'observation satellitaire pour la sécurité territoriale et la coordination opérationnelle.",
        fullDescription: "SKY SENTINEL offre une vision stratégique globale pour la gestion des frontières. Grâce à une revisite haute fréquence, le système permet de détecter les mouvements suspects et d'assurer une veille territoriale permanente.",
        image: "https://img.freepik.com/free-photo/aerial-shot-beautiful-green-hills-curvy-road-going-along-edge-amazing-sea_181624-2332.jpg",
        color: "secondary",
        features: [
            { title: "Veille 24/7", desc: "Capacité d'imagerie radar (SAR) pour une vision tout temps." },
            { title: "Alertes Intrusion", desc: "Notification automatique en cas de détection de mouvements." }
        ],
        useCases: [
            { title: "Sécurité", icon: "Shield", desc: "Protection des frontières terrestres et maritimes." },
            { title: "Renseignement", icon: "Search", desc: "Analyse stratégique de zones d'intérêt." }
        ],
        specifications: ["Capteurs : Optique & SAR", "Revisite : < 12 heures", "Précision : Métrique"]
      },
      {
        id: "sky-forest",
        name: "SKY FOREST",
        tagline: "Surveillance environnementale & déforestation",
        description: "Système de surveillance spatiale des forêts pour le suivi des pressions, la protection et le reporting environnemental.",
        fullDescription: "SKY FOREST permet de monitorer l'état de santé des forêts, de détecter les coupes illégales dès les premiers hectares et de calculer les stocks de carbone.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        color: "accent",
        features: [
            { title: "Détection de Déforestation", desc: "Alertes quasi temps-réel sur les coupes rases." },
            { title: "Indice Végétal", desc: "Analyse de la santé de la biomasse via NDVI." }
        ],
        useCases: [
            { title: "Environnement", icon: "Leaf", desc: "Protection des aires protégées et lutte contre la déforestation." },
            { title: "Carbone", desc: "Mesure de la séquestration et audit de projets carbone." }
        ],
        specifications: ["Algorithmes : Machine Learning", "Source : Multispectral", "Livrable : Rapports mensuels"]
      },
      {
        id: "sky-fish",
        name: "SKY FISH",
        tagline: "Surveillance maritime & sécurité halieutique",
        description: "Système d'observation maritime dédié à la veille des zones économiques exclusives.",
        fullDescription: "SKY FISH combine l'imagerie satellite et les données AIS pour surveiller les activités de pêche et détecter les navires non coopératifs en pleine mer.",
        image: "https://img.freepik.com/free-photo/overhead-shot-wooden-dock-coast-with-fishing-boat-it_181624-2013.jpg",
        color: "primary",
        features: [
            { title: "Détection de 'Dark Targets'", desc: "Identification de navires sans AIS actif." },
            { title: "Suivi des navires", desc: "Historique de trajectoire et détection de transferts en mer." }
        ],
        useCases: [
            { title: "Pêche", icon: "Anchor", desc: "Lutte contre la pêche illégale (IUU)." },
            { title: "Protection Marine", desc: "Surveillance des aires marines protégées." }
        ],
        specifications: ["Fusion de données : AIS + SAR", "Vitesse : Détection temps réel", "Zone : ZEE mondiales"]
      },
      {
        id: "sky-cadastre",
        name: "SKY CADASTRE",
        tagline: "Gouvernance foncière & aménagement",
        description: "Système de détection de changement d'occupation du sol pour la planification urbaine.",
        fullDescription: "SKY CADASTRE accompagne les administrations dans la modernisation de leur gestion foncière en identifiant automatiquement les évolutions de l'occupation du sol.",
        image: "https://img.freepik.com/free-photo/cultivated-field-from_158595-6241.jpg",
        color: "secondary",
        features: [
            { title: "Classification du sol", desc: "Cartographie automatique des surfaces bâties et naturelles." },
            { title: "Mise à jour foncière", desc: "Aide à la révision des rôles fiscaux par analyse d'image." }
        ],
        useCases: [
            { title: "Gouvernance", icon: "Map", desc: "Gestion patrimoniale de l'État." },
            { title: "Fiscalité", desc: "Optimisation des recettes foncières locales." }
        ],
        specifications: ["Techno : Segmentation sémantique", "Échelle : Territoriale", "Format : SIG compatible"]
      },
      {
        id: "sky-transport",
        name: "SKY TRANSPORT",
        tagline: "Mobilité urbaine & planification d'infrastructures",
        description: "Système de gestion et d'analyse du transport urbain et routier par satellite.",
        fullDescription: "SKY TRANSPORT analyse les flux de circulation et l'état des infrastructures routières pour optimiser les plans de mobilité urbaine.",
        image: "https://images.unsplash.com/photo-1506751470038-e579eb91f580",
        color: "accent",
        features: [
            { title: "Comptage de véhicules", desc: "Analyse statistique du trafic par segment routier." },
            { title: "Audit d'infrastructure", desc: "Détection automatique de dégradations sur le réseau." }
        ],
        useCases: [
            { title: "Mobilité", icon: "Truck", desc: "Planification des transports en commun." },
            { title: "Maintenance", desc: "Priorisation des travaux routiers." }
        ],
        specifications: ["IA : Détection d'objets rapide", "Précision : Haute résolution optique", "Fréquence : A la demande"]
      }
    ];

    for (const prod of products) {
      await prisma.product.create({ data: prod });
    }

    const sections = [
        // --- INDEX ---
        {
          name: 'Héro Section', type: 'hero', pageId: 'index',
          content: {
            tagline: "Connectez-vous au monde avec les satellites",
            description: "ONE SKY opère une constellation de satellites pour fournir des données souveraines et stratégiques.",
            ctaText: "Découvrir nos solutions",
            videoUrl: "https://res.cloudinary.com/dla8r1gxi/video/upload/v1769787946/banner_zzz79v.mp4"
          }
        },
        {
          name: 'Services Section', type: 'services', pageId: 'index',
          content: {
            title: "Des solutions de pointe pour l'économie spatiale",
            subtitle: "Notre Expertise",
            description: "ONE SKY intègre l'ensemble de la chaîne de valeur : infrastructure, données et intelligence."
          }
        },
        {
          name: 'Statistiques', type: 'stats', pageId: 'index',
          content: {
            items: [
                { label: "Données Géospatiales", value: "99.9%" },
                { label: "Satellite en orbite", value: "24/7" },
                { label: "Précision", value: "<1m" }
            ]
          }
        },

        // --- DATASAT ---
        {
            name: "Bannière DataSAT", type: "banner", pageId: "datasat",
            content: {
                title: "DataSAT Intelligence",
                subtitle: "Observation Terrestre & Analytics",
                description: "La capacité souveraine de transformer le flux spatial en aide à la décision opérationnelle."
            }
        },
        {
            name: "Présentation DataSAT", type: "presentation", pageId: "datasat",
            content: {
                title: "Production d'intelligence spatiale",
                description: "DataSAT est notre plateforme d'intelligence géospatiale, conçue pour ingérer des flux de données multidimensionnels (Optique, SAR, IoT) et en extraire de la valeur immédiate.",
                imageUrl: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1200",
                bullets: ["Télédétection automatisée", "Deep Learning propriétaire", "Mise à jour hebdomadaire", "Dashboards interactifs"],
                delivrables: [
                    "Rapports de surveillance automatique",
                    "Flux de données API (GeoJSON, TIFF)",
                    "Alertes temps réel par zone d'intérêt",
                    "Analyses comparatives temporelles"
                ]
            }
        },
        {
            name: "Piliers DataSAT", type: "piliers", pageId: "datasat",
            content: {
                items: [
                    { title: "Acquisition", desc: "Pilotage direct de la constellation pour des prises de vue prioritaires." },
                    { title: "Processing", desc: "Orthorectification et calibration automatique des capteurs." },
                    { title: "Extraction", desc: "Algorithmes de détection d'objets et de changements par IA." },
                    { title: "Visualisation", desc: "Interface cartographique intuitive pour l'aide à la décision." }
                ]
            }
        },
        {
            name: "Domaines DataSAT", type: "domains", pageId: "datasat",
            content: {
                items: [
                    { title: "Urbanisme & Fiscalité", icon: "Building", description: "Suivez l'évolution des constructions et détectez les changements fonciers.", capacites: ["Détection de dalles", "Suivi de chantier", "Cadastre 2.0"] },
                    { title: "Agriculture de Précision", icon: "Leaf", description: "Optimisez les rendements par le suivi de l'indice végétal et de l'humidité.", capacites: ["Santé des cultures", "Stress hydrique", "Prédiction récolte"] },
                    { title: "Environnement", icon: "Zap", description: "Luttez contre la déforestation et surveillez les zones protégées.", capacites: ["Alerte déforestation", "Niveaux d'eau", "Pollution"] }
                ]
            }
        },
        {
          name: "Livrables Catalogue", type: "livrables", pageId: "datasat",
          content: {
            items: [
              { title: "Dashboards Dynamiques", icon: "LayoutDashboard", description: "Visualisez vos KPI en temps réel.", details: ["Accès Web/Mobile", "Filtrage temporel"] },
              { title: "Rapports PDF Expert", icon: "FileText", description: "Validation humaine sur demande.", details: ["Certification expert", "Livraison 24h"] }
            ]
          }
        },

        // --- TECHNOLOGY ---
        {
            name: "Bannière Technologie", type: "banner", pageId: "technology",
            content: {
                title: "L'Infrastructure Orbitale",
                subtitle: "Technologie de Maillage",
                description: "Une constellation innovante reliant l'espace et la terre de manière ultra-fast."
            }
        },
        {
            name: "Infrastructures Spatiales", type: "infra", pageId: "technology",
            content: {
                title: "Capacités Segment Sol & Vol",
                description: "ONE SKY développe ses propres satellites de micro-transmissions et d'observation haute résolution.",
                imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000",
                features: [
                    { title: "Constellation GNOSSOS", desc: "12 satellites en orbite basse assurant une revisite mondiale." },
                    { title: "Stations Sol (Ground Segment)", desc: "Réseau mondial de réception pour une latence minimale." },
                    { title: "AI on-board", desc: "Prétraitement des données directement sur le satellite." },
                    { title: "Sûreté Orbitale", desc: "Protection active contre les cyber-attaques spatiales." }
                ]
            }
        },
        {
            name: "Constellation ONE SKY", type: "constellation", pageId: "technology",
            content: {
                title: "Le Cœur du Réseau",
                description: "Architecture hybride combinant transmission laser et RF.",
                cards: [
                    { title: "GNOSSOS-A", subtitle: "Souveraineté Vision", description: "Imagerie Très Haute Résolution (30cm GSD).", icon: "Globe", items: ["Vision 3D", "Spectre élargi"] },
                    { title: "SKY-3 Connect", subtitle: "Laser Mesh", description: "Relais de données spatiales haute vélocité.", icon: "Radio", items: ["Latence < 50ms", "Maillage dynamique"] }
                ]
            }
        },
        {
          name: "Chaîne de Valeur", type: "chain", pageId: "technology",
          content: {
            title: "Processus d'Intelligence",
            description: "Du photon à l'action.",
            imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=2000",
            items: [
              { title: "Acquisition", items: ["Programmation capteur", "Réception Ground Station"] },
              { title: "Extraction", items: ["Deep Learning OCR", "Vectorisation auto"] },
              { title: "Analyse", items: ["Logic métier", "Aide à la décision"] },
              { title: "Diffusion", items: ["Portail client", "Webhooks / API"] }
            ]
          }
        },
        {
          name: "Qualité & Sécurité", type: "quality", pageId: "technology",
          content: {
            left: { title: "Normes Spatiales", items: ["ISO 9001 (Qualité)", "Directive Souveraineté"] },
            right: { title: "Cyber-Défense", items: ["Encryption AES-512", "Hardware Security Module"] }
          }
        },
        {
          name: "Standards & Formats", type: "standards", pageId: "technology",
          content: {
            items: [
              { category: "Images", items: ["Cloud Optimized GeoTIFF", "JPEG2000"] },
              { category: "Vecteurs", items: ["GeoJSON", "Shapefile", "PostgreSQL"] }
            ]
          }
        },
        {
          name: "Intégrations", type: "integrations", pageId: "technology",
          content: {
            items: ["ArcGIS / ESRI Connect", "QGIS Open-Source", "Google Earth Engine", "SAP / Salesforce API"]
          }
        },

        // --- SOLUTIONS ---
        {
            name: "Bannière Solutions", type: "banner", pageId: "solutions",
            content: {
                title: "Espace & Solutions",
                subtitle: "Expertises sectorielles",
                description: "Un catalogue de services modulaires pour chaque besoin métier."
            }
        },
        {
          name: "Vue d'ensemble Solutions", type: "overview", pageId: "solutions",
          content: {
            title: "Verticales Métiers",
            description: "Nos solutions sont adaptées aux contraintes spécifiques de chaque industrie."
          }
        },
        {
          name: "Services Catalogue", type: "services_cat", pageId: "solutions",
          content: {
            items: [
                { title: "Surveillance d'Actifs", icon: "Eye", description: "Protégez vos infrastructures critiques à distance.", details: "Surveillance 24/7", examples: "Oléoducs, lignes HT, mines" },
                { title: "Intelligence Économique", icon: "BarChart3", description: "Anticipez les marchés par l'observation des flux.", details: "Analyse prédictive", examples: "Ports, parkings, stocks" },
                { title: "Souveraineté Territoriale", icon: "Shield", description: "Gestion des frontières et intégrité du sol.", details: "Surveillance étatique", examples: "Zones isolées, parcs nationaux" }
            ]
          }
        },
        {
          name: "Secteurs", type: "secteurs", pageId: "solutions",
          content: {
            items: [
              { 
                title: "Énergie & Mining", icon: "Factory", description: "Suivez vos gisements et infrastructures partout sur le globe.",
                enjeux: ["Impact environnemental", "Sécurité des pipelines"],
                apports: ["Alertes fuites", "Métré de stock (volumes 3D)"]
              },
              { 
                title: "Grandes Entreprises", icon: "Briefcase", description: "Optimisez votre supply-chain par satellite.",
                enjeux: ["Gestion logistique", "Continuité d'activité"],
                apports: ["Suivi flotte (IoT/Sat)", "Analyse congestion ports"]
              }
            ]
          }
        },
        {
          name: "Parcours Projet", type: "parcours", pageId: "solutions",
          content: {
            subtitle: "De l'idée à l'orbite",
            description: "Un cycle d'accompagnement complet pour sécuriser vos investissements géospatiaux.",
            items: [
              { step: "01", title: "Cadrage", description: "Définition des KPI et de la zone d'intérêt." },
              { step: "02", title: "POC", description: "Preuve de concept sur données historiques." },
              { step: "03", title: "Audit", description: "Validation de la précision algorithmique." },
              { step: "04", title: "Déploiement", description: "Intégration API dans vos systèmes." }
            ]
          }
        }
    ];

    for (const section of sections) {
        await prisma.section.create({ data: section });
    }

    console.log('✅ Base de données initialisée avec 6 produits et contenus riches.');
    console.log('\n🚀 FULL SEED COMPLETE !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding complet :', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullSeed();
