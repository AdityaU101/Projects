// DrowsinessAnalysis.js
import { useLocation } from "react-router-dom";
import VideoAnalysis from "./VideoAnalysis";

const DrowsinessAnalysis = () => {
  const storedData = JSON.parse(localStorage.getItem("drowsinessAnalysisResults")) || [];
  const location = useLocation();
  const allVideoDrowsinessData = location.state?.allVideoDrowsinessData || storedData;

  return (
    <div>
      {allVideoDrowsinessData.length === 0 ? (
        <div className="px-8 py-8 bg-gray-200 flex items-center flex-col">
          <i className="fa-solid fa-magnifying-glass mb-2 text-4xl"></i>
          <p className="text-lg leading-tight font-bold text-center">Start watching videos to begin analysis!</p>
        </div>
      ) : (
        <>
          <h3 className="text-4xl font-bold mb-4">Analysis Results</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {allVideoDrowsinessData.map((videoData) => (
              <VideoAnalysis key={videoData.videoId} videoData={videoData} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DrowsinessAnalysis;
