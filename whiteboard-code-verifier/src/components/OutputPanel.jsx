import Icon from './Icon.jsx';
import MemoryDiagram from './MemoryDiagram.jsx';

const RESULT_LABELS = {
  success: 'Program completed', compile_error: 'Check the syntax', runtime_error: 'A runtime issue surfaced',
  timeout: 'Time limit reached', output_limit: 'Output limit reached', invalid_source: 'Check the source',
};

// The Output tab: empty state, progress, and the result of the last run with its diagnostics and teaching notes.
export default function OutputPanel({ result, stale, edited, running, phase, language, languageLabel, focusDiagnostic }) {
  return <>
    {stale && <div className="stale-notice">{edited !== null ? 'The code changed. Run again to update these results.' : 'The board changed. Run again to update these results.'}</div>}
    {!result && !running && <div className="empty-state"><div className="terminal-glyph">&gt;_</div><h3>Let the code do the talking.</h3><p>Output appears here. Errors are underlined in the code above.</p><span>{language === 'python' ? 'Python interpreter' : 'C++ compiler'} · real output</span></div>}
    {running && <div className="empty-state" role="status"><div className="terminal-glyph">…</div><h3>{phase === 'prepare' ? 'Preparing the program' : 'Testing the lesson'}</h3><p>{phase === 'prepare' ? 'The local model is adding the boilerplate. This can take up to a minute on a CPU.' : `Checking ${languageLabel} and running the program.`}</p></div>}
    {result && <div aria-live="polite"><div className={`result-status ${result.status === 'success' ? 'passed' : 'failed'}`}><span>{result.status === 'success' ? '✓' : '!'}</span><strong>{RESULT_LABELS[result.status] ?? result.status}</strong><small>{result.durationMs} ms</small></div>
      <div className="terminal"><div className="terminal-title"><span>STDOUT</span><span>exit {result.exitCode ?? '—'}</span></div><pre>{result.stdout || '(no output)'}</pre></div>
      {language === 'c' && <MemoryDiagram stdout={result.stdout} />}
      {result.transformed && <p className="panel-help">This output comes from the prepared program (built from your drawing or snippet). Diagnostic line numbers refer to that program.</p>}
      {result.diagnostics.length > 0 && <div className="diagnostics"><h3>What the tools found</h3>{result.diagnostics.map((diagnostic, index) => <button key={index} className={`diagnostic ${diagnostic.severity}`} disabled={Boolean(stale) || result.transformed} onClick={() => focusDiagnostic(diagnostic)}><span className="line-number">L{diagnostic.line}</span><span><b>{diagnostic.kind} · {diagnostic.severity}</b>{diagnostic.message}</span><Icon name="arrow" size={14} /></button>)}</div>}
      {result.notes.map((note) => <article className="teaching-note" key={note.title}><span className="eyebrow">TEACHING NOTE</span><h3>{note.title}</h3><p>{note.body}</p></article>)}
      {(result.stderr || result.compilerOutput) && <details className="raw-output"><summary>Full compiler & runtime messages</summary><pre>{[result.compilerOutput, result.stderr].filter(Boolean).join('\n')}</pre></details>}
    </div>}
  </>;
}
