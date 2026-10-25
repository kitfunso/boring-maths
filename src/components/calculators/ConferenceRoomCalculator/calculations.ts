/**
 * Conference Room Calculator - Calculation Logic
 */

import type {
  ConferenceRoomInputs,
  ConferenceRoomResult,
  CapacityResult,
  SetupRequirement,
  SeatingStyle,
} from './types';
import { SQFT_PER_PERSON, STYLE_DESCRIPTIONS } from './types';

// n items of size s with gap g between them need n*s + (n-1)*g of span
function fitCount(span: number, size: number, gap: number): number {
  return Math.max(0, Math.floor((span + gap) / (size + gap)));
}

const CLASSROOM_TABLE = { length: 6, gap: 1, seats: 2, rowDepth: 5 };
const BANQUET_TABLE = { diameter: 6, gap: 4, seats: 8 };

/** Seats the table grid physically holds, so a table count never exceeds what fits; Infinity where area alone sizes the room. */
function gridSeats(
  style: SeatingStyle,
  effectiveWidth: number,
  seatingLength: number,
  aisleWidth: number
): number {
  if (style === 'classroom') {
    const perSide = fitCount(
      (effectiveWidth - aisleWidth) / 2,
      CLASSROOM_TABLE.length,
      CLASSROOM_TABLE.gap
    );
    const rows = Math.floor(seatingLength / CLASSROOM_TABLE.rowDepth);
    return rows * perSide * 2 * CLASSROOM_TABLE.seats;
  }
  if (style === 'banquet') {
    const across = fitCount(effectiveWidth, BANQUET_TABLE.diameter, BANQUET_TABLE.gap);
    const deep = fitCount(seatingLength, BANQUET_TABLE.diameter, BANQUET_TABLE.gap);
    return across * deep * BANQUET_TABLE.seats;
  }
  return Infinity;
}

