# SNAKE

Jeu “Snake Grand Format”
Ce projet est une version du célèbre jeu Snake, adaptée pour une grande surface de jeu (800×600) et démarrant automatiquement dès qu’on appuie sur une touche de direction (flèche ou ZQSD).

1. Présentation
Le joueur contrôle un serpent qui se déplace sur une grille.
Le serpent grandit quand il mange une pomme, ce qui augmente le score.
Le jeu se termine (Game Over) si le serpent:
sort du cadre (au-delà des bords), ou
se mord lui-même en entrant en collision avec l’un de ses propres segments.
Le but est de survivre le plus longtemps possible tout en engrangeant un maximum de points!

2. Installation et lancement
Télécharger ou cloner ce projet (3 fichiers : index.html, style.css, script.js) dans un même dossier.
Ouvrir le fichier index.html dans votre navigateur (Chrome, Firefox, etc.).
Vous verrez le titre, le canvas, et le score initial (0).
3. Comment jouer
Appuyez sur une touche de direction (flèche ou Z/Q/S/D) pour démarrer la partie.
Exemple : appuyer sur la flèche droite pour faire aller le serpent vers la droite.
À chaque intervalle (toutes les 100ms environ), le serpent se déplace d’une case dans la direction indiquée.
Pour changer de direction en cours de jeu, appuyez sur la touche voulue (gauche, droite, haut, bas, ou ZQSD).
Le serpent ne peut pas faire immédiatement demi-tour (par ex. s’il va vers la droite, on ne peut pas aller immédiatement vers la gauche).
Le score augmente de 1 point à chaque pomme mangée.
Le serpent grandit d’un segment supplémentaire à chaque pomme mangée, le rendant plus difficile à manœuvrer.
Si le serpent sort des limites (bords du canvas) ou entre en collision avec son propre corps, c’est le Game Over.
Un overlay apparaît indiquant “GAME OVER” et votre score final.
Pour rejouer, il suffit de réappuyer sur une touche de direction.
4. Contrôles
Flèches directionnelles (↑, ↓, ←, →)
ZQSD (Z = Haut, Q = Gauche, S = Bas, D = Droite)
Note : Les touches Z, Q, S, D (majuscules ou minuscules) sont prises en charge, tout comme les flèches du clavier.

5. Personnalisation
Vous pouvez modifier certains paramètres dans le code :

Vitesse du jeu : en ajustant la variable gameSpeed (par défaut 100 ms).
Taille de la grille : via la variable gridSize (par défaut 20).
Dimensions du canvas : dans index.html (attributs width et height).
Couleurs (serpent, fond, pomme) : dans script.js, fonctions de dessin (ex. ctx.fillStyle = '#0f0'; pour le serpent).
6. Structure du projet
index.html
Fichier principal qui contient le <canvas> et l’interface basique (score, titre).
style.css
Gère l’apparence générale de la page (mise en page, couleurs de fond, etc.).
script.js
Contient toute la logique du jeu Snake : positionnement du serpent, collisions, score, dessin sur le canvas, etc.
7. Crédits
Ce code est proposé dans le but de fournir un exemple de Snake en HTML/CSS/JS, à titre d’apprentissage ou de démonstration. Vous êtes libres de le modifier et de l’améliorer selon vos besoins !

Bon jeu !
