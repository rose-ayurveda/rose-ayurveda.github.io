// As partes do conteúdo de uma cliente, descritas para o editor da Rose.
import { idAleatorio } from './formulario.js';
import { catalogoCompleto } from '../audios.js';

const DOSHAS = [{ valor: 'vata', nome: 'Vata' }, { valor: 'pitta', nome: 'Pitta' }, { valor: 'kapha', nome: 'Kapha' }];
const FUSOS = [
  { valor: 'America/Sao_Paulo', nome: 'Brasília (Rio, São Paulo…)' },
  { valor: 'America/Manaus', nome: 'Manaus' },
  { valor: 'America/Belem', nome: 'Belém, Fortaleza, Recife' },
  { valor: 'America/Cuiaba', nome: 'Cuiabá, Campo Grande' },
  { valor: 'America/Rio_Branco', nome: 'Rio Branco' },
  { valor: 'America/Noronha', nome: 'Fernando de Noronha' },
  { valor: 'Europe/Lisbon', nome: 'Lisboa' },
];
const SIMBOLOS = ['sol', 'lua', 'chama', 'gota', 'folha', 'lotus', 'estrela'].map(s => ({ valor: s, nome: s }));
const CRITERIOS = [
  { valor: 'item', nome: 'Dias com estes itens do Quadro marcados' },
  { valor: 'periodo', nome: 'Dias com um período do Quadro completo' },
  { valor: 'florCompleta', nome: 'Dias com a flor completa' },
  { valor: 'refeicoes', nome: 'Dias com todas as refeições no horário' },
  { valor: 'checkinCalma', nome: 'Refeições comidas com calma (check-in)' },
  { valor: 'checkinMorno', nome: 'Refeições quentes ou mornas (check-in)' },
  { valor: 'apoioPassou', nome: 'Vezes em que a vontade passou depois da pausa' },
  { valor: 'diario', nome: 'Dias com diário preenchido' },
  { valor: 'diasDeUso', nome: 'Dias usando o app' },
];

const praticas = c => (c.mapa?.praticas?.itens || []).map(p => ({ valor: p.id, nome: p.nome }));
const chas = c => (c.mapa?.chas?.itens || []).map(p => ({ valor: p.id, nome: p.nome }));
const refeicoes = c => (c.mapa?.refeicoes || []).map(r => ({ valor: r.id, nome: r.nome }));
const itensQuadro = c => (c.quadro?.periodos || []).flatMap(p => p.itens.map(i => ({ valor: i.id, nome: `${p.nome}: ${i.texto}` })));
const periodosQuadro = c => (c.quadro?.periodos || []).map(p => ({ valor: p.id, nome: p.nome }));
const audios = () => Object.entries(catalogoCompleto()).map(([id, a]) => ({ valor: id, nome: a.nome }));

const blocoTexto = (campo, rotulo, dica) => ({ tipo: 'area', campo, rotulo, rico: true, linhas: 3, ...(dica ? { dica } : {}) });

