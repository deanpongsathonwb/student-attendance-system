import { supabase } from './supabaseClient';
import { stripUndefined, handleDbError } from './dbHelper';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { STORAGE_KEYS } from '../constants/storage';
import type { Student } from '../types/common.types';

export const studentService = {
  getStudentsSync(): Student[] {
    return localStorageService.getItem<Student[]>(
      STORAGE_KEYS.STUDENTS_CACHE,
      []
    );
  },

  async getStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('seat_number', { ascending: true });

      if (error) {
        handleDbError(error, 'getStudents');
      }

      if (data) {
        const mapped: Student[] = data.map((s) => ({
          id: s.id,
          studentCode: s.student_code,
          classroomId: s.classroom_id,
          seatNumber: s.seat_number,
          fullName: s.full_name,
          parentName: s.parent_name,
          parentPhone: s.parent_phone,
          parentRelation: s.parent_relation,
        }));
        localStorageService.setItem(STORAGE_KEYS.STUDENTS_CACHE, mapped);
        return mapped;
      }
    } catch (err) {
      handleDbError(err, 'getStudents');
    }
    return [];
  },

  async createStudent(data: Omit<Student, 'id'>): Promise<Student> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const newId = `std_${Date.now()}`;
      const payload = stripUndefined({
        id: newId,
        student_code: sanitizeString(data.studentCode),
        full_name: sanitizeString(data.fullName),
        seat_number: Number(data.seatNumber),
        classroom_id: data.classroomId,
        parent_name: sanitizeString(data.parentName),
        parent_relation: sanitizeString(data.parentRelation),
        parent_phone: sanitizeString(data.parentPhone),
      });

      const { error } = await supabase.from('students').insert(payload);
      if (error) {
        handleDbError(error, 'createStudent');
      }

      // Verify write by reading back persisted record
      const { data: persisted, error: readError } = await supabase
        .from('students')
        .select('*')
        .eq('id', newId)
        .single();

      if (readError || !persisted) {
        handleDbError(readError || new Error('Record verification failed'), 'verifyCreateStudent');
      }

      const created: Student = {
        id: persisted.id,
        studentCode: persisted.student_code,
        classroomId: persisted.classroom_id,
        seatNumber: persisted.seat_number,
        fullName: persisted.full_name,
        parentName: persisted.parent_name,
        parentPhone: persisted.parent_phone,
        parentRelation: persisted.parent_relation,
      };

      // Refresh cache
      await this.getStudents();
      return created;
    });
  },

  async updateStudent(id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student | null> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const payload = stripUndefined({
        student_code: data.studentCode !== undefined ? sanitizeString(data.studentCode) : undefined,
        full_name: data.fullName !== undefined ? sanitizeString(data.fullName) : undefined,
        seat_number: data.seatNumber !== undefined ? Number(data.seatNumber) : undefined,
        classroom_id: data.classroomId !== undefined ? data.classroomId : undefined,
        parent_name: data.parentName !== undefined ? sanitizeString(data.parentName) : undefined,
        parent_relation: data.parentRelation !== undefined ? sanitizeString(data.parentRelation) : undefined,
        parent_phone: data.parentPhone !== undefined ? sanitizeString(data.parentPhone) : undefined,
      });

      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', id);

      if (error) {
        handleDbError(error, 'updateStudent');
      }

      // Verify update
      const { data: persisted, error: readError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (readError || !persisted) {
        handleDbError(readError || new Error('Record verification failed'), 'verifyUpdateStudent');
      }

      const updated: Student = {
        id: persisted.id,
        studentCode: persisted.student_code,
        classroomId: persisted.classroom_id,
        seatNumber: persisted.seat_number,
        fullName: persisted.full_name,
        parentName: persisted.parent_name,
        parentPhone: persisted.parent_phone,
        parentRelation: persisted.parent_relation,
      };

      // Refresh cache
      await this.getStudents();
      return updated;
    });
  },

  async deleteStudent(id: string): Promise<boolean> {
    return asyncMutex.withLock('students_mutation_lock', async () => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        handleDbError(error, 'deleteStudent');
      }

      // Refresh cache
      await this.getStudents();
      return true;
    });
  },

  subscribe(callback: (students: Student[] | null) => void): () => void {
    return localStorageService.subscribe<Student[]>(
      STORAGE_KEYS.STUDENTS_CACHE,
      callback
    );
  },
};
