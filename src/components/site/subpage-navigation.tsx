import { createSignal, onMount, onCleanup } from "solid-js";

export type SubpageNavCta = { href: string; label: string };

type SubpageNavigationProps = {
  /** Nhãn hiển thị ở giữa (ví dụ: "Blog", "Tuyển dụng", "Về chúng tôi") */
  label: string;
  /** Nút CTA bên phải (không bắt buộc) */
  cta?: SubpageNavCta;
};

export function SubpageNavigation(props: SubpageNavigationProps) {
  const [isScrolled, setIsScrolled] = createSignal(false);

  onMount(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return (
    <header
      class={`fixed z-50 transition-all duration-500 ${
        isScrolled() ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        class={`mx-auto transition-all duration-500 ${
          isScrolled()
            ? "bg-darkslate-800/80 backdrop-blur-xl border border-darkslate-500 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          class={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled() ? "h-14" : "h-20"
          }`}
        >
          {/* Logo & Trang chủ Link */}
          <a href="/" class="flex items-center gap-2 group shrink-0 text-white no-underline">
            <img
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              class={`rounded-sm object-cover transition-all duration-500 ${
                isScrolled() ? "w-7 h-7" : "w-9 h-9"
              }`}
              onError={(e) => {
                // Fallback to simple SVG logo if logo.png is missing
                const target = e.currentTarget;
                target.onerror = null;
                target.src = "/favicon.svg";
              }}
            />
            <span
              class={`font-display tracking-tight transition-all duration-500 text-white font-bold ${
                isScrolled() ? "text-xl" : "text-2xl"
              }`}
            >
              BRAND
            </span>
            <span
              class={`text-darkslate-200 font-mono transition-all duration-500 ${
                isScrolled() ? "text-[10px] mt-0.5" : "text-xs mt-1"
              }`}
            >
              ™
            </span>
          </a>

          {/* Center Page Indicator (Chỉ hiển thị trên md trở lên) */}
          <div class="hidden md:flex items-center justify-center gap-3 flex-1 px-4 min-w-0 pointer-events-none">
            <span class="w-4 h-px bg-darkslate-400/40 shrink-0" aria-hidden="true" />
            <span class="font-mono text-xs tracking-widest uppercase text-darkslate-200 truncate text-center">
              {props.label}
            </span>
            <span class="w-4 h-px bg-darkslate-400/40 shrink-0" aria-hidden="true" />
          </div>

          {/* Action Links & CTA */}
          <div class="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
            <a
              href="/"
              class={`items-center gap-1 text-sm text-darkslate-200 hover:text-white transition-colors group ${
                props.cta ? "hidden md:flex" : "flex"
              }`}
            >
              Về trang chủ
              <svg
                class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            {props.cta ? (
              <a
                href={props.cta.href}
                class={`inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-full transition-all duration-500 shadow-sm ${
                  isScrolled() ? "px-4 h-8 text-xs" : "px-6 h-10 text-sm"
                }`}
              >
                {props.cta.label}
              </a>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
