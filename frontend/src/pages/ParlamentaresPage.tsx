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
    <div className="px-8 pt-10 pb-4 max-w-full animate-[fadeUp_0.35s_ease_both] flex flex-col flex-1 min-h-0">
      <div className="mb-8">
        <h1 className="page-title-gradient text-[42px] font-extrabold tracking-[-0.04em] mb-2">Parlamentares</h1>
        <p className="text-[var(--text-muted)] text-sm tracking-wide">Busque e filtre por nome, partido e estado</p>
      </div>

      <div className="flex items-center gap-2.5 mb-6 flex-wrap">
        <Input
          placeholder="Buscar por nome..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="flex-1 min-w-0 max-w-[300px]"
        />
        <Input
          placeholder="Partido (ex: PT)"
          value={partido}
          onChange={(e) => setPartido(e.target.value.toUpperCase())}
          className="w-[130px]"
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

      <Card className="transition-colors duration-300 hover:border-[var(--border-strong)] flex flex-col flex-1 min-h-0">
        <Table.Root containerClassName="flex-1 min-h-0">
          <Table.Header>
            <Table.Row className="hover:bg-transparent">
              <Table.ColumnHeaderCell>Parlamentar</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Partido</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>UF</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total gasto em {ano} (R$)</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell aria-label="Acoes" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={5} className="py-12 text-center">
                  <Spinner className="mx-auto" />
                </Table.Cell>
              </Table.Row>
            )}
            {!loading && data.length === 0 && (
              <Table.Row className="hover:bg-transparent border-b-0">
                <Table.Cell colSpan={5} className="py-14 text-center text-[var(--text-muted)] text-sm">Nenhum parlamentar encontrado.</Table.Cell>
              </Table.Row>
            )}
            {!loading && data.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell>
                  <div className="flex items-center gap-2.5 text-[var(--text-strong)] font-medium">
                    <ParlamentarAvatar nome={p.nome} foto={p.foto_url} />
                    <span className="text-[var(--text-strong)] font-medium">{p.nome}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge>{p.sigla_partido ?? "-"}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-[12px] text-[var(--text-muted)]">
                    {p.sigla_uf ?? "-"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-[13px] font-semibold text-[var(--accent)]">
                    {p.total_gasto !== undefined ? formatBRL(p.total_gasto) : "-"}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Link
                    to={`/parlamentares/${p.id}`}
                    className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-[var(--text-muted)] px-4 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] transition-all hover:text-[var(--text-strong)] hover:bg-[var(--bg-raised)] hover:border-[var(--border-strong)] whitespace-nowrap"
                  >
                    Ver detalhes →
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {meta && (
          <Pagination currentPage={meta.currentPage} lastPage={meta.lastPage} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
