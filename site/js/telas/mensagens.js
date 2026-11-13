// Minhas mensagens: todas as mensagens recebidas da Rose, da mais recente para a mais antiga.
import { esc, avisoLegal, icones } from '../ui.js';
import { store } from '../store.js';
import { dataPorExtenso } from '../datas.js';
import { marcarTodasComoLidas } from '../mensagens.js';

const TITULOS = {
  semana: 'Mensagem da semana', florCompleta: 'Flor completa', seloGanho: 'Novo selo',
  primeiraSemana: 'Primeira semana', volta: 'De volta', diaDificil: 'Para hoje', tardeSemDoce: 'Tarde serena',
};

export function cartaoMensagem(m) {
  return `
    <article class="cartao mensagem">
      <p class="rotulo">${esc(TITULOS[m.tipo] || 'Mensagem')} · ${dataPorExtenso(m.data)}</p>
      ${m.texto.split('\n\n').map(p => `<p class="assinatura texto-longo">${esc(p)}</p>`).join('')}
    </article>`;
}

export function telaMensagens() {
  const lista = [...store.mensagens()].reverse();
  marcarTodasComoLidas();
  return `
    <a href="#/evolucao" class="voltar">${icones.voltar}<span>Minha evolução</span></a>
    <h1>Minhas mensagens</h1>
    ${lista.length ? lista.map(cartaoMensagem).join('') : '<p class="rotulo">As mensagens da Rose aparecem aqui.</p>'}
    ${avisoLegal()}`;
}
