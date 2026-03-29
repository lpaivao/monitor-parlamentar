import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { Spinner } from "../components/ui/spinner";
import { Table } from "../components/ui/Table";
import { getRanking } from "../services/api";
import type { RankingItem } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

const CLIENT_PER_PAGE = 20;

function getSlice<T>(items: T[], page: number) {
  const start = (page - 1) * CLIENT_PER_PAGE;
  return items.slice(start, start + CLIENT_PER_PAGE);
}

function getRankMedal(pos: number) {
  if (pos === 1) return { icon: "🥇", color: "#fbbf24" };
  if (pos === 2) return { icon: "🥈", color: "#94a3b8" };
  if (pos === 3) return { icon: "🥉", color: "#cd7c4e" };
  return null;
}

export default function RankingPage() {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [ano, setAno] = useState(ANOS[0]);
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [page, setPage] = useState(1);

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((item) => ({ label: item, value: item }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((item) => ({ label: String(item), value: String(item) })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRanking({ ano, partido, uf, limit: 100 });
      setItems(response.data);
    } finally {
      setLoading(false);
    }
  }, [ano, partido, uf]);

  useEffect(() => { setPage(1); }, [ano, partido, uf]);
  useEffect(() => { load(); }, [load]);

  const max = items[0]?.total_gasto ?? 1;
  const totalGeral = items.reduce((sum, item) => sum + item.total_gasto, 0);
  const lastPage = Math.max(1, Math.ceil(items.length / CLIENT_PER_PAGE));
  const currentItems = getSlice(items, page);

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
          onValueChange={(value) => setAno(Number(value))}
          options={anoOptions}
          className="w-[132px] rounded-lg border-outline-variant bg-white px-4 py-2"
        />
        <Input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          className="w-[160px] rounded-lg border-outline-variant bg-white px-4 py-2"
          maxLength={10}
        />
        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-[180px] rounded-lg border-outline-variant bg-white px-4 py-2" />
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
        <Table.Root containerClassName="flex-1 min-h-0">
          <Table.Header>
            <Table.Row className="hover:bg-transparent">
              <Table.ColumnHeaderCell className="w-14 bg-primary-container text-xs uppercase tracking-wider text-on-primary">#</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Parlamentar</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Partido / UF</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Despesas</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="bg-primary-container text-xs uppercase tracking-wider text-on-primary">Total gasto (R$)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="w-[180px] bg-primary-container text-xs uppercase tracking-wider text-on-primary">Proporcao</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={6} className="py-12 text-center">
                  <Spinner className="mx-auto" />
                </Table.Cell>
              </Table.Row>
            )}
            {!loading && items.length === 0 && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={6} className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhum resultado encontrado.</Table.Cell>
              </Table.Row>
            )}
            {!loading && currentItems.map((item) => {
              const medal = getRankMedal(item.posicao);
              const pct = (item.total_gasto / max) * 100;
              return (
                <Table.Row key={item.id} className="hover:bg-secondary-container/10">
                  <Table.Cell>
                    {medal ? (
                      <span
                        className={[
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          item.posicao === 1
                            ? "bg-tertiary-fixed text-tertiary"
                            : item.posicao === 2
                              ? "bg-slate-300 text-slate-700"
                              : "bg-amber-700/20 text-amber-900",
                        ].join(" ")}
                        title={`#${item.posicao}`}
                      >
                        {item.posicao}
                      </span>
                    ) : (
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface-container text-xs font-semibold text-outline">
                        {item.posicao}
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2.5 font-medium text-on-surface">
                      <ParlamentarAvatar nome={item.nome} foto={item.foto_url} />
                      <Link to={`/parlamentares/${item.id}`} className="font-medium text-on-surface transition-colors hover:text-primary">{item.nome}</Link>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge>{item.sigla_partido ?? "-"}</Badge>
                      <Badge>{item.sigla_uf ?? "-"}</Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="tabular-nums font-mono text-[12px] text-outline">
                      {item.qtd_despesas.toLocaleString("pt-BR")}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <span className="tabular-nums font-mono text-[13px] font-bold text-primary">
                      {formatBRL(item.total_gasto)}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="tabular-nums w-9 text-right font-mono text-[10px] text-outline">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
        {!loading && <Pagination currentPage={page} lastPage={lastPage} onPageChange={setPage} />}
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
