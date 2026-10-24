// Boardroom submission deck: Neo-Brutalist, 8 slides, native shapes + animated GIF simulations.
// Objects named "a<click>:<label>" get a hard "appear" entrance on that click (added by animate.py).
const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require(process.env.APPLY_THEME);

const RED = 'FF6B6B', YELLOW = 'FFD93D', VIOLET = 'C4B5FD', CREAM = 'FFFDF5', BLACK = '000000', WHITE = 'FFFFFF';
const FONT = 'Space Grotesk', MONO = 'Consolas';
const THEME = {
  name: 'Boardroom Neo-Brutalist', headFontFace: FONT, bodyFontFace: FONT,
  colors: { dk1: BLACK, lt1: WHITE, dk2: BLACK, lt2: CREAM, accent1: RED, accent2: YELLOW, accent3: VIOLET, accent4: BLACK, accent5: WHITE, accent6: CREAM, hlink: BLACK, folHlink: BLACK },
};
const A = (file) => path.join(__dirname, '..', 'assets', file);

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'Boardroom: the whiteboard that runs your code';
pres.author = 'Craft N Code Karnataka 2026 team';
pres.defineSlideMaster({ title: 'CREAM', background: { color: CREAM } });
pres.defineSlideMaster({ title: 'BLACK', background: { color: BLACK } });

// ------------------------------------------------------------------ helpers
const line = () => ({ color: BLACK, width: 3 });
function name(tag, label) { return tag ? `${tag}:${label}` : label; }

// Hard-edged card: a black offset rectangle behind a filled, outlined rectangle. Same tag so they appear together.
function card(s, x, y, w, h, fill, { shadow = 0.1, tag = '', label = 'card', lineWidth = 3 } = {}) {
  s.addShape(pres.ShapeType.rect, { x: x + shadow, y: y + shadow, w, h, fill: { color: BLACK }, line: { color: BLACK, width: 0 }, objectName: name(tag, `${label} shadow`) });
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: fill }, line: { color: BLACK, width: lineWidth }, objectName: name(tag, `${label} body`) });
}
function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 16, bold: true, color: BLACK, margin: 0, valign: 'top', isTextBox: true }, o));
}
function chip(s, text, x, y, w, h, fill, { color = BLACK, size = 14, tag = '', label = 'chip', rotate = 0, shadow = 0.06 } = {}) {
  card(s, x, y, w, h, fill, { shadow, tag, label, lineWidth: 2.5 });
  T(s, text, x, y, w, h, { fontSize: size, color, align: 'center', valign: 'middle', charSpacing: 1, objectName: name(tag, `${label} text`) });
}
function frame(s, x, y, w, h, tag = '', label = 'frame') {
  s.addShape(pres.ShapeType.rect, { x: x + 0.12, y: y + 0.12, w, h, fill: { color: BLACK }, line: { color: BLACK, width: 0 }, objectName: name(tag, `${label} shadow`) });
}
function gif(s, file, x, y, w, h, alt, tag = '', label = 'simulation') {
  frame(s, x, y, w, h, tag, label);
  s.addImage({ path: A(file), x, y, w, h, altText: alt, objectName: name(tag, label) });
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { type: 'none' }, line: { color: BLACK, width: 4 }, objectName: name(tag, `${label} border`) });
}
function header(s, num, section, dark = false) {
  const fill = dark ? YELLOW : BLACK;
  T(s, `${num} / ${section}`, 0.6, 0.42, 4.2, 0.4, { fontSize: 14, color: dark ? BLACK : CREAM, fill: { color: fill }, align: 'center', valign: 'middle', charSpacing: 2 });
}
function footer(s, current, dark = false) {
  T(s, 'BOARDROOM · CRAFT N CODE KARNATAKA 2026', 0.6, 7.1, 6, 0.28, { fontSize: 11, color: dark ? CREAM : BLACK, charSpacing: 1, valign: 'middle' });
  for (let n = 1; n <= 8; n++) {
    const x = 12.75 - (8 - n + 1) * 0.4 + 0.08;
    const on = n === current;
    T(s, String(n), x, 7.08, 0.32, 0.32, {
      fontSize: 12, align: 'center', valign: 'middle', color: BLACK,
      fill: { color: on ? YELLOW : (dark ? CREAM : WHITE) }, line: { color: dark ? CREAM : BLACK, width: 2 },
      hyperlink: { slide: n, tooltip: `Jump to slide ${n}` }, objectName: `nav ${n}`,
    });
  }
}
function title(s, text, { color = BLACK, w = 9.4, size = 42, y = 0.95, h = 1.2 } = {}) {
  T(s, text, 0.6, y, w, h, { fontSize: size, color, charSpacing: 0, lineSpacingMultiple: 0.9, valign: 'top' });
}
function star(s, x, y, size, fill, text, rotate, tag = '', label = 'star') {
  s.addShape(pres.ShapeType.star5, { x: x + 0.06, y: y + 0.06, w: size, h: size, fill: { color: BLACK }, line: { color: BLACK, width: 0 }, rotate, objectName: name(tag, `${label} shadow`) });
  s.addShape(pres.ShapeType.star5, { x, y, w: size, h: size, fill: { color: fill }, line: { color: BLACK, width: 3 }, rotate, objectName: name(tag, `${label} body`) });
  if (text) T(s, text, x, y + size * 0.3, size, size * 0.4, { fontSize: 11, align: 'center', valign: 'middle', rotate, objectName: name(tag, `${label} text`) });
}

