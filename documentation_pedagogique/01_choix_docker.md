# Choix Technique : Passage à Docker

**Cause** : 
Le projet est composé de plusieurs services (Backend Node.js, Frontend Next.js, Base de données PostgreSQL). Le faire tourner en local ou le déployer nécessite d'installer et configurer les bonnes versions de Node.js, les dépendances adéquates, ainsi qu'une base de données locale. Cela peut être fastidieux et propice aux erreurs ("ça marche chez moi mais pas en prod"). Le besoin est de simplifier l'installation, les tests locaux et de préparer un environnement isomorphe à la production.

**Action effectuée** : 
Décision de conteneuriser l'ensemble du projet à l'aide de Docker. Création prévue de fichiers `Dockerfile` pour le backend et le frontend, ainsi que d'un fichier `docker-compose.yml` orchestrant l'ensemble des services (base de données, backend, frontend).

**Conséquence attendue** : 
Avoir un environnement complet qui se lance avec une seule commande (`docker compose up`), garantissant que les versions logicielles et les configurations réseau sont isolées et identiques quel que soit le système d'exploitation de l'hôte testant l'application.

**Précision** : 
Le dossier `documentation_pedagogique` (celui-ci) a été défini à la racine pour conserver la trace de l'ensemble des choix techniques effectués dans cette phase de relance du projet.
