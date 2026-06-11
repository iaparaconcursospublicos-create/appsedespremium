import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const KIWIFY_CHECKOUT = "https://pay.kiwify.com.br/AJzXcrT";
const MEMBERS_AREA    = "https://members.kiwify.com/?club=2e03c86a-5591-40b1-835b-64e106456539";
const WHATSAPP_NUMBER = "5561991722559";
const WHATSAPP_MSG    = encodeURIComponent("Olá! Tenho uma dúvida sobre o Missão SEDES.");
const WHATSAPP_LINK   = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;
const SHEETS_URL      = "https://script.google.com/macros/s/AKfycbyOAnO--AZZeZ19tqVyOjDtlDGcQK8Bf3m1IxuwK-pt_AvaM87mGqzpkIi1WXtQNqYv5g/exec";
const VSL_SECONDS     = 274; // Duração total: 4min34s
const VSL_PITCH_SEC   = 204; // Pitch aparece em: 3min24s
const VSL_WA_SEC      = 194; // WhatsApp aparece 10s antes do pitch
const DATA_PROVA      = new Date("2026-09-06");

// ─── PALETA (baseada na identidade visual da logo) ────────────────────────────
const C = {
  navy:    "#1B2E4B",
  blue:    "#2563EB",
  blueL:   "#EFF6FF",
  green:   "#059669",
  greenL:  "#ECFDF5",
  amber:   "#D97706",
  amberL:  "#FFFBEB",
  gray50:  "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  gray800: "#1E293B",
  white:   "#FFFFFF",
};

// ─── CARGOS ───────────────────────────────────────────────────────────────────
const CARGOS = [
  { id: "agente",   label: "Agente Social",          codigo: "Cargo 200" },
  { id: "cuidador", label: "Cuidador Social",         codigo: "Cargo 201" },
  { id: "tecnico",  label: "Técnico Administrativo",  codigo: "Cargo 202" },
];

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
// Pergunta 0 é especial: captura de lead (nome + whatsapp) — antes do diagnóstico
const PERGUNTAS = [
  {
    id: 1,
    texto: "Qual cargo você vai prestar?",
    subtexto: "A plataforma é exclusiva para cargos de nível médio.",
    opcoes: CARGOS.map(c => ({ valor: c.id, label: `${c.label} (${c.codigo})` })),
  },
  {
    id: 2,
    texto: "Há quanto tempo você estuda para concursos?",
    opcoes: [
      { valor: "nunca",  label: "Nunca estudei" },
      { valor: "pouco",  label: "Menos de 3 meses" },
      { valor: "medio",  label: "3 a 12 meses" },
      { valor: "muito",  label: "Mais de 1 ano" },
    ],
  },
  {
    id: 3,
    texto: "Quantas horas por dia você consegue estudar?",
    opcoes: [
      { valor: "menos1", label: "Menos de 1 hora" },
      { valor: "1a2",    label: "1 a 2 horas" },
      { valor: "2a4",    label: "2 a 4 horas" },
      { valor: "mais4",  label: "Mais de 4 horas" },
    ],
  },
  {
    id: 4,
    texto: "Como você se sente em relação ao conteúdo do edital?",
    opcoes: [
      { valor: "perdido",   label: "Completamente perdido" },
      { valor: "iniciando", label: "Sei o que estudar mas não sei como" },
      { valor: "andamento", label: "Já comecei mas não tenho disciplina" },
      { valor: "avancado",  label: "Estou avançado e preciso de foco" },
    ],
  },
  {
    id: 5,
    texto: "Qual é o seu maior desafio hoje?",
    opcoes: [
      { valor: "tempo",     label: "Falta de tempo para estudar" },
      { valor: "direcao",   label: "Não sei por onde começar" },
      { valor: "motivacao", label: "Falta de motivação e constância" },
      { valor: "conteudo",  label: "Dificuldade com o conteúdo" },
    ],
  },
];

// ─── NÍVEL ────────────────────────────────────────────────────────────────────
function calcularNivel(r) {
  const exp = r[1], horas = r[2], feel = r[3];
  if (exp === "muito" && (horas === "2a4" || horas === "mais4") && feel === "avancado") return "AVANÇADO";
  if (exp === "nunca" || feel === "perdido") return "INICIANTE";
  return "INTERMEDIÁRIO";
}
function getNivelInfo(nivel) {
  return {
    "INICIANTE":     { emoji: "🌱", cor: C.amber,  bg: C.amberL, titulo: "Você está no começo — e isso é uma vantagem." },
    "INTERMEDIÁRIO": { emoji: "🚀", cor: C.blue,   bg: C.blueL,  titulo: "Você tem base. Falta organização e foco." },
    "AVANÇADO":      { emoji: "🏆", cor: C.green,  bg: C.greenL, titulo: "Você está à frente. Hora de refinar e vencer." },
  }[nivel] || { emoji: "🚀", cor: C.blue, bg: C.blueL, titulo: "Falta organização e foco." };
}

