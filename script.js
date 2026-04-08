let toutesLesLignes = [];

// Calcule les minutes restantes avant un passage (ex: "08:15" → 7)
// Gère aussi les heures après minuit (00:15, 00:30...)
function minutesAvant(heureStr) {
  const maintenant = new Date();
  const [h, m] = heureStr.split(":").map(Number);
  const passage = new Date();
  passage.setHours(h, m, 0, 0);
  // Si le passage est plus de 12h dans le passé, c'est qu'il est le lendemain (après minuit)
  if (passage - maintenant < -12 * 60 * 60 * 1000) {
    passage.setDate(passage.getDate() + 1);
  }
  return Math.round((passage - maintenant) / 60000);
}

// Affiche les prochains passages de la ligne sélectionnée
function afficherPassages() {
  const select = document.getElementById("lineSelect");
  const horairesDiv = document.getElementById("horaires");
  const chosen = toutesLesLignes.find(l => l.code === select.value);

  horairesDiv.innerHTML = "";

  if (!chosen) {
    horairesDiv.innerHTML = '<div class="empty">Sélectionnez une ligne pour voir les prochains passages.</div>';
    return;
  }

  // Afficher les passages dans les 90 prochaines minutes
  const aVenir = chosen.horaires
    .map(h => ({ ...h, minutes: minutesAvant(h.heure) }))
    .filter(h => h.minutes >= 0 && h.minutes <= 90)
    .sort((a, b) => a.minutes - b.minutes);

  if (aVenir.length === 0) {
    horairesDiv.innerHTML = '<div class="empty">Aucun passage prévu dans la prochaine heure.</div>';
    return;
  }

  aVenir.forEach(h => {
    let cls = "loin";
    if (h.minutes <= 5) cls = "proche";
    else if (h.minutes <= 15) cls = "normal";

    const label = h.minutes === 0 ? "À l'arrêt" : `${h.minutes} min`;

    const card = document.createElement("div");
    card.className = "passage-card";
    card.innerHTML = `
      <span class="ligne-badge" style="background:${chosen.couleurFond};color:${chosen.couleurTexte}">
        ${chosen.code}
      </span>
      <span class="destination">${h.destination}</span>
      <div class="temps-wrap">
        <div class="live-inline">
          <span class="live-dot"></span>
          <span class="live-label">en direct</span>
        </div>
        <span class="temps ${cls}">${label}</span>
      </div>
    `;
    horairesDiv.appendChild(card);
  });
}

async function chargerLignes() {
  try {
    const res = await fetch("lines.json");
    toutesLesLignes = await res.json();

    const select = document.getElementById("lineSelect");

    // Remplir le menu déroulant
    toutesLesLignes.forEach(line => {
      const opt = document.createElement("option");
      opt.value = line.code;
      opt.textContent = `${line.code} — ${line.nom}`;
      select.appendChild(opt);
    });

    // Afficher au changement de ligne
    select.addEventListener("change", afficherPassages);

    // Rafraîchir automatiquement toutes les 30 secondes
    setInterval(afficherPassages, 30000);

  } catch (err) {
    console.error("Erreur de chargement des lignes :", err);
    document.getElementById("horaires").innerHTML =
      '<div class="empty">Impossible de charger les données. Vérifiez le fichier lines.json.</div>';
  }
}

chargerLignes();
