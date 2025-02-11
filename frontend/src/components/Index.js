import React from 'react';
import '../index.css';

function IndexPage() {
  return (
    <div className="container">
      <header className="header">
        <h1>COD - Cars on Demand!</h1>
        <p className="tagline">Drive the Future, Today!</p>
        <nav>
          <a href="/signup" className="nav-link">Sign Up</a>
          <a href="/login" className="nav-link">Login</a>
        </nav>
      </header>
    </div>
  );
}

export default IndexPage;
