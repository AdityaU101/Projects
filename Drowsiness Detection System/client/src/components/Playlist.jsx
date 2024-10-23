import React from "react";
import { useNavigate } from "react-router-dom";
import PlaylistItem from "./PlaylistItem";

const Playlist = ({ queryData }) => {
  const navigate = useNavigate();

  const onClickVideo = (videoId) => {
    localStorage.setItem("currentQuery", JSON.stringify(queryData));
    localStorage.setItem("selectedId", videoId);

    navigate("/watch", {
      state: {
        selectedId: videoId,
        playlistData: queryData,
      },
    });
  };

  return (
    <div className="flex flex-col mt-12">
      <h2 className="text-3xl mb-4 font-bold">Results</h2>
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        {queryData.items.map((video) => (
          <PlaylistItem onClickVideo={() => onClickVideo(video.contentDetails.videoId)} key={video.id} video={video} queryData={queryData} />
        ))}
      </div>
    </div>
  );
};

export default Playlist;
