export function FooterSection() {
  return (
    <footer class="w-full border-t border-darkslate-500/50 bg-darkslate-800 text-white py-12 px-6 lg:px-8 mt-auto">
      <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <img
            src="/vndo.png"
            alt="VNDO"
            width="28"
            height="28"
            class="w-7 h-7 rounded-md object-cover"
          />
          <span class="font-display tracking-tight text-lg font-bold text-white">
            VNDO<span class="text-xs font-mono text-darkslate-300 ml-0.5">™</span>
          </span>
          <span class="text-xs text-darkslate-300 ml-2 border-l border-darkslate-500 pl-3">
            Crafted with precision
          </span>
        </div>

        <div class="flex items-center gap-6 text-sm text-darkslate-200">
          <a href="/" class="hover:text-primary-400 transition-colors">
            Trang chủ
          </a>
          <a href="/du-an" class="hover:text-primary-400 transition-colors">
            Dự án
          </a>
          <a href="/blog" class="hover:text-primary-400 transition-colors">
            Blog
          </a>
          <a href="/guestbook" class="hover:text-primary-400 transition-colors">
            Guestbook
          </a>
        </div>

        <div class="text-xs text-darkslate-300">
          © {new Date().getFullYear()} BRAND. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
