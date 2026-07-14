// Fetches and parses HARTI's real Weekly Food Commodities Bulletin
// (https://www.harti.gov.lk/weekly-price.php) at request time - no
// hardcoded/transcribed week data here, unlike hartiMarketData.ts (the
// monthly bulletin, which is manually transcribed since it changes rarely).
//
// The weekly bulletin PDF's "Table 14: Colombo: Wholesale Prices" section is
// the only place with a clean this-week/last-week/last-year average for
// Passion Fruit, so that is the only figure this parses. HARTI does not
// publish weekly Moringa pricing at all.
//
// Parsing is defensive: if the page layout or PDF table format changes and
// the numbers can't be confidently extracted, this throws rather than
// returning a guessed/partial value - callers must fall back to the last
// known-good snapshot saved in Supabase instead of presenting a bad parse as
// real data.

// Imports pdf-parse's internal implementation directly (not the package
// root) because the package's index.js runs a debug-mode branch when
// `module.parent` is falsy - true under Next.js/Turbopack's bundler, where it
// throws trying to read the library's own bundled test fixture. No bundled
// types either; the default export takes a Buffer and resolves to
// { text: string, numpages: number, ... }.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (data: Buffer) => Promise<{ text: string }>

const WEEKLY_INDEX_URL = 'https://www.harti.gov.lk/weekly-price.php'
const HARTI_ORIGIN = 'https://www.harti.gov.lk/'

export interface HartiWeeklyBulletin {
  weekStart: string // YYYY-MM-DD
  weekEnd: string // YYYY-MM-DD
  bulletinVolume: number | null
  bulletinIssue: number | null
  pdfUrl: string
  passionFruitWholesale: {
    rangeLowRs: number
    rangeHighRs: number
    avgThisWeekRs: number
    avgLastWeekRs: number
    avgSameWeekLastYearRs: number
  }
}

async function findLatestEnglishPdfUrl(): Promise<string> {
  const res = await fetch(WEEKLY_INDEX_URL)
  if (!res.ok) throw new Error(`HARTI weekly index request failed: HTTP ${res.status}`)
  const html = await res.text()

  // The first <a href="assets/pdf/food_price/weekly/eng/...pdf"> in the
  // current-year section is the latest published week (rows are newest-first).
  const match = /href="(assets\/pdf\/food_price\/weekly\/eng\/\d{4}\/[^"]+\.pdf)"/.exec(html)
  if (!match) throw new Error('Could not find a weekly English bulletin PDF link on the HARTI index page.')

  return HARTI_ORIGIN + match[1]
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

