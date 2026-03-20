const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedContent() {
  try {
    // 1. Pages
    const pages = [
      { id: 'index', title: 'Accueil' },
      { id: 'about', title: 'À Propos' },
      { id: 'technology', title: 'Technologie' },
      { id: 'solutions', title: 'Solutions' },
      { id: 'datasat', title: 'DataSAT' },
      { id: 'contact', title: 'Contact' },
      { id: 'news', title: 'Actualités' },
      { id: 'privacy', title: 'Confidentialité' },
      { id: 'legal', title: 'Mentions Légales' }
    ];

    // On vide les sections existantes pour repartir sur une base propre conforme au nouveau seed
    await prisma.section.deleteMany({});

    for (const page of pages) {
      await prisma.page.upsert({
        where: { id: page.id },
        update: { title: page.title },
        create: { id: page.id, title: page.title }
      });
    }

    // 2. Sections - Index
    const indexSections = [
      {
        id: 'idx_hero',
        name: 'Héro Section',
        type: 'hero',
        pageId: 'index',
        content: {
          tagline: "Connectez-vous au monde avec les satellites",
          description: "ONE SKY opère une constellation de satellites pour fournir des données souveraines et stratégiques.",
          ctaText: "Découvrir nos solutions",
          videoUrl: "https://res.cloudinary.com/dla8r1gxi/video/upload/v1769787946/banner_zzz79v.mp4"
        }
      },
      {
        id: 'idx_services',
        name: 'Services Section',
        type: 'services',
        pageId: 'index',
        content: {
          title: "Des solutions de pointe pour l'économie spatiale",
          subtitle: "Notre Expertise",
          description: "ONE SKY intègre l'ensemble de la chaîne de valeur : infrastructure, données et intelligence."
        }
      },
      {
          id: 'idx_stats',
          name: 'Statistiques',
          type: 'stats',
          pageId: 'index',
          content: {
              items: [
                  { label: "Données Géospatiales", value: "99.9%" },
                  { label: "Satellite en orbite", value: "24/7" },
                  { label: "Précision", value: "<1m" }
              ]
          }
      }
    ];

    // 3. Sections - Technology
    const techSections = [
        {
            id: 'tech_banner',
            name: 'Bannière Technologie',
            type: 'banner',
            pageId: 'technology',
            content: {
                title: "Technologie",
                subtitle: "Nos capacités",
                description: "Infrastructures spatiales, chaîne de valeur et plateforme d'interopérabilité"
            }
        },
        {
            id: 'tech_infra',
            name: 'Infrastructures Spatiales',
            type: 'content-image',
            pageId: 'technology',
            content: {
                title: "Infrastructures spatiales",
                description: "ONE SKY conçoit et exploite des capacités satellitaires en orbite basse (LEO), permettant des acquisitions régulières et adaptées aux priorités opérationnelles.",
                imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
                features: [
                  { title: "Continuité de service", desc: "Disponibilité permanente des capacités" },
                  { title: "Montée en charge", desc: "Extension progressive des services" },
                  { title: "Flexibilité", desc: "Acquisition selon zones d'intérêt et criticité" },
                  { title: "Évolution", desc: "Capacité d'adaptation et d'amélioration" }
                ]
            }
        },
        {
            id: 'tech_constellation',
            name: 'Constellation ONE SKY',
            type: 'dual-cards',
            pageId: 'technology',
            content: {
                title: "Constellation ONE SKY",
                description: "La constellation ONE SKY s'appuie sur des actifs complémentaires, combinant transmission et observation.",
                cards: [
                    {
                        title: "SKY 1 & SKY 2",
                        subtitle: "Communication & Transmission",
                        description: "SKY 1 et SKY 2 sont optimisés pour la communication et la transmission sécurisée de données en orbite basse (LEO).",
                        icon: "Radio",
                        items: [
                          "Satellites en orbite basse (LEO)",
                          "Communication et transmission sécurisée de données",
                          "Architecture de constellation évolutive",
                          "Renforcement de la continuité opérationnelle"
                        ]
                    },
                    {
                        title: "SKY 3",
                        subtitle: "Observation de la Terre",
                        description: "SKY 3 est dédié à la télédétection et à l'imagerie satellitaire, offrant une lecture objective des territoires.",
                        icon: "Globe",
                        items: [
                          "Acquisitions régulières et programmables",
                          "Suivi multi-temporel des territoires",
                          "Couverture à grande échelle",
                          "Alimentation d'analyses géospatiales avancées"
                        ]
                    }
                ]
            }
        },
        {
            id: 'tech_chain',
            name: 'Chaîne de Valeur',
            type: 'steps',
            pageId: 'technology',
            content: {
                title: "Chaîne de valeur de la donnée",
                description: "ONE SKY intervient sur l'ensemble de la chaîne : Acquisition → Traitement → Analyse → Diffusion",
                imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=2000",
                items: [
                    {
                        title: "Acquisition",
                        items: ["Définition des besoins", "Planification acquisitions", "Organisation flux"]
                    },
                    {
                        title: "Traitement",
                        items: ["Préparation normalisation", "Harmonisation multi-temps", "Couches thématiques"]
                    },
                    {
                        title: "Analyse",
                        items: ["Extraction infos", "Calcul indicateurs/KPI", "Détection changements"]
                    },
                    {
                        title: "Diffusion",
                        items: ["Dashboard/reports", "API intégration", "Gouvernance accès"]
                    }
                ]
            }
        },
        {
            id: 'tech_quality',
            name: 'Qualité & Sécurité',
            type: 'dual-list',
            pageId: 'technology',
            content: {
                left: {
                    title: "Qualité & traçabilité",
                    icon: "Shield",
                    items: [
                      "Contrôle qualité des données",
                      "Documentation des indicateurs",
                      "Gestion des versions",
                      "Cohérence temporelle"
                    ]
                },
                right: {
                    title: "Sécurité & API",
                    icon: "FileCode",
                    items: [
                      "Gestion des accès (RBAC)",
                      "Diffusion maîtrisée",
                      "Interfaces intégration standards",
                      "Adaptation contraintes SI"
                    ]
                }
            }
        },
        {
            id: 'tech_standards',
            name: 'Standards & Formats',
            type: 'list',
            pageId: 'technology',
            content: {
                items: [
                    { category: "Formats SIG", items: ["GeoJSON", "Shapefile", "GeoTIFF"] },
                    { category: "Services web", items: ["WMS/WFS", "Tuiles", "Catalogues"] },
                    { category: "Données & API", items: ["JSON", "CSV", "STAC", "Documentation"] }
                ]
            }
        },
        {
            id: 'tech_integrations',
            name: 'Intégrations',
            type: 'list',
            pageId: 'technology',
            content: {
                items: [
                    "Portails institutionnels (cartographie, dashboard)",
                    "SIG existants (consultation, couches, exports)",
                    "Plateformes data (data lake / warehouse)",
                    "Applications métiers (via API)"
                ]
            }
        }
    ];

    // 4. Sections - About
    const aboutSections = [
        {
            id: 'about_banner',
            name: 'Bannière À Propos',
            type: 'banner',
            pageId: 'about',
            content: {
                title: "À propos de ONE SKY",
                subtitle: "Notre histoire",
                description: "Plateforme internationale de technologie spatiale & données géospatiales"
            }
        },
        {
            id: 'about_vision',
            name: 'Vision',
            type: 'vision',
            pageId: 'about',
            content: {
                title: "Vision",
                tagline: "Observer la planète pour permettre au monde de décider mieux, plus vite et durablement.",
                description: "ONE SKY vise à faire de l'observation de la Terre un levier concret de gouvernance, de résilience et de développement.",
                imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1200"
            }
        },
        {
            id: 'about_mission',
            name: 'Mission',
            type: 'mission',
            pageId: 'about',
            content: {
                title: "Mission",
                description: "La mission de ONE SKY est de concevoir et d'exploiter des capacités spatiales en orbite basse (LEO) et de transformer les données satellitaires en intelligence géospatiale utile aux décideurs publics et privés.",
                cardTitle: "Notre finalité",
                cardContent: "Renforcer la connaissance des territoires, accélérer la prise de décision, améliorer l'anticipation des risques et soutenir des stratégies industrielles fondées sur la preuve.",
                imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200"
            }
        },
        {
            id: 'about_competences',
            name: 'Compétences Équipe',
            type: 'list',
            pageId: 'about',
            content: {
                title: "Nos compétences",
                items: [
                    "Opérations spatiales et exploitation",
                    "Ingénierie data, SIG et géomatique",
                    "Intelligence artificielle et analytics",
                    "Cybersécurité, gouvernance des données et intégration SI",
                    "Gestion de projets et partenariats institutionnels"
                ]
            }
        },
        {
            id: 'about_engagements',
            name: 'Nos Engagements',
            type: 'grid',
            pageId: 'about',
            content: {
                qualite: [
                  "Processus industrialisés et contrôles qualité à chaque étape",
                  "Indicateurs documentés (méthode, périmètre, limites, version)",
                  "Cohérence des séries temporelles et comparabilité des résultats"
                ],
                securite: [
                  "Gestion des accès par rôles, segmentation des environnements",
                  "Journalisation et traçabilité des actions",
                  "Diffusion maîtrisée (exports / API), intégrité des livrables",
                  "Approche \"security by design\" sur la plateforme et les interfaces"
                ],
                durabilite: [
                  "Solutions orientées résilience territoriale et planification long terme",
                  "Indicateurs adaptés au suivi d'impact des programmes et investissements",
                  "Démarche d'usage responsable de la donnée"
                ]
            }
        },
        {
            id: 'about_partenariats',
            name: 'Partenariats Types',
            type: 'cards_list',
            pageId: 'about',
            content: {
                title: "Partenariats",
                description: "Coopérer pour industrialiser l'observation et démultiplier l'impact.",
                items: [
                    {
                      title: "Institutionnels",
                      description: "Programmes, agences, coopérations avec États, observatoires, plateformes nationales",
                      benefits: [
                        "Renforcer la capacité d'observation et de pilotage",
                        "Harmoniser les indicateurs",
                        "Assurer transfert de méthodes et durabilité"
                      ]
                    },
                    {
                      title: "Technologiques",
                      description: "Partenariats avec acteurs cloud, SIG, data platforms, IA, télécoms et intégrateurs",
                      benefits: [
                        "Accélérer l'intégration SI",
                        "Renforcer performance et sécurité",
                        "Garantir l'interopérabilité"
                      ]
                    },
                    {
                      title: "Déploiement",
                      description: "Intégrateurs, opérateurs sectoriels, partenaires terrain",
                      benefits: [
                        "Méthodes, indicateurs, pipelines et gouvernance",
                        "Standardisation des livrables et interopérabilité",
                        "Accélération du passage pilote → production"
                      ]
                    }
                ]
            }
        }
    ];

    // 5. Sections - Solutions
    const solutionsSections = [
        {
            id: 'solutions_banner',
            name: 'Bannière Solutions',
            type: 'banner',
            pageId: 'solutions',
            content: {
                title: "Solutions",
                subtitle: "Nos offres",
                description: "Un catalogue de services modulaires, activables par priorité"
            }
        },
        {
            id: 'solutions_overview',
            name: "Vue d'ensemble Solutions",
            type: 'overview',
            pageId: 'solutions',
            content: {
                title: "Vue d'ensemble",
                description: "Des services conçus pour transformer la donnée satellitaire en intelligence décisionnelle."
            }
        },
        {
            id: 'solutions_services',
            name: 'Services Catalogue',
            type: 'grid',
            pageId: 'solutions',
            content: {
                items: [
                    {
                      title: "Observation & monitoring",
                      description: "Services de monitoring territorial et sectoriel permettant de suivre l'évolution des zones d'intérêt.",
                      details: "Objectif : fournir une connaissance actualisée, exploitable, et orientée opération.",
                      examples: "Cartes de suivi, synthèses périodiques, comparaisons temporelles.",
                      icon: "Eye"
                    },
                    {
                      title: "Analyses & indicateurs",
                      description: "Indicateurs décisionnels et analyses thématiques adaptés aux enjeux des pouvoirs publics et des industries critiques.",
                      details: "Tendances, dynamiques, comparaisons, seuils.",
                      examples: "KPI compréhensibles, robustes, et mobilisables pour le pilotage.",
                      icon: "BarChart3"
                    },
                    {
                      title: "Alertes & veille opérationnelle",
                      description: "Mécanismes d'alerte et de veille permettant la détection d'événements et l'activation de réponses opérationnelles.",
                      details: "Paramétrées selon : zone, seuils, fréquence et criticité.",
                      examples: "Alertes en temps réel, notifications configurables.",
                      icon: "Bell"
                    },
                    {
                      title: "Tableaux de bord & reporting",
                      description: "Visualisation claire et hiérarchisée : synthèses, cartes, indicateurs, tendances, export et reporting.",
                      details: "Conçus pour le pilotage stratégique, le suivi de programmes, la coordination multi-acteurs.",
                      examples: "Dashboards interactifs, rapports automatisés.",
                      icon: "LayoutDashboard"
                    },
                    {
                      title: "APIs & intégration SI",
                      description: "Interfaces d'intégration pour exploiter les résultats dans les outils existants.",
                      details: "SIG, portails, applications métiers, plateformes data.",
                      examples: "Interopérabilité, sécurité et gouvernance des accès.",
                      icon: "FileCode"
                    }
                ]
            }
        },
        {
            id: 'solutions_sectors',
            name: 'Secteurs',
            type: 'list_with_details',
            pageId: 'solutions',
            content: {
                items: [
                   { 
                     title: "Gouvernements & Institutions", 
                     description: "Accompagnement des autorités publiques dans la planification, le suivi des politiques publiques, la gestion des risques et la protection des ressources.",
                     enjeux: [
                        "Planification, suivi des politiques publiques",
                        "Gestion des risques",
                        "Surveillance et protection des ressources",
                        "Pilotage d'investissements et infrastructures"
                     ],
                     apports: [
                        "Information objective et actualisée",
                        "Indicateurs comparables et documentés",
                        "Outils de reporting pour comités",
                        "Intégration aux SIG et SI institutionnels"
                     ],
                     icon: "Building2"
                   },
                   { 
                     title: "Organisations internationales", 
                     description: "Contribution aux programmes de développement, de résilience et de suivi d'impact, avec des données et indicateurs comparables à l'échelle multi-pays.",
                     enjeux: [
                        "Suivi de programmes multi-pays",
                        "Évaluation d'impact",
                        "Harmonisation d'indicateurs",
                        "Reporting standardisé"
                     ],
                     apports: [
                        "Méthodes reproductibles",
                        "Comparabilité",
                        "Livrables structurés (rapport/dashboards)",
                        "Gouvernance et documentation"
                     ],
                     icon: "Globe"
                   },
                   {
                     title: "Industries & infrastructures critiques",
                     description: "Services de monitoring et d'analyse destinés aux opérateurs d'infrastructures et industries critiques.",
                     enjeux: [
                        "Continuité d'activité",
                        "Gestion des emprises et actifs",
                        "Conformité et monitoring",
                        "Risques et résilience"
                     ],
                     apports: [
                        "Monitoring régulier",
                        "Alertes",
                        "Intégration outils métiers",
                        "Reporting et traçabilité"
                     ],
                     icon: "Factory"
                   }
                ]
            }
        },
        {
            id: 'solutions_parcours',
            name: 'Parcours Projet',
            type: 'parcours',
            pageId: 'solutions',
            content: {
                subtitle: "Un accompagnement de bout en bout",
                description: "De l'expression de besoin jusqu'à l'exploitation quotidienne.",
                items: [
                    { step: "1", title: "Étude & cadrage", description: "Besoins, indicateurs, gouvernance, périmètre." },
                    { step: "2", title: "POC / Démonstration", description: "Zone pilote, validation des résultats." },
                    { step: "3", title: "Industrialisation", description: "Automatisation, qualité, sécurité, intégration." },
                    { step: "4", title: "Exploitation / Monitoring", description: "Alertes, reporting et amélioration continue." }
                ]
            }
        }
    ];

    // 6. Sections - DataSAT
    const datasatSections = [
        {
            id: 'datasat_banner',
            name: 'Bannière DataSAT',
            type: 'banner',
            pageId: 'datasat',
            content: {
                title: "DataSAT",
                subtitle: "Intelligence géospatiale",
                description: "L'intelligence géospatiale au service de la décision. DataSAT transforme la donnée satellitaire en informations immédiatement exploitables."
            }
        },
        {
            id: 'datasat_presentation',
            name: 'Présentation DataSAT',
            type: 'presentation',
            pageId: 'datasat',
            content: {
                title: "Une capacité complète de production d'intelligence",
                description: "DataSAT n'est pas une simple couche d'analyse. C'est une capacité complète permettant de transformer le flux spatial en aide à la décision.",
                imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200",
                bullets: [
                  "Structurer et fiabiliser la donnée",
                  "Appliquer des modèles analytiques & IA",
                  "Produire des résultats actionnables",
                  "Diffuser via Dashboards et APIs sécurisées"
                ],
                delivrables: [
                  "Indicateurs / KPI documentés (définition, méthode, périmètre, limites)",
                  "Alertes paramétrables (zone, seuils, criticité, fréquence) avec preuve et traçabilité",
                  "Tableaux de bord décisionnels (exécutif) et techniques (analyse)",
                  "Rapports & cartographies thématiques (synthèse + annexes)",
                  "APIs pour intégration SI (portails, SIG, data platforms, applications métiers)"
                ]
            }
        },
        {
            id: 'datasat_piliers',
            name: 'Piliers DataSAT',
            type: 'grid',
            pageId: 'datasat',
            content: {
                items: [
                    { title: "Analytics & IA géospatiale", desc: "Détection de changements, tendances, scoring" },
                    { title: "Data engineering", desc: "Structuration, normalisation, qualité, versioning" },
                    { title: "Gouvernance", desc: "Documentation, traçabilité, validation métier" },
                    { title: "Delivery", desc: "Dashboards, rapports, exports, APIs, intégration SI" }
                ]
            }
        },
        {
            id: 'datasat_domains',
            name: 'Domaines DataSAT',
            type: 'grid_detailed',
            pageId: 'datasat',
            content: {
                items: [
                  {
                    icon: "Leaf",
                    title: "Environnement & Climat",
                    description: "Suivi d'évolutions, pression sur les ressources, analyse d'impacts et reporting environnemental.",
                    capacites: [
                      "Suivi d'évolution des milieux (forêts, zones humides, littoral)",
                      "Analyse des pressions : dégradation, fragmentation, artificialisation",
                      "Suivi d'impacts liés aux événements climatiques"
                    ]
                  },
                  {
                    icon: "Wheat",
                    title: "Agriculture & Sécurité alimentaire",
                    description: "Monitoring multi-temporel, tendances, appui à la planification et aux programmes agricoles.",
                    capacites: [
                      "Monitoring multi-temporel des zones agricoles",
                      "Appui à la planification : zonage, priorisation",
                      "Suivi de risques : stress hydrique, sécheresse, inondation"
                    ]
                  },
                  {
                    icon: "Building",
                    title: "Urbanisation & Infrastructures",
                    description: "Occupation du sol, expansion urbaine, planification, suivi d'ouvrages et d'emprises.",
                    capacites: [
                      "Occupation du sol & artificialisation",
                      "Suivi d'emprises et d'ouvrages",
                      "Appui à la planification et au zonage"
                    ]
                  }
                ]
            }
        },
        {
            id: 'datasat_livrables',
            name: 'Livrables Catalogue',
            type: 'grid_icons',
            pageId: 'datasat',
            content: {
              items: [
                {
                  icon: "BarChart3",
                  title: "Indicateurs / KPI",
                  description: "Des indicateurs décisionnels robustes, documentés et comparables dans le temps.",
                  details: ["KPI documentés", "Comparabilité temporelle", "Granularité adaptable", "Traçabilité"]
                },
                {
                  icon: "Bell",
                  title: "Alertes & détection",
                  description: "Des alertes paramétrables pour détecter, qualifier et déclencher une action.",
                  details: ["Zone et périmètre (AOI)", "Règles configurables", "Preuve & contexte", "Notifications"]
                },
                {
                  icon: "LayoutDashboard",
                  title: "Tableaux de bord",
                  description: "Une visualisation claire, hiérarchisée et orientée pilotage.",
                  details: ["KPIs avec tendances", "Cartographie interactive", "Centre d'alertes", "Exports PDF/CSV"]
                }
              ]
            }
        }
    ];

    // 7. Sections - Contact
    const contactSections = [
        {
            id: 'contact_banner',
            name: 'Bannière Contact',
            type: 'banner',
            pageId: 'contact',
            content: {
                title: "Contact",
                subtitle: "Restons connectés",
                description: "Nos équipes vous proposeront un échange de cadrage et un plan de mise en œuvre adapté."
            }
        }
    ];

    // 8. Products Seeding
    const products = [
      {
        id: "sky-loupe",
        name: "SKY LOUPE",
        tagline: "Suivi des constructions & contrôle des permis",
        description: "Plateforme de télédétection dédiée au suivi des constructions et au contrôle des permis de construire.",
        fullDescription: "SKY LOUPE est notre solution phare pour la surveillance urbaine et le contrôle foncier. En combinant l'imagerie très haute résolution et des algorithmes de détection de changements par Deep Learning, SKY LOUPE permet aux autorités de suivre l'évolution des constructions en temps réel et de vérifier leur conformité avec les permis délivrés.",
        image: "https://img.freepik.com/free-photo/palace-china_1127-4067.jpg",
        color: "primary",
        features: [
            { title: "Détection automatique", desc: "Identification instantanée des nouvelles dalles, murs et toitures." },
            { title: "Superposition Cadastrale", desc: "Comparaison directe entre l'image satellite et le plan cadastral." },
            { title: "Historique temporel", desc: "Séquence chronologique de l'évolution de chaque chantier." },
        ],
        useCases: [
            { title: "Urbanisme", desc: "Identifier les constructions sans permis ou non conformes." },
            { title: "Fiscalité", desc: "Mise à jour des bases de données fiscales foncières." },
            { title: "Planification", desc: "Suivre le rythme d'urbanisation des quartiers." },
        ],
        specifications: [
            "Résolution : 30cm à 50cm",
            "Fréquence : Hebdomadaire ou Mensuelle",
            "Format : Dashboard interactif & Flux WMS/WMTS",
            "Indicateurs : Surface bâtie, état d'avancement, conformité"
        ]
      },
      {
        id: "sky-sentinel",
        name: "SKY SENTINEL",
        tagline: "Gestion des frontières & veille territoriale",
        description: "Système d'observation satellitaire pour la sécurité territoriale et la coordination opérationnelle.",
        fullDescription: "SKY SENTINEL offre une vision stratégique globale pour la gestion des frontières et des zones sensibles. Grâce à l'analyse multi-capteurs (Optique & Radar), la plateforme détecte les activités inhabituelles, les nouvelles pistes ou les mouvements suspects, permettant une réponse rapide des forces de sécurité.",
        image: "https://img.freepik.com/free-photo/aerial-shot-beautiful-green-hills-curvy-road-going-along-edge-amazing-sea_181624-2332.jpg",
        color: "secondary",
        features: [
            { title: "Monitoring Frontalier", desc: "Surveillance continue des zones reculées et difficiles d'accès." },
            { title: "Multi-capteurs", desc: "Fusion de données optiques et radar pour voir de jour comme de nuit." },
            { title: "Alertes Stratégiques", desc: "Notification en cas d'ouverture de piste ou campement illégal." },
        ],
        useCases: [
            { title: "Défense", desc: "Veille stratégique sur les zones frontalières." },
            { title: "Sécurité Intérieure", desc: "Lutte contre l'immigration clandestine et les trafics." },
            { title: "Protection", desc: "Sécurisation des sites sensibles et isolés." },
        ],
        specifications: [
            "Capteurs : Optique THR et Radar (SAR)",
            "Fréquence : Multi-passages quotidiens",
            "Analyse : Détection d'objets (véhicules, tentes, tracks)",
            "Communication : Rapports de situation sécurisés"
        ]
      },
      {
        id: "sky-forest",
        name: "SKY FOREST",
        tagline: "Surveillance environnementale & déforestation",
        description: "Système de surveillance spatiale des forêts pour le suivi des pressions, la protection et le reporting environnemental.",
        fullDescription: "SKY FOREST est un outil de gouvernance environnementale puissant. Il permet de monitorer l'état de santé des forêts, de détecter les coupes illégales dès les premiers hectares et de quantifier les programmes de reforestation. C'est l'outil indispensable pour les politiques de crédit carbone et de conservation.",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
        color: "accent",
        features: [
            { title: "Détection de Déforestation", desc: "Alertes quasi temps-réel sur les pertes de couvert forestier." },
            { title: "Indice Végétal", desc: "Analyse de la santé de la biomasse et stress hydrique." },
            { title: "Traçabilité Bois", desc: "Vérification de la provenance légale des exploitations." },
        ],
        useCases: [
            { title: "Environnement", desc: "Protection des aires protégées et parcs nationaux." },
            { title: "Crédit Carbone", desc: "Audit et mesure de la séquestration carbone." },
            { title: "Industrie", desc: "Gérer durablement les concessions forestières." },
        ],
        specifications: [
            "Algorithmes : Changement NDVI et classification IA",
            "Données : Sentinel-2 & Imagerie privée THR",
            "Reporting : Bilan carbone et statistiques de coupe",
            "Alertes : Mobile & Email"
        ]
      },
      {
        id: "sky-fish",
        name: "SKY FISH",
        tagline: "Surveillance maritime & sécurité halieutique",
        description: "Système d'observation maritime dédié à la veille des zones économiques exclusives.",
        fullDescription: "SKY FISH assure la souveraineté maritime en surveillant les Zones Économiques Exclusives (ZEE). En croisant les données AIS (Automatic Identification System) avec la détection radar des navires 'non-coopératifs', SKY FISH identifie la pêche illégale et protège les ressources maritimes.",
        image: "https://img.freepik.com/free-photo/overhead-shot-wooden-dock-coast-with-fishing-boat-it_181624-2013.jpg",
        color: "primary",
        features: [
            { title: "Détection de Navires", desc: "Localisation des bateaux sans AIS via imagerie Radar." },
            { title: "Analyse Comportementale", desc: "Identification des trajectoires de pêche suspectes." },
            { title: "Veille Halieutique", desc: "Suivi des stocks de poissons par zone thermique." },
        ],
        useCases: [
            { title: "Souveraineté", desc: "Contrôle des navires étrangers dans les ZEE." },
            { title: "Écologie", desc: "Protection des réserves marines contre le braconnage." },
            { title: "Économie", desc: "Optimisation de la gestion des ressources de pêche." },
        ],
        specifications: [
            "Technologie : Fusion AIS / Radar (SAR)",
            "Couverture : Large swathe (centaines de km²)",
            "Fréquence : Toutes les 12h-24h",
            "Plateforme : Interface de commandement maritime"
        ]
      },
      {
        id: "sky-cadastre",
        name: "SKY CADASTRE",
        tagline: "Gouvernance foncière & aménagement",
        description: "Système de détection de changement d'occupation du sol pour la planification urbaine.",
        fullDescription: "SKY CADASTRE révolutionne la gestion foncière en fournissant un inventaire exhaustif et actualisé de l'occupation du sol. Il permet de réconcilier les données cadastrales théoriques avec la réalité du terrain observée par satellite, facilitant ainsi la planification urbaine et la sécurisation foncière.",
        image: "https://img.freepik.com/free-photo/cultivated-field-from_158595-6241.jpg",
        color: "secondary",
        features: [
            { title: "Occupation du Sol", desc: "Classification automatique du bâti, végétation, eau, nu." },
            { title: "Audit Foncier", desc: "Identifier les décalages entre titres de propriété et usage." },
            { title: "Planification", desc: "Simuler l'expansion urbaine et les zones d'aménagement." },
        ],
        useCases: [
            { title: "Municipalités", desc: "Gérer l'extension des réseaux et services urbains." },
            { title: "État", desc: "Sécurisation des domaines fonciers nationaux." },
            { title: "Promotion", desc: "Étude de faisabilité et d'impact sur zone vierge." },
        ],
        specifications: [
            "Base de données : SIG Cloud-Native",
            "Échelle : National, Régional, Communal",
            "Output : Vecteurs (SHP/GeoJSON) & Rasters",
            "Interopérabilité : Connecteurs avec outils ministériels"
        ]
      },
      {
        id: "sky-transport",
        name: "SKY TRANSPORT",
        tagline: "Mobilité urbaine & planification d'infrastructures",
        description: "Système de gestion et d'analyse du transport urbain et routier par satellite.",
        fullDescription: "SKY TRANSPORT analyse les flux de mobilité et l'état des infrastructures de transport. En surveillant les axes majeurs et les hubs logistiques, la solution aide les décideurs à optimiser les tracés routiers, à identifier les goulots d'étranglement et à prioriser les travaux de maintenance.",
        image: "https://images.unsplash.com/photo-1506751470038-e579eb91f580",
        color: "accent",
        features: [
            { title: "Comptage de Véhicules", desc: "Estimation des flux de trafic par analyse d'image." },
            { title: "État des Routes", desc: "Détection des dégradations et nids-de-poule (THR)." },
            { title: "Audit Hubs", desc: "Monitoring de l'activité des ports, gares et terminaux." },
        ],
        useCases: [
            { title: "Transport", desc: "Optimisation des schémas directeurs de transport." },
            { title: "Travaux Publics", desc: "Maintenance prédictive des infrastructures routières." },
            { title: "Logistique", desc: "Suivi des temps d'attente aux hubs stratégiques." },
        ],
        specifications: [
            "Objets détectés : Voitures, camions, bus, conteneurs",
            "Précision : > 90% sur la détection d'objets",
            "Temporel : Heures de pointe vs Heures creuses",
            "Visualisation : Cartes de chaleur (Heatmaps) de densité"
        ]
      }
    ];

    for (const prod of products) {
      await prisma.product.upsert({
        where: { id: prod.id },
        update: prod,
        create: prod
      });
    }

    const allSections = [
        ...indexSections,
        ...techSections,
        ...aboutSections,
        ...solutionsSections,
        ...datasatSections,
        ...contactSections
    ];

    for (const section of allSections) {
      await prisma.section.upsert({
        where: {
          pageId_name: {
            pageId: section.pageId,
            name: section.name
          }
        },
        update: {
          type: section.type,
          content: section.content
        },
        create: {
          id: section.id,
          name: section.name,
          type: section.type,
          content: section.content,
          pageId: section.pageId
        }
      });
    }

    console.log('✅ Seeding des contenus et produits terminé !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedContent();
