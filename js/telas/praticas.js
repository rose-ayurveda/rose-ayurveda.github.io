// Práticas: a rotina do dia com lembretes, os chás com cronômetro e as receitas.
import { esc, rico, lista, avisoLegal } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia } from '../datas.js';
import { estado, horarioEfetivo, contagem, marcarFeito, pularHoje, desfazerPulo, adiar } from '../rotina.js';
import { cronometroHTML, ligarCronometros } from '../cronometro.js';
import { assinaturaDosLembretes, gerarCalendario, abrirCalendario, abrirCalendarioComoPagina, ehIPhone } from '../lembretes.js';
import { audiosDaCliente, playerHTML, ligarPlayers } from '../audios.js';
import { ehAppAndroid, agendarLembretes } from '../nativo.js';
import { podeUsarAvisos, ativarAvisos, desativarAvisos } from '../avisos.js';

const ABAS = [
  { id: 'rotina', nome: 'Rotina' },
  { id: 'audios', nome: 'Áudios' },
  { id: 'chas', nome: 'Chás' },
  { id: 'receitas', nome: 'Receitas' },
];

const PREPAROS = {
  folhas: [{ nome: '5 min', minutos: 5 }, { nome: '7 min', minutos: 7 }, { nome: '10 min', minutos: 10 }],
  sementes: [{ nome: 'Ferver 5 min', minutos: 5 }],
};

// ---------- Lembretes ----------

// iPhone com o app na Tela de Início: notificações do próprio app (ver avisos.js).
const usaAvisos = () => ehIPhone() && podeUsarAvisos();

export function cartaoLembretes(conteudo) {
  const { lembretes: ativados, lembretesPendente, lembretesPor } = store.ajustes();
  const atual = assinaturaDosLembretes(conteudo);
  const porAvisos = lembretesPor === 'avisos';
  // Quem ativou pelo calendário antes das notificações do app: oferece trocar.
  if (ativados && !porAvisos && usaAvisos()) {
    return `
      <section class="cartao" style="border:2px solid var(--marca)">
        <h3 style="margin-top:0">Lembretes como notificação do app</h3>
        <p>Agora os lembretes podem chegar como notificações do app Rose Ayurveda, em vez do Calendário.</p>
        <p class="rotulo">O iPhone vai perguntar se o app pode enviar notificações: toque em <strong>Permitir</strong>.</p>
        <button type="button" class="botao" data-lembretes>Trocar para notificações</button>
        <p class="rotulo">Depois, apague do Calendário os eventos com a folhinha 🌿: abra cada um, toque em <strong>Apagar evento</strong> e escolha <strong>Apagar todos os eventos futuros</strong>.</p>
      </section>`;
  }
  // iPhone: o arquivo foi entregue; os lembretes só contam como ativados quando ela confirma.
  if (!porAvisos && ativados !== atual && lembretesPendente === atual) {
    return `
      <section class="cartao" style="border:2px solid var(--marca)">
        <h3 style="margin-top:0">Os lembretes apareceram no seu calendário?</h3>
        <p class="texto-longo">Na tela do calendário, toque em <strong>Adicionar todos</strong>. Depois, abra o <strong>Calendário</strong> do iPhone e confira os eventos com a folhinha 🌿.</p>
        <button type="button" class="botao" data-confirmar-lembretes>Sim, apareceram</button>
        <button type="button" class="botao secundario" data-lembretes>Tentar de novo</button>
        <button type="button" class="botao secundario" data-baixar-lembretes>Enviar o arquivo de outro jeito</button>
      </section>`;
  }
  if (ativados === atual) {
    return `
      <section class="cartao suave">
        <h3 style="margin-top:0">Lembretes ativados</h3>
        <p class="rotulo">${porAvisos ? 'As notificações do app chegam' : 'O seu celular avisa'} nos horários da sua rotina, mesmo com o app fechado.</p>
        <button type="button" class="botao secundario" data-lembretes>Ativar de novo</button>
        ${porAvisos ? '<button type="button" class="botao secundario" data-desativar-lembretes>Desativar lembretes</button>' : ''}
      </section>`;
  }
  const mudou = Boolean(ativados);
  return `
    <section class="cartao" style="border:2px solid var(--marca)">
      <h3 style="margin-top:0">${mudou ? 'Seus horários mudaram' : 'Ative seus lembretes'}</h3>
      <p>${mudou
        ? (ehAppAndroid() || porAvisos
          ? 'Toque no botão para atualizar os lembretes com os novos horários.'
          : 'Toque no botão para atualizar os lembretes. Depois, apague no calendário os eventos antigos “Rose Ayurveda”.')
        : 'Um toque e o seu celular passa a avisar nos horários da sua rotina — mesmo com o app fechado.'}</p>
      <p class="rotulo">${ehAppAndroid() || usaAvisos()
        ? 'O celular vai pedir permissão para enviar notificações: toque em <strong>Permitir</strong>.'
        : 'No iPhone, toque em <strong>“Adicionar todos”</strong> na tela do calendário que vai abrir.'}</p>
      <button type="button" class="botao" data-lembretes>Ativar lembretes</button>
    </section>`;
}

