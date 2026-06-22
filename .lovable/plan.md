## Refonte complète "Traversée Connect" — Plan en 6 phases

Cette refonte est massive (audit + design system + homepage + dashboards + IA + sécurité + SEO + perf + paiements). Je propose de la livrer en **phases approuvables une à une** plutôt que d'un seul bloc, pour garder la qualité et permettre vos retours.

### Phase 1 — Audit & Nettoyage (lecture seule, livré en rapport)
- Inventaire des pages, routes, composants, hooks, dépendances.
- Liste des éléments morts/doublons/composants > 300 lignes à refactoriser.
- Erreurs TypeScript/React détectées.
- Audit Supabase (tables, RLS, index manquants).
- Audit sécurité (rejoue les scanners) + audit SEO (Lighthouse via scan).
- **Livrable** : rapport markdown `AUDIT_REPORT.md` + liste priorisée.

### Phase 2 — Design System unifié
- Tokens dans `index.css` + `tailwind.config.ts` : primary `#0F4C81`, success `#10B981`, neutres modernes.
- Polices Inter (body) + Poppins (display) via Google Fonts.
- Variants shadcn unifiés : Button, Card, Input, Badge, Table, Modal, Toast.
- Refonte composants partagés (`UnifiedForm`, `UnifiedFormField`, etc.) pour consommer les tokens.
- **Note** : la mémoire projet impose `1 EUR = 656 XOF`, devise FCFA, paiement CinetPay — conservés.

### Phase 3 — Homepage + Navigation + Moteur de recherche
- Nouvelle `Hero` avec moteur intégré (départ, destination, date, passagers).
- Sections : Comment ça marche (4 étapes), stats animées, témoignages, logos, FAQ, CTA.
- Page résultats unifiée (cartes modernes) avec filtres avancés (prix, compagnie, dispo).
- Navigation simplifiée (header 2 niveaux conservé selon mémoire).

### Phase 4 — Rôles, Dashboards & Supabase
- Rôles `client | transporteur | agence | admin` via `user_roles` + `has_role()` (déjà en place, à étendre).
- Dashboards spécifiques : Client, Transporteur (trajets/véhicules/revenus), Agence (clients/commissions), Admin (users/paiements/logs/graphiques Recharts).
- Migration Supabase : table `audit_logs`, index manquants, contraintes, RLS renforcée, policies par rôle.

### Phase 5 — IA, Notifications, Sécurité, Paiements
- Edge functions IA modulaires : `ai-travel-advisor`, `ai-support`, `ai-sales`, `ai-admin-reports` (Lovable AI Gateway, Gemini 2.5 Flash, pas de clé requise).
- Notifications centralisées (email Resend déjà OK ; SMS/WhatsApp = stubs si pas de provider — je demanderai).
- Sécurité : rate-limiting edge (déjà partiellement en place), validation Zod systématique, sanitization, centre admin sécurité.
- Paiements : CinetPay déjà fonctionnel — j'ajoute historique, remboursements, rapports financiers, commissions.

### Phase 6 — SEO, Performance, Responsive, Production
- Meta uniques par route, sitemap dynamique, robots, OG, Schema.org `TravelAgency` + `Trip`.
- Lazy loading routes, code splitting, image optim (WebP), preload LCP.
- QA responsive mobile/tablette/desktop.
- Checklist production + structure DB finale + matrice rôles/permissions.

---

### Questions avant de démarrer

1. **Périmètre** : on procède phase par phase (recommandé) ou je lance Phase 1 + 2 + 3 d'affilée ?
2. **Périmètre métier** : aujourd'hui le code mentionne vols/hôtels/trains/voitures (B-Reserve dans la mémoire). Votre brief parle de **traversées / transports terrestres ouest-africains**. Faut-il :
   - (a) **remplacer** complètement vols/hôtels/etc. par un module unique "Traversées" (bus, bateau, taxi-brousse), ou
   - (b) **garder** tous les modules existants + ajouter "Traversées" ?
3. **SMS / WhatsApp** : avez-vous un compte Twilio / Meta WhatsApp Business, ou je laisse des stubs activables plus tard ?
4. **Données réelles transporteurs** : pour les "trajets" affichés, vous avez des **partenaires transporteurs** prêts à fournir leurs horaires, ou la plateforme démarre avec un **back-office** où les transporteurs saisissent eux-mêmes leurs trajets ?

Dites-moi vos réponses (ou validez "go phase 1+2+3, option (a), pas de SMS, back-office transporteurs") et j'enchaîne immédiatement.
