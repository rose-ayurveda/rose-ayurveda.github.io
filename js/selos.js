// Desenho dos selos de conquista: medalhão dourado com um símbolo ayurvédico.

const SIMBOLOS = {
  sol: '<circle cx="24" cy="24" r="6"/><path d="M24 11v4M24 33v4M11 24h4M33 24h4M15 15l3 3M30 30l3 3M15 33l3-3M30 18l3-3"/>',
  lua: '<path d="M28 13a11 11 0 1 0 7 19 9 9 0 0 1-7-19z"/>',
  chama: '<path d="M24 12c5 6 8 10 8 15a8 8 0 0 1-16 0c0-3 2-6 4-8 0 3 1 5 3 5 0-4 0-8 1-12z"/>',
  gota: '<path d="M24 12c5 7 9 12 9 17a9 9 0 0 1-18 0c0-5 4-10 9-17z"/>',
  folha: '<path d="M14 34c0-11 7-19 21-21-1 13-9 21-21 21z"/><path d="M14 34c5-6 9-10 14-14"/>',
  lotus: '<path d="M24 34c-3-4-3-11 0-18 3 7 3 14 0 18z"/><path d="M24 34c-6-1-9-7-9-13 5 2 8 7 9 13z"/><path d="M24 34c6-1 9-7 9-13-5 2-8 7-9 13z"/>',
  estrela: '<path d="M24 12l3.5 7.5 8 1-6 5.5 1.6 8L24 30l-7.1 4 1.6-8-6-5.5 8-1z"/>',
};

export function selo(simbolo, ganho, tamanho = 64) {
  const cor = ganho ? 'var(--dourado)' : 'var(--linha)';
  const fundo = ganho ? 'var(--marca-clara)' : 'var(--cartao-2)';
  const traco = ganho ? 'var(--marca-escura)' : 'var(--texto-2)';
  return `<svg viewBox="0 0 48 48" width="${tamanho}" height="${tamanho}" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="${fundo}" stroke="${cor}" stroke-width="2.5"/>
    <circle cx="24" cy="24" r="18" fill="none" stroke="${cor}" stroke-width="0.8" stroke-dasharray="2 2"/>
    <g fill="none" stroke="${traco}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SIMBOLOS[simbolo] || SIMBOLOS.lotus}</g>
  </svg>`;
}
