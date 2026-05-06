const CACHE_KEY = 'ccd_gas_price_v1'
const CACHE_TTL = 24 * 60 * 60 * 1000

// Illinois regular gas price series from EIA (free, no key needed with DEMO_KEY)
const EIA_URL =
  'https://api.eia.gov/v2/petroleum/pri/gnd/data/' +
  '?api_key=DEMO_KEY' +
  '&frequency=weekly' +
  '&data[0]=value' +
  '&facets[series][]=EMM_EPM0_PTE_Y48IL_DPG' +
  '&length=1' +
  '&sort[0][column]=period' +
  '&sort[0][direction]=desc'

export async function fetchChicagoGasPrice() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.price
  } catch {}

  try {
    const res = await fetch(EIA_URL)
    if (!res.ok) throw new Error('EIA error')
    const data = await res.json()
    const price = parseFloat(data.response?.data?.[0]?.value)
    if (price && !isNaN(price)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ price, ts: Date.now() }))
      return price
    }
  } catch {}

  return 3.45 // Chicago fallback
}
