// Gráficos simples em SVG para a tela "Minha evolução" (funcionam sem internet).
import { esc } from './ui.js';
import { partes } from './datas.js';

const LARGURA = 320;

function diaMes(chave) {
  const p = partes(chave);
  return `${p.dia}/${p.mes}`;
}

// Linha de um indicador de 1 a 5 ao longo dos dias. Dias sem registro ficam em branco.
export function graficoLinha(serie, { cor = 'var(--marca)', rotulos = [] } = {}) {
  const altura = 120;
  const margem = { esq: 8, dir: 8, topo: 10, base: 22 };
  const w = LARGURA - margem.esq - margem.dir;
  const h = altura - margem.topo - margem.base;
  const x = i => margem.esq + (serie.length === 1 ? w / 2 : (i / (serie.length - 1)) * w);
  const y = v => margem.topo + h - ((v - 1) / 4) * h;

  let grade = '';
  for (let v = 1; v <= 5; v++) {
    grade += `<line x1="${margem.esq}" x2="${LARGURA - margem.dir}" y1="${y(v)}" y2="${y(v)}" stroke="var(--linha)" stroke-width="${v === 1 ? 1 : 0.6}"/>`;
  }
  // Trechos contínuos (um dia sem registro interrompe a linha).
  let caminho = '';
  let aberto = false;
  serie.forEach((p, i) => {
    if (p.valor == null) { aberto = false; return; }
    caminho += `${aberto ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.valor).toFixed(1)} `;
    aberto = true;
  });
  const pontos = serie.map((p, i) => p.valor == null ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(p.valor).toFixed(1)}" r="3.2" fill="${cor}"><title>${diaMes(p.data)}: ${esc(rotulos[p.valor - 1] || p.valor)}</title></circle>`).join('');
  const marcas = [0, Math.floor((serie.length - 1) / 2), serie.length - 1]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(i => {
      const ancora = i === 0 && serie.length > 1 ? 'start' : i === serie.length - 1 && serie.length > 1 ? 'end' : 'middle';
      return `<text x="${x(i)}" y="${altura - 6}" font-size="10" text-anchor="${ancora}" fill="var(--texto-2)">${diaMes(serie[i].data)}</text>`;
    }).join('');
  const descricao = serie.filter(p => p.valor != null).map(p => `${diaMes(p.data)}: ${rotulos[p.valor - 1] || p.valor}`).join('; ') || 'sem registros';
  return `<svg viewBox="0 0 ${LARGURA} ${altura}" class="grafico" role="img" aria-label="${esc(descricao)}">${grade}<path d="${caminho}" fill="none" stroke="${cor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${pontos}${marcas}</svg>`;
}

// Barras verticais com rótulo embaixo e valor em cima.
export function graficoBarras(dados, { maximo, sufixo = '', cor = 'var(--marca)' } = {}) {
  const altura = 130;
  const margem = { topo: 16, base: 30 };
  const h = altura - margem.topo - margem.base;
  const topo = maximo ?? Math.max(1, ...dados.map(d => d.valor || 0));
  const largura = LARGURA / dados.length;
  const barras = dados.map((d, i) => {
    const valor = d.valor || 0;
    const bh = (valor / topo) * h;
    const x = i * largura + largura * 0.2;
    const bw = largura * 0.6;
    return `
      <rect x="${x}" y="${margem.topo + h - bh}" width="${bw}" height="${Math.max(bh, 1)}" rx="4" fill="${d.cor || cor}"/>
      <text x="${x + bw / 2}" y="${margem.topo + h - bh - 4}" font-size="10" text-anchor="middle" fill="var(--texto)">${d.valor == null ? '–' : `${Number.isInteger(valor) ? valor : decimal(valor)}${sufixo}`}</text>
      <text x="${x + bw / 2}" y="${altura - 14}" font-size="9.5" text-anchor="middle" fill="var(--texto-2)">${esc(d.rotulo)}</text>
      ${d.rotulo2 ? `<text x="${x + bw / 2}" y="${altura - 3}" font-size="9" text-anchor="middle" fill="var(--texto-2)">${esc(d.rotulo2)}</text>` : ''}`;
  }).join('');
  const descricao = dados.map(d => `${d.rotulo} ${d.rotulo2 || ''}: ${d.valor ?? 'sem registro'}${sufixo}`).join('; ');
  return `<svg viewBox="0 0 ${LARGURA} ${altura}" class="grafico" role="img" aria-label="${esc(descricao)}">${barras}</svg>`;
}

// Barra horizontal de porcentagem, com rótulo.
export function barraPct(rotulo, pct, cor = 'var(--marca)') {
  return `
    <div class="barra-pct">
      <div class="barra-pct-rotulo"><span>${esc(rotulo)}</span><strong>${pct == null ? '–' : `${pct}%`}</strong></div>
      <div class="trilho-selo"><span style="width:${pct || 0}%;background:${cor}"></span></div>
    </div>`;
}

// Número com vírgula, como se escreve no Brasil (3,7).
export function decimal(valor, casas = 1) {
  return valor.toFixed(casas).replace('.', ',');
}

export function rotuloDia(chave) {
  return diaMes(chave);
}
