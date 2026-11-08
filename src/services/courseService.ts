import { supabase } from './supabaseClient';
import { handleDbError } from './dbHelper';
import { localStorageService } from '../storage/localStorage/localStorage.service';
import type { Classroom, Course } from '../types/common.types';

const CLASSROOMS_CACHE_KEY = 'app_classrooms_cache';
const COURSES_CACHE_KEY = 'app_courses_cache';

export const courseService = {
  getClassroomsSync(): Classroom[] {
    return localStorageService.getItem<Classroom[]>(CLASSROOMS_CACHE_KEY, []);
  },

  getCoursesSync(): Course[] {
    return localStorageService.getItem<Course[]>(COURSES_CACHE_KEY, []);
  },

  async getClassrooms(): Promise<Classroom[]> {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('name');

      if (error) {
        handleDbError(error, 'getClassrooms');
      }

      if (data) {
        const mapped: Classroom[] = data.map((c) => ({
          id: c.id,
          name: c.name,
          shortName: c.short_name,
          gradeLevel: c.grade_level,
          roomNumber: c.room_number,
          advisorId: c.advisor_id || '',
          totalStudents: c.total_students,
        }));
        localStorageService.setItem(CLASSROOMS_CACHE_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      handleDbError(err, 'getClassrooms');
    }
    return this.getClassroomsSync();
  },

  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code');

      if (error) {
        handleDbError(error, 'getCourses');
      }

      if (data) {
        const mapped: Course[] = data.map((crs) => ({
          id: crs.id,
          courseCode: crs.course_code,
          name: crs.name,
          credits: Number(crs.credits),
          classroomId: crs.classroom_id,
          teacherId: crs.teacher_id,
          dayOfWeek: crs.day_of_week,
          period: crs.period,
          timeRange: crs.time_range,
        }));
        localStorageService.setItem(COURSES_CACHE_KEY, mapped);
        return mapped;
      }
    } catch (err) {
      handleDbError(err, 'getCourses');
    }
    return this.getCoursesSync();
  },
};
