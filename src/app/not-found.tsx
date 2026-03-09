import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-bold text-white/20 mb-2">404</p>
        <h1 className="text-xl font-semibold text-white mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          요청하신 페이지가 이동되었거나 삭제되었을 수 있습니다.
          <br />
          아래 링크에서 원하는 콘텐츠를 찾아보세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-brand-blue text-white text-sm font-medium hover:bg-brand-blue/80 transition-colors"
          >
            홈에서 검색하기
          </Link>
          <Link
            href="/figma-info"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:border-white/20 hover:bg-white/[0.08] transition-colors"
          >
            용어사전 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
