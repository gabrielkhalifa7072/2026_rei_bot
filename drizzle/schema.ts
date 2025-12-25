import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de sinais de trading gerados pelo robô
 * Armazena todos os sinais detectados com análise técnica completa
 */
export const tradingSignals = mysqlTable("trading_signals", {
  id: int("id").autoincrement().primaryKey(),
  asset: varchar("asset", { length: 50 }).notNull(), // ex: EURUSD_otc
  direction: mysqlEnum("direction", ["call", "put"]).notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 5 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  strength: decimal("strength", { precision: 3, scale: 2 }).notNull(), // 0-1
  timeframe: varchar("timeframe", { length: 10 }).default("1M").notNull(),
  
  // Indicadores técnicos
  ema9: decimal("ema_9", { precision: 10, scale: 5 }),
  ema20: decimal("ema_20", { precision: 10, scale: 5 }),
  ema50: decimal("ema_50", { precision: 10, scale: 5 }),
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  adx: decimal("adx", { precision: 5, scale: 2 }),
  bbUpper: decimal("bb_upper", { precision: 10, scale: 5 }),
  bbMiddle: decimal("bb_middle", { precision: 10, scale: 5 }),
  bbLower: decimal("bb_lower", { precision: 10, scale: 5 }),
  volumeRatio: decimal("volume_ratio", { precision: 5, scale: 2 }),
  
  // Padrão de velas
  candlePattern: varchar("candle_pattern", { length: 50 }),
  patternStrength: decimal("pattern_strength", { precision: 3, scale: 2 }),
  
  // Razões do sinal (JSON)
  reasons: text("reasons"), // JSON array de strings
  
  // Filtros aplicados (JSON)
  filters: text("filters"), // JSON object com status dos filtros
  
  // Suporte e resistência
  supportLevels: text("support_levels"), // JSON array
  resistanceLevels: text("resistance_levels"), // JSON array
  
  // Status e resultado
  status: mysqlEnum("status", ["pending", "active", "closed", "expired"]).default("pending").notNull(),
  result: mysqlEnum("result", ["win", "loss", "break_even", "pending"]).default("pending").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = typeof tradingSignals.$inferInsert;

/**
 * Tabela de histórico de operações
 * Rastreia o resultado de cada sinal executado
 */
export const signalHistory = mysqlTable("signal_history", {
  id: int("id").autoincrement().primaryKey(),
  signalId: int("signal_id").notNull(), // FK para trading_signals
  
  // Execução
  executedAt: timestamp("executed_at"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  
  // Resultado
  entryPrice: decimal("entry_price", { precision: 10, scale: 5 }),
  exitPrice: decimal("exit_price", { precision: 10, scale: 5 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  profitPercent: decimal("profit_percent", { precision: 5, scale: 2 }),
  
  // Duração
  duration: int("duration"), // em segundos
  
  // Notas
  notes: text("notes"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SignalHistory = typeof signalHistory.$inferSelect;
export type InsertSignalHistory = typeof signalHistory.$inferInsert;

/**
 * Tabela de configurações de ativos
 * Armazena configurações e status de monitoramento de cada ativo
 */
export const assetConfigs = mysqlTable("asset_configs", {
  id: int("id").autoincrement().primaryKey(),
  asset: varchar("asset", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  isMonitored: mysqlEnum("is_monitored", ["yes", "no"]).default("yes").notNull(),
  category: varchar("category", { length: 20 }), // forex, commodity, stock
  lastSignalAt: timestamp("last_signal_at"),
  totalSignals: int("total_signals").default(0).notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AssetConfig = typeof assetConfigs.$inferSelect;
export type InsertAssetConfig = typeof assetConfigs.$inferInsert;