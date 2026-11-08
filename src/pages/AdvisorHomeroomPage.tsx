import React, { useState, useMemo, useEffect } from 'react';
import { Check, CheckCircle2, Save, Clock, AlertTriangle } from 'lucide-react';
import ui from '../constants/ui.json';
import {
  getClassrooms,
  getStudents,
  getAttendanceData,
  getStoredSettings,
  getStoredCurrentUser,
  getStudentAvatar,
} from '../utils/dataStore';
import { attendanceService } from '../services/attendanceService';
import { sanitizeString } from '../security/xss/sanitizer';
import type { AttendanceStatus, AttendanceEntry } from '../types/common.types';

export const AdvisorHomeroomPage: React.FC = () => {
  const currentUser = getStoredCurrentUser();
  const classrooms = getClassrooms();
  const allStudents = getStudents();
  const settings = getStoredSettings();

  const advisoryClass = useMemo(
    () =>
      classrooms.find((c) => c.id === currentUser?.advisoryClassroomId) ||
      classrooms[0],
    [classrooms, currentUser]
  );

  const students = useMemo(
    () => allStudents.filter((s) => s.classroomId === advisoryClass?.id),
    [allStudents, advisoryClass]
  );

  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load homeroom entries
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>(() => {
    const data = getAttendanceData();
    const existing = data.homeroomRecords.find(
      (r) => r.classroomId === (advisoryClass?.id || '') && r.date === '2026-11-02'
    );
    const map: Record<string, AttendanceEntry> = {};
    if (existing) {
      existing.entries.forEach((e) => {
        map[e.studentId] = { ...e };
      });
    } else {
      students.forEach((s) => {
        map[s.id] = {
          studentId: s.id,
          status: 'present',
          checkTime: '07:45',
          remarks: '',
        };
      });
    }
    return map;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, checkTime: '07:45', remarks: '' }),
        status,
      },
    }));
    setSaveSuccess(false);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, status: 'present', checkTime: '07:45' }),
        remarks,
      },
    }));
    setSaveSuccess(false);
  };

  const handleMarkAllPresent = () => {
    setEntries((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = {
          ...(updated[s.id] || { studentId: s.id, remarks: '' }),
          status: 'present',
          checkTime: '07:45',
        };
      });
      return updated;
    });
    setSaveSuccess(false);
  };

  // Cross-tab concurrency synchronization
  useEffect(() => {
    const unsubscribe = attendanceService.subscribe((newData) => {
      if (newData) {
        const record = newData.homeroomRecords.find(
          (r) => r.classroomId === advisoryClass?.id && r.date === selectedDate
        );
        if (record) {
          const map: Record<string, AttendanceEntry> = {};
          record.entries.forEach((e) => {
            map[e.studentId] = e;
          });
          setEntries(map);
        }
      }
    });
    return () => unsubscribe();
  }, [advisoryClass, selectedDate]);

  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const recordEntries: AttendanceEntry[] = students.map((s) => {
        const existing = entries[s.id];
        if (existing) {
          return {
            ...existing,
            remarks: sanitizeString(existing.remarks || ''),
          };
        }
        return {
          studentId: s.id,
          status: 'present',
          checkTime: '07:45',
          remarks: '',
        };
      });

      await attendanceService.saveHomeroomAttendance(
        advisoryClass?.id || '',
        selectedDate,
        currentUser?.id || 'usr_advisor_01',
        '07:55',
        recordEntries
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;
    let activity = 0;

    students.forEach((s) => {
      const entry = entries[s.id];
      const status = entry ? entry.status : 'present';
      if (status === 'present') present++;
      else if (status === 'late') late++;
      else if (status === 'absent') absent++;
      else if (status === 'leave') leave++;
      else if (status === 'activity') activity++;
    });

    const total = students.length;
    const rate = total > 0 ? Math.round(((present + late + activity) / total) * 100) : 0;
    return { total, present, late, absent, leave, activity, rate };
  }, [students, entries]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {ui.pageTitles.advisorHomeroom}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {advisoryClass?.name}
            {ui.symbols.dash}
            {advisoryClass?.roomNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{ui.attendance.actions.markAllPresent}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? ui.feedback.saving : ui.attendance.actions.saveAttendance}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{ui.messages.recordSaved}</span>
        </div>
      )}

      {/* Info & Date Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {ui.attendance.actions.filterByDate}
              {ui.symbols.colon}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{ui.settings.morningCutoffLabel}{ui.symbols.colon}</span>
            <span className="font-bold text-amber-800">{settings.morningCheckCutoffTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-4 h-4 text-slate-400" />
          <span>{ui.settings.lateThresholdLabel}{ui.symbols.colon}</span>
          <span className="font-semibold text-slate-700">
            {settings.lateThresholdMinutes} {ui.units.minutes}
          </span>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            {ui.attendance.stats.total}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium block">
            {ui.attendance.stats.presentCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">{stats.present}</span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-600 font-medium block">
            {ui.attendance.stats.lateCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-700">{stats.late}</span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-rose-600 font-medium block">
            {ui.attendance.stats.absentCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-700">{stats.absent}</span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-blue-600 font-medium block">
            {ui.attendance.stats.leaveCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-700">{stats.leave}</span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-purple-600 font-medium block">
            {ui.attendance.stats.attendanceRate}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-700">{stats.rate}</span>
            <span className="text-xs text-slate-500">{ui.units.percentage}</span>
          </div>
        </div>
      </div>

      {/* Homeroom Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-14 text-center">{ui.table.seatNumber}</th>
              <th className="py-3 px-4 w-28">{ui.table.studentCode}</th>
              <th className="py-3 px-4">{ui.table.fullName}</th>
              <th className="py-3 px-4 text-center">{ui.table.status}</th>
              <th className="py-3 px-4 w-24 text-center">{ui.table.checkTime}</th>
              <th className="py-3 px-4 w-60">{ui.table.remarks}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {students.map((student) => {
              const entry = entries[student.id] || {
                studentId: student.id,
                status: 'present',
                checkTime: '07:45',
                remarks: '',
              };

              return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center font-medium text-slate-700">
                    {student.seatNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {student.studentCode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getStudentAvatar(student.id)}
                        alt={student.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-semibold text-slate-900">
                        {student.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={`w-18 text-center px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          entry.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {ui.attendance.statuses.present}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={`w-18 text-center px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          entry.status === 'late'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        {ui.attendance.statuses.late}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={`w-18 text-center px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          entry.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        {ui.attendance.statuses.absent}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'leave')}
                        className={`w-18 text-center px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          entry.status === 'leave'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {ui.attendance.statuses.leave}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.id, 'activity')}
                        className={`w-18 text-center px-2 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                          entry.status === 'activity'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                      >
                        {ui.attendance.statuses.activity}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {entry.checkTime}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={entry.remarks}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      placeholder={ui.table.remarks}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
