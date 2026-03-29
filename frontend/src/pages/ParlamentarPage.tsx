import { BadgeDollarSign, CalendarDays, ChevronLeft, Megaphone, Shapes } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "../components/ui/chart";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { Spinner } from "../components/ui/spinner";
import { Table } from "../components/ui/Table";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getDespesasParlamentar, getParlamentar } from "../services/api";
import type { Despesa, Paginated, ParlamentarDetalhe } from "../types";
import { ANOS, formatBRL, MESES } from "../utils";

const mesChartConfig = {
  despesas: {
    label: "Gastos",
    color: "#006d40",
  },
} satisfies ChartConfig;

export default function ParlamentarPage() {
  const { id } = useParams<{ id: string }>();
  const [ano, setAno] = useState(ANOS[0]);
  const [tab, setTab] = useState<"categorias" | "despesas">("categorias");

  const [parlamentar, setParlamentar] = useState<ParlamentarDetalhe | null>(null);
  const [loadingParlamentar, setLoadingParlamentar] = useState(true);

  const [despesas, setDespesas] = useState<Paginated<Despesa> | null>(null);
  const [loadingDespesas, setLoadingDespesas] = useState(false);
  const [page, setPage] = useState(1);

  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadParlamentar = async () => {
      setLoadingParlamentar(true);
      try {
        const data = await getParlamentar(Number(id), ano);
        if (mounted) setParlamentar(data);
      } finally {
        if (mounted) setLoadingParlamentar(false);
      }
    };

    void loadParlamentar();

    return () => {
      mounted = false;
    };
  }, [id, ano]);

  useEffect(() => {
    if (!id || tab !== "despesas") return;
    let mounted = true;

    const loadDespesas = async () => {
      setLoadingDespesas(true);
      try {
        const data = await getDespesasParlamentar(Number(id), { ano, page, perPage: 15 });
        if (mounted) setDespesas(data);
      } finally {
        if (mounted) setLoadingDespesas(false);
      }
    };

    void loadDespesas();

    return () => {
      mounted = false;
    };
  }, [id, tab, ano, page]);

  if (loadingParlamentar) {
    return (
      <div className="py-6">
        <div className="py-14 text-center"><Spinner className="mx-auto" /></div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="py-6">
        <div className="py-14 text-center text-sm text-outline">
          Parlamentar não encontrado.{" "}
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
                <p className="max-w-2xl text-[15px] leading-relaxed text-white/85">
                  Legislatura {parlamentar.legislatura}. Representando {parlamentar.sigla_uf ?? "UF não informada"} na Câmara dos Deputados, com foco em transparência de gastos públicos.
                </p>
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
              setPage(1);
            }}
            options={anoOptions}
            className="mb-4 h-11 w-full rounded-lg border-outline-variant bg-white px-4 py-2 text-[15px]"
          />
          <p className="text-[15px] leading-relaxed text-on-surface-variant">
            Dados atualizados em tempo real conforme as notas fiscais processadas pela Câmara dos Deputados.
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
            <Table.Root containerClassName="max-h-[700px]">
              <Table.Header>
                <Table.Row className="hover:bg-transparent">
                  <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Data</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Categoria</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Fornecedor</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Documento</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Valor (R$)</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loadingDespesas && (
                  <Table.Row className="hover:bg-transparent border-b-0">
                    <Table.Cell colSpan={5} className="py-12 text-center">
                      <Spinner className="mx-auto" />
                    </Table.Cell>
                  </Table.Row>
                )}
                {!loadingDespesas && (despesas?.data ?? []).length === 0 && (
                  <Table.Row className="hover:bg-transparent border-b-0">
                    <Table.Cell colSpan={5} className="py-14 text-center text-(--text-muted) text-sm">Nenhuma despesa encontrada.</Table.Cell>
                  </Table.Row>
                )}
                {!loadingDespesas && (despesas?.data ?? []).map((d) => (
                  <Table.Row key={d.id} className="hover:bg-secondary-container/10">
                    <Table.Cell className="whitespace-nowrap">
                      <span className="font-mono text-[12px] text-outline">
                        {d.data_emissao
                          ? new Date(d.data_emissao).toLocaleDateString("pt-BR")
                          : `${MESES[(d.mes ?? 1) - 1]}/${ano}`}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{d.tipo_despesa ?? "-"}</Table.Cell>
                    <Table.RowHeaderCell>{d.fornecedor ?? "-"}</Table.RowHeaderCell>
                    <Table.Cell>
                      {d.url_documento ? (
                        <a href={d.url_documento} target="_blank" rel="noreferrer" className="text-[12px] text-primary transition-opacity hover:opacity-80">
                          Ver nota ↗
                        </a>
                      ) : (
                        <span className="text-[12px] text-outline">{d.numero_documento ?? "-"}</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap text-right">
                      <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
                        {formatBRL(d.valor_liquido)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
            {despesas?.meta && (
              <Pagination
                currentPage={despesas.meta.currentPage}
                lastPage={despesas.meta.lastPage}
                onPageChange={setPage}
              />
            )}
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
