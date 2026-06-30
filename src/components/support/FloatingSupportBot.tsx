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
    question: "진행자가 수락했는지 어디서 확인하나요?",
    answer:
      "고객의 예약/요청 현황에서 진행자 응답 대기, 수락 완료, 거절 상태를 확인할 수 있습니다. 수락 완료 후에만 상담을 시작할 수 있습니다.",
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
];

export function FloatingSupportBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = useMemo(() => QUICK_QUESTIONS[selectedIndex], [selectedIndex]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 print:hidden">
      {isOpen && (
        <section
          className="w-[min(calc(100vw-2rem),400px)] overflow-hidden rounded-3xl border border-line bg-card text-text shadow-2xl animate-fade-in dark:bg-[#141729]"
          aria-label="VOIT 상담봇"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-br from-navy to-lavender px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-extrabold">보잇 상담봇</h2>
                <p className="text-xs font-semibold text-white/80">상담사 채팅 구조는 준비 중이에요</p>
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

          <div className="max-h-[68vh] overflow-y-auto bg-surface p-4 dark:bg-[#0f1220]">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender text-white">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-card px-4 py-3 text-sm leading-7 text-text shadow-sm dark:bg-[#1b1e31] dark:text-white/88">
                  안녕하세요. 보잇 상담봇입니다. 지금은 실시간 상담사 연결 전 단계라, 자주 묻는 질문을 먼저 안내해드릴게요.
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-lavender px-4 py-3 text-sm font-semibold leading-7 text-white shadow-sm">
                  계약·결제·요청 전달 흐름이 궁금해요.
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2" role="list" aria-label="빠른 질문">
              {QUICK_QUESTIONS.map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                    selectedIndex === index
                      ? "border-lavender bg-lavender-light text-lavender dark:bg-lavender/15 dark:text-white"
                      : "border-line bg-card text-text hover:border-lavender hover:text-lavender dark:bg-[#171a2d] dark:text-white/78"
                  }`}
                >
                  <span>{item.question}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-card p-4 shadow-sm dark:bg-[#1b1e31]">
              <p className="text-xs font-extrabold text-lavender">상담봇 답변</p>
              <h3 className="mt-1 text-sm font-extrabold tracking-[-0.02em] text-text dark:text-white">{selected.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate dark:text-white/78">{selected.answer}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-line bg-card p-3 dark:bg-[#171a2d]">
              <label htmlFor="support-message" className="sr-only">
                상담 메시지 입력
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="support-message"
                  type="text"
                  value="상담사 연결은 준비 중입니다."
                  readOnly
                  className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-slate outline-none dark:bg-[#0f1220] dark:text-white/72"
                  aria-label="상담사 연결 준비 중"
                />
                <Button type="button" variant="disabled" size="icon" disabled aria-label="메시지 전송 준비 중">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-2 px-1 text-xs leading-5 text-slate dark:text-white/55">
                실제 상담사 1:1 채팅은 아직 구현 범위에 포함하지 않았습니다.
              </p>
            </div>

            <Link href="/support" className="mt-4 block">
              <Button variant="secondaryCta" className="w-full">
                고객센터 안내 보기
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
