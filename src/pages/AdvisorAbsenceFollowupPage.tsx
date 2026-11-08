import React, { useState, useMemo } from 'react';
import { Phone, MessageSquare, AlertCircle, CheckCircle2, X } from 'lucide-react';
import ui from '../constants/ui.json';
import {
  getClassrooms,
  getStudents,
  getAttendanceData,
  getStoredCurrentUser,
  getStudentAvatar,
} from '../utils/dataStore';
import type { Student } from '../types/common.types';

export const AdvisorAbsenceFollowupPage: React.FC = () => {
  const currentUser = getStoredCurrentUser();
  const classrooms = getClassrooms();
  const allStudents = getStudents();

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

  const [selectedStudentForContact, setSelectedStudentForContact] = useState<Student | null>(null);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  // Identify students with attendance issues (absent, late, leave)
  const followupStudents = useMemo(() => {
    const data = getAttendanceData();
    const homeroom = data.homeroomRecords.find((r) => r.classroomId === advisoryClass?.id);

    return students.map((s) => {
      const entry = homeroom?.entries.find((e) => e.studentId === s.id);
      const status = entry ? entry.status : 'absent';
      const remarks = entry?.remarks || '';
      return {
        student: s,
        status,
        remarks,
      };
    }).filter((item) => item.status === 'absent' || item.status === 'late' || item.status === 'leave');
  }, [students, advisoryClass]);

  const handleSendNotification = () => {
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
      setSelectedStudentForContact(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {ui.pageTitles.advisorFollowup}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {advisoryClass?.name}
          {ui.symbols.dash}
          {advisoryClass?.roomNumber}
        </p>
      </div>

      {notificationSent && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{ui.messages.notificationSent}</span>
        </div>
      )}

      {/* Followup List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-14 text-center">{ui.table.seatNumber}</th>
              <th className="py-3 px-4 w-28">{ui.table.studentCode}</th>
              <th className="py-3 px-4">{ui.table.fullName}</th>
              <th className="py-3 px-4 text-center">{ui.table.status}</th>
              <th className="py-3 px-4">{ui.table.remarks}</th>
              <th className="py-3 px-4">{ui.table.parentContact}</th>
              <th className="py-3 px-4 text-center">{ui.table.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {followupStudents.map(({ student, status, remarks }) => (
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
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md font-semibold text-xs ${
                      status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ui.attendance.statuses[status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {remarks || ui.symbols.dash}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">
                      {student.parentName}
                      {ui.symbols.parenthesisOpen}
                      {student.parentRelation}
                      {ui.symbols.parenthesisClose}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {student.parentPhone}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForContact(student)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{ui.modals.contactParentTitle}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contact Parent Modal Dialog */}
      {selectedStudentForContact && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span>{ui.modals.contactParentTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStudentForContact(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  {ui.table.fullName}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {selectedStudentForContact.fullName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">
                    {ui.modals.parentName}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedStudentForContact.parentName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">
                    {ui.modals.relation}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {selectedStudentForContact.parentRelation}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 block mb-1">
                  {ui.modals.phoneNumber}
                </span>
                <span className="text-base font-bold font-mono text-blue-700">
                  {selectedStudentForContact.parentPhone}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSendNotification}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{ui.modals.sendNotificationAction}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentForContact(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  {ui.modals.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
