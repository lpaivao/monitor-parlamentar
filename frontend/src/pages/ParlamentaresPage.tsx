import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ParlamentarAvatar } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { SelectField } from "../components/ui/SelectField";
import { getParlamentares } from "../services/api";
import type { Paginated, Parlamentar } from "../types";
import { ANOS, formatBRL, UFS } from "../utils";

export default function ParlamentaresPage() {
  const [result, setResult] = useState<Paginated<Parlamentar> | null>(null);
  const [loading, setLoading] = useState(true);

  const [nome, setNome] = useState("");
  const [partido, setPartido] = useState("");
  const [uf, setUf] = useState("");
  const [ano, setAno] = useState(ANOS[0]);
  const [page, setPage] = useState(1);

  const ufOptions = useMemo(
    () => [{ label: "Todos os estados", value: "" }, ...UFS.map((u) => ({ label: u, value: u }))],
    [],
  );
  const anoOptions = useMemo(() => ANOS.map((a) => ({ label: String(a), value: String(a) })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getParlamentares({ nome, partido, uf, ano, page, perPage: 20 });
      setResult(response);
    } finally {
      setLoading(false);
    }
  }, [nome, partido, uf, ano, page]);

  useEffect(() => { setPage(1); }, [nome, partido, uf, ano]);
  useEffect(() => { load(); }, [load]);

  const meta = result?.meta;
  const data = result?.data ?? [];

  return (
    <div className="px-8 py-10 pb-16 max-w-full animate-[fadeUp_0.35s_ease_both]">
      <div className="mb-8">
        <h1 className="page-title-gradient text-[42px] font-extrabold tracking-[-0.04em] mb-2">Parlamentares</h1>
        <p className="text-[var(--text-muted)] text-sm tracking-wide">Busque e filtre por nome, partido e estado</p>
      </div>

      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <input
          placeholder="Buscar por nome..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="font-sans text-[13px] font-medium text-[var(--text-strong)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3.5 py-2 outline-none transition-all placeholder:text-[var(--text-dim)] focus:border-[var(--accent-border)] focus:bg-[var(--bg-raised)] focus:shadow-[0_0_0_3px_var(--accent-dim)] flex-1 min-w-0 max-w-[300px]"
        />
        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          className="font-sans text-[13px] font-medium text-[var(--text-strong)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3.5 py-2 outline-none transition-all placeholder:text-[var(--text-dim)] focus:border-[var(--accent-border)] focus:bg-[var(--bg-raised)] focus:shadow-[0_0_0_3px_var(--accent-dim)] w-[130px]"
          maxLength={10}
        />
        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-[160px]" />
        <SelectField
          value={String(ano)}
          onValueChange={(v) => setAno(Number(v))}
          options={anoOptions}
          className="w-[120px]"
        />
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden transition-colors duration-300 hover:border-[var(--border-strong)]">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100svh-260px)]">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr>
                <th className="px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10">Parlamentar</th>
                <th className="px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10">Partido</th>
                <th className="px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10">UF</th>
                <th className="px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10">Total gasto em {ano} (R$)</th>
                <th className="px-4 py-3.5 text-left font-sans text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-widest border-b border-[var(--border)] whitespace-nowrap bg-[var(--bg-surface)] sticky top-0 z-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <span className="inline-block w-[22px] h-[22px] border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhum parlamentar encontrado.</td>
                </tr>
              )}
              {!loading && data.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-4 py-3.5 text-[var(--text)] align-middle">
                    <div className="flex items-center gap-2.5 text-[var(--text-strong)] font-medium">
                      <ParlamentarAvatar nome={p.nome} foto={p.foto_url} />
                      <span className="text-[var(--text-strong)] font-medium">{p.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text)] align-middle">
                    <span className="inline-flex items-center font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap tracking-[0.04em] text-[var(--text-strong)] bg-[var(--bg-raised)] border border-[var(--border-strong)]">{p.sigla_partido ?? "-"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text)] align-middle">
                    <span className="font-mono text-[12px] text-[var(--text-muted)]">
                      {p.sigla_uf ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text)] align-middle">
                    <span className="font-mono text-[13px] font-semibold text-[var(--accent)]">
                      {p.total_gasto !== undefined ? formatBRL(p.total_gasto) : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[var(--text)] align-middle">
                    <Link
                      to={`/parlamentares/${p.id}`}
                      className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-[var(--text-muted)] px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] transition-all hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border-strong)] whitespace-nowrap"
                    >
                      Ver detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <Pagination currentPage={meta.currentPage} lastPage={meta.lastPage} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
