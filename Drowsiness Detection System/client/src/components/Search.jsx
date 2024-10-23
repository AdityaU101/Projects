import axios from "axios";
import React, { useState } from "react";
import Playlist from "./Playlist";

const API_KEY = "AIzaSyCLObPrRbABKCU95q-geNdJ30QWbcfIyuc"; // Replace with your actual API key
const BASE_URL = "https://youtube.googleapis.com/youtube/v3";

const Search = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [queryData, setQueryData] = useState(null);

  const search = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (query.includes("?v=")) {
        const videoId = query.split("?v=")[1];

        const response = await axios.get(`${BASE_URL}/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${API_KEY}`);
        setQueryData(response.data);
      } else if (query.includes("?list=")) {
        const playlistId = query.split("?list=")[1];

        const response = await axios.get(`${BASE_URL}/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${playlistId}&key=${API_KEY}`);
        setQueryData(response.data);
      } else {
        setError("Query cannot be empty or invalid!");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Invalid Playlist/Video Link or API request failed!");
    }
  };

  return (
    <div>
      <div className="max-w-[800px] mx-auto bg-gray-100 p-4">
        <p className="text-lg font-medium mb-2">Enter a link to a YouTube Video/Playlist</p>
        <form onSubmit={search}>
          <div className="flex gap-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              className={`p-2 border w-full text-lg placeholder:text-gray-400 placeholder:text-base rounded ${error && "border border-red-400"}`}
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            />
            <button className="px-4 py-1 font-bold text-white hover:bg-blue-600 bg-blue-400 rounded">Search</button>
          </div>
          {error && <p className="text-red-600 font-medium mt-2">{error}</p>}
        </form>
      </div>
      {queryData && <Playlist queryData={queryData} />}
    </div>
  );
};

export default Search;
