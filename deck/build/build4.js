// Boardroom deck v3: 6 pitch slides + 2 methodology slides. Calm, sharp-cornered, two GIFs only.
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require(process.env.APPLY_THEME);

const INK = '0E1330', PAPER = 'F6F4EE', WHITE = 'FFFFFF', CORAL = 'FF5A4E', YELLOW = 'FFC531', BLUE = '3355FF', ICE = 'DCE4FF', MUTE = '5B6075', HAIR = 'D6D3C8', SKY = '8FA6FF', NAVY2 = '1A2048';
const FONT = 'Space Grotesk';
const THEME = { name: 'Boardroom', headFontFace: FONT, bodyFontFace: FONT,
  colors: { dk1: INK, lt1: WHITE, dk2: INK, lt2: PAPER, accent1: CORAL, accent2: YELLOW, accent3: BLUE, accent4: ICE, accent5: MUTE, accent6: PAPER, hlink: BLUE, folHlink: BLUE } };
const A = (f) => path.join(__dirname, '..', 'assets2', f);

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'Boardroom: the whiteboard that runs your code';
pres.author = 'Craft N Code Karnataka 2026 team';
pres.defineSlideMaster({ title: 'PAPER', background: { color: PAPER } });
pres.defineSlideMaster({ title: 'INK', background: { color: INK } });

const nm = (tag, label) => (tag ? `${tag}:${label}` : label);
function rect(s, x, y, w, h, fill, { line = null, lw = 1, tag = '', label = 'block' } = {}) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: lw } : { color: fill, width: 0 }, objectName: nm(tag, label) });
}
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 16, color: INK, margin: 0, valign: 'top', isTextBox: true }, o));
}
function arrow(s, x1, y1, x2, y2, label) {
  s.addShape(pres.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
    flipH: x2 < x1, flipV: y2 < y1, line: { color: INK, width: 1.75, endArrowType: 'triangle' }, objectName: label });
}
function gif(s, file, x, y, w, h, alt, fill, label) {
  rect(s, x + 0.14, y + 0.14, w, h, fill, { label: `${label} backdrop` });
  s.addImage({ path: A(file), x, y, w, h, altText: alt, objectName: label });
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { type: 'none' }, line: { color: INK, width: 1.25 }, objectName: `${label} frame` });
}
function eyebrow(s, num, text, dark = false) {
  rect(s, 0.6, 0.5, 0.14, 0.14, CORAL, { label: 'eyebrow mark' });
  T(s, `${num}   ${text}`, 0.86, 0.42, 8, 0.3, { fontSize: 11, bold: true, color: dark ? 'B8BDD2' : MUTE, charSpacing: 3, valign: 'middle' });
}
function footer(s, current, dark = false) {
  rect(s, 0.6, 6.98, 12.13, 0.01, dark ? '3A4066' : HAIR, { label: 'footer rule' });
  T(s, 'Boardroom  ·  Craft N Code Karnataka 2026', 0.6, 7.06, 6, 0.28, { fontSize: 10, color: dark ? '8F95AE' : MUTE, valign: 'middle' });
  for (let n = 1; n <= 8; n++) {
    const x = 12.73 - (9 - n) * 0.36, on = n === current;
    T(s, String(n), x, 7.07, 0.3, 0.26, { fontSize: 10, bold: true, align: 'center', valign: 'middle', color: on ? WHITE : (dark ? 'B8BDD2' : MUTE),
      fill: { color: on ? BLUE : (dark ? INK : PAPER) }, line: { color: on ? BLUE : (dark ? '3A4066' : HAIR), width: 1 },
      hyperlink: { slide: n, tooltip: `Go to slide ${n}` }, objectName: `nav ${n}` });
  }
}
function title(s, text, { w = 9, size = 36, y = 0.95, h = 0.9, color = INK } = {}) {
  T(s, text, 0.6, y, w, h, { fontSize: size, bold: true, color, lineSpacingMultiple: 0.92 });
}
function panel(s, x, y, w, h, { fill = WHITE, strip = null, tag = '', label = 'panel' } = {}) {
  rect(s, x, y, w, h, fill, { line: fill === WHITE ? HAIR : null, lw: 1, tag, label: `${label} body` });
  if (strip) rect(s, x, y, w, 0.08, strip, { tag, label: `${label} strip` });
}

