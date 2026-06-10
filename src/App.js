import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznYux-QKhaJgq-OEbMl6yGx06xNDT2IBM8QUofuupgq8LcLqmEylN5Ql6-4-OrqdFo1w/exec";
const DATA_PROVA = new Date("2026-09-06");

const C = {
  navy: "#1B2E5E", silver: "#C0C8D8", silverLight: "#E8ECF4",
  accent: "#2F80ED", green: "#1D9E75", greenLight: "#E1F5EE",
  greenDark: "#085041", white: "#FFFFFF", bg: "#F4F6FB",
  textPrimary: "#1B2E5E", textSecondary: "#5A6A8A", textMuted: "#8A9ABB",
  border: "#D4DBE8", danger: "#E24B4A",
};

const CARGO_NOMES = { 200: "Agente Social", 201: "Cuidador Social", 202: "Técnico Administrativo" };

// ─── TÓPICOS 100% DO RADAR ────────────────────────────────
const TOPICOS_COMUNS = [
  // Língua Portuguesa
  { bloco: "Língua Portuguesa", titulo: "Interpretação e compreensão de textos", p: "altissima", horas: 4 },
  { bloco: "Língua Portuguesa", titulo: "Coesão e coerência textual / conectivos", p: "altissima", horas: 3 },
  { bloco: "Língua Portuguesa", titulo: "Concordância verbal e nominal", p: "alta", horas: 2 },
  { bloco: "Língua Portuguesa", titulo: "Reescrita de frases e sinonímia", p: "alta", horas: 2 },
  { bloco: "Língua Portuguesa", titulo: "Emprego de pronomes e colocação pronominal", p: "alta", horas: 2 },
  { bloco: "Língua Portuguesa", titulo: "Ortografia oficial", p: "alta", horas: 1 },
  { bloco: "Língua Portuguesa", titulo: "Regência verbal e nominal", p: "media", horas: 1 },
  { bloco: "Língua Portuguesa", titulo: "Sinais de pontuação", p: "media", horas: 1 },
  { bloco: "Língua Portuguesa", titulo: "Crase", p: "media", horas: 1 },
  { bloco: "Língua Portuguesa", titulo: "Tempos e modos verbais", p: "media", horas: 1 },
  // Conhecimentos do DF
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Lei Maria da Penha — Lei 11.340/2006 (mínimo 3 questões obrigatórias)", p: "altissima", horas: 4 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Lei Complementar 840/2011 — Regime Jurídico dos Servidores do DF (Títulos I, V, VI, VII)", p: "altissima", horas: 4 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Lei Distrital 7.484/2024 — lei orgânica da carreira SEDES", p: "alta", horas: 2 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Lei Orgânica do DF — Título VI (Ordem Social e Meio Ambiente)", p: "alta", horas: 2 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Plano Distrital de Política para Mulheres (PDPM)", p: "alta", horas: 2 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Noções básicas de primeiros socorros (engasgo, sangramento, convulsão)", p: "alta", horas: 1 },
  { bloco: "Conhecimentos do DF e Legislação", titulo: "Realidade socioeconômica e geográfica do DF e RIDE", p: "media", horas: 1 },
  // SUAS
  { bloco: "Fundamentos do SUAS", titulo: "PNAS/2004 — princípios, diretrizes, proteções básica e especial", p: "altissima", horas: 4 },
  { bloco: "Fundamentos do SUAS", titulo: "NOB/SUAS 2012 — responsabilidades dos entes, gestão do trabalho", p: "altissima", horas: 3 },
  { bloco: "Fundamentos do SUAS", titulo: "Seguranças socioassistenciais: acolhida, convívio, renda, autonomia", p: "alta", horas: 2 },
  { bloco: "Fundamentos do SUAS", titulo: "Matricialidade sociofamiliar e territorialização", p: "alta", horas: 1 },
  { bloco: "Fundamentos do SUAS", titulo: "Financiamento e cofinanciamento do SUAS", p: "media", horas: 1 },
  // Programas DF
  { bloco: "Programas e Benefícios do DF", titulo: "Plano DF Social — Lei 7.008/2021", p: "altissima", horas: 2 },
  { bloco: "Programas e Benefícios do DF", titulo: "Cartão Prato Cheio — Lei 7.009/2021", p: "alta", horas: 1 },
  { bloco: "Programas e Benefícios do DF", titulo: "Benefícios Eventuais da AS do DF — Lei 5.165/2013", p: "alta", horas: 1 },
  { bloco: "Programas e Benefícios do DF", titulo: "Cartão Gás — Lei 6.938/2021", p: "media", horas: 1 },
  { bloco: "Programas e Benefícios do DF", titulo: "SISAN / Restaurante Comunitário — Decreto 33.329/2011", p: "media", horas: 1 },
  // Reta Final
  { bloco: "Reta Final", titulo: "Simulado geral completo — Conhecimentos Gerais", p: "altissima", horas: 3 },
  { bloco: "Reta Final", titulo: "Revisão dos erros por bloco", p: "alta", horas: 2 },
  { bloco: "Reta Final", titulo: "Treino de redação dissertativo-argumentativa (3 versões)", p: "alta", horas: 3 },
  { bloco: "Reta Final", titulo: "Revisão expressa: Maria da Penha + LC 840", p: "alta", horas: 2 },
];

