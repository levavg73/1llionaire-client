"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http";
import { freelancerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import type { FreelancerAvailabilitySlot } from "@/types";

type AvailabilityFormState = {
  available_date: string;
  start_time: string;
  end_time: string;
  note: string;
};

const emptyForm: AvailabilityFormState = {
  available_date: "",
  start_time: "09:00",
  end_time: "18:00",
  note: "",
};

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));
}

function getApiErrorMessage(error: unknown) {
  const fallback = "가능 시간대 저장 중 오류가 발생했습니다.";
  const apiError = error as ApiError<{ error?: { message?: string } }>;
  return apiError?.response?.data?.error?.message || (error instanceof Error ? error.message : fallback);
}

export default function FreelancerAvailabilityPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AvailabilityFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerAvailability,
    queryFn: () => freelancerApi.getAvailability(),
  });

  const slots: FreelancerAvailabilitySlot[] = data?.data?.data ?? [];

  const groupedSlots = useMemo(() => {
    return slots.reduce<Record<string, FreelancerAvailabilitySlot[]>>((acc, slot) => {
      const key = toDateInputValue(slot.available_date);
      acc[key] = [...(acc[key] ?? []), slot];
      return acc;
    }, {});
  }, [slots]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const invalidateAvailability = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.freelancerAvailability });
  };

  const createMutation = useMutation({
    mutationFn: (payload: AvailabilityFormState) =>
      freelancerApi.createAvailability({
        ...payload,
        note: payload.note.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateAvailability();
      resetForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AvailabilityFormState }) =>
      freelancerApi.updateAvailability(id, {
        ...payload,
        note: payload.note.trim() || undefined,
      }),
    onSuccess: () => {
      invalidateAvailability();
      resetForm();
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => freelancerApi.deleteAvailability(id),
    onSuccess: () => {
      invalidateAvailability();
      resetForm();
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.available_date) {
      setFormError("가능 날짜를 입력해 주세요.");
      return;
    }

    if (form.start_time >= form.end_time) {
      setFormError("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
      return;
    }

    createMutation.mutate(form);
  };

  const startEdit = (slot: FreelancerAvailabilitySlot) => {
    setEditingId(slot.id);
    setForm({
      available_date: toDateInputValue(slot.available_date),
      start_time: slot.start_time,
      end_time: slot.end_time,
      note: slot.note ?? "",
    });
    setFormError(null);
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">가능 시간대</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI 추천은 요청서의 날짜·시간과 등록된 가능 시간대를 먼저 비교합니다. 아무 시간대도 입력하지 않으면 MVP 정책상 우선 모든 시간대가 가능하다고 간주됩니다.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "가능 시간대 수정" : "가능 시간대 등록"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="available_date">가능 날짜</Label>
                <Input
                  id="available_date"
                  type="date"
                  value={form.available_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, available_date: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start_time">시작 시간</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={form.start_time}
                  onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_time">종료 시간</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={form.end_time}
                  onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">메모</Label>
              <Textarea
                id="note"
                placeholder="예: 서울·경기 오프라인 행사 가능, 온라인만 가능 등"
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              />
            </div>

            {formError && (
              <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="bg-navy text-white hover:bg-navy-light" disabled={isSaving}>
                {isSaving ? "저장 중..." : editingId ? "수정 저장" : "등록"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>
                  취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && slots.length === 0 && (
        <EmptyState
          title="등록된 가능 시간대가 없습니다"
          description="지금은 모든 시간대가 우선 가능으로 분류됩니다. 정확한 AI 추천을 위해 가능한 날짜와 시간을 등록해 주세요."
        />
      )}

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <Card key={date}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dateSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {slot.start_time} ~ {slot.end_time}
                    </p>
                    {slot.note && <p className="mt-1 text-sm text-muted-foreground">{slot.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(slot)}>
                      <Pencil className="h-3.5 w-3.5" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs text-destructive hover:text-destructive"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(slot.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
