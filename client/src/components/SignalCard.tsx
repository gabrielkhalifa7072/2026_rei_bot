import { TradingSignal } from "@/types/signals";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SignalCardProps {
  signal: TradingSignal;
  onClick?: () => void;
}

export function SignalCard({ signal, onClick }: SignalCardProps) {
  const isCall = signal.direction === "call";
  const isHighConfidence = signal.confidence > 70;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-slate-900 border-slate-700 hover:border-slate-600"
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header: Asset + Direction */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-white">{signal.asset}</div>
            <Badge
              className={`${
                isCall
                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                  : "bg-red-500/20 text-red-400 border-red-500/50"
              } border`}
            >
              {isCall ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-1" />
              )}
              {isCall ? "CALL" : "PUT"}
            </Badge>
          </div>

          {/* Confidence Badge */}
          {isHighConfidence && (
            <div className="text-xs font-semibold px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/50">
              ⭐ Alta Confiança
            </div>
          )}
        </div>

        {/* Price + Time */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">Entrada: <span className="text-white font-semibold">${Number(signal.entryPrice).toFixed(5)}</span></div>
          <div className="text-slate-400">
            {format(new Date(signal.createdAt), "HH:mm:ss", { locale: ptBR })}
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Confidence */}
          <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
            <div className="text-slate-400">Confiança</div>
            <div className="text-lg font-bold text-blue-400">
              {signal.confidence.toFixed(1)}%
            </div>
          </div>

          {/* Strength */}
          <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
            <div className="text-slate-400">Força</div>
            <div className="text-lg font-bold text-purple-400">
              {(Number(signal.strength) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Timeframe */}
          <div className="bg-slate-800/50 rounded p-2 border border-slate-700">
            <div className="text-slate-400">TF</div>
            <div className="text-lg font-bold text-slate-300">{signal.timeframe}</div>
          </div>
        </div>

        {/* Pattern + Reasons Preview */}
        {signal.candlePattern && (
          <div className="text-xs bg-slate-800/30 rounded p-2 border border-slate-700">
            <div className="text-slate-400 mb-1">Padrão:</div>
            <div className="text-slate-200 font-semibold">{signal.candlePattern}</div>
          </div>
        )}

        {/* Reasons */}
        {signal.reasons && signal.reasons.length > 0 && (
          <div className="text-xs bg-slate-800/30 rounded p-2 border border-slate-700">
            <div className="text-slate-400 mb-1">Razões ({signal.reasons.length}):</div>
            <div className="space-y-1">
              {signal.reasons?.slice(0, 2).map((reason: string, idx: number) => (
                <div key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
              {signal.reasons.length > 2 && (
                <div className="text-slate-400 text-xs">
                  +{signal.reasons.length - 2} mais razões
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between text-xs">
          <Badge
            variant="outline"
            className={`${
              signal.status === "pending"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/50"
                : signal.status === "active"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/50"
                  : signal.status === "closed"
                    ? "bg-green-500/10 text-green-400 border-green-500/50"
                    : "bg-slate-500/10 text-slate-400 border-slate-500/50"
            }`}
          >
            {signal.status.toUpperCase()}
          </Badge>

          {signal.result !== "pending" && (
            <Badge
              className={`${
                signal.result === "win"
                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                  : signal.result === "loss"
                    ? "bg-red-500/20 text-red-400 border-red-500/50"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/50"
              } border`}
            >
              {signal.result === "win" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : signal.result === "loss" ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : null}
              {signal.result.toUpperCase()}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
