export type MakePayConfig = {
  baseUrl: string;
  checkoutBaseUrl: string;
  keyId: string;
  keySecret: string;
};

export function loadConfigFromEnv(env: NodeJS.ProcessEnv = process.env): MakePayConfig {
  const keyId = env.MAKEPAY_KEY_ID;
  const keySecret = env.MAKEPAY_KEY_SECRET;

  if (!keyId) {
    throw new Error("MAKEPAY_KEY_ID is required.");
  }

  if (!keySecret) {
    throw new Error("MAKEPAY_KEY_SECRET is required.");
  }

  return {
    baseUrl: trimTrailingSlash(env.MAKEPAY_BASE_URL || "https://www.makecrypto.io"),
    checkoutBaseUrl: trimTrailingSlash(env.MAKEPAY_CHECKOUT_BASE_URL || "https://makepay.io"),
    keyId,
    keySecret,
  };
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
