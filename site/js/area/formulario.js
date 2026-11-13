// Editor de formulários sem código: cada parte do conteúdo é descrita uma vez
// (texto, lista, horário, escolha…) e o formulário é montado a partir dessa descrição.
import { esc } from '../ui.js';

// ---------- Caminhos dentro do conteúdo ("rotina.2.nome") ----------

export function pegar(objeto, caminho) {
  return caminho.split('.').filter(Boolean).reduce((o, chave) => (o == null ? o : o[chave]), objeto);
}

export function definir(objeto, caminho, valor) {
  const chaves = caminho.split('.');
  let atual = objeto;
  chaves.slice(0, -1).forEach((chave, i) => {
    if (atual[chave] == null) atual[chave] = /^\d+$/.test(chaves[i + 1]) ? [] : {};
    atual = atual[chave];
  });
  atual[chaves.at(-1)] = valor;
}

const junta = (base, campo) => (base ? `${base}.${campo}` : campo);

export function idAleatorio(texto = 'item') {
  const base = String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24).replace(/^-|-$/g, '');
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- Desenho dos campos ----------

function rotulo(d) {
  return `<span class="rotulo-campo">${esc(d.rotulo)}</span>${d.ajuda ? `<span class="ajuda-campo">${esc(d.ajuda)}</span>` : ''}`;
}

function opcoesDe(d, contexto) {
  return typeof d.opcoes === 'function' ? d.opcoes(contexto.conteudo) : d.opcoes;
}

function campo(d, valor, caminho, contexto) {
  const attrs = `data-caminho="${esc(caminho)}" data-tipo="${d.tipo}"`;
  switch (d.tipo) {
    case 'texto':
      return `<label class="campo">${rotulo(d)}<input type="text" ${attrs} value="${esc(valor ?? '')}"></label>`;
    case 'numero':
      return `<label class="campo campo-curto">${rotulo(d)}<input type="number" inputmode="numeric" ${attrs} value="${esc(valor ?? '')}"></label>`;
    case 'hora':
      return `<label class="campo campo-curto">${rotulo(d)}<input type="time" ${attrs} value="${esc(valor ?? '')}"></label>`;
    case 'data':
      return `<label class="campo campo-curto">${rotulo(d)}<input type="date" ${attrs} value="${esc(valor ?? '')}"></label>`;
    case 'area':
      return `<div class="campo">${rotulo(d)}
        ${d.rico ? '<div class="barra-rico"><button type="button" data-negrito title="Negrito"><strong>N</strong> negrito</button></div>' : ''}
        <textarea rows="${d.linhas || 4}" ${attrs}>${esc(valor ?? '')}</textarea></div>`;
    case 'paragrafos':
      return `<div class="campo">${rotulo(d)}<span class="ajuda-campo">${esc(d.dica || 'Deixe uma linha em branco entre um parágrafo e outro.')}</span>
        <div class="barra-rico"><button type="button" data-negrito><strong>N</strong> negrito</button></div>
        <textarea rows="${d.linhas || 6}" ${attrs}>${esc((valor || []).join('\n\n'))}</textarea></div>`;
    case 'linhas':
      return `<div class="campo">${rotulo(d)}<span class="ajuda-campo">${esc(d.dica || 'Um item por linha.')}</span>
        ${d.rico === false ? '' : '<div class="barra-rico"><button type="button" data-negrito><strong>N</strong> negrito</button></div>'}
        <textarea rows="${d.linhas || 5}" ${attrs}>${esc((valor || []).join('\n'))}</textarea></div>`;
    case 'sim':
      return `<label class="campo campo-sim"><input type="checkbox" ${attrs}${valor ? ' checked' : ''}>${rotulo(d)}</label>`;
    case 'escolha': {
      const opcoes = opcoesDe(d, contexto);
      return `<label class="campo">${rotulo(d)}<select ${attrs}>
        ${d.vazio !== false ? `<option value="">${esc(d.vazio || '— nenhum —')}</option>` : ''}
        ${opcoes.map(o => `<option value="${esc(o.valor)}"${String(o.valor) === String(valor ?? '') ? ' selected' : ''}>${esc(o.nome)}</option>`).join('')}
      </select></label>`;
    }
    case 'marcar': {
      const marcados = new Set(valor || []);
      return `<fieldset class="campo campo-marcar"><legend>${rotulo(d)}</legend>
        ${opcoesDe(d, contexto).map(o => `<label><input type="checkbox" data-marcar="${esc(caminho)}" value="${esc(o.valor)}"${marcados.has(o.valor) ? ' checked' : ''}> ${esc(o.nome)}</label>`).join('')}
      </fieldset>`;
    }
    case 'grupo':
      return `<fieldset class="campo campo-grupo">${d.rotulo ? `<legend>${esc(d.rotulo)}</legend>` : ''}
        ${d.ajuda ? `<p class="ajuda-campo">${esc(d.ajuda)}</p>` : ''}
        ${campos(d.campos, caminho, contexto)}</fieldset>`;
    case 'lista':
      return lista(d, valor || [], caminho, contexto);
    case 'aviso':
      return `<p class="ajuda-campo aviso-campo">${esc(d.texto)}</p>`;
    default:
      return '';
  }
}

