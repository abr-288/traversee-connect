# 📋 Traversée Connect — Rapport d'audit (Phase 1)

Date : 22 juin 2026 — équipe PM/UX/Archi/Supabase/Sécurité/SEO/CRO/IA

---

## 1. Vue d'ensemble

| Indicateur | Valeur |
|---|---|
| Pages routées (`AnimatedRoutes.tsx`) | 67 |
| Edge functions Supabase | 40 |
| Tables Supabase | 23 |
| Dépendances npm (prod / dev) | 74 / 17 |
| Lignes de code TS/TSX (src + functions) | ~69 300 |
| Erreurs TypeScript bloquantes | 0 ✅ |
| `console.log` dans le code source | 0 ✅ |
| Findings sécurité scanners | 0 ✅ |

**Verdict global** : base **fonctionnelle et propre**, mais souffre de **redondances structurelles**, de **fichiers obèses** et d'un design hétérogène. Aucune dette critique de sécurité ou de typage. La refonte peut se faire **par couches** sans rupture.

---

## 2. Architecture des routes ✅

Toutes les pages présentes dans `src/pages/` sont effectivement routées dans `src/components/AnimatedRoutes.tsx`. **Aucune page morte détectée.**

⚠️ **Anti-pattern** : `src/App.tsx` ne fait que 36 lignes et délègue tout à `AnimatedRoutes.tsx`. Conserver ce split lors de la refonte, mais aligner avec un système de **routes typées** + **lazy loading** systématique (actuellement chargement eager → bundle initial trop lourd).

---

## 3. Doublons hooks `/hooks` vs `/features` 🟠

Cinq hooks existent **en double** dans `src/hooks/*` et `src/features/*/hooks/*`. L'application n'utilise **que la version legacy `/hooks/`** — les versions `/features/` ne sont importées nulle part.

| Hook | Imports legacy `/hooks` | Imports `/features` |
|---|---|---|
| `useCarRental` | 1 | 0 |
| `useFlightSearch` | 2 | 0 |
| `useHotelSearch` | 1 | 0 |
| `useSecureFlightBooking` | 2 | 0 |
| `useUserRole` | 3 | 0 |

**Action Phase 2** : supprimer les 5 fichiers `src/features/*/hooks/*` (code mort) — sauf si la migration vers l'architecture `features/` est l'objectif explicite, auquel cas faire l'inverse.

---

## 4. Composants obèses à refactoriser 🔴

| Fichier | Lignes | Priorité |
|---|---|---|
| `src/integrations/supabase/types.ts` | 1314 | 🟢 auto-généré, ignorer |
| `supabase/functions/search-hotels/index.ts` | 1010 | 🔴 splitter par provider |
| `supabase/functions/search-flights/index.ts` | 1009 | 🔴 splitter par provider |
| `src/pages/admin/AdminConfiguration.tsx` | 883 | 🔴 découper en onglets |
| `src/pages/Hotels.tsx` | 856 | 🔴 extraire `HotelResultsList`, filtres |
| `src/pages/Auth.tsx` | 852 | 🔴 séparer Sign-in / Sign-up / OAuth |
| `supabase/functions/car-rental/index.ts` | 786 | 🟠 |
| `src/components/FlightBookingDialog.tsx` | 781 | 🔴 |
| `src/pages/Account.tsx` | 780 | 🔴 onglets profile/security/billing |
| `src/components/booking-steps/SummaryStep.tsx` | 767 | 🟠 |
| `src/pages/Payment.tsx` | 707 | 🟠 |
| `src/pages/FlightComparison.tsx` | 640 | 🟠 |
| `src/pages/FlightHotel.tsx` | 613 | 🟠 |
| `src/pages/DestinationDetail.tsx` | 585 | 🟠 |
| `src/components/admin/ThemeConfig.tsx` | 575 | 🟠 |

**Règle** : aucun composant > 300 lignes après refonte (objectif Phase 4–6).

---

## 5. Design System actuel ❌

Pas de tokens centralisés : couleurs hardcodées (`bg-blue-600`, `text-white`) trouvées dans plusieurs composants — viole la règle projet « never hardcode color utilities ».

