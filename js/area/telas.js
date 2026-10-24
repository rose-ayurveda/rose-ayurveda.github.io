// Telas da área da Rose (protegida por senha): clientes, editor, envio e cópia de segurança.
import { esc, avisoLegal, icones } from '../ui.js';
import { chaveDoDia } from '../datas.js';
import * as area from './dados-area.js';
import { SECOES } from './secoes.js';
import { campos, ligarFormulario } from './formulario.js';
import { TIPOS, criarModelo } from './modelos.js';
import { codificar, linkDoConteudo } from '../codigo.js';
import { mudancas } from '../atualizacao.js';
import { salvarArquivo, abrirArquivo } from '../arquivos.js';
import { ehAppAndroid } from '../nativo.js';

const MODO_TESTE = ['localhost', '127.0.0.1'].includes(location.hostname) && !ehAppAndroid();
const dataBr = iso => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');

// ---------- Entrar ----------

function telaEntrar() {
  const primeira = !area.temSenha();
  return `
    <section class="cartao" style="max-width:420px;margin:24px auto">
      <h1>Área da Rose</h1>
      <p class="rotulo">${primeira
        ? 'Primeiro acesso neste aparelho: crie uma senha. Ela protege a sua área só neste aparelho.'
        : 'Digite a sua senha.'}</p>
      <form id="form-senha">
        <label class="campo"><span class="rotulo-campo">Senha</span><input type="password" name="senha" autocomplete="${primeira ? 'new-password' : 'current-password'}" minlength="6" required></label>
        ${primeira ? '<label class="campo"><span class="rotulo-campo">Repita a senha</span><input type="password" name="repetir" autocomplete="new-password" minlength="6" required></label>' : ''}
        <p class="rotulo" id="erro-senha" role="alert" style="color:var(--pitta-texto)"></p>
        <button class="botao" type="submit">${primeira ? 'Criar senha e entrar' : 'Entrar'}</button>
      </form>
      ${primeira ? '<p class="rotulo" style="margin-top:12px">Guarde a senha num lugar seguro. Se esquecer, será preciso restaurar uma cópia de segurança num aparelho novo.</p>' : ''}
    </section>`;
}

function ligarEntrar(raiz, redesenhar) {
  raiz.querySelector('#form-senha').addEventListener('submit', async evento => {
    evento.preventDefault();
    const dados = new FormData(evento.target);
    const erro = raiz.querySelector('#erro-senha');
    if (!area.temSenha()) {
      if (dados.get('senha') !== dados.get('repetir')) { erro.textContent = 'As duas senhas não são iguais.'; return; }
      await area.criarSenha(dados.get('senha'));
    } else if (!(await area.conferirSenha(dados.get('senha')))) {
      erro.textContent = 'Senha incorreta.';
      return;
    }
    redesenhar();
  });
}

// ---------- Lista de clientes ----------

function telaClientes() {
  const lista = area.clientes();
  return `
    <h1>Suas clientes</h1>
    <a class="botao" href="#/rose/nova">+ Nova cliente</a>
    <div style="margin-top:14px">
      ${lista.length ? lista.map(c => {
        const pendente = c.enviado && JSON.stringify(c.enviado) !== JSON.stringify(c.conteudo);
        return `
          <section class="cartao">
            <h2 style="margin:0">${esc(c.conteudo.cliente.nome)}</h2>
            <p class="rotulo">${esc(c.conteudo.doshas?.resultado || '')} · ${c.enviado ? `versão ${c.enviado.versao} enviada em ${dataBr(c.envios?.at(-1)?.data)}` : 'ainda não enviada'}</p>
            ${pendente || !c.enviado ? `<p class="aviso-pendente">${c.enviado ? 'Há alterações ainda não enviadas.' : 'Pronta para enviar quando quiser.'}</p>` : ''}
            <div class="grade-acoes">
              <a class="botao secundario" href="#/rose/cliente/${c.id}">Editar</a>
              <a class="botao secundario" href="#/rose/ver/${c.id}">Ver como a cliente</a>
              <a class="botao" href="#/rose/enviar/${c.id}">Enviar</a>
            </div>
          </section>`;
      }).join('') : '<p class="rotulo">Nenhuma cliente ainda.</p>'}
    </div>
    <section class="cartao suave">
      <h3 style="margin-top:0">Cópia de segurança da sua área</h3>
      <p class="rotulo">Os cadastros ficam só neste aparelho. Salve uma cópia de vez em quando, e use-a para levar a sua área para outro aparelho (celular ↔ computador).</p>
      <button type="button" class="botao" id="salvar-area">Salvar cópia de segurança</button>
      <button type="button" class="botao secundario" id="restaurar-area">Restaurar uma cópia</button>
      ${MODO_TESTE ? '<button type="button" class="botao secundario" id="area-teste">Carregar área de teste (Roberta)</button>' : ''}
      <p class="rotulo" id="aviso-area" role="status"></p>
    </section>
    <button type="button" class="botao secundario" id="sair-area">Sair da área</button>`;
}

