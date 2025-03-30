#!/usr/bin/env bun

import { Hyperliquid, type CandleSnapshot } from "hyperliquid";

const ONE_DAY_MS = 86400 * 1000;

const hl = new Hyperliquid({
  enableWs: false,
});

let btcSnapshot: CandleSnapshot;
let solSnapshot: CandleSnapshot;

try {
  const nowMs = Date.now();
  const yesterdayMs = nowMs - ONE_DAY_MS;

  const [btcSnapshot_, solSnapshot_] = await Promise.all([
    hl.info.getCandleSnapshot("BTC-PERP", "1m", yesterdayMs, nowMs),
    hl.info.getCandleSnapshot("SOL-PERP", "1m", yesterdayMs, nowMs),
  ]);
  btcSnapshot = btcSnapshot_;
  solSnapshot = solSnapshot_;
} catch (e: unknown) {
  console.error("Error retrieving snapshots", e);
  process.exit(1);
}

btcSnapshot.sort((a, b) => a.t - b.t);
solSnapshot.sort((a, b) => a.t - b.t);

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
    priceAbbr: (Math.round(btcT1ClosingPrice) / 1000).toFixed(1) + "k",
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
