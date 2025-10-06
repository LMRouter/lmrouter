// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  RerankRequest,
  RerankResponse,
} from "../../../../types/rerank.js";

import { LMRouterAdapter } from "../../../adapter.js";
import { OpenAIRerankOpenAIAdapter } from "./openai.js";
import type { LMRouterConfigProvider } from "../../../../types/config.js";

export type OpenAIRerankAdapter = LMRouterAdapter<
  RerankRequest,
  {},
  RerankResponse,
  never
>;

const adapters: Record<string, new () => OpenAIRerankOpenAIAdapter> = {
  others: OpenAIRerankOpenAIAdapter,
};

export class OpenAIRerankAdapterFactory {
  static getAdapter(provider: LMRouterConfigProvider): OpenAIRerankOpenAIAdapter {
    if (!Object.keys(adapters).includes(provider.type)) {
      return new adapters.others();
    }
    return new adapters[provider.type]();
  }
}
