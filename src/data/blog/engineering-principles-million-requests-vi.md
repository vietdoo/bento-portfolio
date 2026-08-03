---
title: "5 Triết lý kỹ thuật giúp tôi viết code sống sót qua hàng triệu request"
description: "Năm thói quen production giúp hệ thống dễ hiểu, đo được và chịu thay đổi tốt hơn rất lâu sau đợt traffic đầu tiên."
pubDate: 2026-07-20
category: "architecture"
lang: "vi"
translationKey: "engineering-principles-million-requests"
draft: false
---

Một endpoint tưởng quá quen thường không nổ tung ngay. Nó chậm rãi tích thêm một shortcut, một bước deploy làm tay, một query “chắc là ổn”. Đến khi traffic tăng, latency đi lên và cả team nhận ra mỗi dòng code đều đang mang theo một giả định cũ.

Tôi không có năm mẹo để xử lý hàng triệu request. Tôi có năm thói quen giúp hệ thống vẫn đọc được khi request bắt đầu đổ về. Lúc pager reo, sự dễ hiểu đáng giá hơn một đoạn code trông thông minh.

![Năm nguyên tắc kỹ thuật tạo thành một pipeline xử lý request](/blog/engineering-principles-million-requests.svg)

## 1. Đơn giản hơn thông minh phô diễn

Phiên bản “khéo” thường chỉ tiết kiệm vài dòng, không tiết kiệm thời gian cho người trực incident. Khi đang căng, người đọc cần thấy trạng thái nghiệp vụ, không cần giải một câu đố precedence.

### Before

```ts
const status = paid
  ? "paid"
  : failed
    ? "failed"
    : retrying
      ? "retry"
      : "pending";
```

### After

```ts
function paymentStatus(payment: Payment): PaymentStatus {
  if (payment.paid) return "paid";
  if (payment.failed) return "failed";
  if (payment.retrying) return "retry";
  return "pending";
}
```

Tên hàm biến một chuỗi điều kiện thành một quyết định có ngữ cảnh. Mai này cần log transition hay thêm trạng thái mới, chỗ sửa cũng không phải đi tìm trong một biểu thức lồng nhau.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Luồng quyết định trạng thái thanh toán dễ đọc" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb">
    <rect x="18" y="58" width="128" height="62" rx="10" fill="#172554" stroke="#38bdf8"/><text x="82" y="94" text-anchor="middle">đã thanh toán?</text>
    <path d="M146 89H220M220 89V42H292M220 89V136H292" stroke="#38bdf8" fill="none"/><text x="194" y="72" fill="#a5f3fc">có</text><text x="194" y="124" fill="#a5f3fc">không</text>
    <rect x="292" y="20" width="118" height="44" rx="8" fill="#0f766e"/><text x="351" y="47" text-anchor="middle">paid</text>
    <rect x="292" y="114" width="118" height="44" rx="8" fill="#172554"/><text x="351" y="141" text-anchor="middle">failed?</text>
    <path d="M410 136H482M482 136V100H554M482 136V164H554" stroke="#38bdf8" fill="none"/>
    <rect x="554" y="78" width="130" height="44" rx="8" fill="#7c2d12"/><text x="619" y="105" text-anchor="middle">failed</text>
    <rect x="554" y="142" width="130" height="30" rx="8" fill="#172554"/><text x="619" y="162" text-anchor="middle">retry / pending</text>
  </g>
</svg>

**Đổi lại:** đừng biến ternary hai nhánh rõ ràng thành một ceremony. Tôi tách ra khi người đọc phải nhớ rule nghiệp vụ hoặc precedence để hiểu dòng code.

## 2. Thiết kế sẵn đường để scale

Scale không phải là thêm queue sau một lần outage. Nó là quyết định việc nào thuộc request path ngay từ lúc endpoint chưa nổi tiếng. Người dùng đổi cài đặt không nên phải chờ nhà cung cấp email trả lời.

### Before

```ts
for (const user of users) {
  await sendEmail(user);
}

return { delivered: users.length };
```

### After

```ts
await notificationQueue.addBulk(
  users.map((user) => ({
    name: "email",
    data: { userId: user.id },
  })),
);

return { accepted: users.length };
```

API giờ chịu trách nhiệm validate và nhận việc; worker chịu retry, rate limit và delivery. Contract trả về `accepted` cũng nói thật hơn là hứa email đã đến.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Queue tách việc gửi email khỏi request" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="18" y="64" width="125" height="52" rx="10" fill="#172554" stroke="#38bdf8"/><text x="80" y="95">HTTP request</text>
    <path d="M143 90H220" stroke="#38bdf8" stroke-width="2"/><rect x="220" y="50" width="140" height="80" rx="10" fill="#0f172a" stroke="#a5f3fc"/><text x="290" y="83">notification</text><text x="290" y="105">queue</text>
    <path d="M360 90H437" stroke="#38bdf8" stroke-width="2"/><rect x="437" y="64" width="110" height="52" rx="10" fill="#172554" stroke="#38bdf8"/><text x="492" y="95">worker</text>
    <path d="M547 90H624" stroke="#38bdf8" stroke-width="2"/><rect x="624" y="64" width="78" height="52" rx="10" fill="#0f766e"/><text x="663" y="95">email</text>
  </g>
</svg>

