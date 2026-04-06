fetch("lines.json")
  .then(res => res.json())
  .then(lines => {

    const select = document.getElementById("lineSelect");
    const horairesDiv = document.getElementById("horaires");

    // Remplir le menu
    lines.forEach(line => {
      const opt = document.createElement("option");
      opt.value = line.code;
      opt.textContent = `${line.code} — ${line.nom}`;
      select.appendChild(opt);
    });

    // Quand ligne changée
    select.addEventListener("change", () => {

      const chosen = lines.find(l => l.code === select.value);

      // Effacer ancien contenu
      horairesDiv.innerHTML = "";

      // Afficher les horaires
      chosen.horaires.forEach(h => {
        const div = document.createElement("div");
        div.textContent = `➡️ ${h.destination} : dans ${h.minutes} min`;
        horairesDiv.appendChild(div);
      });
fetch("lines.json")
  .then(res => res.json())
  .then(lines => { /* votre code */ })
  .catch(err => console.error("Erreur de chargement :", err));
    });

  });
