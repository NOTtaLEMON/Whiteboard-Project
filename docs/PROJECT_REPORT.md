# Boardroom: Project Report in Plain Language

This report explains the whole project without assuming technical knowledge: what it is, what it must do (the PRD), how it works, how it is kept safe, and what every tool and service in it does.

---

## 1. The project in one minute

**Boardroom is a whiteboard that can run code.**

A teacher writes a program on a digital whiteboard, either by hand or by typing. With one click, the program is actually run, and the real result appears next to the board: the output, the errors, and an explanation of what went wrong and where.

**Why it matters.** Today, code taught on a whiteboard is never run. Students must trust that it works. Mistakes by the teacher (a missing symbol, a wrong number) stay hidden, and ideas like "memory" stay abstract because nothing real is shown. Boardroom fixes this: what is on the board is verified by a real compiler.

**Who it is for.** Teachers who teach C++ or Python in a school, college or bootcamp. Students benefit because they see real results and can replay old lessons.

---

## 2. The PRD (Product Requirements Document), simplified

A PRD answers: *what are we building, for whom, and how do we know it is done?* The full version is in [docs/PRD.md](PRD.md). Here it is in plain words.

### Goals
1. A teacher can run what is on the board without leaving the board.
2. The app shows real feedback: output, errors and memory problems, linked to the exact line.
3. Handwriting is read by a pretrained AI model, and the **teacher always checks the text before anything runs**.
4. Every lesson is saved so it can be reopened and replayed later.

### Not goals (things we deliberately do not do)
- Reading a physical whiteboard through a camera.
- User accounts, grading, or exams.
- Safely running anyone's code at huge public scale.

### What the user can do (user stories)

| # | The teacher can... | Done? |
|---|---|---|
| 1 | Write code on the board and run it | Yes |
| 2 | Give the program input by writing in blue | Yes |
| 3 | Write by hand and have the app read it, then correct and confirm it | Yes |
| 4 | See errors marked on the exact line | Yes |
| 5 | Choose C++ or Python | Yes |
| 6 | Test the same program with up to 20 different inputs | Yes |
| 7 | Use ready-made teaching tools (stack, queue, linked list, search) | Yes |
| 8 | See a short note explaining what things like `malloc` just did | Yes |
| 9 | Save every run as a lesson record | Yes |
| 10 | Reopen and replay an old lesson | Yes |

### How we know it works (success measures)
- Handwriting to a real result in under a minute for a short program.
- Handwritten code is **never run without the teacher confirming it**.
- Errors point to the correct line for typed code.
- A saved lesson can be replayed from its record alone.

### Known risks and our answers

| Risk | What we do about it |
|---|---|
| The AI misreads handwriting | The teacher must review and confirm. Typing is always possible instead. |
| The AI "fixes" the teacher's mistake | It is instructed to copy exactly what is written; the teacher checks. |
| Someone runs harmful code | Code runs in a locked box (see Security below). |
| Someone floods the server | Per-visitor and server-wide request limits. |

---

## 3. How the whole thing works

Think of a restaurant.

- **The browser** is the dining room: what the teacher sees and clicks.
- **The Node API** is the waiter: it takes the order, checks it, and passes it to the right place.
- **The OCR service** is a specialist who reads handwriting.
- **Docker** is a sealed test kitchen where the code is "cooked" safely.
- **Git** is the recipe book where every lesson is recorded.

```
Teacher's browser (the whiteboard)
        │
        ▼
Node API (the waiter: checks and routes every request)
   ├──► OCR service (reads handwriting with the Qwen AI model)
   ├──► Docker box  (compiles and runs the code safely)
   └──► Git         (saves the lesson)
```

### The journey of one lesson

1. **Write.** The teacher writes on the board. Black ink is the program; blue ink is the program's input.
2. **Select.** They drag a box around the code.
3. **Read.** If it is handwriting, a picture of it is sent to the OCR service, which returns the text.
4. **Confirm.** The teacher fixes any misreading and ticks a box. Nothing runs before this.
5. **Run.** The code goes into a fresh sealed Docker box, is compiled and run, and the box is destroyed.
6. **Explain.** The output, errors and notes come back and are shown, with errors linked to the board.
7. **Save.** The board, code, input and result are saved as one record in Git.
8. **Replay.** Later, the lesson can be reopened or rerun exactly as it was.

