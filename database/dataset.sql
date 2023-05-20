delete from
    private_key;

delete from
    account;

insert into
    account(username, email, password, role)
values
    (
        'admin',
        'admin@example.com',
        crypt('admin', gen_salt('bf', 10)),
        'admin'
    ),
    (
        'user1',
        'user1@example.com',
        crypt('iloveu', gen_salt('bf', 10)),
        'normal'
    ),
    (
        'user2',
        'user2@example.com',
        crypt('azerty', gen_salt('bf', 10)),
        default
    ),
    (
        -- ici votre compte gitlab/ucbl
        'p1805563',
        'jean.saury@univ-lyon1.fr',
        -- pas de mot de passe, OAuth2 seulement
        NULL,
        'admin'
    );

insert into
    private_key(username, keyname, bytes)
values
    ('user1', 'key1', gen_random_bytes(32)),
    ('user1', 'key2', gen_random_bytes(32)),
    ('admin', 'key1', gen_random_bytes(32));
