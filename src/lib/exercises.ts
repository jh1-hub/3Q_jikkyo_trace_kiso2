export type ExId = "p2-1" | "p2-2" | "p3-1" | "p3-2" | "p4-1" | "p4-2";

export type ExRow = {
  n: number;
  cells: string[];
  note: string;
  fresh?: number;
};

export type ExStep = {
  title: string;
  detail: string;
  node: string;
  rows: ExRow[];
  fresh?: number;
};

export type Exercise = {
  id: ExId;
  group: string;
  label: string;
  prompt: string;
  columns: string[];
  answerLabel: string;
  answer: string;
  steps: ExStep[];
};

function clone(rows: ExRow[]): ExRow[] {
  return rows.map((r) => ({ ...r, fresh: undefined }));
}

function run(columns: string[], build: (add: (node: string, title: string, detail: string, cells: string[], note: string | null, fresh?: number) => void) => void): ExStep[] {
  const rows: ExRow[] = [];
  const steps: ExStep[] = [];
  let n = 0;
  const add = (node: string, title: string, detail: string, cells: string[], note: string | null, fresh?: number) => {
    if (note) rows.push({ n: ++n, cells: [...cells], note, fresh });
    steps.push({
      node,
      title,
      detail,
      fresh,
      rows: clone(rows).map((r, i) => (i === rows.length - 1 && fresh !== undefined ? { ...r, fresh } : r)),
    });
  };
  build(add);
  return steps;
}

const p2 = (id: ExId, a: number, b: number, label: string): Exercise => {
  const c0 = b + 1988;
  const yes = a === 1;
  const c1 = yes ? c0 + 30 : c0;
  return {
    id,
    group: "(2)",
    label,
    prompt: `a = ${a}、b = ${b} のとき、トレースして出力される c を求める。`,
    columns: ["a", "b", "c"],
    answerLabel: "出力される c",
    answer: String(c1),
    steps: run(["a", "b", "c"], (add) => {
      add("start", "はじめ", "a と b を読み、c を作って表示する処理です。", ["—", "—", "—"], null);
      add("a", "a を入力", `a に ${a} を入れます。`, [String(a), "—", "—"], "a を入力", 0);
      add("b", "b を入力", `b に ${b} を入れます。`, [String(a), String(b), "—"], "b を入力", 1);
      add("c", "c を計算", `c に b + 1988 を入れます。${b} + 1988 = ${c0} です。`, [String(a), String(b), String(c0)], "b+1988→c", 2);
      add(
        "if",
        "a = 1 か",
        yes ? `a は ${a} なので、YES に進み c に 30 を足します。` : `a は ${a} なので、a = 1 ではありません。NO に進み、c はそのままです。`,
        [String(a), String(b), String(c0)],
        null,
      );
      if (yes) {
        add("add", "c に 30 を足す", `c は ${c0} + 30 = ${c1} になります。`, [String(a), String(b), String(c1)], "c+30→c", 2);
      }
      add("out", "c を表示", `表示される c は ${c1} です。`, [String(a), String(b), String(c1)], null);
      add("end", "おわり", `この問の正答は c = ${c1} です。`, [String(a), String(b), String(c1)], null);
    }),
  };
};

function series3(a: number, b: number) {
  let c = 1;
  let d = 0;
  const log: { c: number; d: number; e: string; note: string }[] = [];
  while (c !== b + 1) {
    const e = c * 2 - a;
    d += e;
    log.push({ c, d, e: String(e), note: "更新" });
    c += 1;
  }
  return { d, log };
}

