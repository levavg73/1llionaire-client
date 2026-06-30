import Link from "next/link";

const POLICY_LINKS = [
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-background text-text" aria-label="사이트 하단 정보">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-3 text-[15px] leading-7 text-slate dark:text-white/70">
            <p>
              운영시간 10:30~18:00{" "}
              <span className="text-slate/70 dark:text-white/50">
                (점심시간 13:00~14:00)
              </span>
              <span className="mx-2 text-slate/40 dark:text-white/30">·</span>
              주말, 공휴일 휴무
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-line pt-5 text-sm text-slate dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-x-8 gap-y-3" aria-label="정책 링크">
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-extrabold transition hover:text-lavender"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs">© {new Date().getFullYear()} VOIT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}