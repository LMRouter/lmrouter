// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import { Decimal } from "decimal.js";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { handleStripeWebhook, updateBilling } from "./billing.js";
import { getConfig } from "./config.js";
import { getDb } from "./database.js";
import { sendVerificationEmail } from "./email.js";
import { balance } from "../models/billing.js";
import { getStripe } from "./stripe.js";
import type { ContextEnv } from "../types/hono.js";

let authCache: ReturnType<typeof betterAuth> | null = null;

export const getAuth = (
  c?: Context<ContextEnv>,
): ReturnType<typeof betterAuth> => {
  if (!authCache) {
    const cfg = getConfig(c);
    if (!cfg.auth.enabled) {
      throw new HTTPException(400, {
        message: "Auth is not enabled",
      });
    }
    const stripeClient = getStripe(c);
    authCache = betterAuth({
      baseURL: cfg.auth.better_auth.url,
      basePath: "/v1/auth",
      trustedOrigins: cfg.auth.better_auth.trusted_origins,
      secret: cfg.auth.better_auth.secret,
      telemetry: {
        enabled: cfg.auth.better_auth.telemetry,
      },
      database: drizzleAdapter(getDb(c), {
        provider: "pg",
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
      emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
          await sendVerificationEmail(user, url, c);
        },
        autoSignInAfterVerification: true,
      },
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              const cfg = getConfig(c);
              if (!cfg.auth.enabled) {
                return;
              }
              await getDb(c).insert(balance).values({
                ownerType: "user",
                ownerId: user.id,
              });
              if (cfg.auth.billing.initial_credit > 0) {
                await updateBilling(
                  "user",
                  user.id,
                  new Decimal(cfg.auth.billing.initial_credit),
                  {
                    type: "promotional_credit",
                    data: {
                      source: "signup",
                    },
                  },
                  c,
                );
              }
            },
          },
        },
      },
      plugins: [
        // TODO: Remove type cast when better-auth fixes the type
        stripe({
          stripeClient: stripeClient.stripe,
          stripeWebhookSecret: stripeClient.billingConfig.stripe.webhook_secret,
          createCustomerOnSignUp: true,
          onEvent: handleStripeWebhook,
        }) as BetterAuthPlugin,
      ],
      socialProviders: cfg.auth.better_auth.social_providers,
    });
  }
  return authCache;
};

// Uncomment to call `pnpm auth:generate`
// export const auth = getAuth();
