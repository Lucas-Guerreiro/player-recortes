/**
 * Lista de replays do Cloudflare R2 com nomenclatura real extraída do R2 do usuário:
 * Exemplo real: https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev/Amazon%20Sports%20Arena/Quadra%2001/gol_20260713_205351_Ugreen.mp4
 */

export function buildR2Catalog(r2Domain = '', folderPath = '') {
  const cleanDomain = r2Domain ? r2Domain.trim().replace(/\/$/, '') : 'https://pub-8a55216f0c144ba7b4851614e6728ae2.r2.dev';
  const cleanPrefix = folderPath ? folderPath.trim().replace(/^\//, '').replace(/\/$/, '') + '/' : 'Amazon Sports Arena/Quadra 01/';

  const items = [
    {
      id: 'r2_gol_20260713_205351_ugreen',
      title: 'Replay de Gol - 13/07/2026 às 20:53:51',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '20:53:51',
      horaBloco: '20h',
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      filename: `${cleanPrefix}gol_20260713_205351_Ugreen.mp4`,
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '20h'],
      favorito: true,
      visualizacoes: 184
    },
    {
      id: 'r2_gol_20260713_205410',
      title: 'Replay de Gol - 13/07/2026 às 20:54:10',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '20:54:10',
      horaBloco: '20h',
      duracao: '00:14',
      thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      filename: `${cleanPrefix}gol_20260713_205410.mp4`,
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '20h'],
      favorito: false,
      visualizacoes: 92
    },
    {
      id: 'r2_gol_20260713_211312',
      title: 'Replay de Gol - 13/07/2026 às 21:13:12',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '21:13:12',
      horaBloco: '21h',
      duracao: '00:16',
      thumbnail: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
      filename: `${cleanPrefix}gol_20260713_211312.mp4`,
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: true,
      visualizacoes: 320
    },
    {
      id: 'r2_gol_20260713_211845',
      title: 'Replay de Gol - 13/07/2026 às 21:18:45',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '21:18:45',
      horaBloco: '21h',
      duracao: '00:14',
      thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=800&q=80',
      filename: `${cleanPrefix}gol_20260713_211845.mp4`,
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: true,
      visualizacoes: 215
    },
    {
      id: 'r2_gol_20260713_055900',
      title: 'Replay de Gol - 13/07/2026 às 05:59:00',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 02',
      data: '2026-07-13',
      hora: '05:59:00',
      horaBloco: '5h',
      duracao: '00:13',
      thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      filename: `${cleanPrefix}gol_20260713_055900.mp4`,
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 02', '5h'],
      favorito: true,
      visualizacoes: 75
    }
  ];

  return items.map(item => ({
    ...item,
    videoUrl: encodeURI(`${cleanDomain}/${item.filename}`)
  }));
}

export const MOCK_VIDEOS = buildR2Catalog();

export const COMPLEXOS_LIST = [
  'Todos',
  'Amazon Sports Arena'
];

export const QUADRAS_LIST = [
  'Todas',
  'Quadra 01',
  'Quadra 02'
];
