// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { HTTPException } from "hono/http-exception";
import OpenAI from "openai";
import type {
  RerankRequest,
  RerankResponse,
} from "../../../../types/rerank.js";

import type { OpenAIRerankAdapter } from "./adapter.js";
import type { LMRouterApiCallUsage } from "../../../../types/billing.js";
import type { LMRouterConfigProvider } from "../../../../types/config.js";

export class OpenAIRerankOpenAIAdapter implements OpenAIRerankAdapter {
  usage?: LMRouterApiCallUsage;

  async sendRequest(
    provider: LMRouterConfigProvider,
    request: RerankRequest,
    options?: {},
  ): Promise<RerankResponse> {
    const openai = new OpenAI({
      baseURL: provider.base_url,
      apiKey: provider.api_key,
      defaultHeaders: {
        "HTTP-Referer": "https://lmrouter.com/",
        "X-Title": "LMRouter",
      },
    });
    const rerank: RerankResponse = await openai.request({
      method: "post",
      path: "/rerank",
      body: request,
    });

    if (rerank && "usage" in rerank) {
      this.usage = {
        input: rerank.usage.total_tokens,
        request: 1,
      };
    }

    if (rerank && "meta" in rerank) {
      this.usage = {
        input: rerank.meta?.tokens?.input_tokens,
        output: rerank.meta?.tokens?.output_tokens,
        request: 1,
      };
    }
    return rerank;
  }

  async sendRequestStreaming(
    provider: LMRouterConfigProvider,
    request: RerankRequest,
    options?: {},
  ): Promise<AsyncGenerator<never>> {
    throw new HTTPException(400, {
      message: "Rerank API does not support streaming",
    });
  }
}
