// Áudios guiados: catálogo da biblioteca e o player.
// Os MP3 ficam guardados no celular e tocam sem internet e com a tela bloqueada.
import { esc } from './ui.js';

let catalogo = {};

export async function carregarCatalogo() {
  try {
    catalogo = await (await fetch('audios/catalogo.json')).json();
  } catch {
    catalogo = {};
  }
}

export function catalogoCompleto() {
  return catalogo;
}

export function audio(id) {
  return catalogo[id] ? { id, ...catalogo[id] } : null;
}

// Só os áudios que a Rose incluiu no conteúdo desta cliente.
export function audiosDaCliente(conteudo, ids = conteudo.audios || []) {
  const permitidos = new Set(conteudo.audios || []);
  return ids.filter(id => permitidos.has(id)).map(audio).filter(Boolean);
}

function duracao(segundos) {
  const m = Math.round(segundos / 60);
  return m <= 1 ? 'cerca de 1 min' : `cerca de ${m} min`;
}

export function playerHTML(a, { compacto = false } = {}) {
  return `
    <article class="cartao player" data-audio="${esc(a.id)}">
      <h3 style="margin:0">${esc(a.nome)}</h3>
      <p class="rotulo" style="margin:2px 0 8px">${esc(a.quando)} · ${duracao(a.segundos)}</p>
      <audio controls preload="none" src="${esc(a.arquivo)}"></audio>
      ${compacto ? '' : `
        <details class="detalhe-pratica">
          <summary>Ler o texto da prática</summary>
          ${a.transcricao.map(p => `<p>${esc(p)}</p>`).join('')}
        </details>`}
    </article>`;
}

// Mostra o nome da prática na tela bloqueada e garante um áudio por vez.
export function ligarPlayers(raiz) {
  const players = [...raiz.querySelectorAll('.player audio')];
  players.forEach(el => el.addEventListener('play', () => {
    players.filter(outro => outro !== el).forEach(outro => outro.pause());
    const a = audio(el.closest('[data-audio]').dataset.audio);
    if ('mediaSession' in navigator && a) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: a.nome,
        artist: 'Rose Ayurveda',
        artwork: [{ src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' }],
      });
    }
  }));
  return () => players.forEach(el => el.pause());
}
