import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Excalidraw, restoreElements } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { CODE_COLOR, INPUT_COLOR, extractProgram, framesIn, isOverlay, programSignature } from '../shared/board.js';
import { clearOverlays, createRegionFrame, fitProgramFrame, inkBounds, lessonScene, replaceChannel, resizeProgramFrame } from './lib/canvas.js';
import { handwritingChannels, inkFingerprint } from '../shared/handwriting.js';
import HandwritingPanel from './components/HandwritingPanel.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import DrawToolbar from './components/DrawToolbar.jsx';
import { lessons } from './lib/lessons.js';
import { composeBoardSource } from './lib/linked-list-drawing.js';
import { libraries, standardLibraries } from '../shared/libraries.js';
import { LANGUAGES, languageInfo, languagePayload, validLanguage } from '../shared/languages.js';
import FrameControls from './components/FrameControls.jsx';
import ProgramRegions from './components/ProgramRegions.jsx';
import WorkspaceLayout from './components/WorkspaceLayout.jsx';
import SnapshotHistory from './components/SnapshotHistory.jsx';
import TestCases from './components/TestCases.jsx';
import Icon from './components/Icon.jsx';
import OwnerKeyForm from './components/OwnerKeyForm.jsx';
import OutputPanel from './components/OutputPanel.jsx';
import SnippetReview from './components/SnippetReview.jsx';
import LibraryPanel from './components/LibraryPanel.jsx';
import { readApiJson, apiFetch } from './lib/api.js';
import stackHeader from '../runner/lib/stack.h?raw';
import listHeader from '../runner/lib/linked_list.h?raw';
import queueHeader from '../runner/lib/queue.h?raw';
import searchHeader from '../runner/lib/search.h?raw';
import './styles.css';

const libraryCatalog = [...libraries, ...standardLibraries];
const bundledHeaders = { 'stack.h': stackHeader, 'linked_list.h': listHeader, 'queue.h': queueHeader, 'search.h': searchHeader };

const EMPTY_PROGRAM = { source: '', stdin: '', codeIds: [], inputIds: [], lineMap: [] };

