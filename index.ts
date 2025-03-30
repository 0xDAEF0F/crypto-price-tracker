#!/usr/bin/env bun

import { fetch } from "bun";

const HL_BASE_URL = "https://api.hyperliquid.xyz";
const ONE_DAY_MS = 86400 * 1000;

async function fetchHlSnapshot(coin: string, interval: string): Promise<any> {
  const now = Date.now();
  return fetch(`${HL_BASE_URL}/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "candleSnapshot",
      req: {
        coin,
        interval,
        startTime: now - ONE_DAY_MS,
        endTime: now,
      },
    }),
  }).then((res) => res.json());
}

let btcSnapshot: any;
let solSnapshot: any;
try {
  const [btcSnapshot_, solSnapshot_] = await Promise.all([
    fetchHlSnapshot("BTC", "1m"),
    fetchHlSnapshot("SOL", "1m"),
  ]);
  btcSnapshot = btcSnapshot_;
  solSnapshot = solSnapshot_;
} catch (error) {
  console.error("Error retrieving snapshots", error);
  process.exit(1);
}

btcSnapshot.sort((a: any, b: any) => a.t - b.t);
solSnapshot.sort((a: any, b: any) => a.t - b.t);

const btcT0ClosingPrice = +btcSnapshot[0]?.c!;
const btcT1ClosingPrice = +btcSnapshot[btcSnapshot.length - 1]?.c!;

const solT0ClosingPrice = +solSnapshot[0]?.c!;
const solT1ClosingPrice = +solSnapshot[solSnapshot.length - 1]?.c!;

const btcPriceChange = btcT1ClosingPrice - btcT0ClosingPrice;
const btcPriceChangePct = (btcPriceChange / btcT0ClosingPrice) * 100;

const solPriceChange = solT1ClosingPrice - solT0ClosingPrice;
const solPriceChangePct = (solPriceChange / solT0ClosingPrice) * 100;

const data = {
  btc: {
    price: Math.round(btcT1ClosingPrice),
    priceAbbr: (Math.round(btcT1ClosingPrice) / 1000).toFixed(2) + "k",
    priceChange: btcPriceChange,
    priceChangePct: +btcPriceChangePct.toFixed(2),
  },
  sol: {
    price: Math.round(solT1ClosingPrice),
    priceChange: solPriceChange,
    priceChangePct: +solPriceChangePct.toFixed(2),
  },
};

console.log(JSON.stringify(data));
process.exit(0);
