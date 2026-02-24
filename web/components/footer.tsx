export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
            <p>
              수집 데이터는 원문 게시물 링크를 기준으로 제공됩니다.{" "}
              <br className="sm:hidden" />
              정확한 일정/내용은 각 사업단 공지 원문을 확인하세요.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © {year} JNU Events — 전남대학교 비공식 공지 모아보기 서비스
            </p>
          </div>

          <nav aria-label="관련 사이트" className="flex flex-col gap-1.5 text-sm">
            <a
              href="https://sojoong.kr/notice/notice-board/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors hover:underline"
            >
              SW중심사업단 공지 →
            </a>
            <a
              href="https://aicoss.ac.kr/www/notice/?cate=%EC%A0%84%EB%82%A8%EB%8C%80%ED%95%99%EA%B5%90"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors hover:underline"
            >
              AICOSS 공지 →
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
