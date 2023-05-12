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
        -- 'admin',
        '$argon2id$v=19$m=65536,t=3,p=4$o0HZrFRUX9zHY69ZP3JC0w$jXOEPi0vJasnwZ8rOf5IzAhi3WoqKCXCsRvGIqqMJs0',
        'admin'
    ),
    (
        'user1',
        'user1@example.com',
        -- 'iloveu',
        '$argon2id$v=19$m=65536,t=3,p=4$/0b6pHzhamjP9Lwsqk2q7w$bKWjza+nuPwNKFB/F1tMl5hVZfcmvgQitleBzXUDO5w',
        'normal'
    ),
    (
        'user2',
        'user2@example.com',
        -- 'azerty',
        '$argon2id$v=19$m=65536,t=3,p=4$JAG3oK1FiRL05xAFA6w7mA$6XXAS8CbtayAm5wFQso8IB5svKbgOSgOu9agvkx1hjs',
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