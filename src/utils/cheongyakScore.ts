// src/utils/cheongyakScore.ts
import type { SurveyCreateRequest } from '../types/survey.types';

/**
 * 민영 일반공급 "가점제" 추정 계산 (총 84점)
 * - 무주택기간: 32점
 * - 부양가족수: 35점
 * - 청약통장 가입기간: 17점
 *
 * ※ 실제 청약은 "입주자 모집공고일" 기준이며,
 *   본 설문은 일부 정보(혼인신고일, 세대원 등)가 없어서 "추정치"로 안내합니다.
 *
 * 점수표/기준 참고(공식/준공식 안내): :contentReference[oaicite:2]{index=2}
 */

export type CheongyakScore = {
  version: 'v1';
  surveyId: number | null;
  total: number;
  breakdown: {
    unhousedScore: number;
    dependentsScore: number;
    subscriptionScore: number;
  };
  debug: {
    asOfISO: string;
    asOfYear: number;

    // 추정/계산에 사용된 원자료
    unhousedYears: number;       // 무주택기간(년, 추정) 
    dependentsCount: number;     // 부양가족 수(추정, 본인 제외)
    subscriptionMonths: number;  // 통장가입기간(개월, 추정)

    flags: {
      isEstimatedUnhoused: boolean;
      isEstimatedDependents: boolean;
      isEstimatedSubscription: boolean;
      missingFields: string[];
    };
  };
  note: string;
  computedAtISO: string;
};

const STORAGE_PREFIX = 'cheongyakScore:v1';
const latestKey = `${STORAGE_PREFIX}:latest`;
const surveyKey = (surveyId: number) => `${STORAGE_PREFIX}:survey:${surveyId}`;

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

