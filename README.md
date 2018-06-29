#  Setup Vault Server

1. Setup vault and consul containers
```bash
$ docker-compose up
```
2. Export variables and alias
```bash
$ alias vault='sudo docker exec -it {CONTAINER_NAME} vault "$@"'
$ export VAULT_ADDR=http://127.0.0.1:8200
```
3. Init vault server
```bash
$ curl http://127.0.0.1:8200/v1/sys/seal-status -k
{"errors":["server is not yet initialized"]}
$ vault init -address=${VAULT_ADDR} > keys.txt
$ vault status -address=${VAULT_ADDR}
```

4. Unseal vault server:
```bash
$  vault unseal -address=${VAULT_ADDR} $(grep 'Key 1:' keys.txt | awk '{print $NF}
$  vault unseal -address=${VAULT_ADDR} $(grep 'Key 2:' keys.txt | awk '{print $NF}
$  vault unseal -address=${VAULT_ADDR} $(grep 'Key 3:' keys.txt | awk '{print $NF}
```

5. Check status:
```bash
$ vault status -address=${VAULT_ADDR}
Sealed: false
Key Shares: 5
Key Threshold: 3
Unseal Progress: 0
Version: 0.6.2
Cluster Name: vault-cluster-a056941f
Cluster ID: 46d2c29b-ad96-f349-47d9-ae2243274fa8
High-Availability Enabled: true
	Mode: active
	Leader: http://127.0.0.1:8200
```
