# Choix Technique : Stratégie de lancement et de migration de base de données

**Cause** : 
Maintenant que le `docker-compose.yml` est prêt, il faut instancier les conteneurs et s'assurer que la base de données PostgreSQL contient les bonnes tables avant que le backend ne tente d'y inscrire ou d'y lire des données.

**Action effectuée** : 
Préparation de l'exécution en deux temps :
1. Lancement de la composition Docker (`docker compose up -d --build`).
2. Exécution d'une commande à l'intérieur du conteneur backend pour synchroniser le schéma Prisma avec la base de données (`npx prisma db push`).
3. Création de l'administrateur initial avec le script `createAdmin.ts`.

**Conséquence attendue** : 
L'environnement sera alors entièrement fonctionnel. La BDD aura ses tables, l'administrateur sera créé et les API Frontend pourront s'y connecter.

**Précision** : 
Nous effectuons la migration (`prisma db push`) **après** le démarrage des conteneurs (et non dans le Dockerfile directement) car la base de données PostgreSQL doit être lancée et prête à accepter des connexions. Le paramètre `-d` de docker compose lance les conteneurs en arrière-plan (detached mode).
