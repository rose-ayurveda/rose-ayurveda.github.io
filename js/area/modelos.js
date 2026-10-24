// Modelos de conteúdo por dosha, para a Rose partir deles ao cadastrar uma cliente nova.
// Baseados no material da Roberta, sem nada pessoal dela. Trechos entre [colchetes]
// são para a Rose completar com a leitura de cada cliente.

import { PADROES } from './padroes.js';

export const TIPOS = [
  { valor: 'vata', nome: 'Vata' },
  { valor: 'pitta', nome: 'Pitta' },
  { valor: 'kapha', nome: 'Kapha' },
  { valor: 'vata-pitta', nome: 'Vata-Pitta' },
  { valor: 'pitta-kapha', nome: 'Pitta-Kapha' },
  { valor: 'vata-kapha', nome: 'Vata-Kapha' },
  { valor: 'tridosha', nome: 'Tridosha' },
];

const D = {
  vata: {
    nome: 'Vata',
    prakriti: 'Vata é formado pelos elementos ar e éter. Traz movimento, leveza, criatividade e entusiasmo. Em equilíbrio, é a pessoa de ideias rápidas, comunicativa e sensível. Suas qualidades são frio, seco, leve e móvel — por isso o que mais a equilibra é o oposto: calor, umidade, estabilidade e ritmo.',
    prioridade: { titulo: 'Ritmo', texto: 'Refeições e sono em horários regulares. A irregularidade é o que mais desequilibra Vata.' },
    prioridade2: { titulo: 'Calor e umidade', texto: 'Alimentos e bebidas mornos, nunca gelados, e a automassagem com óleo morno. É o que acalma o excesso de movimento.' },
    agni: { titulo: 'Seu fogo digestivo (Agni): variável', texto: 'Em Vata, a digestão costuma ser irregular: às vezes boa, às vezes lenta, com gases ou inchaço. Refeições mornas, em horários fixos e com especiarias suaves estabilizam esse fogo.' },
    agua: 'Beba 1 copo de água morna (não quente), sentada, em goles lentos.',
    oleo: ['**Óleo:** gergelim morno, o mais aquecedor e nutritivo para Vata.', 'Dias quentes: amêndoas doces.', 'Dias frios ou com mais ansiedade: gergelim puro, bem morno.'],
    respiracao: 'bhramari',
    chas: [
      { id: 'gengibre', nome: 'Gengibre fresco (1 a 2 fatias finas)', quando: 'De dia, depois das refeições', porQue: 'Aquece e ativa a digestão.', preparo: 'sementes' },
      { id: 'erva-doce', nome: 'Erva-doce (funcho)', quando: 'Depois do almoço e do jantar', porQue: 'Favorece a digestão e acalma Vata.', preparo: 'sementes' },
      { id: 'canela-cardamomo', nome: 'Canela com cardamomo', quando: 'À tarde', porQue: 'Aquece com suavidade e dá sensação de doce sem açúcar.', preparo: 'sementes' },
    ],
    refeicoes: {
      desjejum: 'Prefira preparos mornos, úmidos e cozidos, como um mingau com canela e cardamomo. Nada gelado pela manhã.',
      almoco: 'É a refeição mais completa. Preparos cozidos e quentes, com um fio de azeite ou ghee e temperos suaves (cominho, gengibre, cúrcuma).',
      'lanche-tarde': 'Um lanche nutritivo e morno no meio da tarde, antes que Vata acelere a mente e peça doce.',
      jantar: 'Leve, quente e cozido, como sopas e legumes refogados. Jantar cedo deixa o corpo livre para descansar.',
    },
    evitar: ['**Pular refeições ou longos períodos sem comer** — agrava Vata.', '**Bebidas e alimentos gelados ou crus em excesso** — apagam o fogo digestivo.', '**Vento frio e excesso de estímulos** — aceleram a mente.', '**Irregularidade** — horários diferentes todo dia desorganizam Vata.'],
    desequilibrio: '**Vata:** ansiedade, insônia, pele e intestino ressecados, cansaço, inchaço.',
    estacao: { titulo: 'Outono e inverno pedem mais cuidado', introducao: 'O frio e o vento seco aumentam Vata. Nesses meses:', ajustes: ['Use óleo de gergelim bem morno na automassagem.', 'Prefira sopas, ensopados e preparos úmidos.', 'Proteja-se do vento, principalmente a cabeça e os pés.'] },
  },
  pitta: {
    nome: 'Pitta',
    prakriti: 'Pitta é formado pelos elementos fogo e água. Traz calor, foco, determinação e clareza. Em equilíbrio, é a pessoa organizada, líder, que realiza com intensidade. Suas qualidades são quente, intenso, oleoso e penetrante — por isso o que mais a equilibra é refrescar (sem gelar), suavizar e desacelerar.',
    prioridade: { titulo: 'Refrescar e suavizar', texto: 'Alimentos frescos (não gelados), menos picante e menos ácido. É o que acalma o fogo interno.' },
    prioridade2: { titulo: 'Não pular refeições', texto: 'Pitta tem fome intensa. Ficar sem comer gera irritação e acidez.' },
    agni: { titulo: 'Seu fogo digestivo (Agni): intenso', texto: 'Em Pitta, a digestão costuma ser forte e rápida, com tendência a acidez e azia quando a refeição atrasa ou é muito picante. Refeições regulares, com sabores doce, amargo e adstringente, protegem esse fogo.' },
    agua: 'Beba 1 copo de água em temperatura ambiente ou levemente morna, sentada, em goles lentos.',
    oleo: ['**Óleo:** coco ou girassol, que refrescam a pele e acalmam Pitta.', 'Dias frios: amêndoas doces.', 'Pés e cabeça: um pouco de óleo de coco antes de dormir ajuda a refrescar a mente.'],
    respiracao: 'bhramari',
    chas: [
      { id: 'coentro', nome: 'Coentro em sementes', quando: 'Dias quentes', porQue: 'Refresca Pitta e acalma a digestão.', preparo: 'sementes' },
      { id: 'erva-doce', nome: 'Erva-doce (funcho)', quando: 'Depois do almoço e do jantar', porQue: 'Favorece a digestão sem aquecer.', preparo: 'sementes' },
      { id: 'hortela-camomila', nome: 'Hortelã ou camomila', quando: 'À tarde e à noite', porQue: 'Refrescam e acalmam a mente.', preparo: 'folhas' },
    ],
    refeicoes: {
      desjejum: 'Prefira preparos suaves e nutritivos, como mingau com cardamomo e frutas doces. Evite café em jejum.',
      almoco: 'É a refeição mais completa, entre 12h e 13h, quando o fogo digestivo está no auge. Temperos como coentro, cominho e erva-doce; pimenta com moderação.',
      'lanche-tarde': 'Um lanche fresco (não gelado) e no horário, para não deixar a fome virar irritação.',
      jantar: 'Leve e cozido, com legumes e grãos. Evite frituras, molhos picantes e muito ácidos à noite.',
    },
    evitar: ['**Pimenta, frituras, álcool e alimentos muito ácidos** — aumentam o fogo interno.', '**Sol forte entre 10h e 14h** — o horário de Pitta.', '**Pular refeições** — gera irritação e acidez.', '**Autoexigência e competitividade** — também inflamam Pitta.'],
    desequilibrio: '**Pitta:** irritação, calor excessivo, acidez, azia, inflamações na pele.',
    estacao: { titulo: 'O verão pede mais cuidado', introducao: 'O calor é a estação de Pitta. Nesses meses:', ajustes: ['Prefira óleo de coco na automassagem.', 'Mais coentro, erva-doce e hortelã; menos gengibre e pimenta.', 'Evite o sol entre 10h e 14h.', 'Refrescar não é o mesmo que gelar.'] },
  },
  kapha: {
    nome: 'Kapha',
    prakriti: 'Kapha é formado pelos elementos terra e água. Traz estabilidade, calma, resistência e afeto. Em equilíbrio, é a pessoa serena, leal e acolhedora. Suas qualidades são pesado, frio, úmido e estável — por isso o que mais a equilibra é leveza, calor, movimento e estímulo.',
    prioridade: { titulo: 'Movimento', texto: 'Atividade física regular, de preferência pela manhã. É o que tira o peso e a lentidão de Kapha.' },
    prioridade2: { titulo: 'Leveza à mesa', texto: 'Refeições leves, quentes e bem temperadas, comendo só com fome. É o que acende o fogo digestivo.' },
    agni: { titulo: 'Seu fogo digestivo (Agni): lento', texto: 'Em Kapha, a digestão costuma ser lenta, com sensação de peso depois de comer. Especiarias aquecedoras, refeições leves e intervalos respeitados entre elas ativam esse fogo.' },
    agua: 'Beba 1 copo de água morna com uma fatia de gengibre ou algumas gotas de limão.',
    oleo: ['**Automassagem estimulante:** pouca quantidade de óleo de gergelim morno, com movimentos rápidos e vigorosos.', 'Também pode ser feita a seco, com luvas de fibra (garshana), para ativar a circulação.'],
    respiracao: 'nadi',
    chas: [
      { id: 'gengibre', nome: 'Gengibre fresco', quando: 'De manhã e depois das refeições', porQue: 'Aquece e acende o fogo digestivo lento.', preparo: 'sementes' },
      { id: 'canela-cravo', nome: 'Canela com cravo', quando: 'À tarde', porQue: 'Aquecem e reduzem a sensação de peso.', preparo: 'sementes' },
      { id: 'curcuma', nome: 'Cúrcuma com pimenta-do-reino', quando: 'Depois do almoço', porQue: 'Ativa a digestão e o metabolismo.', preparo: 'sementes' },
    ],
    refeicoes: {
      desjejum: 'Leve ou até dispensável se não houver fome. Prefira frutas cozidas com canela ou um chá de gengibre.',
      almoco: 'A refeição principal. Legumes, grãos leves e temperos aquecedores (gengibre, pimenta-do-reino, cúrcuma, cominho).',
      'lanche-tarde': 'Só se houver fome de verdade; um chá aquecedor muitas vezes basta.',
      jantar: 'O mais leve do dia e cedo: sopas de legumes e preparos secos. Evite laticínios e doces à noite.',
    },
    evitar: ['**Laticínios pesados, doces e frituras** — aumentam o peso de Kapha.', '**Comer sem fome ou beliscar** — sobrecarrega o fogo digestivo lento.', '**Dormir de dia e sedentarismo** — deixam o corpo e a mente lentos.', '**Bebidas geladas** — apagam o fogo digestivo.'],
    desequilibrio: '**Kapha:** sono excessivo, peso, lentidão, muco, inchaço, desânimo.',
    estacao: { titulo: 'O fim do inverno e a primavera pedem mais cuidado', introducao: 'A umidade e o frio acumulam Kapha. Nesses meses:', ajustes: ['Movimente-se mais, de preferência pela manhã.', 'Prefira gengibre, canela e cravo nos chás.', 'Refeições leves e quentes; menos doces e laticínios.'] },
  },
};

