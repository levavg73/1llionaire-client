import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "VOIT 개인정보 수집, 이용, 보관, 파기 및 정보주체 권리 안내입니다.",
};

const COLLECTION_ROWS = [
  {
    category: "회원가입 및 인증",
    items: "이름, 이메일, 비밀번호 해시, 회원 유형, 소셜 로그인 식별자",
    purpose: "회원 식별, 로그인, 권한 관리, 부정 이용 방지",
  },
  {
    category: "고객 요청서",
    items: "행사명, 행사일시, 장소, 예산, 요청사항, 필요 언어, 진행 스타일",
    purpose: "후보 추천, 상담, 계약서 생성, 고객 지원",
  },
  {
    category: "프리랜서 프로필",
    items: "활동명, 경력, 가능 분야, 지역, 가격대, 포트폴리오 URL, 가능 시간대",
    purpose: "프로필 노출, 후보 추천, 요청서 전달, 예약 관리",
  },
  {
    category: "거래 및 결제",
    items: "예약 정보, 계약 상태, 결제 금액, 결제 식별값, 정산 상태",
    purpose: "계약 이행, 결제 확인, 정산 관리, 분쟁 대응",
  },
  {
    category: "서비스 이용 기록",
    items: "접속 로그, 알림 내역, 상담 메시지, 기기 및 브라우저 정보",
    purpose: "서비스 운영, 보안, 오류 개선, 고객 문의 대응",
  },
];

const RIGHTS = [
  "개인정보 열람, 정정, 삭제, 처리정지를 요청할 권리",
  "동의 철회 및 회원 탈퇴를 요청할 권리",
  "개인정보 침해에 대한 상담 및 피해 구제를 요청할 권리",
  "자동화된 처리 또는 추천 결과에 대해 설명을 요청할 권리",
];

export default function PrivacyPage() {
  return (
    <div className="bg-clear text-text">
      <section className="border-b border-line bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-card px-4 py-2 text-sm font-extrabold text-lavender shadow-sm">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Privacy
          </div>
          <h1 className="mt-5 text-[34px] font-extrabold tracking-[-0.05em] sm:text-[48px]">개인정보처리방침</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate dark:text-white/75">
            VOIT은 전문 진행자 매칭, 요청서 전달, 상담, 계약, 결제 상태 관리를 위해 필요한 범위의 개인정보를 처리합니다.
            실제 운영 전 개인정보 보호책임자, 보관 기간, 제3자 제공 및 처리위탁 정보를 확정해야 합니다.
          </p>
          <p className="mt-4 text-sm font-bold text-slate dark:text-white/65">시행일: 2026년 6월 30일</p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-line bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-lavender" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-extrabold tracking-[-0.03em]">처리 원칙</h2>
              <p className="mt-2 text-sm leading-7 text-slate dark:text-white/70">
                개인정보는 서비스 제공에 필요한 최소 범위에서 처리하며, 목적 달성 후에는 관련 법령과 내부 정책에 따라 지체 없이 파기합니다.
              </p>
            </div>
          </div>
        </div>

        <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">1. 처리하는 개인정보 항목과 목적</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface text-text">
                <tr>
                  <th className="px-5 py-4 font-extrabold">구분</th>
                  <th className="px-5 py-4 font-extrabold">처리 항목</th>
                  <th className="px-5 py-4 font-extrabold">처리 목적</th>
                </tr>
              </thead>
              <tbody>
                {COLLECTION_ROWS.map((row) => (
                  <tr key={row.category} className="border-t border-line align-top">
                    <td className="px-5 py-4 font-bold text-text">{row.category}</td>
                    <td className="px-5 py-4 leading-7 text-slate dark:text-white/72">{row.items}</td>
                    <td className="px-5 py-4 leading-7 text-slate dark:text-white/72">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-line bg-card p-5 shadow-sm">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">2. 보관 및 파기</h2>
            <p className="mt-3 text-sm leading-8 text-slate dark:text-white/72">
              회원 탈퇴 또는 처리 목적 달성 시 개인정보를 파기합니다. 다만 계약, 결제, 분쟁 대응, 법령상 보관 의무가 있는 정보는 필요한 기간 동안 분리 보관할 수 있습니다.
            </p>
          </article>

          <article className="rounded-3xl border border-line bg-card p-5 shadow-sm">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">3. 제3자 제공 및 처리위탁</h2>
            <p className="mt-3 text-sm leading-8 text-slate dark:text-white/72">
              결제 처리, 알림 발송, 클라우드 인프라 운영 등 서비스 제공을 위해 필요한 경우 관련 업체에 처리를 위탁할 수 있습니다. 실제 운영 전 업체명과 위탁 업무를 명시해야 합니다.
            </p>
          </article>

          <article className="rounded-3xl border border-line bg-card p-5 shadow-sm md:col-span-2">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">4. 정보주체의 권리</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-7 text-slate dark:text-white/72 sm:grid-cols-2">
              {RIGHTS.map((item) => (
                <li key={item} className="rounded-2xl bg-surface px-4 py-3">{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-line bg-card p-5 shadow-sm md:col-span-2">
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">5. 개인정보 보호책임자</h2>
            <p className="mt-3 text-sm leading-8 text-slate dark:text-white/72">
              개인정보 보호책임자: [담당자명] / 이메일: privacy@voit.example / 고객센터: support@voit.example
              <br />
              실제 운영 전 담당자명, 연락처, 신고 및 분쟁 조정 절차를 확정해 주세요.
            </p>
          </article>
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.03em]">개인정보 문의가 있으신가요?</h2>
            <p className="mt-1 text-sm text-slate dark:text-white/70">고객센터에서 문의 유형을 선택해 안내를 확인하세요.</p>
          </div>
          <Link href="/support" prefetch={false}>
            <Button variant="primaryCta">고객센터로 이동</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
