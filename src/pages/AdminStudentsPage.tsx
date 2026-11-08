import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, Search, X, CheckCircle2 } from 'lucide-react';
import ui from '../constants/ui.json';
import {
  getClassrooms,
  getStudents,
  saveStudents,
  getStudentAvatar,
} from '../utils/dataStore';
import type { Student } from '../types/common.types';

export const AdminStudentsPage: React.FC = () => {
  const classrooms = getClassrooms();
  const [students, setStudents] = useState<Student[]>(() => getStudents());
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Form states for Add/Edit student
  const [formStudentCode, setFormStudentCode] = useState<string>('');
  const [formFullName, setFormFullName] = useState<string>('');
  const [formSeatNumber, setFormSeatNumber] = useState<number>(1);
  const [formClassroomId, setFormClassroomId] = useState<string>(classrooms[0]?.id || '');
  const [formParentName, setFormParentName] = useState<string>('');
  const [formParentRelation, setFormParentRelation] = useState<string>('');
  const [formParentPhone, setFormParentPhone] = useState<string>('');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClassroom =
        selectedClassroomId === 'all' || s.classroomId === selectedClassroomId;
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.includes(searchQuery);
      return matchClassroom && matchSearch;
    });
  }, [students, selectedClassroomId, searchQuery]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormStudentCode('');
    setFormFullName('');
    setFormSeatNumber(students.length + 1);
    setFormClassroomId(classrooms[0]?.id || '');
    setFormParentName('');
    setFormParentRelation('');
    setFormParentPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormStudentCode(student.studentCode);
    setFormFullName(student.fullName);
    setFormSeatNumber(student.seatNumber);
    setFormClassroomId(student.classroomId);
    setFormParentName(student.parentName);
    setFormParentRelation(student.parentRelation);
    setFormParentPhone(student.parentPhone);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              studentCode: formStudentCode,
              fullName: formFullName,
              seatNumber: Number(formSeatNumber),
              classroomId: formClassroomId,
              parentName: formParentName,
              parentRelation: formParentRelation,
              parentPhone: formParentPhone,
            }
          : s
      );
      setStudents(updated);
      saveStudents(updated);
      setFeedbackMessage(ui.messages.studentSaved);
    } else {
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        studentCode: formStudentCode,
        fullName: formFullName,
        seatNumber: Number(formSeatNumber),
        classroomId: formClassroomId,
        parentName: formParentName,
        parentRelation: formParentRelation,
        parentPhone: formParentPhone,
      };
      const updated = [...students, newStudent];
      setStudents(updated);
      saveStudents(updated);
      setFeedbackMessage(ui.messages.studentSaved);
    }
    setIsModalOpen(false);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);
    setFeedbackMessage(ui.messages.studentDeleted);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {ui.pageTitles.adminStudents}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {ui.attendance.stats.total}
            {ui.symbols.colon}
            {students.length} {ui.units.person}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{ui.forms.add}</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-72">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ui.attendance.actions.quickSearch}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">
            {ui.attendance.actions.filterByClassroom}
            {ui.symbols.colon}
          </span>
          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">{ui.forms.allClassrooms}</option>
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <th className="py-3 px-4 w-14 text-center">{ui.table.seatNumber}</th>
              <th className="py-3 px-4 w-28">{ui.table.studentCode}</th>
              <th className="py-3 px-4">{ui.table.fullName}</th>
              <th className="py-3 px-4">{ui.table.classroom}</th>
              <th className="py-3 px-4">{ui.table.parentContact}</th>
              <th className="py-3 px-4 text-center w-28">{ui.table.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredStudents.map((student) => {
              const cls = classrooms.find((c) => c.id === student.classroomId);

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
                  <td className="py-3 px-4 text-slate-700">
                    {cls?.name || student.classroomId}
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title={ui.forms.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title={ui.forms.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Student Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <span>
                  {editingStudent
                    ? ui.modals.editStudentTitle
                    : ui.modals.addStudentTitle}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {ui.forms.studentCode}
                  </label>
                  <input
                    type="text"
                    required
                    value={formStudentCode}
                    onChange={(e) => setFormStudentCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {ui.forms.seatNumber}
                  </label>
                  <input
                    type="number"
                    required
                    value={formSeatNumber}
                    onChange={(e) => setFormSeatNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {ui.forms.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {ui.forms.classroom}
                </label>
                <select
                  value={formClassroomId}
                  onChange={(e) => setFormClassroomId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {ui.forms.parentName}
                    </label>
                    <input
                      type="text"
                      required
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {ui.forms.parentRelation}
                    </label>
                    <input
                      type="text"
                      required
                      value={formParentRelation}
                      onChange={(e) => setFormParentRelation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {ui.forms.parentPhone}
                  </label>
                  <input
                    type="text"
                    required
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {ui.forms.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  {ui.forms.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
