import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Star, Shield, Clock, ChevronRight, PlayCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "프리마이크 | 전문 진행자 매칭 플랫폼",
  description: "검증된 전문 MC·아나운서·쇼호스트를 행사에 연결합니다",
};

const features = [
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
    desc: "요청서 제출 후 3시간 내 맞춤 후보를 추천받으세요",
  },
];

const categories = [
  "기업행사 MC",
  "웨딩 사회자",
  "쇼호스트",
  "컨퍼런스 MC",
  "라이브커머스",
  "아나운서",
];

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-clear text-indigo">
      {/* Hero */}
      <section className="relative overflow-hidden bg-clear">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(74,144,226,0.14),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,140,115,0.16),_transparent_38%)]" />

        <div className="container relative mx-auto max-w-7xl px-4 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-prism/20 bg-white px-4 py-1.5 text-sm font-medium text-prism shadow-sm">
              <Mic className="h-3.5 w-3.5" />
              전문 진행자 매칭 플랫폼
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-indigo md:text-5xl lg:text-6xl">
              행사를 빛낼
              <br />
              <span className="bg-gradient-to-r from-prism to-coral bg-clip-text text-transparent">
                진행자
              </span>
              를 찾아드립니다
            </h1>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate">
              기업행사, 웨딩, 라이브커머스, 컨퍼런스에 필요한 전문 MC·아나운서·쇼호스트를
              빠르고 정확하게 연결해 드립니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" variant="primaryCta">
                  진행자 섭외 요청하기
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/freelancers">
                <Button size="lg" variant="secondaryCta">
                  <PlayCircle className="h-4 w-4" />
                  진행자 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-line bg-mist">
        <div className="container mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-medium text-slate">분야별</span>

            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/freelancers?category=${encodeURIComponent(cat)}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-indigo transition-colors hover:border-prism hover:text-prism"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-indigo">
            왜 프리마이크인가요?
          </h2>
          <p className="text-slate">
            전문성과 신뢰를 기반으로 최적의 진행자를 연결합니다
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-line bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-prism-light">
                <Icon className="h-6 w-6 text-prism" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-indigo">
                {title}
              </h3>

              <p className="text-sm leading-relaxed text-slate">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-mist py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-14 text-center text-3xl font-bold text-indigo">
            이용 방법
          </h2>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "요청서 작성",
                desc: "행사 정보와 원하는 진행자 조건을 입력하세요",
              },
              {
                step: "02",
                title: "후보 추천",
                desc: "전문 매니저가 48시간 내 맞춤 후보를 추천합니다",
              },
              {
                step: "03",
                title: "상담 & 견적",
                desc: "후보 프로필 확인 후 견적을 요청하세요",
              },
              {
                step: "04",
                title: "예약 확정",
                desc: "견적 수락 후 예약이 확정됩니다",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-prism to-coral text-sm font-bold text-white shadow-sm">
                  {step}
                </div>

                <h3 className="mb-2 font-semibold text-indigo">
                  {title}
                </h3>

                <p className="text-sm text-slate">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold text-indigo">
          지금 바로 시작하세요
        </h2>

        <p className="mb-8 text-slate">
          전문 진행자와의 연결, 프리마이크가 도와드립니다
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup">
            <Button size="lg" variant="primaryCta">
              고객으로 시작하기
            </Button>
          </Link>

          <Link href="/signup">
            <Button size="lg" variant="tertiary">
              진행자로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-white py-8">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate sm:flex-row">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-prism" />
            <span className="font-semibold text-indigo">프리마이크</span>
          </div>

          <p>© 2026 FreeMic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}