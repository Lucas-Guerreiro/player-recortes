import React, { useState } from 'react';
import { Play, Download, Share2, Building2, Grid, Calendar, Clock, Check } from 'lucide-react';
import { getDriveDownloadUrl } from '../utils/driveHelper';

export default function VideoCard({ video, onPlayVideo }) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(video.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Função de Download sem AccessDenied
  const handleDownload = (e) => {
    e.stopPropagation();
    const downloadUrl = getDriveDownloadUrl(video.videoUrl || video.driveFileId);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareText = `⚽ Confira o replay do meu gol: "${video.title}" no ${video.complexo} (${video.quadra}) no dia ${formattedDate} às ${video.hora}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Replay: ${video.title}`, text: shareText, url: shareUrl });
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <article className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      
      {/* Thumbnail & Hover Overlay */}
      <div 
        onClick={() => onPlayVideo(video)}
        style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0a0f1d', cursor: 'pointer', overflow: 'hidden' }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="video-thumb-img"
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(7, 9, 14, 0.85) 0%, transparent 60%)'
        }}></div>

        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#fff',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {video.duracao}
        </div>

        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 255, 135, 0.9)',
          color: '#07090e',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: 800,
          textTransform: 'uppercase'
        }}>
          {video.tipoGol || 'Replay'}
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(0, 255, 135, 0.9)',
          boxShadow: '0 0 25px rgba(0, 255, 135, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#07090e'
        }}>
          <Play size={26} style={{ marginLeft: '4px' }} fill="#07090e" />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        
        <div>
          <h3 
            onClick={() => onPlayVideo(video)}
            style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px', cursor: 'pointer', lineHeight: 1.3 }}
          >
            {video.title}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            <span className="badge badge-complexo">{video.complexo}</span>
            <span className="badge badge-quadra">{video.quadra}</span>
            <span className="badge badge-data">{formattedDate}</span>
            <span className="badge badge-hora">{video.hora}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-glass)', gap: '8px' }}>
          <button
            onClick={() => onPlayVideo(video)}
            className="btn-primary"
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <Play size={14} fill="#07090e" />
            Assistir Replay
          </button>

          <button
            onClick={handleDownload}
            className="btn-icon"
            title="Baixar Vídeo MP4"
          >
            <Download size={16} />
          </button>

          <button
            onClick={handleShare}
            className="btn-icon"
            title={copied ? "Link Copiado!" : "Compartilhar"}
            style={copied ? { borderColor: 'var(--accent-green)', color: 'var(--accent-green)' } : {}}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
          </button>
        </div>

      </div>

    </article>
  );
}
