import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { Spinner } from "../components/ui/spinner";
import { Table } from "../components/ui/Table";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getDespesasParlamentar, getParlamentar } from "../services/api";
import type { Despesa, Paginated, ParlamentarDetalhe } from "../types";
import { ANOS, formatBRL, MESES } from "../utils";

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
      <div className="px-8 py-10">
        <div className="py-14 text-center"><Spinner className="mx-auto" /></div>
      </div>
    );
  }

  if (!parlamentar) {
    return (
      <div className="px-8 py-10">
        <div className="py-14 text-center text-[var(--text-muted)] text-sm">
          Parlamentar não encontrado.{" "}
          <Link to="/parlamentares">← Voltar</Link>
        </div>
      </div>
    );
  }

  const maxCategoria = Math.max(...(parlamentar.por_categoria?.map((c) => c.total) ?? [1]), 1);
  const mediaMensal = formatBRL(parlamentar.total_gasto / Math.max(parlamentar.por_mes?.length ?? 1, 1));

  return (
    <div className="px-8 py-10 pb-16 max-w-full animate-[fadeUp_0.35s_ease_both]">
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/parlamentares"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
        >
          ← Parlamentares
        </Link>
      </div>

      {/* Hero card */}
      <Card className="p-6 mb-5">
        <div className="flex gap-5 items-center flex-wrap justify-between">
          <div className="flex gap-5 items-center flex-wrap">
            <ParlamentarAvatar nome={parlamentar.nome} foto={parlamentar.foto_url} size="lg" />
            <div>
              <h1 className="text-[26px] font-extrabold tracking-[-0.03em] mb-2.5 text-[var(--text-h)]">
                {parlamentar.nome}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <Badge>{parlamentar.sigla_partido ?? "-"}</Badge>
                <Badge>{parlamentar.sigla_uf ?? "-"}</Badge>
                <Badge variant="accent">Câmara dos Deputados</Badge>
              </div>
            </div>
          </div>
          <SelectField
            value={String(ano)}
            onValueChange={(v) => {
              setAno(Number(v));
              setPage(1);
            }}
            options={anoOptions}
            className="w-[120px]"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <Card className="stat-card rounded-[var(--radius-md)] px-5 py-5 relative transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-2.5">Total gasto em {ano}</div>
          <div className="font-sans text-[20px] font-extrabold text-[var(--accent)] tracking-[-0.03em] leading-none">{formatBRL(parlamentar.total_gasto)}</div>
        </Card>
        <Card className="stat-card rounded-[var(--radius-md)] px-5 py-5 relative transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-2.5">Categorias utilizadas</div>
          <div className="font-sans text-[28px] font-extrabold text-[var(--text-h)] tracking-[-0.03em] leading-none">{parlamentar.por_categoria?.length ?? 0}</div>
        </Card>
        <Card className="stat-card rounded-[var(--radius-md)] px-5 py-5 relative transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-2.5">Maior categoria</div>
          <div className="font-sans text-[13px] font-semibold text-[var(--text-h)] leading-snug mt-1.5">{parlamentar.por_categoria?.[0]?.tipo_despesa ?? "-"}</div>
          <div className="font-mono text-[11px] text-[var(--text-muted)] mt-1.5">{parlamentar.por_categoria?.[0] ? formatBRL(parlamentar.por_categoria[0].total) : ""}</div>
        </Card>
        <Card className="stat-card rounded-[var(--radius-md)] px-5 py-5 relative transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)]">
          <div className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest mb-2.5">Média mensal</div>
          <div className="font-sans text-[20px] font-extrabold text-[var(--text-h)] tracking-[-0.03em] leading-none">{mediaMensal}</div>
        </Card>
      </div>

      {/* Monthly chart */}
      {parlamentar.por_mes && parlamentar.por_mes.length > 0 && (
        <Card className="p-6 mb-5">
          <h3 className="font-sans font-bold mb-5 text-[14px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Gasto mensal — {ano}
          </h3>
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
          <Card className="p-6">
            {!parlamentar.por_categoria?.length ? (
              <p className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhuma despesa encontrada para {ano}.</p>
            ) : (
              <div className="flex flex-col gap-3.5">
                {parlamentar.por_categoria.map((cat, i) => (
                  <div
                    key={cat.tipo_despesa}
                    className="grid items-center gap-3.5"
                    style={{ gridTemplateColumns: '200px 1fr 110px', animationDelay: `${i * 30}ms`, animation: 'fadeUp 0.3s ease both' }}
                  >
                    <span className="text-[12px] font-medium text-[var(--text)] overflow-hidden text-ellipsis whitespace-nowrap" title={cat.tipo_despesa ?? "-"}>
                      {cat.tipo_despesa ?? "-"}
                    </span>
                    <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div className="gasto-bar-fill" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                    </div>
                    <span className="font-mono text-[12px] font-semibold text-[var(--text-strong)] text-right whitespace-nowrap">{formatBRL(cat.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel value="despesas">
          <Card>
            <Table.Root containerClassName="max-h-[700px]">
              <Table.Header>
                <Table.Row className="hover:bg-transparent">
                  <Table.ColumnHeaderCell>Data</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Categoria</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Fornecedor</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Documento</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Valor (R$)</Table.ColumnHeaderCell>
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
                    <Table.Cell colSpan={5} className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhuma despesa encontrada.</Table.Cell>
                  </Table.Row>
                )}
                {!loadingDespesas && (despesas?.data ?? []).map((d) => (
                  <Table.Row key={d.id}>
                    <Table.Cell className="whitespace-nowrap">
                      <span className="font-mono text-[12px] text-[var(--text-muted)]">
                        {d.data_emissao
                          ? new Date(d.data_emissao).toLocaleDateString("pt-BR")
                          : `${MESES[(d.mes ?? 1) - 1]}/${ano}`}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{d.tipo_despesa ?? "-"}</Table.Cell>
                    <Table.RowHeaderCell>{d.fornecedor ?? "-"}</Table.RowHeaderCell>
                    <Table.Cell>
                      {d.url_documento ? (
                        <a href={d.url_documento} target="_blank" rel="noreferrer" className="text-[12px] text-[var(--accent)] hover:opacity-80 transition-opacity">
                          Ver nota ↗
                        </a>
                      ) : (
                        <span className="text-[12px] text-[var(--text-dim)]">{d.numero_documento ?? "-"}</span>
                      )}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      <span className="font-mono font-semibold text-[13px] text-[var(--accent)]">
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
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-2 h-[100px] px-1">
      {Array.from({ length: 12 }, (_, i) => {
        const found = data.find((d) => d.mes === i + 1);
        const pct = found ? (found.total / max) * 100 : 0;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div
              title={found ? formatBRL(found.total) : "Sem dados"}
              className="w-full rounded-t min-h-[3px] transition-[height] duration-500"
              style={{
                height: `${Math.max(pct, 3)}%`,
                background: pct > 0
                  ? 'linear-gradient(180deg, rgba(0,156,59,0.9) 0%, rgba(0,156,59,0.5) 100%)'
                  : 'var(--border)',
                cursor: found ? 'pointer' : 'default',
                border: pct > 0 ? '1px solid rgba(0,156,59,0.3)' : '1px solid var(--border)',
                borderBottom: 'none',
              }}
            />
            <span className="font-mono text-[9px] text-[var(--text-dim)] uppercase">
              {MESES[i].slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
