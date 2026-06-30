import Link from "next/link";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const POLICY_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/support", label: "고객센터" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-card text-text" aria-label="사이트 하단 정보">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Link href="/" prefetch={false} className="inline-flex items-center gap-2 text-xl font-extrabold tracking-[-0.03em]">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-lavender text-sm font-black text-white">
                V
              </span>
              보잇 Voit
            </Link>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate dark:text-white/70">
              VOIT은 행사·콘텐츠에 필요한 전문 진행자를 고객과 연결하는 매칭 플랫폼입니다.
              계약·결제·정산 화면은 MVP 시연 환경 기준이며, 실서비스 전 사업자 정보와 법무 검토가 필요합니다.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-slate dark:text-white/70 sm:grid-cols-2">
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lavender" aria-hidden="true" />
                통신판매중개 및 전문 진행자 매칭 서비스
              </p>
              <p className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lavender" aria-hidden="true" />
                고객센터: chat@voit.example
              </p>
              <p className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lavender" aria-hidden="true" />
                사업자 정보, 통신판매업 신고번호, 주소, 대표자 정보란
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-base font-extrabold tracking-[-0.03em]">정책 및 고객지원</h2>
            <nav className="mt-4 grid gap-2" aria-label="정책 및 고객지원 링크">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="rounded-xl px-3 py-2 text-sm font-bold text-slate transition hover:bg-card hover:text-lavender dark:text-white/75"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="mt-4 rounded-xl border border-line bg-card p-3 text-xs leading-6 text-slate dark:text-white/65">
              결제 화면에서는 결제 금액, 취소·환불 기준, 정산 상태, 전자계약 안내를 확인한 뒤 진행해야 합니다.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5 text-xs text-slate dark:text-white/55">
          © {new Date().getFullYear()} VOIT. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
