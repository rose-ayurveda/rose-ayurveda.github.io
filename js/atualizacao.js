// Receber o conteúdo enviado pela Rose: instalar pela primeira vez ou atualizar,
// sempre sem apagar o histórico da cliente (quadro, diário, flores, selos).
import { store } from './store.js';
import { assinaturaDosLembretes } from './lembretes.js';

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const nomes = lista => new Map((lista || []).map(i => [i.id, i.nome || i.texto || i.titulo || i.id]));

// O que mudou entre a versão antiga e a nova, em frases simples para a cliente.
export function mudancas(antigo, novo) {
  const lista = [];
  const comparar = (velhos, novos, rotulo) => {
    const a = nomes(velhos);
    const b = nomes(novos);
    for (const [id, nome] of b) if (!a.has(id)) lista.push(`Novo em ${rotulo}: ${nome}`);
    for (const [id, nome] of a) if (!b.has(id)) lista.push(`Saiu de ${rotulo}: ${nome}`);
  };
  comparar(antigo.rotina, novo.rotina, 'sua rotina');
  comparar(antigo.quadro?.periodos.flatMap(p => p.itens), novo.quadro?.periodos.flatMap(p => p.itens), 'seu Quadro do dia');
  comparar((antigo.audios || []).map(id => ({ id })), (novo.audios || []).map(id => ({ id })), 'seus áudios');
  comparar(antigo.receitas, novo.receitas, 'suas receitas');
  comparar(antigo.mapa?.chas?.itens, novo.mapa?.chas?.itens, 'seus chás');
  comparar(antigo.selos, novo.selos, 'suas conquistas');

  const antigosHorarios = new Map((antigo.rotina || []).map(i => [i.id, i.horario]));
  for (const i of novo.rotina || []) {
    const antes = antigosHorarios.get(i.id);
    if (antes && antes !== i.horario) lista.push(`Novo horário: ${i.nome}, agora às ${i.horario}`);
  }

  const secoes = {
    prioridades: 'as prioridades', prakriti: 'a constituição', vikriti: 'o momento atual',
    doce: 'a relação com o doce', refeicoes: 'o ajuste das refeições', relogio: 'o relógio ayurvédico',
    praticas: 'o passo a passo das práticas', chas: 'os chás', estacao: 'os cuidados da estação',
    evitar: 'o que evitar', sinais: 'os sinais a observar',
  };
  const partesDoMapa = Object.entries(secoes).filter(([chave]) => !igual(antigo.mapa?.[chave], novo.mapa?.[chave])).map(([, t]) => t);
  if (partesDoMapa.length) {
    const ultima = partesDoMapa.pop();
    lista.push(`Seu Mapa foi atualizado: ${partesDoMapa.length ? `${partesDoMapa.join(', ')} e ${ultima}` : ultima}`);
  }
  if (!igual(antigo.alertas, novo.alertas)) lista.push('Novos alertas da estação');
  if (novo.cliente.proximoEncontro && novo.cliente.proximoEncontro !== antigo.cliente.proximoEncontro) {
    const [a, m, d] = novo.cliente.proximoEncontro.split('-');
    lista.push(`Próximo encontro marcado: ${d}/${m}/${a}`);
  }
  return [...new Set(lista)];
}

// Resultado: { situacao: 'instalado' | 'atualizado' | 'igual' | 'outraCliente', mudancas, lembretesMudaram }
export function avaliar(novo) {
  const atual = store.conteudo();
  if (!atual) return { situacao: 'instalado', mudancas: [] };
  if (atual.cliente.id !== novo.cliente.id) return { situacao: 'outraCliente', atual };
  if (igual(atual, novo)) return { situacao: 'igual', mudancas: [] };
  return {
    situacao: 'atualizado',
    mudancas: mudancas(atual, novo),
    lembretesMudaram: assinaturaDosLembretes(atual) !== assinaturaDosLembretes(novo),
  };
}

export function aplicar(novo) {
  store.salvarConteudo(novo); // o histórico fica em outras gavetas e não é tocado
  store.salvarAjustes({ ...store.ajustes(), ultimaAtualizacao: new Date().toISOString() });
}
