/** Shareable search state: finder inputs <-> query string. Only non-default values are written. */
import {
  CABIN_LABELS,
  HOLIDAY_TYPES,
  REGIONS,
  SORT_KEYS,
  TRIP_TYPES,
  getDefaultInputs,
  type AviosFinderInputs,
  type Cabin,
  type HolidayType,
  type Region,
  type SortKey,
  type TripType,
  type VoucherType,
} from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// `voucher=1` predates the voucher types; it priced 2-for-1 in every cabin, which is Premium Plus.
function voucherFromParam(value: string | null): VoucherType | null {
  if (value === '1' || value === 'premiumPlus') return 'premiumPlus';
  if (value === 'free') return 'free';
  return null;
}

export function inputsFromParams(search: string): Partial<AviosFinderInputs> | null {
  const params = new URLSearchParams(search);
  const patch: Record<string, unknown> = {};

  const budget = Number(params.get('budget'));
  if (Number.isFinite(budget) && budget > 0) patch.aviosBudget = Math.floor(budget);
  const from = params.get('from');
  if (from && ISO_DATE.test(from)) patch.dateFrom = from;
  const to = params.get('to');
  if (to && ISO_DATE.test(to)) patch.dateTo = to;
  const regions = params
    .get('regions')
    ?.split(',')
    .filter((r): r is Region => (REGIONS as readonly string[]).includes(r));
  if (regions && regions.length > 0) patch.regions = regions;
  const types = params
    .get('types')
    ?.split(',')
    .filter((t): t is HolidayType => (HOLIDAY_TYPES as readonly string[]).includes(t));
  if (types && types.length > 0) patch.holidayTypes = types;
  const cabinParam = params.get('cabin');
  if (cabinParam && cabinParam in CABIN_LABELS) patch.cabin = cabinParam as Cabin;
  const travellers = params.get('travellers');
  if (travellers === '1' || travellers === '2') patch.travellers = Number(travellers) as 1 | 2;
  const voucher = voucherFromParam(params.get('voucher'));
  if (voucher) patch.voucher = voucher;
  const trip = params.get('trip');
  if (trip && (TRIP_TYPES as readonly string[]).includes(trip)) patch.tripType = trip as TripType;
  const sort = params.get('sort');
  if (sort && (SORT_KEYS as readonly string[]).includes(sort)) patch.sortKey = sort as SortKey;
  if (params.get('over') === '0') patch.showOverBudget = false;

  return Object.keys(patch).length > 0 ? (patch as Partial<AviosFinderInputs>) : null;
}

export function paramsFromInputs(inputs: AviosFinderInputs): string {
  const d = getDefaultInputs();
  const params = new URLSearchParams();
  if (inputs.aviosBudget !== d.aviosBudget) params.set('budget', String(inputs.aviosBudget));
  if (inputs.dateFrom) params.set('from', inputs.dateFrom);
  if (inputs.dateTo) params.set('to', inputs.dateTo);
  if (inputs.regions.length > 0) params.set('regions', inputs.regions.join(','));
  if (inputs.holidayTypes.length > 0) params.set('types', inputs.holidayTypes.join(','));
  if (inputs.cabin !== d.cabin) params.set('cabin', inputs.cabin);
  if (inputs.travellers !== d.travellers) params.set('travellers', String(inputs.travellers));
  if (inputs.voucher !== d.voucher) params.set('voucher', inputs.voucher);
  if (inputs.tripType !== d.tripType) params.set('trip', inputs.tripType);
  if (inputs.sortKey !== d.sortKey) params.set('sort', inputs.sortKey);
  if (!inputs.showOverBudget) params.set('over', '0');
  return params.toString();
}
