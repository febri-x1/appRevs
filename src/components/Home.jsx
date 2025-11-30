import React from 'react';
import { Link } from 'react-router-dom';
import '../style/home.css';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';

function Home() {
  // Fungsi smooth scroll untuk link "Home" dan "About"
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* NAVBAR */}
      <nav className="home-navbar">
        <div className="home-logo">
          Narko Bintang Motor 🏍️
        </div>

        <div className="home-nav-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            Home
          </a>

           <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
            About Company
          </a>
          
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn-login-nav">
            Service Booking
          </Link>
          <ThemeToggle/>
        </div>
      
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1>Solusi Terbaik untuk Motor Anda</h1>
          <p>
            Layanan service motor profesional, cepat, dan terpercaya. 
            Booking jadwal service Anda sekarang tanpa antre lama.
          </p>
          <Link to="/login" className="cta-button">
            Booking Service Sekarang ➡️
          </Link>
        </div>
      </section>

      {/* ABOUT COMPANY SECTION */}
      <section id="about" className="about-section">
        <div className="about-container">
          <h2>Tentang Kami</h2>
          <p>
            Narko Bintang Motor berdiri sejak tahun 2007 dengan visi memberikan pelayanan 
            perawatan kendaraan roda dua yang modern dan transparan. Kami memiliki mekanik 
            bersertifikat dan peralatan canggih untuk menangani berbagai jenis motor, 
            mulai dari Matic, Bebek, hingga Sport.
          </p>
          <br />
          <p>
            Komitmen kami adalah kepuasan pelanggan. Dengan sistem booking online, 
            kami memastikan Anda tidak perlu membuang waktu berharga hanya untuk mengantre 
            di bengkel.
          </p>
        </div>
      </section>

      <Footer/>
      
    </div>
  );
}

export default Home;