// ================================================================== 1. COVER
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  s.addImage({ path: A('halftone-tr.png'), x: 7.9, y: 0, w: 5.43, h: 5.43, altText: 'Halftone dots', objectName: 'halftone' });
  chip(s, 'CRAFT N CODE KARNATAKA 2026', 0.6, 0.5, 4.5, 0.46, BLACK, { color: CREAM, size: 14, label: 'event chip' });
  chip(s, 'AI FOR EDUCATION', 5.3, 0.5, 2.8, 0.46, VIOLET, { size: 14, label: 'theme chip' });
  T(s, 'BOARD', 0.55, 1.15, 7.2, 1.9, { fontSize: 130, charSpacing: -2, valign: 'top', objectName: 'cover title 1' });
  T(s, 'ROOM.', 0.55, 2.85, 7.2, 1.9, { fontSize: 130, charSpacing: -2, valign: 'top', objectName: 'cover title 2' });
  card(s, 0.6, 5.0, 6.9, 1.35, YELLOW, { tag: 'a1', label: 'tagline' });
  T(s, 'THE WHITEBOARD\nTHAT RUNS YOUR CODE.', 0.85, 5.1, 6.4, 1.15, { fontSize: 28, valign: 'middle', lineSpacingMultiple: 0.95, objectName: 'a1:tagline text' });
  gif(s, 'sim-run.gif', 7.85, 1.5, 5.0, 3.05, 'Animation: code is typed on a board, blue input 3 5 is added, Run is pressed and 3 + 5 = 8 appears.', '', 'cover simulation');
  chip(s, 'LIVE LOOP', 7.5, 1.12, 1.9, 0.4, YELLOW, { size: 13, label: 'loop sticker' });
  chip(s, 'TYPE OR WRITE', 7.85, 5.05, 1.55, 0.5, RED, { size: 12, tag: 'a2', label: 'verb 1' });
  chip(s, 'SELECT', 9.55, 5.05, 1.35, 0.5, YELLOW, { size: 12, tag: 'a2', label: 'verb 2' });
  chip(s, 'RUN', 11.05, 5.05, 1.8, 0.5, VIOLET, { size: 12, tag: 'a2', label: 'verb 3' });
  star(s, 11.75, 0.1, 1.4, YELLOW, 'C++\nPYTHON', 0, 'a2', 'language star');
  T(s, 'CLICK TO REVEAL  ▸', 7.85, 6.05, 5.0, 0.4, { fontSize: 14, align: 'right', charSpacing: 1 });
  footer(s, 1);
}

