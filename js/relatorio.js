// Relatório da evolução e Mapa em PDF, com a identidade visual da Rose.
// O PDF é criado no celular e salvo nele mesmo; o app não envia nada para ninguém.
import { Folha } from './pdf.js';
import { analisar } from './analise.js';
import { partes, dataPorExtenso } from './datas.js';
import { AVISO_LEGAL } from './ui.js';
import { ehIPhone } from './lembretes.js';

const COR = {
  marca: '#4F6B3A', marcaEscura: '#3E5530', clara: '#EEF3E6', dourado: '#B8925A', texto: '#2F3A26', texto2: '#6B6152',
  linha: '#E3D6C0', creme: '#F4EBDD', vata: '#8E89A8', pitta: '#C46A2B', kapha: '#5F8A7E',
  rosaClaro: '#F3C9CF', rosa: '#E89AA8', rosaForte: '#D46A82', contornoRosa: '#A84962',
};
const DOSHA = { vata: COR.vata, pitta: COR.pitta, kapha: COR.kapha };

const limpo = texto => String(texto || '').replace(/\*\*/g, '');
const virgula = v => v.toFixed(1).replace('.', ',');
const dataCurta = chave => { const p = partes(chave); return `${String(p.dia).padStart(2, '0')}/${String(p.mes).padStart(2, '0')}/${p.ano}`; };
const diaMes = chave => { const p = partes(chave); return `${p.dia}/${p.mes}`; };

function marca(pdf, x, y, escala = 1) {
  for (const [a, h] of [[-62, 14], [62, 14], [-30, 17], [30, 17], [0, 20]]) {
    pdf.petala(x, y, 5.5 * escala, h * escala, a, { preenchimento: COR.rosaClaro, contorno: COR.dourado });
  }
}

function novaFolha(titulo) {
  return new Folha({
    cabecalho(f) {
      marca(f.pdf, f.margem + 10, f.y + 22, 1);
      f.pdf.texto(f.margem + 28, f.y + 12, 'Rosemary Sampaio — Terapeuta Ayurvédica', { tamanho: 11, fonte: 'negrito', cor: COR.marcaEscura });
      f.pdf.texto(f.margem + 28, f.y + 25, '@rose.ayurveda', { tamanho: 9, cor: COR.texto2 });
      f.pdf.texto(f.margem + f.largura, f.y + 12, titulo, { tamanho: 9, cor: COR.texto2, alinhar: 'direita' });
      f.pdf.linha(f.margem, f.y + 34, f.margem + f.largura, f.y + 34, { cor: COR.dourado, espessura: 1 });
      f.y += 44;
    },
    rodape(f, numero) {
      const y = f.pdf.altura - f.margem + 6;
      const meio = Math.ceil(AVISO_LEGAL.length / 2);
      const corte = AVISO_LEGAL.indexOf(' ', meio);
      f.pdf.texto(f.margem, y, AVISO_LEGAL.slice(0, corte), { tamanho: 7.5, cor: COR.texto2 });
      f.pdf.texto(f.margem, y + 10, AVISO_LEGAL.slice(corte + 1), { tamanho: 7.5, cor: COR.texto2 });
      f.pdf.texto(f.margem + f.largura, y + 10, String(numero), { tamanho: 8, cor: COR.texto2, alinhar: 'direita' });
    },
  });
}

// ---------- Peças do relatório ----------

function cartoesResumo(f, itens) {
  f.espaco(62);
  const w = (f.largura - 3 * 8) / 4;
  itens.forEach(([valor, rotulo], i) => {
    const x = f.margem + i * (w + 8);
    f.pdf.retangulo(x, f.y, w, 54, { preenchimento: COR.clara });
    f.pdf.texto(x + w / 2, f.y + 25, valor, { tamanho: 16, fonte: 'negrito', cor: COR.marcaEscura, alinhar: 'centro' });
    f.pdf.texto(x + w / 2, f.y + 42, rotulo, { tamanho: 8, cor: COR.texto2, alinhar: 'centro' });
  });
  f.y += 64;
}

