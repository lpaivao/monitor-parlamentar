import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { SelectField } from "../components/ui/SelectField";
import { useParlamentaresQuery } from "../hooks/useParlamentaresQuery";
import { muiPtBrLocaleText } from "../lib/muiGridLocale";
import type { Parlamentar } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

export default function ParlamentaresPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [ano, setAno] = useState(ANOS[0]);
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isFetching } = useParlamentaresQuery({
    nome,
    partido,
    uf,
    ano,
    page,
    perPage: 20,
  });

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((u) => ({ label: u, value: u }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((a) => ({ label: String(a), value: String(a) })), []);
  const activeFilters = useMemo(
    () => [
      nome ? { label: `Nome: ${nome}`, clear: () => setNome("") } : null,
      partido ? { label: `Partido: ${partido}`, clear: () => setPartido("") } : null,
      uf ? { label: `UF: ${uf}`, clear: () => setUf("") } : null,
      ano ? { label: `Ano: ${ano}`, clear: () => setAno(ANOS[0]) } : null,
    ].filter(Boolean) as { label: string; clear: () => void }[],
    [nome, partido, uf, ano],
  );

  const meta = result?.meta;
  const data = result?.data ?? [];
  const loading = isLoading || isFetching;
  const columns = useMemo<GridColDef<Parlamentar>[]>(
    () => [
      {
        field: "nome",
        headerName: "Parlamentar",
        flex: 1.6,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => {
          const parlamentarId = params.row.id ?? params.row.api_id;
          return (
            <Link to={`/parlamentares/${parlamentarId}`} className="group flex items-center gap-2.5 font-medium text-on-surface">
              <ParlamentarAvatar nome={params.row.nome} foto={params.row.foto_url} />
              <div>
                <div className="font-medium text-on-surface transition-colors group-hover:text-primary">{params.row.nome}</div>
                <div className="text-xs text-outline">{params.row.casa === "camara" ? "Deputado Federal" : "Parlamentar"}</div>
              </div>
            </Link>
          );
        },
      },
      {
        field: "sigla_partido",
        headerName: "Partido",
        width: 130,
        sortable: false,
        renderCell: (params) => params.row.sigla_partido ?? "-",
      },
      {
        field: "sigla_uf",
        headerName: "UF",
        width: 100,
        sortable: false,
        renderCell: (params) => (
          params.row.sigla_uf ?? "-"
        ),
      },
      {
        field: "total_gasto",
        headerName: `Total gasto em ${ano} (R$)`,
        minWidth: 200,
        flex: 1,
        align: "right",
        headerAlign: "right",
        sortable: false,
        renderCell: (params) => (
          <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
            {params.row.total_gasto !== undefined ? formatBRL(params.row.total_gasto) : "-"}
          </span>
        ),
      },
      {
        field: "acoes",
        headerName: "",
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const parlamentarId = params.row.id ?? params.row.api_id;
          return (
            <Button
              type="button"
              size="sm"
              className="gap-1.5 rounded-lg font-label text-[12px]"
              onClick={() => navigate(`/parlamentares/${parlamentarId}`)}
            >
              Ver detalhes →
            </Button>
          );
        },
      },
    ],
    [ano, navigate],
  );

  return (
    <div className="flex min-h-0 max-w-full flex-1 flex-col animate-[fadeUp_0.35s_ease_both]">
      <section className="hero-gradient mb-6 rounded-xl p-6 text-white shadow-sm md:p-8">
        <h1 className="mt-4 font-headline text-3xl font-bold tracking-[-0.03em] md:text-4xl">Parlamentares da Republica</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Consulte representantes, acompanhe partido e UF e acesse rapidamente os detalhes de cada parlamentar.
        </p>
      </section>

      <div className="mb-6 rounded-xl bg-surface-container-low p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex min-w-[250px] flex-1 items-center gap-2 rounded-lg border border-outline-variant bg-white px-3 py-2">
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <Input
              placeholder="Buscar por nome..."
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setPage(1);
              }}
              className="w-full border-0 bg-transparent px-0 py-0 shadow-none focus:bg-transparent focus:shadow-none"
            />
          </label>
          <Input
            placeholder="Partido (ex: PT)"
            value={partido}
            onChange={(e) => {
              setPartido(e.target.value.toUpperCase());
              setPage(1);
            }}
            className="w-[140px] rounded-lg border-outline-variant bg-white px-4 py-2"
            maxLength={10}
          />
          <SelectField
            value={uf}
            onValueChange={(value) => {
              setUf(value);
              setPage(1);
            }}
            options={ufOptions}
            className="w-[160px] rounded-lg border-outline-variant bg-white px-4 py-2"
          />
          <SelectField
            value={String(ano)}
            onValueChange={(value) => {
              setAno(Number(value));
              setPage(1);
            }}
            options={anoOptions}
            className="w-[120px] rounded-lg border-outline-variant bg-white px-4 py-2"
          />
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

      <Card className="flex min-h-0 flex-1 flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest shadow-sm">
        <div className="min-h-[460px] w-full">
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={meta?.total ?? 0}
            pageSizeOptions={[20]}
            paginationModel={{ page: Math.max(0, page - 1), pageSize: 20 }}
            onPaginationModelChange={(model) => {
              const nextPage = model.page + 1;
              if (nextPage !== page) setPage(nextPage);
            }}
            disableRowSelectionOnClick
            localeText={{ ...muiPtBrLocaleText, noRowsLabel: "Nenhum parlamentar encontrado." }}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { borderRadius: 0 },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
