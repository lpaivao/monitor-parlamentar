import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { BadgeDollarSign, CalendarDays, ChevronLeft, Megaphone, Shapes } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "../components/ui/chart";
import { SelectField } from "../components/ui/SelectField";
import { Spinner } from "../components/ui/spinner";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { useDespesasParlamentarQuery } from "../hooks/useDespesasParlamentarQuery";
import { useParlamentarQuery } from "../hooks/useParlamentarQuery";
import { muiPtBrLocaleText } from "../lib/muiGridLocale";
import type { Despesa } from "../types";
import { ANOS, formatBRL, MESES } from "../utils";

const mesChartConfig = {
  despesas: {
    label: "Gastos",
    color: "#006d40",
  },
} satisfies ChartConfig;

const ESTADOS_BRASIL = [
  { nome: "Acre", sigla: "AC" },
  { nome: "Alagoas", sigla: "AL" },
  { nome: "Amapá", sigla: "AP" },
  { nome: "Amazonas", sigla: "AM" },
  { nome: "Bahia", sigla: "BA" },
  { nome: "Ceará", sigla: "CE" },
  { nome: "Distrito Federal", sigla: "DF" },
  { nome: "Espírito Santo", sigla: "ES" },
  { nome: "Goiás", sigla: "GO" },
  { nome: "Maranhão", sigla: "MA" },
  { nome: "Mato Grosso", sigla: "MT" },
  { nome: "Mato Grosso do Sul", sigla: "MS" },
  { nome: "Minas Gerais", sigla: "MG" },
  { nome: "Pará", sigla: "PA" },
  { nome: "Paraíba", sigla: "PB" },
  { nome: "Paraná", sigla: "PR" },
  { nome: "Pernambuco", sigla: "PE" },
  { nome: "Piauí", sigla: "PI" },
  { nome: "Rio de Janeiro", sigla: "RJ" },
  { nome: "Rio Grande do Norte", sigla: "RN" },
  { nome: "Rio Grande do Sul", sigla: "RS" },
  { nome: "Rondônia", sigla: "RO" },
  { nome: "Roraima", sigla: "RR" },
  { nome: "Santa Catarina", sigla: "SC" },
  { nome: "São Paulo", sigla: "SP" },
  { nome: "Sergipe", sigla: "SE" },
  { nome: "Tocantins", sigla: "TO" },
];

