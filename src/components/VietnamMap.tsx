import { createSignal, onMount, For, Show } from "solid-js";
import * as d3 from "d3";
import vietnamData from "../lib/maps/vietnam-provinces.json";
import { SITE } from "../site-config";

type ProvinceInfo = {
  vi: string;
  region: string;
  lat?: number;
  lon?: number;
};

const PROVINCE_MAP: Record<string, ProvinceInfo> = {
  "An Giang": { vi: "An Giang", region: "Tây Nam Bộ" },
  "Bac Ninh": { vi: "Bắc Ninh", region: "Đồng bằng sông Hồng" },
  "Ca Mau": { vi: "Cà Mau", region: "Tây Nam Bộ" },
  "Can Tho": { vi: "Cần Thơ", region: "Tây Nam Bộ" },
  "Cao Bang": { vi: "Cao Bằng", region: "Đông Bắc Bộ" },
  "Da Nang": { vi: "Đà Nẵng", region: "Nam Trung Bộ", lat: 16.0544, lon: 108.2022 },
  "Dak Lak": { vi: "Đắk Lắk", region: "Tây Nguyên" },
  "Dien Bien": { vi: "Điện Biên", region: "Tây Bắc Bộ" },
  "Dong Nai": { vi: "Đồng Nai", region: "Đông Nam Bộ" },
  "Dong Thap": { vi: "Đồng Tháp", region: "Tây Nam Bộ" },
  "Gia Lai": { vi: "Gia Lai", region: "Tây Nguyên" },
  "Ha Noi": { vi: "Hà Nội", region: "Đồng bằng sông Hồng", lat: 21.0285, lon: 105.8542 },
  "Ha Tinh": { vi: "Hà Tĩnh", region: "Bắc Trung Bộ" },
  "Hai Phong": { vi: "Hải Phòng", region: "Đồng bằng sông Hồng" },
  "Ho Chi Minh": { vi: "TP. Hồ Chí Minh", region: "Đông Nam Bộ", lat: 10.8231, lon: 106.6297 },
  "Hue": { vi: "Thừa Thiên Huế", region: "Bắc Trung Bộ" },
  "Hung Yen": { vi: "Hưng Yên", region: "Đồng bằng sông Hồng" },
  "Khanh Hoa": { vi: "Khánh Hòa", region: "Nam Trung Bộ" },
  "Lai Chau": { vi: "Lai Châu", region: "Tây Bắc Bộ" },
  "Lam Dong": { vi: "Lâm Đồng", region: "Tây Nguyên" },
  "Lang Son": { vi: "Lạng Sơn", region: "Đông Bắc Bộ" },
  "Lao Cai": { vi: "Lào Cai", region: "Tây Bắc Bộ" },
  "Nghe An": { vi: "Nghệ An", region: "Bắc Trung Bộ" },
  "Ninh Binh": { vi: "Ninh Bình", region: "Đồng bằng sông Hồng" },
  "Phu Tho": { vi: "Phú Thọ", region: "Đông Bắc Bộ" },
  "Quang Ngai": { vi: "Quảng Ngãi", region: "Nam Trung Bộ" },
  "Quang Ninh": { vi: "Quảng Ninh", region: "Đông Bắc Bộ" },
  "Quang Tri": { vi: "Quảng Trị", region: "Bắc Trung Bộ" },
  "Son La": { vi: "Sơn La", region: "Tây Bắc Bộ" },
  "Tay Ninh": { vi: "Tây Ninh", region: "Đông Nam Bộ" },
  "Thai Nguyen": { vi: "Thái Nguyên", region: "Đông Bắc Bộ" },
  "Thanh Hoa": { vi: "Thanh Hóa", region: "Bắc Trung Bộ" },
  "Tuyen Quang": { vi: "Tuyên Quang", region: "Đông Bắc Bộ" },
  "Vinh Long": { vi: "Vĩnh Long", region: "Tây Nam Bộ" },
};

// Colors matching Globe / Darkslate aesthetic
const OCEAN_FILL = "#0d1b2a";
const OCEAN_STIPPLE = "#152838";
const PROVINCE_DEFAULT_FILL = "#1a2e42";
const PROVINCE_HOVER_FILL = "#2a4a63";
const PROVINCE_STROKE = "#2a4a63";
const GRATICULE_STROKE = "#1a2e42";
const TOOLTIP_BG = "#0e0e0e";
const TOOLTIP_BORDER = "#383838";

