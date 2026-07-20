import React, { useState } from 'react';
import { 
  Cloud, HardDrive, X, Check, AlertCircle, Loader2, Sparkles, 
  FolderTree, Upload, FileVideo 
} from 'lucide-react';
import { 
  saveR2Domain, 
  getSavedR2Domain, 
  fetchR2BucketFiles, 
  parseFilenameMetadata,
  extractDriveId, 
  syncGoogleDriveFolder 
} from '../utils/driveHelper';

export default function DriveConnectModal({ 
  currentFolder, 
  onClose, 
  onFolderConnected, 
  onAddMultipleVideos 
}) {
  const [activeTab, setActiveTab] = useState('r2'); // 'r2' | 'local' | 'drive'
  const [r2Domain, setR2Domain] = useState(getSavedR2Domain());
  
  const [batchComplexo, setBatchComplexo] = useState('Amazon Sports Arena');
  const [batchQuadra, setBatchQuadra] = useState('Quadra 01');

  const [inputDriveUrl, setInputDriveUrl] = useState(currentFolder || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. VARREDURA 100% AUTOMÁTICA DO CLOUDFLARE R2 (Nenhum nome digitado pelo usuário)
  const handleR2AutoSync = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!r2Domain.trim()) {
      setErrorMsg('Por favor, informe a URL do seu bucket Cloudflare R2.');
      return;
    }

    setLoading(true);
    saveR2Domain(r2Domain);

    try {
      // Varre o bucket R2 e descobre automaticamente todos os vídeos e metadados
      const detectedVideos = await fetchR2BucketFiles(r2Domain, {
        complexo: batchComplexo,
        quadra: batchQuadra
      });

      if (!detectedVideos || detectedVideos.length === 0) {
        setErrorMsg('Nenhum vídeo foi encontrado dentro deste bucket Cloudflare R2.');
        setLoading(false);
        return;
      }

      onAddMultipleVideos(detectedVideos);
      setSuccessMsg(`🚀 Sucesso! ${detectedVideos.length} vídeos foram detectados automaticamente no Cloudflare R2 e os filtros foram atualizados!`);

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Erro na varredura do R2:', err);
      setErrorMsg(err.message || 'Erro ao conectar ao bucket Cloudflare R2.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload/Carregamento de Arquivos do Computador (Local)
  const handleLocalFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const loadedVideos = files.map((file, idx) => {
      const meta = parseFilenameMetadata(file.name, batchComplexo, batchQuadra);
      const blobUrl = URL.createObjectURL(file);

      return {
        id: `local-video-${Date.now()}-${idx}`,
        title: meta.title,
        autor: meta.complexo,
        complexo: meta.complexo,
        quadra: meta.quadra,
        data: meta.data,
        hora: meta.horaExata,
        horaBloco: meta.horaBloco,
        duracao: '00:15',
        thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        videoUrl: blobUrl,
        driveFileId: '',
        tipoGol: 'Vídeo Carregado',
        tags: [meta.complexo, meta.quadra, meta.horaBloco],
        favorito: true,
        visualizacoes: 1
      };
    });

    onAddMultipleVideos(loadedVideos);
    setSuccessMsg(`⚡ ${loadedVideos.length} vídeos foram detectados do seu computador!`);
    setTimeout(() => onClose(), 1400);
  };

  // 3. Sincronizar via Google Drive
  const handleDriveSync = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const folderId = extractDriveId(inputDriveUrl);
    if (!folderId) {
      setErrorMsg('Link de pasta do Google Drive inválido.');
      return;
    }

    setLoading(true);

    try {
      const detectedVideos = await syncGoogleDriveFolder(inputDriveUrl);
      onAddMultipleVideos(detectedVideos);
      setSuccessMsg(`✅ ${detectedVideos.length} vídeos sincronizados do Drive!`);
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao sincronizar pasta do Drive.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '28px', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Fechar */}
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <X size={18} />
        </button>

        {/* Header do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00ff87 0%, #00b8ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#07090e'
          }}>
            <Cloud size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Conectar Nuvem de Streaming</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Detecção 100% automática dos seus replays de gols
            </p>
          </div>
        </div>

        {/* Tabs: Cloudflare R2 | Upload do Computador | Google Drive */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', pb: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('r2')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'r2' ? '2px solid var(--accent-green)' : 'none',
              color: activeTab === 'r2' ? 'var(--accent-green)' : 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cloud size={16} /> Cloudflare R2 (Automático)
          </button>

          <button
            onClick={() => setActiveTab('local')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'local' ? '2px solid var(--accent-yellow)' : 'none',
              color: activeTab === 'local' ? 'var(--accent-yellow)' : 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Upload size={16} /> Do Computador
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'drive' ? '2px solid var(--accent-cyan)' : 'none',
              color: activeTab === 'drive' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: 700,
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HardDrive size={16} /> Google Drive
          </button>
        </div>

        {/* TAB 1: CLOUDFLARE R2 AUTOMÁTICO */}
        {activeTab === 'r2' && (
          <form onSubmit={handleR2AutoSync}>
            
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)', display: 'block', marginBottom: '8px' }}>
                URL Pública do Cloudflare R2 / Domínio:
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="https://pub-a1b2c3d4e5f6789.r2.dev"
                value={r2Domain}
                onChange={(e) => setR2Domain(e.target.value)}
                style={{ fontSize: '0.95rem', padding: '12px 16px' }}
                required
                autoFocus
              />
            </div>

            <div style={{
              background: 'rgba(0, 255, 135, 0.05)',
              border: '1px solid rgba(0, 255, 135, 0.2)',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderTree size={16} /> Detecção Automática dos Arquivos:
              </div>
              O sistema se conecta à URL do R2, lê os arquivos de vídeos gravados (ex: <code>gol_20260713_205352.mp4</code>) e preenche automaticamente o <strong>Complexo</strong>, a <strong>Quadra</strong>, a <strong>Data</strong> e os <strong>Blocos de Hora</strong>!
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--accent-red)', background: 'rgba(255, 42, 95, 0.1)', border: '1px solid rgba(255, 42, 95, 0.25)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ color: 'var(--accent-green)', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.25)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Check size={18} /> {successMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>

              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
                {loading ? <Loader2 size={18} className="spin" /> : <Cloud size={18} />}
                {loading ? 'Detectando Vídeos no R2...' : 'Sincronizar Cloudflare R2'}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: UPLOAD DO COMPUTADOR */}
        {activeTab === 'local' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Selecione os vídeos no seu computador. O sistema extrai o Complexo, Quadra, Data e Hora automaticamente a partir da nomenclatura.
            </p>

            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 20px',
              border: '2px dashed var(--accent-green)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 255, 135, 0.04)',
              cursor: 'pointer',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <Upload size={36} color="var(--accent-green)" style={{ marginBottom: '10px' }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                Clique para selecionar vídeos do seu PC
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Suporta múltiplos arquivos (.mp4, .mov, .webm)
              </span>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleLocalFilesUpload}
                style={{ display: 'none' }}
              />
            </label>

            {successMsg && (
              <div style={{ color: 'var(--accent-green)', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.25)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Check size={18} /> {successMsg}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DRIVE */}
        {activeTab === 'drive' && (
          <form onSubmit={handleDriveSync}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', display: 'block', marginBottom: '6px' }}>
                Link da Pasta do Google Drive:
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="https://drive.google.com/drive/folders/1ABC..."
                value={inputDriveUrl}
                onChange={(e) => setInputDriveUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <HardDrive size={16} />}
                Sincronizar Drive
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
