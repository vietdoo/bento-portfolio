---
title: "Kiến trúc Handover: Đổi từ Claude sang Codex trong 1 giây"
description: "Một pattern ở tầng repo giúp bất kỳ AI agent nào cũng tiếp nhận được công việc dang dở: một bộ hiến pháp, một sổ bàn giao, một bản đồ định tuyến và một cơ chế kiểm tra phi-AI."
pubDate: 2026-08-02
category: "architecture"
image: "/blog/agent-handover-architecture.jpg"
lang: "vi"
translationKey: "agent-handover-architecture"
draft: false
---

![Kiến trúc Handover cho AI Agent](/blog/agent-handover-architecture.jpg)

Bất kỳ ai dùng AI coding agent đủ nhiều đều vấp phải cùng một nỗi đau: **Agent cực kỳ thông minh trong đúng một phiên làm việc, rồi lập tức "mất trí nhớ" ngay khi đóng chat.** 

Bạn dành cả tiếng đồng hồ hướng dẫn agent hiểu vì sao dự án lại chia theo *feature slice* chứ không dùng mô hình layer truyền thống. Agent làm rất mượt, task hoàn thành, cửa sổ chat đóng lại. Hôm sau, một agent mới (hoặc chính nó ở phiên làm việc tiếp theo) tự tin bước vào và đề xuất... tạo ngay thư mục `services/`.

Phản xạ tự nhiên của nhiều người là chọn một AI agent duy nhất (Claude, Cursor, hay Copilot) rồi bám chặt vào nó. Nhưng đó là tư duy sai trục. Câu hỏi cốt lõi không nằm ở chỗ *bạn dùng agent nào*, mà là **công việc được bàn giao giữa các agent như thế nào**. Giải quyết đúng bài toán này, AI agent sẽ chỉ còn là một chi tiết runtime — hoàn toàn có thể thay thế dễ dàng như đổi một database driver.

Dưới đây là kiến trúc Handover mà tôi đang vận hành thực tế trong một monorepo gồm nhiều agent cùng hợp tác. Pattern này độc lập hoàn toàn với công cụ: chạy mượt mà dù bạn dùng CLI agent, IDE assistant hay background agent.

## Ý tưởng cốt lõi: Repository chính là bộ nhớ duy nhất

AI Agent là *stateless* (không lưu trạng thái). Nhưng repository của bạn thì *stateful*. Do đó, mọi ngữ cảnh sống còn phải được lưu trực tiếp **ngay trong repo** — tại những vị trí mà agent bị ràng buộc bắt buộc phải đọc trước khi làm và phải ghi lại sau khi hoàn thành.

Kiến trúc này được xây dựng trên 4 tầng với nhiệm vụ phân tách rõ ràng:

![Bốn trụ cột của Kiến trúc Handover](/blog/handover-four-pillars.jpg)

1. **HIẾN PHÁP (Constitution)**: Một file quy tắc duy nhất đi kèm các adapter mỏng. Chứa các bất biến kiến trúc, checklist DoD và giới hạn cứng. Bắt buộc đọc trước mọi task.
2. **SỔ BÀN GIAO (Ledger)**: Nhật ký chỉ ghi thêm (*append-only*). Lưu lại phiên trước đã làm gì, tại sao ra quyết định như vậy, và còn dang dở những gì.
3. **BẢN ĐỒ ĐỊNH TUYẾN (Routing Map)**: Cây quyết định, module map, API contract và glossary. Trả lời dứt khoát câu hỏi: *"Sửa tính năng này thì code nằm ở đâu?"*
4. **FORCING FUNCTION**: Script tự động chấm điểm tuân thủ của agent. Không dùng LLM để kiểm tra LLM. Nếu agent thiếu đồng bộ docs hoặc quên ghi log bàn giao, build sẽ báo fail ngay lập tức.

> **Lưu ý**: Thiếu một tầng, hệ thống sẽ bị rò rỉ ngữ cảnh. Có luật mà không có sổ thì agent phải quyết định lại từ đầu; có sổ mà không có script cưỡng chế thì chẳng agent nào chịu ghi log.

---

## Trụ cột 1 — Một hiến pháp duy nhất, nhiều adapter mỏng

