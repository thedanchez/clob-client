import { Wallet } from "@ethersproject/wallet";
import { beforeEach, describe, expect, it } from "bun:test";

import { buildClobEip712Signature } from "../../src/signing/eip712";
import { Chain } from "../../src/types";

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
