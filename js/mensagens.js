// Mensagens com a assinatura da Rose, disparadas por eventos e montadas por regras.
// Nada é escrito livremente: todo texto vem de blocos pré-escritos e aprovados pela Rose.
import { store } from './store.js';
import { chaveDoDia, somarDias, partes, horaAgora } from './datas.js';
import { analisar } from './analise.js';
import { enviarMensagem, progresso } from './quadro.js';

const sortear = lista => lista[Math.floor(Math.random() * lista.length)];
const preencher = (modelo, campos) => modelo.replace(/\{(\w+)\}/g, (_, c) => campos[c] ?? '');
const virgula = v => v.toFixed(1).replace('.', ',');

function jaEnviada(tipo, chave) {
  return store.mensagens().some(m => m.tipo === tipo && (m.chave || m.data) === chave);
}

function enviar(conteudo, tipo, data, chave = data) {
  if (jaEnviada(tipo, chave)) return;
  enviarMensagem(conteudo, tipo, data, {}, chave);
}

// ---------- Mensagens de momento ----------

// Confere os eventos do dia a cada abertura de tela.
export function conferirMomentos(conteudo) {
  if (!conteudo.mensagens) return;
  const fuso = conteudo.cliente.fusoHorario;
  const hoje = chaveDoDia(fuso);
  const ontem = somarDias(hoje, -1);
  const registros = store.registros();
  const datas = Object.keys(registros).filter(d => (registros[d].marcados || []).length || registros[d].diario).sort();
  if (!datas.length) return;

  // Primeira semana: sete dias desde o primeiro registro.
  if (somarDias(datas[0], 7) <= hoje) enviar(conteudo, 'primeiraSemana', hoje, 'unica');

  // Volta depois de 2 dias ou mais sem registro.
  if (datas.includes(hoje)) {
    const anterior = datas.filter(d => d < hoje).pop();
    if (anterior && anterior <= somarDias(hoje, -3)) enviar(conteudo, 'volta', hoje);
  }

  // Dia difícil: ontem teve registro, mas menos de 30% dos cuidados.
  const diaOntem = registros[ontem];
  if (diaOntem && (diaOntem.marcados || []).length) {
    const { feitos, total } = progresso(conteudo, { marcados: [], ...diaOntem });
    if (total && feitos / total < 0.3) enviar(conteudo, 'diaDificil', hoje, `dificil-${ontem}`);
  }

  // Tarde sem doce fora de hora depois de dois dias com doce.
  const marcouHoje = (registros[hoje]?.marcados || []).includes('sem-doce');
  const comDoce = d => registros[d] && !(registros[d].marcados || []).includes('sem-doce');
  if (marcouHoje && comDoce(ontem) && comDoce(somarDias(hoje, -2))) enviar(conteudo, 'tardeSemDoce', hoje);
}

// ---------- Mensagem da semana ----------

function melhorDestaque(conteudo, semana, anterior, s) {
  const blocos = s.destaques;
  // 1. Um indicador do diário que melhorou em relação à semana anterior.
  const melhoras = semana.indicadores.map(i => {
    const antes = anterior.indicadores.find(x => x.id === i.id)?.media;
    if (i.media == null || antes == null) return null;
    const ganho = i.melhorAlto ? i.media - antes : antes - i.media;
    return ganho >= 0.5 ? { i, antes, ganho } : null;
  }).filter(Boolean).sort((a, b) => b.ganho - a.ganho);
  if (melhoras.length) {
    const { i, antes } = melhoras[0];
    return preencher(i.melhorAlto ? blocos.melhoraSobe : blocos.melhoraDesce, {
      indicador: s.nomesIndicadores[i.id] || i.pergunta, antes: virgula(antes), depois: virgula(i.media),
    });
  }
  // 2. Menos usos do botão de apoio.
  if (anterior.apoio.total > semana.apoio.total) {
    return preencher(blocos.menosApoio, {
      depois: semana.apoio.total, antes: anterior.apoio.total, vezes: semana.apoio.total === 1 ? 'vez' : 'vezes',
    });
  }
  // 3. Um selo ganho na semana.
  if (semana.selos.length) return preencher(blocos.selo, { selo: semana.selos.at(-1).nome });
  // 4. O cuidado com maior constância.
  const maior = [...semana.porItem].sort((a, b) => (b.pct || 0) - (a.pct || 0))[0];
  const dias = Math.round(((maior?.pct || 0) / 100) * semana.dias);
  return dias ? preencher(blocos.itemConstante, { item: s.nomesItens[maior.id] || maior.texto, dias }) : '';
}

