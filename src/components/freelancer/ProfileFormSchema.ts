import { z } from "zod";

export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_PROFILE_IMAGE_TYPES: string[] = ["image/jpeg", "image/png"];

export const LANGUAGE_OPTIONS = [
  "한국어",
  "영어",
  "일본어",
  "중국어",
  "독일어",
  "프랑스어",
  "스페인어",
] as const;

const requiredTrimmedString = (message: string, maxLength: number) =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .max(maxLength, `${maxLength}자 이하로 입력해 주세요.`);

const optionalNonEmptyStringArray = z
  .array(z.string().trim().min(1, "빈 언어 값은 추가할 수 없습니다."))
  .default([]);

export const profileFormSchema = z
  .object({
    display_name: requiredTrimmedString("활동명을 입력해 주세요.", 50),
    headline: requiredTrimmedString("한 줄 소개를 입력해 주세요.", 100),
    bio: requiredTrimmedString("자기소개를 입력해 주세요.", 2000),
    region: requiredTrimmedString("활동 지역을 입력해 주세요.", 100),
    career_years: z
      .number({ invalid_type_error: "경력 연수는 숫자로 입력해 주세요." })
      .int("경력 연수는 정수로 입력해 주세요.")
      .min(0, "경력 연수는 0년 이상이어야 합니다.")
      .max(50, "경력 연수는 50년 이하로 입력해 주세요.")
      .optional(),
    base_price_min: z
      .number({ required_error: "최소 가격을 입력해 주세요.", invalid_type_error: "최소 가격은 숫자로 입력해 주세요." })
      .int("최소 가격은 정수로 입력해 주세요.")
      .min(0, "최소 가격은 0원 이상이어야 합니다."),
    base_price_max: z
      .number({ required_error: "최대 가격을 입력해 주세요.", invalid_type_error: "최대 가격은 숫자로 입력해 주세요." })
      .int("최대 가격은 정수로 입력해 주세요.")
      .min(0, "최대 가격은 0원 이상이어야 합니다."),
    profile_image_path: z.string().optional(),
    languages: optionalNonEmptyStringArray,
    script_writing_available: z.boolean().default(false),
    rehearsal_available: z.boolean().default(false),
    travel_available: z.boolean().default(false),
  })
  .refine((values) => values.base_price_max >= values.base_price_min, {
    path: ["base_price_max"],
    message: "최대 가격은 최소 가격보다 크거나 같아야 합니다.",
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
