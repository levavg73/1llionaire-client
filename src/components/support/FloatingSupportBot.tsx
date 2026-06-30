"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bot, ChevronRight, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_QUESTIONS = [
  {
    question: "진행자 요청은 어떻게 전달되나요?",
    answer:
      "고객이 추천 후보 중 1명을 선택하면 해당 진행자에게 요청서가 전달됩니다. 진행자가 수락하면 상담방이 열리고, 이후 금액 조율과 계약·결제로 이어집니다.",
  },
  {
    question: "계약서는 수정할 수 있나요?",
    answer:
      "서명 전에는 조건을 다시 조율해 새 계약서 초안을 만들 수 있습니다. 양측 전자서명 완료 후에는 직접 수정하지 않고 변경 합의 또는 새 계약서로 처리하는 것이 원칙입니다.",
  },
  {
    question: "결제와 정산은 어떻게 진행되나요?",
    answer:
      "MVP에서는 PG 테스트 결제와 상태 기반 정산 흐름을 제공합니다. 실제 운영 시에는 PG사 정책, 취소·환불 기준, 정산 보류 기준을 약관에 맞춰 적용해야 합니다.",
  },
  {
    question: "프리랜서 가능 시간대는 꼭 입력해야 하나요?",
    answer:
      "가능 시간대를 입력하지 않은 진행자는 우선 가능 후보로 분류됩니다. 가능 시간대를 입력한 경우에는 요청서의 날짜와 시간이 맞는 후보만 추천됩니다.",
  },
];

export function FloatingSupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = useMemo(() => QUICK_QUESTIONS[selectedIndex], [selectedIndex]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {isOpen && (
        <section
          className="w-[min(calc(100vw-2rem),380px)] overflow-hidden rounded-3xl border border-line bg-card shadow-2xl animate-fade-in"
          aria-label="VOIT 상담봇"
        >
          <header className="flex items-center justify-between bg-gradient-to-br from-navy to-lavender px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-extrabold">VOIT 상담봇</h2>
                <p className="text-xs font-semibold text-white/75">자주 묻는 질문을 빠르게 안내해요</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/15"
              aria-label="상담봇 닫기"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="max-h-[68vh] overflow-y-auto p-4">
            <div className="rounded-2xl bg-surface p-4 text-sm leading-7 text-slate dark:text-white/75">
              안녕하세요, VOIT 상담봇입니다. 계약·결제·요청 전달 흐름은 아래 질문을 선택해 확인할 수 있어요.
            </div>

            <div className="mt-4 grid gap-2" role="list" aria-label="빠른 질문">
              {QUICK_QUESTIONS.map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                    selectedIndex === index
                      ? "border-lavender bg-lavender-light text-lavender"
                      : "border-line bg-card text-text hover:border-lavender hover:text-lavender"
                  }`}
                >
                  <span>{item.question}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-extrabold text-lavender">선택한 질문</p>
              <h3 className="mt-1 text-sm font-extrabold tracking-[-0.02em] text-text">{selected.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate dark:text-white/72">{selected.answer}</p>
            </div>

            <Link href="/support" prefetch={false} className="mt-4 block">
              <Button variant="primaryCta" className="w-full">
                고객센터에서 더 보기
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-lavender text-white shadow-xl transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={isOpen ? "상담봇 닫기" : "상담봇 열기"}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
