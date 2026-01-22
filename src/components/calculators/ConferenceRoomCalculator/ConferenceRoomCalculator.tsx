/**
 * Conference Room Calculator - React Component
 *
 * Calculate room capacity and setup requirements.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateConferenceRoom } from './calculations';
import {
  getDefaultInputs,
  type ConferenceRoomInputs,
  type SeatingStyle,
  type RoomShape,
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
const SEATING_STYLE_OPTIONS = [
  { value: 'theater', label: 'Theater' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'banquet', label: 'Banquet' },
  { value: 'u_shape', label: 'U-Shape' },
  { value: 'boardroom', label: 'Boardroom' },
  { value: 'cocktail', label: 'Cocktail' },
];

const ROOM_SHAPE_OPTIONS = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'square', label: 'Square' },
];

export default function ConferenceRoomCalculator() {
  // Track calculator usage for analytics
  useCalculatorTracking('Conference Room Calculator');

  const [inputs, setInputs] = useState<ConferenceRoomInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateConferenceRoom(inputs), [inputs]);

  const updateInput = <K extends keyof ConferenceRoomInputs>(
    field: K,
    value: ConferenceRoomInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ThemeProvider defaultColor="blue">
      <Card variant="elevated">
        <CalculatorHeader
          title="Conference Room Calculator"
          subtitle="Calculate room capacity and setup requirements"
        />

        <div className="p-6 md:p-8">
          <Grid responsive={{ sm: 1, lg: 2 }} gap="lg">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Room Dimensions
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Room Length"
                  value={inputs.roomLength}
                  onChange={(value) => updateInput('roomLength', value)}
                  min={15}
                  max={100}
                  step={5}
                  showValue
                  labels={{
                    min: '15 ft',
                    max: '100 ft',
                    current: (v) => `${v} feet`,
                  }}
                />
                <Slider
                  label="Room Width"
                  value={inputs.roomWidth}
                  onChange={(value) => updateInput('roomWidth', value)}
                  min={15}
                  max={80}
                  step={5}
                  showValue
                  labels={{
                    min: '15 ft',
                    max: '80 ft',
                    current: (v) => `${v} feet`,
                  }}
                />
              </Grid>

              {/* Room Shape */}
              <div>
                <Label>Room Shape</Label>
                <ButtonGroup
                  options={ROOM_SHAPE_OPTIONS}
                  value={inputs.roomShape}
                  onChange={(value) => updateInput('roomShape', value as RoomShape)}
                />
              </div>

              {/* Seating Style */}
              <div>
                <Label>Seating Style</Label>
                <ButtonGroup
                  options={SEATING_STYLE_OPTIONS}
                  value={inputs.seatingStyle}
                  onChange={(value) => updateInput('seatingStyle', value as SeatingStyle)}
                />
              </div>

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Spacing Requirements
              </div>

              <Grid responsive={{ sm: 2 }} gap="md">
                <Slider
                  label="Aisle Width"
                  value={inputs.aisleWidth}
                  onChange={(value) => updateInput('aisleWidth', value)}
                  min={3}
                  max={8}
                  showValue
                  labels={{
                    min: '3 ft',
                    max: '8 ft',
                    current: (v) => `${v} feet`,
                  }}
                />
                <Slider
                  label="Wall Clearance"
                  value={inputs.wallClearance}
                  onChange={(value) => updateInput('wallClearance', value)}
                  min={2}
                  max={6}
                  showValue
                  labels={{
                    min: '2 ft',
                    max: '6 ft',
                    current: (v) => `${v} feet`,
                  }}
                />
              </Grid>

              {/* Stage/Presenter Area */}
              <Toggle
                checked={inputs.stageOrPresenterArea}
                onChange={(checked) => updateInput('stageOrPresenterArea', checked)}
                label="Stage/Presenter Area"
                size="sm"
              />

              {inputs.stageOrPresenterArea && (
                <Slider
                  label="Stage Depth"
                  value={inputs.stageDepth}
                  onChange={(value) => updateInput('stageDepth', value)}
                  min={4}
                  max={15}
                  showValue
                  labels={{
                    min: '4 ft',
                    max: '15 ft',
                    current: (v) => `${v} feet`,
                  }}
                />
              )}

              <Divider />

              <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                Equipment & Options
              </div>

              {[
                { key: 'includeProjectorScreen', label: 'Projector & Screen' },
                { key: 'includeWhiteboard', label: 'Whiteboard' },
                { key: 'includePodium', label: 'Podium/Lectern' },
                { key: 'adaAccessible', label: 'ADA Accessible' },
              ].map(({ key, label }) => (
                <Toggle
                  key={key}
                  checked={!!inputs[key as keyof ConferenceRoomInputs]}
                  onChange={(checked) => updateInput(key as keyof ConferenceRoomInputs, checked)}
                  label={label}
                  size="sm"
                />
              ))}
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultCard
                label="Maximum Capacity"
                value={`${result.primaryCapacity} people`}
                subtitle={`${result.primaryStyle} style seating`}
              />

              <Grid responsive={{ sm: 2, md: 4 }} gap="md">
                <MetricCard
                  label="Total Space"
                  value={`${result.totalSqFt.toLocaleString()}`}
                  sublabel="sq ft"
                />
                <MetricCard
                  label="Usable Space"
                  value={`${result.usableSqFt.toLocaleString()}`}
                  sublabel="sq ft"
                />
                <MetricCard
                  label="Sq Ft/Person"
                  value={`${Math.round(result.usableSqFt / Math.max(1, result.primaryCapacity))}`}
                  sublabel="per attendee"
                />
                {result.layoutInfo.tableCount && (
                  <MetricCard
                    label="Tables Needed"
                    value={`${result.layoutInfo.tableCount}`}
                    sublabel="tables"
                  />
                )}
              </Grid>

              {/* Capacity by Style Comparison */}
              <div className="bg-cyan-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-cyan-700 uppercase tracking-wider mb-4">
                  Capacity by Seating Style
                </h3>
                <div className="space-y-2">
                  {result.capacitiesByStyle.slice(0, 6).map((style, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-cyan-200 last:border-0"
                    >
                      <div>
                        <span className="font-medium text-cyan-800">{style.style}</span>
                        <p className="text-xs text-cyan-600">{style.notes}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-cyan-700">{style.capacity} people</span>
                        <p className="text-xs text-cyan-600">{style.sqFtPerPerson} sq ft/person</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials Needed */}
              <div className="bg-[var(--color-night)] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                  Materials Needed
                </h3>
                <div className="space-y-2">
                  {result.materials.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <span className="text-[var(--color-cream)] font-medium">{item.item}</span>
                        <p className="text-xs text-[var(--color-muted)]">{item.notes}</p>
                      </div>
                      <span className="text-cyan-400 font-semibold whitespace-nowrap">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Setup */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-4">
                  Recommended Setup: {result.recommendedSetup}
                </h3>
                <ul className="space-y-2">
                  {result.setupNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-blue-600">-</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <Alert variant="tip" title="Setup Tips">
                <ul className="space-y-2 mt-2">
                  {result.tips.slice(0, 4).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-400">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Alert>

              {/* Share Results */}
              <div className="flex justify-center pt-4">
                <ShareResults
                  result={`Conference Room: ${inputs.roomLength}' x ${inputs.roomWidth}' = ${result.totalSqFt} sq ft. ${result.primaryStyle} capacity: ${result.primaryCapacity} people. Recommended: ${result.recommendedSetup}`}
                  calculatorName="Conference Room Calculator"
                />
              </div>
            </div>
          </Grid>
        </div>
      </Card>
    </ThemeProvider>
  );
}