function ligarClientes(raiz, redesenhar) {
  const aviso = raiz.querySelector('#aviso-area');
  raiz.querySelector('#salvar-area').addEventListener('click', async () => {
    await salvarArquivo(JSON.stringify(area.copiaDaArea()), `copia-area-rose-${chaveDoDia()}.json`);
    aviso.textContent = 'Cópia salva.';
  });
  raiz.querySelector('#restaurar-area').addEventListener('click', async () => {
    const texto = await abrirArquivo();
    if (!texto) return;
    try {
      const copia = JSON.parse(texto);
      if (!confirm('Restaurar esta cópia? As clientes deste aparelho serão substituídas pelas da cópia.')) return;
      area.restaurarArea(copia);
      redesenhar();
    } catch {
      aviso.textContent = 'Este arquivo não é uma cópia de segurança da área.';
    }
  });
  raiz.querySelector('#area-teste')?.addEventListener('click', async () => {
    const copia = await (await fetch('/dados-privados/area-inicial.json', { cache: 'no-store' })).json();
    area.restaurarArea(copia);
    redesenhar();
  });
  raiz.querySelector('#sair-area').addEventListener('click', () => {
    area.fecharArea();
    location.hash = '#/agora';
  });
}

// ---------- Nova cliente ----------

function telaNova() {
  return `
    <a href="#/rose" class="voltar">${icones.voltar}<span>Clientes</span></a>
    <h1>Nova cliente</h1>
    <form id="form-nova" class="cartao">
      <label class="campo"><span class="rotulo-campo">Nome completo</span><input name="nome" required></label>
      <label class="campo"><span class="rotulo-campo">Como chamar no app</span><input name="primeiroNome" required></label>
      <label class="campo campo-curto"><span class="rotulo-campo">Data da consulta</span><input type="date" name="dataConsulta" value="${chaveDoDia()}"></label>
      <label class="campo"><span class="rotulo-campo">Começar do modelo</span>
        <select name="modelo">${TIPOS.map(t => `<option value="${t.valor}">${t.nome}</option>`).join('')}</select>
      </label>
      <p class="rotulo">O modelo traz o conteúdo inicial daquele dosha. Depois você personaliza tudo: o teste de doshas, o momento atual, a rotina, o Quadro…</p>
      <button class="botao" type="submit">Criar e começar a editar</button>
    </form>
    <section class="cartao suave">
      <h3 style="margin-top:0">Ou adicionar de um arquivo</h3>
      <p class="rotulo">Use quando o acompanhamento já foi preparado num arquivo (por exemplo, a partir do Mapa Ayurvédico da cliente). As outras clientes continuam como estão.</p>
      <button type="button" class="botao secundario" id="importar-cliente">Adicionar de um arquivo</button>
      <p class="rotulo" id="aviso-importar" role="status"></p>
    </section>`;
}

function ligarNova(raiz) {
  raiz.querySelector('#form-nova').addEventListener('submit', evento => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.target));
    const id = area.idNovo(dados.nome);
    const conteudo = criarModelo(dados.modelo, { id, nome: dados.nome, primeiroNome: dados.primeiroNome, dataConsulta: dados.dataConsulta || null });
    area.salvarCliente({ id, conteudo, enviado: null, envios: [], criadaEm: new Date().toISOString() });
    location.hash = `#/rose/cliente/${id}`;
  });
  raiz.querySelector('#importar-cliente').addEventListener('click', async () => {
    const aviso = raiz.querySelector('#aviso-importar');
    const texto = await abrirArquivo();
    if (!texto) return;
    let arquivo;
    try { arquivo = JSON.parse(texto); } catch { arquivo = null; }
    const conteudo = arquivo?.tipo === 'rose-ayurveda-cliente' ? arquivo.conteudo : null;
    if (!conteudo?.cliente?.nome || !conteudo.mapa) {
      aviso.textContent = 'Este arquivo não é o acompanhamento de uma cliente.';
      return;
    }
    const id = area.idNovo(conteudo.cliente.nome);
    conteudo.cliente.id = id;
    area.salvarCliente({ id, conteudo, enviado: null, envios: [], criadaEm: new Date().toISOString() });
    location.hash = `#/rose/cliente/${id}`;
  });
}

