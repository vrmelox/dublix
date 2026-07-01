# Correction de la Route API (Erreur 404 au Login)

**Problème rencontré** :
En tentant de se connecter, l'interface renvoyait une erreur 404 : `POST http://localhost:3000/api/users/login 404 (Not Found)`.

**Cause** :
Dans une architecture Next.js standard (sans Docker proxy), une requête locale comme `fetch('/api/...')` part du principe que l'API est servie par Next.js lui-même (Route Handlers). Or, notre architecture est composée d'un Frontend (Next.js sur localhost:3000) et d'un Backend dédié (Express classique sur localhost:4000). 
Le fichier `Form.tsx` n'utilisait pas notre variable globale d'environnement `NEXT_PUBLIC_API_URL`, mais forçait `fetch('/api/users/login')`. Par conséquent, le navigateur interrogeait le Frontend au lieu de parler au Backend.

**Action effectuée** :
L'URL de base a été reconstruite dynamiquement dans les endroits problématiques (`Form.tsx` pour la connexion, la réinitialisation de mot de passe, et l'ajout d'équipement) en exploitant `process.env.NEXT_PUBLIC_API_URL`.

```typescript
// Avant
fetch('/api/users/login', ...)

// Après
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';
fetch(`${API_BASE_URL}/api/users/login`, ...)
```

**Conséquence** :
Les appels réseau partiront désormais vers `http://localhost:4000/api/users/login`, peu importe où est hébergé le frontend, résolvant le problème de routage. Il faut cependant relancer la compilation (`docker compose up --build`).
