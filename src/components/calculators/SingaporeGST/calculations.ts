/** Singapore GST calculator. Rate is 9% from 1 Jan 2024; older rates kept as constants for page copy only. */

export const GST_RATE = 0.09;
export const GST_RATE_2023 = 0.08; // 1 Jan - 31 Dec 2023
export const GST_RATE_PRE_2023 = 0.07; // before 1 Jan 2023
export const GST_EFFECTIVE_DATE = '1 January 2024';
export const LOW_VALUE_GOODS_THRESHOLD = 400; // SGD; GST still applies below this via the OVR regime, since 2023

export type GSTMode = 'add' | 'remove';

export interface DomesticGSTInputs {
  amount: number;
  mode: GSTMode;
}

export interface DomesticGSTResult {
  net: number;
  gst: number;
  gross: number;
}

export interface ImportGSTInputs {
  itemCost: number;
  shipping: number;
  insurance: number;
  dutyRatePercent: number;
}

export interface ImportGSTResult {
  cifValue: number;
  duty: number;
  gstBase: number;
  gst: number;
  landedCost: number;
}

export function getDefaultDomesticInputs(): DomesticGSTInputs {
  return { amount: 100, mode: 'add' };
}

export function getDefaultImportInputs(): ImportGSTInputs {
  return { itemCost: 500, shipping: 50, insurance: 10, dutyRatePercent: 0 };
}

const round2 = (v: number) => Math.round(v * 100) / 100;

// Removing GST divides by (1 + rate); subtracting the rate is the common mistake.
export function calculateDomesticGST(inputs: DomesticGSTInputs): DomesticGSTResult {
  const amount = Math.max(0, inputs.amount || 0);

  if (inputs.mode === 'remove') {
    const gross = amount;
    const net = gross / (1 + GST_RATE);
    const gst = gross - net;
    return { net: round2(net), gst: round2(gst), gross: round2(gross) };
  }

  const net = amount;
  const gst = net * GST_RATE;
  const gross = net + gst;
  return { net: round2(net), gst: round2(gst), gross: round2(gross) };
}

// Import GST applies to CIF value plus duty, not to item cost alone.
export function calculateImportGST(inputs: ImportGSTInputs): ImportGSTResult {
  const itemCost = Math.max(0, inputs.itemCost || 0);
  const shipping = Math.max(0, inputs.shipping || 0);
  const insurance = Math.max(0, inputs.insurance || 0);
  const dutyRate = Math.max(0, inputs.dutyRatePercent || 0) / 100;

  const cifValue = itemCost + shipping + insurance;
  const duty = cifValue * dutyRate;
  const gstBase = cifValue + duty;
  const gst = gstBase * GST_RATE;
  const landedCost = gstBase + gst;

  return {
    cifValue: round2(cifValue),
    duty: round2(duty),
    gstBase: round2(gstBase),
    gst: round2(gst),
    landedCost: round2(landedCost),
  };
}
