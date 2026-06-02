"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, X } from "lucide-react";

import { freelancerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, ErrorState } from "@/components/common/States";
import { FreelancerProfile } from "@/types";

import {
  MAX_PROFILE_IMAGE_SIZE,
  ALLOWED_PROFILE_IMAGE_TYPES,
  LANGUAGE_OPTIONS,
  profileFormSchema as schema,
  type ProfileFormValues as FormValues,
} from "@/components/freelancer/ProfileFormSchema";

function RequiredMark() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

export default function FreelancerProfilePage() {
  const queryClient = useQueryClient();
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageError, setProfileImageError] = useState("");
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const [customLanguage, setCustomLanguage] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerProfile,
    queryFn: () => freelancerApi.getProfile(),
  });

  const profile: FreelancerProfile | undefined = data?.data?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      languages: [],
    },
  });

  const selectedLanguages = watch("languages") ?? [];

  useEffect(() => {
    if (!profile) return;

    reset({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      region: profile.region ?? "",
      career_years: profile.career_years,
      base_price_min: profile.base_price_min,
      base_price_max: profile.base_price_max,
      profile_image_path: profile.profile_image_path ?? "",
      languages: profile.languages ?? [],
      script_writing_available: profile.script_writing_available,
      rehearsal_available: profile.rehearsal_available,
      travel_available: profile.travel_available,
    });

    setProfileImagePreview(profile.profile_image_url ?? "");
    setSelectedProfileImageFile(null);
    setProfileImageError("");
    setProfileImageInputKey((key) => key + 1);
  }, [profile, reset]);

  const isNew = profile?.status === "draft";

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let profileImagePath = values.profile_image_path;

      if (selectedProfileImageFile) {
        const uploadRes = await freelancerApi.uploadProfileImage(selectedProfileImageFile);
        profileImagePath = uploadRes.data.data.path;
      }

      if (!profileImagePath) {
        setError("profile_image_path", {
          type: "manual",
          message: "프로필 이미지를 업로드해 주세요.",
        });
        throw new Error("프로필 이미지를 업로드해 주세요.");
      }

      const payload = {
        ...values,
        languages: values.languages ?? [],
        profile_image_path: profileImagePath,
      };

      return isNew
        ? freelancerApi.submitProfile(payload)
        : freelancerApi.updateProfile(payload);
    },
    onSuccess: () => {
      setSelectedProfileImageFile(null);
      setProfileImageInputKey((key) => key + 1);
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    },
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: () => freelancerApi.deleteProfileImage(),
    onSuccess: () => {
      setSelectedProfileImageFile(null);
      setProfileImagePreview("");
      setProfileImageError("");
      setProfileImageInputKey((key) => key + 1);
      setValue("profile_image_path", "", { shouldDirty: true, shouldValidate: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    },
  });

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setProfileImageError("");

    if (!file) {
      setSelectedProfileImageFile(null);
      return;
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setSelectedProfileImageFile(null);
      setProfileImageError("프로필 이미지는 JPG 또는 PNG 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setSelectedProfileImageFile(null);
      setProfileImageError("프로필 이미지는 5MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setSelectedProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setValue("profile_image_path", profile?.profile_image_path ?? "", { shouldDirty: true });
  };

  const handleProfileImageRemove = () => {
    setProfileImageError("");

    if (selectedProfileImageFile) {
      setSelectedProfileImageFile(null);
      setProfileImagePreview(profile?.profile_image_url ?? "");
      setProfileImageInputKey((key) => key + 1);
      setValue("profile_image_path", profile?.profile_image_path ?? "", { shouldDirty: false });
      return;
    }

    if (!profile?.profile_image_path) {
      setProfileImagePreview("");
      setValue("profile_image_path", "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    deleteProfileImageMutation.mutate();
  };

  const toggleLanguage = (language: string) => {
    const exists = selectedLanguages.includes(language);
    const next = exists
      ? selectedLanguages.filter((item) => item !== language)
      : [...selectedLanguages, language];

    setValue("languages", next, { shouldDirty: true, shouldValidate: true });
  };

  const addCustomLanguage = () => {
    const language = customLanguage.trim();
    if (!language) return;

    if (!selectedLanguages.includes(language)) {
      setValue("languages", [...selectedLanguages, language], { shouldDirty: true, shouldValidate: true });
    }

    setCustomLanguage("");
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const isSaving = mutation.isPending || deleteProfileImageMutation.isPending;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 프로필</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            프로필을 완성하고 등록 신청하세요
          </p>
        </div>
        {profile && <FreelancerStatusBadge status={profile.status} />}
      </div>

      {profile?.status === "pending_review" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">검수 중입니다</p>
          <p className="mt-0.5">관리자 승인 전까지 공개 목록에 노출되지 않습니다.</p>
        </div>
      )}

      {profile?.status === "rejected" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">반려되었습니다</p>
          {profile.rejected_reason && <p className="mt-0.5">사유: {profile.rejected_reason}</p>}
        </div>
      )}

      {mutation.isSuccess && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {isNew ? "등록 신청이 완료되었습니다. 관리자 검수 후 승인됩니다." : "프로필이 저장되었습니다."}
        </p>
      )}

      {deleteProfileImageMutation.isSuccess && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          프로필 이미지가 삭제되었습니다. 새 이미지를 업로드한 뒤 저장해 주세요.
        </p>
      )}

      {(mutation.isError || deleteProfileImageMutation.isError) && (
        <p className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : deleteProfileImageMutation.error instanceof Error
              ? deleteProfileImageMutation.error.message
              : "요청 처리에 실패했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <input type="hidden" {...register("profile_image_path")} />

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">활동명 <RequiredMark /></Label>
              <Input id="display_name" placeholder="MC 홍길동" {...register("display_name")} />
              {errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="headline">한 줄 소개 <RequiredMark /></Label>
              <Input id="headline" placeholder="10년 경력의 기업행사 전문 MC" {...register("headline")} />
              {errors.headline && <p className="text-xs text-destructive">{errors.headline.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">자기소개 <RequiredMark /></Label>
              <Textarea id="bio" rows={5} placeholder="경력과 전문성을 소개해 주세요" {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="region">활동 지역 <RequiredMark /></Label>
                <Input id="region" placeholder="서울" {...register("region")} />
                {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="career_years">경력 연수</Label>
                <Input
                  id="career_years"
                  type="number"
                  min={0}
                  max={50}
                  inputMode="numeric"
                  placeholder="선택 입력"
                  {...register("career_years", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.career_years && <p className="text-xs text-destructive">{errors.career_years.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image">프로필 이미지 <RequiredMark /></Label>
              {profileImagePreview ? (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="h-32 w-32 overflow-hidden rounded-xl border border-line bg-muted">
                    <img src={profileImagePreview} alt="프로필 이미지 미리보기" className="h-full w-full object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleProfileImageRemove}
                    disabled={isSaving}
                  >
                    {selectedProfileImageFile ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    {selectedProfileImageFile ? "선택 취소" : "이미지 삭제"}
                  </Button>
                </div>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-line bg-muted text-xs text-muted-foreground">
                  이미지 없음
                </div>
              )}
              <Input
                key={profileImageInputKey}
                id="profile_image"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleProfileImageChange}
              />
              <p className="text-xs text-muted-foreground">
                JPG 또는 PNG 파일, 최대 5MB까지 업로드할 수 있습니다. 새 이미지를 선택하고 저장하면 기존 이미지는 자동 정리됩니다.
              </p>
              {profileImageError && <p className="text-xs text-destructive">{profileImageError}</p>}
              {errors.profile_image_path && <p className="text-xs text-destructive">{errors.profile_image_path.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">가능 언어</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((language) => {
                const active = selectedLanguages.includes(language);
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                      active
                        ? "border-navy bg-navy text-white"
                        : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
                    }`}
                  >
                    {language}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                value={customLanguage}
                onChange={(event) => setCustomLanguage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomLanguage();
                  }
                }}
                placeholder="기타 언어 직접 입력"
              />
              <Button type="button" variant="outline" onClick={addCustomLanguage}>
                추가
              </Button>
            </div>

            {selectedLanguages.length > 0 && (
              <div className="flex flex-wrap gap-2 rounded-xl bg-surface p-3">
                {selectedLanguages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-text shadow-sm hover:text-destructive"
                  >
                    {language}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {errors.languages && <p className="text-xs text-destructive">{errors.languages.message}</p>}
            <p className="text-xs text-muted-foreground">한국어, 영어, 독일어, 프랑스어 등 실제 진행 가능한 언어를 선택하거나 직접 입력하세요.</p>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">가격 & 가능 여부</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>최소 가격 (원) <RequiredMark /></Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="300000"
                  {...register("base_price_min", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.base_price_min && <p className="text-xs text-destructive">{errors.base_price_min.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>최대 가격 (원) <RequiredMark /></Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="1000000"
                  {...register("base_price_max", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.base_price_max && <p className="text-xs text-destructive">{errors.base_price_max.message}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { name: "script_writing_available" as const, label: "대본 작성 가능" },
                { name: "rehearsal_available" as const, label: "리허설 가능" },
                { name: "travel_available" as const, label: "출장 가능" },
              ].map(({ name, label }) => (
                <label key={name} className="flex cursor-pointer items-center gap-2">
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
          disabled={(!isDirty && !isNew && !selectedProfileImageFile) || isSaving}
        >
          {isSaving ? "처리 중..." : isNew ? "등록 신청하기" : "프로필 저장"}
        </Button>
      </form>
    </div>
  );
}
