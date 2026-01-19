# Comptes de Test B-Reserve

## Instructions de création

Pour créer les comptes de test, accédez à l'application et inscrivez-vous avec les informations suivantes.

---

## 1. Compte Administrateur (Super Admin)

**Email:** `admin@bossiz.com`  
**Mot de passe:** `Admin@2026!`  
**Rôle:** `admin`

> ⚠️ Ce compte existe déjà ! Connectez-vous directement.

**Accès:**
- Panel Admin: `/admin`
- Gestion des publicités: `/admin/advertisements`
- Gestion des utilisateurs: `/admin/users`
- Configuration du site: `/admin/configuration`

---

## 2. Compte Sous-Agence (Sub-Agency)

**Email:** `agence@test.com`  
**Mot de passe:** `Agence@2026!`  
**Rôle:** `sub_agency`

**Accès:**
- Dashboard Agence: `/agency`
- Gestion des services: `/agency/services`
- Gestion des activités: `/agency/activities`
- Paramètres: `/agency/settings`

---

## 3. Compte Utilisateur Standard

**Email:** `user@test.com`  
**Mot de passe:** `User@2026!`  
**Rôle:** `user`

**Accès:**
- Dashboard utilisateur: `/dashboard`
- Réservations: `/booking-history`
- Alertes de prix: `/price-alerts`
- Compte: `/account`

---

## 4. Compte Utilisateur VIP

**Email:** `vip@test.com`  
**Mot de passe:** `Vip@2026!`  
**Rôle:** `user`

**Accès:** Mêmes accès qu'un utilisateur standard, peut être utilisé pour tester les abonnements premium.

---

## Attribution des rôles (Admin uniquement)

Après avoir créé les comptes, l'administrateur doit attribuer les rôles via:
1. Se connecter avec `admin@bossiz.com`
2. Aller sur `/admin/users`
3. Modifier le rôle de chaque utilisateur

Ou via SQL:
```sql
-- Attribuer le rôle sub_agency à l'email agence@test.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'sub_agency' FROM auth.users WHERE email = 'agence@test.com';

-- Attribuer le rôle user (par défaut lors de l'inscription)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user' FROM auth.users WHERE email = 'user@test.com';
```

---

## URLs de Test

| Fonctionnalité | URL |
|----------------|-----|
| Page d'accueil | `/` |
| Vols | `/flights` |
| Hôtels | `/hotels` |
| Voitures | `/cars` |
| Vol+Hôtel | `/flight-hotel` |
| Abonnements | `/subscriptions` |
| Test Paiement | `/payment-test` |
| Panel Admin | `/admin` |
| Panel Agence | `/agency` |

---

## Notes

- Les emails de confirmation sont automatiquement validés (auto-confirm activé)
- Tous les paiements passent par CinetPay en mode production
- Les publicités se gèrent via `/admin/advertisements`
