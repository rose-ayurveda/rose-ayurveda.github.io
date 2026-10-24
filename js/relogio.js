// Relógio ayurvédico: qual período do dia é agora, no fuso da cliente.
import { NOMES_DOSHA } from './ui.js';

const CORES = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)' };

// Hora e minuto atuais no fuso da cliente (padrão: America/Sao_Paulo).
export function horaLocal(fuso = 'America/Sao_Paulo', data = new Date()) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: fuso, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(data);
  const h = Number(partes.find(p => p.type === 'hour').value);
  const m = Number(partes.find(p => p.type === 'minute').value);
  return { h, m, decimal: h + m / 60 };
}

function dentro(periodo, hora) {
  const { inicio, fim } = periodo;
  return inicio < fim ? hora >= inicio && hora < fim : hora >= inicio || hora < fim;
}

export function periodoAtual(periodos, hora) {
  return periodos.find(p => dentro(p, hora)) || periodos[0];
}

export function faixa(periodo) {
  return `${periodo.inicio}h–${periodo.fim}h`;
}

export function saudacao(hora) {
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Mostrador de 24 horas: meia-noite no alto, cada período na cor do seu dosha.
export function mostrador(periodos, hora) {
  const cx = 66, cy = 66, r = 54;
  const ponto = (h, raio) => {
    const a = (h / 24) * 2 * Math.PI - Math.PI / 2;
    return [cx + raio * Math.cos(a), cy + raio * Math.sin(a)];
  };
  const atual = periodoAtual(periodos, hora);
  let arcos = '';
  for (const p of periodos) {
    const fim = p.fim > p.inicio ? p.fim : p.fim + 24;
    const [x1, y1] = ponto(p.inicio, r);
    const [x2, y2] = ponto(fim, r);
    const largo = fim - p.inicio > 12 ? 1 : 0;
    const ativo = p === atual;
    arcos += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${largo} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${CORES[p.dosha]}" stroke-width="${ativo ? 14 : 9}" fill="none" opacity="${ativo ? 1 : 0.45}"/>`;
  }
  const [px, py] = ponto(hora, r);
  const marcas = [0, 6, 12, 18].map(h => {
    const [x, y] = ponto(h, r - 20);
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--texto-2)">${h}h</text>`;
  }).join('');
  return `<svg viewBox="0 0 132 132" role="img" aria-label="Relógio ayurvédico: agora é o período de ${NOMES_DOSHA[atual.dosha]}">
    ${arcos}${marcas}
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="6" fill="var(--cartao)" stroke="var(--texto)" stroke-width="2"/>
    <text x="66" y="70" text-anchor="middle" font-size="15" font-family="var(--serifa)" fill="var(--texto)">${NOMES_DOSHA[atual.dosha]}</text>
  </svg>`;
}
