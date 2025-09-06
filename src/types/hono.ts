// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type { Session, User } from "better-auth";
import type { KVNamespace } from "@cloudflare/workers-types";

import type { LMRouterConfigModel } from "./config.js";
import { apiKey } from "../models/billing.js";

export type AuthType = "better-auth" | "api-key" | "access-key" | "byok";

export interface AuthBetterAuth {
  type: "better-auth";
  user: User;
  session: Session;
  ownerType: string;
  ownerId: string;
}

export interface AuthApiKey {
  type: "api-key";
  apiKey: typeof apiKey.$inferSelect;
}

export interface AuthAccessKey {
  type: "access-key";
  accessKey: string;
}

export interface AuthByok {
  type: "byok";
  byok: string;
}

export interface ContextEnv {
  Variables: {
    auth?: AuthBetterAuth | AuthApiKey | AuthAccessKey | AuthByok;
    modelName?: string;
    model?: LMRouterConfigModel;
  };
  Bindings: {
    LMROUTER_CONFIG?: string;
    LMROUTER_CONFIG_KV?: KVNamespace;
    LMROUTER_CONFIG_KV_KEY?: string;
  };
}
