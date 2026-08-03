import { createSignal, onMount, onCleanup, For } from "solid-js";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Dự án", href: "/du-an" },
  { name: "Cách hoạt động", href: "#how-it-works" },
  { name: "Tích hợp", href: "#integrations" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = createSignal(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

  onMount(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return (
    <>
      <header
        class={`fixed z-50 transition-all duration-500 ${
          isScrolled() ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
        }`}
      >
        <nav
          class={`mx-auto transition-all duration-500 ${
            isScrolled() || isMobileMenuOpen()
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

            {/* Desktop Nav Links */}
            <div class="hidden md:flex items-center gap-12">
              <For each={navLinks}>
                {(link) => (
                  <a
                    href={link.href}
                    class="text-sm text-darkslate-200 hover:text-white transition-colors duration-300 relative group"
                  >
                    {link.name}
                    <span class="absolute -bottom-1 left-0 w-0 h-px bg-primary-400 transition-all duration-300 group-hover:w-full" />
                  </a>
                )}
              </For>
            </div>

            {/* Desktop Actions */}
            <div class="hidden md:flex items-center gap-4">
              <a
                href="/login"
                class={`text-darkslate-200 hover:text-white transition-all duration-500 ${
                  isScrolled() ? "text-xs" : "text-sm"
                }`}
              >
                Đăng nhập
              </a>
              <a
                href="/signup"
                class={`inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-full transition-all duration-500 shadow-sm ${
                  isScrolled() ? "px-4 h-8 text-xs" : "px-6 h-10 text-sm"
                }`}
              >
                Bắt đầu miễn phí
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())}
              class="md:hidden p-2 text-white hover:text-primary-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen() ? (
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Fullscreen Overlay */}
      <div
        class={`md:hidden fixed inset-0 bg-darkslate-900/95 backdrop-blur-2xl z-40 transition-all duration-500 ${
          isMobileMenuOpen() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div class="flex justify-end px-6 pt-6">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            class="p-2 rounded-full text-white hover:bg-darkslate-700 transition-colors"
            aria-label="Close menu"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col h-full px-8 pt-8 pb-16 justify-between">
          <div class="flex flex-col justify-center gap-6 my-auto">
            <For each={navLinks}>
              {(link, i) => (
                <a
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  class={`text-2xl font-medium text-white hover:text-primary-400 transition-all duration-500 ${
                    isMobileMenuOpen() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ "transition-delay": isMobileMenuOpen() ? `${i() * 75}ms` : "0ms" }}
                >
                  {link.name}
                </a>
              )}
            </For>
          </div>

          <div
            class={`flex flex-col gap-4 pt-8 border-t border-darkslate-600 transition-all duration-500 ${
              isMobileMenuOpen() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ "transition-delay": isMobileMenuOpen() ? "300ms" : "0ms" }}
          >
            <a
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              class="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-full h-14 text-base font-medium flex items-center justify-center shadow-lg"
            >
              Bắt đầu miễn phí
            </a>
            <a
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              class="w-full border border-darkslate-400 text-white hover:bg-darkslate-800 rounded-full h-12 text-base font-medium flex items-center justify-center"
            >
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
