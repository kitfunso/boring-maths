/**
 * GPA Calculator Types
 *
 * Calculate cumulative and semester GPA based on course grades and credit hours.
 */

export type GradeScale = '4.0' | '4.3';

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface GPACalculatorInputs {
  gradeScale: GradeScale;
  courses: Course[];
  currentGPA: number;
  currentCredits: number;
  includeCurrentGPA: boolean;
}

export interface GPACalculatorResult {
  semesterGPA: number;
  semesterCredits: number;
  semesterGradePoints: number;
  cumulativeGPA: number;
  cumulativeCredits: number;
  letterGrade: string;
}

// Standard 4.0 scale
export const gradePoints4_0: Record<string, number> = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

// 4.3 scale (A+ = 4.3)
export const gradePoints4_3: Record<string, number> = {
  'A+': 4.3,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

export function getGradeOptions(scale: GradeScale): string[] {
  return scale === '4.3'
    ? ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
    : ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
}

export function getDefaultInputs(): GPACalculatorInputs {
  return {
    gradeScale: '4.0',
    courses: [
      { id: '1', name: 'Course 1', credits: 3, grade: 'A' },
      { id: '2', name: 'Course 2', credits: 3, grade: 'B+' },
      { id: '3', name: 'Course 3', credits: 3, grade: 'A-' },
      { id: '4', name: 'Course 4', credits: 4, grade: 'B' },
    ],
    currentGPA: 0,
    currentCredits: 0,
    includeCurrentGPA: false,
  };
}

export function generateCourseId(): string {
  return Math.random().toString(36).substring(2, 11);
}
