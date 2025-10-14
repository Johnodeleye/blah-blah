import React from 'react';
import logo from './logo.svg';
import './App.css';

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: "Check this out",
      text: "I Found something awesome",
      url: "https://bit.ly/join-hubpost"
    });
  } else {
    alert("sharing not supported on this browser")
  }
};

function App() {
 return (
  <>
    <h1 className='text-5xl font-bold text-red-500 bg-yellow-200 '>
      HUBPOST
    </h1>
    <button onClick={handleShare}>click to share</button>
    </>
  )
}

export default App;