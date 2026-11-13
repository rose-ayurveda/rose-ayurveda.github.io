// Tudo fica guardado só neste aparelho (localStorage). Nada é enviado.

const CHAVES = {
  conteudo: 'rose.conteudo',
  ajustes: 'rose.ajustes',
  registros: 'rose.registros',     // { "2026-10-21": { marcados: ["raspagem", …] } }
  conquistas: 'rose.conquistas',   // { "lua-inteira": "2026-11-20" }
  mensagens: 'rose.mensagens',     // [{ data, tipo, texto }]
  apoio: 'rose.apoio',             // usos do botão de apoio: [{ data, hora, resposta, escolha, desfecho }]
  apoioAtual: 'rose.apoioAtual',   // o momento de apoio em andamento (para continuar se sair da tela)
};

// "Ver como a cliente" (área da Rose): o app passa a ler e gravar numa memória
// temporária, com o conteúdo em edição e sem histórico. Nada do aparelho é tocado.
let memoria = null;

export function ativarVisao(conteudo) {
  memoria = new Map([[CHAVES.conteudo, JSON.stringify(conteudo)]]);
}

function ler(chave, padrao) {
  try {
    const bruto = memoria ? memoria.get(chave) : localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave, valor) {
  try {
    if (memoria) memoria.set(chave, JSON.stringify(valor));
    else localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

function remover(chave) {
  if (memoria) memoria.delete(chave); else localStorage.removeItem(chave);
}

export const AJUSTES_PADRAO = { tema: 'auto', escala: 1 };

export const store = {
  conteudo: () => ler(CHAVES.conteudo, null),
  salvarConteudo: c => gravar(CHAVES.conteudo, c),

  ajustes: () => ({ ...AJUSTES_PADRAO, ...ler(CHAVES.ajustes, {}) }),
  salvarAjustes: a => gravar(CHAVES.ajustes, a),

  registros: () => ler(CHAVES.registros, {}),
  dia: data => ({ marcados: [], ...(ler(CHAVES.registros, {})[data] || {}) }),
  salvarDia(data, dia) {
    const todos = ler(CHAVES.registros, {});
    todos[data] = dia;
    return gravar(CHAVES.registros, todos);
  },

  conquistas: () => ler(CHAVES.conquistas, {}),
  salvarConquistas: c => gravar(CHAVES.conquistas, c),

  usosDoApoio: () => ler(CHAVES.apoio, []),
  registrarApoio(uso) {
    const todos = ler(CHAVES.apoio, []);
    todos.push(uso);
    return gravar(CHAVES.apoio, todos);
  },
  apoioAtual: () => ler(CHAVES.apoioAtual, null),
  salvarApoioAtual: estado => (estado ? gravar(CHAVES.apoioAtual, estado) : remover(CHAVES.apoioAtual)),

  mensagens: () => ler(CHAVES.mensagens, []),
  salvarMensagens: lista => gravar(CHAVES.mensagens, lista),

  // Histórico da cliente (tudo menos o conteúdo e os ajustes).
  apagarRegistros() {
    for (const chave of [CHAVES.registros, CHAVES.conquistas, CHAVES.mensagens, CHAVES.apoio, CHAVES.apoioAtual]) {
      remover(chave);
    }
  },

  // Cópia de segurança da cliente: um arquivo com tudo o que está neste aparelho.
  copiaDaCliente() {
    const dados = {};
    for (const [nome, chave] of Object.entries(CHAVES)) dados[nome] = ler(chave, null);
    return { tipo: 'rose-ayurveda-cliente', versao: 1, criadaEm: new Date().toISOString(), dados };
  },
  restaurarCliente(copia) {
    if (copia?.tipo !== 'rose-ayurveda-cliente') throw new Error('arquivo-invalido');
    for (const [nome, chave] of Object.entries(CHAVES)) {
      const valor = copia.dados[nome];
      if (valor == null) remover(chave); else gravar(chave, valor);
    }
  },
  apagarTudoDaCliente() {
    for (const chave of Object.values(CHAVES)) remover(chave);
  },
  guardarMensagem(msg) {
    const todas = ler(CHAVES.mensagens, []);
    todas.push(msg);
    return gravar(CHAVES.mensagens, todas);
  },
};