Mỗi công cụ AI trên thị trường lại yêu cầu một file rule riêng (`CLAUDE.md`, `.cursor/rules`, `GEMINI.md`, `copilot-instructions`). Cái bẫy chết người là để quy tắc bị phân mảnh ra từng file. Chỉ sau vài tuần, luật trên Cursor và luật trên Claude sẽ mâu thuẫn nhau về chính sách test, biến mỗi agent thành một "nhân viên" hành xử theo kiểu hoàn toàn khác nhau.

Giải pháp: Giữ đúng **một nguồn sự thật (Single Source of Truth)** tại file `AGENTS.md`. Tất cả các file rule còn lại chỉ đóng vai trò con trỏ (adapter):

```markdown
<!-- CLAUDE.md / .cursor/rules / GEMINI.md -->
Đọc file AGENTS.md ở thư mục gốc repo trước khi thực hiện bất kỳ công việc nào. 
Không lặp lại hoặc tự ý định nghĩa lại luật tại file này.
```

Chỉ 2 thành phần được phép hiện diện trong Hiến pháp:
- **Bất biến kiến trúc**: Các quy tắc không bao giờ được phá vỡ (ví dụ: mô hình *vertical slice*, mỗi feature một public contract, cấm import chéo nội bộ, file không quá 200 dòng).
- **Definition of Done (DoD)**: Checklist bắt buộc agent phải tick đủ trước khi báo hoàn thành task.

**Nguyên tắc vàng**: Giữ hiến pháp thật ngắn gọn. Hiến pháp được nạp vào context của *mọi* phiên làm việc; mỗi dòng bạn thêm vào là bạn đang tự cắt bớt dung lượng context budget dành cho công việc thực tế.

---

## Trụ cột 2 — Sổ bàn giao: Lưu trữ "ý định" chứ không lưu diff

Đây là trái tim của kiến trúc: một file log dạng *append-only* mà agent bắt buộc phải ghi entry trước khi kết thúc phiên. Đây không phải là changelog (vì `git log` đã làm việc đó), mà là thứ Git không bao giờ lưu trữ được: **Ý định thiết kế (Design Intent)**.

Một entry bàn giao tiêu chuẩn gồm 5 thông tin quan trọng:

| Trường thông tin | Ý nghĩa & Giá trị |
| :--- | :--- |
| **Thời gian & Agent ID** | Xác định log còn mới không và thói quen sinh code của công cụ đó. |
| **Phạm vi (Scope)** | Đụng tới module nào, giúp các agent phiên sau dễ dàng lọc bỏ thông tin nhiễu. |
| **Công việc đã hoàn thành** | Tóm tắt ngắn gọn các thay đổi về code, config hay tài liệu. |
| **Quyết định & Lý do** | Chặn agent sau tự ý lật lại các trade-off đã được thống nhất. |
| **Việc dang dở & Lưu ý** | Bàn giao thực sự: danh sách backlog được sắp xếp ưu tiên bởi chính agent vừa làm. |

Ví dụ: Việc ghi rõ *"Dùng in-memory repository là cố ý để test nhanh, chuyển sang Postgres là task #1 trong backlog"* sẽ giúp agent tiếp theo không tự ý đập bỏ code, cũng không lầm tưởng đó là giải pháp lâu dài.

---

## Trụ cột 3 — Bản đồ định tuyến: Loại bỏ thói quen "đoán mò"

Khi bạn yêu cầu agent *"Hãy thêm rate limiting vào ứng dụng"*, phản xạ của nó là sẽ quét ngẫu nhiên hàng chục file, đốt sạch dung lượng context window, rồi tự đoán một vị trí nghe có vẻ hợp lý.

Một bản đồ định tuyến dạng cây quyết định gọn gàng sẽ giải quyết việc này chỉ trong vài token:

```text
Yêu cầu công việc
 ├── UI / component / animation ....... → feature slice ở Frontend
 ├── API / Tiến trình / Authentication .. → feature slice ở Backend
 ├── Audio / STT / Chấm điểm LLM ...... → Module AI Service
 └── Endpoint / DTO / Schema / Glossary → Sửa code + cập nhật Contract Docs
```

Đi kèm bản đồ là 3 bảng tra cứu bắt buộc:
- **Module Map**: Định vị chính xác vị trí file/class trong dự án.
- **API Contract**: Chuẩn hóa định dạng endpoint và DTO.
- **Glossary (Từ điển thuật ngữ)**: Thống nhất tên gọi nghiệp vụ và enum — ngăn chặn tình trạng 5 agent đặt 5 tên khác nhau cho cùng một khái niệm.

