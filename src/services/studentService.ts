import initialStudents from '../seed/students.json';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
import type { Student } from '../types/common.types';

export const studentService = {
  getStudents(): Student[] {
    return localStorageService.getItem<Student[]>(
      STORAGE_KEYS.STUDENTS_CACHE,
      initialStudents as Student[]
    );
  },

  saveStudents(students: Student[]): void {
    localStorageService.setItem(STORAGE_KEYS.STUDENTS_CACHE, students);
  },

  async createStudent(data: Omit<Student, 'id'>): Promise<Student> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const students = this.getStudents();
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        studentCode: sanitizeString(data.studentCode),
        fullName: sanitizeString(data.fullName),
        seatNumber: Number(data.seatNumber),
        classroomId: data.classroomId,
        parentName: sanitizeString(data.parentName),
        parentRelation: sanitizeString(data.parentRelation),
        parentPhone: sanitizeString(data.parentPhone),
      };
      const updated = [...students, newStudent];
      this.saveStudents(updated);
      return newStudent;
    });
  },

  async updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student | null> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const students = this.getStudents();
      const index = students.findIndex((s) => s.id === id);
      if (index === -1) {
        return null;
      }

      const current = students[index];
      const updatedStudent: Student = {
        ...current,
        studentCode: data.studentCode !== undefined ? sanitizeString(data.studentCode) : current.studentCode,
        fullName: data.fullName !== undefined ? sanitizeString(data.fullName) : current.fullName,
        seatNumber: data.seatNumber !== undefined ? Number(data.seatNumber) : current.seatNumber,
        classroomId: data.classroomId !== undefined ? data.classroomId : current.classroomId,
        parentName: data.parentName !== undefined ? sanitizeString(data.parentName) : current.parentName,
        parentRelation: data.parentRelation !== undefined ? sanitizeString(data.parentRelation) : current.parentRelation,
        parentPhone: data.parentPhone !== undefined ? sanitizeString(data.parentPhone) : current.parentPhone,
      };

      students[index] = updatedStudent;
      this.saveStudents(students);
      return updatedStudent;
    });
  },

  async deleteStudent(id: string): Promise<boolean> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const students = this.getStudents();
      const filtered = students.filter((s) => s.id !== id);
      if (filtered.length !== students.length) {
        this.saveStudents(filtered);
        return true;
      }
      return false;
    });
  },

  subscribe(callback: (students: Student[] | null) => void): () => void {
    return localStorageService.subscribe<Student[]>(
      STORAGE_KEYS.STUDENTS_CACHE,
      callback
    );
  },
};
