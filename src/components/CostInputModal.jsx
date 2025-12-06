import React, { useState } from 'react';
import '../style/logout.css'; 
import '../style/form.css';

function CostInputModal({ isOpen, booking, onClose, onSubmit, isSubmitting }) {
  const [biaya, setBiaya] = useState(booking?.biaya || '');
  const [errors, setErrors] = useState({});

  if (!isOpen || !booking) return null;

  const handleChange = (e) => {
    const value = e.target.value;
    // Hanya izinkan angka dan koma
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setBiaya(value);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!biaya || biaya.trim() === '') {
      newErrors.biaya = 'Biaya wajib diisi';
    } else if (isNaN(biaya) || parseFloat(biaya) <= 0) {
      newErrors.biaya = 'Biaya harus angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(booking.id, parseFloat(biaya), 'completed');
      setBiaya('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setBiaya(booking?.biaya || '');
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{maxWidth: '450px'}}
      >
        <div className="modal-header" style={{marginBottom: '1.5rem'}}>
          <h3 style={{color: 'var(--text-primary)', margin: '0 0 0.5rem 0'}}>
            💰 Input Biaya Service
          </h3>
          <button 
            type="button" 
            className="modal-close" 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div style={{marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: '8px'}}>
            <p style={{margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              <strong>ID Booking:</strong> #{booking.id}
            </p>
            <p style={{margin: '0 0 0.5rem 0', color: 'var(--text-primary)'}}>
              <strong>{booking.typeKendaraan}</strong>
            </p>
            <p style={{margin: '0', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Atas Nama: <strong>{booking.nama}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{color: 'var(--text-secondary)', fontWeight: '600'}}>
                Biaya Service <span style={{color: '#dc3545'}}>*</span>
              </label>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={{color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: '600'}}>
                  Rp
                </span>
                <input
                  type="text"
                  value={biaya}
                  onChange={handleChange}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'var(--bg-input)',
                    border: errors.biaya ? '2px solid #dc3545' : '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    textAlign: 'right'
                  }}
                />
              </div>
              {errors.biaya && (
                <small style={{color: '#dc3545', marginTop: '0.4rem', display: 'block'}}>
                  ❌ {errors.biaya}
                </small>
              )}
              <small style={{color: 'var(--text-secondary)', marginTop: '0.4rem', display: 'block'}}>
                Contoh: 50000 atau 75000.50
              </small>
            </div>

            <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem'}}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? '⏳ Menyimpan...' : '💾 Simpan & Selesaikan'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'var(--text-secondary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ❌ Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CostInputModal;