// Gerador de PDF simples, feito para o app: texto, linhas, retângulos e círculos.
// Funciona no próprio celular, sem internet e sem bibliotecas de fora.
// Usa as fontes Helvetica do próprio PDF, com acentos do português (WinAnsi).

// Larguras da Helvetica (em milésimos do tamanho da letra), caracteres 32 a 126.
const LARGURAS = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015,
  667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  278, 278, 278, 469, 556, 333,
  556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500,
  334, 260, 334, 584];

// Caracteres fora do Latin-1 que existem no WinAnsi.
const ESPECIAIS = { '—': 0x97, '–': 0x96, '“': 0x93, '”': 0x94, '‘': 0x91, '’': 0x92, '…': 0x85, '•': 0x95, '€': 0x80 };

function codigo(ch) {
  if (ESPECIAIS[ch]) return ESPECIAIS[ch];
  const c = ch.charCodeAt(0);
  return c >= 32 && c <= 255 ? c : 63; // "?" para o que não existe na fonte
}

function larguraCaractere(ch) {
  const base = ch.normalize('NFD')[0];
  const c = base.charCodeAt(0);
  if (c >= 32 && c <= 126) return LARGURAS[c - 32];
  return ESPECIAIS[ch] === 0x97 ? 1000 : 556;
}

export function larguraTexto(texto, tamanho, negrito = false) {
  let soma = 0;
  for (const ch of texto) soma += larguraCaractere(ch);
  return (soma / 1000) * tamanho * (negrito ? 1.06 : 1);
}

function textoPdf(texto) {
  let s = '';
  for (const ch of texto) {
    const c = codigo(ch);
    const char = String.fromCharCode(c);
    s += char === '(' || char === ')' || char === '\\' ? `\\${char}` : char;
  }
  return s;
}

function cor(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => (v / 255).toFixed(3)).join(' ');
}

export class Pdf {
  constructor({ largura = 595.28, altura = 841.89 } = {}) {
    this.largura = largura;
    this.altura = altura;
    this.paginas = [];
    this.novaPagina();
  }

  novaPagina() {
    this.atual = [];
    this.paginas.push(this.atual);
  }

  // Coordenadas a partir do canto superior esquerdo (mais natural para montar páginas).
  texto(x, y, conteudo, { tamanho = 10, fonte = 'normal', cor: c = '#2F3A26', alinhar = 'esquerda' } = {}) {
    const f = { normal: 'F1', negrito: 'F2', italico: 'F3' }[fonte];
    const largura = larguraTexto(conteudo, tamanho, fonte === 'negrito');
    const px = alinhar === 'centro' ? x - largura / 2 : alinhar === 'direita' ? x - largura : x;
    this.atual.push(`BT /${f} ${tamanho} Tf ${cor(c)} rg ${px.toFixed(2)} ${(this.altura - y).toFixed(2)} Td (${textoPdf(conteudo)}) Tj ET`);
  }

  linha(x1, y1, x2, y2, { cor: c = '#E3D6C0', espessura = 0.8 } = {}) {
    this.atual.push(`${cor(c)} RG ${espessura} w ${x1.toFixed(2)} ${(this.altura - y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.altura - y2).toFixed(2)} l S`);
  }

  // Linha quebrada (polilinha) — para os gráficos de evolução.
  caminho(pontos, { cor: c = '#4F6B3A', espessura = 1.5 } = {}) {
    if (pontos.length < 2) return;
    const [p0, ...resto] = pontos;
    this.atual.push(`${cor(c)} RG ${espessura} w 1 J 1 j ${p0[0].toFixed(2)} ${(this.altura - p0[1]).toFixed(2)} m ${resto.map(p => `${p[0].toFixed(2)} ${(this.altura - p[1]).toFixed(2)} l`).join(' ')} S`);
  }

  retangulo(x, y, w, h, { preenchimento, contorno, espessura = 0.8 } = {}) {
    const ops = [];
    if (preenchimento) ops.push(`${cor(preenchimento)} rg`);
    if (contorno) ops.push(`${cor(contorno)} RG ${espessura} w`);
    ops.push(`${x.toFixed(2)} ${(this.altura - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`);
    ops.push(preenchimento && contorno ? 'B' : preenchimento ? 'f' : 'S');
    this.atual.push(ops.join(' '));
  }

  circulo(cx, cy, r, opcoes = {}) {
    const k = 0.5523 * r;
    const y = this.altura - cy;
    const ops = [];
    if (opcoes.preenchimento) ops.push(`${cor(opcoes.preenchimento)} rg`);
    if (opcoes.contorno) ops.push(`${cor(opcoes.contorno)} RG ${opcoes.espessura || 0.8} w`);
    ops.push(`${(cx + r).toFixed(2)} ${y.toFixed(2)} m`,
      `${(cx + r).toFixed(2)} ${(y + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(y + r).toFixed(2)} ${cx.toFixed(2)} ${(y + r).toFixed(2)} c`,
      `${(cx - k).toFixed(2)} ${(y + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(y + k).toFixed(2)} ${(cx - r).toFixed(2)} ${y.toFixed(2)} c`,
      `${(cx - r).toFixed(2)} ${(y - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(y - r).toFixed(2)} ${cx.toFixed(2)} ${(y - r).toFixed(2)} c`,
      `${(cx + k).toFixed(2)} ${(y - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(y - k).toFixed(2)} ${(cx + r).toFixed(2)} ${y.toFixed(2)} c`);
    ops.push(opcoes.preenchimento && opcoes.contorno ? 'B' : opcoes.preenchimento ? 'f' : 'S');
    this.atual.push(ops.join(' '));
  }

