const PlaylistItem = ({ video, queryData, onClickVideo }) => {
  const { title, description, thumbnails } = video.snippet;
  const videoId = video.contentDetails.videoId;

  return (
    <div className="flex items-center gap-4" onClick={onClickVideo} key={videoId}>
      <img src={thumbnails.medium.url} className="flex-shrink-0" alt={title} />
      <div className="flex-1">
        <h3 className="font-bold hover:text-blue-600 cursor-pointer underline text-lg leading-tight mb-2">{title}</h3>
        <p className="">{description.length > 256 ? description.slice(0, 256) + "..." : description}</p>
      </div>
    </div>
  );
};

export default PlaylistItem;
