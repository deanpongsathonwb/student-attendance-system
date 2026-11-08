import React, { useState, useMemo } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, XCircle, FileSpreadsheet } from 'lucide-react';
import ui from '../constants/ui.json';
import {
  getCourses,
  getClassrooms,
  getStudents,
  getAttendanceData,
  getStoredSettings,
  getStudentAvatar,
} from '../utils/dataStore';

export const TeacherReportsPage: React.FC = () => {
  const courses = getCourses();
  const classrooms = getClassrooms();
  const allStudents = getStudents();
  const settings = getStoredSettings();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || courses[0],
    [courses, selectedCourseId]
  );

  const classroom = useMemo(
    () => classrooms.find((cls) => cls.id === selectedCourse?.classroomId),
    [classrooms, selectedCourse]
  );

  const students = useMemo(
    () => allStudents.filter((s) => s.classroomId === selectedCourse?.classroomId),
    [allStudents, selectedCourse]
  );

  // Compute stats per student
  const reportRows = useMemo(() => {
    const data = getAttendanceData();
    const records = data.subjectRecords.filter((r) => r.courseId === selectedCourseId);
    const totalSessions = Math.max(records.length, 1);

    return students.map((s) => {
      let presentCount = 0;
      let lateCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let activityCount = 0;

      records.forEach((rec) => {
        const found = rec.entries.find((e) => e.studentId === s.id);
        const st = found ? found.status : 'present';
        if (st === 'present') presentCount++;
        else if (st === 'late') lateCount++;
        else if (st === 'absent') absentCount++;
        else if (st === 'leave') leaveCount++;
        else if (st === 'activity') activityCount++;
      });

      const effectiveAttendance = presentCount + lateCount + activityCount;
      const rate = Math.round((effectiveAttendance / totalSessions) * 100);

      let evaluation = ui.evaluation.pass;
      let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      if (rate < settings.minimumAttendancePercentage) {
        evaluation = ui.evaluation.fail;
        statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
      } else if (rate < settings.minimumAttendancePercentage + 5) {
        evaluation = ui.evaluation.atRisk;
        statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
      }

      return {
        student: s,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        leaveCount,
        activityCount,
        rate,
        evaluation,
        statusColor,
      };
    });
  }, [students, selectedCourseId, settings]);

  const atRiskStudents = reportRows.filter(
    (r) => r.rate < settings.minimumAttendancePercentage + 5
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {ui.pageTitles.teacherReports}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {classroom?.name}
            {ui.symbols.dash}
            {selectedCourse?.name}
            {ui.symbols.parenthesisOpen}
            {selectedCourse?.courseCode}
            {ui.symbols.parenthesisClose}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{ui.attendance.stats.minimumRequirement}</span>
            <span className="font-bold">
              {settings.minimumAttendancePercentage}
              {ui.units.percentage}
            </span>
          </div>
        </div>
      </div>

      {/* Course Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            {ui.attendance.actions.filterByCourse}
            {ui.symbols.colon}
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-4 text-xs font-medium text-slate-600">
          <span>
            {ui.attendance.stats.total}
            {ui.symbols.colon}
            <strong className="text-slate-900">{students.length}</strong> {ui.units.person}
          </span>
          <span className="text-slate-300">{ui.symbols.verticalBar}</span>
          <span className="text-amber-700">
            {ui.attendance.stats.atRiskCount}
            {ui.symbols.colon}
            <strong className="font-bold">{atRiskStudents}</strong> {ui.units.person}
          </span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-14 text-center">{ui.table.seatNumber}</th>
              <th className="py-3 px-4 w-28">{ui.table.studentCode}</th>
              <th className="py-3 px-4">{ui.table.fullName}</th>
              <th className="py-3 px-3 text-center">{ui.attendance.statuses.present}</th>
              <th className="py-3 px-3 text-center">{ui.attendance.statuses.late}</th>
              <th className="py-3 px-3 text-center">{ui.attendance.statuses.absent}</th>
              <th className="py-3 px-3 text-center">{ui.attendance.statuses.leave}</th>
              <th className="py-3 px-3 text-center">{ui.attendance.statuses.activity}</th>
              <th className="py-3 px-4 text-center">{ui.table.rate}</th>
              <th className="py-3 px-4 text-center">{ui.table.criteriaStatus}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {reportRows.map((row) => (
              <tr key={row.student.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 text-center font-medium text-slate-700">
                  {row.student.seatNumber}
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  {row.student.studentCode}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getStudentAvatar(row.student.id)}
                      alt={row.student.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-semibold text-slate-900">
                      {row.student.fullName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-semibold text-emerald-700">
                  {row.presentCount}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-amber-700">
                  {row.lateCount}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-rose-700">
                  {row.absentCount}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-blue-700">
                  {row.leaveCount}
                </td>
                <td className="py-3 px-3 text-center font-semibold text-purple-700">
                  {row.activityCount}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="font-bold text-slate-900">
                    {row.rate}
                    {ui.units.percentage}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center justify-center gap-1 w-36 px-2.5 py-1 rounded-full text-xs font-semibold border ${row.statusColor}`}
                  >
                    {row.evaluation === ui.evaluation.pass && <CheckCircle className="w-3.5 h-3.5" />}
                    {row.evaluation === ui.evaluation.atRisk && <AlertTriangle className="w-3.5 h-3.5" />}
                    {row.evaluation === ui.evaluation.fail && <XCircle className="w-3.5 h-3.5" />}
                    <span>{row.evaluation}</span>
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
