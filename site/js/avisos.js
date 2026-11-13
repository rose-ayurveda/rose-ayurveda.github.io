// iPhone (app na Tela de Início): lembretes como notificações do próprio app.
// A Apple só deixa esse tipo de app mostrar notificação quando ela chega de um servidor,
// por isso existe o servidor de avisos (servidor-avisos/, no Cloudflare gratuito).
// Ele recebe só o endereço de aviso deste celular (sem nome), o fuso e os horários e
// textos dos lembretes. Nada do mapa, do diário, dos registros ou do nome da cliente.
import { store } from './store.js';
import { assinaturaDosLembretes } from './lembretes.js';
import { SERVIDOR as SERVIDOR_AVISOS } from './servidor.js';

export function podeUsarAvisos() {
  const instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return instalado && 'PushManager' in window && 'Notification' in window && Boolean(navigator.serviceWorker);
}

function deBase64Url(texto) {
  const b64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), c => c.charCodeAt(0));
}

function listaDeAvisos(conteudo) {
  const avisos = (conteudo.lembretes || []).map(l => ({ hora: l.hora, titulo: `🌿 ${l.titulo}`, texto: l.texto }));
  // Véspera do próximo encontro, às 19h (aviso de um dia só).
  const encontro = conteudo.cliente.proximoEncontro;
  if (encontro) {
    const [a, m, d] = encontro.split('-').map(Number);
    const vespera = new Date(Date.UTC(a, m - 1, d - 1)).toISOString().slice(0, 10);
    avisos.push({ hora: '19:00', data: vespera, titulo: '🌿 Amanhã é o seu encontro com a Rose', texto: 'Revise as observações do seu diário antes do encontro de amanhã.' });
  }
  return avisos;
}

async function inscricaoDoCelular() {
  const registro = await navigator.serviceWorker.ready;
  const atual = await registro.pushManager.getSubscription();
  if (atual) return atual;
  const { chave } = await (await fetch(`${SERVIDOR_AVISOS}/chave`)).json();
  return registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: deBase64Url(chave) });
}

async function enviarAoServidor(conteudo, confirmar) {
  const inscricao = await inscricaoDoCelular();
  const avisos = listaDeAvisos(conteudo);
  const resposta = await fetch(`${SERVIDOR_AVISOS}/inscrever`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inscricao: inscricao.toJSON(), fuso: conteudo.cliente.fusoHorario || 'America/Sao_Paulo', avisos, confirmar }),
  });
  if (!resposta.ok) throw new Error('servidor');
  store.salvarAjustes({
    ...store.ajustes(),
    lembretes: assinaturaDosLembretes(conteudo),
    lembretesPendente: null,
    lembretesPor: 'avisos',
    avisosEnviados: JSON.stringify(avisos),
  });
}

// Chamado direto pelo toque em "Ativar lembretes" (o iPhone só pergunta nesse momento).
// Devolve 'ok', 'negado' (a cliente não permitiu) ou 'erro' (sem internet, por exemplo).
export async function ativarAvisos(conteudo) {
  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') return 'negado';
  try {
    await enviarAoServidor(conteudo, true);
    return 'ok';
  } catch {
    return 'erro';
  }
}

export async function desativarAvisos() {
  try {
    const registro = await navigator.serviceWorker.ready;
    const inscricao = await registro.pushManager.getSubscription();
    if (inscricao) {
      await fetch(`${SERVIDOR_AVISOS}/cancelar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: inscricao.endpoint }),
      });
      await inscricao.unsubscribe();
    }
  } catch { /* sem internet: o servidor apaga sozinho quando o celular recusar os avisos */ }
  store.salvarAjustes({ ...store.ajustes(), lembretes: null, lembretesPor: null, avisosEnviados: null });
}

// Quando chega uma atualização da Rose com horários ou textos novos, os avisos
// se atualizam sozinhos (se a cliente já tinha ativado).
export async function manterAvisosEmDia(conteudo) {
  const ajustes = store.ajustes();
  if (ajustes.lembretesPor !== 'avisos' || !podeUsarAvisos() || Notification.permission !== 'granted') return;
  if (ajustes.avisosEnviados === JSON.stringify(listaDeAvisos(conteudo))) return;
  try { await enviarAoServidor(conteudo, false); } catch { /* tenta de novo na próxima abertura */ }
}
