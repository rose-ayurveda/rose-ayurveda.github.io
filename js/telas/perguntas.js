// Peças de formulário por toque, usadas no diário e no check-in das refeições.
import { esc } from '../ui.js';

// Ícone de nível (1 a 5 pontos preenchidos): visual neutro, sem carinhas.
function nivel(n) {
  let pontos = '';
  for (let i = 1; i <= 5; i++) pontos += `<circle cx="${4 + (i - 1) * 8}" cy="6" r="3" fill="${i <= n ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 40 12" width="40" height="12" aria-hidden="true">${pontos}</svg>`;
}

export function perguntaEscala(item, valor) {
  return `
    <fieldset class="pergunta" data-pergunta="${esc(item.id)}">
      <legend>${esc(item.pergunta)}</legend>
      <div class="escala">
        ${item.rotulos.map((r, i) => `
          <button type="button" data-valor="${i + 1}" aria-pressed="${valor === i + 1}">
            ${nivel(i + 1)}<span>${esc(r)}</span>
          </button>`).join('')}
      </div>
    </fieldset>`;
}

export function perguntaOpcoes(item, valor, varias = false) {
  const marcadas = varias ? (valor || []) : [valor];
  return `
    <fieldset class="pergunta" data-pergunta="${esc(item.id)}"${varias ? ' data-varias' : ''}>
      <legend>${esc(item.pergunta)}${varias ? ' <span class="rotulo">(pode marcar mais de uma)</span>' : ''}</legend>
      <div class="pilulas">
        ${item.opcoes.map(o => `<button type="button" data-valor="${esc(o)}" aria-pressed="${marcadas.includes(o)}">${esc(o)}</button>`).join('')}
      </div>
    </fieldset>`;
}

// Liga os botões: cada toque escolhe (ou alterna, nas de várias respostas).
export function ligarPerguntas(raiz, respostas) {
  raiz.querySelectorAll('fieldset[data-pergunta]').forEach(campo => {
    const id = campo.dataset.pergunta;
    const varias = campo.hasAttribute('data-varias');
    campo.querySelectorAll('button[data-valor]').forEach(b => b.addEventListener('click', () => {
      const bruto = b.dataset.valor;
      const valor = /^\d+$/.test(bruto) && campo.querySelector('.escala') ? Number(bruto) : bruto;
      if (varias) {
        const atual = new Set(respostas[id] || []);
        atual.has(valor) ? atual.delete(valor) : atual.add(valor);
        respostas[id] = [...atual];
        b.setAttribute('aria-pressed', String(atual.has(valor)));
      } else {
        respostas[id] = valor;
        campo.querySelectorAll('button[data-valor]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      }
    }));
  });
}
