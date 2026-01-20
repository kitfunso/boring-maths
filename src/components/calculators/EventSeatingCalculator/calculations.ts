/**
 * Event Seating Calculator - Calculation Logic
 */

import type {
  EventSeatingInputs,
  EventSeatingResult,
  SpaceRequirement,
  TableConfig,
} from './types';
import { SEATS_BY_TABLE, SQFT_PER_PERSON } from './types';

export function calculateEventSeating(inputs: EventSeatingInputs): EventSeatingResult {
  const {
    guestCount,
    tableShape,
    tableSize,
    eventType,
    danceFloorPercent,
    includeDJSpace,
    includeBuffetArea,
    includeHeadTable,
    headTableGuests,
    tableSpacing,
    aisleWidth,
  } = inputs;

  const spaceRequirements: SpaceRequirement[] = [];

  // Get seats per table
  const seatOptions = SEATS_BY_TABLE[tableShape];
  const availableSizes = Object.keys(seatOptions).map(Number);
  const actualSize = availableSizes.includes(tableSize)
    ? tableSize
    : availableSizes[Math.floor(availableSizes.length / 2)];
  const seatsPerTable = seatOptions[actualSize];

  // Calculate guests for regular tables (minus head table if applicable)
  const regularGuests = includeHeadTable ? guestCount - headTableGuests : guestCount;

  // Calculate tables needed
  const tablesNeeded = Math.ceil(regularGuests / seatsPerTable);
  const totalSeats = tablesNeeded * seatsPerTable + (includeHeadTable ? headTableGuests : 0);
  const extraSeats = totalSeats - guestCount;

  // Calculate table footprint (table + chairs + spacing)
  let tableFootprint: number;
  if (tableShape === 'round') {
    // Round table: diameter + 2 feet on each side for chairs + spacing
    const totalDiameter = actualSize + 4; // chairs extend ~2ft
    tableFootprint = Math.PI * Math.pow(totalDiameter / 2, 2);
  } else if (tableShape === 'rectangular') {
    // Rectangular: length x (width + chairs both sides)
    const width = 2.5; // standard width
    tableFootprint = (actualSize + 4) * (width + 4);
  } else if (tableShape === 'square') {
    tableFootprint = Math.pow(actualSize + 4, 2);
  } else {
    // Cocktail - standing
    tableFootprint = Math.PI * Math.pow((actualSize + 2) / 2, 2);
  }

  // Add table spacing buffer
  const tableWithSpacing = tableFootprint + tableSpacing * tableSpacing;

  // Seating area
  const seatingAreaSqFt = Math.ceil(tablesNeeded * tableWithSpacing);
  spaceRequirements.push({
    area: 'Guest Seating',
    sqFt: seatingAreaSqFt,
    dimensions: `${Math.ceil(Math.sqrt(seatingAreaSqFt))}' x ${Math.ceil(Math.sqrt(seatingAreaSqFt))}'`,
    notes: `${tablesNeeded} ${tableShape} tables, ${seatsPerTable} seats each`,
  });

  // Head table
  let headTableSqFt = 0;
  if (includeHeadTable) {
    headTableSqFt = headTableGuests * 8; // 8 sqft per person at head table
    spaceRequirements.push({
      area: 'Head Table',
      sqFt: headTableSqFt,
      dimensions: `${Math.ceil(headTableGuests * 2.5)}' x 4'`,
      notes: `${headTableGuests} guests in a row`,
    });
  }

  // Dance floor
  const baseSqFt = SQFT_PER_PERSON[eventType] * guestCount;
  const danceFloorSqFt = Math.ceil((baseSqFt * danceFloorPercent) / 100);
  if (danceFloorPercent > 0) {
    const danceSize = Math.ceil(Math.sqrt(danceFloorSqFt));
    spaceRequirements.push({
      area: 'Dance Floor',
      sqFt: danceFloorSqFt,
      dimensions: `${danceSize}' x ${danceSize}'`,
      notes: `${danceFloorPercent}% of guests dancing at once`,
    });
  }

  // DJ/Band area
  let djAreaSqFt = 0;
  if (includeDJSpace) {
    djAreaSqFt = guestCount < 100 ? 100 : guestCount < 200 ? 150 : 200;
    spaceRequirements.push({
      area: 'DJ/Band Area',
      sqFt: djAreaSqFt,
      dimensions: `${Math.ceil(Math.sqrt(djAreaSqFt))}' x ${Math.ceil(Math.sqrt(djAreaSqFt))}'`,
      notes: 'Equipment and performance space',
    });
  }

  // Buffet area
  let buffetAreaSqFt = 0;
  if (includeBuffetArea) {
    // 1 linear foot of buffet per 10 guests, 3ft depth, double-sided
    const buffetLength = Math.ceil(guestCount / 10);
    buffetAreaSqFt = buffetLength * 6 + 100; // Add queue space
    spaceRequirements.push({
      area: 'Buffet Area',
      sqFt: buffetAreaSqFt,
      dimensions: `${buffetLength}' x ${6 + Math.ceil(100 / buffetLength)}'`,
      notes: 'Including queue space',
    });
  }

  // Aisles and circulation
  const aislesSqFt = Math.ceil((seatingAreaSqFt + headTableSqFt) * 0.2);
  spaceRequirements.push({
    area: 'Aisles & Circulation',
    sqFt: aislesSqFt,
    dimensions: `${aisleWidth}' wide aisles`,
    notes: '20% of seating area for movement',
  });

  // Total room size
  const totalRoomSqFt =
    seatingAreaSqFt + headTableSqFt + danceFloorSqFt + djAreaSqFt + buffetAreaSqFt + aislesSqFt;

  // Calculate room dimensions (assume roughly rectangular)
  const aspectRatio = 1.3; // slightly rectangular
  const minimumRoomWidth = Math.ceil(Math.sqrt(totalRoomSqFt / aspectRatio));
  const minimumRoomLength = Math.ceil(minimumRoomWidth * aspectRatio);

  // Table configuration
  const tableConfig: TableConfig = {
    type: `${actualSize}ft ${tableShape}`,
    seatsPerTable,
    tablesNeeded,
    totalSeats,
    tableFootprint: Math.round(tableWithSpacing),
  };

  // Layout suggestions
  const layoutSuggestions: string[] = [];

  if (tablesNeeded <= 10) {
    layoutSuggestions.push('Small event: Single-row layout along walls works well');
  } else if (tablesNeeded <= 20) {
    layoutSuggestions.push('Medium event: Consider 4-5 rows of tables');
  } else {
    layoutSuggestions.push('Large event: Use multiple sections with clear aisles');
  }

  if (includeDJSpace && danceFloorPercent > 0) {
    layoutSuggestions.push('Place dance floor adjacent to DJ area for best flow');
  }

  if (includeBuffetArea) {
    layoutSuggestions.push('Position buffet near kitchen/service entrance');
    layoutSuggestions.push('Create clear path from tables to buffet');
  }

  if (includeHeadTable) {
    layoutSuggestions.push('Head table should face all guest tables');
    layoutSuggestions.push('Consider elevated platform for head table visibility');
  }

  const rows = Math.ceil(Math.sqrt(tablesNeeded));
  const cols = Math.ceil(tablesNeeded / rows);
  layoutSuggestions.push(`Suggested grid: ${rows} rows x ${cols} tables per row`);

  // Tips
  const tips: string[] = [];

  if (tableShape === 'round') {
    tips.push('Round tables encourage conversation among all guests');
  } else if (tableShape === 'rectangular') {
    tips.push('Long rectangular tables create a formal, elegant feel');
  }

  if (guestCount > 150) {
    tips.push('For large events, consider multiple buffet stations');
  }

  tips.push(`Allow ${tableSpacing}ft minimum between table edges`);
  tips.push('Ensure clear 5ft path to emergency exits');
  tips.push('Consider sightlines to stage/head table from all seats');

  if (eventType === 'wedding') {
    tips.push('Place older guests away from speakers');
  }

  return {
    tablesNeeded,
    seatsPerTable,
    totalSeats,
    extraSeats,
    totalRoomSqFt,
    minimumRoomLength,
    minimumRoomWidth,
    seatingAreaSqFt,
    danceFloorSqFt,
    djAreaSqFt,
    buffetAreaSqFt,
    aislesSqFt,
    spaceRequirements,
    tableConfig,
    layoutSuggestions,
    tips,
  };
}
