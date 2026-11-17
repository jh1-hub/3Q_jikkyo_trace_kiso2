import { useEffect, useState } from "react";
import { AlertTriangle, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { ALGOS, EXAMPLE, type AlgoId } from "@/lib/trace";
import { Flowchart } from "@/components/Flowchart";
import { ExercisePanel } from "@/components/ExercisePanel";

const ORDER: AlgoId[] = ["max", "min", "sum", "count", "avg"];

export function TraceApp() {
  const [mode, setMode] = useState<"learn" | "exam">("learn");
  const [showExamConfirm, setShowExamConfirm] = useState(false);
  const [id, setId] = useState<AlgoId>("max");
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const algo = ALGOS[id];
  const step = algo.steps[index]!;
  const last = algo.steps.length - 1;

  useEffect(() => {
    if (!auto) return;
    if (index >= last) {
      setAuto(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => Math.min(last, i + 1)), 1300);
    return () => window.clearTimeout(timer);
  }, [auto, index, last]);

  useEffect(() => {
    if (!showExamConfirm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowExamConfirm(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showExamConfirm]);

  function select(next: AlgoId) {
    setAuto(false);
    setId(next);
    setIndex(0);
  }

  function handleExamTabClick() {
    if (mode === "exam") return;
    setAuto(false);
    setShowExamConfirm(true);
  }

  function confirmExamMode() {
    setShowExamConfirm(false);
    setMode("exam");
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">基本的なアルゴリズム</p>
              <h1 className="text-2xl font-semibold tracking-tight">トレースして動きを見る</h1>
            </div>
            {mode === "learn" ? (
              <p className="text-sm text-muted">
                入力データ <span className="font-mono text-ink">{EXAMPLE}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="画面">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "learn"}
              onClick={() => setMode("learn")}
              className={mode === "learn" ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface" : "rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium"}
            >
              基本のアルゴリズム
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "exam"}
              onClick={handleExamTabClick}
              className={mode === "exam" ? "rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface" : "rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium"}
            >
              演習問題解答・解説
            </button>
          </div>
          {mode === "learn" ? (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="アルゴリズム">
            {ORDER.map((key) => {
              const on = key === id;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => select(key)}
                  className={
                    on
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-surface"
                      : "rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-ink"
                  }
                >
                  {ALGOS[key].name}
                </button>
              );
            })}
          </div>
          ) : null}
        </div>
      </header>

      {mode === "exam" ? <ExercisePanel /> : (
      <main className="mx-auto grid max-w-6xl gap-4 overflow-x-hidden px-4 py-4 sm:px-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:items-start">
        <section className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
            <h2 className="text-sm font-semibold">フローチャート</h2>
            <span className="text-xs text-muted">色のついた箱が今の処理</span>
          </div>
          <Flowchart algo={algo} node={step.node} lit={step.lit} />
        </section>

        <section className="flex flex-col gap-4">
          <div key={`${id}-${index}`} className="step-in rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <span className="font-mono text-sm text-muted">
                {index + 1} / {algo.steps.length}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink sm:text-base">{step.detail}</p>
            <dl className={`mt-4 grid gap-2 ${step.meters.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>
              {step.meters.map((meter) => (
                <Value key={meter.label} label={meter.label} value={meter.value} hot={meter.hot} />
              ))}
            </dl>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold">トレース表</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">手順</th>
                    <th className="px-3 py-2 font-medium">データ</th>
                    {algo.columns.map((column) => (
                      <th key={column} className="px-3 py-2 font-medium">
                        {column}
                      </th>
                    ))}
                    <th className="px-3 py-2 font-medium">何をしたか</th>
                  </tr>
                </thead>
                <tbody>
                  {step.rows.length === 0 ? (
                    <tr>
                      <td colSpan={2 + algo.columns.length} className="px-3 py-6 text-center text-muted">
                        まだ変数は変わっていません。「次へ」で初期化から始まります。
                      </td>
                    </tr>
                  ) : (
                    step.rows.map((row) => (
                      <tr key={row.n} className="border-t border-line">
                        <td className="px-3 py-2 font-mono text-muted">{row.n}</td>
                        <td className={`px-3 py-2 font-mono ${row.fresh === "data" ? "bg-accent-soft font-semibold text-accent" : ""}`}>
                          {row.data}
                        </td>
                        {row.cells.map((cell, i) => (
                          <td key={algo.columns[i]} className={`px-3 py-2 font-mono ${row.fresh === i ? "bg-accent-soft font-semibold text-accent" : ""}`}>
                            {cell}
                          </td>
                        ))}
                        <td className="px-3 py-2">{row.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-primary-soft px-4 py-3">
            <h2 className="text-sm font-semibold text-primary">このアルゴリズムの特徴</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              {algo.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setAuto(false);
                setIndex(0);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium"
            >
              <RotateCcw size={16} aria-hidden />
              最初から
            </button>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => {
                setAuto(false);
                setIndex((i) => Math.max(0, i - 1));
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium disabled:opacity-40"
            >
              <SkipBack size={16} aria-hidden />
              戻る
            </button>
            <button
              type="button"
              disabled={index >= last}
              onClick={() => setIndex((i) => Math.min(last, i + 1))}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-surface disabled:opacity-40"
            >
              <SkipForward size={16} aria-hidden />
              次へ
            </button>
            <button
              type="button"
              onClick={() => {
                if (index >= last) setIndex(0);
                setAuto((v) => !v);
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium"
              aria-pressed={auto}
            >
              {auto ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              {auto ? "停止" : "自動"}
            </button>
          </div>
        </section>
      </main>
      )}

      {showExamConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-[2px]"
          onClick={() => setShowExamConfirm(false)}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exam-confirm-title"
            aria-describedby="exam-confirm-desc"
            className="step-in w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-lg sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <AlertTriangle size={20} aria-hidden />
              </div>
              <div>
                <h2 id="exam-confirm-title" className="text-lg font-semibold text-ink">
                  演習問題は解きましたか？
                </h2>
                <p id="exam-confirm-desc" className="mt-2 text-sm leading-relaxed text-muted">
                  この先には演習問題の解答と解説が表示されます。まだ自分の力で解いていない場合は、一度キャンセルして先に問題に取り組んでから確認しましょう。
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowExamConfirm(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-bg px-4 text-sm font-medium text-ink transition-colors hover:bg-line/40"
              >
                まだ解いていない（キャンセル）
              </button>
              <button
                type="button"
                onClick={confirmExamMode}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                解いたので解答・解説を見る
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Value({ label, value, hot }: { label: string; value: string; hot: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${hot ? "border-accent bg-accent-soft" : "border-line bg-bg"}`}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`font-mono text-xl font-semibold ${hot ? "text-accent" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
