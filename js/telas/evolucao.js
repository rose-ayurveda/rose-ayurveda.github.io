// Minha evolução: diário, gráficos por semana e por mês, relações entre os dados
// e o botão "Salvar meu relatório" (PDF salvo no próprio celular).
import { esc, avisoLegal } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia, somarDias } from '../datas.js';
import { analisar } from '../analise.js';
import { graficoLinha, graficoBarras, barraPct, rotuloDia, decimal } from '../graficos.js';
import { gerarRelatorio, salvarPdf } from '../relatorio.js';

const DOSHA = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)' };

function cartaoDiario(hoje) {
  const diaHoje = store.dia(hoje);
  const diaOntem = store.dia(somarDias(hoje, -1));
  return `
    <section class="cartao">
      <h3 style="margin-top:0">Diário de 30 segundos</h3>
      ${diaHoje.diario
        ? `<p class="feito-ok">Diário de hoje preenchido</p><a class="botao secundario" href="#/diario">Ver ou mudar</a>`
        : `<p class="rotulo">Sono, vontade de doce, digestão, energia, ansiedade e língua ao acordar.</p>
           <a class="botao" href="#/diario">Preencher o diário de hoje</a>`}
      ${diaOntem.diario ? '' : `<a class="botao secundario" href="#/diario?dia=ontem" style="margin-top:10px">Esqueceu ontem? Preencher o de ontem</a>`}
    </section>`;
}

// Frase de incentivo, sem comparação com ninguém.
function incentivo(a) {
  if (!a.diasComRegistro) return 'Cada pequeno cuidado conta. Comece pelo que for mais fácil hoje.';
  const partes = [`Você se cuidou em <strong>${a.diasComRegistro} de ${a.dias} dias</strong>.`];
  if (a.sequenciaAtual >= 2) partes.push(`Já são <strong>${a.sequenciaAtual} dias seguidos</strong>.`);
  if (a.floresCompletas) partes.push(`${a.floresCompletas === 1 ? 'Uma flor se abriu' : `${a.floresCompletas} flores se abriram`} por inteiro.`);
  return partes.join(' ');
}

function secaoIndicadores(a, conteudo) {
  const comDados = a.indicadores.filter(i => i.media != null);
  if (!comDados.length) return '<p class="rotulo">Os gráficos aparecem assim que você preencher o diário.</p>';
  return a.indicadores.map(i => `
    <div class="indicador">
      <div class="barra-pct-rotulo"><span>${esc(i.pergunta)}</span>${i.media != null ? `<strong>média ${decimal(i.media)}</strong>` : ''}</div>
      ${graficoLinha(i.serie, { rotulos: i.rotulos, cor: i.melhorAlto ? 'var(--marca)' : 'var(--pitta)' })}
      <div class="legenda-escala"><span>1 · ${esc(i.rotulos[0])}</span><span>5 · ${esc(i.rotulos[4])}</span></div>
    </div>`).join('');
}

function secaoAdesao(a, dias) {
  const barras = dias <= 7
    ? a.adesaoDiaria.map(d => ({ rotulo: rotuloDia(d.data), valor: d.pct }))
    : a.semanas.map((s, i) => ({ rotulo: `Semana ${i + 1}`, rotulo2: rotuloDia(s.inicio), valor: s.pct }));
  const destaques = [...a.porItem].sort((x, y) => (y.pct || 0) - (x.pct || 0));
  return `
    ${graficoBarras(barras, { maximo: 100, sufixo: '%' })}
    <p class="rotulo" style="margin-top:8px">Maior sequência no período: ${a.maiorSequencia} ${a.maiorSequencia === 1 ? 'dia' : 'dias'}</p>
    <details class="detalhe-pratica"><summary>Ver cada cuidado</summary>${destaques.map(i => barraPct(i.texto, i.pct)).join('')}</details>`;
}

