import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/spinner";
import { TabPanel, TabsField } from "../components/ui/Tabs";
import { getRankingCategorias, getRankingPartidos } from "../services/api";
import type { RankingCategoria, RankingPartido } from "../types";
import { ANOS, formatBRL } from "../utils";

const CLIENT_PER_PAGE = 12;

function getSlice<T>(items: T[], page: number) {
  const start = (page - 1) * CLIENT_PER_PAGE;
  return items.slice(start, start + CLIENT_PER_PAGE);
}

export default function PartidosPage() {
  const [ano, setAno] = useState(ANOS[0]);
  const [tab, setTab] = useState<"partidos" | "categorias">("partidos");

  const [partidos, setPartidos] = useState<RankingPartido[]>([]);
  const [categorias, setCategorias] = useState<RankingCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [partidosPage, setPartidosPage] = useState(1);
  const [categoriasPage, setCategoriasPage] = useState(1);

  const anosVisiveis = useMemo(() => ANOS.slice(0, 3), []);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setPartidosPage(1);
      setCategoriasPage(1);

      try {
        const [rp, rc] = await Promise.all([getRankingPartidos({ ano }), getRankingCategorias({ ano })]);
        if (mounted) {
          setPartidos(rp.data);
          setCategorias(rc.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [ano]);

  const maxPartido = Math.max(...partidos.map((p) => p.total), 1);
  const maxCategoria = Math.max(...categorias.map((c) => c.total), 1);

  const partidosLastPage = Math.max(1, Math.ceil(partidos.length / CLIENT_PER_PAGE));
  const categoriasLastPage = Math.max(1, Math.ceil(categorias.length / CLIENT_PER_PAGE));

  const partidosCurrent = getSlice(partidos, partidosPage);
  const categoriasCurrent = getSlice(categorias, categoriasPage);
  const totalPartidos = partidos.reduce((acc, p) => acc + p.total, 0);
  const mediaPartido = partidos.length > 0 ? totalPartidos / partidos.length : 0;
  const maiorCategoria = categorias[0];

  return (
    <div className="max-w-full animate-[fadeUp_0.35s_ease_both] pb-6">
      <section className="hero-gradient mb-6 rounded-xl p-6 text-white shadow-sm md:p-8">
        <h1 className="mt-4 font-headline text-3xl font-bold tracking-[-0.03em] md:text-4xl">Gastos por Partido</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Comparativo do uso da cota parlamentar entre partidos e categorias
        </p>
      </section>

      <div className="mb-6 inline-flex items-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low p-1">
        {anosVisiveis.map((anoItem) => (
          <button
            key={anoItem}
            type="button"
            onClick={() => setAno(anoItem)}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              anoItem === ano ? "bg-primary text-white" : "text-outline hover:bg-white",
            ].join(" ")}
          >
            {anoItem}
          </button>
        ))}
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
            <Card className="flex max-h-[calc(100vh-350px)] flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm">
              {partidos.length === 0 ? (
                <p className="py-14 text-center text-sm text-outline">Sem dados para o periodo selecionado.</p>
              ) : (
                <>
                  <div className="mb-1 grid flex-shrink-0 items-center gap-4 border-b border-outline-variant pb-3 text-[11px] font-semibold uppercase tracking-widest text-outline" style={{ gridTemplateColumns: '80px 1fr 110px 100px 140px' }}>
                    <span>Partido</span>
                    <span />
                    <span className="text-right">Total (R$)</span>
                    <span className="text-right">Deputados</span>
                    <span className="text-right">Média/dep. (R$)</span>
                  </div>

                  <div className="flex flex-col overflow-y-auto flex-1">
                    {partidosCurrent.map((p, i) => (
                      <div
                        key={p.partido}
                        className="grid items-center gap-4 rounded-lg border-b border-outline-variant px-1.5 py-2.5 transition-colors last:border-b-0 hover:bg-secondary-container/10"
                        style={{ gridTemplateColumns: '80px 1fr 110px 100px 140px', animationDelay: `${i * 25}ms`, animation: 'fadeUp 0.3s ease both' }}
                      >
                        <span className="inline-flex w-fit rounded-full bg-surface-container px-2.5 py-1 font-headline text-[12px] font-bold tracking-[0.03em] text-primary" title={p.partido}>
                          {p.partido || "-"}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                          <div className="h-full rounded-full bg-secondary" style={{ width: `${(p.total / maxPartido) * 100}%` }} />
                        </div>
                        <span className="tabular-nums text-right font-mono text-[12px] font-bold text-primary">
                          {formatBRL(p.total)}
                        </span>
                        <span className="tabular-nums text-right font-mono text-[12px] text-outline">
                          {p.qtd_parlamentares}
                        </span>
                        <span className="tabular-nums text-right font-mono text-[12px] text-on-surface">
                          {formatBRL(p.media_por_parlamentar)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-shrink-0">
                    <Pagination currentPage={partidosPage} lastPage={partidosLastPage} onPageChange={setPartidosPage} />
                  </div>
                </>
              )}
            </Card>
          </TabPanel>

          <TabPanel value="categorias">
            <Card className="flex max-h-[calc(100vh-350px)] flex-col rounded-xl border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm">
              {categorias.length === 0 ? (
                <p className="py-14 text-center text-sm text-outline">Sem dados para o periodo selecionado.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-3.5 overflow-y-auto flex-1">
                    {categoriasCurrent.map((cat, i) => (
                      <div
                        key={cat.categoria}
                        className="grid items-center gap-3.5"
                        style={{ gridTemplateColumns: '200px 1fr 110px', animationDelay: `${i * 25}ms`, animation: 'fadeUp 0.3s ease both' }}
                      >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium text-on-surface-variant" title={cat.categoria}>
                          {cat.categoria}
                        </span>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                          <div className="h-full rounded-full bg-secondary" style={{ width: `${(cat.total / maxCategoria) * 100}%` }} />
                        </div>
                        <span className="tabular-nums whitespace-nowrap text-right font-mono text-[12px] font-semibold text-on-surface">{formatBRL(cat.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-shrink-0">
                    <Pagination
                      currentPage={categoriasPage}
                      lastPage={categoriasLastPage}
                      onPageChange={setCategoriasPage}
                    />
                  </div>
                </>
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
