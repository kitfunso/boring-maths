/**
 * Event Seating Calculator - React Component
 *
 * Calculate table and room requirements for events.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateEventSeating } from './calculations';
import {
  getDefaultInputs,
  type EventSeatingInputs,
  type TableShape,
  type EventType,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Slider,
  Grid,
  Divider,
  ResultCard,
  MetricCard,
  Alert,
  ButtonGroup,
  Toggle,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

import { useCalculatorTracking } from '../../../hooks/useCalculatorTracking';
const TABLE_SHAPE_OPTIONS = [
  { value: 'round', label: 'Round' },
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'square', label: 'Square' },
  { value: 'cocktail', label: 'Cocktail' },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'banquet', label: 'Banquet' },
  { value: 'conference', label: 'Conference' },
  { value: 'party', label: 'Party' },
];

const TABLE_SIZE_OPTIONS: Record<TableShape, { value: number; label: string }[]> = {
  round: [
    { value: 4, label: '4ft (4 seats)' },
    { value: 5, label: '5ft (6 seats)' },
    { value: 6, label: '6ft (8 seats)' },
    { value: 7, label: '7ft (10 seats)' },
    { value: 8, label: '8ft (12 seats)' },
  ],
  rectangular: [
    { value: 6, label: '6ft (6 seats)' },
    { value: 8, label: '8ft (8 seats)' },
    { value: 10, label: '10ft (10 seats)' },
    { value: 12, label: '12ft (12 seats)' },
  ],
  square: [
    { value: 3, label: '3ft (4 seats)' },
    { value: 4, label: '4ft (8 seats)' },
  ],
  cocktail: [
    { value: 2, label: '2ft (4 standing)' },
    { value: 3, label: '3ft (6 standing)' },
  ],
};

export default function EventSeatingCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Event Seating Calculator');

  const [inputs, setInputs] = useState<EventSeatingInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateEventSeating(inputs), [inputs]);

  const updateInput = <K extends keyof EventSeatingInputs>(
    field: K,
    value: EventSeatingInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleTableShapeChange = (shape: TableShape) => {
    const sizes = TABLE_SIZE_OPTIONS[shape];
    const defaultSize = sizes[Math.floor(sizes.length / 2)].value;
    setInputs((prev) => ({
      ...prev,
      tableShape: shape,
      tableSize: defaultSize,
    }));
  };

  return (
    <ThemeProvider defaultColor="purple">
      <Card variant="elevated">
        <CalculatorHeader
          title="Event Seating Calculator"
          subtitle="Plan your venue layout and table arrangement"
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Event Details
              </div>

              <Slider
                label="Number of Guests"
                value={inputs.guestCount}
                onChange={(value) => updateInput('guestCount', value)}
                min={10}
                max={500}
                step={5}
                showValue
                labels={{
                  min: '10',
                  max: '500',
                  current: (v) => `${v} guests`,
                }}
              />

              {/* Event Type */}
              <div>
                <Label>Event Type</Label>
                <ButtonGroup
                  options={EVENT_TYPE_OPTIONS}
                  value={inputs.eventType}
                  onChange={(value) => updateInput('eventType', value as EventType)}
                />
              </div>

              {/* Table Shape */}
              <div>
                <Label>Table Shape</Label>
                <ButtonGroup
                  options={TABLE_SHAPE_OPTIONS}
                  value={inputs.tableShape}
                  onChange={(value) => handleTableShapeChange(value as TableShape)}
                />
              </div>

              {/* Table Size */}
              <div>
                <Label>Table Size</Label>
                <ButtonGroup
                  options={TABLE_SIZE_OPTIONS[inputs.tableShape]}
                  value={inputs.tableSize}
                  onChange={(value) => updateInput('tableSize', value as number)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Additional Spaces
              </div>

              <Slider
                label="Dance Floor"
                value={inputs.danceFloorPercent}
                onChange={(value) => updateInput('danceFloorPercent', value)}
                min={0}
                max={40}
                step={5}
                showValue
                labels={{
                  min: '0%',
                  max: '40%',
                  current: (v) => `${v}% of space`,
                }}
              />

              {[
                { key: 'includeDJSpace', label: 'DJ/Band Area' },
                { key: 'includeBuffetArea', label: 'Buffet Area' },
                { key: 'includeHeadTable', label: 'Head Table' },
              ].map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={!!inputs[key as keyof EventSeatingInputs]}
                  onChange={(checked) => updateInput(key as keyof EventSeatingInputs, checked)}
                  label={label}
                  size="sm"
                />
              ))}

              {inputs.includeHeadTable && (
                <Slider
                  label="Head Table Guests"
                  value={inputs.headTableGuests}
                  onChange={(value) => updateInput('headTableGuests', value)}
                  min={4}
                  max={20}
                  showValue
                  labels={{
                    min: '4',
                    max: '20',
                    current: (v) => `${v} guests`,
                  }}
                />
              )}

              <Divider />

              <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Spacing
              </div>

              <Slider
                label="Table Spacing"
                value={inputs.tableSpacing}
                onChange={(value) => updateInput('tableSpacing', value)}
                min={4}
                max={10}
                showValue
                labels={{
                  min: '4ft',
                  max: '10ft',
                  current: (v) => `${v} feet`,
                }}
              />

              <Slider
                label="Aisle Width"
                value={inputs.aisleWidth}
                onChange={(value) => updateInput('aisleWidth', value)}
                min={3}
                max={8}
                showValue
                labels={{
                  min: '3ft',
                  max: '8ft',
                  current: (v) => `${v} feet`,
                }}
              />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Minimum Room Size"
                value={`${result.totalRoomSqFt.toLocaleString()} sq ft`}
                subtitle={`${result.minimumRoomLength}' x ${result.minimumRoomWidth}' recommended`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard label="Tables Needed" value={`${result.tablesNeeded}`} />
                <MetricCard label="Seats/Table" value={`${result.seatsPerTable}`} />
                <MetricCard label="Total Seats" value={`${result.totalSeats}`} />
                <MetricCard label="Extra Seats" value={`+${result.extraSeats}`} />
              </Grid>

              {/* Space Breakdown */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Space Breakdown
                </h3>
                <div className="space-y-3">
                  {result.spaceRequirements.map((space, index) => {
                    const percent = Math.round((space.sqFt / result.totalRoomSqFt) * 100);
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[var(--color-cream)]">{space.area}</span>
                          <span className="text-purple-400 font-semibold">
                            {space.sqFt.toLocaleString()} sq ft
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-[var(--color-muted)]">{space.notes}</span>
                          <span className="text-xs text-[var(--color-muted)]">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table Configuration */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-4">
                  Table Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-purple-600">Table Type</p>
                    <p className="text-lg font-bold text-purple-800">{result.tableConfig.type}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-purple-600">Space per Table</p>
                    <p className="text-lg font-bold text-purple-800">
                      {result.tableConfig.tableFootprint} sq ft
                    </p>
                  </div>
                </div>
              </div>

              {/* Layout Suggestions */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Layout Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.layoutSuggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[var(--color-cream)]"
                    >
                      <span className="text-purple-400 mt-0.5">-</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Venue Planning Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Event Seating: ${inputs.guestCount} guests need ${result.tablesNeeded} ${inputs.tableShape} tables in ${result.totalRoomSqFt.toLocaleString()} sq ft (${result.minimumRoomLength}' x ${result.minimumRoomWidth}')`}
                  calculatorName="Event Seating Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
