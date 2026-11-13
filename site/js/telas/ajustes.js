// Ajustes da cliente: lembretes, tamanho da letra, modo escuro, atualização,
// cópia de segurança e apagar os dados.
import { avisoLegal, VERSAO_APP } from '../ui.js';
import { store } from '../store.js';
import { chaveDoDia } from '../datas.js';
import { cartaoLembretes } from './praticas.js';
import { caixaColar, ligarColar } from './receber.js';
import { salvarArquivo, abrirArquivo } from '../arquivos.js';

const ESCALAS = [
  { valor: 0.9, nome: 'Menor' },
  { valor: 1, nome: 'Normal' },
  { valor: 1.15, nome: 'Maior' },
];
const TEMAS = [
  { valor: 'auto', nome: 'Automático' },
  { valor: 'claro', nome: 'Claro' },
  { valor: 'escuro', nome: 'Escuro' },
];

export function telaAjustes(ajustes, conteudo) {
  const botoes = (lista, atual, grupo) => lista.map(o =>
    `<button type="button" data-grupo="${grupo}" data-valor="${o.valor}" aria-pressed="${String(o.valor) === String(atual)}">${o.nome}</button>`).join('');

  return `
    <h1>Ajustes</h1>
    ${conteudo ? cartaoLembretes(conteudo) : ''}
    <section class="cartao">
      <h3 style="margin-top:0">Tamanho da letra</h3>
      <div class="opcoes" role="group" aria-label="Tamanho da letra">${botoes(ESCALAS, ajustes.escala, 'escala')}</div>
    </section>
    <section class="cartao">
      <h3 style="margin-top:0">Aparência</h3>
      <p class="rotulo">O modo escuro é mais confortável para os lembretes da noite.</p>
      <div class="opcoes" role="group" aria-label="Aparência">${botoes(TEMAS, ajustes.tema, 'tema')}</div>
    </section>
    ${conteudo ? `
      <section class="cartao">
        <h3 style="margin-top:0">Atualização da Rose</h3>
        <p class="rotulo">Recebeu um novo link da Rose? Copie o link no WhatsApp e toque aqui.</p>
        ${caixaColar('Colar atualização')}
      </section>` : ''}
    <section class="cartao suave">
      <h3 style="margin-top:0">Seus registros ficam só no seu celular</h3>
      <p class="texto-longo">Nada do que você marca no app é enviado para ninguém. Por isso, <strong>se apagar o app ou trocar de celular, os registros se perdem</strong>. Para não perder, salve de vez em quando uma cópia de segurança — por exemplo, no iCloud Drive ou no Google Drive.</p>
      <button type="button" class="botao" id="salvar-copia">Salvar cópia de segurança</button>
      <button type="button" class="botao secundario" id="restaurar-copia">Restaurar uma cópia</button>
      <p class="rotulo" id="aviso-copia-cliente" role="status" style="margin-top:8px"></p>
    </section>
    ${conteudo ? `
      <section class="cartao">
        <h3 style="margin-top:0">Apagar meus dados</h3>
        <p class="rotulo">Apaga do celular o seu acompanhamento e todos os seus registros.</p>
        <button type="button" class="botao secundario" id="apagar-tudo">Apagar todos os meus dados</button>
      </section>` : ''}
    <p class="rotulo" style="text-align:center">Versão do app: ${VERSAO_APP}</p>
    ${avisoLegal()}
  `;
}

export function ligarAjustes(raiz, ajustes, aoMudar) {
  raiz.querySelectorAll('button[data-grupo]').forEach(b => {
    b.addEventListener('click', () => {
      const grupo = b.dataset.grupo;
      const valor = grupo === 'escala' ? Number(b.dataset.valor) : b.dataset.valor;
      aoMudar({ ...ajustes, [grupo]: valor });
    });
  });
  ligarColar(raiz);

  const aviso = raiz.querySelector('#aviso-copia-cliente');
  raiz.querySelector('#salvar-copia').addEventListener('click', async () => {
    const conteudo = store.conteudo();
    const nome = `copia-rose-ayurveda-${conteudo?.cliente.primeiroNome.toLowerCase() || 'app'}-${chaveDoDia()}.json`;
    await salvarArquivo(JSON.stringify(store.copiaDaCliente()), nome);
    store.salvarAjustes({ ...store.ajustes(), ultimaCopia: chaveDoDia() });
    aviso.textContent = 'Cópia salva.';
  });
  raiz.querySelector('#restaurar-copia').addEventListener('click', async () => {
    const texto = await abrirArquivo();
    if (!texto) return;
    try {
      const copia = JSON.parse(texto);
      if (!confirm('Restaurar esta cópia? O que está agora no app será substituído pelo que está na cópia.')) return;
      store.restaurarCliente(copia);
      location.hash = '#/agora';
      location.reload();
    } catch {
      aviso.textContent = 'Este arquivo não é uma cópia de segurança do app.';
    }
  });
  raiz.querySelector('#apagar-tudo')?.addEventListener('click', () => {
    if (!confirm('Apagar o seu acompanhamento e todos os seus registros deste celular? Isso não pode ser desfeito.')) return;
    store.apagarTudoDaCliente();
    location.hash = '#/agora';
    location.reload();
  });
}
