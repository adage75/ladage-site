# ladage-site

Site vitrine de L'Adage, publié sur https://ladage-voyage.fr via GitHub Pages.

- `index.html` : page d'accueil
- `premiers-volumes.html` : candidature aux trois volumes offerts (jusqu'au 13 décembre 2026)
- `style.css`, `fonts/` : charte graphique, police Spectral hébergée sur le site
- `form.js` : vérification et envoi du formulaire de candidature
- `mentions-legales.html` : mentions légales et données personnelles
- `confidentialite.html` : politique de confidentialité du concierge
- `CNAME` : domaine personnalisé

Aucun cookie, aucun outil de mesure, aucune police externe.

## Recevoir les candidatures

Le formulaire porte un attribut `data-endpoint` (dans `premiers-volumes.html`).

- Vide : le formulaire ouvre la messagerie du visiteur avec ses réponses, adressées à contact@ladage-voyage.fr.
- Rempli avec l'adresse d'un service de réception (par exemple `https://formspree.io/f/xxxx`) : les réponses sont envoyées directement, sans passer par la messagerie du visiteur. Mettre alors à jour la section « Données personnelles » des mentions légales pour nommer ce service.

Le formulaire se ferme seul après la date de `data-cloture`.
