// Boardroom submission deck v2: calm, sharp-cornered, poppy accents. 8 slides.
// Shapes named "a<click>:<label>" get an Appear entrance on that click (animate.py).
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require(process.env.APPLY_THEME);

const INK = '0E1330', PAPER = 'F6F4EE', WHITE = 'FFFFFF', CORAL = 'FF5A4E', YELLOW = 'FFC531', BLUE = '3355FF', ICE = 'C9D5FF', MUTE = '5B6075';
const FONT = 'Space Grotesk', MONO = 'Consolas';
const THEME = {
  name: 'Boardroom', headFontFace: FONT, bodyFontFace: FONT,
  colors: { dk1: INK, lt1: WHITE, dk2: INK, lt2: PAPER, accent1: CORAL, accent2: YELLOW, accent3: BLUE, accent4: ICE, accent5: MUTE, accent6: PAPER, hlink: BLUE, folHlink: BLUE },
};
const A = (f) => path.join(__dirname, '..', 'assets2', f);

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'Boardroom: the whiteboard that runs your code';
pres.author = 'Craft N Code Karnataka 2026 team';
pres.defineSlideMaster({ title: 'PAPER', background: { color: PAPER } });
pres.defineSlideMaster({ title: 'INK', background: { color: INK } });

const nm = (tag, label) => (tag ? `${tag}:${label}` : label);
function rect(s, x, y, w, h, fill, { line = null, lw = 1.5, tag = '', label = 'block' } = {}) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: lw } : { color: fill, width: 0 }, objectName: nm(tag, label) });
}
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 16, bold: false, color: INK, margin: 0, valign: 'top', isTextBox: true }, o));
}
// Flat tag: solid coloured rectangle with short caps text.
function tag_(s, text, x, y, w, h, fill, { color = INK, size = 11, tag = '', label = 'tag' } = {}) {
  rect(s, x, y, w, h, fill, { tag, label: `${label} bg` });
  T(s, text, x, y, w, h, { fontSize: size, bold: true, color, align: 'center', valign: 'middle', charSpacing: 2, objectName: nm(tag, `${label} text`) });
}
// A GIF with a flat offset colour block behind it and a thin ink frame.
function gif(s, file, x, y, w, h, alt, fill, label) {
  rect(s, x + 0.16, y + 0.16, w, h, fill, { label: `${label} backdrop` });
  s.addImage({ path: A(file), x, y, w, h, altText: alt, objectName: label });
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { type: 'none' }, line: { color: INK, width: 1.5 }, objectName: `${label} frame` });
}
function eyebrow(s, num, text, dark = false) {
  rect(s, 0.6, 0.5, 0.16, 0.16, CORAL, { label: 'eyebrow mark' });
  T(s, `${num}   ${text}`, 0.88, 0.42, 6, 0.32, { fontSize: 12, bold: true, color: dark ? PAPER : INK, charSpacing: 3, valign: 'middle' });
}
function footer(s, current, dark = false) {
  rect(s, 0.6, 6.98, 12.13, 0.012, dark ? MUTE : INK, { label: 'footer rule' });
  T(s, 'Boardroom  ·  Craft N Code Karnataka 2026', 0.6, 7.06, 6, 0.28, { fontSize: 10, color: dark ? PAPER : MUTE, valign: 'middle' });
  for (let n = 1; n <= 8; n++) {
    const x = 12.73 - (9 - n) * 0.36;
    const on = n === current;
    T(s, String(n), x, 7.07, 0.3, 0.26, {
      fontSize: 10, bold: true, align: 'center', valign: 'middle', color: on ? WHITE : (dark ? PAPER : INK),
      fill: { color: on ? CORAL : (dark ? INK : PAPER) }, line: { color: dark ? PAPER : INK, width: 1 },
      hyperlink: { slide: n, tooltip: `Go to slide ${n}` }, objectName: `nav ${n}`,
    });
  }
}
function title(s, text, { w = 8.6, size = 36, y = 0.95, h = 1.3, color = INK } = {}) {
  T(s, text, 0.6, y, w, h, { fontSize: size, bold: true, color, lineSpacingMultiple: 0.92 });
}
// Content card: coloured top strip, white body, thin ink border.
function card(s, x, y, w, h, accent, head, body, { tag = '', label = 'card', num = '', headSize = 17, bodySize = 14, dark = false } = {}) {
  rect(s, x, y, w, h, dark ? '1A2048' : WHITE, { line: dark ? null : INK, lw: 1.25, tag, label: `${label} body` });
  rect(s, x, y, w, 0.12, accent, { tag, label: `${label} strip` });
  if (num) T(s, num, x + 0.22, y + 0.28, 1, 0.3, { fontSize: 12, bold: true, color: dark ? YELLOW : BLUE, charSpacing: 2, objectName: nm(tag, `${label} num`) });
  const hy = y + (num ? 0.58 : 0.3);
  T(s, head, x + 0.22, hy, w - 0.44, 0.42, { fontSize: headSize, bold: true, color: dark ? PAPER : INK, objectName: nm(tag, `${label} head`) });
  T(s, body, x + 0.22, hy + 0.5, w - 0.44, h - (hy - y) - 0.62, { fontSize: bodySize, color: dark ? 'D8DBE8' : MUTE, lineSpacingMultiple: 1.0, objectName: nm(tag, `${label} text`) });
}