function secaoApoio(a) {
  if (!a.apoio.total) return '<p class="rotulo">Nenhum uso do botão de apoio neste período.</p>';
  const faixas = a.apoio.porFaixa.map(p => ({ rotulo: `${p.inicio}h–${p.fim}h`, valor: p.usos, cor: DOSHA[p.dosha] }));
  return `
    <p>${a.apoio.total} ${a.apoio.total === 1 ? 'momento' : 'momentos'} de apoio.</p>
    <p class="rotulo">Por período do relógio ayurvédico</p>
    ${graficoBarras(faixas)}
    ${a.semanas.length > 1 ? `<p class="rotulo">Por semana</p>${graficoBarras(a.apoio.porSemana.map((s, i) => ({ rotulo: `Semana ${i + 1}`, valor: s.usos })))}` : ''}
    ${Object.entries(a.apoio.desfechos).map(([rotulo, n]) => barraPct(`Depois da pausa: ${rotulo.toLowerCase()}`, a.apoio.total ? Math.round((n / a.apoio.total) * 100) : null, 'var(--vata)')).join('')}`;
}

function secaoRefeicoes(a) {
  const r = a.refeicoes;
  let html = r.total
    ? `${barraPct('Seguiu a refeição do plano', r.seguidas)}${barraPct('No horário', r.noHorario)}${barraPct('Sentada e com calma', r.comCalma)}${barraPct('Quente ou morna', r.mornas)}`
    : '<p class="rotulo">Os dados das refeições aparecem com os check-ins.</p>';
  if (a.doceHorario && Object.values(a.doceHorario.contagem).some(Boolean)) {
    html += `<p class="rotulo" style="margin-top:12px">Doce fora de hora, por horário</p>
      ${graficoBarras(Object.entries(a.doceHorario.contagem).map(([rotulo, valor]) => ({ rotulo, valor, cor: 'var(--pitta)' })))}`;
  }
  return html;
}

function secaoRelacoes(a) {
  if (!a.relacoes.length) {
    return '<p class="rotulo">Com mais alguns dias de diário e check-ins, aparecem aqui as relações entre os seus cuidados e o seu bem-estar.</p>';
  }
  return a.relacoes.map(r => {
    let corpo = '';
    if (r.unidade === 'media') {
      corpo = '<p class="rotulo" style="margin:0">Média de 1 a 5</p>' + graficoBarras([
        { rotulo: r.a.nome.replace('Dias ', '').replace('Depois de noites ', ''), valor: r.a.valor == null ? null : Number(r.a.valor.toFixed(1)) },
        { rotulo: r.b.nome.replace('Dias ', '').replace('Depois de noites ', ''), valor: r.b.valor == null ? null : Number(r.b.valor.toFixed(1)), cor: 'var(--linha)' },
      ], { maximo: 5 });
    } else if (r.unidade === 'pct') {
      corpo = `${barraPct(`${r.a.nome}: leve e satisfeita`, r.a.valor)}${barraPct(`${r.b.nome}: leve e satisfeita`, r.b.valor, 'var(--texto-2)')}`;
    } else {
      corpo = graficoBarras(Object.entries(r.contagem).map(([rotulo, valor]) => ({ rotulo, valor, cor: 'var(--pitta)' })));
    }
    return `<div class="relacao"><h3>${esc(r.titulo)}</h3>${corpo}<p class="assinatura texto-longo">${esc(r.explicacao)}</p></div>`;
  }).join('');
}