// ================================================================== 2. THE PROBLEM
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  s.addImage({ path: A('grid.png'), x: 6.9, y: 0, w: 6.43, h: 3.62, altText: 'Graph paper grid', objectName: 'grid' });
  header(s, '02', 'THE PROBLEM');
  title(s, 'A WHITEBOARD\nCAN’T COMPILE.', { w: 7.4, size: 50, h: 1.9 });
  card(s, 0.6, 2.85, 6.2, 2.0, YELLOW);
  T(s, 'Teachers explain C++ and Python on a board. Checking the example means leaving the lesson for a separate IDE.', 0.85, 3.0, 5.7, 1.7, { fontSize: 20, valign: 'middle', lineSpacingMultiple: 1.0 });
  chip(s, 'OUR PREMISE, NOT A STATISTIC', 0.6, 5.2, 3.9, 0.46, RED, { size: 12, label: 'premise sticker' });
  chip(s, 'FOR TEACHERS', 4.7, 5.2, 2.3, 0.46, VIOLET, { size: 12, label: 'user chip' });
  // before / after
  card(s, 7.7, 1.15, 5.0, 2.45, WHITE);
  T(s, 'TODAY', 7.7, 1.15, 1.7, 0.45, { fontSize: 14, color: CREAM, fill: { color: BLACK }, align: 'center', valign: 'middle', charSpacing: 2 });
  T(s, 'WRITE ON THE BOARD\n▾\nSWITCH TO AN IDE\n▾\nPASTE, RUN, SWITCH BACK', 7.95, 1.75, 4.5, 1.75, { fontSize: 16, lineSpacingMultiple: 1.0, valign: 'middle' });
  card(s, 7.35, 3.95, 5.35, 2.65, RED, { tag: 'a1', label: 'after panel', shadow: 0.14 });
  T(s, 'WITH BOARDROOM', 7.35, 3.95, 2.9, 0.45, { fontSize: 14, color: CREAM, fill: { color: BLACK }, align: 'center', valign: 'middle', charSpacing: 2, objectName: 'a1:after label' });
  T(s, 'WRITE  ▸  SELECT  ▸  RUN', 7.6, 4.6, 4.9, 0.6, { fontSize: 26, objectName: 'a1:after steps' });
  T(s, 'Errors are underlined in the code. The lesson never leaves the board.', 7.6, 5.3, 4.9, 1.2, { fontSize: 18, objectName: 'a1:after text' });
  star(s, 11.85, 3.35, 1.1, YELLOW, '', -10, 'a1', 'after star');
  footer(s, 2);
}

// ================================================================== 3. HOW IT WORKS
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  header(s, '03', 'HOW IT WORKS');
  title(s, 'FIVE STEPS FROM INK TO ANSWER.', { w: 12, size: 38, h: 0.9 });
  const steps = [
    ['1', 'WRITE', 'Pen or keyboard. Black ink is code, blue ink is input.', YELLOW],
    ['2', 'SELECT', 'Drag a box. That region becomes the program.', VIOLET],
    ['3', 'REVIEW', 'Gemini reads ink. The teacher confirms every line.', RED],
    ['4', 'RUN', 'A throwaway Docker container compiles and runs it.', YELLOW],
    ['5', 'SEE', 'Output and errors appear in the code panel.', VIOLET],
  ];
  steps.forEach(([n, verb, desc, fill], i) => {
    const y = 1.95 + i * 0.99, x = 0.6 + (i % 2) * 0.25;
    const tag = `a${i + 1}`;
    card(s, x, y, 0.8, 0.8, fill, { tag, label: `step ${n} badge`, shadow: 0.07 });
    T(s, n, x, y, 0.8, 0.8, { fontSize: 32, align: 'center', valign: 'middle', objectName: `${tag}:step ${n} number` });
    card(s, x + 0.95, y, 5.6, 0.8, WHITE, { tag, label: `step ${n} panel`, shadow: 0.07 });
    T(s, verb, x + 1.1, y + 0.04, 1.35, 0.72, { fontSize: 20, valign: 'middle', objectName: `${tag}:step ${n} verb` });
    T(s, desc, x + 2.45, y + 0.04, 4.0, 0.72, { fontSize: 14, valign: 'middle', lineSpacingMultiple: 0.95, objectName: `${tag}:step ${n} text` });
  });
  gif(s, 'sim-review.gif', 7.75, 1.95, 5.0, 3.05, 'Animation: scribbled handwriting is read into code, one line is flagged CHECK, the teacher ticks a confirmation box and only then can the code run.', '', 'review simulation');
  chip(s, 'STEP 3, SIMULATED', 7.45, 1.62, 2.4, 0.38, YELLOW, { size: 12, label: 'sim sticker' });
  // step 5 preview: an error underlined in the code panel (native shapes)
  card(s, 7.75, 5.4, 5.0, 1.45, WHITE, { tag: 'a5', label: 'error panel' });
  T(s, '  int x = 1\n  printf("%d", x);', 7.95, 5.5, 3.5, 0.75, { fontSize: 15, fontFace: MONO, valign: 'top', lineSpacing: 26, objectName: 'a5:error code' });
  s.addShape(pres.ShapeType.rect, { x: 8.2, y: 5.8, w: 1.3, h: 0.05, fill: { color: RED }, line: { color: RED, width: 0 }, objectName: 'a5:squiggle' });
  chip(s, 'L1 · expected ‘;’', 8.0, 6.38, 2.2, 0.38, RED, { size: 12, tag: 'a5', label: 'diagnostic chip' });
  T(s, 'THE BOARD STAYS CLEAN.', 10.35, 6.3, 2.3, 0.5, { fontSize: 13, valign: 'middle', objectName: 'a5:clean note' });
  footer(s, 3);
}

