import type {
  LMRouterConfigModelProvider,
  LMRouterConfigProviderKey,
} from "../types/config.js";

/**
 * Implements a smooth weighted round-robin load balancer.
 * This ensures a smooth and predictable distribution of requests based on provider weights,
 * avoiding the potential for request bursts that can occur with purely random selection.
 *
 * The state (current weights) is stored in a global map, making it suitable for
 * single-process environments.
 */
export class LoadBalancer {
  // state_key -> current_weight
  private static providerWeights = new Map<string, number>();
  private static keyWeights = new Map<string, number>();

  public static getOrderedProviders(
    providers: LMRouterConfigModelProvider[],
  ): LMRouterConfigModelProvider[] {
    if (!providers || providers.length === 0) {
      return [];
    }

    if (providers.length === 1) {
      return providers;
    }

    const totalWeight = providers.reduce((acc, p) => acc + (p.weight ?? 1), 0);

    // Find the provider with the highest current weight
    let bestProvider: LMRouterConfigModelProvider | null = null;
    let maxWeight = -Infinity;

    for (const provider of providers) {
      const providerId = `${provider.provider}:${provider.model}`;
      const currentWeight = this.providerWeights.get(providerId) ?? 0;
      const newWeight = currentWeight + (provider.weight ?? 1);
      this.providerWeights.set(providerId, newWeight);

      if (newWeight > maxWeight) {
        maxWeight = newWeight;
        bestProvider = provider;
      }
    }

    if (bestProvider) {
      const providerId = `${bestProvider.provider}:${bestProvider.model}`;
      // Decrease the best provider's weight by the total weight
      this.providerWeights.set(providerId, maxWeight - totalWeight);

      // Sort providers to try the best one first, then the rest
      return [...providers].sort((a, b) =>
        a === bestProvider ? -1 : b === bestProvider ? 1 : 0,
      );
    }

    // Fallback to the original list if something goes wrong
    return providers;
  }

  public static getApiKey(
    providerName: string,
    keys?: LMRouterConfigProviderKey[],
  ): string | undefined {
    if (!keys || keys.length === 0) {
      return undefined;
    }

    if (keys.length === 1) {
      return keys[0].api_key;
    }

    const totalWeight = keys.reduce((acc, key) => acc + (key.weight ?? 1), 0);

    let bestKey: LMRouterConfigProviderKey | null = null;
    let maxWeight = -Infinity;

    for (const key of keys) {
      // Use a unique ID for each key within a provider
      const keyId = `${providerName}:${key.api_key.slice(-4)}`;
      const currentWeight = this.keyWeights.get(keyId) ?? 0;
      const newWeight = currentWeight + (key.weight ?? 1);
      this.keyWeights.set(keyId, newWeight);

      if (newWeight > maxWeight) {
        maxWeight = newWeight;
        bestKey = key;
      }
    }

    if (bestKey) {
      const keyId = `${providerName}:${bestKey.api_key.slice(-4)}`;
      // Decrease the best key's weight by the total weight
      this.keyWeights.set(keyId, maxWeight - totalWeight);
      return bestKey.api_key;
    }

    // Fallback to the last key if something goes wrong
    return keys[keys.length - 1].api_key;
  }
}
