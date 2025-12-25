import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { TradingSignal } from "@/types/signals";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DirectionFilter } from "@/components/DirectionFilter";
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function SignalHistory() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [filterAsset, setFilterAsset] = useState<string>("");
  const [filterDirection, setFilterDirection] = useState<"call" | "put" | "">(
    ""
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: signalsData, refetch: refetchSignals } = trpc.signals.list.useQuery(
    {
      asset: filterAsset || undefined,
      direction: (filterDirection as "call" | "put") || undefined,
      limit: 100,
    },
    { enabled: false }
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filterAsset, filterDirection]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const result = await refetchSignals();

      if (result.data) {
        const convertedSignals = result.data.map((s: any) => ({
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
    } catch (error) {
      toast.error("Erro ao carregar histórico");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Data/Hora",
      "Ativo",
      "Direção",
      "Preço",
      "Confiança",
      "Força",
      "Status",
      "Resultado",
    ];

    const rows = signals.map((s) => [
      format(new Date(s.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
      s.asset,
      s.direction.toUpperCase(),
      Number(s.entryPrice).toFixed(5),
      Number(s.confidence).toFixed(2) + "%",
      (Number(s.strength) * 100).toFixed(0) + "%",
      s.status,
      s.result,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `historico-sinais-${format(new Date(), "dd-MM-yyyy-HHmmss")}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Histórico exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Sinais</h1>
            <p className="text-slate-400 mt-1">
              Visualize todos os sinais gerados e seus resultados
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={exportToCSV}
              disabled={signals.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>

            <Button
              onClick={loadData}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Filtrar por ativo"
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />

            <DirectionFilter
              value={filterDirection}
              onChange={setFilterDirection}
            />

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

        {/* Tabela de Histórico */}
        {signals.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum sinal no histórico</p>
            <p className="text-slate-500 text-sm mt-2">
              Os sinais aparecerão aqui quando forem gerados
            </p>
          </Card>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">
                      Ativo
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-300">
                      Direção
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-300">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-300">
                      Confiança
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-300">
                      Força
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-300">
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {signals.map((signal) => (
                    <tr
                      key={signal.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-300">
                        {format(new Date(signal.createdAt), "dd/MM/yyyy HH:mm:ss", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {signal.asset}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={`${
                            signal.direction === "call"
                              ? "bg-green-500/20 text-green-400 border-green-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          } border`}
                        >
                          {signal.direction === "call" ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          )}
                          {signal.direction.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300">
                        ${(signal.entryPrice as number).toFixed(5)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-400 font-semibold">
                          {Number(signal.confidence).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-purple-400 font-semibold">
                          {(Number(signal.strength) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      </td>
                      <td className="px-6 py-4 text-center">
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
                            {signal.result.toUpperCase()}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo */}
            <div className="bg-slate-900/50 border-t border-slate-700 px-6 py-4">
              <p className="text-slate-400 text-sm">
                Total de sinais: <span className="text-white font-semibold">{signals.length}</span>
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
