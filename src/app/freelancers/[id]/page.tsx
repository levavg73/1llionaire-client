import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star, MapPin, Clock, Globe,
  FileText, Activity, Plane, ChevronLeft, CalendarDays,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { isSafeHttpsUrl } from "@/lib/validation";
import { FreelancerProfile, Review } from "@/types";

async function getFreelancer(id: string) {
  try {
    const res = await publicApi.getFreelancer(id);
    return res.data?.data as FreelancerProfile | null;
  } catch {
    return null;
  }
}

async function getReviews(id: string) {
  try {
    const res = await publicApi.getFreelancerReviews(id, { limit: 20 });
    return (res.data?.data?.items ?? []) as Review[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const f = await getFreelancer(id);
  return {
    title: f ? `${f.display_name} 진행자` : "진행자 상세",
    description: f?.headline ?? undefined,
  };
}

const SCORE_LABELS: Record<string, string> = {
  punctuality_score: "시간 준수",
  voice_delivery_score: "발성/전달력",
  event_understanding_score: "행사 이해도",
  atmosphere_score: "분위기 조율",
  script_score: "대본 이해도",
  response_score: "응답 속도",
  communication_score: "사전 소통",
};

function formatReviewDate(date?: string) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "";
  }
}

export default async function FreelancerDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { reviews?: string | string[] };
}) {
  const { id } = params;
  const reviewsParam = searchParams?.reviews;
  const shouldShowReviews = Array.isArray(reviewsParam) ? reviewsParam.includes("1") : reviewsParam === "1";
  const freelancer = await getFreelancer(id);

  if (!freelancer) notFound();

  const f = freelancer;
  const reviews = shouldShowReviews ? await getReviews(id) : [];
  const reviewsHref = `/freelancers/${f.id}?reviews=1#reviews`;
  const requestHref = `/customer/requests/new?freelancerId=${f.id}`;

  const ActionButtons = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-3 ${className}`}>
      <Button asChild variant="outline" className="w-full">
        <Link href={reviewsHref}>⭐ 후기 확인하기 ({f.review_count}개)</Link>
      </Button>

      <Link href={requestHref}>
        <Button className="w-full bg-navy text-white hover:bg-navy-light">
          이 진행자로 요청서 작성
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Link href="/freelancers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" /> 진행자 목록
      </Link>

      {/* 헤더 */}
      <div className="flex gap-6 mb-8">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-muted shrink-0">
          {f.profile_image_url ? (
            <Image src={f.profile_image_url} alt={f.display_name || ""} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
              {(f.display_name || "?")[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">{f.display_name}</h1>
          <p className="text-muted-foreground mt-1">{f.headline}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            {f.region && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{f.region}</span>}
            {f.career_years && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />경력 {f.career_years}년</span>}
            <Link href={reviewsHref} className="flex items-center gap-1 font-medium text-foreground hover:text-lavender">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              {f.avg_rating ? `${f.avg_rating.toFixed(1)} ` : "후기 "}({f.review_count}개 후기)
            </Link>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {f.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
            {f.styles.map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
            {f.languages.map((language) => <Badge key={language} variant="outline" className="text-xs">{language}</Badge>)}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 소개 */}
          {f.bio && (
            <Card>
              <CardHeader><CardTitle className="text-base">소개</CardTitle></CardHeader>
              <CardContent><p className="text-sm leading-relaxed whitespace-pre-line">{f.bio}</p></CardContent>
            </Card>
          )}

          {/* 포트폴리오 */}
          {f.portfolios && f.portfolios.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">포트폴리오</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {f.portfolios.map((p) => {
                  const safeMediaUrl = isSafeHttpsUrl(p.media_url) ? p.media_url : undefined;
                  const content = (
                    <>
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-navy truncate">{p.title}</p>
                        {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                      </div>
                      {p.is_representative && (
                        <Badge variant="gold" className="text-xs shrink-0">대표</Badge>
                      )}
                    </>
                  );

                  return safeMediaUrl ? (
                    <a key={p.id} href={safeMediaUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
                      {content}
                    </a>
                  ) : (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 text-muted-foreground">
                      {content}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <ActionButtons className="md:hidden" />

          {/* 후기: 후기 확인하기 버튼을 누른 뒤에만 표시 */}
          {shouldShowReviews && (
            <Card id="reviews">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>후기 ({f.review_count})</span>
                  {f.avg_rating && (
                    <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      평균 {f.avg_rating.toFixed(1)}점
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={r.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-medium">{r.customer?.name ?? "고객"}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {r.booking?.event_title && <span>{r.booking.event_title}</span>}
                            {r.booking?.event_date && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatReviewDate(r.booking.event_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="flex items-center gap-0.5 text-sm font-medium shrink-0">
                          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                          {Number(r.total_score.toFixed(1))}
                        </span>
                      </div>
                      {r.comment ? (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{r.comment}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">작성된 코멘트가 없습니다.</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {Object.entries(SCORE_LABELS).map(([key, label]) => (
                          <span key={key} className="text-xs text-muted-foreground">
                            {label} {(r as unknown as Record<string, number>)[key]}/5
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-surface p-4 text-sm text-muted-foreground">
                    아직 공개된 후기가 없습니다. 후기는 고객 작성 후 관리자 검수를 거쳐 공개됩니다.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드: 가격 & 조건 */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">가격 안내</CardTitle></CardHeader>
            <CardContent>
              {f.base_price_min && f.base_price_max ? (
                <p className="text-xl font-bold">
                  {formatPrice(f.base_price_min)} ~<br />
                  <span className="text-lg">{formatPrice(f.base_price_max)}</span>
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">견적 문의</p>
              )}
              <Separator className="my-3" />
              <ul className="space-y-2 text-sm">
                {[
                  { icon: FileText, label: "대본 작성", available: f.script_writing_available },
                  { icon: Activity, label: "리허설", available: f.rehearsal_available },
                  { icon: Plane, label: "출장", available: f.travel_available },
                ].map(({ icon: Icon, label, available }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={available ? "text-foreground" : "text-muted-foreground line-through"}>
                      {label} {available ? "가능" : "불가"}
                    </span>
                  </li>
                ))}
              </ul>
              {f.languages.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-2 text-sm">
                    <Globe className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <span>{f.languages.join(", ")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <ActionButtons className="hidden md:block" />
        </div>
      </div>
    </div>
  );
}
