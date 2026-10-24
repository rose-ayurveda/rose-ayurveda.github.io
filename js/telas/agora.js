// Tela inicial "Agora": saudação, relógio ayurvédico ao vivo, flor do dia e próximas práticas.
import { esc, rico, avisoLegal, NOMES_DOSHA } from '../ui.js';
import { horaLocal, periodoAtual, faixa, saudacao, mostrador } from '../relogio.js';
import { lotus, petalasAbertas } from '../lotus.js';
import { store } from '../store.js';
import { chaveDoDia, somarDias } from '../datas.js';
import { progresso } from '../quadro.js';
import { proximas } from '../rotina.js';
import { assinaturaDosLembretes } from '../lembretes.js';
import { cartaoPratica, cartaoLembretes, ligarRotina, ligarLembretes } from './praticas.js';
import { alertasAtivos, naoLidas } from '../mensagens.js';
import { cartaoMensagem } from './mensagens.js';

// Lembrete mensal da cópia de segurança (depois da primeira semana de uso).
function precisaDeCopia(conteudo) {
  const hoje = chaveDoDia(conteudo.cliente.fusoHorario);
  const ultima = store.ajustes().ultimaCopia;
  if (ultima) return somarDias(ultima, 30) <= hoje;
  const primeiro = Object.keys(store.registros()).sort()[0];
  return Boolean(primeiro) && somarDias(primeiro, 7) <= hoje;
}

export function telaAgora(conteudo) {
  const fuso = conteudo.cliente.fusoHorario;
  const dia = store.dia(chaveDoDia(fuso));
  const { feitos, total, completo } = progresso(conteudo, dia);
  const { decimal, h, m } = horaLocal(fuso);
  const periodos = conteudo.mapa.relogio.periodos;
  const atual = periodoAtual(periodos, decimal);
  const agora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const seguintes = proximas(conteudo, dia, agora).slice(0, 3);
  const lembretesOk = store.ajustes().lembretes === assinaturaDosLembretes(conteudo);
  const novas = naoLidas();

  return `
    <h1>${saudacao(h)}, ${esc(conteudo.cliente.primeiroNome)}</h1>
    <p class="assinatura">Seu acompanhamento com Rosemary Sampaio</p>

    <section class="cartao cartao-dosha dosha-${atual.dosha}" aria-live="polite">
      <p class="rotulo">Agora · ${faixa(atual)} · <span class="selo-dosha">${NOMES_DOSHA[atual.dosha]}</span></p>
      <div class="relogio">
        ${mostrador(periodos, decimal)}
        <div>
          <h3>O que acontece com você</h3>
          <p>${rico(atual.acontece)}</p>
          <h3>Seu cuidado</h3>
          <p>${rico(atual.cuidado)}</p>
        </div>
      </div>
    </section>

    ${alertasAtivos(conteudo).map(a => `
      <section class="cartao alerta-sazonal">
        <p class="rotulo">Alerta da estação</p>
        <h3 style="margin:0 0 4px">${esc(a.titulo)}</h3>
        <p class="texto-longo" style="margin:0">${rico(a.texto)}</p>
      </section>`).join('')}

    ${novas.length ? `
      ${cartaoMensagem(novas.at(-1))}
      <a class="botao secundario" href="#/mensagens" style="margin:-4px 0 14px">${novas.length > 1 ? `Ver as ${novas.length} mensagens novas` : 'Guardar e ver todas as mensagens'}</a>` : ''}

    ${conteudo.apoio ? `<a class="botao botao-apoio" href="#/apoio">${esc(conteudo.apoio.botao)}</a>` : ''}

    ${lembretesOk ? '' : cartaoLembretes(conteudo)}

    <a class="cartao atalho-quadro" href="#/quadro">
      <div style="width:120px;flex:none">${lotus(petalasAbertas(feitos, total), { rotulo: `Flor do dia: ${feitos} de ${total} cuidados` })}</div>
      <div>
        <h3 style="margin:0">Quadro do dia</h3>
        <p style="margin:2px 0 0"><strong>${feitos} de ${total}</strong> cuidados de hoje</p>
        <p class="rotulo" style="margin:4px 0 0">${completo ? 'Flor aberta por inteiro.' : 'Toque para marcar o que você já fez.'}</p>
      </div>
    </a>

    ${precisaDeCopia(conteudo) ? `
      <a class="cartao lembrete-copia" href="#/ajustes">
        <strong>Que tal salvar uma cópia de segurança?</strong>
        <span class="rotulo" style="display:block">Seus registros ficam só neste celular. Uma cópia guardada protege o seu histórico se trocar de aparelho.</span>
      </a>` : ''}

    <h2>Próximas práticas</h2>
    ${seguintes.length
      ? seguintes.map(i => cartaoPratica(conteudo, i, dia, { compacto: true })).join('')
      : '<p class="rotulo">Nenhuma prática pela frente hoje. Descanse.</p>'}
    <a class="botao secundario" href="#/praticas">Ver a rotina completa</a>

    ${avisoLegal()}
  `;
}

export function ligarAgora(raiz, conteudo, redesenhar) {
  ligarRotina(raiz, conteudo, redesenhar);
  ligarLembretes(raiz, conteudo, redesenhar);
}
