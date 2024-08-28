import React from 'react';
import '../css/GenreBlocks.css';

const GenreBlocks = () => {
  const genres = ['Romance', 'Haiku', 'Nature', 'Epic', 'Sonnet'];

  return (
    <div className="genre-blocks">
      <h2>Discover New Poetry</h2>
      <div className="blocks-grid">
        {genres.map((genre, index) => (
          <div key={index} className="genre-block">
            <p>{genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreBlocks;
