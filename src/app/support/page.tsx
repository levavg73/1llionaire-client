import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CreditCard, FileSignature, Headphones, MessageSquareText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "고객센터",
  description: "VOIT 서비스 이용, 요청서 전달, 상담, 계약, 결제, 정산 관련 고객지원 안내입니다.",
};

const SUPPORT_CARDS = [
  {
    icon: CalendarCheck,
    title: "요청서·후보 추천",
    desc: "요청서 작성, AI 후보 추천, 진행자 가능 시간대 반영 방식 안내",
  },
  {
    icon: MessageSquareText,
    title: "상담·요청 수락",
    desc: "고객이 선택한 진행자에게 요청서가 전달되고, 진행자 수락 후 상담방이 열리는 흐름 안내",
  },
  {
    icon: FileSignature,
    title: "계약서·전자서명",
    desc: "계약서 초안, 양측 전자서명, 서명 완료 후 변경 방식 안내",
  },
  {
    icon: CreditCard,
    title: "결제·정산",
    desc: "PG 테스트 결제, 결제 상태, 에스크로 상태, 정산 처리 기준 안내",
  },
  {
    icon: ShieldAlert,
    title: "취소·환불·분쟁",
    desc: "고객 취소, 진행자 거절, 노쇼, 분쟁 발생 시 기본 처리 방향 안내",
  },
  {
    icon: Headphones,
    title: "계정·프로필",
    desc: "회원가입, 역할별 프로필, 프리랜서 포트폴리오, 가능 시간대 입력 안내",
  },
];

const FAQS = [
  {
    question: "고객이 추천 후보를 선택하면 바로 상담이 시작되나요?",
    answer:
      "아니요. 고객이 후보를 선택하면 해당 진행자에게 요청서가 전달됩니다. 진행자가 수락하면 상담방이 생성되고, 이후 금액과 조건을 조율할 수 있습니다.",
  },
  {
    question: "진행자가 가능한 시간대를 입력하지 않으면 추천에서 제외되나요?",
    answer:
      "MVP 정책상 가능 시간대를 입력하지 않은 진행자는 우선 가능 후보로 분류됩니다. 가능 시간대를 입력한 진행자는 요청서 날짜와 시간이 맞는 경우에만 추천됩니다.",
  },
  {
    question: "계약서는 양측이 계속 수정할 수 있나요?",
    answer:
      "서명 전에는 조건을 재조율해 새 계약서 초안을 만들 수 있습니다. 양측 서명 후에는 직접 수정하지 않고 변경 합의 또는 새 계약서 버전으로 처리하는 것이 원칙입니다.",
  },
  {
    question: "결제는 언제 가능한가요?",
    answer:
      "계약서가 생성되고 고객과 진행자 양측 전자서명이 완료된 뒤 결제를 진행할 수 있습니다. MVP에서는 테스트 결제 환경 기준으로 동작합니다.",
  },
  {
    question: "실제 고객센터 문의는 어디로 보내야 하나요?",
    answer:
      "현재 MVP 기본 문의 메일은 support@voit.example로 표시되어 있습니다. 실제 운영 전 팀의 공식 이메일 또는 고객지원 채널로 교체하세요.",
  },
];

export default function SupportPage() {
  return (
    <div className="bg-clear text-text">
      <section className="border-b border-line bg-surface">
        <div className="container mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-card px-4 py-2 text-sm font-extrabold text-lavender shadow-sm">
            <Headphones className="h-4 w-4" aria-hidden="true" />
            Help Center
          </div>
          <h1 className="mt-5 text-[34px] font-extrabold tracking-[-0.05em] sm:text-[48px]">고객센터</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate dark:text-white/75">
            요청서 작성부터 진행자 수락, 상담, 계약서 작성, 결제와 정산까지 VOIT 핵심 플로우를 안내합니다.
            오른쪽 하단 상담봇에서도 자주 묻는 질문을 바로 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_CARDS.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="rounded-3xl border border-line bg-card p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-light">
                <Icon className="h-5 w-5 text-lavender" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em]">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate dark:text-white/72">{desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-line bg-card p-5 shadow-sm" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-extrabold tracking-[-0.04em]">자주 묻는 질문</h2>
            <div className="mt-5 grid gap-3">
              {FAQS.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-line bg-surface p-4">
                  <h3 className="text-base font-extrabold tracking-[-0.03em]">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate dark:text-white/72">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border border-line bg-card p-5 shadow-sm" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-2xl font-extrabold tracking-[-0.04em]">문의 안내</h2>
            <p className="mt-3 text-sm leading-7 text-slate dark:text-white/72">
              실제 운영 전 고객센터 이메일, 전화번호, 운영시간, 환불 문의 처리 기준을 확정해 주세요.
              현재 표기된 이메일은 MVP용 예시입니다.
            </p>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl bg-surface p-4">
                <p className="font-extrabold text-text">이메일</p>
                <p className="mt-1 text-slate dark:text-white/70">support@voit.example</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="font-extrabold text-text">운영시간</p>
                <p className="mt-1 text-slate dark:text-white/70">평일 10:00~18:00 / 공휴일 제외</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="font-extrabold text-text">정책 확인</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/terms" prefetch={false}>
                    <Button variant="secondary" size="sm">이용약관</Button>
                  </Link>
                  <Link href="/privacy" prefetch={false}>
                    <Button variant="secondary" size="sm">개인정보처리방침</Button>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
