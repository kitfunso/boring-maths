/**
 * GPA Calculator Calculations
 *
 * Calculate semester and cumulative GPA based on courses and grades.
 */

import type { GPACalculatorInputs, GPACalculatorResult } from './types';
import { gradePoints4_0, gradePoints4_3 } from './types';

export function calculateGPA(inputs: GPACalculatorInputs): GPACalculatorResult {
  const { gradeScale, courses, currentGPA, currentCredits, includeCurrentGPA } = inputs;

  const gradePoints = gradeScale === '4.3' ? gradePoints4_3 : gradePoints4_0;

  // Calculate semester GPA
  let semesterGradePoints = 0;
  let semesterCredits = 0;

  for (const course of courses) {
    if (course.credits > 0 && course.grade in gradePoints) {
      const points = gradePoints[course.grade];
      semesterGradePoints += points * course.credits;
      semesterCredits += course.credits;
    }
  }

  const semesterGPA = semesterCredits > 0 ? semesterGradePoints / semesterCredits : 0;

  // Calculate cumulative GPA if including current
  let cumulativeGPA = semesterGPA;
  let cumulativeCredits = semesterCredits;

  if (includeCurrentGPA && currentCredits > 0) {
    const previousGradePoints = currentGPA * currentCredits;
    const totalGradePoints = previousGradePoints + semesterGradePoints;
    cumulativeCredits = currentCredits + semesterCredits;
    cumulativeGPA = cumulativeCredits > 0 ? totalGradePoints / cumulativeCredits : 0;
  }

  // Determine letter grade equivalent
  const letterGrade = getLetterGrade(semesterGPA, gradeScale);

  return {
    semesterGPA: Math.round(semesterGPA * 100) / 100,
    semesterCredits,
    semesterGradePoints: Math.round(semesterGradePoints * 100) / 100,
    cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
    cumulativeCredits,
    letterGrade,
  };
}

function getLetterGrade(gpa: number, scale: string): string {
  if (scale === '4.3' && gpa >= 4.15) return 'A+';
  if (gpa >= 3.85) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.15) return 'B+';
  if (gpa >= 2.85) return 'B';
  if (gpa >= 2.5) return 'B-';
  if (gpa >= 2.15) return 'C+';
  if (gpa >= 1.85) return 'C';
  if (gpa >= 1.5) return 'C-';
  if (gpa >= 1.15) return 'D+';
  if (gpa >= 0.85) return 'D';
  if (gpa >= 0.5) return 'D-';
  return 'F';
}

export function getGPADescription(gpa: number): string {
  if (gpa >= 3.9) return 'Summa Cum Laude';
  if (gpa >= 3.7) return 'Magna Cum Laude';
  if (gpa >= 3.5) return 'Cum Laude';
  if (gpa >= 3.0) return "Dean's List";
  if (gpa >= 2.0) return 'Good Standing';
  if (gpa >= 1.0) return 'Academic Probation';
  return 'Academic Warning';
}
