import { createSignal, createMemo, For, Show } from "solid-js";

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, string>;
  status: "running" | "completed";
  output?: string;
}

interface ActionApproval {
  id: string;
  title: string;
  description: string;
  details: string;
  status: "pending" | "approved" | "rejected";
}

interface Feedback {
  rating?: "up" | "down";
  comment?: string;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  timestamp: string;
  text: string;
  thinking?: string;
  toolCalls?: ToolCall[];
  actionApproval?: ActionApproval;
  feedback?: Feedback;
}

interface Task {
  id: string;
  title: string;
  status: "in_progress" | "needs_approval" | "completed" | "revised";
  createdAt: string;
  messages: Message[];
}

const PRESET_TASKS = [
  {
    title: "Audit JWT auth middleware",
    prompt: "Audit JWT auth middleware in src/middleware/auth.ts for security flaws and missing claim validations.",
  },
  {
    title: "Optimize SQL query",
    prompt: "Analyze and optimize slow order query in src/db/orders.ts causing high DB load.",
  },
  {
    title: "Draft API spec",
    prompt: "Generate OpenAPI 3.0 specification for /v1/checkout endpoint including validation rules.",
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Audit JWT auth middleware",
    status: "needs_approval",
    createdAt: "10:14 AM",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        timestamp: "10:14 AM",
        text: "Audit JWT auth middleware in src/middleware/auth.ts for security flaws and missing claim validations.",
      },
      {
        id: "msg-2",
        sender: "agent",
        timestamp: "10:14 AM",
        thinking:
          "Inspecting src/middleware/auth.ts for algorithm specification enforcement, token expiration checks, and payload validation...",
        toolCalls: [
          {
            id: "tool-1",
            name: "grep_search",
            args: { Query: "jwt.verify", SearchPath: "src/middleware/auth.ts" },
            status: "completed",
            output: "Found 1 match at line 24: jwt.verify(token, process.env.JWT_SECRET)",
          },
          {
            id: "tool-2",
            name: "view_file",
            args: { AbsolutePath: "src/middleware/auth.ts" },
            status: "completed",
            output: "Read 48 lines. Identified missing algorithms restriction ['HS256'].",
          },
        ],
        text: "Security audit complete. I identified 2 security vulnerabilities:\n1. `jwt.verify` does not specify `algorithms: ['HS256']`, exposing the service to algorithm confusion attacks.\n2. Expiration errors are caught generically without logging security events.",
        actionApproval: {
          id: "act-1",
          title: "Apply Security Patch to auth.ts",
          description: "Enforce explicit algorithm restriction and introduce structured error handling.",
          details: `--- src/middleware/auth.ts\n+++ src/middleware/auth.ts\n@@ -24,3 +24,3 @@\n-  const payload = jwt.verify(token, SECRET);\n+  const payload = jwt.verify(token, SECRET, { algorithms: ['HS256'] });`,
          status: "pending",
        },
      },
    ],
  },
];

