import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Centrale invoervalidatie met Zod. Elke muterende route parseert de body via
 * een schema, zodat we niet langer ongevalideerde JSON vertrouwen.
 */

export const adminLoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const teamLoginSchema = z.object({
  code: z.string().trim().min(1),
});

export const submissionCreateSchema = z
  .object({
    assignmentId: z.string().min(1),
    answerText: z.string().nullish(),
    answerImage: z.string().nullish(),
    playerId: z.string().nullish(),
  })
  .refine((d) => Boolean(d.answerText) || Boolean(d.answerImage), {
    message: "Tekstantwoord of afbeelding is verplicht",
  });

export const submissionUpdateSchema = z
  .object({
    status: z.enum(["APPROVED", "FEEDBACK", "PENDING"]),
    feedback: z.string().nullish(),
  })
  .refine(
    (d) => d.status !== "FEEDBACK" || (d.feedback?.trim().length ?? 0) > 0,
    {
      message: "Feedback is verplicht bij status FEEDBACK",
      path: ["feedback"],
    },
  );

export const teamCreateSchema = z.object({
  name: z.string().trim().min(1),
  playerNames: z.array(z.string().trim().min(1)).min(1),
});

// Lege string → undefined, anders een getal (voor optionele coördinaatvelden).
const optionalCoordinate = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.number().optional(),
);

export const assignmentSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  location: z.string().trim().min(1),
  order: z.coerce.number().int(),
  latitude: optionalCoordinate,
  longitude: optionalCoordinate,
  exampleImage: z.string().nullish(),
  teamIds: z.array(z.string()).optional(),
});

export const teamOrderSchema = z.object({
  assignmentIds: z.array(z.string().min(1)).min(1),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 tekens zijn"),
  isSuperAdmin: z.boolean().optional(),
});

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    password: z
      .string()
      .min(8, "Wachtwoord moet minimaal 8 tekens zijn")
      .optional(),
  })
  .refine((d) => d.name !== undefined || d.password !== undefined, {
    message: "Geef een naam of wachtwoord op om te wijzigen",
  });

/** Uniforme 400-respons bij een mislukte validatie. */
export function validationError(error: z.ZodError) {
  return NextResponse.json(
    { error: "Ongeldige invoer", details: z.flattenError(error).fieldErrors },
    { status: 400 },
  );
}
