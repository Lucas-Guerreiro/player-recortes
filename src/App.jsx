import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import VideoGrid from './components/VideoGrid';
import VideoPlayerModal from './components/VideoPlayerModal';
import DriveConnectModal from './components/DriveConnectModal';
import { buildR2Catalog } from './data/mockVideos';
import { getSavedR2Domain, fetchR2BucketFiles } from './utils/driveHelper';

export default function App() {
  // Domínio do Cloudflare R2 Conectado
  const [connectedR2Domain, setConnectedR2Domain] = useState(getSavedR2Domain());

  // Catálogo de vídeos 100% Cloudflare R2
  const [videos, setVideos] = useState(() => {
    try {
      localStorage.removeItem('replay_gols_catalog');
      const savedDomain = getSavedR2Domain();
      if (savedDomain) {
        return buildR2Catalog(savedDomain);
      }
    } catch (e) {}
    return buildR2Catalog(getSavedR2Domain());
  });

  // Atualiza as URLs do catálogo quando o domínio R2 for modificado
  useEffect(() => {
    if (connectedR2Domain) {
      setVideos(buildR2Catalog(connectedR2Domain));
    }
  }, [connectedR2Domain]);

  // Estados dos Filtros
  const [selectedComplexo, setSelectedComplexo] = useState('Todos');
  const [selectedQuadra, setSelectedQuadra] = useState('Todas');
  const [selectedData, setSelectedData] = useState('Todas');
  const [selectedHora, setSelectedHora] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [activeVideo, setActiveVideo] = useState(null);
  const [isR2ModalOpen, setIsR2ModalOpen] = useState(false);

  // Extrai opções únicas para Complexos
  const complexosOptions = useMemo(() => {
    const set = new Set(['Todos']);
    videos.forEach(v => { if (v.complexo) set.add(v.complexo); });
    return Array.from(set);
  }, [videos]);

  // Extrai opções únicas para Quadras
  const quadrasOptions = useMemo(() => {
    const set = new Set(['Todas']);
    videos.forEach(v => { if (v.quadra) set.add(v.quadra); });
    return Array.from(set);
  }, [videos]);

  // Extrai opções únicas para Datas (YYYY-MM-DD)
  const datasOptions = useMemo(() => {
    const set = new Set(['Todas']);
    videos.forEach(v => { if (v.data) set.add(v.data); });
    return Array.from(set).sort().reverse();
  }, [videos]);

  // Extrai opções únicas para Horas (ex: 21h, 20h, 5h)
  const horasOptions = useMemo(() => {
    const set = new Set(['Todas']);
    videos.forEach(v => {
      if (v.horaBloco) {
        set.add(v.horaBloco);
      } else if (v.hora) {
        const hourPart = parseInt(v.hora.split(':')[0], 10);
        if (!isNaN(hourPart)) {
          set.add(`${hourPart}h`);
        }
      }
    });
    const list = Array.from(set).filter(h => h !== 'Todas');
    list.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    return ['Todas', ...list];
  }, [videos]);

  // Lógica de Filtragem dos Vídeos no Cloudflare R2
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      // 1. Filtro de Complexo
      if (selectedComplexo !== 'Todos' && video.complexo !== selectedComplexo) {
        return false;
      }
      // 2. Filtro de Quadra
      if (selectedQuadra !== 'Todas' && video.quadra !== selectedQuadra) {
        return false;
      }
      // 3. Filtro de Data
      if (selectedData !== 'Todas' && video.data !== selectedData) {
        return false;
      }
      // 4. Filtro de Hora (21:42 -> 21h, 05:59 -> 5h)
      if (selectedHora !== 'Todas') {
        const targetHourNum = parseInt(selectedHora.replace('h', ''), 10);
        let videoHourNum = -1;
        if (video.horaBloco) {
          videoHourNum = parseInt(video.horaBloco.replace('h', ''), 10);
        } else if (video.hora) {
          videoHourNum = parseInt(video.hora.split(':')[0], 10);
        }

        if (videoHourNum !== targetHourNum) {
          return false;
        }
      }
      // 5. Busca por palavra-chave
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchTitle = video.title.toLowerCase().includes(query);
        const matchComplexo = video.complexo.toLowerCase().includes(query);
        const matchQuadra = video.quadra.toLowerCase().includes(query);
        const matchHora = video.hora && video.hora.toLowerCase().includes(query);
        const matchTags = video.tags && video.tags.some(t => t.toLowerCase().includes(query));
        if (!matchTitle && !matchComplexo && !matchQuadra && !matchHora && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [videos, selectedComplexo, selectedQuadra, selectedData, selectedHora, searchTerm]);

  const handleResetFilters = () => {
    setSelectedComplexo('Todos');
    setSelectedQuadra('Todas');
    setSelectedData('Todas');
    setSelectedHora('Todas');
    setSearchTerm('');
  };

  const handlePlayVideo = (video) => {
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, visualizacoes: (v.visualizacoes || 0) + 1 } : v));
    setActiveVideo(video);
  };

  const handleAddMultipleVideos = (newVideosList) => {
    if (!newVideosList || newVideosList.length === 0) return;
    setVideos(newVideosList);
    handleResetFilters();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenDriveModal={() => setIsR2ModalOpen(true)}
        connectedDriveFolder={connectedR2Domain}
        totalVideosCount={videos.length}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 48px 24px', width: '100%', flex: 1 }}>
        
        {/* Banner Exclusivo Cloudflare R2 */}
        <div 
          className="glass-panel" 
          style={{
            padding: '20px 24px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.1) 0%, rgba(0, 229, 255, 0.05) 100%)',
            borderColor: 'rgba(0, 255, 135, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ⚡ Cloudflare R2 — Streaming de Alta Performance HD
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
              Amazon Sports Arena & Suas Quadras (R2)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Vídeos apontados diretamente para o seu bucket R2: <strong style={{ color: 'var(--accent-green)' }}>{connectedR2Domain || 'Cole seu link R2'}</strong>
            </p>
          </div>

          <button
            onClick={() => setIsR2ModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '20px' }}
          >
            + Sincronizar Cloudflare R2
          </button>
        </div>

        {/* Barra de Filtros (Complexo, Quadra, Data, Hora) */}
        <FilterBar
          selectedComplexo={selectedComplexo}
          setSelectedComplexo={setSelectedComplexo}
          selectedQuadra={selectedQuadra}
          setSelectedQuadra={setSelectedQuadra}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          selectedHora={selectedHora}
          setSelectedHora={setSelectedHora}
          complexosOptions={complexosOptions}
          quadrasOptions={quadrasOptions}
          datasOptions={datasOptions}
          horasOptions={horasOptions}
          onResetFilters={handleResetFilters}
          filteredCount={filteredVideos.length}
          totalCount={videos.length}
        />

        {/* Grid de Cards dos Replays */}
        <VideoGrid
          videos={filteredVideos}
          onPlayVideo={handlePlayVideo}
          onResetFilters={handleResetFilters}
        />

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>⚽ <strong>Replays dos Meus Gols</strong> — Streaming Cloudflare R2 (Complexo / Quadra / Data / Hora)</div>
          <div>Player Esportivo Analítico Frame-by-Frame</div>
        </div>
      </footer>

      {/* Modal Player Esportivo 100% R2 */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Modal de Conexão Cloudflare R2 */}
      {isR2ModalOpen && (
        <DriveConnectModal
          currentFolder={connectedR2Domain}
          onClose={() => setIsR2ModalOpen(false)}
          onFolderConnected={(domain) => setConnectedR2Domain(domain)}
          onAddMultipleVideos={handleAddMultipleVideos}
        />
      )}

    </div>
  );
}
