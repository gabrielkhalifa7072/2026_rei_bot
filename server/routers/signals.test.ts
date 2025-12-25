import { describe, it, expect, beforeEach, vi } from "vitest";
import { signalsRouter } from "./signals";
import * as db from "../db";

// Mock do módulo de banco de dados
vi.mock("../db");

// Mock do módulo de notificação
vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Signals Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um novo sinal com dados válidos", async () => {
      const mockSignal = {
        id: 1,
        asset: "EURUSD_otc",
        direction: "call" as const,
        entryPrice: "1.08500",
        confidence: "85.50",
        strength: "0.92",
        timeframe: "1M",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createTradingSignal).mockResolvedValueOnce(mockSignal as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.create({
        asset: "EURUSD_otc",
        direction: "call",
        entryPrice: 1.085,
        confidence: 85.5,
        strength: 0.92,
        reasons: ["EMA cruzamento bullish", "RSI acima de 50"],
        filters: {
          volumeConfirmed: true,
          adxStrong: true,
          noDivergence: true,
        },
      });

      expect(result).toBeDefined();
      expect(vi.mocked(db.createTradingSignal)).toHaveBeenCalled();
    });

    it("deve notificar o proprietário se confiança > 70%", async () => {
      const { notifyOwner } = await import("../_core/notification");

      const mockSignal = {
        id: 1,
        asset: "Gold_otc",
        direction: "put" as const,
        entryPrice: "2050.00",
        confidence: "75.00",
        strength: "0.85",
        timeframe: "1M",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createTradingSignal).mockResolvedValueOnce(mockSignal as any);

      const caller = signalsRouter.createCaller({} as any);

      await caller.create({
        asset: "Gold_otc",
        direction: "put",
        entryPrice: 2050.0,
        confidence: 75.0,
        strength: 0.85,
        reasons: ["Resistência testada"],
        filters: { volumeConfirmed: true },
      });

      expect(notifyOwner).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("Gold_otc"),
          content: expect.stringContaining("75.0%"),
        })
      );
    });

    it("não deve notificar se confiança <= 70%", async () => {
      const { notifyOwner } = await import("../_core/notification");

      const mockSignal = {
        id: 1,
        asset: "GBPUSD_otc",
        direction: "call" as const,
        entryPrice: "1.27500",
        confidence: "65.00",
        strength: "0.75",
        timeframe: "1M",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createTradingSignal).mockResolvedValueOnce(mockSignal as any);

      const caller = signalsRouter.createCaller({} as any);

      await caller.create({
        asset: "GBPUSD_otc",
        direction: "call",
        entryPrice: 1.275,
        confidence: 65.0,
        strength: 0.75,
        reasons: ["EMA 9 acima de EMA 20"],
        filters: { volumeConfirmed: false },
      });

      expect(notifyOwner).not.toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("deve retornar lista de sinais", async () => {
      const mockSignals = [
        {
          id: 1,
          asset: "EURUSD_otc",
          direction: "call" as const,
          entryPrice: "1.08500",
          confidence: "85.50",
          strength: "0.92",
          timeframe: "1M",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          asset: "Gold_otc",
          direction: "put" as const,
          entryPrice: "2050.00",
          confidence: "72.00",
          strength: "0.80",
          timeframe: "1M",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getTradingSignals).mockResolvedValueOnce(mockSignals as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.list({
        limit: 50,
        offset: 0,
      });

      expect(result).toHaveLength(2);
      expect(result[0].asset).toBe("EURUSD_otc");
      expect(result[1].asset).toBe("Gold_otc");
    });

    it("deve filtrar sinais por ativo", async () => {
      const mockSignals = [
        {
          id: 1,
          asset: "EURUSD_otc",
          direction: "call" as const,
          entryPrice: "1.08500",
          confidence: "85.50",
          strength: "0.92",
          timeframe: "1M",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getTradingSignals).mockResolvedValueOnce(mockSignals as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.list({
        asset: "EURUSD_otc",
        limit: 50,
        offset: 0,
      });

      expect(vi.mocked(db.getTradingSignals)).toHaveBeenCalledWith(
        expect.objectContaining({
          asset: "EURUSD_otc",
        })
      );
      expect(result).toHaveLength(1);
    });

    it("deve filtrar sinais por direção", async () => {
      const mockSignals = [
        {
          id: 1,
          asset: "EURUSD_otc",
          direction: "call" as const,
          entryPrice: "1.08500",
          confidence: "85.50",
          strength: "0.92",
          timeframe: "1M",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getTradingSignals).mockResolvedValueOnce(mockSignals as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.list({
        direction: "call",
        limit: 50,
        offset: 0,
      });

      expect(vi.mocked(db.getTradingSignals)).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: "call",
        })
      );
    });
  });

  describe("getById", () => {
    it("deve retornar um sinal por ID", async () => {
      const mockSignal = {
        id: 1,
        asset: "EURUSD_otc",
        direction: "call" as const,
        entryPrice: "1.08500",
        confidence: "85.50",
        strength: "0.92",
        timeframe: "1M",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getTradingSignalById).mockResolvedValueOnce(mockSignal as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.getById({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.asset).toBe("EURUSD_otc");
      expect(vi.mocked(db.getTradingSignalById)).toHaveBeenCalledWith(1);
    });

    it("deve retornar null se sinal não existe", async () => {
      vi.mocked(db.getTradingSignalById).mockResolvedValueOnce(null);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.getById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("stats", () => {
    it("deve retornar estatísticas de sinais", async () => {
      const mockStats = {
        totalSignals: 10,
        callSignals: 6,
        putSignals: 4,
        avgConfidence: 78.5,
        byAsset: {
          EURUSD_otc: 3,
          Gold_otc: 4,
          GBPUSD_otc: 3,
        },
      };

      vi.mocked(db.getSignalStats).mockResolvedValueOnce(mockStats);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.stats();

      expect(result.totalSignals).toBe(10);
      expect(result.callSignals).toBe(6);
      expect(result.putSignals).toBe(4);
      expect(result.avgConfidence).toBe(78.5);
      expect(Object.keys(result.byAsset)).toHaveLength(3);
    });
  });

  describe("assets", () => {
    it("deve retornar lista de ativos configurados", async () => {
      const mockAssets = [
        {
          id: 1,
          asset: "EURUSD_otc",
          name: "EUR/USD OTC",
          isMonitored: "yes" as const,
          category: "forex",
          totalSignals: 5,
          winRate: 60,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          asset: "Gold_otc",
          name: "Ouro OTC",
          isMonitored: "yes" as const,
          category: "commodity",
          totalSignals: 3,
          winRate: 66.67,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAssetConfigs).mockResolvedValueOnce(mockAssets as any);

      const caller = signalsRouter.createCaller({} as any);

      const result = await caller.assets();

      expect(result).toHaveLength(2);
      expect(result[0].asset).toBe("EURUSD_otc");
      expect(result[1].asset).toBe("Gold_otc");
    });
  });
});
