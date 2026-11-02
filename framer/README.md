# ProjectGallery — composant Framer

Galerie de projets en cartes fines verticales. La carte au centre s'ouvre (image, titre, tags, description), les autres affichent une image flottante au survol. Filtres par tag, glisser (drag) et molette pour faire défiler.

## Installation dans Framer

1. Dans Framer : **Assets → Code → +  → New component** (nommez-le `ProjectGallery`).
2. Supprimez le code généré et collez tout le contenu de `ProjectGallery.tsx`.
3. Glissez le composant sur la page Projets et réglez sa taille (ex. largeur *Fill*, hauteur 560 px).

## Réglages (panneau de droite)

| Groupe | Ce qu'on règle |
|---|---|
| **Projets** (15 max) | titre, description, jusqu'à 4 tags, image, **vidéo** (mp4 / webm / mov), image ou **vidéo de survol** (facultatives), couleur de fond, **lien vers une page**, nouvel onglet |
| **Filtres** (12 max) | un filtre par ligne. Un projet apparaît si l'un de ses tags porte **exactement** le nom du filtre (majuscules ignorées) |
| **Label « All »** | texte du bouton « tout afficher » |
| **Carte ouverte** | *Intégrée* (réglable dans le groupe « Carte ouverte ») ou *Mon composant* (voir plus bas) |
| **Mise en page** | largeur carte fine / ouverte, espacement, arrondi, carte de départ |
| **Drag & scroll** | vitesse du drag, élan, molette (toutes / horizontale / off), vitesse molette, ressort, comportement du clic |
| **Carte fine** | couleurs, bordure, position et **typo** du titre vertical |
| **Carte ouverte (intégrée)** | position du bloc texte, voile, **typo + taille** du titre, des tags et de la description, couleurs |
| **Image au survol** | **largeur / hauteur**, arrondi, décalage, douceur du suivi, ombre |
| **Barre de filtres** | afficher les filtres / la règle, alignement, typo, couleurs |
| **Curseur** | main, pointeur, flèche, **rond avec texte** (« Drag » / « Voir »), **votre image**, ou masqué |

## Vidéos

- **Vidéo** : remplace l'image dans la carte ouverte. Elle tourne en boucle, sans le son. Si vous mettez aussi une image, elle s'affiche pendant le chargement.
- **Vidéo survol** : s'affiche à la place de l'image de survol.
- Ordre utilisé au survol : vidéo survol, image survol, image, puis vidéo.
- Exportez des vidéos courtes et légères (mp4 H.264, moins de 5 Mo environ) pour que la page reste rapide.

## Utiliser votre propre template de carte ouverte (variants)

1. Créez un composant Framer « Carte ouverte » avec vos variants et des propriétés (image, titre, tags…).
2. Dans ProjectGallery, mettez **Carte ouverte → Mon composant**.
3. Dans **Templates**, ajoutez une instance de votre composant **par projet, dans le même ordre** que la liste des projets, et remplissez ses propriétés.

L'instance remplace alors le contenu de la carte quand elle est au centre. Un composant de code ne peut pas envoyer automatiquement ses données dans les propriétés de votre composant : c'est pour ça qu'il faut une instance par projet.

## Interactions

- **Drag** à la souris ou au doigt, avec élan et calage sur la carte la plus proche.
- **Molette** : quand on arrive au premier ou au dernier projet, la page reprend son défilement normal.
- **Clic** sur une carte fine : elle vient au centre. **Clic** sur la carte ouverte : ouvre son lien.
- **Clavier** : ← → pour naviguer, Entrée pour ouvrir.
