# Polymarket CLOB Client (@dschz)

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![npm](https://img.shields.io/npm/v/@dschz/polymarket-clob-client?color=blue)](https://www.npmjs.com/package/@dschz/polymarket-clob-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/polymarket-clob-client)](https://bundlephobia.com/package/@dschz/polymarket-clob-client)
[![CI](https://github.com/dsnchz/polymarket-clob-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/polymarket-clob-client/actions/workflows/ci.yaml)

> Fork of Polymarket CLOB Client: [GitHub](https://github.com/Polymarket/clob-client) / [NPM](https://www.npmjs.com/package/@polymarket/clob-client)

Typescript client for the Polymarket Central Limit Order Book (CLOB) API.

## What's Different in This Fork

This fork provides several key improvements over the original:

- **Runtime-Adaptive Crypto APIs**: Dynamically uses the appropriate cryptographic APIs based on the runtime environment (Node.js vs browser), ensuring optimal compatibility and performance
- **Optimized Bundle Size**: Significantly reduced bundle size for browser applications - approximately 50% smaller than the original package, making it ideal for web dApps with strict size constraints
- **Enhanced Web3 Integration**: Added utilities like `createSignerForProvider` that provide seamless integration with native EIP-1193 providers (MetaMask, WalletConnect, etc.) without requiring additional adapter libraries

## Installation

```bash
npm install @dschz/polymarket-clob-client
pnpm install @dschz/polymarket-clob-client
yarn install @dschz/polymarket-clob-client
bun install @dschz/polymarket-clob-client
```

### Web dApps / Vite Configuration

When bundling with Vite, you'll need to add Node.js polyfills for cryptographic operations and event handling. The library's underlying dependencies (ethers, crypto libraries) require `buffer` and `events` polyfills to function properly in browser environments. Install the required polyfills:

```bash
npm install buffer events
pnpm install buffer events
yarn install buffer events
bun install buffer events
```

Then update your `vite.config.ts` to help the dev server reference the `buffer` polyfill:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  // When running your Vite dev server, you may see browser warnings regarding Buffer.
  // The optimizeDeps and resolve aliases for buffer should take care of them
  optimizeDeps: {
    include: ["buffer"],
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      buffer: "buffer/",
      "node:buffer": "buffer/",
    },
  },
});
```

## Usage

💡 When creating a `ClobClient` instance, the following defaults are used for unspecified parameters:

- **host**: `"https://clob.polymarket.com"` (Polymarket production API)
- **chainId**: `137` (Polygon mainnet)
- **signatureType**: `0` (EOA - Externally Owned Account)
- **funderAddress**: Defaults to the `signer` address when not provided

This means you can create a minimal, _read-only_ client with just `new ClobClient()` which will hit Polygon mainnet. If you want to place trades on mainnet, then you need to configure both `signer` and `creds` via `new ClobClient({ signer, creds })` which you can see the examples configure below.

#### Browser Environment with Wallet Providers

The CLOB client supports various wallet providers in web browsers. Use the `createSignerForProvider` utility to create a signer from any EIP-1193 compatible provider:

```ts
import {
  ClobClient,
  createSignerForProvider,
  OrderType,
  Side,
} from "@dschz/polymarket-clob-client";

// Example 1: MetaMask
if (window.ethereum) {
  const signer = createSignerForProvider(window.ethereum);
  // Get API key derived from signer for Polygon mainnet
  const creds = await new ClobClient({ signer }).createOrDeriveApiKey();
  // Defaults to Polygon mainnet, signer funderAddress, signature type 0 for EOA
  const clobClient = new ClobClient({ signer, creds });

  // Place an order
  const order = await clobClient.createAndPostOrder(
    {
      tokenID: "your-token-id",
      price: 0.6,
      side: Side.BUY,
      size: 10,
    },
    { tickSize: "0.01", negRisk: false },
    OrderType.GTC,
  );
}
```

#### With Privy

Works seamlessly with [Privy](https://privy.io/) embedded wallets:

```ts
import { usePrivy } from "@privy-io/react-auth";
import { ClobClient, createSignerForProvider } from "@dschz/polymarket-clob-client";

function TradingComponent() {
  const { authenticated, getEthereumProvider } = usePrivy();

  if (authenticated) {
    const provider = await getEthereumProvider();
    const signer = createSignerForProvider(provider);

    const creds = await new ClobClient({ signer }).createOrDeriveApiKey();
    const clobClient = new ClobClient({ signer, creds });

    // Use clobClient for trading...
  }
}
```

#### Node.js Environment

For server-side or Node.js applications with private keys:

```ts
import { ClobClient, OrderType, Side } from "@dschz/polymarket-clob-client";
import { Wallet } from "@ethersproject/wallet";

const funder = "0x..."; // Your Polymarket Profile Address
const signer = new Wallet("your-private-key"); // Your private key

const creds = await new ClobClient({ signer }).createOrDeriveApiKey();
const clobClient = new ClobClient({
  signer,
  creds,
  signatureType: 1,
  funderAddress: funder,
});

const order = await clobClient.createAndPostOrder(
  {
    tokenID: "your-token-id",
    price: 0.01,
    side: Side.BUY,
    size: 5,
  },
  { tickSize: "0.001", negRisk: false },
  OrderType.GTC,
);
```

#### Signature Types

- `0`: Browser Wallet (MetaMask, Coinbase Wallet, WalletConnect, etc.)
- `1`: Magic/Email Login or Server-side private key signing

See [examples](examples/) for more information
