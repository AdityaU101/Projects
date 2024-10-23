
from flask import Flask, request, jsonify
import cv2
import dlib
import numpy as np
from scipy.spatial import distance
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


# INITIALIZE FACE DETECTOR AND LANDMARK PREDICTOR
face_detector = dlib.get_frontal_face_detector()
dlib_facelandmark = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

def Detect_Eye(eye):
    poi_A = distance.euclidean(eye[1], eye[5])
    poi_B = distance.euclidean(eye[2], eye[4])
    poi_C = distance.euclidean(eye[0], eye[3])
    aspect_ratio_Eye = (poi_A + poi_B) / (2 * poi_C)
    return aspect_ratio_Eye

@app.route('/calibrate', methods=['POST'])
def calibrate():
    files = []
    for i in range(0, 100):
        files.append(request.files['calibration_image_' + str(i)])
    eye_ratios = []

    for file in files:
        npimg = np.fromfile(file, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        gray_scale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_detector(gray_scale)
        for face in faces:
            face_landmarks = dlib_facelandmark(gray_scale, face)
            leftEye = []
            rightEye = []
            for n in range(42, 48):
                x = face_landmarks.part(n).x
                y = face_landmarks.part(n).y
                rightEye.append((x, y))
            for n in range(36, 42):
                x = face_landmarks.part(n).x
                y = face_landmarks.part(n).y
                leftEye.append((x, y))
            right_Eye = Detect_Eye(rightEye)
            left_Eye = Detect_Eye(leftEye)
            eye_ratios.append((left_Eye + right_Eye) / 2)

    if len(eye_ratios) == 0:
        return jsonify({"error": "No eyes detected in calibration images"}), 400
    
    avg_eye_ratio = np.mean(eye_ratios)
    threshold = avg_eye_ratio * 0.8  # Set threshold to 80% of average open eye ratio

    return jsonify({"threshold": threshold})

@app.route('/detect_drowsiness', methods=['POST'])
def detect_drowsiness():
    file = request.files['image']
    threshold = request.form.get('threshold', type=float)

    npimg = np.fromfile(file, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    gray_scale = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_detector(gray_scale)
    drowsy = False

    for face in faces:
        face_landmarks = dlib_facelandmark(gray_scale, face)
        leftEye = []
        rightEye = []
        for n in range(42, 48):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            rightEye.append((x, y))
        for n in range(36, 42):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            leftEye.append((x, y))
        right_Eye = Detect_Eye(rightEye)
        left_Eye = Detect_Eye(leftEye)
        Eye_Rat = (left_Eye + right_Eye) / 2
        print(Eye_Rat)
        if Eye_Rat < threshold:
            drowsy = True

    return jsonify({"drowsy": drowsy})

if __name__ == '__main__':
    app.run(debug=True)