// ============================================================ 1. COVER
{
  const s = pres.addSlide({ masterName: 'INK' });
  rect(s, 0, 0, 0.2, 7.5, CORAL, { label: 'edge' });
  T(s, 'CRAFT N CODE KARNATAKA 2026   ·   AI FOR EDUCATION', 0.9, 0.55, 8, 0.3, { fontSize: 11, bold: true, color: YELLOW, charSpacing: 3 });
  T(s, 'Boardroom', 0.9, 1.7, 7, 1.5, { fontSize: 80, bold: true, color: PAPER, charSpacing: -2, valign: 'middle', objectName: 'cover title' });
  T(s, 'The whiteboard that runs your code.', 0.9, 3.35, 6.6, 0.6, { fontSize: 26, color: PAPER, objectName: 'cover subtitle' });
  T(s, 'Write.  Select.  Run.', 0.9, 4.35, 6, 0.5, { fontSize: 18, bold: true, color: YELLOW, charSpacing: 2, objectName: 'a1:cover verbs' });
  gif(s, 'sim-run.gif', 7.7, 1.75, 5.0, 3.05, 'Animation: code is typed on a board, blue ink input 3 5 is added, Run is pressed and 3 + 5 = 8 appears.', BLUE, 'cover simulation');
  footer(s, 1, true);
}

// ============================================================ 2. PROBLEM (with comparison GIF)
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '02', 'THE PROBLEM');
  title(s, 'A whiteboard\ncan’t compile.', { w: 4.8, size: 38, h: 1.5 });
  T(s, 'Teachers explain C++ and Python at a board. To check an example, they leave the lesson for an IDE.', 0.6, 2.75, 4.5, 1.6, { fontSize: 17, color: MUTE, lineSpacingMultiple: 1.08 });
  T(s, 'Our premise, not a statistic.', 0.6, 4.6, 4.5, 0.3, { fontSize: 12, color: MUTE });
  gif(s, 'sim-compare.gif', 5.55, 1.5, 7.0, 3.65, 'Animation: the same lesson example checked two ways side by side. The old way takes five steps with two app switches. Boardroom takes three steps with none.', YELLOW, 'comparison simulation');
  T(s, 'Same example, two workflows.', 5.55, 5.5, 7.0, 0.3, { fontSize: 12, color: MUTE });
  footer(s, 2);
}

// ============================================================ 3. SYSTEM PIPELINE (dark)
{
  const s = pres.addSlide({ masterName: 'INK' });
  eyebrow(s, '03', 'SYSTEM PIPELINE', true);
  title(s, 'From ink to answer.', { w: 9, size: 36, color: PAPER });
  const cols = [
    ['01 / INPUT', 'Board capture', ['Write or type on the board', 'Select a region', 'Blue ink becomes input'], SKY],
    ['02 / RECOGNITION', 'Gemini reads', ['Handwriting becomes text', 'Typed code skips this step'], SKY],
    ['03 / VALIDATION', 'Teacher review', ['Compare the text to the ink', 'Tick to confirm', 'Nothing runs until then'], CORAL],
    ['04 / SANDBOX', 'Safe run', ['Fresh Docker container', 'No network, 5 second limit', 'Sanitizers switched on'], YELLOW],
    ['05 / FEEDBACK', 'Answer on the board', ['Output in the code panel', 'Errors marked on the line', 'Snapshot saved to Git'], SKY],
  ];
  cols.forEach(([tag, head, lines, strip], i) => {
    const x = 0.6 + i * 2.46, tg = `a${i + 1}`;
    rect(s, x, 2.05, 2.28, 3.7, NAVY2, { tag: tg, label: `col ${i + 1} body` });
    rect(s, x, 2.05, 2.28, 0.08, strip, { tag: tg, label: `col ${i + 1} strip` });
    T(s, tag, x + 0.2, 2.4, 1.95, 0.3, { fontSize: 10, bold: true, color: strip, charSpacing: 2, objectName: `${tg}:col ${i + 1} tag` });
    T(s, head, x + 0.2, 2.8, 1.95, 0.8, { fontSize: 20, bold: true, color: PAPER, lineSpacingMultiple: 0.95, objectName: `${tg}:col ${i + 1} head` });
    T(s, lines.join('\n'), x + 0.2, 3.75, 1.95, 1.9, { fontSize: 13, color: 'C9CDE0', lineSpacingMultiple: 1.2, paraSpaceAfter: 4, objectName: `${tg}:col ${i + 1} lines` });
  });
  T(s, 'Gemini reads the ink. The compiler decides whether it works.', 0.6, 6.15, 12, 0.5, { fontSize: 17, bold: true, color: YELLOW, objectName: 'a6:pipeline note' });
  footer(s, 3, true);
}

