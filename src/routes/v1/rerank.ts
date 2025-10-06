// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { Hono } from "hono";

import { OpenAIRerankAdapterFactory } from "../../adapters/openai/v1/rerank/adapter.js";
import { requireAuth } from "../../middlewares/auth.js";
import { ensureBalance } from "../../middlewares/billing.js";
import { parseModel } from "../../middlewares/model.js";
import type { ContextEnv } from "../../types/hono.js";
import { recordApiCall } from "../../utils/billing.js";
import { TimeKeeper } from "../../utils/chrono.js";
import { iterateModelProviders } from "../../utils/utils.js";
import type { RerankRequest } from "../../types/rerank.js";

const rerankRouter = new Hono<ContextEnv>();

rerankRouter.use(requireAuth(), ensureBalance, parseModel);

rerankRouter.post("/", async (c) => {
  const body = await c.req.json();
  return await iterateModelProviders(c, async (providerCfg, provider) => {
    const reqBody = { ...body } as RerankRequest;
    reqBody.model = providerCfg.model;

    const adapter = OpenAIRerankAdapterFactory.getAdapter(provider);
    const timeKeeper = new TimeKeeper();
    timeKeeper.record();
    const response = await adapter.sendRequest(provider, reqBody);
    timeKeeper.record();
    await recordApiCall(
      c,
      providerCfg.provider,
      200,
      timeKeeper.timestamps(),
      adapter.usage,
      providerCfg.pricing,
      undefined,
      false,
    );
    return c.json(response);
  });
});

export default rerankRouter;
