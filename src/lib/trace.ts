export type AlgoId = "max" | "min" | "sum" | "count" | "avg";

export type NodeId =
  | "start"
  | "init"
  | "init2"
  | "input"
  | "loop"
  | "compare"
  | "assign"
  | "bump"
  | "divide"
  | "display"
  | "end";

export type TraceRow = {
  n: number;
  data: string;
  cells: string[];
  note: string;
  fresh?: number | "data";
};

export type Meter = { label: string; value: string; hot: boolean };

export type Step = {
  node: NodeId;
  lit: string[];
  title: string;
  detail: string;
  meters: Meter[];
  rows: TraceRow[];
};

export type Algo = {
  id: AlgoId;
  name: string;
  initText: string;
  init2Text?: string;
  compareText: string;
  assignText: string;
  bumpText?: string;
  divideText?: string;
  displayText: string;
  columns: string[];
  points: string[];
  steps: Step[];
};

const INPUTS = [20, 25, 15, 999];

function cloneRows(rows: TraceRow[]): TraceRow[] {
  return rows.map((r) => ({ ...r, fresh: undefined }));
}

type Built = {
  data: number | null;
  cells: string[];
  rows: TraceRow[];
  steps: Step[];
  n: number;
};

function pushStep(
  b: Built,
  partial: Omit<Step, "meters" | "rows">,
  hot: number | "data" | null,
  labels: string[],
) {
  b.steps.push({
    ...partial,
    rows: cloneRows(b.rows).map((r, i) =>
      i === b.rows.length - 1 && hot !== null ? { ...r, fresh: hot } : r,
    ),
    meters: [
      { label: "データ", value: b.data === null ? "—" : String(b.data), hot: hot === "data" },
      ...labels.map((label, i) => ({ label, value: b.cells[i] ?? "—", hot: hot === i })),
    ],
  });
}

