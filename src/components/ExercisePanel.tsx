import { useEffect, useState, type ReactNode } from "react";
import { Eye, EyeOff, Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { EXERCISES, type ExId } from "@/lib/exercises";

export function ExercisePanel() {
  const [id, setId] = useState<ExId>("p2-1");
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const ex = EXERCISES.find((item) => item.id === id) ?? EXERCISES[0]!;
  const step = ex.steps[index]!;
  const last = ex.steps.length - 1;

  useEffect(() => {
    if (!auto) return;
    if (index >= last) {
      setAuto(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => Math.min(last, i + 1)), 1100);
    return () => window.clearTimeout(timer);
  }, [auto, index, last]);

  function select(next: ExId) {
    setAuto(false);
    setId(next);
    setIndex(0);
    setAnswerRevealed(false);
  }

  const shown = index >= last;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="演習問題">
        {EXERCISES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === id}
            onClick={() => select(item.id)}
            className={
              item.id === id
                ? "rounded-full bg-primary px-4 py-2 text-sm font-medium text-surface"
                : "rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-accent bg-accent-soft px-4 py-3 sm:px-5">
        <p className="text-sm">{ex.prompt}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-lg font-semibold text-accent">
          <span>
            正答{"\u3000"}
            {ex.answerLabel} =
          </span>
          <button
            type="button"
            onClick={() => setAnswerRevealed((v) => !v)}
            aria-pressed={answerRevealed}
            aria-label={answerRevealed ? "正答の数字を隠す" : "クリックして正答の数字を表示する"}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/35 bg-surface/80 px-2.5 py-0.5 text-accent transition-colors hover:bg-surface"
          >
            <span
              className={`font-mono transition-[filter] duration-200 ${
                answerRevealed ? "blur-0" : "select-none blur-[5px]"
              }`}
            >
              {ex.answer}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              {answerRevealed ? (
                <>
                  <EyeOff size={14} aria-hidden />
                  隠す
                </>
              ) : (
                <>
                  <Eye size={14} aria-hidden />
                  クリックで表示
                </>
              )}
            </span>
          </button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)] lg:items-start">
        <Chart group={ex.group} node={step.node} />
        <div className="flex min-w-0 flex-col gap-4">
          <div key={`${id}-${index}`} className="step-in rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{step.title}</h2>
              <span className="font-mono text-sm text-muted">
                {index + 1} / {ex.steps.length}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">{step.detail}</p>
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
                    {ex.columns.map((column) => (
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
                      <td colSpan={2 + ex.columns.length} className="px-3 py-6 text-center text-muted">
                        「次へ」で入力から追えます。
                      </td>
                    </tr>
                  ) : (
                    step.rows.map((row) => (
                      <tr key={row.n} className="border-t border-line">
                        <td className="px-3 py-2 font-mono text-muted">{row.n}</td>
                        {row.cells.map((cell, i) => (
                          <td key={ex.columns[i]} className={`px-3 py-2 font-mono ${row.fresh === i ? "bg-accent-soft font-semibold text-accent" : ""}`}>
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

          {shown ? (
            <p className="rounded-2xl border border-primary bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
              最後に出力される値は {ex.answerLabel} = {ex.answer}
            </p>
          ) : null}

          <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2">
            <button type="button" onClick={() => { setAuto(false); setIndex(0); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium">
              <RotateCcw size={16} aria-hidden />
              最初から
            </button>
            <button type="button" disabled={index === 0} onClick={() => { setAuto(false); setIndex((i) => Math.max(0, i - 1)); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium disabled:opacity-40">
              <SkipBack size={16} aria-hidden />
              戻る
            </button>
            <button type="button" disabled={index >= last} onClick={() => setIndex((i) => Math.min(last, i + 1))} className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-surface disabled:opacity-40">
              <SkipForward size={16} aria-hidden />
              次へ
            </button>
            <button type="button" onClick={() => { if (index >= last) setIndex(0); setAuto((v) => !v); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-medium">
              {auto ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              {auto ? "停止" : "自動"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chart({ group, node }: { group: string; node: string }) {
  const on = (id: string) => node === id;
  if (group === "(2)") return <Chart2 on={on} />;
  if (group === "(3)") return <Chart3 on={on} />;
  return <Chart4 on={on} />;
}

const INK = "var(--color-ink)";
const LINE = "var(--color-line)";
const SURFACE = "var(--color-surface)";
const ACCENT = "var(--color-accent)";
const SOFT = "var(--color-accent-soft)";
const MUTED = "var(--color-muted)";

function Chart2({ on }: { on: (id: string) => boolean }) {
  return (
    <Frame title="流れ図 (2)">
      <svg viewBox="0 0 360 560" className="h-auto w-full">
        <Markers />
        <V x={160} y1={48} y2={64} />
        <V x={160} y1={104} y2={124} />
        <V x={160} y1={164} y2={184} />
        <V x={160} y1={226} y2={258} />
        <V x={160} y1={330} y2={356} hot={on("add")} />
        <text x={168} y={348} fontSize="11" fontWeight={700} fill={on("add") ? ACCENT : MUTED}>YES</text>
        <path d="M232 294 H280 V414 H160" fill="none" stroke={on("if") ? ACCENT : LINE} strokeWidth="1.5" markerEnd="url(#an)" />
        <text x={236} y={286} fontSize="11" fontWeight={700} fill={MUTED}>NO</text>
        <V x={160} y1={396} y2={430} />
        <V x={160} y1={470} y2={500} />
        <Oval cx={160} cy={28} label="はじめ" active={on("start")} />
        <Para x={84} y={64} w={152} h={40} label="a を入力" active={on("a")} />
        <Para x={84} y={124} w={152} h={40} label="b を入力" active={on("b")} />
        <Box x={78} y={184} w={164} h={42} label="b + 1988 → c" active={on("c")} />
        <Diamond cx={160} cy={294} label="a = 1" active={on("if")} />
        <Box x={78} y={356} w={164} h={40} label="c + 30 → c" active={on("add")} />
        <Para x={84} y={430} w={152} h={40} label="c を表示" active={on("out")} />
        <Oval cx={160} cy={522} label="おわり" active={on("end")} />
      </svg>
    </Frame>
  );
}

function Chart3({ on }: { on: (id: string) => boolean }) {
  const inLoopBody = on("e") || on("sum") || on("inc");
  return (
    <Frame title="流れ図 (3)">
      <svg viewBox="0 0 320 730" className="h-auto w-full">
        <Markers />
        <V x={160} y1={48} y2={68} />
        <V x={160} y1={108} y2={128} />
        <V x={160} y1={168} y2={188} />
        <V x={160} y1={228} y2={248} />
        <V x={160} y1={288} y2={308} />
        <V x={160} y1={356} y2={376} hot={inLoopBody} />
        <V x={160} y1={416} y2={436} hot={on("sum") || on("inc")} />
        <V x={160} y1={476} y2={496} hot={on("inc")} />
        <V x={160} y1={536} y2={556} hot={on("inc")} />
        <V x={160} y1={598} y2={618} hot={on("out") || on("end")} />
        <V x={160} y1={658} y2={678} hot={on("end")} />
        <Oval cx={160} cy={28} label="はじめ" active={on("start")} />
        <Para x={84} y={68} w={152} h={40} label="a を入力" active={on("a")} />
        <Para x={84} y={128} w={152} h={40} label="b を入力" active={on("b")} />
        <Box x={70} y={188} w={180} h={40} label="1 → c" active={on("c")} />
        <Box x={70} y={248} w={180} h={40} label="0 → d" active={on("d")} />
        <LoopStart x={66} y={308} w={188} h={48} condition="c ≠ b + 1 の間" active={on("loop")} />
        <Box x={70} y={376} w={180} h={40} label="c × 2 − a → e" active={on("e")} />
        <Box x={70} y={436} w={180} h={40} label="d + e → d" active={on("sum")} />
        <Box x={70} y={496} w={180} h={40} label="c + 1 → c" active={on("inc")} />
        <LoopEnd x={66} y={556} w={188} h={42} active={on("inc")} />
        <Para x={84} y={618} w={152} h={40} label="d を表示" active={on("out")} />
        <Oval cx={160} cy={698} label="おわり" active={on("end")} />
      </svg>
    </Frame>
  );
}

function Chart4({ on }: { on: (id: string) => boolean }) {
  const inLoopBody = on("d") || on("sum") || on("inc");
  return (
    <Frame title="流れ図 (4)">
      <svg viewBox="0 0 320 670" className="h-auto w-full">
        <Markers />
        <V x={160} y1={48} y2={68} />
        <V x={160} y1={108} y2={128} />
        <V x={160} y1={168} y2={188} />
        <V x={160} y1={228} y2={248} />
        <V x={160} y1={296} y2={316} hot={inLoopBody} />
        <V x={160} y1={356} y2={376} hot={on("sum") || on("inc")} />
        <V x={160} y1={416} y2={436} hot={on("inc")} />
        <V x={160} y1={476} y2={496} hot={on("inc")} />
        <V x={160} y1={538} y2={558} hot={on("out") || on("end")} />
        <V x={160} y1={598} y2={618} hot={on("end")} />
        <Oval cx={160} cy={28} label="はじめ" active={on("start")} />
        <Para x={84} y={68} w={152} h={40} label="a を入力" active={on("a")} />
        <Box x={70} y={128} w={180} h={40} label="0 → s" active={on("s")} />
        <Box x={70} y={188} w={180} h={40} label="1 → n" active={on("n")} />
        <LoopStart x={66} y={248} w={188} h={48} condition="n ≠ 10 の間" active={on("loop")} />
        <Box x={70} y={316} w={180} h={40} label="a × n → d" active={on("d")} />
        <Box x={70} y={376} w={180} h={40} label="s + d → s" active={on("sum")} />
        <Box x={70} y={436} w={180} h={40} label="n + 1 → n" active={on("inc")} />
        <LoopEnd x={66} y={496} w={188} h={42} active={on("inc")} />
        <Para x={84} y={558} w={152} h={40} label="s を表示" active={on("out")} />
        <Oval cx={160} cy={638} label="おわり" active={on("end")} />
      </svg>
    </Frame>
  );
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-3 sm:p-4">
      <h2 className="mb-2 px-1 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Markers() {
  return (
    <defs>
      <marker id="an" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 1.2 L 9 5 L 0 8.8 Z" fill={INK} />
      </marker>
    </defs>
  );
}

function V({ x, y1, y2, hot }: { x: number; y1: number; y2: number; hot?: boolean }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={hot ? ACCENT : LINE} strokeWidth={hot ? 2.4 : 1.5} markerEnd="url(#an)" />;
}

function Oval({ cx, cy, label, active }: { cx: number; cy: number; label: string; active: boolean }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={52} ry={20} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>{label}</text>
    </g>
  );
}

function Box({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>{label}</text>
    </g>
  );
}

function Para({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  const s = 16;
  const d = `M ${x + s} ${y} H ${x + w} L ${x + w - s} ${y + h} H ${x} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>{label}</text>
    </g>
  );
}

function LoopStart({ x, y, w, h, condition, active }: { x: number; y: number; w: number; h: number; condition: string; active: boolean }) {
  const c = 14;
  const d = `M ${x + c} ${y} H ${x + w - c} L ${x + w} ${y + c} V ${y + h} H ${x} V ${y + c} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize="12" fontWeight={600} fill={INK}>ループ</text>
      <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>{condition}</text>
    </g>
  );
}

function LoopEnd({ x, y, w, h, active }: { x: number; y: number; w: number; h: number; active: boolean }) {
  const c = 14;
  const d = `M ${x} ${y} H ${x + w} V ${y + h - c} L ${x + w - c} ${y + h} H ${x + c} L ${x} ${y + h - c} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>ループ</text>
    </g>
  );
}

function Diamond({ cx, cy, label, active }: { cx: number; cy: number; label: string; active: boolean }) {
  const points = `${cx},${cy - 36} ${cx + 72},${cy} ${cx},${cy + 36} ${cx - 72},${cy}`;
  return (
    <g>
      <polygon points={points} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>{label}</text>
    </g>
  );
}