// ============================================================ 4. HEADLINE FEATURES
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '04', 'HEADLINE FEATURES');
  title(s, 'What teachers get.', { w: 9, size: 36 });
  const feats = [
    ['Write or type', 'Pen or keyboard on an Excalidraw board.', BLUE],
    ['Handwriting to code', 'Gemini reads the ink. The teacher confirms.', CORAL],
    ['Three run modes', 'Full program, Snippet or Algorithm.', YELLOW],
    ['A safe sandbox', 'Every run in a fresh container.', BLUE],
    ['Teaching headers', 'Stack, queue, linked list and search.', CORAL],
    ['Boards and snapshots', 'Compare two boards. Save every run to Git.', YELLOW],
  ];
  feats.forEach(([head, body, fill], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1, y = 2.0 + row * 2.3, tg = `a${row + 1}`;
    panel(s, x, y, 3.93, 2.05, { strip: fill, tag: tg, label: `feature ${i + 1}` });
    T(s, String(i + 1).padStart(2, '0'), x + 0.3, y + 0.35, 1, 0.3, { fontSize: 12, bold: true, color: fill === YELLOW ? MUTE : fill, charSpacing: 2, objectName: `${tg}:num ${i + 1}` });
    T(s, head, x + 0.3, y + 0.72, 3.4, 0.45, { fontSize: 21, bold: true, objectName: `${tg}:head ${i + 1}` });
    T(s, body, x + 0.3, y + 1.28, 3.4, 0.65, { fontSize: 14, color: MUTE, lineSpacingMultiple: 1.05, objectName: `${tg}:body ${i + 1}` });
  });
  footer(s, 4);
}

// ============================================================ 5. DUAL BOARDS
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '05', 'DUAL BOARDS');
  title(s, 'Two boards, side by side.', { w: 10, size: 36 });
  [['BOARD A', 'Code', 0.6, BLUE], ['BOARD B', 'Pointer diagram', 6.85, CORAL]].forEach(([tagt, what, x, c], i) => {
    panel(s, x, 1.95, 5.88, 2.35, { strip: c, tag: 'a1', label: `board ${i + 1}` });
    T(s, tagt, x + 0.3, 2.3, 3, 0.3, { fontSize: 11, bold: true, color: MUTE, charSpacing: 3, objectName: `a1:board ${i + 1} tag` });
    T(s, what, x + 0.3, 2.65, 5, 0.5, { fontSize: 22, bold: true, objectName: `a1:board ${i + 1} name` });
    [3.5, 3.8, 4.1].forEach((yy, k) => rect(s, x + 0.3, yy - 0.3 + 0.0, [4.2, 3.3, 3.8][k] * 0.95, 0.04, k === 1 ? c : HAIR, { tag: 'a1', label: `board ${i + 1} line ${k + 1}` }));
  });
  const left = ['Board tabs, plus a side-by-side view', 'Each board is independent', 'Switch back to one board any time'];
  const right = ['Iterative against recursive, live', 'Buggy code next to its fix', 'Data structure on one board, code on the other'];
  [['HOW IT WORKS', left, 0.6], ['IN THE CLASSROOM', right, 6.85]].forEach(([h, items, x], i) => {
    const tg = `a${i + 2}`;
    T(s, h, x, 4.65, 4, 0.3, { fontSize: 11, bold: true, color: i ? CORAL : BLUE, charSpacing: 3, objectName: `${tg}:col label` });
    s.addText(items.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < items.length - 1, paraSpaceAfter: 8 } })),
      { x, y: 5.05, w: 5.7, h: 1.6, fontFace: FONT, fontSize: 16, color: INK, margin: 0, valign: 'top', isTextBox: true, objectName: `${tg}:col list` });
  });
  footer(s, 5);
}

