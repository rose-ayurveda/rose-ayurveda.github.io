// Quadro do dia: o checklist organizado pelo relógio ayurvédico, com a flor de lótus.
import { esc, rico, avisoLegal, NOMES_DOSHA } from '../ui.js';
import { lotus, petalasAbertas } from '../lotus.js';
import { selo } from '../selos.js';
import { store } from '../store.js';
import { chaveDoDia, somarDias, podeMarcarOntem, dataPorExtenso } from '../datas.js';
import { progresso, marcarItem, tirarCelebracoes, itensDoQuadro } from '../quadro.js';

function diaEscolhido(conteudo, parametros) {
  const fuso = conteudo.cliente.fusoHorario;
  const hoje = chaveDoDia(fuso);
  const ontemPermitido = podeMarcarOntem(fuso);
  const ontem = parametros.get('dia') === 'ontem' && ontemPermitido;
  return { hoje, data: ontem ? somarDias(hoje, -1) : hoje, ontem, ontemPermitido };
}

function item(conteudo, i, dia, data) {
  const marcado = dia.marcados.includes(i.id);
  // Refeição principal marcada e ainda sem check-in: um convite discreto para responder.
  const semCheckin = marcado && i.refeicao && conteudo.checkin?.refeicoes.includes(i.refeicao) && !dia.checkins?.[i.refeicao];
  return `
    <button type="button" class="item-quadro" role="checkbox" aria-checked="${marcado}" data-item="${esc(i.id)}">
      <span class="caixa" aria-hidden="true"></span>
      <span>${esc(i.texto)}${i.apoio ? `<span class="rotulo" style="display:block">${esc(i.apoio)}</span>` : ''}</span>
    </button>
    ${semCheckin ? `<a class="convite-checkin" href="#/checkin?refeicao=${i.refeicao}&dia=${data}">Responder o check-in desta refeição</a>` : ''}`;
}

export function telaQuadro(conteudo, parametros) {
  const { data, ontem, ontemPermitido } = diaEscolhido(conteudo, parametros);
  const dia = store.dia(data);
  const { feitos, total, completo } = progresso(conteudo, dia);
  const abertas = petalasAbertas(feitos, total);

  const celebracoes = tirarCelebracoes();
  const avisos = celebracoes.map(c => `
    <div class="celebracao" role="status">
      ${c.selo ? selo(c.selo.simbolo, true, 56) : ''}
      <div>${c.titulo ? `<h3 style="margin:0 0 4px">${esc(c.titulo)}</h3>` : ''}<p class="assinatura" style="margin:0">${rico(c.texto)}</p></div>
    </div>`).join('');
  const animar = celebracoes.some(c => c.flor);

  return `
    <h1>Quadro do dia</h1>
    <p class="rotulo">${dataPorExtenso(data)}</p>
    ${ontemPermitido ? `
      <div class="opcoes" style="grid-template-columns:1fr 1fr;margin:8px 0 14px" role="group" aria-label="Qual dia marcar">
        <button type="button" data-ir="#/quadro" aria-pressed="${!ontem}">Hoje</button>
        <button type="button" data-ir="#/quadro?dia=ontem" aria-pressed="${ontem}">Ontem</button>
      </div>` : ''}

    <section class="cartao" style="text-align:center">
      <div class="${animar ? 'flor-abrindo' : ''}" style="max-width:240px;margin:0 auto">${lotus(abertas)}</div>
      <p style="margin:6px 0 0"><strong>${feitos} de ${total}</strong> cuidados ${ontem ? 'de ontem' : 'de hoje'}</p>
      ${completo ? '<p class="assinatura" style="margin:4px 0 0">Flor aberta por inteiro.</p>' : ''}
    </section>
    ${avisos}

    ${conteudo.quadro.periodos.map(p => `
      <section class="cartao periodo-quadro dosha-${p.dosha}">
        <h2 style="margin:0 0 8px">${esc(p.nome)} <span class="selo-dosha">${NOMES_DOSHA[p.dosha]}</span></h2>
        ${p.itens.map(i => item(conteudo, i, dia, data)).join('')}
      </section>`).join('')}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <a class="botao secundario" href="#/jardim">Meu jardim</a>
      <a class="botao secundario" href="#/conquistas">Conquistas</a>
    </div>
    ${avisoLegal()}
  `;
}

export function ligarQuadro(raiz, conteudo, parametros, redesenhar) {
  const { data } = diaEscolhido(conteudo, parametros);
  raiz.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.ir; }));
  raiz.querySelectorAll('[data-item]').forEach(b => b.addEventListener('click', () => {
    const marcar = b.getAttribute('aria-checked') !== 'true';
    marcarItem(conteudo, data, b.dataset.item, marcar);
    // Ao marcar uma refeição principal, abre o check-in rápido dela.
    const refeicao = itensDoQuadro(conteudo).find(i => i.id === b.dataset.item)?.refeicao;
    if (marcar && refeicao && conteudo.checkin?.refeicoes.includes(refeicao)) {
      location.hash = `#/checkin?refeicao=${refeicao}&dia=${data}`;
      return;
    }
    redesenhar({ manterRolagem: true });
  }));
}