export default function TaskAgentPlayground() {
  const [tasks, setTasks] = createSignal<Task[]>(INITIAL_TASKS);
  const [activeTaskId, setActiveTaskId] = createSignal<string>("task-1");
  const [inputPrompt, setInputPrompt] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);

  // Active feedback input per message
  const [activeFeedbackId, setActiveFeedbackId] = createSignal<string | null>(null);
  const [feedbackText, setFeedbackText] = createSignal("");

  const activeTask = createMemo(() => tasks().find((t) => t.id === activeTaskId()) || tasks()[0]);

  const handleSelectTask = (id: string) => {
    setActiveTaskId(id);
  };

  const handleNewTask = () => {
    const newId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      title: "New Task",
      status: "in_progress",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "agent",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: "Hello! Type a task or pick a preset below to begin.",
        },
      ],
    };
    setTasks([newTask, ...tasks()]);
    setActiveTaskId(newId);
  };

  const submitTask = (promptText: string) => {
    if (!promptText.trim() || isProcessing()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      timestamp,
      text: promptText,
    };

    setTasks(
      tasks().map((t) => {
        if (t.id === activeTaskId()) {
          return {
            ...t,
            title: t.messages.length <= 1 ? promptText.slice(0, 32) + (promptText.length > 32 ? "..." : "") : t.title,
            status: "in_progress",
            messages: [...t.messages, userMsg],
          };
        }
        return t;
      })
    );

    setInputPrompt("");
    setIsProcessing(true);

    setTimeout(() => {
      const isSql = promptText.toLowerCase().includes("sql") || promptText.toLowerCase().includes("query");

      const mockToolCalls: ToolCall[] = isSql
        ? [
            {
              id: "t-1",
              name: "explain_query",
              args: { Table: "orders", Filter: "status = 'paid'" },
              status: "completed",
              output: "EXPLAIN: Seq Scan on orders (cost=0.00..18452.00 rows=34120 width=88)",
            },
          ]
        : [
            {
              id: "t-1",
              name: "grep_search",
              args: { Query: "function", SearchPath: "src/" },
              status: "completed",
              output: "Analyzed codebase context (4 target files inspected).",
            },
          ];

      const agentMsg: Message = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        thinking: isSql
          ? "Checking execution plan for unindexed column filters and join predicates..."
          : "Analyzing task requirements, scanning repository files, and formulating proposed execution steps...",
        toolCalls: mockToolCalls,
        text: isSql
          ? "Query analysis complete. Execution scan indicates missing composite index on `(status, created_at)` causing sequential scans on 34k+ rows."
          : `Processed request: "${promptText}". Dependencies analyzed and recommended changes ready.`,
        actionApproval: isSql
          ? {
              id: `act-${Date.now()}`,
              title: "Create DB Index Migration",
              description: "Add concurrent composite index to optimize lookup speed from 280ms to 4ms.",
              details: "CREATE INDEX CONCURRENTLY idx_orders_status_created ON orders (status, created_at DESC);",
              status: "pending",
            }
          : undefined,
      };

      setTasks(
        tasks().map((t) => {
          if (t.id === activeTaskId()) {
            return {
              ...t,
              status: agentMsg.actionApproval ? "needs_approval" : "completed",
              messages: [...t.messages, agentMsg],
            };
          }
          return t;
        })
      );
      setIsProcessing(false);
    }, 1000);
  };

  const handleActionDecision = (msgId: string, approved: boolean) => {
    setTasks(
      tasks().map((t) => {
        if (t.id === activeTaskId()) {
          const updatedMsgs = t.messages.map((m) => {
            if (m.id === msgId && m.actionApproval) {
              return {
                ...m,
                actionApproval: {
                  ...m.actionApproval,
                  status: approved ? ("approved" as const) : ("rejected" as const),
                },
              };
            }
            return m;
          });

          const followUpMsg: Message = {
            id: `msg-follow-${Date.now()}`,
            sender: "agent",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: approved
              ? "Action approved! Applied changes successfully. Automated verification passed."
              : "Action rejected. Task paused awaiting your next instruction.",
          };

          return {
            ...t,
            status: approved ? ("completed" as const) : ("revised" as const),
            messages: [...updatedMsgs, followUpMsg],
          };
        }
        return t;
      })
    );
  };

  const handleRating = (msgId: string, rating: "up" | "down") => {
    setTasks(
      tasks().map((t) => {
        if (t.id === activeTaskId()) {
          const updatedMsgs = t.messages.map((m) => {
            if (m.id === msgId) {
              const currentRating = m.feedback?.rating === rating ? undefined : rating;
              return {
                ...m,
                feedback: { ...m.feedback, rating: currentRating },
              };
            }
            return m;
          });
          return { ...t, messages: updatedMsgs };
        }
        return t;
      })
    );
  };

  const submitFeedbackComment = (msgId: string) => {
    const comment = feedbackText().trim();
    if (!comment) return;

    setTasks(
      tasks().map((t) => {
        if (t.id === activeTaskId()) {
          const updatedMsgs = t.messages.map((m) => {
            if (m.id === msgId) {
              return {
                ...m,
                feedback: { ...m.feedback, comment },
              };
            }
            return m;
          });

          const feedbackAck: Message = {
            id: `msg-ack-${Date.now()}`,
            sender: "agent",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: `Feedback noted: "${comment}". Applying this guidance to task context.`,
          };

          return {
            ...t,
            status: "revised",
            messages: [...updatedMsgs, feedbackAck],
          };
        }
        return t;
      })
    );

    setActiveFeedbackId(null);
    setFeedbackText("");
  };

  return (
    <div class="w-full max-w-5xl mx-auto flex flex-col gap-5 text-darkslate-100 p-2 md:p-4 font-sans">
      {/* Top Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-darkslate-500">
        <div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Task Agent</h1>
          <p class="text-xs text-darkslate-200 mt-1">
            AI chat assistant for task assignment, action approval, and feedback workflows.
          </p>
        </div>

        <button
          onClick={handleNewTask}
          type="button"
          class="px-3.5 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition self-start sm:self-auto"
        >
          + New Task
        </button>
      </div>

      {/* Main Layout Grid */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
        {/* Left Sidebar: Task List */}
        <div class="md:col-span-1 bg-darkslate-800 border border-darkslate-500 rounded-xl p-3 flex flex-col gap-3">
          <div class="flex items-center justify-between px-1">
            <span class="text-xs font-semibold text-darkslate-200 tracking-wider">ACTIVE TASKS</span>
            <span class="text-xs text-darkslate-300 font-mono bg-darkslate-700 px-2 py-0.5 rounded">
              {tasks().length}
            </span>
          </div>

          <div class="flex flex-col gap-2 max-h-[160px] md:max-h-[440px] overflow-y-auto pr-1">
            <For each={tasks()}>
              {(task) => (
                <button
                  onClick={() => handleSelectTask(task.id)}
                  class={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                    task.id === activeTaskId()
                      ? "bg-darkslate-700/90 border-primary-500 text-white"
                      : "bg-darkslate-800/60 border-darkslate-600/70 text-darkslate-200 hover:bg-darkslate-700/50"
                  }`}
                >
                  <span class="text-xs font-medium text-white truncate">{task.title}</span>
                  <div class="flex items-center justify-between text-[11px] text-darkslate-300">
                    <span>{task.createdAt}</span>
                    <Show when={task.status === "needs_approval"}>
                      <span class="text-amber-300 font-medium">Pending Action</span>
                    </Show>
                    <Show when={task.status === "in_progress"}>
                      <span class="text-primary-300 font-medium">In Progress</span>
                    </Show>
                    <Show when={task.status === "completed"}>
                      <span class="text-emerald-300 font-medium">Completed</span>
                    </Show>
                    <Show when={task.status === "revised"}>
                      <span class="text-sky-300 font-medium">Revised</span>
                    </Show>
                  </div>
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Right Main Chat Container */}
        <div class="md:col-span-3 bg-darkslate-800 border border-darkslate-500 rounded-xl p-4 md:p-5 flex flex-col min-h-[560px] justify-between">
          {/* Scrollable Messages Area */}
          <div class="flex flex-col gap-4 overflow-y-auto max-h-[460px] pr-2 mb-4">
            <For each={activeTask()?.messages || []}>
              {(msg) => (
                <div
                  class={`flex flex-col gap-2.5 p-4 rounded-xl border ${
                    msg.sender === "user"
                      ? "bg-darkslate-700/70 border-darkslate-500 text-white self-end max-w-[85%]"
                      : "bg-darkslate-900/80 border-darkslate-600/80 text-darkslate-100 self-start w-full"
                  }`}
                >
                  {/* Header */}
                  <div class="flex items-center justify-between text-xs text-darkslate-300 border-b border-darkslate-700/60 pb-2">
                    <span class="font-medium text-white">
                      {msg.sender === "user" ? "You" : "Task Agent"}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Thinking Block */}
                  <Show when={msg.thinking}>
                    <div class="bg-darkslate-950/70 border border-darkslate-700 rounded-lg p-3 text-xs text-darkslate-200 font-mono leading-relaxed">
                      <div class="text-[11px] text-primary-400 font-sans font-medium mb-1">
                        Agent Thinking Process
                      </div>
                      {msg.thinking}
                    </div>
                  </Show>

                  {/* Tool Call Log */}
                  <Show when={msg.toolCalls && msg.toolCalls.length > 0}>
                    <div class="flex flex-col gap-2">
                      <For each={msg.toolCalls}>
                        {(tool) => (
                          <div class="bg-darkslate-950 border border-darkslate-700 rounded-lg p-3 text-xs font-mono">
                            <div class="flex items-center justify-between text-xs text-darkslate-200">
                              <span class="text-primary-400 font-semibold">tool::{tool.name}</span>
                              <span class="text-[11px] text-emerald-400 font-sans">{tool.status}</span>
                            </div>
                            <div class="text-darkslate-300 text-[11px] mt-1 break-all">
                              args: {JSON.stringify(tool.args)}
                            </div>
                            <Show when={tool.output}>
                              <div class="text-darkslate-200 text-[11px] mt-1.5 pt-1.5 border-t border-darkslate-800">
                                output: {tool.output}
                              </div>
                            </Show>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>

                  {/* Message Content */}
                  <div class="text-xs leading-relaxed text-white whitespace-pre-wrap">{msg.text}</div>

                  {/* Action Approval Card */}
                  <Show when={msg.actionApproval}>
                    <div class="bg-darkslate-950 border border-darkslate-600 rounded-xl p-4 flex flex-col gap-2.5 my-1">
                      <div class="flex items-center justify-between text-xs">
                        <span class="font-semibold text-white">{msg.actionApproval!.title}</span>
                        <span
                          class={`text-[11px] px-2.5 py-0.5 rounded font-medium ${
                            msg.actionApproval!.status === "pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : msg.actionApproval!.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          }`}
                        >
                          {msg.actionApproval!.status === "pending"
                            ? "Action Approval Required"
                            : msg.actionApproval!.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      </div>

                      <p class="text-xs text-darkslate-200">{msg.actionApproval!.description}</p>

                      <pre class="bg-darkslate-900 border border-darkslate-700 p-3 rounded-lg text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                        {msg.actionApproval!.details}
                      </pre>

                      <Show when={msg.actionApproval!.status === "pending"}>
                        <div class="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleActionDecision(msg.id, true)}
                            class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                          >
                            Approve & Execute
                          </button>
                          <button
                            onClick={() => handleActionDecision(msg.id, false)}
                            class="px-3.5 py-1.5 rounded-lg border border-darkslate-500 hover:bg-darkslate-800 text-darkslate-200 hover:text-rose-300 text-xs font-medium transition"
                          >
                            Reject
                          </button>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  {/* Clean Agent Feedback Actions */}
                  <Show when={msg.sender === "agent"}>
                    <div class="mt-1 pt-2 border-t border-darkslate-800 flex flex-col gap-2">
                      <div class="flex items-center justify-between text-xs text-darkslate-300">
                        <span class="text-[11px]">Was this response helpful?</span>
                        <div class="flex items-center gap-2">
                          <button
                            onClick={() => handleRating(msg.id, "up")}
                            class={`px-2.5 py-1 rounded-md text-xs border transition ${
                              msg.feedback?.rating === "up"
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium"
                                : "border-darkslate-600 text-darkslate-300 hover:text-white hover:border-darkslate-400"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleRating(msg.id, "down")}
                            class={`px-2.5 py-1 rounded-md text-xs border transition ${
                              msg.feedback?.rating === "down"
                                ? "bg-rose-500/20 border-rose-500 text-rose-300 font-medium"
                                : "border-darkslate-600 text-darkslate-300 hover:text-white hover:border-darkslate-400"
                            }`}
                          >
                            No
                          </button>
                          <button
                            onClick={() =>
                              setActiveFeedbackId(activeFeedbackId() === msg.id ? null : msg.id)
                            }
                            class="px-2.5 py-1 rounded-md border border-darkslate-600 text-darkslate-300 hover:text-white hover:border-darkslate-400 transition"
                          >
                            Feedback
                          </button>
                        </div>
                      </div>

                      <Show when={activeFeedbackId() === msg.id}>
                        <div class="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={feedbackText()}
                            onInput={(e) => setFeedbackText(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === "Enter" && submitFeedbackComment(msg.id)}
                            placeholder="Type feedback or revision request..."
                            class="flex-1 bg-darkslate-950 border border-darkslate-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-darkslate-400 focus:outline-none focus:border-primary-500"
                          />
                          <button
                            onClick={() => submitFeedbackComment(msg.id)}
                            class="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition"
                          >
                            Send
                          </button>
                        </div>
                      </Show>

                      <Show when={msg.feedback?.comment}>
                        <div class="text-xs text-primary-300 bg-primary-950/40 border border-primary-500/30 rounded-lg p-2">
                          Feedback recorded: "{msg.feedback!.comment}"
                        </div>
                      </Show>
                    </div>
                  </Show>
                </div>
              )}
            </For>

            <Show when={isProcessing()}>
              <div class="bg-darkslate-900/80 border border-darkslate-600 rounded-xl p-3.5 text-xs text-darkslate-200 font-mono animate-pulse self-start">
                Task Agent is processing request...
              </div>
            </Show>
          </div>

          {/* Presets & Input Form */}
          <div class="flex flex-col gap-3 pt-3 border-t border-darkslate-700">
            {/* Presets */}
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <span class="text-xs text-darkslate-300 font-medium whitespace-nowrap">Presets:</span>
              <For each={PRESET_TASKS}>
                {(preset) => (
                  <button
                    onClick={() => submitTask(preset.prompt)}
                    disabled={isProcessing()}
                    class="text-xs px-3 py-1 rounded-lg bg-darkslate-700/80 hover:bg-darkslate-600 border border-darkslate-500 text-darkslate-100 whitespace-nowrap transition disabled:opacity-50 font-medium"
                  >
                    {preset.title}
                  </button>
                )}
              </For>
            </div>

            {/* Input Bar */}
            <div class="flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt()}
                onInput={(e) => setInputPrompt(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && submitTask(inputPrompt())}
                placeholder="Assign a task to AI agent (e.g. Audit auth middleware...)"
                class="flex-1 bg-darkslate-900 border border-darkslate-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-darkslate-400 focus:outline-none focus:border-primary-500 transition"
              />
              <button
                onClick={() => submitTask(inputPrompt())}
                disabled={!inputPrompt().trim() || isProcessing()}
                class="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white font-medium text-xs transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
