import React from "react";

const VideoAnalysis = ({ videoData }) => {
  const {
    videoTitle,
    channelTitle,
    data: videoDrowsinessData,
    videoId,
  } = videoData;
  const totalDrowsyTime = videoDrowsinessData.filter(
    (data) => data.drowsy
  ).length;
  const totalTime = videoDrowsinessData.length;
  const drowsyEpisodes = totalDrowsyTime; // Same as totalDrowsyTime
  const avgDrowsyDuration = totalDrowsyTime / (drowsyEpisodes || 1);

  return (
    <div className="border p-4 rounded-md" key={videoId}>
      <div className="mb-4">
        <h4 className="text-xl leading-tight font-bold mb-1">{videoTitle}</h4>
        <span>{channelTitle}</span>
      </div>
      <table className="mb-4">
        <tbody>
          <tr>
            <td className="font-bold">Total Drowsy Time</td>
            <td>{totalDrowsyTime} seconds</td>
          </tr>
          <tr>
            <td className="font-bold">Video Length</td>
            <td>{totalTime} seconds</td>
          </tr>
          <tr>
            <td className="font-bold">Average Drowsy Duration</td>
            <td>{avgDrowsyDuration} seconds</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VideoAnalysis;
