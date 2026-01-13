/**
 * GPA Calculator - React Component
 *
 * Calculate semester and cumulative GPA with support for multiple grade scales.
 */

import { useState, useMemo } from 'preact/hooks';
import { calculateGPA, getGPADescription } from './calculations';
import {
  getDefaultInputs,
  getGradeOptions,
  generateCourseId,
  type GPACalculatorInputs,
  type Course,
  type GradeScale,
} from './types';
import {
  ThemeProvider,
  Card,
  CalculatorHeader,
  Label,
  Input,
  Grid,
  Divider,
  Alert,
} from '../../ui';
import ShareResults from '../../ui/ShareResults';

export default function GPACalculator() {
  const [inputs, setInputs] = useState<GPACalculatorInputs>(() => getDefaultInputs());

  const result = useMemo(() => calculateGPA(inputs), [inputs]);
  const gradeOptions = useMemo(() => getGradeOptions(inputs.gradeScale), [inputs.gradeScale]);

  const updateInput = <K extends keyof GPACalculatorInputs>(
    field: K,
    value: GPACalculatorInputs[K]
  ) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setInputs((prev) => ({
      ...prev,
      courses: prev.courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      ),
    }));
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: generateCourseId(),
      name: `Course ${inputs.courses.length + 1}`,
      credits: 3,
      grade: 'A',
    };
    setInputs((prev) => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));
  };

  const removeCourse = (id: string) => {
    if (inputs.courses.length <= 1) return;
    setInputs((prev) => ({
      ...prev,
      courses: prev.courses.filter((course) => course.id !== id),
    }));
  };

  const getGPAColor = (gpa: number): string => {
    if (gpa >= 3.5) return 'text-green-400';
    if (gpa >= 3.0) return 'text-blue-400';
    if (gpa >= 2.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <ThemeProvider defaultColor="violet">
      <Card variant="elevated">
        <CalculatorHeader
          title="GPA Calculator"
          subtitle="Calculate your semester and cumulative GPA"
        />

        <div className="p-6 md:p-8">
          <div className="space-y-6 mb-8">
            {/* Grade Scale Selection */}
            <div>
              <Label required>Grade Scale</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateInput('gradeScale', '4.0')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    inputs.gradeScale === '4.0'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                  }`}
                >
                  4.0 Scale (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => updateInput('gradeScale', '4.3')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    inputs.gradeScale === '4.3'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-[var(--color-subtle)] hover:bg-white/10'
                  }`}
                >
                  4.3 Scale (A+ = 4.3)
                </button>
              </div>
            </div>

            {/* Current GPA (Optional) */}
            <div className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="includeCurrentGPA"
                  checked={inputs.includeCurrentGPA}
                  onChange={(e) => updateInput('includeCurrentGPA', e.currentTarget.checked)}
                  className="w-4 h-4 rounded bg-[var(--color-void)] border-white/20"
                />
                <Label htmlFor="includeCurrentGPA" className="mb-0 cursor-pointer">
                  Include current cumulative GPA
                </Label>
              </div>
              {inputs.includeCurrentGPA && (
                <Grid responsive={{ sm: 1, md: 2 }} gap="md">
                  <div>
                    <Label htmlFor="currentGPA">Current GPA</Label>
                    <Input
                      id="currentGPA"
                      type="number"
                      min={0}
                      max={inputs.gradeScale === '4.3' ? 4.3 : 4.0}
                      step={0.01}
                      value={inputs.currentGPA}
                      onChange={(e) => updateInput('currentGPA', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCredits">Credits Completed</Label>
                    <Input
                      id="currentCredits"
                      type="number"
                      min={0}
                      max={300}
                      value={inputs.currentCredits}
                      onChange={(e) => updateInput('currentCredits', Number(e.target.value))}
                    />
                  </div>
                </Grid>
              )}
            </div>

            {/* Courses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="mb-0">This Semester's Courses</Label>
                <button
                  type="button"
                  onClick={addCourse}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  + Add Course
                </button>
              </div>

              <div className="space-y-3">
                {inputs.courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="bg-[var(--color-night)] rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Course name"
                          value={course.name}
                          onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-full md:w-24">
                        <Input
                          type="number"
                          min={0.5}
                          max={8}
                          step={0.5}
                          placeholder="Credits"
                          value={course.credits}
                          onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                        />
                        <span className="text-xs text-[var(--color-muted)] mt-1 block md:hidden">credits</span>
                      </div>
                      <div className="w-full md:w-28">
                        <select
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, 'grade', e.currentTarget.value)}
                          className="w-full bg-[var(--color-void)] border border-white/10 rounded-xl px-4 py-3 text-[var(--color-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                        >
                          {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </div>
                      {inputs.courses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCourse(course.id)}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          aria-label="Remove course"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider />

          {/* Results */}
          <div className="space-y-6">
            {/* Primary Result - Semester GPA */}
            <div className="rounded-2xl p-8 text-center border-2 bg-violet-950/50 border-violet-500/30">
              <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                Semester GPA
              </p>
              <p className={`text-5xl md:text-6xl font-bold tabular-nums ${getGPAColor(result.semesterGPA)} mb-2`}>
                {result.semesterGPA.toFixed(2)}
              </p>
              <p className="text-lg text-[var(--color-cream)]">
                {result.letterGrade} Average • {getGPADescription(result.semesterGPA)}
              </p>
            </div>

            {/* Cumulative GPA (if enabled) */}
            {inputs.includeCurrentGPA && inputs.currentCredits > 0 && (
              <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10 text-center">
                <p className="text-sm text-[var(--color-muted)] uppercase tracking-wide mb-2">
                  New Cumulative GPA
                </p>
                <p className={`text-4xl font-bold tabular-nums ${getGPAColor(result.cumulativeGPA)}`}>
                  {result.cumulativeGPA.toFixed(2)}
                </p>
                <p className="text-sm text-[var(--color-subtle)] mt-2">
                  Based on {result.cumulativeCredits} total credits
                </p>
              </div>
            )}

            {/* Breakdown */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Semester Summary
              </h3>
              <Grid responsive={{ sm: 2, md: 3 }} gap="md">
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Total Credits</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-2xl">
                    {result.semesterCredits}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Grade Points</p>
                  <p className="font-bold text-violet-400 tabular-nums text-2xl">
                    {result.semesterGradePoints.toFixed(1)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Courses</p>
                  <p className="font-bold text-[var(--color-cream)] tabular-nums text-2xl">
                    {inputs.courses.length}
                  </p>
                </div>
              </Grid>
            </div>

            {/* Grade Point Reference */}
            <div className="bg-[var(--color-night)] rounded-xl p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-[var(--color-cream)] uppercase tracking-wider mb-4">
                Grade Point Values ({inputs.gradeScale} Scale)
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-center text-sm">
                {gradeOptions.map((grade) => (
                  <div key={grade} className="p-2 rounded-lg bg-white/5">
                    <span className="font-medium text-[var(--color-cream)]">{grade}</span>
                    <span className="text-[var(--color-subtle)] ml-1">
                      = {inputs.gradeScale === '4.3'
                        ? (grade === 'A+' ? '4.3' : grade === 'A' ? '4.0' : grade === 'A-' ? '3.7' : grade === 'B+' ? '3.3' : grade === 'B' ? '3.0' : grade === 'B-' ? '2.7' : grade === 'C+' ? '2.3' : grade === 'C' ? '2.0' : grade === 'C-' ? '1.7' : grade === 'D+' ? '1.3' : grade === 'D' ? '1.0' : grade === 'D-' ? '0.7' : '0.0')
                        : (grade === 'A' ? '4.0' : grade === 'A-' ? '3.7' : grade === 'B+' ? '3.3' : grade === 'B' ? '3.0' : grade === 'B-' ? '2.7' : grade === 'C+' ? '2.3' : grade === 'C' ? '2.0' : grade === 'C-' ? '1.7' : grade === 'D+' ? '1.3' : grade === 'D' ? '1.0' : grade === 'D-' ? '0.7' : '0.0')
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="tip" title="GPA tip:">
              Your GPA is calculated as total grade points divided by total credits.
              Higher credit courses have more impact on your overall GPA.
            </Alert>

            {/* Share Results */}
            <div className="flex justify-center pt-4">
              <ShareResults
                result={`Semester GPA: ${result.semesterGPA.toFixed(2)} (${result.letterGrade}) | ${result.semesterCredits} credits`}
                calculatorName="GPA Calculator"
              />
            </div>
          </div>
        </div>
      </Card>
    </ThemeProvider>
  );
}
