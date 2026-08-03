---
title: "5 Engineering Principles That Help My Code Survive Millions of Requests"
description: "Five production habits I use to keep systems understandable, measurable, and resilient long after the launch-day traffic spike."
pubDate: 2026-07-20
category: "architecture"
lang: "en"
translationKey: "engineering-principles-million-requests"
draft: false
---

The systems that taught me the most were not the ones that crashed spectacularly. They were the familiar endpoints that slowly became expensive to change: a small shortcut here, a hand-run release there, one query nobody measured. Then traffic arrived, latency climbed, and every innocent line had an opinion.

I do not have five tricks for handling millions of requests. I have five habits that keep a system legible while the requests arrive. They make incident response calmer because they make the code less surprising.

![Five engineering principles forming a request pipeline](/blog/engineering-principles-million-requests.svg)

## 1. Simplicity over cleverness

The clever version of a decision usually saves lines, not time. Under pressure, the next person needs to see the business state without mentally executing a puzzle.

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

The second version makes precedence explicit and gives the decision a name. That name becomes useful when the rules grow, when we log a transition, or when someone asks why a failed payment still appears pending.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="A readable payment state decision" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb">
    <rect x="18" y="58" width="128" height="62" rx="10" fill="#172554" stroke="#38bdf8"/><text x="82" y="94" text-anchor="middle">paid?</text>
    <path d="M146 89H220M220 89V42H292M220 89V136H292" stroke="#38bdf8" fill="none"/><text x="194" y="72" fill="#a5f3fc">yes</text><text x="194" y="124" fill="#a5f3fc">no</text>
    <rect x="292" y="20" width="118" height="44" rx="8" fill="#0f766e"/><text x="351" y="47" text-anchor="middle">paid</text>
    <rect x="292" y="114" width="118" height="44" rx="8" fill="#172554"/><text x="351" y="141" text-anchor="middle">failed?</text>
    <path d="M410 136H482M482 136V100H554M482 136V164H554" stroke="#38bdf8" fill="none"/>
    <rect x="554" y="78" width="130" height="44" rx="8" fill="#7c2d12"/><text x="619" y="105" text-anchor="middle">failed</text>
    <rect x="554" y="142" width="130" height="30" rx="8" fill="#172554"/><text x="619" y="162" text-anchor="middle">retry / pending</text>
  </g>
</svg>

**Trade-off:** named branches can feel verbose for a two-state decision. Keep a ternary when it is truly binary and obvious. The line is crossed when a reader must remember precedence or domain rules to understand it.

## 2. Scale by design

Scaling is not adding a queue after the outage. It is deciding which work belongs to the request path before the endpoint becomes popular. A user should not wait for every email provider round-trip just because they changed a setting.

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

The API now owns acceptance and validation; workers own retries, provider limits, and delivery. The response contract is honest about that boundary.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="A queue decoupling email delivery from the request" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="18" y="64" width="125" height="52" rx="10" fill="#172554" stroke="#38bdf8"/><text x="80" y="95">HTTP request</text>
    <path d="M143 90H220" stroke="#38bdf8" stroke-width="2"/><rect x="220" y="50" width="140" height="80" rx="10" fill="#0f172a" stroke="#a5f3fc"/><text x="290" y="83">notification</text><text x="290" y="105">queue</text>
    <path d="M360 90H437" stroke="#38bdf8" stroke-width="2"/><rect x="437" y="64" width="110" height="52" rx="10" fill="#172554" stroke="#38bdf8"/><text x="492" y="95">worker</text>
    <path d="M547 90H624" stroke="#38bdf8" stroke-width="2"/><rect x="624" y="64" width="78" height="52" rx="10" fill="#0f766e"/><text x="663" y="95">email</text>
  </g>
</svg>

**Trade-off:** queues add monitoring, idempotency, and eventual consistency. Do not queue work whose result the caller must receive synchronously. Design the boundary early; do not use a queue as decorative infrastructure.

## 3. Measure before optimize

The slowest thing in an incident is often the argument about what is slow. I have seen teams rewrite a cache layer while one unindexed query was doing all the damage.

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

Measure a boundary that can drive a decision: query duration, queue age, dependency latency, error rate. A metric without an owner or a threshold is just telemetry confetti.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Measured query latency before optimization" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb">
    <path d="M55 145H680M55 25V145" stroke="#64748b"/><path d="M70 124L160 116L250 110L340 74L430 102L520 42L650 88" fill="none" stroke="#38bdf8" stroke-width="4"/>
    <circle cx="520" cy="42" r="7" fill="#f59e0b"/><text x="535" y="38" fill="#fcd34d">p95 breach</text>
    <text x="55" y="170" fill="#a5f3fc">before</text><text x="610" y="170" fill="#a5f3fc">after</text><text x="10" y="32" fill="#a5f3fc">ms</text>
  </g>
</svg>

**Trade-off:** instrumentation costs time, storage, and attention. Start with the request path and the user-visible objective. Measuring every function can be as distracting as measuring nothing.

## 4. Automate everything repeatable

If a release requires a senior engineer to remember six terminal commands, it is not a process. It is a ritual with a high bus factor.

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

Automation does more than save clicks. It records the exact path to production, makes it reviewable, and fails consistently when a prerequisite is missing.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="A repeatable continuous delivery pipeline" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="18" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="78" y="94">commit</text>
    <rect x="202" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="262" y="94">test</text>
    <rect x="386" y="62" width="120" height="54" rx="10" fill="#172554" stroke="#38bdf8"/><text x="446" y="94">build</text>
    <rect x="570" y="62" width="120" height="54" rx="10" fill="#0f766e" stroke="#a5f3fc"/><text x="630" y="94">deploy</text>
    <path d="M138 89H202M322 89H386M506 89H570" stroke="#38bdf8" stroke-width="3"/>
  </g>
</svg>

**Trade-off:** automate a stable process first. An unreliable manual process becomes an unreliable automated process faster. Write the checklist once, then encode it.

## 5. Clean code survives longer

Traffic does not kill code as often as change does. A checkout function that validates input, calculates prices, charges a card, writes data, and sends a receipt can work for months. It becomes dangerous the first time one of those responsibilities changes alone.

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

The orchestration still exists, but each collaborator has one reason to change and one surface to test. That makes failure handling explicit instead of accidental.

<svg viewBox="0 0 720 180" width="100%" role="img" aria-label="Checkout responsibilities split into services" style="max-width:100%;height:auto;margin:24px 0">
  <g font-family="Arial, sans-serif" font-size="14" fill="#e5e7eb" text-anchor="middle">
    <rect x="34" y="58" width="135" height="64" rx="10" fill="#172554" stroke="#38bdf8"/><text x="101" y="95">checkout</text>
    <path d="M169 90H242M169 90V38H242M169 90V142H242" stroke="#38bdf8" fill="none"/>
    <rect x="242" y="16" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="43">order service</text>
    <rect x="242" y="68" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="95">payment service</text>
    <rect x="242" y="120" width="156" height="44" rx="8" fill="#0f172a" stroke="#a5f3fc"/><text x="320" y="147">receipt service</text>
  </g>
</svg>

**Trade-off:** do not split code merely to create more files. Extract a boundary when it has distinct policies, failure modes, or tests. Clean code is not maximal abstraction; it is code whose next change has an obvious home.

## Before I call it ready

- Can a new owner explain the decision path without decoding a trick?
- Which part of the work must finish before the request can return?
- What metric proves the change helped the user?
- Can the release and recovery path run without memory-based instructions?
- Does each change have one obvious place to live and one focused test?

These questions do not guarantee a quiet pager. They make the answer to a noisy pager easier to find.
