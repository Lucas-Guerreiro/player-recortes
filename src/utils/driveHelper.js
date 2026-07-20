/**
 * Utilitários para Integração com Cloudflare R2
 * Suporta sufixos de câmeras: gol_YYYYMMDD_HHMMSS_Ugreen.mp4, gol_YYYYMMDD_HHMMSS_Anker.mp4
 */

export function extractDriveId(urlOrId) {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (!trimmed.includes('/') && !trimmed.includes('http')) return trimmed;
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  return trimmed;
}

export function isRealDriveId() { return false; }

export function getMediaStreamUrl(fileUrlOrId) {
  if (!fileUrlOrId) return '';
  const trimmed = fileUrlOrId.trim();
  if (trimmed.startsWith('http')) {
    return encodeURI(decodeURI(trimmed));
  }
  return trimmed;
}

export function getMediaDownloadUrl(fileUrlOrId) {
  return getMediaStreamUrl(fileUrlOrId);
}

export const getDriveDownloadUrl = getMediaDownloadUrl;
export const getDriveStreamUrl = getMediaStreamUrl;
export function getDriveEmbedUrl(url) { return getMediaStreamUrl(url); }

/**
 * Analisa nomenclatura incluindo sufixos de câmeras (_Ugreen, _Anker, etc):
 * Exemplo: "gol_20260713_205351_Ugreen.mp4" -> Câmera Ugreen, 20:53:51
 * Exemplo: "gol_20260713_205410_Anker.mp4" -> Câmera Anker, 20:54:10
 */
export function parseFilenameMetadata(fullPath, defaultComplexo = 'Amazon Sports Arena', defaultQuadra = 'Quadra 01') {
  const cleanStr = fullPath.trim();
  let complexo = defaultComplexo;
  let quadra = defaultQuadra;

  if (cleanStr.includes('/')) {
    const parts = cleanStr.split('/').map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      complexo = parts[parts.length - 3];
      quadra = parts[parts.length - 2];
    } else if (parts.length === 2) {
      quadra = parts[0];
    }
  }

  const baseName = cleanStr.split('/').pop().replace(/\.[^/.]+$/, "");

  // RegEx para extrair Data, Hora e Câmera (ex: _Ugreen ou _Anker)
  const golMatch = baseName.match(/gol[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})?(?:[_-]?([a-zA-Z0-9]+))?/i);

  let data = '2026-07-13';
  let horaExata = '20:53:52';
  let horaBloco = '20h';
  let camera = '';

  if (golMatch) {
    const [_, year, month, day, hour, minute, second, camSuffix] = golMatch;
    data = `${year}-${month}-${day}`;
    const secStr = second ? `:${second}` : ':00';
    horaExata = `${hour}:${minute}${secStr}`;
    const hourNum = parseInt(hour, 10);
    horaBloco = `${hourNum}h`;

    if (camSuffix && !/^\d+$/.test(camSuffix)) {
      camera = camSuffix;
    }
  }

  const formattedDate = data.split('-').reverse().join('/');
  const camText = camera ? ` (Câmera ${camera})` : '';
  const title = `Replay de Gol - ${formattedDate} às ${horaExata}${camText}`;

  return {
    title,
    complexo,
    quadra,
    data,
    horaExata,
    horaBloco,
    camera,
    originalFilename: baseName
  };
}

/**
 * BUSCA AUTOMÁTICA DE ARQUIVOS NO CLOUDFLARE R2 COM DETECÇÃO DAS CÂMERAS UGREEN / ANKER
 */
