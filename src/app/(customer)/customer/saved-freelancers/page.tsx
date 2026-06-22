"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, MapPin, Star } from "lucide-react";
import { customerApi } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, EmptyState, ErrorState } from "@/components/common/States";
import { SaveFreelancerButton } from "@/components/freelancer/SaveFreelancerButton";

export default function SavedFreelancersPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.savedFreelancers,
    queryFn: () => customerApi.getSavedFreelancers({ limit: 50 }),
  });

  const items = data?.data?.data?.items ?? [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">저장한 진행자</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          행사 후보로 다시 비교하고 싶은 보잇 진행자를 모아볼 수 있습니다.
        </p>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="저장한 진행자가 없습니다"
          description="진행자 상세 또는 추천 후보 화면에서 관심 있는 진행자를 저장해 보세요."
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const f = item.freelancer;
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {f.profile_image_url ? (
                      <Image src={f.profile_image_url} alt={f.display_name || "진행자"} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                        {(f.display_name || "?")[0]}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{f.display_name}</h2>
                        {f.headline && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{f.headline}</p>}
                      </div>
                      {typeof f.avg_rating === "number" && f.avg_rating > 0 && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium">
                          <Star className="h-4 w-4 fill-gold text-gold" />
                          {f.avg_rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {f.region && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {f.region}
                        </span>
                      )}
                      {f.career_years && <span>경력 {f.career_years}년</span>}
                      {f.base_price_min && f.base_price_max && (
                        <span>{formatPrice(f.base_price_min)} ~ {formatPrice(f.base_price_max)}</span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.categories.slice(0, 4).map((category) => (
                        <span key={category} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/freelancers/${f.id}`}>프로필 상세보기</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 bg-navy text-white hover:bg-navy-light">
                    <Link href={`/customer/requests/new?freelancerId=${f.id}`}>
                      <CalendarPlus className="h-3.5 w-3.5" />
                      요청서 작성
                    </Link>
                  </Button>
                  <SaveFreelancerButton freelancerId={f.id} size="sm" className="flex-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
