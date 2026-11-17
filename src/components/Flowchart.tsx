import type { Algo, NodeId } from "@/lib/trace";

type Props = {
  algo: Algo;
  node: NodeId;
  lit: string[];
};

const INK = "var(--color-ink)";
const LINE = "var(--color-line)";
const SURFACE = "var(--color-surface)";
const ACCENT = "var(--color-accent)";
const SOFT = "var(--color-accent-soft)";
const MUTED = "var(--color-muted)";

function hot(lit: string[], ids: string[]) {
  return ids.some((id) => lit.includes(id));
}

export function Flowchart({ algo, node, lit }: Props) {
  const cmp = algo.id === "max" || algo.id === "min";
  const avg = algo.id === "avg";
  const on = (id: NodeId) => node === id;
  const firstInput = on("input") && hot(lit, ["e-init"]);
  const laterInput = on("input") && hot(lit, ["e-back"]);

  const y = cmp
    ? { init: 62, init2: 0, in1: 124, loopT: 184, dia: 290, assign: 356, bump: 0, in2: 436, loopB: 496, after: 558, show: 558, end: 638 }
    : avg
      ? { init: 62, init2: 122, in1: 184, loopT: 244, dia: 0, assign: 314, bump: 374, in2: 434, loopB: 494, after: 556, show: 616, end: 696 }
      : { init: 62, init2: 0, in1: 124, loopT: 184, dia: 0, assign: 254, bump: 0, in2: 314, loopB: 374, after: 436, show: 436, end: 516 };

  const height = y.end + 34;

  return (
    <svg viewBox={`0 0 380 ${height}`} className="h-auto w-full" role="img" aria-label={`${algo.name}のフローチャート`}>
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.2 L 9 5 L 0 8.8 Z" fill={ACCENT} />
        </marker>
        <marker id="an" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.2 L 9 5 L 0 8.8 Z" fill={INK} />
        </marker>
      </defs>

      <Edge d={`M190 48 V${y.init}`} hot={hot(lit, ["e-start"])} />
      {avg ? (
        <>
          <Edge d={`M190 ${y.init + 42} V${y.init2}`} hot={hot(lit, ["e-init2"])} />
          <Edge d={`M190 ${y.init2 + 42} V${y.in1}`} hot={hot(lit, ["e-init"])} />
        </>
      ) : (
        <Edge d={`M190 ${y.init + 42} V${y.in1}`} hot={hot(lit, ["e-init"])} />
      )}
      <Edge d={`M190 ${y.in1 + 40} V${y.loopT}`} hot={hot(lit, ["e-input"])} />
      <Edge
        d={`M190 ${y.loopT + 48} V${cmp ? y.dia - 36 : y.assign}`}
        hot={hot(lit, ["e-loop-yes", "e-to-compare", "e-to-assign"])}
      />

      {cmp ? (
        <>
          <Edge d={`M190 ${y.dia + 36} V${y.assign}`} hot={hot(lit, ["e-compare-yes", "e-assign"])} />
          <text x={198} y={y.dia + 54} fontSize="11" fontWeight={700} fill={hot(lit, ["e-compare-yes"]) ? ACCENT : MUTED}>
            YES
          </text>
          <Edge d={`M270 ${y.dia} H328 V${y.in2 - 16} H190`} hot={hot(lit, ["e-compare-no"])} />
          <text x={276} y={y.dia - 6} fontSize="11" fontWeight={700} fill={hot(lit, ["e-compare-no"]) ? ACCENT : MUTED}>
            NO
          </text>
          <Edge d={`M190 ${y.assign + 40} V${y.in2}`} hot={hot(lit, ["e-assign"])} />
        </>
      ) : (
        !avg && <Edge d={`M190 ${y.assign + 40} V${y.in2}`} hot={laterInput} />
      )}

      {avg ? (
        <>
          <Edge d={`M190 ${y.assign + 40} V${y.bump}`} hot={hot(lit, ["e-bump"])} />
          <Edge d={`M190 ${y.bump + 40} V${y.in2}`} hot={laterInput || on("bump")} />
        </>
      ) : null}

      <Edge d={`M190 ${y.in2 + 40} V${y.loopB}`} hot={laterInput || hot(lit, ["e-back"])} />
      <Edge d={`M190 ${y.loopB + 42} V${y.after}`} hot={hot(lit, ["e-loop-no", "e-divide", "e-display", "e-end"])} />
      {avg ? <Edge d={`M190 ${y.after + 40} V${y.show}`} hot={hot(lit, ["e-display", "e-end"])} /> : null}
      <Edge d={`M190 ${(avg ? y.show : y.after) + 40} V${y.end - 20}`} hot={hot(lit, ["e-end"])} />

      <Oval cx={190} cy={28} label="はじめ" active={on("start")} />
      <Prep x={96} y={y.init} w={188} h={42} label={algo.initText} active={on("init")} />
      {avg && algo.init2Text ? <Prep x={96} y={y.init2} w={188} h={42} label={algo.init2Text} active={on("init2")} /> : null}
      <Para x={102} y={y.in1} w={176} h={40} label="データを入力" active={firstInput} />
      <LoopStart x={86} y={y.loopT} w={208} h={48} condition="データ ≠ 999 の間" active={on("loop")} />

      {cmp ? (
        <>
          <Diamond cx={190} cy={y.dia} label={algo.compareText} active={on("compare")} />
          <Box x={110} y={y.assign} w={160} h={40} label={algo.assignText} active={on("assign")} />
        </>
      ) : (
        <Box x={96} y={y.assign} w={188} h={40} label={algo.assignText} active={on("assign")} />
      )}
      {avg && algo.bumpText ? <Box x={96} y={y.bump} w={188} h={40} label={algo.bumpText} active={on("bump")} /> : null}

      <Para x={102} y={y.in2} w={176} h={40} label="データを入力" active={laterInput} />
      <LoopEnd x={86} y={y.loopB} w={208} h={42} active={laterInput} />

      {avg && algo.divideText ? <Box x={96} y={y.after} w={188} h={40} label={algo.divideText} active={on("divide")} /> : null}
      <Box x={110} y={avg ? y.show : y.after} w={160} h={40} label={algo.displayText} active={on("display")} />
      <Oval cx={190} cy={y.end} label="おわり" active={on("end")} />
    </svg>
  );
}

