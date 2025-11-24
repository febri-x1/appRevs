import React from 'react';
import { Link } from 'react-router-dom';
import '../style/home.css';
import ThemeToggle from './ThemeToggle';

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
          🏍️ Motor Service Center
        </div>
        <div className="home-nav-links">
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
            Home
          </a>
          
          <ThemeToggle/>
          
          {/* Service Booking mengarah ke Login sesuai permintaan */}
          <Link to="/login" className="btn-login-nav">
            Service Booking
          </Link>
          
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>
            About Company
          </a>
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
            Motor Service Center berdiri sejak tahun 2020 dengan visi memberikan pelayanan 
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

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Motor Service Center</h3>
            <p>
              Bengkel modern terpercaya untuk segala kebutuhan perawatan motor Anda.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Layanan</h3>
            <ul>
              <li>Service Rutin</li>
              <li>Ganti Oli</li>
              <li>Tune Up</li>
              <li>Perbaikan Mesin</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Kontak</h3>
            <p>📍 Jl. Teknologi No. 123, Jakarta</p>
            <p>📞 0812-3456-7890</p>
            <p>📧 support@motorservice.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Motor Service Center. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;