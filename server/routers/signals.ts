import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createTradingSignal,
  getTradingSignals,
  getTradingSignalById,
  getSignalStats,
  getAssetConfigs,
} from "../db";
import { notifyOwner } from "../_core/notification";

export const signalsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        asset: z.string().min(1),
        direction: z.union([z.literal("call"), z.literal("put")]),
        entryPrice: z.number(),
        confidence: z.number(),
        strength: z.number(),
        reasons: z.array(z.string()),
        filters: z.record(z.string(), z.boolean()),
        ema9: z.number().optional(),
        ema20: z.number().optional(),
        ema50: z.number().optional(),
        rsi: z.number().optional(),
        adx: z.number().optional(),
        bbUpper: z.number().optional(),
        bbMiddle: z.number().optional(),
        bbLower: z.number().optional(),
        volumeRatio: z.number().optional(),
        candlePattern: z.string().optional(),
        patternStrength: z.number().optional(),
        supportLevels: z.array(z.number()).optional(),
        resistanceLevels: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const signal = await createTradingSignal({
        asset: input.asset,
        direction: input.direction,
        entryPrice: input.entryPrice.toString(),
        confidence: input.confidence.toString(),
        strength: input.strength.toString(),
        reasons: JSON.stringify(input.reasons),
        filters: JSON.stringify(input.filters),
        ema9: input.ema9?.toString(),
        ema20: input.ema20?.toString(),
        ema50: input.ema50?.toString(),
        rsi: input.rsi?.toString(),
        adx: input.adx?.toString(),
        bbUpper: input.bbUpper?.toString(),
        bbMiddle: input.bbMiddle?.toString(),
        bbLower: input.bbLower?.toString(),
        volumeRatio: input.volumeRatio?.toString(),
        candlePattern: input.candlePattern,
        patternStrength: input.patternStrength?.toString(),
        supportLevels: input.supportLevels
          ? JSON.stringify(input.supportLevels)
          : undefined,
        resistanceLevels: input.resistanceLevels
          ? JSON.stringify(input.resistanceLevels)
          : undefined,
      });

      // Notificar proprietário se confiança > 70%
      if (input.confidence > 70) {
        await notifyOwner({
          title: `🎯 Novo Sinal de Alta Confiança: ${input.asset}`,
          content: `Direção: ${input.direction.toUpperCase()}\nConfiança: ${input.confidence.toFixed(1)}%\nForça: ${(input.strength * 100).toFixed(0)}%\nPreço: $${input.entryPrice.toFixed(5)}\nHorário: ${new Date().toLocaleTimeString()}`,
        });
      }

      return signal;
    }),

  list: publicProcedure
    .input(
      z.object({
        asset: z.string().optional(),
        direction: z.union([z.literal("call"), z.literal("put")]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return getTradingSignals({
        asset: input.asset,
        direction: input.direction,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getTradingSignalById(input.id);
    }),

  stats: publicProcedure.query(async () => {
    return getSignalStats();
  }),

  assets: publicProcedure.query(async () => {
    return getAssetConfigs();
  }),
});