**Action Phase 2** :
- Définir tokens HSL dans `index.css` (primary `#0F4C81`, success `#10B981`, neutres).
- Charger **Inter** (body) + **Poppins** (display) via `@fontsource`.
- Réécrire les variants shadcn (Button, Card, Input, Badge, Table, Dialog, Toast).
- Refactoriser les `Unified*` components pour consommer les tokens.

---

## 6. Sécurité ✅ (statut actuel)

- **0 finding** sur les 4 scanners (`agent_security`, `connector_security_scan`, `supabase`, `supabase_lov`).
- RLS active sur les 23 tables, policies présentes.
- `has_role()` + `user_roles` séparée (anti-escalation correct).
- Rate-limiter partagé dans `supabase/functions/_shared/rate-limiter.ts`.
- `LOVABLE_API_KEY`, `CINETPAY_*`, `RESEND_API_KEY` côté serveur uniquement.

⚠️ **À renforcer en Phase 5** :
- Pas de table `audit_logs` (exigence du brief « Journaux d'activité »).
- Pas de centre admin de sécurité dans l'UI.
- Validation Zod inégale (présente dans certaines functions, absente dans d'autres).
- DOMPurify uniquement sur le formulaire contact — étendre.

---

## 7. Supabase ⚠️

23 tables, dont 5 critiques sans index custom déclaré : `bookings(user_id, status)`, `payments(booking_id)`, `flight_prebookings(user_id, expires_at)`, `reviews(service_id)`, `commissions(agency_id, status)`. Ces requêtes sont fréquentes côté front.

**Action Phase 4** :
- Ajouter index composites ci-dessus.
- Créer table `audit_logs (id, user_id, action, entity, entity_id, metadata, ip, ua, created_at)` + policies admin-only.
- Créer table **`crossings`** (nouveau module Traversées) : `id, operator_id, vehicle_type (bus|boat|brousse), origin, destination, departure_at, arrival_at, price_xof, seats_total, seats_available, status`.
- Créer table **`crossing_operators`** (compagnies de transport).
- Étendre l'enum `app_role` avec `transporteur` (actuellement: `admin`, `agency_owner`, `user`).

---

## 8. Performance 🟠

- **Aucun `React.lazy`** sur les routes → bundle initial > 2 Mo estimé.
- Pas d'optim image : pas d'`<img loading="lazy">` systématique, pas de WebP.
- PWA (workbox) déjà en place ✅.
- Pas de preload LCP.

**Action Phase 6** : lazy routes, `vite-imagetools` ou squoosh, preload hero.

---

## 9. SEO 🟠

- `index.html` : meta basique présente.
- Sitemap statique (`public/sitemap.xml`) — à passer en **dynamique** (script `predev/prebuild`).
- Pas de meta dynamique par page (pas de `react-helmet-async` détecté dans les pages auditées).
- Pas de Schema.org `TravelAgency` ni `Trip`.
- `robots.txt` présent ✅.

**Action Phase 6** : `react-helmet-async` + meta uniques + OG/Twitter + JSON-LD.

---

## 10. Périmètre métier (décision validée)

Selon vos réponses :
- ✅ **Ajouter** module « Traversées » (bus/bateau/taxi-brousse) **sans supprimer** vols/hôtels/trains/voitures.
- ✅ Trajets fournis par **APIs partenaires** (doc à fournir).
- ✅ Pas de SMS/WhatsApp pour l'instant — architecture extensible.
- ✅ Livraison **phase par phase** avec validation.

---

## 11. Plan d'action immédiat (Phase 2 — à valider)

1. **Tokens design** dans `index.css` + `tailwind.config.ts`.
2. **Fonts** Inter + Poppins via `@fontsource`.
3. **Variants shadcn** unifiés (Button, Card, Input, Badge, Dialog, Toast).
4. **Suppression** des 5 hooks fantômes dans `src/features/*/hooks/`.
5. **Lazy loading** des routes admin/agency (gain immédiat sur le bundle).

🟢 Validez par « **Go Phase 2** » et j'enchaîne.
