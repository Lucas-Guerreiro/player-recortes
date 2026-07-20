import React, { useState } from 'react';
import { Play, Download, Share2, Eye, Clock, Check, Camera } from 'lucide-react';
import { getMediaDownloadUrl } from '../utils/driveHelper';

export default function VideoCard({ video, onPlayVideo }) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(video.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const handleDownload = (e) => {
    e.stopPropagation();
    const downloadUrl = getMediaDownloadUrl(video.videoUrl);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `⚽ Replay de Gol no ${video.complexo} (${video.quadra}) - ${formattedDate} às ${video.hora}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="glass-panel video-card"
      onClick={() => onPlayVideo(video)}
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease'
      }}
    >
      
      {/* Thumbnail + Overlays */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#0d131f' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loading="lazy"
        />

        {/* Play Button Glow Overlay */}
        <div 
          className="play-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7, 9, 14, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s ease'
          }}
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ff87 0%, #00b8ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(0, 255, 135, 0.6)'
          }}>
            <Play size={24} color="#07090e" fill="#07090e" style={{ marginLeft: '3px' }} />
          </div>
        </div>

        {/* Badge Hora Exacta */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(4px)',
          color: '#fff',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Clock size={12} color="var(--accent-green)" />
          {video.hora}
        </div>

        {/* Badge Câmera (Ugreen / Anker) */}
        {video.camera && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(0, 184, 255, 0.9)',
            color: '#07090e',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Camera size={12} />
            Câmera {video.camera}
          </div>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        
        {/* Badges de Metadados: Complexo, Quadra e Data */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          <span className="badge badge-complexo">{video.complexo}</span>
          <span className="badge badge-quadra">{video.quadra}</span>
          <span className="badge badge-data">{formattedDate}</span>
        </div>

        {/* Título do Vídeo */}
        <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35, marginBottom: '12px' }}>
          {video.title}
        </h3>

        {/* Footer do Card com Ações */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            <Eye size={14} color="var(--accent-green)" />
            <span>{video.visualizacoes || 1} visualizações</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleShare}
              className="btn-icon"
              title="Compartilhar Replay"
              style={{ width: '32px', height: '32px', padding: 0 }}
            >
              {copied ? <Check size={14} color="var(--accent-green)" /> : <Share2 size={14} />}
            </button>

            <button
              onClick={handleDownload}
              className="btn-icon"
              title="Baixar Vídeo MP4"
              style={{ width: '32px', height: '32px', padding: 0, color: 'var(--accent-green)' }}
            >
              <Download size={14} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
