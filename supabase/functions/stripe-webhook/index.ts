import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const parts = signature.split(",").reduce((acc: Record<string, string>, part) => {
      const [k, v] = part.split("=");
      acc[k] = v;
      return acc;
    }, {});
    const timestamp = parts["t"];
    const sig = parts["v1"];
    const payload = timestamp + "." + body;
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, "0")).join("");
    return expected === sig;
  } catch { return false; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    
    if (STRIPE_WEBHOOK_SECRET) {
      const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
      if (!valid) return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const plan = session.amount_total === 5600 ? "monthly" : "annual";

      if (customerEmail) {
        // Trouver l'utilisateur par email
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const user = authUsers?.users?.find((u: any) => u.email === customerEmail);
        
        if (user) {
          // 1. Activer l'abonnement
          await supabase.from("profiles").update({
            has_active_subscription: true,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_plan: plan,
          }).eq("id", user.id);

          // 2. Envoyer Magic Link pour connexion auto dans l'app
          // Le lien redirige vers l'app via deep link connectreformer://
          const { data: magicLink } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: customerEmail,
            options: {
              redirectTo: "connectreformer://home",
            }
          });

          if (magicLink?.properties?.action_link) {
            // Envoyer un email avec le lien d'accès à l'app
            await supabase.auth.admin.sendRawEmail({
              to: customerEmail,
              subject: "🎉 Ton accès Connect Reformer est activé !",
              html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:-apple-system,sans-serif;">
<table width="100%" style="padding:40px 20px;background:#F5F3EE;"><tr><td align="center">
<table style="max-width:520px;width:100%;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:#1C1B19;padding:28px;text-align:center;">
  <span style="font-size:18px;font-weight:300;color:white;letter-spacing:3px;">CONNECT REFORMER</span>
</td></tr>
<tr><td style="padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:16px;">🎉</div>
  <h1 style="font-size:22px;font-weight:700;color:#1C1B19;margin:0 0 12px;">Bienvenue ${user.user_metadata?.first_name || ""} !</h1>
  <p style="font-size:15px;color:#6B6560;line-height:1.6;margin:0 0 8px;">
    Ton abonnement <strong>${plan === "monthly" ? "mensuel (56€/mois)" : "annuel (588€/an)"}</strong> est confirmé.
  </p>
  <p style="font-size:15px;color:#6B6560;line-height:1.6;margin:0 0 32px;">
    Ton espace Connect Reformer est prêt. Clique sur le bouton pour accéder directement à l'application !
  </p>
  <a href="${magicLink.properties.action_link}" 
     style="display:inline-block;padding:16px 40px;background:#B8973E;color:#1C1B19;font-size:16px;font-weight:700;text-decoration:none;border-radius:14px;">
    Accéder à mon espace 🚀
  </a>
  <p style="font-size:12px;color:#8B8578;margin:24px 0 0;line-height:1.6;">
    Si l'app ne s'ouvre pas automatiquement, connecte-toi avec ton email et mot de passe.<br>
    Ce lien est valable 1 heure.
  </p>
</td></tr>
<tr><td style="background:#1C1B19;padding:16px;text-align:center;">
  <p style="font-size:11px;color:#4A4A48;margin:0;">© 2025 Connect Reformer — Sin'opsys SAS</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
            });
          }

          console.log("✅ Subscription activated + magic link sent to:", customerEmail);
        } else {
          // L'utilisateur n'existe pas encore dans Supabase
          // Créer un compte automatiquement et envoyer invitation
          const { data: newUser } = await supabase.auth.admin.createUser({
            email: customerEmail,
            email_confirm: false,
            user_metadata: {
              first_name: session.customer_details?.name?.split(" ")[0] || "",
              last_name: session.customer_details?.name?.split(" ").slice(1).join(" ") || "",
            }
          });
          
          if (newUser?.user) {
            await supabase.from("profiles").update({
              has_active_subscription: true,
              stripe_customer_id: customerId,
              subscription_plan: plan,
              first_name: session.customer_details?.name?.split(" ")[0] || "",
              last_name: session.customer_details?.name?.split(" ").slice(1).join(" ") || "",
              email: customerEmail,
            }).eq("id", newUser.user.id);
          }
          console.log("✅ New user created for:", customerEmail);
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object;
      const isActive = ["active", "trialing"].includes(sub.status);
      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_customer_id", sub.customer).maybeSingle();
      if (profile) {
        await supabase.from("profiles").update({ has_active_subscription: isActive }).eq("id", profile.id);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const { data: profile } = await supabase.from("profiles").select("id").eq("stripe_customer_id", sub.customer).maybeSingle();
      if (profile) {
        await supabase.from("profiles").update({ has_active_subscription: false }).eq("id", profile.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response("Error: " + err.message, { status: 500 });
  }
});
