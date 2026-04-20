// supabase/functions/create-checkout/index.ts
// Crée une Stripe Checkout Session — 2 formules uniquement
// Déployer : supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════
// ⚠️  REMPLIS CES 2 VALEURS APRÈS AVOIR CRÉÉ TES PRODUITS STRIPE
//
//   annual     → produit "Reformer Annuel" 588€, type: Payment
//   commitment → produit "Reformer Engagement" 56€/mois, type: Subscription
//
//   Les Price IDs ressemblent à : price_1Abc123XyZ...
// ═══════════════════════════════════════════════════════════════
const STRIPE_PRICE_IDS = {
  annual:     "price_ANNUAL_ID_ICI",     // 588€/an — paiement unique
  commitment: "price_COMMITMENT_ID_ICI", // 56€/mois — abonnement récurrent
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, userId, email, contractAccepted, returnUrl, cancelUrl } = await req.json();

    // Validations
    if (!plan || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "Champs manquants : plan, userId, email requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!contractAccepted) {
      return new Response(
        JSON.stringify({ error: "Le contrat doit être accepté avant le paiement." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!["annual", "commitment"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: 'Formule invalide. Utiliser "annual" ou "commitment".' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceId = STRIPE_PRICE_IDS[plan as "annual" | "commitment"];
    if (!priceId || priceId.includes("_ID_ICI")) {
      return new Response(
        JSON.stringify({ error: "Price IDs Stripe non configurés. Voir create-checkout/index.ts." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Init Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupère ou crée le customer Stripe
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = existingSub?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
    }

    // ── Annuel → paiement unique (mode: payment) ──────────────────────────
    // ── Engagement → abonnement mensuel (mode: subscription) ─────────────
    const isAnnual = plan === "annual";

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isAnnual ? "payment" : "subscription",
      success_url: returnUrl + "&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      locale: "fr",
      allow_promotion_codes: true,
      metadata: {
        user_id: userId,
        plan,
        contract_accepted: "true",
      },
      // Pour l'engagement : ajoute les métadonnées sur l'abonnement Stripe
      ...(!isAnnual && {
        subscription_data: {
          metadata: {
            user_id: userId,
            plan: "commitment",
            commitment_months: "12",
          },
        },
      }),
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Crée la ligne pending en DB
    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: "pending",
        stripe_customer_id: customerId,
        contract_accepted_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("create-checkout error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
