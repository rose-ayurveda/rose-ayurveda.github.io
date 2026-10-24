// Início do app: escolhe a tela pelo endereço (#/agora, #/mapa…) e desenha.
import { store, ativarVisao } from './store.js';
import * as area from './area/dados-area.js';
import { desenharArea } from './area/telas.js';
import { telaReceber, ligarReceber } from './telas/receber.js';
import { ehAppAndroid, escutarLinks, manterLembretesEmDia } from './nativo.js';
import { icones } from './ui.js';
import { marcaLotus } from './lotus.js';
import { telaAgora, ligarAgora } from './telas/agora.js';
import { telaPraticas, ligarPraticas, ligarLembretes } from './telas/praticas.js';
import { telaMapa, ligarMapa } from './telas/mapa.js';
import { telaQuadro, ligarQuadro } from './telas/quadro.js';
import { conferirConquistas } from './quadro.js';
import { carregarCatalogo } from './audios.js';
import { conferirMomentos, conferirSemana } from './mensagens.js';
import { telaMensagens } from './telas/mensagens.js';
import { telaJardim } from './telas/jardim.js';
import { telaConquistas } from './telas/conquistas.js';
import { telaAjustes, ligarAjustes } from './telas/ajustes.js';
import { telaBoasVindas, ligarBoasVindas } from './telas/boas-vindas.js';
import { telaEvolucao, ligarEvolucao } from './telas/evolucao.js';
import { telaDiario, ligarDiario } from './telas/diario.js';
import { telaCheckin, ligarCheckin } from './telas/checkin.js';
import { telaApoio, ligarApoio } from './telas/apoio.js';

// No app Android o endereço interno também é "localhost": lá não há modo de teste.
const MODO_TESTE = ['localhost', '127.0.0.1'].includes(location.hostname) && !ehAppAndroid();

const MENU = [
  { rota: 'agora', nome: 'Agora', icone: icones.agora },
  { rota: 'quadro', nome: 'Quadro', icone: icones.quadro, inclui: ['jardim', 'conquistas', 'checkin'] },
  { rota: 'praticas', nome: 'Práticas', icone: icones.praticas },
  { rota: 'evolucao', nome: 'Evolução', icone: icones.evolucao, inclui: ['diario', 'mensagens'] },
  { rota: 'mapa', nome: 'Meu Mapa', icone: icones.mapa },
];

const tela = document.getElementById('tela');
const menu = document.getElementById('menu');

// "Ver como a cliente": a Rose navega pelo app com o conteúdo em edição, numa memória temporária.
const VISAO = 'rose.visao';
const visao = (() => {
  const id = sessionStorage.getItem(VISAO);
  const registro = id && area.areaAberta() ? area.cliente(id) : null;
  if (!registro) { sessionStorage.removeItem(VISAO); return null; }
  ativarVisao(structuredClone(registro.conteudo));
  return registro.conteudo;
})();
let relogioTimer = null;
let pararCronometros = () => {};

