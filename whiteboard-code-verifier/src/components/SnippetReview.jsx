// Snippet mode: shows the program the model prepared, with any warning, and asks the teacher to confirm it.
export default function SnippetReview({ currentDraft, running, reading, health, confirmSnippet, setSnippetDraft }) {
  return <section className="snippet-review" aria-label="Prepared program">
    <h3>Prepared program</h3>
    {currentDraft.warning ? <p className="error-notice" role="alert">{currentDraft.warning}</p> : <p className="panel-help">Each of your lines is still there, in order and unchanged. Read the program, then confirm.</p>}
    <pre className="library-source" aria-label="Prepared C++ program">{currentDraft.source}</pre>
    <div className="snippet-actions">
      <button className="quiet-button" onClick={confirmSnippet} disabled={running || reading || !health?.available}>{currentDraft.confirmed ? 'Run again' : 'Confirm & run'}</button>
      <button className="quiet-button" onClick={() => setSnippetDraft(null)} disabled={running || reading}>Discard</button>
    </div>
    <p className="ocr-provenance">{currentDraft.provider} · {currentDraft.model} · {currentDraft.durationMs} ms</p>
  </section>;
}
