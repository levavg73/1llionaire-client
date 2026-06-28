"use client";

import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mic2, Trash2, X } from "lucide-react";

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
  MAX_SIGNATURE_VOICE_SIZE,
  ALLOWED_PROFILE_IMAGE_TYPES,
  ALLOWED_SIGNATURE_VOICE_TYPES,
  LANGUAGE_OPTIONS,
  CATEGORY_OPTIONS,
  STYLE_OPTIONS,
  REGION_OPTIONS,
  profileFormSchema as schema,
  type ProfileFormValues as FormValues,
} from "@/components/freelancer/ProfileFormSchema";

function RequiredMark() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

type MultiValueFieldName = "languages" | "categories" | "styles" | "available_regions";

function ChipSelector({
  label,
  required,
  options,
  selected,
  customValue,
  customPlaceholder,
  description,
  error,
  onToggle,
  onCustomValueChange,
  onAddCustom,
}: {
  label: string;
  required?: boolean;
  options: readonly string[];
  selected: string[];
  customValue: string;
  customPlaceholder: string;
  description?: string;
  error?: string;
  onToggle: (value: string) => void;
  onCustomValueChange: (value: string) => void;
  onAddCustom: () => void;
}) {
  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onAddCustom();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>
          {label} {required && <RequiredMark />}
        </Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(event) => onCustomValueChange(event.target.value)}
          onKeyDown={handleEnter}
          placeholder={customPlaceholder}
        />
        <Button type="button" variant="outline" onClick={onAddCustom}>
          추가
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl bg-surface p-3">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-text shadow-sm hover:text-destructive"
            >
              {value}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function FreelancerProfilePage() {
  const queryClient = useQueryClient();
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageError, setProfileImageError] = useState("");
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const [selectedSignatureVoiceFile, setSelectedSignatureVoiceFile] = useState<File | null>(null);
  const [signatureVoicePreview, setSignatureVoicePreview] = useState("");
  const [signatureVoiceError, setSignatureVoiceError] = useState("");
  const [signatureVoiceInputKey, setSignatureVoiceInputKey] = useState(0);
  const [customLanguage, setCustomLanguage] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customRegion, setCustomRegion] = useState("");

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
      categories: [],
      styles: [],
      available_regions: [],
      script_writing_available: false,
      rehearsal_available: false,
      travel_available: false,
      signature_voice_path: "",
    },
  });

  const selectedLanguages = watch("languages") ?? [];
  const selectedCategories = watch("categories") ?? [];
  const selectedStyles = watch("styles") ?? [];
  const selectedAvailableRegions = watch("available_regions") ?? [];

  useEffect(() => {
    if (!profile) return;

    reset({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      region: profile.region ?? "",
      available_regions: profile.available_regions ?? [],
      categories: profile.categories ?? [],
      styles: profile.styles ?? [],
      career_years: profile.career_years,
      base_price_min: profile.base_price_min,
      base_price_max: profile.base_price_max,
      profile_image_path: profile.profile_image_path ?? "",
      signature_voice_path: profile.signature_voice_path ?? "",
      languages: profile.languages ?? [],
      script_writing_available: profile.script_writing_available,
      rehearsal_available: profile.rehearsal_available,
      travel_available: profile.travel_available,
    });

    setProfileImagePreview(profile.profile_image_url ?? "");
    setSelectedProfileImageFile(null);
    setProfileImageError("");
    setProfileImageInputKey((key) => key + 1);
    setSignatureVoicePreview(profile.signature_voice_url ?? "");
    setSelectedSignatureVoiceFile(null);
    setSignatureVoiceError("");
    setSignatureVoiceInputKey((key) => key + 1);
  }, [profile, reset]);

  const isNew = profile?.status === "draft";

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let profileImagePath = values.profile_image_path;
      let signatureVoicePath = values.signature_voice_path;

      if (selectedProfileImageFile) {
        const uploadRes = await freelancerApi.uploadProfileImage(selectedProfileImageFile);
        profileImagePath = uploadRes.data.data.path;
      }

      if (selectedSignatureVoiceFile) {
        const uploadRes = await freelancerApi.uploadSignatureVoice(selectedSignatureVoiceFile);
        signatureVoicePath = uploadRes.data.data.path;
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
        categories: values.categories ?? [],
        styles: values.styles ?? [],
        available_regions: values.available_regions ?? [],
        profile_image_path: profileImagePath,
        signature_voice_path: signatureVoicePath || undefined,
      };

      return isNew
        ? freelancerApi.submitProfile(payload)
        : freelancerApi.updateProfile(payload);
    },
    onSuccess: () => {
      setSelectedProfileImageFile(null);
      setSelectedSignatureVoiceFile(null);
      setProfileImageInputKey((key) => key + 1);
      setSignatureVoiceInputKey((key) => key + 1);
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

  const deleteSignatureVoiceMutation = useMutation({
    mutationFn: () => freelancerApi.deleteSignatureVoice(),
    onSuccess: () => {
      setSelectedSignatureVoiceFile(null);
      setSignatureVoicePreview("");
      setSignatureVoiceError("");
      setSignatureVoiceInputKey((key) => key + 1);
      setValue("signature_voice_path", "", { shouldDirty: true, shouldValidate: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    },
  });

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSignatureVoiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSignatureVoiceError("");

    if (!file) {
      setSelectedSignatureVoiceFile(null);
      return;
    }

    if (!ALLOWED_SIGNATURE_VOICE_TYPES.includes(file.type)) {
      setSelectedSignatureVoiceFile(null);
      setSignatureVoiceError("시그니처 보이스는 MP3, WAV, M4A, WEBM 오디오 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIGNATURE_VOICE_SIZE) {
      setSelectedSignatureVoiceFile(null);
      setSignatureVoiceError("시그니처 보이스는 10MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setSelectedSignatureVoiceFile(file);
    setSignatureVoicePreview(URL.createObjectURL(file));
    setValue("signature_voice_path", profile?.signature_voice_path ?? "", { shouldDirty: true });
  };

  const handleSignatureVoiceRemove = () => {
    setSignatureVoiceError("");

    if (selectedSignatureVoiceFile) {
      setSelectedSignatureVoiceFile(null);
      setSignatureVoicePreview(profile?.signature_voice_url ?? "");
      setSignatureVoiceInputKey((key) => key + 1);
      setValue("signature_voice_path", profile?.signature_voice_path ?? "", { shouldDirty: false });
      return;
    }

    if (!profile?.signature_voice_path) {
      setSignatureVoicePreview("");
      setValue("signature_voice_path", "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    deleteSignatureVoiceMutation.mutate();
  };

  const toggleValue = (fieldName: MultiValueFieldName, selectedValues: string[], value: string) => {
    const exists = selectedValues.includes(value);
    const next = exists
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setValue(fieldName, next, { shouldDirty: true, shouldValidate: true });
  };

  const addCustomValue = (
    fieldName: MultiValueFieldName,
    selectedValues: string[],
    value: string,
    onClear: () => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (!selectedValues.includes(trimmed)) {
      setValue(fieldName, [...selectedValues, trimmed], { shouldDirty: true, shouldValidate: true });
    }

    onClear();
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const isSaving = mutation.isPending || deleteProfileImageMutation.isPending || deleteSignatureVoiceMutation.isPending;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 프로필</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            분야·스타일·가능 지역과 포트폴리오를 완성해 매칭 정확도를 높이세요
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

      {deleteSignatureVoiceMutation.isSuccess && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          시그니처 보이스가 삭제되었습니다. 업로드하지 않으면 진행자 찾기 페이지에 재생 플레이어가 표시되지 않습니다.
        </p>
      )}

      {(mutation.isError || deleteProfileImageMutation.isError || deleteSignatureVoiceMutation.isError) && (
        <p className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : deleteProfileImageMutation.error instanceof Error
              ? deleteProfileImageMutation.error.message
              : deleteSignatureVoiceMutation.error instanceof Error
                ? deleteSignatureVoiceMutation.error.message
                : "요청 처리에 실패했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <input type="hidden" {...register("profile_image_path")} />
        <input type="hidden" {...register("signature_voice_path")} />

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
                <Label htmlFor="region">대표 활동 지역 <RequiredMark /></Label>
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
                    className="gap-1.5"
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

            <div className="space-y-1.5">
              <Label htmlFor="signature_voice">30초 시그니처 보이스</Label>
              {signatureVoicePreview ? (
                <div className="rounded-xl border border-line bg-surface p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-text">
                      <Mic2 className="h-4 w-4 text-lavender" />
                      <span>등록된 보이스 샘플</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSignatureVoiceRemove}
                      disabled={isSaving}
                      className="gap-1.5"
                    >
                      {selectedSignatureVoiceFile ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      {selectedSignatureVoiceFile ? "선택 취소" : "보이스 삭제"}
                    </Button>
                  </div>
                  <audio controls preload="none" src={signatureVoicePreview} className="w-full" />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-muted p-4 text-xs text-muted-foreground">
                  아직 시그니처 보이스가 없습니다. 업로드하지 않으면 진행자 찾기 페이지에 재생 플레이어가 표시되지 않습니다.
                </div>
              )}
              <Input
                key={signatureVoiceInputKey}
                id="signature_voice"
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/wave,audio/x-wav,audio/mp4,audio/x-m4a,audio/webm"
                onChange={handleSignatureVoiceChange}
              />
              <p className="text-xs text-muted-foreground">
                30초 내외의 음성 샘플을 권장합니다. MP3, WAV, M4A, WEBM 파일을 최대 10MB까지 업로드할 수 있습니다.
              </p>
              {signatureVoiceError && <p className="text-xs text-destructive">{signatureVoiceError}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">전문 분야 & 진행 스타일</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChipSelector
              label="가능 분야"
              required
              options={CATEGORY_OPTIONS}
              selected={selectedCategories}
              customValue={customCategory}
              customPlaceholder="기타 분야 직접 입력"
              description="고객 요청서의 행사 유형·희망 진행자 유형과 매칭되는 핵심 기준입니다."
              error={errors.categories?.message}
              onToggle={(value) => toggleValue("categories", selectedCategories, value)}
              onCustomValueChange={setCustomCategory}
              onAddCustom={() => addCustomValue("categories", selectedCategories, customCategory, () => setCustomCategory(""))}
            />

            <ChipSelector
              label="진행 스타일"
              required
              options={STYLE_OPTIONS}
              selected={selectedStyles}
              customValue={customStyle}
              customPlaceholder="기타 스타일 직접 입력"
              description="정중함, 활기, 차분함 등 고객이 비교하는 진행 톤입니다."
              error={errors.styles?.message}
              onToggle={(value) => toggleValue("styles", selectedStyles, value)}
              onCustomValueChange={setCustomStyle}
              onAddCustom={() => addCustomValue("styles", selectedStyles, customStyle, () => setCustomStyle(""))}
            />
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">가능 지역 & 언어</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChipSelector
              label="진행 가능 지역"
              required
              options={REGION_OPTIONS}
              selected={selectedAvailableRegions}
              customValue={customRegion}
              customPlaceholder="기타 지역 직접 입력"
              description="대표 활동 지역 외 출장·진행 가능한 지역을 모두 선택하세요."
              error={errors.available_regions?.message}
              onToggle={(value) => toggleValue("available_regions", selectedAvailableRegions, value)}
              onCustomValueChange={setCustomRegion}
              onAddCustom={() => addCustomValue("available_regions", selectedAvailableRegions, customRegion, () => setCustomRegion(""))}
            />

            <ChipSelector
              label="가능 언어"
              options={LANGUAGE_OPTIONS}
              selected={selectedLanguages}
              customValue={customLanguage}
              customPlaceholder="기타 언어 직접 입력"
              description="실제 진행 가능한 언어를 선택하거나 직접 입력하세요."
              error={errors.languages?.message}
              onToggle={(value) => toggleValue("languages", selectedLanguages, value)}
              onCustomValueChange={setCustomLanguage}
              onAddCustom={() => addCustomValue("languages", selectedLanguages, customLanguage, () => setCustomLanguage(""))}
            />
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
          disabled={(!isDirty && !isNew && !selectedProfileImageFile && !selectedSignatureVoiceFile) || isSaving}
        >
          {isSaving ? "처리 중..." : isNew ? "등록 신청하기" : "프로필 저장"}
        </Button>
      </form>
    </div>
  );
}
