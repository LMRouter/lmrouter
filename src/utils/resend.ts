// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { Resend } from "resend";

import { getConfig } from "./config.js";
import type { ContextEnv } from "../types/hono.js";

let resendCache: Resend | null = null;

export const getResend = (c?: Context<ContextEnv>): Resend => {
  if (!resendCache) {
    const cfg = getConfig(c);
    if (!cfg.auth.enabled) {
      throw new HTTPException(400, {
        message: "Auth is not enabled",
      });
    }
    resendCache = new Resend(cfg.auth.email.resend.api_key);
  }
  return resendCache;
};
