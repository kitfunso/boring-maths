export type TableShape = 'round' | 'rectangular' | 'square' | 'cocktail';
export type EventType = 'wedding' | 'corporate' | 'banquet' | 'conference' | 'party';

export interface EventSeatingInputs {
  guestCount: number;
  tableShape: TableShape;
  tableSize: number;
  eventType: EventType;

  danceFloorPercent: number;
  includeDJSpace: boolean;
  includeBuffetArea: boolean;
  includeHeadTable: boolean;
  headTableGuests: number;

  chairSpacing: number;
  tableSpacing: number;
  aisleWidth: number;
}

export interface TableConfig {
  type: string;
  seatsPerTable: number;
  tablesNeeded: number;
  totalSeats: number;
  tableFootprint: number;
}

export interface SpaceRequirement {
  area: string;
  sqFt: number;
  dimensions: string;
  notes: string;
}

export interface EventSeatingResult {
  tablesNeeded: number;
  seatsPerTable: number;
  totalSeats: number;
  extraSeats: number;

  totalRoomSqFt: number;
  minimumRoomLength: number;
  minimumRoomWidth: number;

  seatingAreaSqFt: number;
  danceFloorSqFt: number;
  djAreaSqFt: number;
  buffetAreaSqFt: number;
  aislesSqFt: number;

  spaceRequirements: SpaceRequirement[];
  tableConfig: TableConfig;

  layoutSuggestions: string[];

  tips: string[];
}

export const SEATS_BY_TABLE: Record<TableShape, Record<number, number>> = {
  round: {
    4: 4,
    5: 6,
    6: 8,
    7: 10,
    8: 12,
  },
  rectangular: {
    6: 6,
    8: 8,
    10: 10,
    12: 12,
  },
  square: {
    3: 4,
    4: 8,
  },
  cocktail: {
    2: 4,
    3: 6,
  },
};

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
