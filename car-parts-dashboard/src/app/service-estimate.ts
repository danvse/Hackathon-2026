/*
  Replacement cycles and service-cost estimates: plain functions, no Angular
  imports, so they can be tested on their own.

  Sources and limits:
  - Labor tiers (time and cost) are the figures from the labor-rate guide the
    team supplied (Express Lube Arlington, "Automotive Labor Rate Explained").
  - Hourly rates by shop type are from the same article.
  - Replacement cycles are general industry guidance, not from that article.
    Owner's manuals differ; treat them as a starting point.
  - Which tier a category belongs to is a judgement call. Change it below.
*/

export type LaborTierId = 'simple' | 'standard' | 'complex' | 'major';

export interface LaborTier {
  id: LaborTierId;
  label: string;
  time: string;
  low: number;
  high: number;
  examples: string;
}

export const LABOR_TIERS: Record<LaborTierId, LaborTier> = {
  simple: { id: 'simple', label: 'Simple swap', time: 'Less than 1 hour', low: 50, high: 150, examples: 'Car battery, engine air filter, lightbulbs' },
  standard: { id: 'standard', label: 'Standard repair', time: '1 to 3 hours', low: 150, high: 450, examples: 'Alternator, starter motor, brake pads and rotors (per axle)' },
  complex: { id: 'complex', label: 'Complex replacement', time: '3 to 6+ hours', low: 450, high: 1000, examples: 'Water pump, timing belt, front struts' },
  major: { id: 'major', label: 'Major overhaul', time: '8+ hours', low: 1000, high: 3000, examples: 'Engine or transmission replacement' },
};

export interface ReplacementCycle {
  /** Miles between replacements, or null when mileage is not the usual measure. */
  miles: [number, number] | null;
  /** Years between replacements. */
  years: [number, number] | null;
}

interface CategoryInfo {
  tier: LaborTierId;
  cycle: ReplacementCycle;
}

const CATEGORY_INFO: Record<string, CategoryInfo> = {
  'brake pads': { tier: 'standard', cycle: { miles: [25000, 60000], years: null } },
  'brake rotors': { tier: 'standard', cycle: { miles: [50000, 70000], years: null } },
  'oil filter': { tier: 'simple', cycle: { miles: [5000, 10000], years: [0.5, 1] } },
  'air filter': { tier: 'simple', cycle: { miles: [15000, 30000], years: [1, 3] } },
  'cabin air filter': { tier: 'simple', cycle: { miles: [15000, 25000], years: [1, 2] } },
  'spark plugs': { tier: 'standard', cycle: { miles: [30000, 100000], years: null } },
  'battery': { tier: 'simple', cycle: { miles: null, years: [3, 5] } },
  'alternator': { tier: 'standard', cycle: { miles: [80000, 150000], years: [7, 10] } },
  'serpentine belt': { tier: 'simple', cycle: { miles: [60000, 100000], years: [5, 7] } },
  'shock absorbers': { tier: 'standard', cycle: { miles: [50000, 100000], years: null } },
};

/** Categories the app has no data for fall back to a standard repair. */
const FALLBACK: CategoryInfo = { tier: 'standard', cycle: { miles: null, years: null } };

function info(category: string): CategoryInfo {
  return CATEGORY_INFO[(category || '').trim().toLowerCase()] ?? FALLBACK;
}

export function laborTierFor(category: string): LaborTier {
  return LABOR_TIERS[info(category).tier];
}

export function replacementCycleFor(category: string): ReplacementCycle | null {
  const cycle = info(category).cycle;
  return cycle.miles || cycle.years ? cycle : null;
}

function range(a: number, b: number, unit: string, grouped: boolean): string {
  const fmt = (n: number) => (grouped ? n.toLocaleString('en-US') : String(n));
  return `${fmt(a)} to ${fmt(b)} ${unit}`;
}

/** For example "25,000 to 60,000 miles", or null when there is no mileage figure. */
export function formatMiles(cycle: ReplacementCycle | null): string | null {
  return cycle?.miles ? range(cycle.miles[0], cycle.miles[1], 'miles', true) : null;
}

/** For example "3 to 5 years", or null when there is no time figure. */
export function formatYears(cycle: ReplacementCycle | null): string | null {
  if (!cycle?.years) return null;
  const [a, b] = cycle.years;
  if (b <= 1) return '6 to 12 months';
  if (a < 1) return `6 months to ${b} ${b === 1 ? 'year' : 'years'}`;
  return range(a, b, 'years', false);
}

export interface ShopType {
  id: string;
  label: string;
  /** Hourly rate range from the article, as text. */
  rate: string;
  /** Midpoint of the range, used to scale the labor figures. */
  mid: number;
}

/** The labor tiers above hold at roughly this hourly rate. */
export const REFERENCE_RATE = 150;

export const SHOP_TYPES: ShopType[] = [
  { id: 'typical', label: 'Typical (national average)', rate: '$120 to $159 per hour', mid: REFERENCE_RATE },
  { id: 'rural', label: 'Rural independent garage', rate: '$85 to $110 per hour', mid: 97.5 },
  { id: 'suburban', label: 'Suburban independent garage', rate: '$120 to $150 per hour', mid: 135 },
  { id: 'urban', label: 'Urban independent garage', rate: '$140 to $175 per hour', mid: 157.5 },
  { id: 'chain', label: 'Franchise or chain shop', rate: '$130 to $160 per hour', mid: 145 },
  { id: 'dealer', label: 'New car dealership', rate: '$160 to $200+ per hour', mid: 180 },
];

export function shopTypeFor(id: string): ShopType {
  return SHOP_TYPES.find((s) => s.id === id) ?? SHOP_TYPES[0];
}

export interface Span {
  low: number;
  high: number;
}

export interface ServiceEstimate {
  tier: LaborTier;
  shop: ShopType;
  labor: Span;
  /** Total with the average aftermarket part, or null when none is listed. */
  aftermarket: Span | null;
  /** Total with the average OEM part, or null when none is listed. */
  oem: Span | null;
  /** Total with the average of all listed parts, or null when no parts. */
  overall: Span | null;
}

function roundTo5(value: number): number {
  return Math.round(value / 5) * 5;
}

function add(part: number | null, labor: Span): Span | null {
  if (part === null || !isFinite(part)) return null;
  return { low: part + labor.low, high: part + labor.high };
}

export function estimateService(input: {
  category: string;
  avgAll: number | null;
  avgAftermarket: number | null;
  avgOem: number | null;
  shopId: string;
}): ServiceEstimate {
  const tier = laborTierFor(input.category);
  const shop = shopTypeFor(input.shopId);
  const factor = shop.mid / REFERENCE_RATE;
  const labor: Span =
    factor === 1
      ? { low: tier.low, high: tier.high }
      : { low: roundTo5(tier.low * factor), high: roundTo5(tier.high * factor) };

  return {
    tier,
    shop,
    labor,
    aftermarket: add(input.avgAftermarket, labor),
    oem: add(input.avgOem, labor),
    overall: add(input.avgAll, labor),
  };
}