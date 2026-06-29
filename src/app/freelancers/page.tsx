import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, SlidersHorizontal, X, MessageSquareText, ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { isSafeHttpsUrl } from "@/lib/validation";
import { FreelancerProfile, Pagination } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "진행자 찾기",
  description: "검증된 전문 MC·아나운서·쇼호스트 목록을 확인하세요.",
};

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: "기업행사 MC", label: "기업행사MC" },
  { value: "웨딩 사회자", label: "웨딩 사회자" },
  { value: "쇼호스트", label: "쇼호스트" },
  { value: "컨퍼런스 MC", label: "컨퍼런스 MC" },
  { value: "라이브커머스", label: "라이브커머스" },
  { value: "아나운서", label: "아나운서" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "reviews", label: "후기순" },
] as const;

type SearchParams = Record<string, string | string[] | undefined>;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

async function getFreelancers(searchParams: SearchParams) {
  try {
    const res = await publicApi.getFreelancers(searchParams);
    return {
      ...(res.data?.data ?? { items: [], pagination: null }),
      error: null as string | null,
    };
  } catch (error) {
    return {
      items: [],
      pagination: null,
      error: error instanceof Error ? error.message : "진행자 목록을 불러오지 못했습니다.",
    };
  }
}

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSort(searchParams: SearchParams): SortValue {
  const sort = getSingleParam(searchParams, "sort");
  return SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortValue) : "popular";
}