// ================================================================ 1. COVER
{
  const s = pres.addSlide({ masterName: 'INK' });
  rect(s, 0, 0, 0.28, 7.5, CORAL, { label: 'edge coral' });
  T(s, 'CRAFT N CODE KARNATAKA 2026   ·   AI FOR EDUCATION', 0.9, 0.55, 8, 0.3, { fontSize: 12, bold: true, color: YELLOW, charSpacing: 3 });
  T(s, 'Boardroom', 0.9, 1.5, 7, 1.5, { fontSize: 80, bold: true, color: PAPER, charSpacing: -2, valign: 'middle', objectName: 'cover title' });
  T(s, 'The whiteboard that runs your code.', 0.9, 3.1, 6.6, 1.1, { fontSize: 28, color: PAPER, lineSpacingMultiple: 1.0, objectName: 'cover subtitle' });
  T(s, 'Write C++ or Python on a board. Select it. Run it.\nThe lesson never leaves the board.', 0.9, 4.25, 6.2, 0.9, { fontSize: 16, color: 'B8BDD2', lineSpacingMultiple: 1.05 });
  tag_(s, 'WRITE', 0.9, 5.45, 1.5, 0.46, CORAL, { size: 12, tag: 'a1', label: 'verb 1' });
  tag_(s, 'SELECT', 2.5, 5.45, 1.5, 0.46, YELLOW, { size: 12, tag: 'a1', label: 'verb 2' });
  tag_(s, 'RUN', 4.1, 5.45, 1.5, 0.46, BLUE, { color: WHITE, size: 12, tag: 'a1', label: 'verb 3' });
  T(s, 'React · Excalidraw · Node.js · Docker · g++ (C++17) · Python · Gemini', 0.9, 6.45, 7.6, 0.3, { fontSize: 11, fontFace: MONO, color: '8F95AE', valign: 'middle' });
  gif(s, 'sim-run.gif', 7.7, 1.55, 5.0, 3.05, 'Animation: code is typed on a board, blue ink input 3 5 is added, Run is pressed and 3 + 5 = 8 appears.', BLUE, 'cover simulation');
  tag_(s, 'LIVE LOOP', 7.7, 1.15, 1.5, 0.32, YELLOW, { size: 10, label: 'loop tag' });
  T(s, 'Simulation of one lesson run. Click to reveal the three steps.', 7.7, 5.0, 5.0, 0.5, { fontSize: 12, color: '8F95AE', lineSpacingMultiple: 1.0 });
  footer(s, 1, true);
}

