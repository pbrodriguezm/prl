import { useState, useRef, useEffect } from 'react'
import { FLAGS, LANG_LABELS, TRANSLATIONS } from '../data/translations'
import { IconChevron } from './Icons'

export default function LangSelector({ currentLang, onChangeLang, label }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (code) => {
    onChangeLang(code)
    setOpen(false)
    try { localStorage.setItem('pr_lang', code) } catch {}
  }

  return (
    <div className="lang-wrapper" ref={wrapRef}>
      <button
        className="lang-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(o => !o)}
      >
        <span className="lang-flag-wrap">{FLAGS[currentLang]}</span>
        <IconChevron expanded={open} />
      </button>

      {open && (
        <div className="lang-dropdown open" role="listbox" aria-label={label}>
          {Object.keys(TRANSLATIONS).map(code => (
            <button
              key={code}
              className={`lang-option${code === currentLang ? ' active' : ''}`}
              role="option"
              aria-selected={code === currentLang}
              onClick={() => select(code)}
            >
              <span className="lang-flag-wrap">{FLAGS[code]}</span>
              <span className="lang-name">{LANG_LABELS[code]}</span>
              <span className="lang-check" aria-hidden="true">✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
