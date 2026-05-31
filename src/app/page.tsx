import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Star, Shield, Clock, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "프리마이크 | 전문 진행자 매칭 플랫폼",
  description: "검증된 전문 MC·아나운서·쇼호스트를 행사에 연결합니다.",
};

const features = [
  { icon: Shield, title: "검증된 전문가", desc: "관리자 심사를 통과한 검증된 진행자만 등록됩니다." },
  { icon: Star, title: "평점 기반 매칭", desc: "실제 고객 후기와 평점으로 최적의 진행자를 찾아드립니다." },
  { icon: Clock, title: "신속한 후보 추천", desc: "요청서 제출 후 48시간 내 맞춤 후보를 추천받으세요." },
];

const categories = ["기업행사 MC", "웨딩 사회자", "쇼호스트", "컨퍼런스 MC", "라이브커머스", "아나운서"];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,185,66,0.18),_transparent_60%)]" />
        <div className="container mx-auto max-w-7xl px-4 py-24 md:py-36 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-gold text-sm font-medium mb-6 border border-gold/30 rounded-full px-4 py-1.5">
              <Mic className="h-3.5 w-3.5" />
              전문 진행자 매칭 플랫폼
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              행사를 빛낼
              <br />
              <span className="text-gold">진행자</span>를 찾아드립니다
            </h1>

            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              기업행사, 웨딩, 라이브커머스, 컨퍼런스에 필요한 전문 MC·아나운서·쇼호스트를
              빠르고 정확하게 연결해 드립니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="bg-gold text-navy font-semibold hover:bg-gold-dark">
                  진행자 섭외 요청하기
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/freelancers">
                <Button size="lg" variant="action">
                  진행자 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-ivory">
        <div className="container mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-muted-foreground mr-2">분야별</span>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/freelancers?category=${encodeURIComponent(cat)}`}
                className="text-sm px-3 py-1.5 rounded-full border hover:border-navy hover:text-navy transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">왜 프리마이크인가요?</h2>
          <p className="text-muted-foreground">전문성과 신뢰를 기반으로 최적의 진행자를 연결합니다</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-8 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-5">
                <Icon className="h-6 w-6 text-navy" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ivory-muted py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-14">이용 방법</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "요청서 작성", desc: "행사 정보와 원하는 진행자 조건을 입력하세요" },
              { step: "02", title: "후보 추천", desc: "전문 매니저가 48시간 내 맞춤 후보를 추천합니다" },
              { step: "03", title: "상담 & 견적", desc: "후보 프로필 확인 후 견적을 요청하세요" },
              { step: "04", title: "예약 확정", desc: "견적 수락 후 예약이 확정됩니다" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-navy text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-muted-foreground mb-8">전문 진행자와의 연결, 프리마이크가 도와드립니다</p>

        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/signup">
            <Button size="lg" className="bg-navy text-white hover:bg-navy-light">
              고객으로 시작하기
            </Button>
          </Link>

          <Link href="/signup">
            <Button size="lg" variant="outline">
              진행자로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-ivory py-8">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="font-semibold text-foreground">프리마이크</span>
          </div>
          <p>© 2024 FreeMic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}