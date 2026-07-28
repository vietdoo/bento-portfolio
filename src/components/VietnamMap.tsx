import { createSignal, onMount, onCleanup } from "solid-js";
import * as d3 from "d3";
import vietnamData from "../lib/maps/vietnam-provinces.json";
import worldData from "../lib/world.json";
import { SITE } from "../site-config";

type ProvinceInfo = {
  vi: string;
  region: string;
  labelDx?: number;
  labelDy?: number;
  coverImage?: string;
  highlights?: string[];
  travelDate?: string;
};

const PROVINCE_MAP: Record<string, ProvinceInfo> = {
  "An Giang": { vi: "An Giang", region: "Tây Nam Bộ" },
  "Bac Ninh": { vi: "Bắc Ninh", region: "Đồng bằng sông Hồng" },
  "Ca Mau": { vi: "Cà Mau", region: "Tây Nam Bộ" },
  "Can Tho": { vi: "Cần Thơ", region: "Tây Nam Bộ" },
  "Cao Bang": { vi: "Cao Bằng", region: "Đông Bắc Bộ" },
  "Da Nang": {
    vi: "Đà Nẵng",
    region: "Nam Trung Bộ",
    labelDx: 16,
    labelDy: 4,
    coverImage: "/travel/danang_1.jpg",
    highlights: ["Cầu Vàng", "Bà Nà Hills", "Cầu Rồng", "Biển Mỹ Khê"],
    travelDate: "Đã ghé thăm • Mùa hè 2024"
  },
  "Dak Lak": { vi: "Đắk Lắk", region: "Tây Nguyên" },
  "Dien Bien": { vi: "Điện Biên", region: "Tây Bắc Bộ" },
  "Dong Nai": { vi: "Đồng Nai", region: "Đông Nam Bộ" },
  "Dong Thap": { vi: "Đồng Tháp", region: "Tây Nam Bộ" },
  "Gia Lai": { vi: "Gia Lai", region: "Tây Nguyên" },
  "Ha Noi": {
    vi: "Hà Nội",
    region: "Đồng bằng sông Hồng",
    labelDx: 16,
    labelDy: -4,
    coverImage: "/travel/hanoi_1.jpg",
    highlights: ["Hồ Hoàn Kiếm", "Phố Cổ", "Văn Miếu", "Ẩm thực Hà Nội"],
    travelDate: "Đã ghé thăm • Mùa thu 2024"
  },
  "Ha Tinh": { vi: "Hà Tĩnh", region: "Bắc Trung Bộ" },
  "Hai Phong": { vi: "Hải Phòng", region: "Đồng bằng sông Hồng" },
  "Ho Chi Minh": {
    vi: "TP. Hồ Chí Minh",
    region: "Đông Nam Bộ",
    labelDx: 16,
    labelDy: 4,
    coverImage: "/travel/saigon_1.jpg",
    highlights: ["Nhà thờ Đức Bà", "Landmark 81", "Bưu điện TP", "Phố Nguyễn Huệ"],
    travelDate: "Đã ghé thăm • 2025"
  },
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

const COUNTRY_NAME_VN: Record<string, string> = {
  Laos: "Lào",
  Cambodia: "Campuchia",
  Thailand: "Thái Lan",
  China: "Trung Quốc",
  Philippines: "Philippines",
  Malaysia: "Malaysia",
  Indonesia: "Indonesia",
  Myanmar: "Myanmar",
  Taiwan: "Đài Loan",
  Brunei: "Brunei",
  Singapore: "Singapore",
};

// Clean Dark Slate Palette matching Bento Portfolio theme
const OCEAN_FILL = "#0d1b2a";
const OCEAN_STIPPLE = "#16283d";
const PROVINCE_DEFAULT_FILL = "#1e3854";
const PROVINCE_HOVER_FILL = "#2c547a";
const PROVINCE_STROKE = "#3c648d";
const WORLD_COUNTRY_FILL = "#142436";
const WORLD_COUNTRY_HOVER_FILL = "#1e3752";
const WORLD_COUNTRY_STROKE = "#1f344d";
const GRATICULE_STROKE = "#16283b";
const TOOLTIP_BG = "#0c131d";
const TOOLTIP_BORDER = "#334155";

export default function VietnamMap() {
  let containerRef: HTMLDivElement | undefined;
  const visitedProvinces = (SITE as any).visitedProvinces || ["Ha Noi", "Ho Chi Minh", "Da Nang"];
  
  const [visited] = createSignal<string[]>(visitedProvinces);

  onMount(() => {
    if (!containerRef) return;

    // Clean up any leftover tooltips from previous DOM states
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

      // Bounding box feature representing ~500km scope around Vietnam
      // Lat: ~3.5°N to ~28.5°N, Lon: ~96.0°E to ~121.0°E
      const scopeBounds = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [96.0, 3.5],
              [121.0, 3.5],
              [121.0, 28.5],
              [96.0, 28.5],
              [96.0, 3.5],
            ],
          ],
        },
      };

      const features = (vietnamData as any).features;
      const padding = Math.min(width, height) > 600 ? 30 : 15;
      const projection = d3
        .geoMercator()
        .fitExtent(
          [
            [padding, padding],
            [width - padding, height - padding],
          ],
          scopeBounds as any
        );

      const pathGenerator = d3.geoPath().projection(projection);

      // Main map group for pan/zoom
      const mapGroup = svg.append("g").attr("class", "map-group");

      // Graticule (Lat/Lon grid across 500km region)
      const graticule = d3.geoGraticule().step([4, 4])();
      mapGroup
        .append("path")
        .datum(graticule)
        .attr("d", pathGenerator as any)
        .style("fill", "none")
        .style("stroke", GRATICULE_STROKE)
        .style("stroke-width", 0.8)
        .style("opacity", 0.8);

      // Neighboring world countries layer (faded / dạng mờ)
      const worldFeatures = (worldData as any).features.filter(
        (f: any) => f.properties?.name !== "Vietnam"
      );

      const worldGroup = mapGroup.append("g").attr("class", "world-countries");

      worldGroup
        .selectAll("path")
        .data(worldFeatures)
        .enter()
        .append("path")
        .attr("d", pathGenerator as any)
        .style("fill", WORLD_COUNTRY_FILL)
        .style("stroke", WORLD_COUNTRY_STROKE)
        .style("stroke-width", 0.8)
        .style("opacity", 0.85)
        .style("cursor", "pointer")
        .style("transition", "fill 0.2s ease, stroke 0.2s ease")
        .on("mouseover", function (event, d: any) {
          const rawName = d.properties?.name || "Láng giềng";
          const vnName = COUNTRY_NAME_VN[rawName] || rawName;

          d3.select(this)
            .style("fill", WORLD_COUNTRY_HOVER_FILL)
            .style("stroke", "#33557a")
            .style("stroke-width", 1.2);

          tooltip.html(`
            <div style="padding: 8px 12px;">
              <div style="font-weight: 700; font-size: 13px; color: #e2e8f0; margin-bottom: 2px;">${vnName}</div>
              ${rawName !== vnName ? `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">${rawName}</div>` : ''}
              <div style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 7px; border-radius: 9999px; background: rgba(51, 65, 85, 0.5); color: #94a3b8; font-weight: 500;">
                Quốc gia láng giềng
              </div>
            </div>
          `).style("opacity", 1);

          moveTooltip(event);
        })
        .on("mousemove", (event) => moveTooltip(event))
        .on("mouseout", function () {
          d3.select(this)
            .style("fill", WORLD_COUNTRY_FILL)
            .style("stroke", WORLD_COUNTRY_STROKE)
            .style("stroke-width", 0.8);

          tooltip.style("opacity", 0);
        });

      // Geographical annotations (East Sea / Islands / Gulfs)
      const oceanLabels = [
        { text: "BIỂN ĐÔNG", lon: 113.0, lat: 14.5, size: "15px", weight: "700", spacing: "0.25em", fill: "#64748b" },
        { text: "Quần đảo Hoàng Sa", lon: 112.2, lat: 16.5, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
        { text: "Quần đảo Trường Sa", lon: 114.2, lat: 9.8, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
        { text: "Vịnh Bắc Bộ", lon: 107.5, lat: 19.8, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
        { text: "Vịnh Thái Lan", lon: 101.5, lat: 9.5, size: "11px", weight: "600", spacing: "0.08em", fill: "#475569" },
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
            .style("font-family", "var(--font-satoshi), system-ui, sans-serif");
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
        .style("padding", "0px")
        .style("border", `1px solid ${TOOLTIP_BORDER}`)
        .style("border-radius", "12px")
        .style("font-family", "var(--font-satoshi), system-ui, sans-serif")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 16px 36px -8px rgba(0, 0, 0, 0.85)")
        .style("transition", "opacity 0.15s ease");

      const moveTooltip = (e: MouseEvent) => {
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode ? tooltipNode.clientWidth : 240;
        const tooltipHeight = tooltipNode ? tooltipNode.clientHeight : 160;

        let left = e.pageX + 16;
        let top = e.pageY - 16;

        if (left + tooltipWidth > window.innerWidth - 16) {
          left = e.pageX - tooltipWidth - 16;
        }
        if (top + tooltipHeight > window.innerHeight - 16) {
          top = e.pageY - tooltipHeight - 16;
        }

        tooltip.style("left", `${left}px`).style("top", `${top}px`);
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

          if (isVisited && info.coverImage) {
            // Travel Collection Card for visited places
            tooltip.html(`
              <div style="width: 270px; overflow: hidden; border-radius: 12px; background: #0c131d;">
                <div style="position: relative; width: 100%; height: 140px; overflow: hidden;">
                  <img src="${info.coverImage}" alt="${info.vi}" style="width: 100%; height: 100%; object-fit: cover;" />
                  <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(12, 19, 29, 0.95) 0%, rgba(12, 19, 29, 0.3) 60%, transparent 100%);"></div>
                  <span style="position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 9999px; background: rgba(16, 185, 129, 0.9); color: #ffffff; backdrop-filter: blur(4px);">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></span>
                    Đã ghé thăm
                  </span>
                  <div style="position: absolute; bottom: 8px; left: 12px; right: 12px;">
                    <div style="font-weight: 800; font-size: 16px; color: #ffffff; text-shadow: 0 1px 4px rgba(0,0,0,0.6);">${info.vi}</div>
                    <div style="font-size: 11px; color: #cbd5e1; font-weight: 500;">${info.region}</div>
                  </div>
                </div>
                <div style="padding: 10px 12px 12px 12px;">
                  <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary-400); margin-bottom: 6px;">Bộ sưu tập hành trình</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${(info.highlights || [])
                      .map(
                        (h) =>
                          `<span style="font-size: 10px; background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); color: #e2e8f0; padding: 2px 7px; border-radius: 6px; font-weight: 500;">${h}</span>`
                      )
                      .join("")}
                  </div>
                  ${
                    info.travelDate
                      ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 8px; font-style: italic;">${info.travelDate}</div>`
                      : ""
                  }
                </div>
              </div>
            `).style("opacity", 1);
          } else {
            // Minimal Tooltip for unvisited provinces
            tooltip.html(`
              <div style="padding: 10px 14px;">
                <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #ffffff;">${info.vi}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${info.region}</div>
                <div style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: rgba(148, 163, 184, 0.12); color: #cbd5e1; font-weight: 600;">
                  <span style="width: 5px; height: 5px; border-radius: 50%; background: #64748b;"></span>
                  Chưa ghé thăm
                </div>
              </div>
            `).style("opacity", 1);
          }

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

            // City text label with crisp SVG stroke halo (fixes ugly font drop-shadow error)
            const dx = info.labelDx ?? 18;
            const dy = info.labelDy ?? 4;
            g.append("text")
              .attr("x", dx)
              .attr("y", dy)
              .text(info.vi)
              .style("fill", "#ffffff")
              .style("stroke", "#0d1b2a")
              .style("stroke-width", "3.5px")
              .style("paint-order", "stroke fill")
              .style("font-size", "11.5px")
              .style("font-weight", "700")
              .style("font-family", "var(--font-satoshi), system-ui, -apple-system, sans-serif")
              .style("letter-spacing", "0.01em")
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
