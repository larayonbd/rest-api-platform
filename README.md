#  Setup Vault Server

1. Create Volume and copy config file.

```bash
$ docker create -v /config --name config busybox; docker cp vault.hcl config:/config/;
```

2. Setup vault and consul containers.
```bash
$ docker-compose up
```
