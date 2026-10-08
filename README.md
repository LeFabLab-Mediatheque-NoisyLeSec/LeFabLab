# Site du fablab

Site statique du fablab de la médiathèque : tutoriels machines, infos pratiques et retours d'ateliers.

- **Générateur** : [Eleventy](https://www.11ty.dev/) 3
- **Interface d'édition** : [Pages CMS](https://pagescms.org/) (configuration dans `.pages.yml`)
- **Hébergement** : GitHub Pages, publication automatique (`.github/workflows/deploy.yml`)
- **Licence des contenus** : CC BY-SA 4.0

## Où se trouve quoi ?

| Dossier / fichier | Contenu | Modifiable dans Pages CMS |
|---|---|---|
| `src/tutoriels/` | Un fichier par tutoriel | Oui (« Tutoriels ») |
| `src/ateliers/` | Un fichier par retour d'atelier | Oui (« Retours d'ateliers ») |
| `src/machines/` | Une fiche par machine | Oui (« Machines ») |
| `src/infos/` | Pages d'infos pratiques | Oui (« Infos pratiques ») |
| `src/_data/site.json` | Nom, adresse, horaires, bandeau d'annonce | Oui (« Réglages du site ») |
| `src/media/` | Images et documents envoyés | Oui (« Media ») |
| `src/_includes/` | Gabarits HTML (mise en page) | Non |
| `src/css/style.css` | Couleurs et styles (variables en haut du fichier) | Non |
| `.pages.yml` | Formulaires de l'interface d'édition | Non (administrateurs) |

## Opérations courantes (administrateurs)

### Ajouter une nouvelle machine

1. Dans Pages CMS, « Machines » > créer la fiche. Le nom du fichier créé (par exemple `brodeuse.md`) sert d'identifiant.
2. Dans `.pages.yml`, ajouter cet identifiant à la liste `machine` du formulaire des tutoriels :
   ```yaml
   - name: brodeuse
     label: Brodeuse numérique
   ```

### Changer les couleurs

Modifier les variables au début de `src/css/style.css`. Vérifier le contraste des textes (4,5:1 minimum) avec un outil comme le vérificateur de contraste de WebAIM.

### Retirer une photo à la demande d'une personne

1. Supprimer la photo dans Pages CMS (« Media ») et la retirer de la page concernée.
2. La photo reste dans l'historique Git du dépôt. Pour une suppression complète, contacter l'administrateur technique.

## Prévisualiser le site sur un ordinateur (facultatif)

Nécessite [Node.js](https://nodejs.org/) 22 ou plus récent.

```bash
npm install
npm start
```

Le site est alors visible sur http://localhost:8080.

## Mettre à jour Eleventy (une fois par an environ)

```bash
npm install @11ty/eleventy@latest
npm run build
```

Vérifier que le site se génère sans erreur avant d'envoyer la modification.