const TOPICOS_CARGO = {
  200: [
    { bloco: "Específico — Agente Social", titulo: "CRAS, CREAS e Unidades de Acolhimento — organização e funcionamento", p: "altissima", horas: 3 },
    { bloco: "Específico — Agente Social", titulo: "PAIF e SCFV — objetivos e público-alvo", p: "altissima", horas: 3 },
    { bloco: "Específico — Agente Social", titulo: "Abordagem social e população em situação de rua / Decreto 7.053/2009", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Fluxos de referência e contrarreferência no SUAS", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Proteção Social Especial — situações de risco e violação de direitos", p: "alta", horas: 2 },
    { bloco: "Específico — Agente Social", titulo: "Saúde mental, redução de danos e sofrimento psíquico", p: "media", horas: 1 },
    { bloco: "Específico — Agente Social", titulo: "Articulação intersetorial: saúde, educação, justiça", p: "media", horas: 1 },
    { bloco: "Específico — Agente Social", titulo: "Simulado específico — Agente Social", p: "altissima", horas: 2 },
  ],
  201: [
    { bloco: "Específico — Cuidador Social", titulo: "Resolução Conjunta CNAS/CONANDA 1/2009 — orientações técnicas para acolhimento", p: "altissima", horas: 3 },
    { bloco: "Específico — Cuidador Social", titulo: "Rotinas humanizadas de cuidado: higiene, alimentação, autonomia dos usuários", p: "altissima", horas: 3 },
    { bloco: "Específico — Cuidador Social", titulo: "Princípios do acolhimento: excepcionalidade, provisoriedade, vínculo familiar", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Plano Nacional de Convivência Familiar e Comunitária", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Trabalho em equipe interdisciplinar e atribuições do cuidador", p: "alta", horas: 2 },
    { bloco: "Específico — Cuidador Social", titulo: "Saúde mental, redução de danos e abordagem humanizada", p: "media", horas: 1 },
    { bloco: "Específico — Cuidador Social", titulo: "Simulado específico — Cuidador Social", p: "altissima", horas: 2 },
  ],
  202: [
    { bloco: "Específico — Técnico Administrativo", titulo: "Ato administrativo: conceito, requisitos, atributos, anulação e revogação", p: "altissima", horas: 3 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Regime Jurídico dos Servidores do DF — LC 840/2011 (provimento, vacância, PAD)", p: "altissima", horas: 3 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Lei 14.133/2021 — licitações e contratos (noções básicas)", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Arquivologia: protocolo, métodos de arquivamento, digitalização", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Redação oficial e comunicações administrativas", p: "alta", horas: 2 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Administração de materiais: classificação, estoques, patrimônio", p: "media", horas: 1 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Princípios constitucionais da Administração Pública", p: "media", horas: 1 },
    { bloco: "Específico — Técnico Administrativo", titulo: "Simulado específico — Técnico Administrativo", p: "altissima", horas: 2 },
  ],
};

