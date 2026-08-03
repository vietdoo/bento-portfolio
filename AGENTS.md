# Project Rules for AI Assistants

## Git Auto-Commit Directive
- Khi lượng code thay đổi trong một hoặc nhiều phiên chat đã đủ hoàn thành một tính năng, sửa lỗi, hoặc cập nhật (meaningful logical unit of work), hãy tự động tạo commit Git.
- **Quy chuẩn đặt tên commit**: Tuân thủ nghiêm ngặt **Conventional Commits v1.0.0** (`<type>(<scope>): <mô tả ngắn ở thì hiện tại>`). Ví dụ: `feat(bento): add project card animation`, `fix(ui): resolve text overflow on mobile`.
- **Co-Author**: Bắt buộc gắn Co-author Claude Bot (`Co-authored-by: claude[bot] <104860714+claude[bot]@users.noreply.github.com>` hoặc `Claude Code <claude-code@anthropic.com>`) vào cuối mọi commit message.
- Tác giả commit: `vietdoo <20280115@student.hcmus.edu.vn>`, hoặc chính danh tính bot/AI agent đang thực hiện commit (ví dụ `devin-ai-integration[bot]`). Không mạo danh tác giả khác.
- Lưu ý: Không commit thư mục `context/` (đã nằm trong `.gitignore`).
- Nếu husky hook báo lỗi do thiếu `pnpm` trong PATH, sử dụng cờ `--no-verify` khi commit.

## Quy Chuẩn Giao Diện Playground (Playground UI Guidelines)
- **Tối giản & Tự nhiên (Basic & Human-crafted)**:
  - Thiết kế UI đơn giản, sạch sẽ, ưu tiên trải nghiệm sử dụng (utility) hơn là trang trí phức tạp.
  - Không thêm các yếu tố nhận diện dạng "AI-generated":
    - Không chèn emoji vào tiêu đề hoặc thẻ bài (ví dụ: tránh `📊`, `🔑`, `⚡ Realtime`).
    - Không tạo các thanh progress bar, badge đánh giá rườm rà, hay nhiều hàng nút transform dư thừa.
- **Đồng bộ Style với Bento Portfolio**:
  - Nền & viền: Sử dụng tông màu `darkslate` (`bg-darkslate-800`, `bg-darkslate-600/30`, `border-darkslate-500`).
  - Highlight & Accent: Sử dụng các class `primary` (`text-primary-400`, `bg-primary-500`) để tự động đổi màu theo theme hệ thống.
- **Cấu trúc Thư mục & Trang**:
  - Trang Astro: `src/pages/playground/[slug].astro` sử dụng `<PlaygroundShell scrollable={true}>`.
  - Component: `src/components/playground/[name]Playground.tsx` (sử dụng SolidJS).
  - Đăng ký thẻ bài ở mảng `projects` trong `src/pages/playground/index.astro`.
- **Tên & Description**:
  - Đặt tên danh từ ngắn gọn, tự nhiên (ví dụ: `Word counter`, `JWT decoder`).
  - Description ngắn gọn 1 dòng, mô tả trực tiếp tính năng.