// ================================================================== 4. MODES
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  header(s, '04', 'THREE MODES');
  title(s, 'ONE SLIDER.\nTHREE WAYS TO RUN.', { w: 7.2, size: 38, h: 1.3 });
  // slider graphic (static)
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 2.35, w: 6.8, h: 0.42, fill: { color: WHITE }, line: line(), objectName: 'slider track' });
  s.addShape(pres.ShapeType.rect, { x: 0.6, y: 2.35, w: 2.85, h: 0.42, fill: { color: RED }, line: line(), objectName: 'slider fill' });
  s.addShape(pres.ShapeType.rect, { x: 2.9, y: 2.28, w: 1.1, h: 0.56, fill: { color: YELLOW }, line: line(), objectName: 'slider knob' });
  [['FULL PROGRAM', 0.6], ['SNIPPET', 3.0], ['ALGORITHM', 5.45]].forEach(([t, x]) => T(s, t, x, 2.85, 2.0, 0.3, { fontSize: 12, charSpacing: 1 }));
  const modes = [
    ['FULL PROGRAM', 'Compiles exactly what you wrote. No corrections.', 'GEMINI: NEVER', YELLOW, 0.6],
    ['SNIPPET', 'Pick a template of headers. Gemini only arranges helpers and main(). It never fixes code.', 'GEMINI: ARRANGES', VIOLET, 0.85],
    ['ALGORITHM', 'Write the steps in plain words. Gemini writes the program, then it compiles.', 'GEMINI: WRITES', RED, 0.6],
  ];
  modes.forEach(([head, body, tagline, fill, x], i) => {
    const y = 3.3 + i * 1.18, tag = `a${i + 1}`;
    card(s, x, y, 6.8, 1.02, fill, { tag, label: `mode ${i + 1}` });
    T(s, head, x + 0.2, y + 0.06, 2.6, 0.4, { fontSize: 18, objectName: `${tag}:mode ${i + 1} name` });
    T(s, tagline, x + 4.35, y + 0.08, 2.3, 0.34, { fontSize: 12, align: 'center', valign: 'middle', color: CREAM, fill: { color: BLACK }, charSpacing: 1, objectName: `${tag}:mode ${i + 1} tag` });
    T(s, body, x + 0.2, y + 0.46, 6.4, 0.52, { fontSize: 14, valign: 'top', lineSpacingMultiple: 0.95, objectName: `${tag}:mode ${i + 1} text` });
  });
  gif(s, 'sim-snippet.gif', 8.1, 1.2, 4.65, 2.84, 'Animation: loose statements and a helper function are rearranged under a template, main() is added around the statement, and a checker confirms nothing else changed.', '', 'snippet simulation');
  chip(s, 'SNIPPET MODE, SIMULATED', 7.8, 0.86, 3.2, 0.38, YELLOW, { size: 12, label: 'sim sticker' });
  card(s, 8.1, 4.5, 4.65, 2.1, WHITE, { tag: 'a4', label: 'fix callout', shadow: 0.12 });
  T(s, 'OPTIONAL:\nASK GEMINI TO FIX', 8.3, 4.6, 4.3, 0.8, { fontSize: 20, lineSpacingMultiple: 0.95, objectName: 'a4:fix title' });
  T(s, 'Shows up only after a failed run, in any mode. The teacher clicks it. No click, no API call.', 8.3, 5.45, 4.3, 1.05, { fontSize: 14, valign: 'top', objectName: 'a4:fix text' });
  star(s, 11.95, 4.1, 1.0, RED, '', 14, 'a4', 'fix star');
  footer(s, 4);
}