function graficoLinha(f, indicador) {
  const altura = 62;
  f.espaco(altura + 34);
  f.paragrafo(`${indicador.pergunta}${indicador.media != null ? ` — média ${virgula(indicador.media)} de 5` : ''}`, { tamanho: 9.5, fonte: 'negrito', depois: 2 });
  const x0 = f.margem + 70;
  const w = f.largura - 70;
  const y0 = f.y + 4;
  const y = v => y0 + altura - ((v - 1) / 4) * altura;
  for (let v = 1; v <= 5; v++) {
    f.pdf.linha(x0, y(v), x0 + w, y(v), { cor: COR.linha, espessura: v === 1 ? 0.8 : 0.4 });
  }
  f.pdf.texto(x0 - 6, y(5) + 3, indicador.rotulos[4], { tamanho: 7, cor: COR.texto2, alinhar: 'direita' });
  f.pdf.texto(x0 - 6, y(1) + 3, indicador.rotulos[0], { tamanho: 7, cor: COR.texto2, alinhar: 'direita' });
  const n = indicador.serie.length;
  const x = i => x0 + (n === 1 ? w / 2 : (i / (n - 1)) * w);
  let trecho = [];
  const desenhar = () => { if (trecho.length > 1) f.pdf.caminho(trecho, { cor: COR.marca }); trecho = []; };
  indicador.serie.forEach((p, i) => {
    if (p.valor == null) { desenhar(); return; }
    trecho.push([x(i), y(p.valor)]);
    f.pdf.circulo(x(i), y(p.valor), 1.8, { preenchimento: COR.marca });
  });
  desenhar();
  [0, n - 1].forEach(i => f.pdf.texto(x(i), y0 + altura + 11, diaMes(indicador.serie[i].data), { tamanho: 7, cor: COR.texto2, alinhar: 'centro' }));
  f.y = y0 + altura + 20;
}

function barrasHorizontais(f, linhas, { maximo = 100, sufixo = '%', cor = COR.marca } = {}) {
  for (const { rotulo, valor, cor: c } of linhas) {
    f.espaco(18);
    f.y += 14;
    const xBarra = f.margem + 210;
    const w = f.largura - 250;
    f.pdf.texto(f.margem, f.y, rotulo, { tamanho: 9 });
    f.pdf.retangulo(xBarra, f.y - 8, w, 8, { preenchimento: '#FAF4EA' });
    if (valor) f.pdf.retangulo(xBarra, f.y - 8, (Math.min(valor, maximo) / maximo) * w, 8, { preenchimento: c || cor });
    f.pdf.texto(f.margem + f.largura, f.y, valor == null ? '–' : `${valor}${sufixo}`, { tamanho: 9, fonte: 'negrito', alinhar: 'direita' });
  }
  f.y += 8;
}

function jardim(f, a) {
  const colunas = 10;
  const tamanho = f.largura / colunas;
  const linhas = Math.ceil(a.adesaoDiaria.length / colunas);
  f.espaco(Math.min(linhas, 3) * tamanho + 10);
  a.adesaoDiaria.forEach((d, i) => {
    if (i && i % colunas === 0) { f.y += tamanho; f.espaco(tamanho); }
    const cx = f.margem + (i % colunas) * tamanho + tamanho / 2;
    const cy = f.y + tamanho * 0.62;
    const abertas = d.total ? Math.round((d.feitos / d.total) * 5) : 0;
    [-60, 60, -30, 30, 0].forEach((ang, k) => {
      const aberta = k < abertas;
      f.pdf.petala(cx, cy, 4.2, ang === 0 ? 15 : 12, ang, {
        preenchimento: aberta ? (k === 4 ? COR.rosaForte : k >= 2 ? COR.rosa : COR.rosaClaro) : '#FFFDF8',
        contorno: aberta ? COR.contornoRosa : '#D9C9B6',
      });
    });
    f.pdf.texto(cx, cy + 11, diaMes(d.data), { tamanho: 6.5, cor: COR.texto2, alinhar: 'centro' });
  });
  f.y += tamanho + 6;
}

function citacao(f, data, texto, { italico = true } = {}) {
  f.espaco(30);
  f.paragrafo(dataPorExtenso(data), { tamanho: 8, cor: COR.texto2, depois: 0 });
  f.paragrafo(limpo(texto), { tamanho: 9.5, fonte: italico ? 'italico' : 'normal', recuo: 10, depois: 8 });
}

// ---------- Relatório da evolução ----------