const COMUM = {
  relogio: [
    { inicio: 2, fim: 6, dosha: 'vata', nome: 'Madrugada', acontece: 'Mente mais ativa; um bom horário para acordar.', cuidado: 'Se acordar ansiosa, faça o Bhramari.' },
    { inicio: 6, fim: 10, dosha: 'kapha', nome: 'Manhã', acontece: 'Período mais estável e mais pesado do dia.', cuidado: 'Raspagem da língua, água morna, automassagem e movimento.' },
    { inicio: 10, fim: 14, dosha: 'pitta', nome: 'Meio do dia', acontece: 'Fogo digestivo no auge.', cuidado: 'Almoço como refeição principal.' },
    { inicio: 14, fim: 18, dosha: 'vata', nome: 'Tarde', acontece: 'Queda de energia, mente dispersa, vontade de doce.', cuidado: 'Lanche nutritivo e chá morno.' },
    { inicio: 18, fim: 22, dosha: 'kapha', nome: 'Noite', acontece: 'O corpo pede desacelerar.', cuidado: 'Jantar leve e cedo, menos telas, chá morno.' },
    { inicio: 22, fim: 2, dosha: 'pitta', nome: 'Hora de dormir', acontece: 'O corpo digere e se renova durante o sono.', cuidado: 'Dormir antes das 22h30 aproveita o fim do período de Kapha.' },
  ],
};

