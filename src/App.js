import { useState, useEffect, useCallback } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznYux-QKhaJgq-OEbMl6yGx06xNDT2IBM8QUofuupgq8LcLqmEylN5Ql6-4-OrqdFo1w/exec";
const DATA_PROVA = new Date("2026-09-06");

// ─── PALETA ───────────────────────────────────────────────
const C = {
  navy: "#1B2E5E",
  navyLight: "#243a75",
  silver: "#C0C8D8",
  silverLight: "#E8ECF4",
  accent: "#2F80ED",
  green: "#1D9E75",
  greenLight: "#E1F5EE",
  greenDark: "#085041",
  white: "#FFFFFF",
  bg: "#F4F6FB",
  textPrimary: "#1B2E5E",
  textSecondary: "#5A6A8A",
  textMuted: "#8A9ABB",
  border: "#D4DBE8",
  danger: "#E24B4A",
};

// ─── CRONOGRAMA BASE ──────────────────────────────────────
const BASE_TOPICOS = {
  comuns: [
    // Metodologia
    { bloco: "Metodologia", titulo: "Como usar o Radar da Aprovação como guia", p: "altissima", horas: 1 },
    { bloco: "Metodologia", titulo: "Técnica de revisão espaçada aplicada ao concurso", p: "alta", horas: 1 },
    // Língua Portuguesa
    { bloco: "Língua Portuguesa", titulo: "Interpretação e compreensão de textos", p: "altissima", horas: 4 },
    { bloco: "Língua Portuguesa", titulo: "Coesão e coerência textual / conectivos", p: "altissima", horas: 3 },
    { bloco: "Língua Portuguesa", titulo: "Concordância verbal e nominal", p: "alta", horas: 2 },
    { bloco: "Língua Portuguesa", titulo: "Reescrita de frases e sinonímia", p: "alta", horas: 2 },
    { bloco: "Língua Portuguesa", titulo: "Emprego de pronomes e colocação pronominal", p: "alta", horas: 2 },
    { bloco: "Língua Portuguesa", titulo: "Ortografia oficial", p: "alta", horas: 1 },
    { bloco: "Língua Portuguesa", titulo: "Regência verbal e nominal", p: "media", horas: 1 },
    // Legislação DF
    { bloco: "Legislação do DF", titulo: "Lei Maria da Penha — Lei 11.340/2006 (mínimo 3 questões)", p: "altissima", horas: 4 },
    { bloco: "Legislação do DF", titulo: "Lei Complementar 840/2011 — Regime dos Servidores do DF", p: "altissima", horas: 4 },
    { bloco: "Legislação do DF", titulo: "Lei Distrital 7.484/2024 — carreira SEDES", p: "alta", horas: 2 },
    { bloco: "Legislação do DF", titulo: "Lei Orgânica do DF — Título VI", p: "alta", horas: 2 },
    { bloco: "Legislação do DF", titulo: "Plano Distrital de Política para Mulheres (PDPM)", p: "alta", horas: 2 },
    { bloco: "Legislação do DF", titulo: "Noções de primeiros socorros (engasgo, sangramento, convulsão)", p: "alta", horas: 1 },
    // SUAS
    { bloco: "SUAS e PNAS", titulo: "PNAS/2004 — princípios, diretrizes, proteções básica e especial", p: "altissima", horas: 4 },
    { bloco: "SUAS e PNAS", titulo: "NOB/SUAS 2012 — responsabilidades dos entes, gestão do trabalho", p: "altissima", horas: 3 },
    { bloco: "SUAS e PNAS", titulo: "Plano DF Social — Lei 7.008/2021", p: "altissima", horas: 2 },
    { bloco: "SUAS e PNAS", titulo: "Seguranças socioassistenciais: acolhida, convívio, renda, autonomia", p: "alta", horas: 2 },
    { bloco: "SUAS e PNAS", titulo: "Matricialidade sociofamiliar e territorialização", p: "alta", horas: 1 },
    { bloco: "SUAS e PNAS", titulo: "Cartão Prato Cheio e Benefícios Eventuais do DF", p: "alta", horas: 1 },
    // Reta final
    { bloco: "Reta Final", titulo: "Simulado geral completo — Conhecimentos Gerais", p: "altissima", horas: 3 },
    { bloco: "Reta Final", titulo: "Revisão dos erros por bloco", p: "alta", horas: 2 },
    { bloco: "Reta Final", titulo: "Treino de redação dissertativo-argumentativa (3 versões)", p: "alta", horas: 3 },
    { bloco: "Reta Final", titulo: "Revisão expressa: Maria da Penha + LC 840", p: "alta", horas: 2 },
  ],
  200: [
    { bloco: "Específico — Agente Social", titulo: "CRAS, CREAS e Unidades de Acolhimento — organização e funcionamento", p: "altissima", horas: 3 },
    { bloco: "Específico — Agente Social", titulo: "PAIF e SCFV — objetivos e público-alvo", p: "altissima", horas: 3 },
    { bloco: "Específico — Agente Social", titulo: "Abordagem social e população em situação de rua / Decreto 7.053/2009", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Fluxos de referência e contrarreferência no SUAS", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Proteção Social Especial — situações de risco e violação de direitos", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Simulado específico — Agente Social", p: "altissima", horas: 2 },
  ],
  201: [
    { bloco: "Específico — Cuidador Social", titulo: "Resolução Conjunta CNAS/CONANDA 1/2009 — acolhimento institucional", p: "altissima", horas: 3 },
    { bloco: "Específico — Cuidador Social", titulo: "Rotinas humanizadas de cuidado: higiene, alimentação, autonomia", p: "altissima", horas: 3 },
    { bloco: "Específico — Cuidador Social", titulo: "Princípios do acolhimento: excepcionalidade, provisoriedade, vínculo familiar", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Plano Nacional de Convivência Familiar e Comunitária", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Trabalho em equipe interdisciplinar e atribuições do cuidador", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Simulado específico — Cuidador Social", p: "altissima", horas: 2 },
  ],
  202: [
    { bloco: "Específico — Técnico Administrativo", titulo: "Ato administrativo: conceito, requisitos, atributos, anulação e revogação", p: "altissima", horas: 3 },
    { bloco: "Específico — Técnico Administrativo", titulo: "LC 840/2011 — provimento, vacância, PAD (aprofundado)", p: "altissima", horas: 3 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Lei 14.133/2021 — licitações e contratos (noções básicas)", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Arquivologia: protocolo, métodos de arquivamento, digitalização", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Redação oficial e comunicações administrativas", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Princípios constitucionais da Administração Pública", p: "media", horas: 1 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Simulado específico — Técnico Administrativo", p: "altissima", horas: 2 },
  ],
};

const CARGO_NOMES = { 200: "Agente Social", 201: "Cuidador Social", 202: "Técnico Administrativo" };

// Peso por prioridade para distribuição de horas
const PESO = { altissima: 3, alta: 2, media: 1 };

function diasAteProva() {
  return Math.max(0, Math.ceil((DATA_PROVA - new Date()) / 86400000));
}

// Gera semanas agrupando tópicos por bloco, respeitando horas/dia
function gerarCronograma(cargo, horasDia, progressoExistente = {}) {
  const topicos = [...BASE_TOPICOS.comuns, ...(BASE_TOPICOS[cargo] || [])];
  const dias = diasAteProva();
  const totalHoras = dias * horasDia;

  // Soma horas necessárias
  const horasNecessarias = topicos.reduce((s, t) => s + t.horas, 0);

  // Se tempo curto, filtra média
  let lista = totalHoras < horasNecessarias * 0.6
    ? topicos.filter(t => t.p !== "media")
    : topicos;

  // Agrupa por bloco mantendo ordem
  const blocos = [];
  const blocoMap = {};
  lista.forEach((t, i) => {
    const id = `${cargo}_${i}`;
    if (!blocoMap[t.bloco]) {
      blocoMap[t.bloco] = { bloco: t.bloco, topicos: [] };
      blocos.push(blocoMap[t.bloco]);
    }
    blocoMap[t.bloco].topicos.push({ ...t, id, concluido: !!progressoExistente[id] });
  });

  // Distribui blocos em semanas com base nas horas/dia
  const horasPorSemana = horasDia * 7;
  const semanas = [];
  let semanaAtual = { num: 1, blocos: [], horasAcumuladas: 0 };

  blocos.forEach(bloco => {
    const horasBloco = bloco.topicos.reduce((s, t) => s + t.horas, 0);
    if (semanaAtual.horasAcumuladas + horasBloco > horasPorSemana && semanaAtual.blocos.length > 0) {
      semanas.push(semanaAtual);
      semanaAtual = { num: semanas.length + 1, blocos: [], horasAcumuladas: 0 };
    }
    semanaAtual.blocos.push(bloco);
    semanaAtual.horasAcumuladas += horasBloco;
  });
  if (semanaAtual.blocos.length > 0) semanas.push(semanaAtual);

  return semanas;
}

// Recalcula só as semanas não concluídas, redistribui a partir de hoje
function redistribuirCronograma(cargo, horasDia, progressoAtual) {
  return gerarCronograma(cargo, horasDia, progressoAtual);
}

// ─── API CALLS ────────────────────────────────────────────
async function apiGet(whatsapp) {
  const url = `${SCRIPT_URL}?action=get&whatsapp=${encodeURIComponent(whatsapp)}`;
  const r = await fetch(url);
  return r.json();
}

async function apiSave(payload) {
  const r = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "save", ...payload }),
  });
  return r.json();
}

