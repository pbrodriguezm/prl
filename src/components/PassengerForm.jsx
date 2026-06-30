import { useState, useRef, useEffect } from 'react'
import { IconCalendar, IconInfo, IconChevron } from './Icons'

const NATIONALITIES = ['Perú', 'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Ecuador', 'España', 'Estados Unidos', 'México', 'Otro']
const DOC_TYPES = ['Documento de Identidad', 'Pasaporte', 'Carnet de Extranjeria']

function PlusMinusIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {!open && <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />}
    </svg>
  )
}

function SearchSelect({ value, onChange, options, placeholder = 'Seleccionar' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())) : options

  return (
    <div className="pas-select-wrap" ref={wrapRef}>
      <button type="button" className="pas-select-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={value ? '' : 'pas-placeholder'}>{value || placeholder}</span>
        <IconChevron expanded={open} />
      </button>
      {open && (
        <div className="pas-select-drop">
          <input
            className="pas-select-search"
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <div className="pas-select-list">
            {filtered.length === 0
              ? <div className="pas-select-empty">Sin resultados</div>
              : filtered.map(opt => (
                <div
                  key={opt}
                  className={`pas-select-item${opt === value ? ' selected' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                >{opt}</div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

function PassengerSection({ index, open, onToggle, isPrimary }) {
  const [nationality, setNationality] = useState('')
  const [docType, setDocType] = useState('')

  return (
    <div className="pas-section">
      <button type="button" className="pas-section-header" onClick={onToggle} aria-expanded={open}>
        <span>Pasajero {index + 1} - Adulto</span>
        <PlusMinusIcon open={open} />
      </button>
      {open && (
        <div className="pas-section-body">
          <div className="pas-grid">
            <div className="pas-field">
              <label>Nombres <span className="req">*</span></label>
              <input type="text" autoComplete="given-name" />
            </div>
            <div className="pas-field">
              <label>Apellidos <span className="req">*</span></label>
              <input type="text" autoComplete="family-name" />
            </div>
            <div className="pas-field">
              <label>Género <span className="req">*</span></label>
              <div className="pas-radio-row">
                <label className="pas-radio"><input type="radio" name={`genero-${index}`} /> Masculino</label>
                <label className="pas-radio"><input type="radio" name={`genero-${index}`} /> Femenino</label>
              </div>
            </div>
            {isPrimary ? (
              <div className="pas-field pas-field-check">
                <label className="pas-checkbox">
                  <input type="checkbox" />
                  <span>Administrador de Reserva</span>
                  <IconInfo size={14} />
                </label>
              </div>
            ) : <div aria-hidden="true" />}

            <div className="pas-field">
              <label>País - Nacionalidad <span className="req">*</span></label>
              <SearchSelect value={nationality} onChange={setNationality} options={NATIONALITIES} />
            </div>
            <div className="pas-field">
              <label>Tipo Documento <span className="req">*</span></label>
              <SearchSelect value={docType} onChange={setDocType} options={DOC_TYPES} />
            </div>
            <div className="pas-field">
              <label>Número de documento <span className="req">*</span></label>
              <input type="text" />
            </div>
            <div className="pas-field">
              <label>Fecha de Nacimiento <span className="req">*</span></label>
              <div className="pas-field-icon">
                <input type="date" />
                <IconCalendar />
              </div>
            </div>

            <div className="pas-field">
              <label>Telefono <span className="req">*</span></label>
              <div className="pas-phone">
                <span className="pas-phone-flag" aria-hidden="true">🇵🇪</span>
                <input type="tel" placeholder="912 345 678" />
              </div>
            </div>
            <div className="pas-field">
              <label>E-mail <span className="req">*</span></label>
              <input type="email" />
            </div>
            <div className="pas-field">
              <label>Confirmar tu email <span className="req">*</span></label>
              <input type="email" />
            </div>
            {isPrimary ? (
              <div className="pas-field pas-field-check">
                <label className="pas-checkbox">
                  <input type="checkbox" />
                  <span>
                    Deseo recibir ofertas, noticias y comunicaciones personalizadas de PeruRail.{' '}
                    <a href="https://www.perurail.com/es/politica-de-privacidad/" target="_blank" rel="noopener noreferrer">Política de privacidad</a>
                  </span>
                </label>
              </div>
            ) : <div aria-hidden="true" />}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PassengerForm({ searchParams, onBack, onContinue }) {
  const adults = Math.max(1, parseInt(searchParams?.adults, 10) || 1)
  const [openIdx, setOpenIdx] = useState(0)
  const [tribOpen, setTribOpen] = useState(false)
  const [refOpen, setRefOpen] = useState(false)

  const togglePassenger = (i) => setOpenIdx(prev => prev === i ? -1 : i)

  return (
    <div className="results-page pas-page">
      <section className="pas-card" aria-labelledby="pas-title">
        <h1 className="pas-title" id="pas-title">Pasajeros</h1>
        <div className="pas-divider" />

        {Array.from({ length: adults }).map((_, i) => (
          <PassengerSection
            key={i}
            index={i}
            isPrimary={i === 0}
            open={openIdx === i}
            onToggle={() => togglePassenger(i)}
          />
        ))}

        <div className="pas-section">
          <button type="button" className="pas-section-header" onClick={() => setTribOpen(o => !o)} aria-expanded={tribOpen}>
            <span>Información tributaria (Solo empresas de Perú)</span>
            <PlusMinusIcon open={tribOpen} />
          </button>
          {tribOpen && (
            <div className="pas-section-body">
              <div className="pas-grid pas-grid-3">
                <div className="pas-field"><label>RUC</label><input type="text" /></div>
                <div className="pas-field"><label>Razón Social</label><input type="text" /></div>
                <div className="pas-field"><label>Dirección</label><input type="text" /></div>
              </div>
            </div>
          )}
        </div>

        <div className="pas-section pas-section-last">
          <button type="button" className="pas-section-header" onClick={() => setRefOpen(o => !o)} aria-expanded={refOpen}>
            <span>Información de referente (Opcional)</span>
            <PlusMinusIcon open={refOpen} />
          </button>
          {refOpen && (
            <div className="pas-section-body">
              <div className="pas-grid pas-grid-3">
                <div className="pas-field"><label>Código de referente</label><input type="text" /></div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="pas-important" role="note">
        <strong>Importante:</strong>
        <ul>
          <li>Si necesita modificar su boleto de viaje, le recomendamos solicitarlo con al menos 24 horas de anticipación. Para hacerlo, complete el formulario haciendo clic <a href="https://www.perurail.com/es/contacto/" target="_blank" rel="noopener noreferrer">aquí</a>.</li>
          <li>Asignación de asientos aleatoria.</li>
        </ul>
      </div>

      <div className="pas-nav">
        <button type="button" className="pas-btn-back" onClick={onBack}>
          <span aria-hidden="true">‹</span> REGRESAR
        </button>
        <button type="button" className="pas-btn-next" onClick={onContinue}>
          CONTINUAR <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}
