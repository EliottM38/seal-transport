function jourType() {
  const j = new Date().getDay();
  if (j === 6) return "samedi";
  if (j === 0) return "dimanche";
  return "semaine";
}

function minutesAvant(heureStr) {
  const maintenant = new Date();
  const [h, m] = heureStr.split(":").map(Number);
  const passage = new Date();
  passage.setHours(h, m, 0, 0);
  if (passage - maintenant < -12 * 60 * 60 * 1000) {
    passage.setDate(passage.getDate() + 1);
  }
  return Math.round((passage - maintenant) / 60000);
}

function heureActuelle() {
  const n = new Date();
  return n.getHours().toString().padStart(2,'0') + ':' + n.getMinutes().toString().padStart(2,'0');
}

let ligneData = null;
let arretSelectionne = null;

async function chargerPassages() {
  const horairesDiv = document.getElementById("horaires");
  try {
    const res = await fetch("lines.json");
    const lines = await res.json();
    const jour = jourType();
    ligneData = lines.find(l => l.code === CODE && l.direction === DIRECTION && l.jour === jour);

    if (!ligneData) {
      horairesDiv.innerHTML = '<div class="empty">Pas de circulation aujourd\'hui sur cette ligne.</div>';
      return;
    }

    // Si la ligne a des arrêts détaillés → afficher le sélecteur
    if (ligneData.arrets && ligneData.arrets.length > 0) {
      afficherSelecteurArret();
    } else {
      afficherPassagesTerminus();
      setInterval(afficherPassagesTerminus, 30000);
    }

  } catch (err) {
    console.error("Erreur :", err);
    horairesDiv.innerHTML = '<div class="empty">Impossible de charger les données.</div>';
  }
}

// ── MODE ARRÊTS ──────────────────────────────────────────────
function afficherSelecteurArret() {
  const horairesDiv = document.getElementById("horaires");

  // Construire le sélecteur d'arrêt + affichage initial
  let selectHtml = `
    <div style="margin-bottom:1.5rem">
      <label style="font-size:12px;font-weight:700;color:var(--texte-sec);text-transform:uppercase;letter-spacing:0.08em;font-family:Syne,sans-serif;display:block;margin-bottom:8px">Choisir un arrêt</label>
      <select id="arret-select" onchange="changerArret(this.value)" style="
        width:100%;padding:12px 16px;border-radius:10px;
        border:1px solid var(--bordure);background:var(--noir-card);
        color:var(--texte);font-size:14px;font-family:DM Sans,sans-serif;
        cursor:pointer;
      ">
        <option value="">— Sélectionnez votre arrêt —</option>
        ${ligneData.arrets.map((a, i) => `<option value="${i}">${a.nom}</option>`).join("")}
      </select>
    </div>

    <div style="margin-bottom:1.5rem">
      <div style="font-size:12px;font-weight:700;color:var(--texte-sec);text-transform:uppercase;letter-spacing:0.08em;font-family:Syne,sans-serif;margin-bottom:10px">Tous les arrêts</div>
      <div id="liste-arrets" style="display:flex;flex-direction:column;gap:0">
        ${ligneData.arrets.map((a, i) => {
          const prochains = a.passages
            .map(h => ({ heure: h, min: minutesAvant(h) }))
            .filter(p => p.min >= 0 && p.min <= 40)
            .sort((x,y) => x.min - y.min);
          const prochain = prochains[0];
          const label = prochain ? (prochain.min === 0 ? "À l'arrêt" : `${prochain.min} min`) : prochain?.heure || "—";
          const couleur = prochain ? (prochain.min <= 5 ? "#E74C3C" : prochain.min <= 15 ? "var(--or)" : "var(--texte-sec)") : "var(--texte-sec)";

          const estDernier = i === ligneData.arrets.length - 1;
          return `
          <div onclick="changerArret('${i}')" id="arret-row-${i}" style="
            display:flex;align-items:center;gap:12px;padding:10px 14px;
            cursor:pointer;border-radius:8px;transition:background 0.15s;
            ${arretSelectionne == i ? 'background:var(--or-pale);border:1px solid rgba(201,168,76,0.3)' : 'border:1px solid transparent'}
          " onmouseover="this.style.background='var(--or-pale)'" onmouseout="this.style.background='${arretSelectionne == i ? 'var(--or-pale)' : 'transparent'}'">
            <div style="display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0">
              <div style="width:12px;height:12px;border-radius:50%;border:2px solid var(--or);background:var(--noir-card);z-index:1"></div>
              ${!estDernier ? `<div style="width:2px;height:24px;background:var(--bordure)"></div>` : ''}
            </div>
            <span style="flex:1;font-size:14px;color:var(--texte);font-weight:${arretSelectionne == i ? '700' : '400'}">${a.nom}</span>
            <span style="font-family:Syne,sans-serif;font-size:13px;font-weight:700;color:${couleur}">${label}</span>
          </div>`;
        }).join("")}
      </div>
    </div>

    <div id="detail-arret"></div>
  `;

  horairesDiv.innerHTML = selectHtml;

  // Si un arrêt était sélectionné, le restaurer
  if (arretSelectionne !== null) {
    document.getElementById("arret-select").value = arretSelectionne;
    afficherDetailArret(arretSelectionne);
  }
}