const p3 = (id: ExId, a: number, b: number, label: string): Exercise => {
  const { d, log } = series3(a, b);
  return {
    id,
    group: "(3)",
    label,
    prompt: `a = ${a}、b = ${b} のとき、トレースして出力される d を求める。`,
    columns: ["a", "b", "c", "d", "e"],
    answerLabel: "出力される d",
    answer: String(d),
    steps: run([], (add) => {
      const base = [String(a), String(b)];
      add("start", "はじめ", "c を 1 から b まで動かし、e を d に足していく処理です。", ["—", "—", "—", "—", "—"], null);
      add("a", "a を入力", `a に ${a} を入れます。`, [String(a), "—", "—", "—", "—"], "a を入力", 0);
      add("b", "b を入力", `b に ${b} を入れます。ループは c が ${b + 1} になるまで続きます。`, [...base, "—", "—", "—"], "b を入力", 1);
      add("c", "c の初期化", "c に 1 を入れます。", [...base, "1", "—", "—"], "1→c", 2);
      add("d", "d の初期化", "d に 0 を入れます。ここに e を足していきます。", [...base, "1", "0", "—"], "0→d", 3);
      let c = 1;
      let cur = 0;
      for (const row of log) {
        add("loop", "繰り返し条件", `c は ${c}、b + 1 は ${b + 1} です。等しくないのでループに入ります。`, [...base, String(c), String(cur), "—"], null);
        add("e", "e を計算", `e = c × 2 − a = ${c} × 2 − ${a} = ${row.e} です。`, [...base, String(c), String(cur), row.e], "c×2−a→e", 4);
        cur = row.d;
        add("sum", "d に足す", `d に e を足して ${row.d} になります。`, [...base, String(c), String(cur), row.e], "d+e→d", 3);
        c += 1;
        add("inc", "c を 1 増やす", `c を ${c} にして、ループの先頭に戻ります。`, [...base, String(c), String(cur), row.e], "c+1→c", 2);
      }
      add("loop", "繰り返し条件", `c が ${b + 1} になり、b + 1 と等しいのでループを抜けます。`, [...base, String(b + 1), String(d), "—"], null);
      add("out", "d を表示", `表示される d は ${d} です。`, [...base, String(b + 1), String(d), "—"], null);
      add("end", "おわり", `この問の正答は d = ${d} です。`, [...base, String(b + 1), String(d), "—"], null);
    }),
  };
};

function series4(a: number) {
  let s = 0;
  let n = 1;
  const log: { n: number; d: number; s: number }[] = [];
  while (n !== 10) {
    const d = a * n;
    s += d;
    log.push({ n, d, s });
    n += 1;
  }
  return { s, log };
}

const p4 = (id: ExId, a: number, label: string): Exercise => {
  const { s, log } = series4(a);
  return {
    id,
    group: "(4)",
    label,
    prompt: `a = ${a} のとき、トレースして出力される s を求める。`,
    columns: ["a", "s", "n", "d"],
    answerLabel: "出力される s",
    answer: String(s),
    steps: run([], (add) => {
      add("start", "はじめ", "n を 1 から 9 まで動かし、a × n を s に足す処理です。n が 10 になったら終わります。", ["—", "—", "—", "—"], null);
      add("a", "a を入力", `a に ${a} を入れます。`, [String(a), "—", "—", "—"], "a を入力", 0);
      add("s", "s の初期化", "s に 0 を入れます。", [String(a), "0", "—", "—"], "0→s", 1);
      add("n", "n の初期化", "n に 1 を入れます。", [String(a), "0", "1", "—"], "1→n", 2);
      let curS = 0;
      let n = 1;
      for (const row of log) {
        add("loop", "繰り返し条件", `n は ${n} で、10 ではありません。ループに入ります。`, [String(a), String(curS), String(n), "—"], null);
        add("d", "d を計算", `d = a × n = ${a} × ${n} = ${row.d} です。`, [String(a), String(curS), String(n), String(row.d)], "a×n→d", 3);
        curS = row.s;
        add("sum", "s に足す", `s に d を足して ${row.s} になります。`, [String(a), String(curS), String(n), String(row.d)], "s+d→s", 1);
        n += 1;
        add("inc", "n を 1 増やす", `n を ${n} にして、ループの先頭に戻ります。`, [String(a), String(curS), String(n), String(row.d)], "n+1→n", 2);
      }
      add("loop", "繰り返し条件", "n が 10 になったのでループを抜けます。", [String(a), String(s), "10", "—"], null);
      add("out", "s を表示", `表示される s は ${s} です。1 から 9 までの和 45 に a を掛けた値です。`, [String(a), String(s), "10", "—"], null);
      add("end", "おわり", `この問の正答は s = ${s} です。`, [String(a), String(s), "10", "—"], null);
    }),
  };
};

export const EXERCISES: Exercise[] = [
  p2("p2-1", 1, 5, "(2) の 1"),
  p2("p2-2", 0, 20, "(2) の 2"),
  p3("p3-1", 0, 3, "(3) の 1"),
  p3("p3-2", 1, 5, "(3) の 2"),
  p4("p4-1", 2, "(4) の 1"),
  p4("p4-2", 6, "(4) の 2"),
];
