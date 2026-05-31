import { z } from "zod";

export const signUpFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  name: z.string().min(2, "Enter your name."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