// ---------- Editor ----------

let salvarDepois = null;

function telaEditor(registro, secaoId, aberto) {
  const secao = SECOES.find(s => s.id === secaoId) || SECOES[0];
  const contexto = { conteudo: registro.conteudo, aberto };
  return `
    <a href="#/rose" class="voltar">${icones.voltar}<span>Clientes</span></a>
    <h1>${esc(registro.conteudo.cliente.nome)}</h1>
    <label class="campo"><span class="rotulo-campo">Parte do conteúdo</span>
      <select id="trocar-secao">${SECOES.map(s => `<option value="${s.id}"${s.id === secao.id ? ' selected' : ''}>${s.nome}</option>`).join('')}</select>
    </label>
    <p class="rotulo" id="estado-salvo" role="status">Tudo salvo neste aparelho.</p>
    <form class="editor" id="editor" onsubmit="return false">${campos(secao.campos, '', contexto)}</form>
    <div class="grade-acoes" style="margin-top:16px">
      <a class="botao secundario" href="#/rose/ver/${registro.id}">Ver como a cliente</a>
      <a class="botao" href="#/rose/enviar/${registro.id}">Enviar para a cliente</a>
    </div>
    <details class="detalhe-pratica" style="margin-top:20px">
      <summary>Remover esta cliente da área</summary>
      <p class="rotulo">Remove o cadastro deste aparelho. Não apaga nada do celular da cliente.</p>
      <button type="button" class="botao secundario" id="remover-cliente">Remover ${esc(registro.conteudo.cliente.primeiroNome)}</button>
    </details>`;
}

function ligarEditor(raiz, registro, secaoId, redesenhar) {
  const secao = SECOES.find(s => s.id === secaoId) || SECOES[0];
  const contexto = { conteudo: registro.conteudo };
  const estado = raiz.querySelector('#estado-salvo');
  raiz.querySelector('#trocar-secao').addEventListener('change', e => { location.hash = `#/rose/cliente/${registro.id}?secao=${e.target.value}`; });
  ligarFormulario(raiz.querySelector('#editor'), secao.campos, contexto, {
    aoMudar() {
      estado.textContent = 'Salvando…';
      clearTimeout(salvarDepois);
      salvarDepois = setTimeout(() => {
        area.salvarCliente(registro);
        estado.textContent = 'Tudo salvo neste aparelho.';
      }, 400);
    },
    redesenhar(aberto) {
      area.salvarCliente(registro);
      redesenhar({ manterRolagem: true, aberto });
    },
  });
  raiz.querySelector('#remover-cliente').addEventListener('click', () => {
    if (!confirm(`Remover ${registro.conteudo.cliente.nome} da sua área neste aparelho?`)) return;
    area.removerCliente(registro.id);
    location.hash = '#/rose';
  });
}

// ---------- Enviar ----------

