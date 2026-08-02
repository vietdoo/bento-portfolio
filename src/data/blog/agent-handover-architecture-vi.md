---
title: "Kiến trúc Handover: khiến các AI agent trở nên thay thế được cho nhau"
description: "Một pattern ở tầng repo giúp bất kỳ AI agent nào cũng tiếp nhận được công việc dang dở: một bộ hiến pháp, một sổ bàn giao, một bản đồ định tuyến và một cơ chế kiểm tra phi-AI."
pubDate: 2026-08-02
category: "architecture"
lang: "vi"
translationKey: "agent-handover-architecture"
draft: false
---

Mọi AI coding agent đều xuất sắc trong đúng một phiên làm việc, rồi mất trí nhớ. Bạn mất bốn mươi phút giải thích vì sao repo chia theo feature slice chứ không theo layer, agent làm việc rất tốt, cửa sổ chat đóng lại — và hôm sau một agent khác (hoặc chính nó, phiên mới) bước vào và lại đề xuất tạo thư mục `services/`.

Phản xạ thường thấy là chọn một agent "chính" rồi dùng mãi. Nhưng đó là sai trục. Câu hỏi đáng giá không phải *dùng agent nào*, mà là **công việc được bàn giao giữa chúng như thế nào**. Làm đúng chỗ này, agent chỉ còn là chi tiết lúc chạy — thay được như đổi database driver.

Đây là pattern tôi đang áp dụng trong một monorepo có nhiều agent cùng làm. Không có gì phụ thuộc công cụ: nó chạy được với mọi tổ hợp CLI agent, IDE agent hay background agent.

## Ý tưởng cốt lõi: repo chính là bộ nhớ

Agent thì stateless. Repo thì không. Vậy nên mọi ngữ cảnh quan trọng phải nằm *trong repo*, ở nơi mà agent bị ràng buộc phải đọc và phải ghi.

Bốn tầng, mỗi tầng một nhiệm vụ:

<svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Bốn tầng của kiến trúc handover" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="inherit" font-size="13" fill="#e5e7eb">
    <rect x="10" y="10" width="700" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke="var(--primary-500)" stroke-width="1.5"/>
    <text x="30" y="34" font-size="14" font-weight="700" fill="var(--primary-300)">1. HIẾN PHÁP — một file luật, nhiều adapter</text>
    <text x="30" y="55">Bất biến kiến trúc, checklist DoD, giới hạn cứng. Đọc trước mọi task.</text>

    <rect x="10" y="82" width="700" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke="var(--primary-500)" stroke-width="1.5"/>
    <text x="30" y="106" font-size="14" font-weight="700" fill="var(--primary-300)">2. SỔ BÀN GIAO — log chỉ ghi thêm (append-only)</text>
    <text x="30" y="127">Phiên trước làm gì, vì sao chọn như vậy, còn dang dở những gì.</text>

    <rect x="10" y="154" width="700" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke="var(--primary-500)" stroke-width="1.5"/>
    <text x="30" y="178" font-size="14" font-weight="700" fill="var(--primary-300)">3. BẢN ĐỒ — decision tree, module mapping, API contract, glossary</text>
    <text x="30" y="199">Trả lời dứt khoát: "sửa chỗ này thì thuộc module nào?"</text>

    <rect x="10" y="226" width="700" height="60" rx="10" fill="rgba(255,255,255,0.04)" stroke="var(--primary-500)" stroke-width="1.5"/>
    <text x="30" y="250" font-size="14" font-weight="700" fill="var(--primary-300)">4. FORCING FUNCTION — một script "ngu" chấm điểm agent</text>
    <text x="30" y="271">Không dùng LLM. Thiếu đồng bộ docs/log là fail task.</text>
  </g>
</svg>

Thiếu một tầng là hệ thống rò rỉ: có luật mà không có sổ thì agent quyết đi quyết lại; có sổ mà không có forcing function thì chẳng ai ghi.

## Trụ cột 1 — Một hiến pháp, adapter mỏng

Mỗi hãng lại đẻ ra một tên file quy tắc riêng. Cái bẫy là để mỗi file tích tụ một "phương ngữ" luật riêng; ba tháng sau `CLAUDE.md` và rule của Cursor mâu thuẫn nhau về chính sách test, và mỗi agent hành xử như nhân viên của một công ty khác nhau.

Giữ đúng **một** nguồn sự thật, phần còn lại chỉ là con trỏ:

