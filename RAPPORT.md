# Rapport TP Authentification

- [Rapport TP Authentification](#rapport-tp-authentification)
  - [Administratif](#administratif)
  - [Travail réalisé](#travail-réalisé)
  - [Algorithmes](#algorithmes)
    - [Algorithme de hashage du mot de passe](#algorithme-de-hashage-du-mot-de-passe)
    - [Algorithme de chiffrement](#algorithme-de-chiffrement)
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

## Algorithmes

### Algorithme de hashage du mot de passe

L'algorithme utilisé est Bcrypt (Basé sur Blowfish, variante 2a) et fonctionne par chiffrement par bloc. Il est particulièrement intéressant pour sa robustesse aux attaques brute-force et rainbow table avec son utilisation d'un sel et sa possibilité de spécifier son nombre d'itérations (salt round). Ainsi, en augmentant la durée du hash, l'algorithme peut s'adapter à l'augmentation de la puissance des processeurs.

### Algorithme de chiffrement
L'algorithme utilisé est AES-256-CTR. Cet algorithme est intéressant dans notre cas d'utilisation car il permet un chiffrement symétrique (avec une seule clé).L'utilisation d'un algorithme AES 256 bits, plutôt que 128, est plus sûr face aux attaques brute-force car il utilise une clé deux fois plus longue (32 octets).
CTR est préféré aux autres modes pour les raisons suivantes :
- Absence de padding
- Utilisation d'un IV permettant de générer des chiffrements différents pour un même message/clé

## Recommandations générales

Lister ici les recommandations générales et fonctionnalités manquantes de l'application.
Préciser si elles sont déjà effectuées ou pas sur le serveur de démonstration.

### Fonctionnalités manquantes de l'application

Une liste succincte :
- Distinction administrateurs techniques vs fonctionnels

### PostgreSQL
- Limitation du nombre de requêtes et leurs volumes 
- Mettre en place un outil de monitoring
- Systématiser le backup des bases de données de manière très régulière
- Mettre en place une black-list des utilisateurs suspects en base
- Augmenter le nombre des "salt round" du hashage des mots de passes en base de données pour correspondre à une difficulté de hash suffisante pour se prémunir des attaques brute-force (relative à la puissance de calcul des processeurs actuels) tout en restant cohérent sur un ratio impact/risque

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
- Faire expirer les tokens d'authentification au bout de 15/20 minutes pour les utilisateurs non-admins (FAIT EN DEV: les tokens générés expirent actuellement au bout de une heure pour tous les utilisateurs, EN PROD: ils expirent au bout de 3 jours pour touts les utilisateurs)