// ================================================================ 2. PROBLEM
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '02', 'THE PROBLEM');
  title(s, 'A whiteboard can’t compile.', { w: 7.2, size: 40, h: 1.5 });
  T(s, 'Teachers explain C++ and Python at a board. Checking an example means leaving the lesson for a separate IDE, and the board never shows what actually happened.', 0.6, 2.35, 5.7, 1.7, { fontSize: 17, color: MUTE, lineSpacingMultiple: 1.05 });
  tag_(s, 'USER: TEACHERS AT A BOARD', 0.6, 4.35, 3.4, 0.38, ICE, { size: 10, label: 'user tag' });
  tag_(s, 'OUR PREMISE, NOT A STATISTIC', 4.1, 4.35, 3.0, 0.38, YELLOW, { size: 10, label: 'premise tag' });
  // before / after
  rect(s, 7.6, 0.95, 5.13, 2.6, WHITE, { line: INK, lw: 1.25, label: 'today panel' });
  rect(s, 7.6, 0.95, 5.13, 0.12, MUTE, { label: 'today strip' });
  T(s, 'TODAY', 7.85, 1.3, 3, 0.3, { fontSize: 12, bold: true, color: MUTE, charSpacing: 3 });
  const today = ['Write on the board', 'Switch to an IDE', 'Paste, run, switch back'];
  today.forEach((t, i) => {
    rect(s, 7.85, 1.8 + i * 0.55, 0.36, 0.36, PAPER, { line: INK, lw: 1, label: `today num ${i + 1}` });
    T(s, String(i + 1), 7.85, 1.8 + i * 0.55, 0.36, 0.36, { fontSize: 13, bold: true, align: 'center', valign: 'middle' });
    T(s, t, 8.4, 1.8 + i * 0.55, 4.1, 0.36, { fontSize: 16, valign: 'middle' });
  });
  rect(s, 7.6, 3.85, 5.13, 2.75, BLUE, { tag: 'a1', label: 'after panel' });
  T(s, 'WITH BOARDROOM', 7.85, 4.15, 4, 0.3, { fontSize: 12, bold: true, color: YELLOW, charSpacing: 3, objectName: 'a1:after label' });
  T(s, 'Write.  Select.  Run.', 7.85, 4.6, 4.7, 0.7, { fontSize: 32, bold: true, color: WHITE, objectName: 'a1:after steps' });
  T(s, 'Errors are underlined in the code. The board stays clean and the lesson keeps moving.', 7.85, 5.4, 4.6, 1.0, { fontSize: 15, color: 'E6EAFF', lineSpacingMultiple: 1.05, objectName: 'a1:after text' });
  rect(s, 12.2, 3.55, 0.5, 0.5, YELLOW, { tag: 'a1', label: 'after marker' });
  rect(s, 0.6, 5.35, 6.5, 1.25, ICE, { label: 'why panel' });
  T(s, 'Why it matters', 0.85, 5.5, 3, 0.3, { fontSize: 12, bold: true, charSpacing: 2 });
  T(s, 'Students see the example run, or fail, right where it was written.', 0.85, 5.85, 6.0, 0.65, { fontSize: 16, lineSpacingMultiple: 1.0 });
  footer(s, 2);
}

// ================================================================ 3. HOW IT WORKS
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '03', 'HOW IT WORKS');
  title(s, 'Five steps from ink to answer.', { w: 12, size: 36, h: 0.75 });
  const steps = [
    ['Write', 'Pen or keyboard. Black ink is code, blue ink is input.', CORAL],
    ['Select', 'Drag a box. That region becomes the program.', YELLOW],
    ['Review', 'Gemini reads the ink. The teacher confirms every line.', BLUE],
    ['Run', 'A throwaway Docker container compiles and runs it.', CORAL],
    ['See', 'Output and errors appear in the code panel.', YELLOW],
  ];
  steps.forEach(([verb, desc, fill], i) => {
    const y = 1.85 + i * 0.99, tg = `a${i + 1}`;
    rect(s, 0.6, y, 0.82, 0.82, fill, { tag: tg, label: `step ${i + 1} badge` });
    T(s, String(i + 1), 0.6, y, 0.82, 0.82, { fontSize: 30, bold: true, color: fill === BLUE ? WHITE : INK, align: 'center', valign: 'middle', objectName: `${tg}:step ${i + 1} number` });
    rect(s, 1.42, y, 5.75, 0.82, WHITE, { line: INK, lw: 1.25, tag: tg, label: `step ${i + 1} panel` });
    T(s, verb, 1.62, y, 1.3, 0.82, { fontSize: 19, bold: true, valign: 'middle', objectName: `${tg}:step ${i + 1} verb` });
    T(s, desc, 2.95, y, 4.1, 0.82, { fontSize: 14, color: MUTE, valign: 'middle', lineSpacingMultiple: 0.98, objectName: `${tg}:step ${i + 1} text` });
  });
  gif(s, 'sim-review.gif', 7.6, 1.85, 5.0, 3.05, 'Animation: scribbled handwriting is read into code, one line is flagged CHECK, the teacher ticks a confirmation box and only then can the code run.', YELLOW, 'review simulation');
  tag_(s, 'STEP 3, SIMULATED', 7.6, 1.45, 1.9, 0.32, BLUE, { color: WHITE, size: 10, label: 'sim tag' });
  rect(s, 7.6, 5.4, 5.2, 1.3, WHITE, { line: INK, lw: 1.25, tag: 'a5', label: 'error panel' });
  T(s, '  int x = 1\n  printf("%d", x);', 7.8, 5.52, 2.6, 0.7, { fontSize: 14, fontFace: MONO, lineSpacing: 22, objectName: 'a5:error code' });
  rect(s, 7.98, 5.76, 1.1, 0.04, CORAL, { tag: 'a5', label: 'squiggle' });
  tag_(s, 'L1 · EXPECTED ‘;’', 10.5, 5.62, 2.1, 0.34, CORAL, { size: 10, tag: 'a5', label: 'diag tag' });
  T(s, 'Error marked on the line, not on the board.', 10.5, 6.02, 2.2, 0.6, { fontSize: 11, color: MUTE, lineSpacingMultiple: 1.0, objectName: 'a5:diag note' });
  footer(s, 3);
}

