"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { freelancerApi } from "@/lib/api";
import { normalizeOptionalUrl, optionalHttpsUrl, requiredHttpsUrl, isSafeHttpsUrl } from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { Plus, Trash2, ExternalLink, Star } from "lucide-react";
import { Portfolio } from "@/types";

const schema = z.object({
  portfolio_type: z.enum(["intro_video", "event_video", "audio_sample", "other"]),
  title: z.string().trim().min(1, "제목을 입력해 주세요.").max(120, "제목은 120자 이하로 입력해 주세요."),
  description: z.string().trim().max(1000, "설명은 1000자 이하로 입력해 주세요.").optional(),
  media_url: requiredHttpsUrl(),
  thumbnail_url: optionalHttpsUrl(),
  category: z.string().trim().max(60, "카테고리는 60자 이하로 입력해 주세요.").optional(),
  is_representative: z.boolean().default(false),
  is_public: z.boolean().default(true),
});
type FormValues = z.infer<typeof schema>;

const TYPE_LABELS: Record<string, string> = {
  intro_video: "소개 영상",
  event_video: "행사 영상",
  audio_sample: "음성 샘플",
  other: "기타",
};

export default function FreelancerPortfolioPage() {
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerPortfolio,
    queryFn: () => freelancerApi.getPortfolios(),
  });
  const portfolios: Portfolio[] = data?.data?.data ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { portfolio_type: "event_video", is_public: true, is_representative: false },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      freelancerApi.createPortfolio({ ...data, thumbnail_url: normalizeOptionalUrl(data.thumbnail_url) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerPortfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
      setShowForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => freelancerApi.deletePortfolio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerPortfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">포트폴리오</h1>
          <p className="text-muted-foreground text-sm mt-1">영상·음성 URL을 등록하세요</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-navy/30">
          <CardHeader><CardTitle className="text-base">새 포트폴리오 등록</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>유형</Label>
                  <select {...register("portfolio_type")} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>카테고리</Label>
                  <Input placeholder="기업행사" {...register("category")} />
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>제목 <span className="text-destructive">*</span></Label>
                <Input placeholder="2023 삼성전자 연간 시상식 MC" {...register("title")} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>미디어 URL <span className="text-destructive">*</span></Label>
                <Input type="url" placeholder="https://youtube.com/..." {...register("media_url")} />
                {errors.media_url && <p className="text-xs text-destructive">{errors.media_url.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>썸네일 URL</Label>
                <Input type="url" placeholder="https://..." {...register("thumbnail_url")} />
                {errors.thumbnail_url && <p className="text-xs text-destructive">{errors.thumbnail_url.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>설명</Label>
                <Textarea rows={2} {...register("description")} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register("is_representative")} /> 대표 포트폴리오
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...register("is_public")} /> 공개
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-navy text-white hover:bg-navy-light" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "등록 중..." : "등록"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && portfolios.length === 0 && !showForm && (
        <EmptyState title="포트폴리오가 없습니다" description="영상이나 음성 샘플 URL을 등록해 주세요" action={{ label: "추가하기", onClick: () => setShowForm(true) }} />
      )}

      <div className="space-y-3">
        {portfolios.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{TYPE_LABELS[p.portfolio_type]}</span>
                  {p.is_representative && <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-label="대표" />}
                  {!p.is_public && <span className="text-xs text-muted-foreground">(비공개)</span>}
                </div>
                <p className="font-medium text-sm truncate">{p.title}</p>
                {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSafeHttpsUrl(p.media_url) && (
                  <a href={p.media_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" aria-label="링크 열기"><ExternalLink className="h-4 w-4" /></Button>
                  </a>
                )}
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="삭제" onClick={() => setDeleteTarget(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="포트폴리오 삭제"
        description="삭제하면 복구할 수 없습니다. 계속하시겠습니까?"
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
