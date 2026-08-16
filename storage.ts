import { StudentTwinState, StudentProfile } from '@/types';
import { SEED_PROFILES, createInitialAlexTwin, createInitialMayaTwin, createFreshStudentTwin } from '@/data/seedStudents';

const STORAGE_KEY_PREFIX = 'learntwin_state_';
const ACTIVE_STUDENT_KEY = 'learntwin_active_student_id';
const API_KEY_STORAGE = 'learntwin_gemini_api_key';

export function getStoredActiveStudentId(): string {
  if (typeof window === 'undefined') return SEED_PROFILES[0].id;
  return localStorage.getItem(ACTIVE_STUDENT_KEY) || SEED_PROFILES[0].id;
}

export function setStoredActiveStudentId(studentId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
}

export function getStoredTwinState(studentId: string): StudentTwinState {
  if (typeof window === 'undefined') {
    if (studentId === 'student-maya') return createInitialMayaTwin();
    if (studentId === 'student-new') return createFreshStudentTwin();
    return createInitialAlexTwin();
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${studentId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading stored twin state:', e);
  }

  // Fallback to seed
  if (studentId === 'student-maya') return createInitialMayaTwin();
  if (studentId === 'student-new') return createFreshStudentTwin();
  return createInitialAlexTwin();
}

export function saveTwinState(state: StudentTwinState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${state.student.id}`, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving twin state:', e);
  }
}

export function resetTwinState(studentId: string): StudentTwinState {
  let fresh: StudentTwinState;
  if (studentId === 'student-maya') fresh = createInitialMayaTwin();
  else if (studentId === 'student-new') fresh = createFreshStudentTwin();
  else fresh = createInitialAlexTwin();

  saveTwinState(fresh);
  return fresh;
}

const DEFAULT_GEMINI_KEY = 'AQ.Ab8RN6I0m74YavtjpoPoL9sEXFMTY7xReHfrbOEbdfJ6dg8S-w';

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_KEY;
  return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_GEMINI_KEY;
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE, key || DEFAULT_GEMINI_KEY);
}

