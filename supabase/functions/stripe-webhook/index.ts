// supabase/functions/stripe-webhook/index.ts
// Edge Function : reçoit et traite les événements Stripe
// Déployer : supabase functions deploy stripe-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

  // Verify Stripe signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log("Stripe event received:", event.type);

  try {
    switch (event.type) {

      // ── Checkout completed (first payment) ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        if (!userId) break;

        const updateData: Record<string, unknown> = {
          user_id: userId,
          plan: plan ?? "monthly",
          status: "active",
          stripe_customer_id: session.customer as string,
          current_period_start: new Date().toISOString(),
        };

        // For subscriptions, get end date; for one-time (annual), set +1 year
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          updateData.stripe_subscription_id = sub.id;
          updateData.stripe_price_id = sub.items.data[0].price.id;
          updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString();
        } else {
          // Annual one-time payment — 12 months access
          const end = new Date();
          end.setFullYear(end.getFullYear() + 1);
          updateData.current_period_end = end.toISOString();
        }

        await supabaseAdmin.from("subscriptions").upsert(updateData, { onConflict: "user_id" });
        console.log("Subscription activated for user:", userId);
        break;
      }

      // ── Recurring invoice paid ────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          const stripeSub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await supabaseAdmin.from("subscriptions").update({
            status: "active",
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          }).eq("user_id", sub.user_id);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabaseAdmin.from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);

        console.log("Payment failed for customer:", customerId);
        break;
      }

      // ── Subscription canceled ─────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = stripeSub.customer as string;

        await supabaseAdmin.from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log("Subscription canceled for customer:", customerId);
        break;
      }

      // ── Subscription updated (plan change, renewal) ───────────────────────
      case "customer.subscription.updated": {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId = stripeSub.customer as string;

        await supabaseAdmin.from("subscriptions").update({
          status: stripeSub.status === "active" ? "active" : stripeSub.status as string,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
        }).eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("Error processing webhook event:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
