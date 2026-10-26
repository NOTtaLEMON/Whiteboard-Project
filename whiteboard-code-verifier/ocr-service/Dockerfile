FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Bake the pretrained weights into the image so the container needs no network at runtime.
ARG OCR_MODEL=Qwen/Qwen2-VL-2B-Instruct
ENV OCR_MODEL=${OCR_MODEL} HF_HOME=/models
RUN python -c "import os; from transformers import AutoProcessor, Qwen2VLForConditionalGeneration as M; m=os.environ['OCR_MODEL']; AutoProcessor.from_pretrained(m); M.from_pretrained(m)"
COPY service.py ./
RUN useradd -r -u 10001 ocr
USER ocr
ENV OCR_HOST=0.0.0.0 HF_HUB_OFFLINE=1
EXPOSE 8788
CMD ["python", "service.py"]
