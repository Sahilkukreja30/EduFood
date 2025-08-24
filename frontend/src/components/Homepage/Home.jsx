// src/pages/Home.jsx
import React from "react";
import "./Home.css";

export default function Home() {

    
  return (
    <div className="home-container">

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2>Order Fresh Food, <span>Anytime</span></h2>
          <p>Skip the wait! Place your order online and let staff jump the queue when needed.</p>
          <a href="/menu" className="hero-btn">Explore Menu</a>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <h3>Real-Time Queue</h3>
          <p>Watch live updates as your food order moves through the queue.</p>
        </div>
        <div className="feature-card">
          <h3>Priority Ordering</h3>
          <p>Staff orders jump ahead automatically to save time.</p>
        </div>
        <div className="feature-card">
          <h3>Campus Exclusive</h3>
          <p>Service built only for students & staff within campus.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 CampusCanteen | Built for Campus Life</p>
      </footer>
    </div>
  );
}