function parseBulletinHeader(text: string) {
  const head = text.slice(0, 400)

  const volMatch = /Vol:?\s*(\d+)/i.exec(head)
  const issueMatch = /No\.?\s*(\d+)/i.exec(head)

  // pdf-parse inserts a newline between a day number and its superscript
  // ordinal suffix (e.g. "12\nth"), since they sit at slightly different
  // Y-coordinates in the PDF - so every gap here is \s* /\s+, never assumed
  // adjacent. Month-name groups require 3+ letters so a stray leftover
  // ordinal suffix ("th") can never be mistaken for a month name.
  // Single-month case: "12th - 18th June 2026"
  const singleMonth = /(\d{1,2})\s*(?:st|nd|rd|th)?\s*[-–]\s*(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\s+(\d{4})/.exec(head)
  // Two-month case: "29th May - 4th June 2026"
  const twoMonth = /(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\s*[-–]\s*(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]{3,})\s+(\d{4})/.exec(head)

  let weekStart: string | null = null
  let weekEnd: string | null = null

  if (singleMonth) {
    const [, startDay, endDay, monthName, year] = singleMonth
    const month = MONTHS[monthName.toLowerCase()]
    if (month) {
      weekStart = toIsoDate(Number(year), month, Number(startDay))
      weekEnd = toIsoDate(Number(year), month, Number(endDay))
    }
  }
  if ((!weekStart || !weekEnd) && twoMonth) {
    const [, startDay, startMonthName, endDay, endMonthName, year] = twoMonth
    const startMonth = MONTHS[startMonthName.toLowerCase()]
    const endMonth = MONTHS[endMonthName.toLowerCase()]
    if (startMonth && endMonth) {
      weekStart = toIsoDate(Number(year), startMonth, Number(startDay))
      weekEnd = toIsoDate(Number(year), endMonth, Number(endDay))
    }
  }

  if (!weekStart || !weekEnd) {
    throw new Error('Could not parse the bulletin week dates from the PDF header.')
  }

  return {
    weekStart,
    weekEnd,
    bulletinVolume: volMatch ? Number(volMatch[1]) : null,
    bulletinIssue: issueMatch ? Number(issueMatch[1]) : null,
  }
}

function parsePassionFruitWholesale(text: string) {
  const tableStart = text.indexOf('Table 14')
  const tableEnd = text.indexOf('Table 15')
  if (tableStart === -1 || tableEnd === -1 || tableEnd <= tableStart) {
    throw new Error('Could not locate the Colombo Wholesale Prices table (Table 14) in the bulletin.')
  }
  const section = text.slice(tableStart, tableEnd)

  const labelIdx = section.indexOf('Passion Fruit')
  if (labelIdx === -1) {
    throw new Error('Could not find a Passion Fruit wholesale price row in Table 14.')
  }

  // pdf-parse concatenates same-row numbers with no separating whitespace
  // (e.g. "600.00−1000.00835.29907.14778.60-71.857.28") since each figure was
  // a distinct PDF text item at the same Y-coordinate - so pull out every
  // decimal number in sequence rather than relying on whitespace splits. The
  // row is: rangeLow, rangeHigh, avgThisWeek, avgLastWeek, avgSameWeekLastYear,
  // then two change figures we don't need (computed ourselves instead).
  const rowText = section.slice(labelIdx, labelIdx + 200)
  const numbers = rowText.match(/-?\d+\.\d{2}/g)
  if (!numbers || numbers.length < 5) {
    throw new Error('Could not find a Passion Fruit wholesale price row in Table 14.')
  }

  const [rangeLowStr, rangeHighStr, avgThisStr, avgLastStr, avgYearStr] = numbers
  const rangeLowRs = Number(rangeLowStr)
  const rangeHighRs = Number(rangeHighStr)
  const avgThisWeekRs = Number(avgThisStr)
  const avgLastWeekRs = Number(avgLastStr)
  const avgSameWeekLastYearRs = Number(avgYearStr)

  const allPositive = [rangeLowRs, rangeHighRs, avgThisWeekRs, avgLastWeekRs, avgSameWeekLastYearRs].every((n) => Number.isFinite(n) && n > 0)
  const rangeSane = rangeLowRs < rangeHighRs
  if (!allPositive || !rangeSane) {
    throw new Error('Parsed Passion Fruit wholesale figures failed sanity check.')
  }

  return { rangeLowRs, rangeHighRs, avgThisWeekRs, avgLastWeekRs, avgSameWeekLastYearRs }
}

export async function fetchLatestHartiWeeklyBulletin(): Promise<HartiWeeklyBulletin> {
  const pdfUrl = await findLatestEnglishPdfUrl()

  const pdfRes = await fetch(pdfUrl)
  if (!pdfRes.ok) throw new Error(`Failed to download weekly bulletin PDF: HTTP ${pdfRes.status}`)
  const buffer = Buffer.from(await pdfRes.arrayBuffer())

  const { text } = await pdfParse(buffer)

  const { weekStart, weekEnd, bulletinVolume, bulletinIssue } = parseBulletinHeader(text)
  const passionFruitWholesale = parsePassionFruitWholesale(text)

  return { weekStart, weekEnd, bulletinVolume, bulletinIssue, pdfUrl, passionFruitWholesale }
}
