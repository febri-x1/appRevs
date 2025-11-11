import React from 'react';
import '../style/logout.css';

function Logout({ isOpen, onConfirm, onCancel, userType = 'user' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🚪</div>
        <h3>Konfirmasi Logout</h3>
        <p>
          {userType === 'admin' 
            ? 'Apakah Anda yakin ingin keluar dari Admin Panel?' 
            : 'Apakah Anda yakin ingin keluar?'}
        </p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="btn-confirm-logout">
            Ya, Keluar
          </button>
          <button onClick={onCancel} className="btn-cancel-logout">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;