### The pieces of the code

| Folder | What it holds |
|---|---|
| `src/` | The website the teacher sees (the whiteboard and panels) |
| `server/` | The Node API (the waiter) |
| `ocr-service/` | The handwriting reader (Python and the Qwen model) |
| `runner/` | What runs inside the Docker box (the compiler, the runner script, the teaching tools) |
| `tests/` | Automatic checks that the app still works |
| `docs/` | Documentation |

---

## 4. Tools and services, explained

### Node.js
**What it is:** a program that runs JavaScript on a computer, outside a web browser. JavaScript is the language; Node.js is what executes it. (Like Python the language versus the Python program that runs it.)
**Why we use it:** it lets us write the "waiter" (our API) in the same language as the website. We use only its built-in features, no extra framework, so there is less to go wrong.

### React
**What it is:** a library for building web pages out of reusable parts. **Why:** it keeps the many panels (code, output, history) in sync as the teacher works.

### Excalidraw
**What it is:** an open-source whiteboard component, the same one behind the Excalidraw drawing site. **Why:** it gives us pens, shapes, text and a canvas for free, so we focus on the code-running part.

### Vite
**What it is:** a tool that bundles our website files and serves them quickly while we develop.

### Docker
**What it is:** a way to run a program inside a sealed box (a "container") that has its own tiny Linux system and cannot touch your real files.
**Why we use it:** we run code written by someone else, and that code could be harmful (delete files, loop forever, steal secrets). Docker gives each run a locked room with no internet, little memory, and no access to your computer. The room also has a fixed compiler version, so results are the same on every machine. Docker is also commonly used to ship apps to servers.
**What is inside our box:** a small Linux, the g++ compiler, Python 3, our `runner.py` script, and our teaching tools. It does **not** contain Node, your passwords, or your files.

### GCC / g++
**What it is:** the compiler that turns C++ text into a program the computer can run. **Why:** it is the real thing, so results are trustworthy. We also turn on "sanitizers", extra checks that catch memory mistakes (like using memory after freeing it).

### Python
**What it is:** a programming language. **Why we use it:** it is one of the two languages teachers can run, and it also runs our handwriting service and the code runner inside Docker.

### Qwen2-VL (the AI model)
**What it is:** a pretrained AI model from Alibaba's Qwen team that can look at an image and describe or copy the text in it. "Pretrained" means it was already trained by others, so we did no training. It is an AI language model that can also see.
**Why we use it:** we were asked to use a pretrained model instead of calling a paid web API. It runs **on your own computer**, so there is no API key, no cost per use, and the handwriting images never leave your machine.
**What we tried first:** a handwriting-only model called TrOCR. It misread code badly (it turned `#include <iostream>` into nonsense) because it was trained on ordinary English handwriting. Qwen2-VL copied the same sample exactly.
**The trade-off:** it needs about 4.5 GB of disk and roughly 10 GB of memory, and takes about 30 seconds per read on a laptop without a graphics card.
**Why it has a "prompt":** an AI model like this does not have one fixed job. We give it a short instruction: *copy this handwriting exactly, keep the indentation and every symbol, and do not fix or add anything.* The instruction is not a guarantee, which is why the teacher still checks.

### PyTorch and Hugging Face Transformers
**What they are:** PyTorch is the engine that runs AI models. Transformers is a library that downloads and uses models from Hugging Face (a public site for sharing models). They are how the OCR service loads and runs Qwen2-VL.

### Git and GitHub
**What they are:** Git records every version of files; GitHub hosts that history online. **Why:** the project's code lives on GitHub, and every saved lesson is also a Git record, giving a free history of changes.

### SHA-256
**What it is:** a "fingerprint" function. Any file produces a fixed 64-character code, and changing even one character changes the code completely. **Why:** we store fingerprints with each saved lesson, so when it is replayed we can tell if any file was altered.

### Wandbox (hosted mode only)
**What it is:** a free public website that compiles and runs code. **Why:** on the hosted Vercel version we cannot run Docker, so we send code there instead. Its safety limits are Wandbox's, not ours.