export function ligarLembretes(raiz, conteudo, redesenhar) {
  raiz.querySelectorAll('[data-lembretes]').forEach(b => b.addEventListener('click', async () => {
    // App Android: avisos do próprio celular. iPhone e navegador: calendário.
    if (ehAppAndroid()) {
      const ok = await agendarLembretes(conteudo);
      if (!ok) alert('Para receber os lembretes, permita as notificações do app Rose Ayurveda nas configurações do celular.');
      redesenhar({ manterRolagem: true });
      return;
    }
    if (usaAvisos()) {
      const resultado = await ativarAvisos(conteudo);
      if (resultado === 'negado') alert('Para receber os lembretes, permita as notificações: abra os Ajustes do iPhone, toque em Notificações e depois em Rose Ayurveda.');
      if (resultado === 'erro') alert('Não consegui ativar agora. Confira se o celular está com internet e tente de novo.');
      redesenhar({ manterRolagem: true });
      return;
    }
    const ics = gerarCalendario(conteudo, chaveDoDia(conteudo.cliente.fusoHorario));
    store.salvarAjustes({ ...store.ajustes(), lembretes: null, lembretesPendente: assinaturaDosLembretes(conteudo) });
    // iPhone: primeiro, abrir como página ("Adicionar todos"); se não der, a tela Compartilhar.
    if (ehIPhone() && await abrirCalendarioComoPagina(ics)) return;
    const resultado = await abrirCalendario(ics);
    if (resultado === 'cancelado') store.salvarAjustes({ ...store.ajustes(), lembretesPendente: null });
    redesenhar({ manterRolagem: true });
  }));

  // Alternativa: enviar o arquivo pela tela Compartilhar (ou baixar, fora do iPhone).
  raiz.querySelectorAll('[data-baixar-lembretes]').forEach(b => b.addEventListener('click', () => {
    abrirCalendario(gerarCalendario(conteudo, chaveDoDia(conteudo.cliente.fusoHorario)));
  }));

  raiz.querySelectorAll('[data-desativar-lembretes]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Parar de receber os lembretes da sua rotina?')) return;
    await desativarAvisos();
    redesenhar({ manterRolagem: true });
  }));

  raiz.querySelectorAll('[data-confirmar-lembretes]').forEach(b => b.addEventListener('click', () => {
    store.salvarAjustes({ ...store.ajustes(), lembretes: assinaturaDosLembretes(conteudo), lembretesPendente: null });
    redesenhar({ manterRolagem: true });
  }));
}

// ---------- Rotina ----------

