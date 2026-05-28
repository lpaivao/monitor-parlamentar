import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { useRankingCategoriasQuery } from "../hooks/useRankingCategoriasQuery";
import { useRankingPartidosQuery } from "../hooks/useRankingPartidosQuery";
import { muiPtBrLocaleText } from "../lib/muiGridLocale";
import type { RankingCategoria, RankingPartido } from "../types";
import { ANOS, formatBRL } from "../utils";

const CLIENT_PER_PAGE = 12;

const LIMIT_OPTIONS = [
  { label: "Top 5", value: 5 },
  { label: "Top 10", value: 10 },
  { label: "Top 20", value: 20 },
  { label: "Top 50", value: 50 },
  { label: "Todos", value: 200 },
];

export default function PartidosPage() {
  const [ano, setAno] = useState(ANOS[0]);
  const [limit, setLimit] = useState(20);
  const [tab, setTab] = useState<"partidos" | "categorias">("partidos");

  const [partidosPaginationModel, setPartidosPaginationModel] = useState({ page: 0, pageSize: CLIENT_PER_PAGE });
  const [categoriasPaginationModel, setCategoriasPaginationModel] = useState({ page: 0, pageSize: CLIENT_PER_PAGE });

  const {
    data: partidosData,
    isLoading: isLoadingPartidos,
    isFetching: isFetchingPartidos,
  } = useRankingPartidosQuery({ ano, limit });
  const {
    data: categoriasData,
    isLoading: isLoadingCategorias,
    isFetching: isFetchingCategorias,
  } = useRankingCategoriasQuery({ ano, limit });

  const partidos = partidosData?.data ?? [];
  const categorias = categoriasData?.data ?? [];
  const loading = isLoadingPartidos || isFetchingPartidos || isLoadingCategorias || isFetchingCategorias;

  const anosVisiveis = useMemo(() => ANOS.slice(0, 5), []);

  const maxPartido = Math.max(...partidos.map((p) => p.total), 1);
  const maxCategoria = Math.max(...categorias.map((c) => c.total), 1);

  const totalPartidos = partidos.reduce((acc, p) => acc + p.total, 0);
  const mediaPartido = partidos.length > 0 ? totalPartidos / partidos.length : 0;
  const maiorCategoria = categorias[0];
  const partidosColumns = useMemo<GridColDef<RankingPartido>[]>(
    () => [
      {
        field: "partido",
        headerName: "Partido",
        minWidth: 130,
        sortable: false,
        renderCell: (params) => (
          params.row.partido || "-"
        ),
      },
      {
        field: "peso",
        headerName: "Participação",
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <div className="flex w-full items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${(params.row.total / maxPartido) * 100}%` }} />
            </div>
            <span className="tabular-nums w-9 text-right font-mono text-[10px] text-outline">
              {((params.row.total / maxPartido) * 100).toFixed(0)}%
            </span>
          </div>
        ),
      },
      {
        field: "total",
        headerName: "Total (R$)",
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => <span className="tabular-nums font-mono text-[12px] font-bold text-primary">{formatBRL(params.row.total)}</span>,
      },
      {
        field: "qtd_parlamentares",
        headerName: "Deputados",
        minWidth: 110,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => <span className="tabular-nums font-mono text-[12px] text-outline">{params.row.qtd_parlamentares}</span>,
      },
      {
        field: "media_por_parlamentar",
        headerName: "Média/dep. (R$)",
        minWidth: 160,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => <span className="tabular-nums font-mono text-[12px] text-on-surface">{formatBRL(params.row.media_por_parlamentar)}</span>,
      },
    ],
    [maxPartido],
  );

  const categoriasColumns = useMemo<GridColDef<RankingCategoria>[]>(
    () => [
      {
        field: "categoria",
        headerName: "Categoria",
        minWidth: 240,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <span className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-on-surface-variant" title={params.row.categoria}>
            {params.row.categoria}
          </span>
        ),
      },
      {
        field: "peso",
        headerName: "Participação",
        minWidth: 260,
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <div className="flex w-full items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${(params.row.total / maxCategoria) * 100}%` }} />
            </div>
            <span className="tabular-nums w-9 text-right font-mono text-[10px] text-outline">
              {((params.row.total / maxCategoria) * 100).toFixed(0)}%
            </span>
          </div>
        ),
      },
      {
        field: "total",
        headerName: "Total (R$)",
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => <span className="tabular-nums whitespace-nowrap font-mono text-[12px] font-semibold text-on-surface">{formatBRL(params.row.total)}</span>,
      },
    ],
    [maxCategoria],
  );

  return (
    <div className="max-w-full animate-[fadeUp_0.35s_ease_both] pb-6">
      <section className="hero-gradient mb-6 rounded-xl p-6 text-white shadow-sm md:p-8">
        <h1 className="mt-4 font-headline text-3xl font-bold tracking-[-0.03em] md:text-4xl">Gastos por Partido</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Comparativo do uso da cota parlamentar entre partidos e categorias
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-1">
          {anosVisiveis.map((anoItem) => (
            <button
              key={anoItem}
              type="button"
              onClick={() => {
                setAno(anoItem);
                setPartidosPaginationModel((prev) => ({ ...prev, page: 0 }));
                setCategoriasPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              className={[
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                anoItem === ano ? "bg-primary text-white" : "text-outline hover:bg-white",
              ].join(" ")}
            >
              {anoItem}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-1">
          <span className="pl-2 text-xs font-semibold uppercase tracking-[0.1em] text-outline">Top</span>
          {LIMIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setLimit(opt.value);
                setPartidosPaginationModel((prev) => ({ ...prev, page: 0 }));
                setCategoriasPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              className={[
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                limit === opt.value ? "bg-secondary text-white" : "text-outline hover:bg-white",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card className="hero-gradient rounded-xl px-5 py-5 text-white shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Gasto Total Partidario</div>
          <div className="font-headline text-3xl font-bold leading-none">{loading ? "—" : formatBRL(totalPartidos)}</div>
          {/* <div className="mt-2 text-xs text-secondary-container">+7,3% em relacao ao ultimo ano</div> */}
        </Card>
        <Card className="rounded-xl border-outline-variant/40 bg-surface-container-lowest px-5 py-5 shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Media por Parlamentar</div>
          <div className="tabular-nums font-headline text-2xl font-bold text-on-surface">{loading ? "—" : formatBRL(mediaPartido)}</div>
        </Card>
        <Card className="rounded-xl border-outline-variant/40 bg-surface-container-lowest px-5 py-5 shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Categoria mais Expressiva</div>
          <div className="text-sm font-semibold text-on-surface">{maiorCategoria?.categoria ?? "—"}</div>
          {/* <div className="mt-2 text-xs text-amber-700">Alerta: monitorar variacao acima do teto medio.</div> */}
        </Card>
      </div>

      {loading && (
        <div className="py-14 text-center">
          <Spinner className="mx-auto" />
        </div>
      )}

      {!loading && (
        <TabsField
          value={tab}
          onValueChange={(v) => setTab(v as "partidos" | "categorias")}
          items={[
            { value: "partidos", label: "Por partido" },
            { value: "categorias", label: "Por categoria de gasto" },
          ]}
        >
          <TabPanel value="partidos">
            <Card className="flex flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest p-0 shadow-sm">
              {partidos.length === 0 ? (
                <p className="py-14 text-center text-sm text-outline">Sem dados para o periodo selecionado.</p>
              ) : (
                <div className="min-h-[480px] w-full">
                  <DataGrid
                    rows={partidos}
                    columns={partidosColumns}
                    loading={loading}
                    getRowId={(row) => row.partido}
                    pagination
                    paginationModel={partidosPaginationModel}
                    onPaginationModelChange={setPartidosPaginationModel}
                    pageSizeOptions={[CLIENT_PER_PAGE]}
                    disableRowSelectionOnClick
                    localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Sem dados para o periodo selecionado." }}
                    sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
                  />
                </div>
              )}
            </Card>
          </TabPanel>

          <TabPanel value="categorias">
            <Card className="flex flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest p-0 shadow-sm">
              {categorias.length === 0 ? (
                <p className="py-14 text-center text-sm text-outline">Sem dados para o periodo selecionado.</p>
              ) : (
                <div className="min-h-[480px] w-full">
                  <DataGrid
                    rows={categorias}
                    columns={categoriasColumns}
                    loading={loading}
                    getRowId={(row) => row.categoria}
                    pagination
                    paginationModel={categoriasPaginationModel}
                    onPaginationModelChange={setCategoriasPaginationModel}
                    pageSizeOptions={[CLIENT_PER_PAGE]}
                    disableRowSelectionOnClick
                    localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Sem dados para o periodo selecionado." }}
                    sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
                  />
                </div>
              )}
            </Card>

            <div className="mt-4 grid gap-3.5 md:grid-cols-2">
              {/* <Card className="rounded-xl border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
                <h3 className="font-headline text-lg font-semibold text-on-surface">Maiores Crescimentos</h3>
                <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center justify-between"><span>PSD</span><span className="font-semibold text-secondary">+14.8%</span></li>
                  <li className="flex items-center justify-between"><span>MDB</span><span className="font-semibold text-secondary">+11.2%</span></li>
                  <li className="flex items-center justify-between"><span>PSB</span><span className="font-semibold text-secondary">+9.6%</span></li>
                </ul>
              </Card>
              <Card className="hero-gradient rounded-xl p-5 text-white shadow-sm">
                <h3 className="font-headline text-lg font-semibold">Exportar Inteligencia</h3>
                <p className="mt-2 text-sm text-white/70">Opcoes de compartilhamento estrategico para briefing executivo.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary">Download PDF</button>
                  <button type="button" className="rounded-lg border border-white/35 px-3 py-2 text-sm font-semibold text-white">Enviar por E-mail</button>
                </div>
              </Card> */}
            </div>
          </TabPanel>
        </TabsField>
      )}
    </div>
  );
}
