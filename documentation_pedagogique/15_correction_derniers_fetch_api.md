# Correction des Dernières Routes API (Erreur 404 sur les PopUps)

**Problème rencontré** :
En tentant d'ajouter une personne (ou une intervention), l'interface renvoyait une erreur 404 : `POST http://localhost:3000/api/users/create 404 (Not Found)`.
De plus, une erreur `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` apparaissait. Cela prouve que le Frontend (Next.js) retournait sa page d'erreur 404 par défaut (qui est du HTML `<!DOCTYPE html>`) au lieu d'une réponse JSON venant de notre Backend.

**Cause** :
Tout comme pour la page de Login, il restait dans le code source 4 composants (notamment `PopUpAjouterPersonne`, `PopUpAjouterIntervention` et les pages d'équipements) qui utilisaient des *chemins relatifs* stricts (`fetch('/api/...')`).
Puisque le Backend et le Frontend sont découplés grâce à Docker, le Frontend doit impérativement interroger le Backend en pointant sur son adresse complète (port 4000).

**Action effectuée** :
J'ai mené une recherche intégrale sur tout le projet pour identifier les `fetch` codés en dur avec les symboles backticks (\`) et les guillemets (").
L'adresse globale `process.env.NEXT_PUBLIC_API_URL` a été injectée dans ces 4 derniers fichiers pour que les communications pointent bien vers `localhost:4000`.

**Conséquence** :
Toute requête émise depuis n'importe quel bouton de l'interface graphique vise à présent l'API du Backend avec succès.