// ============================================================ 6. SAFE BY DESIGN
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '06', 'SAFE BY DESIGN');
  title(s, 'We tried to break it.', { w: 7, size: 36 });
  gif(s, 'sim-sandbox.gif', 0.6, 1.85, 6.6, 4.03, 'Animation: four hostile programs each run in a fresh container and are stopped: a sleep at five seconds, a flood of output cut at 16 KiB, a heap buffer overflow caught by AddressSanitizer, and a blocked network call.', YELLOW, 'sandbox simulation');
  T(s, 'Simulation of four of our real test runs.', 0.6, 6.2, 6.6, 0.3, { fontSize: 12, color: MUTE });
  const rows = [['sleep(10)', 'Stopped at 5 seconds', CORAL], ['100,000 lines of output', 'Cut at 16 KiB', YELLOW], ['Write past a buffer', 'Caught by AddressSanitizer', BLUE], ['Network call', 'Blocked', INK]];
  rows.forEach(([attack, result, fill], i) => {
    const y = 1.95 + i * 1.0, tg = `a${i + 1}`;
    rect(s, 7.85, y, 0.08, 0.8, fill, { tag: tg, label: `result ${i + 1} bar` });
    T(s, attack, 8.15, y, 4.5, 0.32, { fontSize: 13, color: MUTE, objectName: `${tg}:attack ${i + 1}` });
    T(s, result, 8.15, y + 0.34, 4.5, 0.46, { fontSize: 20, bold: true, objectName: `${tg}:result ${i + 1}` });
  });
  T(s, 'Fresh container every run: no network, read-only root, 512 MiB, 64 processes.\n55 probe programs in C++ and Python, our own test run, 18 Oct 2026.', 7.85, 5.95, 4.9, 0.8, { fontSize: 12, color: MUTE, lineSpacingMultiple: 1.1, objectName: 'a5:limits' });
  footer(s, 6);
}

// ============================================================ 7. ARCHITECTURE
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '07', 'METHODOLOGY  ·  SYSTEM ARCHITECTURE');
  title(s, 'Three parts, one request path.', { w: 11, size: 34 });
  const Y = 3.2, H = 1.9;
  rect(s, 5.05, 1.85, 3.2, 0.75, YELLOW, { label: 'gemini bg' });
  T(s, 'Gemini API', 5.05, 1.85, 3.2, 0.75, { fontSize: 18, bold: true, align: 'center', valign: 'middle' });
  arrow(s, 6.1, 2.6, 6.1, Y, 'gemini down');
  arrow(s, 7.2, Y, 7.2, 2.6, 'gemini up');
  T(s, 'ink, prompts', 3.4, 2.72, 2.55, 0.3, { fontSize: 11, color: MUTE, align: 'right' });
  T(s, 'text, code', 7.35, 2.72, 2.4, 0.3, { fontSize: 11, color: MUTE });
  panel(s, 0.6, Y, 3.2, H, { strip: BLUE, label: 'board' });
  T(s, 'Teacher’s board', 0.85, Y + 0.3, 2.8, 0.4, { fontSize: 19, bold: true });
  T(s, 'React + Excalidraw\nWrite, select, confirm', 0.85, Y + 0.85, 2.8, 0.9, { fontSize: 14, color: MUTE, lineSpacingMultiple: 1.1 });
  rect(s, 5.05, Y, 3.2, H, BLUE, { label: 'server bg' });
  T(s, 'Boardroom server', 5.3, Y + 0.3, 2.8, 0.4, { fontSize: 19, bold: true, color: WHITE });
  T(s, 'Node.js\nRoutes every request', 5.3, Y + 0.85, 2.8, 0.9, { fontSize: 14, color: 'E6EAFF', lineSpacingMultiple: 1.1 });
  rect(s, 9.5, Y, 3.23, H, INK, { label: 'sandbox bg' });
  T(s, 'Sandbox', 9.75, Y + 0.3, 2.8, 0.4, { fontSize: 19, bold: true, color: PAPER });
  T(s, 'Docker, run locally\nWandbox, when hosted', 9.75, Y + 0.85, 2.8, 0.9, { fontSize: 14, color: 'B8BDD2', lineSpacingMultiple: 1.1 });
  arrow(s, 3.8, Y + 0.65, 5.05, Y + 0.65, 'board to server');
  arrow(s, 5.05, Y + 1.35, 3.8, Y + 1.35, 'server to board');
  T(s, 'region, input', 3.8, Y + 0.3, 1.25, 0.3, { fontSize: 11, color: MUTE, align: 'center' });
  T(s, 'answer', 3.8, Y + 1.42, 1.25, 0.3, { fontSize: 11, color: MUTE, align: 'center' });
  arrow(s, 8.25, Y + 0.65, 9.5, Y + 0.65, 'server to sandbox');
  arrow(s, 9.5, Y + 1.35, 8.25, Y + 1.35, 'sandbox to server');
  T(s, 'code, stdin', 8.25, Y + 0.3, 1.25, 0.3, { fontSize: 11, color: MUTE, align: 'center' });
  T(s, 'output, errors', 8.25, Y + 1.42, 1.25, 0.3, { fontSize: 11, color: MUTE, align: 'center' });
  arrow(s, 6.65, Y + H, 6.65, 5.75, 'server to git');
  rect(s, 5.05, 5.75, 3.2, 0.7, ICE, { label: 'git bg' });
  T(s, 'Git snapshots', 5.05, 5.75, 3.2, 0.7, { fontSize: 16, bold: true, align: 'center', valign: 'middle' });
  T(s, 'The teacher confirms handwriting before any code reaches the sandbox.', 0.6, 5.75, 4.1, 0.9, { fontSize: 13, color: MUTE, lineSpacingMultiple: 1.1 });
  footer(s, 7);
}