export default function ParlamentarPage() {
  const { id } = useParams<{ id: string }>();
  const parlamentarId = Number(id);
  const [ano, setAno] = useState(ANOS[0]);
  const [tab, setTab] = useState<"categorias" | "despesas">("categorias");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 15 });

  const parlamentarQuery = useParlamentarQuery(parlamentarId, ano);
  const despesasQuery = useDespesasParlamentarQuery(
    parlamentarId,
    { ano, page: paginationModel.page + 1, perPage: paginationModel.pageSize },
    tab === "despesas",
  );

  const parlamentar = parlamentarQuery.data ?? null;
  const despesas = despesasQuery.data;
  const loadingParlamentar = parlamentarQuery.isLoading;
  const loadingDespesas = despesasQuery.isLoading || despesasQuery.isFetching;
  const loadError = parlamentarQuery.isError
    ? "Não foi possível carregar os dados do parlamentar."
    : null;

  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  const despesaColumns = useMemo<GridColDef<Despesa>[]>(
    () => [
      {
        field: "data_emissao",
        headerName: "Data",
        minWidth: 120,
        sortable: false,
        renderCell: (params) => (
          <span className="font-mono text-[12px] text-outline">
            {params.row.data_emissao
              ? new Date(params.row.data_emissao).toLocaleDateString("pt-BR")
              : `${MESES[(params.row.mes ?? 1) - 1]}/${ano}`}
          </span>
        ),
      },
      {
        field: "tipo_despesa",
        headerName: "Categoria",
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params) => <span>{params.row.tipo_despesa ?? "-"}</span>,
      },
      {
        field: "fornecedor",
        headerName: "Fornecedor",
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params) => <span>{params.row.fornecedor ?? "-"}</span>,
      },
      {
        field: "documento",
        headerName: "Documento",
        minWidth: 130,
        sortable: false,
        renderCell: (params) => (
          params.row.url_documento ? (
            <a href={params.row.url_documento} target="_blank" rel="noreferrer" className="text-[12px] text-primary transition-opacity hover:opacity-80">
              Ver nota ↗
            </a>
          ) : (
            <span className="text-[12px] text-outline">{params.row.numero_documento ?? "-"}</span>
          )
        ),
      },
      {
        field: "valor_liquido",
        headerName: "Valor (R$)",
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => (
          <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
            {formatBRL(params.row.valor_liquido)}
          </span>
        ),
      },
    ],
    [ano],
  );

  if (loadingParlamentar) {
    return (
      <div className="py-6">
        <div className="py-14 text-center"><Spinner className="mx-auto" /></div>
      </div>
    );
  }

  if (!id || Number.isNaN(parlamentarId)) {
    return (
      <div className="py-6">
        <div className="py-14 text-center text-sm text-outline">
          Parlamentar inválido. <Link to="/parlamentares">← Voltar</Link>
        </div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="py-6">
        <div className="py-14 text-center text-sm text-outline">
          {loadError ?? "Parlamentar não encontrado."}{" "}
          <Link to="/parlamentares">← Voltar</Link>
        </div>
      </div>
    );
  }

  const maxCategoria = Math.max(...(parlamentar.por_categoria?.map((c) => c.total) ?? [1]), 1);
  const mediaMensal = formatBRL(parlamentar.total_gasto / Math.max(parlamentar.por_mes?.length ?? 1, 1));
  const maiorCategoria = parlamentar.por_categoria?.[0];
  const maiorCategoriaPercentual = maiorCategoria ? ((maiorCategoria.total / parlamentar.total_gasto) * 100).toFixed(1) : "0.0";
  const initial = parlamentar.nome?.[0]?.toUpperCase() ?? "?";
  const nomeEstado = ESTADOS_BRASIL.find((e) => e.sigla === parlamentar.sigla_uf)?.nome ?? parlamentar.sigla_uf ?? "UF não informada";

  return (
    <div className="max-w-full animate-[fadeUp_0.35s_ease_both] pb-6">
      {/* Back link */}
      <div className="mb-5">
        <Link
          to="/parlamentares"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-outline transition-colors hover:text-on-surface"
        >
          <ChevronLeft className="h-4 w-4" />
          Parlamentares
        </Link>
      </div>

      {/* Hero */}
      <div className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <Card className="hero-gradient relative overflow-hidden rounded-2xl border-primary/20 p-6 text-white shadow-lg">
          <div className="pointer-events-none absolute -left-20 -top-16 h-48 w-48 rounded-full bg-secondary/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 right-2 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-emerald-300/40 bg-emerald-500/90 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Deputado Federal
              </Badge>
              <Badge className="border-amber-200/60 bg-amber-200 text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
                {parlamentar.sigla_partido ? `${parlamentar.sigla_partido} - Partido` : "Sem partido"}
              </Badge>
              <Badge className="border-cyan-300/40 bg-cyan-600/90 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                {nomeEstado}
              </Badge>
              <Badge className="border-purple-300/40 bg-purple-500/90 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Legislatura {parlamentar.legislatura}
              </Badge>
            </div>

            <div className="flex flex-wrap items-start gap-5">
              <div className="h-36 w-36 overflow-hidden rounded-xl bg-black/20 shadow-lg backdrop-blur-sm">
                {parlamentar.foto_url ? (
                  <img
                    src={parlamentar.foto_url}
                    alt={parlamentar.nome}
                    className="h-full w-full object-cover object-top"
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black/30 text-4xl font-bold text-white/95">
                    {initial}
                  </div>
                )}
              </div>

              <div className="max-w-2xl">
                <h1 className="mb-2 font-headline text-3xl font-extrabold tracking-[-0.03em] text-white md:text-5xl">
                  {parlamentar.nome}
                </h1>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-amber-300/60 bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">Exercício Financeiro</div>
          <SelectField
            value={String(ano)}
            onValueChange={(v) => {
              setAno(Number(v));
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            options={anoOptions}
            className="mb-4 h-11 w-full rounded-lg border-outline-variant bg-white px-4 py-2 text-[15px]"
          />
          <p className="text-[15px] leading-relaxed text-on-surface-variant">
            Dados atualizados diariamente conforme as notas fiscais processadas pela Câmara dos Deputados.
          </p>
        </Card>
      </div>

      {/* Stats */}
      <div className="mb-5 grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="stat-card relative rounded-xl border-outline-variant/40 bg-white px-5 py-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Total gasto</div>
            <div className="rounded-md border border-outline-variant/60 p-1.5 text-outline">
              <BadgeDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="font-headline text-[36px] font-bold leading-none text-primary">{formatBRL(parlamentar.total_gasto)}</div>
          <div className="mt-2 text-xs text-rose-600">Acumulado no ano selecionado</div>
        </Card>

        <Card className="stat-card relative rounded-xl border-outline-variant/40 bg-white px-5 py-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Categorias ativas</div>
            <div className="rounded-md border border-outline-variant/60 p-1.5 text-outline">
              <Shapes className="h-4 w-4" />
            </div>
          </div>
          <div className="font-headline text-4xl font-bold leading-none text-on-surface">{parlamentar.por_categoria?.length ?? 0}</div>
          <div className="mt-2 text-xs text-on-surface-variant">De 16 categorias permitidas</div>
        </Card>

        <Card className="stat-card relative rounded-xl border-outline-variant/40 bg-white px-5 py-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Maior despesa</div>
            <div className="rounded-md border border-outline-variant/60 p-1.5 text-outline">
              <Megaphone className="h-4 w-4" />
            </div>
          </div>
          <div className="wrap-break-word text-3xl font-bold leading-tight tracking-tight text-on-surface">{maiorCategoria?.tipo_despesa ?? "-"}</div>
          <div className="mt-2 tabular-nums text-xs font-mono text-on-surface-variant">{maiorCategoria ? `${maiorCategoriaPercentual}% do volume total` : "-"}</div>
        </Card>

        <Card className="stat-card relative rounded-xl border-outline-variant/40 bg-white px-5 py-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-outline">Média mensal</div>
            <div className="rounded-md border border-outline-variant/60 p-1.5 text-outline">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <div className="font-headline text-[36px] font-bold leading-none text-on-surface">{mediaMensal}</div>
          {/* <div className="mt-2 text-xs text-secondary">Dentro do teto projetado</div> */}
        </Card>
      </div>

      {/* Monthly chart */}
      {parlamentar.por_mes && parlamentar.por_mes.length > 0 && (
        <Card className="mb-5 rounded-xl border-outline-variant/30 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-headline text-[33px] font-bold tracking-tight text-on-surface">
                Evolução Mensal de Gastos
              </h3>
              <p className="mt-1 text-sm text-outline">Distribuição das despesas ao longo de {ano}</p>
            </div>
          </div>
          <MesChart data={parlamentar.por_mes} />
        </Card>
      )}

      {/* Tabs */}
      <TabsField
        value={tab}
        onValueChange={(v) => setTab(v as "categorias" | "despesas")}
        items={[
          { value: "categorias", label: "Por categoria" },
          { value: "despesas", label: "Notas individuais" },
        ]}
      >
        <TabPanel value="categorias">
          <Card className="rounded-xl border-outline-variant/30 bg-white p-6 shadow-sm">
            {!parlamentar.por_categoria?.length ? (
              <p className="py-14 text-center text-sm text-outline">Nenhuma despesa encontrada para {ano}.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {parlamentar.por_categoria.map((cat, i) => (
                  <div
                    key={cat.tipo_despesa}
                    className="rounded-lg border border-transparent p-1 transition-colors hover:border-outline-variant/50"
                    style={{ animationDelay: `${i * 30}ms`, animation: "fadeUp 0.3s ease both" }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-on-surface" title={cat.tipo_despesa ?? "-"}>
                        {cat.tipo_despesa ?? "-"}
                      </span>
                      <span className="tabular-nums whitespace-nowrap text-right font-mono text-[13px] font-semibold text-on-surface">{formatBRL(cat.total)}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                      <div className="gasto-bar-fill" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel value="despesas">
          <Card className="rounded-xl border-outline-variant/30 bg-white shadow-sm">
            <div className="min-h-[600px] w-full">
              <DataGrid
                rows={despesas?.data ?? []}
                columns={despesaColumns}
                getRowId={(row: any) => row.id}
                loading={loadingDespesas}
                pagination
                paginationMode="server"
                rowCount={despesas?.meta.total ?? 0}
                pageSizeOptions={[15]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                disableRowSelectionOnClick
                localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Nenhuma despesa encontrada." }}
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": { borderRadius: 0 },
                }}
              />
            </div>
          </Card>
        </TabPanel>
      </TabsField>
    </div>
  );
}

function MesChart({ data }: { data: { mes: number; total: number }[] }) {
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const found = data.find((d) => d.mes === i + 1);

    return {
      mes: MESES[i].slice(0, 3),
      mesCompleto: MESES[i],
      total: found?.total ?? 0,
    };
  });

  return (
    <ChartContainer config={mesChartConfig} className="h-65 w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="mes"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(value: number) => {
            if (value < 1000) return String(value);
            return `${(value / 1000).toFixed(0)}k`;
          }}
        />
        <ChartTooltip
          cursor={false}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as { mesCompleto?: string } | undefined;
            return item?.mesCompleto ?? "Mês";
          }}
          formatter={(value) => [formatBRL(Number(value)), "Gasto"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #c4c6cd",
            background: "#ffffff",
            color: "#191c1d",
          }}
        />
        <Bar
          dataKey="total"
          fill="var(--color-despesas)"
          radius={[8, 8, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ChartContainer>
  );
}
