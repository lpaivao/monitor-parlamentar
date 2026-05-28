import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { SelectField } from "../components/ui/SelectField";
import { useRankingQuery } from "../hooks/useRankingQuery";
import { muiPtBrLocaleText } from "../lib/muiGridLocale";
import type { RankingItem } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

const CLIENT_PER_PAGE = 20;

const LIMIT_OPTIONS = [
  { label: "Top 10", value: 10 },
  { label: "Top 25", value: 25 },
  { label: "Top 50", value: 50 },
  { label: "Top 100", value: 100 },
  { label: "Top 200", value: 200 },
];

function getRankMedal(pos: number) {
  if (pos === 1) return { icon: "🥇", color: "#fbbf24" };
  if (pos === 2) return { icon: "🥈", color: "#94a3b8" };
  if (pos === 3) return { icon: "🥉", color: "#cd7c4e" };
  return null;
}

export default function RankingPage() {
  const [ano, setAno] = useState(ANOS[0]);
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [limit, setLimit] = useState(100);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: CLIENT_PER_PAGE });

  const { data, isLoading, isFetching } = useRankingQuery({ ano, partido, uf, limit });
  const items = data?.data ?? [];
  const loading = isLoading || isFetching;

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((item) => ({ label: item, value: item }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  const max = items[0]?.total_gasto ?? 1;
  const totalGeral = items.reduce((sum, item) => sum + item.total_gasto, 0);
  const columns: GridColDef<RankingItem>[] = [
    {
      field: "posicao",
      headerName: "#",
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const medal = getRankMedal(params.row.posicao);
        return medal ? (
          <span
            className={[
              "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
              params.row.posicao === 1
                ? "bg-tertiary-fixed text-tertiary"
                : params.row.posicao === 2
                  ? "bg-slate-300 text-slate-700"
                  : "bg-amber-700/20 text-amber-900",
            ].join(" ")}
            title={`#${params.row.posicao}`}
          >
            {params.row.posicao}
          </span>
        ) : (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-xs font-semibold text-outline">
            {params.row.posicao}
          </span>
        );
      },
    },
    {
      field: "nome",
      headerName: "Parlamentar",
      minWidth: 260,
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const parlamentarId = params.row.id;
        return (
          <Link to={`/parlamentares/${parlamentarId}`} className="group flex items-center gap-2.5 font-medium text-on-surface">
            <ParlamentarAvatar nome={params.row.nome} foto={params.row.foto_url} />
            <div className="font-medium text-on-surface transition-colors group-hover:text-primary">
              {params.row.nome}
            </div>
          </Link>
        );
      },
    },
    {
      field: "sigla_partido",
      headerName: "Partido",
      minWidth: 110,
      sortable: false,
      renderCell: (params) => (
        <span className="px-2 py-0 text-[10px]">{params.row.sigla_partido ?? "-"}</span>
      ),
    },
    {
      field: "sigla_uf",
      headerName: "UF",
      minWidth: 90,
      sortable: false,
      renderCell: (params) => (
        <span className="px-2 py-0 text-[10px]">{params.row.sigla_uf ?? "-"}</span>
      ),
    },
    {
      field: "qtd_despesas",
      headerName: "Despesas",
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <span className="tabular-nums font-mono text-[12px] text-outline">
          {params.row.qtd_despesas.toLocaleString("pt-BR")}
        </span>
      ),
    },
    {
      field: "total_gasto",
      headerName: "Total gasto (R$)",
      minWidth: 160,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => (
        <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
          {formatBRL(params.row.total_gasto)}
        </span>
      ),
    },
    {
      field: "proporcao",
      headerName: "Proporcao",
      minWidth: 200,
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const pct = (params.row.total_gasto / max) * 100;
        return (
          <div className="flex w-full items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
            </div>
            <span className="tabular-nums w-9 text-right font-mono text-[10px] text-outline">
              {pct.toFixed(0)}%
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-0 max-w-full flex-1 flex-col animate-[fadeUp_0.35s_ease_both]">
      <section className="hero-gradient mb-6 rounded-xl p-6 text-white shadow-sm md:p-8">
        <h1 className="mt-4 font-headline text-3xl font-bold tracking-[-0.03em] md:text-4xl">Ranking de Gastos</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Top parlamentares por total da cota parlamentar utilizada
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-2.5 rounded-xl bg-surface-container-low p-3 shadow-sm">
        <SelectField
          value={String(ano)}
          onValueChange={(value) => {
            setAno(Number(value));
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          options={anoOptions}
          className="w-[132px] rounded-lg border-outline-variant bg-white px-4 py-2"
        />
        <Input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => {
            setPartido(e.target.value.toUpperCase());
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          className="w-[160px] rounded-lg border-outline-variant bg-white px-4 py-2"
          maxLength={15}
        />
        <SelectField
          value={uf}
          onValueChange={(value) => {
            setUf(value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          options={ufOptions}
          className="w-[180px] rounded-lg border-outline-variant bg-white px-4 py-2"
        />

        <div className="ml-auto inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-white p-1">
          <span className="pl-2 text-xs font-semibold uppercase tracking-[0.1em] text-outline">Top</span>
          {LIMIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setLimit(opt.value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              className={[
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                limit === opt.value ? "bg-primary text-white" : "text-outline hover:bg-surface-container",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card className="hero-gradient rounded-xl px-5 py-5 text-white shadow-sm">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Total gasto</div>
          <div className="font-headline text-3xl font-bold leading-none">{loading ? "—" : formatBRL(totalGeral)}</div>
          {/* <div className="mt-2 text-xs text-secondary-container">+12,4% comparado ao periodo anterior</div> */}
        </Card>
        <Card className="rounded-xl border-outline-variant/40 bg-surface-container-lowest px-5 py-5 shadow-sm">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Maior gasto individual</div>
          <div className="flex items-center gap-3">
            <ParlamentarAvatar nome={items[0]?.nome ?? "-"} foto={items[0]?.foto_url ?? null} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-on-surface">{items[0]?.nome ?? "—"}</div>
              <div className="tabular-nums text-sm font-bold text-primary">{!loading && items[0] ? formatBRL(items[0].total_gasto) : "—"}</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl border-outline-variant/40 bg-surface-container-lowest px-5 py-5 shadow-sm">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Parlamentares</div>
          <div className="font-headline text-3xl font-bold leading-none text-on-surface">{loading ? "—" : items.length}</div>
        </Card>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <div className="min-h-[520px] w-full">
          <DataGrid
            rows={items}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            pagination
            pageSizeOptions={[CLIENT_PER_PAGE]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Nenhum resultado encontrado." }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { borderRadius: 0 },
            }}
          />
        </div>
      </Card>

      <Card className="mt-4 rounded-xl border-0 border-l-4 border-tertiary bg-primary-container/5 px-4 py-3 shadow-sm">
        <div className="flex items-start gap-2.5 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-tertiary">info</span>
          <p>
            Os valores apresentados refletem despesas declaradas na cota parlamentar para o periodo selecionado.
          </p>
        </div>
      </Card>
    </div>
  );
}
