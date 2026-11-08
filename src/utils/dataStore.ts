import initialUsers from '../seed/users.json';
import imagesData from '../seed/images.json';
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
  return settingsService.getSettings();
}

export function saveStoredSettings(newSettings: SystemSettings): void {
  settingsService.saveSettings(newSettings);
}

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
  return courseService.getClassrooms();
}

export function getStudents(): Student[] {
  return studentService.getStudents();
}

export function saveStudents(students: Student[]): void {
  studentService.saveStudents(students);
}

export function getCourses(): Course[] {
  return courseService.getCourses();
}

interface AttendanceStore {
  subjectRecords: SubjectAttendanceRecord[];
  homeroomRecords: HomeroomAttendanceRecord[];
}

export function getAttendanceData(): AttendanceStore {
  return attendanceService.getAttendanceData();
}

export function saveAttendanceData(data: AttendanceStore): void {
  attendanceService.saveAttendanceData(data);
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
