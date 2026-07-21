/**
 * Lista de replays reais enviados para a raiz do Cloudflare R2 do usuário:
 * Domain: https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev
 */

export function buildR2Catalog(r2Domain = '', folderPath = '') {
  const cleanDomain = r2Domain ? r2Domain.trim().replace(/\/$/, '') : 'https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev';
  const prefix = folderPath ? folderPath.trim().replace(/^\//, '').replace(/\/$/, '') + '/' : '';

  const realFiles = [
    'gol_20260713_205351_Ugreen.mp4',
    'gol_20260713_205410_Anker.mp4',
    'gol_20260713_211312_Ugreen.mp4',
    'gol_20260713_211355_Anker.mp4',
    'gol_20260713_211620_Anker.mp4',
    'gol_20260713_211842_Anker.mp4',
    'gol_20260713_211846_Anker.mp4',
    'gol_20260713_212433_Anker.mp4',
    'gol_20260713_213052_Anker.mp4',
    'gol_20260713_213810_Anker.mp4',
    'gol_20260713_213906_Ugreen.mp4',
    'gol_20260713_213938_Ugreen.mp4',
    'gol_20260713_214421_Anker.mp4'
  ];

  return realFiles.map((filename, i) => {
    const baseName = filename.replace(/\.[^/.]+$/, "");
    const golMatch = baseName.match(/gol[_-]?(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})?(?:[_-]?([a-zA-Z0-9]+))?/i);

    let data = '2026-07-13';
    let horaExata = '20:53:51';
    let horaBloco = '20h';
    let camera = 'Ugreen';

    if (golMatch) {
      const [_, year, month, day, hour, minute, second, camSuffix] = golMatch;
      data = `${year}-${month}-${day}`;
      const secStr = second ? `:${second}` : ':00';
      horaExata = `${hour}:${minute}${secStr}`;
      const hourNum = parseInt(hour, 10);
      horaBloco = `${hourNum}h`;
      if (camSuffix) camera = camSuffix;
    }

    const formattedDate = data.split('-').reverse().join('/');
    const title = `Replay de Gol - ${formattedDate} às ${horaExata} (Câmera ${camera})`;
    const relativePath = `${prefix}${filename}`;
    const rawUrl = `${cleanDomain}/${relativePath}`;

    return {
      id: `r2_gol_${i}_${baseName}`,
      title,
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data,
      hora: horaExata,
      horaBloco,
      camera,
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: encodeURI(decodeURI(rawUrl)),
      filename: relativePath,
      driveFileId: '',
      tipoGol: `Câmera ${camera}`,
      tags: ['Amazon Sports Arena', 'Quadra 01', horaBloco, camera].filter(Boolean),
      favorito: true,
      visualizacoes: Math.floor(Math.random() * 200) + 50
    };
  });
}

export const MOCK_VIDEOS = buildR2Catalog();

export const COMPLEXOS_LIST = [
  'Todos',
  'Amazon Sports Arena'
];

export const QUADRAS_LIST = [
  'Todas',
  'Quadra 01'
];