### Vercel and Railway
**What they are:** services that host websites. Vercel hosts the website and small server functions; Railway can run our whole app from the Docker file. They are how the project could be put online.

### Playwright
**What it is:** a tool that controls a real browser to test the app like a user would. Alongside it we have unit tests for the server code.

### Caddy (optional)
**What it is:** a small server that adds secure HTTPS in front of our API when it runs on a rented server.

---

## 5. Security, in simple terms

The hardest part of this project is **running code written by strangers safely**. Several layers protect us. Think of them as locks on different doors.

### Lock 1: The sealed test kitchen (Docker)
Every run gets a brand-new box, destroyed afterwards. In that box:
- **No internet:** the code cannot send anything out or reach other machines.
- **Read-only system:** it cannot change the box's files (only a small temporary folder).
- **No special powers:** it runs as an ordinary low-rights user and all extra Linux abilities are removed.
- **Strict limits:** about half a gigabyte of memory, one processor, at most 64 processes, 5 seconds to run, and a cap on how much it can print. An infinite loop or a runaway program just gets stopped.

### Lock 2: The waiter checks everything (the API)
- **Who is asking:** it only accepts requests from the app's own address, so a random website cannot use your local server.
- **How big:** requests are size-limited, so nobody can send a gigantic file.
- **Is it valid:** images must really be PNG pictures of a sensible size; code and input have size caps.
- **How often:** each visitor gets 20 runs and 6 handwriting reads per minute, with a shared cap for the whole server, so one person cannot hog it and a crowd cannot overload it.

### Lock 3: Secrets stay hidden
- Passwords and tokens (like the GitHub token) live only in a private server file, never in the website, never inside the Docker box, and never in the logs.
- There is **no AI API key in this project at all**, because the handwriting model runs locally. We removed the Gemini integration completely.
- We checked: the built website contains none of our keys.

### Lock 4: Privacy
- Handwriting pictures are read on your own computer and never sent to a company.
- No accounts and no database, so there is no user data to leak.
- Logs never store images or what was written.

### Lock 5: A human in the loop
- Handwritten code is **never** run until the teacher reads and confirms it.
- The AI is told to copy exactly and not to repair mistakes. Even if it misbehaves, the sealed box contains the code.

### Lock 6: Tamper checks on saved lessons
- Each saved lesson stores fingerprints (SHA-256) of the tools it used. If a file changes, replay warns before building anything.

### Honest limits (what is not fully solved)
- The server has **no login**: anyone who can reach it can use it. Keep it private, or add an access token before opening it up.
- The hosted Vercel version runs code on a third-party site, where our Docker limits do not apply, and it has no rate limits.
- The handwriting service has no password. It is safe while it only listens on your own machine.
- A security scan found 7 known issues in Excalidraw's own dependencies (2 high). They sit in a diagram feature we do not use, but they should be updated.
- This is a **prototype for a classroom or demo**, not a service to expose to the open internet. A public version would need logins, stronger isolation and a security review.

---

## 6. What the project can and cannot do today

**Can do:** run typed or handwritten C++ and Python with real output; show errors on the right line; run up to 20 test inputs; save and replay lessons; read handwriting locally with no API key.

**Cannot yet:** read very messy handwriting reliably (it was verified on one sample, not a full benchmark); read handwriting quickly without a graphics card; host the handwriting model on Vercel; offer accounts or a public service.

**Next steps if we had more time:** benchmark the handwriting reader on real classroom samples and fine-tune it on code; add logins and shared rate limits; use a stronger sandbox; update the flagged dependencies; add a student view and more languages.

---

## 7. Where to find more

| Document | What it covers |
|---|---|
| [README](../README.md) | Overview, pitch, architecture, how to run |
| [PRD](PRD.md) | The full requirements document |
| [Technical overview](../whiteboard-code-verifier/docs/technical-overview.md) | Detailed architecture and limits |
| [OCR options](../whiteboard-code-verifier/docs/ocr-options.md) | Why Qwen2-VL, and what we tried first |
| [OCR service](../whiteboard-code-verifier/ocr-service/README.md) | Setting up the handwriting reader |
