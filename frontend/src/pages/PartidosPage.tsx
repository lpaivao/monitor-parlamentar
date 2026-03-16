import { useEffect, useState } from 'react'
import { getRankingCategorias, getRankingPartidos } from '../services/api'
import type { RankingCategoria, RankingPartido } from '../types'
import { ANOS, formatBRL, formatCompact } from '../utils'

export default function PartidosPage() {
  const [ano, setAno] = useState(ANOS[0])
  const [tab, setTab] = useState<'partidos' | 'categorias'>('partidos')

  const [partidos, setPartidos] = useState<RankingPartido[]>([])
  const [categorias, setCategorias] = useState<RankingCategoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const base = { ano }
    Promise.all([
      getRankingPartidos(base),
      getRankingCategorias(base),
    ]).then(([p, c]) => {
      setPartidos(p.data)
      setCategorias(c.data)
    }).finally(() => setLoading(false))
  }, [ano])

  const maxPartido = Math.max(...partidos.map(p => p.total), 1)
  const maxCategoria = Math.max(...categorias.map(c => c.total), 1)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Gastos por Partido</h1>
        <p>Comparativo do uso da cota parlamentar entre partidos e categorias</p>
      </div>

      <div className="filter-bar">
        <select value={ano} onChange={e => setAno(Number(e.target.value))}>
          {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'partidos' ? 'active' : ''}`} onClick={() => setTab('partidos')}>
          Por partido
        </button>
        <button className={`tab-btn ${tab === 'categorias' ? 'active' : ''}`} onClick={() => setTab('categorias')}>
          Por categoria de gasto
        </button>
      </div>

      {loading && <div className="empty"><span className="spinner" /></div>}

      {/* Tab: partidos */}
      {!loading && tab === 'partidos' && (
        <div className="card card-body">
          {partidos.length === 0
            ? <p className="empty">Sem dados para o período selecionado.</p>
            : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 130px 140px', gap: 12, marginBottom: 10, fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  <span>Partido</span>
                  <span></span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span style={{ textAlign: 'right' }}>Parlamentares</span>
                  <span style={{ textAlign: 'right' }}>Média/parlamentar</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {partidos.map((p) => (
                    <div key={p.partido} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 130px 130px 140px', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.partido}</span>
                      <div className="gasto-bar-bg" style={{ height: 8 }}>
                        <div className="gasto-bar-fill" style={{ width: `${(p.total / maxPartido) * 100}%` }} />
                      </div>
                      <span style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{formatCompact(p.total)}</span>
                      <span style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 13 }}>{p.qtd_parlamentares}</span>
                      <span style={{ textAlign: 'right', fontSize: 13 }}>{formatBRL(p.media_por_parlamentar)}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </div>
      )}

      {/* Tab: categorias */}
      {!loading && tab === 'categorias' && (
        <div className="card card-body">
          {categorias.length === 0
            ? <p className="empty">Sem dados para o período selecionado.</p>
            : (
              <div className="bar-chart">
                {categorias.map((c) => (
                  <div key={c.categoria} className="bar-row">
                    <span className="bar-label" title={c.categoria}>{c.categoria}</span>
                    <div className="gasto-bar-bg" style={{ height: 8 }}>
                      <div className="gasto-bar-fill" style={{ width: `${(c.total / maxCategoria) * 100}%` }} />
                    </div>
                    <span className="bar-amount">{formatCompact(c.total)}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}