function cartaoRelatorio(conteudo, hoje) {
  const consulta = conteudo.cliente.dataConsulta;
  return `
    <section class="cartao" id="relatorio">
      <h2 style="margin-top:0">Salvar meu relatório</h2>
      <p class="rotulo">Um PDF com a sua evolução, salvo no seu celular. Ele só sai daqui se você decidir compartilhar.</p>
      <div class="pilulas" role="group" aria-label="Período do relatório" style="margin:10px 0">
        ${consulta ? `<button type="button" data-periodo="consulta" aria-pressed="true">Desde a consulta</button>` : ''}
        <button type="button" data-periodo="7" aria-pressed="${!consulta}">Últimos 7 dias</button>
        <button type="button" data-periodo="30" aria-pressed="false">Últimos 30 dias</button>
        <button type="button" data-periodo="datas" aria-pressed="false">Escolher datas</button>
      </div>
      <div id="datas-relatorio" style="display:none;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
        <label class="rotulo">De<input type="date" name="inicio" value="${consulta || somarDias(hoje, -6)}" max="${hoje}"></label>
        <label class="rotulo">Até<input type="date" name="fim" value="${hoje}" max="${hoje}"></label>
      </div>
      <button type="button" class="botao" id="salvar-relatorio">Salvar meu relatório</button>
      <p class="rotulo" id="aviso-relatorio" role="status" style="margin-top:8px"></p>
    </section>`;
}

export function telaEvolucao(conteudo, parametros) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const dias = parametros.get('ver') === 'mes' ? 30 : 7;
  const a = analisar(conteudo, somarDias(hoje, -(dias - 1)), hoje);

  return `
    <h1>Minha evolução</h1>
    ${cartaoDiario(hoje)}

    <div class="abas" style="grid-template-columns:1fr 1fr">
      <a href="#/evolucao"${dias === 7 ? ' aria-current="page"' : ''}>Últimos 7 dias</a>
      <a href="#/evolucao?ver=mes"${dias === 30 ? ' aria-current="page"' : ''}>Últimos 30 dias</a>
    </div>

    <section class="cartao suave"><p class="assinatura texto-longo" style="margin:0">${incentivo(a)}</p></section>

    <section class="cartao"><h2 style="margin-top:0">Como você tem se sentido</h2>${secaoIndicadores(a, conteudo)}</section>
    <section class="cartao"><h2 style="margin-top:0">Seus cuidados do dia</h2>${secaoAdesao(a, dias)}</section>
    <section class="cartao"><h2 style="margin-top:0">Suas refeições</h2>${secaoRefeicoes(a)}</section>
    <section class="cartao"><h2 style="margin-top:0">Momentos de apoio</h2>${secaoApoio(a)}</section>
    <section class="cartao"><h2 style="margin-top:0">O que os seus dados mostram</h2>${secaoRelacoes(a)}</section>

    <a class="botao secundario" href="#/mensagens" style="margin-bottom:14px">Minhas mensagens da Rose</a>
    ${cartaoRelatorio(conteudo, hoje)}
    ${avisoLegal()}`;
}

export function ligarEvolucao(raiz, conteudo) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const caixaDatas = raiz.querySelector('#datas-relatorio');
  const aviso = raiz.querySelector('#aviso-relatorio');
  let periodo = conteudo.cliente.dataConsulta ? 'consulta' : '7';

  raiz.querySelectorAll('[data-periodo]').forEach(b => b.addEventListener('click', () => {
    periodo = b.dataset.periodo;
    raiz.querySelectorAll('[data-periodo]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    caixaDatas.style.display = periodo === 'datas' ? 'grid' : 'none';
  }));

  raiz.querySelector('#salvar-relatorio').addEventListener('click', async () => {
    let inicio = periodo === 'consulta' ? conteudo.cliente.dataConsulta
      : periodo === '30' ? somarDias(hoje, -29) : somarDias(hoje, -6);
    let fim = hoje;
    if (periodo === 'datas') {
      inicio = caixaDatas.querySelector('[name=inicio]').value;
      fim = caixaDatas.querySelector('[name=fim]').value;
      if (!inicio || !fim || inicio > fim) {
        aviso.textContent = 'Escolha uma data inicial anterior à data final.';
        return;
      }
    }
    aviso.textContent = 'Preparando o seu relatório…';
    const nome = `relatorio-${conteudo.cliente.primeiroNome.toLowerCase()}-${inicio}-a-${fim}.pdf`;
    await salvarPdf(gerarRelatorio(conteudo, inicio, fim), nome);
    aviso.textContent = 'Relatório pronto. Ele fica guardado no seu celular.';
  });
}
