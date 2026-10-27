# Boardroom OCR service

Reads handwriting with a **pretrained vision-language model, [Qwen2-VL 2B Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct)** (Apache-2.0, Hugging Face). Board images never leave your machine, no API key is needed, and nothing is fine-tuned.

## How it works

1. The Node API (`server/ocr.mjs`) posts the code and stdin PNG crops to `POST /ocr`.
2. `service.py` sends each whole crop to the model with a fixed prompt: transcribe literally, one output line per written line, keep indentation, blank lines and every symbol, and never fix, complete or explain anything.
3. The output is split into lines. A line is flagged `uncertain` when its least-confident token has probability below `OCR_UNCERTAIN_BELOW` (default 0.5) or contains `?`.
4. The API validates the answer and the teacher must still confirm it.

The same model also serves `POST /wrap` for Snippet mode: it receives loose C++ lines and returns a complete program with only boilerplate added. The Node API (`server/snippet.mjs`) then checks whether every original line is still present, in order and unchanged, and returns the program with a warning if not, for teacher confirmation.

## Run

```bash
cd whiteboard-code-verifier/ocr-service
python -m venv .venv && . .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python service.py                                  # listens on 127.0.0.1:8788
```

The first start downloads about 4.5 GB of weights. Then run `npm run dev` as usual; the API finds the service at `http://127.0.0.1:8788` by default. Check it with `GET /health`.

Or with Docker (weights are baked into the image, so it needs no network at runtime):

```bash
docker build -t boardroom-ocr ocr-service
docker run --rm -p 127.0.0.1:8788:8788 boardroom-ocr
```

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `OCR_MODEL` | `Qwen/Qwen2-VL-2B-Instruct` | Any Qwen2-VL checkpoint |
| `OCR_DTYPE` | `float32` | `bfloat16`/`float16` halve memory; float32 is usually fastest on CPU |
| `OCR_MAX_PIXELS` | `501760` | Caps image size (visual tokens), which bounds CPU time |
| `OCR_MAX_NEW_TOKENS` | `600` | Longest transcription |
| `OCR_UNCERTAIN_BELOW` | `0.5` | Token-confidence threshold for the `uncertain` flag |
| `OCR_HOST` / `OCR_PORT` | `127.0.0.1` / `8788` | Bind address (loopback by default) |
| `OCR_PRELOAD` | `1` | Load the model at startup; `0` loads on first request |

The Node API reads `OCR_SERVICE_URL` (default `http://127.0.0.1:8788`; required on Vercel) and `OCR_TIMEOUT_MS` (default 180000 locally).

## Measured

On one hand-drawn C++ sample (5 lines) it returned every line exactly, with indentation, in about 28 seconds on a laptop CPU (Intel Core Ultra 7, no GPU). An earlier attempt with the line-level TrOCR model misread every line, which is why it was replaced. This is one sample, not a benchmark.

## Known limits

- Needs about 4.5 GB of disk and roughly 10 GB of RAM in float32; each read takes tens of seconds on CPU, seconds on a GPU.
- It is a general model, so it can still hallucinate or "autocorrect" on messy handwriting. Review every line.
- Images are limited to 2048 x 2048 pixels and are downscaled to `OCR_MAX_PIXELS`.
- The service has no authentication. Keep it on loopback or a private network.
