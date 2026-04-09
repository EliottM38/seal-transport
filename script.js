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

async function chargerPassages() {
  const horairesDiv = document.getElementById("horaires");
  try {
    const res = await fetch("lines.json");
    const lines = await res.json();
    const jour = jourType();
    const ligne = lines.find(l => l.code === CODE && l.direction === DIRECTION && l.jour === jour);

    if (!ligne) {
      horairesDiv.innerHTML = '<div class="empty">Pas de circulation aujourd\'hui sur cette ligne.</div>';
      return;
    }

    function afficher() {
      const aVenir = ligne.horaires
        .map(h => ({ ...h, minutes: minutesAvant(h.heure) }))
        .filter(h => h.minutes >= 0 && h.minutes <= 40)
        .sort((a, b) => a.minutes - b.minutes);

      if (aVenir.length === 0) {
        horairesDiv.innerHTML = `
          <div style="text-align:center;padding:3rem 1rem">
            <div style="font-size:48px;margin-bottom:1rem">🌙</div>
            <div style="font-family:Syne,sans-serif;font-size:18px;font-weight:700;color:var(--texte);margin-bottom:8px">Fin de service</div>
            <div style="font-size:14px;color:var(--texte-sec)">Aucun passage prévu dans les 40 prochaines minutes.</div>
          </div>`;
        return;
      }

      let html = `<div style="font-size:12px;color:var(--texte-sec);margin-bottom:1rem;display:flex;align-items:center;gap:6px">
        <span class="live-dot"></span>
        Mis à jour à ${heureActuelle()} · ${aVenir.length} prochain${aVenir.length > 1 ? 's passages' : ' passage'}
      </div>`;

      aVenir.forEach((h, i) => {
        const estPremier = i === 0;
        const label = h.minutes === 0 ? "À l'arrêt" : `${h.minutes} min`;
        const estArret = h.minutes === 0;

        let accentColor, bgColor, borderColor, badgeBg;
        if (estArret) {
          accentColor = '#E74C3C'; bgColor = 'rgba(231,76,60,0.08)';
          borderColor = 'rgba(231,76,60,0.5)'; badgeBg = '#E74C3C';
        } else if (h.minutes <= 5) {
          accentColor = '#E74C3C'; bgColor = 'rgba(231,76,60,0.05)';
          borderColor = 'rgba(231,76,60,0.3)'; badgeBg = '#E74C3C';
        } else if (h.minutes <= 15) {
          accentColor = 'var(--or)'; bgColor = 'rgba(201,168,76,0.06)';
          borderColor = 'rgba(201,168,76,0.3)'; badgeBg = 'var(--or)';
        } else {
          accentColor = 'var(--texte-sec)'; bgColor = 'var(--noir-card)';
          borderColor = 'var(--bordure)'; badgeBg = '#3A3A3A';
        }

        const pct = Math.max(0, Math.round((1 - h.minutes / 40) * 100));
        const barColor = h.minutes <= 5 ? '#E74C3C' : h.minutes <= 15 ? 'var(--or)' : '#3A3A3A';
        const clignoteClass = estArret ? 'clignote-arret' : '';

        if (estPremier) {
          html += `
          <div class="${clignoteClass}" style="
            background:${bgColor};border:1px solid ${borderColor};
            border-radius:16px;padding:1.5rem;margin-bottom:12px;
            position:relative;overflow:hidden;
          ">
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:var(--bordure)">
              <div style="height:3px;width:${pct}%;background:${barColor};transition:width 1s ease;border-radius:2px"></div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <span style="background:${ligne.couleurFond};color:${ligne.couleurTexte};font-family:Syne,sans-serif;font-weight:800;font-size:14px;padding:6px 14px;border-radius:8px">${ligne.code}</span>
              <span style="font-size:11px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.1em;font-family:Syne,sans-serif">${estArret ? '🚨 Bus à l\'arrêt !' : 'Prochain départ'}</span>
              <span class="live-chip" style="margin-left:auto;font-size:10px"><span class="live-dot"></span>En direct</span>
            </div>
            <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:1rem">
              <div>
                <div style="font-family:Syne,sans-serif;font-size:13px;color:var(--texte-sec);margin-bottom:4px">Direction</div>
                <div style="font-family:Syne,sans-serif;font-size:20px;font-weight:800;color:var(--texte)">${h.destination}</div>
              </div>
              <div style="text-align:right" class="${clignoteClass}">
                <div style="font-family:Syne,sans-serif;font-size:42px;font-weight:800;color:${accentColor};line-height:1">${estArret ? '0' : h.minutes}</div>
                <div style="font-size:13px;color:var(--texte-sec);margin-top:2px">${estArret ? "À l'arrêt" : 'minutes'}</div>
              </div>
            </div>
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bordure);display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;color:var(--texte-sec)">Départ prévu à</span>
              <span style="font-family:Syne,sans-serif;font-size:14px;font-weight:700;color:var(--texte)">${h.heure}</span>
            </div>
          </div>`;
        } else {
          html += `
          <div style="
            background:${bgColor};border:1px solid ${borderColor};
            border-radius:12px;padding:12px 16px;margin-bottom:8px;
            display:flex;align-items:center;gap:12px;
          " class="${clignoteClass}">
            <span style="background:${badgeBg};color:white;font-family:Syne,sans-serif;font-weight:800;font-size:12px;padding:4px 10px;border-radius:6px;min-width:42px;text-align:center">${ligne.code}</span>
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

    afficher();
    setInterval(afficher, 30000);

  } catch (err) {
    console.error("Erreur :", err);
    horairesDiv.innerHTML = '<div class="empty">Impossible de charger les données.</div>';
  }
}

chargerPassages();