export function calculateConferenceRoom(inputs: ConferenceRoomInputs): ConferenceRoomResult {
  const {
    roomLength,
    roomWidth,
    seatingStyle,
    aisleWidth,
    wallClearance,
    stageOrPresenterArea,
    stageDepth,
    includeProjectorScreen,
    includeWhiteboard,
    includePodium,
    includeBreakoutTables,
    breakoutTableCount,
    adaAccessible,
  } = inputs;

  // Calculate total and usable square footage
  const totalSqFt = roomLength * roomWidth;

  // Subtract clearances
  const effectiveLength = roomLength - 2 * wallClearance;
  const effectiveWidth = Math.max(0, roomWidth - 2 * wallClearance);

  // Subtract stage/presenter area if applicable
  const presentationDepth = stageOrPresenterArea ? stageDepth : 0;
  const seatingLength = Math.max(0, effectiveLength - presentationDepth);

  // Calculate usable area for seating
  let usableSqFt = seatingLength * effectiveWidth;

  // Subtract center aisle for theater/classroom
  if (seatingStyle === 'theater' || seatingStyle === 'classroom') {
    usableSqFt -= aisleWidth * seatingLength;
  }

  // Subtract breakout table area
  if (includeBreakoutTables) {
    usableSqFt -= breakoutTableCount * 36; // ~36 sqft per breakout table
  }

  // ADA requires additional space (5%)
  usableSqFt = Math.max(0, usableSqFt);
  if (adaAccessible) {
    usableSqFt *= 0.95;
  }

  // Calculate capacity for primary style
  const sqFtPerPerson = SQFT_PER_PERSON[seatingStyle];
  const primaryCapacity = Math.min(
    Math.floor(usableSqFt / sqFtPerPerson),
    gridSeats(seatingStyle, effectiveWidth, seatingLength, aisleWidth)
  );

  // Calculate capacities for all styles
  const capacitiesByStyle: CapacityResult[] = (Object.keys(SQFT_PER_PERSON) as SeatingStyle[]).map(
    (style) => {
      let styleUsableSqFt = seatingLength * effectiveWidth;

      // Adjust for style-specific requirements
      if (style === 'theater' || style === 'classroom') {
        styleUsableSqFt -= aisleWidth * seatingLength;
      }

      styleUsableSqFt = Math.max(0, styleUsableSqFt);
      if (adaAccessible) {
        styleUsableSqFt *= 0.95;
      }

      const capacity = Math.min(
        Math.floor(styleUsableSqFt / SQFT_PER_PERSON[style]),
        gridSeats(style, effectiveWidth, seatingLength, aisleWidth)
      );

      return {
        style: style.replace('_', '-').charAt(0).toUpperCase() + style.replace('_', '-').slice(1),
        capacity: Math.max(0, capacity),
        sqFtPerPerson: SQFT_PER_PERSON[style],
        notes: STYLE_DESCRIPTIONS[style],
      };
    }
  );

  // Sort by capacity descending
  capacitiesByStyle.sort((a, b) => b.capacity - a.capacity);

  // Calculate layout dimensions for primary style
  let layoutInfo: ConferenceRoomResult['layoutInfo'];

  if (seatingStyle === 'theater') {
    const seatsPerRow = Math.floor((effectiveWidth - aisleWidth) / 2); // chairs ~2ft wide
    const rows = Math.floor(seatingLength / 3); // 3ft row spacing
    layoutInfo = {
      rows,
      seatsPerRow: seatsPerRow * 2, // both sides of aisle
      rowSpacing: 3,
    };
  } else if (seatingStyle === 'classroom') {
    const tablesPerSide = fitCount(
      (effectiveWidth - aisleWidth) / 2,
      CLASSROOM_TABLE.length,
      CLASSROOM_TABLE.gap
    );
    layoutInfo = {
      rows: Math.floor(seatingLength / CLASSROOM_TABLE.rowDepth),
      seatsPerRow: tablesPerSide * 2 * CLASSROOM_TABLE.seats, // both sides of the aisle
      rowSpacing: CLASSROOM_TABLE.rowDepth,
      tableCount: Math.ceil(primaryCapacity / CLASSROOM_TABLE.seats),
    };
  } else if (seatingStyle === 'banquet') {
    const { diameter, gap, seats } = BANQUET_TABLE;
    layoutInfo = {
      rows: fitCount(seatingLength, diameter, gap),
      seatsPerRow: fitCount(effectiveWidth, diameter, gap) * seats,
      rowSpacing: diameter + gap,
      tableCount: Math.ceil(primaryCapacity / seats),
    };
  } else if (seatingStyle === 'u_shape') {
    // U-shape: tables along 3 walls
    const tableLength = 6;
    const bottomTables = Math.floor(effectiveWidth / tableLength);
    const sideTables = Math.floor(seatingLength / tableLength) * 2;
    layoutInfo = {
      rows: 1,
      seatsPerRow: (bottomTables + sideTables) * 2, // 2 per table (outside only)
      rowSpacing: 0,
      tableCount: bottomTables + sideTables,
    };
  } else if (seatingStyle === 'hollow_square') {
    const tableLength = 6;
    const longSideTables = Math.floor(seatingLength / tableLength) * 2;
    const shortSideTables = Math.floor(effectiveWidth / tableLength) * 2;
    layoutInfo = {
      rows: 1,
      seatsPerRow: (longSideTables + shortSideTables) * 2,
      rowSpacing: 0,
      tableCount: longSideTables + shortSideTables,
    };
  } else if (seatingStyle === 'boardroom') {
    // Single large table
    const tableLength2 = Math.min(seatingLength - 4, 20);
    const seatsLong = Math.floor(tableLength2 / 2.5) * 2; // both long sides
    const seatsShort = 2; // ends
    layoutInfo = {
      rows: 1,
      seatsPerRow: seatsLong + seatsShort,
      rowSpacing: 0,
      tableCount: 1,
    };
  } else {
    // Cocktail
    const highTopTables = Math.floor(usableSqFt / 36); // one high-top per 36 sqft
    layoutInfo = {
      rows: 0,
      seatsPerRow: 0,
      rowSpacing: 0,
      tableCount: highTopTables,
    };
  }

  // Build materials list
  const materials: SetupRequirement[] = [];

  if (seatingStyle === 'theater') {
    materials.push({
      item: 'Chairs',
      quantity: primaryCapacity,
      unit: 'chairs',
      notes: 'Stackable chairs recommended',
    });
  } else if (seatingStyle === 'classroom') {
    materials.push({
      item: '6ft Rectangular Tables',
      quantity: layoutInfo.tableCount || Math.ceil(primaryCapacity / 2),
      unit: 'tables',
      notes: '2 seats per table',
    });
    materials.push({
      item: 'Chairs',
      quantity: primaryCapacity,
      unit: 'chairs',
      notes: 'One per attendee',
    });
  } else if (seatingStyle === 'banquet') {
    materials.push({
      item: '60" Round Tables',
      quantity: layoutInfo.tableCount || Math.ceil(primaryCapacity / 8),
      unit: 'tables',
      notes: '8-10 seats per table',
    });
    materials.push({
      item: 'Chairs',
      quantity: primaryCapacity,
      unit: 'chairs',
      notes: 'Banquet chairs',
    });
  } else if (seatingStyle === 'u_shape' || seatingStyle === 'hollow_square') {
    materials.push({
      item: '6ft Rectangular Tables',
      quantity: layoutInfo.tableCount || Math.ceil(primaryCapacity / 2),
      unit: 'tables',
      notes: 'For perimeter setup',
    });
    materials.push({
      item: 'Chairs',
      quantity: primaryCapacity,
      unit: 'chairs',
      notes: 'Outside seating only',
    });
  } else if (seatingStyle === 'boardroom') {
    materials.push({
      item: 'Conference Table',
      quantity: 1,
      unit: 'table',
      notes: `${Math.min(seatingLength - 4, 20)}ft x ${Math.min(5, effectiveWidth * 0.4)}ft`,
    });
    materials.push({
      item: 'Executive Chairs',
      quantity: primaryCapacity,
      unit: 'chairs',
      notes: 'High-back rolling chairs',
    });
  } else {
    // Cocktail
    materials.push({
      item: 'High-Top Tables',
      quantity: layoutInfo.tableCount || Math.floor(primaryCapacity / 4),
      unit: 'tables',
      notes: '4 standing per table',
    });
  }

  // Add equipment
  if (includeProjectorScreen) {
    materials.push({
      item: 'Projector Screen',
      quantity: 1,
      unit: 'screen',
      notes: `${roomWidth > 25 ? '120"' : '100"'} diagonal recommended`,
    });
    materials.push({
      item: 'Projector',
      quantity: 1,
      unit: 'unit',
      notes: `${roomLength > 30 ? '5000+' : '3000+'} lumens`,
    });
  }

  if (includeWhiteboard) {
    materials.push({
      item: 'Whiteboard',
      quantity: roomWidth > 25 ? 2 : 1,
      unit: 'board(s)',
      notes: '4ft x 6ft recommended',
    });
  }

  if (includePodium) {
    materials.push({
      item: 'Podium/Lectern',
      quantity: 1,
      unit: 'podium',
      notes: 'With microphone mount',
    });
  }

  if (includeBreakoutTables) {
    materials.push({
      item: 'Breakout Tables',
      quantity: breakoutTableCount,
      unit: 'tables',
      notes: 'For small group work',
    });
  }

  // Determine recommended setup
  let recommendedSetup = '';
  const setupNotes: string[] = [];

  if (primaryCapacity < 10) {
    recommendedSetup = 'Boardroom';
    setupNotes.push('Small groups work best around a single table');
    setupNotes.push('Encourages discussion and collaboration');
  } else if (primaryCapacity < 25) {
    recommendedSetup = 'U-Shape or Hollow Square';
    setupNotes.push('Good for workshops and interactive sessions');
    setupNotes.push('Everyone can see each other');
  } else if (primaryCapacity < 50) {
    recommendedSetup = 'Classroom';
    setupNotes.push('Ideal for training and presentations');
    setupNotes.push('Attendees have writing surface');
  } else {
    recommendedSetup = 'Theater';
    setupNotes.push('Maximum capacity for large presentations');
    setupNotes.push('Best for one-way communication');
  }

  // Tips
  const tips: string[] = [];

  tips.push('Allow 18-24" of table space per person for comfortable seating');
  tips.push('Main aisles should be at least 4ft wide for safety and flow');

  if (adaAccessible) {
    tips.push('Reserve front row seats for wheelchair users with clear sightlines');
    tips.push('Ensure aisles are at least 36" wide for wheelchair access');
  }

  if (seatingStyle === 'theater' && primaryCapacity > 100) {
    tips.push('Consider adding a center aisle for rooms over 100 theater-style');
  }

  tips.push('Test audiovisual equipment before the event');
  tips.push('Have a backup plan if technology fails');

  return {
    totalSqFt,
    usableSqFt: Math.round(usableSqFt),
    primaryCapacity: Math.max(0, primaryCapacity),
    primaryStyle:
      seatingStyle.replace('_', '-').charAt(0).toUpperCase() +
      seatingStyle.replace('_', '-').slice(1),
    capacitiesByStyle,
    recommendedSetup,
    setupNotes,
    materials,
    layoutInfo,
    tips,
  };
}
