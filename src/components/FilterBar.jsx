import React from 'react';
import { Filter, Building2, Grid, Calendar, Clock, RotateCcw } from 'lucide-react';

export default function FilterBar({
  selectedComplexo,
  setSelectedComplexo,
  selectedQuadra,
  setSelectedQuadra,
  selectedData,
  setSelectedData,
  selectedHora,
  setSelectedHora,
  complexosOptions,
  quadrasOptions,
  datasOptions,
  horasOptions,
  onResetFilters,
  filteredCount,
  totalCount
}) {
  const hasActiveFilters = 
    selectedComplexo !== 'Todos' || 
    selectedQuadra !== 'Todas' || 
    selectedData !== 'Todas' || 
    selectedHora !== 'Todas';

  return (
    <section className="glass-panel" style={{ padding: '20px 24px', marginBottom: '28px' }}>
      
      {/* Title & Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={20} color="var(--accent-green)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.3px' }}>
            Filtrar Catálogo do Google Drive
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Exibindo <strong style={{ color: 'var(--accent-green)' }}>{filteredCount}</strong> de {totalCount} replays
          </span>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '16px' }}
            >
              <RotateCcw size={14} />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de 4 Filtros: Complexo, Quadra, Data, Hora */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        
        {/* 1. Filtro: Complexo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={15} />
            <span>Complexo Esportivo</span>
          </label>
          <select
            className="select-input"
            value={selectedComplexo}
            onChange={(e) => setSelectedComplexo(e.target.value)}
          >
            {complexosOptions.map(opt => (
              <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Filtro: Quadra */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Grid size={15} />
            <span>Quadra / Campo</span>
          </label>
          <select
            className="select-input"
            value={selectedQuadra}
            onChange={(e) => setSelectedQuadra(e.target.value)}
          >
            {quadrasOptions.map(opt => (
              <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Filtro: Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} />
            <span>Data da Gravação</span>
          </label>
          <select
            className="select-input"
            value={selectedData}
            onChange={(e) => setSelectedData(e.target.value)}
          >
            {datasOptions.map(opt => (
              <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {opt === 'Todas' ? 'Todas as Datas' : new Date(opt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Filtro: Hora (Agrupado por Bloco de Hora - ex: 21h agrupa 21:00 até 21:59) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} />
            <span>Bloco de Hora</span>
          </label>
          <select
            className="select-input"
            value={selectedHora}
            onChange={(e) => setSelectedHora(e.target.value)}
          >
            {horasOptions.map(opt => {
              let label = opt;
              if (opt !== 'Todas') {
                const hourNum = opt.replace('h', '').padStart(2, '0');
                label = `${opt} (${hourNum}:00 às ${hourNum}:59)`;
              } else {
                label = 'Todas as Horas';
              }
              return (
                <option key={opt} value={opt} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

      </div>

    </section>
  );
}
