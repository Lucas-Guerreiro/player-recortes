import React from 'react';
import { Video, Cloud, HardDrive, Search } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenDriveModal,
  connectedDriveFolder,
  totalVideosCount
}) {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00ff87 0%, #00b8ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 255, 135, 0.4)'
          }}>
            <Video size={26} color="#07090e" strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Replays dos Meus Gols ⚽
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Catalogador Esportivo & Streaming R2 / Drive</span>
              <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-dim)' }}></span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{totalVideosCount} replays disponíveis</span>
            </p>
          </div>
        </div>

        {/* Search Bar & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 340px', maxWidth: '600px', justifyContent: 'flex-end' }}>
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="text-input"
              placeholder="Buscar por gol, quadra, hora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px', borderRadius: '20px', fontSize: '0.85rem' }}
            />
          </div>

          <button
            onClick={onOpenDriveModal}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '10px 16px', borderRadius: '20px', whiteSpace: 'nowrap' }}
            title="Conectar Cloudflare R2 ou Google Drive"
          >
            <Cloud size={18} />
            <span>Conectar Cloudflare R2</span>
          </button>
        </div>

      </div>
    </header>
  );
}