// ─── CRONOGRAMA COMPLETO (baseado no Radar da Aprovação) ─────────────────────
function gerarCronograma(cargo, dataInicio) {
  const hoje = dataInicio || new Date();
  const diasAteProva = Math.max(1, Math.floor((DATA_PROVA - hoje) / (1000 * 60 * 60 * 24)));
  const semanasTotal = Math.min(20, Math.max(4, Math.floor(diasAteProva / 7)));

  // Blocos em ordem de prioridade conforme Radar da Aprovação
  const blocos = [
    // SEMANA 1 — Metodologia + início Língua Portuguesa ALTÍSSIMA
    {
      semana: 1, bloco: "Metodologia + Língua Portuguesa",
      dias: [
        { dia: "Seg", materia: "Metodologia",       topico: "Boas-vindas + Caderno de Erros + IA no estudo", prioridade: "—" },
        { dia: "Ter", materia: "Língua Portuguesa",  topico: "Interpretação e compreensão de textos",          prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Língua Portuguesa",  topico: "Coesão, coerência textual e conectivos",         prioridade: "ALTÍSSIMA" },
        { dia: "Qui", materia: "Língua Portuguesa",  topico: "Concordância verbal e nominal",                  prioridade: "ALTA" },
        { dia: "Sex", materia: "Língua Portuguesa",  topico: "Reescrita de frases e sinonímia",                prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",            topico: "Questões de LP + Caderno de Erros",              prioridade: "—" },
      ],
    },
    // SEMANA 2 — LP continuação + Radar (pronomes, ortografia)
    {
      semana: 2, bloco: "Língua Portuguesa — continuação",
      dias: [
        { dia: "Seg", materia: "Língua Portuguesa", topico: "Emprego de pronomes e colocação pronominal",  prioridade: "ALTA" },
        { dia: "Ter", materia: "Língua Portuguesa", topico: "Ortografia oficial",                          prioridade: "ALTA" },
        { dia: "Qua", materia: "Língua Portuguesa", topico: "Regência verbal e nominal",                   prioridade: "MÉDIA" },
        { dia: "Qui", materia: "Língua Portuguesa", topico: "Sinais de pontuação e crase",                 prioridade: "MÉDIA" },
        { dia: "Sex", materia: "Língua Portuguesa", topico: "Tempos/modos verbais + Tipos textuais",       prioridade: "MÉDIA" },
        { dia: "Sáb", materia: "Revisão",           topico: "Simulado LP + Caderno de Erros",              prioridade: "—" },
      ],
    },
    // SEMANA 3 — Conhecimentos do DF (ALTÍSSIMA: Lei Maria da Penha + LC 840)
    {
      semana: 3, bloco: "Conhecimentos do DF — Leis Prioritárias",
      dias: [
        { dia: "Seg", materia: "Conhec. do DF", topico: "Lei Maria da Penha — Lei 11.340/2006 (Parte 1)", prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Conhec. do DF", topico: "Lei Maria da Penha — Lei 11.340/2006 (Parte 2)", prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Conhec. do DF", topico: "LC 840/2011 — Regime Jurídico Servidores DF (I)", prioridade: "ALTÍSSIMA" },
        { dia: "Qui", materia: "Conhec. do DF", topico: "LC 840/2011 — Títulos V, VI e VII",               prioridade: "ALTÍSSIMA" },
        { dia: "Sex", materia: "Conhec. do DF", topico: "Lei Distrital 7.484/2024 — Carreira SEDES",       prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",       topico: "Questões Lei Maria da Penha + LC 840",            prioridade: "—" },
      ],
    },
    // SEMANA 4 — Conhecimentos do DF (Lei Orgânica, PDPM, Primeiros Socorros)
    {
      semana: 4, bloco: "Conhecimentos do DF — Legislação e Políticas",
      dias: [
        { dia: "Seg", materia: "Conhec. do DF", topico: "Lei Orgânica do DF — Título VI (Ordem Social)",  prioridade: "ALTA" },
        { dia: "Ter", materia: "Conhec. do DF", topico: "Plano Distrital de Política para Mulheres",      prioridade: "ALTA" },
        { dia: "Qua", materia: "Conhec. do DF", topico: "Noções de Primeiros Socorros (engasgo, PCR...)", prioridade: "ALTA" },
        { dia: "Qui", materia: "Conhec. do DF", topico: "Realidade socioeconômica e geográfica do DF",   prioridade: "MÉDIA" },
        { dia: "Sex", materia: "Revisão Bloco 1", topico: "Simulado Conhecimentos Gerais completo",       prioridade: "—" },
        { dia: "Sáb", materia: "Revisão",         topico: "Caderno de Erros + Checklist Bloco 1",        prioridade: "—" },
      ],
    },
    // SEMANA 5 — SUAS e PNAS (ALTÍSSIMA)
    {
      semana: 5, bloco: "Fundamentos do SUAS — Bloco 2",
      dias: [
        { dia: "Seg", materia: "SUAS / PNAS", topico: "PNAS/2004 — princípios, diretrizes, proteções básica e especial (Parte 1)", prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "SUAS / PNAS", topico: "PNAS/2004 — proteção social básica e especial (Parte 2)",                   prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "SUAS / PNAS", topico: "NOB/SUAS 2012 — responsabilidades dos entes e gestão do trabalho",         prioridade: "ALTÍSSIMA" },
        { dia: "Qui", materia: "SUAS / PNAS", topico: "Seguranças socioassistenciais: acolhida, convívio, renda, autonomia",      prioridade: "ALTA" },
        { dia: "Sex", materia: "SUAS / PNAS", topico: "Matricialidade sociofamiliar e territorialização",                         prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",     topico: "Questões SUAS/PNAS + Caderno de Erros",                                    prioridade: "—" },
      ],
    },
    // SEMANA 6 — Programas e Benefícios DF
    {
      semana: 6, bloco: "Programas e Benefícios do DF",
      dias: [
        { dia: "Seg", materia: "Programas DF", topico: "Plano DF Social — Lei 7.008/2021",                      prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Programas DF", topico: "Cartão Prato Cheio — Lei 7.009/2021",                   prioridade: "ALTA" },
        { dia: "Qua", materia: "Programas DF", topico: "Benefícios Eventuais da AS do DF — Lei 5.165/2013",     prioridade: "ALTA" },
        { dia: "Qui", materia: "Programas DF", topico: "Cartão Gás — Lei 6.938/2021 + SISAN/Rest. Comunitário", prioridade: "MÉDIA" },
        { dia: "Sex", materia: "Programas DF", topico: "Financiamento e cofinanciamento do SUAS",               prioridade: "MÉDIA" },
        { dia: "Sáb", materia: "Revisão",      topico: "Simulado Bloco 2 Comum + Caderno de Erros",             prioridade: "—" },
      ],
    },
  ];

  // Semanas específicas por cargo (a partir da semana 7)
  const especificoAgente = [
    {
      semana: 7, bloco: "Específico — Agente Social (1)",
      dias: [
        { dia: "Seg", materia: "Agente Social", topico: "CRAS e CREAS — organização e funcionamento",            prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Agente Social", topico: "PAIF e SCFV — objetivos e público-alvo",               prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Agente Social", topico: "Abordagem social e pop. em situação de rua / Dec. 7.053/2009", prioridade: "ALTA" },
        { dia: "Qui", materia: "Agente Social", topico: "Fluxos de referência e contrarreferência no SUAS",     prioridade: "ALTA" },
        { dia: "Sex", materia: "Agente Social", topico: "Proteção Social Especial — risco e violação de direitos", prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",       topico: "Questões Agente Social + Caderno de Erros",            prioridade: "—" },
      ],
    },
    {
      semana: 8, bloco: "Específico — Agente Social (2)",
      dias: [
        { dia: "Seg", materia: "Agente Social", topico: "Saúde mental, redução de danos e sofrimento psíquico", prioridade: "MÉDIA" },
        { dia: "Ter", materia: "Agente Social", topico: "Articulação intersetorial: saúde, educação, justiça",  prioridade: "MÉDIA" },
        { dia: "Qua", materia: "Revisão Geral",  topico: "Resolução Extra de Exercícios",                 prioridade: "—" },
        { dia: "Qui", materia: "Revisão Geral",  topico: "Caderno de Erros — revisar erros acumulados",         prioridade: "—" },
        { dia: "Sex", materia: "Redação",         topico: "Método Redação Nota 10 — estrutura dissertativo-argumentativa", prioridade: "ALTA" },
        { dia: "Sáb", materia: "Simulado",        topico: "Simulado cronometrado — prova completa",             prioridade: "—" },
      ],
    },
  ];

  const especificoCuidador = [
    {
      semana: 7, bloco: "Específico — Cuidador Social (1)",
      dias: [
        { dia: "Seg", materia: "Cuidador Social", topico: "Res. Conjunta CNAS/CONANDA 1/2009 — orientações para acolhimento", prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Cuidador Social", topico: "Rotinas humanizadas: higiene, alimentação, autonomia dos usuários", prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Cuidador Social", topico: "Princípios do acolhimento: excepcionalidade, provisoriedade",      prioridade: "ALTA" },
        { dia: "Qui", materia: "Cuidador Social", topico: "Plano Nacional de Convivência Familiar e Comunitária",             prioridade: "ALTA" },
        { dia: "Sex", materia: "Cuidador Social", topico: "Trabalho em equipe interdisciplinar e atribuições do cuidador",   prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",         topico: "Questões Cuidador Social + Caderno de Erros",                    prioridade: "—" },
      ],
    },
    {
      semana: 8, bloco: "Específico — Cuidador Social (2)",
      dias: [
        { dia: "Seg", materia: "Cuidador Social", topico: "Saúde mental, redução de danos e abordagem humanizada",  prioridade: "MÉDIA" },
        { dia: "Ter", materia: "Revisão Geral",   topico: "Resolução Extra de Exercícios",                   prioridade: "—" },
        { dia: "Qua", materia: "Revisão Geral",   topico: "Caderno de Erros — revisar erros acumulados",           prioridade: "—" },
        { dia: "Qui", materia: "Redação",          topico: "Método Redação Nota 10 — estrutura dissertativo-argumentativa", prioridade: "ALTA" },
        { dia: "Sex", materia: "Simulado",         topico: "Simulado cronometrado — prova completa",               prioridade: "—" },
        { dia: "Sáb", materia: "Revisão",          topico: "Caderno de Erros final + reforço pontos fracos",       prioridade: "—" },
      ],
    },
  ];

  const especificoTecnico = [
    {
      semana: 7, bloco: "Específico — Técnico Administrativo (1)",
      dias: [
        { dia: "Seg", materia: "Téc. Administrativo", topico: "Ato administrativo: conceito, requisitos, atributos, anulação", prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Téc. Administrativo", topico: "LC 840/2011 — provimento, vacância e PAD",                      prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Téc. Administrativo", topico: "Lei 14.133/2021 — licitações e contratos (noções básicas)",     prioridade: "ALTA" },
        { dia: "Qui", materia: "Téc. Administrativo", topico: "Arquivologia: protocolo, métodos, digitalização",               prioridade: "ALTA" },
        { dia: "Sex", materia: "Téc. Administrativo", topico: "Redação oficial e comunicações administrativas",                prioridade: "ALTA" },
        { dia: "Sáb", materia: "Revisão",             topico: "Questões Técnico Administrativo + Caderno de Erros",           prioridade: "—" },
      ],
    },
    {
      semana: 8, bloco: "Específico — Técnico Administrativo (2)",
      dias: [
        { dia: "Seg", materia: "Téc. Administrativo", topico: "Administração de materiais: classificação, estoques, patrimônio", prioridade: "MÉDIA" },
        { dia: "Ter", materia: "Téc. Administrativo", topico: "Princípios constitucionais da Administração Pública",             prioridade: "MÉDIA" },
        { dia: "Qua", materia: "Revisão Geral",        topico: "Resolução Extra de Exercícios",                           prioridade: "—" },
        { dia: "Qui", materia: "Redação",               topico: "Método Redação Nota 10 — estrutura dissertativo-argumentativa", prioridade: "ALTA" },
        { dia: "Sex", materia: "Simulado",              topico: "Simulado cronometrado — prova completa",                       prioridade: "—" },
        { dia: "Sáb", materia: "Revisão",               topico: "Caderno de Erros final + reforço pontos fracos",              prioridade: "—" },
      ],
    },
  ];

  // Semanas de reta final (9 em diante)
  const retaFinal = Array.from({ length: Math.max(0, semanasTotal - 8) }, (_, i) => {
    const s = i + 9;
    return {
      semana: s, bloco: `Reta Final — Semana ${s}`,
      dias: [
        { dia: "Seg", materia: "Revisão Bloco 1",  topico: "LP + Conhec. DF — questões de alta prioridade",   prioridade: "ALTÍSSIMA" },
        { dia: "Ter", materia: "Revisão Bloco 2",  topico: "SUAS/PNAS + Programas DF — reforço",              prioridade: "ALTÍSSIMA" },
        { dia: "Qua", materia: "Específico",       topico: "Revisão tópicos de ALTÍSSIMA prioridade do cargo", prioridade: "ALTÍSSIMA" },
        { dia: "Qui", materia: "Caderno de Erros", topico: "Revisar todos os erros acumulados",               prioridade: "—" },
        { dia: "Sex", materia: "Redação",          topico: i === 0 ? "Podcast SUAS em 10 min + Flashcards" : "Treino de redação dissertativo-argumentativa", prioridade: "ALTA" },
        { dia: "Sáb", materia: "Simulado",         topico: "Simulado cronometrado + revisão de erros",        prioridade: "—" },
      ],
    };
  });

  const especifico = cargo === "agente" ? especificoAgente : cargo === "cuidador" ? especificoCuidador : especificoTecnico;
  const todasSemanas = [...blocos, ...especifico, ...retaFinal].slice(0, semanasTotal);
  return { semanas: todasSemanas, semanasTotal, diasAteProva };
}

// ─── FORMATAR SEMANA como texto para copiar ───────────────────────────────────
function cronogramaParaTexto(semanas, cargoLabel, nome) {
  const linhas = [
    `📅 CRONOGRAMA PERSONALIZADO — MISSÃO SEDES-DF 2026`,
    `👤 ${nome || "Candidato"}`,
    `🎯 Cargo: ${cargoLabel}`,
    `📆 Prova: 06/09/2026`,
    ``,
  ];
  semanas.forEach(s => {
    linhas.push(`━━━ SEMANA ${s.semana} — ${s.bloco} ━━━`);
    s.dias.forEach(d => {
      linhas.push(`${d.dia}: [${d.prioridade}] ${d.materia} → ${d.topico}`);
    });
    linhas.push(``);
  });
  return linhas.join("\n");
}

// ═════════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tela, setTela]               = useState("quiz");
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [respostas, setRespostas]     = useState({});
  const [nome, setNome]               = useState("");
  const [whatsapp, setWhatsapp]       = useState("");
  const [nivel, setNivel]             = useState("");
  const [cargo, setCargo]             = useState("agente");
  const [vslProgress, setVslProgress] = useState(0);
  const [pitchVisivel, setPitchVisivel]             = useState(false);
  const [whatsappBtnVisivel, setWhatsappBtnVisivel] = useState(false);
  const [copiado, setCopiado]         = useState(false);
  const vslTimer = useRef(null);

  // Detectar página de obrigado via URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("obrigado") === "true") {
      setNome(p.get("nome") || "");
      setCargo(p.get("cargo") || "agente");
      setNivel(p.get("nivel") || "INTERMEDIÁRIO");
      setTela("obrigado");
    }
  }, []);

  // Timer VSL
  useEffect(() => {
    if (tela !== "vsl") return;
    setVslProgress(0); setPitchVisivel(false); setWhatsappBtnVisivel(false);
    let seg = 0;
    vslTimer.current = setInterval(() => {
      seg++;
      setVslProgress(Math.min((seg / VSL_SECONDS) * 100, 100));
      if (seg >= VSL_WA_SEC) setWhatsappBtnVisivel(true);
      if (seg >= VSL_PITCH_SEC) { clearInterval(vslTimer.current); setPitchVisivel(true); }
    }, 1000);
    return () => clearInterval(vslTimer.current);
  }, [tela]);

  function responder(valor) {
    const novas = { ...respostas, [perguntaIdx]: valor };
    setRespostas(novas);
    if (perguntaIdx === 0) setCargo(valor);
    if (perguntaIdx < PERGUNTAS.length - 1) { setPerguntaIdx(i => i + 1); }
    else { setNivel(calcularNivel(novas)); setTela("diagnostico"); }
  }

  // Chamada ao clicar "Quero meu cronograma" no diagnóstico — vai direto para VSL
  function irParaVSL() {
    setTela("vsl");
    // dispara envio em background sem bloquear navegação
    try {
      const cargoLabel = CARGOS.find(c => c.id === cargo)?.label || cargo;
      fetch(SHEETS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), telefone: whatsapp.trim(), cargo: cargoLabel, nivel, data: new Date().toLocaleString("pt-BR"), timestamp: new Date().toISOString(), origem: "funil_sedes" }) });
    } catch (e) { console.error(e); }
  }

  function copiarCronograma(semanas, cargoLabel) {
    const txt = cronogramaParaTexto(semanas, cargoLabel, nome);
    navigator.clipboard.writeText(txt).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 3000); });
  }

  const nivelInfo  = getNivelInfo(nivel);
  const cargoLabel = CARGOS.find(c => c.id === cargo)?.label || "";
  const { semanas, diasAteProva } = gerarCronograma(cargo, new Date());

  return (
    <div style={S.root}>
      {tela === "quiz"        && <TelaQuiz perguntaIdx={perguntaIdx} responder={responder} />}
      {tela === "diagnostico" && <TelaDiagnostico nivel={nivel} nivelInfo={nivelInfo} cargoLabel={cargoLabel} nome={nome} setNome={setNome} whatsapp={whatsapp} setWhatsapp={setWhatsapp} onIr={irParaVSL} enviando={false} />}
      {tela === "vsl" && (
        <TelaVSL nome={nome} nivel={nivel} nivelInfo={nivelInfo} cargoLabel={cargoLabel}
          vslProgress={vslProgress} pitchVisivel={pitchVisivel} whatsappBtnVisivel={whatsappBtnVisivel}
          semanas={semanas} onComprar={() => window.open(KIWIFY_CHECKOUT, "_blank")} />
      )}
      {tela === "obrigado" && (
        <TelaObrigado nome={nome} nivel={nivel} cargoLabel={cargoLabel}
          semanas={semanas} diasAteProva={diasAteProva}
          copiado={copiado} onCopiar={() => copiarCronograma(semanas, cargoLabel)} />
      )}

      {/* Botão WhatsApp flutuante */}
      {tela === "vsl" && whatsappBtnVisivel && (
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={S.waFixed}>
          <WhatsAppIcon /><span style={{ fontSize: 13, fontWeight: 700 }}>Dúvidas? Fale conosco</span>
        </a>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TELA QUIZ — só perguntas, sem captura
// ═════════════════════════════════════════════════════════════════════════════
function TelaQuiz({ perguntaIdx, responder }) {
  const p = PERGUNTAS[perguntaIdx];
  const pct = (perguntaIdx / PERGUNTAS.length) * 100;
  return (
    <div style={S.tela}>
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>🎯</div>
        <div style={S.logoTxt}>MISSÃO SEDES-DF 2026</div>
      </div>
      <div style={S.card}>
        <span style={S.badge}>4.788 vagas abertas · Prova: 06/09/2026</span>
        <h1 style={S.h1}>Simulador de Aprovação</h1>
        <p style={S.lead}>Qual é o seu real nível para o SEDES-DF? 5 perguntas revelam tudo — e o que fazer a partir de hoje.</p>
        <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${pct}%` }} /></div>
        <p style={S.progressLbl}>Pergunta {perguntaIdx + 1} de {PERGUNTAS.length}</p>
        <h2 style={S.h2}>{p.texto}</h2>
        {p.subtexto && <p style={S.aviso}>{p.subtexto}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {p.opcoes.map(op => (
            <button key={op.valor} style={S.opcao}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.background = C.blueL; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.gray200; e.currentTarget.style.background = C.white; }}
              onClick={() => responder(op.valor)}>
              {op.label}
            </button>
          ))}
        </div>
        <div style={S.promessa}>
          <p style={S.promessaTit}>Você recebe:</p>
          <p style={S.promessaItem}>✅ Diagnóstico honesto do seu nível real</p>
          <p style={S.promessaItem}>📅 Cronograma semana a semana com as matérias do seu cargo</p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TELA DIAGNÓSTICO — resultado + captura de lead aquecido → VSL
// ═════════════════════════════════════════════════════════════════════════════
function TelaDiagnostico({ nivel, nivelInfo, cargoLabel, nome, setNome, whatsapp, setWhatsapp, onIr, enviando }) {
  const [erro, setErro] = useState(false);

  function handleIr() {
    if (!nome.trim() || !whatsapp.trim()) { setErro(true); return; }
    setErro(false);
    onIr();
  }

  return (
    <div style={S.tela}>
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>🎯</div>
        <div style={S.logoTxt}>MISSÃO SEDES-DF 2026</div>
      </div>
      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 56 }}>{nivelInfo.emoji}</span>
          <h1 style={{ ...S.h1, marginTop: 8 }}>Seu diagnóstico está pronto</h1>
        </div>

        {/* Card de nível */}
        <div style={{ background: nivelInfo.bg, border: `2px solid ${nivelInfo.cor}`, borderRadius: 14, padding: 20, textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: C.gray500, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Seu nível atual</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: nivelInfo.cor, margin: "0 0 4px" }}>{nivel}</p>
          {cargoLabel && <p style={{ fontSize: 13, color: C.gray500, margin: "0 0 12px" }}>Cargo: <strong style={{ color: C.navy }}>{cargoLabel}</strong></p>}
          <p style={{ fontSize: 15, color: C.gray700, lineHeight: 1.7, margin: 0 }}>{nivelInfo.titulo}</p>
        </div>

        {/* Copy forte */}
        <div style={{ background: C.gray50, borderRadius: 12, padding: 20, marginBottom: 24, borderLeft: `4px solid ${C.navy}` }}>
          <p style={{ fontSize: 15, color: C.navy, fontWeight: 700, marginBottom: 8 }}>⚠️ A prova é em 06/09/2026.</p>
          <p style={{ fontSize: 14, color: C.gray700, lineHeight: 1.7, margin: 0 }}>
            Quem passa em concurso <strong>não estuda mais</strong> — estuda <strong>o certo, na ordem certa</strong>.
            Seu cronograma já está sendo gerado com base no Radar da Aprovação e nos tópicos que a banca <strong>Quadrix mais cobra</strong>.
            Não perca mais uma semana estudando do jeito errado.
          </p>
        </div>

        {/* Captura — lead aquecido, momento certo */}
        <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Para onde enviamos seu cronograma?</p>
          <p style={{ fontSize: 13, color: C.gray500, marginBottom: 14 }}>Preencha abaixo para liberar o acesso.</p>
          <input style={S.input} type="text" placeholder="Seu nome" value={nome}
            onChange={e => { setNome(e.target.value); setErro(false); }} />
          <input style={{ ...S.input, marginTop: 10 }} type="tel" placeholder="Seu WhatsApp (ex: 61999999999)" value={whatsapp}
            onChange={e => { setWhatsapp(e.target.value); setErro(false); }} />
          {erro && <p style={{ fontSize: 13, color: "#DC2626", marginTop: 6 }}>⚠️ Preencha seu nome e WhatsApp para continuar.</p>}
          <button style={S.btnPrimary} onClick={handleIr} disabled={enviando}>
            {enviando ? "⏳ Gerando seu plano..." : "🎯 Quero receber meu cronograma agora →"}
          </button>
          <p style={{ fontSize: 12, color: C.gray400, textAlign: "center", marginTop: 10 }}>🔒 Seus dados estão seguros. Sem spam.</p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TELA VSL + PITCH
// ═════════════════════════════════════════════════════════════════════════════
function TelaVSL({ nome, nivel, nivelInfo, cargoLabel, vslProgress, pitchVisivel, semanas, onComprar }) {
  const pnome = nome.split(" ")[0] || "Olá";
  const amostra = semanas[0]; // apenas semana 1 de preview

  return (
    <div style={S.tela}>
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>🎯</div>
        <div style={S.logoTxt}>MISSÃO SEDES-DF 2026</div>
      </div>

      {/* Player */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ ...S.badge, background: nivelInfo.cor }}>{nivelInfo.emoji} Nível {nivel}</span>
        </div>
        <h2 style={S.h2}>{pnome}, seu cronograma está sendo finalizado</h2>
        <p style={{ fontSize: 14, color: C.gray500, marginBottom: 16 }}>Assista ao vídeo enquanto o sistema conclui a diagramação</p>

        {/* VTURB Player */}
        <link rel="preload" href="https://scripts.converteai.net/d51835fa-4f3d-4aa8-aa8c-db96c6a2e325/players/6a2978625919c3d48847bf4b/v4/player.js" as="script" />
        <link rel="preload" href="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" as="script" />
        <link rel="preload" href="https://cdn.converteai.net/d51835fa-4f3d-4aa8-aa8c-db96c6a2e325/6a297820ffde9787382f46b2/main.m3u8" as="fetch" />
        <link rel="dns-prefetch" href="https://cdn.converteai.net" />
        <link rel="dns-prefetch" href="https://scripts.converteai.net" />
        <link rel="dns-prefetch" href="https://images.converteai.net" />
        <link rel="dns-prefetch" href="https://license.vturb.com" />
        <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          <VturbPlayer />
        </div>

        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${vslProgress}%`, background: `linear-gradient(90deg,${C.green},${C.blue})`, transition: "width 1s linear" }} />
        </div>
        <p style={{ fontSize: 13, color: C.gray500, textAlign: "center", marginTop: 6 }}>
          {pitchVisivel ? "✅ Seu cronograma está pronto!" : `⏳ Gerando seu plano personalizado... ${Math.round(vslProgress)}%`}
        </p>
      </div>

      {/* PITCH */}
      {pitchVisivel && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Preview semana 1 */}
          <div style={S.card}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 26 }}>📅</span>
              <div>
                <p style={{ fontWeight: 700, color: C.navy, fontSize: 15, margin: 0 }}>Prévia do seu Cronograma — Semana 1</p>
                <p style={{ fontSize: 13, color: C.blue, margin: "3px 0 0" }}>{cargoLabel}</p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead><tr style={{ background: C.gray50 }}>
                  <th style={S.th}>Dia</th><th style={S.th}>Matéria</th><th style={S.th}>Tópico</th><th style={S.th}>Prioridade</th>
                </tr></thead>
                <tbody>
                  {amostra?.dias.map((d, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.gray50 }}>
                      <td style={{ ...S.td, fontWeight: 700, color: C.blue }}>{d.dia}</td>
                      <td style={S.td}>{d.materia}</td>
                      <td style={{ ...S.td, color: C.gray700 }}>{d.topico}</td>
                      <td style={{ ...S.td, textAlign: "center" }}><PrioTag p={d.prioridade} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ background: C.navy, borderRadius: 10, padding: "14px 16px", marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔒</span>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>Seu plano completo está na plataforma</p>
                <p style={{ color: C.gray400, fontSize: 13, margin: 0 }}>As {semanas.length} semanas completas, com todos os tópicos e prioridades, ficam disponíveis assim que você acessa o Missão SEDES.</p>
              </div>
            </div>
          </div>

          {/* Transição personalizada + CTA 1 */}
          <div style={{ ...S.card, borderLeft: `4px solid ${nivelInfo.cor}`, background: nivelInfo.bg }}>
            <p style={{ fontSize: 15, color: C.gray800, lineHeight: 1.7, margin: "0 0 16px" }}>
              <strong style={{ color: nivelInfo.cor }}>{pnome}</strong>, você é nível <strong style={{ color: nivelInfo.cor }}>{nivel}</strong>.{" "}
              Seu cronograma completo já está montado — {semanas.length} semanas, matéria a matéria, na ordem que a Quadrix cobra. Falta só você acessar.
            </p>
            <BtnCompra onComprar={onComprar} />
          </div>

          {/* Entregáveis */}
          <div style={S.card}>
            <h3 style={S.h3}>O que você acessa na Plataforma<br /><span style={{ color: C.blue }}>Missão SEDES DF 2026</span></h3>
            <Entregavel icon="🎓" titulo="Metodologia" desc="Videoaula de boas-vindas + ferramentas metodológicas (Caderno de Erros com IA + Planilha de Desempenho)" />
            <Entregavel icon="📱" titulo="Seu Plano Personalizado — Acesso ao APP" desc="Acesse e atualize seu plano de estudos quando quiser, direto no aplicativo" />
            <Entregavel icon="🎯" titulo="Radar da Aprovação" desc="Mapeamento dos Tópicos Mais Cobrados pela Banca Quadrix + Checklist da Aprovação" />
            <Entregavel icon="📚" titulo="Bloco 1 — Conhecimentos Gerais" desc="Língua Portuguesa · Conhecimentos do DF · Política para Mulheres · Legislação · Noções de Primeiros Socorros" />
            <Entregavel icon="⚖️" titulo="Bloco 2 — Conhecimentos Específicos Comuns" desc="Fundamentos do SUAS e PNAS 2004 · Programas e Benefícios Socioassistenciais do DF" />
            <Entregavel icon="🎯" titulo="Módulo Específico do Seu Cargo" desc="Agente Social (200) · Cuidador Social (201) · Técnico Administrativo (202)" />
            <Entregavel icon="📖" titulo="Biblioteca de Leis + Glossário de Termos Técnicos" desc="Todo o material de referência sem precisar garimpar na internet" />
            <Entregavel icon="🎁" titulo="3 Bônus Exclusivos" desc="Videoaula Redação Nota 10 · Podcast SUAS em 10 min · Flashcards de Critérios e Prazos" />
            <BtnCompra onComprar={onComprar} />
          </div>

          {/* Depoimentos */}
          <div style={S.card}>
            <h3 style={S.h3}>O que estão dizendo</h3>
            <Depoimento foto="👩🏽" nome="Fernanda R." txt="O conteúdo é incrível. Tava esperando uma apostila e um cronograma e me surpreendi com uma metodologia completa." />
            <Depoimento foto="👩🏻" nome="Carla M."    txt="Eu estava travada com tanto conteúdo. Agora estou conseguindo estudar de verdade, com foco e sem ansiedade." />
            <Depoimento foto="👨🏾" nome="Ricardo S."  txt="Pode confiar, gente. Pedi reembolso porque só tem para nível médio e eu ia fazer o de nível superior. Mas o curso é ótimo e o reembolso foi super rápido. Excelente atendimento no WhatsApp." />
          </div>

          {/* Garantia */}
          <div style={{ ...S.card, textAlign: "center", border: `2px solid ${C.greenL}` }}>
            <span style={{ fontSize: 44 }}>🛡️</span>
            <h3 style={{ color: C.green, fontSize: 18, fontWeight: 700, margin: "8px 0" }}>Garantia de 7 dias</h3>
            <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.6, margin: 0 }}>
              Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
            </p>
          </div>

          {/* FAQ */}
          <div style={S.card}>
            <h3 style={S.h3}>Perguntas frequentes</h3>
            <FaqItem
              q="O curso é todo em videoaulas?"
              a="Não, e isso é o que vai garantir a sua aprovação. Cursinhos tradicionais vendem centenas de horas de videoaulas passivas que dão sono e não fixam o conteúdo. A metodologia do Missão SEDES é baseada em Leitura Ativa, Checkpoints e Caderno de Erros. Você terá vídeos curtos e cirúrgicos para entender o método — mas o seu estudo principal será ativo, focado em consumir o conteúdo de forma 3x mais rápida e com altíssima retenção."
            />
            <FaqItem
              q="Posso usar este material para outros concursos?"
              a="Sinceramente? Não. O Missão SEDES-DF não é um curso genérico reaproveitado. Ele foi construído com base na engenharia reversa exclusiva do edital da SEDES-DF e no mapeamento de como a banca Quadrix formula suas questões. Ele serve apenas para um propósito: colocar o seu nome no Diário Oficial do DF."
            />
            <FaqItem
              q="O material está 100% de acordo com o edital atualizado?"
              a="Sim. Absolutamente tudo. O material já contempla todas as normativas, legislações locais e as retificações mais recentes do Edital SEDES-DF. Você não vai precisar caçar atualizações no Google — seu único trabalho será sentar e executar a missão."
            />
            <FaqItem
              q="Se tiver dúvidas durante os estudos, estarei sozinho(a)?"
              a="De forma alguma. Abaixo de cada material na plataforma você terá suporte técnico e de conteúdo. Além disso, o curso entrega o módulo de Inteligência Artificial aplicada aos estudos para que você tenha respostas imediatas sobre o porquê errou qualquer questão do seu Caderno de Erros."
            />
            <FaqItem
              q="E se eu comprar e perceber que a metodologia não é para mim?"
              a="O risco é zero para você. Você tem 7 dias de Garantia Incondicional. Entre, baixe o Contrato de Compromisso, assista à aula de Metodologia e teste os Checkpoints. Se dentro de 7 dias achar que o formato não serve para você, basta um clique na plataforma ou um e-mail para nossa equipe — devolvemos 100% do seu dinheiro, sem burocracia e sem ressentimentos."
            />
            <FaqItem
              q="Por quanto tempo terei acesso à plataforma?"
              a="O acesso à plataforma é garantido até a data oficial da prova, independentemente de quando você entrar. O APP de cronograma também fica disponível até o dia do exame — e caso a data seja alterada por qualquer motivo, o acesso é automaticamente expandido."
            />
            <FaqItem
              q="A plataforma funciona para nível superior também?"
              a="Não. O Missão SEDES é exclusivo para os cargos de nível médio: Agente Social (200), Cuidador Social (201) e Técnico Administrativo (202). Se você vai prestar para nível superior, o conteúdo não vai te atender."
            />
          </div>

          {/* CTA final */}
          <BtnCompra onComprar={onComprar} mostrarGarantia />
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TELA OBRIGADO
// ═════════════════════════════════════════════════════════════════════════════
function TelaObrigado({ nome, nivel, cargoLabel, semanas, diasAteProva, copiado, onCopiar }) {
  const pnome = nome.split(" ")[0] || "Candidato";

  return (
    <div style={S.tela}>
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>🎯</div>
        <div style={S.logoTxt}>MISSÃO SEDES-DF 2026</div>
      </div>

      <div style={S.card}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 64 }}>🎉</span>
          <h1 style={{ ...S.h1, color: C.green, marginTop: 8 }}>Parabéns, sua compra foi confirmada!</h1>
          <p style={{ fontSize: 15, color: C.gray700 }}>{pnome}, bem-vindo à Plataforma Missão SEDES. Faltam <strong>{diasAteProva} dias</strong> para a prova.</p>
        </div>

        {/* Próximos passos */}
        <div style={{ background: C.gray50, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: C.navy, fontSize: 15, marginBottom: 14 }}>Próximos passos</p>
          {[
            "Acesse a plataforma com o botão abaixo",
            "Assista à videoaula de Metodologia",
            "Comece hoje — cada semana conta!",
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ background: C.blue, color: "#fff", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ fontSize: 14, color: C.gray700, margin: 0, paddingTop: 3 }}>{t}</p>
            </div>
          ))}
        </div>

        {/* Info cronograma + acesso */}
        <div style={{ background: C.blueL, border: `1px solid ${C.blue}22`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: C.navy, lineHeight: 1.7, margin: 0 }}>
            📅 <strong>Seu cronograma completo está disponível abaixo.</strong><br />
            Você também pode acessar o APP na plataforma a qualquer momento para atualizar seu plano de estudos conforme sua rotina mudar.<br />
            <span style={{ fontSize: 13, color: C.gray500 }}>📧 O link de acesso também será enviado para o seu e-mail.</span>
          </p>
        </div>

        <a href={MEMBERS_AREA} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button style={S.btnGreen}>🎓 Acessar a Plataforma Missão SEDES agora</button>
        </a>
      </div>

      {/* CRONOGRAMA COMPLETO */}
      <div style={{ ...S.card, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h2 style={{ ...S.h2, margin: 0 }}>📅 Seu Cronograma Completo</h2>
            <p style={{ fontSize: 13, color: C.gray500, margin: "4px 0 0" }}>{semanas.length} semanas · {cargoLabel} · Prova: 06/09/2026</p>
          </div>
          <button style={S.btnCopiar} onClick={onCopiar}>
            {copiado ? "✅ Copiado!" : "📋 Copiar cronograma"}
          </button>
        </div>

        {semanas.map((s) => (
          <div key={s.semana} style={{ marginBottom: 24 }}>
            <div style={{ background: C.navy, borderRadius: "10px 10px 0 0", padding: "10px 14px" }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>SEMANA {s.semana} — {s.bloco}</p>
            </div>
            <div style={{ overflowX: "auto", border: `1px solid ${C.gray200}`, borderTop: "none", borderRadius: "0 0 10px 10px" }}>
              <table style={{ ...S.table, marginBottom: 0 }}>
                <thead><tr style={{ background: C.gray50 }}>
                  <th style={S.th}>Dia</th><th style={S.th}>Matéria</th><th style={S.th}>Tópico</th><th style={S.th}>Prioridade</th>
                </tr></thead>
                <tbody>
                  {s.dias.map((d, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.gray50 }}>
                      <td style={{ ...S.td, fontWeight: 700, color: C.blue, whiteSpace: "nowrap" }}>{d.dia}</td>
                      <td style={S.td}>{d.materia}</td>
                      <td style={{ ...S.td, color: C.gray700 }}>{d.topico}</td>
                      <td style={{ ...S.td, textAlign: "center", whiteSpace: "nowrap" }}><PrioTag p={d.prioridade} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <button style={S.btnCopiar} onClick={onCopiar}>
          {copiado ? "✅ Cronograma copiado!" : "📋 Copiar cronograma completo"}
        </button>
      </div>

      {/* Suporte */}
      <div style={{ ...S.card, marginTop: 16, textAlign: "center" }}>
        <p style={{ color: C.gray500, fontSize: 14, marginBottom: 10 }}>Dúvidas? Fale com a gente 👇</p>
        <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button style={{ background: "#25d366", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            💬 Falar no WhatsApp
          </button>
        </a>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════
function BtnCompra({ onComprar, mostrarGarantia }) {
  return (
    <div style={{ background: C.gray50, borderRadius: 14, padding: 20, textAlign: "center", border: `1px solid ${C.gray200}` }}>
      <p style={{ fontSize: 12, color: C.gray500, marginBottom: 4 }}>Acesso completo por apenas</p>
      <p style={{ fontSize: 15, color: C.gray400, textDecoration: "line-through", margin: "0 0 2px" }}>De R$197</p>
      <p style={{ fontSize: 52, fontWeight: 900, color: C.green, margin: "0 0 2px", lineHeight: 1 }}>R$97</p>
      <p style={{ fontSize: 12, color: C.gray400, marginBottom: 18 }}>pagamento único · acesso imediato</p>
      <button style={S.btnGreen} onClick={onComprar}>
        🔓 Liberar meu Plano Completo de Aprovação
      </button>
      <p style={{ fontSize: 13, color: C.amber, marginTop: 12, lineHeight: 1.5 }}>
        ⚠️ Cada semana sem um plano é uma semana que você não recupera antes de setembro.
      </p>
      {mostrarGarantia && <p style={{ fontSize: 12, color: C.gray400, marginTop: 6 }}>🛡️ Garantia de 7 dias · sem perguntas</p>}
    </div>
  );
}

function Entregavel({ icon, titulo, desc }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: "0 0 2px" }}>{titulo}</p>
        <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.5, margin: 0 }}>{desc}</p>
      </div>
    </div>
  );
}

function Depoimento({ foto, nome, txt }) {
  return (
    <div style={{ background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 30 }}>{foto}</span>
        <div>
          <p style={{ fontWeight: 700, color: C.navy, fontSize: 14, margin: 0 }}>{nome}</p>
          <span style={{ fontSize: 12 }}>⭐⭐⭐⭐⭐</span>
        </div>
      </div>
      <p style={{ fontSize: 14, color: C.gray700, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>"{txt}"</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.gray200}`, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button style={{ width: "100%", background: open ? C.blueL : C.white, border: "none", padding: "14px 16px", color: C.navy, fontSize: 14, fontWeight: 600, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 8 }}
        onClick={() => setOpen(o => !o)}>
        <span>{q}</span><span style={{ color: C.blue, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <p style={{ padding: "0 16px 14px", fontSize: 14, color: C.gray700, lineHeight: 1.6, margin: 0 }}>{a}</p>}
    </div>
  );
}

function PrioTag({ p }) {
  const map = {
    "ALTÍSSIMA": { bg: "#FEF2F2", color: "#DC2626", label: "ALTÍSSIMA" },
    "ALTA":      { bg: "#FFF7ED", color: "#D97706", label: "ALTA" },
    "MÉDIA":     { bg: "#EFF6FF", color: "#2563EB", label: "MÉDIA" },
    "BAIXA":     { bg: "#F0FDF4", color: "#16A34A", label: "BAIXA" },
    "—":         { bg: "transparent", color: C.gray400, label: "—" },
  };
  const t = map[p] || map["—"];
  return (
    <span style={{ background: t.bg, color: t.color, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "2px 7px", whiteSpace: "nowrap" }}>{t.label}</span>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VTURB PLAYER
// ═════════════════════════════════════════════════════════════════════════════
function VturbPlayer() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    // Injeta o script do VTURB dinamicamente
    const s = document.createElement("script");
    s.src = "https://scripts.converteai.net/d51835fa-4f3d-4aa8-aa8c-db96c6a2e325/players/6a2978625919c3d48847bf4b/v4/player.js";
    s.async = true;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch(e) {} };
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", aspectRatio: "16/9" }}>
      <vturb-smartplayer
        id="vid-6a2978625919c3d48847bf4b"
        style={{ display: "block", margin: "0 auto", width: "100%" }}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ESTILOS — TEMA CLARO, IDENTIDADE MISSÃO SEDES
// ═════════════════════════════════════════════════════════════════════════════
const S = {
  root:        { minHeight: "100vh", background: C.gray100, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: C.gray800 },
  tela:        { maxWidth: 640, margin: "0 auto", padding: "20px 16px 80px" },

  logoWrap:    { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" },
  logoIcon:    { fontSize: 24 },
  logoTxt:     { fontSize: 14, fontWeight: 800, color: C.navy, letterSpacing: 0.5 },

  card:        { background: C.white, borderRadius: 16, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,.07)", marginBottom: 0 },

  badge:       { display: "inline-block", background: C.navy, color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, marginBottom: 12 },
  h1:          { fontSize: 22, fontWeight: 800, color: C.navy, margin: "0 0 8px", lineHeight: 1.3 },
  h2:          { fontSize: 17, fontWeight: 700, color: C.navy, margin: "0 0 8px" },
  h3:          { fontSize: 16, fontWeight: 700, color: C.navy, margin: "0 0 16px" },
  lead:        { fontSize: 14, color: C.gray500, margin: "0 0 20px" },
  aviso:       { fontSize: 13, color: C.amber, margin: "0 0 4px" },

  progressBar: { background: C.gray200, borderRadius: 8, height: 7, marginBottom: 4 },
  progressFill:{ background: `linear-gradient(90deg,${C.blue},#7C3AED)`, height: 7, borderRadius: 8, transition: "width .4s" },
  progressLbl: { fontSize: 12, color: C.gray400, textAlign: "right", marginBottom: 20 },

  opcao:       { background: C.white, border: `2px solid ${C.gray200}`, borderRadius: 10, padding: "13px 16px", color: C.gray800, fontSize: 14, textAlign: "left", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" },

  promessa:    { background: C.gray50, border: `1px solid ${C.gray200}`, borderRadius: 10, padding: 14, marginTop: 16 },
  promessaTit: { fontSize: 12, color: C.gray500, fontWeight: 600, marginBottom: 6 },
  promessaItem:{ fontSize: 13, color: C.gray700, marginBottom: 3 },

  input:       { background: C.gray50, border: `2px solid ${C.gray200}`, borderRadius: 10, padding: "13px 16px", color: C.gray800, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" },

  btnPrimary:  { background: `linear-gradient(135deg,${C.navy},${C.blue})`, border: "none", borderRadius: 12, padding: "16px 24px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 14, fontFamily: "inherit", lineHeight: 1.4 },
  btnGreen:    { background: `linear-gradient(135deg,${C.green},#10B981)`, border: "none", borderRadius: 12, padding: "16px 24px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", lineHeight: 1.4, fontFamily: "inherit" },
  btnCopiar:   { background: C.navy, border: "none", borderRadius: 10, padding: "11px 20px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th:          { padding: "8px 10px", textAlign: "left", color: C.gray500, borderBottom: `2px solid ${C.gray200}`, fontWeight: 600, whiteSpace: "nowrap" },
  td:          { padding: "9px 10px", color: C.gray700, borderBottom: `1px solid ${C.gray100}`, verticalAlign: "top" },

  waFixed:     { position: "fixed", bottom: 24, right: 16, background: "#25d366", borderRadius: 50, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none", boxShadow: "0 4px 16px rgba(37,211,102,.4)", zIndex: 999, maxWidth: 220 },
};
