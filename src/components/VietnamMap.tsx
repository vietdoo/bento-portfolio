import { createSignal, onMount, onCleanup } from "solid-js";
import * as d3 from "d3";
import vietnamData from "../lib/maps/vietnam-provinces.json";
import { SITE } from "../site-config";

type ProvinceInfo = {
  vi: string;
  region: string;
  labelDx?: number;
  labelDy?: number;
};

const PROVINCE_MAP: Record<string, ProvinceInfo> = {
  "An Giang": { vi: "An Giang", region: "Tây Nam Bộ" },
  "Bac Ninh": { vi: "Bắc Ninh", region: "Đồng bằng sông Hồng" },
  "Ca Mau": { vi: "Cà Mau", region: "Tây Nam Bộ" },
  "Can Tho": { vi: "Cần Thơ", region: "Tây Nam Bộ" },
  "Cao Bang": { vi: "Cao Bằng", region: "Đông Bắc Bộ" },
  "Da Nang": { vi: "Đà Nẵng", region: "Nam Trung Bộ", labelDx: 18, labelDy: 4 },
  "Dak Lak": { vi: "Đắk Lắk", region: "Tây Nguyên" },
  "Dien Bien": { vi: "Điện Biên", region: "Tây Bắc Bộ" },
  "Dong Nai": { vi: "Đồng Nai", region: "Đông Nam Bộ" },
  "Dong Thap": { vi: "Đồng Tháp", region: "Tây Nam Bộ" },
  "Gia Lai": { vi: "Gia Lai", region: "Tây Nguyên" },
  "Ha Noi": { vi: "Hà Nội", region: "Đồng bằng sông Hồng", labelDx: 18, labelDy: -4 },
  "Ha Tinh": { vi: "Hà Tĩnh", region: "Bắc Trung Bộ" },
  "Hai Phong": { vi: "Hải Phòng", region: "Đồng bằng sông Hồng" },
  "Ho Chi Minh": { vi: "TP. Hồ Chí Minh", region: "Đông Nam Bộ", labelDx: 18, labelDy: 4 },
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

// Clean Dark Slate Palette matching Bento Portfolio theme
const OCEAN_FILL = "#0d1b2a";
const OCEAN_STIPPLE = "#16283d";
const PROVINCE_DEFAULT_FILL = "#1e3854";
const PROVINCE_HOVER_FILL = "#2c547a";
const PROVINCE_STROKE = "#3c648d";
const GRATICULE_STROKE = "#16283b";
const TOOLTIP_BG = "#0c131d";
const TOOLTIP_BORDER = "#334155";

export default function VietnamMap() {
  let containerRef: HTMLDivElement | undefined;
  const visitedProvinces = (SITE as any).visitedProvinces || ["Ha Noi", "Ho Chi Minh", "Da Nang"];
  
  const [visited] = createSignal<string[]>(visitedProvinces);

  onMount(() => {
    if (!containerRef) return;

    // Remove any leftover floating tooltips from previous renders
    d3.select("body").selectAll(".vn-map-tooltip").remove();

    const renderMap = () => {
      if (!containerRef) return;

      d3.select(containerRef).selectAll("*").remove();

      const width = Math.max(containerRef.clientWidth || window.innerWidth, 400);
      const height = Math.max(containerRef.clientHeight || window.innerHeight, 400);

      const svg = d3
        .select(containerRef)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
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

      // Ocean background
      svg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "url(#vn-sea-stipple)");

      // D3 Mercator Projection fitExtent on rewound GeoJSON
      const features = (vietnamData as any).features;
      const padding = Math.min(width, height) > 600 ? 50 : 25;
      const projection = d3
        .geoMercator()
        .fitExtent(
          [
            [padding, padding],
            [width - padding, height - padding],
          ],
          vietnamData as any
        );

      const pathGenerator = d3.geoPath().projection(projection);

      // Main map group for pan/zoom
      const mapGroup = svg.append("g").attr("class", "map-group");

      // Graticule (Lat/Lon grid)
      const graticule = d3.geoGraticule().step([2, 2])();
      mapGroup
        .append("path")
        .datum(graticule)
        .attr("d", pathGenerator as any)
        .style("fill", "none")
        .style("stroke", GRATICULE_STROKE)
        .style("stroke-width", 0.8)
        .style("opacity", 0.8);

      // Geographical annotations (East Sea / Islands)
      const oceanLabels = [
        { text: "BIỂN ĐÔNG", lon: 111.8, lat: 14.5, size: "15px", weight: "700", spacing: "0.25em", fill: "#64748b" },
        { text: "Quần đảo Hoàng Sa", lon: 112.2, lat: 16.5, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
        { text: "Quần đảo Trường Sa", lon: 113.8, lat: 9.8, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
      ];

      oceanLabels.forEach((label) => {
        const pos = projection([label.lon, label.lat]);
        if (pos) {
          mapGroup
            .append("text")
            .attr("x", pos[0])
            .attr("y", pos[1])
            .text(label.text)
            .style("fill", label.fill)
            .style("font-size", label.size)
            .style("font-weight", label.weight)
            .style("letter-spacing", label.spacing)
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .style("user-select", "none")
            .style("font-family", "var(--font-satoshi), sans-serif");
        }
      });

      // Single Tooltip Element attached to body
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
        .style("box-shadow", "0 10px 25px -5px rgba(0, 0, 0, 0.8)");

      const moveTooltip = (e: MouseEvent) => {
        tooltip
          .style("left", `${e.pageX + 14}px`)
          .style("top", `${e.pageY - 14}px`);
      };

      // Render Province Paths
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
        .style("stroke-width", 1.2)
        .style("transition", "fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease");

      // Function to update province colors
      const updateMapColors = () => {
        const visitedArray = visited();
        provincePaths.each(function (d: any) {
          const name = d.properties.Name;
          const isVisited = visitedArray.includes(name);
          d3.select(this)
            .style("fill", isVisited ? "var(--primary-500)" : PROVINCE_DEFAULT_FILL)
            .style("stroke", isVisited ? "#ffffff" : PROVINCE_STROKE)
            .style("stroke-width", isVisited ? 1.8 : 1.2)
            .style("opacity", isVisited ? 0.98 : 0.9)
            .style("filter", isVisited ? "url(#visited-glow)" : "none");
        });
        updateBeacons();
      };

      provincePaths
        .on("mouseover", function (event, d: any) {
          const name = d.properties.Name;
          const info = PROVINCE_MAP[name] || { vi: name, region: "Việt Nam" };
          const isVisited = visited().includes(name);

          d3.select(this)
            .style("fill", isVisited ? "var(--primary-400)" : PROVINCE_HOVER_FILL)
            .style("stroke", "var(--primary-400)")
            .style("stroke-width", 2.2)
            .style("opacity", 1);

          tooltip.html(`
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #ffffff;">${info.vi}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${info.region}</div>
            <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${
              isVisited ? "rgba(16, 185, 129, 0.2)" : "rgba(148, 163, 184, 0.12)"
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

          d3.select(this)
            .style("fill", isVisited ? "var(--primary-500)" : PROVINCE_DEFAULT_FILL)
            .style("stroke", isVisited ? "#ffffff" : PROVINCE_STROKE)
            .style("stroke-width", isVisited ? 1.8 : 1.2)
            .style("opacity", isVisited ? 0.98 : 0.9)
            .style("filter", isVisited ? "url(#visited-glow)" : "none");

          tooltip.style("opacity", 0);
        });

      // Beacon markers group for visited cities
      const beaconGroup = mapGroup.append("g").attr("class", "beacons");

      const updateBeacons = () => {
        beaconGroup.selectAll("*").remove();
        const visitedArray = visited();

        features.forEach((feature: any) => {
          const name = feature.properties.Name;
          if (visitedArray.includes(name)) {
            const info = PROVINCE_MAP[name] || { vi: name, region: "Việt Nam" };
            const centroid = d3.geoCentroid(feature);
            const coords = projection(centroid);
            if (!coords) return;

            const g = beaconGroup
              .append("g")
              .attr("transform", `translate(${coords[0]}, ${coords[1]})`);

            // Pulsing outer ring
            g.append("circle")
              .attr("r", 12)
              .attr("fill", "none")
              .attr("stroke", "var(--primary-400)")
              .attr("stroke-width", 2)
              .style("opacity", 0.9)
              .append("animate")
              .attr("attributeName", "r")
              .attr("values", "4;22;4")
              .attr("dur", "2.2s")
              .attr("repeatCount", "indefinite");

            g.append("circle")
              .attr("r", 12)
              .attr("fill", "none")
              .attr("stroke", "var(--primary-400)")
              .attr("stroke-width", 2)
              .style("opacity", 0.9)
              .append("animate")
              .attr("attributeName", "opacity")
              .attr("values", "1;0;1")
              .attr("dur", "2.2s")
              .attr("repeatCount", "indefinite");

            // Solid pin center point
            g.append("circle")
              .attr("r", 5)
              .attr("fill", "#ffffff")
              .attr("stroke", "var(--primary-500)")
              .attr("stroke-width", 3);

            // City text label
            const dx = info.labelDx ?? 18;
            const dy = info.labelDy ?? 4;
            g.append("text")
              .attr("x", dx)
              .attr("y", dy)
              .text(info.vi)
              .style("fill", "#ffffff")
              .style("font-size", "12px")
              .style("font-weight", "800")
              .style("font-family", "var(--font-satoshi), sans-serif")
              .style("text-shadow", "0 2px 8px rgba(0,0,0,0.95)")
              .style("pointer-events", "none");
          }
        });
      };

      updateMapColors();

      // D3 Zoom & Pan configuration
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 12])
        .on("zoom", (event) => {
          mapGroup.attr("transform", event.transform);
        });

      svg.call(zoom as any);
    };

    renderMap();

    const resizeObserver = new ResizeObserver(() => {
      renderMap();
    });

    resizeObserver.observe(containerRef);

    onCleanup(() => {
      resizeObserver.disconnect();
      d3.select("body").selectAll(".vn-map-tooltip").remove();
    });
  });

  const totalProvinces = Object.keys(PROVINCE_MAP).length; // 34
  const visitedCount = () => visited().length;
  const visitedPercent = () => ((visitedCount() / totalProvinces) * 100).toFixed(1);

  return (
    <div class="relative w-full h-screen overflow-hidden text-white bg-darkslate-700 select-none">
      {/* Map Container */}
      <div ref={containerRef} class="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Refined Glassmorphism Top-Right Header Badge */}
      <div class="absolute top-4 right-4 z-30 flex items-center gap-2.5 bg-darkslate-800/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-darkslate-500/60 shadow-xl">
        <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        <div class="flex items-center gap-2 text-xs">
          <span class="font-bold text-white tracking-wide">Bản đồ Việt Nam</span>
          <span class="text-darkslate-400">•</span>
          <span class="text-darkslate-300 font-medium">{visitedCount()} / {totalProvinces} Tỉnh thành</span>
          <span class="text-primary-400 font-bold">({visitedPercent()}%)</span>
        </div>
        <div class="w-12 bg-darkslate-600/80 h-1.5 rounded-full overflow-hidden ml-1 hidden sm:block">
          <div
            class="bg-primary-500 h-full transition-all duration-500"
            style={{ width: `${visitedPercent()}%` }}
          />
        </div>
      </div>
    </div>
  );
}