function changerArret(index) {
  if (index === "") return;
  arretSelectionne = parseInt(index);
  document.getElementById("arret-select").value = index;
  afficherDetailArret(arretSelectionne);

  // Mettre en évidence dans la liste
  ligneData.arrets.forEach((_, i) => {
    const row = document.getElementById(`arret-row-${i}`);
    if (row) {
      row.style.background = i == arretSelectionne ? 'var(--or-pale)' : 'transparent';
      row.style.border = i == arretSelectionne ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent';
      row.querySelector('span').style.fontWeight = i == arretSelectionne ? '700' : '400';
    }
  });

  // Scroll vers le détail
  document.getElementById("detail-arret").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function afficherDetailArret(index) {
  const arret = ligneData.arrets[index];
  const div = document.getElementById("detail-arret");

  const aVenir = arret.passages
    .map(h => ({ heure: h, min: minutesAvant(h) }))
    .filter(p => p.min >= 0 && p.min <= 40)
    .sort((a, b) => a.min - b.min);

  if (aVenir.length === 0) {
    div.innerHTML = `
      <div style="background:var(--noir-card);border:1px solid var(--bordure);border-radius:12px;padding:1.5rem;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">🌙</div>
        <div style="font-family:Syne,sans-serif;font-weight:700;color:var(--texte);margin-bottom:4px">Fin de service à ${arret.nom}</div>
        <div style="font-size:13px;color:var(--texte-sec)">Aucun passage dans les 40 prochaines minutes.</div>
      </div>`;
    return;
  }

  let html = `
    <div style="background:var(--noir-card);border:1px solid rgba(201,168,76,0.3);border-radius:16px;padding:1.5rem;margin-top:0.5rem">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem">
        <div style="width:10px;height:10px;border-radius:50%;background:var(--or);flex-shrink:0"></div>
        <span style="font-family:Syne,sans-serif;font-size:16px;font-weight:800;color:var(--texte)">${arret.nom}</span>
        <span class="live-chip" style="margin-left:auto;font-size:10px"><span class="live-dot"></span>En direct</span>
      </div>
      <div style="font-size:12px;color:var(--texte-sec);margin-bottom:1rem">
        ${aVenir.length} prochain${aVenir.length > 1 ? 's passages' : ' passage'} · mis à jour à ${heureActuelle()}
      </div>`;

  aVenir.forEach((p, i) => {
    const estArret = p.min === 0;
    const label = estArret ? "À l'arrêt" : `${p.min} min`;
    let accentColor = p.min <= 5 ? "#E74C3C" : p.min <= 15 ? "var(--or)" : "var(--texte-sec)";
    let bgColor = p.min <= 5 ? "rgba(231,76,60,0.06)" : p.min <= 15 ? "rgba(201,168,76,0.06)" : "transparent";
    let borderColor = p.min <= 5 ? "rgba(231,76,60,0.3)" : p.min <= 15 ? "rgba(201,168,76,0.2)" : "var(--bordure)";
    const pct = Math.max(0, Math.round((1 - p.min / 40) * 100));
    const barColor = p.min <= 5 ? "#E74C3C" : p.min <= 15 ? "var(--or)" : "#3A3A3A";
    const clignote = estArret ? "clignote-arret" : "";

    if (i === 0) {
      html += `
        <div class="${clignote}" style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:1.25rem;margin-bottom:10px;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--bordure)">
            <div style="height:3px;width:${pct}%;background:${barColor};border-radius:2px"></div>
          </div>
          <div style="display:flex;align-items:flex-end;justify-content:space-between">
            <div>
              <div style="font-size:11px;color:var(--texte-sec);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.08em;font-family:Syne,sans-serif">${estArret ? '🚨 Bus à l\'arrêt !' : 'Prochain bus'}</div>
              <div style="font-family:Syne,sans-serif;font-size:16px;font-weight:700;color:var(--texte)">→ ${DIRECTION}</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:Syne,sans-serif;font-size:40px;font-weight:800;color:${accentColor};line-height:1">${p.min}</div>
              <div style="font-size:12px;color:var(--texte-sec)">${estArret ? "À l'arrêt" : 'min'}</div>
            </div>
          </div>
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bordure);display:flex;justify-content:space-between">
            <span style="font-size:12px;color:var(--texte-sec)">Passage prévu à</span>
            <span style="font-family:Syne,sans-serif;font-size:13px;font-weight:700;color:var(--texte)">${p.heure}</span>
          </div>
        </div>`;
    } else {
      html += `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bordure)">
          <span style="font-family:Syne,sans-serif;font-size:14px;font-weight:700;color:${accentColor};min-width:60px">${label}</span>
          <span style="font-size:13px;color:var(--texte-sec)">→ ${DIRECTION}</span>
          <span style="font-family:Syne,sans-serif;font-size:13px;color:var(--texte-sec);margin-left:auto">${p.heure}</span>
        </div>`;
    }
  });

  html += `</div>`;
  div.innerHTML = html;
}

// ── MODE TERMINUS (pas d'arrêts détaillés) ───────────────────
function afficherPassagesTerminus() {
  const horairesDiv = document.getElementById("horaires");

  const aVenir = ligneData.horaires
    .map(h => ({ ...h, minutes: minutesAvant(h.heure) }))
    .filter(h => h.minutes >= 0 && h.minutes <= 40)
    .sort((a, b) => a.minutes - b.minutes);

  if (aVenir.length === 0) {
    horairesDiv.innerHTML = `<div style="text-align:center;padding:3rem 1rem">
      <div style="font-size:48px;margin-bottom:1rem">🌙</div>
      <div style="font-family:Syne,sans-serif;font-size:18px;font-weight:700;color:var(--texte);margin-bottom:8px">Fin de service</div>
      <div style="font-size:14px;color:var(--texte-sec)">Aucun passage prévu dans les 40 prochaines minutes.</div>
    </div>`;
    return;
  }

  let html = `<div style="font-size:12px;color:var(--texte-sec);margin-bottom:1rem;display:flex;align-items:center;gap:6px">
    <span class="live-dot"></span>Mis à jour à ${heureActuelle()} · ${aVenir.length} prochain${aVenir.length > 1 ? 's passages' : ' passage'}
  </div>`;

  aVenir.forEach((h, i) => {
    const estArret = h.minutes === 0;
    const label = estArret ? "À l'arrêt" : `${h.minutes} min`;
    let accentColor = estArret || h.minutes <= 5 ? "#E74C3C" : h.minutes <= 15 ? "var(--or)" : "var(--texte-sec)";
    let bgColor = estArret || h.minutes <= 5 ? "rgba(231,76,60,0.06)" : h.minutes <= 15 ? "rgba(201,168,76,0.06)" : "var(--noir-card)";
    let borderColor = estArret || h.minutes <= 5 ? "rgba(231,76,60,0.3)" : h.minutes <= 15 ? "rgba(201,168,76,0.3)" : "var(--bordure)";
    const pct = Math.max(0, Math.round((1 - h.minutes / 40) * 100));
    const barColor = h.minutes <= 5 ? "#E74C3C" : h.minutes <= 15 ? "var(--or)" : "#3A3A3A";
    const clignote = estArret ? "clignote-arret" : "";

    if (i === 0) {
      html += `<div class="${clignote}" style="background:${bgColor};border:1px solid ${borderColor};border-radius:16px;padding:1.5rem;margin-bottom:12px;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--bordure)">
          <div style="height:3px;width:${pct}%;background:${barColor};border-radius:2px"></div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span style="background:${ligneData.couleurFond};color:${ligneData.couleurTexte};font-family:Syne,sans-serif;font-weight:800;font-size:14px;padding:6px 14px;border-radius:8px">${ligneData.code}</span>
          <span style="font-size:11px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.1em;font-family:Syne,sans-serif">${estArret ? '🚨 Bus à l\'arrêt !' : 'Prochain départ'}</span>
          <span class="live-chip" style="margin-left:auto;font-size:10px"><span class="live-dot"></span>En direct</span>
        </div>
        <div style="display:flex;align-items:flex-end;justify-content:space-between">
          <div>
            <div style="font-family:Syne,sans-serif;font-size:13px;color:var(--texte-sec);margin-bottom:4px">Direction</div>
            <div style="font-family:Syne,sans-serif;font-size:20px;font-weight:800;color:var(--texte)">${h.destination}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:Syne,sans-serif;font-size:42px;font-weight:800;color:${accentColor};line-height:1">${h.minutes}</div>
            <div style="font-size:13px;color:var(--texte-sec);margin-top:2px">${estArret ? "À l'arrêt" : 'minutes'}</div>
          </div>
        </div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bordure);display:flex;justify-content:space-between">
          <span style="font-size:12px;color:var(--texte-sec)">Départ prévu à</span>
          <span style="font-family:Syne,sans-serif;font-size:14px;font-weight:700;color:var(--texte)">${h.heure}</span>
        </div>
      </div>`;
    } else {
      html += `<div style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;" class="${clignote}">
        <span style="background:${estArret||h.minutes<=5?'#E74C3C':h.minutes<=15?'var(--or)':'#3A3A3A'};color:white;font-family:Syne,sans-serif;font-weight:800;font-size:12px;padding:4px 10px;border-radius:6px;min-width:42px;text-align:center">${ligneData.code}</span>
        <span style="font-size:14px;color:var(--texte);flex:1;font-weight:500">${h.destination}</span>
        <div style="text-align:right">
          <div style="font-family:Syne,sans-serif;font-size:16px;font-weight:800;color:${accentColor}">${label}</div>
          <div style="font-size:11px;color:var(--texte-sec)">${h.heure}</div>
        </div>
      </div>`;
    }
  });

  horairesDiv.innerHTML = html;
}

chargerPassages();
