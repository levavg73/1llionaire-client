"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination as PaginationType } from "@/types";

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline" size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
        return (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p)}
            aria-label={`${p}페이지`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        );
      })}

      <Button
        variant="outline" size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