<svg viewBox="0 0 720 260" width="100%" role="img" aria-label="Các file adapter trỏ về một file luật duy nhất" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="inherit" font-size="13" fill="#e5e7eb">
    <rect x="260" y="100" width="200" height="60" rx="10" fill="rgba(255,255,255,0.06)" stroke="var(--primary-500)" stroke-width="2"/>
    <text x="360" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="var(--primary-300)">AGENTS.md</text>
    <text x="360" y="146" text-anchor="middle" font-size="12">nguồn sự thật duy nhất</text>

    <rect x="30" y="20" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
    <text x="105" y="46" text-anchor="middle">CLAUDE.md</text>
    <rect x="30" y="200" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
    <text x="105" y="226" text-anchor="middle">.cursor/rules</text>
    <rect x="540" y="20" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
    <text x="615" y="46" text-anchor="middle">GEMINI.md</text>
    <rect x="540" y="200" width="150" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.35)"/>
    <text x="615" y="226" text-anchor="middle">copilot-instructions</text>

    <g stroke="var(--primary-500)" stroke-width="1.5" fill="none" opacity="0.8">
      <path d="M180 41 H220 Q240 41 240 70 V115 H258"/>
      <path d="M180 221 H220 Q240 221 240 190 V145 H258"/>
      <path d="M540 41 H500 Q480 41 480 70 V115 H462"/>
      <path d="M540 221 H500 Q480 221 480 190 V145 H462"/>
    </g>
    <text x="360" y="196" text-anchor="middle" font-size="12" fill="rgba(229,231,235,0.65)">adapter chỉ 3 dòng: "đọc AGENTS.md, không chép lại luật ở đây"</text>
  </g>
</svg>

File adapter chứa luật là một cái bug. File adapter chứa con trỏ mới là feature.

Chỉ hai thứ được nằm trong hiến pháp:

- **Bất biến** — các định luật kiến trúc (vertical slice, mỗi feature một public contract, cấm import chéo vào internals, file ≤ 200 dòng).
- **Definition of Done** — checklist agent phải hoàn tất trước khi được phép nói "xong".

Và phải ngắn. Hiến pháp được nạp vào *mọi* phiên; mỗi đoạn bạn thêm là một khoản context budget bị cắt khỏi task thật.

## Trụ cột 2 — Sổ bàn giao

Đây là trái tim của pattern: một log append-only, mỗi phiên phải ghi một entry trước khi kết thúc. Không phải changelog — `git log` đã có rồi — mà là thứ git không lưu được: **ý định**.

Một entry tốt có năm trường:

| Trường | Vì sao cần |
| --- | --- |
| Thời gian + danh tính agent | Biết log còn "tươi" không, và code sinh ra từ thói quen của tool nào |
| Phạm vi | Đụng vào module nào, để phiên không liên quan bỏ qua được |
| Đã làm gì | Code, config, docs — bản tóm tắt mà git không cho bạn trong một đoạn |
| Quyết định + lý do | Chặn agent sau lật lại một trade-off đã chốt |
| Việc dang dở & lưu ý | Bàn giao thật sự: backlog xếp thứ tự bởi người vừa hiểu vấn đề nhất |

Trường "lý do" mới là thứ khiến pattern này có lãi. Ghi "dùng in-memory repository là cố ý, Postgres là mục #1 trong backlog" sẽ ngăn agent kế tiếp vừa không tự ý đập đi, vừa không coi đó là giải pháp vĩnh viễn.

Kỷ luật phạm vi cũng quan trọng: thay đổi toàn hệ thống (API contract, schema, kiến trúc) ghi vào sổ **toàn cục**; thay đổi thuần nội bộ một sub-module ghi vào sổ **cục bộ**. Không thì log toàn cục thành vòi nước nhiễu không ai đọc — tương đương không có log.

## Trụ cột 3 — Bản đồ định tuyến để agent thôi đoán

Hỏi agent "thêm rate limiting ở đâu?" và nó sẽ vui vẻ grep nửa cái repo, đốt sạch context, rồi bịa ra một vị trí nghe hợp lý. Một cây quyết định một trang trả lời việc đó trong mười token:

```text
Yêu cầu công việc
 ├── UI / player / component ......... → feature slice ở frontend
 ├── API / bài học / tiến trình / auth  → feature slice ở backend
 ├── audio, STT, chấm điểm bằng LLM ... → module AI service
 └── endpoint, DTO, schema, thuật ngữ . → sửa code + cập nhật docs contract
```

Xoay quanh nó là ba bảng tra: **module map** (class tương ứng nằm ở đâu trong từng app), **API contract** (endpoint và DTO), và **glossary** (thuật ngữ nghiệp vụ, enum — thứ ngăn năm agent đặt năm cái tên cho cùng một khái niệm).

Và một luật giữ chúng còn sống: *mọi* thay đổi endpoint, DTO, schema hay thuật ngữ đều phải cập nhật doc tương ứng trong cùng task. Tài liệu thôi làm "tài liệu" và trở thành một phần output của build.

## Trụ cột 4 — Cơ chế cưỡng chế không phải AI

Sự thật hơi phũ: agent chấm điểm mức tuân thủ của chính nó rất không đáng tin. Nó sẽ vui vẻ tick "đã cập nhật tài liệu" trong khi chẳng cập nhật gì. Nên cổng cuối cùng phải là một script buồn tẻ, tất định:

```python
# 1. các file governance còn tồn tại không?
# 2. có file dạng contract (router/schema/dto/service) thay đổi
#    mà docs/ không đổi theo không?
# 3. sổ bàn giao có được đụng tới trong phiên này không?
if errors:
    sys.exit(1)
```

