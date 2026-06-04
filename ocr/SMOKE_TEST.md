# V409 OCR runtime loading note

V409 changes ONNX Runtime Web loading to avoid ORT's auto-selection of the JSEP runtime.

The previous failure looked like:

```text
no available backend found. ERR: [wasm] TypeError: Failed to fetch dynamically imported module: /ocr/ort/ort-wasm-simd-threaded.jsep.mjs
```

V409 explicitly loads `ort-wasm-simd-threaded.mjs` + `ort-wasm-simd-threaded.wasm`, uses one WASM thread, disables proxy mode, and imports the runtime module through a Blob URL to avoid local server `.mjs` MIME/path quirks.

Syntax checks run:

```text
node --check web-app/app.js
node --check web-app/ocr/local-sudoku-ocr.js
```

A static HTTP availability check should return 200 for:

```text
/ocr/ort/ort.min.js
/ocr/ort/ort-wasm-simd-threaded.mjs
/ocr/ort/ort-wasm-simd-threaded.wasm
/ocr/models/puzzle_localizer.ort
/ocr/models/puzzle_classifier.ort
```
