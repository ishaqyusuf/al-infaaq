import { z } from "zod";

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid contact email.",
  );

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.url().safeParse(value).success,
    "Enter a full URL, including https://.",
  );

const foundationReviewFormSchema = z.object({
  contactEmail: optionalEmailSchema,
  description: z.string().trim().min(1, "Describe the foundation's work."),
  documentUrl: optionalUrlSchema,
  name: z.string().trim().min(1, "Enter the foundation name."),
  registrationNumber: z.string().trim(),
  websiteUrl: optionalUrlSchema,
});

export type FoundationReviewFormData = z.infer<
  typeof foundationReviewFormSchema
>;
export type FoundationReviewFieldErrors = Partial<
  Record<keyof FoundationReviewFormData, string>
>;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function firstFieldErrors(
  error: z.ZodError<FoundationReviewFormData>,
): FoundationReviewFieldErrors {
  const flattened = error.flatten().fieldErrors;

  return {
    contactEmail: flattened.contactEmail?.[0],
    description: flattened.description?.[0],
    documentUrl: flattened.documentUrl?.[0],
    name: flattened.name?.[0],
    registrationNumber: flattened.registrationNumber?.[0],
    websiteUrl: flattened.websiteUrl?.[0],
  };
}

export function parseFoundationReviewFormData(
  formData: FormData,
):
  | { data: FoundationReviewFormData; success: true }
  | { fieldErrors: FoundationReviewFieldErrors; success: false } {
  const parsed = foundationReviewFormSchema.safeParse({
    contactEmail: readString(formData, "contactEmail"),
    description: readString(formData, "description"),
    documentUrl: readString(formData, "documentUrl"),
    name: readString(formData, "name"),
    registrationNumber: readString(formData, "registrationNumber"),
    websiteUrl: readString(formData, "websiteUrl"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(parsed.error),
      success: false,
    };
  }

  return {
    data: parsed.data,
    success: true,
  };
}