function makeSimple(id: "max" | "min" | "sum" | "count"): Algo {
  const labels = [id === "max" ? "最大" : id === "min" ? "最小" : id === "sum" ? "合計" : "件数"];
  const initVal = id === "min" ? 999 : 0;
  const b: Built = { data: null, cells: [String(initVal)], rows: [], steps: [], n: 0 };
  let acc = initVal;

  pushStep(b, { node: "start", lit: [], title: "はじめ", detail: "アルゴリズムの実行を開始します。まだ変数には値が入っていません。" }, null, labels);

  b.rows.push({ n: ++b.n, data: "—", cells: [String(initVal)], note: "初期化", fresh: 0 });
  pushStep(
    b,
    {
      node: "init",
      lit: ["e-start"],
      title: "初期化",
      detail:
        id === "max"
          ? "最大を入れる変数に 0 を代入します。これから来るデータより小さくしておくための初期化です。"
          : id === "min"
            ? "最小を入れる変数に 999 を代入します。これから来るデータより大きくしておくための初期化です。"
            : id === "count"
              ? "件数を入れる変数に 0 を代入します。まだ数えていない状態からの初期化です。"
              : "合計を入れる変数に 0 を代入します。何も足していない状態からの初期化です。",
    },
    0,
    labels,
  );

  let index = 0;
  let firstInput = true;
  while (index < INPUTS.length) {
    b.data = INPUTS[index]!;
    index += 1;
    b.rows.push({ n: ++b.n, data: String(b.data), cells: [String(acc)], note: "入力", fresh: "data" });
    pushStep(
      b,
      {
        node: "input",
        lit: firstInput ? ["e-init"] : ["e-back"],
        title: "データを入力",
        detail: firstInput
          ? `1件目のデータ ${b.data} を読み込みます。終端の 999 が来るまで、ループの最後で次の値を読みます。`
          : b.data === 999
            ? "次の値 999 を読み込みます。999 は「データはここまで」という終端の印です。"
            : `次のデータ ${b.data} を読み込みます。`,
      },
      "data",
      labels,
    );
    firstInput = false;
    const data = b.data;

    if (data === 999) {
      pushStep(
        b,
        {
          node: "loop",
          lit: ["e-input", "e-loop-no"],
          title: "繰り返し条件",
          detail: "データが 999 なので条件を満たしません。ループを抜けて、結果の表示へ進みます。",
        },
        null,
        labels,
      );
      break;
    }

    pushStep(
      b,
      {
        node: "loop",
        lit: ["e-input", "e-loop-yes"],
        title: "繰り返し条件",
        detail: `データは ${data} で、999 ではありません。条件を満たすので、ループの中へ進みます。`,
      },
      null,
      labels,
    );

    if (id === "sum" || id === "count") {
      const next = id === "sum" ? acc + data : acc + 1;
      const note = id === "sum" ? "加算" : "件数+1";
      b.rows.push({ n: ++b.n, data: String(data), cells: [String(next)], note, fresh: 0 });
      const prev = acc;
      acc = next;
      b.cells = [String(acc)];
      pushStep(
        b,
        {
          node: "assign",
          lit: ["e-to-assign"],
          title: id === "sum" ? "合計を更新" : "件数を更新",
          detail:
            id === "sum"
              ? `合計にデータを足します。${prev} + ${data} = ${acc} を合計に入れ、次の入力へ進みます。`
              : `件数に 1 を足します。${prev} + 1 = ${acc} です。データの値そのものは足しません。`,
        },
        0,
        labels,
      );
      continue;
    }

    const hit = id === "max" ? data >= acc : data <= acc;
    const op = id === "max" ? "≧" : "≦";
    pushStep(
      b,
      {
        node: "compare",
        lit: hit ? ["e-to-compare", "e-compare-yes"] : ["e-to-compare", "e-compare-no"],
        title: "大小の比較",
        detail: hit
          ? `${data} ${op} ${acc} が成り立ちます。${labels[0]}を、今のデータの値に更新します。`
          : `${data} ${op} ${acc} は成り立ちません。${labels[0]}はそのまま（${acc}）で、次の入力へ進みます。`,
      },
      null,
      labels,
    );
    if (hit) {
      b.rows.push({ n: ++b.n, data: String(data), cells: [String(data)], note: "更新", fresh: 0 });
      acc = data;
      b.cells = [String(acc)];
      pushStep(
        b,
        {
          node: "assign",
          lit: ["e-compare-yes", "e-assign"],
          title: `${labels[0]}を更新`,
          detail: `データ ${data} を${labels[0]}に代入しました。${labels[0]}は ${acc} です。`,
        },
        0,
        labels,
      );
    }
  }

  pushStep(
    b,
    {
      node: "display",
      lit: ["e-loop-no", "e-display"],
      title: "結果を表示",
      detail: `${labels[0]} ${acc} を表示します。対象にした値は 20・25・15 の3件です。`,
    },
    null,
    labels,
  );
  pushStep(
    b,
    { node: "end", lit: ["e-end"], title: "おわり", detail: `処理はここで終了です。最終的な${labels[0]}は ${acc} です。` },
    null,
    labels,
  );

  const points =
    id === "max"
      ? [
          "最大を入れる変数には、最初に小さな値（ここでは 0）を入れておく。",
          "読み込んだデータと最大を比べ、データが最大以上のとき最大を入れ替える。",
          "999 はデータではなく、繰り返しを終えるための印。",
        ]
      : id === "min"
        ? [
            "最小を入れる変数には、最初に大きな値（ここでは 999）を入れておく。",
            "読み込んだデータと最小を比べ、データが最小以下のとき最小を入れ替える。",
            "999 は終端の印なので、最小の候補にはしない。",
          ]
        : id === "count"
          ? [
              "件数を入れる変数には、最初に 0 を入れておく。",
              "繰り返しの中では、データそのものではなく 1 を足して数を増やす。",
              "999 は件数に含めない。20・25・15 なら件数は 3。",
            ]
          : [
              "合計を入れる変数には、最初に 0 を入れておく。",
              "繰り返しの中では、今までの合計にデータを足していく。",
              "999 を足す前にループを抜けるので、終端の値は合計に含まれない。",
            ];

  const names = { max: "最大値の検出", min: "最小値の検出", sum: "総合計の算出", count: "データの件数のカウント" };

  return {
    id,
    name: names[id],
    initText: id === "min" ? "999 → 最小" : id === "count" ? "0 → 件数" : id === "sum" ? "0 → 合計" : "0 → 最大",
    compareText: id === "max" ? "データ ≧ 最大" : "データ ≦ 最小",
    assignText: id === "sum" ? "合計+データ→合計" : id === "count" ? "件数+1→件数" : id === "max" ? "データ→最大" : "データ→最小",
    displayText: `${labels[0]}を表示`,
    columns: labels,
    points,
    steps: b.steps,
  };
}

