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
  - [ ] compléter `oauthCallbackHandler()` pour la route vers laquelle GitLab redirige
- Gestion des clefs
  - [ ] compléter `GET /key/:username`
  - [ ] compléter `POST /key/`
  - [ ] choisir et motiver un algorithme de chiffrement
  - [ ] compléter `POST /crypt/encrypt`
  - [ ] compléter `POST /crypt/decrypt`
- Autorisations
  - [ ] sur les routes `/user`
  - [ ] sur les routes `/key`

## Recommandations générales

Lister ici les recommandations générales et fonctionnalités manquantes de l'application.
Préciser si elles sont déjà effectuées ou pas sur le serveur de démonstration.

### Fonctionnalités manquantes de l'application

### PostgreSQL

### OS

### Reverse proxy

### Application node
