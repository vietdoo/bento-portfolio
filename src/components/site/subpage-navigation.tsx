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
          {/* Logo Icon & Back Button */}
          <div class="flex items-center gap-3 shrink-0">
            <a href="/" class="flex items-center group text-white no-underline">
              <img
                src="/vndo.png"
                alt="Logo"
                width={40}
                height={40}
                class={`rounded-md object-cover transition-all duration-500 ${
                  isScrolled() ? "w-7 h-7" : "w-9 h-9"
                }`}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = "/icon-light-32x32.png";
                }}
              />
            </a>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-darkslate-600/50 hover:bg-darkslate-600 border border-darkslate-400/40 text-darkslate-100 hover:text-white transition-all text-xs font-medium cursor-pointer"
              aria-label="Quay lại"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back</span>
            </button>
          </div>

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
              Home
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