// ================================================================ 4. THREE MODES
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '04', 'THREE MODES');
  title(s, 'One slider, three ways to run.', { w: 7.4, size: 36, h: 1.3 });
  rect(s, 0.6, 2.4, 6.9, 0.14, INK, { label: 'slider track' });
  rect(s, 0.6, 2.4, 2.9, 0.14, CORAL, { label: 'slider fill' });
  rect(s, 3.3, 2.28, 0.38, 0.38, YELLOW, { line: INK, lw: 1.5, label: 'slider knob' });
  [['Full program', 0.6], ['Snippet', 3.1], ['Algorithm', 5.9]].forEach(([t, x]) => T(s, t, x, 2.78, 1.9, 0.3, { fontSize: 12, bold: true, color: MUTE }));
  const modes = [
    ['Full program', 'Compiles exactly what you wrote. No corrections.', 'GEMINI: NEVER', CORAL],
    ['Snippet', 'Pick a template of headers. Gemini only arranges helpers and main(). It never fixes code.', 'GEMINI: ARRANGES', YELLOW],
    ['Algorithm', 'Write the steps in plain words. Gemini writes the program, then it compiles.', 'GEMINI: WRITES', BLUE],
  ];
  modes.forEach(([head, body, who, fill], i) => {
    const y = 3.3 + i * 1.17, tg = `a${i + 1}`;
    rect(s, 0.6, y, 6.9, 1.02, WHITE, { line: INK, lw: 1.25, tag: tg, label: `mode ${i + 1} body` });
    rect(s, 0.6, y, 0.14, 1.02, fill, { tag: tg, label: `mode ${i + 1} bar` });
    T(s, head, 0.95, y + 0.1, 3, 0.35, { fontSize: 17, bold: true, objectName: `${tg}:mode ${i + 1} name` });
    tag_(s, who, 4.95, y + 0.12, 2.35, 0.3, INK, { color: PAPER, size: 9, tag: tg, label: `mode ${i + 1} who` });
    T(s, body, 0.95, y + 0.5, 6.4, 0.5, { fontSize: 13, color: MUTE, lineSpacingMultiple: 0.98, objectName: `${tg}:mode ${i + 1} text` });
  });
  gif(s, 'sim-snippet.gif', 8.05, 1.35, 4.55, 2.78, 'Animation: loose statements and a helper function are placed under a template, main() is added around the statement, and a checker confirms nothing else changed.', CORAL, 'snippet simulation');
  tag_(s, 'SNIPPET MODE, SIMULATED', 8.05, 0.95, 2.6, 0.32, BLUE, { color: WHITE, size: 10, label: 'sim tag' });
  rect(s, 8.05, 4.65, 4.7, 1.95, INK, { tag: 'a4', label: 'fix panel' });
  rect(s, 8.05, 4.65, 4.7, 0.12, YELLOW, { tag: 'a4', label: 'fix strip' });
  T(s, 'Optional: ask Gemini to fix', 8.3, 4.95, 4.3, 0.4, { fontSize: 17, bold: true, color: PAPER, objectName: 'a4:fix title' });
  T(s, 'Appears only after a failed run, in any mode. The teacher clicks it. No click, no API call.', 8.3, 5.5, 4.2, 1.0, { fontSize: 14, color: 'D8DBE8', lineSpacingMultiple: 1.02, objectName: 'a4:fix text' });
  footer(s, 4);
}

