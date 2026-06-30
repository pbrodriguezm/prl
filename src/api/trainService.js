// ===== CONFIGURACIÓN =====
const GW = 'https://gtw.perurail.com'

// Credenciales sandbox (reemplazar por las reales en producción)
const CREDS = {
  userKey: 'REFMT1NJTExBNTAwMw==',
  passKey: 'R2VyYXJkbzAyMDEq',
}

// Mapa origen label → outBoundFromRegion / To
// Ajusta estos IDs según tu API real
const REGION_MAP = {
  cusco:      1,
  san_pedro:  1,
  poroy:      1,
  ollanta:    3,
  urubamba:   4,
  machupicchu: 2,
  puno:       5,
}

let _tokenCache = null
let _tokenExp   = 0

async function getToken() {
  if (_tokenCache && Date.now() < _tokenExp - 30_000) return _tokenCache

  const res = await fetch(`${GW}/security/sandbox/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDS),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const { token } = await res.json()

  // Decodifica exp del JWT (payload base64)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    _tokenExp = payload.exp * 1000
  } catch {
    _tokenExp = Date.now() + 50 * 60 * 1000 // fallback 50 min
  }
  _tokenCache = token
  return token
}

/**
 * Busca servicios de tren
 * @param {object} params
 * @param {string} params.originValue   - value del origen (ej: "cusco")
 * @param {string} params.destinValue   - value del destino (ej: "machupicchu")
 * @param {string} params.dateIda       - YYYY-MM-DD
 * @param {string} params.dateRet       - YYYY-MM-DD (puede ser igual a dateIda si solo ida)
 * @param {number} params.adults        - cantidad adultos
 * @param {boolean} params.isRound
 * @param {string} params.coupon
 */
export async function searchTrains(params) {
  const token = await getToken()

  const body = {
    outBoundFromRegion: REGION_MAP[params.originValue] ?? 1,
    outBoundToRegion:   REGION_MAP[params.destinValue] ?? 2,
    totalAdults:        params.adults,
    totalChildren:      0,
    totalGuides:        0,
    outBoundTravelDate: params.dateIda,
    returnTravelDate:   params.isRound ? params.dateRet : params.dateIda,
    currencyIso:        'USD',
    bookingType:        params.isRound ? 4 : 1,
    cupon:              params.coupon || '',
  }

  const res = await fetch(`${GW}/api/railservice/sandbox/all-rail-services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}
