"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SaveFreelancerButtonProps {
  freelancerId: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  showLabel?: boolean;
}

export function SaveFreelancerButton({
  freelancerId,
  className,
  variant = "outline",
  size = "default",
  showLabel = true,
}: SaveFreelancerButtonProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const enabled = user?.user_type === "customer";
  const { data } = useQuery({
    queryKey: queryKeys.savedFreelancers,
    queryFn: () => customerApi.getSavedFreelancers({ limit: 100 }),
    enabled,
  });

  const savedItems = data?.data?.data?.items ?? [];
  const isSaved = savedItems.some((item) => item.freelancer_id === freelancerId);

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (isSaved) {
        await customerApi.unsaveFreelancer(freelancerId);
        return;
      }

      await customerApi.saveFreelancer(freelancerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedFreelancers });
    },
  });

  if (isLoading) {
    return (
      <Button type="button" variant={variant} size={size} className={className} disabled>
        <Bookmark className="h-4 w-4" />
        {showLabel && "확인 중..."}
      </Button>
    );
  }

  if (user && user.user_type !== "customer") {
    return null;
  }

  if (!user) {
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <Link href={`/login${next}`}>
          <Bookmark className="h-4 w-4" />
          {showLabel && "저장하려면 로그인"}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={mutation.isPending || isLoading}
      onClick={() => mutation.mutate()}
      aria-pressed={isSaved}
    >
      <Bookmark className={cn("h-4 w-4", isSaved && "fill-gold text-gold")} />
      {showLabel && (mutation.isPending ? "처리 중..." : isSaved ? "저장됨" : "저장하기")}
    </Button>
  );
}
