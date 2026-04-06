/**
 * Tipping Guide Calculator - Type Definitions
 *
 * Country-specific tipping customs and cultural norms for
 * restaurants, taxis, hotels, delivery, hairdressers, and bars.
 */

import type { Currency } from '../../../lib/regions';

// ---------------------------------------------------------------------------
// Country & Service Type Enums
// ---------------------------------------------------------------------------

export type TippingCountry =
  | 'US'
  | 'UK'
  | 'France'
  | 'Germany'
  | 'Italy'
  | 'Spain'
  | 'Japan'
  | 'Australia'
  | 'Canada'
  | 'Netherlands'
  | 'Brazil'
  | 'Mexico';

export type ServiceType =
  | 'restaurant'
  | 'taxi'
  | 'hotel'
  | 'delivery'
  | 'hairdresser'
  | 'bar';

// ---------------------------------------------------------------------------
// Tipping Data Structure
// ---------------------------------------------------------------------------

export interface CountryTippingNorm {
  /** Suggested tip as a decimal (0.18 = 18%) */
  readonly suggestedPercent: number;
  /** Whether service charge is typically included in the bill */
  readonly serviceIncluded: boolean;
  /** Cultural note for this country + service combination */
  readonly culturalNote: string;
}

export interface CountryTippingProfile {
  readonly flag: string;
  readonly currency: Currency;
  readonly services: Readonly<Record<ServiceType, CountryTippingNorm>>;
}

// ---------------------------------------------------------------------------
// Tipping Data Constant
// ---------------------------------------------------------------------------