function diasAteProva() {
  return Math.max(0, Math.ceil((DATA_PROVA - new Date()) / 86400000));
}

function gerarCronograma(cargo, horasDia, progressoExistente = {}) {
  const todos = [...TOPICOS_COMUNS, ...(TOPICOS_CARGO[cargo] || [])];

  // Semanas disponíveis até 05/09/2026 (dia antes da prova)
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const vespera = new Date("2026-09-05");
  const diasDisponiveis = Math.max(7, Math.ceil((vespera - hoje) / 86400000));
  const semanasDisponiveis = Math.ceil(diasDisponiveis / 7);

  // Total de tópicos disponíveis
  const totalTopicos = todos.length;
  const totalTopicosSemMedia = todos.filter(t => t.p !== "media").length;
  const totalSlots = horasDia * 7 * semanasDisponiveis; // slots totais no período

  // Decide se inclui média: inclui se houver slots suficientes para tudo
  const lista = totalSlots >= totalTopicos
    ? todos
    : todos.filter(t => t.p !== "media");

  // Cria IDs e marca progresso
  const comIds = lista.map((t, i) => ({
    ...t,
    id: `${cargo}_${i}`,
    concluido: !!progressoExistente[`${cargo}_${i}`],
  }));

  const nTopicos = comIds.length;

  // Calcula quantos tópicos por semana para distribuir uniformemente
  // Se tiver mais slots que tópicos: distribui proporcionalmente (revisão nas últimas semanas)
  // Se tiver menos slots que tópicos: concentra por prioridade
  const topicosPorSemana = Math.max(1, Math.round(nTopicos / semanasDisponiveis));

  // Separa por prioridade
  const altissima = comIds.filter(t => t.p === "altissima");
  const alta      = comIds.filter(t => t.p === "alta");
  const media     = comIds.filter(t => t.p === "media");

  // Intercala: altíssima, alta, altíssima, alta, altíssima, média
  const filaOrdenada = [];
  const aIdx = { altissima: 0, alta: 0, media: 0 };
  const filas = { altissima, alta, media };
  const padrao = ["altissima", "alta", "altissima", "alta", "altissima", "media"];
  let rodada = 0;

  while (aIdx.altissima < altissima.length || aIdx.alta < alta.length || aIdx.media < media.length) {
    const tipo = padrao[rodada % padrao.length];
    if (aIdx[tipo] < filas[tipo].length) {
      filaOrdenada.push(filas[tipo][aIdx[tipo]]);
      aIdx[tipo]++;
    } else {
      const fallback = ["altissima", "alta", "media"].find(t => aIdx[t] < filas[t].length);
      if (!fallback) break;
      filaOrdenada.push(filas[fallback][aIdx[fallback]]);
      aIdx[fallback]++;
    }
    rodada++;
  }

  // Distribui em semanas com topicosPorSemana uniforme
  const semanas = [];
  let semAtual = { num: 1, blocos: {}, count: 0, ordemBlocos: [] };

  const pushSemana = () => {
    semanas.push({
      num: semAtual.num,
      blocos: semAtual.ordemBlocos.map(b => semAtual.blocos[b]),
      count: semAtual.count,
    });
    semAtual = { num: semanas.length + 1, blocos: {}, count: 0, ordemBlocos: [] };
  };

  filaOrdenada.forEach(t => {
    if (semAtual.count >= topicosPorSemana) pushSemana();
    if (!semAtual.blocos[t.bloco]) {
      semAtual.blocos[t.bloco] = { bloco: t.bloco, topicos: [] };
      semAtual.ordemBlocos.push(t.bloco);
    }
    semAtual.blocos[t.bloco].topicos.push(t);
    semAtual.count++;
  });
  if (semAtual.count > 0) pushSemana();

  // Preenche semanas restantes com revisão (se sobrar semanas)
  while (semanas.length < semanasDisponiveis) {
    semanas.push({
      num: semanas.length + 1,
      blocos: [{ bloco: "Revisão e Simulados", topicos: [
        { id: `rev_${semanas.length}`, bloco: "Revisão e Simulados", titulo: "Semana de revisão — refaça tópicos com dificuldade e simulados", p: "altissima", concluido: !!progressoExistente[`rev_${semanas.length}`] },
      ]}],
      count: 1,
    });
  }

  return semanas;
}

