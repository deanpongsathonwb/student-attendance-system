import { supabase } from './supabaseClient';
import { stripUndefined, handleDbError } from './dbHelper';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { STORAGE_KEYS } from '../constants/storage';
import type {
  SubjectAttendanceRecord,
  HomeroomAttendanceRecord,
  AttendanceEntry,
} from '../types/common.types';

interface AttendanceStore {
  subjectRecords: SubjectAttendanceRecord[];
  homeroomRecords: HomeroomAttendanceRecord[];
}

export const attendanceService = {
  getAttendanceDataSync(): AttendanceStore {
    return localStorageService.getItem<AttendanceStore>(
      STORAGE_KEYS.ATTENDANCE_CACHE,
      { subjectRecords: [], homeroomRecords: [] }
    );
  },

  async getAttendanceData(): Promise<AttendanceStore> {
    try {
      // 1. Fetch subject records & entries
      const { data: subRecs, error: subErr } = await supabase
        .from('subject_attendance_records')
        .select('*');

      if (subErr) {
        handleDbError(subErr, 'getSubjectAttendanceRecords');
      }

      const { data: subEntries, error: subEntryErr } = await supabase
        .from('subject_attendance_entries')
        .select('*');

      if (subEntryErr) {
        handleDbError(subEntryErr, 'getSubjectAttendanceEntries');
      }

      // 2. Fetch homeroom records & entries
      const { data: hrRecs, error: hrErr } = await supabase
        .from('homeroom_attendance_records')
        .select('*');

      if (hrErr) {
        handleDbError(hrErr, 'getHomeroomAttendanceRecords');
      }

      const { data: hrEntries, error: hrEntryErr } = await supabase
        .from('homeroom_attendance_entries')
        .select('*');

      if (hrEntryErr) {
        handleDbError(hrEntryErr, 'getHomeroomAttendanceEntries');
      }

      const subjectRecords: SubjectAttendanceRecord[] = (subRecs || []).map((r) => {
        const entries: AttendanceEntry[] = (subEntries || [])
          .filter((e) => e.record_id === r.id)
          .map((e) => ({
            studentId: e.student_id,
            status: e.status,
            checkTime: e.check_time,
            remarks: e.remarks || '',
          }));
        return {
          id: r.id,
          courseId: r.course_id,
          classroomId: r.classroom_id,
          date: r.date,
          period: r.period,
          recorderId: r.recorder_id,
          entries,
        };
      });

      const homeroomRecords: HomeroomAttendanceRecord[] = (hrRecs || []).map((r) => {
        const entries: AttendanceEntry[] = (hrEntries || [])
          .filter((e) => e.record_id === r.id)
          .map((e) => ({
            studentId: e.student_id,
            status: e.status,
            checkTime: e.check_time,
            remarks: e.remarks || '',
          }));
        return {
          id: r.id,
          classroomId: r.classroom_id,
          date: r.date,
          recorderId: r.recorder_id,
          checkTime: r.check_time,
          entries,
        };
      });

      const store: AttendanceStore = { subjectRecords, homeroomRecords };
      localStorageService.setItem(STORAGE_KEYS.ATTENDANCE_CACHE, store);
      return store;
    } catch (err) {
      handleDbError(err, 'getAttendanceData');
    }
    return this.getAttendanceDataSync();
  },

  async saveSubjectAttendance(
    courseId: string,
    classroomId: string,
    date: string,
    period: number,
    recorderId: string,
    entries: AttendanceEntry[]
  ): Promise<void> {
    const lockKey = `att_sub_${courseId}_${date}`;
    return asyncMutex.withLock(lockKey, async () => {
      // Find or create record ID
      const recordId = `att_sub_${courseId}_${date}_${period}`;
      const headerPayload = stripUndefined({
        id: recordId,
        course_id: courseId,
        classroom_id: classroomId,
        date: date,
        period: period,
        recorder_id: recorderId,
      });

      const { error: headerErr } = await supabase
        .from('subject_attendance_records')
        .upsert(headerPayload, { onConflict: 'course_id,date,period' });

      if (headerErr) {
        handleDbError(headerErr, 'upsertSubjectAttendanceHeader');
      }

      // Upsert entries
      const entriesPayload = entries.map((e) => stripUndefined({
        record_id: recordId,
        student_id: e.studentId,
        status: e.status,
        check_time: e.checkTime,
        remarks: sanitizeString(e.remarks || ''),
      }));

      const { error: entriesErr } = await supabase
        .from('subject_attendance_entries')
        .upsert(entriesPayload, { onConflict: 'record_id,student_id' });

      if (entriesErr) {
        handleDbError(entriesErr, 'upsertSubjectAttendanceEntries');
      }

      // Refresh cache
      await this.getAttendanceData();
    });
  },

  async saveHomeroomAttendance(
    classroomId: string,
    date: string,
    recorderId: string,
    checkTime: string,
    entries: AttendanceEntry[]
  ): Promise<void> {
    const lockKey = `att_hr_${classroomId}_${date}`;
    return asyncMutex.withLock(lockKey, async () => {
      const recordId = `att_hr_${classroomId}_${date}`;
      const headerPayload = stripUndefined({
        id: recordId,
        classroom_id: classroomId,
        date: date,
        recorder_id: recorderId,
        check_time: checkTime,
      });

      const { error: headerErr } = await supabase
        .from('homeroom_attendance_records')
        .upsert(headerPayload, { onConflict: 'classroom_id,date' });

      if (headerErr) {
        handleDbError(headerErr, 'upsertHomeroomAttendanceHeader');
      }

      const entriesPayload = entries.map((e) => stripUndefined({
        record_id: recordId,
        student_id: e.studentId,
        status: e.status,
        check_time: e.checkTime,
        remarks: sanitizeString(e.remarks || ''),
      }));

      const { error: entriesErr } = await supabase
        .from('homeroom_attendance_entries')
        .upsert(entriesPayload, { onConflict: 'record_id,student_id' });

      if (entriesErr) {
        handleDbError(entriesErr, 'upsertHomeroomAttendanceEntries');
      }

      // Refresh cache
      await this.getAttendanceData();
    });
  },

  subscribe(callback: (data: AttendanceStore | null) => void): () => void {
    return localStorageService.subscribe<AttendanceStore>(
      STORAGE_KEYS.ATTENDANCE_CACHE,
      callback
    );
  },
};
