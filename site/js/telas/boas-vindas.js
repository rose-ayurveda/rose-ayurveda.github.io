// Primeira abertura: o app ainda não tem o acompanhamento da cliente.
import { lotus } from '../lotus.js';
import { avisoLegal } from '../ui.js';
import { caixaColar, ligarColar } from './receber.js';

export function telaBoasVindas({ modoTeste }) {
  return `
    <section class="cartao em-breve">
      ${lotus(11, { tamanho: '160', rotulo: 'Flor de lótus' })}
      <h1>Bem-vinda</h1>
      <p>Este é o app do seu acompanhamento ayurvédico com <strong>Rosemary Sampaio</strong>.</p>
    </section>
    <section class="cartao">
      <h3 style="margin-top:0">Recebeu o link da Rose?</h3>
      <p class="rotulo">Copie o link no WhatsApp (toque e segure, depois “Copiar”) e toque aqui:</p>
      ${caixaColar('Colar meu acompanhamento')}
    </section>
    ${modoTeste ? `
      <section class="cartao suave">
        <p class="rotulo">Modo de teste (só aparece no computador da Rose)</p>
        <button class="botao" id="carregar-teste" type="button">Carregar conteúdo de teste da Roberta</button>
      </section>` : ''}
    ${avisoLegal()}
  `;
}

export function ligarBoasVindas(raiz) {
  ligarColar(raiz);
}
