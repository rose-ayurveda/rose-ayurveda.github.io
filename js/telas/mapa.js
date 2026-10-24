// "Meu Mapa": o Mapa Ayurvédico da cliente, em seções curtas.
import { esc, rico, paragrafos, lista, secao, avisoLegal, NOMES_DOSHA } from '../ui.js';
import { faixa } from '../relogio.js';
import { gerarMapa, salvarPdf } from '../relatorio.js';

function cabecalho(c) {
  const { vata, pitta, kapha, resultado } = c.doshas;
  const maior = Math.max(vata, pitta, kapha, 1);
  const barra = (nome, valor) => `
    <div class="barra dosha-${nome}">
      <span>${NOMES_DOSHA[nome]}</span>
      <span class="trilho"><span class="valor" style="display:block;width:${(valor / maior) * 100}%"></span></span>
      <strong>${valor}</strong>
    </div>`;
  return `
    <section class="cartao">
      <p class="rotulo">Mapa Ayurvédico</p>
      <h1>${esc(c.cliente.nome)}</h1>
      <p>Sua constituição: <strong>${esc(resultado)}</strong></p>
      <div class="barras">${barra('vata', vata)}${barra('pitta', pitta)}${barra('kapha', kapha)}</div>
      <p class="rotulo" style="margin-top:12px">${esc(c.parceria)}</p>
    </section>`;
}

function blocos(itens) {
  return itens.map(i => `<div class="par"><h3>${esc(i.titulo)}</h3><p class="texto-longo">${rico(i.texto)}</p></div>`).join('');
}

function pratica(p) {
  let html = `<div class="par"><h3>${esc(p.nome)}</h3>`;
  html += `<p class="rotulo">${esc(p.quando)}</p>`;
  html += `<p class="texto-longo"><strong>Por que para você:</strong> ${rico(p.porQue)}</p>`;
  if (p.detalhes) html += lista(p.detalhes);
  if (p.passos) html += `<p><strong>Como fazer</strong></p>${lista(p.passos, true)}`;
  for (const s of p.subpraticas || []) html += `<p><strong>${esc(s.nome)}</strong></p>${lista(s.passos, true)}`;
  if (p.cuidados) html += lista(p.cuidados);
  if (p.versaoCurta) html += `<p class="texto-longo">${rico(p.versaoCurta)}</p>`;
  return html + '</div>';
}

