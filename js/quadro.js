// Regras do Quadro do dia: progresso, flor completa e selos de conquista.
import { store } from './store.js';
import { chaveDoDia } from './datas.js';

export function itensDoQuadro(conteudo) {
  return conteudo.quadro.periodos.flatMap(p => p.itens.map(i => ({ ...i, periodo: p.id })));
}

export function progresso(conteudo, dia) {
  const ids = itensDoQuadro(conteudo).map(i => i.id);
  const feitos = ids.filter(id => dia.marcados.includes(id)).length;
  return { feitos, total: ids.length, completo: feitos === ids.length && ids.length > 0 };
}

function periodoCompleto(conteudo, dia, periodoId) {
  const periodo = conteudo.quadro.periodos.find(p => p.id === periodoId);
  return Boolean(periodo) && periodo.itens.every(i => dia.marcados.includes(i.id));
}

// Quantos dias (ou vezes) já contam para cada selo. Os dias são somados,
// não precisam ser seguidos: falhar um dia nunca tira o que já foi feito.
function contar(conteudo, registros, criterio) {
  const dias = Object.values(registros).map(d => ({ marcados: [], ...d }));
  switch (criterio.tipo) {
    case 'item':
      return dias.reduce((soma, d) => soma + criterio.itens.filter(id => d.marcados.includes(id)).length, 0);
    case 'periodo':
      return dias.filter(d => periodoCompleto(conteudo, d, criterio.periodo)).length;
    case 'florCompleta':
      return dias.filter(d => progresso(conteudo, d).completo).length;
    case 'refeicoes': {
      // Todas as refeições marcadas e, quando houve check-in, seguidas "no horário".
      const refeicoes = itensDoQuadro(conteudo).filter(i => i.refeicao);
      const noHorario = respostaPrincipal(conteudo, 'seguiu');
      return dias.filter(d => refeicoes.every(i =>
        d.marcados.includes(i.id) && (!d.checkins?.[i.refeicao] || d.checkins[i.refeicao].seguiu === noHorario))).length;
    }
    case 'checkinCalma': {
      const calma = respostaPrincipal(conteudo, 'como');
      return todosCheckins(dias).filter(c => (c.como || []).includes(calma)).length;
    }
    case 'checkinMorno': {
      const morno = respostaPrincipal(conteudo, 'temperatura');
      return todosCheckins(dias).filter(c => c.temperatura === morno).length;
    }
    case 'apoioPassou':
      return store.usosDoApoio().filter(u => u.desfecho === 'passou').length;
    case 'diario':
      return dias.filter(d => d.diario).length;
    case 'diasDeUso':
      return dias.filter(d => d.marcados.length > 0 || d.diario).length;
    default:
      return 0;
  }
}

// A primeira opção de cada pergunta do check-in é a resposta "ideal"
// (no horário, com calma, quente ou morna, leve e satisfeita).
export function respostaPrincipal(conteudo, pergunta) {
  return conteudo.checkin?.perguntas.find(p => p.id === pergunta)?.opcoes[0];
}

function todosCheckins(dias) {
  return dias.flatMap(d => Object.values(d.checkins || {}));
}

export function situacaoDosSelos(conteudo, registros = store.registros(), conquistas = store.conquistas()) {
  return (conteudo.selos || []).map(selo => {
    const atual = Math.min(contar(conteudo, registros, selo.criterio), selo.criterio.dias);
    return { ...selo, atual, meta: selo.criterio.dias, ganhoEm: conquistas[selo.id] || null };
  });
}

// Sorteia uma das versões da mensagem, evitando repetir a última do mesmo tipo,
// preenche os {campos} e guarda a mensagem recebida (ela entra no relatório).
// "lida": as que já aparecem na hora (flor, selo) entram como lidas; as outras
// ficam esperando na tela inicial.
export function enviarMensagem(conteudo, tipo, data, campos = {}, chave = data, lida = false) {
  const versoes = conteudo.mensagens?.[tipo] || [];
  if (!versoes.length) return '';
  const ultima = store.mensagens().filter(m => m.tipo === tipo).pop();
  const opcoes = versoes.length > 1 ? versoes.filter(v => v !== ultima?.modelo) : versoes;
  const modelo = opcoes[Math.floor(Math.random() * opcoes.length)];
  const texto = modelo.replace(/\{(\w+)\}/g, (_, c) => campos[c] ?? '');
  store.guardarMensagem({ data, tipo, chave, modelo, texto, lida });
  return texto;
}

// Celebrações a mostrar na próxima vez que o Quadro for desenhado.
let fila = [];
export function tirarCelebracoes() {
  const lista = fila;
  fila = [];
  return lista;
}

// Confere selos novos (de qualquer tela) e põe a celebração na fila.
export function conferirConquistas(conteudo) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const conquistas = store.conquistas();
  const novos = situacaoDosSelos(conteudo, store.registros(), conquistas).filter(s => !s.ganhoEm && s.atual >= s.meta);
  for (const s of novos) {
    conquistas[s.id] = hoje;
    fila.push({ selo: s, titulo: `Novo selo: ${s.nome}`, texto: enviarMensagem(conteudo, 'seloGanho', hoje, { selo: s.nome }, s.id, true) });
  }
  if (novos.length) store.salvarConquistas(conquistas);
}

// Marca ou desmarca um item do Quadro. Usado pelo Quadro e pela rotina,
// para que o que é marcado numa tela apareça marcado na outra.
export function marcarItem(conteudo, data, id, marcado) {
  const dia = store.dia(data);
  const ja = dia.marcados.includes(id);
  if (marcado && !ja) dia.marcados = [...dia.marcados, id];
  if (!marcado && ja) dia.marcados = dia.marcados.filter(x => x !== id);
  if (progresso(conteudo, dia).completo && !dia.florCelebrada) {
    dia.florCelebrada = true;
    fila.push({ flor: true, texto: enviarMensagem(conteudo, 'florCompleta', data, {}, data, true) });
  }
  store.salvarDia(data, dia);
  conferirConquistas(conteudo);
}
