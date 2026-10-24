// Gerado por ferramentas/gerar_padroes.py a partir do conteúdo aprovado da Roberta.
// Partes comuns: diário, check-in, apoio, selos, mensagens, mensagem da semana e alertas.
// Também servem de base para encurtar o link: ele leva só o que for diferente disto.
export const VERSAO_PADROES = 1;
export const PADROES = {
  "diario": {
    "horario": "22:00",
    "itens": [
      {
        "id": "sono",
        "pergunta": "Como foi o sono da noite passada?",
        "tipo": "escala",
        "rotulos": [
          "Muito ruim",
          "Ruim",
          "Regular",
          "Bom",
          "Muito bom"
        ],
        "melhorAlto": true
      },
      {
        "id": "doce",
        "pergunta": "Vontade de doce hoje",
        "tipo": "escala",
        "rotulos": [
          "Nenhuma",
          "Leve",
          "Média",
          "Forte",
          "Muito forte"
        ],
        "melhorAlto": false
      },
      {
        "id": "digestao",
        "pergunta": "Digestão hoje",
        "tipo": "escala",
        "rotulos": [
          "Muito difícil",
          "Difícil",
          "Regular",
          "Boa",
          "Muito boa"
        ],
        "melhorAlto": true
      },
      {
        "id": "energia",
        "pergunta": "Energia hoje",
        "tipo": "escala",
        "rotulos": [
          "Muito baixa",
          "Baixa",
          "Média",
          "Boa",
          "Muito boa"
        ],
        "melhorAlto": true
      },
      {
        "id": "ansiedade",
        "pergunta": "Ansiedade hoje",
        "tipo": "escala",
        "rotulos": [
          "Nenhuma",
          "Leve",
          "Média",
          "Forte",
          "Muito forte"
        ],
        "melhorAlto": false
      },
      {
        "id": "lingua",
        "pergunta": "Língua ao acordar",
        "tipo": "opcoes",
        "opcoes": [
          "Limpa",
          "Camada fina",
          "Camada espessa"
        ]
      },
      {
        "id": "doce-horario",
        "pergunta": "Em que horário foi o doce?",
        "tipo": "opcoes",
        "opcoes": [
          "Até 14h",
          "14h–18h",
          "Depois das 18h"
        ],
        "seNaoMarcou": "sem-doce"
      },
      {
        "id": "doce-quanto",
        "pergunta": "E quanto?",
        "tipo": "opcoes",
        "opcoes": [
          "Um pouco",
          "Uma porção",
          "Mais do que queria"
        ],
        "seNaoMarcou": "sem-doce"
      },
      {
        "id": "fome-acordar",
        "pergunta": "Como estava a sua fome ao acordar?",
        "tipo": "opcoes",
        "opcoes": [
          "Com fome",
          "Pouca fome",
          "Sem fome"
        ]
      },
      {
        "id": "agua-chas",
        "pergunta": "Você tomou água morna e os chás indicados?",
        "tipo": "opcoes",
        "opcoes": [
          "Sim",
          "Em parte",
          "Não"
        ]
      },
      {
        "id": "intestino",
        "pergunta": "O intestino funcionou hoje?",
        "tipo": "opcoes",
        "opcoes": [
          "Sim, bem",
          "Sim, com dificuldade",
          "Não"
        ]
      }
    ],
    "observacao": "Quer anotar algo sobre o dia? (opcional)",
    "semanal": {
      "diaDaSemana": 0,
      "pergunta": "O que foi mais difícil na sua alimentação esta semana? (opcional)"
    }
  },
  "checkin": {
    "refeicoes": [
      "desjejum",
      "almoco",
      "jantar"
    ],
    "perguntas": [
      {
        "id": "seguiu",
        "pergunta": "Você seguiu esta refeição do seu plano?",
        "opcoes": [
          "Sim, no horário",
          "Sim, fora do horário",
          "Não segui",
          "Pulei"
        ]
      },
      {
        "id": "como",
        "pergunta": "Como você comeu?",
        "opcoes": [
          "Sentada e com calma",
          "Com pressa",
          "Com tela ou distraída"
        ],
        "varias": true
      },
      {
        "id": "temperatura",
        "pergunta": "A comida estava…",
        "opcoes": [
          "Quente ou morna",
          "Em temperatura ambiente",
          "Gelada"
        ]
      },
      {
        "id": "sensacao",
        "pergunta": "Como você se sente agora?",
        "opcoes": [
          "Leve e satisfeita",
          "Pesada",
          "Estufada",
          "Ainda com fome",
          "Com azia ou queimação"
        ]
      }
    ],
    "agradecimento": "Anotado. Cada refeição observada ensina o seu corpo — e a você — a encontrar o ritmo."
  },
  "apoio": {
    "botao": "Estou com vontade de doce",
    "abertura": "Tudo bem sentir vontade. Vamos olhar para ela com calma, sem culpa.",
    "pergunta": "É fome ou ansiedade?",
    "opcoes": [
      {
        "id": "fome",
        "texto": "Fome"
      },
      {
        "id": "ansiedade",
        "texto": "Ansiedade"
      },
      {
        "id": "nao-sei",
        "texto": "Não sei"
      }
    ],
    "fome": "Se é fome, o seu corpo está pedindo nutrição de verdade. Faça a refeição prevista no seu plano alimentar para este horário — com calma, sentada.",
    "fomeFechamento": "Bom apetite. Sente-se, respire três vezes e coma devagar: nutrir de verdade é o que acalma a vontade de doce.",
    "pausa": {
      "texto": "Vamos fazer uma pausa de 10 minutos. Escolha o que for mais fácil agora:",
      "escolhas": [
        {
          "id": "bhramari",
          "texto": "Respiração da abelha (Bhramari)",
          "pratica": "respiracao",
          "audio": "pausa-do-doce",
          "passos": [
            "Sente-se ou deite-se, olhos fechados.",
            "Tampe os ouvidos com os indicadores.",
            "Inspire pelo nariz e expire devagar fazendo “mmmm” com a boca fechada.",
            "Repita 5 a 7 vezes e depois apenas respire, observando."
          ]
        },
        {
          "id": "agua-erva-doce",
          "texto": "Água morna com erva-doce",
          "passos": [
            "Prepare uma xícara de água morna com erva-doce.",
            "Beba sentada, em goles lentos, sem celular.",
            "Entre um gole e outro, respire devagar."
          ]
        }
      ],
      "minutos": 10
    },
    "perguntaFinal": "Como está a vontade agora?",
    "desfechos": [
      {
        "id": "passou",
        "texto": "Passou",
        "resposta": "Que bonito. Você deu ao corpo o que ele pedia de verdade: calma. Vata agradece."
      },
      {
        "id": "diminuiu",
        "texto": "Diminuiu",
        "resposta": "A pausa já fez efeito. Se a vontade voltar, você sabe o caminho."
      },
      {
        "id": "continua",
        "texto": "Continua",
        "resposta": "Coma com calma, sentada, sem culpa. Uma porção pequena, devagar e com prazer."
      }
    ],
    "horarioSobremesa": {
      "inicio": "11:30",
      "fim": "14:00",
      "texto": "Agora é horário do almoço: este é o melhor momento para a sobremesa. O fogo digestivo está no auge."
    }
  },
  "selos": [
    {
      "id": "primeiro-amanhecer",
      "nome": "Primeiro amanhecer",
      "simbolo": "sol",
      "texto": "Sua primeira manhã completa.",
      "criterio": {
        "tipo": "periodo",
        "periodo": "manha",
        "dias": 1
      }
    },
    {
      "id": "lotus-completo",
      "nome": "Lótus completo",
      "simbolo": "lotus",
      "texto": "Sua primeira flor totalmente aberta.",
      "criterio": {
        "tipo": "florCompleta",
        "dias": 1
      }
    },
    {
      "id": "lingua-limpa",
      "nome": "Língua limpa",
      "simbolo": "gota",
      "texto": "7 manhãs de raspagem da língua.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "raspagem"
        ],
        "dias": 7
      }
    },
    {
      "id": "fogo-desperto",
      "nome": "Fogo desperto",
      "simbolo": "chama",
      "texto": "7 manhãs de água morna ao acordar.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "agua-manha"
        ],
        "dias": 7
      }
    },
    {
      "id": "sete-abhyanga",
      "nome": "7 dias de Abhyanga",
      "simbolo": "folha",
      "texto": "7 dias de automassagem com óleo morno.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "abhyanga"
        ],
        "dias": 7
      }
    },
    {
      "id": "tarde-serena",
      "nome": "Tarde serena",
      "simbolo": "lua",
      "texto": "7 tardes sem doce fora de hora.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "sem-doce"
        ],
        "dias": 7
      }
    },
    {
      "id": "pes-aquecidos",
      "nome": "Pés aquecidos",
      "simbolo": "folha",
      "texto": "7 noites de pés com óleo e respiração.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "pes-respiracao"
        ],
        "dias": 7
      }
    },
    {
      "id": "ritmo-de-kapha",
      "nome": "Ritmo de Kapha",
      "simbolo": "lua",
      "texto": "7 noites deitando até as 22h30.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "deitar"
        ],
        "dias": 7
      }
    },
    {
      "id": "cha-que-fecha",
      "nome": "Chá que fecha a refeição",
      "simbolo": "gota",
      "texto": "14 chás de erva-doce depois das refeições.",
      "criterio": {
        "tipo": "item",
        "itens": [
          "cha-almoco",
          "jantar"
        ],
        "dias": 14
      }
    },
    {
      "id": "fogo-equilibrado",
      "nome": "Fogo equilibrado",
      "simbolo": "chama",
      "texto": "14 dias com todas as refeições seguidas no horário.",
      "criterio": {
        "tipo": "refeicoes",
        "dias": 14
      }
    },
    {
      "id": "mesa-serena",
      "nome": "Mesa serena",
      "simbolo": "folha",
      "texto": "10 refeições comidas com calma.",
      "criterio": {
        "tipo": "checkinCalma",
        "dias": 10
      }
    },
    {
      "id": "morno-nunca-gelado",
      "nome": "Morno, nunca gelado",
      "simbolo": "chama",
      "texto": "14 refeições quentes ou mornas.",
      "criterio": {
        "tipo": "checkinMorno",
        "dias": 14
      }
    },
    {
      "id": "pausa-que-acalma",
      "nome": "Pausa que acalma",
      "simbolo": "lotus",
      "texto": "5 vezes em que a vontade de doce passou depois da pausa.",
      "criterio": {
        "tipo": "apoioPassou",
        "dias": 5
      }
    },
    {
      "id": "diario-fiel",
      "nome": "Diário fiel",
      "simbolo": "estrela",
      "texto": "14 dias de diário preenchido.",
      "criterio": {
        "tipo": "diario",
        "dias": 14
      }
    },
    {
      "id": "lua-inteira",
      "nome": "Lua inteira",
      "simbolo": "lua",
      "texto": "30 dias usando o app.",
      "criterio": {
        "tipo": "diasDeUso",
        "dias": 30
      }
    },
    {
      "id": "uma-estacao",
      "nome": "Uma estação inteira",
      "simbolo": "sol",
      "texto": "90 dias usando o app.",
      "criterio": {
        "tipo": "diasDeUso",
        "dias": 90
      }
    }
  ],
  "mensagens": {
    "florCompleta": [
      "Sua flor se abriu por inteiro hoje. Cada cuidado deu ritmo ao seu dia — e ritmo é o que mais acalma Vata. — Rose",
      "Um dia completo. O corpo registra essa regularidade: é ela que traz sono mais tranquilo e menos busca pelo doce. — Rose",
      "Flor aberta. Hoje você nutriu o corpo nos horários certos, e Vata encontrou chão. Descanse bem. — Rose"
    ],
    "seloGanho": [
      "Você conquistou “{selo}”. Constância é o remédio mais delicado do Ayurveda — e você está praticando. — Rose",
      "“{selo}” é seu. Cada repetição ensina o corpo a confiar no ritmo. Siga no seu tempo. — Rose",
      "Novo selo: “{selo}”. Não é sobre perfeição, é sobre voltar ao cuidado todos os dias. Bonito de ver. — Rose"
    ],
    "primeiraSemana": [
      "Uma semana de cuidado. O corpo começa a reconhecer o ritmo — e é o ritmo que mais acalma Vata. Siga no seu tempo. — Rose",
      "Sete dias desde o começo. Cada manhã com água morna e cada noite com os pés aquecidos ensinam o corpo a confiar. — Rose",
      "Primeira semana completa. Não importa quantos itens você marcou: importa que você voltou ao cuidado nos dias que pôde. — Rose"
    ],
    "volta": [
      "Que bom ter você de volta. No Ayurveda, voltar ao ritmo já é o remédio — não precisa recomeçar do zero, só do próximo cuidado. — Rose",
      "Dias fora da rotina acontecem. Comece hoje pelo mais simples: água morna ao acordar e os pés com óleo à noite. — Rose",
      "Você voltou, e isso é o que importa. Vata se acalma com regularidade, não com perfeição. Um cuidado de cada vez. — Rose"
    ],
    "diaDificil": [
      "Ontem foi um dia mais difícil, e tudo bem. Nos dias corridos, escolha um só cuidado que traga chão: os pés com óleo antes de dormir já mudam a noite. — Rose",
      "Dias com menos cuidados também fazem parte. Vata se acalma com gentileza, não com cobrança. Hoje é um novo dia. — Rose",
      "Quando o dia aperta, volte às 3 prioridades do seu Mapa: ritmo, calor e desacelerar à noite. Basta uma delas para começar. — Rose"
    ],
    "tardeSemDoce": [
      "Sua tarde sem doce fora de hora mostra Vata mais calmo. O ritmo das refeições está sustentando você. — Rose",
      "Uma tarde serena, depois de dias com doce. O lanche das 15h e o chá morno fizeram a parte deles: nutrir antes de a vontade chegar. — Rose",
      "Hoje a tarde passou sem doce fora de hora. Não é força de vontade: é o corpo nutrido no horário certo, encontrando chão. — Rose"
    ]
  },
  "semana": {
    "aberturas": [
      "Mais uma semana do seu acompanhamento chega ao fim.",
      "Domingo à noite: um bom momento para olhar a semana com carinho.",
      "Antes de começar uma nova semana, vamos olhar para esta.",
      "Mais sete dias de cuidado com você."
    ],
    "destaques": {
      "melhoraSobe": "{indicador} melhorou: a média foi de {antes} para {depois} nesta semana. O corpo está respondendo.",
      "melhoraDesce": "{indicador} diminuiu: a média foi de {antes} para {depois} nesta semana. O corpo está respondendo.",
      "menosApoio": "Você precisou do botão de apoio {depois} {vezes} nesta semana, contra {antes} na semana anterior. A vontade está ficando mais fácil de atravessar.",
      "selo": "Nesta semana você conquistou o selo “{selo}”. Constância é o que transforma.",
      "itemConstante": "O cuidado mais presente da semana foi {item}: {dias} de 7 dias. É essa repetição que ensina o corpo a confiar no ritmo."
    },
    "nomesIndicadores": {
      "sono": "O seu sono",
      "doce": "A vontade de doce",
      "digestao": "A sua digestão",
      "energia": "A sua energia",
      "ansiedade": "A ansiedade"
    },
    "nomesItens": {
      "raspagem": "a raspagem da língua",
      "abhyanga": "a automassagem",
      "desjejum": "o desjejum",
      "almoco": "o almoço",
      "cha-almoco": "o chá morno depois do almoço",
      "lanche-tarde": "o lanche da tarde",
      "sem-doce": "a tarde sem doce fora de hora",
      "jantar": "o jantar",
      "pes-respiracao": "os pés com óleo e a respiração",
      "deitar": "deitar até as 22h30",
      "agua-manha": "a água morna ao acordar"
    },
    "padroes": {
      "calma": "Um padrão apareceu: nos dias em que você comeu com calma, a vontade de doce foi menor ({a} contra {b}). Comer com presença nutre de verdade.",
      "abhyanga": "Nos dias com automassagem, a vontade de doce foi menor ({a} contra {b}). O óleo morno acalma Vata, e um Vata calmo pede menos doce.",
      "sono": "Depois das noites com pés com óleo, o seu sono foi melhor ({a} contra {b}). Desacelerar à noite protege o descanso.",
      "morno": "Depois das refeições mornas, você se sentiu leve e satisfeita com mais frequência ({a}% contra {b}%). Vata agradece o calor.",
      "doceTarde": "O doce fora de hora apareceu mais entre 14h e 18h — o horário de Vata. O lanche das 15h, morno e nutritivo, é o seu melhor aliado."
    },
    "focos": {
      "raspagem": "a raspagem da língua, logo ao acordar. Ela mostra, todo dia, como está a sua digestão.",
      "abhyanga": "a automassagem com óleo morno. Nos dias corridos, só os pés antes de dormir já ajudam.",
      "desjejum": "o desjejum morno, no horário. Começar o dia nutrida é o que mais sustenta Vata até o almoço.",
      "almoco": "o almoço com calma: sente-se e respire três vezes antes de começar.",
      "cha-almoco": "o chá morno depois do almoço. Ele fecha a refeição e ajuda a digestão.",
      "lanche-tarde": "o lanche das 15h, nutritivo e morno. Ele chega antes da vontade de doce.",
      "sem-doce": "as tardes. Se quiser um doce, que seja logo depois do almoço, quando o fogo digestivo está no auge.",
      "jantar": "o jantar leve e cozido, no início da noite.",
      "pes-respiracao": "os pés com óleo e a respiração antes de dormir. É o que mais protege o seu sono.",
      "deitar": "deitar até as 22h30, sempre que der. O período de Kapha ajuda a pegar no sono.",
      "agua-manha": "a água morna ao acordar. Ela desperta o fogo digestivo com suavidade e marca o início do dia."
    },
    "foco": "Para a próxima semana, um foco: {foco}",
    "focoComDias": "Nesta semana foram {dias} de 7 dias — cada dia a mais já conta.",
    "fechamentos": [
      "Siga no seu tempo. — Rose",
      "Um cuidado de cada vez. — Rose",
      "Com carinho, — Rose"
    ],
    "retomada": [
      "Esta semana teve poucos registros, e tudo bem: a vida às vezes pede outra coisa. Na próxima, comece pelo mais simples — água morna ao acordar e os pés com óleo à noite. O ritmo volta aos poucos. — Rose",
      "Uma semana mais corrida. Não há nada a recuperar: há só o próximo cuidado. Escolha um para amanhã e deixe o resto vir com o tempo. — Rose",
      "Semanas assim fazem parte. Vata se acalma com gentileza, não com cobrança. Que tal recomeçar pelas 3 prioridades do seu Mapa: ritmo, calor e desacelerar à noite? — Rose"
    ]
  },
  "alertas": [
    {
      "id": "primavera-quente-2026",
      "inicio": "2026-11-01",
      "fim": "2026-12-20",
      "titulo": "O calor está chegando",
      "texto": "Com os dias mais quentes, Pitta começa a subir. Prefira coentro e erva-doce, reduza gengibre e especiarias fortes e evite o sol entre 10h e 14h. Morno continua sendo a regra — refrescar não é o mesmo que gelar."
    },
    {
      "id": "verao-2026",
      "inicio": "2026-12-21",
      "fim": "2027-03-20",
      "titulo": "Verão: estação de Pitta",
      "texto": "Nos dias muito quentes, troque o óleo de amêndoas por girassol ou amêndoas com coco. Chá de coentro em sementes refresca Pitta. Ansiedade, secura e cansaço → aqueça e nutra; irritação e calor → refresque e desacelere."
    },
    {
      "id": "outono-2027",
      "inicio": "2027-03-21",
      "fim": "2027-06-20",
      "titulo": "Outono: Vata volta a pedir cuidado",
      "texto": "Com o fim do calor e o vento mais seco, volte ao óleo de amêndoas puro e, nos dias frios, amêndoas com um pouco de gergelim. Mais sopas e preparos mornos e úmidos."
    },
    {
      "id": "inverno-2027",
      "inicio": "2027-06-21",
      "fim": "2027-09-22",
      "titulo": "Inverno: aqueça e nutra",
      "texto": "Nos dias frios, amêndoas com gergelim na automassagem e gengibre fresco só de dia. Água morna com erva-doce, cominho e cardamomo ao longo do dia previne a ansiedade noturna."
    },
    {
      "id": "primavera-2027",
      "inicio": "2027-09-23",
      "fim": "2027-10-31",
      "titulo": "Primavera: leveza e movimento",
      "texto": "Com a primavera, o corpo pede leveza. Mantenha as refeições mornas e em horários fixos, e aproveite os dias mais longos para um movimento suave ao ar livre, longe do sol forte."
    }
  ]
};
