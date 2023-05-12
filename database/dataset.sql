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
        'admin',
        'admin'
    ),
    (
        'user1',
        'user1@example.com',
        'iloveu',
        'normal'
    ),
    (
        'user2',
        'user2@example.com',
        'azerty',
        default
    ),
    (
        -- ici votre compte gitlab/ucbl
        'romuald.thion',
        'romulus@example.com',
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