export async function fetchR2BucketFiles(r2Domain, defaultBatch = {}) {
  const domainToUse = r2Domain || 'https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev';
  const cleanDomain = domainToUse.trim().replace(/\/$/, '');
  const prefix = defaultBatch.folderPath ? defaultBatch.folderPath.trim().replace(/^\//, '').replace(/\/$/, '') : '';
  const listUrl = prefix ? `${cleanDomain}/?list-type=2&prefix=${encodeURIComponent(prefix)}` : `${cleanDomain}/?list-type=2`;

  let fileKeys = [];

  try {
    const res = await fetch(listUrl);
    if (res.ok) {
      const xmlText = await res.text();
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const keyElements = xmlDoc.getElementsByTagName('Key');
      
      for (let i = 0; i < keyElements.length; i++) {
        const key = keyElements[i].textContent;
        if (key && (key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.webm') || key.includes('gol_'))) {
          if (!key.toLowerCase().includes('thumbnails')) {
            fileKeys.push(key);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Busca S3 XML:', err);
  }

  if (fileKeys.length > 0) {
    return fileKeys.map((key, i) => {
      const meta = parseFilenameMetadata(key, defaultBatch.complexo, defaultBatch.quadra);
      const rawUrl = key.startsWith('http') ? key : `${cleanDomain}/${key}`;
      const cameraTag = meta.camera ? `Câmera ${meta.camera}` : 'HD Stream';

      return {
        id: `r2-real-${Date.now()}-${i}`,
        title: meta.title,
        autor: meta.complexo,
        complexo: meta.complexo,
        quadra: meta.quadra,
        data: meta.data,
        hora: meta.horaExata,
        horaBloco: meta.horaBloco,
        camera: meta.camera,
        duracao: '00:15',
        thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        videoUrl: encodeURI(decodeURI(rawUrl)),
        filename: key,
        driveFileId: '',
        tipoGol: cameraTag,
        tags: [meta.complexo, meta.quadra, meta.horaBloco, meta.camera].filter(Boolean),
        favorito: true,
        visualizacoes: 1
      };
    });
  }

  const sampleKeys = [
    'gol_20260713_205351_Ugreen.mp4',
    'gol_20260713_205410_Anker.mp4',
    'gol_20260713_211312_Ugreen.mp4',
    'gol_20260713_211845_Anker.mp4',
    'gol_20260713_055900_Ugreen.mp4'
  ];

  return sampleKeys.map((filename, i) => {
    const meta = parseFilenameMetadata(filename, defaultBatch.complexo || 'Amazon Sports Arena', i === 4 ? 'Quadra 02' : defaultBatch.quadra || 'Quadra 01');
    
    let relativePath = filename;
    if (prefix) {
      relativePath = `${prefix}/${filename}`;
    }

    const rawUrl = `${cleanDomain}/${relativePath}`;
    const cameraTag = meta.camera ? `Câmera ${meta.camera}` : 'HD Stream';

    return {
      id: `r2-user-${Date.now()}-${i}`,
      title: meta.title,
      autor: meta.complexo,
      complexo: meta.complexo,
      quadra: meta.quadra,
      data: meta.data,
      hora: meta.horaExata,
      horaBloco: meta.horaBloco,
      camera: meta.camera,
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: encodeURI(decodeURI(rawUrl)),
      filename: relativePath,
      driveFileId: '',
      tipoGol: cameraTag,
      tags: [meta.complexo, meta.quadra, meta.horaBloco, meta.camera].filter(Boolean),
      favorito: true,
      visualizacoes: 1
    };
  });
}

export function parsePastedR2Links(textBlock, defaultBatch = {}) {
  if (!textBlock) return [];
  const lines = textBlock.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];

  lines.forEach((line, i) => {
    if (line.toLowerCase().includes('thumbnails')) return;

    const metadata = parseFilenameMetadata(line, defaultBatch.complexo, defaultBatch.quadra);
    
    let videoUrl = line;
    if (!line.startsWith('http') && defaultBatch.r2Domain) {
      const cleanDomain = defaultBatch.r2Domain.replace(/\/$/, '');
      videoUrl = `${cleanDomain}/${line}`;
    }

    const cameraTag = metadata.camera ? `Câmera ${metadata.camera}` : 'Replay R2';

    const videoObj = {
      id: `r2-gol-${Date.now()}-${i}`,
      title: metadata.title,
      autor: metadata.complexo,
      complexo: metadata.complexo,
      quadra: metadata.quadra,
      data: metadata.data,
      hora: metadata.horaExata,
      horaBloco: metadata.horaBloco,
      camera: metadata.camera,
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: encodeURI(decodeURI(videoUrl)),
      filename: line,
      driveFileId: '',
      tipoGol: cameraTag,
      tags: [metadata.complexo, metadata.quadra, metadata.horaBloco, metadata.camera].filter(Boolean),
      favorito: true,
      visualizacoes: 1
    };

    results.push(videoObj);
  });

  return results;
}

export async function syncGoogleDriveFolder() { return []; }

export function saveR2Domain(domain) {
  try { localStorage.setItem('replay_gols_r2_domain', domain); } catch (e) {}
}

export function getSavedR2Domain() {
  try { return localStorage.getItem('replay_gols_r2_domain') || 'https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev'; } catch (e) { return 'https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev'; }
}

export function saveR2FolderPath(folderPath) {
  try { localStorage.setItem('replay_gols_r2_folder_path', folderPath); } catch (e) {}
}

export function getSavedR2FolderPath() {
  try { return localStorage.getItem('replay_gols_r2_folder_path') || 'Amazon Sports Arena/Quadra 01'; } catch (e) { return 'Amazon Sports Arena/Quadra 01'; }
}

export function saveDriveFolder(folderId) {}
export function getSavedDriveFolder() { return ''; }
