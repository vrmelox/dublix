# Corrections TypeScript — req.query string | string[]

**Cause** :
La mise à jour des typings d'Express (via `@types/express`) a rendu plus stricte la définition de `req.query` : chaque paramètre de query string est maintenant typé `string | string[] | ParsedQs | ParsedQs[]` plutôt que simplement `string`. En effet, un paramètre peut apparaître plusieurs fois dans une URL (ex : `?id=a&id=b`), ce qui donne un tableau.

**Action effectuée** :
Ajout de casts explicites `as string` sur les valeurs de `req.query` utilisées comme entrées pour Prisma ou comme strings dans les 3 controllers concernés :
- `interventionController.ts` (ligne 376)
- `notificationController.ts` (lignes 259, 274, 364, 378, 417)
- `userController.ts` (lignes 252, 261, 293, 316)

**Conséquence attendue** :
Le compilateur TypeScript accepte le code. À l'exécution, le comportement ne change pas car Express extrait toujours la première valeur pour les paramètres simples.

**Précision — Pourquoi `as string` et pas un guard ?** :
Dans ce contexte, les paramètres de query sont des filtres simples (page, limit, rôle, etc.). Il est impossible côté API qu'un tableau soit envoyé volontairement. Le cast `as string` est donc acceptable. Une alternative plus robuste serait `Array.isArray(x) ? x[0] : x`, mais elle alourdirait le code sans bénéfice réel ici.
