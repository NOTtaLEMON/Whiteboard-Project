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

// ============================================================ 2. PROBLEM
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '02', 'THE PROBLEM');
  title(s, 'A whiteboard\ncan’t compile.', { w: 6, size: 40, h: 1.7 });
  T(s, 'Teachers explain C++ and Python at a board. To check an example, they leave the lesson for an IDE.', 0.6, 2.95, 5.6, 1.2, { fontSize: 18, color: MUTE, lineSpacingMultiple: 1.08 });
  T(s, 'Our premise, not a statistic.', 0.6, 4.3, 5, 0.3, { fontSize: 12, color: MUTE });
  panel(s, 6.9, 1.0, 5.83, 2.5, { strip: HAIR, label: 'today' });
  T(s, 'TODAY', 7.2, 1.35, 3, 0.3, { fontSize: 11, bold: true, color: MUTE, charSpacing: 3 });
  ['Write on the board', 'Switch to an IDE', 'Paste, run, switch back'].forEach((t, i) => {
    T(s, String(i + 1), 7.2, 1.85 + i * 0.52, 0.4, 0.4, { fontSize: 16, bold: true, color: MUTE, valign: 'middle' });
    T(s, t, 7.7, 1.85 + i * 0.52, 4.8, 0.4, { fontSize: 17, valign: 'middle' });
  });
  rect(s, 6.9, 3.8, 5.83, 2.8, BLUE, { tag: 'a1', label: 'after panel' });
  T(s, 'WITH BOARDROOM', 7.2, 4.15, 4, 0.3, { fontSize: 11, bold: true, color: YELLOW, charSpacing: 3, objectName: 'a1:after label' });
  T(s, 'Write.  Select.  Run.', 7.2, 4.7, 5.2, 0.8, { fontSize: 34, bold: true, color: WHITE, objectName: 'a1:after steps' });
  T(s, 'The answer appears on the board.', 7.2, 5.6, 5.2, 0.5, { fontSize: 16, color: 'E6EAFF', objectName: 'a1:after text' });
  footer(s, 2);
}

// ============================================================ 3. HOW IT WORKS
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '03', 'HOW IT WORKS');
  title(s, 'From ink to answer.', { w: 9, size: 36 });
  const steps = [['Write', 'Black ink is code, blue ink is input.'], ['Select', 'Drag a box around the program.'], ['Review', 'Gemini reads it. You confirm every line.'], ['Run', 'A fresh container compiles and runs it.'], ['See', 'Output and errors show up on the board.']];
  steps.forEach(([verb, desc], i) => {
    const x = 0.6 + i * 2.46;
    const accent = i === 2 ? CORAL : BLUE;
    T(s, String(i + 1).padStart(2, '0'), x, 2.15, 1.5, 0.5, { fontSize: 26, bold: true, color: accent });
    rect(s, x, 2.75, 2.24, 0.04, accent, { label: `step ${i + 1} rule` });
    T(s, verb, x, 2.95, 2.24, 0.5, { fontSize: 22, bold: true });
    T(s, desc, x, 3.5, 2.12, 1.1, { fontSize: 14, color: MUTE, lineSpacingMultiple: 1.05 });
  });
  rect(s, 0.6, 5.0, 12.13, 1.5, INK, { tag: 'a1', label: 'gate bg' });
  rect(s, 0.6, 5.0, 0.12, 1.5, CORAL, { tag: 'a1', label: 'gate bar' });
  T(s, 'The teacher stays in charge', 1.05, 5.28, 6, 0.4, { fontSize: 20, bold: true, color: PAPER, objectName: 'a1:gate head' });
  T(s, 'Nothing runs until the teacher has checked the code against the ink.', 1.05, 5.8, 8.6, 0.5, { fontSize: 16, color: 'B8BDD2', objectName: 'a1:gate text' });
  rect(s, 11.2, 5.4, 0.7, 0.7, PAPER, { tag: 'a1', label: 'gate box' });
  T(s, '✓', 11.2, 5.4, 0.7, 0.7, { fontSize: 30, bold: true, color: INK, align: 'center', valign: 'middle', objectName: 'a1:gate tick' });
  footer(s, 3);
}

