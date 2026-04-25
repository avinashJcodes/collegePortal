import cv2
import face_recognition
import pickle
import os
import requests

print("=== FACE RECOGNITION STARTED ===")

MODEL_PATH = os.path.join("trained_model", "encodings.pickle")

with open(MODEL_PATH, "rb") as f:
    data = pickle.load(f)

known_encodings = data["encodings"]
known_names = data["names"]  # 👉 yahi Mongo _id hai

def mark_attendance(student_id):
   requests.post(
    "http://127.0.0.1:3000/attendance/mark-face",
    json={ "studentId": student_id },
    timeout=5
)

cap = cv2.VideoCapture(0)
print("🎥 Webcam started. Press Q or ESC to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

    locations = face_recognition.face_locations(rgb_small)
    encodings = face_recognition.face_encodings(rgb_small, locations)

    for encoding in encodings:
        matches = face_recognition.compare_faces(
            known_encodings, encoding, tolerance=0.5
        )

        if True in matches:
            index = matches.index(True)
            student_id = known_names[index]   # 🔥 Mongo _id
            print("🟢 Face matched:", student_id)
            mark_attendance(student_id)
            break

    cv2.imshow("Face Recognition", frame)

    if cv2.waitKey(10) & 0xFF in [ord("q"), 27]:
        break

cap.release()
cv2.destroyAllWindows()
print("✅ Program closed safely")