function aplicarAjustes(ajustes) {
  const raiz = document.documentElement;
  raiz.style.setProperty('--escala', ajustes.escala);
  const escuro = ajustes.tema === 'escuro'
    || (ajustes.tema === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.dataset.tema = escuro ? 'escuro' : 'claro';
  document.querySelector('meta[name="theme-color"]').content = escuro ? '#1C1F19' : '#F4EBDD';
}

function endereco() {
  const [rota, busca] = location.hash.replace(/^#\/?/, '').split('?');
  return { rota: rota || 'agora', parametros: new URLSearchParams(busca || '') };
}

function desenharMenu(rota, visivel) {
  menu.hidden = !visivel;
  menu.innerHTML = MENU.map(m => {
    const atual = m.rota === rota || (m.inclui || []).includes(rota);
    return `<a href="#/${m.rota}"${atual ? ' aria-current="page"' : ''}>${m.icone}<span>${m.nome}</span></a>`;
  }).join('');
}

function desenhar({ manterRolagem = false } = {}) {
  clearInterval(relogioTimer);
  pararCronometros();
  pararCronometros = () => {};
  const rolagem = window.scrollY;
  const { rota, parametros } = endereco();

  // Área da Rose (protegida por senha).
  if (rota.startsWith('rose/ver/') && area.areaAberta()) {
    const id = rota.split('/')[2];
    sessionStorage.setItem(VISAO, id);
    location.hash = '#/agora';
    location.reload();
    return;
  }
  if (rota === 'rose' || rota.startsWith('rose/')) {
    desenharMenu(rota, false);
    const redesenharArea = (opcoes = {}) => {
      const y = window.scrollY;
      const atual = endereco();
      desenharArea(tela, atual.rota, atual.parametros, redesenharArea, opcoes);
      window.scrollTo(0, opcoes.manterRolagem ? y : 0);
    };
    redesenharArea({ manterRolagem });
    return;
  }

  // Link enviado pela Rose: instalar ou atualizar o acompanhamento.
  if (rota.startsWith('receber/')) {
    desenharMenu(rota, false);
    tela.innerHTML = telaReceber();
    ligarReceber(tela, rota.slice('receber/'.length), desenhar);
    return;
  }

  const conteudo = store.conteudo();

  if (rota === 'ajustes') {
    const ajustes = store.ajustes();
    tela.innerHTML = telaAjustes(ajustes, conteudo);
    ligarAjustes(tela, ajustes, novos => {
      store.salvarAjustes(novos);
      aplicarAjustes(novos);
      desenhar({ manterRolagem: true });
    });
    if (conteudo) ligarLembretes(tela, conteudo, desenhar);
    desenharMenu(rota, Boolean(conteudo));
  } else if (!conteudo) {
    tela.innerHTML = telaBoasVindas({ modoTeste: MODO_TESTE });
    ligarBoasVindas(tela);
    desenharMenu(rota, false);
    document.getElementById('carregar-teste')?.addEventListener('click', carregarTeste);
  } else {
    desenharMenu(rota, true);
    conferirConquistas(conteudo);
    conferirMomentos(conteudo);
    conferirSemana(conteudo);
    switch (rota) {
      case 'mensagens': tela.innerHTML = telaMensagens(); break;
      case 'mapa':
        tela.innerHTML = telaMapa(conteudo);
        ligarMapa(tela, conteudo);
        break;
      case 'quadro':
        tela.innerHTML = telaQuadro(conteudo, parametros);
        ligarQuadro(tela, conteudo, parametros, desenhar);
        break;
      case 'jardim': tela.innerHTML = telaJardim(conteudo, parametros); break;
      case 'conquistas': tela.innerHTML = telaConquistas(conteudo); break;
      case 'praticas':
        tela.innerHTML = telaPraticas(conteudo, parametros);
        pararCronometros = ligarPraticas(tela, conteudo, desenhar);
        break;
      case 'evolucao':
        tela.innerHTML = telaEvolucao(conteudo, parametros);
        ligarEvolucao(tela, conteudo);
        break;
      case 'diario':
        tela.innerHTML = telaDiario(conteudo, parametros);
        ligarDiario(tela, conteudo, parametros);
        break;
      case 'checkin':
        tela.innerHTML = telaCheckin(conteudo, parametros);
        ligarCheckin(tela, conteudo, parametros);
        break;
      case 'apoio':
        tela.innerHTML = telaApoio(conteudo);
        pararCronometros = ligarApoio(tela, conteudo, desenhar);
        break;
      default:
        tela.innerHTML = telaAgora(conteudo);
        ligarAgora(tela, conteudo, desenhar);
        // O relógio ayurvédico se atualiza sozinho a cada minuto.
        relogioTimer = setInterval(() => desenhar({ manterRolagem: true }), 60_000);
    }
  }
  if (visao) {
    tela.insertAdjacentHTML('afterbegin', `
      <div class="faixa-visao" role="note">
        Você está vendo o app como <strong>${visao.cliente.primeiroNome}</strong> vai ver. Nada fica salvo.
        <button type="button" id="sair-visao">Voltar à área</button>
      </div>`);
    document.getElementById('sair-visao').addEventListener('click', () => {
      const id = sessionStorage.getItem(VISAO);
      sessionStorage.removeItem(VISAO);
      location.hash = `#/rose/cliente/${id}`;
      location.reload();
    });
  }
  window.scrollTo(0, manterRolagem ? rolagem : 0);
}

async function carregarTeste() {
  const resposta = await fetch('/dados-privados/roberta.json', { cache: 'no-store' });
  store.salvarConteudo(await resposta.json());
  location.hash = '#/agora';
  desenhar();
}

document.getElementById('marca').innerHTML = `${marcaLotus()}<span>Rosemary Sampaio</span>`;
document.getElementById('botao-ajustes').innerHTML = icones.ajustes;

aplicarAjustes(store.ajustes());
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => aplicarAjustes(store.ajustes()));
window.addEventListener('hashchange', () => desenhar());
carregarCatalogo().then(() => desenhar());

if (ehAppAndroid()) {
  escutarLinks();
  manterLembretesEmDia(store.conteudo());
}

// O app Android já traz os arquivos dentro dele; o guardião offline é só para o site.
if ('serviceWorker' in navigator && !MODO_TESTE && !ehAppAndroid()) {
  // Quando uma versão nova do app assume, a tela recarrega uma vez para usá-la.
  // (Na primeira visita não há versão anterior, então não recarrega.)
  const haviaVersao = Boolean(navigator.serviceWorker.controller);
  let recarregou = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (haviaVersao && !recarregou) { recarregou = true; location.reload(); }
  });
  navigator.serviceWorker.register('sw.js');
}
