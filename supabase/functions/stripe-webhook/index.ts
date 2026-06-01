import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Vérification signature Stripe
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
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    
    // Vérifier la signature Stripe
    if (STRIPE_WEBHOOK_SECRET) {
      const valid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
      if (!valid) {
        return new Response("Invalid signature", { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerId = session.customer;
        
        if (customerEmail) {
          // Trouver l'utilisateur par email
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const user = authUsers?.users?.find(u => u.email === customerEmail);
          
          if (user) {
            await supabase.from("profiles").update({
              has_active_subscription: true,
              stripe_customer_id: customerId,
            }).eq("id", user.id);
            console.log("Subscription activated for:", customerEmail);
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const isActive = ["active", "trialing"].includes(subscription.status);
        
        // Trouver par stripe_customer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
          
        if (profile) {
          await supabase.from("profiles").update({
            has_active_subscription: isActive,
          }).eq("id", profile.id);
          console.log("Subscription updated:", customerId, "active:", isActive);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
          
        if (profile) {
          await supabase.from("profiles").update({
            has_active_subscription: false,
          }).eq("id", profile.id);
          console.log("Subscription cancelled:", customerId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error: " + err.message, { status: 500 });
  }
});