export default function VietnamMap() {
  let containerRef: HTMLDivElement | undefined;
  const initialVisited = (SITE as any).visitedProvinces || ["Ha Noi", "Ho Chi Minh", "Da Nang"];
  
  const [visited, setVisited] = createSignal<string[]>(initialVisited);
  const [showDrawer, setShowDrawer] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [_hoveredProvince, setHoveredProvince] = createSignal<string | null>(null);

  let resetZoomFn: (() => void) | null = null;

  const toggleProvince = (name: string) => {
    setVisited((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  onMount(() => {
    if (!containerRef) return;

    const width = containerRef.clientWidth || 800;
    const height = containerRef.clientHeight || 700;

    const svg = d3
      .select(containerRef)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", OCEAN_FILL);

    // Defs pattern for sea stipple texture & glow filter
    const defs = svg.append("defs");

    const stipple = defs
      .append("pattern")
      .attr("id", "vn-sea-stipple")
      .attr("width", 6)
      .attr("height", 6)
      .attr("patternUnits", "userSpaceOnUse");
    stipple
      .append("rect")
      .attr("width", 6)
      .attr("height", 6)
      .attr("fill", OCEAN_FILL);
    stipple
      .append("circle")
      .attr("cx", 1.5)
      .attr("cy", 1.5)
      .attr("r", 0.5)
      .attr("fill", OCEAN_STIPPLE);
    stipple
      .append("circle")
      .attr("cx", 4.5)
      .attr("cy", 4.5)
      .attr("r", 0.5)
      .attr("fill", OCEAN_STIPPLE);

    // Glow filter for visited provinces & beacons
    const filter = defs.append("filter").attr("id", "visited-glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Base background rectangle
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#vn-sea-stipple)");

    // D3 Projection for Vietnam
    const features = (vietnamData as any).features;
    const projection = d3
      .geoMercator()
      .fitExtent(
        [
          [60, 60],
          [width - 60, height - 60],
        ],
        vietnamData as any
      );

    const pathGenerator = d3.geoPath().projection(projection);

    // Main map container group for pan/zoom
    const mapGroup = svg.append("g").attr("class", "map-group");

    // Graticule (Lat/Lon grid)
    const graticule = d3.geoGraticule().step([2, 2])();
    mapGroup
      .append("path")
      .datum(graticule)
      .attr("d", pathGenerator as any)
      .style("fill", "none")
      .style("stroke", GRATICULE_STROKE)
      .style("stroke-width", 0.5)
      .style("opacity", 0.5);

    // Geographical annotations (East Sea / Islands)
    const oceanLabels = [
      { text: "BIỂN ĐÔNG", lon: 111.5, lat: 14.5, size: "14px", weight: "700", spacing: "4px" },
      { text: "Quần đảo Hoàng Sa", lon: 112.0, lat: 16.5, size: "10px", weight: "500", spacing: "1px" },
      { text: "Quần đảo Trường Sa", lon: 113.5, lat: 10.0, size: "10px", weight: "500", spacing: "1px" },
    ];

    oceanLabels.forEach((label) => {
      const pos = projection([label.lon, label.lat]);
      if (pos) {
        mapGroup
          .append("text")
          .attr("x", pos[0])
          .attr("y", pos[1])
          .text(label.text)
          .style("fill", "#2a4a63")
          .style("font-size", label.size)
          .style("font-weight", label.weight)
          .style("letter-spacing", label.spacing)
          .style("text-anchor", "middle")
          .style("pointer-events", "none")
          .style("user-select", "none")
          .style("font-family", "var(--font-satoshi), sans-serif");
      }
    });

    // Tooltip setup
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "vn-map-tooltip")
      .style("position", "absolute")
      .style("background", TOOLTIP_BG)
      .style("color", "#ffffff")
      .style("padding", "8px 12px")
      .style("border", `1px solid ${TOOLTIP_BORDER}`)
      .style("border-radius", "8px")
      .style("font-family", "var(--font-satoshi), sans-serif")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("box-shadow", "0 4px 16px rgba(0,0,0,0.5)");

    const moveTooltip = (e: MouseEvent) => {
      tooltip
        .style("left", `${e.pageX + 14}px`)
        .style("top", `${e.pageY - 14}px`);
    };

    // Render Provinces
    const provincePaths = mapGroup
      .append("g")
      .attr("class", "provinces")
      .selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .style("cursor", "pointer")
      .style("stroke", PROVINCE_STROKE)
      .style("stroke-width", 0.6)
      .style("transition", "fill 0.2s ease, stroke 0.2s ease");

    // Function to update province colors based on visited state
    const updateMapColors = () => {
      const visitedArray = visited();
      provincePaths.each(function (d: any) {
        const name = d.properties.Name;
        const isVisited = visitedArray.includes(name);
        d3.select(this)
          .style("fill", isVisited ? "var(--primary-500)" : PROVINCE_DEFAULT_FILL)
          .style("opacity", isVisited ? 0.95 : 0.8)
          .style("filter", isVisited ? "url(#visited-glow)" : "none");
      });
      updateBeacons();
    };

    provincePaths
      .on("mouseover", function (event, d: any) {
        const name = d.properties.Name;
        const info = PROVINCE_MAP[name] || { vi: name, region: "Việt Nam" };
        const isVisited = visited().includes(name);
        setHoveredProvince(name);

        d3.select(this)
          .style("fill", isVisited ? "var(--primary-400)" : PROVINCE_HOVER_FILL)
          .style("stroke", "var(--primary-400)")
          .style("stroke-width", 1.2)
          .style("opacity", 1);

        tooltip.html(`
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #ffffff;">${info.vi}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${info.region}</div>
          <div style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${
            isVisited ? "rgba(16, 185, 129, 0.15)" : "rgba(148, 163, 184, 0.1)"
          }; color: ${isVisited ? "#34d399" : "#cbd5e1"}; font-weight: 600;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${
              isVisited ? "#10b981" : "#64748b"
            };"></span>
            ${isVisited ? "Đã ghé thăm" : "Chưa ghé thăm"}
          </div>
        `).style("opacity", 1);
        moveTooltip(event);
      })
      .on("mousemove", (event) => moveTooltip(event))
      .on("mouseout", function (_event, d: any) {
        const name = d.properties.Name;
        const isVisited = visited().includes(name);
        setHoveredProvince(null);

        d3.select(this)
          .style("fill", isVisited ? "var(--primary-500)" : PROVINCE_DEFAULT_FILL)
          .style("stroke", PROVINCE_STROKE)
          .style("stroke-width", 0.6)
          .style("opacity", isVisited ? 0.95 : 0.8)
          .style("filter", isVisited ? "url(#visited-glow)" : "none");

        tooltip.style("opacity", 0);
      })
      .on("click", (_event, d: any) => {
        const name = d.properties.Name;
        toggleProvince(name);
        updateMapColors();
      });

    // Beacon markers group for major visited cities
    const beaconGroup = mapGroup.append("g").attr("class", "beacons");

    const updateBeacons = () => {
      beaconGroup.selectAll("*").remove();
      const visitedArray = visited();

      Object.entries(PROVINCE_MAP).forEach(([key, info]) => {
        if (visitedArray.includes(key) && info.lat && info.lon) {
          const coords = projection([info.lon, info.lat]);
          if (!coords) return;

          const g = beaconGroup
            .append("g")
            .attr("transform", `translate(${coords[0]}, ${coords[1]})`);

          // Pulsing outer ring
          g.append("circle")
            .attr("r", 10)
            .attr("fill", "none")
            .attr("stroke", "var(--primary-400)")
            .attr("stroke-width", 1.5)
            .style("opacity", 0.7)
            .append("animate")
            .attr("attributeName", "r")
            .attr("values", "4;16;4")
            .attr("dur", "2.5s")
            .attr("repeatCount", "indefinite");

          g.append("circle")
            .attr("r", 10)
            .attr("fill", "none")
            .attr("stroke", "var(--primary-400)")
            .attr("stroke-width", 1.5)
            .style("opacity", 0.7)
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("values", "0.8;0;0.8")
            .attr("dur", "2.5s")
            .attr("repeatCount", "indefinite");

          // Inner solid pin point
          g.append("circle")
            .attr("r", 4)
            .attr("fill", "#ffffff")
            .attr("stroke", "var(--primary-500)")
            .attr("stroke-width", 2);

          // City text label
          g.append("text")
            .attr("x", 10)
            .attr("y", 4)
            .text(info.vi)
            .style("fill", "#ffffff")
            .style("font-size", "11px")
            .style("font-weight", "700")
            .style("font-family", "var(--font-satoshi), sans-serif")
            .style("text-shadow", "0 1px 4px rgba(0,0,0,0.8)")
            .style("pointer-events", "none");
        }
      });
    };

    updateMapColors();

    // D3 Zoom & Pan configuration
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    resetZoomFn = () => {
      svg
        .transition()
        .duration(750)
        .call(zoom.transform as any, d3.zoomIdentity);
    };

    // Reactively update map colors when visited signal changes
    const checkTimer = setInterval(() => {
      updateMapColors();
    }, 300);

    return () => {
      clearInterval(checkTimer);
      tooltip.remove();
    };
  });

  const totalProvinces = Object.keys(PROVINCE_MAP).length; // 34
  const visitedCount = () => visited().length;
  const visitedPercent = () => ((visitedCount() / totalProvinces) * 100).toFixed(1);

  const filteredProvinces = () => {
    const q = searchQuery().toLowerCase().trim();
    return Object.entries(PROVINCE_MAP).filter(
      ([key, info]) =>
        key.toLowerCase().includes(q) ||
        info.vi.toLowerCase().includes(q) ||
        info.region.toLowerCase().includes(q)
    );
  };

  return (
    <div class="relative w-full h-screen overflow-hidden text-white bg-darkslate-700 select-none">
      {/* Map Container */}
      <div ref={containerRef} class="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Card */}
      <div class="absolute top-4 left-20 z-30 flex items-center gap-3 bg-darkslate-800/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-darkslate-500 shadow-xl">
        <div>
          <h1 class="text-sm md:text-base font-bold text-white tracking-wide">
            Bản đồ Việt Nam
          </h1>
          <p class="text-xs text-darkslate-300">
            {visitedCount()} / {totalProvinces} Tỉnh thành ({visitedPercent()}%)
          </p>
        </div>
        <div class="w-20 bg-darkslate-600 h-2 rounded-full overflow-hidden ml-2">
          <div
            class="bg-primary-500 h-full transition-all duration-500"
            style={{ width: `${visitedPercent()}%` }}
          />
        </div>
      </div>

      {/* Control Buttons (Top Right) */}
      <div class="absolute top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => resetZoomFn?.()}
          title="Reset Zoom"
          class="px-3 py-2 text-xs font-semibold rounded-lg bg-darkslate-800/90 hover:bg-darkslate-600/50 border border-darkslate-500 text-white backdrop-blur-md transition-all shadow-lg flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span class="hidden sm:inline">Về góc nhìn chuẩn</span>
        </button>

        <button
          onClick={() => setShowDrawer(true)}
          class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary-500 hover:bg-primary-400 text-white transition-all shadow-lg flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Danh sách 34 Tỉnh thành</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <p class="text-xs text-darkslate-300 bg-darkslate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-darkslate-500/50 shadow-md">
          Kéo rê để di chuyển • Cuộn chuột để phóng to / thu nhỏ • Nhấp vào tỉnh để đánh dấu
        </p>
      </div>

      {/* Modal Drawer: List of 34 Provinces */}
      <Show when={showDrawer()}>
        <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div class="w-full max-w-md h-full bg-darkslate-800 border-l border-darkslate-500 flex flex-col p-6 shadow-2xl">
            {/* Drawer Header */}
            <div class="flex items-center justify-between pb-4 border-b border-darkslate-600">
              <div>
                <h2 class="text-lg font-bold text-white">Các tỉnh thành Việt Nam</h2>
                <p class="text-xs text-darkslate-300 mt-0.5">
                  Đã đi {visitedCount()} / {totalProvinces} tỉnh thành (sau sáp nhập)
                </p>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                class="p-1.5 text-darkslate-300 hover:text-white rounded-lg hover:bg-darkslate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search Input */}
            <div class="my-4">
              <input
                type="text"
                placeholder="Tìm kiếm tỉnh thành hoặc vùng..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                class="w-full px-3.5 py-2 text-sm bg-darkslate-700 border border-darkslate-500 rounded-lg text-white placeholder-darkslate-300 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Province List Grid */}
            <div class="flex-1 overflow-y-auto pr-1 space-y-2">
              <For each={filteredProvinces()}>
                {([key, info]) => {
                  const isVisited = () => visited().includes(key);
                  return (
                    <div
                      onClick={() => toggleProvince(key)}
                      class={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        isVisited()
                          ? "bg-primary-500/15 border-primary-500/40 text-white"
                          : "bg-darkslate-700/50 border-darkslate-600 text-darkslate-200 hover:bg-darkslate-700"
                      }`}
                    >
                      <div>
                        <div class="text-sm font-semibold">{info.vi}</div>
                        <div class="text-xs text-darkslate-300">{info.region}</div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span
                          class={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isVisited()
                              ? "bg-primary-500 text-white"
                              : "bg-darkslate-600 text-darkslate-300"
                          }`}
                        >
                          {isVisited() ? "Đã đi" : "Chưa đi"}
                        </span>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            {/* Drawer Footer */}
            <div class="pt-4 border-t border-darkslate-600 flex justify-between items-center text-xs text-darkslate-300">
              <span>Đã chọn: <b class="text-white">{visitedCount()}</b></span>
              <button
                onClick={() => setVisited([])}
                class="text-red-400 hover:underline"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