Chỉ vậy thôi — một trình đọc `git status` cộng vài regex. Nó không bị dỗ ngọt, nó chạy trong CI, và nó biến "nhớ cập nhật tài liệu nhé" từ một lời cầu nguyện thành một build failure. Mỗi luật governance bạn viết nên đi kèm câu hỏi: *cái check ngu nào chứng minh việc này đã xảy ra?* Không trả lời được thì luật đó chỉ để trang trí.

## Vòng lặp của một phiên làm việc

Ghép bốn tầng lại, mọi agent — bất kể hãng nào — đều chạy đúng một chu trình:

<svg viewBox="0 0 720 220" width="100%" role="img" aria-label="Vòng lặp phiên làm việc của agent" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="inherit" font-size="12" fill="#e5e7eb">
    <g stroke="var(--primary-500)" stroke-width="1.5" fill="rgba(255,255,255,0.04)">
      <rect x="12" y="60" width="120" height="56" rx="10"/>
      <rect x="162" y="60" width="120" height="56" rx="10"/>
      <rect x="312" y="60" width="120" height="56" rx="10"/>
      <rect x="462" y="60" width="120" height="56" rx="10"/>
      <rect x="600" y="60" width="108" height="56" rx="10"/>
    </g>
    <text x="72" y="84" text-anchor="middle" font-weight="700">SYNC</text>
    <text x="72" y="102" text-anchor="middle" font-size="11">kéo docs mới nhất</text>
    <text x="222" y="84" text-anchor="middle" font-weight="700">ĐỌC SỔ</text>
    <text x="222" y="102" text-anchor="middle" font-size="11">ý định phiên trước</text>
    <text x="372" y="84" text-anchor="middle" font-weight="700">ĐỊNH TUYẾN</text>
    <text x="372" y="102" text-anchor="middle" font-size="11">cây quyết định</text>
    <text x="522" y="84" text-anchor="middle" font-weight="700">LÀM + ĐỒNG BỘ DOCS</text>
    <text x="522" y="102" text-anchor="middle" font-size="11">code, test, contract</text>
    <text x="654" y="84" text-anchor="middle" font-weight="700">KIỂM TRA</text>
    <text x="654" y="102" text-anchor="middle" font-size="11">script, 0 lỗi</text>

    <g stroke="var(--primary-500)" stroke-width="1.5" fill="none">
      <path d="M132 88 H160" marker-end="url(#b)"/>
      <path d="M282 88 H310" marker-end="url(#b)"/>
      <path d="M432 88 H460" marker-end="url(#b)"/>
      <path d="M582 88 H598" marker-end="url(#b)"/>
      <path d="M654 116 V170 H72 V118" marker-end="url(#b)" stroke-dasharray="5 4" opacity="0.75"/>
    </g>
    <text x="360" y="190" text-anchor="middle" font-size="12" fill="rgba(229,231,235,0.65)">ghi entry bàn giao — agent kế tiếp bắt đầu từ đây</text>
    <defs>
      <marker id="b" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 z" fill="var(--primary-500)"/>
      </marker>
    </defs>
  </g>
</svg>

Đọc ngữ cảnh → định tuyến → sửa code **kèm** docs → ghi entry bàn giao → để script phi-AI xác nhận. Vòng lặp khép kín: output của phiên này chính là định dạng input của phiên sau.

## Những kiểu hỏng nên phòng từ đầu

- **Hiến pháp phình to.** Nó được đọc mỗi phiên; dài quá vài trang là agent bắt đầu đọc lướt, mà đọc lướt thì không khác gì bỏ qua.
- **Sổ bàn giao thành bãi đổ diff.** Entry mà kể lại diff thì không ai đọc. Entry là để ghi *quyết định, lý do và việc còn lại*.
- **Luật không kiểm được.** "Viết code sạch" không kiểm được nên sẽ không được tuân thủ. Hãy chọn "file ≤ 200 dòng", "chỉ export qua index của feature".
- **Tài liệu mục.** Chỉ cần một bản đồ nói dối là agent mất niềm tin vào tất cả bản đồ. Vì thế cập nhật docs phải đi chung task với code, không để lần sau.
- **Một cái log khổng lồ.** Tách toàn cục và cục bộ, nếu không tín hiệu sẽ chết chìm.

## Vì sao nó hiệu quả

Chẳng có gì mới ở đây cả. Đây chính là quy trình bàn giao ca của bệnh viện và hàng không: một protocol cố định, một bản ghi việc còn treo, và một checklist mà con người mệt mỏi — hay một model stateless — không thể bỏ qua. Phát triển phần mềm với nhiều agent có đúng hình dạng đó, và cần đúng thứ kỷ luật buồn tẻ đó.

Phần thưởng là tính khả chuyển thật sự. Khi ngữ cảnh sống trong repo thay vì trong cửa sổ chat, bạn có thể đổi agent giữa chừng một feature, chạy song song nhiều agent trên các slice khác nhau, hay tuyển một người thật đọc cùng cuốn sổ đó. Agent thôi làm kiến trúc của bạn. Protocol bàn giao mới là kiến trúc.
