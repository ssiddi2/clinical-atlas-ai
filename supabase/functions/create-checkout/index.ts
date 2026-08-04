import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "https://esm.sh/stripe@22.0.2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const TRIAL_DAYS = 30;
// Quarterly billing: Stripe catalog prices created via Lovable can't express
// interval_count, so the interval is set inline against the catalog product.
const QUARTERLY_INTERVAL_COUNT = 3;

async function resolveOrCreateCustomer(
  stripe: Stripe,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

async function createCheckoutSession(options: {
  priceId: string;
  customerEmail?: string;
  userId?: string;
  returnUrl: string;
  environment: StripeEnv;
}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.priceId)) throw new Error("Invalid priceId");
  const stripe = createStripeClient(options.environment);

  const prices = await stripe.prices.list({ lookup_keys: [options.priceId] });
  if (!prices.data.length) throw new Error("Price not found");
  const catalogPrice = prices.data[0];
  const productId = typeof catalogPrice.product === "string"
    ? catalogPrice.product
    : catalogPrice.product.id;

  const customerId = await resolveOrCreateCustomer(stripe, {
    email: options.customerEmail,
    userId: options.userId,
  });

  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: catalogPrice.currency,
        product: productId,
        unit_amount: catalogPrice.unit_amount ?? 7500,
        recurring: { interval: "month", interval_count: QUARTERLY_INTERVAL_COUNT },
      },
      quantity: 1,
    }],
    mode: "subscription",
    ui_mode: "embedded_page",
    return_url: options.returnUrl,
    customer: customerId,
    managed_payments: { enabled: true },
    ...(options.userId && { metadata: { userId: options.userId, managed_payments: "true" } }),
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      ...(options.userId && { metadata: { userId: options.userId, priceId: options.priceId } }),
    },
  } as Stripe.Checkout.SessionCreateParams);

  return session.client_secret;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const environment = body.environment;
    if (environment !== "sandbox" && environment !== "live") {
      throw new Error("Invalid environment");
    }
    if (typeof body.priceId !== "string" || typeof body.returnUrl !== "string") {
      throw new Error("priceId and returnUrl are required");
    }
    const clientSecret = await createCheckoutSession({
      priceId: body.priceId,
      customerEmail: body.customerEmail,
      userId: body.userId,
      returnUrl: body.returnUrl,
      environment,
    });
    return new Response(JSON.stringify({ clientSecret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});