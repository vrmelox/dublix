# Choix Technique : Variables d'environnement

**Cause** : 
Le projet dépend de configurations spécifiques : l'URL de la base de données, la clé de signature JWT (pour la sécurité), ou encore le port d'écoute et l'URL du frontend. Afin de ne pas écrire ces informations sensibles ou changeantes en dur dans le code (ce qui est une mauvaise pratique et pose des problèmes de sécurité lors de la mise sur GitHub public par exemple), il faut les centraliser.

**Action effectuée** : 
Création des fichiers `.env` dans le dossier `backend` et `.env.local` dans le dossier `frontend`. 
Recherche des variables clés appelées dans le code (via `process.env`). 
- **Pour le backend** : Ajout de `PORT` (pour définir le port, fixsé à 4000), `CLIENT_URL` (URL du frontend autorisée pour CORS, etc.), `JWT_SECRET` (clé secrète pour déchiffrer les tokens d'authentification) et `DATABASE_URL` (chaîne de connexion à la base gérée par container PostgreSQL).
- **Pour le frontend** : Ajout de `NEXT_PUBLIC_API_URL` (URL publique du backend utilisée par le navigateur client).

**Conséquence attendue** : 
Au lancement, le backend et le frontend utiliseront ces variables pour configurer leur connexion et leur comportement, ce qui garantit que l'on peut facilement changer d'environnement (de Local à Pre-Prod ou Prod) simplement en adaptant ces fichiers.

**Précision** : 
Dans le cadre de Docker, le backend pointera vers le host du container base de données (nommé `db` dans `docker-compose.yml`), mais le frontend continuera de faire des appels API vers `localhost:4000` via le navigateur de l'utilisateur final.