export const TIPPING_DATA: Readonly<Record<TippingCountry, CountryTippingProfile>> = {
  US: {
    flag: '\u{1F1FA}\u{1F1F8}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0.2,
        serviceIncluded: false,
        culturalNote:
          '18-25% is expected. Servers earn below minimum wage and rely on tips as primary income.',
      },
      taxi: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote: '15-20% is standard for taxi and rideshare drivers.',
      },
      hotel: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote:
          '$2-5 per night for housekeeping, $1-2 per bag for bellhops. Room service: 18-20%.',
      },
      delivery: {
        suggestedPercent: 0.18,
        serviceIncluded: false,
        culturalNote: '15-20% with a $3-5 minimum for small orders. More in bad weather.',
      },
      hairdresser: {
        suggestedPercent: 0.2,
        serviceIncluded: false,
        culturalNote: '15-25% is customary. Tip everyone who touches your hair.',
      },
      bar: {
        suggestedPercent: 0.2,
        serviceIncluded: false,
        culturalNote: '$1-2 per drink or 15-20% of the tab. More for complex cocktails.',
      },
    },
  },
  UK: {
    flag: '\u{1F1EC}\u{1F1E7}',
    currency: 'GBP',
    services: {
      restaurant: {
        suggestedPercent: 0.1,
        serviceIncluded: true,
        culturalNote:
          '10-12.5% is standard, but check for a service charge on the bill first. If included, no extra tip needed.',
      },
      taxi: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest pound or add 10%. Not strictly expected.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Tipping hotel staff is appreciated but not expected. A pound or two is fine.',
      },
      delivery: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: 'Rounding up or a small tip is appreciated but not expected.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10% or round up is common but not obligatory.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: false,
        culturalNote: 'Tipping at bars is rare. Offering to "buy the barman a drink" is the tradition.',
      },
    },
  },
  France: {
    flag: '\u{1F1EB}\u{1F1F7}',
    currency: 'EUR',
    services: {
      restaurant: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote:
          'Service compris: a 15% service charge is included by law. Leaving small change (1-5%) is a polite bonus.',
      },
      taxi: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest euro. No large tip expected.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote: '1-2 euros for porters. Housekeeping tipping is rare.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'A euro or two is appreciated but not expected.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '5-10% is common if you are happy with the service.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote: 'Service is included. Leaving small coins on the counter is a kind gesture.',
      },
    },
  },
  Germany: {
    flag: '\u{1F1E9}\u{1F1EA}',
    currency: 'EUR',
    services: {
      restaurant: {
        suggestedPercent: 0.1,
        serviceIncluded: true,
        culturalNote:
          'Service is included but rounding up 5-10% is customary. Say the total you want to pay when handing money.',
      },
      taxi: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest euro or add 10%.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: '1-2 euros per bag for porters, 1-2 euros per night for housekeeping.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up or 1-2 euros. Appreciated but not expected.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '5-10% is common for good service.',
      },
      bar: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote: 'Round up to the nearest euro. Large tips are unusual.',
      },
    },
  },
  Italy: {
    flag: '\u{1F1EE}\u{1F1F9}',
    currency: 'EUR',
    services: {
      restaurant: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote:
          'Coperto (cover charge) and servizio are often on the bill. Leaving small change is enough.',
      },
      taxi: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest euro. No large tip expected.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: '1 euro per bag for porters. Housekeeping: 1 euro per night.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'A euro or two for the driver is a nice gesture.',
      },
      hairdresser: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Small tip of 5-10% for good service, not obligatory.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote:
          'Standing at the bar is cheaper than sitting at a table. Tips are not expected.',
      },
    },
  },
  Spain: {
    flag: '\u{1F1EA}\u{1F1F8}',
    currency: 'EUR',
    services: {
      restaurant: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote:
          'Service is included. Leaving small change (5-10%) is generous. Locals may leave nothing extra.',
      },
      taxi: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest euro.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: '1 euro per bag, 1-2 euros per night for housekeeping at nicer hotels.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Rounding up or a small tip is a kind gesture.',
      },
      hairdresser: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Not expected but appreciated. 5-10% for excellent service.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote: 'Tipping at bars is uncommon. Leaving small coins is sufficient.',
      },
    },
  },
  Japan: {
    flag: '\u{1F1EF}\u{1F1F5}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote:
          'Tipping is considered rude in Japan. Excellent service is the cultural norm and pride of the profession.',
      },
      taxi: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote:
          'Do not tip. Drivers may refuse or chase you to return the extra money.',
      },
      hotel: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote:
          'No tipping. At a ryokan (traditional inn), place a gift in an envelope if desired.',
      },
      delivery: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote: 'Tipping delivery drivers is not done and may cause confusion.',
      },
      hairdresser: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote: 'No tipping. The price covers the service.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: true,
        culturalNote:
          'No tipping. Some bars charge a small "otoshi" (table charge) which covers snacks.',
      },
    },
  },
  Australia: {
    flag: '\u{1F1E6}\u{1F1FA}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote:
          'Tipping is not expected due to fair wages, but 10% is appreciated for great service.',
      },
      taxi: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up the fare. Tipping is not expected.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Tipping hotel staff is not expected but a few dollars is appreciated.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Not expected. A few dollars for large orders is generous.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10% for great service, but not expected.',
      },
      bar: {
        suggestedPercent: 0,
        serviceIncluded: false,
        culturalNote: 'Tipping at bars is very rare in Australia.',
      },
    },
  },
  Canada: {
    flag: '\u{1F1E8}\u{1F1E6}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0.18,
        serviceIncluded: false,
        culturalNote: '15-20% is standard. Similar to the US, servers depend on tips.',
      },
      taxi: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote: '15% is standard for taxi and rideshare.',
      },
      hotel: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '$2-5 for bellhops, $2-5 per night for housekeeping.',
      },
      delivery: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote: '15-20% for delivery, with a $3-5 minimum.',
      },
      hairdresser: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote: '15-20% is customary.',
      },
      bar: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote: '$1-2 per drink or 15-20% of the tab.',
      },
    },
  },
  Netherlands: {
    flag: '\u{1F1F3}\u{1F1F1}',
    currency: 'EUR',
    services: {
      restaurant: {
        suggestedPercent: 0.1,
        serviceIncluded: true,
        culturalNote:
          'Service is included by law, but rounding up or leaving 5-10% is a common gesture for good service.',
      },
      taxi: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: 'Round up to the nearest euro or 5-10%.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: '1-2 euros per bag, small tip for housekeeping is appreciated.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Small tip or rounding up is appreciated.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '5-10% for good service.',
      },
      bar: {
        suggestedPercent: 0.05,
        serviceIncluded: true,
        culturalNote: 'Round up to the nearest euro. Large tips are uncommon.',
      },
    },
  },
  Brazil: {
    flag: '\u{1F1E7}\u{1F1F7}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0.1,
        serviceIncluded: true,
        culturalNote:
          'A 10% "gorjeta" service charge is standard on the bill. It is optional by law but almost always paid.',
      },
      taxi: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Round up the fare. Tipping is appreciated but not expected.',
      },
      hotel: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'Small tips for bellhops and housekeeping are appreciated.',
      },
      delivery: {
        suggestedPercent: 0.05,
        serviceIncluded: false,
        culturalNote: 'A small tip is common, especially in cash.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10-15% is appreciated for good service.',
      },
      bar: {
        suggestedPercent: 0.1,
        serviceIncluded: true,
        culturalNote: 'The 10% service charge usually applies at bars too.',
      },
    },
  },
  Mexico: {
    flag: '\u{1F1F2}\u{1F1FD}',
    currency: 'USD',
    services: {
      restaurant: {
        suggestedPercent: 0.15,
        serviceIncluded: false,
        culturalNote:
          '10-15% is standard. In tourist areas, 15-20% may be expected. Check for "propina" on the bill.',
      },
      taxi: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: 'Round up the fare or add 10%.',
      },
      hotel: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '25-50 pesos per day for housekeeping, 25-50 per bag for bellhops.',
      },
      delivery: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10-15% or 20-50 pesos for delivery drivers.',
      },
      hairdresser: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10-15% is customary.',
      },
      bar: {
        suggestedPercent: 0.1,
        serviceIncluded: false,
        culturalNote: '10-15% of the tab is standard.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Country display labels
// ---------------------------------------------------------------------------

export const COUNTRY_LABELS: Readonly<Record<TippingCountry, string>> = {
  US: 'United States',
  UK: 'United Kingdom',
  France: 'France',
  Germany: 'Germany',
  Italy: 'Italy',
  Spain: 'Spain',
  Japan: 'Japan',
  Australia: 'Australia',
  Canada: 'Canada',
  Netherlands: 'Netherlands',
  Brazil: 'Brazil',
  Mexico: 'Mexico',
};

export const SERVICE_LABELS: Readonly<Record<ServiceType, string>> = {
  restaurant: 'Restaurant',
  taxi: 'Taxi / Rideshare',
  hotel: 'Hotel',
  delivery: 'Delivery',
  hairdresser: 'Hairdresser / Barber',
  bar: 'Bar / Pub',
};

// ---------------------------------------------------------------------------
// Input / Result Types
// ---------------------------------------------------------------------------

export interface TippingGuideInputs {
  readonly country: TippingCountry;
  readonly serviceType: ServiceType;
  readonly billAmount: number;
  readonly currency: Currency;
}

export interface TippingGuideResult {
  readonly suggestedTipPercent: number;
  readonly tipAmount: number;
  readonly totalWithTip: number;
  readonly culturalNote: string;
  readonly isServiceIncluded: boolean;
  readonly roundedTotal: number;
  readonly currency: Currency;
}

// ---------------------------------------------------------------------------
// Default Inputs
// ---------------------------------------------------------------------------

/**
 * Detect sensible defaults based on the browser locale.
 * Falls back to US / USD.
 */
export function getDefaultInputs(currency: Currency = 'USD'): TippingGuideInputs {
  const countryByCurrency: Record<Currency, TippingCountry> = {
    USD: 'US',
    GBP: 'UK',
    EUR: 'France',
  };

  return {
    country: countryByCurrency[currency] ?? 'US',
    serviceType: 'restaurant',
    billAmount: currency === 'GBP' ? 50 : currency === 'EUR' ? 60 : 50,
    currency,
  };
}

export const DEFAULT_INPUTS: TippingGuideInputs = getDefaultInputs('USD');
