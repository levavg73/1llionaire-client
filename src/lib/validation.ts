import { z } from "zod";

export function emptyToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

export const optionalTrimmedString = (maxLength?: number, message = "너무 깁니다.") => {
  let schema = z.string().trim();
  if (maxLength) schema = schema.max(maxLength, message);
  return z.preprocess(emptyToUndefined, schema.optional());
};

export const optionalHttpsUrl = (message = "https://로 시작하는 URL을 입력해 주세요.") =>
  z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .url("유효한 URL을 입력해 주세요.")
      .refine((value) => isSafeHttpsUrl(value), message)
      .optional()
  );

export const requiredHttpsUrl = (message = "https://로 시작하는 URL을 입력해 주세요.") =>
  z
    .string()
    .trim()
    .url("유효한 URL을 입력해 주세요.")
    .refine((value) => isSafeHttpsUrl(value), message);

export function isSafeHttpsUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeOptionalUrl(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isTodayOrFutureDate(value: string) {
  if (!value) return false;
  const selected = new Date(`${value}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function isFutureDate(value?: string) {
  if (!value) return true;
  const selected = new Date(`${value}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
}

export function isEndTimeAfterStartTime(startTime?: string, endTime?: string) {
  if (!startTime || !endTime) return true;
  return endTime > startTime;
}