function padraoObservado(quinzena, s) {
  const fmt = r => (r.unidade === 'media' ? [virgula(r.a.valor), virgula(r.b.valor)] : [r.a.valor, r.b.valor]);
  const chaves = {
    'Vontade de doce e o jeito de comer': 'calma',
    'Vontade de doce e a automassagem': 'abhyanga',
    'O sono e os pés com óleo na noite anterior': 'sono',
    'Como você se sente depois de comer': 'morno',
  };
  const confirmada = quinzena.relacoes.find(r => r.confirma && chaves[r.titulo] && s.padroes[chaves[r.titulo]]);
  if (confirmada) {
    const [a, b] = fmt(confirmada);
    return preencher(s.padroes[chaves[confirmada.titulo]], { a, b });
  }
  const horario = quinzena.relacoes.find(r => r.unidade === 'distribuicao');
  if (horario) {
    const total = Object.values(horario.contagem).reduce((x, y) => x + y, 0);
    const tarde = Object.entries(horario.contagem).find(([o]) => o.includes('14h–18h'))?.[1] || 0;
    if (total && tarde / total >= 0.5 && s.padroes.doceTarde) return s.padroes.doceTarde;
  }
  return '';
}

function focoDaSemana(semana, s) {
  const menor = [...semana.porItem].filter(i => s.focos[i.id]).sort((a, b) => (a.pct || 0) - (b.pct || 0))[0];
  if (!menor || (menor.pct || 0) >= 85) return '';
  // O número de dias só aparece quando há algo a valorizar — nunca "0 de 7".
  const dias = Math.round(((menor.pct || 0) / 100) * semana.dias);
  const complemento = dias > 0 && s.focoComDias ? ` ${preencher(s.focoComDias, { dias })}` : '';
  return preencher(s.foco, { foco: s.focos[menor.id] }) + complemento;
}

// Monta a mensagem da semana que termina no domingo indicado.
export function montarMensagemDaSemana(conteudo, domingo) {
  const s = conteudo.semana;
  const inicio = somarDias(domingo, -6);
  const semana = analisar(conteudo, inicio, domingo);
  if (semana.diasComRegistro < 2) return sortear(s.retomada);
  const anterior = analisar(conteudo, somarDias(inicio, -7), somarDias(inicio, -1));
  const quinzena = analisar(conteudo, somarDias(domingo, -13), domingo);
  return [
    sortear(s.aberturas),
    melhorDestaque(conteudo, semana, anterior, s),
    padraoObservado(quinzena, s),
    focoDaSemana(semana, s),
    sortear(s.fechamentos),
  ].filter(Boolean).join('\n\n');
}

// Todo domingo à noite (a partir das 18h). Se o app não foi aberto no domingo,
// a mensagem daquela semana aparece na próxima abertura, até terça-feira.
export function conferirSemana(conteudo) {
  if (!conteudo.semana) return;
  const fuso = conteudo.cliente.fusoHorario;
  const hoje = chaveDoDia(fuso);
  const diaDaSemana = partes(hoje).semana;
  const domingo = diaDaSemana === 0 ? hoje : somarDias(hoje, -diaDaSemana);
  if (diaDaSemana === 0 && horaAgora(fuso) < 18) return;
  if (diaDaSemana > 2) return; // depois de terça, a mensagem daquela semana já perdeu o sentido
  if (jaEnviada('semana', domingo)) return;
  // Só depois de ao menos uma semana de uso.
  const primeiro = Object.keys(store.registros()).sort()[0];
  if (!primeiro || somarDias(primeiro, 6) > domingo) return;
  store.guardarMensagem({ data: hoje, tipo: 'semana', chave: domingo, texto: montarMensagemDaSemana(conteudo, domingo), lida: false });
}

// ---------- Alertas sazonais ----------

export function alertasAtivos(conteudo) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  return (conteudo.alertas || []).filter(a => a.inicio <= hoje && hoje <= a.fim);
}

// ---------- Leitura ----------

export function naoLidas() {
  return store.mensagens().filter(m => m.lida === false);
}

export function marcarTodasComoLidas() {
  store.salvarMensagens(store.mensagens().map(m => ({ ...m, lida: true })));
}
