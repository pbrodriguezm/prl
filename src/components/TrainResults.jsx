import { useState, useCallback } from 'react'
import SkeletonResults from './SkeletonResults'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtTab(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]}`
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().split('T')[0]
}

function getDateTabs(center) {
  return [-2, -1, 0, 1, 2].map(offset => ({
    iso:    addDays(center, offset),
    label:  fmtTab(addDays(center, offset)),
    active: offset === 0,
  }))
}

// Colores por tipo de tren
function trainColor(name = '') {
  if (name.includes('Hiram Bingham'))         return '#8B6914'
  if (name.includes('Vistadome Observatory')) return '#2e7d32'
  if (name.includes('Vistadome'))             return '#1a6bce'
  return '#8c7853' // Expedition y otros — tono arena de la marca
}

// Hora legible "05:05:00" → "05:05"
const hhmm = (t = '') => t.slice(0, 5)

// Duración entre dos HH:MM:SS
function duration(dep, arr) {
  const [dh, dm] = dep.split(':').map(Number)
  const [ah, am] = arr.split(':').map(Number)
  let mins = (ah * 60 + am) - (dh * 60 + dm)
  if (mins < 0) mins += 1440
  return `${Math.floor(mins / 60)} hr. ${mins % 60} min`
}

function fmtUSD(n) {
  return `USD ${Number(n).toFixed(2)}`
}

// Comodidades — la API no las expone, se usa el mismo contenido de perurail.com por categoría
const EXPEDITION_AMENITIES = [
  { text: 'Asientos amplios y cómodos' },
  { text: 'Música ambiental' },
  { text: 'Venta de alimentos y bebidas' },
  { text: 'Equipaje de mano: 8 kg / 115 cm lineales' },
  { text: 'Sala de espera en Ollantaytambo', note: 1 },
  { text: 'Almacenamiento adicional', note: 2 },
  { text: 'Beneficios en hoteles, restaurantes y más' },
]

const PREMIUM_AMENITIES = [
  { text: 'Coche observatorio con balcón abierto' },
  { text: 'Ventanas panorámicas' },
  { text: 'Coche bar con bebidas y show' },
  { text: 'Asientos amplios con mesas' },
  { text: 'Snacks y bebida de cortesía' },
  { text: 'Danza y música típica en vivo' },
  { text: 'Desfile de prendas de baby alpaca' },
  { text: 'Audio turístico y música ambiental' },
  { text: 'Equipaje de mano: 8 kg / 115 cm lineales' },
  { text: 'Sala de espera en Ollantaytambo', note: 1 },
  { text: 'Almacenamiento adicional', note: 2 },
  { text: 'Beneficios en hoteles, restaurantes y más' },
]

const AMENITY_FOOTNOTES = [
  'Disponible en estación Ollantaytambo (Av. Ferrocarril s/n).',
  'Disponible en estación Ollantaytambo (Av. Ferrocarril s/n) de 04:15 a 21:00 hrs y estación Machu Picchu (Av. Machu Picchu Pueblo s/n, Barrio Las Orquídeas) de 05:00 a 22:00 hrs.',
]

function trainAmenities(name = '') {
  return name.includes('Expedition') ? EXPEDITION_AMENITIES : PREMIUM_AMENITIES
}

// Ícono por comodidad — coincide por palabra clave del texto
function AmenityIcon({ text }) {
  const p = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: '#1a2744', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (/balcón|observatorio/i.test(text))
    return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
  if (/panorámicas/i.test(text))
    return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 14l4-4 4 4 3-3 5 4"/></svg>
  if (/bar|bebidas/i.test(text))
    return <svg {...p}><path d="M5 3h14l-2 9a5 5 0 0 1-10 0L5 3z"/><path d="M12 14v7M8 21h8"/></svg>
  if (/mesas|asientos/i.test(text))
    return <svg {...p}><path d="M4 19V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11M4 14h16M8 19v2M16 19v2"/></svg>
  if (/snack/i.test(text))
    return <svg {...p}><path d="M4 10h16l-1.5 9a2 2 0 0 1-2 1.7H7.5A2 2 0 0 1 5.5 19L4 10z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
  if (/danza/i.test(text))
    return <svg {...p}><circle cx="9" cy="18" r="2"/><circle cx="17" cy="16" r="2"/><path d="M11 18V4l8-2v14"/></svg>
  if (/alpaca|prendas/i.test(text))
    return <svg {...p}><path d="M6 7l3-3h6l3 3M6 7l-2 4 3 1v9h10v-9l3-1-2-4"/></svg>
  if (/audio|música/i.test(text))
    return <svg {...p}><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>
  if (/equipaje/i.test(text))
    return <svg {...p}><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/></svg>
  if (/sala de espera/i.test(text))
    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>
  if (/almacenamiento/i.test(text))
    return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
  if (/beneficios|hoteles/i.test(text))
    return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9 15l6-6"/></svg>
  return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>
}

// Imágenes de muestra (no provistas por la API) para el carrusel del detalle
function dummyImages(svc) {
  const seed = svc.serviceId ?? svc.trainName
  return [0, 1, 2, 3].map(i => `https://picsum.photos/seed/prl-${seed}-${i}/640/360`)
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function TrainResults({ searchParams, rawData, loading, error, onBack, onSelectTrain }) {
  const originLabel = searchParams?.originLabel ?? ''
  const destinLabel = searchParams?.destinLabel ?? ''
  const adults      = searchParams?.adults ?? 1
  const isRound     = searchParams?.isRound ?? false
  const dateIda     = searchParams?.dateIda ?? ''
  const dateRet     = searchParams?.dateRet ?? ''

  // Tramo activo: primero se elige la ida y, si es ida y retorno, luego la vuelta
  const [leg, setLeg]                     = useState('ida') // 'ida' | 'vuelta'
  const [selectedIda, setSelectedIda]     = useState(null)  // ida ya confirmada (botón amarillo)
  const [pendingChoice, setPendingChoice] = useState(null)  // opción clicada en el tramo activo, aún sin confirmar
  const [activeDate, setActiveDate]       = useState(dateIda)
  const [dateTabs, setDateTabs]           = useState(() => getDateTabs(dateIda || new Date().toISOString().split('T')[0]))
  const [carouselIndex, setCarouselIndex] = useState(0) // foto activa del detalle expandido

  const changeDate = useCallback((iso) => {
    setActiveDate(iso)
    setDateTabs(getDateTabs(iso))
  }, [])

  const goToLeg = useCallback((nextLeg) => {
    const center = nextLeg === 'vuelta' ? (dateRet || dateIda) : dateIda
    setLeg(nextLeg)
    setActiveDate(center)
    setDateTabs(getDateTabs(center))
    setPendingChoice(nextLeg === 'ida' ? selectedIda : null)
    setCarouselIndex(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dateIda, dateRet, selectedIda])

  // Clic en una tarjeta de precio: solo la marca como elegida y muestra el detalle.
  // La confirmación real ocurre al presionar el botón amarillo de la barra inferior.
  const handlePickOption = (svc) => {
    setPendingChoice({ service: svc, date: activeDate })
    setCarouselIndex(0)
  }

  const handleConfirmLeg = () => {
    if (!pendingChoice) return
    if (leg === 'ida' && isRound) {
      setSelectedIda(pendingChoice)
      setPendingChoice(null)
      goToLeg('vuelta')
    } else if (leg === 'ida') {
      onSelectTrain?.({ ida: pendingChoice })
    } else {
      onSelectTrain?.({ ida: selectedIda, vuelta: pendingChoice })
    }
  }

  // ── Normalizar respuesta real de la API ──────────────────────────────────
  // data.railServices es el array; region "1" = ida, "2" = retorno
  const allServices = rawData?.data?.railServices ?? rawData?.railServices ?? []
  const services    = allServices.filter(s => String(s.region) === (leg === 'ida' ? '1' : '2'))

  const fromLabel = leg === 'ida' ? originLabel : destinLabel
  const toLabel   = leg === 'ida' ? destinLabel : originLabel

  // Resumen de ida: mientras se está eligiendo es la opción clicada; ya en el tramo
  // de retorno, es la que quedó confirmada con el botón amarillo.
  const idaSummary  = leg === 'ida' ? pendingChoice : selectedIda
  const idaPrice    = idaSummary?.service?.adult?.price ?? 0
  const vueltaPrice = leg === 'vuelta' ? (pendingChoice?.service?.adult?.price ?? 0) : 0
  const stickyTotal = (idaPrice + vueltaPrice) * adults

  // Mientras se elige la ida, el CTA avanza al tramo de retorno (botón ancho).
  // Una vez en retorno (o si el viaje es solo ida), el CTA finaliza la selección (píldora).
  const showAdvanceCta = leg === 'ida' && isRound
  const showFinalCta   = pendingChoice && (leg === 'vuelta' || (leg === 'ida' && !isRound))

  return (
    <div className="results-page" style={idaSummary ? { paddingBottom: 88 } : undefined}>

      {/* ── BARRA RESUMEN ── */}
      <div className="res-summary-bar">
        <div className="res-summary-left">
          <span className="res-route">{originLabel} &lt;-&gt; {destinLabel}</span>
          <span className="res-dates">
            {fmtTab(dateIda)}{isRound && dateRet ? ` - ${fmtTab(dateRet)}` : ''}
          </span>
        </div>
        <div className="res-summary-right">
          <span className="res-pax">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {adults}
          </span>
          <button className="res-edit-btn" onClick={onBack} aria-label="Editar búsqueda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className="res-sub-bar">
        <div>
          <div className="res-sub-label">{leg === 'ida' ? 'Seleccionar Ida' : 'Seleccionar Retorno'}</div>
          <div className="res-sub-route">{fromLabel} &gt; {toLabel}</div>
        </div>
        <div className="res-filters">
          <button className="res-filter-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
            Ordenar por
          </button>
          {['Tipo de tren', 'Tipo de viaje', 'Hora de salida', 'Precios'].map(f => (
            <button key={f} className="res-filter-btn">
              {f}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          ))}
        </div>
      </div>

      {/* ── TABS FECHAS ── */}
      <div className="res-date-tabs" role="tablist" aria-label="Seleccionar fecha">
        <button className="res-date-nav" onClick={() => changeDate(addDays(activeDate, -1))} aria-label="Fecha anterior">‹</button>
        {dateTabs.map(tab => (
          <button
            key={tab.iso}
            className={`res-date-tab${tab.active ? ' active' : ''}`}
            role="tab"
            aria-selected={tab.active}
            onClick={() => changeDate(tab.iso)}
          >
            {tab.label}
          </button>
        ))}
        <button className="res-date-nav" onClick={() => changeDate(addDays(activeDate, 1))} aria-label="Fecha siguiente">›</button>
      </div>

      {/* ── SKELETON ── */}
      {loading && <SkeletonResults rows={8} />}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className="res-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>No se pudo cargar la disponibilidad. Por favor intente nuevamente.</span>
          <button className="res-retry-btn" onClick={onBack}>← Volver</button>
        </div>
      )}

      {/* ── SIN RESULTADOS ── */}
      {!loading && !error && services.length === 0 && (
        <div className="res-empty" role="status">
          No hay servicios disponibles para esta fecha.
        </div>
      )}

      {/* ── TABLA DE TRENES ── */}
      {!loading && !error && services.length > 0 && (
        <div className="res-table" role="table" aria-label="Servicios de tren disponibles">
          {services.map((svc, i) => {
            const color    = trainColor(svc.trainName)
            const price    = svc.adult?.price
            const oldPrc   = svc.adult?.regularPrice
            const hasDisc  = oldPrc && oldPrc > price
            const isPicked = pendingChoice?.service?.serviceId === svc.serviceId

            return (
              <div className="res-row-wrap" key={svc.serviceId ?? i}>
                <div className={`res-row${isPicked ? ' picked' : ''}`} role="row">

                  {/* SALIDA */}
                  <div className="res-col-dep" role="cell">
                    <div className="res-time">{hhmm(svc.departureTime)}</div>
                    <div className="res-station-lbl">
                      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>
                      Estación
                    </div>
                    <div className="res-station">{fromLabel}</div>
                  </div>

                  {/* DURACIÓN */}
                  <div className="res-col-dur" role="cell">
                    <div className="res-dur-label">{duration(svc.departureTime, svc.arrivalTime)}</div>
                    <div className="res-dur-line"><span /></div>
                    <div className="res-transport-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><rect x="11" y="10" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="6.2" width="2" height="2.2" rx="1" fill="#fff"/></svg>
                      Tren
                    </div>
                  </div>

                  {/* LLEGADA */}
                  <div className="res-col-arr" role="cell">
                    <div className="res-time">{hhmm(svc.arrivalTime)}</div>
                    <div className="res-station-lbl">
                      <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7-7.2-7-12a7 7 0 0 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>
                      Estación
                    </div>
                    <div className="res-station">{toLabel}</div>
                  </div>

                  {/* TARJETA PRECIO */}
                  <div className="res-col-options" role="cell">
                    <button
                      className={`res-option-card${isPicked ? ' selected' : ''}`}
                      style={{ borderTopColor: color }}
                      onClick={() => handlePickOption(svc)}
                      aria-pressed={isPicked}
                      aria-label={`Seleccionar ${svc.trainName} de ${leg} por ${fmtUSD(price)}`}
                    >
                      <div className="res-opt-name">{svc.trainName}</div>
                      <div className="res-opt-price"><span className="res-opt-usd">USD</span>{Number(price).toFixed(2)}</div>
                      {hasDisc && (
                        <div className="res-opt-old">USD {Number(oldPrc).toFixed(2)}</div>
                      )}
                    </button>
                    <div className="res-col-options-spacer" aria-hidden="true" />
                  </div>

                </div>

                {/* ── DETALLE EXPANDIDO ── */}
                {isPicked && (() => {
                  const images = dummyImages(svc)
                  const prevImg = () => setCarouselIndex(idx => (idx - 1 + images.length) % images.length)
                  const nextImg = () => setCarouselIndex(idx => (idx + 1) % images.length)
                  return (
                    <>
                      <div className="res-detail-pointer" style={{ '--pointer-color': `${color}40` }} />
                      <div className="res-detail" style={{ background: `${color}1f` }}>
                        <div className="res-detail-carousel">
                          <img src={images[carouselIndex]} alt={`${svc.trainName} – interior`} className="res-detail-photo" />
                          <button type="button" className="res-carousel-nav prev" onClick={prevImg} aria-label="Imagen anterior">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>
                          <button type="button" className="res-carousel-nav next" onClick={nextImg} aria-label="Imagen siguiente">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </div>
                        <div className="res-detail-amenities">
                          {trainAmenities(svc.trainName).map(({ text, note }) => (
                            <div className="res-amenity" key={text}>
                              <AmenityIcon text={text} />
                              <span>{text}{note && <sup>({note})</sup>}</span>
                            </div>
                          ))}
                          <div className="res-detail-footnotes">
                            {AMENITY_FOOTNOTES.map((f, idx) => (
                              <p key={idx}>({idx + 1}) {f}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}

      {/* ── BARRA DE CONFIRMACIÓN (fija al pie) ── */}
      {idaSummary && (
        <div className="res-sticky-bar">
          <div
            className={`res-sticky-seg res-sticky-ida${leg === 'vuelta' ? ' clickable' : ''}`}
            onClick={leg === 'vuelta' ? () => goToLeg('ida') : undefined}
          >
            <span className="res-sticky-leg-label">IDA</span>
            <span className="res-sticky-train">{idaSummary.service.trainName}</span>
            <span className="res-sticky-time">Horario: {hhmm(idaSummary.service.departureTime)} - {hhmm(idaSummary.service.arrivalTime)}</span>
          </div>

          {/* Tramo ida → retorno: botón ancho con flecha hacia abajo */}
          {showAdvanceCta && (
            <button type="button" className="res-sticky-cta-wide" onClick={handleConfirmLeg}>
              <span className="res-sticky-cta-wide-text">
                <span>Seleccionar Tren</span>
                <span>de retorno</span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          )}

          {isRound && leg === 'vuelta' && (
            <div className="res-sticky-seg res-sticky-retorno">
              <span className="res-sticky-retorno-label">Retorno</span>
              {pendingChoice ? (
                <>
                  <span className="res-sticky-train res-sticky-italic">{pendingChoice.service.trainName}</span>
                  <span className="res-sticky-time res-sticky-italic">{hhmm(pendingChoice.service.departureTime)} - {hhmm(pendingChoice.service.arrivalTime)}</span>
                </>
              ) : (
                <>
                  <span className="res-sticky-placeholder">Seleccionar Retorno</span>
                  <span className="res-sticky-placeholder-sub">para continuar</span>
                </>
              )}
            </div>
          )}
          <div className="res-sticky-total">
            <span className="res-sticky-total-lbl">TOTAL</span>
            <span className="res-sticky-total-val">{fmtUSD(stickyTotal)}</span>
          </div>

          {/* Finalizar: píldora pequeña con flecha hacia la derecha */}
          {showFinalCta && (
            <button type="button" className="res-sticky-cta" onClick={handleConfirmLeg}>
              Continuar
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
          )}
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="res-footer">
        <span>© TODOS LOS DERECHOS RESERVADOS</span>
        <span>PeruRail S.A. - Av. Armendariz Nro. 480 Int. 601, Miraflores, Lima, Perú</span>
        <div className="res-footer-links">
          <a href="https://www.perurail.com/terminos">Términos y condiciones</a>
          <a href="https://www.perurail.com/privacidad">Política de privacidad</a>
        </div>
      </footer>
    </div>
  )
}