export const SECOES = [
  {
    id: 'cadastro', nome: 'Cadastro',
    campos: [
      { tipo: 'texto', campo: 'cliente.nome', rotulo: 'Nome completo' },
      { tipo: 'texto', campo: 'cliente.primeiroNome', rotulo: 'Como chamar no app', ajuda: 'Aparece em “Bom dia, …”.' },
      { tipo: 'data', campo: 'cliente.dataConsulta', rotulo: 'Data da consulta' },
      { tipo: 'data', campo: 'cliente.proximoEncontro', rotulo: 'Próximo retorno', ajuda: 'Deixe em branco se ainda não houver data. A cliente recebe um lembrete na véspera.' },
      { tipo: 'escolha', campo: 'cliente.fusoHorario', rotulo: 'Fuso horário', opcoes: FUSOS, vazio: false },
      {
        tipo: 'grupo', rotulo: 'Resultado do teste de doshas', campo: 'doshas', campos: [
          { tipo: 'numero', campo: 'vata', rotulo: 'Vata' },
          { tipo: 'numero', campo: 'pitta', rotulo: 'Pitta' },
          { tipo: 'numero', campo: 'kapha', rotulo: 'Kapha' },
          { tipo: 'texto', campo: 'resultado', rotulo: 'Dosha resultante', ajuda: 'Ex.: Vata-Pitta' },
        ],
      },
      { tipo: 'texto', campo: 'parceria', rotulo: 'Linha da parceria', ajuda: 'Aparece no perfil da cliente.' },
    ],
  },
  {
    id: 'mapa-1', nome: 'Mapa: quem ela é',
    campos: [
      { tipo: 'paragrafos', campo: 'mapa.apresentacao', rotulo: 'Apresentação' },
      {
        tipo: 'lista', campo: 'mapa.prioridades', rotulo: 'As 3 prioridades', adicionar: 'Nova prioridade',
        titulo: p => p.titulo || 'Prioridade', novo: () => ({ titulo: '', texto: '' }),
        item: [{ tipo: 'texto', campo: 'titulo', rotulo: 'Título' }, blocoTexto('texto', 'Texto')],
      },
      { tipo: 'grupo', campo: 'mapa.prakriti', rotulo: 'Constituição (Prakriti)', campos: [{ tipo: 'texto', campo: 'titulo', rotulo: 'Título' }, { tipo: 'paragrafos', campo: 'paragrafos', rotulo: 'Texto' }] },
      {
        tipo: 'grupo', campo: 'mapa.vikriti', rotulo: 'Momento atual (Vikriti)', campos: [
          { tipo: 'texto', campo: 'titulo', rotulo: 'Título' },
          { tipo: 'paragrafos', campo: 'paragrafos', rotulo: 'Texto' },
          { tipo: 'linhas', campo: 'comoAparece', rotulo: 'Como isso aparece' },
          blocoTexto('fechamento', 'Fechamento'),
        ],
      },
      { tipo: 'grupo', campo: 'mapa.agni', rotulo: 'Fogo digestivo (Agni)', campos: [{ tipo: 'texto', campo: 'titulo', rotulo: 'Título' }, { tipo: 'paragrafos', campo: 'paragrafos', rotulo: 'Texto' }] },
    ],
  },
  {
    id: 'mapa-2', nome: 'Mapa: tema principal e alimentação',
    campos: [
      {
        tipo: 'grupo', campo: 'mapa.doce', rotulo: 'Tema principal (relação com o doce)', campos: [
          { tipo: 'texto', campo: 'titulo', rotulo: 'Título da seção', dica: 'Vazio = “Sua relação com o doce”.' },
          blocoTexto('introducao', 'Introdução'),
          { tipo: 'texto', campo: 'tituloPorQue', rotulo: 'Subtítulo do “por quê”', dica: 'Vazio = “Por que o doce chama tanto você”.' },
          { tipo: 'linhas', campo: 'porQue', rotulo: 'Por quê' },
          blocoTexto('conclusao', 'Conclusão'),
          { tipo: 'texto', campo: 'tituloCaminho', rotulo: 'Subtítulo do caminho', dica: 'Vazio = “O caminho: nutrir para que a vontade diminua”.' },
          {
            tipo: 'lista', campo: 'caminho', rotulo: 'O caminho', adicionar: 'Novo passo', titulo: p => p.titulo || 'Passo',
            novo: () => ({ titulo: '', texto: '' }), item: [{ tipo: 'texto', campo: 'titulo', rotulo: 'Título' }, blocoTexto('texto', 'Texto')],
          },
          blocoTexto('emagrecer', 'Sobre emagrecer', 'Vazio = a parte não aparece.'),
        ],
      },
      {
        tipo: 'grupo', campo: 'mapa.planoPorque', rotulo: 'Por que o plano alimentar foi pensado assim', campos: [
          blocoTexto('introducao', 'Introdução'),
          {
            tipo: 'lista', campo: 'itens', rotulo: 'Itens', adicionar: 'Novo item', titulo: p => p.item || 'Item',
            novo: () => ({ item: '', motivo: '' }), item: [{ tipo: 'texto', campo: 'item', rotulo: 'No plano alimentar' }, blocoTexto('motivo', 'O motivo ayurvédico')],
          },
        ],
      },
      {
        tipo: 'lista', campo: 'mapa.refeicoes', rotulo: 'Refeições do plano e ajuste ayurvédico', adicionar: 'Nova refeição',
        titulo: r => `${r.horario || '--:--'} · ${r.nome || 'Refeição'}`,
        novo: () => ({ id: idAleatorio('refeicao'), nome: '', horario: '12:00', principal: false, ajuste: '' }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'hora', campo: 'horario', rotulo: 'Horário' },
          { tipo: 'sim', campo: 'principal', rotulo: 'Refeição principal (tem check-in)' },
          blocoTexto('ajuste', 'Ajuste ayurvédico'),
        ],
      },
    ],
  },
  {
    id: 'mapa-3', nome: 'Mapa: relógio e práticas',
    campos: [
      blocoTexto('mapa.relogio.introducao', 'Relógio ayurvédico — introdução'),
      {
        tipo: 'lista', campo: 'mapa.relogio.periodos', rotulo: 'Períodos do relógio (personalizados)', adicionar: 'Novo período',
        titulo: p => `${p.inicio}h–${p.fim}h · ${p.nome}`, novo: () => ({ inicio: 0, fim: 0, dosha: 'vata', nome: '', acontece: '', cuidado: '' }),
        item: [
          { tipo: 'numero', campo: 'inicio', rotulo: 'Começa (hora)' },
          { tipo: 'numero', campo: 'fim', rotulo: 'Termina (hora)' },
          { tipo: 'escolha', campo: 'dosha', rotulo: 'Dosha', opcoes: DOSHAS, vazio: false },
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome do período' },
          blocoTexto('acontece', 'O que acontece com você'),
          blocoTexto('cuidado', 'Seu cuidado'),
        ],
      },
      blocoTexto('mapa.relogio.nota', 'Nota final do relógio'),
      blocoTexto('mapa.praticas.introducao', 'Práticas diárias — introdução'),
      {
        tipo: 'lista', campo: 'mapa.praticas.itens', rotulo: 'Práticas diárias (Dinacharya)', adicionar: 'Nova prática', titulo: p => p.nome || 'Prática',
        novo: () => ({ id: idAleatorio('pratica'), nome: '', quando: '', porQue: '', passos: [] }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'texto', campo: 'quando', rotulo: 'Quando' },
          blocoTexto('porQue', 'Por que para você'),
          { tipo: 'linhas', campo: 'detalhes', rotulo: 'Detalhes (opcional)' },
          { tipo: 'linhas', campo: 'passos', rotulo: 'Passo a passo' },
          {
            tipo: 'lista', campo: 'subpraticas', rotulo: 'Variações (ex.: tipos de respiração)', adicionar: 'Nova variação', titulo: s => s.nome || 'Variação',
            novo: () => ({ nome: '', passos: [] }), item: [{ tipo: 'texto', campo: 'nome', rotulo: 'Nome' }, { tipo: 'linhas', campo: 'passos', rotulo: 'Passos' }],
          },
          { tipo: 'linhas', campo: 'cuidados', rotulo: 'Cuidados (opcional)' },
          blocoTexto('versaoCurta', 'Versão para dias corridos (opcional)'),
        ],
      },
    ],
  },
  {
    id: 'mapa-4', nome: 'Mapa: estação e sinais',
    campos: [
      {
        tipo: 'grupo', campo: 'mapa.estacao', rotulo: 'A estação', campos: [
          { tipo: 'texto', campo: 'titulo', rotulo: 'Título' },
          blocoTexto('introducao', 'Introdução'),
          { tipo: 'linhas', campo: 'ajustes', rotulo: 'Ajustes' },
          blocoTexto('termometro', 'Termômetro do dia a dia'),
        ],
      },
      { tipo: 'linhas', campo: 'mapa.evitar', rotulo: 'O que evitar neste momento' },
      {
        tipo: 'grupo', campo: 'mapa.sinais', rotulo: 'Sinais', campos: [
          { tipo: 'texto', campo: 'funcionandoPrazo', rotulo: 'Prazo para notar' },
          { tipo: 'linhas', campo: 'funcionando', rotulo: 'Sinais de que está funcionando' },
          { tipo: 'texto', campo: 'tituloDesequilibrio', rotulo: 'Subtítulo dos sinais de desequilíbrio', dica: 'Vazio = “Sinais de que Vata ou Pitta estão subindo de novo”.' },
          { tipo: 'linhas', campo: 'desequilibrio', rotulo: 'Sinais de desequilíbrio' },
          blocoTexto('desequilibrioConclusao', 'Conclusão'),
        ],
      },
      blocoTexto('mapa.proximoEncontro', 'Texto sobre o próximo encontro'),
    ],
  },
  {
    id: 'rotina', nome: 'Rotina e lembretes',
    campos: [
      {
        tipo: 'lista', campo: 'rotina', rotulo: 'Práticas do dia (aba Práticas)', adicionar: 'Nova prática do dia',
        titulo: r => `${r.horario || '--:--'} · ${r.nome || 'Prática'}`,
        novo: () => ({ id: idAleatorio('rotina'), nome: '', horario: '08:00', duracao: '5 min', porQue: '' }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'hora', campo: 'horario', rotulo: 'Horário' },
          { tipo: 'texto', campo: 'duracao', rotulo: 'Duração', ajuda: 'Ex.: 5 min' },
          blocoTexto('porQue', 'Por que para você (curto)'),
          { tipo: 'escolha', campo: 'pratica', rotulo: 'Passo a passo vem da prática do Mapa', opcoes: praticas },
          { tipo: 'escolha', campo: 'cha', rotulo: 'Ou do chá', opcoes: chas },
          { tipo: 'escolha', campo: 'quadro', rotulo: 'Marca junto este item do Quadro', opcoes: itensQuadro },
          { tipo: 'marcar', campo: 'audios', rotulo: 'Áudios guiados desta prática', opcoes: audios },
          { tipo: 'grupo', campo: 'alternativa', rotulo: 'Versão para dias corridos (opcional)', campos: [{ tipo: 'texto', campo: 'nome', rotulo: 'Nome do botão' }, blocoTexto('texto', 'Texto')] },
        ],
      },
      {
        tipo: 'lista', campo: 'lembretes', rotulo: 'Lembretes do celular', adicionar: 'Novo lembrete',
        titulo: l => `${l.hora || '--:--'} · ${l.titulo || 'Lembrete'}`,
        novo: () => ({ id: idAleatorio('lembrete'), hora: '08:00', titulo: '', texto: '' }),
        item: [
          { tipo: 'aviso', texto: 'Se mudar horários, a cliente verá “Seus horários mudaram” e reativa os lembretes com um toque.' },
          { tipo: 'hora', campo: 'hora', rotulo: 'Horário' },
          { tipo: 'texto', campo: 'titulo', rotulo: 'Título' },
          { tipo: 'area', campo: 'texto', rotulo: 'Texto do aviso (curto e direto)', linhas: 2 },
        ],
      },
    ],
  },
  {
    id: 'quadro', nome: 'Quadro e selos',
    campos: [
      {
        tipo: 'lista', campo: 'quadro.periodos', rotulo: 'Períodos do Quadro do dia', adicionar: 'Novo período', titulo: p => p.nome || 'Período',
        novo: () => ({ id: idAleatorio('periodo'), nome: '', dosha: 'vata', itens: [] }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'escolha', campo: 'dosha', rotulo: 'Cor do dosha', opcoes: DOSHAS, vazio: false },
          {
            tipo: 'lista', campo: 'itens', rotulo: 'Itens', adicionar: 'Novo item', titulo: i => i.texto || 'Item',
            novo: () => ({ id: idAleatorio('item'), texto: '' }),
            item: [
              { tipo: 'texto', campo: 'texto', rotulo: 'Texto do item' },
              { tipo: 'escolha', campo: 'refeicao', rotulo: 'É uma refeição do plano?', opcoes: refeicoes, vazio: 'Não' },
              { tipo: 'texto', campo: 'apoio', rotulo: 'Texto de apoio (opcional)' },
            ],
          },
        ],
      },
      {
        tipo: 'lista', campo: 'selos', rotulo: 'Selos de conquista', adicionar: 'Novo selo', titulo: s => s.nome || 'Selo',
        novo: () => ({ id: idAleatorio('selo'), nome: '', simbolo: 'lotus', texto: '', criterio: { tipo: 'item', itens: [], dias: 7 } }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'escolha', campo: 'simbolo', rotulo: 'Símbolo', opcoes: SIMBOLOS, vazio: false },
          { tipo: 'texto', campo: 'texto', rotulo: 'Texto' },
          {
            tipo: 'grupo', campo: 'criterio', rotulo: 'Como se conquista', campos: [
              { tipo: 'escolha', campo: 'tipo', rotulo: 'Critério', opcoes: CRITERIOS, vazio: false },
              { tipo: 'marcar', campo: 'itens', rotulo: 'Itens do Quadro (para o critério “itens”)', opcoes: itensQuadro },
              { tipo: 'escolha', campo: 'periodo', rotulo: 'Período (para o critério “período completo”)', opcoes: periodosQuadro },
              { tipo: 'numero', campo: 'dias', rotulo: 'Quantidade (dias ou vezes, somados)' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'perguntas', nome: 'Diário, check-in e apoio',
    campos: [
      {
        tipo: 'lista', campo: 'diario.itens', rotulo: 'Perguntas do diário', adicionar: 'Nova pergunta', titulo: i => i.pergunta || 'Pergunta',
        novo: () => ({ id: idAleatorio('pergunta'), pergunta: '', tipo: 'opcoes', opcoes: [] }),
        item: [
          { tipo: 'texto', campo: 'pergunta', rotulo: 'Pergunta' },
          { tipo: 'escolha', campo: 'tipo', rotulo: 'Tipo', opcoes: [{ valor: 'escala', nome: 'Escala de 1 a 5' }, { valor: 'opcoes', nome: 'Opções' }], vazio: false },
          { tipo: 'linhas', campo: 'rotulos', rotulo: 'Rótulos da escala (5 linhas, do 1 ao 5)', rico: false },
          { tipo: 'sim', campo: 'melhorAlto', rotulo: 'Na escala, número alto é bom' },
          { tipo: 'linhas', campo: 'opcoes', rotulo: 'Opções (uma por linha)', rico: false },
          { tipo: 'escolha', campo: 'seNaoMarcou', rotulo: 'Só aparece se NÃO marcou este item do Quadro', opcoes: itensQuadro, vazio: 'Sempre aparece' },
        ],
      },
      { tipo: 'texto', campo: 'diario.observacao', rotulo: 'Campo livre do diário' },
      { tipo: 'texto', campo: 'diario.semanal.pergunta', rotulo: 'Pergunta de domingo' },
      { tipo: 'marcar', campo: 'checkin.refeicoes', rotulo: 'Refeições com check-in', opcoes: refeicoes },
      {
        tipo: 'lista', campo: 'checkin.perguntas', rotulo: 'Perguntas do check-in (máximo 4)', adicionar: 'Nova pergunta', titulo: p => p.pergunta || 'Pergunta',
        novo: () => ({ id: idAleatorio('checkin'), pergunta: '', opcoes: [] }),
        item: [
          { tipo: 'aviso', texto: 'A primeira opção de cada pergunta é a resposta “ideal” usada nos gráficos (no horário, com calma, morna, leve).' },
          { tipo: 'texto', campo: 'pergunta', rotulo: 'Pergunta' },
          { tipo: 'linhas', campo: 'opcoes', rotulo: 'Opções (uma por linha)', rico: false },
          { tipo: 'sim', campo: 'varias', rotulo: 'Pode marcar mais de uma' },
        ],
      },
      {
        tipo: 'grupo', campo: 'apoio', rotulo: 'Botão de apoio', campos: [
          { tipo: 'texto', campo: 'botao', rotulo: 'Texto do botão' },
          blocoTexto('abertura', 'Abertura'),
          { tipo: 'texto', campo: 'pergunta', rotulo: 'Pergunta' },
          blocoTexto('fome', 'Se for fome'),
          blocoTexto('fomeFechamento', 'Fechamento quando é fome'),
          blocoTexto('pausa.texto', 'Convite para a pausa'),
          { tipo: 'numero', campo: 'pausa.minutos', rotulo: 'Minutos da pausa' },
          blocoTexto('perguntaFinal', 'Pergunta depois da pausa'),
          {
            tipo: 'lista', campo: 'desfechos', rotulo: 'Respostas depois da pausa', adicionar: 'Nova resposta', titulo: d => d.texto || 'Resposta',
            novo: () => ({ id: idAleatorio('desfecho'), texto: '', resposta: '' }),
            item: [{ tipo: 'texto', campo: 'texto', rotulo: 'Opção' }, blocoTexto('resposta', 'Mensagem')],
          },
          blocoTexto('horarioSobremesa.texto', 'Lembrete da sobremesa (no horário do almoço)'),
        ],
      },
    ],
  },
  {
    id: 'biblioteca', nome: 'Áudios, chás e receitas',
    campos: [
      { tipo: 'marcar', campo: 'audios', rotulo: 'Áudios guiados que ela recebe', opcoes: audios },
      blocoTexto('mapa.chas.introducao', 'Chás — introdução'),
      {
        tipo: 'lista', campo: 'mapa.chas.itens', rotulo: 'Chás', adicionar: 'Novo chá', titulo: c => c.nome || 'Chá',
        novo: () => ({ id: idAleatorio('cha'), nome: '', quando: '', porQue: '', preparo: 'folhas' }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'texto', campo: 'quando', rotulo: 'Quando tomar' },
          blocoTexto('porQue', 'Por que para você'),
          { tipo: 'escolha', campo: 'preparo', rotulo: 'Preparo', opcoes: [{ valor: 'folhas', nome: 'Folhas e flores (abafar)' }, { valor: 'sementes', nome: 'Sementes e raízes (ferver)' }], vazio: false },
        ],
      },
      {
        tipo: 'lista', campo: 'receitas', rotulo: 'Receitas', adicionar: 'Nova receita', titulo: r => r.nome || 'Receita',
        novo: () => ({ id: idAleatorio('receita'), nome: '', quando: '', porQue: '', ingredientes: [], preparo: [] }),
        item: [
          { tipo: 'texto', campo: 'nome', rotulo: 'Nome' },
          { tipo: 'texto', campo: 'quando', rotulo: 'Quando' },
          blocoTexto('porQue', 'Por que para você'),
          { tipo: 'linhas', campo: 'ingredientes', rotulo: 'Ingredientes' },
          { tipo: 'linhas', campo: 'preparo', rotulo: 'Modo de preparo' },
          { tipo: 'texto', campo: 'nota', rotulo: 'Observação (opcional)' },
        ],
      },
    ],
  },
  {
    id: 'mensagens', nome: 'Mensagens',
    campos: [
      { tipo: 'aviso', texto: 'Cada versão é separada por uma linha em branco. Para desativar um evento, apague todas as versões dele. Assine com “— Rose”.' },
      { tipo: 'paragrafos', campo: 'mensagens.florCompleta', rotulo: 'Flor completa', dica: 'Uma versão por parágrafo.' },
      { tipo: 'paragrafos', campo: 'mensagens.seloGanho', rotulo: 'Selo ganho', dica: 'Use {selo} onde entra o nome do selo.' },
      { tipo: 'paragrafos', campo: 'mensagens.primeiraSemana', rotulo: 'Primeira semana', dica: 'Uma versão por parágrafo.' },
      { tipo: 'paragrafos', campo: 'mensagens.volta', rotulo: 'Volta depois de dias sem registro', dica: 'Uma versão por parágrafo.' },
      { tipo: 'paragrafos', campo: 'mensagens.diaDificil', rotulo: 'Dia difícil (menos de 30%)', dica: 'Uma versão por parágrafo.' },
      { tipo: 'paragrafos', campo: 'mensagens.tardeSemDoce', rotulo: 'Tarde sem doce depois de dias com doce', dica: 'Uma versão por parágrafo.' },
      {
        tipo: 'grupo', campo: 'semana', rotulo: 'Mensagem da semana (domingo à noite)', campos: [
          { tipo: 'paragrafos', campo: 'aberturas', rotulo: 'Aberturas', dica: 'Uma versão por parágrafo.' },
          {
            tipo: 'grupo', campo: 'destaques', rotulo: 'Destaques', ajuda: 'Os campos entre chaves são preenchidos com os números reais da semana.', campos: [
              blocoTexto('melhoraSobe', 'Indicador que subiu ({indicador}, {antes}, {depois})'),
              blocoTexto('melhoraDesce', 'Indicador que desceu ({indicador}, {antes}, {depois})'),
              blocoTexto('menosApoio', 'Menos usos do botão de apoio ({depois}, {vezes}, {antes})'),
              blocoTexto('selo', 'Selo ganho ({selo})'),
              blocoTexto('itemConstante', 'Cuidado mais constante ({item}, {dias})'),
            ],
          },
          {
            tipo: 'grupo', campo: 'padroes', rotulo: 'Padrões ayurvédicos', campos: [
              blocoTexto('calma', 'Comer com calma × vontade de doce ({a}, {b})'),
              blocoTexto('abhyanga', 'Automassagem × vontade de doce ({a}, {b})'),
              blocoTexto('sono', 'Pés com óleo × sono ({a}, {b})'),
              blocoTexto('morno', 'Comida morna × sensação ({a}, {b})'),
              blocoTexto('doceTarde', 'Doce concentrado das 14h às 18h'),
            ],
          },
          blocoTexto('foco', 'Foco da próxima semana ({foco})'),
          blocoTexto('focoComDias', 'Complemento do foco ({dias})'),
          { tipo: 'paragrafos', campo: 'fechamentos', rotulo: 'Fechamentos', dica: 'Uma versão por parágrafo.' },
          { tipo: 'paragrafos', campo: 'retomada', rotulo: 'Semana com pouquíssimos registros', dica: 'Uma versão por parágrafo.' },
        ],
      },
    ],
  },
  {
    id: 'alertas', nome: 'Alertas da estação',
    campos: [
      {
        tipo: 'lista', campo: 'alertas', rotulo: 'Alertas sazonais', adicionar: 'Novo alerta', titulo: a => `${a.inicio || '?'} → ${a.fim || '?'} · ${a.titulo || 'Alerta'}`,
        novo: () => ({ id: idAleatorio('alerta'), inicio: null, fim: null, titulo: '', texto: '' }),
        item: [
          { tipo: 'texto', campo: 'titulo', rotulo: 'Título' },
          { tipo: 'data', campo: 'inicio', rotulo: 'Aparece a partir de' },
          { tipo: 'data', campo: 'fim', rotulo: 'Até' },
          blocoTexto('texto', 'Texto'),
        ],
      },
    ],
  },
];
