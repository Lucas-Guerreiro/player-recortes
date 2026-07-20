import React, { useState } from 'react';
import { 
  Cloud, HardDrive, X, Check, AlertCircle, Loader2, Sparkles, 
  FolderTree, Upload, FileVideo, Folder 
} from 'lucide-react';
import { 
  saveR2Domain, 
  getSavedR2Domain, 
  saveR2FolderPath,
  getSavedR2FolderPath,
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
  const [activeTab, setActiveTab] = useState('r2');
  const [r2Domain, setR2Domain] = useState(getSavedR2Domain());
  const [r2FolderPath, setR2FolderPath] = useState(getSavedR2FolderPath());

  const [batchComplexo, setBatchComplexo] = useState('Amazon Sports Arena');
  const [batchQuadra, setBatchQuadra] = useState('Quadra 01');

  const [inputDriveUrl, setInputDriveUrl] = useState(currentFolder || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sincronização e ajuste de subpasta do R2
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
    saveR2FolderPath(r2FolderPath);

    try {
      const detectedVideos = await fetchR2BucketFiles(r2Domain, {
        complexo: batchComplexo,
        quadra: batchQuadra,
        folderPath: r2FolderPath
      });

      if (!detectedVideos || detectedVideos.length === 0) {
        setErrorMsg('Nenhum vídeo foi encontrado neste caminho do Cloudflare R2.');
        setLoading(false);
        return;
      }

      onAddMultipleVideos(detectedVideos);
      setSuccessMsg(`🚀 Sucesso! ${detectedVideos.length} vídeos foram sincronizados do seu R2 com caminho atualizado!`);

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Erro R2:', err);
      setErrorMsg(err.message || 'Erro ao conectar ao Cloudflare R2.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '28px', position: 'relative', borderRadius: 'var(--radius-lg)' }}>
        
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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Ajuste de Caminho do Cloudflare R2</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configure o link público e a estrutura de subpastas do seu bucket R2
            </p>
          </div>
        </div>

        {/* Tabs */}
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
            <Cloud size={16} /> Cloudflare R2 (Links & Subpastas)
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
        </div>

        {/* TAB 1: CLOUDFLARE R2 */}
        {activeTab === 'r2' && (
          <form onSubmit={handleR2AutoSync}>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--accent-green)', display: 'block', marginBottom: '6px' }}>
                1. URL Pública do Cloudflare R2:
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="https://pub-a1b2c3d4e5f6789.r2.dev"
                value={r2Domain}
                onChange={(e) => setR2Domain(e.target.value)}
                style={{ fontSize: '0.92rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'block', marginBottom: '6px' }}>
                2. Subpasta Dentro do R2 (Deixe em branco se o vídeo estiver na raiz do R2):
              </label>
              <div style={{ position: 'relative' }}>
                <Folder size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Ex: Amazon Sports Arena/Quadra 01 ou Replay de Gols"
                  value={r2FolderPath}
                  onChange={(e) => setR2FolderPath(e.target.value)}
                  style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                💡 Se seu vídeo no R2 estiver no caminho <code>https://...r2.dev/MinhaPasta/gol_20260713_205410.mp4</code>, digite <code>MinhaPasta</code> no campo acima.
              </p>
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
                {loading ? 'Atualizando R2...' : 'Sincronizar Caminho R2'}
              </button>
            </div>

          </form>
        )}

        {/* TAB 2: UPLOAD DO COMPUTADOR */}
        {activeTab === 'local' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              Selecione os vídeos no seu computador para carregar sem precisar de nuvem.
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
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleLocalFilesUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

      </div>
    </div>
  );
}
