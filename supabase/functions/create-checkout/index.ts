// supabase/functions/create-checkout/index.ts
// Edge Function : crée une Stripe Checkout Session
// Déployer : supabase functions deploy create-checkout

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Prix Stripe — À REMPLIR après avoir créé les produits sur stripe.com ───
// Remplace chaque valeur par ton vrai Price ID (format : price_xxxxx)
const STRIPE_PRICE_IDS = {
  monthly:    "price_MONTHLY_ID_HERE",    // 49€/mois, sans engagement
  annual:     "price_ANNUAL_ID_HERE",     // 588€/an, paiement unique
  commitment: "price_COMMITMENT_ID_HERE", // 56€/mois, engagement 12 mois
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      plan,
      userId,
      email,
      contractAccepted,
      returnUrl,
      cancelUrl,
    } = await req.json();

    if (!plan || !userId || !email || !contractAccepted) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceId = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
    if (!priceId || priceId.includes("HERE")) {
      return new Response(
        JSON.stringify({ error: "Stripe price IDs not configured. Check STRIPE_PRICE_IDS in create-checkout/index.ts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Init Stripe with secret key from Supabase secrets
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Init Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if customer already exists in Stripe
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
    }

    // Checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === "annual" ? "payment" : "subscription",
      success_url: returnUrl + "&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl,
      locale: "fr",
      metadata: {
        user_id: userId,
        plan,
        contract_accepted: contractAccepted ? "true" : "false",
      },
      // For commitment plan — add 12-month subscription schedule
      ...(plan === "commitment" && {
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

    // Save pending subscription in DB
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      plan,
      status: "pending",
      stripe_customer_id: customerId,
      contract_accepted_at: contractAccepted ? new Date().toISOString() : null,
    }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
