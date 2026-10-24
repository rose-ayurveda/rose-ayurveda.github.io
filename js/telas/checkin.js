// Check-in ayurvédico das refeições principais: como, quando e em que estado ela comeu.
// Nunca pergunta sobre alimentos, quantidades ou calorias — isso é da nutricionista.
import { esc, rico, icones } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia } from '../datas.js';
import { marcarItem, itensDoQuadro } from '../quadro.js';
import { perguntaOpcoes, ligarPerguntas } from './perguntas.js';

function contexto(conteudo, parametros) {
  const refeicao = conteudo.mapa.refeicoes.find(r => r.id === parametros.get('refeicao'));
  const data = parametros.get('dia') || chaveDoDia(conteudo.cliente.fusoHorario);
  return { refeicao, data };
}

export function telaCheckin(conteudo, parametros) {
  const { refeicao, data } = contexto(conteudo, parametros);
  if (!refeicao) return '<p>Refeição não encontrada.</p>';
  const anterior = store.dia(data).checkins?.[refeicao.id] || {};
  return `
    <a href="#/quadro" class="voltar">${icones.voltar}<span>Quadro do dia</span></a>
    <h1>${esc(refeicao.nome)}</h1>
    <p class="rotulo">Quatro toques, menos de 20 segundos.</p>
    <form id="form-checkin">
      ${conteudo.checkin.perguntas.map(p => perguntaOpcoes(p, anterior[p.id], p.varias)).join('')}
      <button type="submit" class="botao">Salvar</button>
      <a class="botao secundario" href="#/quadro" style="margin-top:10px">Agora não</a>
    </form>`;
}

export function ligarCheckin(raiz, conteudo, parametros) {
  const { refeicao, data } = contexto(conteudo, parametros);
  if (!refeicao) return;
  const respostas = { ...(store.dia(data).checkins?.[refeicao.id] || {}) };
  ligarPerguntas(raiz, respostas);

  raiz.querySelector('#form-checkin').addEventListener('submit', evento => {
    evento.preventDefault();
    const dia = store.dia(data);
    dia.checkins = { ...(dia.checkins || {}), [refeicao.id]: { ...respostas, em: new Date().toISOString() } };
    store.salvarDia(data, dia);

    // "Não segui" ou "Pulei" desmarcam a refeição no Quadro, sem nenhuma bronca.
    const [simNoHorario, simForaDoHorario] = conteudo.checkin.perguntas.find(p => p.id === 'seguiu').opcoes;
    const seguiu = [simNoHorario, simForaDoHorario].includes(respostas.seguiu) || !respostas.seguiu;
    const item = itensDoQuadro(conteudo).find(i => i.refeicao === refeicao.id);
    if (item) marcarItem(conteudo, data, item.id, seguiu);

    raiz.innerHTML = `
      <section class="cartao suave em-breve" role="status">
        <h2 style="margin-top:0">Obrigada</h2>
        <p class="assinatura">${rico(conteudo.checkin.agradecimento)}</p>
        <a class="botao" href="#/quadro">Voltar ao Quadro do dia</a>
      </section>`;
  });
}
