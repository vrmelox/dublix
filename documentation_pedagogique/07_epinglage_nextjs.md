# Choix Technique : Épinglage de Next.js à une version stable précise

**Cause** :
Lors de la mise à jour de `next@latest`, npm a installé une version **canary** (préversion instable) — `16.3.0-canary.x` — qui contient de nombreuses vulnérabilités de sécurité recensées (CVE). L'outil `npm audit` a remonté 25 failles, dont des **critiques** (RCE, SSRF, XSS, DoS).

**Action effectuée** :
Au lieu de `latest` (qui peut pointer vers des versions `canary`), la version a été définie à **`^16`** — ce sélecteur npm installe la dernière version stable de la série 16 tout en excluant les préversions (`canary`, `alpha`, `rc`). Le package `eslint-config-next` a également été aligné sur `^16`.

Commande à exécuter :
```bash
cd ~/dublix/frontend && npm install
```

**Conséquence attendue** :
`npm audit` ne remontera plus de vulnérabilité sur `next`. La version utilisée est la dernière stable, maintenue et sans CVE connue.

**Précision — La différence entre `latest` et une version épinglée** :
- `latest` sur npm peut pointer vers des `canary`, `alpha` ou `rc` selon la politique de publication du package. C'est dangereux pour la production.
- Épingler une version précise (`"next": "16.2.9"`) garantit la reproductibilité de l'environnement — la même version exacte sera installée sur toutes les machines.
- C'est une bonne pratique DevOps, surtout pour des frameworks critiques comme Next.js.