function App() {
  const initial = useMemo(() => [], []);
  const [api, setApi] = useState(null);
  const [elements, setElements] = useState(initial);
  const [frameId, setFrameId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [language, setLanguage] = useState('c');
  const currentLanguage = useRef(language);
  currentLanguage.current = language;
  const healthRequest = useRef(0);
  const languageLabel = languageInfo(language).label;
  const [tab, setTab] = useState('output');
  const [health, setHealth] = useState(null);
  const [ocrHealth, setOcrHealth] = useState(null);
  const [snapshotAvailable, setSnapshotAvailable] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState('Connect the API to check lesson storage.');

  const [reading, setReading] = useState(false);
  const [confirmedOcr, setConfirmedOcr] = useState(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [librarySources, setLibrarySources] = useState({});
  const [libraryFile, setLibraryFile] = useState('stack.h');
  const [panelVisible, setPanelVisible] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [snapshotRevision, setSnapshotRevision] = useState(0);
  const [automaticSnapshot, setAutomaticSnapshot] = useState('');
  const [edited, setEdited] = useState(null);
  // Snippet mode (C++): the model adds only boilerplate, then the teacher confirms the program before it runs.
  const [snippetMode, setSnippetMode] = useState(false);
  const [snippetDraft, setSnippetDraft] = useState(null);
  const [phase, setPhase] = useState('');
  const [editedBase, setEditedBase] = useState('');
  const [activeTool, setActiveToolState] = useState('selection');
  const [toolLocked, setToolLocked] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('boardroom.theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  const [tabs, setTabs] = useState([{ id: 'tab-1', title: 'Board 1', elements: [] }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [dualMode, setDualMode] = useState(false);
  const [secondaryTabId, setSecondaryTabId] = useState('');
  const [apiSecondary, setApiSecondary] = useState(null);
  const [secondaryElements, setSecondaryElements] = useState([]);
  const [focusedBoard, setFocusedBoard] = useState('primary'); // 'primary' | 'secondary'
  const [penColor, setPenColor] = useState(CODE_COLOR);
  const [pen, setPen] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [regionPending, setRegionPending] = useState(false);
  const selectingRegion = useRef(null);
  const upload = useRef(null);
  const ocrPanel = useRef(null);
  const casesPanel = useRef(null);
  const editorRef = useRef(null);
  const currentKey = useRef('');
  const currentFrameId = useRef(frameId);
  currentFrameId.current = frameId;
  const controller = useRef(null);
  const frames = useMemo(() => framesIn(elements), [elements]);
  const typedProgram = useMemo(() => extractProgram(elements, frameId), [elements, frameId]);
  const inkChannels = useMemo(() => handwritingChannels(elements, frameId), [elements, frameId]);
  const hasInk = inkChannels.code || inkChannels.stdin;
  const fingerprint = useMemo(() => inkFingerprint(elements, frameId), [elements, frameId]);
  const recognizedProgram = confirmedOcr?.frameId === frameId && confirmedOcr.fingerprint === fingerprint && (confirmedOcr.language ?? 'c') === language ? confirmedOcr.program : null;
  const codeReviewCurrent = confirmedOcr?.frameId === frameId && (confirmedOcr.language ?? 'c') === language &&
    confirmedOcr.codeFingerprint === inkFingerprint(elements, frameId, ['code']);
  const program = { ...(hasInk ? recognizedProgram ?? (codeReviewCurrent ? { ...confirmedOcr.program, stdin: '' } : EMPTY_PROGRAM) : typedProgram), language };
  const signature = programSignature(program, frameId);
  // The board supplies the writing; the editor holds the exact text that is compiled.
  const composed = composeBoardSource(program.source, language);
  const runSource = edited ?? composed.source;
  const runKey = `${signature}\u0000${runSource}`;
  currentKey.current = runKey;
  const boardMovedOn = edited !== null && composed.source !== editedBase;
  const stale = result && result.key !== runKey;
  const needsPrepared = snippetMode && language === 'c' && !composed.drawing;
  const currentDraft = snippetDraft?.originalKey === runKey ? snippetDraft : null;
  const caseProgram = currentDraft && needsPrepared ? { ...program, source: currentDraft.source, lineMap: [] } : { ...program, source: runSource };
  const shownDiagnostics = result && !stale && !result.transformed ? result.diagnostics : [];
  const lesson = lessons.find((item) => item.id === lessonId);
  const selectedFrame = frames.find((frame) => frame.id === frameId);
  const library = libraryCatalog.find((item) => item.file === libraryFile);
  const refreshCanvas = useCallback(() => api?.refresh(), [api]);
  const busy = running || reading;
  const lineCount = runSource ? runSource.split('\n').length : 0;

  const checkHealth = useCallback(async () => {
    const requestId = ++healthRequest.current;
    try {
      const response = await apiFetch(language === 'python' ? '/api/health?language=python' : '/api/health');
      if (!response.ok) {
        const data = await readApiJson(response).catch(() => ({}));
        throw new Error(data.error ?? (response.status === 404 ?
          'Boardroom API endpoint is missing. Set the Vercel Root Directory to whiteboard-code-verifier and redeploy.' :
          `Boardroom API returned HTTP ${response.status}.`));
      }
      const data = await readApiJson(response);
      if (requestId !== healthRequest.current || currentLanguage.current !== language) return;
      if (!data || typeof data.runner?.available !== 'boolean' || typeof data.ocr?.available !== 'boolean') throw new Error('Invalid API response');
      if (data.locked && !data.authorized) {
        const message = 'Running code, handwriting and lesson history are private on this site. Drawing and downloads still work.';
        setSnapshotAvailable(false); setSnapshotMessage(message);
        setHealth({ available: false, locked: true, message }); setOcrHealth({ available: false, message });
        return;
      }
      setSnapshotAvailable(data.snapshots?.available !== false);
      setSnapshotMessage(data.snapshots?.message ?? 'Lesson history is unavailable. You can download this board from the top bar.');
      setHealth(data.runner);
      setOcrHealth(data.ocr);
    } catch (caught) {
      if (requestId !== healthRequest.current || currentLanguage.current !== language) return;
      const local = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
      const message = caught.message && caught.message !== 'Failed to fetch' ? caught.message : local ? 'Boardroom API is offline. Start it with npm run dev or npm start.' :
        'This site has no Boardroom API connection. Board editing and downloads work; verification and handwriting recognition need the hosted API.';
      setSnapshotAvailable(false);
      setHealth({ available: false, message });
      setOcrHealth({ available: false, message });
    }
  }, [language]);
  useEffect(() => { checkHealth(); }, [checkHealth]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    const leave = (event) => {
      if (event.key !== 'Escape') return;
      if (selectingRegion.current) cancelRegion();
      setToolsOpen(false);
    };
    window.addEventListener('keydown', leave);
    return () => window.removeEventListener('keydown', leave);
  }, [api]);

  // Opening or closing the panel resizes the board, so bring the selected program back into view.
  const panelRendered = useRef(false);
  useEffect(() => {
    if (!panelRendered.current) { panelRendered.current = true; return undefined; }
    if (!api || !frameId) return undefined;
    let second;
    const first = setTimeout(() => { api.refresh(); second = setTimeout(() => fitProgramFrame(api, currentFrameId.current), 150); }, 500);
    return () => { clearTimeout(first); clearTimeout(second); };
  }, [panelVisible]);

  const onChange = useCallback((next, appState) => {
    if (appState?.activeTool?.type) setActiveToolState(appState.activeTool.type);
    // The scene array and stroke objects can retain their identities while being edited.
    setElements([...next]);
    const nextFrames = framesIn(next);
    const newRegion = selectingRegion.current && nextFrames.find((el) => !selectingRegion.current.has(el.id));
    if (newRegion) {
      selectingRegion.current = null;
      setRegionPending(false);
      setFrameId(newRegion.id);
      setEdited(null);
      setNotice('Region selected. Black writing is code; blue writing inside this region is stdin.');
    } else setFrameId((previous) => nextFrames.some((el) => el.id === previous) ? previous : (nextFrames[0]?.id ?? ''));
  }, []);

  function resetWork() {
    setConfirmedOcr(null);
    setResult(null);
    setError('');
    setEdited(null);
  }

  function chooseLesson(id) {
    if (!api) return;
    const next = lessonScene(lessons.find((item) => item.id === id));
    selectingRegion.current = null;
    setRegionPending(false);
    api.updateScene({ elements: next });
    api.scrollToContent(next, { fitToContent: true, maxZoom: 1 });
    setFrameId('lesson-frame');
    setLessonId(id);
    setLanguage('c');
    resetWork();
    setNotice('Lesson loaded. Download your board before switching lessons to keep edits.');
  }

  function changeFrame(id) {
    setFrameId(id);
    setEdited(null);
    setFocusedBoard('primary');
    if (api) fitProgramFrame(api, id);
  }

  function editCode(value) {
    if (value === composed.source) { setEdited(null); return; }
    if (edited === null) setEditedBase(composed.source);
    setEdited(value);
  }

  async function requestJson(path, body, timeoutMs) {
    const abort = new AbortController();
    controller.current = abort;
    const timer = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const response = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal: abort.signal });
      const data = await readApiJson(response);
      if (!response.ok) {
        throw new Error(data.error ?? `API returned HTTP ${response.status}.`);
      }
      return data;
    } catch (caught) {
      throw caught;
    } finally { clearTimeout(timer); controller.current = null; }
  }

  function scanInput() {
    setPanelVisible(true); setToolsOpen(false); setTab('handwriting');
    ocrPanel.current?.readInput();
  }

  async function run(confirmedSource) {
    if (!api || running || reading) return;
    setError('');
    setNotice('');
    setPanelVisible(true);
    setToolsOpen(false);
    const liveElements = api.getSceneElements();
    const liveChannels = handwritingChannels(liveElements, frameId);
    const liveHasInk = liveChannels.code || liveChannels.stdin;
    const liveFingerprint = inkFingerprint(liveElements, frameId);
    if (liveHasInk && (confirmedOcr?.frameId !== frameId || confirmedOcr.fingerprint !== liveFingerprint)) {
      setTab('handwriting');
      if (confirmedOcr?.frameId === frameId && confirmedOcr.codeFingerprint === inkFingerprint(liveElements, frameId, ['code']) && liveChannels.stdin) ocrPanel.current?.readInput();
      else ocrPanel.current?.read();
      return;
    }
    const liveProgram = { ...(liveHasInk ? confirmedOcr.program : extractProgram(liveElements, frameId)), language };
    const prepared = composeBoardSource(liveProgram.source, language);
    const submittedSource = edited ?? prepared.source;
    if (!submittedSource.trim()) { setError('Write code or an algorithm, select its region, or type it in the code editor.'); return; }
    setRunning(true);
    setResult(null);
    setTab('output');
    const submittedSignature = programSignature(liveProgram, frameId);
    const submittedKey = `${submittedSignature}\u0000${submittedSource}`;
    const submitted = { ...liveProgram, source: submittedSource };
    const submittedEdited = edited !== null;
    let compiled = false;
    const boardUnchanged = () => {
      const scene = api.getSceneElements();
      const channels = handwritingChannels(scene, frameId);
      const ink = channels.code || channels.stdin;
      if (ink && confirmedOcr?.fingerprint !== inkFingerprint(scene, frameId)) return false;
      const live = { ...(ink ? confirmedOcr.program : extractProgram(scene, frameId)), language };
      return currentLanguage.current === language && currentKey.current === submittedKey && programSignature(live, frameId) === submittedSignature;
    };
    async function compile(source, transformed) {
      if (!boardUnchanged()) throw new Error('The board changed. Run again for the current selection; the program was not executed.');
      const compilationScene = boardScene();
      const data = await requestJson('/api/run', { source, stdin: submitted.stdin, ...languagePayload(language) }, 30_000);
      compiled = true;
      setResult({ ...data, signature: submittedSignature, key: submittedKey, source, stdin: submitted.stdin, transformed, edited: submittedEdited });
      await saveCompilationSnapshot(compilationScene, { source, stdin: submitted.stdin, language, level: 1, kind: 'run', result: data });
      return data;
    }
    try {
      // The teacher confirmed the prepared program shown in the panel: run exactly that text.
      if (typeof confirmedSource === 'string') { await compile(confirmedSource, true); return; }
      // Snippet mode: the model adds boilerplate only; nothing runs until the teacher confirms the result.
      if (snippetMode && language === 'c' && !prepared.drawing) {
        setPhase('prepare');
        const draft = await requestJson('/api/snippet', { source: submitted.source, language }, 200_000);
        if (!boardUnchanged()) throw new Error('The board changed. Prepare the program again for the current selection.');
        setSnippetDraft({ ...draft, originalKey: submittedKey, confirmed: false });
        return;
      }
      // The board text is compiled exactly as written; a drawn linked list is the only thing turned into code.
      await compile(submitted.source, Boolean(prepared.drawing && edited === null));
    } catch (caught) {
      setError(caught.name === 'AbortError' ? 'The request timed out. Check the API and try again.' : caught.message);
    } finally { setRunning(false); setPhase(''); checkHealth(); }
  }

  function confirmSnippet() {
    if (!currentDraft || running || reading) return;
    setSnippetDraft({ ...currentDraft, confirmed: true });
    run(currentDraft.source);
  }

  function toggleSnippet() {
    if (running || reading) return;
    setSnippetDraft(null); setResult(null); setError('');
    setNotice(snippetMode ? 'Full program mode: the code runs exactly as written.' :
      'Snippet mode: the model adds only the boilerplate (includes, main, return). You confirm the program before it runs.');
    setSnippetMode(!snippetMode);
  }

  function boardScene() {
    const current = structuredClone(api.getSceneElements().filter((el) => !isOverlay(el)));
    const reviewed = confirmedOcr?.frameId === frameId && (confirmedOcr.language ?? 'c') === language && confirmedOcr.fingerprint === inkFingerprint(current, frameId) ? confirmedOcr : null;
    const channels = handwritingChannels(current, frameId);
    const currentProgram = channels.code || channels.stdin ? reviewed?.program : extractProgram(current, frameId);
    return {
      type: 'excalidraw', version: 2, source: 'boardroom',
      elements: current,
      appState: { viewBackgroundColor: '#ffffff', gridSize: null }, files: structuredClone(api.getFiles()),
      verifier: { frameId, language, result: currentProgram && !result?.edited && result?.signature === programSignature({ ...currentProgram, language }, frameId) ? result : null,
        ocr: reviewed ? structuredClone(reviewed) : null },
    };
  }

  function download() {
    const snapshot = boardScene();
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `boardroom-${new Date().toISOString().replace(/[:.]/g, '-')}.excalidraw`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Board downloaded with its scene and current run result.');
  }

  async function saveSnapshot() {
    if (!api || savingSnapshot || running || reading) return;
    const scene = boardScene();
    const channels = handwritingChannels(scene.elements, frameId);
    if ((channels.code || channels.stdin) && !scene.verifier.ocr) {
      setError('Review and confirm the current handwriting before saving a snapshot.');
      setPanelVisible(true); setTab('handwriting'); return;
    }
    setSavingSnapshot(true); setError(''); setNotice('');
    try {
      const data = await pushSnapshot(scene, selectedFrame?.name || lesson?.title || 'Lesson');
      setPanelVisible(true);
      setNotice(`Snapshot saved: ${data.id}${data.commit ? ` · Git ${data.commit.slice(0, 8)}` : ''}`);
      if (data.warning) setError(data.warning);
      else { setSnapshotRevision((revision) => revision + 1); setTab('history'); }
    } catch (caught) { setPanelVisible(true); setError(caught.message); }
    finally { setSavingSnapshot(false); }
  }

  async function pushSnapshot(scene, title) {
    const response = await apiFetch('/api/snapshots', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, scene }), signal: AbortSignal.timeout(55_000) });
    const data = await readApiJson(response);
    if (!response.ok) throw new Error(data.error ?? 'Could not save the lesson snapshot.');
    return data;
  }

  async function saveCompilationSnapshot(scene, execution) {
    setAutomaticSnapshot('Saving full-board snapshot…');
    try {
      const savedScene = { ...scene, verifier: { ...scene.verifier, execution } };
      const title = scene.elements.find(el => el.id === scene.verifier.frameId)?.name || 'Lesson';
      const data = await pushSnapshot(savedScene, `${title} · ${execution.result.status}`);
      setSnapshotRevision(revision => revision + 1);
      setAutomaticSnapshot(data.warning || `Full-board snapshot saved · Git ${data.commit.slice(0, 8)}`);
    } catch (caught) {
      setAutomaticSnapshot(`Automatic snapshot failed: ${caught.name === 'TimeoutError' ? 'Archive request timed out. Refresh History before retrying.' : caught.message} Your run result is still available.`);
    }
  }

  function restoreBoard(data) {
    if (data.type !== 'excalidraw' || !Array.isArray(data.elements) || data.elements.length > 2000) throw new Error('Choose an Excalidraw scene with at most 2,000 elements.');
    if (!validLanguage(data.verifier?.language)) throw new Error('Choose a board using C++ or Python.');
    setLanguage(data.verifier?.language ?? 'c');
    const restored = restoreElements(data.elements.filter((el) => !isOverlay(el)), null);
    const nextFrames = framesIn(restored);
    const nextFrameId = nextFrames.some((frame) => frame.id === data.verifier?.frameId) ? data.verifier.frameId : nextFrames[0]?.id ?? '';
    selectingRegion.current = null;
    setRegionPending(false);
    api.updateScene({ elements: restored });
    if (data.files) api.addFiles(Object.values(data.files));
    api.scrollToContent(restored, { fitToContent: true, maxZoom: 1 });
    setFrameId(nextFrameId); setLessonId(''); resetWork();
    const channels = handwritingChannels(restored, nextFrameId);
    return channels.code || channels.stdin;
  }

  async function importBoard(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !api) return;
    try {
      if (file.size > 2_000_000) throw new Error('Choose a board smaller than 2 MB.');
      const data = JSON.parse(await file.text());
      restoreBoard(data);
      setNotice('Board imported. Run it to verify the current code.');
    } catch (caught) { setError(`Could not import: ${caught.message}`); }
  }

  async function viewLibrary(file = libraryFile) {
    setPanelVisible(true);
    setTab('library');
    setLibraryFile(file);
    if (librarySources[file]) return;
    const standard = standardLibraries.find(item => item.file === file);
    if (standard) {
      setLibrarySources(previous => ({ ...previous, [file]: lessons.find(item => item.id === standard.lessonId).source }));
      return;
    }
    if (bundledHeaders[file]) {
      setLibrarySources((previous) => ({ ...previous, [file]: bundledHeaders[file] }));
      return;
    }
    try {
      const response = await apiFetch(`/api/library/${file}`);
      if (!response.ok) throw new Error(`Could not load ${file}. Check the API.`);
      const source = await response.text();
      setLibrarySources((previous) => ({ ...previous, [file]: source }));
    } catch (caught) { setError(caught.message); }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { setError('Fullscreen is unavailable in this browser. The workspace still fills the browser window.'); }
  }

  function focusDiagnostic(diagnostic) {
    setPanelVisible(true);
    editorRef.current?.focusLine(diagnostic.line);
  }

  function newBlankBoard() {
    if (!api || reading || running) return;
    cancelRegion();
    api.updateScene({ elements: [], appState: { selectedElementIds: {}, currentItemStrokeColor: CODE_COLOR } });
    api.setActiveTool({ type: 'freedraw' });
    setPen('code');
    setFrameId('');
    setLessonId('');
    resetWork();
    setNotice('Write anywhere. Then choose Select code & input and drag around the content to run.');
  }

  function selectCodeRegion() {
    if (!api || running || reading) return;
    selectingRegion.current = new Set(framesIn(api.getSceneElements()).map((frame) => frame.id));
    setRegionPending(true);
    setToolsOpen(false);
    setPen('');
    api.setActiveTool({ type: 'frame' });
    setNotice('Drag around the code and any blue input to select a program region. Press Escape to cancel.');
  }

  const activeApi = focusedBoard === 'secondary' && apiSecondary ? apiSecondary : api;

  function cancelRegion() {
    selectingRegion.current = null;
    setRegionPending(false);
    activeApi?.setActiveTool({ type: 'selection' });
  }

  function transcribeWholePage() {
    if (!api || reading || running) return;
    const rect = inkBounds(api);
    if (!rect) { setError('Write or type something on the board first.'); return; }
    cancelRegion();
    setToolsOpen(false);
    const created = createRegionFrame(api, rect);
    setFrameId(created.id);
    setLessonId('');
    resetWork();
    setNotice('Whole page selected. Press Verify & run to compile it, or read the handwriting first if it is inked.');
    if (created.strokes > 0) { setPanelVisible(true); setTab('handwriting'); }
  }

  function selectPen(kind, customColor = null) {
    if (!activeApi) return;
    cancelRegion();
    const color = customColor || (kind === 'code' ? CODE_COLOR : kind === 'input' ? INPUT_COLOR : penColor);
    if (customColor) setPenColor(customColor);
    activeApi.updateScene({ appState: { currentItemStrokeColor: color } });
    activeApi.setActiveTool({ type: 'freedraw' });
    setPen(kind);
    setToolsOpen(true);
  }

  function zoomBoard(delta) {
    if (!activeApi) return;
    const currentZoom = activeApi.getAppState().zoom.value;
    const nextZoom = Math.min(3, Math.max(0.2, currentZoom + delta));
    activeApi.updateScene({ appState: { zoom: { value: nextZoom } } });
  }

  function resetZoom() {
    if (!activeApi) return;
    const sceneElements = activeApi.getSceneElements().filter((el) => !isOverlay(el));
    if (sceneElements.length) {
      activeApi.scrollToContent(sceneElements, { fitToContent: true, maxZoom: 1 });
    } else {
      activeApi.updateScene({ appState: { zoom: { value: 1 }, scrollX: 0, scrollY: 0 } });
    }
  }

  const onSecondaryChange = useCallback((next, appState) => {
    setSecondaryElements([...next]);
    if (secondaryTabId) {
      setTabs((prev) => prev.map((t) => t.id === secondaryTabId ? { ...t, elements: [...next] } : t));
    }
  }, [secondaryTabId]);

  function toggleDualMode() {
    if (!api) return;
    if (dualMode) {
      // Exiting dual mode: persist secondary board if open
      if (apiSecondary && secondaryTabId) {
        const secEls = apiSecondary.getSceneElements().filter((el) => !isOverlay(el));
        setTabs((prev) => prev.map((t) => t.id === secondaryTabId ? { ...t, elements: secEls } : t));
      }
      setDualMode(false);
      setFocusedBoard('primary');
      setNotice('Returned to single board view.');
      return;
    }

    // Entering dual mode: need at least 2 boards
    const currentEls = api.getSceneElements().filter((el) => !isOverlay(el));
    let updatedTabs = tabs.map((t) => t.id === activeTabId ? { ...t, elements: currentEls } : t);
    let chosenSecId = secondaryTabId;

    if (updatedTabs.length < 2) {
      const newId = `tab-${Date.now()}`;
      const newTitle = `Board ${updatedTabs.length + 1}`;
      updatedTabs = [...updatedTabs, { id: newId, title: newTitle, elements: [] }];
      chosenSecId = newId;
    } else if (!chosenSecId || chosenSecId === activeTabId || !updatedTabs.some((t) => t.id === chosenSecId)) {
      const other = updatedTabs.find((t) => t.id !== activeTabId);
      chosenSecId = other ? other.id : updatedTabs[0].id;
    }

    setTabs(updatedTabs);
    setSecondaryTabId(chosenSecId);
    setDualMode(true);
    setNotice('Dual board view enabled: Two boards side-by-side.');
  }

  function changeDualBoards(firstId, secondId) {
    if (firstId === secondId) return;
    if (firstId && firstId !== activeTabId) {
      switchTab(firstId);
    }
    if (secondId && secondId !== secondaryTabId) {
      if (apiSecondary && secondaryTabId) {
        const secEls = apiSecondary.getSceneElements().filter((el) => !isOverlay(el));
        setTabs((prev) => prev.map((t) => t.id === secondaryTabId ? { ...t, elements: secEls } : t));
      }
      const targetSec = tabs.find((t) => t.id === secondId);
      setSecondaryTabId(secondId);
      if (apiSecondary && targetSec) {
        apiSecondary.updateScene({ elements: targetSec.elements });
      }
    }
  }

  function switchTab(targetId) {
    if (targetId === activeTabId || !api) return;
    const currentEls = api.getSceneElements().filter((el) => !isOverlay(el));
    setTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, elements: currentEls } : t));
    const target = tabs.find((t) => t.id === targetId);
    if (target) {
      setActiveTabId(targetId);
      api.updateScene({ elements: target.elements });
      resetWork();
      setFrameId('');
      setNotice(`Switched to ${target.title}`);
      if (dualMode && targetId === secondaryTabId) {
        // Swap or choose other
        const other = tabs.find((t) => t.id !== targetId);
        if (other) {
          setSecondaryTabId(other.id);
          if (apiSecondary) apiSecondary.updateScene({ elements: other.elements });
        }
      }
    }
  }

  function addNewTab() {
    if (!api) return;
    const currentEls = api.getSceneElements().filter((el) => !isOverlay(el));
    const newId = `tab-${Date.now()}`;
    const newTitle = `Board ${tabs.length + 1}`;
    const updated = [...tabs.map((t) => t.id === activeTabId ? { ...t, elements: currentEls } : t), { id: newId, title: newTitle, elements: [] }];
    setTabs(updated);
    if (dualMode) {
      // In dual mode, new tab can be set as the secondary board
      setSecondaryTabId(newId);
      if (apiSecondary) apiSecondary.updateScene({ elements: [] });
      setNotice(`Opened ${newTitle} on right board`);
    } else {
      setActiveTabId(newId);
      api.updateScene({ elements: [] });
      resetWork();
      setFrameId('');
      setNotice(`Opened ${newTitle}`);
    }
  }

  function closeTab(e, closeId) {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== closeId);
    setTabs(remaining);
    if (activeTabId === closeId) {
      const nextTab = remaining[0];
      setActiveTabId(nextTab.id);
      api.updateScene({ elements: nextTab.elements });
      resetWork();
      setFrameId('');
    }
    if (secondaryTabId === closeId) {
      const other = remaining.find((t) => t.id !== (activeTabId === closeId ? remaining[0].id : activeTabId));
      if (other) {
        setSecondaryTabId(other.id);
        if (apiSecondary) apiSecondary.updateScene({ elements: other.elements });
      } else {
        setDualMode(false);
      }
    }
  }

  function closeTools() {
    setToolsOpen(false);
  }

  function chooseTool(type) {
    if (!activeApi) return;
    cancelRegion();
    activeApi.setActiveTool({ type, locked: toolLocked });
    setActiveToolState(type);
    if (type !== 'freedraw') setPen('');
  }

  function toggleLock() {
    const next = !toolLocked;
    setToolLocked(next);
    activeApi?.setActiveTool({ type: activeTool, locked: next });
  }

  function chooseWidth(width) {
    setStrokeWidth(width);
    activeApi?.updateScene({ appState: { currentItemStrokeWidth: width } });
  }

  function chooseColor(color) {
    selectPen(color === CODE_COLOR ? 'code' : color === INPUT_COLOR ? 'input' : 'custom', color);
  }

  function toggleTheme() {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('boardroom.theme', next); } catch { /* the toggle still works for this visit */ }
      return next;
    });
  }

  const runLabel = reading ? 'Reading handwriting…' : running ? phase === 'prepare' ? 'Preparing…' : language === 'python' ? 'Checking & running…' : 'Compiling & running…' : hasInk && !recognizedProgram ? codeReviewCurrent ? 'Scan & review input' : 'Read & review handwriting' : needsPrepared ? 'Prepare program' : 'Verify & run';
  const runDisabled = running || reading || !api || !frameId || !(hasInk && !recognizedProgram ? ocrHealth?.available : health?.available) || (needsPrepared && !ocrHealth?.available);

  function changeLanguage(next) {
    if (next === language || running || reading) return;
    setLanguage(next); setHealth(null); setConfirmedOcr(null); setSnippetDraft(null); setError('');
    setNotice(`${languageInfo(next).label} selected. Your writing is preserved; review any handwriting before running.`);
    if (api) clearOverlays(api);
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Boardroom home"><span className="brand-mark"><Icon name="board" size={23} /></span><span>boardroom<span className="brand-dot">.</span></span></a>
        <div className="board-tabs" role="tablist" aria-label="Whiteboard tabs">
          {tabs.map((t) => (
            <div key={t.id} className={`board-tab ${activeTabId === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)} role="tab" aria-selected={activeTabId === t.id}>
              <span>{t.title}</span>
              {tabs.length > 1 && (
                <button className="tab-close" aria-label={`Close ${t.title}`} onClick={(e) => closeTab(e, t.id)}>×</button>
              )}
            </div>
          ))}
          <button className="tab-new" aria-label="New whiteboard tab" onClick={addNewTab} title="Create new whiteboard tab"><Icon name="plus" size={14} /></button>
        </div>
        <button className={`quiet-button dual-board-toggle ${dualMode ? 'active' : ''}`}
          aria-label={dualMode ? 'Exit side-by-side view' : 'Display two boards side by side'}
          title={dualMode ? 'Exit side-by-side view' : 'Display two boards side by side'}
          onClick={toggleDualMode}
          disabled={!api || busy}>
          <Icon name="dual" size={16} />
          <span className="long">{dualMode ? 'Single board' : 'Side-by-side'}</span>
        </button>
        {dualMode && (
          <div className="dual-selectors" role="group" aria-label="Select dual boards">
            <select aria-label="Left board" value={activeTabId} onChange={(e) => changeDualBoards(e.target.value, secondaryTabId)}>
              {tabs.map((t) => <option key={`l-${t.id}`} value={t.id} disabled={t.id === secondaryTabId}>{t.title} (Left)</option>)}
            </select>
            <span className="dual-divider-icon" aria-hidden="true">|</span>
            <select aria-label="Right board" value={secondaryTabId} onChange={(e) => changeDualBoards(activeTabId, e.target.value)}>
              {tabs.map((t) => <option key={`r-${t.id}`} value={t.id} disabled={t.id === activeTabId}>{t.title} (Right)</option>)}
            </select>
          </div>
        )}
        <label className="lesson-select"><span>Lesson</span><select aria-label="Demo lesson" value={lessonId} disabled={busy || !api} onChange={(event) => chooseLesson(event.target.value)}>{!lessonId && <option value="">Blank canvas</option>}{lessons.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <button className="quiet-button blank-button" aria-label="+ Blank canvas" onClick={newBlankBoard} disabled={!api || busy}><span aria-hidden="true">+</span><span className="long" aria-hidden="true"> Blank canvas</span></button>
        <div className="header-actions">
          <span className={`connection ${health?.available ? 'online' : ''}`} title={health?.message ?? 'Checking runner'}><i />{health ? (health.available ? 'Runner ready' : 'Runner offline') : 'Connecting'}</span>
          <button className="icon-button" aria-label="Open board" title="Open board" onClick={() => upload.current.click()} disabled={!api || busy}><Icon name="upload" /></button>
          <button className="icon-button" aria-label="Download" title="Download board" onClick={download} disabled={!api}><Icon name="download" /></button>
          <button className="icon-button" aria-label="Save lesson snapshot" onClick={saveSnapshot}
            disabled={!api || !snapshotAvailable || !frameId || busy || savingSnapshot || !program.source.trim() || (hasInk && !recognizedProgram)}
            title={hasInk && !recognizedProgram ? 'Confirm the handwriting before saving.' : 'Save board, source, and input with local Git history.'}><Icon name="save" /></button>
          <button className="icon-button" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></button>
          <button className="icon-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title="Fullscreen" onClick={toggleFullscreen}><Icon name="expand" /></button>
          <input ref={upload} type="file" accept=".excalidraw,.json" hidden onChange={importBoard} />
        </div>
      </header>

      <main className={`stage${toolsOpen ? ' tools-open' : ''}`}>
        <WorkspaceLayout focused={!panelVisible} onResize={refreshCanvas}>
          <section className="board-pane" aria-label="Interactive lesson whiteboard">
            <div className={`canvas-container ${dualMode ? 'canvas-container--dual' : ''}`}>
              <div className={`board-frame-wrapper ${dualMode ? 'board-frame--half' : 'board-frame--full'} ${focusedBoard === 'primary' ? 'board-frame--focused' : ''}`}
                onClick={() => { if (dualMode && focusedBoard !== 'primary') setFocusedBoard('primary'); }}>
                {dualMode && (
                  <div className="dual-board-header">
                    <span className="dual-board-title">{tabs.find((t) => t.id === activeTabId)?.title || 'Board 1'} (Active Verification)</span>
                    <span className="dual-board-badge">Left</span>
                  </div>
                )}
                <div className="program-canvas">
                  <Excalidraw
                    initialData={{ elements: initial, appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 3, currentItemStrokeColor: CODE_COLOR }, scrollToContent: true }}
                    excalidrawAPI={setApi} onChange={onChange} theme={theme} name="Boardroom lesson"
                    UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: false, toggleTheme: false } }}
                  />
                  <ProgramRegions api={api} frames={frames} selectedId={frameId} />
                </div>
              </div>

              {dualMode && (
                <div className={`board-frame-wrapper board-frame--half ${focusedBoard === 'secondary' ? 'board-frame--focused' : ''}`}
                  onClick={() => { if (focusedBoard !== 'secondary') setFocusedBoard('secondary'); }}>
                  <div className="dual-board-header">
                    <span className="dual-board-title">{tabs.find((t) => t.id === secondaryTabId)?.title || 'Board 2'}</span>
                    <span className="dual-board-badge">Right</span>
                  </div>
                  <Excalidraw
                    initialData={{ elements: tabs.find((t) => t.id === secondaryTabId)?.elements || [], appState: { viewBackgroundColor: '#ffffff', currentItemFontFamily: 3, currentItemStrokeColor: CODE_COLOR }, scrollToContent: true }}
                    excalidrawAPI={setApiSecondary} onChange={onSecondaryChange} theme={theme} name="Boardroom secondary"
                    UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: false, toggleTheme: false } }}
                  />
                </div>
              )}

              {toolsOpen && <DrawToolbar activeTool={activeTool} locked={toolLocked} strokeWidth={strokeWidth} color={penColor}
                onTool={chooseTool} onLock={toggleLock} onStrokeWidth={chooseWidth} onColor={chooseColor} onClose={closeTools} />}
            </div>
            {(error || notice || (health && !health.available)) && <div className={`statusline${error ? ' error' : ''}`}>
              {error ? <span role="alert">{error}</span> : notice ? <span role="status">{notice}</span> : <span>{health.message}</span>}
              {(error || notice) ? <button className="icon-button" aria-label="Dismiss message" onClick={() => { setError(''); setNotice(''); }}>×</button> : <button className="link-button" onClick={checkHealth}>Check again</button>}
            </div>}
            <div className="toolstrip" role="toolbar" aria-label="Board tools">
              <div className="toolstrip-controls">
              <div className="tool-group" role="group" aria-label="Draw">
                <button className="tool" aria-label="Pen: code" aria-pressed={pen === 'code'} onClick={() => selectPen('code', CODE_COLOR)} disabled={!api || busy} title="Black ink is code"><i className="ink code-ink" /><span className="tool-label">Code</span></button>
                <button className="tool" aria-label="Pen: input" aria-pressed={pen === 'input'} onClick={() => selectPen('input', INPUT_COLOR)} disabled={!api || busy} title="Blue ink is program input"><i className="ink input-ink" /><span className="tool-label">Input</span></button>
              </div>
              <div className="tool-group" role="group" aria-label="Navigate & Zoom">
                <button className="tool icon-only" aria-label="Zoom in" onClick={() => zoomBoard(0.2)} disabled={!api} title="Zoom in"><Icon name="zoomIn" /></button>
                <button className="tool icon-only" aria-label="Zoom out" onClick={() => zoomBoard(-0.2)} disabled={!api} title="Zoom out"><Icon name="zoomOut" /></button>
                <button className="tool icon-only" aria-label="Fit content" onClick={resetZoom} disabled={!api} title="Fit to content"><Icon name="fit" /></button>
              </div>
              <div className="tool-group" role="group" aria-label="Select">
                <button className="tool" aria-label="Select code and input" aria-pressed={regionPending} onClick={regionPending ? cancelRegion : selectCodeRegion} disabled={!api || busy} title="Drag a box around the code and its input"><Icon name="region" /><span className="tool-label">{regionPending ? 'Drag a box…' : 'Region'}</span></button>
                <button className="tool" aria-label="Transcribe whole page" onClick={transcribeWholePage} disabled={!api || busy} title="Use everything written on the board"><Icon name="page" /><span className="tool-label">Whole page</span></button>
              </div>
              <fieldset className="language-toggle tool-group tool-language" disabled={busy}>
                <legend className="sr-only">LANGUAGE</legend>
                <div>{LANGUAGES.map((item) => <label key={item.id} className={language === item.id ? 'selected' : ''}>
                  <input type="radio" name="program-language" value={item.id} checked={language === item.id} onChange={() => changeLanguage(item.id)} />{item.label}
                </label>)}</div>
              </fieldset>
              <div className="tool-group tool-frame">
                <label className="sr-only" htmlFor="program-frame">PROGRAM FRAME</label>
                <select id="program-frame" className="frame-select" value={frameId} title={lesson?.description} disabled={busy} onChange={(event) => changeFrame(event.target.value)}>{!frames.length && <option value="">No region yet</option>}{frames.map((frame, index) => <option key={frame.id} value={frame.id} title={frame.name || undefined}>Selected program #{index + 1}</option>)}</select>
              </div>
              {language === 'c' && <div className="tool-group">
                <button className="tool" aria-label="Snippet mode" aria-pressed={snippetMode} onClick={toggleSnippet} disabled={busy}
                  title="Write only loose lines; the model adds includes, main and return, and you confirm the program before it runs"><Icon name="code" /><span className="tool-label">Snippet</span></button>
              </div>}
              </div>
              <div className="tool-group tool-run">
                <button className="run-button" onClick={() => run()} disabled={runDisabled}><span className={busy ? 'spinner' : ''}>{!busy && <Icon name="play" size={18} />}</span>{runLabel}{!busy && <span className="run-button-hint" aria-hidden="true">{languageLabel} →</span>}</button>
                <button className="tool" aria-label={panelVisible ? 'Hide panel' : 'Show panel'} aria-pressed={panelVisible} onClick={() => setPanelVisible((visible) => !visible)}><Icon name="panel" /><span className="tool-label">Code</span></button>
              </div>
            </div>
          </section>

          <aside className="inspector" aria-label="Code, verification controls and results" hidden={!panelVisible}>
            <div className="panel-head">
              <h2>Code &amp; results</h2>
              <button className="icon-button" aria-label="Close panel" title="Close panel" onClick={() => setPanelVisible(false)}>×</button>
            </div>
            {hasInk && <p className="handwriting-state">{recognizedProgram ? 'Handwriting reviewed. Ready to compile.' : 'Handwriting needs recognition and teacher confirmation.'}</p>}
            {health && !health.available && <div className="runner-notice"><span>{health.message}</span>{health.locked ? <OwnerKeyForm onSaved={checkHealth} /> : <button onClick={checkHealth}>Check again</button>}</div>}

            <section className="panel-code" aria-label="Code that runs">
              {automaticSnapshot && <p className="panel-help" role="status" aria-label="Automatic snapshot status">{automaticSnapshot}</p>}
              <div className="code-heading">
                <label className="field-label" htmlFor="source-editor">CODE THAT RUNS · {lineCount} LINES</label>
                <span className="code-badges">
                  {edited !== null && <button className="badge edited" onClick={() => setEdited(null)} title="Discard your edits and use the board's version">Edited by hand · reset</button>}
                </span>
              </div>
              {boardMovedOn && <p className="code-note">The board changed after your edits. Reset to pick up the board's version.</p>}
              {composed.drawing && <p className="code-note" role="status">Linked-list drawing: {composed.drawing}. Verify &amp; run builds real nodes using list_from_arrows; the drawing stays unchanged.</p>}
              <CodeEditor id="source-editor" ref={editorRef} value={runSource} onChange={editCode} diagnostics={shownDiagnostics} disabled={busy}
                placeholder={hasInk && !recognizedProgram ? 'Confirmed handwriting appears here. You can also type code directly.' : `Type ${languageLabel} here, or write it on the board.`} />
              <div className="code-heading input-heading"><label className="field-label" htmlFor="stdin-editor">STANDARD INPUT · BLUE INK</label>
                <button className="quiet-button" onClick={scanInput} disabled={busy || !api || !frameId || !inkChannels.stdin || !ocrHealth?.available}>Scan input</button>
              </div>
              <textarea id="stdin-editor" className="input-editor" value={program.stdin} spellCheck={false} readOnly={hasInk} placeholder="No input: the program receives EOF." disabled={busy || !frameId}
                onChange={(event) => { if (!hasInk) { replaceChannel(api, frameId, program.inputIds, event.target.value, INPUT_COLOR); } }} />
              <details className="frame-size"><summary>Frame size</summary>
                <FrameControls frame={selectedFrame} disabled={busy}
                  onResize={(width, height) => resizeProgramFrame(api, frameId, width, height)}
                  onFit={() => fitProgramFrame(api, frameId)} />
              </details>
            </section>

            <div className="result-tabs" role="tablist" aria-label="Run details">{[['output', 'Output'], ['handwriting', 'Handwriting'], ['cases', 'Cases'], ['library', 'Libraries'], ['history', 'History']].map(([id, label]) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => id === 'library' ? viewLibrary() : setTab(id)}>{label}</button>)}</div>

            <div className="result-body" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              <div hidden={tab !== 'handwriting'}><HandwritingPanel ref={ocrPanel}
                api={api} frameId={frameId} fingerprint={fingerprint} language={language}
                configuration={ocrHealth} hasInk={hasInk} confirmedOcr={confirmedOcr}
                onConfirmInput={(confirmed, stdin, saveCase) => {
                  if (saveCase) casesPanel.current.addInput(stdin);
                  if (confirmed) setConfirmedOcr(confirmed);
                  setResult(null); setTab(saveCase ? 'cases' : 'output');
                  setNotice(saveCase ? 'Scanned input saved as a test case. Use Run cases to execute it.' : 'Input updated. Use Verify & run to execute the code with this input.');
                }}
                busy={reading || running} onBusy={setReading} onInvalidate={() => setConfirmedOcr(null)}
                onConfirm={(confirmed) => {
                  setConfirmedOcr(confirmed); setResult(null); setTab('output');
                  setNotice('Transcription confirmed. Use the run button to verify it.');
                }}
              /></div>
              <div hidden={tab !== 'cases'}>{needsPrepared && <p className="panel-help">Prepare and confirm the program first. Cases then run that confirmed program until the code changes.</p>}<TestCases ref={casesPanel} key={language} program={caseProgram} signature={`${signature}:${caseProgram.source}`}
                captureScene={boardScene} onCompiled={(scene, submitted, data) => saveCompilationSnapshot(scene,
                  { source: submitted.source, stdin: submitted.stdin, language: submitted.language, level: 1, kind: 'case', result: data })}
                disabled={running || reading || !health?.available || !api || !frameId || !caseProgram.source.trim() || (hasInk && !recognizedProgram) || (needsPrepared && !currentDraft?.confirmed)} onBusy={setRunning} /></div>
              {tab === 'history' && !snapshotAvailable && <p className="panel-help">{snapshotMessage}</p>}
              {tab === 'history' && snapshotAvailable && <SnapshotHistory key={snapshotRevision} onOpen={(scene) => {
                const ink = restoreBoard(scene);
                setTab(ink ? 'handwriting' : 'output');
                setNotice(ink ? 'Saved board opened. Review its handwriting again before running. The confirmed source is also stored in the snapshot source file.' : 'Saved board opened. Run it to verify the saved code.');
              }} />}
              {tab === 'output' && <>
                <OutputPanel result={result} stale={stale} edited={edited} running={running} phase={phase}
                  language={language} languageLabel={languageLabel} focusDiagnostic={focusDiagnostic} />
                {currentDraft && <SnippetReview currentDraft={currentDraft} running={running} reading={reading} health={health}
                  confirmSnippet={confirmSnippet} setSnippetDraft={setSnippetDraft} />}
              </>}
              {tab === 'library' && <LibraryPanel library={library} libraryFile={libraryFile} libraryCatalog={libraryCatalog}
                standardLibraries={standardLibraries} librarySources={librarySources} viewLibrary={viewLibrary}
                disabled={running || reading || !api} loadExample={() => { chooseLesson(library.lessonId); setTab('output'); }} />}
            </div>
          </aside>
        </WorkspaceLayout>
      </main>
    </div>
  );
}

async function mount() {
  // Measure program text with its actual font; fallback metrics clip long lines.
  await document.fonts.load('18px Cascadia').catch(() => {});
  createRoot(document.getElementById('root')).render(<App />);
}
mount();
