// Skeleton — animación CSS pura, sin librería
export default function SkeletonResults({ rows = 6 }) {
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-label="Cargando trenes…">
      {/* Header skeleton */}
      <div className="sk-header">
        <div className="sk-box" style={{ width: 220, height: 18 }} />
        <div className="sk-box" style={{ width: 120, height: 18 }} />
      </div>

      {/* Filtros skeleton */}
      <div className="sk-filters">
        {[140, 120, 130, 110].map((w, i) => (
          <div key={i} className="sk-box sk-pill" style={{ width: w }} />
        ))}
      </div>

      {/* Tabs de fechas skeleton */}
      <div className="sk-tabs">
        {[80, 90, 95, 88, 92].map((w, i) => (
          <div key={i} className={`sk-box sk-tab${i === 2 ? ' sk-tab-active' : ''}`} style={{ width: w }} />
        ))}
      </div>

      {/* Filas de trenes skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk-row">
          {/* Horario */}
          <div className="sk-col-time">
            <div className="sk-box" style={{ width: 50, height: 20, marginBottom: 6 }} />
            <div className="sk-box" style={{ width: 70, height: 13, marginBottom: 4 }} />
            <div className="sk-box" style={{ width: 55, height: 13 }} />
          </div>
          {/* Duración */}
          <div className="sk-col-dur">
            <div className="sk-box" style={{ width: 60, height: 12 }} />
            <div className="sk-line" />
            <div className="sk-box" style={{ width: 70, height: 12, marginTop: 6 }} />
          </div>
          {/* Llegada */}
          <div className="sk-col-time">
            <div className="sk-box" style={{ width: 50, height: 20, marginBottom: 6 }} />
            <div className="sk-box" style={{ width: 70, height: 13, marginBottom: 4 }} />
            <div className="sk-box" style={{ width: 55, height: 13 }} />
          </div>
          {/* Opciones precio */}
          <div className="sk-col-price">
            <div className="sk-box sk-price-card" style={{ width: '100%', height: 64 }} />
          </div>
          <div className="sk-col-price">
            <div className="sk-box sk-price-card" style={{ width: '100%', height: 64 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
