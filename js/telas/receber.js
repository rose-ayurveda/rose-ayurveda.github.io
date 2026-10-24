// Receber o acompanhamento pelo link da Rose (primeira vez ou atualização).
// No iPhone, o link abre no Safari, que guarda os dados separado do app instalado:
// por isso mostramos o passo "Copiar" e, no app, "Colar meu acompanhamento".
import { esc, avisoLegal } from '../ui.js';
import { decodificar } from '../codigo.js';
import { avaliar, aplicar } from '../atualizacao.js';
import { ehIPhone } from '../lembretes.js';
import { store } from '../store.js';
import { ehAppAndroid, linkParaOApp, manterLembretesEmDia } from '../nativo.js';

export function estaInstalado() {
  return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

function passosIPhone(codigo, primeiraVez) {
  return `
    <section class="cartao" style="border:2px solid var(--marca)">
      <h2 style="margin-top:0">${primeiraVez ? 'Para colocar o app no seu iPhone' : 'Para levar a atualização para o app'}</h2>
      <ol class="lista numerada">
        <li>Toque em <strong>Copiar</strong> aqui embaixo.</li>
        ${primeiraVez ? '<li>Toque no botão <strong>Compartilhar</strong> do Safari (o quadrado com a seta) e escolha <strong>Adicionar à Tela de Início</strong>.</li>' : ''}
        <li>Abra o app <strong>Rose Ayurveda</strong> na tela do iPhone e toque em <strong>${primeiraVez ? 'Colar meu acompanhamento' : 'Colar atualização'}</strong>${primeiraVez ? '' : ' (em Ajustes)'}.</li>
      </ol>
      <button type="button" class="botao" data-copiar="${esc(codigo)}">Copiar</button>
      <p class="rotulo" id="aviso-copia" role="status"></p>
    </section>`;
}

function listaMudancas(resultado) {
  if (!resultado.mudancas.length) return '<p class="rotulo">Pequenos ajustes nos textos do seu acompanhamento.</p>';
  return `<ul class="lista">${resultado.mudancas.map(m => `<li>${esc(m)}</li>`).join('')}</ul>`;
}

export function telaReceber() {
  return '<section class="cartao em-breve"><p>Recebendo o seu acompanhamento…</p></section>';
}

// O mesmo link pode chegar duas vezes ao abrir o app (abertura e aviso do link):
// ele é processado uma vez só, e a tela do resultado é mostrada de novo.
let ultimo = { codigo: null, html: '', ligar: () => {}, pronto: Promise.resolve() };

export async function ligarReceber(raiz, codigo, redesenhar) {
  if (ultimo.codigo === codigo) {
    await ultimo.pronto;
    raiz.innerHTML = ultimo.html;
    ultimo.ligar();
    return;
  }
  let terminar;
  ultimo = { codigo, html: '', ligar: () => {}, pronto: new Promise(r => { terminar = r; }) };
  let novo;
  try {
    novo = await decodificar(codigo);
  } catch {
    raiz.innerHTML = `
      <section class="cartao">
        <h2 style="margin-top:0">Não consegui abrir este link</h2>
        <p>Ele pode ter chegado incompleto. Peça à Rose para enviar de novo, ou copie o link inteiro e use “Colar meu acompanhamento”.</p>
        <a class="botao" href="#/agora">Voltar</a>
      </section>`;
    ultimo.html = raiz.innerHTML;
    terminar();
    return;
  }

  const resultado = avaliar(novo);
  const iPhoneNoSafari = ehIPhone() && !estaInstalado();
  const androidNoNavegador = /Android/i.test(navigator.userAgent) && !ehAppAndroid();
  let html = '';

  if (resultado.situacao === 'outraCliente') {
    html = `
      <section class="cartao">
        <h2 style="margin-top:0">Este link é de outra pessoa</h2>
        <p>Este celular já tem o acompanhamento de <strong>${esc(resultado.atual.cliente.nome)}</strong>. O link recebido é de <strong>${esc(novo.cliente.nome)}</strong>.</p>
        <p class="rotulo">Se trocar, todos os registros de ${esc(resultado.atual.cliente.primeiroNome)} neste celular serão apagados.</p>
        <button type="button" class="botao secundario" id="trocar">Trocar mesmo assim</button>
        <a class="botao" href="#/agora" style="margin-top:10px">Manter como está</a>
      </section>`;
  } else {
    aplicar(novo);
    manterLembretesEmDia(novo);
    html = resultado.situacao === 'instalado'
      ? `<section class="cartao suave">
           <h1>Bem-vinda, ${esc(novo.cliente.primeiroNome)}</h1>
           <p>O seu acompanhamento com <strong>Rosemary Sampaio</strong> está pronto neste aparelho.</p>
         </section>`
      : `<section class="cartao suave">
           <h1>Seu acompanhamento foi atualizado</h1>
           ${resultado.situacao === 'igual' ? '<p>Você já está com a versão mais recente.</p>' : listaMudancas(resultado)}
           <p class="rotulo">Todo o seu histórico continua aqui: quadro, diário, flores e selos.</p>
         </section>
         ${resultado.lembretesMudaram ? '<section class="cartao" style="border:2px solid var(--marca)"><h3 style="margin-top:0">Seus horários mudaram</h3><p>Toque em “Ativar lembretes” na tela inicial para atualizar os avisos do celular.</p></section>' : ''}`;
    if (iPhoneNoSafari) html += passosIPhone(codigo, resultado.situacao === 'instalado');
    if (androidNoNavegador) {
      html += `
        <section class="cartao" style="border:2px solid var(--marca)">
          <h2 style="margin-top:0">Tem o app Rose Ayurveda no celular?</h2>
          <p>Toque para levar ${resultado.situacao === 'instalado' ? 'o seu acompanhamento' : 'a atualização'} para o app.</p>
          <a class="botao" href="${esc(linkParaOApp(codigo))}">Abrir no app</a>
          <p class="rotulo">Ainda não tem o app? Peça à Rose o arquivo de instalação.</p>
        </section>`;
    }
    html += `<a class="botao${iPhoneNoSafari ? ' secundario' : ''}" href="#/agora" style="margin-top:10px">${iPhoneNoSafari ? 'Ver aqui mesmo' : 'Começar'}</a>`;
  }
  raiz.innerHTML = html + avisoLegal();
  ultimo.html = raiz.innerHTML;
  ultimo.ligar = () => ligarBotoes(raiz, resultado, novo, redesenhar);
  ultimo.ligar();
  terminar();
}

function ligarBotoes(raiz, resultado, novo, redesenhar) {
  raiz.querySelector('[data-copiar]')?.addEventListener('click', async evento => {
    const aviso = raiz.querySelector('#aviso-copia');
    try {
      await navigator.clipboard.writeText(evento.currentTarget.dataset.copiar);
      aviso.textContent = 'Copiado. Agora abra o app e toque em “Colar”.';
    } catch {
      aviso.textContent = 'Não foi possível copiar automaticamente. Volte ao WhatsApp, toque e segure o link, e escolha Copiar.';
    }
  });
  raiz.querySelector('#trocar')?.addEventListener('click', () => {
    if (!confirm(`Apagar os registros de ${resultado.atual.cliente.primeiroNome} e abrir o acompanhamento de ${novo.cliente.primeiroNome}?`)) return;
    store.apagarRegistros();
    aplicar(novo);
    location.hash = '#/agora';
    redesenhar();
  });
}

// "Colar meu acompanhamento": lê o link copiado (ou o texto colado) e abre a tela de receber.
export async function colarDoCelular() {
  try {
    const texto = await navigator.clipboard.readText();
    if (texto && texto.includes('R1.')) {
      location.hash = `#/receber/${texto.slice(texto.indexOf('R1.')).trim()}`;
      return true;
    }
  } catch { /* o iPhone pode não permitir; a cliente cola à mão */ }
  return false;
}

export function caixaColar(rotuloBotao) {
  return `
    <button type="button" class="botao" id="colar">${esc(rotuloBotao)}</button>
    <div id="colar-manual" style="display:none;margin-top:10px">
      <label class="rotulo" for="texto-colado">Se nada acontecer, toque e segure dentro da caixa abaixo e escolha <strong>Colar</strong>:</label>
      <textarea id="texto-colado" rows="3"></textarea>
      <button type="button" class="botao" id="usar-colado" style="margin-top:8px">Abrir</button>
    </div>`;
}

// No iPhone, ler o que foi copiado mostra uma bolhinha "Colar" que pode passar despercebida
// (e o pedido fica esperando para sempre). Por isso a caixinha de colar à mão aparece já
// no primeiro toque, e o que for colado nela é aberto sozinho.
export function ligarColar(raiz) {
  const caixa = raiz.querySelector('#colar-manual');
  const campo = raiz.querySelector('#texto-colado');
  const abrir = () => {
    const texto = campo.value;
    if (texto.includes('R1.')) {
      location.hash = `#/receber/${texto.slice(texto.indexOf('R1.')).trim()}`;
      return true;
    }
    return false;
  };
  raiz.querySelector('#colar')?.addEventListener('click', () => {
    caixa.style.display = 'block';
    colarDoCelular();
  });
  campo?.addEventListener('input', abrir);
  raiz.querySelector('#usar-colado')?.addEventListener('click', () => {
    if (!abrir()) campo.placeholder = 'Cole aqui o link que a Rose mandou pelo WhatsApp.';
  });
}