function lista(d, itens, caminho, contexto) {
  return `
    <div class="campo campo-lista">
      <div class="cabeca-lista">${rotulo(d)}</div>
      ${itens.map((item, i) => `
        <details class="item-lista"${contexto.aberto === `${caminho}.${i}` ? ' open' : ''}>
          <summary><span>${esc(d.titulo ? d.titulo(item, i) : `Item ${i + 1}`)}</span></summary>
          <div class="corpo-item">
            ${campos(d.item, `${caminho}.${i}`, contexto)}
            <div class="acoes-item">
              <button type="button" data-acao="subir" data-lista="${esc(caminho)}" data-indice="${i}"${i === 0 ? ' disabled' : ''}>↑ Subir</button>
              <button type="button" data-acao="descer" data-lista="${esc(caminho)}" data-indice="${i}"${i === itens.length - 1 ? ' disabled' : ''}>↓ Descer</button>
              <button type="button" data-acao="remover" data-lista="${esc(caminho)}" data-indice="${i}" class="remover">Remover</button>
            </div>
          </div>
        </details>`).join('')}
      <button type="button" class="botao secundario adicionar" data-acao="adicionar" data-lista="${esc(caminho)}">+ ${esc(d.adicionar || 'Adicionar')}</button>
    </div>`;
}

export function campos(descricoes, base, contexto) {
  return descricoes.map(d => {
    const caminho = d.campo ? junta(base, d.campo) : base;
    return campo(d, d.campo ? pegar(contexto.conteudo, caminho) : null, caminho, contexto);
  }).join('');
}

// ---------- Ligação: cada mudança vai direto para o conteúdo e é salva ----------

function lerValor(el) {
  const tipo = el.dataset.tipo;
  if (tipo === 'sim') return el.checked;
  if (tipo === 'numero') return el.value === '' ? null : Number(el.value);
  if (tipo === 'paragrafos') return el.value.split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
  if (tipo === 'linhas') return el.value.split('\n').map(t => t.trim()).filter(Boolean);
  if (tipo === 'escolha' || tipo === 'hora' || tipo === 'data') return el.value || null;
  return el.value;
}

// Encontra a descrição da lista pelo caminho, para saber como criar um item novo.
function descricaoDaLista(descricoes, caminho, base = '') {
  for (const d of descricoes) {
    const completo = d.campo ? junta(base, d.campo) : base;
    if (d.tipo === 'lista') {
      if (completo === caminho) return d;
      const resto = caminho.startsWith(`${completo}.`) ? caminho.slice(completo.length + 1).match(/^(\d+)/) : null;
      if (resto) {
        const achada = descricaoDaLista(d.item, caminho, `${completo}.${resto[1]}`);
        if (achada) return achada;
      }
    } else if (d.tipo === 'grupo') {
      const achada = descricaoDaLista(d.campos, caminho, completo);
      if (achada) return achada;
    }
  }
  return null;
}

export function ligarFormulario(raiz, descricoes, contexto, { aoMudar, redesenhar }) {
  raiz.querySelectorAll('[data-caminho]').forEach(el => {
    const evento = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(evento, () => {
      definir(contexto.conteudo, el.dataset.caminho, lerValor(el));
      aoMudar();
    });
  });

  raiz.querySelectorAll('[data-marcar]').forEach(el => el.addEventListener('change', () => {
    const caminho = el.dataset.marcar;
    const marcados = [...raiz.querySelectorAll(`[data-marcar="${CSS.escape(caminho)}"]:checked`)].map(x => x.value);
    definir(contexto.conteudo, caminho, marcados);
    aoMudar();
  }));

  // Botão "negrito": envolve o trecho selecionado com ** **.
  raiz.querySelectorAll('[data-negrito]').forEach(b => b.addEventListener('click', () => {
    const area = b.closest('.campo').querySelector('textarea');
    const { selectionStart: i, selectionEnd: f, value } = area;
    if (i === f) return;
    area.value = `${value.slice(0, i)}**${value.slice(i, f)}**${value.slice(f)}`;
    area.dispatchEvent(new Event('input'));
    area.focus();
  }));

  raiz.querySelectorAll('[data-acao]').forEach(b => b.addEventListener('click', () => {
    const caminho = b.dataset.lista;
    const itens = pegar(contexto.conteudo, caminho) || [];
    const i = Number(b.dataset.indice);
    let aberto = null;
    switch (b.dataset.acao) {
      case 'adicionar': {
        const d = descricaoDaLista(descricoes, caminho);
        itens.push(d?.novo ? d.novo(contexto.conteudo) : {});
        aberto = `${caminho}.${itens.length - 1}`;
        break;
      }
      case 'remover':
        if (!confirm('Remover este item?')) return;
        itens.splice(i, 1);
        break;
      case 'subir':
        [itens[i - 1], itens[i]] = [itens[i], itens[i - 1]];
        aberto = `${caminho}.${i - 1}`;
        break;
      case 'descer':
        [itens[i + 1], itens[i]] = [itens[i], itens[i + 1]];
        aberto = `${caminho}.${i + 1}`;
        break;
    }
    definir(contexto.conteudo, caminho, itens);
    aoMudar();
    redesenhar(aberto);
  }));
}
