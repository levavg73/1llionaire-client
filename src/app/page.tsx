import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Star, Shield, Clock, ChevronRight, PlayCircle } from "lucide-react";

// ── 메타데이터 ────────────────────────────────────────────────
// layout.tsx의 메타를 상속하되 페이지 전용 title만 override
export const metadata: Metadata = {
  title: "프리마이크 | 전문 진행자 매칭 플랫폼",
  description: "검증된 전문 MC·아나운서·쇼호스트를 행사에 연결합니다. 기업행사, 웨딩, 라이브커머스, 컨퍼런스 진행자 섭외 플랫폼.",
};

// ── 데이터 ────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Shield,
    title: "검증된 전문가",
    desc: "관리자 심사를 통과한 검증된 진행자만 등록됩니다",
  },
  {
    icon: Star,
    title: "평점 기반 매칭",
    desc: "실제 고객 후기와 평점으로 최적의 진행자를 찾아드립니다",
  },
  {
    icon: Clock,
    title: "신속한 후보 추천",
    desc: "전문 매니저가 엄선한 맞춤 후보를 빠르게 제안합니다",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "요청서 작성", desc: "행사 정보와 원하는 진행자 조건을 입력하세요" },
  { step: "02", title: "후보 추천", desc: "전문 매니저의 큐레이션으로 딱 맞는 후보를 제안받으세요" },
  { step: "03", title: "상담 & 견적", desc: "후보 프로필 확인 후 견적을 요청하세요" },
  { step: "04", title: "예약 확정", desc: "견적 수락 후 예약이 확정됩니다" },
];

// ── 컴포넌트 ─────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-clear text-text">

      {/* ── Hero ─────────────────────────────────────────────
       * 모바일: 최소 높이 480px, 텍스트 크기 축소
       * 태블릿: 560px
       * 데스크톱: 660px
       *
       * Lighthouse:
       * - priority + fetchPriority="high" → LCP 이미지 즉시 로드
       * - sizes 속성으로 적절한 이미지 크기 요청
       * - aria-hidden 오버레이 div → 접근성
       */}
      <section
        className="relative min-h-[480px] overflow-hidden bg-clear sm:min-h-[560px] lg:min-h-[660px]"
        aria-label="히어로 섹션"
      >
        <Image
          src="/hero-broadcast.webp"
          alt="행사 진행자가 마이크를 들고 무대에서 진행하는 모습"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
          quality={85}
        />

        {/* 그라데이션 오버레이 */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-clear via-clear/95 to-clear/20 dark:from-[#080913] dark:via-[#080913]/92 dark:to-[#080913]/30"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(97,92,255,0.12),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(46,55,138,0.14),_transparent_42%)]"
          aria-hidden="true"
        />

        {/* 히어로 콘텐츠 */}
        <div className="container relative mx-auto flex min-h-[480px] max-w-7xl items-center px-4 py-12 sm:min-h-[560px] sm:py-16 lg:min-h-[660px] lg:py-20">
          <div className="max-w-4xl">
            {/* 배지 */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lavender/20 bg-card/90 px-3 py-1.5 text-[13px] font-bold text-lavender shadow-sm backdrop-blur sm:mb-7 sm:px-4 sm:py-2 sm:text-[15px]">
              <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              전문 진행자 매칭 플랫폼
            </div>

            {/* 제목 — 모바일 28px / 태블릿 42px / 데스크톱 64px */}
            <h1 className="mb-5 text-[28px] font-extrabold leading-[1.15] tracking-[-0.04em] text-text sm:mb-7 sm:text-[42px] md:text-[54px] lg:text-[64px] lg:leading-[1.1]">
              섭외 고민은 끝,
              <br />
              <span className="bg-gradient-to-r from-navy to-lavender bg-clip-text text-transparent">
                행사에 딱 맞는 전문가를
              </span>
              <br />
              지금 바로 연결합니다
            </h1>

            {/* 소개 — 모바일 15px / 데스크톱 21px */}
            <p className="mb-7 max-w-2xl text-[15px] font-medium leading-[1.7] text-slate sm:mb-10 sm:text-[17px] md:text-[19px] lg:max-w-4xl lg:text-[21px] lg:leading-[1.75]">
              기업행사, 웨딩, 라이브커머스, 컨퍼런스에 필요한
              <br className="hidden sm:block" />
              전문 MC · 아나운서 · 쇼호스트를 빠르고 정확하게
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/signup">
                <Button size="lg" variant="primaryCta" className="text-[15px] sm:text-base">
                  진행자 섭외 요청하기
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>

              <Link href="/freelancers">
                <Button size="lg" variant="secondaryCta" className="text-[15px] sm:text-base">
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  진행자 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section
        className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:py-20"
        aria-labelledby="features-heading"
      >
        <div className="mb-10 text-center sm:mb-14">
          <h2
            id="features-heading"
            className="mb-3 text-[26px] font-extrabold tracking-[-0.03em] text-text sm:text-[30px] lg:text-[34px]"
          >
            왜 프리마이크인가요?
          </h2>
          <p className="text-[16px] font-medium text-slate sm:text-[18px]">
            전문성과 신뢰를 기반으로 최적의 진행자를 연결합니다
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-7"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-light sm:mb-5 sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 text-lavender sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-[18px] font-bold text-text sm:text-[21px]">
                {title}
              </h3>
              <p className="text-[14px] leading-relaxed text-slate sm:text-[16px]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="bg-surface py-12 sm:py-16 lg:py-20" aria-labelledby="how-heading">
        <div className="container mx-auto max-w-7xl px-4">
          <h2
            id="how-heading"
            className="mb-10 text-center text-[26px] font-extrabold tracking-[-0.03em] text-text sm:mb-14 sm:text-[30px] lg:text-[34px]"
          >
            이용 방법
          </h2>

          <ol className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <li key={step} className="text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy to-lavender text-[13px] font-bold text-white shadow-sm sm:mb-4 sm:h-12 sm:w-12 sm:text-[14px]">
                  {step}
                </div>
                <h3 className="mb-2 text-[17px] font-bold text-text sm:text-[19px]">
                  {title}
                </h3>
                <p className="text-[13px] leading-relaxed text-slate sm:text-[15px]">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section
        className="container mx-auto max-w-7xl px-4 py-12 text-center sm:py-16 lg:py-20"
        aria-labelledby="cta-heading"
      >
        <h2
          id="cta-heading"
          className="mb-3 text-[26px] font-extrabold tracking-[-0.03em] text-text sm:mb-4 sm:text-[30px] lg:text-[34px]"
        >
          지금 바로 시작하세요
        </h2>
        <p className="mb-7 text-[16px] font-medium text-slate sm:mb-8 sm:text-[18px]">
          전문 진행자와의 연결, 프리마이크가 도와드립니다
        </p>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          <Link href="/signup">
            <Button size="lg" variant="primaryCta">
              고객으로 시작하기
            </Button>
          </Link>
          <Link href="/signup?role=freelancer">
            <Button size="lg" variant="tertiary">
              진행자로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-line bg-card py-6 sm:py-8" role="contentinfo">
        <div className="container mx-auto flex max-w-7xl items-center justify-center px-4 text-[13px] text-slate sm:text-[14px]">
          <p>© 2026 FreeMic. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
