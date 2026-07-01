# Choix Technique : Configuration de Docker (Dockerfiles et Compose)

**Cause** : 
Afin de concrétiser le choix de la conteneurisation évoqué, il est nécessaire de définir explicitement comment le système "construit" l'application (comment il installe Node, télécharge les packages et lance le serveur) ainsi que l'orchestration des différents microservices (Base de données, Backend, Frontend).

**Action effectuée** : 
1. **`backend/Dockerfile`** : Création d'un fichier spécifiant l'image de base (`node:20-alpine`), qui copie les différents fichiers `package.json`, installe les dépendances (`npm install`), génère l'ORM Prisma (`npx prisma generate`), puis compile (`npm run build`) et prépare le lancement via `npm start`.
2. **`frontend/Dockerfile`** :  Création d'un fichier similaire pour le front (environnement Next.js), avec `npm run build` et port 3000.
3. **`docker-compose.yml`** : Fichier décrivant le lien entre une base `postgres:15-alpine` et nos deux images. Utilisation des variables d'environnement adaptées à ce réseau interne Docker.

**Conséquence attendue** : 
Lors de l'exécution de la commande de lancement orchestrée Docker, les images Next et Node seront construites et packagées. La base de données PostgreSQL se mettra en écoute. Tout sera interconnecté. Les outils de "bind-mounts" et volumes permettent à la base de ne pas perdre de données si le conteneur redémarre.

**Précision** : 
On utilise la directive `depends_on` dans `docker-compose.yml` : l'API (Backend) attend la base de données, et le UI (Frontend) attend l'API, afin d'éviter les erreurs de connexion intempestives au démarrage. On utilise la version `alpine` de bash logicielles car elle est extrêmement légère.
