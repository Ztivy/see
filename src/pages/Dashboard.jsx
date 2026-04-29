import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEstudiante } from '../api/endpoints'

/* ─────────────────────────────────────────────
   Barra de progreso horizontal con etiqueta
───────────────────────────────────────────── */
function Bar({ label, value, max = 100, unit = '%' }) {
  const pct = Math.min(((parseFloat(value) || 0) / max) * 100, 100)
  return (
    <div className="sii-bar">
      <div className="sii-bar__header">
        <span className="sii-bar__label">{label}</span>
        <span className="sii-bar__value">{parseFloat(value).toFixed(1)}{unit !== '%' ? ` ${unit}` : '%'}</span>
      </div>
      <div className="sii-bar__track">
        <div className="sii-bar__fill" style={{ '--pct': `${pct}%` }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Número grande estilo editorial
───────────────────────────────────────────── */
function BigStat({ value, label, sub, accent = false }) {
  return (
    <div className={`sii-bigstat${accent ? ' sii-bigstat--accent' : ''}`}>
      <span className="sii-bigstat__num">{value}</span>
      <span className="sii-bigstat__label">{label}</span>
      {sub && <span className="sii-bigstat__sub">{sub}</span>}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Fila de dato simple
───────────────────────────────────────────── */
function DataRow({ label, value }) {
  return (
    <div className="sii-row">
      <span className="sii-row__label">{label}</span>
      <span className="sii-row__value">{value}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
function Skel({ w = '100%', h = '1rem' }) {
  return <span className="sii-skel" style={{ width: w, height: h, display: 'block' }} />
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════ */
export default function Dashboard() {
  const { logout, isAuth } = useAuth()
  const navigate = useNavigate()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [imgErr, setImgErr]     = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return }
    getEstudiante()
      .then(res => setData(res.data ?? res))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login', { replace: true })
        else setError('No se pudo obtener la información del servidor.')
      })
      .finally(() => setLoading(false))
  }, [isAuth, navigate])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="sii-shell">
        <header className="sii-header">
          <div className="sii-header__wordmark">SII ITC</div>
        </header>
        <main className="sii-main">
          <div className="sii-loading">
            <Skel w="260px" h="2.2rem" />
            <Skel w="180px" h="1rem" />
            <br />
            <Skel w="100%" h="1px" />
            <br />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => <Skel key={i} w="100%" h="5rem" />)}
            </div>
          </div>
        </main>
      </div>
    </>
  )

  /* ── Error ── */
  if (error) return (
    <>
      <style>{CSS}</style>
      <div className="sii-shell">
        <header className="sii-header">
          <div className="sii-header__wordmark">SII ITC</div>
        </header>
        <main className="sii-main">
          <div className="sii-error">
            <p className="sii-error__msg">{error}</p>
            <button className="sii-btn" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        </main>
      </div>
    </>
  )

  if (!data) return null

  const d        = data
  const pond     = parseFloat(d.promedio_ponderado  ?? 0)
  const arit     = parseFloat(d.promedio_aritmetico ?? 0)
  const avance   = d.porcentaje_avance          ?? 0
  const cursando = d.percentaje_avance_cursando  ?? 0
  const nombre   = d.persona ?? ''
  const initials = nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('')

  /* Color del promedio según rango */
  const pondClass = pond >= 90 ? 'good' : pond >= 80 ? 'ok' : pond >= 70 ? 'warn' : 'bad'

  const nav = [
    { label: 'Calificaciones', path: '/calificaciones' },
    { label: 'Kardex',         path: '/kardex'         },
    { label: 'Horario',        path: '/horario'        },
  ]

  return (
    <>
      <style>{CSS}</style>

      <div className="sii-shell">

        {/* ══ HEADER ══ */}
        <header className="sii-header">
          <div className="sii-header__left">
            <button
              className="sii-header__wordmark"
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              SII<span>ITC</span>
            </button>
          </div>

          <nav className="sii-header__nav">
            {nav.map(({ label, path }) => (
              <button key={label} className="sii-header__link" onClick={() => navigate(path)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="sii-header__right">
            <span className="sii-header__ctrl">{d.numero_control}</span>
            <button className="sii-header__logout" onClick={handleLogout}>
              Cerrar sesión
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main className="sii-main">

          {/* ── Franja de identidad ── */}
          <section className="sii-identity">
            <div className="sii-identity__avatar">
              {d.foto && !imgErr
                ? <img src={`data:image/jpeg;base64,${d.foto}`} alt="Foto" onError={() => setImgErr(true)} />
                : <span>{initials}</span>}
            </div>

            <div className="sii-identity__info">
              <p className="sii-identity__eyebrow">Semestre {d.semestre} · {d.numero_control}</p>
              <h1 className="sii-identity__name">{nombre}</h1>
              <p className="sii-identity__email">{d.email}</p>
            </div>

            <div className={`sii-identity__gpa sii-identity__gpa--${pondClass}`}>
              <span className="sii-identity__gpa-num">{pond.toFixed(2)}</span>
              <span className="sii-identity__gpa-label">Promedio<br/>ponderado</span>
            </div>
          </section>

          <div className="sii-divider" />

          {/* ── Grid superior: 4 números grandes ── */}
          <section className="sii-stats-grid">
            <BigStat
              value={pond.toFixed(1)}
              label="Prom. ponderado"
              sub="sobre 100"
              accent
            />
            <BigStat
              value={arit.toFixed(1)}
              label="Prom. aritmético"
              sub="sobre 100"
            />
            <BigStat
              value={d.creditos_acumulados}
              label="Créditos acum."
              sub={`+${d.creditos_complementarios ?? 0} comp.`}
            />
            <BigStat
              value={`${avance}%`}
              label="Avance carrera"
              sub={`${cursando}% cursando`}
            />
          </section>

          <div className="sii-divider" />

          {/* ── Dos columnas: materias + barras ── */}
          <section className="sii-two-col">

            {/* Col izquierda: materias */}
            <div className="sii-panel">
              <h2 className="sii-panel__title">Materias</h2>

              <div className="sii-pills-row">
                <div className="sii-pill sii-pill--green">
                  <span className="sii-pill__num">{d.materias_aprobadas}</span>
                  <span className="sii-pill__label">Aprobadas</span>
                </div>
                <div className="sii-pill sii-pill--red">
                  <span className="sii-pill__num">{d.materias_reprobadas}</span>
                  <span className="sii-pill__label">Reprobadas</span>
                </div>
                <div className="sii-pill sii-pill--amber">
                  <span className="sii-pill__num">{d.num_mat_rep_no_acreditadas ?? 0}</span>
                  <span className="sii-pill__label">No acred.</span>
                </div>
              </div>

              {/* Barra visual de distribución */}
              <div className="sii-distrib">
                <div
                  className="sii-distrib__seg sii-distrib__seg--green"
                  style={{ flex: d.materias_aprobadas }}
                  title={`${d.materias_aprobadas} aprobadas`}
                />
                <div
                  className="sii-distrib__seg sii-distrib__seg--red"
                  style={{ flex: d.materias_reprobadas }}
                  title={`${d.materias_reprobadas} reprobadas`}
                />
                <div
                  className="sii-distrib__seg sii-distrib__seg--amber"
                  style={{ flex: (d.num_mat_rep_no_acreditadas ?? 0) || 0.5 }}
                  title="No acreditadas"
                />
              </div>
              <p className="sii-distrib__legend">
                {d.materias_cursadas} materias cursadas en total
              </p>
            </div>

            {/* Col derecha: barras de avance */}
            <div className="sii-panel">
              <h2 className="sii-panel__title">Avance académico</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', marginTop: '0.5rem' }}>
                <Bar label="Avance de carrera" value={avance} />
                <Bar label="Avance cursando"   value={cursando} />
                <Bar label="Promedio ponderado" value={pond} />
                <Bar label="Promedio aritmético" value={arit} />
              </div>
            </div>
          </section>

          <div className="sii-divider" />

          {/* ── Tabla de datos crudos ── */}
          <section className="sii-panel">
            <h2 className="sii-panel__title">Datos del expediente</h2>
            <div className="sii-datatable">
              <DataRow label="Nombre completo"          value={d.persona} />
              <DataRow label="Número de control"        value={d.numero_control} />
              <DataRow label="Correo institucional"     value={d.email} />
              <DataRow label="Semestre"                 value={`${d.semestre}°`} />
              <DataRow label="Créditos acumulados"      value={d.creditos_acumulados} />
              <DataRow label="Créditos complementarios" value={d.creditos_complementarios ?? 0} />
              <DataRow label="Materias cursadas"        value={d.materias_cursadas} />
              <DataRow label="Materias aprobadas"       value={d.materias_aprobadas} />
              <DataRow label="Materias reprobadas"      value={d.materias_reprobadas} />
              <DataRow label="Rep. no acreditadas"      value={d.num_mat_rep_no_acreditadas ?? 0} />
              <DataRow label="Promedio ponderado"       value={pond.toFixed(4)} />
              <DataRow label="Promedio aritmético"      value={arit.toFixed(4)} />
              <DataRow label="Avance general"           value={`${avance}%`} />
              <DataRow label="Avance cursando"          value={`${cursando}%`} />
            </div>
          </section>

        </main>

        <footer className="sii-footer">
          <span>Tecnológico Nacional de México · Campus Celaya</span>
          <span>Sistema de Información Institucional · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════
   CSS — todo en una variable de template
   Fuentes: DM Serif Display (números/títulos)
            DM Sans (cuerpo)
═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:     #0f172a;
  --ink-2:   #334155;
  --ink-3:   #64748b;
  --paper:   #ffffff;
  --rule:    #e2e8f0;
  --accent:  #2563eb;       /* azul institucional suave */
  --accent-l:#eff6ff;
  --green:   #16a34a;
  --green-l: #ecfdf5;
  --red:     #dc2626;
  --red-l:   #fef2f2;
  --amber:   #d97706;
  --amber-l: #fffbeb;
  --radius:  20px;
  --font-serif: 'DM Serif Display', Georgia, serif;
  --font-sans:  'DM Sans', system-ui, sans-serif;
}

body { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e40af 45%, #4338ca 100%); color: var(--ink); font-family: var(--font-sans); }

/* ── Shell ── */
.sii-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 3rem;
  gap: 2rem;
}

/* ── Header ── */
.sii-header {
  position: static;
  width: min(1080px, 100%);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255,255,255,0.9);
  border-radius: 28px;
  padding: 1rem 1.5rem;
  box-shadow: 0 18px 50px rgba(15,23,42,0.12);
  backdrop-filter: blur(10px);
}

.sii-header__wordmark {
  font-family: var(--font-sans);
  font-size: 1rem;
  letter-spacing: .08em;
  color: var(--ink);
  text-transform: uppercase;
  font-weight: 800;
  white-space: nowrap;
  text-decoration: none;
}
.sii-header__wordmark span { color: var(--accent); }

.sii-header__nav {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex: 1;
}

.sii-header__link {
  background: rgba(37,99,235,0.08);
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: .85rem;
  font-weight: 600;
  color: var(--ink-2);
  padding: .6rem 1rem;
  border-radius: 999px;
  transition: color .15s, background .15s, transform .15s;
  letter-spacing: .01em;
}
.sii-header__link:hover {
  color: var(--ink);
  background: rgba(37,99,235,0.16);
  transform: translateY(-1px);
}

.sii-header__right {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-left: auto;
}

.sii-header__ctrl {
  font-size: .78rem;
  font-weight: 600;
  color: var(--ink-3);
  letter-spacing: .04em;
  font-variant-numeric: tabular-nums;
}

.sii-header__logout {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  background: var(--accent);
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: .78rem;
  font-weight: 700;
  color: white;
  padding: .65rem 1rem;
  border-radius: 999px;
  transition: background .15s, transform .15s;
}
.sii-header__logout:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* ── Main ── */
.sii-main {
  flex: 1;
  width: min(1080px, 100%);
  margin: 0 auto;
  padding: 2.2rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: white;
  border-radius: 32px;
  border: 1px solid rgba(226,232,240,0.75);
  box-shadow: 0 28px 70px rgba(15,23,42,0.12);
}

/* ── Divider ── */
.sii-divider {
  height: 1px;
  background: var(--rule);
}

/* ── Identity ── */
.sii-identity {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.sii-identity__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--rule);
  background: var(--rule);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  color: var(--ink-2);
}
.sii-identity__avatar img { width: 100%; height: 100%; object-fit: cover; }

.sii-identity__info { flex: 1; min-width: 0; }

.sii-identity__eyebrow {
  font-size: .72rem;
  font-weight: 500;
  color: var(--ink-3);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: .3rem;
}

.sii-identity__name {
  font-family: var(--font-sans);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--ink);
  line-height: 1.15;
  letter-spacing: -.01em;
}

.sii-identity__email {
  font-size: .88rem;
  color: var(--ink-2);
  margin-top: .35rem;
}

/* GPA badge */
.sii-identity__gpa {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
  padding: 1rem 1.5rem;
  border: 1.5px solid var(--rule);
  border-radius: var(--radius);
  background: var(--paper);
  flex-shrink: 0;
}
.sii-identity__gpa--good { border-color: var(--green); background: var(--green-l); }
.sii-identity__gpa--ok   { border-color: var(--accent); background: var(--accent-l); }
.sii-identity__gpa--warn { border-color: var(--amber);  background: var(--amber-l); }
.sii-identity__gpa--bad  { border-color: var(--red);    background: var(--red-l); }

.sii-identity__gpa-num {
  font-family: var(--font-serif);
  font-size: 2.4rem;
  line-height: 1;
  color: var(--ink);
}
.sii-identity__gpa--good .sii-identity__gpa-num { color: var(--green); }
.sii-identity__gpa--ok   .sii-identity__gpa-num { color: var(--accent); }
.sii-identity__gpa--warn .sii-identity__gpa-num { color: var(--amber); }
.sii-identity__gpa--bad  .sii-identity__gpa-num { color: var(--red); }

.sii-identity__gpa-label {
  font-size: .65rem;
  font-weight: 500;
  color: var(--ink-3);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .05em;
  line-height: 1.3;
}

/* ── Stats grid (4 números grandes) ── */
.sii-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.sii-bigstat {
  padding: 1.5rem 1.25rem;
  background: #f8fafc;
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.sii-bigstat--accent { background: var(--accent-l); }

.sii-bigstat__num {
  font-family: var(--font-sans);
  font-size: clamp(1.8rem, 2.5vw, 2.8rem);
  line-height: 1;
  color: var(--ink);
  letter-spacing: -.01em;
}
.sii-bigstat--accent .sii-bigstat__num { color: var(--accent); }

.sii-bigstat__label {
  font-size: .72rem;
  font-weight: 600;
  color: var(--ink-2);
  text-transform: uppercase;
  letter-spacing: .05em;
}

.sii-bigstat__sub {
  font-size: .7rem;
  color: var(--ink-3);
  font-style: italic;
}

/* ── Two columns ── */
.sii-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* ── Panel ── */
.sii-panel {
  background: #ffffff;
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 28px;
  padding: 1.5rem 1.75rem 1.75rem;
  box-shadow: 0 18px 45px rgba(15,23,42,0.07);
}
.sii-panel__title {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -.01em;
  margin-bottom: 1.2rem;
  padding-bottom: .5rem;
  border-bottom: 1px solid rgba(226,232,240,0.8);
}

/* ── Pills row ── */
.sii-pills-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.sii-pill {
  flex: 1;
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 18px;
  padding: .95rem .75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .25rem;
  background: #f8fafc;
}
.sii-pill--green { border-color: rgba(16,185,129,0.2); background: rgba(16,185,129,0.08); }
.sii-pill--red   { border-color: rgba(220,38,38,0.2);  background: rgba(220,38,38,0.08); }
.sii-pill--amber { border-color: rgba(217,119,6,0.25); background: rgba(217,119,6,0.08); }

.sii-pill__num {
  font-family: var(--font-sans);
  font-size: 1.7rem;
  line-height: 1;
  color: var(--ink);
}
.sii-pill--green .sii-pill__num { color: var(--green); }
.sii-pill--red   .sii-pill__num { color: var(--red); }
.sii-pill--amber .sii-pill__num { color: var(--amber); }

.sii-pill__label {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--ink-3);
}

/* ── Distribución visual ── */
.sii-distrib {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  gap: 3px;
  background: rgba(59,130,246,0.12);
}
.sii-distrib__seg { border-radius: 999px; min-width: 6px; }
.sii-distrib__seg--green { background: var(--green); }
.sii-distrib__seg--red   { background: var(--red); }
.sii-distrib__seg--amber { background: var(--amber); }

.sii-distrib__legend {
  font-size: .78rem;
  color: var(--ink-2);
  margin-top: .65rem;
}

/* ── Bar ── */
.sii-bar { display: flex; flex-direction: column; gap: .4rem; }
.sii-bar__header { display: flex; justify-content: space-between; align-items: baseline; }
.sii-bar__label  { font-size: .78rem; font-weight: 500; color: var(--ink-2); }
.sii-bar__value  {
  font-family: var(--font-sans);
  font-size: .96rem;
  color: var(--ink);
  letter-spacing: -.01em;
}
.sii-bar__track {
  height: 8px;
  background: rgba(226,232,240,0.95);
  border-radius: 999px;
  overflow: hidden;
}
.sii-bar__fill {
  height: 100%;
  width: var(--pct);
  background: var(--accent);
  border-radius: 999px;
  transition: width .8s ease;
}

/* ── Data table ── */
.sii-datatable {
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 24px;
  overflow: hidden;
}
.sii-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: .9rem 1rem;
  border-bottom: 1px solid rgba(226,232,240,0.9);
  transition: background .15s ease;
}
.sii-row:last-child { border-bottom: none; }
.sii-row:hover { background: #f8fafc; }
.sii-row__label {
  font-size: .78rem;
  color: var(--ink-2);
  font-weight: 400;
  flex-shrink: 0;
}
.sii-row__value {
  font-size: .82rem;
  font-weight: 600;
  color: var(--ink);
  text-align: right;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

/* ── Skeleton ── */
.sii-skel {
  background: linear-gradient(90deg, var(--rule) 25%, #e4e4e7 50%, var(--rule) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius);
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* ── Loading / Error ── */
.sii-loading { display: flex; flex-direction: column; gap: .75rem; max-width: 400px; }
.sii-error { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
.sii-error__msg { font-size: .9rem; color: var(--red); }

/* ── Button ── */
.sii-btn {
  font-family: var(--font-sans);
  font-size: .88rem;
  font-weight: 700;
  color: white;
  background: var(--accent);
  border: none;
  cursor: pointer;
  padding: .85rem 1.4rem;
  border-radius: 999px;
  transition: transform .15s, background .15s, box-shadow .15s;
  box-shadow: 0 10px 30px rgba(37,99,235,0.12);
}
.sii-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

/* ── Footer ── */
.sii-footer {
  border-top: 1px solid var(--rule);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: .7rem;
  color: var(--ink-3);
}

/* ── Responsive ── */
@media (max-width: 720px) {
  .sii-main { padding: 1.5rem 1rem 3rem; }
  .sii-header { padding: 0 1rem; }
  .sii-header__nav { display: none; }
  .sii-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .sii-bigstat { border-bottom: 1px solid var(--rule); }
  .sii-two-col { grid-template-columns: 1fr; }
  .sii-identity { gap: 1rem; }
  .sii-identity__gpa { width: 100%; flex-direction: row; justify-content: center; }
  .sii-footer { flex-direction: column; align-items: center; text-align: center; }
}
`