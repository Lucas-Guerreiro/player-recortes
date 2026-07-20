import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Play, Pause, Download, Share2, Volume2, VolumeX, Maximize, 
  ChevronLeft, ChevronRight, Gauge, Check, Keyboard, Loader2, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { getMediaDownloadUrl } from '../utils/driveHelper';

const PLAYBACK_SPEEDS = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0];
const FRAME_DURATION = 1 / 30; // ~0.0333s por frame (30fps)

// Vídeo de amostra MP4 100% público e funcional para fallback de teste
const SAMPLE_MP4 = 'https://vjs.zencdn.net/v/oceans.mp4';

export default function VideoPlayerModal({ video, onClose }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(video.videoUrl);

  const formattedDate = new Date(video.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  // Tenta reprodução automática ao abrir
  useEffect(() => {
    setIsLoading(true);
    setVideoError(false);
    setCurrentVideoSrc(video.videoUrl);

    // Safety timeout: Desativa o spinner após 3 segundos no máximo
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(safetyTimer);
  }, [video]);

  // Tenta dar Play com segurança
  const tryPlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setVideoError(false);
        })
        .catch(() => {
          // Bloqueio de autoplay pelo navegador: requer clique do usuário
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      tryPlayVideo();
    }
  };

  const handleVideoError = () => {
    console.warn('Não foi possível carregar a URL de vídeo:', currentVideoSrc);
    setIsLoading(false);
    setVideoError(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const seekBySeconds = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const stepFrame = (direction) => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      const delta = direction * FRAME_DURATION;
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const downloadUrl = getMediaDownloadUrl(currentVideoSrc);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    const shareText = `⚽ Replay de Gol no ${video.complexo} (${video.quadra}) - ${formattedDate} às ${video.hora}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, text: shareText, url: shareUrl });
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Alternar para amostra MP4 pública se o link do R2 não responder
  const handleUseSampleFallback = () => {
    setCurrentVideoSrc(SAMPLE_MP4);
    setVideoError(false);
    setIsLoading(true);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatTimeDetailed = (timeInSec) => {
    if (isNaN(timeInSec)) return '00:00.00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    const ms = Math.floor((timeInSec % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const currentFrame = Math.floor(currentTime * 30);

  return (
    <div className="modal-overlay">
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass-hover)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
        }}
      >
        
        {/* Header do Player */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(7, 9, 14, 0.75)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-complexo">{video.complexo}</span>
              <span className="badge badge-quadra">{video.quadra}</span>
              <span className="badge badge-data">{formattedDate} ({video.hora})</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{video.title}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
              className="btn-icon" 
              title="Atalhos do Teclado"
            >
              <Keyboard size={18} />
            </button>

            <button onClick={onClose} className="btn-icon" title="Fechar (Esc)">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport do Vídeo HTML5 R2 + Controls */}
        <div style={{ position: 'relative', background: '#000', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          <div style={{ position: 'relative', width: '100%', height: '52vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* VÍDEO HTML5 R2 STREAM DIRETO */}
            <video
              ref={videoRef}
              src={currentVideoSrc}
              playsInline
              onCanPlay={() => setIsLoading(false)}
              onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
              onClick={togglePlay}
            />

            {/* AVISO DE ERRO DE CONEXÃO DO VÍDEO NO R2 */}
            {videoError && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(7, 9, 14, 0.92)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                gap: '12px',
                zIndex: 20
              }}>
                <AlertTriangle size={48} color="var(--accent-red)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Não foi possível conectar a este arquivo no R2
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.4 }}>
                  Verifique se a URL do seu bucket Cloudflare R2 está correta e se o arquivo <code>{video.filename || 'gol.mp4'}</code> foi enviado para o bucket.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button onClick={handleUseSampleFallback} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                    <RefreshCw size={16} /> Testar com Mídia de Amostra
                  </button>
                </div>
              </div>
            )}

            {/* Spinner de Carregamento */}
            {isLoading && !videoError && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(7, 9, 14, 0.85)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <Loader2 size={46} color="var(--accent-green)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: 'var(--accent-green)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                  ⚡ Conectando ao Cloudflare R2...
                </div>
              </div>
            )}

            {/* Overlay Play Button quando Pausado */}
            {!isPlaying && !isLoading && !videoError && (
              <div 
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 135, 0.9)',
                  boxShadow: '0 0 30px rgba(0, 255, 135, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#07090e',
                  cursor: 'pointer',
                  zIndex: 12
                }}
              >
                <Play size={32} style={{ marginLeft: '4px' }} fill="#07090e" />
              </div>
            )}

            {/* Slow Motion Badge */}
            {playbackSpeed < 1.0 && (
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 42, 95, 0.85)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 10
              }}>
                <Gauge size={14} />
                SLOW MOTION ({playbackSpeed}x)
              </div>
            )}
          </div>

          {/* Atalhos Drawer */}
          {showShortcutsHelp && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 9, 14, 0.94)',
              backdropFilter: 'blur(8px)',
              padding: '24px',
              zIndex: 25,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <h3 className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
                ⌨️ Dicas do Player de Replays
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                maxWidth: '600px',
                width: '100%',
                fontSize: '0.85rem'
              }}>
                <div className="glass-panel" style={{ padding: '10px' }}><strong>Espaço / K:</strong> Play / Pause</div>
                <div className="glass-panel" style={{ padding: '10px' }}><strong>Vírgula ( , ):</strong> Frame Anterior</div>
                <div className="glass-panel" style={{ padding: '10px' }}><strong>Ponto ( . ):</strong> Próximo Frame</div>
                <div className="glass-panel" style={{ padding: '10px' }}><strong>Setas ← / →:</strong> Salto de 5s</div>
                <div className="glass-panel" style={{ padding: '10px' }}><strong>F:</strong> Tela Cheia</div>
              </div>
              <button 
                onClick={() => setShowShortcutsHelp(false)}
                className="btn-primary" 
                style={{ marginTop: '20px', padding: '8px 24px' }}
              >
                Entendi
              </button>
            </div>
          )}

          {/* Painel de Controles Analíticos Fixos */}
          <div style={{ background: 'rgba(10, 14, 23, 0.95)', borderTop: '1px solid var(--border-glass)' }}>
            
            <div style={{ padding: '10px 20px 0 20px' }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={handleSeekChange}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: 'var(--accent-green)',
                  height: '6px',
                  borderRadius: '3px'
                }}
              />
            </div>

            <div style={{
              padding: '12px 20px 16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={togglePlay} className="btn-primary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
                    {isPlaying ? <Pause size={18} fill="#07090e" /> : <Play size={18} fill="#07090e" style={{ marginLeft: '2px' }} />}
                  </button>

                  <button onClick={() => seekBySeconds(-5)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                    -5s
                  </button>

                  {/* BOTÕES FRAME A FRAME */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0, 255, 135, 0.1)', padding: '2px', borderRadius: '8px', border: '1px solid rgba(0, 255, 135, 0.25)' }}>
                    <button
                      onClick={() => stepFrame(-1)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}
                      title="Voltar 1 Frame (Tecla ,)"
                    >
                      |< ChevronLeft size={12} />
                    </button>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-green)', padding: '0 4px' }}>FRAME</span>
                    <button
                      onClick={() => stepFrame(1)}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}
                      title="Avançar 1 Frame (Tecla .)"
                    >
                      <ChevronRight size={12} />|
                    </button>
                  </div>

                  <button onClick={() => seekBySeconds(5)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                    +5s
                  </button>
                </div>

                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{formatTimeDetailed(currentTime)} / {formatTimeDetailed(duration)}</span>
                  <span style={{ color: 'var(--text-dim)' }}>|</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Frame #{currentFrame}</span>
                </div>
              </div>

              {/* Linha 2: Ações & Velocidades */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Velocidade:
                  </span>
                  {PLAYBACK_SPEEDS.map(speed => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: playbackSpeed === speed ? '1px solid var(--accent-green)' : '1px solid rgba(255,255,255,0.1)',
                        background: playbackSpeed === speed ? 'rgba(0, 255, 135, 0.18)' : 'rgba(255,255,255,0.05)',
                        color: playbackSpeed === speed ? 'var(--accent-green)' : 'var(--text-main)'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={toggleMute} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{ width: '50px', accentColor: 'var(--accent-green)' }}
                    />
                  </div>

                  <button onClick={toggleFullscreen} className="btn-icon" style={{ width: '32px', height: '32px' }}>
                    <Maximize size={15} />
                  </button>

                  <button onClick={handleDownload} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Download size={14} /> Baixar MP4
                  </button>

                  <button onClick={handleShare} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    {copied ? <Check size={14} color="var(--accent-green)" /> : <Share2 size={14} />}
                    {copied ? 'Copiado!' : 'Compartilhar'}
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