  // Pétala de lótus (curvas de Bézier), para a marca e o jardim no relatório.
  petala(cx, cy, w, h, angulo, { preenchimento, contorno }) {
    const a = (angulo * Math.PI) / 180;
    const rot = (px, py) => [cx + px * Math.cos(a) - py * Math.sin(a), cy + px * Math.sin(a) + py * Math.cos(a)];
    const p = [[0, 0], [w * 0.95, -h * 0.35], [w * 0.6, -h * 0.85], [0, -h], [-w * 0.6, -h * 0.85], [-w * 0.95, -h * 0.35], [0, 0]].map(([px, py]) => rot(px, py));
    const f = ([px, py]) => `${px.toFixed(2)} ${(this.altura - py).toFixed(2)}`;
    this.atual.push(`${cor(preenchimento)} rg ${cor(contorno)} RG 0.5 w ${f(p[0])} m ${f(p[1])} ${f(p[2])} ${f(p[3])} c ${f(p[4])} ${f(p[5])} ${f(p[6])} c B`);
  }

  gerar() {
    const objetos = [];
    const adicionar = conteudo => { objetos.push(conteudo); return objetos.length; };
    const catalogo = adicionar('');
    const paginasId = adicionar('');
    const fonte = nome => adicionar(`<< /Type /Font /Subtype /Type1 /BaseFont /${nome} /Encoding /WinAnsiEncoding >>`);
    const f1 = fonte('Helvetica');
    const f2 = fonte('Helvetica-Bold');
    const f3 = fonte('Helvetica-Oblique');
    const recursos = `<< /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >> >>`;
    const filhos = this.paginas.map(ops => {
      const fluxo = ops.join('\n');
      const conteudo = adicionar(`<< /Length ${fluxo.length} >>\nstream\n${fluxo}\nendstream`);
      return adicionar(`<< /Type /Page /Parent ${paginasId} 0 R /MediaBox [0 0 ${this.largura} ${this.altura}] /Resources ${recursos} /Contents ${conteudo} 0 R >>`);
    });
    objetos[catalogo - 1] = `<< /Type /Catalog /Pages ${paginasId} 0 R >>`;
    objetos[paginasId - 1] = `<< /Type /Pages /Kids [${filhos.map(id => `${id} 0 R`).join(' ')}] /Count ${filhos.length} >>`;

    let saida = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const posicoes = [];
    objetos.forEach((o, i) => { posicoes.push(saida.length); saida += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = saida.length;
    saida += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n${posicoes.map(p => `${String(p).padStart(10, '0')} 00000 n \n`).join('')}`;
    saida += `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogo} 0 R >>\nstartxref\n${xref}\n%%EOF`;

    const bytes = new Uint8Array(saida.length);
    for (let i = 0; i < saida.length; i++) bytes[i] = saida.charCodeAt(i) & 255;
    return bytes;
  }
}

// Monta páginas de cima para baixo, com quebra automática de linha e de página.
export class Folha {
  constructor({ cabecalho, rodape } = {}) {
    this.pdf = new Pdf();
    this.margem = 48;
    this.cabecalho = cabecalho;
    this.rodape = rodape;
    this.numero = 1;
    this.iniciarPagina();
  }

  get largura() { return this.pdf.largura - 2 * this.margem; }

  iniciarPagina() {
    this.y = this.margem;
    this.cabecalho?.(this);
    this.rodape?.(this, this.numero);
  }

  espaco(altura) {
    if (this.y + altura > this.pdf.altura - this.margem - 24) {
      this.pdf.novaPagina();
      this.numero++;
      this.iniciarPagina();
    }
  }

  // Parágrafo com quebra de linha pela largura disponível.
  paragrafo(texto, { tamanho = 10, fonte = 'normal', cor, entrelinha = 1.45, recuo = 0, depois = 6 } = {}) {
    const largura = this.largura - recuo;
    const palavras = String(texto).split(/\s+/).filter(Boolean);
    const linhas = [];
    let atual = '';
    for (const p of palavras) {
      const teste = atual ? `${atual} ${p}` : p;
      if (larguraTexto(teste, tamanho, fonte === 'negrito') > largura && atual) { linhas.push(atual); atual = p; }
      else atual = teste;
    }
    if (atual) linhas.push(atual);
    for (const linha of linhas) {
      this.espaco(tamanho * entrelinha);
      this.y += tamanho * entrelinha;
      this.pdf.texto(this.margem + recuo, this.y, linha, { tamanho, fonte, cor });
    }
    this.y += depois;
  }

  titulo(texto) {
    this.espaco(60);
    this.y += 14;
    this.paragrafo(texto, { tamanho: 14, fonte: 'negrito', cor: '#3E5530', depois: 2 });
    this.pdf.linha(this.margem, this.y + 2, this.margem + this.largura, this.y + 2, { cor: '#B8925A', espessura: 0.8 });
    this.y += 10;
  }
}
