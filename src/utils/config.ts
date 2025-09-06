// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import fs from "fs";

import type { Context } from "hono";
import yaml from "yaml";

import type { LMRouterConfig } from "../types/config.js";
import type { ContextEnv } from "../types/hono.js";

let configCache: LMRouterConfig | null = null;

export const loadConfigFromCloudflareKV = async (
  c: Context<ContextEnv>,
): Promise<void> => {
  if (
    !c.env.LMROUTER_CONFIG_KV ||
    !c.env.LMROUTER_CONFIG_KV_KEY ||
    configCache
  ) {
    return;
  }

  const configFromKV = await c.env.LMROUTER_CONFIG_KV.get(
    c.env.LMROUTER_CONFIG_KV_KEY,
  );
  if (configFromKV) {
    configCache = JSON.parse(configFromKV) as LMRouterConfig;
  }
};

export const getConfig = (c?: Context<ContextEnv>): LMRouterConfig => {
  if (configCache) {
    return configCache;
  }

  const configFromEnv = c?.env.LMROUTER_CONFIG ?? process.env.LMROUTER_CONFIG;
  if (configFromEnv) {
    console.log("Loading config from env...");
    configCache = yaml.parse(
      Buffer.from(configFromEnv, "base64").toString("utf8"),
    ) as LMRouterConfig;
    return configCache;
  }

  if (process.argv.length < 3) {
    console.log("Loading default config...");
    configCache = yaml.parse(
      fs.readFileSync(
        new URL("../../config/config.default.example.yaml", import.meta.url)
          .pathname,
        "utf8",
      ),
    ) as LMRouterConfig;
    return configCache;
  }

  console.log(`Loading config from file "${process.argv[2]}"...`);
  configCache = yaml.parse(
    fs.readFileSync(process.argv[2], "utf8"),
  ) as LMRouterConfig;
  return configCache;
};
