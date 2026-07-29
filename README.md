# YZF Sudoku Web

YZF Sudoku Web is the browser runtime release of the YZF Sudoku project.

This repository contains the deployable web version of the Sudoku solver, including the WebAssembly solver runtime, frontend interface, local OCR integration, worker scripts, and user documentation.

## Online Usage

If GitHub Pages is enabled for this repository, the application can be opened directly from the deployed Pages URL.

Because `index.html` is placed in the repository root, GitHub Pages should be configured as:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

## Local Usage

Do not open `index.html` directly by double-clicking it. Some browser features, including WebAssembly loading, Web Workers, module imports, and OCR runtime files, may not work correctly under the `file://` protocol.

Start a local HTTP server inside this folder instead:

```powershell
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

## Repository Contents

Main files and folders:

- `index.html` - main web page
- `app.js` - frontend application logic
- `sudoku_wasm.js` - JavaScript glue code for the WebAssembly solver
- `sudoku_wasm.wasm` - WebAssembly solver runtime
- `solver-worker.js` - background solver worker
- `training-worker.js` - background training / analysis worker
- `user_manual.html` - user manual
- `ocr/` - local OCR runtime, OCR model files, and OCR documentation


## Mobile Solve Mode

On phones and narrow touch devices, use the **Solve / 做题** button in the board header to enter the dedicated mobile solve layout.

- Portrait: the board uses nearly the full screen width and the number pad remains docked at the bottom.
- Landscape: the board uses nearly the full screen height and the number pad moves to the right side.
- The solve viewport does not rely on document scrolling; the board and input controls remain visible together.
- **More / 更多** opens hints, apply, all steps, puzzle input, language, and the return-to-analysis action without resizing the board.
- On mobile viewports, the existing fullscreen button enters solve mode before requesting browser fullscreen. The solve layout still works if the browser declines fullscreen.

The active puzzle, selected digit, input mode, undo/redo history, and language are preserved when rotating the device or returning to analysis mode.

### Screen Wake Lock

Solve Mode keeps the screen awake by default through the browser Screen Wake Lock API. The toggle is available in **More / 更多** and is stored with the other mobile solve preferences.

- The lock is requested only while Solve Mode is active and the page is visible.
- It is released when leaving Solve Mode.
- Browsers release it when the app goes into the background; YZF requests it again after returning to the foreground.
- HTTPS, localhost, or an installed PWA is required. Battery saver or device policy may still reject the request.

## Help & Workspaces / 帮助与现场

The top bar keeps frequent actions visible and collects less-frequent tools in one responsive **Help & workspaces / 帮助与现场** center.

- Resume the autosaved board, an unfinished OCR correction draft, or one of up to 12 deduplicated recent puzzles.
- Review long-running rating, solving, generation, OCR, batch, save, and PWA tasks without relying on an ambiguous spinner.
- Open the bilingual user manual and technique guide, or replay the quick-start, Manual Marks, OCR correction, and TLG editing guides. OCR replay first attempts a clipboard image and falls back to the existing image picker with a guided Choose Image action.
- Switch Chinese/English and copy diagnostic information from the same center.

Desktop uses a centered dialog. Phone portrait uses a bottom sheet, while low-height landscape uses a right-side sheet. The same center is available from Mobile Solve Mode.

主现场格式 v2 会保存完整手工标记并兼容 v1；OCR 草稿在确认导入前不会改写主盘。清除浏览器站点数据会一并移除这些本地现场。

## Bilingual UI Contract / 双语界面契约

Visible UI additions must provide both Simplified Chinese and English in the application text configuration. Update `user_manual.html` in both languages whenever a user-facing workflow changes, then run:

```bash
python tools/test_bilingual_ui_contract.py
python tools/test_ui_foundation_browser.py
python tools/test_ocr_guide_launch_browser.py
```

## WebAssembly Solver

The Sudoku solving engine runs in the browser through WebAssembly.

The files `sudoku_wasm.js` and `sudoku_wasm.wasm` are generated runtime artifacts and are included in this repository because this repository is intended to host the runnable web release.

The native C++ source tree, CMake configuration, local build scripts, and full development project are not included in this web release repository.

## OCR Notice and Attribution

The OCR feature is integrated for local browser-side Sudoku image recognition.

The OCR model used by this project was trained by **Alex Kubiesa**.

Author attribution:

- Alex Kubiesa
- LinkedIn: https://www.linkedin.com/in/alex-kubiesa-05a49662/

The OCR model files are included here only to support local Sudoku grid recognition in this web release. They should not be treated as original model work by the YZF Sudoku project.

Please preserve this attribution notice when redistributing this web release or repackaging the OCR assets.

If the OCR model author or rights holder provides additional license terms, attribution requirements, or redistribution conditions, those terms should take precedence for the OCR model files.

## ONNX Runtime Web Notice

The OCR feature uses ONNX Runtime Web assets to run the OCR models in the browser.

ONNX Runtime Web and its related runtime files remain third-party components and are subject to their original license terms.

The ORT runtime files in `ocr/ort/` are included so that OCR can run locally without depending on a remote OCR service.

## Local OCR Behavior

OCR runs locally in the browser.

The application does not need to upload images to a remote OCR server for recognition. The OCR runtime and model files are loaded from the local `ocr/` folder.

Depending on browser security settings and deployment environment, OCR may require the page to be served through HTTP/HTTPS rather than opened directly from the file system.

## Browser Notes

For best compatibility, use a modern Chromium-based browser such as Chrome or Edge.

If OCR fails to initialize, check the browser developer console and network panel to confirm that the required files under `ocr/ort/` and `ocr/models/` are being loaded successfully.

## Update Workflow

After rebuilding or updating the web runtime locally, update this repository from the `web-app` folder:

```powershell
cd D:\sudoku-wasm-minimal\web-app
git status
git add .
git commit -m "Update web app"
git push
```

## Packaging

This repository is the web runtime release folder.

To create a distributable zip package, package the contents of this folder while excluding the internal `.git` directory.

Example PowerShell packaging command from the project root:

```powershell
cd D:\sudoku-wasm-minimal