// ─── API ──────────────────────────────────────────────────
async function apiGet(whatsapp) {
  const r = await fetch(`${SCRIPT_URL}?action=get&whatsapp=${encodeURIComponent(whatsapp)}`);
  return r.json();
}
async function apiSave(payload) {
  await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "save", ...payload }) });
}
async function apiUpdateHoras(whatsapp, horasDia) {
  await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "update_horas", whatsapp, horasDia }) });
}

// ─── ESTILOS ──────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Segoe UI',sans-serif" },
  wrap: { maxWidth: 640, margin: "0 auto", padding: "0 16px 48px" },
  header: { background: C.navy, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 },
  logoCircle: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  card: { background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 12 },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: C.textSecondary, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 6 },
  input: { width: "100%", padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 15, color: C.navy, background: C.white, outline: "none", boxSizing: "border-box" },
  btnPrimary: { width: "100%", padding: 14, borderRadius: 10, background: C.navy, color: C.white, fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer" },
  btnSec: { padding: "10px 16px", borderRadius: 8, background: "transparent", color: C.navy, fontSize: 13, fontWeight: 600, border: `1.5px solid ${C.border}`, cursor: "pointer" },
  btnGhost: { padding: "8px 14px", borderRadius: 8, background: "transparent", color: C.textSecondary, fontSize: 13, border: "none", cursor: "pointer" },
  btnGreen: { flex: 1, padding: 12, borderRadius: 10, background: C.green, color: C.white, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" },
  cargoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  cargoCard: sel => ({ padding: "14px 10px", borderRadius: 10, border: sel ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`, background: sel ? C.silverLight : C.white, cursor: "pointer", textAlign: "center" }),
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  statCard: { background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 12px", textAlign: "center" },
  pBar: { height: 8, background: C.silverLight, borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  pFill: pct => ({ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 4, transition: "width .4s" }),
  semCard: done => ({ background: C.white, borderRadius: 12, border: `1px solid ${done ? C.green : C.border}`, marginBottom: 12, overflow: "hidden", opacity: done ? 0.85 : 1 }),
  semHead: done => ({ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, background: done ? C.greenLight : C.white, borderBottom: `1px solid ${done ? "#9FE1CB" : C.border}`, cursor: "pointer" }),
  semNum: done => ({ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: done ? C.green : C.navy, color: C.white, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }),
  topicoRow: done => ({ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 16px", cursor: "pointer", background: done ? "#F8FFF9" : C.white }),
  chk: done => ({ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: done ? "none" : `2px solid ${C.border}`, background: done ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }),
  topicoTxt: done => ({ fontSize: 13, color: done ? C.textMuted : C.textPrimary, lineHeight: 1.5, flex: 1, textDecoration: done ? "line-through" : "none" }),
  badge: p => ({ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, flexShrink: 0, marginTop: 3, background: p === "altissima" ? C.greenLight : p === "alta" ? "#E6F1FB" : C.silverLight, color: p === "altissima" ? C.greenDark : p === "alta" ? "#0C447C" : C.textSecondary }),
  blocoLbl: { fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: ".05em", textTransform: "uppercase", padding: "8px 16px 4px", background: C.silverLight, borderBottom: `1px solid ${C.border}` },
};

function Logo() {
  return <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" stroke="#C0C8D8" strokeWidth="1.5"/><circle cx="11" cy="11" r="6" stroke="#C0C8D8" strokeWidth="1.5"/><path d="M11 4 C8 6 7 9 8 12 C9 15 12 17 14 15 C16 13 15 9 13 7 Z" fill="#C0C8D8" opacity=".8"/></svg>;
}
function CheckIco() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Header({ nome, cargo }) {
  return (
    <div style={S.header}>
      <div style={S.logoCircle}><Logo /></div>
      <div>
        <div style={{ color: C.white, fontSize: 15, fontWeight: 600 }}>SEDES Premium 2026</div>
        {nome && <div style={{ color: C.silver, fontSize: 12, marginTop: 1 }}>{nome}{cargo ? ` · ${CARGO_NOMES[cargo]}` : ""}</div>}
      </div>
    </div>
  );
}

function BoxApp() {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ ...S.card, borderLeft: `4px solid ${C.accent}`, borderRadius: "0 12px 12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAberto(!aberto)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>📲</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>Adicione na tela inicial do celular</div>
            <div style={{ fontSize: 12, color: C.textSecondary }}>Acesse como um app, sem abrir o navegador</div>
          </div>
        </div>
        <span style={{ color: C.textMuted }}>{aberto ? "▲" : "▼"}</span>
      </div>
      {aberto && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>🍎 iPhone (Safari)</div>
            <ol style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.9, paddingLeft: 18 }}>
              <li>Abra este link no <strong>Safari</strong></li>
              <li>Toque no ícone de compartilhar <strong>↑</strong></li>
              <li>Toque em <strong>"Adicionar à Tela de Início"</strong></li>
              <li>Confirme em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>🤖 Android (Chrome)</div>
            <ol style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.9, paddingLeft: 18 }}>
              <li>Abra este link no <strong>Chrome</strong></li>
              <li>Toque nos três pontinhos <strong>⋮</strong></li>
              <li>Toque em <strong>"Adicionar à tela inicial"</strong></li>
              <li>Confirme em <strong>"Adicionar"</strong></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TELA LOGIN ───────────────────────────────────────────
function TelaLogin({ onEntrar }) {
  const [nome, setNome] = useState("");
  const [wpp, setWpp] = useState("");
  const [cargo, setCargo] = useState(null);
  const [horas, setHoras] = useState(2);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar() {
    if (!nome.trim() || !wpp.trim() || !cargo) { setErro("Preencha todos os campos e selecione seu cargo."); return; }
    if (wpp.replace(/\D/g, "").length < 10) { setErro("Digite um WhatsApp válido com DDD."); return; }
    setErro(""); setLoading(true);
    try {
      const res = await apiGet(wpp.replace(/\D/g, ""));
      if (res.found) {
        onEntrar({ nome: res.nome, whatsapp: res.whatsapp, cargo: parseInt(res.cargo), horasDia: res.horasDia, progresso: res.progresso || {}, isNovo: false });
      } else {
        onEntrar({ nome: nome.trim(), whatsapp: wpp.replace(/\D/g, ""), cargo, horasDia: horas, progresso: {}, isNovo: true });
      }
    } catch { setErro("Erro de conexão. Verifique sua internet."); }
    setLoading(false);
  }

  return (
    <>
      <Header />
      <div style={S.wrap}>
        <div style={{ padding: "24px 0 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Seu plano personalizado</div>
          <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6 }}>Informe seus dados para gerar ou retomar seu cronograma adaptado à sua disponibilidade.</div>
        </div>
        <div style={S.card}>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Seu nome</label>
            <input style={S.input} placeholder="Ex: Maria Silva" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>WhatsApp (com DDD)</label>
            <input style={S.input} placeholder="Ex: 61999999999" value={wpp} onChange={e => setWpp(e.target.value)} inputMode="numeric" />
            <div style={{ background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#7A5800", marginTop: 8 }}>
              ⚠️ O WhatsApp é usado para buscar seu progresso. Digite corretamente com DDD — sem erros o app não encontrará seus dados.
            </div>
          </div>
          <label style={{ ...S.label, marginBottom: 10 }}>Cargo que vai disputar</label>
          <div style={S.cargoGrid}>
            {[200, 201, 202].map(c => (
              <div key={c} style={S.cargoCard(cargo === c)} onClick={() => setCargo(c)}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>Cargo {c}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.3 }}>{CARGO_NOMES[c]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Horas de estudo por dia: <strong style={{ color: C.navy }}>{horas}h</strong></label>
            <input type="range" min={1} max={8} step={1} value={horas} onChange={e => setHoras(Number(e.target.value))} style={{ width: "100%", accentColor: C.navy }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textMuted, marginTop: 4 }}>
              <span>1h</span><span>4h</span><span>8h</span>
            </div>
          </div>
          {erro && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.danger, marginBottom: 12 }}>{erro}</div>}
          <button style={S.btnPrimary} onClick={entrar} disabled={loading}>{loading ? "Carregando..." : "→  Acessar meu cronograma"}</button>
        </div>
        <BoxApp />
        <div style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 4 }}>Provas em 06/09/2026 · Inscrições até 13/07/2026 · Quadrix</div>
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────
function Dashboard({ usuario, onLogout }) {
  const { nome, whatsapp, cargo, horasDia: hi, progresso: pi, isNovo } = usuario;
  const [progresso, setProgresso] = useState(pi);
  const [horasDia, setHorasDia] = useState(Number(hi) || 2);
  const [semanas, setSemanas] = useState([]);
  const [aberta, setAberta] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [modalH, setModalH] = useState(false);
  const [novasH, setNovasH] = useState(Number(hi) || 2);
  const [welcome, setWelcome] = useState(isNovo);

  useEffect(() => {
    setSemanas(gerarCronograma(cargo, horasDia, progresso));
    if (isNovo) apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: {} });
  }, []);

  const totalT = semanas.reduce((a, s) => a + s.blocos.reduce((b, bl) => b + bl.topicos.length, 0), 0);
  const doneT = Object.values(progresso).filter(Boolean).length;
  const pct = totalT > 0 ? Math.round(doneT / totalT * 100) : 0;

  async function toggle(id) {
    const novo = { ...progresso, [id]: !progresso[id] };
    setProgresso(novo); setSemanas(gerarCronograma(cargo, horasDia, novo));
    setSalvando(true); try { await apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: novo }); } catch {} setSalvando(false);
  }

  async function toggleSem(si) {
    const ids = semanas[si].blocos.flatMap(b => b.topicos.map(t => t.id));
    const allDone = ids.every(id => progresso[id]);
    const novo = { ...progresso }; ids.forEach(id => { novo[id] = !allDone; });
    setProgresso(novo); setSemanas(gerarCronograma(cargo, horasDia, novo));
    setSalvando(true); try { await apiSave({ nome, whatsapp, cargo: String(cargo), horasDia, progresso: novo }); } catch {} setSalvando(false);
  }

  async function atualizarH() {
    setHorasDia(novasH); setModalH(false);
    setSemanas(gerarCronograma(cargo, novasH, progresso));
    setSalvando(true); try { await apiUpdateHoras(whatsapp, novasH); } catch {} setSalvando(false);
  }

  return (
    <>
      <Header nome={nome} cargo={cargo} />
      <div style={S.wrap}>
        <div style={{ padding: "20px 0 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>Olá, {nome.split(" ")[0]} 👋</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>Cargo {cargo} · {CARGO_NOMES[cargo]}</div>
          </div>
          <button style={S.btnGhost} onClick={onLogout}>Sair</button>
        </div>

        {welcome && (
          <div style={{ background: C.greenLight, border: `1px solid #9FE1CB`, borderRadius: 10, padding: "12px 14px", fontSize: 13, color: C.greenDark, marginBottom: 12 }}>
            🎯 Cronograma gerado com base no Radar da Aprovação e nas suas <strong>{horasDia}h/dia</strong>. Marque os tópicos conforme estudar — progresso salvo automaticamente!
            <button onClick={() => setWelcome(false)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: C.greenDark, fontSize: 18 }}>×</button>
          </div>
        )}

        <div style={S.statsRow}>
          <div style={S.statCard}><div style={{ fontSize: 26, fontWeight: 700, color: C.navy }}>{diasAteProva()}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>dias para a prova</div></div>
          <div style={S.statCard}><div style={{ fontSize: 26, fontWeight: 700, color: C.navy }}>{semanas.length}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>semanas no plano</div></div>
          <div style={S.statCard}><div style={{ fontSize: 26, fontWeight: 700, color: C.navy }}>{pct}%</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>concluído</div></div>
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>Progresso geral</span>
            <span style={{ fontSize: 12, color: C.textMuted }}>{doneT}/{totalT} · {salvando ? "salvando..." : "✓ salvo"}</span>
          </div>
          <div style={S.pBar}><div style={S.pFill(pct)} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{horasDia}h/dia disponíveis</span>
            <button style={S.btnSec} onClick={() => { setNovasH(horasDia); setModalH(true); }}>✎ Ajustar horas</button>
          </div>
        </div>

        {semanas.map((sem, si) => {
          const ids = sem.blocos.flatMap(b => b.topicos.map(t => t.id));
          const doneS = ids.filter(id => progresso[id]).length;
          const semDone = doneS === ids.length && ids.length > 0;
          const open = aberta === si;

          return (
            <div key={si} style={S.semCard(semDone)}>
              <div style={S.semHead(semDone)} onClick={() => setAberta(open ? -1 : si)}>
                <div style={S.semNum(semDone)} onClick={e => { e.stopPropagation(); toggleSem(si); }}>
                  {semDone ? <CheckIco /> : sem.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>Semana {sem.num}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sem.blocos.map(b => b.bloco).join(" · ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: semDone ? C.green : C.textMuted }}>{doneS}/{ids.length} tópicos</div>
                </div>
                <span style={{ fontSize: 16, color: C.textMuted, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
              </div>

              {open && sem.blocos.map((bloco, bi) => (
                <div key={bi}>
                  <div style={S.blocoLbl}>{bloco.bloco}</div>
                  {bloco.topicos.map((t, ti) => {
                    const done = !!progresso[t.id];
                    return (
                      <div key={ti} style={{ ...S.topicoRow(done), borderBottom: ti < bloco.topicos.length - 1 ? `1px solid ${C.silverLight}` : "none" }} onClick={() => toggle(t.id)}>
                        <div style={S.chk(done)}>{done && <CheckIco />}</div>
                        <span style={S.topicoTxt(done)}>{t.titulo}</span>
                        <span style={S.badge(t.p)}>{t.p === "altissima" ? "Altíssima" : t.p === "alta" ? "Alta" : "Média"}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}

        <BoxApp />
        <div style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 8 }}>Provas em 06/09/2026 · Inscrições até 13/07/2026 · Quadrix</div>
      </div>

      {modalH && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 24, width: "100%", maxWidth: 380 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Ajustar disponibilidade</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>Os tópicos já concluídos são mantidos. O plano é redistribuído com o que falta.</div>
            <label style={S.label}>Horas por dia: <strong style={{ color: C.navy }}>{novasH}h</strong></label>
            <input type="range" min={1} max={8} step={1} value={novasH} onChange={e => setNovasH(Number(e.target.value))} style={{ width: "100%", accentColor: C.navy, marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...S.btnSec, flex: 1 }} onClick={() => setModalH(false)}>Cancelar</button>
              <button style={S.btnGreen} onClick={atualizarH}>Atualizar cronograma</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  return (
    <div style={S.app}>
      {!usuario ? <TelaLogin onEntrar={u => setUsuario(u)} /> : <Dashboard usuario={usuario} onLogout={() => setUsuario(null)} />}
    </div>
  );
}
