import os
import pickle
import cv2
import face_recognition

print("=== TRAINING STARTED ===")

DATASET_DIR = "dataset"
MODEL_DIR = "trained_model"
MODEL_PATH = os.path.join(MODEL_DIR, "encodings.pickle")

os.makedirs(MODEL_DIR, exist_ok=True)

known_encodings = []
known_names = []

for student_id in os.listdir(DATASET_DIR):
    student_path = os.path.join(DATASET_DIR, student_id)

    if not os.path.isdir(student_path):
        continue

    print(f"[INFO] Processing student: {student_id}")

    for img_name in os.listdir(student_path):
        img_path = os.path.join(student_path, img_name)

        try:
            image = cv2.imread(img_path)

            if image is None:
                print(f"[SKIP] Cannot read {img_path}")
                continue

            # ✅ BGR → RGB (MOST IMPORTANT FIX)
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # 🔍 Detect face
            boxes = face_recognition.face_locations(rgb, model="hog")

            if len(boxes) == 0:
                print(f"[NO FACE] {img_path}")
                continue

            # 🧠 Encode face
            encodings = face_recognition.face_encodings(rgb, boxes)

            for encoding in encodings:
                known_encodings.append(encoding)
                known_names.append(student_id)

        except Exception as e:
            print(f"[ERROR] {img_path} : {e}")

print("[INFO] Saving encodings...")

data = {
    "encodings": known_encodings,
    "names": known_names
}

with open(MODEL_PATH, "wb") as f:
    pickle.dump(data, f)

print("✅ TRAINING COMPLETED")
print(f"📁 Total faces trained: {len(known_encodings)}")
print(f"📁 Model saved at: {MODEL_PATH}")