function passoAPasso(conteudo, item) {
  const pratica = conteudo.mapa.praticas.itens.find(p => p.id === item.pratica);
  const cha = conteudo.mapa.chas.itens.find(c => c.id === item.cha);
  let html = '';
  if (pratica) {
    if (pratica.passos) html += lista(pratica.passos, true);
    for (const s of pratica.subpraticas || []) html += `<p><strong>${esc(s.nome)}</strong></p>${lista(s.passos, true)}`;
    if (pratica.cuidados) html += lista(pratica.cuidados);
  }
  if (cha) {
    const preparo = conteudo.mapa.chas.preparos[cha.preparo];
    html += `<p><strong>${esc(cha.nome)}</strong> — ${rico(preparo.texto)}</p>
             <a class="botao secundario" href="#/praticas?aba=chas">Abrir o cronômetro do chá</a>`;
  }
  const guiados = audiosDaCliente(conteudo, item.audios || []);
  if (guiados.length) html += `<p><strong>Áudio guiado</strong></p>${guiados.map(a => playerHTML(a, { compacto: true })).join('')}`;
  return html;
}

export function cartaoPratica(conteudo, item, dia, { compacto = false } = {}) {
  const situacao = estado(item, dia);
  const hora = horarioEfetivo(item, dia);
  const adiado = hora !== item.horario;
  const acoes = situacao === 'feito'
    ? `<p class="feito-ok">Feito <button type="button" class="link" data-acao="desfazer" data-rotina="${item.id}">desfazer</button></p>`
    : situacao === 'pulado'
      ? `<p class="rotulo">Hoje não — tudo bem. <button type="button" class="link" data-acao="despular" data-rotina="${item.id}">voltar</button></p>`
      : `<div class="acoes-pratica">
           <button type="button" class="botao" data-acao="feito" data-rotina="${item.id}">Feito</button>
           ${compacto ? '' : `
           <button type="button" class="botao secundario" data-acao="depois" data-rotina="${item.id}">Fazer depois</button>
           <button type="button" class="botao secundario" data-acao="pular" data-rotina="${item.id}">Pular hoje</button>`}
         </div>
         ${!compacto && item.alternativa ? `<button type="button" class="botao secundario" style="margin-top:10px" data-acao="alternativa" data-rotina="${item.id}">${esc(item.alternativa.nome)}</button>` : ''}`;

  return `
    <article class="cartao pratica ${situacao}">
      <p class="rotulo">${esc(hora)}${adiado ? ' (adiado)' : ''} · ${esc(item.duracao)}</p>
      <h3 style="margin:0 0 4px">${esc(item.nome)}</h3>
      ${compacto ? '' : `
        <details class="detalhe-pratica">
          <summary>Por que para você e passo a passo</summary>
          <p class="texto-longo"><strong>Por que para você:</strong> ${rico(item.porQue)}</p>
          ${passoAPasso(conteudo, item)}
          ${item.alternativa ? `<p class="texto-longo"><strong>${esc(item.alternativa.nome)}:</strong> ${rico(item.alternativa.texto)}</p>` : ''}
        </details>`}
      ${acoes}
    </article>`;
}

export function ligarRotina(raiz, conteudo, redesenhar) {
  const fuso = conteudo.cliente.fusoHorario;
  const data = chaveDoDia(fuso);
  raiz.querySelectorAll('[data-rotina]').forEach(b => b.addEventListener('click', () => {
    const item = conteudo.rotina.find(i => i.id === b.dataset.rotina);
    switch (b.dataset.acao) {
      case 'feito':
      case 'alternativa': marcarFeito(conteudo, data, item, true); break;
      case 'desfazer': marcarFeito(conteudo, data, item, false); break;
      case 'pular': pularHoje(data, item); break;
      case 'despular': desfazerPulo(data, item); break;
      case 'depois': adiar(data, item, new Date(), fuso); break;
    }
    redesenhar({ manterRolagem: true });
  }));
}