export function gerarRelatorio(conteudo, inicio, fim) {
  const a = analisar(conteudo, inicio, fim);
  const f = novaFolha('Relatório de evolução');

  f.paragrafo('Relatório de evolução', { tamanho: 20, fonte: 'negrito', cor: COR.marcaEscura, depois: 0 });
  f.paragrafo(conteudo.cliente.nome, { tamanho: 13, cor: COR.texto, depois: 0 });
  f.paragrafo(`Período: ${dataCurta(inicio)} a ${dataCurta(fim)} · ${a.dias} dias`, { tamanho: 9.5, cor: COR.texto2, depois: 4 });
  f.paragrafo(conteudo.parceria, { tamanho: 8.5, cor: COR.texto2, depois: 10 });

  cartoesResumo(f, [
    [`${a.diasComRegistro}/${a.dias}`, 'dias com registros'],
    [a.adesaoTotal == null ? '–' : `${a.adesaoTotal}%`, 'adesão ao Quadro'],
    [String(a.floresCompletas), 'flores completas'],
    [String(a.maiorSequencia), 'maior sequência (dias)'],
  ]);

  f.titulo('Indicadores do diário');
  if (a.indicadores.some(i => i.media != null)) a.indicadores.forEach(i => graficoLinha(f, i));
  else f.paragrafo('Ainda não há diários preenchidos neste período.', { cor: COR.texto2 });
  for (const extra of [a.lingua, a.intestino].filter(Boolean)) {
    const total = Object.values(extra.contagem).reduce((s, v) => s + v, 0);
    if (!total) continue;
    f.paragrafo(extra.pergunta, { tamanho: 9.5, fonte: 'negrito', depois: 0 });
    barrasHorizontais(f, Object.entries(extra.contagem).map(([rotulo, v]) => ({ rotulo, valor: v })), { maximo: total, sufixo: ' dias' });
  }

  f.titulo('Adesão ao Quadro do dia');
  barrasHorizontais(f, a.semanas.map(s => ({ rotulo: `Semana de ${diaMes(s.inicio)} a ${diaMes(s.fim)}`, valor: s.pct })));
  f.paragrafo('Por cuidado (dias marcados no período)', { tamanho: 9.5, fonte: 'negrito', depois: 0 });
  barrasHorizontais(f, a.porItem.map(i => ({ rotulo: i.texto.length > 42 ? `${i.texto.slice(0, 40)}…` : i.texto, valor: i.pct })));

  f.titulo('Jardim de flores');
  f.paragrafo('Cada dia do período é uma flor, mais ou menos aberta conforme os cuidados marcados.', { tamanho: 9, cor: COR.texto2 });
  jardim(f, a);

  if (a.selos.length) {
    f.titulo('Selos conquistados');
    a.selos.forEach(s => f.paragrafo(`${s.nome} — ${s.texto} (${dataCurta(s.ganhoEm)})`, { tamanho: 9.5 }));
  }

  f.titulo('Momentos de apoio');
  if (a.apoio.total) {
    f.paragrafo(`${a.apoio.total} ${a.apoio.total === 1 ? 'uso' : 'usos'} do botão “${conteudo.apoio.botao}” no período${a.apoio.fome ? `, ${a.apoio.fome} por fome` : ''}.`, { tamanho: 9.5 });
    f.paragrafo('Por período do relógio ayurvédico', { tamanho: 9.5, fonte: 'negrito', depois: 0 });
    barrasHorizontais(f, a.apoio.porFaixa.map(p => ({ rotulo: `${p.nome} (${p.inicio}h–${p.fim}h)`, valor: p.usos, cor: DOSHA[p.dosha] })), { maximo: Math.max(1, ...a.apoio.porFaixa.map(p => p.usos)), sufixo: '' });
    f.paragrafo('Como estava a vontade depois da pausa', { tamanho: 9.5, fonte: 'negrito', depois: 0 });
    barrasHorizontais(f, Object.entries(a.apoio.desfechos).map(([rotulo, v]) => ({ rotulo, valor: v })), { maximo: Math.max(1, a.apoio.total), sufixo: '' });
  } else {
    f.paragrafo('O botão de apoio não foi usado neste período.', { cor: COR.texto2 });
  }

  f.titulo('Check-ins das refeições');
  if (a.refeicoes.total) {
    f.paragrafo(`${a.refeicoes.total} ${a.refeicoes.total === 1 ? 'check-in' : 'check-ins'} de refeições principais.`, { tamanho: 9.5, depois: 0 });
    barrasHorizontais(f, [
      { rotulo: 'Seguiu a refeição do plano', valor: a.refeicoes.seguidas },
      { rotulo: 'No horário', valor: a.refeicoes.noHorario },
      { rotulo: 'Comeu sentada e com calma', valor: a.refeicoes.comCalma },
      { rotulo: 'Comida quente ou morna', valor: a.refeicoes.mornas },
    ]);
    f.paragrafo('Como se sentiu depois de comer', { tamanho: 9.5, fonte: 'negrito', depois: 0 });
    barrasHorizontais(f, Object.entries(a.refeicoes.sensacoes).map(([rotulo, v]) => ({ rotulo, valor: v })), { maximo: a.refeicoes.total, sufixo: '' });
  } else {
    f.paragrafo('Ainda não há check-ins de refeições neste período.', { cor: COR.texto2 });
  }

  f.titulo('Relações entre os dados');
  if (a.relacoes.length) {
    for (const r of a.relacoes) {
      f.paragrafo(r.titulo, { tamanho: 10, fonte: 'negrito', depois: 0 });
      if (r.unidade === 'distribuicao') {
        barrasHorizontais(f, Object.entries(r.contagem).map(([rotulo, v]) => ({ rotulo, valor: v })), { maximo: Math.max(1, ...Object.values(r.contagem)), sufixo: '' });
      } else {
        const fmt = v => (v == null ? '–' : r.unidade === 'media' ? `${virgula(v)} de 5` : `${v}% leve e satisfeita`);
        f.paragrafo(`${r.a.nome}: ${fmt(r.a.valor)} (${r.a.dias})   ·   ${r.b.nome}: ${fmt(r.b.valor)} (${r.b.dias})`, { tamanho: 9.5, depois: 0 });
      }
      f.paragrafo(r.explicacao, { tamanho: 9, fonte: 'italico', cor: COR.texto2, depois: 8 });
    }
  } else {
    f.paragrafo('Com mais alguns dias de diário e check-ins, as relações entre os cuidados e o bem-estar aparecem aqui.', { cor: COR.texto2 });
  }

  if (a.alertas.length) {
    f.titulo('Pontos de atenção');
    a.alertas.forEach(t => f.paragrafo(`• ${t}`, { tamanho: 9.5 }));
  }

  if (a.abertas.length) {
    f.titulo('Observações da semana e do dia');
    for (const o of a.abertas) {
      if (o.semanal) citacao(f, o.data, `O mais difícil da semana: ${o.semanal}`);
      if (o.observacao) citacao(f, o.data, o.observacao);
    }
  }

  if (a.mensagens.length) {
    f.titulo('Mensagens recebidas');
    a.mensagens.forEach(m => citacao(f, m.data, m.texto));
  }

  return f.pdf.gerar();
}

