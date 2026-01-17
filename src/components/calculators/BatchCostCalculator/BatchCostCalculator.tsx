/**
 * Batch Cost Calculator Component
 * Calculate material costs, labor, and pricing for crafts
 */

import { useState, useMemo } from 'preact/hooks';
import { ResultCard, Input, Select, Slider } from '../../ui';
import type { BatchCostInputs, MaterialItem } from './types';
import {
  MATERIAL_PRESETS,
  DEFAULT_UNITS,
  CRAFT_TYPES,
  MATERIAL_UNITS,
  MARGIN_PRESETS,
  OVERHEAD_PRESETS,
} from './types';
import { calculateBatchCost, formatCurrency, generateId } from './calculations';

export function BatchCostCalculator() {
  const [inputs, setInputs] = useState<BatchCostInputs>({
    craftType: 'soap',
    batchName: 'My Batch',
    unitsProduced: 10,
    materials: MATERIAL_PRESETS.soap,
    laborHours: 2,
    laborRate: 15,
    overheadPercent: 15,
    packagingCostPerUnit: 0.5,
    targetProfitMargin: 50,
    wholesaleDiscount: 50,
  });

  const results = useMemo(() => calculateBatchCost(inputs), [inputs]);

  const handleCraftTypeChange = (type: string) => {
    setInputs({
      ...inputs,
      craftType: type as any,
      materials: MATERIAL_PRESETS[type] || MATERIAL_PRESETS.custom,
      unitsProduced: DEFAULT_UNITS[type] || 10,
    });
  };

  const updateMaterial = (id: string, updates: Partial<MaterialItem>) => {
    setInputs({
      ...inputs,
      materials: inputs.materials.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const addMaterial = () => {
    setInputs({
      ...inputs,
      materials: [
        ...inputs.materials,
        { id: generateId(), name: 'New Material', quantity: 1, unit: 'oz', costPerUnit: 1 },
      ],
    });
  };

  const removeMaterial = (id: string) => {
    if (inputs.materials.length > 1) {
      setInputs({
        ...inputs,
        materials: inputs.materials.filter((m) => m.id !== id),
      });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Batch Details</h2>

          <div className="space-y-4">
            <Select
              label="Craft Type"
              value={inputs.craftType}
              onChange={handleCraftTypeChange}
              options={CRAFT_TYPES.map((t) => ({
                value: t.value,
                label: t.label,
              }))}
            />

            <Input
              label="Batch Name"
              type="text"
              value={inputs.batchName}
              onChange={(v) => setInputs({ ...inputs, batchName: v })}
            />

            <Input
              label="Units Produced"
              type="number"
              value={inputs.unitsProduced}
              onChange={(v) => setInputs({ ...inputs, unitsProduced: parseInt(v) || 1 })}
              min={1}
              suffix="units"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Materials</h2>
            <button
              onClick={addMaterial}
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30 hover:bg-amber-500/30"
            >
              + Add Material
            </button>
          </div>

          <div className="space-y-3">
            {inputs.materials.map((material) => (
              <div
                key={material.id}
                className="rounded-lg bg-[var(--color-background)] p-3 ring-1 ring-white/5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) =>
                      updateMaterial(material.id, {
                        name: (e.target as HTMLInputElement).value,
                      })
                    }
                    className="bg-transparent text-sm font-medium text-[var(--color-text)] outline-none"
                  />
                  {inputs.materials.length > 1 && (
                    <button
                      onClick={() => removeMaterial(material.id)}
                      className="text-red-400/60 hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-[var(--color-subtle)]">Qty</label>
                    <input
                      type="number"
                      value={material.quantity}
                      onChange={(e) =>
                        updateMaterial(material.id, {
                          quantity: parseFloat((e.target as HTMLInputElement).value) || 0,
                        })
                      }
                      className="w-full rounded bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text)] ring-1 ring-white/10"
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[var(--color-subtle)]">Unit</label>
                    <select
                      value={material.unit}
                      onChange={(e) =>
                        updateMaterial(material.id, {
                          unit: (e.target as HTMLSelectElement).value,
                        })
                      }
                      className="w-full rounded bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text)] ring-1 ring-white/10"
                    >
                      {MATERIAL_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[var(--color-subtle)]">$/unit</label>
                    <input
                      type="number"
                      value={material.costPerUnit}
                      onChange={(e) =>
                        updateMaterial(material.id, {
                          costPerUnit: parseFloat((e.target as HTMLInputElement).value) || 0,
                        })
                      }
                      className="w-full rounded bg-[var(--color-surface)] px-2 py-1 text-sm text-[var(--color-text)] ring-1 ring-white/10"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>
                <div className="mt-2 text-right text-xs text-[var(--color-subtle)]">
                  Subtotal: {formatCurrency(material.quantity * material.costPerUnit)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-amber-900/20 p-3 ring-1 ring-amber-500/20">
            <div className="flex justify-between">
              <span className="text-sm text-amber-200/80">Total Materials</span>
              <span className="font-bold text-amber-400">
                {formatCurrency(results.totalMaterialCost)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Labor & Overhead</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Labor Hours"
                type="number"
                value={inputs.laborHours}
                onChange={(v) => setInputs({ ...inputs, laborHours: parseFloat(v) || 0 })}
                min={0}
                step={0.25}
                suffix="hrs"
              />
              <Input
                label="Hourly Rate"
                type="number"
                value={inputs.laborRate}
                onChange={(v) => setInputs({ ...inputs, laborRate: parseFloat(v) || 0 })}
                min={0}
                suffix="$/hr"
              />
            </div>

            <Slider
              label="Overhead"
              value={inputs.overheadPercent}
              onChange={(v) => setInputs({ ...inputs, overheadPercent: v })}
              min={0}
              max={50}
              step={5}
              formatValue={(v) => `${v}%`}
            />

            <div className="flex flex-wrap gap-2">
              {OVERHEAD_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputs({ ...inputs, overheadPercent: preset.value })}
                  className={`rounded-lg px-3 py-1.5 text-xs ring-1 transition-all ${
                    inputs.overheadPercent === preset.value
                      ? 'bg-amber-500/20 ring-amber-500/50'
                      : 'bg-[var(--color-background)] ring-white/5 hover:ring-amber-500/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Input
              label="Packaging Cost per Unit"
              type="number"
              value={inputs.packagingCostPerUnit}
              onChange={(v) =>
                setInputs({ ...inputs, packagingCostPerUnit: parseFloat(v) || 0 })
              }
              min={0}
              step={0.1}
              suffix="$"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">Pricing</h2>

          <div className="space-y-4">
            <Slider
              label="Target Profit Margin"
              value={inputs.targetProfitMargin}
              onChange={(v) => setInputs({ ...inputs, targetProfitMargin: v })}
              min={10}
              max={150}
              step={5}
              formatValue={(v) => `${v}%`}
            />

            <div className="flex flex-wrap gap-2">
              {MARGIN_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setInputs({ ...inputs, targetProfitMargin: preset.value })}
                  className={`rounded-lg px-3 py-1.5 text-xs ring-1 transition-all ${
                    inputs.targetProfitMargin === preset.value
                      ? 'bg-amber-500/20 ring-amber-500/50'
                      : 'bg-[var(--color-background)] ring-white/5 hover:ring-amber-500/30'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <Slider
              label="Wholesale Discount"
              value={inputs.wholesaleDiscount}
              onChange={(v) => setInputs({ ...inputs, wholesaleDiscount: v })}
              min={0}
              max={60}
              step={5}
              formatValue={(v) => `${v}%`}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 p-6 ring-1 ring-green-500/30">
          <h2 className="mb-4 text-lg font-semibold text-green-300">Suggested Retail Price</h2>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400">
              {formatCurrency(results.suggestedRetailPrice)}
            </div>
            <div className="mt-2 text-green-300">per unit at {inputs.targetProfitMargin}% margin</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard
            label="Cost per Unit"
            value={formatCurrency(results.totalCostPerUnit)}
            color="blue"
          />
          <ResultCard
            label="Profit per Unit"
            value={formatCurrency(results.profitPerUnit)}
            color="green"
          />
          <ResultCard
            label="Wholesale Price"
            value={formatCurrency(results.wholesalePrice)}
            sublabel={`${inputs.wholesaleDiscount}% off retail`}
            color="purple"
          />
          <ResultCard
            label="Break-Even"
            value={`${results.breakEvenUnits} units`}
            sublabel="to cover fixed costs"
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Cost Breakdown</h3>

          <div className="space-y-3">
            {results.costBreakdown.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--color-subtle)]">{item.category}</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {formatCurrency(item.amount)} ({Math.round(item.percent)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-background)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">Total Batch Cost</span>
              <span className="font-bold text-amber-400">
                {formatCurrency(results.totalBatchCost)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] p-6 ring-1 ring-white/10">
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Batch Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Units Produced</span>
              <span className="font-medium text-[var(--color-text)]">{inputs.unitsProduced}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Material Cost/Unit</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatCurrency(results.materialCostPerUnit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Labor Cost/Unit</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatCurrency(results.laborCostPerUnit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Overhead/Unit</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatCurrency(results.overheadPerUnit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-subtle)]">Packaging/Unit</span>
              <span className="font-medium text-[var(--color-text)]">
                {formatCurrency(inputs.packagingCostPerUnit)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
              <span className="font-medium text-green-400">Total Batch Profit</span>
              <span className="font-bold text-green-400">
                {formatCurrency(results.totalProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-amber-900/20 p-4 ring-1 ring-amber-500/30">
          <h4 className="mb-2 font-medium text-amber-400">Pricing Tips</h4>
          <ul className="space-y-1 text-sm text-amber-200/80">
            <li>• Wholesale is typically 50% of retail price</li>
            <li>• Don't forget to include YOUR time in labor costs</li>
            <li>• Factor in market fees, shipping materials, and platform fees</li>
            <li>• Premium packaging justifies higher retail prices</li>
            <li>• Track actual times and costs to refine estimates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
