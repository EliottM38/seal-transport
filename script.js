async function chargerLignes() {
  try {
    const res = await fetch("lines.json");
    const lines = await res.json();

    const select = document.getElementById("lineSelect");
    const horairesDiv = document.getElementById("horaires");

    // Remplir le menu déroulant
    lines.forEach(line => {
      const opt = document.createElement("option");
      opt.value = line.code;
      opt.textContent = `${line.code} — ${line.nom}`;
      select.appendChild(opt);
    });

    // Afficher les passages quand une ligne est choisie
    select.addEventListener("change", () => {
      const chosen = lines.find(l => l.code === select.value);
      horairesDiv.innerHTML = "";

      if (!chosen) {
        horairesDiv.innerHTML = '<div class="empty">Sélectionnez une ligne pour voir les prochains passages.</div>';
        return;
      }

      chosen.horaires.forEach(h => {
        // Déterminer la couleur selon l'urgence
        let cls = "loin";
        if (h.minutes <= 5) cls = "proche";
        else if (h.minutes <= 15) cls = "normal";

        // Créer la carte
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
            <span class="temps ${cls}">${h.minutes} min</span>
          </div>
        `;
        horairesDiv.appendChild(card);
      });
    });

  } catch (err) {
    console.error("Erreur de chargement des lignes :", err);
    document.getElementById("horaires").innerHTML =
      '<div class="empty">Impossible de charger les données. Vérifiez le fichier lines.json.</div>';
  }
}

chargerLignes();
