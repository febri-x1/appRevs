import React from 'react';
import '../style/home.css'; // Pastikan path css sesuai, biasanya footer memakai style dari home.css atau footer.css

function Footer() {
  return (
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
          <p>📍 Kp. Pabuaran Manis Jaya No.27 RT.001/RW.001, Jatiuwung, Banten.</p>
          <p>📞 0857-7800-5980</p>
          <p>📧 support@motorservice.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Narko Bintang Motor. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;