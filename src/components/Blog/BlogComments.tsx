import { createSignal, onMount, For, Show } from "solid-js";

interface CommentItem {
  id: number;
  postSlug: string;
  name: string;
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
  const [content, setContent] = createSignal("");

  const fontStyle = {
    "font-family": "var(--font-satoshi), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  };

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

  const inputClasses =
    "w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all";

  return (
    <section class="mt-10 pt-8 border-t border-solid border-neutral-800 text-neutral-100" style={fontStyle}>
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold tracking-tight text-neutral-100 m-0" style={fontStyle}>
          {isVi() ? "Bình luận" : "Comments"}{" "}
          <span class="text-xs font-normal text-neutral-400" style={fontStyle}>
            ({comments().length})
          </span>
        </h3>
      </div>

      {/* Form Comment */}
      <form
        onSubmit={handleSubmit}
        class="rounded-xl border border-solid border-neutral-800 bg-neutral-900/70 p-5 mb-8 shadow-sm flex flex-col gap-4"
        style={fontStyle}
      >
        <div>
          <label class="block text-xs font-medium text-neutral-300 mb-1.5" style={fontStyle}>
            {isVi() ? "Họ tên" : "Name"} <span class="text-primary-400">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            placeholder={isVi() ? "Nguyễn Văn A" : "John Doe"}
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            class={inputClasses}
            style={fontStyle}
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-neutral-300 mb-1.5" style={fontStyle}>
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
            class={`${inputClasses} resize-y min-h-[100px]`}
            style={fontStyle}
          />
        </div>

        <Show when={error()}>
          <div class="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg p-3" style={fontStyle}>
            {error()}
          </div>
        </Show>

        <Show when={success()}>
          <div class="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3" style={fontStyle}>
            {success()}
          </div>
        </Show>

        <div class="flex justify-end">
          <button
            type="submit"
            disabled={submitting()}
            class="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-900/90 text-xs font-medium text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
            style={fontStyle}
          >
            <Show when={submitting()} fallback={isVi() ? "Gửi bình luận" : "Post Comment"}>
              {isVi() ? "Đang gửi..." : "Posting..."}
            </Show>
          </button>
        </div>
      </form>

      {/* Danh sách Comment */}
      <Show when={loading()}>
        <div class="text-center py-8 text-neutral-400 text-sm" style={fontStyle}>
          {isVi() ? "Đang tải bình luận..." : "Loading comments..."}
        </div>
      </Show>

      <Show when={!loading() && comments().length === 0}>
        <div class="text-center py-8 text-neutral-400 text-sm border border-dashed border-neutral-800 rounded-xl" style={fontStyle}>
          {isVi()
            ? "Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!"
            : "No comments yet. Be the first to share your thoughts!"}
        </div>
      </Show>

      <div class="space-y-4" style={fontStyle}>
        <For each={comments()}>
          {(comment) => (
            <div class="rounded-xl border border-solid border-neutral-800 bg-neutral-900/50 p-4 transition-colors" style={fontStyle}>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center border border-primary-500/30 select-none" style={fontStyle}>
                    {comment.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span class="font-semibold text-sm text-neutral-100" style={fontStyle}>
                    {comment.name}
                  </span>
                </div>
                <time class="text-xs text-neutral-400" style={fontStyle}>
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p class="text-sm text-neutral-300 m-0 whitespace-pre-line leading-relaxed pl-9" style={fontStyle}>
                {comment.content}
              </p>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
