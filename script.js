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
      horairesDiv.innerHTML = "";
      const aVenir = ligne.horaires
        .map(h => ({ ...h, minutes: minutesAvant(h.heure) }))
        .filter(h => h.minutes >= 0 && h.minutes <= 180)
        .sort((a, b) => a.minutes - b.minutes);

      if (aVenir.length === 0) {
        horairesDiv.innerHTML = '<div class="empty">Aucun passage prévu prochainement.</div>';
        return;
      }

      aVenir.forEach(h => {
        let cls = h.minutes <= 5 ? "proche" : h.minutes <= 15 ? "normal" : "loin";
        let label;
        if (h.minutes === 0)      label = "À l'arrêt";
        else if (h.minutes <= 60) label = `${h.minutes} min`;
        else                      label = h.heure;

        const card = document.createElement("div");
        card.className = "passage-card";
        card.innerHTML = `
          <span class="ligne-badge" style="background:${ligne.couleurFond};color:${ligne.couleurTexte}">${ligne.code}</span>
          <span class="destination">${h.destination}</span>
          <div class="temps-wrap">
            <div class="live-inline">
              <span class="live-dot"></span>
              <span class="live-label">en direct</span>
            </div>
            <span class="temps ${cls}">${label}</span>
          </div>`;
        horairesDiv.appendChild(card);
      });
    }

    afficher();
    setInterval(afficher, 30000);

  } catch (err) {
    console.error("Erreur :", err);
    horairesDiv.innerHTML = '<div class="empty">Impossible de charger les données.</div>';
  }
}

chargerPassages();
