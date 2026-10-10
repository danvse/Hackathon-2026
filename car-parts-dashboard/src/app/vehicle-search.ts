/*
  Vehicle search: plain functions with no Angular imports, so the logic can be
  tested on its own. The dashboard uses it to suggest vehicles while the user
  types, so a VIN is never required.
*/

export interface CatalogVehicle {
  make: string;
  model: string;
  year: number;
}

export interface VehicleOption {
  make: string;
  model: string;
  /** Years that already have saved prices, newest first. */
  years: number[];
  /** True when saved prices exist for this vehicle. */
  inCatalog: boolean;
  /** How many saved listings this vehicle has; used to order recommendations. */
  saved: number;
}

export interface VehicleSearchResult {
  results: VehicleOption[];
  /** A four-digit year typed in the query, for example "2018 c300". */
  year: number | null;
}

/** Common vehicles offered even when no prices are saved for them yet. */
export const POPULAR_VEHICLES: ReadonlyArray<{ make: string; models: string[] }> = [
  { make: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra'] },
  { make: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot'] },
  { make: 'Ford', models: ['F-150', 'Mustang', 'Explorer', 'Escape'] },
  { make: 'Chevrolet', models: ['Silverado 1500', 'Equinox', 'Malibu'] },
  { make: 'Nissan', models: ['Altima', 'Rogue', 'Sentra'] },
  { make: 'Hyundai', models: ['Elantra', 'Sonata', 'Tucson'] },
  { make: 'Subaru', models: ['Outback', 'Forester'] },
  { make: 'Volkswagen', models: ['Jetta', 'Golf', 'Tiguan'] },
  { make: 'BMW', models: ['330i', '530i', 'X3', 'X5'] },
  { make: 'Mercedes-Benz', models: ['C300', 'E350', 'GLC300', 'CLA250'] },
  { make: 'Audi', models: ['A4', 'Q5'] },
  { make: 'Lexus', models: ['RX 350', 'ES 350'] },
  { make: 'Jeep', models: ['Wrangler', 'Grand Cherokee'] },
];

const FALLBACK_YEAR = 2020;
const YEAR_SPAN = 15;

function vehicleKey(make: string, model: string): string {
  return `${make}|${model}`.toLowerCase();
}

function compact(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Saved vehicles first (most saved listings, then A to Z), then the popular list (A to Z). */
export function buildVehicleOptions(catalog: CatalogVehicle[]): VehicleOption[] {
  const byKey = new Map<string, VehicleOption>();

  for (const item of catalog) {
    if (!item.make || !item.model) continue;
    const year = Number(item.year);
    const key = vehicleKey(item.make, item.model);
    let option = byKey.get(key);
    if (!option) {
      option = { make: item.make, model: item.model, years: [], inCatalog: true, saved: 0 };
      byKey.set(key, option);
    }
    option.saved += 1;
    if (year > 1990 && !option.years.includes(year)) {
      option.years.push(year);
    }
  }

  for (const group of POPULAR_VEHICLES) {
    for (const model of group.models) {
      const key = vehicleKey(group.make, model);
      if (!byKey.has(key)) {
        byKey.set(key, { make: group.make, model, years: [], inCatalog: false, saved: 0 });
      }
    }
  }

  const options = Array.from(byKey.values());
  for (const option of options) {
    option.years.sort((a, b) => b - a);
  }
  options.sort((a, b) => {
    if (a.inCatalog !== b.inCatalog) return a.inCatalog ? -1 : 1;
    if (a.saved !== b.saved) return b.saved - a.saved;
    return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
  });
  return options;
}

/** Splits a query into search terms and an optional model year. */
export function parseVehicleQuery(query: string): { terms: string[]; year: number | null } {
  const tokens = (query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let year: number | null = null;
  const terms: string[] = [];
  for (const token of tokens) {
    if (year === null && /^(19|20)\d\d$/.test(token)) {
      const value = Number(token);
      if (value >= 1990 && value <= 2035) {
        year = value;
        continue;
      }
    }
    terms.push(token);
  }
  return { terms, year };
}

/** Returns a match score, or -1 when any term does not match. */
function scoreOption(option: VehicleOption, terms: string[]): number {
  const make = option.make.toLowerCase();
  const model = option.model.toLowerCase();
  const words = `${make} ${model}`.split(/[\s-]+/).filter(Boolean);
  const compactModel = compact(model);
  const compactAll = compact(`${make} ${model}`);

  let score = 0;
  for (const term of terms) {
    const needle = compact(term);
    if (!needle) continue;
    if (words.some((word) => word.startsWith(needle))) {
      score += 3;
    } else if (compactModel.startsWith(needle) || compactAll.startsWith(needle)) {
      score += 2;
    } else if (needle.length >= 3 && compactAll.includes(needle)) {
      score += 1;
    } else {
      return -1;
    }
  }
  return score;
}

/**
 * Suggests vehicles for what the user has typed. An empty query returns the
 * recommended list: vehicles with saved prices first, then popular ones.
 */
export function searchVehicles(
  options: VehicleOption[],
  query: string,
  limit = 8
): VehicleSearchResult {
  const { terms, year } = parseVehicleQuery(query);
  if (!terms.length) {
    return { results: options.slice(0, limit), year };
  }

  const scored: { option: VehicleOption; score: number }[] = [];
  for (const option of options) {
    const score = scoreOption(option, terms);
    if (score >= 0) scored.push({ option, score });
  }

  scored.sort((a, b) => {
    if (a.option.inCatalog !== b.option.inCatalog) return a.option.inCatalog ? -1 : 1;
    if (a.score !== b.score) return b.score - a.score;
    return `${a.option.make} ${a.option.model}`.localeCompare(`${b.option.make} ${b.option.model}`);
  });

  return { results: scored.slice(0, limit).map((entry) => entry.option), year };
}

/** The year to start with: the typed year, else the newest saved year. */
export function defaultYear(option: VehicleOption, hint: number | null): number {
  if (hint) return hint;
  return option.years.length ? option.years[0] : FALLBACK_YEAR;
}

/** Years for the year menu: saved years plus the last fifteen model years. */
export function yearChoices(known: number[], selected: number, currentYear: number): number[] {
  const years = new Set<number>(known.filter((y) => y > 1990));
  for (let y = currentYear; y > currentYear - YEAR_SPAN; y--) {
    years.add(y);
  }
  if (selected > 1990) years.add(selected);
  return Array.from(years).sort((a, b) => b - a);
}