import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactPlayer from "react-player";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import audioPath from "../alert.mp3";
import PlaylistItem from "./PlaylistItem";

const DrowsinessDetector = () => {
  const webcamRef = useRef(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(localStorage.getItem("threshold") !== null);
  const [threshold, setThreshold] = useState(localStorage.getItem("threshold"));
  const [drowsy, setDrowsy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const playlistData = location.state?.playlistData || JSON.parse(localStorage.getItem("currentQuery")) || { items: [] };
  const selectedId = localStorage.getItem("selectedId") || location.state?.selectedId;

  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => {
    const initialVideoIndex = playlistData.items.findIndex((item) => item.contentDetails.videoId === selectedId);
    return initialVideoIndex !== -1 ? initialVideoIndex : 0;
  });

  const currentVideo = playlistData.items[currentVideoIndex];
  const videoId = currentVideo?.contentDetails?.videoId || currentVideo?.id;
  const videoUrl = videoId ? "https://www.youtube.com/watch?v=" + videoId : null;

  const [videoDrowsinessData, setVideoDrowsinessData] = useState([]);

  useEffect(() => {
    localStorage.setItem("selectedId", videoId);
    setVideoDrowsinessData([]);
  }, [currentVideoIndex]);

  useEffect(() => {
    if (!calibrated) return;

    const intervalId = setInterval(capture, 1000);
    return () => clearInterval(intervalId);
  }, [calibrated]);

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = await fetch(imageSrc).then((res) => res.blob());
      const formData = new FormData();
      formData.append("image", blob, "webcam.jpg");
      formData.append("threshold", threshold);

      try {
        const response = await axios.post("http://localhost:5000/detect_drowsiness", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setDrowsy(response.data.drowsy);
        setVideoDrowsinessData((prevData) => [...prevData, { time: Date.now(), drowsy: response.data.drowsy }]);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleVideoEnd = () => {
    const videoData = playlistData.items[currentVideoIndex].snippet;
    const existingData = JSON.parse(localStorage.getItem("drowsinessAnalysisResults")) || [];
    console.log(existingData);

    const found = existingData.indexOf((item) => item.videoId === videoId);
    let updatedData;
    if (found !== -1)
      updatedData = existingData.map((item) =>
        item.videoId === videoId
          ? {
              videoId,
              videoTitle: videoData.title,
              channelTitle: videoData.channelTitle,
              data: videoDrowsinessData,
            }
          : item
      );
    else
      updatedData = [
        ...existingData,
        {
          videoId,
          videoTitle: videoData.title,
          channelTitle: videoData.channelTitle,
          data: videoDrowsinessData,
        },
      ];

    localStorage.setItem("drowsinessAnalysisResults", JSON.stringify(updatedData));

    if (currentVideoIndex < playlistData.items.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      localStorage.removeItem("currentQuery");
      localStorage.removeItem("selectedId");
      navigate("/analysis");
    }
  };

  const onClickVideo = (videoId) => {
    localStorage.setItem("selectedId", videoId);
    const initialVideoIndex = playlistData.items.findIndex((item) => item.contentDetails.videoId === selectedId);
    setCurrentVideoIndex(initialVideoIndex);
  };

  const handleCalibration = async () => {
    setIsCalibrating(true);

    try {
      const calibrationFrames = await Promise.all(
        Array.from({ length: 100 }).map(async (_, i) => {
          await new Promise((resolve) => setTimeout(resolve, 50 * i)); // Stagger requests
          const imageSrc = webcamRef.current.getScreenshot();
          return fetch(imageSrc).then((res) => res.blob());
        })
      );

      const formData = new FormData();
      calibrationFrames.forEach((frame, index) => {
        formData.append("calibration_image_" + index, frame, "webcam_" + index + ".jpg");
      });

      const response = await axios.post("http://localhost:5000/calibrate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("threshold", response.data.threshold);
      setThreshold(response.data.threshold);
      setCalibrated(true);
    } catch (error) {
      console.error("Error during calibration:", error);
      if (error.response?.status === 200) {
        // Handle cases where the server might return 200 with an error message
        setCalibrated(true);
      }
    } finally {
      setIsCalibrating(false);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-center">
        {!videoId && (
          <div className="px-8 py-8 bg-gray-200 flex items-center flex-col">
            <i className="fa-solid fa-magnifying-glass mb-2 text-4xl"></i>
            <p className="text-lg leading-tight font-bold text-center">No playlist or video selected. Go to the Home tab to search for one!</p>
          </div>
        )}
        {videoId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {!calibrated && (
              <div className="bg-red-200 py-4 px-8 rounded flex flex-col">
                <p className="text-center mb-4 font-bold leading-tight text-lg">
                  Calibration required! Look at the webcam screen, click the button to begin calibration to your facial data.
                </p>
                <button
                  disabled={isCalibrating}
                  onClick={handleCalibration}
                  className={`disabled:bg-black px-4 py-1 rounded font-bold bg-gray-600 text-white mx-auto hover:bg-gray-800 ${isCalibrating && "bg-gray-800"}`}
                >
                  {!isCalibrating && (!calibrated ? "Calibrate" : "Not Working? Recalibrate")}
                  {isCalibrating && "Calibrating. Please wait..."}
                </button>
              </div>
            )}
            {playlistData && <Webcam className={`${calibrated ? "fixed bottom-2 -right-6 w-64 h-32" : ""}`} audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />}
            {calibrated && videoId && (
              <ReactPlayer style={{ marginInline: "auto", marginBottom: "16px" }} width={1024} height={586} onEnded={handleVideoEnd} playing={!drowsy} url={videoUrl} controls />
            )}
            <ReactPlayer url={audioPath} loop playing={drowsy} width={0} height={0} />
          </div>
        )}
        {drowsy &&
          createPortal(
            <div className="absolute w-128 top-4 left-1/2 bg-red-500 text-white -translate-x-1/2 p-4 rounded">
              <p style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold" }}>Falling asleep. Wake up!</p>
            </div>,
            document.body
          )}
      </div>
      {calibrated && (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
          {playlistData.items.map((video) => (
            <PlaylistItem onClickVideo={() => onClickVideo(video.contentDetails.videoId)} key={video.id} video={video} queryData={playlistData} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DrowsinessDetector;
