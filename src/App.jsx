import { useState, useEffect, useCallback } from 'react'
import { TRANSLATIONS } from './data/translations'
import LangSelector from './components/LangSelector'
import Autocomplete from './components/Autocomplete'
import PaymentLogos from './components/PaymentLogos'
import TrainResults from './components/TrainResults'
import PassengerForm from './components/PassengerForm'
import { IconCalendar, IconUser, IconTag, IconInfo, IconTrain } from './components/Icons'
import { searchTrains } from './api/trainService'

const pushDL = (event, data = {}) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
}

const today = new Date().toISOString().split('T')[0]
const SESSION_ID = '#' + Math.floor(10000000 + Math.random() * 89999999)

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('pr_lang') || 'es' } catch { return 'es' }
  })
  const i18n = TRANSLATIONS[lang] || TRANSLATIONS.es

  // Paso actual: 1 = búsqueda, 2 = resultados
  const [step, setStep]       = useState(1)

  // Paso 1 estado
  const [isRound, setIsRound] = useState(true)
  const [origin, setOrigin]   = useState(null)
  const [destin, setDestin]   = useState(null)
  const [dateIda, setDateIda] = useState(today)
  const [dateRet, setDateRet] = useState(today)
  const [passengers, setPass] = useState('2')
  const [coupon, setCoupon]   = useState('')
  const [showCoupon, setShowCoupon] = useState(false)

  // Paso 2 estado
  const [loading, setLoading]       = useState(false)
  const [trainData, setTrainData]   = useState(null)
  const [trainError, setTrainError] = useState(null)
  const [searchParams, setSearchParams] = useState(null)

  // Paso 3 estado
  const [selectedTrains, setSelectedTrains] = useState(null)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = i18n.pageTitle
    const md = document.querySelector('meta[name="description"]')
    if (md) md.content = i18n.metaDesc
    setOrigin(prev => {
      if (!prev) return i18n.origins[0]
      return i18n.origins.find(o => o.value === prev.value) || i18n.origins[0]
    })
    setDestin(prev => {
      if (!prev) return i18n.destinations[0]
      return i18n.destinations.find(o => o.value === prev.value) || i18n.destinations[0]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const handleChangeLang = useCallback((code) => {
    setLang(code)
    pushDL('lang_change', { language: code })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const params = {
      originValue: origin?.value || 'cusco',
      originLabel: origin?.label || '',
      destinValue: destin?.value || 'machupicchu',
      destinLabel: destin?.label || '',
      dateIda,
      dateRet: isRound ? dateRet : dateIda,
      adults: parseInt(passengers, 10),
      isRound,
      coupon: coupon.toUpperCase(),
    }

    pushDL('search_submitted', params)
    setSearchParams(params)
    setStep(2)
    setLoading(true)
    setTrainData(null)
    setTrainError(null)

    // Scroll al top suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const data = await searchTrains(params)
      setTrainData(data)
      pushDL('search_results', { count: (data?.outBoundServices ?? data?.services ?? data ?? []).length })
    } catch (err) {
      console.error(err)
      setTrainError(err.message)
      pushDL('search_error', { message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setTrainData(null)
    setTrainError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectTrain = (selection) => {
    pushDL('train_selected', {
      idaService: selection.ida.service.serviceId,
      idaPrice: selection.ida.service.adult?.price,
      vueltaService: selection.vuelta?.service.serviceId,
      vueltaPrice: selection.vuelta?.service.adult?.price,
    })

    setSelectedTrains(selection)
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToResults = () => {
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinueToPayment = () => {
    pushDL('passenger_data_submitted', {})
    alert('Paso 4 próximamente')
  }

  const stepLabels = [i18n.step1, i18n.step2, i18n.step3, i18n.step4]
  const activeStep = step - 1 // 0-indexed

  return (
    <>
      {/* HEADER */}
      <header>
        <a href="https://www.perurail.com" className="logo-wrap" aria-label="PeruRail – inicio">
          <img
            src="https://book.perurail.com/Images/logo-white.png"
            alt="PeruRail"
            width="120"
            height="30"
            loading="eager"
          />
        </a>
        <div className="header-right">
          <span className="session-id">
            <span>{i18n.session}</span>: {SESSION_ID}
          </span>
          <LangSelector currentLang={lang} onChangeLang={handleChangeLang} label={i18n.changeLang} />
        </div>
      </header>

      {/* STEPPER */}
      <nav className="stepper" aria-label="Pasos de reserva">
        <ol className="steps" role="list">
          {stepLabels.map((label, i) => (
            <li key={i} className={`step${i === activeStep ? ' active' : ''}${i < activeStep ? ' done' : ''}`}>
              <div className="step-circle" aria-current={i === activeStep ? 'step' : undefined}>
                {i + 1}
              </div>
              <span className="step-label">{label}</span>
            </li>
          ))}
        </ol>
      </nav>

      {/* PASO 1: BÚSQUEDA */}
      {step === 1 && (
        <main id="main-content">
          <div className="info-banner" role="note">
            Para más información sobre nuestros{' '}
            <a href="https://www.perurail.com/servicios">{i18n.infoServicios}</a>,{' '}
            <a href="https://www.perurail.com/guias">{i18n.infoGuias}</a> para llegar a nuestros destinos
            y <a href="https://www.perurail.com/entradas">{i18n.infoEntradas}</a> a Machu Picchu,
            dirígete a <a href="https://www.perurail.com"><strong>perurail.com</strong></a>.
          </div>

          <section className="booking-card" aria-labelledby="card-title">
            <h1 className="card-title" id="card-title">{i18n.cardTitle}</h1>

            <div className="trip-type" role="group" aria-label="Tipo de viaje">
              <button className={`trip-btn${isRound ? ' active' : ''}`} type="button" aria-pressed={isRound} onClick={() => setIsRound(true)}>
                {i18n.tripRound}
              </button>
              <button className={`trip-btn${!isRound ? ' active' : ''}`} type="button" aria-pressed={!isRound} onClick={() => setIsRound(false)}>
                {i18n.tripOne}
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="fields-row">
                <div className="field">
                  <span className="field-lbl" id="lbl-origin">{i18n.originLabel}</span>
                  <div className="field-inner">
                    <IconTrain />
                    <Autocomplete id="ac-origin" labelId="lbl-origin" options={i18n.origins} value={origin} onChange={setOrigin} />
                  </div>
                </div>
                <div className="field">
                  <span className="field-lbl" id="lbl-destin">{i18n.destinLabel}</span>
                  <div className="field-inner">
                    <IconTrain />
                    <Autocomplete id="ac-destin" labelId="lbl-destin" options={i18n.destinations} value={destin} onChange={setDestin} />
                  </div>
                </div>
              </div>

              <div className="fields-row-3">
                <div className="field">
                  <label htmlFor="fecha-ida">{i18n.dateIda}</label>
                  <div className="field-inner">
                    <IconCalendar />
                    <input type="date" id="fecha-ida" name="fecha-ida" min={today} value={dateIda} onChange={e => setDateIda(e.target.value)} />
                  </div>
                </div>

                <div className="field" style={{ visibility: isRound ? 'visible' : 'hidden' }}>
                  <label htmlFor="fecha-retorno">{i18n.dateRetorno}</label>
                  <div className="field-inner">
                    <IconCalendar />
                    <input type="date" id="fecha-retorno" name="fecha-retorno" min={dateIda || today} value={dateRet} onChange={e => setDateRet(e.target.value)} tabIndex={isRound ? 0 : -1} />
                  </div>
                </div>

                <div>
                  <div className="field">
                    <label htmlFor="pasajeros">{i18n.passLabel}</label>
                    <div className="field-inner">
                      <IconUser />
                      <div className="pass-select-wrap">
                        <select id="pasajeros" name="pasajeros" value={passengers} onChange={e => setPass(e.target.value)}>
                          {i18n.pass.map((lbl, i) => (
                            <option key={i} value={String(i + 1)}>{lbl}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://www.perurail.com/es/viajes-en-grupos-o-privados/"
                    className="group-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{i18n.group}</a>
                </div>

                <div className="coupon-area">
                  {showCoupon ? (
                    <div className="coupon-input-wrap">
                      <input
                        className="coupon-input"
                        type="text"
                        placeholder={i18n.coupon}
                        value={coupon}
                        onChange={e => setCoupon(e.target.value.toUpperCase())}
                        maxLength={20}
                        autoFocus
                      />
                      <span className="coupon-note">{i18n.couponNote}</span>
                    </div>
                  ) : (
                    <>
                      <button type="button" className="coupon-btn" onClick={() => setShowCoupon(true)}>
                        <IconTag />
                        <span>{i18n.coupon}</span>
                      </button>
                      <span className="coupon-note">{i18n.couponNote}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="search-wrap">
                <button type="submit" className="search-btn">{i18n.btnSearch}</button>
              </div>
            </form>

            <div className="notice" role="status" aria-live="polite">
              <IconInfo />
              <span>{i18n.searchNote}</span>
            </div>
          </section>

          <div className="map-section">
            <img
              src="https://book.perurail.com/Images/desktop-mapa-rutas-es.webp"
              alt="Mapa de rutas PeruRail"
              width="960"
              height="560"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="reminder-notice" role="note">
            <IconInfo size={16} />
            <span>{i18n.reminderNote}</span>
          </div>

          <PaymentLogos />
        </main>
      )}

      {/* PASO 2: RESULTADOS */}
      {step === 2 && (
        <main id="main-content">
          <div className="body-background" >
          <TrainResults
            searchParams={searchParams}
            rawData={trainData}
            loading={loading}
            error={trainError}
            onBack={handleBack}
            onSelectTrain={handleSelectTrain}
          />
          </div>
        </main>
      )}

      {/* PASO 3: DATOS DE PASAJEROS */}
      {step === 3 && (
        <main id="main-content">
          <div className="body-background">
            <PassengerForm
              searchParams={searchParams}
              selection={selectedTrains}
              onBack={handleBackToResults}
              onContinue={handleContinueToPayment}
            />
          </div>
        </main>
      )}
    </>
  )
}
