# Live OCR smoke sample

`synthetic-code.png` was rendered with Excalidraw's Excalifont, not written by a person. Its exact text is in `synthetic-code.expected.c`. The missing `&` in `scanf` and missing semicolon after `printf` are intentional: OCR must preserve both mistakes.

With the local OCR service running, run from the app root:

```bash
npm run test:ocr -- tests/fixtures/ocr/synthetic-code.png
```

This makes a real provider request and prints the unconfirmed transcription. It never compiles or executes it. Compare punctuation, indentation, and all seven lines with the expected file. The command is opt-in and is not part of `npm test`.

An earlier run of this fixture used a hosted model; it has not been re-measured with the local Qwen2-VL service. It proves integration on one synthetic sample and does not establish accuracy on classroom handwriting.

## Compact OCR comparison samples

`synthetic-python.png` is also font-rendered, not human handwriting. Its gold text is in `synthetic-python.expected.txt`; the missing colon after the `for` statement is intentional. Indentation and the blank line must be preserved.

Run both language samples with:

```bash
npm run benchmark:ocr -- tests/fixtures/ocr/manifest.json
```

The manifest includes the language and exact expected text. The benchmark reports latency, and character/critical-symbol error rates. Live calls require the OCR service to be running. These samples check integration and literal transcription; they do not establish classroom handwriting accuracy.
