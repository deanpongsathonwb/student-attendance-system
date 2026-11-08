import { z } from 'zod';
import ui from '../../constants/ui.json';

export const settingsFormSchema = z.object({
  systemOwner: z.string().min(1, { message: ui.messages.requiredField }),
  academicYear: z.string().min(1, { message: ui.messages.requiredField }),
  semester: z.string().min(1, { message: ui.messages.requiredField }),
  morningCheckCutoffTime: z.string().min(1, { message: ui.messages.requiredField }),
  lateThresholdMinutes: z.number().int().min(0, { message: ui.messages.requiredField }),
  minimumAttendancePercentage: z.number().min(0).max(100, { message: ui.messages.requiredField }),
  enableSmsAlert: z.boolean(),
  enableLineNotification: z.boolean(),
  emergencyContact: z.string().min(1, { message: ui.messages.requiredField }),
  autoLockAttendanceHours: z.number().int().min(0, { message: ui.messages.requiredField }),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
