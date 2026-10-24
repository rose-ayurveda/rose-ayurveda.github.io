// Versão Android (app instalado): lembretes do próprio celular, que avisam mesmo com
// o app fechado, e abertura do app pelo link da Rose. No iPhone e no navegador,
// nada disto é usado (lá os lembretes vão para o calendário).
import { assinaturaDosLembretes } from './lembretes.js';
import { store } from './store.js';

const PACOTE = 'br.com.roseayurveda.app';
const ESQUEMA = 'roseayurveda';

export function ehAppAndroid() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

// No app Android, a tela vai até a borda: o visual ganha um respiro para a barra de gestos.
if (ehAppAndroid()) document.documentElement.classList.add('app-android');

function plugin(nome) {
  return window.Capacitor?.Plugins?.[nome];
}

// Número fixo para cada lembrete (o Android identifica avisos por número).
function numero(texto) {
  let h = 0;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % 2_000_000_000;
}

export async function agendarLembretes(conteudo) {
  const avisos = plugin('LocalNotifications');
  if (!avisos) return false;
  const permissao = await avisos.requestPermissions();
  if (permissao.display !== 'granted') return false;
  // O horário exato já vem permitido pelo próprio app (sem tela extra para a cliente).

  const pendentes = await avisos.getPending();
  if (pendentes.notifications.length) await avisos.cancel({ notifications: pendentes.notifications.map(n => ({ id: n.id })) });

  const notifications = (conteudo.lembretes || []).map(l => {
    const [hour, minute] = l.hora.split(':').map(Number);
    return {
      id: numero(`${conteudo.cliente.id}-${l.id}`),
      title: `🌿 ${l.titulo}`,
      body: l.texto,
      schedule: { on: { hour, minute }, allowWhileIdle: true },
    };
  });
  const encontro = conteudo.cliente.proximoEncontro;
  if (encontro) {
    const [a, m, d] = encontro.split('-').map(Number);
    const vespera = new Date(a, m - 1, d - 1, 19, 0);
    if (vespera > new Date()) {
      notifications.push({
        id: numero(`${conteudo.cliente.id}-encontro-${encontro}`),
        title: '🌿 Amanhã é o seu encontro com a Rose',
        body: 'Revise as observações do seu diário antes do encontro de amanhã.',
        schedule: { at: vespera, allowWhileIdle: true },
      });
    }
  }
  await avisos.schedule({ notifications });
  store.salvarAjustes({ ...store.ajustes(), lembretes: assinaturaDosLembretes(conteudo) });
  return true;
}

// No app Android, quando a Rose envia uma atualização com horários novos,
// os lembretes são reagendados sozinhos (se a cliente já tinha ativado).
export async function manterLembretesEmDia(conteudo) {
  if (!ehAppAndroid() || !conteudo) return;
  const ativados = store.ajustes().lembretes;
  if (ativados && ativados !== assinaturaDosLembretes(conteudo)) await agendarLembretes(conteudo);
}

// O link da Rose abre no navegador; daqui ele abre o app instalado, levando o conteúdo.
export function linkParaOApp(codigo) {
  const reserva = encodeURIComponent(location.href);
  return `intent://receber/${codigo}#Intent;scheme=${ESQUEMA};package=${PACOTE};S.browser_fallback_url=${reserva};end`;
}

// Dentro do app: quando ele é aberto por um link "roseayurveda://receber/…".
export function escutarLinks() {
  const app = plugin('App');
  if (!app) return;
  app.addListener('appUrlOpen', ({ url }) => {
    const i = url.indexOf('receber/');
    if (i >= 0) location.hash = `#/${url.slice(i)}`;
  });
}
