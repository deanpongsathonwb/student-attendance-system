import { settingsService } from '../services/settingsService';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { courseService } from '../services/courseService';
import { authStore } from '../stores/auth.store';
import type {
  User,
  Classroom,
  Student,
  Course,
  SubjectAttendanceRecord,
  HomeroomAttendanceRecord,
  SystemSettings,
} from '../types/common.types';

export function getStoredSettings(): SystemSettings {
  return settingsService.getSettingsSync();
}

export function saveStoredSettings(newSettings: SystemSettings): void {
  settingsService.saveSettings(newSettings);
}

export function getStoredCurrentUser(): User | null {
  return authStore.getState().user;
}

export function setStoredCurrentUser(user: User | null): void {
  if (user) {
    authStore.setUser(user);
  } else {
    authStore.logout();
  }
}

export function getUsers(): User[] {
  const current = authStore.getState().user;
  return current ? [current] : [];
}

export function getClassrooms(): Classroom[] {
  return courseService.getClassroomsSync();
}

export function getStudents(): Student[] {
  return studentService.getStudentsSync();
}

export function getCourses(): Course[] {
  return courseService.getCoursesSync();
}

interface AttendanceStore {
  subjectRecords: SubjectAttendanceRecord[];
  homeroomRecords: HomeroomAttendanceRecord[];
}

export function getAttendanceData(): AttendanceStore {
  return attendanceService.getAttendanceDataSync();
}

export function getUserAvatar(_userId: string): string {
  return '/favicon.svg';
}

export function getStudentAvatar(_studentId: string): string {
  return '/favicon.svg';
}
