// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type { LMRouterConfigModelProviderPricing } from "./config.js";

export interface LMRouterApiCallUsage {
  service_tier?: string;
  input?: number;
  input_image?: number;
  input_audio?: number;
  input_audio_time?: number;
  output?: number;
  output_audio?: number;
  image?: number;
  image_quality?: string;
  image_size?: string;
  web_search?: number;
  code_interpreter?: number;
  request?: number;
  input_cache_reads?: number;
  input_cache_writes?: number;
}

export interface LMRouterLedgerMetadataApiCallTimestamps {
  start: number;
  first_token?: number;
  end: number;
}

export interface LMRouterLedgerMetadataApiCall {
  type: "api-call";
  data: {
    api_key_id?: string;
    model: string;
    provider: string;
    endpoint: string;
    status: number;
    stream?: boolean;
    error?: string;
    timestamps: LMRouterLedgerMetadataApiCallTimestamps;
    ip?: string;
    referer: {
      name?: string;
      url?: string;
    };
    usage?: LMRouterApiCallUsage;
    pricing?: LMRouterConfigModelProviderPricing;
  };
}

export interface LMRouterLedgerMetadataPayment {
  type: "payment";
  data: Record<string, unknown>;
}

export interface LMRouterLedgerMetadataPromotionalCredit {
  type: "promotional_credit";
  data: {
    source: string;
  };
}

export type LMRouterLedgerMetadata =
  | LMRouterLedgerMetadataApiCall
  | LMRouterLedgerMetadataPayment
  | LMRouterLedgerMetadataPromotionalCredit;