function getPage(searchParams: SearchParams) {
  const page = Number(getSingleParam(searchParams, "page") ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function getCategory(searchParams: SearchParams) {
  const category = getSingleParam(searchParams, "category");

  if (!category || category === "all" || category === "전체") return undefined;

  return CATEGORIES.some((item) => item.value === category) ? category : undefined;
}

function normalizeFreelancerSearchParams(searchParams: SearchParams) {
  const normalized: SearchParams = { ...searchParams };
  const category = getCategory(searchParams);

  if (category) {
    normalized.category = category;
  } else {
    delete normalized.category;
  }

  normalized.sort = getSort(searchParams);
  delete normalized.limit;
  return normalized;
}

function getCategoryLabel(category?: string) {
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

function buildFreelancersHref(searchParams: SearchParams, overrides: Record<string, string | null>) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => item && params.append(key, item));
      return;
    }

    if (value) params.set(key, value);
  });

  Object.entries(overrides).forEach(([key, value]) => {
    if (!value) {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  const queryString = params.toString();
  return queryString ? `/freelancers?${queryString}` : "/freelancers";
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function PaginationNav({
  pagination,
  searchParams,
}: {
  pagination: Pagination | null;
  searchParams: SearchParams;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const showEllipsisBefore = pageNumbers[0] > 1;
  const showEllipsisAfter = pageNumbers[pageNumbers.length - 1] < totalPages;

  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label="진행자 목록 페이지">
      <p className="text-xs text-muted-foreground">
        총 {pagination.total.toLocaleString()}명 중 {(currentPage - 1) * pagination.limit + 1}–
        {Math.min(currentPage * pagination.limit, pagination.total).toLocaleString()}명 표시
      </p>

      <div className="flex items-center justify-center gap-1 rounded-2xl border border-line bg-card p-1 shadow-sm">
        <Link
          href={
            currentPage > 1
              ? buildFreelancersHref(searchParams, { page: String(currentPage - 1) })
              : buildFreelancersHref(searchParams, { page: String(currentPage) })
          }
          aria-disabled={currentPage <= 1}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            currentPage <= 1
              ? "pointer-events-none text-muted-foreground/40"
              : "text-slate hover:bg-surface hover:text-text"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">이전 페이지</span>
        </Link>

        {showEllipsisBefore && <span className="px-2 text-sm text-muted-foreground">…</span>}

        {pageNumbers.map((page) => {
          const active = page === currentPage;
          return (
            <Link
              key={page}
              href={buildFreelancersHref(searchParams, { page: String(page) })}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
                active
                  ? "bg-navy text-white shadow-sm"
                  : "text-slate hover:bg-surface hover:text-text"
              }`}
            >
              {page}
            </Link>
          );
        })}

        {showEllipsisAfter && <span className="px-2 text-sm text-muted-foreground">…</span>}

        <Link
          href={
            currentPage < totalPages
              ? buildFreelancersHref(searchParams, { page: String(currentPage + 1) })
              : buildFreelancersHref(searchParams, { page: String(currentPage) })
          }
          aria-disabled={currentPage >= totalPages}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            currentPage >= totalPages
              ? "pointer-events-none text-muted-foreground/40"
              : "text-slate hover:bg-surface hover:text-text"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">다음 페이지</span>
        </Link>
      </div>
    </nav>
  );
}

export default async function FreelancersPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const normalizedSearchParams = normalizeFreelancerSearchParams(searchParams);
  const currentPage = getPage(searchParams);
  const listSearchParams: SearchParams = {
    ...normalizedSearchParams,
    page: String(currentPage),
    limit: String(PAGE_SIZE),
  };
  const { items, pagination, error } = await getFreelancers(listSearchParams);
  const freelancers: FreelancerProfile[] = items;
  const selectedCategory = getCategory(searchParams);
  const selectedSort = getSort(searchParams);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">진행자 찾기</h1>
            <p className="text-muted-foreground mt-2">
              검증된 전문 MC·아나운서·쇼호스트를 만나보세요
            </p>
          </div>

          <div className="flex rounded-2xl border border-line bg-card p-1 shadow-sm">
            {SORT_OPTIONS.map((option) => {
              const active = selectedSort === option.value;
              return (
                <Link
                  key={option.value}
                  href={buildFreelancersHref(normalizedSearchParams, { sort: option.value, page: null })}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-navy text-white shadow-sm"
                      : "text-slate hover:bg-surface hover:text-text"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-surface/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-text">
              <SlidersHorizontal className="h-4 w-4 text-lavender" />
              분야 필터
            </div>
            {selectedCategory && (
              <Link
                href={buildFreelancersHref(normalizedSearchParams, { category: null, page: null })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-slate hover:bg-card hover:text-text"
              >
                <X className="h-3 w-3" />
                초기화
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFreelancersHref(normalizedSearchParams, { category: null, page: null })}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                !selectedCategory
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
              }`}
            >
              전체
            </Link>
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category.value;
              return (
                <Link
                  key={category.value}
                  href={buildFreelancersHref(normalizedSearchParams, { category: category.value, page: null })}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "border-navy bg-navy text-white"
                      : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="font-bold text-destructive">진행자 목록 API 연결에 실패했습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : freelancers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">
          {selectedCategory
            ? `${getCategoryLabel(selectedCategory)} 분야에 등록된 진행자가 없습니다.`
            : "등록된 진행자가 없습니다."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((f) => {
              const safeSignatureVoiceUrl = f.signature_voice_url && isSafeHttpsUrl(f.signature_voice_url)
                ? f.signature_voice_url
                : undefined;

              return (
                <article key={f.id} className="overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg">
                  <Link href={`/freelancers/${f.id}`} className="block group">
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {f.profile_image_url ? (
                        <Image
                          src={f.profile_image_url}
                          alt={f.display_name || "진행자 프로필"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy/10 to-navy/5">
                          <span className="text-5xl font-bold text-navy/20">
                            {(f.display_name || "?")[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h2 className="font-semibold truncate">{f.display_name}</h2>
                        {f.avg_rating && (
                          <span className="flex items-center gap-0.5 text-sm font-medium shrink-0">
                            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                            {f.avg_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{f.headline}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {f.categories.slice(0, 2).map((c) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                        {f.languages.slice(0, 2).map((language) => (
                          <Badge key={language} variant="outline" className="text-xs">{language}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{f.region}
                        </span>
                        {f.base_price_min && (
                          <span className="font-medium text-foreground">
                            {formatPrice(f.base_price_min)}~
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquareText className="h-3 w-3" />
                        <span>후기 {f.review_count ?? 0}개</span>
                      </div>
                    </div>
                  </Link>

                  {safeSignatureVoiceUrl && (
                    <div className="border-t border-line bg-surface/50 p-3">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-text">
                        <Volume2 className="h-3.5 w-3.5 text-lavender" />
                        <span>30초 시그니처 보이스</span>
                      </div>
                      <audio
                        controls
                        preload="none"
                        src={safeSignatureVoiceUrl}
                        className="w-full"
                        aria-label={`${f.display_name ?? "진행자"} 시그니처 보이스 재생`}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <PaginationNav pagination={pagination} searchParams={normalizedSearchParams} />
        </>
      )}
    </div>
  );
}
