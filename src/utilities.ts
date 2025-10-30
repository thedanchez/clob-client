import { Side as UtilsSide, type SignedOrder } from "@dschz/polymarket-clob-order-utils";

import { type NewOrder, type OrderBookSummary, OrderType, Side, type TickSize } from "./types";

/**
 * Warning: SHA-1 is now considered vulnerable and should not be used for cryptographic applications.
 */
type HashAlgorithm = "sha1" | "sha256" | "sha384" | "sha512";

export const isBrowser = () => {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
};

const createHash = async (algorithm: HashAlgorithm, data: string) => {
  if (isBrowser()) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#supported_algorithms
    const cryptoAlgorithm = {
      sha1: "SHA-1",
      sha256: "SHA-256",
      sha384: "SHA-384",
      sha512: "SHA-512",
    }[algorithm];

    const hashBuffer = await window.crypto.subtle.digest(cryptoAlgorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const crypto = await import("crypto");
  return crypto.createHash(algorithm).update(data).digest("hex");
};

export function orderToJson<T extends OrderType>(
  order: SignedOrder,
  owner: string,
  orderType: T,
  deferExec = false,
): NewOrder<T> {
  let side = Side.BUY;
  if (order.side == UtilsSide.BUY) {
    side = Side.BUY;
  } else {
    side = Side.SELL;
  }

  return {
    deferExec,
    order: {
      salt: parseInt(order.salt, 10),
      maker: order.maker,
      signer: order.signer,
      taker: order.taker,
      tokenId: order.tokenId,
      makerAmount: order.makerAmount,
      takerAmount: order.takerAmount,
      side,
      expiration: order.expiration,
      nonce: order.nonce,
      feeRateBps: order.feeRateBps,
      signatureType: order.signatureType,
      signature: order.signature,
    },
    owner,
    orderType,
  } as NewOrder<T>;
}

export const roundNormal = (num: number, decimals: number): number => {
  if (decimalPlaces(num) <= decimals) {
    return num;
  }
  return Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;
};

export const roundDown = (num: number, decimals: number): number => {
  if (decimalPlaces(num) <= decimals) {
    return num;
  }
  return Math.floor(num * 10 ** decimals) / 10 ** decimals;
};

export const roundUp = (num: number, decimals: number): number => {
  if (decimalPlaces(num) <= decimals) {
    return num;
  }
  return Math.ceil(num * 10 ** decimals) / 10 ** decimals;
};

export const decimalPlaces = (num: number): number => {
  if (Number.isInteger(num)) {
    return 0;
  }

  const arr = num.toString().split(".");
  if (arr.length <= 1) {
    return 0;
  }

  return arr[1]!.length;
};

/**
 * Calculates the hash for the given orderbook
 * @param orderbook
 * @returns Promise<string>
 */
export const generateOrderBookSummaryHash = async (
  orderbook: OrderBookSummary,
): Promise<string> => {
  orderbook.hash = "";
  const hash = await createHash("sha1", JSON.stringify(orderbook));
  orderbook.hash = hash;
  return hash;
};

export const isTickSizeSmaller = (a: TickSize, b: TickSize): boolean => {
  return parseFloat(a) < parseFloat(b);
};

export const priceValid = (price: number, tickSize: TickSize): boolean => {
  return price >= parseFloat(tickSize) && price <= 1 - parseFloat(tickSize);
};
