import cv2

for i in range(5):
    print("Testing camera index:", i)
    cap = cv2.VideoCapture(i)

    if not cap.isOpened():
        print("  ❌ Cannot open")
        continue

    ret, frame = cap.read()
    if ret:
        cv2.imshow(f"Camera {i}", frame)
        cv2.waitKey(1000)  # 1 second preview
        cv2.destroyAllWindows()
    else:
        print("  ❌ No frame")

    cap.release()
