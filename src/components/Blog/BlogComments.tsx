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
    "w-full px-3.5 py-2.5 bg-darkslate-700 border border-darkslate-500 rounded-lg text-neutral-100 text-sm placeholder:text-darkslate-400 focus:outline-none focus:border-primary-500/80 transition-colors font-sans";

  return (
    <section class="mt-12 pt-8 border-t border-solid border-neutral-800 text-neutral-100 font-sans">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold tracking-tight text-neutral-100 m-0 font-sans">
          {isVi() ? "Bình luận" : "Comments"}{" "}
          <span class="text-sm font-normal text-neutral-400">
            ({comments().length})
          </span>
        </h3>
      </div>

      {/* Form Comment */}
      <form
        onSubmit={handleSubmit}
        class="rounded-xl border border-darkslate-500 bg-darkslate-600/30 p-5 mb-8 shadow-sm font-sans flex flex-col gap-4"
      >
        <div>
          <label class="block text-xs font-medium text-darkslate-300 mb-1.5 font-sans">
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
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-darkslate-300 mb-1.5 font-sans">
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
          />
        </div>

        <Show when={error()}>
          <div class="text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg p-3 font-sans">
            {error()}
          </div>
        </Show>

        <Show when={success()}>
          <div class="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 font-sans">
            {success()}
          </div>
        </Show>

        <div class="flex justify-end">
          <button
            type="submit"
            disabled={submitting()}
            class="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-sans"
          >
            <Show when={submitting()} fallback={isVi() ? "Gửi bình luận" : "Post Comment"}>
              {isVi() ? "Đang gửi..." : "Posting..."}
            </Show>
          </button>
        </div>
      </form>

      {/* Danh sách Comment */}
      <Show when={loading()}>
        <div class="text-center py-8 text-darkslate-400 text-sm font-sans">
          {isVi() ? "Đang tải bình luận..." : "Loading comments..."}
        </div>
      </Show>

      <Show when={!loading() && comments().length === 0}>
        <div class="text-center py-8 text-darkslate-400 text-sm border border-dashed border-darkslate-500/50 rounded-xl font-sans">
          {isVi()
            ? "Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!"
            : "No comments yet. Be the first to share your thoughts!"}
        </div>
      </Show>

      <div class="space-y-4">
        <For each={comments()}>
          {(comment) => (
            <div class="rounded-xl border border-darkslate-500/60 bg-darkslate-600/20 p-4 transition-colors font-sans">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2.5">
                  <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center border border-primary-500/30 select-none">
                    {comment.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span class="font-semibold text-sm text-neutral-100">
                    {comment.name}
                  </span>
                </div>
                <time class="text-xs text-neutral-400">
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p class="text-sm text-neutral-300 m-0 whitespace-pre-line leading-relaxed pl-9 font-sans">
                {comment.content}
              </p>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
