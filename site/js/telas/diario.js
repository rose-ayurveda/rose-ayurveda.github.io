// Diário de 30 segundos: escalas de 1 a 5 e perguntas por toque. Pode preencher o dia anterior.
import { esc, rico, icones, avisoLegal } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia, somarDias, dataPorExtenso, partes } from '../datas.js';
import { perguntaEscala, perguntaOpcoes, ligarPerguntas } from './perguntas.js';
import { conferirConquistas } from '../quadro.js';

function diaDoDiario(conteudo, parametros) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const ontem = parametros.get('dia') === 'ontem';
  return { data: ontem ? somarDias(hoje, -1) : hoje, ontem };
}

// Perguntas que aparecem nesse dia (as do doce só se não marcou "sem doce fora de hora").
function itensDoDia(conteudo, dia) {
  return conteudo.diario.itens.filter(i => !i.seNaoMarcou || !dia.marcados.includes(i.seNaoMarcou));
}

export function telaDiario(conteudo, parametros) {
  const { data, ontem } = diaDoDiario(conteudo, parametros);
  const dia = store.dia(data);
  const anterior = dia.diario || {};
  const respostas = anterior.respostas || {};
  const semanal = conteudo.diario.semanal && partes(data).semana === conteudo.diario.semanal.diaDaSemana;

  return `
    <a href="#/evolucao" class="voltar">${icones.voltar}<span>Minha evolução</span></a>
    <h1>Diário de 30 segundos</h1>
    <p class="rotulo">${dataPorExtenso(data)}</p>
    <div class="opcoes" style="grid-template-columns:1fr 1fr;margin:8px 0 14px" role="group" aria-label="Qual dia">
      <button type="button" data-ir="#/diario" aria-pressed="${!ontem}">Hoje</button>
      <button type="button" data-ir="#/diario?dia=ontem" aria-pressed="${ontem}">Ontem</button>
    </div>
    <form id="form-diario">
      ${itensDoDia(conteudo, dia).map(i => i.tipo === 'escala'
        ? perguntaEscala(i, respostas[i.id])
        : perguntaOpcoes(i, respostas[i.id])).join('')}
      <label class="pergunta" style="display:block">
        <span class="legenda">${esc(conteudo.diario.observacao)}</span>
        <textarea name="observacao" rows="3">${esc(anterior.observacao || '')}</textarea>
      </label>
      ${semanal ? `
        <label class="pergunta" style="display:block">
          <span class="legenda">${esc(conteudo.diario.semanal.pergunta)}</span>
          <textarea name="semanal" rows="3">${esc(anterior.semanal || '')}</textarea>
        </label>` : ''}
      <button type="submit" class="botao">${dia.diario ? 'Salvar alterações' : 'Salvar o diário'}</button>
    </form>
    ${avisoLegal()}`;
}

export function ligarDiario(raiz, conteudo, parametros) {
  const { data } = diaDoDiario(conteudo, parametros);
  const respostas = { ...(store.dia(data).diario?.respostas || {}) };
  raiz.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.ir; }));
  ligarPerguntas(raiz, respostas);

  raiz.querySelector('#form-diario').addEventListener('submit', evento => {
    evento.preventDefault();
    const formulario = new FormData(evento.target);
    const dia = store.dia(data);
    dia.diario = {
      respostas,
      observacao: String(formulario.get('observacao') || '').trim(),
      semanal: String(formulario.get('semanal') || '').trim(),
      em: new Date().toISOString(),
    };
    store.salvarDia(data, dia);
    conferirConquistas(conteudo);
    raiz.innerHTML = `
      <section class="cartao suave em-breve" role="status">
        <h2 style="margin-top:0">Diário guardado</h2>
        <p class="assinatura">${rico('Obrigada por olhar para o seu dia. Essas observações guiam os próximos ajustes. — Rose')}</p>
        <a class="botao" href="#/evolucao">Ver minha evolução</a>
        <a class="botao secundario" href="#/quadro">Ir para o Quadro do dia</a>
      </section>`;
  });
}
