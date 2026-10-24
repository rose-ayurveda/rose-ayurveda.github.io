// Análise dos registros de um período: indicadores do diário, adesão ao Quadro,
// botão de apoio, check-ins das refeições, relações entre os dados e pontos de atenção.
// Tudo é calculado no próprio celular, a partir do que a cliente registrou.
import { store } from './store.js';
import { somarDias } from './datas.js';
import { itensDoQuadro, progresso, respostaPrincipal } from './quadro.js';

export function diasDoPeriodo(inicio, fim) {
  const dias = [];
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) dias.push(d);
  return dias;
}

function media(valores) {
  const v = valores.filter(x => typeof x === 'number');
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function porcentagem(parte, total) {
  return total ? Math.round((parte / total) * 100) : null;
}

// Faixa do relógio ayurvédico em que um horário "HH:MM" cai.
function faixaDoRelogio(conteudo, hhmm) {
  const h = Number(hhmm.split(':')[0]);
  return conteudo.mapa.relogio.periodos.find(p =>
    p.inicio < p.fim ? h >= p.inicio && h < p.fim : h >= p.inicio || h < p.fim);
}

export function analisar(conteudo, inicio, fim) {
  const todos = store.registros();
  const dias = diasDoPeriodo(inicio, fim);
  const registros = dias.map(data => ({ data, marcados: [], ...(todos[data] || {}) }));
  const comRegistro = registros.filter(r => r.marcados.length || r.diario);
  const itens = itensDoQuadro(conteudo);

  // ---- Diário: uma série por indicador (valor do dia ou vazio) ----
  const escalas = (conteudo.diario?.itens || []).filter(i => i.tipo === 'escala');
  const indicadores = escalas.map(i => {
    const serie = registros.map(r => ({ data: r.data, valor: r.diario?.respostas?.[i.id] ?? null }));
    return { ...i, serie, media: media(serie.map(p => p.valor)) };
  });
  const contarOpcoes = id => {
    const pergunta = conteudo.diario?.itens.find(i => i.id === id);
    if (!pergunta) return null;
    const contagem = Object.fromEntries(pergunta.opcoes.map(o => [o, 0]));
    for (const r of registros) {
      const v = r.diario?.respostas?.[id];
      if (v in contagem) contagem[v]++;
    }
    return { pergunta: pergunta.pergunta, contagem };
  };

  // ---- Quadro: adesão por dia, por semana e por item ----
  const adesaoDiaria = registros.map(r => {
    const { feitos, total } = progresso(conteudo, r);
    return { data: r.data, feitos, total, pct: porcentagem(feitos, total) };
  });
  const semanas = [];
  for (let i = 0; i < adesaoDiaria.length; i += 7) {
    const bloco = adesaoDiaria.slice(i, i + 7);
    const feitos = bloco.reduce((s, d) => s + d.feitos, 0);
    const total = bloco.reduce((s, d) => s + d.total, 0);
    semanas.push({ inicio: bloco[0].data, fim: bloco.at(-1).data, pct: porcentagem(feitos, total) });
  }
  const porItem = itens.map(i => ({
    id: i.id, texto: i.texto,
    pct: porcentagem(registros.filter(r => r.marcados.includes(i.id)).length, registros.length),
  }));
  const adesaoTotal = porcentagem(adesaoDiaria.reduce((s, d) => s + d.feitos, 0), adesaoDiaria.reduce((s, d) => s + d.total, 0));

  // Dias seguidos com algum cuidado (a sequência atual conta até o último dia do período).
  let sequenciaAtual = 0;
  let maiorSequencia = 0;
  let corrida = 0;
  for (const r of registros) {
    corrida = r.marcados.length ? corrida + 1 : 0;
    maiorSequencia = Math.max(maiorSequencia, corrida);
  }
  for (let i = registros.length - 1; i >= 0; i--) {
    if (registros[i].marcados.length) sequenciaAtual++;
    else if (i < registros.length - 1 || sequenciaAtual) break;
  }
  const floresCompletas = adesaoDiaria.filter(d => d.total && d.feitos === d.total).length;

  // ---- Botão de apoio ----
  const usos = store.usosDoApoio().filter(u => u.data >= inicio && u.data <= fim);
  const apoioPorFaixa = conteudo.mapa.relogio.periodos.map(p => ({
    nome: p.nome, dosha: p.dosha, inicio: p.inicio, fim: p.fim,
    usos: usos.filter(u => faixaDoRelogio(conteudo, u.hora) === p).length,
  }));
  const apoioPorSemana = semanas.map(s => ({ ...s, usos: usos.filter(u => u.data >= s.inicio && u.data <= s.fim).length }));
  const desfechos = Object.fromEntries((conteudo.apoio?.desfechos || []).map(d => [d.texto, usos.filter(u => u.desfecho === d.id).length]));
  const fome = usos.filter(u => u.resposta === 'fome').length;

  // ---- Check-ins das refeições ----
  const checkins = registros.flatMap(r => Object.entries(r.checkins || {}).map(([refeicao, c]) => ({ data: r.data, refeicao, ...c })));
  const perguntaSeguiu = conteudo.checkin?.perguntas.find(p => p.id === 'seguiu');
  const [noHorario, foraDoHorario] = perguntaSeguiu?.opcoes || [];
  const calma = respostaPrincipal(conteudo, 'como');
  const morno = respostaPrincipal(conteudo, 'temperatura');
  const leve = respostaPrincipal(conteudo, 'sensacao');
  const refeicoes = {
    total: checkins.length,
    seguidas: porcentagem(checkins.filter(c => [noHorario, foraDoHorario].includes(c.seguiu)).length, checkins.length),
    noHorario: porcentagem(checkins.filter(c => c.seguiu === noHorario).length, checkins.length),
    comCalma: porcentagem(checkins.filter(c => (c.como || []).includes(calma)).length, checkins.length),
    mornas: porcentagem(checkins.filter(c => c.temperatura === morno).length, checkins.length),
    sensacoes: Object.fromEntries((conteudo.checkin?.perguntas.find(p => p.id === 'sensacao')?.opcoes || [])
      .map(o => [o, checkins.filter(c => c.sensacao === o).length])),
  };

  // ---- Relações entre os dados (só aparecem com registros suficientes) ----
  const relacoes = [];
  const doceDoDia = r => r.diario?.respostas?.doce;
  // A explicação ayurvédica só aparece quando os dados confirmam o efeito esperado
  // ("menor" = o grupo A deve ter valor menor que o B; "maior" = valor maior).
  const NEUTRO = 'Por enquanto, os dados não mostram uma diferença clara. Vale continuar observando.';
  const comparar = (titulo, grupoA, nomeA, grupoB, nomeB, valor, explicacao, esperado, unidade = 'media') => {
    const a = grupoA.map(valor).filter(v => v != null);
    const b = grupoB.map(valor).filter(v => v != null);
    if (a.length < 3 || b.length < 3) return;
    const ma = unidade === 'media' ? media(a) : porcentagem(a.filter(Boolean).length, a.length);
    const mb = unidade === 'media' ? media(b) : porcentagem(b.filter(Boolean).length, b.length);
    const margem = unidade === 'media' ? 0.3 : 10;
    const confirma = esperado === 'menor' ? ma <= mb - margem : ma >= mb + margem;
    relacoes.push({ titulo, a: { nome: nomeA, valor: ma, dias: a.length }, b: { nome: nomeB, valor: mb, dias: b.length }, unidade, confirma, explicacao: confirma ? explicacao : NEUTRO });
  };
  const comeuCom = (r, resposta) => Object.values(r.checkins || {}).some(c => (c.como || []).includes(resposta));
  const pressa = conteudo.checkin?.perguntas.find(p => p.id === 'como')?.opcoes[1];
  comparar('Vontade de doce e o jeito de comer',
    registros.filter(r => comeuCom(r, calma) && !comeuCom(r, pressa)), 'Dias em que comeu com calma',
    registros.filter(r => comeuCom(r, pressa)), 'Dias em que comeu com pressa',
    doceDoDia, 'Quando a refeição acontece com calma, o corpo registra que foi nutrido — e Vata busca menos o doce.', 'menor');
  comparar('Vontade de doce e a automassagem',
    registros.filter(r => r.marcados.includes('abhyanga')), 'Dias com automassagem',
    registros.filter(r => (r.diario) && !r.marcados.includes('abhyanga')), 'Dias sem automassagem',
    doceDoDia, 'O óleo morno acalma Vata, e um Vata calmo pede menos doce.', 'menor');
  comparar('O sono e os pés com óleo na noite anterior',
    registros.filter((r, i) => i > 0 && registros[i - 1].marcados.includes('pes-respiracao')), 'Depois de noites com pés com óleo',
    registros.filter((r, i) => i > 0 && registros[i - 1].diario && !registros[i - 1].marcados.includes('pes-respiracao')), 'Depois de noites sem',
    r => r.diario?.respostas?.sono, 'Desacelerar à noite protege o sono e reduz a ansiedade noturna.', 'maior');
  const sensacaoLeve = c => c.sensacao === leve;
  comparar('Como você se sente depois de comer',
    checkins.filter(c => c.temperatura === morno), 'Refeições quentes ou mornas',
    checkins.filter(c => c.temperatura && c.temperatura !== morno), 'Refeições frias ou geladas',
    sensacaoLeve, 'Vata é frio e seco: comida morna é digerida com mais leveza.', 'maior', 'pct');

  const doceHorario = contarOpcoes('doce-horario');
  if (doceHorario) {
    const total = Object.values(doceHorario.contagem).reduce((a, b) => a + b, 0);
    const tarde = Object.entries(doceHorario.contagem).find(([o]) => o.includes('14h–18h'))?.[1] || 0;
    if (total >= 3) {
      relacoes.push({
        titulo: 'Em que horário o doce aparece', unidade: 'distribuicao', contagem: doceHorario.contagem,
        explicacao: tarde / total >= 0.5
          ? `${porcentagem(tarde, total)}% das vezes foi entre 14h e 18h — o horário de Vata. O lanche das 15h e o chá morno são os seus maiores aliados.`
          : 'O doce não está concentrado num único horário. Vale observar o que acontece nesses momentos.',
      });
    }
  }

  // ---- Pontos de atenção (aparecem no relatório, para a terapeuta) ----
  const alertas = [];
  const pulou = r => Object.values(r.checkins || {}).some(c => c.seguiu === perguntaSeguiu?.opcoes[3]);
  let pulosSeguidos = 0;
  let maxPulos = 0;
  for (const r of registros) { pulosSeguidos = pulou(r) ? pulosSeguidos + 1 : 0; maxPulos = Math.max(maxPulos, pulosSeguidos); }
  if (maxPulos >= 3) alertas.push(`Refeição pulada em ${maxPulos} dias seguidos.`);
  const azia = conteudo.checkin?.perguntas.find(p => p.id === 'sensacao')?.opcoes.find(o => /azia/i.test(o));
  const vezesAzia = checkins.filter(c => c.sensacao === azia).length;
  if (vezesAzia >= 3) alertas.push(`Azia ou queimação depois de comer em ${vezesAzia} refeições.`);
  const diasComDiario = registros.filter(r => r.diario);
  const diasDoceFora = diasComDiario.filter(r => r.diario.respostas?.['doce-horario']).length;
  if (diasComDiario.length >= 5 && diasDoceFora / diasComDiario.length >= 0.7) {
    alertas.push(`Doce fora do plano em ${diasDoceFora} de ${diasComDiario.length} dias com diário.`);
  }

  // ---- Textos abertos, selos e mensagens do período ----
  const abertas = registros.filter(r => r.diario?.observacao || r.diario?.semanal)
    .map(r => ({ data: r.data, observacao: r.diario.observacao, semanal: r.diario.semanal }));
  const conquistas = store.conquistas();
  const selos = (conteudo.selos || []).filter(s => conquistas[s.id] && conquistas[s.id] >= inicio && conquistas[s.id] <= fim)
    .map(s => ({ ...s, ganhoEm: conquistas[s.id] }));
  const mensagens = store.mensagens().filter(m => m.data >= inicio && m.data <= fim);

  return {
    inicio, fim, dias: registros.length, diasComRegistro: comRegistro.length,
    indicadores, lingua: contarOpcoes('lingua'), intestino: contarOpcoes('intestino'),
    adesaoDiaria, semanas, porItem, adesaoTotal, sequenciaAtual, maiorSequencia, floresCompletas,
    apoio: { total: usos.length, porFaixa: apoioPorFaixa, porSemana: apoioPorSemana, desfechos, fome },
    refeicoes, doceHorario, relacoes, alertas, abertas, selos, mensagens,
  };
}
