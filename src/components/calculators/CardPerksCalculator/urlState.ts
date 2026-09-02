/** Shareable comparison state: inputs <-> query string. Defaults are passed in, never imported. */
import {
  CARD_TYPES,
  SORT_KEYS,
  type CardPerksInputs,
  type CardType,
  type Horizon,
  type SortKey,
} from './types';

function numberParam(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function boolParam(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const raw = params.get(key);
  if (raw === '1') return true;
  if (raw === '0') return false;
  return fallback;
}

export function inputsFromParams(search: string, defaults: CardPerksInputs): CardPerksInputs {
  const params = new URLSearchParams(search);

  const aviosPence = numberParam(params, 'avios', defaults.pointValuePence.avios);
  const pointValuePence =
    aviosPence === defaults.pointValuePence.avios
      ? defaults.pointValuePence
      : {
          ...defaults.pointValuePence,
          avios: aviosPence,
          membershipRewards: aviosPence,
          virginPoints: aviosPence,
        };

  const horizonRaw = params.get('horizon');
  const horizon: Horizon =
    horizonRaw === 'ongoing' || horizonRaw === 'year1' ? horizonRaw : defaults.horizon;

  const typesRaw = params.get('types');
  const types: readonly CardType[] = typesRaw
    ? typesRaw
        .split(',')
        .filter((t): t is CardType => (CARD_TYPES as readonly string[]).includes(t))
    : defaults.types;

  const sortRaw = params.get('sort');
  const sortKey: SortKey =
    sortRaw && (SORT_KEYS as readonly string[]).includes(sortRaw)
      ? (sortRaw as SortKey)
      : defaults.sortKey;

  return {
    spend: {
      groceries: numberParam(params, 'g', defaults.spend.groceries),
      travel: numberParam(params, 't', defaults.spend.travel),
      dining: numberParam(params, 'd', defaults.spend.dining),
      other: numberParam(params, 'o', defaults.spend.other),
    },
    spendAbroad: numberParam(params, 'abroad', defaults.spendAbroad),
    loungeVisits: numberParam(params, 'lounge', defaults.loungeVisits),
    clearsBalance: boolParam(params, 'clear', defaults.clearsBalance),
    carriedBalance: numberParam(params, 'balance', defaults.carriedBalance),
    horizon,
    pointValuePence,
    loungeVisitValue: numberParam(params, 'lv', defaults.loungeVisitValue),
    insuranceValue: numberParam(params, 'ins', defaults.insuranceValue),
    voucherValue: numberParam(params, 'voucher', defaults.voucherValue),
    types,
    loungeOnly: boolParam(params, 'loungeOnly', defaults.loungeOnly),
    noFeeOnly: boolParam(params, 'noFee', defaults.noFeeOnly),
    sortKey,
  };
}

export function paramsFromInputs(inputs: CardPerksInputs, defaults: CardPerksInputs): string {
  const params = new URLSearchParams();
  if (inputs.spend.groceries !== defaults.spend.groceries)
    params.set('g', String(inputs.spend.groceries));
  if (inputs.spend.travel !== defaults.spend.travel) params.set('t', String(inputs.spend.travel));
  if (inputs.spend.dining !== defaults.spend.dining) params.set('d', String(inputs.spend.dining));
  if (inputs.spend.other !== defaults.spend.other) params.set('o', String(inputs.spend.other));
  if (inputs.spendAbroad !== defaults.spendAbroad) params.set('abroad', String(inputs.spendAbroad));
  if (inputs.loungeVisits !== defaults.loungeVisits)
    params.set('lounge', String(inputs.loungeVisits));
  if (inputs.clearsBalance !== defaults.clearsBalance)
    params.set('clear', inputs.clearsBalance ? '1' : '0');
  if (inputs.carriedBalance !== defaults.carriedBalance)
    params.set('balance', String(inputs.carriedBalance));
  if (inputs.horizon !== defaults.horizon) params.set('horizon', inputs.horizon);
  if (inputs.pointValuePence.avios !== defaults.pointValuePence.avios) {
    params.set('avios', String(Math.round(inputs.pointValuePence.avios * 10) / 10));
  }
  if (inputs.loungeVisitValue !== defaults.loungeVisitValue)
    params.set('lv', String(inputs.loungeVisitValue));
  if (inputs.insuranceValue !== defaults.insuranceValue)
    params.set('ins', String(inputs.insuranceValue));
  if (inputs.voucherValue !== defaults.voucherValue)
    params.set('voucher', String(inputs.voucherValue));
  if (inputs.types.length > 0) params.set('types', inputs.types.join(','));
  if (inputs.loungeOnly) params.set('loungeOnly', '1');
  if (inputs.noFeeOnly) params.set('noFee', '1');
  if (inputs.sortKey !== defaults.sortKey) params.set('sort', inputs.sortKey);
  return params.toString();
}
