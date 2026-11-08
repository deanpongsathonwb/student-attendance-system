import { z } from 'zod';
import ui from '../../constants/ui.json';

export const studentFormSchema = z.object({
  studentCode: z.string().min(1, { message: ui.messages.requiredField }),
  seatNumber: z.number().int().min(1, { message: ui.messages.requiredField }),
  fullName: z.string().min(1, { message: ui.messages.requiredField }),
  classroomId: z.string().min(1, { message: ui.messages.requiredField }),
  parentName: z.string().min(1, { message: ui.messages.requiredField }),
  parentRelation: z.string().min(1, { message: ui.messages.requiredField }),
  parentPhone: z.string().min(1, { message: ui.messages.requiredField }),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