**Đổi lại:** queue kéo theo monitoring, idempotency và eventual consistency. Đừng queue thứ mà caller cần nhận kết quả ngay. Hãy đặt ranh giới sớm, đừng dùng queue để “trông có vẻ scale”.

## 3. Đo trước khi tối ưu

Thứ tốn thời gian nhất trong incident đôi khi là cuộc tranh luận xem cái gì chậm. Tôi từng thấy team viết lại cache trong khi một query thiếu index mới là thủ phạm.

### Before

```ts
const result = await expensiveQuery();
return compressResult(result);
```

### After

```ts
const startedAt = performance.now();
const result = await expensiveQuery();

metrics.histogram(
  "report.query_ms",
  performance.now() - startedAt,
);

return compressResult(result);
```

Hãy đo một boundary giúp ra quyết định: query duration, queue age, latency dependency hay error rate. Metric không có owner và threshold chỉ là pháo giấy telemetry.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Đo độ trễ query trước khi tối ưu" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb">
    <path d="M55 145H680M55 25V145" stroke="#64748b"/><path d="M70 124L160 116L250 110L340 74L430 102L520 42L650 88" fill="none" stroke="#38bdf8" stroke-width="4"/>
    <circle cx="520" cy="42" r="7" fill="#f59e0b"/><text x="535" y="38" fill="#fcd34d">p95 breach</text>
    <text x="55" y="170" fill="#a5f3fc">trước</text><text x="610" y="170" fill="#a5f3fc">sau</text><text x="10" y="32" fill="#a5f3fc">ms</text>
  </g>
</svg>

**Đổi lại:** instrumentation tốn thời gian, storage và attention. Bắt đầu từ request path và mục tiêu người dùng nhìn thấy. Đo từng function có thể gây nhiễu chẳng kém gì không đo gì.

## 4. Tự động hoá mọi thứ lặp lại

Nếu deploy cần một senior nhớ sáu lệnh terminal thì đó không phải process. Nó là nghi lễ có bus factor rất cao.

### Before

```sh
npm run test && npm run build
scp -r dist/* server:/var/www
ssh server "systemctl restart portfolio"
```

### After

```yaml
deploy:
  needs: [test, build]
  steps:
    - uses: actions/download-artifact@v4
    - run: pnpm deploy
```

Automation không chỉ tiết kiệm click. Nó ghi lại đường đi chính xác ra production, cho phép review và fail nhất quán nếu thiếu prerequisite.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Pipeline triển khai có thể lặp lại" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="18" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="78" y="94">commit</text>
    <rect x="202" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="262" y="94">test</text>
    <rect x="386" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="446" y="94">build</text>
    <rect x="570" y="62" width="120" height="54" rx="10" fill="#0f766e" stroke="#a5f3fc"/><text x="630" y="94">deploy</text>
    <path d="M138 89H202M322 89H386M506 89H570" stroke="#38bdf8" stroke-width="3"/>
  </g>
</svg>

**Đổi lại:** hãy automate một process đã ổn định. Process làm tay lộn xộn sẽ thành process tự động lộn xộn, chỉ là nhanh hơn. Viết checklist trước, rồi encode nó.

## 5. Code sạch sống lâu hơn

Traffic không giết code nhiều bằng thay đổi. Hàm checkout vừa validate, tính giá, charge card, ghi database và gửi receipt có thể chạy vài tháng. Nó nguy hiểm vào ngày chỉ một trách nhiệm trong đó cần đổi.

### Before

```ts
async function checkout(req: Request) {
  const input = await req.json();
  const total = price(input.items);
  const charge = await chargeCard(input.card, total);
  await database.orders.insert({ input, total, charge });
  await sendReceipt(input.email, total);
}
```

### After

```ts
const order = await orderService.create(input);
await paymentService.capture(order);
await receiptService.send(order);
```

Orchestration vẫn ở đó, nhưng mỗi collaborator chỉ có một lý do để đổi và một surface để test. Failure handling vì vậy trở thành lựa chọn rõ ràng thay vì tình cờ.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Tách trách nhiệm checkout thành các service" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="34" y="58" width="135" height="64" rx="10" fill="#172554" stroke="#38bdf8"/><text x="101" y="95">checkout</text>
    <path d="M169 90H242M169 90V38H242M169 90V142H242" stroke="#38bdf8" fill="none"/>
    <rect x="242" y="16" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="43">order service</text>
    <rect x="242" y="68" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="95">payment service</text>
    <rect x="242" y="120" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="147">receipt service</text>
  </g>
</svg>

**Đổi lại:** đừng tách code chỉ để có nhiều file hơn. Extract boundary khi nó có policy, failure mode hoặc test riêng. Code sạch không phải abstraction tối đa; nó là code mà thay đổi tiếp theo có một nơi ở hiển nhiên.

## Checklist trước khi gọi là xong

- Người nhận ownership mới có giải thích được decision path mà không giải mã trick không?
- Phần việc nào bắt buộc xong trước khi request trả về?
- Metric nào chứng minh thay đổi này giúp người dùng?
- Deploy và recovery có chạy được mà không cần dựa vào trí nhớ của một người?
- Mỗi thay đổi có một nơi ở rõ ràng và một test tập trung không?

Những câu hỏi này không hứa pager sẽ im. Chúng giúp câu trả lời xuất hiện nhanh hơn khi pager reo.