// ---------- Mapa Ayurvédico ----------

export function gerarMapa(conteudo) {
  const m = conteudo.mapa;
  const f = novaFolha('Mapa Ayurvédico');
  const p = (t, op = {}) => f.paragrafo(limpo(t), { tamanho: 10, ...op });
  const lista = (itens, numerada = false) => itens.forEach((t, i) => p(`${numerada ? `${i + 1}.` : '•'} ${limpo(t)}`, { recuo: 10, depois: 3 }));

  f.paragrafo(`Mapa Ayurvédico — ${conteudo.cliente.nome}`, { tamanho: 20, fonte: 'negrito', cor: COR.marcaEscura, depois: 2 });
  f.paragrafo(conteudo.parceria, { tamanho: 8.5, cor: COR.texto2, depois: 10 });
  m.apresentacao.forEach(t => p(t));

  f.titulo('As 3 prioridades para você agora');
  m.prioridades.forEach((x, i) => p(`${i + 1}. ${x.titulo}: ${x.texto}`));

  f.titulo('Quem você é e o que pede cuidado agora');
  const { vata, pitta, kapha } = conteudo.doshas;
  barrasHorizontais(f, [
    { rotulo: 'Vata', valor: vata, cor: COR.vata }, { rotulo: 'Pitta', valor: pitta, cor: COR.pitta }, { rotulo: 'Kapha', valor: kapha, cor: COR.kapha },
  ], { maximo: Math.max(vata, pitta, kapha), sufixo: '' });
  p(m.prakriti.titulo, { fonte: 'negrito' }); m.prakriti.paragrafos.forEach(t => p(t));
  p(m.vikriti.titulo, { fonte: 'negrito' }); m.vikriti.paragrafos.forEach(t => p(t)); lista(m.vikriti.comoAparece); p(m.vikriti.fechamento);
  p(m.agni.titulo, { fonte: 'negrito' }); m.agni.paragrafos.forEach(t => p(t));

  f.titulo('Sua relação com o doce');
  p(m.doce.introducao); lista(m.doce.porQue); p(m.doce.conclusao);
  m.doce.caminho.forEach((c, i) => p(`${i + 1}. ${c.titulo}: ${c.texto}`));
  p('Sobre emagrecer', { fonte: 'negrito' }); p(m.doce.emagrecer);

  f.titulo('Por que o seu plano alimentar foi pensado assim');
  p(m.planoPorque.introducao);
  m.planoPorque.itens.forEach(x => { p(x.item, { fonte: 'negrito', depois: 0 }); p(x.motivo, { recuo: 10 }); });

  f.titulo('Como preparar e temperar cada refeição');
  m.refeicoes.forEach(r => { p(`${r.nome} · ${r.horario}`, { fonte: 'negrito', depois: 0 }); p(r.ajuste, { recuo: 10 }); });

  f.titulo('Seu dia pelo relógio ayurvédico');
  p(m.relogio.introducao);
  m.relogio.periodos.forEach(x => {
    p(`${x.inicio}h–${x.fim}h · ${x.dosha[0].toUpperCase()}${x.dosha.slice(1)} · ${x.nome}`, { fonte: 'negrito', depois: 0, cor: DOSHA[x.dosha] });
    p(`${x.acontece} Seu cuidado: ${x.cuidado}`, { recuo: 10 });
  });
  p(m.relogio.nota);

  f.titulo('Suas práticas diárias (Dinacharya)');
  p(m.praticas.introducao);
  for (const x of m.praticas.itens) {
    p(`${x.nome} — ${x.quando}`, { fonte: 'negrito', depois: 0 });
    p(`Por que para você: ${x.porQue}`, { recuo: 10 });
    if (x.detalhes) lista(x.detalhes);
    if (x.passos) lista(x.passos, true);
    for (const s of x.subpraticas || []) { p(s.nome, { fonte: 'negrito', recuo: 10, depois: 0 }); lista(s.passos, true); }
    if (x.cuidados) lista(x.cuidados);
    if (x.versaoCurta) p(x.versaoCurta, { recuo: 10 });
  }

  f.titulo('Chás de ervas');
  p(m.chas.introducao);
  m.chas.itens.forEach(c => p(`${c.nome} — ${c.quando}. ${c.porQue}`, { recuo: 10, depois: 3 }));
  Object.values(m.chas.preparos).forEach(x => p(`${x.nome}: ${x.texto}`));

  f.titulo('A estação e o que tira você do eixo');
  p(m.estacao.introducao); lista(m.estacao.ajustes); p(m.estacao.termometro);
  p('O que evitar neste momento', { fonte: 'negrito' }); lista(m.evitar);

  f.titulo('Como acompanhar a sua evolução');
  p(`Sinais de que está funcionando (${m.sinais.funcionandoPrazo})`, { fonte: 'negrito' }); lista(m.sinais.funcionando);
  p('Sinais de que Vata ou Pitta estão subindo de novo', { fonte: 'negrito' }); lista(m.sinais.desequilibrio);
  p(m.sinais.desequilibrioConclusao);

  f.titulo('Próximo encontro');
  p(m.proximoEncontro);
  return f.pdf.gerar();
}

// Entrega o PDF: no celular abre "Compartilhar / Salvar em Arquivos"; no computador, baixa.
export async function salvarPdf(bytes, nome) {
  const arquivo = new File([bytes], nome, { type: 'application/pdf' });
  const celular = ehIPhone() || /Android/i.test(navigator.userAgent);
  if (celular && navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: nome });
      return;
    } catch (erro) {
      if (erro.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(arquivo);
  const link = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