// ================================================================== 5. SANDBOX
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  s.addImage({ path: A('halftone-bl.png'), x: 0, y: 3.0, w: 3.0, h: 3.0, altText: 'Halftone dots', objectName: 'halftone' });
  header(s, '05', 'SAFE BY DESIGN');
  title(s, 'TRY TO BREAK IT.\nWE DID.', { w: 7, size: 38, h: 1.3 });
  gif(s, 'sim-sandbox.gif', 0.6, 2.25, 6.5, 3.97, 'Animation: four hostile programs each run in a fresh container and are stopped: a sleep at five seconds, a flood of output cut at 16 KiB, a heap buffer overflow caught by AddressSanitizer, and a blocked network call.', '', 'sandbox simulation');
  chip(s, 'SIMULATION OF 4 REAL TEST RUNS', 0.6, 6.5, 3.9, 0.4, VIOLET, { size: 12, label: 'sim sticker' });
  chip(s, 'LOCAL: DOCKER · HOSTED: WANDBOX', 4.7, 6.5, 2.9, 0.4, WHITE, { size: 9, label: 'scope sticker' });
  const rows = [
    ['sleep(10)', 'STOPPED AT 5 SECONDS', YELLOW],
    ['100,000 LINES OF OUTPUT', 'CUT AT 16 KiB', VIOLET],
    ['WRITE PAST A BUFFER', 'ASAN CATCHES IT', RED],
    ['NETWORK CALL', 'BLOCKED', WHITE],
  ];
  rows.forEach(([attack, result, fill], i) => {
    const y = 1.2 + i * 1.0, tag = `a${i + 1}`;
    card(s, 7.75, y, 5.0, 0.82, fill, { tag, label: `result ${i + 1}`, shadow: 0.08 });
    T(s, attack, 7.95, y + 0.04, 2.3, 0.74, { fontSize: 13, valign: 'middle', lineSpacingMultiple: 0.95, objectName: `${tag}:attack ${i + 1}` });
    T(s, '▸', 10.2, y + 0.04, 0.3, 0.74, { fontSize: 18, valign: 'middle', objectName: `${tag}:arrow ${i + 1}` });
    T(s, result, 10.55, y + 0.04, 2.1, 0.74, { fontSize: 15, valign: 'middle', lineSpacingMultiple: 0.95, objectName: `${tag}:result text ${i + 1}` });
  });
  card(s, 7.75, 5.35, 5.0, 1.55, YELLOW, { tag: 'a5', label: 'big number', shadow: 0.14 });
  T(s, '55', 7.9, 5.4, 1.7, 1.45, { fontSize: 66, valign: 'middle', objectName: 'a5:number' });
  T(s, 'PROBE PROGRAMS RUN IN C++ AND PYTHON', 9.55, 5.45, 3.1, 0.9, { fontSize: 15, valign: 'middle', lineSpacingMultiple: 0.95, objectName: 'a5:number text' });
  T(s, 'SOURCE: OUR OWN TEST RUN, 18 OCT 2026', 9.55, 6.4, 3.1, 0.4, { fontSize: 10, valign: 'middle', objectName: 'a5:source' });
  footer(s, 5);
}

