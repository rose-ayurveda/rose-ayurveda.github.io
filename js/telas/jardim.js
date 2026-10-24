// Meu jardim: um calendário em que cada dia é uma pequena flor, mais ou menos aberta.
import { avisoLegal, icones } from '../ui.js';
import { lotus, petalasAbertas } from '../lotus.js';
import { store } from '../store.js';
import { chaveDoDia, partes, nomeDoMes, diasNoMes } from '../datas.js';
import { progresso } from '../quadro.js';

const INICIAIS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function mesDaTela(conteudo, parametros) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const { ano, mes } = partes(hoje);
  const pedido = parametros.get('mes'); // "2026-10"
  if (pedido && /^\d{4}-\d{2}$/.test(pedido)) {
    const [a, m] = pedido.split('-').map(Number);
    return { ano: a, mes: m, hoje };
  }
  return { ano, mes, hoje };
}

function mesVizinho(ano, mes, passo) {
  const d = new Date(Date.UTC(ano, mes - 1 + passo, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function telaJardim(conteudo, parametros) {
  const { ano, mes, hoje } = mesDaTela(conteudo, parametros);
  const registros = store.registros();
  const primeiro = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const vazios = partes(primeiro).semana;
  let celulas = '<span></span>'.repeat(vazios);
  let diasComFlor = 0;

  for (let d = 1; d <= diasNoMes(ano, mes); d++) {
    const chave = `${ano}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const registro = registros[chave];
    const futuro = chave > hoje;
    let flor = '';
    if (registro && !futuro) {
      const { feitos, total } = progresso(conteudo, { marcados: [], ...registro });
      if (feitos > 0) {
        diasComFlor++;
        flor = lotus(petalasAbertas(feitos, total), { rotulo: `Dia ${d}: ${feitos} de ${total} cuidados` });
      }
    }
    celulas += `<span class="dia-jardim${chave === hoje ? ' hoje' : ''}">${flor || '<span class="semente" aria-hidden="true"></span>'}<small>${d}</small></span>`;
  }

  const anterior = mesVizinho(ano, mes, -1);
  const proximo = mesVizinho(ano, mes, 1);
  const podeAvancar = `${proximo}-01` <= hoje;

  return `
    <a href="#/quadro" class="voltar">${icones.voltar}<span>Quadro do dia</span></a>
    <h1>Meu jardim</h1>
    <p class="texto-longo">Cada dia em que você se cuidou vira uma flor. Algumas mais abertas, outras menos — todas fazem parte do seu jardim.</p>
    <section class="cartao">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <a class="botao-icone" href="#/jardim?mes=${anterior}" aria-label="Mês anterior">${icones.voltar}</a>
        <h2 style="margin:0">${nomeDoMes(ano, mes)}</h2>
        ${podeAvancar ? `<a class="botao-icone" href="#/jardim?mes=${proximo}" aria-label="Próximo mês" style="transform:scaleX(-1)">${icones.voltar}</a>` : '<span style="width:44px"></span>'}
      </div>
      <div class="jardim">
        ${INICIAIS.map(i => `<span class="rotulo" style="text-align:center">${i}</span>`).join('')}
        ${celulas}
      </div>
      <p class="rotulo" style="text-align:center;margin-top:10px">${diasComFlor} ${diasComFlor === 1 ? 'flor' : 'flores'} neste mês</p>
    </section>
    ${avisoLegal()}
  `;
}
