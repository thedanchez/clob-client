# Polymarket CLOB Client (@dschz)

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![npm](https://img.shields.io/npm/v/@dschz/polymarket-clob-client?color=blue)](https://www.npmjs.com/package/@dschz/polymarket-clob-client)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/polymarket-clob-client)](https://bundlephobia.com/package/@dschz/polymarket-clob-client)
[![CI](https://github.com/dsnchz/polymarket-clob-client/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/polymarket-clob-client/actions/workflows/ci.yaml)

Fork of [Polymarket CLOB Client](https://github.com/Polymarket/clob-client).

Typescript client for the Polymarket CLOB

## Installation

```bash
npm install @dschz/polymarket-clob-client
pnpm install @dschz/polymarket-clob-client
yarn install @dschz/polymarket-clob-client
bun install @dschz/polymarket-clob-client
```

### Usage

#### Browser Environment with Wallet Providers

The CLOB client supports various wallet providers in web browsers. Use the `createSignerForProvider` utility to create a signer from any EIP-1193 compatible provider:

```ts
import {
  ClobClient,
  createSignerForProvider,
  OrderType,
  Side,
} from "@dschz/polymarket-clob-client";

const host = "https://clob.polymarket.com";
const chainId = 137; // Polygon mainnet

// Example 1: MetaMask
if (window.ethereum) {
  const signer = createSignerForProvider(window.ethereum);
  const funder = await signer.getAddress(); // Use connected wallet address

  const creds = await new ClobClient(host, chainId, signer).createOrDeriveApiKey();
  const clobClient = new ClobClient(host, chainId, signer, creds, 0, funder);

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

#### With Viem

If you're using [viem](https://viem.sh/) as your Ethereum library, the client seamlessly supports viem providers:

```ts
import { createWalletClient, custom } from "viem";
import { polygon } from "viem/chains";
import { ClobClient, createSignerForProvider } from "@dschz/polymarket-clob-client";

// Create viem wallet client
const walletClient = createWalletClient({
  chain: polygon,
  transport: custom(window.ethereum),
});

// Convert viem provider to ethers signer
const signer = createSignerForProvider(walletClient.transport);
const funder = await signer.getAddress();

const creds = await new ClobClient(host, 137, signer).createOrDeriveApiKey();
const clobClient = new ClobClient(host, 137, signer, creds, 0, funder);
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
    const funder = await signer.getAddress();

    const creds = await new ClobClient(host, 137, signer).createOrDeriveApiKey();
    const clobClient = new ClobClient(host, 137, signer, creds, 0, funder);

    // Use clobClient for trading...
  }
}
```

#### Node.js Environment

For server-side or Node.js applications with private keys:

```ts
import { ClobClient, OrderType, Side } from "@dschz/polymarket-clob-client";
import { Wallet } from "@ethersproject/wallet";

const host = "https://clob.polymarket.com";
const funder = "0x..."; // Your Polymarket Profile Address
const signer = new Wallet("your-private-key"); // Your private key

const creds = await new ClobClient(host, 137, signer).createOrDeriveApiKey();
const clobClient = new ClobClient(host, 137, signer, creds, 1, funder);

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
