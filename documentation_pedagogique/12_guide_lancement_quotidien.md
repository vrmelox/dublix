# Guide de Lancement et d'Accès au Projet (Routine Quotidienne)

Maintenant que tout a été conteneurisé avec Docker, lancer et arrêter l'application est devenu extrêmement simple. Ce document récapitule les commandes et URLs dont vous aurez besoin au quotidien.

## 1. Démarrer l'application

Ouvrez un terminal, placez-vous dans le dossier du projet et lancez cette commande unique :

```bash
cd ~/dublix
docker compose up -d
```
*L'option `-d` (detached) permet de lancer les conteneurs en arrière-plan pour que vous puissiez continuer à utiliser votre terminal.*

## 2. Accéder à l'application

Une fois la commande ci-dessus exécutée avec succès, ouvrez votre navigateur web et accédez aux liens suivants :

* **Frontend (L'interface visuelle)** : [http://localhost:3000](http://localhost:3000)
  * *C'est ici que techniciens, utilisateurs et administrateurs se connectent pour utiliser BioQr-Suivi.*
* **Backend (L'API, utile pour le débogage)** : [http://localhost:4000/api](http://localhost:4000/api)
  * *L'utilisateur ne s'y connecte pas directement, mais c'est le moteur invisible du site.*

### Compte Administrateur par défaut

Pour votre première connexion sur `http://localhost:3000`, utilisez les identifiants générés par le script d'initialisation :
* **Email** : `admin@bioqr.com` *(à vérifier dans votre script createAdmin.ts au besoin)*
* **Mot de passe** : `12345678` *(ou celui défini dans createAdmin.ts)*

## 3. Voir les logs (En cas de problème)

Si une page ne charge pas ou qu'il y a un bug, voici comment regarder ce qui se passe sous le capot :

* Voir les logs de l'API (Backend) :
  ```bash
  docker logs -f dublix_backend
  ```
* Voir les logs du site web (Frontend) :
  ```bash
  docker logs -f dublix_frontend
  ```
*(Faites `Ctrl+C` pour quitter l'affichage des logs).*

## 4. Arrêter l'application

Quand vous avez fini de travailler, il est recommandé d'éteindre l'application pour libérer la mémoire de votre ordinateur.

```bash
cd ~/dublix
docker compose down
```
*Note : Cette commande arrête les conteneurs mais **ne supprime pas vos données**. Grâce au "Volume" Docker configuré, votre base de données PostgreSQL sera conservée pour la prochaine session.*
