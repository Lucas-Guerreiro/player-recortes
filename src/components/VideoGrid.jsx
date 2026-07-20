import React from 'react';
import VideoCard from './VideoCard';
import { Video, Trophy, Flame, Eye, SearchX } from 'lucide-react';

export default function VideoGrid({ videos, onPlayVideo, onResetFilters }) {
  if (videos.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', margin: '20px 0' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 42, 95, 0.1)',
          color: 'var(--accent-red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <SearchX size={32} />
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
          Nenhum replay encontrado para o filtro selecionado
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px auto' }}>
          Tente alterar o Complexo, Quadra, Data ou Hora na barra superior para localizar seus replays de gols.
        </p>
        <button onClick={onResetFilters} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          Restaurar Filtros
        </button>
      </div>
    );
  }

  // Estatísticas rápidas do conjunto atual
  const totalVisualizacoes = videos.reduce((acc, v) => acc + (v.visualizacoes || 0), 0);

  return (
    <section>
      
      {/* Mini Stats Highlight */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: '1 1 180px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy color="var(--accent-yellow)" size={24} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', uppercase: true }}>Catalogados</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{videos.length} Gols</div>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: '1 1 180px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Eye color="var(--accent-cyan)" size={24} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visualizações</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalVisualizacoes}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ flex: '1 1 180px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Flame color="var(--accent-green)" size={24} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qualidade</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>60 FPS HD</div>
          </div>
        </div>
      </div>

      {/* Grid of Video Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            onPlayVideo={onPlayVideo}
          />
        ))}
      </div>

    </section>
  );
}
