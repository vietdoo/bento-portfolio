# Project Rules

## Git Auto-Commit Directive
- Khi lượng code thay đổi trong một hoặc nhiều phiên chat đã đủ hoàn thành một tính năng, sửa lỗi, hoặc cập nhật (meaningful logical unit of work), hãy tự động tạo commit Git.
- Tác giả commit: `vietdoo <20280115@student.hcmus.edu.vn>`.
- Lưu ý: Không commit thư mục `context/` (đã nằm trong `.gitignore`).
- Nếu husky hook báo lỗi do thiếu `pnpm` trong PATH, sử dụng cờ `--no-verify` khi commit.
