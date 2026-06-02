import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  ChevronRight,
  BadgeDollarSign,
  Calculator,
  Mic,
  PlayCircle,
  Shield,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "프리마이크 | 전문 진행자 매칭 플랫폼",
  description:
    "검증된 전문 MC·아나운서·쇼호스트를 행사에 연결합니다. 기업행사, 웨딩, 라이브커머스, 컨퍼런스 진행자 섭외 플랫폼.",
};

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "검증된 전문가" },
  { icon: BadgeDollarSign, label: "AI 예상단가" },
  { icon: Sparkles, label: "AI 후보추천" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "검증된 전문가",
    desc: (
      <>
        관리자 심사와 프로필 확인을 거친 진행자만
        <br className="hidden lg:block" />
        <span className="lg:hidden"> </span>
        추천합니다
      </>
    ),
  },
  {
    icon: Calculator,
    title: "AI 예상단가",
    desc: "섭외 전 예산 기준을 먼저 확인합니다",
  },
  {
    icon: Sparkles,
    title: "AI 후보추천",
    desc: (
      <>
        섭외서에 작성된 조건에 맞는 후보를
        <br className="hidden lg:block" />
        <span className="lg:hidden"> </span>
        빠르게 추려줍니다
      </>
    ),
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "요청서 작성", desc: "일정·장소·행사 조건 입력" },
  { step: "02", title: "AI 후보 추천", desc: "조건 기반 후보 빠른 비교" },
  { step: "03", title: "진행자와 고객 간 협의", desc: "견적·일정·진행 조건 조율" },
  { step: "04", title: "예약 확정", desc: "수락 후 행사 예약 완료" },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-clear text-text">
      <section className="relative overflow-hidden bg-clear" aria-label="히어로 섹션">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,_rgba(97,92,255,0.16),_transparent_34%),radial-gradient(circle_at_90%_10%,_rgba(49,54,142,0.12),_transparent_32%)]" aria-hidden="true" />

        <div className="relative min-h-[620px] overflow-hidden sm:min-h-[620px] lg:min-h-[680px]">
          <Image
            src="/hero-broadcast.webp"
            alt="전문 진행자가 마이크를 들고 행사 현장에서 진행하는 모습"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[68%_center] sm:object-center"
            quality={78}
          />

          <div
            className="absolute inset-0 bg-gradient-to-b from-clear/5 via-clear/72 to-clear dark:from-[#080913]/8 dark:via-[#080913]/72 dark:to-[#080913] sm:bg-gradient-to-r sm:from-clear sm:via-clear/92 sm:to-clear/20 dark:sm:from-[#080913] dark:sm:via-[#080913]/88 dark:sm:to-[#080913]/24"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_0%,_rgba(0,0,0,0.03)_100%)] dark:bg-[linear-gradient(to_bottom,_transparent_0%,_rgba(0,0,0,0.28)_100%)]"
            aria-hidden="true"
          />

          <div className="container relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-10 pt-36 sm:min-h-[620px] sm:items-center sm:px-6 sm:py-16 lg:min-h-[680px] lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-card/88 px-3 py-1.5 text-[13px] font-bold text-lavender shadow-sm backdrop-blur sm:mb-6 sm:px-4 sm:py-2 sm:text-[15px]">
                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                전문 진행자 매칭 플랫폼
              </div>

              <h1 className="text-[38px] font-extrabold leading-[1.08] tracking-[-0.055em] text-text sm:text-[52px] md:text-[60px] lg:text-[72px]">
                행사에 맞는
                <br />
                <span className="text-navy drop-shadow-[0_2px_18px_rgba(67,74,206,0.22)] dark:text-[#9b92ff] dark:drop-shadow-[0_2px_22px_rgba(155,146,255,0.32)]">
                  진행자를 빠르게
                </span>
                <br />
                찾으세요
              </h1>

              <p className="mt-5 max-w-2xl text-[16px] font-semibold leading-[1.72] text-slate dark:text-white/80 sm:mt-6 sm:text-[18px] lg:text-[21px] lg:leading-[1.65]">
                <span>기업행사·웨딩·라이브커머스·컨퍼런스에 맞는</span>
                <br className="block lg:hidden" />
                <span className="hidden lg:inline"> </span>
                <span>전문 MC·아나운서·쇼호스트를</span>
                <br className="hidden lg:block" />
                <span className="lg:mt-1 lg:inline-block">후기와 검증 기준으로 추천합니다.</span>
              </p>

              <ul className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3" aria-label="프리마이크 신뢰 요소">
                {TRUST_POINTS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card/88 px-3 py-2 text-[12px] font-bold text-text shadow-sm backdrop-blur sm:px-4 sm:text-[14px]"
                  >
                    <Icon className="h-3.5 w-3.5 text-lavender sm:h-4 sm:w-4" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" variant="primaryCta" className="h-[52px] w-full text-[16px] sm:w-auto sm:text-[17px]">
                    진행자 섭외 요청하기
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>

                <Link href="/freelancers" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondaryCta" className="h-[52px] w-full text-[16px] sm:w-auto sm:text-[17px]">
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    진행자 둘러보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-labelledby="features-heading">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <h2 id="features-heading" className="text-[30px] font-extrabold tracking-[-0.04em] text-text sm:text-[40px] lg:text-[46px]">
            왜 프리마이크인가요?
          </h2>
          <p className="mt-3 text-[16px] font-medium leading-relaxed text-slate sm:text-[19px]">
            검증, 예상단가, AI 후보 추천을 한 번에 확인할 수 있습니다
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-5 lg:gap-7">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-line bg-card p-4 shadow-sm sm:block sm:p-6 lg:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lavender-light sm:mb-6 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                <Icon className="h-5 w-5 text-lavender sm:h-6 sm:w-6 lg:h-7 lg:w-7" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-[19px] font-extrabold tracking-[-0.03em] text-text sm:text-[22px] lg:text-[26px]">
                  {title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate sm:mt-3 sm:text-[16px] lg:text-[18px]">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-12 sm:py-16 lg:py-20" aria-labelledby="how-heading">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
            <h2 id="how-heading" className="text-[30px] font-extrabold tracking-[-0.04em] text-text sm:text-[40px] lg:text-[46px]">
              이용 방법
            </h2>
            <p className="mt-3 text-[16px] font-medium leading-relaxed text-slate sm:text-[19px]">
              요청부터 예약까지 네 단계로 간단하게 진행됩니다
            </p>
          </div>

          <ol className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <li key={step} className="rounded-2xl border border-line bg-card p-4 text-left shadow-sm sm:p-6 lg:p-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-navy to-lavender text-[14px] font-extrabold text-white shadow-sm sm:h-12 sm:w-12 sm:text-[15px] lg:h-14 lg:w-14">
                  {step}
                </div>
                <h3 className="text-[18px] font-extrabold tracking-[-0.03em] text-text sm:text-[22px] lg:text-[25px]">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate sm:mt-2 sm:text-[15px] lg:text-[17px]">
                  {desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="text-[30px] font-extrabold tracking-[-0.04em] text-text sm:text-[40px] lg:text-[46px]">
          행사에 맞는 진행자를 찾고 계신가요?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[16px] font-medium leading-relaxed text-slate sm:text-[19px]">
          요청서를 작성하면 행사 조건을 바탕으로 어울리는 후보를 비교할 수 있습니다.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="primaryCta" className="w-full sm:w-auto">
              고객으로 시작하기
            </Button>
          </Link>
          <Link href="/signup?role=freelancer" className="w-full sm:w-auto">
            <Button size="lg" variant="tertiary" className="w-full sm:w-auto">
              진행자로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-line bg-card py-6 sm:py-8" role="contentinfo">
        <div className="container mx-auto flex max-w-7xl items-center justify-center px-4 text-[13px] text-slate sm:text-[14px]">
          <p>© 2026 FreeMic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
