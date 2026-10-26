"""Local handwriting OCR service backed by a pretrained vision-language model.

The model (Qwen2-VL 2B Instruct by default) reads the whole board crop at once, so
code symbols and indentation are not lost to line splitting. Nothing is fine-tuned
and nothing is sent to an external API.

POST /ocr    {"code": "<base64 PNG>", "stdin": "<base64 PNG>"}  (either is optional)
             -> {"code": [{"text", "uncertain"}], "stdin": [...], "model": "..."}
GET  /health -> {"ready": bool, "model": "..."}

Binds to loopback by default. Images are processed in memory and never stored.
"""
import base64
import binascii
import io
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image

MODEL_NAME = os.environ.get('OCR_MODEL', 'Qwen/Qwen2-VL-2B-Instruct')
HOST = os.environ.get('OCR_HOST', '127.0.0.1')
PORT = int(os.environ.get('OCR_PORT', '8788'))
DTYPE = os.environ.get('OCR_DTYPE', 'float32')            # float32, bfloat16 or float16
MAX_PIXELS = int(os.environ.get('OCR_MAX_PIXELS', str(640 * 28 * 28)))   # bounds visual tokens, hence CPU time
MAX_NEW_TOKENS = int(os.environ.get('OCR_MAX_NEW_TOKENS', '600'))
UNCERTAIN_BELOW = float(os.environ.get('OCR_UNCERTAIN_BELOW', '0.5'))
MAX_BODY = 6 * 1024 * 1024
MAX_IMAGE_PIXELS = 2048 * 2048
MAX_LINES = {'code': 250, 'stdin': 100}

PROMPTS = {
    'code': ('This image is handwritten source code (C++ or Python) on a whiteboard. '
             'Transcribe it exactly, one output line per written line, preserving indentation, '
             'blank lines, capitalization and every symbol such as # < > { } ( ) [ ] ; : & * " \'. '
             'Do NOT fix mistakes, add missing headers, braces, semicolons or ampersands, or complete anything. '
             'Output only the code, with no explanation and no Markdown fences.'),
    'stdin': ('This image is handwritten program input. Transcribe it exactly, one output line per written line. '
              'Output only the text, with no explanation and no Markdown fences.'),
}

_lock = threading.Lock()   # one inference at a time; the CPU model is not re-entrant
_model = None


def load_model():
    global _model
    if _model is None:
        import torch
        from transformers import AutoProcessor, Qwen2VLForConditionalGeneration
        processor = AutoProcessor.from_pretrained(MODEL_NAME, max_pixels=MAX_PIXELS)
        model = Qwen2VLForConditionalGeneration.from_pretrained(
            MODEL_NAME, dtype=getattr(torch, DTYPE)).eval()
        _model = (torch, processor, model)
    return _model


def split_generated(pieces):
    """Group (token_text, probability) pairs into lines of (text, min probability)."""
    lines, text, low = [], '', 1.0
    for piece, prob in pieces:
        parts = piece.split('\n')
        for index, part in enumerate(parts):
            if index:
                lines.append((text, low))
                text, low = '', 1.0
            if part:
                text += part
                low = min(low, prob)
    lines.append((text, low))
    return lines


def clean_lines(lines):
    """Drop Markdown fences the model may add and trailing blank lines; keep inner blanks."""
    lines = [(t, p) for t, p in lines if not t.strip().startswith('```')]
    while lines and not lines[-1][0].strip():
        lines.pop()
    while lines and not lines[0][0].strip():
        lines.pop(0)
    return lines


def transcribe(image, channel):
    torch, processor, model = load_model()
    messages = [{'role': 'user', 'content': [{'type': 'image'}, {'type': 'text', 'text': PROMPTS[channel]}]}]
    prompt = processor.apply_chat_template(messages, add_generation_prompt=True, tokenize=False)
    inputs = processor(text=[prompt], images=[image.convert('RGB')], return_tensors='pt')
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=MAX_NEW_TOKENS, do_sample=False,
                             output_scores=True, return_dict_in_generate=True)
    ids = out.sequences[0][inputs['input_ids'].shape[1]:]
    tokenizer = processor.tokenizer
    pieces = []
    for step, token in enumerate(ids.tolist()):
        if token in (tokenizer.eos_token_id, tokenizer.pad_token_id) or token in tokenizer.all_special_ids:
            continue
        prob = torch.softmax(out.scores[step][0], dim=-1)[token].item()
        pieces.append((tokenizer.decode([token]), prob))
    lines = clean_lines(split_generated(pieces))[:MAX_LINES[channel]]
    return [{'text': text.replace('\r', '').replace('\0', '').rstrip(),
             'uncertain': prob < UNCERTAIN_BELOW or '?' in text} for text, prob in lines]


def decode_png(encoded):
    try:
        data = base64.b64decode(encoded, validate=True)
        image = Image.open(io.BytesIO(data))
        image.load()
    except (binascii.Error, OSError, ValueError):
        raise ValueError('Invalid PNG image.')
    if image.format != 'PNG' or image.width * image.height > MAX_IMAGE_PIXELS:
        raise ValueError('Send a PNG of at most 2048 x 2048 pixels.')
    return image


class Handler(BaseHTTPRequestHandler):
    server_version = 'BoardroomOCR'

    def _send(self, status, body):
        payload = json.dumps(body).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == '/health':
            return self._send(200, {'ready': _model is not None, 'model': MODEL_NAME})
        self._send(404, {'error': 'Not found.'})

    def do_POST(self):
        if self.path != '/ocr':
            return self._send(404, {'error': 'Not found.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_BODY:
                return self._send(413, {'error': 'Request body too large.'})
            body = json.loads(self.rfile.read(length))
            if not isinstance(body, dict):
                raise ValueError('Send a JSON object.')
            output = {'code': [], 'stdin': [], 'model': MODEL_NAME}
            with _lock:
                for channel in ('code', 'stdin'):
                    if isinstance(body.get(channel), str):
                        output[channel] = transcribe(decode_png(body[channel]), channel)
            self._send(200, output)
        except (ValueError, json.JSONDecodeError) as error:
            self._send(400, {'error': str(error)})
        except Exception as error:
            print(f'OCR failure: {type(error).__name__}: {error}', flush=True)   # no image or text content
            self._send(500, {'error': 'The handwriting model failed to read this image.'})

    def log_message(self, fmt, *args):   # never log request content
        pass


if __name__ == '__main__':
    if os.environ.get('OCR_PRELOAD', '1') != '0':
        load_model()
    print(f'Boardroom OCR ({MODEL_NAME}) on http://{HOST}:{PORT}', flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
