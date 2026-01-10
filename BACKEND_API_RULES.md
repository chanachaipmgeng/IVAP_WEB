# Backend API Rules & Conventions

## 1. Response Structure
- **Success:** Return Pydantic models or Dictionaries.
- **Error:** Use `error_handler` module. Do not raise raw HTTPExceptions manually.
  ```python
  # Good
  error_handler.not_found("User", user_id, request)
  
  # Bad
  raise HTTPException(status_code=404, detail="User not found")
  ```
- **Serialization:** Ensure all data types are JSON serializable.
  - **NumPy types:** Convert `np.int32`, `np.float32` to Python `int`, `float` explicitly.
  - **Date/Time:** Use ISO format strings.

## 2. Face Recognition & Biometrics
- **Engine:** Use **InsightFace (ArcFace)** via `onnxruntime-gpu`.
- **Embeddings:** Standard dimension is **512-d**.
- **Normalization:** Vectors MUST be L2 normalized before comparison/indexing.
- **Processing:** Use **In-Memory** processing for verification. Do not save temporary files.
- **Threshold:** Default verification threshold is **1.24** (Euclidean on normalized vectors).

## 3. Database & Models
- **ORM:** Use SQLAlchemy AsyncIO.
- **Repositories:** Use Repository pattern for DB access.
- **Naming:** 
  - Tables: `snake_case` (e.g., `face_encodings`)
  - Columns: `snake_case` (e.g., `member_id`)
  - Classes: `PascalCase` (e.g., `FaceEncoding`)

## 4. File Handling
- **Uploads:** Use `UploadFile`.
- **Storage:** 
  - Permanent: `enrolled_images/{id}.jpg`
  - Temporary: Process in RAM (BytesIO).
- **Paths:** Return relative paths from API (e.g., `/enrolled_images/...`).

## 5. Security
- **Endpoints:** Protect sensitive endpoints with `Security(get_current_user, scopes=[...])`.
- **Logging:** Do not log raw sensitive data (passwords, binary image data).

## 6. Dependency Versions (Critical)
- **NumPy:** Keep at version **1.x** (e.g., `1.26.4`). Do not upgrade to 2.x without verifying ONNX/OpenCV compatibility.
- **ONNX Runtime:** Use `onnxruntime-gpu` version matching the host CUDA version.
