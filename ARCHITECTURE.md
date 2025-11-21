# Architecture Features-Based

## Structure du projet

Le projet suit une architecture basée sur les fonctionnalités (features), où chaque domaine métier est organisé de manière autonome.

```
src/
├── features/
│   ├── flights/              # Domaine des vols
│   │   ├── components/       # Composants UI spécifiques
│   │   ├── hooks/           # Hooks métier
│   │   ├── types/           # Types TypeScript
│   │   ├── utils/           # Utilitaires
│   │   └── index.ts         # Exports publics
│   │
│   ├── hotels/              # Domaine des hôtels
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── cars/                # Domaine des voitures
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── bookings/            # Domaine des réservations
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── shared/              # Composants partagés
│       ├── components/      # UI components réutilisables
│       ├── hooks/          # Hooks génériques
│       ├── utils/          # Utilitaires communs
│       └── index.ts
│
├── components/              # Composants legacy (à migrer)
├── pages/                   # Pages/Routes
└── lib/                     # Librairies et config

```

## Principes d'architecture

### 1. Encapsulation par domaine
Chaque feature contient tout ce qui est nécessaire pour fonctionner de manière autonome :
- Composants UI
- Logique métier (hooks)
- Types/Interfaces
- Utilitaires spécifiques

### 2. Exports publics contrôlés
Chaque feature expose uniquement ce qui doit être public via son `index.ts` :

```typescript
// features/flights/index.ts
export { FlightSearchForm } from "./components/FlightSearchForm";
export { useFlightSearch } from "./hooks/useFlightSearch";
export type { FlightSearchParams, Flight } from "./hooks/useFlightSearch";
```

### 3. Dépendances claires
- Les features peuvent dépendre de `shared/`
- Les features ne doivent PAS dépendre entre elles directement
- Les pages orchestrent les différentes features

### 4. Composants partagés
Les composants réutilisables dans `shared/` incluent :
- `UnifiedForm` - Formulaire universel
- `UnifiedSubmitButton` - Bouton de soumission
- `UnifiedAutocomplete` - Autocomplétion générique
- `UnifiedDatePicker` - Sélecteur de date
- `UnifiedPassengerSelector` - Sélecteur de passagers

## Migration progressive

### Étape 1 : Features créées ✅
- `features/flights/` - Recherche de vols
- `features/hotels/` - Recherche d'hôtels
- `features/bookings/` - Dialogue de réservation
- `features/shared/` - Composants partagés

### Étape 2 : À migrer
- `features/cars/` - Recherche de voitures
- `features/auth/` - Authentification
- `features/payment/` - Paiements
- `features/admin/` - Administration

### Étape 3 : Nettoyage
- Supprimer les anciens composants de `src/components/`
- Mettre à jour les imports dans les pages
- Documenter les patterns

## Utilisation

### Dans une page
```typescript
import { FlightSearchForm } from "@/features/flights";
import { HotelSearchForm } from "@/features/hotels";

export const SearchPage = () => {
  return (
    <div>
      <FlightSearchForm />
      <HotelSearchForm />
    </div>
  );
};
```

### Créer une nouvelle feature
```bash
# Structure recommandée
features/
└── ma-feature/
    ├── components/
    │   └── MonComposant.tsx
    ├── hooks/
    │   └── useMonHook.ts
    ├── types/
    │   └── index.ts
    └── index.ts
```

## Avantages

1. **Maintenabilité** : Code organisé par domaine métier
2. **Scalabilité** : Ajout facile de nouvelles features
3. **Testabilité** : Tests isolés par feature
4. **Réutilisabilité** : Composants partagés bien définis
5. **Onboarding** : Structure claire pour nouveaux développeurs

## Prochaines étapes

1. Migrer les features restantes (cars, auth, payment)
2. Créer des tests unitaires par feature
3. Documenter les patterns de chaque domaine
4. Mettre en place le lazy loading par feature