function Edge({ d, hot }: { d: string; hot: boolean }) {
  return (
    <path d={d} fill="none" stroke={hot ? ACCENT : LINE} strokeWidth={hot ? 2.4 : 1.5} markerEnd={hot ? "url(#ah)" : "url(#an)"} />
  );
}

function Oval({ cx, cy, label, active }: { cx: number; cy: number; label: string; active: boolean }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={54} ry={20} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  );
}

function Box({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  );
}

function Prep({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  const c = 18;
  const d = `M ${x + c} ${y} H ${x + w - c} L ${x + w} ${y + h / 2} L ${x + w - c} ${y + h} H ${x + c} L ${x} ${y + h / 2} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  );
}

function LoopStart({ x, y, w, h, condition, active }: { x: number; y: number; w: number; h: number; condition: string; active: boolean }) {
  const c = 14;
  const d = `M ${x + c} ${y} H ${x + w - c} L ${x + w} ${y + c} V ${y + h} H ${x} V ${y + c} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + 19} textAnchor="middle" fontSize="12" fontWeight={600} fill={INK}>
        ループ
      </text>
      <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>
        {condition}
      </text>
    </g>
  );
}

function LoopEnd({ x, y, w, h, active }: { x: number; y: number; w: number; h: number; active: boolean }) {
  const c = 14;
  const d = `M ${x} ${y} H ${x + w} V ${y + h - c} L ${x + w - c} ${y + h} H ${x + c} L ${x} ${y + h - c} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>
        ループ
      </text>
    </g>
  );
}

function Para({ x, y, w, h, label, active }: { x: number; y: number; w: number; h: number; label: string; active: boolean }) {
  const s = 16;
  const d = `M ${x + s} ${y} H ${x + w} L ${x + w - s} ${y + h} H ${x} Z`;
  return (
    <g>
      <path d={d} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="13" fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  );
}

function Diamond({ cx, cy, label, active }: { cx: number; cy: number; label: string; active: boolean }) {
  const hw = 80;
  const hh = 36;
  const points = `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
  return (
    <g>
      <polygon points={points} fill={active ? SOFT : SURFACE} stroke={active ? ACCENT : INK} strokeWidth={active ? 2.5 : 1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight={600} fill={INK}>
        {label}
      </text>
    </g>
  );
}