// ================================================================== 6. AI + RESPONSIBLE USE (black)
{
  const s = pres.addSlide({ masterName: 'BLACK' });
  header(s, '06', 'AI, USED CAREFULLY', true);
  s.addText([
    { text: 'AI READS. ', options: { color: YELLOW } },
    { text: 'THE COMPILER DECIDES.', options: { color: CREAM } },
  ], { x: 0.6, y: 0.95, w: 12.2, h: 0.95, fontFace: FONT, fontSize: 42, bold: true, margin: 0, valign: 'top', isTextBox: true, objectName: 'slide title' });
  const cols = [
    ['WHERE GEMINI RUNS', YELLOW, ['Reads handwriting and blue-ink input', 'Algorithm mode: steps become a program', 'Snippet mode: arranges structure only', 'Fix button: only when the teacher clicks']],
    ['GUARDRAILS', RED, ['Teacher confirms every line before it runs', 'A structure result that changes more than layout is refused', 'API keys stay on the server', 'Requests ask Gemini not to store them']],
    ['NO AI HERE', VIOLET, ['Compiling, running, error lines', 'Typed code in Full program mode', 'Teaching notes: fixed rules, not generated']],
  ];
  cols.forEach(([head, fill, bullets], i) => {
    const x = 0.6 + i * 4.2, y = 2.2 + (i === 1 ? 0.35 : 0), tag = `a${i + 1}`;
    s.addShape(pres.ShapeType.rect, { x: x + 0.12, y: y + 0.12, w: 3.95, h: 3.25, fill: { color: CREAM }, line: { color: CREAM, width: 0 }, objectName: `${tag}:col ${i + 1} shadow` });
    s.addShape(pres.ShapeType.rect, { x, y, w: 3.95, h: 3.25, fill: { color: fill }, line: { color: CREAM, width: 3 }, objectName: `${tag}:col ${i + 1} body` });
    T(s, head, x + 0.2, y + 0.15, 3.6, 0.4, { fontSize: 18, objectName: `${tag}:col ${i + 1} head` });
    s.addText(bullets.map((b, k) => ({ text: b, options: { bullet: { characterCode: '25A0' }, breakLine: k < bullets.length - 1, paraSpaceAfter: 6 } })),
      { x: x + 0.2, y: y + 0.7, w: 3.6, h: 2.45, fontFace: FONT, fontSize: 14, bold: true, color: BLACK, margin: 0, valign: 'top', isTextBox: true, objectName: `${tag}:col ${i + 1} list` });
  });
  T(s, 'BUILT WITH', 0.6, 6.0, 1.5, 0.35, { fontSize: 12, color: YELLOW, charSpacing: 2, valign: 'middle', objectName: 'a4:built label' });
  ['GEMINI API', 'EXCALIDRAW', 'REACT + VITE', 'NODE.JS', 'DOCKER', 'G++ + PYTHON', 'WANDBOX'].forEach((t, i) => {
    const x = 2.1 + i * 1.5;
    chip(s, t, x, 6.0, 1.4, 0.36, CREAM, { size: 10, tag: 'a4', label: `stack ${i + 1}`, shadow: 0.0 });
  });
  T(s, 'DEVELOPED WITH AI CODING TOOLS: OPENAI CODEX, CLAUDE CODE.   NOT YET MEASURED: HANDWRITING ACCURACY ON REAL CLASSROOM SAMPLES.', 0.6, 6.5, 12.1, 0.5, { fontSize: 12, color: CREAM, valign: 'middle', objectName: 'a4:disclosure' });
  footer(s, 6, true);
}

// ================================================================== 7. FEATURE GRID
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  s.addImage({ path: A('grid.png'), x: 6.9, y: 3.88, w: 6.43, h: 3.62, altText: 'Graph paper grid', objectName: 'grid' });
  header(s, '07', 'WHAT ELSE IT DOES');
  title(s, 'EVERYTHING A\nLESSON NEEDS.', { w: 6.5, size: 38, h: 1.3 });
  const cards = [
    ['SNAPSHOTS', 'Every run is saved with the whole board, in Git history.', YELLOW],
    ['INPUT CASES', 'Run up to five inputs. Compare output exactly. Save suites.', VIOLET],
    ['TEACHING HEADERS', 'Stack, queue, linked list, binary search, plus C++ STL examples.', RED],
    ['DRAW A LIST', 'Draw or type 1->3->4->5. Boardroom builds real linked-list nodes.', WHITE],
    ['TWO BOARDS', 'Tabs, and a side-by-side view for comparing two boards.', VIOLET],
    ['TEACHER TOOLS', 'Pen, eraser, shapes, laser pointer, five stroke widths, dark mode.', YELLOW],
  ];
  cards.forEach(([head, body, fill], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.15 + (row === 1 ? 0.3 : 0), y = 2.4 + row * 2.1, tag = `a${row + 1}`;
    card(s, x, y, 3.85, 1.85, fill, { tag, label: `feature ${i + 1}` });
    T(s, String(i + 1).padStart(2, '0'), x + 0.2, y + 0.12, 0.8, 0.4, { fontSize: 14, objectName: `${tag}:num ${i + 1}` });
    T(s, head, x + 0.2, y + 0.45, 3.45, 0.45, { fontSize: 19, objectName: `${tag}:head ${i + 1}` });
    T(s, body, x + 0.2, y + 0.95, 3.45, 0.85, { fontSize: 14, valign: 'top', lineSpacingMultiple: 0.95, objectName: `${tag}:body ${i + 1}` });
  });
  chip(s, '39 / 39 NON-GEMINI BROWSER TESTS PASSED · 18 OCT 2026', 0.6, 6.6, 6.7, 0.42, BLACK, { color: CREAM, size: 12, tag: 'a3', label: 'evidence' });
  footer(s, 7);
}

