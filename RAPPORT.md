# Rapport TP Authentification

- [Rapport TP Authentification](#rapport-tp-authentification)
  - [Administratif](#administratif)
  - [Travail réalisé](#travail-réalisé)
  - [Recommandations générales](#recommandations-générales)
    - [Fonctionnalités manquantes de l'application](#fonctionnalités-manquantes-de-lapplication)
    - [PostgreSQL](#postgresql)
    - [OS](#os)
    - [Reverse proxy](#reverse-proxy)
    - [Application node](#application-node)

## Administratif

- NOM Prénom : SAURY Jean
- Login UBCL : p1805563
- Lien GitLab du projet : https://forge.univ-lyon1.fr/p1805563/fsa-apps-auth

## Travail réalisé

Cocher ce qui est fonctionnel dans votre application.

- Gestion JWT
  - [X] vérification de token `verifyJWTToken()`
  - [X] génération de token, `generateJWTToken()`
- Login/password
  - [X] implémenter `verifyLoginPassword()` pour vérifier un mot de passe en base
  - [X] compléter `postUserHandler()` pour hasher le mot de passe en base de données
  - [X] implémenter `postAuthLoginHandler()` pour générer le JWT en cas d'authentification réussie
- OAuth2
  - [X] compléter `oauthCallbackHandler()` pour la route vers laquelle GitLab redirige
- Gestion des clefs
  - [X] compléter `GET /key/:username`
  - [X] compléter `POST /key/`
  - [X] choisir et motiver un algorithme de chiffrement
  - [X] compléter `POST /crypt/encrypt`
  - [X] compléter `POST /crypt/decrypt`
- Autorisations
  - [X] sur les routes `/user`
  - [X] sur les routes `/key`

## Recommandations générales

Lister ici les recommandations générales et fonctionnalités manquantes de l'application.
Préciser si elles sont déjà effectuées ou pas sur le serveur de démonstration.

### Fonctionnalités manquantes de l'application

Une liste succincte :
- Distinction administrateurs techniques vs fonctionnels



### PostgreSQL
- Limitation du nombre de requêtes et de leurs volumes 
- Mettre en place un outil de monitoring
- Systématiser le backup des bases de données de manière très régulière
- Mettre en place une black-list des utilisateurs suspects en base

### OS
- Mettre en place un outil de monitoring
- Variables d'environnements sous forme de secrets
- Utilisation d'un deuxième disque pour stocker les données de bases 
- Suppression / déplacements des fichiers de logs de manière régulière
- Désactivation des mises à jours automatiques
- Mise à jours de sécurités effectuées par les admins régulièrement et en dehors des heures d'activités

### Reverse proxy
- Load balancer
- SSL avec certificat HTTPS par une autorité de certification reconnue (Mis en place en prod)
- Nom de domaine (Mis en place en prod)
- Limitation du nombre de requêtes par client et par seconde (par exemple 15 toutes les 5 secondes)
- Mise en place d'une black-list d'adresse ip / systématisation de la saisie des clients suspects

### Application node
- Retrait des fichiers non-destinés à la production (.git*, .env*, *.md, etc.)
- Automatiser des actions à réaliser en cas d'envoi systématiques de mots de passes erronées pour un même utilisateur 
- Assurer une protection contre les attaques par injections de codes (json/js/sql etc) notamment sur les messages à encrypter/decrypter (En production/dev, l'application semble être a minima protégée des injections SQL et JSON --> géré dans le code avec fastify)
- Utilisation d'expression régulière pour les différentes données réceptionnées (adresse mail, nom d'utilisateur)
- Interdire l'utilisation d'adresse mail jetable en se basant sur une liste régulièrement mise à jour
- Ajouter une route pour modifier un mot de passe/ adresse mail pour un utilisateur
- Validation d'un nouvel utilisateur à sa première connexion avec un code envoyé par mail
- Autoriser uniquement les mots de passes respectant les dernières recommendations des professionels en la matière (par exemple +14 caractères, au moins une majuscule/minuscule/chiffre/caractère spécial)
- Interdire l'usage de token d'authentification n'expirant pas au bout de 15/20 minutes pour les utilisateurs non-admins (FAIT EN DEV: les tokens générés expirent actuellement au bout de une heure pour tous les utilisateurs, EN PROD: ils expirent au bout de 3 jours pour touts les utilisateurs)
