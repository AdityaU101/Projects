import React from 'react';
import '../css/FeaturedPoets.css';
import johnkeats from '../images/johnkeats.jpeg'
import emdi from '../images/emdi.png'
import rofr from '../images/rofr.jpeg'

const FeaturedPoets = () => {
  const poets = [
    { name: 'John Keats', excerpt: '"A thing of beauty is a joy forever."', image: johnkeats },
    { name: 'Emily Dickinson', excerpt: '"Hope is the thing with feathers..."', image: emdi },
    { name: 'Robert Frost', excerpt: '"The woods are lovely, dark and deep..."', image: rofr }
  ];

  return (
    <div className="featured-poets">
      <h2>Featured Poets</h2>
      <div className="poets-grid">
        {poets.map((poet, index) => (
          <div key={index} className="poet-card">
            <img src={poet.image} alt={poet.name} />
            <h3>{poet.name}</h3>
            <p>{poet.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPoets;
