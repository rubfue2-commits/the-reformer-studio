import Stripe from "npm:stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

async function sendEmail(to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Connect Reformer <noreply@connectreformer.com>", to: [to], subject, html }),
  });
  const d = await r.json();
  console.log("Resend:", JSON.stringify(d));
  return d;
}

async function getMagicLink(email: string): Promise<string> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY },
    body: JSON.stringify({ type: "magiclink", email, redirect_to: "https://connectreformer.com" }),
  });
  const d = await r.json();
  return d.action_link || "";
}

async function findUser(email: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY },
  });
  const d = await r.json();
  return (d.users || []).find((u: any) => u.email?.toLowerCase() === email.toLowerCase()) || null;
}

async function activateProfile(userId: string, customerId: string, subId: string, plan: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, Prefer: "return=minimal" },
    body: JSON.stringify({ has_active_subscription: true, stripe_customer_id: customerId, stripe_subscription_id: subId, subscription_plan: plan, updated_at: new Date().toISOString() }),
  });
}

async function createUser(email: string, customerId: string, subId: string, plan: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY },
    body: JSON.stringify({ email, email_confirm: true, user_metadata: { stripe_customer_id: customerId } }),
  });
  const user = await r.json();
  if (!user.id) { console.error("Failed to create user:", JSON.stringify(user)); return null; }

  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, Prefer: "return=minimal" },
    body: JSON.stringify({ id: user.id, email, has_active_subscription: true, stripe_customer_id: customerId, stripe_subscription_id: subId, subscription_plan: plan }),
  });

  return user;
}

const emailHtml = (plan: string, link: string) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#fff;">
  <div style="text-align:center;margin-bottom:30px;">
    <span style="font-size:22px;font-weight:700;letter-spacing:2px;color:#1A1A1A;">CONNECT REFORMER</span>
  </div>
  <h2 style="color:#1A1A1A;font-size:22px;margin-bottom:16px;">Bienvenue ! Votre abonnement est actif.</h2>
  <p style="color:#555;font-size:16px;line-height:1.6;margin-bottom:24px;">
    Votre abonnement <strong>${plan === "annual" ? "annuel — 588€/an" : "mensuel — 56€/mois"}</strong> est maintenant activé.
  </p>
  ${link ? `<div style="text-align:center;margin:30px 0;">
    <a href="${link}" style="background:#B8922A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
      Accéder à mon espace →
    </a>
  </div>
  <p style="color:#999;font-size:13px;text-align:center;">Ce lien expire dans 24h. Connectez-vous ensuite avec votre email et mot de passe.</p>` : ""}
  <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
  <p style="color:#999;font-size:13px;">
    Téléchargez l'application TestFlight :<br>
    <a href="https://testflight.apple.com/join/hGfFchQr" style="color:#B8922A;">https://testflight.apple.com/join/hGfFchQr</a>
  </p>
  <p style="color:#ccc;font-size:11px;margin-top:20px;">Connect Reformer — Sin'opsys</p>
</div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;
    const customerId = session.customer as string;
    const subId = session.subscription as string;
    const plan = session.amount_total === 58800 ? "annual" : "monthly";

    if (!email) return new Response("No email", { status: 400 });
    console.log(`Payment for ${email}, plan: ${plan}`);

    let user = await findUser(email);
    let isNew = false;

    if (!user) {
      user = await createUser(email, customerId, subId, plan);
      isNew = true;
    } else {
      await activateProfile(user.id, customerId, subId, plan);
    }

    if (user?.id || user) {
      const link = await getMagicLink(email);
      await sendEmail(
        email,
        isNew ? "🎉 Bienvenue chez Connect Reformer — Accédez à votre espace" : "🎉 Votre abonnement Connect Reformer est actif",
        emailHtml(plan, link)
      );
      console.log(`Email sent to ${email}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
    status: 200,
  });
});
