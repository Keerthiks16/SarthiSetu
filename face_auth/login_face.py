import cv2
import os
from deepface import DeepFace
import time

def login_user():
    print("📸 Opening webcam for login... Please look at the camera.")
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        print("❌ ERROR: Cannot access the webcam.")
        return

    print("⏳ Getting ready... Hold still for 3 seconds.")
    time.sleep(3)

    ret, frame = cam.read()
    if not ret:
        print("❌ ERROR: Could not capture frame.")
        cam.release()
        return

    temp_path = "temp_login.jpg"
    cv2.imwrite(temp_path, frame)
    cam.release()

    faces_folder = "faces"
    matched_user = None

    for filename in os.listdir(faces_folder):
        known_face_path = os.path.join(faces_folder, filename)

        try:
            result = DeepFace.verify(
                img1_path=temp_path,
                img2_path=known_face_path,
                model_name="Facenet512",
                detector_backend="opencv",
                enforce_detection=False
            )

            print(f"🧠 Compared with {filename} → Distance: {result['distance']:.4f}")

            if result['distance'] < 0.6:
                matched_user = filename.replace('.jpg', '').replace('.png', '')
                print(f"✅ Login successful! Welcome, {matched_user}")
                break

        except Exception as e:
            print(f"⚠️ Error comparing with {filename}: {e}")

    if not matched_user:
        print("❌ Login failed. No matching face found.")

    if os.path.exists(temp_path):
        os.remove(temp_path)

# 🔁 Run
login_user()