> **Quy tắc sắt**: Mọi thay đổi về endpoint, schema hay thuật ngữ bắt buộc phải cập nhật tài liệu tương ứng ngay trong cùng một commit. Tài liệu không còn là phụ lục đọc cho vui, mà là một phần output của quá trình build.

---

## Trụ cột 4 — Script kiểm tra tự động (Non-AI Forcing Function)

Một sự thật phũ phàng: **AI Agent chấm điểm tuân thủ của chính nó hoàn toàn không đáng tin.** Agent sẵn sàng khẳng định *"Tôi đã cập nhật đầy đủ tài liệu và ghi sổ bàn giao"* trong khi thực tế nó chưa làm gì cả.

Do đó, chốt chặn cuối cùng bắt buộc phải là một script tự động kiểm tra tĩnh đơn giản:

```python
# check_governance.py
# 1. Kiểm tra các file governance có tồn tại đầy đủ không?
# 2. Nếu file Contract (schema/dto/service) thay đổi, docs/ có được cập nhật theo không?
# 3. Sổ bàn giao có được ghi thêm entry mới trong phiên này không?

if errors:
    print("❌ Governance Check Failed!")
    sys.exit(1)
```

Script này không bị dỗ ngọt bởi prompt engineering, chạy trực tiếp trong CI/CD, và biến câu dặn *"Nhớ cập nhật docs nhé"* từ một lời cầu nguyện thành một quy tắc build cứng.

---

## Vòng lặp chuẩn cho một phiên làm việc

Khi kết hợp cả 4 trụ cột, mọi AI agent — dù thuộc bất kỳ nhà phát triển nào — đều tuân theo một chu trình khép kín:

![Vòng lặp làm việc chuẩn của AI Agent](/blog/handover-session-loop.jpg)

1. **Kéo Docs mới nhất**: Cập nhật quy tắc và contract hiện tại.
2. **Đọc Sổ Bàn Giao**: Nắm bắt ý định và các công việc dang dở từ phiên trước.
3. **Tra Bản Đồ Định Tuyến**: Định vị đúng module cần can thiệp.
4. **Thực Hiện Code & Đồng Bộ Docs**: Sửa đổi code đồng thời cập nhật tài liệu liên quan.
5. **Kiểm Tra Script Phi-AI**: Chạy script xác nhận 0 lỗi governance trước khi kết thúc.

Vòng lặp hoàn chỉnh: Output của phiên làm việc trước chính là định dạng Input chuẩn cho phiên làm việc tiếp theo.

---

## Các bẫy chống mẫu (Anti-Patterns) cần tránh

- **Hiến pháp quá phình to**: Hiến pháp được nạp vào mọi phiên làm việc. Nếu dài quá vài trang, agent sẽ bắt đầu "đọc lướt", và đọc lướt cũng đồng nghĩa với việc bỏ qua quy tắc.
- **Sổ bàn giao biến thành bãi rác Git Diff**: Log bàn giao không dùng để chép lại diff code. Nó dùng để lưu **quyết định, lý do và danh sách việc cần làm tiếp theo**.
- **Quy tắc mơ hồ không thể kiểm tra**: Các câu như *"Hãy viết code sạch"* hoàn toàn vô giá trị vì không thể đo lường. Hãy thay bằng quy tắc cụ thể: *"Mỗi file không quá 200 dòng"*, *"Chỉ export qua index của feature"*.
- **Tài liệu bị lỗi thời (Stale Docs)**: Chỉ cần bản đồ sai một lần, agent sẽ mất niềm tin vào toàn bộ tài liệu trong repo. Vì vậy, cập nhật docs phải đi kèm trong cùng task với code.

---

## Lời kết

Kiến trúc Handover không phải là một công nghệ mới lạ. Nó mô phỏng lại đúng quy trình bàn giao ca làm việc trong y tế và hàng không: một protocol cố định, một sổ ghi chép trạng thái, và một checklist nghiêm ngặt.

Phần thưởng lớn nhất bạn nhận được là **Tính khả chuyển thực sự (True Interchangeability)**. Khi ngữ cảnh được đóng đóng gói sống động ngay trong repo chứ không nằm ở cửa sổ chat, bạn có thể thoải mái chuyển đổi giữa Claude, Cursor, Copilot hay bất kỳ model mới nào vừa ra mắt mà không sợ mất đà dự án. AI Agent chỉ là lực lượng thực thi tạm thời — chính Protocol bàn giao mới là Kiến trúc bền vững của bạn.
