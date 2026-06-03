import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const plan = session.metadata?.plan || (session.amount_total === 58800 ? "annual" : "monthly");

    if (!email) {
      console.error("No email in session");
      return new Response("No email", { status: 400 });
    }

    console.log(`Processing payment for ${email}, plan: ${plan}`);

    // 1. Chercher l'utilisateur par email dans auth.users
    const usersRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
      { headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY } }
    );
    const usersData = await usersRes.json();
    const users = usersData.users || [];
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      // 2a. Utilisateur existant — activer l'abonnement
      console.log(`Found existing user: ${user.id}`);

      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          has_active_subscription: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_plan: plan,
          updated_at: new Date().toISOString(),
        }),
      });

      // 3. Envoyer email de confirmation + magic link
      await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({
          type: "magiclink",
          email,
          redirect_to: "connectreformer://home",
        }),
      });

      console.log(`Subscription activated for ${email}`);

    } else {
      // 2b. Utilisateur non trouvé — créer le compte ET activer l'abonnement
      console.log(`User not found, creating account for ${email}`);

      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          apikey: SUPABASE_SERVICE_KEY,
        },
        body: JSON.stringify({
          email,
          email_confirm: false, // Envoi email de confirmation
          user_metadata: { stripe_customer_id: customerId },
        }),
      });

      const newUser = await createRes.json();

      if (newUser.id) {
        console.log(`Created user: ${newUser.id}`);

        // Créer le profil
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            apikey: SUPABASE_SERVICE_KEY,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            id: newUser.id,
            email,
            has_active_subscription: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_plan: plan,
          }),
        });

        console.log(`Profile created with active subscription for ${email}`);
      } else {
        console.error("Failed to create user:", JSON.stringify(newUser));
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
