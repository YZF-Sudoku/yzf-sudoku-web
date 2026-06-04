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
- `debug_samples/` - sample step-result files used for frontend highlight/debug verification

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