// ================================================================== 8. CLOSE
{
  const s = pres.addSlide({ masterName: 'CREAM' });
  header(s, '08', 'WHAT’S NEXT');
  card(s, 0.6, 1.2, 6.9, 3.3, RED, { shadow: 0.16, lineWidth: 4 });
  T(s, 'THE BOARD\nNOW TALKS\nBACK.', 0.9, 1.35, 6.4, 3.0, { fontSize: 66, lineSpacingMultiple: 0.88, valign: 'middle' });
  star(s, 6.7, 0.75, 1.15, YELLOW, '', 10);
  T(s, 'IF WE HAD ANOTHER MONTH', 8.0, 1.2, 4.75, 0.4, { fontSize: 13, charSpacing: 2, color: CREAM, fill: { color: BLACK }, align: 'center', valign: 'middle' });
  const next = [
    ['MEASURE', 'Benchmark handwriting accuracy on real classroom samples.', YELLOW],
    ['HARDEN', 'Separate execution VM, login and a security review before public hosting.', VIOLET],
    ['PIN', 'Freeze compiler and header versions inside every lesson snapshot.', WHITE],
  ];
  next.forEach(([head, body, fill], i) => {
    const y = 1.8 + i * 1.5, tag = `a${i + 1}`;
    card(s, 8.0 + (i === 1 ? 0.25 : 0), y, 4.5, 1.3, fill, { tag, label: `next ${i + 1}` });
    T(s, head, 8.2 + (i === 1 ? 0.25 : 0), y + 0.1, 4.1, 0.4, { fontSize: 18, objectName: `${tag}:next head ${i + 1}` });
    T(s, body, 8.2 + (i === 1 ? 0.25 : 0), y + 0.52, 4.1, 0.75, { fontSize: 14, valign: 'top', lineSpacingMultiple: 0.95, objectName: `${tag}:next body ${i + 1}` });
  });
  T(s, 'KNOWN GAPS TODAY', 0.6, 4.95, 3.0, 0.4, { fontSize: 13, color: CREAM, fill: { color: BLACK }, align: 'center', valign: 'middle', charSpacing: 2, objectName: 'a4:gaps label' });
  card(s, 0.6, 5.5, 3.6, 1.35, WHITE, { tag: 'a4', label: 'gap 1' });
  T(s, 'Hosted site runs code on Wandbox: rate limited, no sanitizer promise.', 0.78, 5.55, 3.25, 1.25, { fontSize: 14, valign: 'middle', lineSpacingMultiple: 0.95, objectName: 'a4:gap 1 text' });
  card(s, 4.4, 5.5, 3.4, 1.35, VIOLET, { tag: 'a4', label: 'gap 2' });
  T(s, 'Language is C++17 now. C code that is not valid C++ will not compile.', 4.58, 5.55, 3.05, 1.25, { fontSize: 14, valign: 'middle', lineSpacingMultiple: 0.95, objectName: 'a4:gap 2 text' });
  chip(s, 'WRITE.  SELECT.  RUN.', 8.55, 6.25, 4.2, 0.6, YELLOW, { size: 20, tag: 'a4', label: 'sign off' });
  footer(s, 8);
}

(async () => {
  const out = path.join(__dirname, '..', 'Boardroom-deck.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
