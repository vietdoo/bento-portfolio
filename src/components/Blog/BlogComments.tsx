import { createSignal, onMount, For, Show } from "solid-js";

interface CommentItem {
  id: number;
  postSlug: string;
  name: string;
  content: string;
  ipAddress?: string;
  parentId?: number | null;
  createdAt: string;
}

interface BlogCommentsProps {
  postSlug: string;
  lang?: "en" | "vi";
}

const AVATAR_PALETTE = [
  "#2563eb", // blue
  "#059669", // emerald
  "#7c3aed", // violet
  "#d97706", // amber
  "#e11d48", // rose
  "#0891b2", // cyan
  "#db2777", // pink
  "#4f46e5", // indigo
  "#0d9488", // teal
  "#ea580c", // orange
];

function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAvatarBgColor(seed?: string): string {
  if (!seed) return AVATAR_PALETTE[0];
  const idx = hashStringToSeed(seed) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function getInitials(fullName: string): string {
  if (!fullName) return "?";
  const words = fullName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function BlogComments(props: BlogCommentsProps) {
  const isVi = () => props.lang === "vi";

  const [comments, setComments] = createSignal<CommentItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal<string | null>(null);

  // Top-level form state
  const [isMainFormOpen, setIsMainFormOpen] = createSignal(false);
  const [mainName, setMainName] = createSignal("");
  const [mainContent, setMainContent] = createSignal("");

  // Inline reply state
  const [replyingToId, setReplyingToId] = createSignal<number | null>(null);
  const [replyName, setReplyName] = createSignal("");
  const [replyContent, setReplyContent] = createSignal("");

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

  const handlePostMainComment = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!mainName().trim() || !mainContent().trim()) {
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
          name: mainName().trim(),
          content: mainContent().trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post comment");
      }

      const newComment = await res.json();
      setComments([newComment, ...comments()]);
      setMainContent("");
      setIsMainFormOpen(false);
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

  const handlePostInlineReply = async (e: Event, parentId: number) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!replyName().trim() || !replyContent().trim()) {
      setError(
        isVi()
          ? "Vui lòng nhập tên và nội dung phản hồi."
          : "Please enter your name and reply content.",
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
          name: replyName().trim(),
          content: replyContent().trim(),
          parentId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to post reply");
      }

      const newComment = await res.json();
      setComments([...comments(), newComment]);
      setReplyContent("");
      setReplyingToId(null);
      setSuccess(
        isVi()
          ? "Câu phản hồi của bạn đã được đăng thành công!"
          : "Your reply has been posted successfully!",
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

  // Root comments (no parentId) ordered by createdAt DESC
  const rootComments = () =>
    comments()
      .filter((c) => !c.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Replies for a given parentId ordered by createdAt ASC (chronological order)
  const getReplies = (parentId: number) =>
    comments()
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getCommentById = (id: number) => comments().find((c) => c.id === id);

  const inputClasses =
    "w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-lg text-neutral-100 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all font-sans";

  return (
    <section class="mt-10 pt-8 border-t border-solid border-neutral-800 text-neutral-100 font-sans" style={fontStyle}>
      {/* Top Header & Toggle Button */}
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold tracking-tight text-neutral-100 m-0" style={fontStyle}>
          {isVi() ? "Bình luận" : "Comments"}{" "}
          <span class="text-xs font-normal text-neutral-400" style={fontStyle}>
            ({comments().length})
          </span>
        </h3>

        <button
          type="button"
          onClick={() => {
            setIsMainFormOpen(!isMainFormOpen());
            setError(null);
            setSuccess(null);
          }}
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-neutral-700 bg-neutral-900/80 text-xs font-medium text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer"
          style={fontStyle}
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <Show when={isMainFormOpen()} fallback={<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />}>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </Show>
          </svg>
          <span>{isVi() ? (isMainFormOpen() ? "Đóng form" : "Thêm bình luận") : (isMainFormOpen() ? "Close form" : "Add Comment")}</span>
        </button>
      </div>

      <Show when={error()}>
        <div class="mb-4 text-xs text-red-400 bg-red-950/40 border border-red-800/40 rounded-lg p-3" style={fontStyle}>
          {error()}
        </div>
      </Show>

      <Show when={success()}>
        <div class="mb-4 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3" style={fontStyle}>
          {success()}
        </div>
      </Show>

      {/* Main Comment Form (Expandable) */}
      <Show when={isMainFormOpen()}>
        <form
          onSubmit={handlePostMainComment}
          class="rounded-xl border border-solid border-neutral-800 bg-neutral-900/70 p-5 mb-8 shadow-sm flex flex-col gap-4 font-sans transition-all"
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
              value={mainName()}
              onInput={(e) => setMainName(e.currentTarget.value)}
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
              value={mainContent()}
              onInput={(e) => setMainContent(e.currentTarget.value)}
              class={`${inputClasses} resize-y min-h-[100px]`}
              style={fontStyle}
            />
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMainFormOpen(false)}
              class="px-3.5 py-2 rounded-lg border border-neutral-800 bg-neutral-950/60 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              style={fontStyle}
            >
              {isVi() ? "Hủy" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={submitting()}
              class="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-neutral-700 bg-neutral-900/90 text-xs font-medium text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50 font-sans"
              style={fontStyle}
            >
              <Show when={submitting()} fallback={isVi() ? "Gửi bình luận" : "Post Comment"}>
                {isVi() ? "Đang gửi..." : "Posting..."}
              </Show>
            </button>
          </div>
        </form>
      </Show>

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

      {/* Comment Tree List */}
      <div class="space-y-6" style={fontStyle}>
        <For each={rootComments()}>
          {(comment) => {
            const avatarBg = () => getAvatarBgColor(comment.ipAddress || comment.name);
            const replies = () => getReplies(comment.id);
            const isReplyingThis = () => replyingToId() === comment.id;

            return (
              <div class="flex flex-col gap-3 font-sans">
                {/* Root Comment Card */}
                <div class="rounded-xl border border-solid border-neutral-800 bg-neutral-900/50 p-4 transition-colors shadow-sm" style={fontStyle}>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="flex-shrink-0 w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center select-none shadow-sm"
                        style={{ "background-color": avatarBg(), ...fontStyle }}
                      >
                        {getInitials(comment.name)}
                      </div>
                      <span class="font-semibold text-sm text-neutral-100" style={fontStyle}>
                        {comment.name}
                      </span>
                    </div>

                    <div class="flex items-center gap-3">
                      <time class="text-xs text-neutral-400" style={fontStyle}>
                        {formatDate(comment.createdAt)}
                      </time>

                      {/* Reply Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isReplyingThis()) {
                            setReplyingToId(null);
                          } else {
                            setReplyingToId(comment.id);
                            if (!replyName()) setReplyName(mainName());
                          }
                        }}
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-700 bg-neutral-900/80 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer"
                        style={fontStyle}
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span>{isVi() ? "Trả lời" : "Reply"}</span>
                      </button>
                    </div>
                  </div>

                  <p class="text-sm text-neutral-300 m-0 whitespace-pre-line leading-relaxed pl-10.5" style={fontStyle}>
                    {comment.content}
                  </p>
                </div>

                {/* Inline Reply Form for Root Comment */}
                <Show when={isReplyingThis()}>
                  <form
                    onSubmit={(e) => handlePostInlineReply(e, comment.id)}
                    class="ml-6 sm:ml-8 rounded-xl border border-solid border-neutral-800 bg-neutral-900/80 p-4 flex flex-col gap-3 font-sans transition-all"
                    style={fontStyle}
                  >
                    <div class="flex items-center justify-between text-xs text-primary-400 font-medium">
                      <span>
                        {isVi() ? "Trả lời bình luận của" : "Replying to"} <strong>@{comment.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        ✕ {isVi() ? "Đóng" : "Close"}
                      </button>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-neutral-300 mb-1" style={fontStyle}>
                        {isVi() ? "Họ tên" : "Name"} <span class="text-primary-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        placeholder={isVi() ? "Nguyễn Văn A" : "John Doe"}
                        value={replyName()}
                        onInput={(e) => setReplyName(e.currentTarget.value)}
                        class={inputClasses}
                        style={fontStyle}
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-neutral-300 mb-1" style={fontStyle}>
                        {isVi() ? "Nội dung phản hồi" : "Reply"} <span class="text-primary-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={3}
                        maxLength={2000}
                        placeholder={
                          isVi()
                            ? `Trả lời @${comment.name}...`
                            : `Replying to @${comment.name}...`
                        }
                        value={replyContent()}
                        onInput={(e) => setReplyContent(e.currentTarget.value)}
                        class={`${inputClasses} resize-y min-h-[80px]`}
                        style={fontStyle}
                      />
                    </div>

                    <div class="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        class="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950/60 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                        style={fontStyle}
                      >
                        {isVi() ? "Hủy" : "Cancel"}
                      </button>
                      <button
                        type="submit"
                        disabled={submitting()}
                        class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900/90 text-xs font-medium text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                        style={fontStyle}
                      >
                        <Show when={submitting()} fallback={isVi() ? "Gửi phản hồi" : "Submit Reply"}>
                          {isVi() ? "Đang gửi..." : "Submitting..."}
                        </Show>
                      </button>
                    </div>
                  </form>
                </Show>

                {/* Reddit-Style Nested Replies Tree Container */}
                <Show when={replies().length > 0}>
                  <div class="relative pl-6 sm:pl-8 space-y-3 border-l-2 border-solid border-neutral-700/60 ml-4 mt-1">
                    <For each={replies()}>
                      {(reply) => {
                        const replyAvatarBg = () => getAvatarBgColor(reply.ipAddress || reply.name);
                        const parentComment = () => getCommentById(reply.parentId || 0);
                        const isReplyingSub = () => replyingToId() === reply.id;

                        return (
                          <div class="relative flex flex-col gap-2 font-sans">
                            {/* Branch connector line connecting to parent tree */}
                            <div class="absolute -left-[24px] sm:-left-[32px] top-5 w-4 h-[2px] bg-neutral-700/60" />

                            {/* Reply Card */}
                            <div class="rounded-xl border border-solid border-neutral-800/80 bg-neutral-900/40 p-3.5 transition-colors shadow-xs" style={fontStyle}>
                              <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                  <div
                                    class="flex-shrink-0 w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center select-none shadow-sm"
                                    style={{ "background-color": replyAvatarBg(), ...fontStyle }}
                                  >
                                    {getInitials(reply.name)}
                                  </div>
                                  <div class="flex items-center gap-1.5 flex-wrap">
                                    <span class="font-semibold text-sm text-neutral-100" style={fontStyle}>
                                      {reply.name}
                                    </span>
                                    <Show when={parentComment()}>
                                      <span class="text-xs text-neutral-500 font-normal">
                                        ► <span class="text-primary-400 font-medium">@{parentComment()?.name}</span>
                                      </span>
                                    </Show>
                                  </div>
                                </div>

                                <div class="flex items-center gap-2.5">
                                  <time class="text-xs text-neutral-400" style={fontStyle}>
                                    {formatDate(reply.createdAt)}
                                  </time>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isReplyingSub()) {
                                        setReplyingToId(null);
                                      } else {
                                        setReplyingToId(reply.id);
                                        if (!replyName()) setReplyName(mainName());
                                      }
                                    }}
                                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950/60 text-[11px] font-medium text-neutral-400 hover:text-white hover:border-neutral-600 transition-all cursor-pointer"
                                    style={fontStyle}
                                  >
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    <span>{isVi() ? "Trả lời" : "Reply"}</span>
                                  </button>
                                </div>
                              </div>

                              <p class="text-sm text-neutral-300 m-0 whitespace-pre-line leading-relaxed pl-9" style={fontStyle}>
                                {reply.content}
                              </p>
                            </div>

                            {/* Inline Reply Form for Sub-reply */}
                            <Show when={isReplyingSub()}>
                              <form
                                onSubmit={(e) => handlePostInlineReply(e, reply.id)}
                                class="ml-4 rounded-xl border border-solid border-neutral-800 bg-neutral-900/80 p-3.5 flex flex-col gap-3 font-sans transition-all"
                                style={fontStyle}
                              >
                                <div class="flex items-center justify-between text-xs text-primary-400 font-medium">
                                  <span>
                                    {isVi() ? "Trả lời bình luận của" : "Replying to"} <strong>@{reply.name}</strong>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToId(null)}
                                    class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                                  >
                                    ✕ {isVi() ? "Đóng" : "Close"}
                                  </button>
                                </div>

                                <div>
                                  <label class="block text-xs font-medium text-neutral-300 mb-1" style={fontStyle}>
                                    {isVi() ? "Họ tên" : "Name"} <span class="text-primary-400">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    maxLength={100}
                                    placeholder={isVi() ? "Nguyễn Văn A" : "John Doe"}
                                    value={replyName()}
                                    onInput={(e) => setReplyName(e.currentTarget.value)}
                                    class={inputClasses}
                                    style={fontStyle}
                                  />
                                </div>

                                <div>
                                  <label class="block text-xs font-medium text-neutral-300 mb-1" style={fontStyle}>
                                    {isVi() ? "Nội dung phản hồi" : "Reply"} <span class="text-primary-400">*</span>
                                  </label>
                                  <textarea
                                    required
                                    rows={3}
                                    maxLength={2000}
                                    placeholder={
                                      isVi()
                                        ? `Trả lời @${reply.name}...`
                                        : `Replying to @${reply.name}...`
                                    }
                                    value={replyContent()}
                                    onInput={(e) => setReplyContent(e.currentTarget.value)}
                                    class={`${inputClasses} resize-y min-h-[80px]`}
                                    style={fontStyle}
                                  />
                                </div>

                                <div class="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingToId(null)}
                                    class="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950/60 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                    style={fontStyle}
                                  >
                                    {isVi() ? "Hủy" : "Cancel"}
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={submitting()}
                                    class="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900/90 text-xs font-medium text-neutral-200 hover:text-white hover:border-neutral-500 hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
                                    style={fontStyle}
                                  >
                                    <Show when={submitting()} fallback={isVi() ? "Gửi phản hồi" : "Submit Reply"}>
                                      {isVi() ? "Đang gửi..." : "Submitting..."}
                                    </Show>
                                  </button>
                                </div>
                              </form>
                            </Show>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </section>
  );
}
