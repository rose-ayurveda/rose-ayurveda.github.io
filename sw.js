// Guarda o app e os áudios no celular para funcionar sem internet.
// Ao publicar uma nova versão, aumente o número abaixo E o de VERSAO_APP em js/ui.js.
const VERSAO = 'rose-v13';
const ARQUIVOS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/main.js',
  'js/store.js',
  'js/ui.js',
  'js/lotus.js',
  'js/relogio.js',
  'js/datas.js',
  'js/quadro.js',
  'js/selos.js',
  'js/rotina.js',
  'js/lembretes.js',
  'js/cronometro.js',
  'js/audios.js',
  'js/analise.js',
  'js/graficos.js',
  'js/pdf.js',
  'js/relatorio.js',
  'js/mensagens.js',
  'js/codigo.js',
  'js/nativo.js',
  'js/avisos.js',
  'js/atualizacao.js',
  'js/arquivos.js',
  'js/area/dados-area.js',
  'js/area/formulario.js',
  'js/area/secoes.js',
  'js/area/modelos.js',
  'js/area/padroes.js',
  'js/area/telas.js',
  'js/telas/mensagens.js',
  'js/telas/receber.js',
  'js/telas/agora.js',
  'js/telas/quadro.js',
  'js/telas/jardim.js',
  'js/telas/conquistas.js',
  'js/telas/praticas.js',
  'js/telas/perguntas.js',
  'js/telas/checkin.js',
  'js/telas/diario.js',
  'js/telas/apoio.js',
  'js/telas/evolucao.js',
  'js/telas/mapa.js',
  'js/telas/ajustes.js',
  'js/telas/boas-vindas.js',
  'icones/icone.svg',
  'icones/icone-192.png',
  'icones/icone-512.png',
  'icones/apple-touch-icon.png',
  'audios/catalogo.json',
  'audios/relaxamento-noite.mp3',
  'audios/nadi-shodhana.mp3',
  'audios/bhramari.mp3',
  'audios/abhyanga-completa.mp3',
  'audios/abhyanga-pes.mp3',
  'audios/pausa-do-doce.mp3',
  'audios/alimentacao-consciente.mp3',
  'audios/viparita-karani.mp3',
];

// "reload": busca cada arquivo direto do site, nunca uma cópia velha guardada pelo navegador
// (o GitHub Pages pede aos navegadores que guardem os arquivos por 10 minutos).
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(VERSAO)
      .then(c => c.addAll(ARQUIVOS.map(a => new Request(a, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// O iPhone pede os áudios em pedaços ("Range"); respondemos só o pedaço pedido.
async function respostaParcial(pedido, guardado) {
  const corpo = await guardado.arrayBuffer();
  const [, inicioTexto, fimTexto] = /bytes=(\d*)-(\d*)/.exec(pedido.headers.get('range')) || [];
  const inicio = Number(inicioTexto || 0);
  const fim = fimTexto ? Number(fimTexto) : corpo.byteLength - 1;
  return new Response(corpo.slice(inicio, fim + 1), {
    status: 206,
    headers: {
      'Content-Type': guardado.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${inicio}-${fim}/${corpo.byteLength}`,
      'Content-Length': String(fim - inicio + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

// Lembretes do iPhone: o servidor de avisos manda o título e o texto; aqui eles viram notificação.
self.addEventListener('push', evento => {
  let aviso = { titulo: '🌿 Rose Ayurveda', texto: 'Hora de cuidar de você.' };
  try { aviso = { ...aviso, ...evento.data.json() }; } catch { /* aviso sem texto */ }
  evento.waitUntil(self.registration.showNotification(aviso.titulo, { body: aviso.texto, icon: 'icones/icone-192.png' }));
});

// Tocar na notificação abre o app (ou traz para a frente, se já estiver aberto).
self.addEventListener('notificationclick', evento => {
  evento.notification.close();
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(janelas => (janelas[0] ? janelas[0].focus() : self.clients.openWindow('./#/agora'))),
  );
});

self.addEventListener('fetch', evento => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return;
  evento.respondWith(
    caches.match(pedido, { ignoreSearch: true }).then(guardado => {
      if (!guardado) return fetch(pedido);
      return pedido.headers.has('range') ? respostaParcial(pedido, guardado) : guardado;
    }),
  );
});
