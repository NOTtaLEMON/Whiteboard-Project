// The Libraries tab: lists the teaching headers and standard examples, shows their source and loads an example.
export default function LibraryPanel({ library, libraryFile, libraryCatalog, standardLibraries, librarySources, viewLibrary, disabled, loadExample }) {
  return <div className="library-panel">
    <label className="field-label" htmlFor="library-select">C++ LIBRARIES</label>
    <select id="library-select" className="frame-select" value={libraryFile} onChange={(event) => viewLibrary(event.target.value)}>{libraryCatalog.map((item) => <option key={item.file} value={item.file}>{item.title} · {item.file}</option>)}</select>
    <h3>{library.title}</h3><p className="panel-help">{library.description}</p>
    <p className="library-methods">{library.methods}</p>
    <p className="panel-help">Include with <code>#include &lt;{libraryFile}&gt;</code>. {standardLibraries.includes(library) ? 'Built into the C++ toolchain. The code below is a runnable usage example.' : 'This is a project-provided teaching header compiled by the runner.'}</p>
    <button className="quiet-button" disabled={disabled} onClick={loadExample}>Load example on board</button>
    <pre className="library-source">{librarySources[libraryFile] || `Loading ${libraryFile}…`}</pre>
  </div>;
}
