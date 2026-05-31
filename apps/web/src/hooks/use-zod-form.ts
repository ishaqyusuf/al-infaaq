"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldValues,
  type Resolver,
  type UseFormProps,
  useForm,
} from "react-hook-form";
import type { z } from "zod";

export function useZodForm<TSchema extends z.ZodType<any, any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema> & FieldValues>, "resolver">,
) {
  type FormValues = z.infer<TSchema> & FieldValues;

  return useForm<FormValues>({
    resolver: zodResolver(schema as never) as Resolver<FormValues>,
    ...options,
  });
}