async function apiUpdateHoras(whatsapp, horasDia) {
  const r = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update_horas", whatsapp, horasDia }),
  });
  return r.json();
}

// ─── ESTILOS INLINE ──────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  container: { maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" },

  // Header
  header: { background: C.navy, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 0 },
  logoCircle: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { color: C.white, fontSize: 15, fontWeight: 600, letterSpacing: ".02em" },
  headerSub: { color: C.silver, fontSize: 12, marginTop: 1 },

  // Cards
  card: { background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "20px 20px", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.textSecondary, lineHeight: 1.5 },

  // Inputs
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 15, color: C.navy, background: C.white, outline: "none", boxSizing: "border-box" },
  inputGroup: { marginBottom: 16 },

  // Botões
  btnPrimary: { width: "100%", padding: "14px", borderRadius: 10, background: C.navy, color: C.white, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", letterSpacing: ".01em" },
  btnSecondary: { padding: "10px 16px", borderRadius: 8, background: "transparent", color: C.navy, fontSize: 13, fontWeight: 600, border: `1.5px solid ${C.border}`, cursor: "pointer" },
  btnGhost: { padding: "8px 14px", borderRadius: 8, background: "transparent", color: C.textSecondary, fontSize: 13, border: "none", cursor: "pointer" },
  btnGreen: { width: "100%", padding: "14px", borderRadius: 10, background: C.green, color: C.white, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" },

  // Cargo cards
  cargoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  cargoCard: (sel) => ({
    padding: "14px 10px", borderRadius: 10,
    border: sel ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
    background: sel ? C.silverLight : C.white,
    cursor: "pointer", textAlign: "center", transition: "all .15s",
  }),
  cargoNum: { fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: ".05em", marginBottom: 4 },
  cargoNome: { fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.3 },

  // Stats
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: { background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" },
  statVal: { fontSize: 26, fontWeight: 700, color: C.navy, lineHeight: 1 },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.3 },

  // Progress
  progressBar: { height: 8, background: C.silverLight, borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  progressFill: (pct) => ({ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 4, transition: "width .4s ease" }),

  // Semanas
  semanaCard: (done) => ({
    background: C.white, borderRadius: 12, border: `1px solid ${done ? C.green : C.border}`,
    marginBottom: 12, overflow: "hidden",
    opacity: done ? 0.85 : 1,
  }),
  semanaHeader: (done) => ({
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
    background: done ? C.greenLight : C.white, borderBottom: `1px solid ${done ? "#9FE1CB" : C.border}`,
    cursor: "pointer",
  }),
  semanaNumCircle: (done) => ({
    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
    background: done ? C.green : C.navy,
    color: C.white, fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  }),
  semanaTitulo: { fontSize: 14, fontWeight: 600, color: C.navy, flex: 1 },
  semanaHoras: { fontSize: 11, color: C.textMuted },

  // Tópicos
  topicoItem: (done) => ({
    display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 16px",
    borderBottom: `1px solid ${C.silverLight}`, cursor: "pointer",
    background: done ? "#F8FFF9" : C.white,
  }),
  checkbox: (done) => ({
    width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
    border: done ? "none" : `2px solid ${C.border}`,
    background: done ? C.green : "transparent",
    display: "flex", alignItems: "center", justifyContent: "center",
  }),
  topicoTexto: (done) => ({ fontSize: 13, color: done ? C.textMuted : C.textPrimary, lineHeight: 1.5, flex: 1, textDecoration: done ? "line-through" : "none" }),
  pBadge: (p) => ({
    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, flexShrink: 0, marginTop: 3,
    background: p === "altissima" ? C.greenLight : p === "alta" ? "#E6F1FB" : C.silverLight,
    color: p === "altissima" ? C.greenDark : p === "alta" ? "#0C447C" : C.textSecondary,
  }),

  // Bloco label
  blocoLabel: { fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: ".05em", textTransform: "uppercase", padding: "8px 16px 4px", background: C.silverLight, borderBottom: `1px solid ${C.border}` },

  // Alerts
  alertInfo: { background: "#E6F1FB", border: "1px solid #B5D4F4", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#0C447C", marginBottom: 12 },
  alertSuccess: { background: C.greenLight, border: `1px solid #9FE1CB`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.greenDark, marginBottom: 12 },
};

// ─── COMPONENTES ─────────────────────────────────────────

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#C0C8D8" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="6" stroke="#C0C8D8" strokeWidth="1.5"/>
      <path d="M11 4 C8 6 7 9 8 12 C9 15 12 17 14 15 C16 13 15 9 13 7 Z" fill="#C0C8D8" opacity=".8"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Header({ nome, cargo }) {
  return (
    <div style={S.header}>
      <div style={S.logoCircle}><Logo /></div>
      <div>
        <div style={S.headerTitle}>SEDES Premium 2026</div>
        {nome && <div style={S.headerSub}>{nome} · {CARGO_NOMES[cargo] || ""}</div>}
      </div>
    </div>
  );
}

// ─── TELA DE LOGIN ────────────────────────────────────────
function TelaLogin({ onEntrar }) {
  const [nome, setNome] = useState("");
  const [wpp, setWpp] = useState("");
  const [cargo, setCargo] = useState(null);
  const [horas, setHoras] = useState(2);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEntrar() {
    if (!nome.trim() || !wpp.trim() || !cargo) {
      setErro("Preencha nome, WhatsApp e selecione seu cargo.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const res = await apiGet(wpp.replace(/\D/g, ""));
      if (res.found) {
        // Usuário existente — carrega progresso salvo
        onEntrar({
          nome: res.nome,
          whatsapp: res.whatsapp,
          cargo: parseInt(res.cargo),
          horasDia: res.horasDia,
          progresso: res.progresso || {},
          isNovo: false,
        });
      } else {
        // Novo usuário
        onEntrar({ nome: nome.trim(), whatsapp: wpp.replace(/\D/g, ""), cargo, horasDia: horas, progresso: {}, isNovo: true });
      }
    } catch (e) {
      setErro("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  }

  return (
    <>
      <Header />
      <div style={S.container}>
        <div style={{ padding: "24px 0 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Seu plano personalizado</div>
          <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>
            Informe seus dados para gerar — ou retomar — seu cronograma de estudos adaptado às suas horas disponíveis.
          </div>
        </div>

        <div style={S.card}>
          <div style={S.inputGroup}>
            <label style={S.label}>Seu nome</label>
            <input style={S.input} placeholder="Ex: Maria Silva" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div style={S.inputGroup}>
            <label style={S.label}>WhatsApp (com DDD)</label>
            <input style={S.input} placeholder="Ex: 61999999999" value={wpp} onChange={e => setWpp(e.target.value)} inputMode="numeric" />
          </div>

          <label style={{ ...S.label, marginBottom: 10 }}>Cargo que vai disputar</label>
          <div style={S.cargoGrid}>
            {[200, 201, 202].map(c => (
              <div key={c} style={S.cargoCard(cargo === c)} onClick={() => setCargo(c)}>
                <div style={S.cargoNum}>Cargo {c}</div>
                <div style={S.cargoNome}>{CARGO_NOMES[c]}</div>
              </div>
            ))}
          </div>

          <div style={S.inputGroup}>
            <label style={S.label}>Horas de estudo por dia: <strong style={{ color: C.navy }}>{horas}h</strong></label>
            <input type="range" min={1} max={8} step={1} value={horas} onChange={e => setHoras(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.navy }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              <span>1h</span><span>4h</span><span>8h</span>
            </div>
          </div>

          {erro && <div style={{ ...S.alertInfo, background: "#FEF2F2", borderColor: "#FCA5A5", color: C.danger, marginBottom: 12 }}>{erro}</div>}

          <button style={S.btnPrimary} onClick={handleEntrar} disabled={loading}>
            {loading ? "Carregando..." : "→  Acessar meu cronograma"}
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 8 }}>
          Seu progresso é salvo automaticamente e pode ser retomado em qualquer dispositivo.
        </div>
      </div>
    </>
  );
}

// ─── TELA DASHBOARD ───────────────────────────────────────
function TelaDashboard({ usuario, onLogout }) {
  const { nome, whatsapp, cargo, horasDia: horasInicial, progresso: progressoInicial, isNovo } = usuario;

  const [progresso, setProgresso] = useState(progressoInicial);
  const [horasDia, setHorasDia] = useState(Number(horasInicial) || 2);
  const [semanas, setSemanas] = useState([]);
  const [semanaAberta, setSemanaAberta] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [modalHoras, setModalHoras] = useState(false);
  const [novasHoras, setNovasHoras] = useState(Number(horasInicial) || 2);
  const [showWelcome, setShowWelcome] = useState(isNovo);

  useEffect(() => {
    const s = redistribuirCronograma(cargo, horasDia, progresso);
    setSemanas(s);
    // Se novo, salva o registro inicial
    if (isNovo) {
      apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: {} });
    }
  }, []);

  const totalTopicos = semanas.reduce((a, s) => a + s.blocos.reduce((b, bl) => b + bl.topicos.length, 0), 0);
  const totalConcluidos = Object.values(progresso).filter(Boolean).length;
  const pct = totalTopicos > 0 ? Math.round(totalConcluidos / totalTopicos * 100) : 0;
  const dias = diasAteProva();

  async function toggleTopico(id) {
    const novoProgresso = { ...progresso, [id]: !progresso[id] };
    setProgresso(novoProgresso);
    const novasSemanas = redistribuirCronograma(cargo, horasDia, novoProgresso);
    setSemanas(novasSemanas);
    // Salva no Sheets
    setSalvando(true);
    try {
      await apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: novoProgresso });
    } catch (e) {}
    setSalvando(false);
  }

  async function toggleSemana(semIdx) {
    const sem = semanas[semIdx];
    const todosIds = sem.blocos.flatMap(b => b.topicos.map(t => t.id));
    const todosConcluidos = todosIds.every(id => progresso[id]);
    const novoProgresso = { ...progresso };
    todosIds.forEach(id => { novoProgresso[id] = !todosConcluidos; });
    setProgresso(novoProgresso);
    setSemanas(redistribuirCronograma(cargo, horasDia, novoProgresso));
    setSalvando(true);
    try { await apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: novoProgresso }); } catch (e) {}
    setSalvando(false);
  }

  async function atualizarHoras() {
    setHorasDia(novasHoras);
    setModalHoras(false);
    setSemanas(redistribuirCronograma(cargo, novasHoras, progresso));
    setSalvando(true);
    try { await apiUpdateHoras(whatsapp, novasHoras); } catch (e) {}
    setSalvando(false);
  }

  return (
    <>
      <Header nome={nome} cargo={cargo} />
      <div style={S.container}>
        <div style={{ padding: "20px 0 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Olá, {nome.split(" ")[0]} 👋</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>Cargo {cargo} · {CARGO_NOMES[cargo]}</div>
          </div>
          <button style={S.btnGhost} onClick={onLogout}>Sair</button>
        </div>

        {showWelcome && (
          <div style={S.alertSuccess}>
            🎯 Seu cronograma foi gerado com base no Radar da Aprovação e nas suas <strong>{horasDia}h/dia</strong> disponíveis. Marque os tópicos conforme for estudando!
            <button onClick={() => setShowWelcome(false)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: C.greenDark, fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Stats */}
        <div style={S.statsRow}>
          <div style={S.statCard}>
            <div style={S.statVal}>{dias}</div>
            <div style={S.statLabel}>dias para a prova</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statVal}>{semanas.length}</div>
            <div style={S.statLabel}>semanas no plano</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statVal}>{pct}%</div>
            <div style={S.statLabel}>concluído</div>
          </div>
        </div>

        {/* Progresso */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Progresso geral</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{totalConcluidos} de {totalTopicos} tópicos {salvando ? "· salvando..." : "· salvo"}</span>
          </div>
          <div style={S.progressBar}><div style={S.progressFill(pct)} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{horasDia}h/dia disponíveis</span>
            <button style={S.btnSecondary} onClick={() => { setNovasHoras(horasDia); setModalHoras(true); }}>
              ✎ Ajustar horas
            </button>
          </div>
        </div>

        {/* Timeline de semanas */}
        {semanas.map((sem, si) => {
          const todosIds = sem.blocos.flatMap(b => b.topicos.map(t => t.id));
          const concluidosSem = todosIds.filter(id => progresso[id]).length;
          const semDone = concluidosSem === todosIds.length && todosIds.length > 0;
          const aberta = semanaAberta === si;
          const horasSem = sem.blocos.reduce((a, b) => a + b.topicos.reduce((x, t) => x + t.horas, 0), 0);

          return (
            <div key={si} style={S.semanaCard(semDone)}>
              <div style={S.semanaHeader(semDone)} onClick={() => setSemanaAberta(aberta ? -1 : si)}>
                <div style={S.semanaNumCircle(semDone)} onClick={e => { e.stopPropagation(); toggleSemana(si); }}>
                  {semDone ? <CheckIcon /> : sem.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={S.semanaTitulo}>Semana {sem.num}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {sem.blocos.map(b => b.bloco).join(" · ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{horasSem}h estimadas</div>
                  <div style={{ fontSize: 11, color: semDone ? C.green : C.textMuted, marginTop: 2 }}>
                    {concluidosSem}/{todosIds.length} tópicos
                  </div>
                </div>
                <span style={{ fontSize: 16, color: C.textMuted, marginLeft: 8 }}>{aberta ? "▲" : "▼"}</span>
              </div>

              {aberta && sem.blocos.map((bloco, bi) => (
                <div key={bi}>
                  <div style={S.blocoLabel}>{bloco.bloco}</div>
                  {bloco.topicos.map((t, ti) => {
                    const done = !!progresso[t.id];
                    return (
                      <div key={ti} style={{ ...S.topicoItem(done), borderBottom: ti < bloco.topicos.length - 1 ? `1px solid ${C.silverLight}` : "none" }}
                        onClick={() => toggleTopico(t.id)}>
                        <div style={S.checkbox(done)}>{done && <CheckIcon />}</div>
                        <span style={S.topicoTexto(done)}>{t.titulo}</span>
                        <span style={S.pBadge(t.p)}>{t.p === "altissima" ? "Altíssima" : t.p === "alta" ? "Alta" : "Média"}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}

        {/* Card prova discursiva */}
        <div style={{ ...S.card, borderLeft: `4px solid ${C.navy}`, borderRadius: "0 12px 12px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>📝 Prova discursiva — atenção especial</div>
          <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>
            Redação dissertativo-argumentativa (TDAS) · Mínimo 20, máximo 30 linhas · Vale 100 pts (mínimo 50 para passar) · Critérios: Conteúdo 70%, Organização 15%, Língua Portuguesa 15%.
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 8 }}>
          Provas em 06/09/2026 · Inscrições até 13/07/2026 · Organizadora: Quadrix
        </div>
      </div>

      {/* Modal ajuste de horas */}
      {modalHoras && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Ajustar disponibilidade</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>
              Os tópicos já concluídos são mantidos. O cronograma será redistribuído a partir dos tópicos pendentes.
            </div>
            <label style={S.label}>Horas por dia: <strong style={{ color: C.navy }}>{novasHoras}h</strong></label>
            <input type="range" min={1} max={8} step={1} value={novasHoras} onChange={e => setNovasHoras(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.navy, marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnSecondary, flex: 1 }} onClick={() => setModalHoras(false)}>Cancelar</button>
              <button style={{ ...S.btnGreen, flex: 1, padding: "12px" }} onClick={atualizarHoras}>Atualizar cronograma</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <div style={S.app}>
      {!usuario
        ? <TelaLogin onEntrar={u => setUsuario(u)} />
        : <TelaDashboard usuario={usuario} onLogout={() => setUsuario(null)} />
      }
    </div>
  );
}
