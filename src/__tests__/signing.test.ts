import { Wallet } from "@ethersproject/wallet";
import { beforeEach, describe, expect, it } from "bun:test";

import { buildClobEip712Signature } from "../signing/eip712";
import { buildPolyHmacSignature } from "../signing/hmac";
import { Chain } from "../types";

describe("eip712", () => {
  let wallet: Wallet;
  beforeEach(() => {
    // publicly known private key
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    wallet = new Wallet(privateKey);
  });

  it("buildClobEip712Signature", async () => {
    const signature = await buildClobEip712Signature(wallet, Chain.AMOY, 10000000, 23);
    expect(signature).not.toBeNull();
    expect(signature).not.toBeUndefined();
    expect(signature).not.toBeEmpty();
    expect(signature).toEqual(
      "0xf62319a987514da40e57e2f4d7529f7bac38f0355bd88bb5adbb3768d80de6c1682518e0af677d5260366425f4361e7b70c25ae232aff0ab2331e2b164a1aedc1b",
    );
  });
});

describe("[SIGNING] hmac", () => {
  const testSecret = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  const testTimestamp = 1000000;
  const testMethod = "test-sign";
  const testPath = "/orders";
  const testBody = '{"hash": "0x123"}';

  it("produces same result in server and browser environments", async () => {
    const nodeSignature = await buildPolyHmacSignature(
      testSecret,
      testTimestamp,
      testMethod,
      testPath,
      testBody,
    );

    expect(nodeSignature).toEqual("ZwAdJKvoYRlEKDkNMwd5BuwNNtg93kNaR_oU2HrfVvc=");

    // Create JSDOM environment to simulate browser
    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM("", {
      url: "https://localhost",
      pretendToBeVisual: true,
      resources: "usable",
    });

    // Store original window
    const originalWindow = (globalThis as any).window;

    try {
      // Set up browser-like environment
      (globalThis as any).window = dom.window;

      // Polyfill Web Crypto API using Node.js webcrypto
      const { webcrypto } = await import("crypto");
      Object.defineProperty(dom.window, "crypto", {
        value: {
          ...dom.window.crypto,
          subtle: webcrypto.subtle,
        },
        writable: true,
        configurable: true,
      });

      // Test in browser environment
      const browserSignature = await buildPolyHmacSignature(
        testSecret,
        testTimestamp,
        testMethod,
        testPath,
        testBody,
      );

      // Both implementations should produce the same result
      expect(browserSignature).toEqual(nodeSignature);
      expect(browserSignature).toEqual("ZwAdJKvoYRlEKDkNMwd5BuwNNtg93kNaR_oU2HrfVvc=");
    } finally {
      // Cleanup: restore original environment
      if (originalWindow) {
        (globalThis as any).window = originalWindow;
      } else {
        delete (globalThis as any).window;
      }

      dom.window.close();
    }
  });
});