// ================================================================ 5. SAFE BY DESIGN
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '05', 'SAFE BY DESIGN');
  title(s, 'We tried to break it.', { w: 6.5, size: 36, h: 0.8 });
  gif(s, 'sim-sandbox.gif', 0.6, 1.75, 6.6, 4.03, 'Animation: four hostile programs each run in a fresh container and are stopped: a sleep at five seconds, a flood of output cut at 16 KiB, a heap buffer overflow caught by AddressSanitizer, and a blocked network call.', YELLOW, 'sandbox simulation');
  tag_(s, 'SIMULATION OF 4 REAL TEST RUNS', 0.6, 6.2, 3.3, 0.36, BLUE, { color: WHITE, size: 10, label: 'sim tag' });
  tag_(s, 'LOCAL: DOCKER   ·   HOSTED: WANDBOX', 4.05, 6.2, 3.2, 0.36, ICE, { size: 9, label: 'scope tag' });
  const rows = [
    ['sleep(10)', 'Stopped at 5 seconds', CORAL],
    ['100,000 lines of output', 'Cut at 16 KiB', YELLOW],
    ['Write past a buffer', 'AddressSanitizer catches it', BLUE],
    ['Network call', 'Blocked', INK],
  ];
  rows.forEach(([attack, result, fill], i) => {
    const y = 1.0 + i * 0.95, tg = `a${i + 1}`;
    rect(s, 7.85, y, 4.88, 0.8, WHITE, { line: INK, lw: 1.25, tag: tg, label: `result ${i + 1} body` });
    rect(s, 7.85, y, 0.14, 0.8, fill, { tag: tg, label: `result ${i + 1} bar` });
    T(s, attack, 8.2, y, 2.1, 0.8, { fontSize: 13, color: MUTE, valign: 'middle', lineSpacingMultiple: 0.98, objectName: `${tg}:attack ${i + 1}` });
    T(s, result, 10.35, y, 2.3, 0.8, { fontSize: 14, bold: true, valign: 'middle', lineSpacingMultiple: 0.98, objectName: `${tg}:result ${i + 1}` });
  });
  rect(s, 7.85, 4.95, 4.88, 1.65, BLUE, { tag: 'a5', label: 'stat panel' });
  T(s, '55', 8.1, 5.05, 1.7, 1.45, { fontSize: 64, bold: true, color: WHITE, valign: 'middle', objectName: 'a5:stat number' });
  T(s, 'compile and run probes, C++ and Python', 9.85, 5.15, 2.75, 0.8, { fontSize: 14, bold: true, color: WHITE, valign: 'middle', lineSpacingMultiple: 0.98, objectName: 'a5:stat text' });
  T(s, 'Source: our own test run, 18 Oct 2026', 9.85, 6.05, 2.75, 0.4, { fontSize: 10, color: 'E6EAFF', valign: 'middle', objectName: 'a5:stat source' });
  footer(s, 5);
}

