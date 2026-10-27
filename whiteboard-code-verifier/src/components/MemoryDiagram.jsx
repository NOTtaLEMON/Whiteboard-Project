// Shows the stack-pointer and heap addresses that the memory lesson prints.
export default function MemoryDiagram({ stdout }) {
  const pointer = stdout.match(/^Pointer on stack: (0x[\da-f]+)$/im)?.[1];
  const buffer = stdout.match(/^Buffer address: (0x[\da-f]+)$/im)?.[1];
  if (!pointer || !buffer) return null;
  return <figure className="memory-diagram" aria-label="Memory addresses printed by the program">
    <figcaption className="eyebrow">MEMORY IN THIS RUN</figcaption>
    <div className="memory-location"><span>STACK · POINTER VARIABLE</span><code>{pointer}</code><small>The address of <code>values</code></small></div>
    <div className="memory-link" aria-hidden="true">↓ points to</div>
    <div className="memory-location allocation"><span>DYNAMIC STORAGE · BUFFER</span><code>{buffer}</code><small>The address returned by <code>malloc</code></small></div>
    <p>Addresses are printed by this program. Sanitizers change allocation layout; these are not glibc region classifications.</p>
  </figure>;
}
