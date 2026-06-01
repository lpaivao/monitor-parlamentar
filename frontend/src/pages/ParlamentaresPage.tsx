import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/button";
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

export default function ParlamentaresPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [ano, setAno] = useState(ANOS[0]);
  const [limit, setLimit] = useState(100);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: CLIENT_PER_PAGE });

  const { data, isLoading, isFetching } = useRankingQuery({ ano, partido, uf, limit });
  const loading = isLoading || isFetching;

  // Filter client-side by name
  const allItems = data?.data ?? [];
  const items = useMemo(
    () =>
      nome.trim()
        ? allItems.filter((item) =>
          item.nome.toLowerCase().includes(nome.trim().toLowerCase()),
        )
        : allItems,
    [allItems, nome],
  );

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((u) => ({ label: u, value: u }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((a) => ({ label: String(a), value: String(a) })), []);

  const max = items[0]?.total_gasto ?? 1;
  const totalGeral = allItems.reduce((sum, item) => sum + item.total_gasto, 0);

  const activeFilters = useMemo(
    () =>
      [
        nome ? { label: `Nome: ${nome}`, clear: () => setNome("") } : null,
        partido ? { label: `Partido: ${partido}`, clear: () => setPartido("") } : null,
        uf ? { label: `UF: ${uf}`, clear: () => setUf("") } : null,
      ].filter(Boolean) as { label: string; clear: () => void }[],
    [nome, partido, uf],
  );

  const columns = useMemo<GridColDef<RankingItem>[]>(
    () => [
      {
        field: "posicao",
        headerName: "#",
        width: 72,
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
        flex: 1.6,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => {
          const parlamentarId = params.row.id;
          return (
            <Link to={`/parlamentares/${parlamentarId}`} className="group flex items-center gap-2.5 font-medium text-on-surface">
              <ParlamentarAvatar nome={params.row.nome} foto={params.row.foto_url} />
              <div>
                <div className="font-medium text-on-surface transition-colors group-hover:text-primary">{params.row.nome}</div>
              </div>
            </Link>
          );
        },
      },
      {
        field: "sigla_partido",
        headerName: "Partido",
        width: 110,
        sortable: false,
        renderCell: (params) => params.row.sigla_partido ?? "-",
      },
      {
        field: "sigla_uf",
        headerName: "UF",
        width: 90,
        sortable: false,
        renderCell: (params) => params.row.sigla_uf ?? "-",
      },
      {
        field: "qtd_despesas",
        headerName: "Despesas",
        minWidth: 110,
        sortable: false,
        renderCell: (params) => (
          <span className="tabular-nums font-mono text-[12px] text-outline">
            {params.row.qtd_despesas.toLocaleString("pt-BR")}
          </span>
        ),
      },
      {
        field: "total_gasto",
        headerName: `Total gasto em ${ano} (R$)`,
        minWidth: 180,
        align: "right" as const,
        headerAlign: "right" as const,
        sortable: false,
        renderCell: (params) => (
          <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
            {formatBRL(params.row.total_gasto)}
          </span>
        ),
      },
      {
        field: "proporcao",
        headerName: "Proporção",
        minWidth: 180,
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
      {
        field: "acoes",
        headerName: "",
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const parlamentarId = params.row.id;
          return (
            <Button
              type="button"
              size="sm"
              className="gap-1.5 rounded-lg font-label text-[12px] hover:cursor-pointer"
              onClick={() => navigate(`/parlamentares/${parlamentarId}`)}
            >
              Ver detalhes →
            </Button>
          );
        },
      },
    ],
    [ano, max, navigate],
  );

  return (
    <div className="flex min-h-0 max-w-full flex-1 flex-col animate-[fadeUp_0.35s_ease_both]">
      <section className="hero-gradient mb-6 rounded-xl p-6 text-white shadow-sm md:p-8">
        <h1 className="mt-4 font-headline text-3xl font-bold tracking-[-0.03em] md:text-4xl">Parlamentares da República</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Ranking de gastos da cota parlamentar — consulte representantes, filtre por partido e UF e acesse os detalhes de cada parlamentar.
        </p>
      </section>

      {/* Filtros */}
      <div className="mb-6 rounded-xl bg-surface-container-low p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex min-w-[250px] flex-1 items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <Input
              placeholder="Buscar por nome..."
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              className="w-full border-0 bg-transparent px-0 py-0 shadow-none focus:bg-transparent focus:shadow-none"
            />
          </label>
          <Input
            placeholder="Partido (ex: PT)"
            value={partido}
            onChange={(e) => {
              setPartido(e.target.value.toUpperCase());
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            className="w-[140px] rounded-lg border-outline-variant bg-white px-4 py-2"
            maxLength={15}
          />
          <SelectField
            value={uf}
            onValueChange={(value) => {
              setUf(value);
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            options={ufOptions}
            className="w-[160px] rounded-lg border-outline-variant bg-white px-4 py-2"
          />
          <SelectField
            value={String(ano)}
            onValueChange={(value) => {
              setAno(Number(value));
              setPaginationModel((prev) => ({ ...prev, page: 0 }));
            }}
            options={anoOptions}
            className="w-[120px] rounded-lg border-outline-variant bg-white px-4 py-2"
          />

          {/* Seletor Top N */}
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

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-outline">FILTROS ATIVOS:</span>
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.clear}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-white px-2.5 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                {filter.label}
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="mb-6 grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card className="hero-gradient rounded-xl px-5 py-5 text-white shadow-sm">
          <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">Total gasto</div>
          <div className="font-headline text-3xl font-bold leading-none">{loading ? "—" : formatBRL(totalGeral)}</div>
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

      {/* Tabela */}
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
            localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Nenhum parlamentar encontrado." }}
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
            Os valores apresentados refletem despesas declaradas na cota parlamentar para o período selecionado.
          </p>
        </div>
      </Card>
    </div>
  );
}
