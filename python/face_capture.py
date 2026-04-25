import cv2
import os

print("=== FACE CAPTURE SCRIPT STARTED ===")

# 🔹 Student ID input
STUDENT_ID = input("Enter Student ID: ").strip()

# 🔹 Dataset path
DATASET_DIR = "dataset"
STUDENT_DIR = os.path.join(DATASET_DIR, STUDENT_ID)
os.makedirs(STUDENT_DIR, exist_ok=True)

# 🔹 Haarcascade face detector
CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

# 🔹 Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Webcam not accessible")
    exit()

count = 0
MAX_IMAGES = 20

print("📸 Instructions:")
print("- Camera ke samne seedha dekho")
print("- Light samne se ho")
print("- Sirf 1 face frame me ho")
print("- Q dabao exit ke liye")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        minSize=(120, 120)
    )

    # 🔒 Save only when EXACTLY ONE face detected
    if len(faces) == 1:
        (x, y, w, h) = faces[0]

        # Face box draw
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Face ROI
        face_img = frame[y:y+h, x:x+w]

        count += 1
        img_path = os.path.join(STUDENT_DIR, f"{count}.jpg")
        cv2.imwrite(img_path, face_img)

        print(f"[SAVED] {img_path}")

        cv2.putText(
            frame,
            f"Captured: {count}/{MAX_IMAGES}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    elif len(faces) > 1:
        cv2.putText(
            frame,
            "Multiple faces detected!",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

    else:
        cv2.putText(
            frame,
            "No face detected",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            2
        )

    cv2.imshow("Face Capture", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

    if count >= MAX_IMAGES:
        print("✅ Face capture completed")
        break

cap.release()
cv2.destroyAllWindows()
