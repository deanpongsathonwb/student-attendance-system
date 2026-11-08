import initialSettings from '../seed/settings.json';
import initialUsers from '../seed/users.json';
import initialClassrooms from '../seed/classrooms.json';
import initialStudents from '../seed/students.json';
import initialCourses from '../seed/courses.json';
import initialAttendance from '../seed/attendance.json';
import imagesData from '../seed/images.json';
import { STORAGE_KEYS } from '../constants/storage';
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
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return JSON.parse(saved) as SystemSettings;
    }
  } catch {
    // fallback to initial
  }
  return initialSettings as SystemSettings;
}

export function saveStoredSettings(newSettings: SystemSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
}

import { authStore } from '../stores/auth.store';

export function getStoredCurrentUser(): User | null {
  return authStore.getState().user;
}

export function setStoredCurrentUser(user: User | null): void {
  if (user) {
    authStore.login(user.username, user.password || '');
  } else {
    authStore.logout();
  }
}

export function getUsers(): User[] {
  return initialUsers as User[];
}

export function getClassrooms(): Classroom[] {
  return initialClassrooms as Classroom[];
}

export function getStudents(): Student[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS_CACHE);
    if (saved) {
      return JSON.parse(saved) as Student[];
    }
  } catch {
    // fallback
  }
  return initialStudents as Student[];
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS_CACHE, JSON.stringify(students));
}

export function getCourses(): Course[] {
  return initialCourses as Course[];
}

interface AttendanceStore {
  subjectRecords: SubjectAttendanceRecord[];
  homeroomRecords: HomeroomAttendanceRecord[];
}

export function getAttendanceData(): AttendanceStore {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_CACHE);
    if (saved) {
      return JSON.parse(saved) as AttendanceStore;
    }
  } catch {
    // fallback
  }
  return initialAttendance as AttendanceStore;
}

export function saveAttendanceData(data: AttendanceStore): void {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE_CACHE, JSON.stringify(data));
}

export function getUserAvatar(userId: string): string {
  const users = imagesData.users as Record<string, string>;
  if (users[userId]) {
    return users[userId];
  }
  return imagesData.placeholders.defaultAvatar;
}

export function getStudentAvatar(studentId: string): string {
  const students = imagesData.students as Record<string, string>;
  if (students[studentId]) {
    return students[studentId];
  }
  return imagesData.placeholders.defaultAvatar;
}
