import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "이용약관",
  description: "VOIT 서비스 이용약관과 거래·계약·결제 기본 안내입니다.",
};

const TERMS_SECTIONS = [
  {
    title: "제1조 목적",
    content:
      "본 약관은 VOIT가 제공하는 전문 진행자 매칭 서비스의 이용 조건, 회원과 플랫폼의 권리·의무, 계약·결제·정산 및 분쟁 처리에 관한 기본 사항을 정합니다.",
  },
  {
    title: "제2조 서비스의 성격",
    content:
      "VOIT는 고객과 프리랜서 진행자 간의 섭외, 상담, 계약, 결제 상태 관리를 지원하는 통신판매중개 성격의 플랫폼입니다. 실제 행사 진행 서비스의 수행 주체는 고객이 선택한 프리랜서 진행자입니다.",
  },
  {
    title: "제3조 회원 구분",
    content:
      "회원은 진행자를 섭외하는 고객 회원, 서비스를 제공하는 프리랜서 회원, 운영 관리를 담당하는 관리자 계정으로 구분됩니다. 각 회원은 본인의 계정과 권한 범위 안에서만 서비스를 이용할 수 있습니다.",
  },
  {
    title: "제4조 요청서와 후보 추천",
    content:
      "고객은 행사명, 일정, 장소, 예산, 진행 스타일, 필요 언어 등 섭외에 필요한 정보를 요청서로 작성합니다. VOIT는 요청서와 진행자 프로필, 가능 시간대, 포트폴리오, 후기 등을 바탕으로 후보를 추천할 수 있습니다.",
  },
  {
    title: "제5조 진행자 응답과 상담",
    content:
      "고객이 추천 후보 중 특정 진행자를 선택하면 해당 진행자에게 요청서가 전달됩니다. 진행자가 요청을 수락한 경우에만 상담방이 활성화되며, 양측은 상담방에서 금액, 포함 범위, 행사 조건을 조율할 수 있습니다.",
  },
  {
    title: "제6조 계약서와 전자서명",
    content:
      "계약서는 상담을 통해 합의된 행사 조건과 금액을 바탕으로 자동 생성됩니다. 양측 전자서명이 완료되면 계약 내용은 확정되며, 이후 변경이 필요한 경우 기존 계약서를 직접 수정하지 않고 새 계약서 또는 변경 합의서를 생성하는 방식을 원칙으로 합니다.",
  },
  {
    title: "제7조 결제와 정산",
    content:
      "고객은 계약서 확인 및 양측 서명 완료 후 결제를 진행합니다. MVP 시연 환경에서는 PG 테스트 결제와 상태 기반 정산 흐름을 제공합니다. 실제 운영 시 결제 수단, 수수료, 정산 예정일, 정산 보류 기준은 별도 정책에 따릅니다.",
  },
  {
    title: "제8조 취소·환불·분쟁",
    content:
      "행사 일정, 계약 체결 여부, 진행자 귀책, 고객 귀책, 노쇼, 분쟁 여부에 따라 취소·환불 기준이 달라질 수 있습니다. 구체적인 기준은 결제·정산 정책 및 취소·환불 안내에 따릅니다.",
  },
  {
    title: "제9조 금지행위",
    content:
      "회원은 허위 경력 등록, 타인의 개인정보 무단 사용, 오프플랫폼 거래 유도, 노쇼, 악성 후기 작성, 서비스 운영 방해, 불법·부정한 결제 시도를 해서는 안 됩니다.",
  },
  {
    title: "제10조 약관의 변경",
    content:
      "VOIT는 관련 법령과 서비스 정책에 따라 약관을 변경할 수 있습니다. 중요한 변경 사항은 서비스 화면 또는 공지사항을 통해 사전에 안내합니다.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-clear text-text">
      <section className="border-b border-line bg-surface">
        <div className="container mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-lavender/25 bg-card px-4 py-2 text-sm font-extrabold text-lavender shadow-sm">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Policy
          </div>
          <h1 className="mt-5 text-[34px] font-extrabold tracking-[-0.05em] sm:text-[48px]">이용약관</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate dark:text-white/75">
            VOIT의 회원 이용, 요청서 전달, 상담, 계약서 작성, 전자서명, 결제·정산 흐름에 대한 기본 약관입니다.
            실제 서비스 운영 전 사업자 정보와 법무 검토를 반영해 최종 확정해야 합니다.
          </p>
          <p className="mt-4 text-sm font-bold text-slate dark:text-white/65">시행일: 2026년 6월 30일</p>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-line bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-lavender" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-extrabold tracking-[-0.03em]">중요 안내</h2>
              <p className="mt-2 text-sm leading-7 text-slate dark:text-white/70">
                본 약관은 MVP 시연용 초안입니다. 통신판매중개, 개인정보 처리, 결제·정산, 취소·환불, 전자계약 관련
                실제 사업 운영에는 사업자 정보 입력과 전문가 검토가 필요합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.title} className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <h2 className="text-xl font-extrabold tracking-[-0.03em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-8 text-slate dark:text-white/72">{section.content}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.03em]">문의가 필요하신가요?</h2>
            <p className="mt-1 text-sm text-slate dark:text-white/70">고객센터에서 계약·결제·정산 관련 안내를 확인할 수 있습니다.</p>
          </div>
          <Link href="/support" prefetch={false}>
            <Button variant="primaryCta">고객센터로 이동</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
