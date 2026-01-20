/**
 * Conference Room Calculator - Type Definitions
 *
 * Calculate room capacity and setup requirements for meetings and events.
 */

export type SeatingStyle =
  | 'theater'
  | 'classroom'
  | 'banquet'
  | 'u_shape'
  | 'hollow_square'
  | 'boardroom'
  | 'cocktail';

export type RoomShape = 'rectangular' | 'square' | 'l_shaped';

export interface ConferenceRoomInputs {
  roomLength: number; // feet
  roomWidth: number; // feet
  roomShape: RoomShape;
  seatingStyle: SeatingStyle;

  // Spacing requirements
  aisleWidth: number; // feet
  wallClearance: number; // feet
  stageOrPresenterArea: boolean;
  stageDepth: number; // feet

  // Equipment
  includeProjectorScreen: boolean;
  includeWhiteboard: boolean;
  includePodium: boolean;
  includeBreakoutTables: boolean;
  breakoutTableCount: number;

  // ADA Compliance
  adaAccessible: boolean;
}

export interface CapacityResult {
  style: string;
  capacity: number;
  sqFtPerPerson: number;
  notes: string;
}

export interface SetupRequirement {
  item: string;
  quantity: number;
  unit: string;
  notes: string;
}

export interface ConferenceRoomResult {
  // Room info
  totalSqFt: number;
  usableSqFt: number;

  // Capacity by selected style
  primaryCapacity: number;
  primaryStyle: string;

  // All style capacities for comparison
  capacitiesByStyle: CapacityResult[];

  // Recommended setup
  recommendedSetup: string;
  setupNotes: string[];

  // Materials needed
  materials: SetupRequirement[];

  // Layout dimensions
  layoutInfo: {
    rows: number;
    seatsPerRow: number;
    rowSpacing: number;
    tableCount?: number;
  };

  // Tips
  tips: string[];
}

// Square feet per person by seating style
export const SQFT_PER_PERSON: Record<SeatingStyle, number> = {
  theater: 6, // chairs only, tightly packed
  classroom: 18, // 6ft tables with chairs
  banquet: 12, // round tables with chairs
  u_shape: 25, // tables in U formation
  hollow_square: 25, // tables in square formation
  boardroom: 25, // single large table
  cocktail: 8, // standing, mingling
};

// Style descriptions
export const STYLE_DESCRIPTIONS: Record<SeatingStyle, string> = {
  theater: 'Rows of chairs facing front, no tables',
  classroom: '6ft tables with chairs, all facing front',
  banquet: 'Round tables (8-10 per table) for meals/discussion',
  u_shape: 'Tables in U formation, open to presenter',
  hollow_square: 'Tables in square/rectangle, open center',
  boardroom: 'Single large table, executive style',
  cocktail: 'Standing room, high-top tables optional',
};

export function getDefaultInputs(): ConferenceRoomInputs {
  return {
    roomLength: 40,
    roomWidth: 30,
    roomShape: 'rectangular',
    seatingStyle: 'classroom',
    aisleWidth: 4,
    wallClearance: 3,
    stageOrPresenterArea: true,
    stageDepth: 6,
    includeProjectorScreen: true,
    includeWhiteboard: true,
    includePodium: true,
    includeBreakoutTables: false,
    breakoutTableCount: 2,
    adaAccessible: true,
  };
}

export const DEFAULT_INPUTS: ConferenceRoomInputs = getDefaultInputs();
