import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, SlidersHorizontal, X, MessageSquareText } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FreelancerProfile } from "@/types";

export const metadata: Metadata = {
  title: "진행자 찾기",
  description: "검증된 전문 MC·아나운서·쇼호스트 목록을 확인하세요.",
};

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
    return res.data?.data ?? { items: [], pagination: null };
  } catch {
    return { items: [], pagination: null };
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

export default async function FreelancersPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const normalizedSearchParams = normalizeFreelancerSearchParams(searchParams);
  const { items } = await getFreelancers(normalizedSearchParams);
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
                  href={buildFreelancersHref(normalizedSearchParams, { sort: option.value })}
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
                href={buildFreelancersHref(normalizedSearchParams, { category: null })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-slate hover:bg-card hover:text-text"
              >
                <X className="h-3 w-3" />
                초기화
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildFreelancersHref(normalizedSearchParams, { category: null })}
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
                  href={buildFreelancersHref(normalizedSearchParams, { category: category.value })}
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

      {freelancers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">
          {selectedCategory
            ? `${getCategoryLabel(selectedCategory)} 분야에 등록된 진행자가 없습니다.`
            : "등록된 진행자가 없습니다."}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {freelancers.map((f) => (
            <Link key={f.id} href={`/freelancers/${f.id}`}>
              <article className="rounded-xl border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden group">
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
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
