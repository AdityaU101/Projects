import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturedPoets from './components/FeaturedPoets';
import GenreBlocks from './components/GenreBlocks';
import Footer from './components/Footer';
import '../src/css/App.css';

function App() {
  return (
    <div className="App">
        <div className='web-top'>
            <Header />
      <HeroSection />
        </div>
      <div className='web-body'>
        <FeaturedPoets />
        <GenreBlocks />
      </div>
      <Footer />
    </div>
  );
}

export default App;
//Further developments include using React-router to route to multiple webpages including in detail modification and additional information.