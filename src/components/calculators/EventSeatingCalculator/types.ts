/**
 * Event Seating Calculator - Type Definitions
 *
 * Calculate table and room requirements for events.
 */

export type TableShape = 'round' | 'rectangular' | 'square' | 'cocktail';
export type EventType = 'wedding' | 'corporate' | 'banquet' | 'conference' | 'party';

export interface EventSeatingInputs {
  guestCount: number;
  tableShape: TableShape;
  tableSize: number; // diameter for round, length for rectangular (feet)
  eventType: EventType;

  // Space requirements
  danceFloorPercent: number;
  includeDJSpace: boolean;
  includeBuffetArea: boolean;
  includeHeadTable: boolean;
  headTableGuests: number;

  // Spacing
  chairSpacing: number; // inches between chairs
  tableSpacing: number; // feet between tables
  aisleWidth: number; // feet
}

export interface TableConfig {
  type: string;
  seatsPerTable: number;
  tablesNeeded: number;
  totalSeats: number;
  tableFootprint: number; // sq ft per table including chairs
}

export interface SpaceRequirement {
  area: string;
  sqFt: number;
  dimensions: string;
  notes: string;
}

export interface EventSeatingResult {
  // Table counts
  tablesNeeded: number;
  seatsPerTable: number;
  totalSeats: number;
  extraSeats: number;

  // Room requirements
  totalRoomSqFt: number;
  minimumRoomLength: number;
  minimumRoomWidth: number;

  // Space breakdown
  seatingAreaSqFt: number;
  danceFloorSqFt: number;
  djAreaSqFt: number;
  buffetAreaSqFt: number;
  aislesSqFt: number;

  // Detailed breakdown
  spaceRequirements: SpaceRequirement[];
  tableConfig: TableConfig;

  // Layout suggestions
  layoutSuggestions: string[];

  // Tips
  tips: string[];
}

// Seats per table by shape and size
export const SEATS_BY_TABLE: Record<TableShape, Record<number, number>> = {
  round: {
    4: 4, // 4ft round = 4 seats
    5: 6, // 5ft round = 6 seats
    6: 8, // 6ft round = 8 seats
    7: 10, // 7ft round = 10 seats
    8: 12, // 8ft round = 12 seats
  },
  rectangular: {
    6: 6, // 6ft table = 6 seats
    8: 8, // 8ft table = 8 seats
    10: 10, // 10ft table = 10 seats
    12: 12, // 12ft table = 12 seats
  },
  square: {
    3: 4, // 3ft square = 4 seats
    4: 8, // 4ft square = 8 seats (2 per side)
  },
  cocktail: {
    2: 4, // 2ft cocktail = 4 standing
    3: 6, // 3ft cocktail = 6 standing
  },
};

// Square feet per person by event type (including circulation)
export const SQFT_PER_PERSON: Record<EventType, number> = {
  wedding: 15,
  corporate: 12,
  banquet: 14,
  conference: 10,
  party: 12,
};

export function getDefaultInputs(): EventSeatingInputs {
  return {
    guestCount: 100,
    tableShape: 'round',
    tableSize: 6,
    eventType: 'wedding',
    danceFloorPercent: 15,
    includeDJSpace: true,
    includeBuffetArea: true,
    includeHeadTable: true,
    headTableGuests: 8,
    chairSpacing: 24,
    tableSpacing: 6,
    aisleWidth: 4,
  };
}

export const DEFAULT_INPUTS: EventSeatingInputs = getDefaultInputs();