$src = "D:\sudoku-wasm-minimal\web-app"
$tmp = "D:\sudoku-wasm-minimal\_package_yzf_sudoku_web"
$zip = "D:\sudoku-wasm-minimal\yzf-sudoku-web-release.zip"

Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zip -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path $tmp | Out-Null

robocopy $src $tmp /E /XD ".git" /XF "*.log" | Out-Null

Compress-Archive -Path "$tmp\*" -DestinationPath $zip -Force

Remove-Item $tmp -Recurse -Force

Write-Host "Package created: $zip"
```

## License and Third-Party Assets

This repository may contain project-specific web runtime files, generated WebAssembly runtime files, and third-party runtime/model assets.

Third-party assets remain subject to their original licenses and attribution requirements.

The OCR model files are credited to **Alex Kubiesa** and are not claimed as original model work by the YZF Sudoku project.

ONNX Runtime Web files remain third-party runtime components.

Project-specific frontend logic, documentation, integration code, and generated web runtime packaging belong to the YZF Sudoku project unless otherwise stated.

## PWA full-offline build

The regular `web-app` deployment is an installable PWA. Before packaging or
publishing, regenerate the atomic offline asset manifest after every frontend,
WASM, Worker, OCR, manual, icon, or model change:

```bash
python3 tools/generate_pwa_assets.py
```

Deploy `app.webmanifest`, `sw.js`, `pwa-assets.js`, `icons/`, and every file
listed by `pwa-assets.js` together. The service worker installs a release only
after all listed resources are cached. Query-bearing shared puzzle URLs reuse
the cached `index.html` app shell instead of creating one cache entry per
puzzle.

For local PWA testing use `http://localhost` (treated as a secure context) or
HTTPS. Direct `file://` opening remains the job of `index_standalone.html` and
does not register a service worker.

## Incremental and resumable PWA releases

`sw.js` keeps each release atomic while avoiding full-package downloads on every update:

- `pwa-assets.js` records the full SHA-256 and byte size of every offline asset.
- Unchanged assets are copied from the previous verified release cache.
- A failed target release keeps its verified files in the versioned staging cache.
- Large `.wasm` and `.ort` assets use 1 MiB HTTP Range chunks when supported; cached chunks survive a failed installation and are reused by the next update check.
- If Range is unavailable, the worker falls back to whole-file download.
- The previous complete release is deleted only after the new release has fully verified and activated.

When changing any published web asset, regenerate the manifest and standalone build:

```bash
python tools/generate_pwa_assets.py
python tools/build_standalone_html.py
```

The browser retry path must call `ServiceWorkerRegistration.update()` before messaging the active worker. A failed installing worker is redundant and cannot be resumed by sending a repair message to the previous active release; the new installer must be recreated so it can reopen the same staging cache.

### Waiting/activation handshake

The update-ready UI must be driven by `ServiceWorkerRegistration.waiting`, not by an early message sent near the end of the install event. The worker reports `YZF_PWA_STAGED` after download/verification; the page turns the cloud purple only after the browser has promoted that worker to `waiting`. Applying the update uses a confirmed handshake:

1. the page persists an apply-pending flag and sends `YZF_PWA_SKIP_WAITING` to the exact waiting worker through a transferred `MessageChannel`;
2. the worker replies `ACCEPTED`; if verification finds an evicted or missing cache entry, it reports `ACTIVATION_REPAIRING`, runs the same incremental/resumable repair pipeline, and verifies again;
3. the worker reports `ACTIVATING` and calls `skipWaiting()` inside `event.waitUntil()`; failures return `ACTIVATION_ERROR` with the failing asset/message instead of silently timing out;
4. the page observes the point-to-point replies, the waiting worker's `statechange`, the broadcast `READY` message, and `controllerchange`. Any authoritative activated signal completes the switch and reloads the page, which avoids Android browsers that delay or omit `controllerchange`;
5. a manual refresh during this interval resumes the pending activation instead of returning to a permanently purple cloud.

`sw.js` itself is intentionally excluded from `pwa-assets.js`: the browser owns Service Worker script update checks (`updateViaCache: "none"`), while the offline manifest covers only runtime assets that the active release must serve.

## TLG dual Virtual Sets

TLG supports two independent exact-cardinality Virtual Sets. Each group has its
own candidate bitmap and cardinality (`1..4`), and the two groups may overlap.
A candidate shared by both groups contributes to both cardinality equations.

Frontend and backend compatibility rules:

- Requests use `virtualSets: [{ candidates, cardinality }, ...]` with at most two groups.
- When only one group is active the frontend also emits the legacy `virtualSet`
  field so older readers can still inspect the request.
- Binary TLG library records use schema v2 while remaining exactly 2048 bytes;
  schema v1 imports as Virtual Set 1 with an empty Virtual Set 2.
- Text sharing uses `YZF-TLG-CASE:2` / `YZFTLG2` and stores the groups as
  `VIRTUAL1[k]`, `VIRTUAL2[k]` / `W1=`, `W2=`. Version 1 text remains importable.
- The renderer draws two independent black networks and adds small `1` / `2`
  membership tabs to candidate badges. Overlapping members display both tabs.

Any change to the dual-set state, binary/text serialization, renderer, WASM
request schema, or localized UI must keep all of the above layers synchronized.
