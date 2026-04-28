import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEstudiante } from '../api/endpoints'

// ── helpers ──────────────────────────────────────────────────────────────────
const ring = (pct, color) => {
  const r = 40, circ = 2 * Math.PI * r
  return { strokeDasharray: circ, strokeDashoffset: circ * (1 - pct / 100), stroke: color }
}

function RingChart({ value, max = 100, color, label, sublabel, size = 110 }) {
  const pct = Math.min((value / max) * 100, 100)
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 110 110">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx={cx} cy={cy} r={r} fill="none" strokeWidth="10"
          strokeLinecap="round"
          style={{ ...ring(pct, color), transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{value}</text>
        {sublabel && <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8.5" fill="#64748b">{sublabel}</text>}
      </svg>
      <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-center">{label}</span>
    </div>
  )
}

function StatCard({ label, value, icon, accent, delay = 0 }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, animation: 'slideUp .5s ease both' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: accent + '18' }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
}

// ── main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { logout, isAuth } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!isAuth) { navigate('/login', { replace: true }); return }
    getEstudiante()
      .then(res => setData(res.data))
      .catch(err => {
        if (err.response?.status === 401) navigate('/login', { replace: true })
        else setError('No se pudo cargar tu información. Intenta de nuevo.')
      })
      .finally(() => setLoading(false))
  }, [isAuth, navigate])

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  // ── loading skeleton ──
  if (loading) return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-48" />
      </div>
    </div>
  )

  // ── error ──
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-slate-700 font-medium mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Reintentar
        </button>
      </div>
    </div>
  )

  if (!data) return null

  const d = data
  const promPond = parseFloat(d.promedio_ponderado).toFixed(1)
  const promArit = parseFloat(d.promedio_aritmetico).toFixed(1)
  const avance = d.porcentaje_avance
  const avanceCursando = d.percentaje_avance_cursando

  // colour coding for GPA
  const gpaColor = promPond >= 90 ? '#10b981' : promPond >= 80 ? '#3b82f6' : promPond >= 70 ? '#f59e0b' : '#ef4444'

  const initials = d.persona.split(' ').slice(0, 2).map(w => w[0]).join('')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        .card-anim { animation: slideUp .5s ease both }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">

        {/* ── top nav ── */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                ITC
              </div>
              <span className="font-semibold text-slate-700 text-sm hidden sm:block">Portal Académico</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:block">{d.numero_control}</span>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* ── hero profile card ── */}
          <div className="card-anim bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute top-6 right-16 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* avatar */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 overflow-hidden border-2 border-white/30 shadow-lg bg-white/20">
                {d.foto && !imgError
                  ? <img src={`data:image/jpeg;base64,${d.foto}`} alt="Foto" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">{initials}</div>}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase mb-1">Bienvenido</p>
                <h1 className="text-xl md:text-2xl font-bold leading-tight truncate">{d.persona}</h1>
                <p className="text-blue-200 text-sm mt-0.5">{d.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-white/15 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full">
                    No. control: {d.numero_control}
                  </span>
                  <span className="bg-white/15 backdrop-blur text-xs font-semibold px-3 py-1 rounded-full">
                    Semestre {d.semestre}
                  </span>
                </div>
              </div>

              {/* big GPA badge */}
              <div className="sm:ml-auto flex-shrink-0 bg-white/15 backdrop-blur rounded-2xl px-6 py-4 text-center border border-white/20">
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Promedio pond.</p>
                <p className="text-4xl font-extrabold mt-0.5">{promPond}</p>
                <div className="mt-1.5 h-1.5 bg-white/20 rounded-full w-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${(promPond / 100) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── stat cards grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Créditos acumulados" value={d.creditos_acumulados} icon="🎓" accent="#3b82f6" delay={0} />
            <StatCard label="Materias cursadas" value={d.materias_cursadas} icon="📚" accent="#8b5cf6" delay={80} />
            <StatCard label="Materias aprobadas" value={d.materias_aprobadas} icon="✅" accent="#10b981" delay={160} />
            <StatCard label="Materias reprobadas" value={d.materias_reprobadas} icon="⚠️" accent="#ef4444" delay={240} />
          </div>

          {/* ── two columns: rings + progress ── */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* promedios + créditos comp. */}
            <div className="card-anim bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
                Desempeño académico
              </h2>
              <div className="flex flex-wrap justify-around gap-6">
                <RingChart value={promPond} max={100} color={gpaColor} label="Promedio ponderado" sublabel="/ 100" />
                <RingChart value={promArit} max={100} color="#8b5cf6" label="Promedio aritmético" sublabel="/ 100" />
                <RingChart value={d.creditos_complementarios} max={20} color="#f59e0b" label="Créditos comp." sublabel={`/ 20`} />
              </div>
            </div>

            {/* avance de carrera */}
            <div className="card-anim bg-white rounded-2xl p-6 shadow-sm border border-slate-100" style={{ animationDelay: '100ms' }}>
              <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-indigo-500 inline-block" />
                Avance de carrera
              </h2>

              {/* avance total */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">Avance total</span>
                  <span className="text-xs font-bold text-indigo-600">{avance}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${avance}%` }} />
                </div>
              </div>

              {/* avance cursando */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-600">Avance cursando</span>
                  <span className="text-xs font-bold text-violet-600">{avanceCursando}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${avanceCursando}%` }} />
                </div>
              </div>

              {/* materias pill breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                {[
                  { label: 'Aprobadas', val: d.materias_aprobadas, color: '#10b981', bg: '#ecfdf5' },
                  { label: 'Reprobadas', val: d.materias_reprobadas, color: '#ef4444', bg: '#fef2f2' },
                  { label: 'Rep. no acred.', val: d.num_mat_rep_no_acreditadas, color: '#f59e0b', bg: '#fffbeb' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: bg }}>
                    <p className="text-xl font-bold" style={{ color }}>{val}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── info detalle horizontal ── */}
          <div className="card-anim bg-white rounded-2xl p-6 shadow-sm border border-slate-100" style={{ animationDelay: '180ms' }}>
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block" />
              Información académica detallada
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Número de control', val: d.numero_control, icon: '🪪' },
                { label: 'Semestre actual', val: `${d.semestre}°`, icon: '📅' },
                { label: 'Créditos acumulados', val: d.creditos_acumulados, icon: '🏆' },
                { label: 'Créditos complementarios', val: d.creditos_complementarios, icon: '➕' },
                { label: 'Promedio ponderado', val: promPond, icon: '📊' },
                { label: 'Promedio aritmético', val: promArit, icon: '📈' },
                { label: 'Mat. rep. no acreditadas', val: d.num_mat_rep_no_acreditadas, icon: '🔒' },
                { label: 'Total materias', val: d.materias_cursadas, icon: '📖' },
              ].map(({ label, val, icon }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">{label}</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── correo / contacto strip ── */}
          <div className="card-anim bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg"
            style={{ animationDelay: '260ms' }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">✉️</div>
              <div className="min-w-0">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Correo institucional</p>
                <p className="text-white font-semibold text-sm truncate">{d.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-slate-700 hidden sm:block" />
              <span className="text-xs text-slate-400">TecNM · Campus Celaya</span>
            </div>
          </div>

          {/* ── footer ── */}
          <p className="text-center text-[11px] text-slate-400 pb-4">
            SII ITC · Portal Académico Estudiantil · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}