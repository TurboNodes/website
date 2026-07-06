import styles from "./network-access.module.css";

const NODES = [
  { cx: 50, cy: 50, r: 7, delay: 0, label: "hub" },
  { cx: 18, cy: 28, r: 4.5, delay: 0.4, label: "node" },
  { cx: 82, cy: 22, r: 4, delay: 0.8, label: "node" },
  { cx: 88, cy: 58, r: 4.5, delay: 1.2, label: "node" },
  { cx: 72, cy: 84, r: 4, delay: 0.6, label: "node" },
  { cx: 28, cy: 78, r: 4.5, delay: 1.0, label: "node" },
  { cx: 12, cy: 52, r: 3.5, delay: 1.4, label: "node" },
  { cx: 42, cy: 14, r: 3.5, delay: 0.2, label: "node" },
  { cx: 58, cy: 88, r: 3.5, delay: 1.6, label: "node" },
] as const;

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 7],
  [0, 8],
  [1, 7],
  [2, 3],
  [4, 8],
  [5, 6],
];

export function NodeDiagram() {
  return (
    <div className={styles.diagramWrap} aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(26,79,214,0.18)" />
            <stop offset="100%" stopColor="rgba(26,79,214,0)" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="38" fill="url(#hubGlow)" />

        {EDGES.map(([from, to], i) => {
          const a = NODES[from];
          const b = NODES[to];
          return (
            <g key={`edge-${i}`}>
              <line
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                stroke="rgba(12,15,20,0.08)"
                strokeWidth="0.35"
              />
              <line
                x1={a.cx}
                y1={a.cy}
                x2={b.cx}
                y2={b.cy}
                stroke="#1a4fd6"
                strokeWidth="0.5"
                className={styles.pulseLine}
                style={{ animationDelay: `${i * 0.35}s` }}
              />
            </g>
          );
        })}

        {NODES.map((node, i) => (
          <g key={i}>
            {node.label === "hub" ? (
              <>
                <circle cx={node.cx} cy={node.cy} r={node.r + 3} fill="rgba(26,79,214,0.12)" />
                <circle cx={node.cx} cy={node.cy} r={node.r} fill="#1a4fd6" />
                <circle cx={node.cx} cy={node.cy} r={node.r * 0.35} fill="white" />
              </>
            ) : (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="#0c0f14"
                className={styles.nodeDot}
                style={{ animationDelay: `${node.delay}s` }}
              />
            )}
          </g>
        ))}

        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="rgba(12,15,20,0.06)"
          strokeWidth="0.25"
          strokeDasharray="1.5 2.5"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <span className="rounded-full border border-black/8 bg-white/70 px-3 py-1 text-[10px] font-medium tracking-widest text-[#5c6470] uppercase backdrop-blur-sm">
          Live residential mesh
        </span>
      </div>
    </div>
  );
}
