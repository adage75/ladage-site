// Formulaire de candidature aux premiers volumes.
// data-endpoint : adresse qui reçoit le formulaire (Formspree, Google Apps Script…).
// Laissé vide, le formulaire ouvre la messagerie du visiteur avec ses réponses, adressées à contact@ladage-voyage.fr.
(function () {
  var form = document.getElementById("form-candidature");
  if (!form) return;

  var merci = document.getElementById("merci");
  var echec = document.getElementById("echec");
  var bouton = document.getElementById("envoyer");
  var messagerie = document.getElementById("messagerie");
  var DESTINATAIRE = "contact@ladage-voyage.fr";

  // Fermeture automatique après la date de clôture
  var cloture = Date.parse(form.dataset.cloture);
  if (!isNaN(cloture) && Date.now() > cloture) {
    form.hidden = true;
    document.getElementById("clos").hidden = false;
    return;
  }

  // Précision demandée pour « un créateur » et « autrement »
  var source = document.getElementById("source");
  var precision = document.getElementById("source-precision-champ");
  source.addEventListener("change", function () {
    precision.hidden = !/créat|Autrement/.test(source.value);
  });

  var regles = [
    { el: "prenoms", ok: function (f) { return f.prenoms.value.trim().length >= 2; }, msg: "Indiquez vos deux prénoms." },
    { el: "destination", ok: function (f) { return !!f.querySelector("input[name=destination]:checked"); }, msg: "Choisissez Londres ou New York.", cible: "input[name=destination]" },
    { el: "dates", ok: datesValides, msg: "Indiquez un départ entre le 1er février et le 30 avril 2027, et un retour après le départ.", cible: "#aller, #retour" },
    { el: "inquiete", ok: function (f) { return f.inquiete.value.trim().length >= 5; }, msg: "Dites-nous en quelques mots ce qui vous inquiète." },
    { el: "source", ok: function (f) { return f.source.value !== ""; }, msg: "Choisissez une réponse." },
    { el: "email", ok: function (f) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()); }, msg: "Vérifiez votre adresse e-mail, par exemple claire@exemple.fr." },
    { el: "accord", ok: function (f) { return f.accord.checked; }, msg: "Cochez la case pour que nous puissions étudier votre candidature." }
  ];

  function datesValides(f) {
    var a = f.aller.value, r = f.retour.value;
    return a >= "2027-02-01" && a <= "2027-04-30" && r !== "" && r >= a;
  }

  function verifier(regle) {
    var ok = regle.ok(form);
    var champs = form.querySelectorAll(regle.cible || "#" + regle.el);
    champs.forEach(function (c) { c.setAttribute("aria-invalid", ok ? "false" : "true"); });
    document.getElementById(regle.el + "-err").textContent = ok ? "" : regle.msg;
    return ok;
  }

  // Revalide un champ dès qu’il a été signalé en erreur
  form.addEventListener("change", function (e) {
    regles.forEach(function (r) {
      var champs = Array.prototype.slice.call(form.querySelectorAll(r.cible || "#" + r.el));
      if (champs.indexOf(e.target) > -1 && document.getElementById(r.el + "-err").textContent) verifier(r);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    echec.hidden = true;
    var premiere = null;
    regles.forEach(function (r) {
      if (!verifier(r) && !premiere) premiere = form.querySelector(r.cible || "#" + r.el);
    });
    if (premiere) { premiere.focus(); return; }
    if (form.site_web.value) return; // champ piège : envoi automatique ignoré

    var endpoint = form.dataset.endpoint;
    if (!endpoint) { ouvrirMessagerie(); return; }
    bouton.disabled = true;
    bouton.textContent = "Envoi en cours…";

    var envoi = fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (rep) { if (!rep.ok) throw new Error(rep.status); });

    envoi.then(function () {
      form.hidden = true;
      merci.hidden = false;
      merci.focus();
    }).catch(function () {
      echec.hidden = false;
      echec.focus();
    }).then(function () {
      bouton.disabled = false;
      bouton.textContent = "Envoyer notre candidature";
    });
  });

  // Sans service de réception : l’e-mail est préparé dans la messagerie du visiteur
  function ouvrirMessagerie() {
    var f = form;
    var source = f.source.value + (f.source_precision.value.trim() ? " (" + f.source_precision.value.trim() + ")" : "");
    var texte = [
      "Prénoms : " + f.prenoms.value.trim(),
      "Destination : " + f.querySelector("input[name=destination]:checked").value,
      "Dates : du " + dateFr(f.aller.value) + " au " + dateFr(f.retour.value),
      "Ce qui nous inquiète : " + f.inquiete.value.trim(),
      "Comment nous avons connu L’Adage : " + source,
      "E-mail : " + f.email.value.trim(),
      "",
      "Nous acceptons que L’Adage utilise ces informations pour étudier notre candidature et nous recontacter."
    ].join("\n");
    var lien = "mailto:" + DESTINATAIRE + "?subject=" + encodeURIComponent("Candidature aux premiers volumes · " + f.prenoms.value.trim()) + "&body=" + encodeURIComponent(texte);
    document.getElementById("copie").value = texte;
    document.getElementById("rouvrir").href = lien;
    form.hidden = true;
    messagerie.hidden = false;
    messagerie.focus();
    window.location.href = lien;
  }

  function dateFr(iso) {
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }

  var copier = document.getElementById("copier");
  if (copier) copier.addEventListener("click", function () {
    var zone = document.getElementById("copie");
    var fini = function () { copier.textContent = "Réponses copiées"; };
    if (navigator.clipboard) navigator.clipboard.writeText(zone.value).then(fini, function () { zone.select(); });
    else { zone.select(); document.execCommand("copy"); fini(); }
  });
})();
