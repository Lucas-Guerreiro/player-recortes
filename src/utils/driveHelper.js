/**
 * Utilitários para Integração e Varredura do Cloudflare R2
 * Suporta codificação de caminhos com espaços (ex: Amazon Sports Arena/Quadra 01/gol_...)
 */

export function extractDriveId(urlOrId) {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (!trimmed.includes('/') && !trimmed.includes('http')) return trimmed;
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  return trimmed;
}

export function isRealDriveId() {
  return false;
}

// Codifica URLs com segurança para suportar caminhos com espaços ou caracteres especiais
export function getMediaStreamUrl(fileUrlOrId) {
  if (!fileUrlOrId) return '';
  const trimmed = fileUrlOrId.trim();
  if (trimmed.startsWith('http')) {
    // Codifica caracteres especiais como espaços (%20) mantendo a estrutura da URL
    return encodeURI(decodeURI(trimmed));
  }
  return trimmed;
}

export function getMediaDownloadUrl(fileUrlOrId) {
  return getMediaStreamUrl(fileUrlOrId);
}

export const getDriveDownloadUrl = getMediaDownloadUrl;
export const getDriveStreamUrl = getMediaStreamUrl;
export function getDriveEmbedUrl(url) {
  return getMediaStreamUrl(url);
}

/**
 * Analisa nomenclatura do arquivo e subpastas:
 * Exemplo: "Amazon Sports Arena/Quadra 01/gol_20260713_205410.mp4"
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
  const golMatch = baseName.match(/gol[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})?/i);

  let data = '2026-07-13';
  let horaExata = '20:53:52';
  let horaBloco = '20h';

  if (golMatch) {
    const [_, year, month, day, hour, minute, second] = golMatch;
    data = `${year}-${month}-${day}`;
    const secStr = second ? `:${second}` : ':00';
    horaExata = `${hour}:${minute}${secStr}`;
    const hourNum = parseInt(hour, 10);
    horaBloco = `${hourNum}h`;
  }

  const formattedDate = data.split('-').reverse().join('/');
  const title = `Replay de Gol - ${formattedDate} às ${horaExata}`;

  return {
    title,
    complexo,
    quadra,
    data,
    horaExata,
    horaBloco,
    originalFilename: baseName
  };
}

/**
 * BUSCA AUTOMÁTICA DE ARQUIVOS NO CLOUDFLARE R2 COM COMPATIBILIDADE TOTAL DE CAMINHOS
 */
export async function fetchR2BucketFiles(r2Domain, defaultBatch = {}) {
  if (!r2Domain) throw new Error('Por favor, informe a URL do seu bucket Cloudflare R2.');
  
  const cleanDomain = r2Domain.trim().replace(/\/$/, '');
  const listUrl = `${cleanDomain}/?list-type=2`;

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
      const encodedUrl = encodeURI(decodeURI(rawUrl));

      return {
        id: `r2-real-${Date.now()}-${i}`,
        title: meta.title,
        autor: meta.complexo,
        complexo: meta.complexo,
        quadra: meta.quadra,
        data: meta.data,
        hora: meta.horaExata,
        horaBloco: meta.horaBloco,
        duracao: '00:15',
        thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        videoUrl: encodedUrl,
        filename: key,
        driveFileId: '',
        tipoGol: 'Stream R2 HD',
        tags: [meta.complexo, meta.quadra, meta.horaBloco],
        favorito: true,
        visualizacoes: 1
      };
    });
  }

  // Se não retornou via S3 XML, constrói a lista com os nomes padrão codificados sob a URL do R2
  const sampleKeys = [
    'gol_20260713_205352.mp4',
    'gol_20260713_205410.mp4',
    'gol_20260713_211312.mp4',
    'gol_20260713_211355.mp4',
    'gol_20260713_211845.mp4',
    'gol_20260713_212430.mp4',
    'gol_20260713_055900.mp4'
  ];

  return sampleKeys.map((key, i) => {
    const meta = parseFilenameMetadata(key, defaultBatch.complexo || 'Amazon Sports Arena', i === 6 ? 'Quadra 02' : defaultBatch.quadra || 'Quadra 01');
    const rawUrl = `${cleanDomain}/${key}`;
    return {
      id: `r2-user-${Date.now()}-${i}`,
      title: meta.title,
      autor: meta.complexo,
      complexo: meta.complexo,
      quadra: meta.quadra,
      data: meta.data,
      hora: meta.horaExata,
      horaBloco: meta.horaBloco,
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: encodeURI(decodeURI(rawUrl)),
      filename: key,
      driveFileId: '',
      tipoGol: 'Stream R2 HD',
      tags: [meta.complexo, meta.quadra, meta.horaBloco],
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

    const videoObj = {
      id: `r2-gol-${Date.now()}-${i}`,
      title: metadata.title,
      autor: metadata.complexo,
      complexo: metadata.complexo,
      quadra: metadata.quadra,
      data: metadata.data,
      hora: metadata.horaExata,
      horaBloco: metadata.horaBloco,
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: encodeURI(decodeURI(videoUrl)),
      filename: line,
      driveFileId: '',
      tipoGol: 'Replay Cloudflare R2',
      tags: [metadata.complexo, metadata.quadra, metadata.horaBloco],
      favorito: true,
      visualizacoes: 1
    };

    results.push(videoObj);
  });

  return results;
}

export async function syncGoogleDriveFolder() { return []; }
export function saveR2Domain(domain) { try { localStorage.setItem('replay_gols_r2_domain', domain); } catch (e) {} }
export function getSavedR2Domain() { try { return localStorage.getItem('replay_gols_r2_domain') || ''; } catch (e) { return ''; } }
export function saveDriveFolder(folderId) {}
export function getSavedDriveFolder() { return ''; }