// ============================================================ 8. TOOLS USED
{
  const s = pres.addSlide({ masterName: 'INK' });
  eyebrow(s, '08', 'METHODOLOGY  ·  TOOLS USED', true);
  title(s, 'Built with open tools and careful AI.', { w: 12, size: 34, color: PAPER });
  T(s, 'PRODUCT STACK', 0.6, 2.0, 4, 0.3, { fontSize: 11, bold: true, color: YELLOW, charSpacing: 3, objectName: 'a1:stack label' });
  ['React + Vite', 'Excalidraw', 'Node.js', 'Docker', 'g++ (C++17)', 'Python', 'Wandbox', 'Git'].forEach((t, i) => {
    const x = 0.6 + (i % 2) * 2.15, y = 2.5 + Math.floor(i / 2) * 0.95;
    rect(s, x, y, 2.0, 0.8, NAVY2, { tag: 'a1', label: `stack ${i + 1} bg` });
    T(s, t, x, y, 2.0, 0.8, { fontSize: 15, bold: true, color: PAPER, align: 'center', valign: 'middle', objectName: `a1:stack ${i + 1} text` });
  });
  T(s, 'AI IN THE PRODUCT', 5.4, 2.0, 3.5, 0.3, { fontSize: 11, bold: true, color: CORAL, charSpacing: 3, objectName: 'a2:ai label' });
  rect(s, 5.4, 2.5, 3.6, 3.65, NAVY2, { tag: 'a2', label: 'ai bg' });
  rect(s, 5.4, 2.5, 3.6, 0.08, CORAL, { tag: 'a2', label: 'ai strip' });
  T(s, 'Gemini API', 5.7, 2.85, 3.0, 0.4, { fontSize: 20, bold: true, color: PAPER, objectName: 'a2:ai head' });
  s.addText(['Reads handwriting', 'Arranges snippets', 'Writes from plain steps', 'Suggests fixes on request'].map((t, k, a) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < a.length - 1, paraSpaceAfter: 10 } })),
    { x: 5.7, y: 3.5, w: 3.0, h: 2.4, fontFace: FONT, fontSize: 15, color: 'D8DBE8', margin: 0, valign: 'top', isTextBox: true, objectName: 'a2:ai list' });
  T(s, 'BUILT WITH AI HELP', 9.4, 2.0, 3.4, 0.3, { fontSize: 11, bold: true, color: SKY, charSpacing: 3, objectName: 'a3:build label' });
  rect(s, 9.4, 2.5, 3.33, 3.65, NAVY2, { tag: 'a3', label: 'build bg' });
  rect(s, 9.4, 2.5, 3.33, 0.08, SKY, { tag: 'a3', label: 'build strip' });
  T(s, 'OpenAI Codex\nClaude Code', 9.7, 2.85, 2.8, 0.9, { fontSize: 20, bold: true, color: PAPER, lineSpacingMultiple: 1.05, objectName: 'a3:build head' });
  T(s, 'Used to write and test the code. Excalidraw is the open-source board we build on.', 9.7, 4.0, 2.8, 1.9, { fontSize: 14, color: 'D8DBE8', lineSpacingMultiple: 1.1, objectName: 'a3:build text' });
  footer(s, 8, true);
}

(async () => {
  const out = path.join(__dirname, '..', 'Boardroom-v4-raw.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