// ============================================================ 4. THREE MODES
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '04', 'THREE MODES');
  title(s, 'One slider. Three ways to run.', { w: 11, size: 36 });
  const modes = [
    ['Full program', 'Compiles exactly what you wrote.', 'Gemini: never', BLUE],
    ['Snippet', 'Arranges loose lines under a template of headers. Never fixes code.', 'Gemini: arranges', YELLOW],
    ['Algorithm', 'Plain-language steps become a program, then it compiles.', 'Gemini: writes', CORAL],
  ];
  modes.forEach(([head, body, who, fill], i) => {
    const x = 0.6 + i * 4.1, tg = `a${i + 1}`;
    panel(s, x, 2.1, 3.93, 3.0, { strip: fill, tag: tg, label: `mode ${i + 1}` });
    T(s, who.toUpperCase(), x + 0.3, 2.5, 3.3, 0.3, { fontSize: 10, bold: true, color: MUTE, charSpacing: 3, objectName: `${tg}:who ${i + 1}` });
    T(s, head, x + 0.3, 2.95, 3.3, 0.6, { fontSize: 26, bold: true, objectName: `${tg}:mode ${i + 1} name` });
    T(s, body, x + 0.3, 3.7, 3.3, 1.2, { fontSize: 15, color: MUTE, lineSpacingMultiple: 1.08, objectName: `${tg}:mode ${i + 1} text` });
  });
  rect(s, 0.6, 5.5, 12.13, 1.0, ICE, { tag: 'a4', label: 'fix bg' });
  T(s, 'Ask Gemini to fix', 0.95, 5.5, 3.5, 1.0, { fontSize: 18, bold: true, valign: 'middle', objectName: 'a4:fix title' });
  T(s, 'Only after a failed run, and only if the teacher clicks it.', 4.6, 5.5, 7.8, 1.0, { fontSize: 16, valign: 'middle', objectName: 'a4:fix text' });
  footer(s, 4);
}

// ============================================================ 5. SAFE BY DESIGN
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '05', 'SAFE BY DESIGN');
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
  T(s, 'Every run gets a fresh container: no network, read-only root, 512 MiB, 64 processes.', 7.85, 6.0, 4.9, 0.7, { fontSize: 12, color: MUTE, lineSpacingMultiple: 1.05, objectName: 'a5:limits' });
  footer(s, 5);
}

// ============================================================ 6. PROOF AND NEXT
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '06', 'WHERE IT STANDS');
  title(s, 'Tested, honest about limits, and growing.', { w: 12, size: 34 });
  rect(s, 0.6, 2.0, 3.7, 4.5, BLUE, { label: 'proof bg' });
  T(s, '39/39', 0.9, 2.3, 3.2, 1.0, { fontSize: 52, bold: true, color: WHITE, valign: 'middle' });
  T(s, 'non-Gemini browser tests passed', 0.9, 3.35, 3.2, 0.7, { fontSize: 14, color: 'E6EAFF', lineSpacingMultiple: 1.05 });
  rect(s, 0.9, 4.25, 0.5, 0.03, YELLOW, { label: 'proof rule' });
  T(s, '55', 0.9, 4.45, 3.2, 1.0, { fontSize: 52, bold: true, color: WHITE, valign: 'middle' });
  T(s, 'compile and run probes, C++ and Python', 0.9, 5.5, 3.2, 0.6, { fontSize: 14, color: 'E6EAFF', lineSpacingMultiple: 1.05 });
  T(s, 'Our own runs, 18 Oct 2026', 0.9, 6.15, 3.2, 0.25, { fontSize: 10, color: 'B8C4FF' });
  T(s, 'KNOWN LIMITS', 4.75, 2.0, 3.5, 0.3, { fontSize: 11, bold: true, color: CORAL, charSpacing: 3, objectName: 'a1:limits label' });
  ['Hosted site runs code on Wandbox, not Docker.', 'C++17 only. C that is not valid C++ will not compile.', 'Handwriting accuracy not yet measured on real classrooms.'].forEach((g, i) => {
    const y = 2.5 + i * 1.3;
    rect(s, 4.75, y, 3.7, 0.01, HAIR, { tag: 'a1', label: `limit ${i + 1} rule` });
    T(s, g, 4.75, y + 0.15, 3.6, 1.0, { fontSize: 15, lineSpacingMultiple: 1.08, objectName: `a1:limit ${i + 1}` });
  });
  T(s, 'NEXT', 9.0, 2.0, 3.5, 0.3, { fontSize: 11, bold: true, color: BLUE, charSpacing: 3, objectName: 'a2:next label' });
  [['Measure', 'Benchmark handwriting accuracy.'], ['Harden', 'Separate execution VM and a security review.'], ['Pin', 'Freeze compiler versions in each snapshot.']].forEach(([h, b], i) => {
    const y = 2.5 + i * 1.3;
    rect(s, 9.0, y, 3.73, 0.01, HAIR, { tag: 'a2', label: `next ${i + 1} rule` });
    T(s, h, 9.0, y + 0.12, 3.6, 0.38, { fontSize: 18, bold: true, objectName: `a2:next ${i + 1} head` });
    T(s, b, 9.0, y + 0.55, 3.6, 0.6, { fontSize: 14, color: MUTE, lineSpacingMultiple: 1.05, objectName: `a2:next ${i + 1} text` });
  });
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
  const out = path.join(__dirname, '..', 'Boardroom-v3-raw.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
