import initialAttendance from '../seed/attendance.json';
import { STORAGE_KEYS } from '../constants/storage';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import { sanitizeString } from '../security/xss/sanitizer';
import { asyncMutex } from './concurrency/asyncMutex';
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
  getAttendanceData(): AttendanceStore {
    return localStorageService.getItem<AttendanceStore>(
      STORAGE_KEYS.ATTENDANCE_CACHE,
      initialAttendance as AttendanceStore
    );
  },

  saveAttendanceData(data: AttendanceStore): void {
    localStorageService.setItem(STORAGE_KEYS.ATTENDANCE_CACHE, data);
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
      const data = this.getAttendanceData();
      const cleanEntries = entries.map((e) => ({
        ...e,
        remarks: sanitizeString(e.remarks || ''),
      }));

      const index = data.subjectRecords.findIndex(
        (r) => r.courseId === courseId && r.date === date
      );

      if (index >= 0) {
        data.subjectRecords[index].entries = cleanEntries;
      } else {
        data.subjectRecords.push({
          id: `att_sub_${Date.now()}`,
          courseId,
          classroomId,
          date,
          period,
          recorderId,
          entries: cleanEntries,
        });
      }

      this.saveAttendanceData(data);
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
      const data = this.getAttendanceData();
      const cleanEntries = entries.map((e) => ({
        ...e,
        remarks: sanitizeString(e.remarks || ''),
      }));

      const index = data.homeroomRecords.findIndex(
        (r) => r.classroomId === classroomId && r.date === date
      );

      if (index >= 0) {
        data.homeroomRecords[index].entries = cleanEntries;
      } else {
        data.homeroomRecords.push({
          id: `att_hr_${Date.now()}`,
          classroomId,
          date,
          recorderId,
          checkTime,
          entries: cleanEntries,
        });
      }

      this.saveAttendanceData(data);
    });
  },

  subscribe(callback: (data: AttendanceStore | null) => void): () => void {
    return localStorageService.subscribe<AttendanceStore>(
      STORAGE_KEYS.ATTENDANCE_CACHE,
      callback
    );
  },
};
