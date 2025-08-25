import cv2
import os
import time

def register_user(username):
    # Convert username to filename-safe format
    safe_username = username.strip().lower().replace(" ", "_")
    
    cam = cv2.VideoCapture(0)

    if not cam.isOpened():
        print("❌ ERROR: Cannot access webcam.")
        return

    print("📸 Capturing face for:", username)
    print("⏳ Please hold still... capturing in 3 seconds.")
    time.sleep(3)

    ret, frame = cam.read()
    if not ret:
        print("❌ ERROR: Failed to capture image.")
        cam.release()
        return

    faces_folder = "faces"
    os.makedirs(faces_folder, exist_ok=True)

    file_path = os.path.join(faces_folder, f"{safe_username}.jpg")
    cv2.imwrite(file_path, frame)

    print(f"✅ Face image saved as: {file_path}")

    cam.release()

# 🔁 Example usage
username = input("Enter username for registration: ")
register_user(username)
