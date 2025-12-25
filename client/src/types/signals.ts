export interface TradingSignal {
  id: number;
  asset: string;
  direction: "call" | "put";
  entryPrice: string | number;
  confidence: number;
  strength: number;
  timeframe: string;
  ema9?: string | number;
  ema20?: string | number;
  ema50?: string | number;
  rsi?: string | number;
  adx?: string | number;
  bbUpper?: string | number;
  bbMiddle?: string | number;
  bbLower?: string | number;
  volumeRatio?: string | number;
  candlePattern?: string;
  patternStrength?: string | number;
  reasons?: string[];
  filters?: Record<string, boolean>;
  supportLevels?: number[];
  resistanceLevels?: number[];
  status: "pending" | "active" | "closed" | "expired";
  result: "win" | "loss" | "break_even" | "pending";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SignalStats {
  totalSignals: number;
  callSignals: number;
  putSignals: number;
  avgConfidence: number;
  byAsset: Record<string, number>;
}

export interface AssetConfig {
  id: number;
  asset: string;
  name?: string;
  isMonitored: "yes" | "no";
  category?: string;
  lastSignalAt?: Date | string;
  totalSignals: number;
  winRate: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
