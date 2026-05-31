"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { freelancerApi } from "@/lib/api";
import { optionalHttpsUrl, optionalTrimmedString } from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, ErrorState } from "@/components/common/States";
import { FreelancerProfile } from "@/types";

const schema = z
  .object({
    display_name: z.string().trim().min(1, "활동명을 입력해 주세요.").max(80, "활동명은 80자 이하로 입력해 주세요."),
    headline: optionalTrimmedString(150, "한 줄 소개는 150자 이하로 입력해 주세요."),
    bio: optionalTrimmedString(2000, "자기소개는 2000자 이하로 입력해 주세요."),
    region: optionalTrimmedString(50, "활동 지역은 50자 이하로 입력해 주세요."),
    career_years: z.number().int().min(0).max(50, "경력 연수는 50년 이하로 입력해 주세요.").optional(),
    base_price_min: z.number().int().min(0).optional(),
    base_price_max: z.number().int().min(0).optional(),
    profile_image_url: optionalHttpsUrl(),
    script_writing_available: z.boolean().optional(),
    rehearsal_available: z.boolean().optional(),
    travel_available: z.boolean().optional(),
  })
  .refine((data) => !data.base_price_min || !data.base_price_max || data.base_price_min <= data.base_price_max, {
    path: ["base_price_max"],
    message: "최대 가격은 최소 가격보다 크거나 같아야 합니다.",
  });
type FormValues = z.infer<typeof schema>;

export default function FreelancerProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerProfile,
    queryFn: () => freelancerApi.getProfile(),
  });
  const profile: FreelancerProfile | undefined = data?.data?.data;

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) reset({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      region: profile.region ?? "",
      career_years: profile.career_years,
      base_price_min: profile.base_price_min,
      base_price_max: profile.base_price_max,
      profile_image_url: profile.profile_image_url ?? "",
      script_writing_available: profile.script_writing_available,
      rehearsal_available: profile.rehearsal_available,
      travel_available: profile.travel_available,
    });
  }, [profile, reset]);

  const isNew = profile?.status === "draft";

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      isNew ? freelancerApi.submitProfile(data) : freelancerApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    },
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">내 프로필</h1>
          <p className="text-muted-foreground text-sm mt-1">프로필을 완성하고 등록 신청하세요</p>
        </div>
        {profile && <FreelancerStatusBadge status={profile.status} />}
      </div>

      {profile?.status === "pending_review" && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <p className="font-medium">검수 중입니다</p>
          <p className="mt-0.5">관리자 승인 전까지 공개 목록에 노출되지 않습니다.</p>
        </div>
      )}
      {profile?.status === "rejected" && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          <p className="font-medium">반려되었습니다</p>
          {profile.rejected_reason && <p className="mt-0.5">사유: {profile.rejected_reason}</p>}
        </div>
      )}

      {mutation.isSuccess && (
        <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {isNew ? "등록 신청이 완료되었습니다. 관리자 검수 후 승인됩니다." : "프로필이 저장되었습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">활동명 <span className="text-destructive">*</span></Label>
              <Input id="display_name" placeholder="MC 홍길동" {...register("display_name")} />
              {errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">한 줄 소개</Label>
              <Input id="headline" placeholder="10년 경력의 기업행사 전문 MC" {...register("headline")} />
              {errors.headline && <p className="text-xs text-destructive">{errors.headline.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">자기소개</Label>
              <Textarea id="bio" rows={5} placeholder="경력과 전문성을 소개해 주세요" {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="region">활동 지역</Label>
                <Input id="region" placeholder="서울" {...register("region")} />
                {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="career_years">경력 연수</Label>
                <Input id="career_years" type="number" min={0} max={50} inputMode="numeric" {...register("career_years", { setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                {errors.career_years && <p className="text-xs text-destructive">{errors.career_years.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile_image_url">프로필 이미지 URL</Label>
              <Input id="profile_image_url" type="url" placeholder="https://..." {...register("profile_image_url")} />
              {errors.profile_image_url && <p className="text-xs text-destructive">{errors.profile_image_url.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">가격 & 가능 여부</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>최소 가격 (원)</Label>
                <Input type="number" min={0} inputMode="numeric" placeholder="300000" {...register("base_price_min", { setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                {errors.base_price_min && <p className="text-xs text-destructive">{errors.base_price_min.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>최대 가격 (원)</Label>
                <Input type="number" min={0} inputMode="numeric" placeholder="1000000" {...register("base_price_max", { setValueAs: (v) => v === "" ? undefined : Number(v) })} />
                {errors.base_price_max && <p className="text-xs text-destructive">{errors.base_price_max.message}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { name: "script_writing_available" as const, label: "대본 작성 가능" },
                { name: "rehearsal_available" as const, label: "리허설 가능" },
                { name: "travel_available" as const, label: "출장 가능" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register(name)} className="rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-navy text-white hover:bg-navy-light"
          size="lg"
          disabled={(!isDirty && !isNew) || mutation.isPending}
        >
          {mutation.isPending ? "저장 중..." : isNew ? "등록 신청하기" : "프로필 저장"}
        </Button>
      </form>
    </div>
  );
}