// ================================================================ 6. AI, USED CAREFULLY
{
  const s = pres.addSlide({ masterName: 'INK' });
  eyebrow(s, '06', 'DATA AND AI USED', true);
  s.addText([
    { text: 'AI reads. ', options: { color: YELLOW } },
    { text: 'The compiler decides.', options: { color: PAPER } },
  ], { x: 0.6, y: 0.95, w: 12.1, h: 0.8, fontFace: FONT, fontSize: 36, bold: true, margin: 0, valign: 'top', isTextBox: true, objectName: 'slide title' });
  const cols = [
    ['WHERE GEMINI RUNS', YELLOW, ['Reads handwriting and blue-ink input', 'Algorithm mode: steps become a program', 'Snippet mode: arranges structure only', 'Fix button: only when the teacher clicks']],
    ['GUARDRAILS', CORAL, ['Teacher confirms every line before it runs', 'A structure result that changes more than layout is refused', 'API keys stay on the server', 'Requests ask Gemini not to store them']],
    ['NO AI HERE', BLUE, ['Compiling, running, error lines', 'Typed code in Full program mode', 'Teaching notes: fixed rules, not generated']],
  ];
  cols.forEach(([head, fill, items], i) => {
    const x = 0.6 + i * 4.1, y = 2.0, w = 3.93, h = 3.3, tg = `a${i + 1}`;
    rect(s, x, y, w, h, '1A2048', { tag: tg, label: `col ${i + 1} body` });
    rect(s, x, y, w, 0.12, fill, { tag: tg, label: `col ${i + 1} strip` });
    T(s, head, x + 0.25, y + 0.38, w - 0.5, 0.35, { fontSize: 13, bold: true, color: fill, charSpacing: 3, objectName: `${tg}:col ${i + 1} head` });
    s.addText(items.map((t, k) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: k < items.length - 1, paraSpaceAfter: 9 } })),
      { x: x + 0.25, y: y + 0.9, w: w - 0.5, h: h - 1.1, fontFace: FONT, fontSize: 14, color: PAPER, margin: 0, valign: 'top', isTextBox: true, objectName: `${tg}:col ${i + 1} list` });
  });
  T(s, 'BUILT WITH', 0.6, 5.62, 1.4, 0.34, { fontSize: 11, bold: true, color: YELLOW, charSpacing: 3, valign: 'middle', objectName: 'a4:built label' });
  ['Gemini API', 'Excalidraw', 'React + Vite', 'Node.js', 'Docker', 'g++ + Python', 'Wandbox'].forEach((t, i) => {
    const x = 2.05 + i * 1.54;
    rect(s, x, 5.62, 1.44, 0.34, INK, { line: MUTE, lw: 1, tag: 'a4', label: `stack ${i + 1} bg` });
    T(s, t, x, 5.62, 1.44, 0.34, { fontSize: 10, bold: true, color: PAPER, align: 'center', valign: 'middle', objectName: `a4:stack ${i + 1} text` });
  });
  T(s, 'AI tools and reuse: developed with OpenAI Codex and Claude Code.  Not yet measured: handwriting accuracy on real classroom samples.', 0.6, 6.2, 12.1, 0.55, { fontSize: 12, color: 'B8BDD2', valign: 'middle', lineSpacingMultiple: 1.0, objectName: 'a4:disclosure' });
  footer(s, 6, true);
}

// ================================================================ 7. FEATURES
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '07', 'WHAT ELSE IT DOES');
  title(s, 'Everything a lesson needs.', { w: 12, size: 36, h: 0.8 });
  const cards = [
    ['Snapshots', 'Every run is saved with the whole board, in Git history.', CORAL],
    ['Input cases', 'Run up to five inputs. Compare output exactly. Save suites.', YELLOW],
    ['Teaching headers', 'Stack, queue, linked list and binary search, plus C++ STL examples.', BLUE],
    ['Draw a list', 'Draw or type 1->3->4->5 and Boardroom builds real linked-list nodes.', YELLOW],
    ['Two boards', 'Board tabs, and a side-by-side view for comparing two boards.', BLUE],
    ['Teacher tools', 'Pen, eraser, shapes, laser pointer, five stroke widths and dark mode.', CORAL],
  ];
  cards.forEach(([head, body, fill], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1, y = 1.95 + row * 2.3, tg = `a${row + 1}`;
    card(s, x, y, 3.93, 2.05, fill, head, body, { tag: tg, label: `feature ${i + 1}`, num: String(i + 1).padStart(2, '0') });
  });
  rect(s, 0.6, 6.5, 6.8, 0.36, ICE, { tag: 'a3', label: 'evidence bg' });
  T(s, '39 of 39 non-Gemini browser tests passed  ·  18 Oct 2026', 0.6, 6.5, 6.8, 0.36, { fontSize: 11, bold: true, align: 'center', valign: 'middle', objectName: 'a3:evidence text' });
  footer(s, 7);
}