const unir = (...listas) => [...new Map(listas.flat().map(i => [i.id || i, i])).values()];

export function criarModelo(tipo, base = {}) {
  const doshas = tipo === 'tridosha' ? ['vata', 'pitta', 'kapha'] : tipo.split('-');
  const d = doshas.map(x => D[x]);
  const nome = TIPOS.find(t => t.valor === tipo)?.nome || tipo;
  const principal = d[0];
  const respiracaoBhramari = d.some(x => x.respiracao === 'bhramari');
  const cliente = { id: base.id || 'cliente', nome: base.nome || '[Nome da cliente]', primeiroNome: base.primeiroNome || '[Nome]', dataConsulta: base.dataConsulta || null, fusoHorario: 'America/Sao_Paulo', proximoEncontro: null };

  const refeicao = id => d.map(x => x.refeicoes[id]).join(' ');
  return {
    ...structuredClone(PADROES),
    formato: 1,
    versao: 1,
    atualizadoEm: null,
    cliente,
    doshas: { vata: null, pitta: null, kapha: null, resultado: nome },
    parceria: '',
    audios: ['relaxamento-noite', 'nadi-shodhana', ...(respiracaoBhramari ? ['bhramari'] : []), 'abhyanga-completa', 'abhyanga-pes', 'pausa-do-doce', 'alimentacao-consciente'],
    quadro: {
      periodos: [
        { id: 'manha', nome: 'Manhã', dosha: 'kapha', itens: [
          { id: 'raspagem', texto: 'Raspagem da língua' },
          { id: 'agua-manha', texto: 'Água morna ao acordar' },
          { id: 'abhyanga', texto: 'Automassagem' },
          { id: 'desjejum', texto: 'Segui o desjejum do meu plano', refeicao: 'desjejum' },
        ] },
        { id: 'meio-dia', nome: 'Meio do dia', dosha: 'pitta', itens: [
          { id: 'almoco', texto: 'Segui o almoço do meu plano', refeicao: 'almoco' },
          { id: 'cha-almoco', texto: 'Chá morno depois do almoço' },
        ] },
        { id: 'tarde', nome: 'Tarde', dosha: 'vata', itens: [
          { id: 'lanche-tarde', texto: 'Segui o lanche da tarde do meu plano', refeicao: 'lanche-tarde' },
          { id: 'sem-doce', texto: 'Passei a tarde sem doce fora de hora', apoio: 'Doce, se quiser, logo depois do almoço.' },
        ] },
        { id: 'noite', nome: 'Noite', dosha: 'kapha', itens: [
          { id: 'jantar', texto: 'Segui o jantar do meu plano', refeicao: 'jantar' },
          { id: 'pes-respiracao', texto: 'Pés com óleo e respiração' },
          { id: 'deitar', texto: 'Deitei até as 22h30' },
        ] },
      ],
    },
    rotina: [
      { id: 'raspagem', nome: 'Raspagem da língua', horario: '07:00', duracao: '1 min', pratica: 'raspagem', quadro: 'raspagem', porQue: 'Remove os resíduos da noite e mostra como está a sua digestão.' },
      { id: 'agua-manha', nome: 'Água morna ao acordar', horario: '07:00', duracao: '5 min', pratica: 'agua-manha', quadro: 'agua-manha', porQue: 'Desperta o fogo digestivo com suavidade.' },
      { id: 'abhyanga', nome: 'Automassagem', horario: '07:15', duracao: '10 min', pratica: 'abhyanga', quadro: 'abhyanga', audios: ['abhyanga-completa', 'abhyanga-pes'], porQue: 'Equilibra o seu dosha e traz centramento.', alternativa: { nome: 'Dias corridos: só os pés', texto: 'Só os pés, com um pouco de óleo morno, antes de dormir.' } },
      { id: 'alimentacao-consciente', nome: 'Sentar e respirar antes do almoço', horario: '12:00', duracao: '30 s', pratica: 'alimentacao-consciente', audios: ['alimentacao-consciente'], porQue: 'Comer com presença ajuda o corpo a registrar que foi nutrido.' },
      { id: 'cha-almoco', nome: 'Chá morno depois do almoço', horario: '13:00', duracao: '5 min', cha: d[0].chas[1]?.id || d[0].chas[0].id, quadro: 'cha-almoco', porQue: 'Fecha a refeição e ajuda a digestão.' },
      { id: 'pes-respiracao', nome: 'Pés com óleo e respiração', horario: '22:00', duracao: '10 min', pratica: 'respiracao', quadro: 'pes-respiracao', audios: ['abhyanga-pes', 'nadi-shodhana', ...(respiracaoBhramari ? ['bhramari'] : []), 'relaxamento-noite'], porQue: 'Protege o sono e acalma a mente.' },
    ],
    lembretes: [
      { id: 'acordar', hora: '07:00', titulo: 'Bom dia', texto: 'Acordou? Raspagem da língua, água morna e automassagem antes do banho.' },
      { id: 'almoco', hora: '12:00', titulo: 'Almoço', texto: 'Sente-se e respire três vezes antes de começar.' },
      { id: 'lanche-tarde', hora: '15:00', titulo: 'Lanche da tarde', texto: 'Hora do lanche, antes que Vata peça doce.' },
      { id: 'jantar', hora: '19:00', titulo: 'Jantar', texto: 'Jantar leve, quente e cozido.' },
      { id: 'noite', hora: '22:00', titulo: 'Hora de pousar', texto: 'Pés com óleo e respiração. Seu diário de 30 segundos está esperando.' },
    ],
    receitas: [
      { id: 'cha-ccf', nome: 'Chá de cominho, coentro e erva-doce', quando: 'Ao longo do dia, morno.', porQue: 'Uma combinação clássica do Ayurveda que equilibra os três doshas e ajuda a digestão.', ingredientes: ['½ colher de chá de sementes de cominho', '½ colher de chá de sementes de coentro', '½ colher de chá de sementes de erva-doce', '1 litro de água'], preparo: ['Ferva a água com as sementes por 5 minutos em fogo baixo.', 'Coe e guarde numa garrafa térmica.', 'Beba morno ao longo do dia.'] },
      { id: 'maca-cozida', nome: 'Maçã cozida com cardamomo e canela', quando: 'Como sobremesa morna, logo depois do almoço.', porQue: 'A fruta cozida é mais fácil de digerir, e as especiarias dão sensação de doce sem açúcar.', ingredientes: ['1 maçã com casca, em cubos', '2 colheres de sopa de água', '1 pitada de cardamomo em pó', '½ colher de chá de canela em pó'], preparo: ['Coloque a maçã num recipiente próprio para micro-ondas.', 'Junte a água, o cardamomo e a canela e misture.', 'Cubra, deixando uma pequena abertura para o vapor.', 'Leve ao micro-ondas por 2 a 3 minutos, até amaciar.', 'Espere amornar e coma devagar, sentada.'] },
    ],
    diario: {
      horario: '22:00',
      itens: [
        { id: 'sono', pergunta: 'Como foi o sono da noite passada?', tipo: 'escala', rotulos: ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Muito bom'], melhorAlto: true },
        { id: 'doce', pergunta: 'Vontade de doce hoje', tipo: 'escala', rotulos: ['Nenhuma', 'Leve', 'Média', 'Forte', 'Muito forte'], melhorAlto: false },
        { id: 'digestao', pergunta: 'Digestão hoje', tipo: 'escala', rotulos: ['Muito difícil', 'Difícil', 'Regular', 'Boa', 'Muito boa'], melhorAlto: true },
        { id: 'energia', pergunta: 'Energia hoje', tipo: 'escala', rotulos: ['Muito baixa', 'Baixa', 'Média', 'Boa', 'Muito boa'], melhorAlto: true },
        { id: 'ansiedade', pergunta: 'Ansiedade hoje', tipo: 'escala', rotulos: ['Nenhuma', 'Leve', 'Média', 'Forte', 'Muito forte'], melhorAlto: false },
        { id: 'lingua', pergunta: 'Língua ao acordar', tipo: 'opcoes', opcoes: ['Limpa', 'Camada fina', 'Camada espessa'] },
        { id: 'fome-acordar', pergunta: 'Como estava a sua fome ao acordar?', tipo: 'opcoes', opcoes: ['Com fome', 'Pouca fome', 'Sem fome'] },
        { id: 'intestino', pergunta: 'O intestino funcionou hoje?', tipo: 'opcoes', opcoes: ['Sim, bem', 'Sim, com dificuldade', 'Não'] },
      ],
      observacao: 'Quer anotar algo sobre o dia? (opcional)',
      semanal: { diaDaSemana: 0, pergunta: 'O que foi mais difícil na sua alimentação esta semana? (opcional)' },
    },
    mapa: {
      apresentacao: [`${cliente.primeiroNome}, este é o seu Mapa Ayurvédico: a base do seu acompanhamento. Ele mostra quem você é pela leitura ayurvédica, o que está pedindo cuidado neste momento e por que a sua rotina foi pensada assim.`],
      prioridades: [principal.prioridade, d[1]?.prioridade || principal.prioridade2, { titulo: 'Desacelerar à noite', texto: 'Respiração, chá morno e massagem nos pés antes de dormir. É o que protege o sono.' }],
      prakriti: { titulo: `Sua constituição (Prakriti): ${nome}`, paragrafos: [...d.map(x => x.prakriti), ...(d.length > 1 ? ['[Escreva aqui como os doshas se combinam nesta cliente.]'] : [])] },
      vikriti: { titulo: 'Seu momento atual (Vikriti): [dosha em excesso]', paragrafos: ['[Escreva aqui o que está pedindo cuidado neste momento da vida da cliente.]'], comoAparece: ['[Como isso aparece — sinal 1]', '[Como isso aparece — sinal 2]'], fechamento: '[Fechamento: a lógica das escolhas a seguir.]' },
      agni: { titulo: principal.agni.titulo, paragrafos: d.map(x => x.agni.texto) },
      doce: {
        introducao: 'Pelo Ayurveda, a vontade por doces tem explicação na constituição — e entender isso muda a forma de diminuir.',
        porQue: ['**Vata:** o doce é o sabor que mais acalma Vata. Quando a mente acelera, o corpo pede doce como calmante.', '**Pitta:** o doce refresca e suaviza a intensidade de Pitta. Depois de esforço ou irritação, ele chega como alívio.', '**Kapha:** o doce aumenta Kapha. Em excesso, traz peso e lentidão.'],
        conclusao: 'Proibir o doce costuma piorar a vontade. O caminho é nutrir de forma que o corpo precise menos dele.',
        caminho: [
          { titulo: 'Os seis sabores nas refeições principais', texto: 'Doce, ácido, salgado, picante, amargo e adstringente. Uma refeição com todos eles sacia de verdade.' },
          { titulo: 'A sobremesa, logo após o almoço', texto: 'Se quiser um doce, coma uma porção pequena logo depois do almoço, quando o fogo digestivo está no auge.' },
          { titulo: 'Uma pausa antes do doce', texto: 'Quando a vontade vier fora de hora, pergunte se é fome ou ansiedade. Se for ansiedade, faça o Bhramari e espere 10 minutos.' },
        ],
        emagrecer: '',
      },
      planoPorque: { introducao: '[Explique como o plano alimentar foi alinhado a partir desta leitura.]', itens: [{ item: '[Escolha do plano]', motivo: '[Motivo ayurvédico]' }] },
      refeicoes: [
        { id: 'desjejum', nome: 'Desjejum', horario: '08:00', principal: true, ajuste: refeicao('desjejum') },
        { id: 'almoco', nome: 'Almoço', horario: '12:00', principal: true, ajuste: refeicao('almoco') },
        { id: 'lanche-tarde', nome: 'Lanche da tarde', horario: '15:00', principal: false, ajuste: refeicao('lanche-tarde') },
        { id: 'jantar', nome: 'Jantar', horario: '19:00', principal: true, ajuste: refeicao('jantar') },
      ],
      relogio: {
        introducao: 'No Ayurveda, cada período do dia é regido por um dosha. Conhecer esse relógio explica por que certos sintomas aparecem sempre no mesmo horário — e onde cada cuidado se encaixa.',
        periodos: COMUM.relogio.map(p => ({ ...p })),
        nota: 'O objetivo é a regularidade sempre que der, não a perfeição.',
      },
      praticas: {
        introducao: 'Hábitos escolhidos para o seu momento. Nenhum leva mais que 10 minutos.',
        itens: [
          { id: 'raspagem', nome: 'Raspagem da língua', quando: 'Ao acordar, antes de tudo', porQue: 'Remove os resíduos (ama) acumulados à noite e mostra, todo dia, como está a sua digestão.', passos: ['Antes de beber água ou escovar os dentes, observe a língua no espelho.', 'Com raspador de cobre ou inox, faça 5 a 7 passadas leves, de trás para a ponta.', 'Enxágue, seque e guarde o raspador em local seco.'] },
          { id: 'agua-manha', nome: 'Água ao acordar', quando: 'Depois da raspagem', porQue: 'Desperta o fogo digestivo sem agredir e marca o início do dia.', passos: d.map(x => x.agua).slice(0, 1) },
          { id: 'abhyanga', nome: 'Automassagem (Abhyanga)', quando: 'De manhã, antes do banho — 5 a 10 minutos', porQue: 'Equilibra o seu dosha, melhora o sono e traz centramento.', detalhes: unir(...d.map(x => x.oleo)), passos: ['Cabeça: círculos com as pontas dos dedos.', 'Braços: movimentos longos; circulares nos cotovelos e ombros.', 'Abdômen: círculos suaves no sentido horário.', 'Pernas: movimentos longos, sempre subindo.', 'Pés: massageie bem as solas e entre os dedos.', 'Deixe agir alguns minutos e tome banho morno.'], versaoCurta: '**Dias corridos:** só os pés, com um pouco de óleo morno, antes de dormir.' },
          { id: 'respiracao', nome: 'Respiração', quando: 'De manhã e/ou antes de dormir, longe das refeições', porQue: 'Acalma a mente e é o recurso mais rápido quando a ansiedade surge.', subpraticas: [
            { nome: 'Nadi Shodhana (respiração alternada) — 5 minutos', passos: ['Coluna ereta, ombros relaxados.', 'Feche a narina direita e inspire pela esquerda.', 'Feche a esquerda e expire pela direita. Inspire pela direita.', 'Feche a direita e expire pela esquerda. Esse é um ciclo; repita.', 'Expire mais longo que inspira. Não prenda o ar.'] },
            ...(respiracaoBhramari ? [{ nome: 'Bhramari (respiração da abelha) — 5 a 7 repetições', passos: ['Olhos fechados, ouvidos tampados com os indicadores.', 'Inspire pelo nariz e expire devagar fazendo “mmmm” com a boca fechada.'] }] : []),
          ] },
          { id: 'alimentacao-consciente', nome: 'Alimentação consciente', quando: 'Nas refeições principais', porQue: 'Quando a refeição acontece com pressa, o corpo não registra que foi nutrido.', passos: ['Sente-se para comer.', 'Antes da primeira garfada, faça três respirações lentas.', 'Guarde o celular durante a refeição.', 'Mastigue com calma e perceba os sabores.'], versaoCurta: '**Dias corridos:** só sentar e respirar três vezes antes de começar.' },
        ],
      },
      chas: {
        introducao: 'Sempre mornos, sem açúcar.',
        itens: unir(...d.map(x => x.chas), [{ id: 'camomila', nome: 'Camomila ou melissa', quando: '1 hora antes de dormir', porQue: 'Preparam o sono.', preparo: 'folhas' }]),
        preparos: {
          folhas: { nome: 'Folhas e flores', texto: '1 colher de chá em 200 ml de água quente, abafar 5 a 10 minutos.', minutos: 7 },
          sementes: { nome: 'Sementes e raízes', texto: '½ colher de chá em 200 ml, ferver 5 minutos em fogo baixo.', minutos: 5 },
        },
      },
      estacao: { titulo: principal.estacao.titulo, introducao: principal.estacao.introducao, ajustes: unir(...d.map(x => x.estacao.ajustes)), termometro: 'Use este termômetro no dia a dia: **ansiedade, secura e cansaço → aqueça e nutra. Irritação e calor → refresque e desacelere. Peso e lentidão → movimente-se e aqueça.**' },
      evitar: unir(...d.map(x => x.evitar)),
      sinais: {
        funcionando: ['Sono mais tranquilo.', 'Digestão mais regular.', 'Mais energia e mente mais calma.', 'Na raspagem, língua mais limpa ao acordar.'],
        funcionandoPrazo: 'em 2 a 4 semanas',
        desequilibrio: d.map(x => x.desequilibrio),
        desequilibrioConclusao: 'Se notar esses sinais, volte às 3 prioridades do início do seu Mapa.',
      },
      proximoEncontro: 'O retorno será agendado em data a combinar. Até lá, o seu diário no app guarda as observações que guiam os próximos ajustes.',
    },
  };
}
