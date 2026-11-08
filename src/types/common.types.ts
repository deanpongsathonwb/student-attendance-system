export type Role = 'teacher' | 'advisor' | 'admin';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'activity';

export interface User {
  id: string;
  username: string;
  role: Role;
  fullName: string;
  position: string;
  department: string;
  email: string;
  advisoryClassroomId?: string;
}

export interface Classroom {
  id: string;
  name: string;
  shortName: string;
  gradeLevel: string;
  roomNumber: string;
  advisorId: string;
  totalStudents: number;
}

export interface Student {
  id: string;
  studentCode: string;
  classroomId: string;
  seatNumber: number;
  fullName: string;
  parentName: string;
  parentPhone: string;
  parentRelation: string;
}

export interface Course {
  id: string;
  courseCode: string;
  name: string;
  credits: number;
  classroomId: string;
  teacherId: string;
  dayOfWeek: string;
  period: number;
  timeRange: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  checkTime: string;
  remarks: string;
}

export interface SubjectAttendanceRecord {
  id: string;
  courseId: string;
  classroomId: string;
  date: string;
  period: number;
  recorderId: string;
  entries: AttendanceEntry[];
}

export interface HomeroomAttendanceRecord {
  id: string;
  classroomId: string;
  date: string;
  recorderId: string;
  checkTime: string;
  entries: AttendanceEntry[];
}

export interface SystemSettings {
  systemOwner: string;
  academicYear: string;
  semester: string;
  morningCheckCutoffTime: string;
  lateThresholdMinutes: number;
  minimumAttendancePercentage: number;
  enableSmsAlert: boolean;
  enableLineNotification: boolean;
  emergencyContact: string;
  autoLockAttendanceHours: number;
}