function telaEnviar(registro) {
  const enviado = registro.enviado;
  const lista = enviado ? mudancas(enviado, registro.conteudo) : [];
  const igual = enviado && JSON.stringify(enviado) === JSON.stringify(registro.conteudo);
  return `
    <a href="#/rose" class="voltar">${icones.voltar}<span>Clientes</span></a>
    <h1>Enviar para ${esc(registro.conteudo.cliente.primeiroNome)}</h1>
    <section class="cartao">
      ${!enviado
        ? '<p>Primeiro envio: o link instala o acompanhamento completo no celular da cliente.</p>'
        : igual
          ? `<p>A versão ${enviado.versao} já foi enviada e não há alterações desde então. Você pode reenviar o mesmo link se a cliente precisar.</p>`
          : `<p>Atualização (versão ${enviado.versao + 1}). O que a cliente vai ver como novidade:</p>
             ${lista.length ? `<ul class="lista">${lista.map(m => `<li>${esc(m)}</li>`).join('')}</ul>` : '<p class="rotulo">Ajustes de texto.</p>'}
             <p class="rotulo">O histórico dela (quadro, diário, flores, selos) continua no celular dela.</p>`}
      <button type="button" class="botao" id="gerar-link">${igual ? 'Gerar o link de novo' : 'Gerar o link'}</button>
    </section>
    <section class="cartao" id="resultado-envio" style="display:none">
      <h3 style="margin-top:0">Link pronto</h3>
      <p class="rotulo">Mande pelo WhatsApp. O conteúdo vai dentro do próprio link e não fica guardado em nenhum site.</p>
      <textarea id="texto-envio" rows="5" readonly></textarea>
      <div class="grade-acoes" style="margin-top:10px">
        <button type="button" class="botao" id="compartilhar">Compartilhar</button>
        <button type="button" class="botao secundario" id="copiar-envio">Copiar</button>
      </div>
      <p class="rotulo" id="aviso-envio" role="status"></p>
    </section>`;
}

function ligarEnviar(raiz, registro) {
  const caixa = raiz.querySelector('#texto-envio');
  const aviso = raiz.querySelector('#aviso-envio');
  raiz.querySelector('#gerar-link').addEventListener('click', async () => {
    const enviado = registro.enviado;
    const mudou = !enviado || JSON.stringify(enviado) !== JSON.stringify(registro.conteudo);
    if (mudou) {
      registro.conteudo.versao = (enviado?.versao || 0) + 1;
      registro.conteudo.atualizadoEm = chaveDoDia();
      registro.enviado = structuredClone(registro.conteudo);
      registro.envios = [...(registro.envios || []), { versao: registro.conteudo.versao, data: new Date().toISOString() }];
      area.salvarCliente(registro);
    }
    const link = linkDoConteudo(await codificar(registro.enviado));
    const primeiro = registro.enviado.versao === 1;
    caixa.value = primeiro
      ? `Oi, ${registro.conteudo.cliente.primeiroNome}! 🌸\nAqui está o app do seu acompanhamento ayurvédico.\n\nToque no link abaixo (no iPhone ele abre no Safari; no Android, no Chrome) e siga os passos que aparecem.\n\n${link}`
      : `Oi, ${registro.conteudo.cliente.primeiroNome}! 🌸\nAtualizei o seu acompanhamento. Toque no link abaixo para receber:\n\n${link}`;
    raiz.querySelector('#resultado-envio').style.display = 'block';
    aviso.textContent = `Versão ${registro.enviado.versao} · link com ${Math.round(link.length / 1000)} mil caracteres.`;
  });
  raiz.querySelector('#copiar-envio').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(caixa.value); aviso.textContent = 'Copiado. Cole na conversa do WhatsApp com a cliente.'; } catch { caixa.select(); }
  });
  // Compartilhar abre a lista do próprio aparelho (WhatsApp etc.). Não usamos o site wa.me,
  // porque ele receberia o conteúdo do link.
  raiz.querySelector('#compartilhar').addEventListener('click', async () => {
    if (navigator.share) {
      try { await navigator.share({ text: caixa.value }); } catch { /* cancelado */ }
    } else {
      aviso.textContent = 'Este aparelho não tem “Compartilhar”. Use Copiar e cole no WhatsApp.';
    }
  });
}

// ---------- Roteador da área ----------

export function desenharArea(tela, rota, parametros, redesenhar, opcoes = {}) {
  if (!area.areaAberta()) {
    tela.innerHTML = telaEntrar();
    ligarEntrar(tela, redesenhar);
    return;
  }
  const [, pagina, id] = rota.split('/');
  const registro = id ? area.cliente(id) : null;
  if (pagina === 'nova') {
    tela.innerHTML = telaNova();
    ligarNova(tela);
  } else if (pagina === 'cliente' && registro) {
    tela.innerHTML = telaEditor(registro, parametros.get('secao'), opcoes.aberto);
    ligarEditor(tela, registro, parametros.get('secao'), redesenhar);
  } else if (pagina === 'enviar' && registro) {
    tela.innerHTML = telaEnviar(registro);
    ligarEnviar(tela, registro);
  } else {
    tela.innerHTML = telaClientes();
    ligarClientes(tela, redesenhar);
  }
  tela.insertAdjacentHTML('beforeend', avisoLegal());
}
