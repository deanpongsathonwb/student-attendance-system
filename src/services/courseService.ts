import initialClassrooms from '../seed/classrooms.json';
import initialCourses from '../seed/courses.json';
import type { Classroom, Course } from '../types/common.types';

export const courseService = {
  getClassrooms(): Classroom[] {
    return initialClassrooms as Classroom[];
  },

  getCourses(): Course[] {
    return initialCourses as Course[];
  },

  getCourseById(courseId: string): Course | undefined {
    return (initialCourses as Course[]).find((c) => c.id === courseId);
  },

  getClassroomById(classroomId: string): Classroom | undefined {
    return (initialClassrooms as Classroom[]).find((c) => c.id === classroomId);
  },
};