// ================================================================ 8. LIMITS AND NEXT
{
  const s = pres.addSlide({ masterName: 'PAPER' });
  eyebrow(s, '08', 'LIMITS AND NEXT');
  title(s, 'Where it stands, and what comes next.', { w: 12, size: 34, h: 0.8 });
  rect(s, 0.6, 1.9, 3.75, 2.2, BLUE, { tag: 'a1', label: 'stat 1 bg' });
  T(s, '39/39', 0.85, 2.0, 3.3, 1.2, { fontSize: 54, bold: true, color: WHITE, valign: 'middle', objectName: 'a1:stat 1 number' });
  T(s, 'non-Gemini browser tests passed, 18 Oct 2026', 0.85, 3.2, 3.3, 0.8, { fontSize: 14, bold: true, color: WHITE, lineSpacingMultiple: 1.0, objectName: 'a1:stat 1 text' });
  rect(s, 0.6, 4.4, 3.75, 2.2, YELLOW, { tag: 'a1', label: 'stat 2 bg' });
  T(s, '55', 0.85, 4.5, 3.3, 1.2, { fontSize: 54, bold: true, valign: 'middle', objectName: 'a1:stat 2 number' });
  T(s, 'compile and run probes in our sandbox test, C++ and Python', 0.85, 5.7, 3.3, 0.8, { fontSize: 14, bold: true, lineSpacingMultiple: 1.0, objectName: 'a1:stat 2 text' });
  // known gaps
  T(s, 'KNOWN GAPS', 4.75, 1.9, 3, 0.3, { fontSize: 12, bold: true, color: CORAL, charSpacing: 3, objectName: 'a2:gaps label' });
  const gaps = [
    'Hosted site runs code on Wandbox: rate limited, no sanitizer promise.',
    'Language is C++17. C that is not valid C++ will not compile.',
    'Gemini features are not covered by the automated tests above.',
    'Handwriting accuracy is not yet measured on real classroom samples.',
  ];
  gaps.forEach((g, i) => {
    const y = 2.3 + i * 1.07;
    rect(s, 4.75, y, 3.9, 0.95, WHITE, { line: INK, lw: 1.25, tag: 'a2', label: `gap ${i + 1} body` });
    rect(s, 4.75, y, 0.12, 0.95, CORAL, { tag: 'a2', label: `gap ${i + 1} bar` });
    T(s, g, 5.05, y, 3.5, 0.95, { fontSize: 12, valign: 'middle', lineSpacingMultiple: 1.0, objectName: `a2:gap ${i + 1} text` });
  });
  // next
  T(s, 'IF WE HAD ANOTHER MONTH', 9.0, 1.9, 3.7, 0.3, { fontSize: 12, bold: true, color: BLUE, charSpacing: 3, objectName: 'a3:next label' });
  const next = [
    ['Measure', 'Benchmark handwriting accuracy on real classroom samples.'],
    ['Harden', 'Separate execution VM, login and a security review before public hosting.'],
    ['Pin', 'Freeze compiler and header versions inside every lesson snapshot.'],
  ];
  next.forEach(([h, b], i) => {
    const y = 2.3 + i * 1.42;
    rect(s, 9.0, y, 3.73, 1.28, INK, { tag: 'a3', label: `next ${i + 1} body` });
    rect(s, 9.0, y, 3.73, 0.1, YELLOW, { tag: 'a3', label: `next ${i + 1} strip` });
    T(s, h, 9.2, y + 0.22, 3.3, 0.32, { fontSize: 15, bold: true, color: YELLOW, objectName: `a3:next ${i + 1} head` });
    T(s, b, 9.2, y + 0.58, 3.35, 0.65, { fontSize: 12, color: PAPER, lineSpacingMultiple: 1.0, objectName: `a3:next ${i + 1} text` });
  });
  rect(s, 9.0, 6.6, 3.73, 0.3, CORAL, { tag: 'a4', label: 'repo bg' });
  T(s, 'github.com/ksu-gitreaper807/Craft-N-Code-Karnataka', 9.0, 6.6, 3.73, 0.3, { fontSize: 9, bold: true, align: 'center', valign: 'middle', objectName: 'a4:repo text',
    hyperlink: { url: 'https://github.com/ksu-gitreaper807/Craft-N-Code-Karnataka', tooltip: 'Open the repository' } });
  footer(s, 8);
}

(async () => {
  const out = path.join(__dirname, '..', 'Boardroom-v2-raw.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
