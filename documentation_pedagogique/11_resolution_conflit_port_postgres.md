# Résolution du Conflit de Port PostgreSQL

**Problème rencontré** :
Lors du lancement de \`docker compose up -d\`, le conteneur \`db\` a échoué à se lancer avec l'erreur :
\`\`\`
failed to bind host port 0.0.0.0:5432/tcp: address already in use
\`\`\`

**Cause** :
Docker tente d'exposer le port `5432` du conteneur (PostgreSQL) sur le port `5432` de l'ordinateur hôte. Or, un service PostgreSQL local tourne déjà sur votre machine sur ce même port, ce qui crée un conflit d'adresse.

**Action effectuée** :
Dans le fichier \`docker-compose.yml\`, le binding des ports du service `db` a été modifié de \`"5432:5432"\` à \`"5433:5432"\`.

**Conséquence** :
- Le PostgreSQL du conteneur Docker est maintenant accessible sur le port **5433** depuis l'ordinateur hôte.
- Le backend conteneurisé continue d'y accéder via le port **5432** sans aucun changement dans le `.env`, car il communique sur le réseau interne Docker via le nom du service (\`db:5432\`). On a juste modifié l'exposition "externe".
