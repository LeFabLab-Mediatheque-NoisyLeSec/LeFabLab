---
title: Préparer un fichier pour la découpe laser avec Inkscape
machine: decoupe-laser
niveau: Débutant
duree: 45 min
resume: "Couleurs, épaisseur des traits, découpe ou gravure : les règles pour qu'un dessin soit lu correctement par la machine."
image: /media/tutoriels/decoupe-laser.svg
materiel:
  - Inkscape (gratuit, installé sur les postes du fablab)
  - Une idée de dessin ou un modèle de boîte généré en ligne
securite:
  - La première découpe se fait avec un membre de l'équipe.
  - Vérifiez la composition du matériau avant de venir (voir la fiche machine).
etapes:
  - titre: Régler le document à la taille de la plaque
    texte: |
      Dans **Fichier > Propriétés du document**, indiquez la taille de la plaque que vous utiliserez (par exemple 300 × 200 mm). Travaillez en millimètres.
    image: ""
    legende: ""
  - titre: Utiliser les bonnes couleurs
    texte: |
      La machine reconnaît les opérations grâce à la couleur des traits :

      - **Rouge** (#FF0000) : découpe
      - **Bleu** (#0000FF) : gravure de trait
      - **Noir** (remplissage) : gravure de surface

      Adaptez ce code couleur à celui de votre machine.
    image: ""
    legende: ""
  - titre: Convertir le texte et les objets en chemins
    texte: |
      Sélectionnez tout, puis **Chemin > Objet en chemin**. Sinon, les polices peuvent ne pas s'afficher sur le poste de la découpeuse.
    image: ""
    legende: ""
  - titre: Enregistrer et vérifier
    texte: |
      Enregistrez en **SVG simple** (ou DXF). Avant de découper la vraie pièce, faites un essai sur une chute.
    image: ""
    legende: ""
---
**La découpe ne traverse pas la plaque.** Le matériau est plus épais que prévu ou mal posé à plat : demandez à l'équipe d'ajuster la puissance.

**Les bords sont très brûlés.** La vitesse est trop lente pour ce matériau ; utilisez les réglages de la fiche matériaux affichée près de la machine.