/** YYYY-MM-DD (또는 Date) -> Date 로 파싱 (로컬 기준) */
function parseLocalDate(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;

  if (typeof input === 'string') {
    // 'YYYY-MM-DD' or ISO
    // 가장 안전한 건 YYYY-MM-DD를 직접 파싱
    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      if (Number.isFinite(y) && Number.isFinite(mo) && Number.isFinite(d)) {
        return new Date(y, mo - 1, d);
      }
    }

    const dt = new Date(input);
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

function monthsBetweenConservative(start: Date, end: Date): number {
  // end가 start보다 이전이면 0
  const sY = start.getFullYear();
  const sM = start.getMonth();
  const sD = start.getDate();

  const eY = end.getFullYear();
  const eM = end.getMonth();
  const eD = end.getDate();

  let months = (eY - sY) * 12 + (eM - sM);
  // 아직 해당 월의 start '일'이 안 지났으면 1개월 덜 인정(보수적으로)
  if (eD < sD) months -= 1;

  return Math.max(0, months);
}

function scoreUnhousedByYears(years: number): number {
  // 1년 미만 2점, 1~2년 4점 ... 15년 이상 32점
  // => 2 * (floor(years) + 1) capped 32
  const y = Math.max(0, years);
  const raw = 2 * (Math.floor(y) + 1);
  return Math.min(32, raw);
}

function scoreDependentsByCount(count: number): number {
  // 0명(본인) 5점, 1명 10점 ... 6명 이상 35점
  const c = Math.max(0, Math.floor(count));
  return Math.min(35, 5 + c * 5);
}

function scoreSubscriptionByMonths(months: number): number {
  // 6개월 미만 1점
  // 6개월 이상~1년 미만 2점
  // 1년 이상~2년 미만 3점 ...
  // 15년 이상 17점
  const m = Math.max(0, Math.floor(months));

  if (m < 6) return 1;

  const years = m / 12;
  const raw = Math.floor(years) + 2; // 0.x(>=0.5) =>2, 1.x =>3, ...
  return Math.min(17, raw);
}

/**
 * 핵심: 설문 데이터로 "추정 가점" 계산
 */
export function computeCheongyakScore(
  data: SurveyCreateRequest,
  options?: { surveyId?: number | null; asOf?: Date },
): CheongyakScore {
  const asOf = options?.asOf ?? new Date();
  const asOfYear = asOf.getFullYear();
  const missingFields: string[] = [];

  // -------------------------
  // 1) 무주택기간(추정)
  // -------------------------
  let unhousedYears = 0;
  let unhousedScore = 0;
  let isEstimatedUnhoused = false;

  if (data.hasOwnedHouse === false) {
    // 한 번도 소유 X
    if (typeof data.age === 'number' && Number.isFinite(data.age)) {
      // 원칙은 "만 30세부터(또는 30세 이전 혼인 시 혼인신고일부터)"인데
      // 혼인신고일이 없으니 age 기반으로 보수적 추정
      if (data.age >= 30) {
        unhousedYears = data.age - 30;
      } else {
        unhousedYears = 0;
      }
      isEstimatedUnhoused = true;
      unhousedScore = scoreUnhousedByYears(unhousedYears);
    } else {
      missingFields.push('age');
      // 무주택이라고 해도 기간을 못 구하면 최소점도 확정하기 어려워 0 처리
      unhousedYears = 0;
      unhousedScore = 0;
    }
  } else if (data.hasOwnedHouse === true) {
    // 소유 이력 O -> 처분 후 무주택이 된 "시점"이 필요
    if (typeof data.unhousedStartYear === 'number' && Number.isFinite(data.unhousedStartYear)) {
      const startY = data.unhousedStartYear;
      unhousedYears = Math.max(0, asOfYear - startY);
      // 이 경우는 추정이 아니라 "연도 기준 계산"이지만,
      // 공고일/정확한 날짜가 없으므로 약간의 추정성은 있다고 보고 true 처리
      isEstimatedUnhoused = true;
      unhousedScore = scoreUnhousedByYears(unhousedYears);
    } else {
      // '현재도 보유'일 수도 있고, '예전에 있었으나 처분연도 미입력'일 수도 있어 확정 불가
      missingFields.push('unhousedStartYear');
      unhousedYears = 0;
      unhousedScore = 0;
      isEstimatedUnhoused = true;
    }
  } else {
    // null(모름)
    missingFields.push('hasOwnedHouse');
    unhousedYears = 0;
    unhousedScore = 0;
    isEstimatedUnhoused = true;
  }

  // -------------------------
  // 2) 부양가족수(추정)
  // -------------------------
  let dependentsCount = 0;
  let isEstimatedDependents = true;

  // 배우자: 결혼 상태면 1명으로 "추정"
  if (data.marryStatus === 'married') {
    dependentsCount += 1;
  }

  // 자녀 수
  if (typeof data.childCount === 'number' && Number.isFinite(data.childCount)) {
    dependentsCount += Math.max(0, Math.floor(data.childCount));
  } else {
    missingFields.push('childCount');
  }

  // 직계존속(부모) 부양: 질문 자체가 "60세 이상 + 3년 이상 부양"이라 가점과 연관이 있지만,
  // 실제로는 동일 세대 등재/세대주 여부 등 조건이 있어 보수적으로 처리
  if (data.isSupportingParents === true) {
    if (data.isHouseholder === true) {
      // 세대주 + 부모 부양 => 1명으로만 보수적 추정(부모 2명일 수도 있으나 설문에 없음)
      dependentsCount += 1;
    } else {
      // 세대주가 아니면 부양가족 인정이 애매하므로 점수 반영 X (대신 note로 안내)
      isEstimatedDependents = true;
    }
  }

  dependentsCount = Math.max(0, Math.floor(dependentsCount));
  const dependentsScore = scoreDependentsByCount(dependentsCount);

  // -------------------------
  // 3) 청약통장 가입기간(추정)
  // -------------------------
  let subscriptionMonths = 0;
  let subscriptionScore = 0;
  let isEstimatedSubscription = true;

  if (data.hasSubscriptionAccount === true) {
    const start = parseLocalDate(data.subscriptionStartDate as unknown);
    if (start) {
      subscriptionMonths = monthsBetweenConservative(start, asOf);
      subscriptionScore = scoreSubscriptionByMonths(subscriptionMonths);
      isEstimatedSubscription = true;
    } else {
      missingFields.push('subscriptionStartDate');
      subscriptionMonths = 0;
      subscriptionScore = 0;
    }
  } else if (data.hasSubscriptionAccount === false) {
    // 통장 없으면 가입기간 점수 0으로 안내(실제 청약 가능 여부는 별도)
    subscriptionMonths = 0;
    subscriptionScore = 0;
    isEstimatedSubscription = false;
  } else {
    missingFields.push('hasSubscriptionAccount');
    subscriptionMonths = 0;
    subscriptionScore = 0;
  }

  // -------------------------
  // 총점 및 안내문(note)
  // -------------------------
  const total = clampInt(unhousedScore + dependentsScore + subscriptionScore, 0, 84);

  const noteParts: string[] = [];
  noteParts.push('※ 민영 일반공급 가점제(총 84점) 기준 “추정치”입니다.');

  // 무주택 계산 주의
  if (data.hasOwnedHouse === false) {
    noteParts.push('무주택기간은 원칙적으로 만 30세(또는 30세 이전 혼인신고일)부터 산정됩니다.');
  } else if (data.hasOwnedHouse === true && !data.unhousedStartYear) {
    noteParts.push('주택 처분 연도(무주택 시작 연도)가 없어서 무주택기간 점수는 0점으로 처리했습니다.');
  }

  // 부모 부양 반영 주의
  if (data.isSupportingParents === true && data.isHouseholder !== true) {
    noteParts.push('부모 부양은 “세대주/동일세대 등재” 등 조건에 따라 부양가족 인정이 달라질 수 있어 보수적으로 미반영했습니다.');
  }

  // 통장 가입기간 주의
  if (data.hasSubscriptionAccount === true && !data.subscriptionStartDate) {
    noteParts.push('청약통장 가입일(순위기산일)이 없어 가입기간 점수는 0점으로 처리했습니다.');
  }

  // if (missingFields.length > 0) {
  //   noteParts.push(`누락/불명확 항목: ${Array.from(new Set(missingFields)).join(', ')}`);
  // }

  const note = noteParts.join(' ');

  return {
    version: 'v1',
    surveyId: options?.surveyId ?? null,
    total,
    breakdown: {
      unhousedScore,
      dependentsScore,
      subscriptionScore,
    },
    debug: {
      asOfISO: asOf.toISOString(),
      asOfYear,
      unhousedYears,
      dependentsCount,
      subscriptionMonths,
      flags: {
        isEstimatedUnhoused,
        isEstimatedDependents,
        isEstimatedSubscription,
        missingFields: Array.from(new Set(missingFields)),
      },
    },
    note,
    computedAtISO: new Date().toISOString(),
  };
}

/**
 * 로컬스토리지 저장
 * - surveyId별 저장
 * - latest에도 저장(홈에서 null로 조회 가능)
 */
export function saveCheongyakScoreToStorage(score: CheongyakScore) {
  try {
    if (score.surveyId != null && Number.isFinite(score.surveyId)) {
      localStorage.setItem(surveyKey(score.surveyId), JSON.stringify(score));
    }
    localStorage.setItem(latestKey, JSON.stringify(score));
  } catch (e) {
    console.error('saveCheongyakScoreToStorage failed:', e);
  }
}

/**
 * 로컬스토리지 로드
 * - surveyId가 있으면 해당 설문 점수
 * - surveyId가 null이면 latest 반환
 */
export function loadCheongyakScoreFromStorage(
  surveyId: number | null,
): CheongyakScore | null {
  try {
    const raw = surveyId != null ? localStorage.getItem(surveyKey(surveyId)) : localStorage.getItem(latestKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheongyakScore;
    if (!parsed || parsed.version !== 'v1') return null;
    return parsed;
  } catch (e) {
    console.error('loadCheongyakScoreFromStorage failed:', e);
    return null;
  }
}
