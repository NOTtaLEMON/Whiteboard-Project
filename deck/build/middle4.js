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

