import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tradingSignals,
  InsertTradingSignal,
  signalHistory,
  InsertSignalHistory,
  assetConfigs,
  InsertAssetConfig,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Criar novo sinal de trading
 */
export async function createTradingSignal(signal: InsertTradingSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tradingSignals).values(signal);
  return result;
}

/**
 * Obter sinais com filtros
 */
export async function getTradingSignals(filters?: {
  asset?: string;
  direction?: "call" | "put";
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allSignals = await db.select().from(tradingSignals);
  
  let filtered = allSignals;
  
  if (filters?.asset) {
    filtered = filtered.filter((s) => s.asset === filters.asset);
  }
  if (filters?.direction) {
    filtered = filtered.filter((s) => s.direction === filters.direction);
  }
  if (filters?.status) {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  return filtered
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}

/**
 * Obter sinal por ID
 */
export async function getTradingSignalById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(tradingSignals)
    .where(eq(tradingSignals.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Atualizar sinal
 */
export async function updateTradingSignal(
  id: number,
  updates: Partial<InsertTradingSignal>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(tradingSignals)
    .set(updates)
    .where(eq(tradingSignals.id, id));
}

/**
 * Obter estatísticas de sinais
 */
export async function getSignalStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allSignals = await db.select().from(tradingSignals);
  const totalSignals = allSignals.length;
  const callSignals = allSignals.filter((s) => s.direction === "call").length;
  const putSignals = allSignals.filter((s) => s.direction === "put").length;
  const avgConfidence =
    totalSignals > 0
      ? allSignals.reduce((sum, s) => sum + Number(s.confidence), 0) / totalSignals
      : 0;

  // Agrupar por ativo
  const byAsset: Record<string, number> = {};
  allSignals.forEach((s) => {
    byAsset[s.asset] = (byAsset[s.asset] || 0) + 1;
  });

  return {
    totalSignals,
    callSignals,
    putSignals,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    byAsset,
  };
}

/**
 * Adicionar histórico de sinal
 */
export async function createSignalHistory(history: InsertSignalHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(signalHistory).values(history);
}

/**
 * Obter histórico de um sinal
 */
export async function getSignalHistoryBySignalId(signalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(signalHistory)
    .where(eq(signalHistory.signalId, signalId));
}

/**
 * Configurar ativo
 */
export async function upsertAssetConfig(config: InsertAssetConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!config.asset) throw new Error("Asset is required");

  const existing = await db
    .select()
    .from(assetConfigs)
    .where(eq(assetConfigs.asset, config.asset))
    .limit(1);

  if (existing.length > 0) {
    return db
      .update(assetConfigs)
      .set(config)
      .where(eq(assetConfigs.asset, config.asset));
  } else {
    return db.insert(assetConfigs).values(config);
  }
}

/**
 * Obter configurações de ativos
 */
export async function getAssetConfigs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(assetConfigs).orderBy(assetConfigs.asset);
}

// TODO: add feature queries here as your schema grows.
