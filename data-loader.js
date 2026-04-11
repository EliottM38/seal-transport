const BIN_ID = "69d95af5aaba882197e64b7e";
const API_KEY = "$2a$10$0apNc/nNCMR.8/TGHyYHxO5hePLCGZ9bJua1DrAKkJdLf8y8TGbdm";

async function chargerData() {
  try {
    const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    const j = await r.json();
    return j.record || {};
  } catch(e) {
    console.warn('Impossible de charger data.json', e);
    return {};
  }
}

// Injecte les alertes infotrafic sur les pages de lignes
async function injecterInfotrafic(codeLigne) {
  const data = await chargerData();
  const alertes = (data.alertes || []).filter(a => a.ligne === codeLigne);
  const el = document.getElementById('infotrafic-ligne');
  if (!el) return;
  if (!alertes.length) {
    el.innerHTML = `
      <div style="background:var(--noir-card);border:1px solid var(--bordure);border-left:4px solid #2ECC71;border-radius:0 12px 12px 0;padding:1rem 1.25rem 1rem 1.5rem;margin-bottom:2rem;display:flex;align-items:center;gap:12px">
        <span style="color:#2ECC71;font-size:18px">✓</span>
        <span style="font-size:14px;color:var(--texte-sec)">Circulation <strong style="color:#2ECC71">normale</strong> sur cette ligne</span>
      </div>`;
    return;
  }
  el.innerHTML = alertes.map(a => {
    const borderCol = a.niveau === 'rouge' ? '#E74C3C' : '#E67E22';
    const badgeStyle = a.niveau === 'rouge'
      ? 'background:rgba(231,76,60,0.15);color:#E74C3C'
      : 'background:rgba(230,126,34,0.15);color:#E67E22';
    return `
      <div style="background:var(--noir-card);border:1px solid var(--bordure);border-left:4px solid ${borderCol};border-radius:0 12px 12px 0;padding:1.25rem 1.25rem 1.25rem 1.5rem;margin-bottom:1rem;display:flex;gap:14px;align-items:flex-start">
        <div style="flex-shrink:0"><span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.07em;font-family:'Plus Jakarta Sans',sans-serif;${badgeStyle}">Perturbé</span></div>
        <div>
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px;color:var(--texte)">${a.titre}</div>
          <div style="font-size:13px;color:var(--texte-sec);line-height:1.5">${a.desc}</div>
          <div style="font-size:11px;color:var(--texte-sec);margin-top:6px">Publié le ${a.date}</div>
        </div>
      </div>`;
  }).join('');
}

// Injecte les articles sur la page actualités
async function injecterArticles() {
  const data = await chargerData();
  const articles = data.articles || [];
  const el = document.getElementById('articles-dynamiques');
  if (!el || !articles.length) return;
  const CATS = {actualite:'Actualité',travaux:'Travaux',evenement:'Événement','info-reseau':'Info réseau'};
  el.innerHTML = articles.map(a => `
    <div style="background:var(--noir-card);border:1px solid var(--bordure);border-radius:14px;padding:1.5rem;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="background:rgba(201,168,76,0.15);color:var(--or);font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;text-transform:uppercase">${CATS[a.cat]||a.cat}</span>
        <span style="font-size:11px;color:var(--texte-sec)">${a.date}</span>
      </div>
      <h3 style="font-family:'Plus Jakarta Sans',sans-serif;font-size:17px;font-weight:700;margin-bottom:8px;color:var(--texte)">${a.titre}</h3>
      <p style="font-size:14px;color:var(--texte-sec);line-height:1.6">${a.contenu}</p>
    </div>`).join('');
}

// Injecte les alertes sur la page infotrafic globale
async function injecterInfotraficGlobal() {
  const data = await chargerData();
  const alertes = data.alertes || [];
  const el = document.getElementById('alertes-dynamiques');
  if (!el) return;
  if (!alertes.length) {
    el.innerHTML = '<div style="font-size:14px;color:var(--texte-sec);padding:1rem 0">Aucune perturbation en cours.</div>';
    return;
  }
  const LC = {C1:"#185FA5",C2:"#0F6E56",C3:"#993C1D","4":"#534AB7","5":"#3B6D11","6":"#854F0B","7":"#993556","8":"#5F5E5A","9":"#185FA5","10":"#0F6E56","11":"#A32D2D","60":"#412402","61":"#3B6D11",PL1:"#2C2C2A"};
  el.innerHTML = alertes.map(a => {
    const borderCol = a.niveau === 'rouge' ? '#E74C3C' : '#E67E22';
    const badgeBg = a.niveau === 'rouge' ? 'rgba(231,76,60,0.15)' : 'rgba(230,126,34,0.15)';
    const badgeCol = a.niveau === 'rouge' ? '#E74C3C' : '#E67E22';
    return `
      <div style="background:var(--noir-card);border:1px solid var(--bordure);border-left:4px solid ${borderCol};border-radius:0 12px 12px 0;padding:1.25rem 1.25rem 1.25rem 1.5rem;margin-bottom:12px;display:flex;gap:14px">
        <div>
          <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.07em;background:${badgeBg};color:${badgeCol}">Perturbé</span>
          <div style="margin-top:8px"><span style="background:${LC[a.ligne]||'#555'};color:white;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:12px;padding:3px 10px;border-radius:6px">${a.ligne}</span></div>
        </div>
        <div>
          <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px;color:var(--texte)">${a.titre}</div>
          <div style="font-size:13px;color:var(--texte-sec);line-height:1.5">${a.desc}</div>
          <a href="ligne-${a.ligne.toLowerCase()}.html" style="font-size:12px;color:var(--or);text-decoration:none;display:inline-block;margin-top:6px">Voir la fiche ligne ${a.ligne} →</a>
        </div>
      </div>`;
  }).join('');
}
