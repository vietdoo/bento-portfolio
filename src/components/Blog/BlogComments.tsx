import { createSignal, onMount, For, Show } from "solid-js";

interface CommentItem {
  id: number;
  postSlug: string;
  name: string;
  website?: string;
  content: string;
  createdAt: string;
}

interface BlogCommentsProps {
  postSlug: string;
  lang?: "en" | "vi";
}

export default function BlogComments(props: BlogCommentsProps) {
  const isVi = () => props.lang === "vi";

  const [comments, setComments] = createSignal<CommentItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [website, setWebsite] = createSignal("");
  const [content, setContent] = createSignal("");

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(props.postSlug)}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    fetchComments();
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name().trim() || !content().trim()) {
      setError(
        isVi()
          ? "Vui lòng nhập tên và nội dung bình luận."
          : "Please enter your name and comment content.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug: props.postSlug,
          name: name().trim(),
          email: email().trim() || undefined,
          website: website().trim() || undefined,
          content: content().trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post comment");
      }

      const newComment = await res.json();
      setComments([newComment, ...comments()]);
      setContent("");
      setSuccess(
        isVi()
          ? "Bình luận của bạn đã được gửi thành công!"
          : "Your comment has been posted successfully!",
      );
    } catch (err: any) {
      setError(err.message || (isVi() ? "Đã có lỗi xảy ra." : "An error occurred."));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(isVi() ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section class="mt-12 pt-8 border-t border-darkslate-600/40 text-neutral-100 font-sans">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold tracking-tight text-neutral-100 m-0">
          {isVi() ? "Bình luận" : "Comments"}{" "}
          <span class="text-sm font-normal text-neutral-400">
            ({comments().length})
          </span>
        </h3>
      </div>

      {/* Form Comment */}
      <form
        onSubmit={handleSubmit}
        class="rounded-xl border border-darkslate-600/40 bg-darkslate-800/50 p-5 mb-8 shadow-sm"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1">
              {isVi() ? "Họ tên" : "Name"} <span class="text-primary-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder={isVi() ? "Nguyễn Văn A" : "John Doe"}
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkslate-600/50 bg-darkslate-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1">
              {isVi() ? "Email (tùy chọn)" : "Email (optional)"}
            </label>
            <input
              type="email"
              maxLength={150}
              placeholder="you@example.com"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkslate-600/50 bg-darkslate-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-neutral-300 mb-1">
              {isVi() ? "Website (tùy chọn)" : "Website (optional)"}
            </label>
            <input
              type="url"
              maxLength={200}
              placeholder="https://example.com"
              value={website()}
              onInput={(e) => setWebsite(e.currentTarget.value)}
              class="w-full rounded-lg border border-darkslate-600/50 bg-darkslate-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-400 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-xs font-medium text-neutral-300 mb-1">
            {isVi() ? "Nội dung bình luận" : "Comment"} <span class="text-primary-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            maxLength={2000}
            placeholder={
              isVi()
                ? "Chia sẻ suy nghĩ của bạn về bài viết này..."
                : "Share your thoughts on this post..."
            }
            value={content()}
            onInput={(e) => setContent(e.currentTarget.value)}
            class="w-full rounded-lg border border-darkslate-600/50 bg-darkslate-900/80 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:border-primary-400 focus:outline-none transition-colors resize-y min-h-[100px]"
          />
        </div>

        <Show when={error()}>
          <div class="mb-4 text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg p-3">
            {error()}
          </div>
        </Show>

        <Show when={success()}>
          <div class="mb-4 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3">
            {success()}
          </div>
        </Show>

        <div class="flex justify-end">
          <button
            type="submit"
            disabled={submitting()}
            class="inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-darkslate-900 transition-colors hover:bg-primary-400 disabled:opacity-50 cursor-pointer"
          >
            <Show when={submitting()} fallback={isVi() ? "Gửi bình luận" : "Post Comment"}>
              {isVi() ? "Đang gửi..." : "Posting..."}
            </Show>
          </button>
        </div>
      </form>

      {/* Danh sách Comment */}
      <Show when={loading()}>
        <div class="text-center py-8 text-neutral-400 text-sm">
          {isVi() ? "Đang tải bình luận..." : "Loading comments..."}
        </div>
      </Show>

      <Show when={!loading() && comments().length === 0}>
        <div class="text-center py-8 text-neutral-500 text-sm border border-dashed border-darkslate-600/40 rounded-xl">
          {isVi()
            ? "Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!"
            : "No comments yet. Be the first to share your thoughts!"}
        </div>
      </Show>

      <div class="space-y-4">
        <For each={comments()}>
          {(comment) => (
            <div class="rounded-xl border border-darkslate-600/40 bg-darkslate-800/40 p-4 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 font-semibold text-xs border border-primary-500/30">
                    {comment.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <Show
                      when={comment.website}
                      fallback={
                        <span class="font-medium text-sm text-neutral-200">
                          {comment.name}
                        </span>
                      }
                    >
                      <a
                        href={comment.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="font-medium text-sm text-primary-400 hover:underline"
                      >
                        {comment.name}
                      </a>
                    </Show>
                  </div>
                </div>
                <time class="text-xs text-neutral-400">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p class="text-sm text-neutral-300 m-0 whitespace-pre-line leading-relaxed pl-10">
                {comment.content}
              </p>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
