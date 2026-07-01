# Résolution Erreur CORS (Cross-Origin Resource Sharing)

**Problème rencontré** :
En tentant de se connecter, la console indiquait un blocage réseau (fichier rouge "net::ERR_FAILED"). L'erreur exacte révélait ceci :
`Access to fetch at 'http://localhost:4000/api/users/login' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Cause** :
C'est une protection très classique des navigateurs. Le frontend tourne sur le port `3000` et demande des données à un autre serveur situé sur le port `4000`. Comme ce sont deux origines différentes, le navigateur bloque la transaction à moins que le serveur `4000` ne l'autorise explicitement.

Le fichier `server.ts` du backend avait été configuré pour autoriser `http://127.0.0.1:3000` mais *pas* `http://localhost:3000`. Bien que techniquement identiques sur l'ordinateur, le navigateur voit ces deux adresses comme deux origines différentes.

**Action effectuée** :
Mise à jour de la configuration de sécurité (CORS) de l'API Express pour ajouter explicitement `http://localhost:3000` à la "liste blanche" (whitelist).

```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['https://bioqrsuivi.com', 'http://127.0.0.1:3000', 'http://localhost:3000'],
  // ...
}));
```

**Conséquence** :
Le navigateur du poste de développement est autorisé à extraire des données provenant du port `4000`. La connexion est rétablie.
