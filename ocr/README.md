# Local Sudoku OCR runtime

This directory contains the browser-local Sudoku image recognition runtime used by YZF_Sudoku.

- No image is uploaded.
- No `sudoku-ocr.com` fallback is used.
- The OCR result is converted to Coach JSON and passed to the existing puzzle import path.
- Candidate marks are read by splitting each empty cell into the standard 3x3 pencil-mark positions.

Model attribution: Sudoku image recognition uses a local model trained by Alex Kubiesa / Sudoku OCR model family.

Files:

- `local-sudoku-ocr.js`: image preprocessing, localizer/classifier invocation, candidate extraction, Coach JSON output.
- `models/puzzle_localizer.ort`: 256x256 localizer model.
- `models/puzzle_classifier.ort`: 576x576 classifier model.
- `ort/`: local ONNX Runtime Web runtime files.


## V408 runtime path fix

ONNX Runtime Web wasm/mjs assets are resolved from an absolute URL derived from `import.meta.url`. This avoids duplicated paths such as `/ocr/ort/ocr/ort/ort-wasm-simd-threaded.jsep.mjs`. The package includes both the standard threaded WASM assets and the JSEP assets requested by ORT 1.26.
