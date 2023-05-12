# TIWFSA: authentification, autorisation, cryptographie

Cette plate-forme de TP reprend le métier de l'application utilisée pour la partie haute-disponibilité. Il s'agit ici de reprendre :

- l'authentification, en remplacant [l'authentification HTTP](https://en.wikipedia.org/wiki/Basic_access_authentication) par une authentification par JWT. Les tokens peuvent être obtenus de deux façons différentes
  - via authentification par mot de passe
  - via un tiers d'authentification, ici <https://forge.univ-lyon1.fr/>
- la gestion des clefs et du chiffrement
  - les utilisateurs doivent pouvoir générer une clef à laquelle ils donnent un nom sur la route `POST /key`
  - utiliser une clef générée pour chiffrer et déchiffrer des messages sur les routes `POST /crypt/encrypt` et `POST /crypt/decrypt`

Un serveur de test de l'application complète sera déployé sur <https://master-auth.fsa-sec.os.univ-lyon1.fr> avec des comptes pour chaque élève.

## Introduction

Si besoin, installer un environnement <https://nodejs.org/> version _20.1.0_ (ou à défaut laLTS _18.16.0_).
Il est **recommandé** d'utiliser <https://github.com/nvm-sh/nvm> un environnement _Linux_ ou WSL pour cela.

L'application est développée avec le framework web <https://www.fastify.io/> et quelques plugins de son écosystème.
Voir l'annexe en fin de document sur son fonctionnement.
Consulter le début du fichier [app.js](app.js) pour la liste et les docs.
Le backend de stockage est une base <https://www.postgresql.org/>.
Les tests d'intégration sont réalisés avec le nouveau module [node:test](https://nodejs.org/api/test.html) et le module standard d'assertion [node:assert](https://nodejs.org/api/assert.html).

Pour la programmation JavaScript en général, consulter l'excellent <https://javascript.info/>.

### Installation

1. forker le projet <https://forge.univ-lyon1.fr/tiw-fsa/fsa-apps-auth>
2. donner le nom de votre dépôt dans la colonne `GitLab_authentif` de <https://tomuss.univ-lyon1.fr/>
3. dans le dossier de travail, créer un fichier `.env` sur le modèle `.env.default` fourni
4. installer les dépendances `npm install`
5. créer une base de données de PostgreSQL (et une base de test) en éxécutant succesivement dans le dossier `database/`
   - [create_database.sh](database/create_database.sh) pour créer la base avec le compte privilégié (`postgres`)
   - [schema_reset.sh](database/schema_reset.sh) pour créer les tables avec le compte non-privilégié (`tiwfsa`)
   - [dataset_reset.sh](database/dataset_reset.sh) pour peupler les tables avec le compte non-privilégié (`tiwfsa`). Adapter le dataset pour que votre login UCBL soit administrateur.
6. exécuter l'application en mode développement `npm start` ou en mode production `npm start:prod`
7. visiter <http://localhost:8000/docs> pour la documentation de l'API

La cible de test est `npm test`. Chaque test peut être exécuté directement par node avec `node --test fichier_test.js`.
On peut activer le suivi des modifications avec `node --test --watch fichier_test.js`.

Si vous rencontrez un problème lors de l'installation de `pg-native`, installez la `libpq` avec la commande `sudo apt install libpq-dev`. Si le problème persiste, supprimez la dépendance du fichier `package.json`.

### Routes existantes

Les routes suivantes sont disponibles dans l'application finale. Elles sont testables dans <http://localhost:8000/docs>. La liste suivante est générée par <https://github.com/ShogunPanda/fastify-print-routes>, elle apparait quand on lance l'application.

```raw
╔═════════════════════╤═════════════════╗
║           Method(s) │ Path            ║
╟─────────────────────┼─────────────────╢
║          GET | HEAD │ /auth/callback  ║
║          GET | HEAD │ /auth/gitlab    ║
║                POST │ /auth/login     ║
║                POST │ /crypt/decrypt  ║
║                POST │ /crypt/encrypt  ║
║          GET | HEAD │ /health         ║
║          GET | HEAD │ /health/auth    ║
║                POST │ /key            ║
║          GET | HEAD │ /key/:username  ║
║                POST │ /user           ║
║ GET | DELETE | HEAD │ /user/:username ║
╚═════════════════════╧═════════════════╝
```

### Modalités de rendu

L'application finale est à versionner sur <https://forge.univ-lyon1.fr/>. Les projets seront clonés le mercredi 24 mai. L'évaluation comprendra

- une partie automatique les tests `node:test` : le fichier `.env` sera remplacé et les tests remplacés par des nouveaux;
- une partie ouverte lors de l'épreuve du mercredi 14/06 à 8h30.

## Travail à réaliser

Généralement, il faudra prendre soin sur les codes HTTP 400, 401, 403 et 404 et activer progressivement les tests qui ont été désactivés.

Il est **important de respecter les schémas et routes fournies**, l'API de votre application **doit** être conforme à la spécification sinon les tests échoueront.

Il n'y a rien à faire sur les routes `/health`, presque rien sur les routes `/key` et pas grand chose sur les routes `/user`, essentiellement de l'autorisation. Le travail se concentre surtout sur les routes `/auth`, avec un peu de travail sur l'application principale `app.js` et sur les routes `/crypt`. Il n'y a _a priori_ rien à modifier sur la base de données.

### Authentification

#### Gestion JWT

- compléter la vérification de token `verifyJWTToken()`
  - cette fonction est déjà branchée sur les routes avec `fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))`
- compléter la génération de token, `generateJWTToken()`
  - l'utiliser ensuite pour produire un token après l'authentification OAuth ou par login/password

#### Authentification login/password

- choisir et motiver un algorithme de hashage du mot de passe
- implémenter `verifyLoginPassword()` pour vérifier un mot de passe en base
- compléter `postUserHandler()` pour hasher le mot de passe en base de données
- implémenter `postAuthLoginHandler()` pour générer le JWT en cas d'authentification réussie
- vérifier que l'authentification `Authorization: Basic <credentials>` fonctionne

#### Authentification OAuth2

On utiliser ici le plugin <https://github.com/fastify/fastify-oauth2> déjà partiellement configuré dans [app.js](app.js) (à décommenter).

- compléter `oauthCallbackHandler()` pour la route vers laquelle GitLab redirige

Vous pouvez choisir deux alternatives : le OAuth2 directement avec le _scope_ `read_user` ou la surcouche OpenID Connect avec le scope `openid`. Ce dernier fournira un token `id_token` dont il faut vérifier la signature.

### Gestion des clefs et du chiffrement

- compléter `GET /key/:username`
- compléter `POST /key/`
- choisir et motiver un algorithme de chiffrement
- compléter `POST /crypt/encrypt`
- compléter `POST /crypt/decrypt`

### Autorisations

- sur les routes `/user`
  - on ne peut écrire (`POST` ou `DELETE`) que si on est administrateur
  - on ne peut lire que si on accède à soi-même ou si on est administrateur
- sur les routes `/key`
  - on ne peut accéder à la liste des clefs d'un utilisateur que si on accèdee à soi-même ou si on est administrateur
  - on ne crée que des clefs sur son propre compte

## Ouverture

que faudrait-il faire d'autre dans le cadre d'une mise en production :

- sur le reverse proxy web
- sur la gestion de l'application node

## Annexes

### Notes Fastify

Quelques notes sur le framework utilisé.

#### Routes

Voir <https://www.fastify.io/docs/latest/Reference/Routes/#full-declaration>.

> `handler(request, reply)`: the function that will handle this request. The Fastify server will be bound to `this` when the handler is called. Note: using an arrow function will break the binding of this.

#### Lifecycle

Voir <https://www.fastify.io/docs/latest/Reference/Lifecycle/>, dont dessins.

> Whenever the user handles the request, the result may be:
>
> - in **async** handler: it _returns_ a payload
> - in **async** handler: it _throws_ an `Error`
> - in **sync** handler: it _sends_ a payload
> - in **sync** handler: it _sends_ an `Error` instance

### Exécution des tests

```raw
/TP-auth/_correction/fsa-apps-auth [ main][📦 v1.0.0][⬢ v20.1.0]⏱ 3s🕙[16:21]❯ npm test

> fsa-apps-auth@1.0.0 test
> cross-env NODE_ENV=test PGDATABASE=tiwfsa-test node --test

▶ JWT authentication via login/password on /auth/login
  ✔ POST /auth/login, unauthorized (bad password) (415.081392ms)
  ✔ POST /auth/login, unauthorized (bad username) (7.197638ms)
  ✔ POST /auth/login, authorized (receives JWT) (202.229135ms)
▶ JWT authentication via login/password on /auth/login (854.416259ms)

▶ HTTP basic authentication on /health/auth
  ✔ GET /health/auth, authorized (273.428957ms)
  ✔ GET /health/auth, unauthorized (bad password) (180.942402ms)
  ✔ GET /health/auth, unauthorized (bad user) (4.154238ms)
▶ HTTP basic authentication on /health/auth (523.598954ms)

▶ OAuth2 authentication on /auth/gitlab
  ✔ GET /auth/gitlab, 302 redirect (80.554053ms)
  ✔ GET /auth/callback, OAuth callback (169.011182ms)
▶ OAuth2 authentication on /auth/gitlab (312.884042ms)

▶ Crypt routes
  ✔ POST /crypt/encrypt, (16.614515ms)
  ✔ POST /crypt/decrypt, (16.08828ms)
▶ Crypt routes (691.65679ms)

▶ Health routes on /health
  ✔ GET /health/auth, unauthorized (111.443232ms)
  ✔ GET /health, public route (53.876218ms)
▶ Health routes on /health (387.712265ms)

▶ Key routes
  ✔ GET /key/user1, (7.134563ms)
  ✔ POST /key, created (23.86381ms)
  ✔ POST /key, already exists (5.850387ms)
▶ Key routes (634.486912ms)

▶ User routes on /user (via JWT authentication)
  ✔ GET /user/:username, unauthorized (authentication required) (2.456733ms)
  ✔ GET /user/:username, authorized (same user) (6.171914ms)
  ✔ GET /user/:username, forbidden (different user but NOT admin) (2.534278ms)
  ✔ GET /user/:username, authorized (different user but admin) (3.402925ms)
  ✔ POST /user, forbbiden (not admin) (3.469675ms)
  ✔ POST /user, user3 created (admin) (108.157292ms)
  ✔ POST /user, conflict (user3 already exists) (120.131492ms)
  ✔ GET /user/user3, authorized (new user can authenticate) (106.912209ms)
  ✔ DELETE /user/user3, forbbiden (not admin) (2.343573ms)
  ✔ DELETE /user/user3, deleted (admin) (16.261052ms)
▶ User routes on /user (via JWT authentication) (912.130934ms)

ℹ tests 25
ℹ suites 7
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3504.123522
```
