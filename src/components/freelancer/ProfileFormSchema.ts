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

export const CATEGORY_OPTIONS = [
  "아나운서",
  "기업행사 MC",
  "컨퍼런스 MC",
  "웨딩 사회자",
  "쇼호스트",
  "라이브커머스",
  "콘텐츠 진행자",
  "시상식 MC",
  "토크콘서트 MC",
] as const;

export const STYLE_OPTIONS = [
  "정중한",
  "전문적인",
  "활기찬",
  "친근한",
  "차분한",
  "유머러스한",
  "고급스러운",
  "신뢰감 있는",
] as const;

export const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
  "전국",
] as const;

const requiredTrimmedString = (message: string, maxLength: number) =>
  z
    .string({ required_error: message })
    .trim()
    .min(1, message)
    .max(maxLength, `${maxLength}자 이하로 입력해 주세요.`);

const optionalNonEmptyStringArray = z
  .array(z.string().trim().min(1, "빈 값은 추가할 수 없습니다.").max(50, "각 항목은 50자 이하로 입력해 주세요."))
  .default([]);

const requiredNonEmptyStringArray = (message: string, maxItems = 20) =>
  z
    .array(z.string().trim().min(1, "빈 값은 추가할 수 없습니다.").max(50, "각 항목은 50자 이하로 입력해 주세요."))
    .min(1, message)
    .max(maxItems, `${maxItems}개 이하로 선택해 주세요.`);

export const profileFormSchema = z
  .object({
    display_name: requiredTrimmedString("활동명을 입력해 주세요.", 50),
    headline: requiredTrimmedString("한 줄 소개를 입력해 주세요.", 100),
    bio: requiredTrimmedString("자기소개를 입력해 주세요.", 2000),
    region: requiredTrimmedString("대표 활동 지역을 입력해 주세요.", 100),
    available_regions: requiredNonEmptyStringArray("진행 가능한 지역을 1개 이상 선택해 주세요.", 30),
    categories: requiredNonEmptyStringArray("가능 분야를 1개 이상 선택해 주세요.", 20),
    styles: requiredNonEmptyStringArray("진행 스타일을 1개 이상 선택해 주세요.", 20),
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
