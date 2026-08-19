export function PolicyDiagram() {
  return (
    <figure className="policy-figure" aria-labelledby="policy-diagram-title">
      <svg
        className="policy-diagram"
        role="img"
        viewBox="0 0 760 390"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id="policy-diagram-title">The deployed Pokémon Battler policy architecture</title>
        <defs>
          <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0,0 L8,4 L0,8" fill="none" stroke="currentColor" strokeWidth="1.25" />
          </marker>
          <pattern id="diagram-grid" height="12" patternUnits="userSpaceOnUse" width="12">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="currentColor" strokeOpacity="0.07" />
          </pattern>
        </defs>

        <rect className="diagram-grid" height="390" width="760" />

        <g className="diagram-lines" fill="none" markerEnd="url(#arrow)">
          <path d="M174 98 H260" />
          <path d="M174 98 C220 98 214 224 260 224" />
          <path d="M466 98 C520 98 514 170 556 170" />
          <path d="M466 224 C520 224 514 170 556 170" />
          <path d="M174 312 H556" />
          <path d="M658 216 V269" />
        </g>

        <g className="diagram-node">
          <rect height="76" rx="2" width="136" x="38" y="60" />
          <text x="58" y="86">BATTLE STATE</text>
          <text className="diagram-small" x="58" y="111">public information</text>
        </g>

        <g className="diagram-node diagram-node-accent">
          <rect height="76" rx="2" width="206" x="260" y="60" />
          <text x="280" y="86">QWEN 2.5 · 0.5B</text>
          <text className="diagram-small" x="280" y="111">base legal log P(a)</text>
        </g>

        <g className="diagram-node">
          <rect height="100" rx="2" width="206" x="260" y="174" />
          <text x="280" y="200">STRUCTURED SIDECAR</text>
          <text className="diagram-small" x="280" y="225">mechanics · identities</text>
          <text className="diagram-small" x="280" y="246">rosters · 4 transitions</text>
        </g>

        <g className="diagram-node diagram-node-accent">
          <rect height="92" rx="2" width="166" x="556" y="124" />
          <text x="576" y="151">BLEND</text>
          <text className="diagram-small" x="576" y="176">Qwen + 0.75 ×</text>
          <text className="diagram-small" x="576" y="195">sidecar log P(a)</text>
        </g>

        <g className="diagram-node">
          <rect height="76" rx="2" width="136" x="38" y="274" />
          <text x="58" y="300">SHOWDOWN</text>
          <text className="diagram-small" x="58" y="325">exact legal mask</text>
        </g>

        <g className="diagram-node diagram-node-dark">
          <rect height="76" rx="2" width="166" x="556" y="269" />
          <text x="576" y="296">GREEDY ACTION</text>
          <text className="diagram-small" x="576" y="321">argmax over legal A</text>
        </g>
      </svg>
      <figcaption>
        The live policy keeps Qwen in the loop. A learned mechanics sidecar scores the same legal actions,
        then the two log-probability distributions are blended before greedy selection.
      </figcaption>
    </figure>
  )
}
