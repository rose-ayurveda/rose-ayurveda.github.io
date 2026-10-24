// Momento de apoio ("Estou com vontade de doce"): fluxo guiado em telas curtas, sem culpa.
// O código é genérico: todos os textos vêm do conteúdo da cliente, para servir
// a outras compulsões ou crises de ansiedade em outros acompanhamentos.
import { esc, rico, lista, avisoLegal } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia } from '../datas.js';
import { horaLocal } from '../relogio.js';
import { tocarSino } from '../cronometro.js';
import { conferirConquistas } from '../quadro.js';
import { audio, playerHTML, ligarPlayers } from '../audios.js';

let timer = null;

function agoraHHMM(fuso) {
  const { h, m } = horaLocal(fuso);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// A refeição do plano mais próxima deste horário (a atual ou a seguinte).
function refeicaoDoMomento(conteudo, agora) {
  const refeicoes = [...conteudo.mapa.refeicoes].sort((a, b) => a.horario.localeCompare(b.horario));
  const [h, m] = agora.split(':').map(Number);
  const minutos = h * 60 + m;
  const emMinutos = r => { const [rh, rm] = r.horario.split(':').map(Number); return rh * 60 + rm; };
  return refeicoes.find(r => emMinutos(r) + 60 >= minutos) || refeicoes[0];
}

function formatar(segundos) {
  const s = Math.max(0, Math.ceil(segundos));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function registrar(conteudo, estado, desfecho) {
  const fuso = conteudo.cliente.fusoHorario;
  store.registrarApoio({
    data: chaveDoDia(fuso),
    hora: estado.hora,
    resposta: estado.resposta,
    escolha: estado.escolha || null,
    desfecho,
  });
  store.salvarApoioAtual(null);
  conferirConquistas(conteudo);
}

export function telaApoio(conteudo) {
  const a = conteudo.apoio;
  const fuso = conteudo.cliente.fusoHorario;
  const estado = store.apoioAtual() || { etapa: 'pergunta' };
  let corpo = '';

  switch (estado.etapa) {
    case 'pergunta':
      corpo = `
        <p class="assinatura texto-longo">${rico(a.abertura)}</p>
        <h2>${esc(a.pergunta)}</h2>
        <div class="grade-apoio">
          ${a.opcoes.map(o => `<button type="button" class="botao secundario" data-resposta="${o.id}">${esc(o.texto)}</button>`).join('')}
        </div>`;
      break;

    case 'fome': {
      const r = refeicaoDoMomento(conteudo, agoraHHMM(fuso));
      corpo = `
        <p class="texto-longo">${rico(a.fome)}</p>
        <section class="cartao suave">
          <p class="rotulo">${esc(r.nome)} · ${esc(r.horario)}</p>
          <p class="texto-longo">${rico(r.ajuste)}</p>
          <p class="rotulo">Siga a opção do seu plano alimentar e este ajuste ayurvédico.</p>
        </section>
        <button type="button" class="botao" data-concluir="fome">Entendi</button>`;
      break;
    }

    case 'escolha':
      corpo = `
        <p class="texto-longo">${rico(a.pausa.texto)}</p>
        ${a.pausa.escolhas.map(e => `<button type="button" class="botao secundario" data-escolha="${e.id}">${esc(e.texto)}</button>`).join('')}`;
      break;

    case 'pausa': {
      const escolha = a.pausa.escolhas.find(e => e.id === estado.escolha);
      const restante = (estado.fim - Date.now()) / 1000;
      corpo = `
        <section class="cartao" style="text-align:center">
          <p class="rotulo">Pausa de ${a.pausa.minutos} minutos</p>
          <p class="tempo-apoio" id="tempo-apoio" aria-live="polite">${formatar(restante)}</p>
        </section>
        <h3>${esc(escolha.texto)}</h3>
        ${escolha.audio && audio(escolha.audio) ? playerHTML(audio(escolha.audio), { compacto: true }) : ''}
        ${lista(escolha.passos, true)}
        <button type="button" class="botao secundario" data-final>Encerrar a pausa agora</button>`;
      break;
    }

    case 'final':
      corpo = `
        <h2>${esc(a.perguntaFinal)}</h2>
        <div class="grade-apoio">
          ${a.desfechos.map(d => `<button type="button" class="botao secundario" data-desfecho="${d.id}">${esc(d.texto)}</button>`).join('')}
        </div>`;
      break;

    case 'fim': {
      const d = a.desfechos.find(x => x.id === estado.desfecho);
      const agora = agoraHHMM(fuso);
      const sobremesa = estado.desfecho === 'continua' && a.horarioSobremesa
        && agora >= a.horarioSobremesa.inicio && agora <= a.horarioSobremesa.fim;
      corpo = `
        <section class="cartao suave">
          <p class="assinatura texto-longo">${rico(d?.resposta || a.fomeFechamento || '')}</p>
          ${sobremesa ? `<p class="texto-longo">${rico(a.horarioSobremesa.texto)}</p>` : ''}
        </section>
        <a class="botao" href="#/agora">Voltar ao início</a>`;
      break;
    }
  }

  return `
    <h1>${esc(a.botao)}</h1>
    ${corpo}
    ${avisoLegal()}`;
}

export function ligarApoio(raiz, conteudo, redesenhar) {
  clearInterval(timer);
  const a = conteudo.apoio;
  const fuso = conteudo.cliente.fusoHorario;
  const estado = store.apoioAtual() || { etapa: 'pergunta' };
  const ir = novo => { store.salvarApoioAtual(novo); redesenhar(); };

  raiz.querySelectorAll('[data-resposta]').forEach(b => b.addEventListener('click', () => {
    const resposta = b.dataset.resposta;
    ir({ etapa: resposta === 'fome' ? 'fome' : 'escolha', resposta, hora: agoraHHMM(fuso) });
  }));

  raiz.querySelectorAll('[data-concluir]').forEach(b => b.addEventListener('click', () => {
    registrar(conteudo, estado, null);
    store.salvarApoioAtual({ ...estado, etapa: 'fim', desfecho: null });
    redesenhar();
    store.salvarApoioAtual(null);
  }));

  raiz.querySelectorAll('[data-escolha]').forEach(b => b.addEventListener('click', () => {
    tocarSino(0.2);
    ir({ ...estado, etapa: 'pausa', escolha: b.dataset.escolha, fim: Date.now() + a.pausa.minutos * 60_000 });
  }));

  raiz.querySelectorAll('[data-final]').forEach(b => b.addEventListener('click', () => ir({ ...estado, etapa: 'final' })));

  raiz.querySelectorAll('[data-desfecho]').forEach(b => b.addEventListener('click', () => {
    registrar(conteudo, estado, b.dataset.desfecho);
    store.salvarApoioAtual({ ...estado, etapa: 'fim', desfecho: b.dataset.desfecho });
    redesenhar();
    store.salvarApoioAtual(null);
  }));

  const pararAudios = ligarPlayers(raiz);

  // Contagem da pausa: continua certa mesmo se ela sair da tela e voltar.
  if (estado.etapa === 'pausa') {
    const visor = raiz.querySelector('#tempo-apoio');
    timer = setInterval(() => {
      const restante = (estado.fim - Date.now()) / 1000;
      if (visor) visor.textContent = formatar(restante);
      if (restante <= 0) {
        clearInterval(timer);
        tocarSino();
        ir({ ...estado, etapa: 'final' });
      }
    }, 500);
  }
  return () => { clearInterval(timer); pararAudios(); };
}
