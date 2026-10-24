// Rotina do dia (Dinacharya): estado de cada prática — feita, pulada ou adiada.
// Práticas ligadas a um item do Quadro usam o próprio Quadro como registro,
// assim o que é marcado numa tela aparece marcado na outra, sem duplicar.
import { store } from './store.js';
import { marcarItem } from './quadro.js';

export function estado(item, dia) {
  const r = dia.rotina?.[item.id];
  if (item.quadro ? dia.marcados.includes(item.quadro) : r === 'feito') return 'feito';
  if (r === 'pulado') return 'pulado';
  return 'pendente';
}

// Horário em que a prática deve aparecer (o original ou o adiado).
export function horarioEfetivo(item, dia) {
  return dia.adiados?.[item.id] || item.horario;
}

// Próximas práticas: as pendentes a partir de meia hora atrás, em ordem de horário.
// As que já passaram continuam na aba Práticas, sem cobrança na tela inicial.
export function proximas(conteudo, dia, agora = '00:00') {
  const [h, m] = agora.split(':').map(Number);
  const minutos = Math.max(0, h * 60 + m - 30);
  const desde = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  return (conteudo.rotina || [])
    .filter(i => estado(i, dia) === 'pendente' && horarioEfetivo(i, dia) >= desde)
    .sort((a, b) => horarioEfetivo(a, dia).localeCompare(horarioEfetivo(b, dia)));
}

export function contagem(conteudo, dia) {
  const itens = conteudo.rotina || [];
  return { feitas: itens.filter(i => estado(i, dia) === 'feito').length, total: itens.length };
}

function salvarRotina(data, id, valor, alterar = () => {}) {
  const dia = store.dia(data);
  dia.rotina = { ...(dia.rotina || {}) };
  if (valor) dia.rotina[id] = valor; else delete dia.rotina[id];
  alterar(dia);
  store.salvarDia(data, dia);
}

export function marcarFeito(conteudo, data, item, feito = true) {
  if (item.quadro) marcarItem(conteudo, data, item.quadro, feito);
  salvarRotina(data, item.id, feito ? 'feito' : null);
}

export function pularHoje(data, item) {
  salvarRotina(data, item.id, 'pulado');
}

export function desfazerPulo(data, item) {
  salvarRotina(data, item.id, null);
}

// "Fazer depois": a prática volta a aparecer daqui a 30 minutos.
export function adiar(data, item, agora = new Date(), fuso = 'America/Sao_Paulo') {
  const depois = new Date(agora.getTime() + 30 * 60_000);
  const hhmm = new Intl.DateTimeFormat('en-GB', { timeZone: fuso, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(depois);
  salvarRotina(data, item.id, null, dia => { dia.adiados = { ...(dia.adiados || {}), [item.id]: hhmm }; });
}
