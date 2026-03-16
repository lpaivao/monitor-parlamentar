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
    <div className="page">
      <div className="page-header">
        <h1>Parlamentares</h1>
        <p>Busque e filtre por nome, partido e estado</p>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Buscar por nome..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          style={{ width: 130 }}
          maxLength={10}
        />
        <SelectField value={uf} onValueChange={setUf} options={ufOptions} className="w-160" />
        <SelectField
          value={String(ano)}
          onValueChange={(v) => setAno(Number(v))}
          options={anoOptions}
          className="w-120"
        />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Parlamentar</th>
                <th>Partido</th>
                <th>UF</th>
                <th>Total gasto em {ano} (R$)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan={5}><span className="spinner" /></td>
                </tr>
              )}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">Nenhum parlamentar encontrado.</td>
                </tr>
              )}
              {!loading && data.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="parlamentar-cell">
                      <ParlamentarAvatar nome={p.nome} foto={p.foto_url} />
                      <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{p.nome}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-partido">{p.sigla_partido ?? "-"}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.sigla_uf ?? "-"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                      {p.total_gasto !== undefined ? formatBRL(p.total_gasto) : "-"}
                    </span>
                  </td>
                  <td>
                    <Link to={`/parlamentares/${p.id}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
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