function abaRotina(conteudo) {
  const dia = store.dia(chaveDoDia(conteudo.cliente.fusoHorario));
  const { feitas, total } = contagem(conteudo, dia);
  const itens = [...conteudo.rotina].sort((a, b) => horarioEfetivo(a, dia).localeCompare(horarioEfetivo(b, dia)));
  return `
    ${cartaoLembretes(conteudo)}
    <p><strong>${feitas} de ${total}</strong> práticas feitas hoje</p>
    ${itens.map(i => cartaoPratica(conteudo, i, dia)).join('')}`;
}

// ---------- Áudios guiados ----------

function abaAudios(conteudo) {
  const lista = audiosDaCliente(conteudo);
  if (!lista.length) return '<p class="rotulo">Nenhum áudio guiado ainda.</p>';
  return `
    <p class="texto-longo">Práticas guiadas para ouvir com fones, mesmo sem internet e com a tela bloqueada.</p>
    ${lista.map(a => playerHTML(a)).join('')}`;
}

// ---------- Chás ----------

function abaChas(conteudo) {
  const chas = conteudo.mapa.chas;
  return `
    <p class="texto-longo">${rico(chas.introducao)}</p>
    ${chas.itens.map(c => {
      const preparo = chas.preparos[c.preparo];
      return `
        <details class="secao" name="chas">
          <summary>${esc(c.nome)}</summary>
          <div class="conteudo">
            <p class="rotulo">${esc(c.quando)}</p>
            <p><strong>Por que para você:</strong> ${rico(c.porQue)}</p>
            <p><strong>Preparo:</strong> ${rico(preparo.texto)}</p>
            ${cronometroHTML(`cha-${c.id}`, PREPAROS[c.preparo] || [{ nome: `${preparo.minutos} min`, minutos: preparo.minutos }])}
          </div>
        </details>`;
    }).join('')}`;
}

// ---------- Receitas ----------

function abaReceitas(conteudo) {
  const receitas = conteudo.receitas || [];
  if (!receitas.length) return '<p class="rotulo">Nenhuma receita ainda.</p>';
  // Uma receita aberta por vez, para a lista inteira continuar à vista.
  return `<p class="rotulo">${receitas.length} receitas · toque no nome para abrir</p>` + receitas.map(r => `
    <details class="secao" name="receitas">
      <summary>${esc(r.nome)}</summary>
      <div class="conteudo">
        <p class="rotulo">${esc(r.quando)}</p>
        <p class="texto-longo"><strong>Por que para você:</strong> ${rico(r.porQue)}</p>
        <p><strong>Ingredientes</strong></p>${lista(r.ingredientes)}
        <p><strong>Preparo</strong></p>${lista(r.preparo, true)}
        ${r.nota ? `<p class="rotulo">${rico(r.nota)}</p>` : ''}
      </div>
    </details>`).join('');
}

export function telaPraticas(conteudo, parametros) {
  const aba = ABAS.some(a => a.id === parametros.get('aba')) ? parametros.get('aba') : 'rotina';
  const corpo = { rotina: abaRotina, audios: abaAudios, chas: abaChas, receitas: abaReceitas }[aba](conteudo);
  return `
    <h1>Práticas</h1>
    <nav class="abas" aria-label="Seções das práticas">
      ${ABAS.map(a => `<a href="#/praticas?aba=${a.id}"${a.id === aba ? ' aria-current="page"' : ''}>${a.nome}</a>`).join('')}
    </nav>
    ${corpo}
    ${avisoLegal()}
  `;
}

export function ligarPraticas(raiz, conteudo, redesenhar) {
  ligarLembretes(raiz, conteudo, redesenhar);
  ligarRotina(raiz, conteudo, redesenhar);
  const pararCronometros = ligarCronometros(raiz);
  const pararAudios = ligarPlayers(raiz);
  return () => { pararCronometros(); pararAudios(); };
}
