// Pequenas ferramentas de tela usadas por todas as telas.

export function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Texto com **negrito** (o único formato que o conteúdo usa).
export function rico(texto) {
  return esc(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function paragrafos(lista, classe = 'texto-longo') {
  return (lista || []).map(p => `<p class="${classe}">${rico(p)}</p>`).join('');
}

export function lista(itens, numerada = false) {
  if (!itens || !itens.length) return '';
  const tag = numerada ? 'ol' : 'ul';
  return `<${tag} class="lista${numerada ? ' numerada' : ''}">${itens.map(i => `<li class="texto-longo">${rico(i)}</li>`).join('')}</${tag}>`;
}

export function secao(titulo, conteudo, aberta = false) {
  return `<details class="secao"${aberta ? ' open' : ''}><summary>${esc(titulo)}</summary><div class="conteudo">${conteudo}</div></details>`;
}

export const AVISO_LEGAL = 'As orientações são terapêuticas e de estilo de vida, segundo os princípios do Ayurveda, e não substituem diagnóstico ou tratamento médico.';

export function avisoLegal() {
  return `<p class="aviso-legal">${AVISO_LEGAL}</p>`;
}

export const NOMES_DOSHA = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' };

// Ícones de traço simples, desenhados para o app (funcionam sem internet).
const tracos = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
export const icones = {
  agora: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  quadro: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8.5l1.5 1.5L12 7.5M8 14.5l1.5 1.5L12 13.5M14.5 9h2M14.5 15h2"/></svg>`,
  praticas: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19c3-4 6-7 9-9"/></svg>`,
  evolucao: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><path d="M4 19h16"/><path d="M5 15l4-4 3 3 6-7"/></svg>`,
  mapa: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><path d="M12 20c-4-2-6-5-6-9 3 0 5 2 6 5 1-3 3-5 6-5 0 4-2 7-6 9z"/><path d="M12 16c-1.5-3-1.5-7 0-11 1.5 4 1.5 8 0 11z"/></svg>`,
  ajustes: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>`,
  voltar: `<svg viewBox="0 0 24 24" ${tracos} aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>`,
};