function makeAvg(): Algo {
  const labels = ["合計", "件数", "平均"];
  const b: Built = { data: null, cells: ["0", "0", "—"], rows: [], steps: [], n: 0 };
  let sum = 0;
  let count = 0;

  const sync = () => {
    b.cells = [String(sum), String(count), "—"];
  };

  pushStep(b, { node: "start", lit: [], title: "はじめ", detail: "合計・件数・平均を求める処理を開始します。" }, null, labels);

  b.rows.push({ n: ++b.n, data: "—", cells: ["0", "0", "—"], note: "合計を初期化", fresh: 0 });
  pushStep(
    b,
    { node: "init", lit: ["e-start"], title: "合計の初期化", detail: "合計を入れる変数に 0 を代入します。" },
    0,
    labels,
  );

  b.rows.push({ n: ++b.n, data: "—", cells: ["0", "0", "—"], note: "件数を初期化", fresh: 1 });
  pushStep(
    b,
    { node: "init2", lit: ["e-init2"], title: "件数の初期化", detail: "件数を入れる変数に 0 を代入します。平均は、合計と件数の両方が必要です。" },
    1,
    labels,
  );

  let index = 0;
  let firstInput = true;
  while (index < INPUTS.length) {
    b.data = INPUTS[index]!;
    index += 1;
    sync();
    b.rows.push({ n: ++b.n, data: String(b.data), cells: [...b.cells], note: "入力", fresh: "data" });
    pushStep(
      b,
      {
        node: "input",
        lit: firstInput ? ["e-init"] : ["e-back"],
        title: "データを入力",
        detail:
          b.data === 999
            ? "次の値 999 を読み込みます。この値は平均の計算には使いません。"
            : firstInput
              ? `1件目のデータ ${b.data} を読み込みます。`
              : `次のデータ ${b.data} を読み込みます。`,
      },
      "data",
      labels,
    );
    firstInput = false;
    const data = b.data;

    if (data === 999) {
      pushStep(
        b,
        { node: "loop", lit: ["e-input", "e-loop-no"], title: "繰り返し条件", detail: "データが 999 なのでループを抜け、平均の計算へ進みます。" },
        null,
        labels,
      );
      break;
    }

    pushStep(
      b,
      { node: "loop", lit: ["e-input", "e-loop-yes"], title: "繰り返し条件", detail: `データは ${data} です。999 ではないので、合計と件数を更新します。` },
      null,
      labels,
    );

    const prevSum = sum;
    sum += data;
    sync();
    b.rows.push({ n: ++b.n, data: String(data), cells: [String(sum), String(count), "—"], note: "合計に加算", fresh: 0 });
    pushStep(
      b,
      { node: "assign", lit: ["e-to-assign"], title: "合計を更新", detail: `合計にデータを足します。${prevSum} + ${data} = ${sum} です。` },
      0,
      labels,
    );

    const prevCount = count;
    count += 1;
    sync();
    b.rows.push({ n: ++b.n, data: String(data), cells: [String(sum), String(count), "—"], note: "件数+1", fresh: 1 });
    pushStep(
      b,
      { node: "bump", lit: ["e-bump"], title: "件数を更新", detail: `件数に 1 を足します。${prevCount} + 1 = ${count} です。次のデータを読みに進みます。` },
      1,
      labels,
    );
  }

  const avg = count === 0 ? 0 : sum / count;
  b.cells = [String(sum), String(count), String(avg)];
  b.rows.push({ n: ++b.n, data: "999", cells: [...b.cells], note: "平均を計算", fresh: 2 });
  pushStep(
    b,
    {
      node: "divide",
      lit: ["e-loop-no", "e-divide"],
      title: "平均を計算",
      detail: `合計を件数で割ります。${sum} ÷ ${count} = ${avg} を平均に入れます。`,
    },
    2,
    labels,
  );
  pushStep(
    b,
    { node: "display", lit: ["e-display"], title: "結果を表示", detail: `平均 ${avg} を表示します。20・25・15 の平均です。` },
    null,
    labels,
  );
  pushStep(b, { node: "end", lit: ["e-end"], title: "おわり", detail: `処理はここで終了です。平均は ${avg} です。` }, null, labels);

  return {
    id: "avg",
    name: "総平均の算出",
    initText: "0 → 合計",
    init2Text: "0 → 件数",
    compareText: "",
    assignText: "合計+データ→合計",
    bumpText: "件数+1→件数",
    divideText: "合計÷件数→平均",
    displayText: "平均を表示",
    columns: labels,
    points: [
      "合計と件数を、どちらも 0 から始める。",
      "ループの中では合計にデータを足し、件数には 1 を足す。",
      "ループを抜けてから、合計を件数で割って平均にする。",
    ],
    steps: b.steps,
  };
}

export const ALGOS: Record<AlgoId, Algo> = {
  max: makeSimple("max"),
  min: makeSimple("min"),
  sum: makeSimple("sum"),
  count: makeSimple("count"),
  avg: makeAvg(),
};

export const EXAMPLE = "20 → 25 → 15 → 999";
