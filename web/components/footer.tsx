export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          수집 데이터는 원문 게시물 링크를 기준으로 제공됩니다. 정확한 일정/내용은 각 사업단 공지 원문을 확인하세요.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} JNU Events MVP
        </p>
      </div>
    </footer>
  );
}
