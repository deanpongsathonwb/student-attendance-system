import React, { useMemo } from 'react';
import { Building, Users, CalendarCheck, AlertTriangle } from 'lucide-react';
import ui from '../constants/ui.json';
import {
  getClassrooms,
  getStudents,
  getAttendanceData,
  getStoredSettings,
} from '../utils/dataStore';

export const AdminOverviewPage: React.FC = () => {
  const classrooms = getClassrooms();
  const allStudents = getStudents();
  const settings = getStoredSettings();
  const attendanceData = getAttendanceData();

  const overviewStats = useMemo(() => {
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalActivity = 0;

    attendanceData.homeroomRecords.forEach((record) => {
      record.entries.forEach((e) => {
        if (e.status === 'present') totalPresent++;
        else if (e.status === 'late') totalLate++;
        else if (e.status === 'absent') totalAbsent++;
        else if (e.status === 'leave') totalLeave++;
        else if (e.status === 'activity') totalActivity++;
      });
    });

    const totalStudents = allStudents.length;
    const rate =
      totalStudents > 0
        ? Math.round(((totalPresent + totalLate + totalActivity) / totalStudents) * 100)
        : 0;

    return {
      totalStudents,
      totalPresent,
      totalLate,
      totalAbsent,
      totalLeave,
      totalActivity,
      rate,
    };
  }, [allStudents, attendanceData]);

  const classroomSummaries = useMemo(() => {
    return classrooms.map((cls) => {
      const clsStudents = allStudents.filter((s) => s.classroomId === cls.id);
      const rec = attendanceData.homeroomRecords.find((r) => r.classroomId === cls.id);

      let present = 0;
      let late = 0;
      let absent = 0;
      let leave = 0;

      if (rec) {
        rec.entries.forEach((e) => {
          if (e.status === 'present') present++;
          else if (e.status === 'late') late++;
          else if (e.status === 'absent') absent++;
          else if (e.status === 'leave') leave++;
        });
      } else {
        present = clsStudents.length;
      }

      const total = clsStudents.length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return {
        classroom: cls,
        total,
        present,
        late,
        absent,
        leave,
        rate,
      };
    });
  }, [classrooms, allStudents, attendanceData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {ui.pageTitles.adminOverview}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {settings.systemOwner}
            {ui.symbols.dash}
            {ui.layout.academicYear} {settings.academicYear} {ui.layout.activeSemester} {settings.semester}
          </p>
        </div>

        <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4" />
          <span>{ui.attendance.stats.minimumRequirement}</span>
          <span className="font-bold">
            {settings.minimumAttendancePercentage}
            {ui.units.percentage}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">
            {ui.attendance.stats.total}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {overviewStats.totalStudents}
            </span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium block">
            {ui.attendance.stats.presentCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">
              {overviewStats.totalPresent}
            </span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-600 font-medium block">
            {ui.attendance.stats.lateCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-700">
              {overviewStats.totalLate}
            </span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-rose-600 font-medium block">
            {ui.attendance.stats.absentCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-700">
              {overviewStats.totalAbsent}
            </span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-blue-600 font-medium block">
            {ui.attendance.stats.leaveCount}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-700">
              {overviewStats.totalLeave}
            </span>
            <span className="text-xs text-slate-500">{ui.units.person}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-purple-600 font-medium block">
            {ui.attendance.stats.attendanceRate}
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-purple-700">
              {overviewStats.rate}
            </span>
            <span className="text-xs text-slate-500">{ui.units.percentage}</span>
          </div>
        </div>
      </div>

      {/* Classroom Summaries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-700" />
            <span>{ui.pageTitles.adminOverview}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {classrooms.length} {ui.units.room}
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4">{ui.table.classroom}</th>
              <th className="py-3 px-4">{ui.table.room}</th>
              <th className="py-3 px-4 text-center">{ui.attendance.stats.total}</th>
              <th className="py-3 px-4 text-center">{ui.attendance.statuses.present}</th>
              <th className="py-3 px-4 text-center">{ui.attendance.statuses.late}</th>
              <th className="py-3 px-4 text-center">{ui.attendance.statuses.absent}</th>
              <th className="py-3 px-4 text-center">{ui.attendance.statuses.leave}</th>
              <th className="py-3 px-4 text-center">{ui.table.rate}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {classroomSummaries.map((item) => (
              <tr key={item.classroom.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">
                  {item.classroom.name}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {item.classroom.roomNumber}
                </td>
                <td className="py-3 px-4 text-center font-medium text-slate-800">
                  {item.total} {ui.units.person}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-700">
                  {item.present}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-amber-700">
                  {item.late}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-rose-700">
                  {item.absent}
                </td>
                <td className="py-3 px-4 text-center font-semibold text-blue-700">
                  {item.leave}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`font-bold px-2 py-1 rounded-md text-xs ${
                      item.rate >= settings.minimumAttendancePercentage
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.rate}
                    {ui.units.percentage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
