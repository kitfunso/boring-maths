export const NOTICE_THRESHOLD_26_WEEKS = 26;
export const NOTICE_THRESHOLD_2_YEARS_WEEKS = 104;
export const NOTICE_THRESHOLD_5_YEARS_WEEKS = 260;

export const LEAVE_BASE_DAYS = 7;
export const LEAVE_MAX_DAYS = 14;

export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

export interface SingaporeNoticePeriodInputs {
  monthlyGrossSalary: number;
  serviceYears: number;
  serviceMonths: number;
  workingDaysPerWeek: number;
  unusedLeaveDays: number;
  contractualNoticeWeeks: number;
}

export interface SingaporeNoticePeriodResult {
  serviceWeeks: number;
  statutoryNoticeLabel: string;
  statutoryNoticeDays: number;
  appliedNoticeLabel: string;
  appliedNoticeDays: number;
  isOverrideApplied: boolean;
  dailyRate: number;
  salaryInLieu: number;
  leaveEntitlementDays: number;
  unusedLeaveDays: number;
  leaveEncashment: number;
  totalFinalPay: number;
}

export function getDefaultInputs(): SingaporeNoticePeriodInputs {
  return {
    monthlyGrossSalary: 5000,
    serviceYears: 3,
    serviceMonths: 0,
    workingDaysPerWeek: 5,
    unusedLeaveDays: 0,
    contractualNoticeWeeks: 0,
  };
}

interface NoticeUnit {
  unit: 'day' | 'week';
  amount: number;
}

function statutoryNotice(serviceWeeks: number): NoticeUnit {
  if (serviceWeeks < NOTICE_THRESHOLD_26_WEEKS) return { unit: 'day', amount: 1 };
  if (serviceWeeks < NOTICE_THRESHOLD_2_YEARS_WEEKS) return { unit: 'week', amount: 1 };
  if (serviceWeeks < NOTICE_THRESHOLD_5_YEARS_WEEKS) return { unit: 'week', amount: 2 };
  return { unit: 'week', amount: 4 };
}

function noticeLabel(notice: NoticeUnit): string {
  return `${notice.amount} ${notice.unit}${notice.amount === 1 ? '' : 's'}`;
}

function noticeToDays(notice: NoticeUnit, workingDaysPerWeek: number): number {
  return notice.unit === 'day' ? notice.amount : notice.amount * workingDaysPerWeek;
}

function leaveEntitlement(completedYears: number): number {
  return Math.min(LEAVE_MAX_DAYS, LEAVE_BASE_DAYS + Math.max(0, completedYears));
}

export function calculateSingaporeNoticePeriod(
  inputs: SingaporeNoticePeriodInputs
): SingaporeNoticePeriodResult {
  const monthlyGrossSalary = Math.max(0, inputs.monthlyGrossSalary || 0);
  const workingDaysPerWeek = Math.max(1, inputs.workingDaysPerWeek || 5);
  const unusedLeaveDays = Math.max(0, inputs.unusedLeaveDays || 0);

  const totalServiceMonths =
    Math.max(0, inputs.serviceYears || 0) * MONTHS_PER_YEAR +
    Math.max(0, inputs.serviceMonths || 0);
  const serviceWeeks = (totalServiceMonths * WEEKS_PER_YEAR) / MONTHS_PER_YEAR;
  const completedYears = Math.floor(totalServiceMonths / MONTHS_PER_YEAR);

  const statutory = statutoryNotice(serviceWeeks);
  const overrideWeeks = Math.max(0, inputs.contractualNoticeWeeks || 0);
  const isOverrideApplied = overrideWeeks > 0;
  const applied: NoticeUnit = isOverrideApplied
    ? { unit: 'week', amount: overrideWeeks }
    : statutory;

  const dailyRate = (MONTHS_PER_YEAR * monthlyGrossSalary) / (WEEKS_PER_YEAR * workingDaysPerWeek);

  const statutoryNoticeDays = noticeToDays(statutory, workingDaysPerWeek);
  const appliedNoticeDays = noticeToDays(applied, workingDaysPerWeek);
  const salaryInLieu = dailyRate * appliedNoticeDays;

  const leaveEntitlementDays = leaveEntitlement(completedYears);
  const leaveEncashment = dailyRate * unusedLeaveDays;

  const round2 = (v: number) => Math.round(v * 100) / 100;

  return {
    serviceWeeks: round2(serviceWeeks),
    statutoryNoticeLabel: noticeLabel(statutory),
    statutoryNoticeDays: round2(statutoryNoticeDays),
    appliedNoticeLabel: noticeLabel(applied),
    appliedNoticeDays: round2(appliedNoticeDays),
    isOverrideApplied,
    dailyRate: round2(dailyRate),
    salaryInLieu: round2(salaryInLieu),
    leaveEntitlementDays,
    unusedLeaveDays: round2(unusedLeaveDays),
    leaveEncashment: round2(leaveEncashment),
    totalFinalPay: round2(salaryInLieu + leaveEncashment),
  };
}
