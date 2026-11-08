import { z } from 'zod';
import ui from '../../constants/ui.json';

export const loginFormSchema = z.object({
  username: z.string().min(1, { message: ui.messages.requiredField }),
  password: z.string().min(1, { message: ui.messages.requiredField }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
