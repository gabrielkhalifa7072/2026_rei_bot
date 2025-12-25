import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { TradingSignal, SignalStats } from "@/types/signals";
import { SignalCard } from "@/components/SignalCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DirectionFilter } from "@/components/DirectionFilter";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Filter,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [stats, setStats] = useState<SignalStats | null>(null);
  const [filterAsset, setFilterAsset] = useState<string>("");
  const [filterDirection, setFilterDirection] = useState<"call" | "put" | "">(
    ""
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const { data: signalsData, refetch: refetchSignals } = trpc.signals.list.useQuery(
    {
      asset: filterAsset || undefined,
      direction: (filterDirection as "call" | "put") || undefined,
      limit: 50,
    },
    { enabled: false }
  );

  const { data: statsData, refetch: refetchStats } = trpc.signals.stats.useQuery(
    undefined,
    { enabled: false }
  );

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Recarregar quando filtros mudam
  useEffect(() => {
    loadData();
  }, [filterAsset, filterDirection]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [signalsResult, statsResult] = await Promise.all([
        refetchSignals(),
        refetchStats(),
      ]);

      if (signalsResult.data) {
        const convertedSignals = signalsResult.data.map((s: any) => ({
          ...s,
          entryPrice: Number(s.entryPrice),
          confidence: Number(s.confidence),
          strength: Number(s.strength),
          ema9: s.ema9 ? Number(s.ema9) : undefined,
          ema20: s.ema20 ? Number(s.ema20) : undefined,
          ema50: s.ema50 ? Number(s.ema50) : undefined,
          rsi: s.rsi ? Number(s.rsi) : undefined,
          adx: s.adx ? Number(s.adx) : undefined,
          bbUpper: s.bbUpper ? Number(s.bbUpper) : undefined,
          bbMiddle: s.bbMiddle ? Number(s.bbMiddle) : undefined,
          bbLower: s.bbLower ? Number(s.bbLower) : undefined,
          volumeRatio: s.volumeRatio ? Number(s.volumeRatio) : undefined,
          patternStrength: s.patternStrength ? Number(s.patternStrength) : undefined,
          reasons: s.reasons ? JSON.parse(s.reasons) : [],
          filters: s.filters ? JSON.parse(s.filters) : {},
          supportLevels: s.supportLevels ? JSON.parse(s.supportLevels) : [],
          resistanceLevels: s.resistanceLevels ? JSON.parse(s.resistanceLevels) : [],
        }));
        setSignals(convertedSignals);
      }
      if (statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const callSignals = signals.filter((s) => s.direction === "call");
  const putSignals = signals.filter((s) => s.direction === "put");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              2026 Rei
            </h1>
            <p className="text-slate-400 mt-1">
              Painel de Monitoramento de Sinais OTC em Tempo Real
            </p>
          </div>

          <Button
            onClick={loadData}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Sinais */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Sinais</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats.totalSignals}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </Card>

            {/* CALL Sinais */}
            <Card className="bg-green-500/10 border-green-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm">Sinais CALL</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {stats.callSignals}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>

            {/* PUT Sinais */}
            <Card className="bg-red-500/10 border-red-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm">Sinais PUT</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">
                    {stats.putSignals}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400 opacity-50" />
              </div>
            </Card>

            {/* Confiança Média */}
            <Card className="bg-blue-500/10 border-blue-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm">Confiança Média</p>
                  <p className="text-3xl font-bold text-blue-400 mt-2">
                    {stats.avgConfidence.toFixed(1)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </Card>

            {/* Ativos Monitorados */}
            <Card className="bg-purple-500/10 border-purple-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm">Ativos</p>
                  <p className="text-3xl font-bold text-purple-400 mt-2">
                    {Object.keys(stats.byAsset).length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Filter */}
            <Input
              placeholder="Filtrar por ativo (ex: EURUSD_otc)"
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />

            {/* Direction Filter */}
            <DirectionFilter
              value={filterDirection}
              onChange={setFilterDirection}
            />

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setFilterAsset("");
                setFilterDirection("");
              }}
              className="border-slate-700 hover:bg-slate-800"
            >
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Sinais Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Sinais Detectados ({signals.length})
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 border">
                CALL: {callSignals.length}
              </Badge>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 border">
                PUT: {putSignals.length}
              </Badge>
            </div>
          </div>

          {signals.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
              <p className="text-slate-400">Nenhum sinal detectado</p>
              <p className="text-slate-500 text-sm mt-2">
                Os sinais aparecerão aqui quando forem gerados pelo robô
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onClick={() => {
                    // TODO: Abrir modal com detalhes do sinal
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Ativos Monitorados */}
        {stats && Object.keys(stats.byAsset).length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold mb-4">Sinais por Ativo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(stats.byAsset).map(([asset, count]) => (
                <div
                  key={asset}
                  className="bg-slate-900/50 rounded p-3 border border-slate-700 text-center cursor-pointer hover:border-slate-600 transition-colors"
                  onClick={() => setFilterAsset(asset)}
                >
                  <p className="font-semibold text-white text-sm">{asset}</p>
                  <p className="text-slate-400 text-xs mt-1">{count} sinais</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
