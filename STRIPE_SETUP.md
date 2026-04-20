# 💳 Guide de configuration Stripe & Swikly
# The Reformer Studio — Paiements & Caution

---

## 🎯 Résumé des 2 formules

| Formule | Prix | Type Stripe | Engagement |
|---------|------|-------------|------------|
| **Annuel** | 588€ en une fois | Paiement unique (Payment) | Aucun |
| **Engagement 12 mois** | 56€/mois | Abonnement récurrent (Subscription) | Contrat 12 mois |

---

## ÉTAPE 1 — Créer ton compte Stripe

1. Va sur **https://stripe.com/fr** et crée ton compte
2. Active ton compte en mode **live** (remplis les infos business)
3. Pour les tests, utilise le mode **test** (toggle en haut à gauche du dashboard)

---

## ÉTAPE 2 — Créer les 2 produits Stripe

### Produit 1 — Reformer Annuel (588€ en une fois)

1. Dashboard Stripe → **Catalogue de produits** → **Ajouter un produit**
2. Nom : `The Reformer Studio — Annuel`
3. Prix : `588,00 EUR`
4. Type de prix : **Ponctuel** (one-time payment)
5. Clique **Enregistrer le produit**
6. **Copie le Price ID** qui ressemble à `price_1AbcXXXXXXXXXXXX`

### Produit 2 — Reformer Engagement 12 mois (56€/mois)

1. Dashboard Stripe → **Catalogue de produits** → **Ajouter un produit**
2. Nom : `The Reformer Studio — Engagement 12 mois`
3. Prix : `56,00 EUR`
4. Type de prix : **Récurrent** → Mensuel
5. Clique **Enregistrer le produit**
6. **Copie le Price ID** qui ressemble à `price_1DefYYYYYYYYYYYY`

---

## ÉTAPE 3 — Coller les Price IDs dans le code

Ouvre ce fichier sur GitHub :
`supabase/functions/create-checkout/index.ts`

Remplace les 2 lignes :
```typescript
const STRIPE_PRICE_IDS = {
  annual:     "price_ANNUAL_ID_ICI",     // ← colle ton Price ID Annuel ici
  commitment: "price_COMMITMENT_ID_ICI", // ← colle ton Price ID Engagement ici
};
```

---

## ÉTAPE 4 — Ajouter les secrets Stripe dans Supabase

Va sur :
https://supabase.com/dashboard/project/foxeaycfzqtpqyhkzjee/settings/vault

Ajoute ces 3 secrets :

| Nom de la variable | Où la trouver |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Développeurs → Clés API → **Clé secrète** (commence par `sk_live_` ou `sk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Développeurs → Webhooks → ton webhook → **Clé secrète de signature** (commence par `whsec_`) |

> ⚠️ N'utilise JAMAIS la clé secrète dans le front-end.
> Elle doit rester uniquement dans Supabase Vault.

---

## ÉTAPE 5 — Déployer les Edge Functions

Dans le terminal, à la racine de ton projet :

```bash
# Installe le CLI Supabase si pas encore fait
npm install -g supabase

# Connecte-toi
supabase login

# Lie au projet
supabase link --project-ref foxeaycfzqtpqyhkzjee

# Déploie les 2 fonctions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

Les fonctions seront disponibles sur :
- `https://foxeaycfzqtpqyhkzjee.supabase.co/functions/v1/create-checkout`
- `https://foxeaycfzqtpqyhkzjee.supabase.co/functions/v1/stripe-webhook`

---

## ÉTAPE 6 — Configurer le Webhook Stripe

1. Stripe Dashboard → **Développeurs** → **Webhooks** → **Ajouter un endpoint**
2. URL : `https://foxeaycfzqtpqyhkzjee.supabase.co/functions/v1/stripe-webhook`
3. Sélectionne ces événements :
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.updated`
4. Clique **Ajouter l'endpoint**
5. Copie la **Clé secrète de signature** (`whsec_...`) → colle dans Supabase Vault sous `STRIPE_WEBHOOK_SECRET`

---

## ÉTAPE 7 — Configurer Swikly (caution 500€)

1. Crée un compte sur **https://www.swikly.com**
2. Crée une nouvelle caution :
   - Montant : **500€**
   - Type : Caution (pré-autorisation, non débitée)
   - Description : "Caution abonnement The Reformer Studio"
3. Copie le lien Swikly généré
4. Dans `src/pages/Subscription.tsx`, remplace :
   ```typescript
   const SWIKLY_URL = 'https://www.swikly.com/'; // ← Remplace par ton vrai lien
   ```

---

## ÉTAPE 8 — Test du flux complet

1. Active le **mode test** dans Stripe
2. Crée un compte utilisateur dans ton app
3. Va sur `/subscription`
4. Sélectionne une formule, accepte le contrat
5. Sur Stripe Checkout, utilise la carte test : **4242 4242 4242 4242** (exp: 12/34, CVV: 123)
6. Vérifie dans Supabase → Table Editor → `subscriptions` que la ligne est bien créée avec `status: active`
7. Vérifie que tu es redirigé vers la page Swikly
8. Vérifie que tu peux accéder à `/home`

---

## ✅ Flux complet une fois configuré

```
Inscription → /onboarding → /subscription
  → Choisir formule (Annuel 588€ ou Engagement 56€/mois)
  → Accepter le contrat
  → Stripe Checkout (paiement sécurisé)
  → Retour sur l'app → Swikly (caution 500€)
  → Accès complet à la plateforme (/home, /library, /progress, /profile...)
```

---

## 📞 Support

Pour toute question : contact@thereformerstudio.com
