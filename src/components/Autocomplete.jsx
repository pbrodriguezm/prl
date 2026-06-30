import { useState, useRef, useEffect, useCallback } from 'react'
import { IconTrain } from './Icons'

export default function Autocomplete({ id, labelId, options, value, onChange, placeholder = '' }) {
  const [query, setQuery]         = useState(value?.label ?? '')
  const [open, setOpen]           = useState(false)
  const [highlighted, setHl]      = useState(-1)
  const inputRef                  = useRef(null)
  const dropRef                   = useRef(null)

  // Sync cuando cambia el value desde fuera (cambio de idioma)
  useEffect(() => {
    setQuery(value?.label ?? '')
  }, [value])

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const select = useCallback((opt) => {
    if (!opt) return
    setQuery(opt.label)
    setOpen(false)
    setHl(-1)
    onChange(opt)
  }, [onChange])

  const clear = () => {
    setQuery('')
    setOpen(false)
    onChange(null)
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHl(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setHl(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(filtered[highlighted]) }
    else if (e.key === 'Escape') { setOpen(false); setHl(-1) }
  }

  // Cierra si se hace click fuera
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.closest('.field')?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="ac-wrap" id={id} ref={dropRef}>
      <input
        ref={inputRef}
        className="ac-input"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-drop`}
        aria-labelledby={labelId}
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHl(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
      />
      {query && (
        <button className="ac-clear visible" type="button" aria-label="Limpiar" onClick={clear}>×</button>
      )}
      {open && (
        <div className="ac-dropdown open" id={`${id}-drop`} role="listbox">
          {filtered.length === 0
            ? <div className="ac-no-results">Sin resultados</div>
            : filtered.map((opt, i) => (
              <div
                key={opt.value}
                className={`ac-item${i === highlighted ? ' highlighted' : ''}`}
                role="option"
                aria-selected={i === highlighted}
                onMouseDown={e => { e.preventDefault(); select(opt) }}
                onMouseEnter={() => setHl(i)}
              >
                <IconTrain />
                <span>{opt.label}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
