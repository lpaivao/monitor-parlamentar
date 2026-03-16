import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDespesasParlamentar, getParlamentar } from '../services/api'
import type { Despesa, Paginated, ParlamentarDetalhe } from '../types'
import { ANOS, formatBRL, MESES } from '../utils'

export default function ParlamentarPage() {
  const { id } = useParams<{ id: string }>()
  const [ano, setAno] = useState(ANOS[0])
  const [tab, setTab] = useState<'categorias' | 'despesas'>('categorias')

  const [parl, setParl] = useState<ParlamentarDetalhe | null>(null)
  const [loadingParl, setLoadingParl] = useState(true)

  const [despesas, setDespesas] = useState<Paginated<Despesa> | null>(null)
  const [loadingDesp, setLoadingDesp] = useState(false)
  const [page, setPage] = useState(1)

  // Carrega dados do parlamentar
  useEffect(() => {
    if (!id) return
    setLoadingParl(true)
    getParlamentar(Number(id), ano)
      .then(setParl)
      .finally(() => setLoadingParl(false))
  }, [id, ano])

  // Carrega lista de despesas quando tab muda
  useEffect(() => {
    if (!id || tab !== 'despesas') return
    setLoadingDesp(true)
    getDespesasParlamentar(Number(id), { ano, page })
      .then(setDespesas)
      .finally(() => setLoadingDesp(false))
  }, [id, tab, ano, page])

  useEffect(() => { setPage(1) }, [ano])

  if (loadingParl) {
    return (
      <div className="page">
        <div className="empty"><span className="spinner" /></div>
      </div>
    )
  }

  if (!parl) {
    return (
      <div className="page">
        <div className="empty">Parlamentar não encontrado. <Link to="/parlamentares">Voltar</Link></div>
      </div>
    )
  }

  const maxCategoria = Math.max(...(parl.por_categoria?.map(c => c.total) ?? [1]), 1)

  return (
    <div className="page">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link to="/parlamentares" style={{ color: 'var(--muted)', fontSize: 14 }}>← Parlamentares</Link>
      </div>

      <div className="card card-body" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {parl.foto_url
            ? <img src={parl.foto_url} alt={parl.nome} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
            : <div className="avatar-placeholder" style={{ width: 72, height: 72, fontSize: 28 }}>{parl.nome[0]}</div>
          }
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{parl.nome}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-partido">{parl.sigla_partido ?? '—'}</span>
              <span className="badge badge-partido">{parl.sigla_uf ?? '—'}</span>
              <span className="badge badge-camara">Câmara dos Deputados</span>
            </div>
          </div>
          <select
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14 }}
          >
            {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total gasto em {ano}</div>
          <div className="value" style={{ fontSize: 20 }}>{formatBRL(parl.total_gasto)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Categorias utilizadas</div>
          <div className="value">{parl.por_categoria?.length ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="label">Maior categoria</div>
          <div className="value" style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
            {parl.por_categoria?.[0]?.tipo_despesa ?? '—'}
          </div>
          <div className="sub">{parl.por_categoria?.[0] ? formatBRL(parl.por_categoria[0].total) : ''}</div>
        </div>
        <div className="stat-card">
          <div className="label">Média mensal</div>
          <div className="value" style={{ fontSize: 20 }}>
            {formatBRL(parl.total_gasto / Math.max(parl.por_mes?.length ?? 1, 1))}
          </div>
        </div>
      </div>

      {/* Gasto por mês (mini barras CSS) */}
      {parl.por_mes && parl.por_mes.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Gasto mensal</h3>
          <MesChart data={parl.por_mes} />
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'categorias' ? 'active' : ''}`} onClick={() => setTab('categorias')}>
          Por categoria
        </button>
        <button className={`tab-btn ${tab === 'despesas' ? 'active' : ''}`} onClick={() => setTab('despesas')}>
          Notas individuais
        </button>
      </div>

      {/* Tab: categorias */}
      {tab === 'categorias' && (
        <div className="card card-body">
          {!parl.por_categoria?.length
            ? <p className="empty">Nenhuma despesa encontrada para {ano}.</p>
            : (
              <div className="bar-chart">
                {parl.por_categoria.map((c) => (
                  <div key={c.tipo_despesa} className="bar-row">
                    <span className="bar-label" title={c.tipo_despesa ?? '—'}>{c.tipo_despesa ?? '—'}</span>
                    <div className="gasto-bar-bg" style={{ height: 8 }}>
                      <div
                        className="gasto-bar-fill"
                        style={{ width: `${(c.total / maxCategoria) * 100}%` }}
                      />
                    </div>
                    <span className="bar-amount">{formatBRL(c.total)}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Tab: despesas individuais */}
      {tab === 'despesas' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Fornecedor</th>
                  <th>Documento</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {loadingDesp && (
                  <tr className="loading-row"><td colSpan={5}><span className="spinner" /></td></tr>
                )}
                {!loadingDesp && (despesas?.data ?? []).length === 0 && (
                  <tr><td colSpan={5} className="empty">Nenhuma despesa encontrada.</td></tr>
                )}
                {!loadingDesp && (despesas?.data ?? []).map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {d.data_emissao ? new Date(d.data_emissao).toLocaleDateString('pt-BR') : `${MESES[(d.mes ?? 1) - 1]}/${ano}`}
                    </td>
                    <td style={{ fontSize: 13 }}>{d.tipo_despesa ?? '—'}</td>
                    <td style={{ fontSize: 13 }}>{d.fornecedor ?? '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {d.url_documento
                        ? <a href={d.url_documento} target="_blank" rel="noreferrer">Ver nota</a>
                        : (d.numero_documento ?? '—')
                      }
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(d.valor_liquido)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {despesas?.meta && despesas.meta.last_page > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ← Anterior
              </button>
              <span>Página {despesas.meta.current_page} de {despesas.meta.last_page}</span>
              <button className="btn btn-ghost" disabled={page === despesas.meta.last_page} onClick={() => setPage(p => p + 1)}>
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MesChart({ data }: { data: { mes: number; total: number }[] }) {
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const found = data.find(d => d.mes === i + 1)
        const pct = found ? (found.total / max) * 100 : 0
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              title={found ? formatBRL(found.total) : 'Sem dados'}
              style={{
                width: '100%',
                height: `${Math.max(pct, 2)}%`,
                background: pct > 0 ? 'var(--brand)' : 'var(--border)',
                borderRadius: '3px 3px 0 0',
                minHeight: 3,
                transition: 'height .3s',
                cursor: found ? 'pointer' : 'default',
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{MESES[i]}</span>
          </div>
        )
      })}
    </div>
  )
}