export function telaMapa(c) {
  const m = c.mapa;
  const partes = [];

  partes.push(cabecalho(c));
  partes.push(`<section class="cartao suave">${paragrafos(m.apresentacao)}</section>`);

  partes.push(secao('As 3 prioridades para você agora',
    m.prioridades.map((p, i) => `<div class="par"><h3>${i + 1}. ${esc(p.titulo)}</h3><p class="texto-longo">${rico(p.texto)}</p></div>`).join(''),
    true));

  partes.push(secao('Quem você é: sua constituição',
    `<h3>${esc(m.prakriti.titulo)}</h3>${paragrafos(m.prakriti.paragrafos)}`));

  partes.push(secao('O que pede cuidado agora',
    `<h3>${esc(m.vikriti.titulo)}</h3>${paragrafos(m.vikriti.paragrafos)}
     <p><strong>Como isso aparece em você:</strong></p>${lista(m.vikriti.comoAparece)}
     <p class="texto-longo">${rico(m.vikriti.fechamento)}</p>`));

  partes.push(secao('Seu fogo digestivo',
    `<h3>${esc(m.agni.titulo)}</h3>${paragrafos(m.agni.paragrafos)}`));

  partes.push(secao('Sua relação com o doce',
    `<p class="texto-longo">${rico(m.doce.introducao)}</p>
     <h3>Por que o doce chama tanto você</h3>${lista(m.doce.porQue)}
     <p class="texto-longo">${rico(m.doce.conclusao)}</p>
     <h3>O caminho: nutrir para que a vontade diminua</h3>${blocos(m.doce.caminho)}
     <h3>Sobre emagrecer</h3><p class="texto-longo">${rico(m.doce.emagrecer)}</p>`));

  partes.push(secao('Por que o seu plano alimentar foi pensado assim',
    `<p class="texto-longo">${rico(m.planoPorque.introducao)}</p>
     ${m.planoPorque.itens.map(i => `<div class="par"><h3>${esc(i.item)}</h3><p class="texto-longo">${rico(i.motivo)}</p></div>`).join('')}`));

  partes.push(secao('Como preparar e temperar cada refeição',
    `<p class="texto-longo">Use junto com o plano alimentar. As opções continuam as mesmas; aqui está o ajuste ayurvédico de cada uma.</p>
     ${m.refeicoes.map(r => `<div class="par"><h3>${esc(r.nome)} <span class="rotulo">· ${esc(r.horario)}</span></h3><p class="texto-longo">${rico(r.ajuste)}</p></div>`).join('')}`));

  partes.push(secao('Seu dia pelo relógio ayurvédico',
    `<p class="texto-longo">${rico(m.relogio.introducao)}</p>
     ${m.relogio.periodos.map(p => `
       <div class="cartao cartao-dosha dosha-${p.dosha}" style="margin-bottom:8px">
         <p class="rotulo">${faixa(p)} · <span class="selo-dosha">${NOMES_DOSHA[p.dosha]}</span> · ${esc(p.nome)}</p>
         <p style="margin:6px 0 4px">${rico(p.acontece)}</p>
         <p style="margin:0"><strong>Seu cuidado:</strong> ${rico(p.cuidado)}</p>
       </div>`).join('')}
     <p class="texto-longo">${rico(m.relogio.nota)}</p>`));

  partes.push(secao('Suas práticas diárias (Dinacharya)',
    `<p class="texto-longo">${rico(m.praticas.introducao)}</p>${m.praticas.itens.map(pratica).join('')}`));

  partes.push(secao('Chás de ervas',
    `<p class="texto-longo">${rico(m.chas.introducao)}</p>
     ${m.chas.itens.map(ch => `<div class="par"><h3>${esc(ch.nome)}</h3><p class="rotulo">${esc(ch.quando)}</p><p>${rico(ch.porQue)}</p></div>`).join('')}
     <h3>Preparo</h3>
     ${Object.values(m.chas.preparos).map(p => `<p><strong>${esc(p.nome)}:</strong> ${rico(p.texto)}</p>`).join('')}`));

  partes.push(secao('A estação e o que tira você do eixo',
    `<h3>${esc(m.estacao.titulo)}</h3><p class="texto-longo">${rico(m.estacao.introducao)}</p>${lista(m.estacao.ajustes)}
     <p class="texto-longo">${rico(m.estacao.termometro)}</p>
     <h3>O que evitar neste momento</h3>${lista(m.evitar)}`));

  partes.push(secao('Como acompanhar a sua evolução',
    `<h3>Sinais de que está funcionando (${esc(m.sinais.funcionandoPrazo)})</h3>${lista(m.sinais.funcionando)}
     <h3>Sinais de que Vata ou Pitta estão subindo de novo</h3>${lista(m.sinais.desequilibrio)}
     <p class="texto-longo">${rico(m.sinais.desequilibrioConclusao)}</p>`));

  partes.push(secao('Próximo encontro',
    `<p class="texto-longo">${rico(m.proximoEncontro)}</p>`));

  partes.push(`<button type="button" class="botao secundario" id="baixar-mapa" style="margin-top:12px">Baixar o meu Mapa em PDF</button>`);
  partes.push(`<p class="assinatura" style="text-align:center;margin-top:20px">Rosemary Sampaio — Terapeuta Ayurvédica · @rose.ayurveda</p>`);
  partes.push(avisoLegal());
  return partes.join('');
}

export function ligarMapa(raiz, conteudo) {
  raiz.querySelector('#baixar-mapa')?.addEventListener('click', () => {
    salvarPdf(gerarMapa(conteudo), `mapa-ayurvedico-${conteudo.cliente.primeiroNome.toLowerCase()}.pdf`);
  });
}
