/**
 * Lista base de arquivos do Cloudflare R2 da pasta do usuário:
 * Estrutura: Amazon Sports Arena -> Quadra 01 / Quadra 02 -> gol_YYYYMMDD_HHMMSS.mp4
 */

export function buildR2Catalog(r2Domain = '') {
  const cleanDomain = r2Domain ? r2Domain.trim().replace(/\/$/, '') : 'https://pub-123456789.r2.dev';

  return [
    {
      id: 'r2_gol_20260713_205352',
      title: 'Replay de Gol - 13/07/2026 às 20:53:52',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '20:53:52',
      horaBloco: '20h',
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: `${cleanDomain}/gol_20260713_205352.mp4`,
      filename: 'gol_20260713_205352.mp4',
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
      videoUrl: `${cleanDomain}/gol_20260713_205410.mp4`,
      filename: 'gol_20260713_205410.mp4',
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
      videoUrl: `${cleanDomain}/gol_20260713_211312.mp4`,
      filename: 'gol_20260713_211312.mp4',
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: true,
      visualizacoes: 320
    },
    {
      id: 'r2_gol_20260713_211355',
      title: 'Replay de Gol - 13/07/2026 às 21:13:55',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '21:13:55',
      horaBloco: '21h',
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=80',
      videoUrl: `${cleanDomain}/gol_20260713_211355.mp4`,
      filename: 'gol_20260713_211355.mp4',
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: false,
      visualizacoes: 110
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
      videoUrl: `${cleanDomain}/gol_20260713_211845.mp4`,
      filename: 'gol_20260713_211845.mp4',
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: true,
      visualizacoes: 215
    },
    {
      id: 'r2_gol_20260713_212430',
      title: 'Replay de Gol - 13/07/2026 às 21:24:30',
      autor: 'Amazon Sports Arena',
      complexo: 'Amazon Sports Arena',
      quadra: 'Quadra 01',
      data: '2026-07-13',
      hora: '21:24:30',
      horaBloco: '21h',
      duracao: '00:15',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      videoUrl: `${cleanDomain}/gol_20260713_212430.mp4`,
      filename: 'gol_20260713_212430.mp4',
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 01', '21h'],
      favorito: true,
      visualizacoes: 198
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
      videoUrl: `${cleanDomain}/gol_20260713_055900.mp4`,
      filename: 'gol_20260713_055900.mp4',
      tipoGol: 'Stream Cloudflare R2',
      tags: ['Amazon Sports Arena', 'Quadra 02', '5h'],
      favorito: true,
      visualizacoes: 75
    }
  ];
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
