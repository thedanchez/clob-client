import { BuilderConfig } from "@polymarket/builder-signing-sdk";
import { SignatureType } from "@polymarket/order-utils";
import { config as dotenvConfig } from "dotenv";
import { ethers } from "ethers";
import { resolve } from "path";

import { type ApiKeyCreds, Chain, ClobClient } from "../src";

dotenvConfig({ path: resolve(__dirname, "../.env") });

async function main() {
  const wallet = new ethers.Wallet(`${process.env.PK}`);
  const chainId = parseInt(`${process.env.CHAIN_ID || Chain.AMOY}`) as Chain;
  console.log(`Address: ${await wallet.getAddress()}, chainId: ${chainId}`);

  const host = process.env.CLOB_API_URL || "http://localhost:8080";
  const creds: ApiKeyCreds = {
    key: `${process.env.CLOB_API_KEY}`,
    secret: `${process.env.CLOB_SECRET}`,
    passphrase: `${process.env.CLOB_PASS_PHRASE}`,
  };
  const builderConfig: BuilderConfig = new BuilderConfig({
    localBuilderCreds: {
      key: `${process.env.BUILDER_API_KEY}`,
      secret: `${process.env.BUILDER_SECRET}`,
      passphrase: `${process.env.BUILDER_PASS_PHRASE}`,
    },
  });
  const clobClient = new ClobClient(
    host,
    chainId,
    wallet,
    creds,
    SignatureType.EOA,
    undefined,
    undefined,
    undefined,
    builderConfig,
  );

  console.log(`Response: `);
  const resp = await clobClient.revokeBuilderApiKey();
  console.log(resp);
}

main();
