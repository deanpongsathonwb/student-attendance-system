import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Users, Award } from 'lucide-react';
import ui from '../constants/ui.json';
import { getCourses, getClassrooms, getStudents } from '../utils/dataStore';
import { courseService } from '../services/courseService';
import { studentService } from '../services/studentService';
import type { Course, Classroom, Student } from '../types/common.types';

export const TeacherCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => getCourses());
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => getClassrooms());
  const [allStudents, setAllStudents] = useState<Student[]>(() => getStudents());

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      courseService.getCourses(),
      courseService.getClassrooms(),
      studentService.getStudents(),
    ]).then(([crs, cls, stds]) => {
      if (isMounted) {
        if (crs) setCourses(crs);
        if (cls) setClassrooms(cls);
        if (stds) setAllStudents(stds);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {ui.pageTitles.teacherCourses}
        </h2>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {courses.map((course) => {
          const classroom = classrooms.find((c) => c.id === course.classroomId);
          const studentCount = allStudents.filter((s) => s.classroomId === course.classroomId).length;

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-mono font-bold text-blue-700">
                    {course.courseCode}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {course.credits} {ui.table.credits}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {course.name}
                </h3>

                <div className="space-y-2.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-500">{ui.table.classroom}{ui.symbols.colon}</span>
                    <span className="font-semibold text-slate-800">{classroom?.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-500">{ui.table.schedule}{ui.symbols.colon}</span>
                    <span className="font-medium text-slate-800">
                      {course.dayOfWeek}
                      {ui.symbols.parenthesisOpen}
                      {ui.units.period} {course.period}
                      {ui.symbols.parenthesisClose}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-500">{ui.table.checkTime}{ui.symbols.colon}</span>
                    <span className="font-medium text-slate-800">{course.timeRange}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{ui.attendance.stats.total}</span>
                <span className="font-bold text-blue-700">
                  {studentCount} {ui.units.person}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
