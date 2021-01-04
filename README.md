Plugin for ircgrampp to adda commands 

# Install & Configure

Install as globaly:

    # npm install -g ircgrampp-plugin-commands

Add file `{ircgrampp_config_dir}/plugins/commands.yml` with the follow content:

```yaml
name commands 
enable true
```

# Bridge configuration

Each bridge is defined with the bridge name and params, for example, if you have a bridge name `friends`:

```yaml
name commandas 
enable true

friends:
  enable: true
  permissions:
   - admin
   - custom
  admins:
   - jhon
   - jonny
  namespaces:
    example:
      prefix: "myplug:" # All comands like !myplug:list !myplug:save , etc
      permissions:
        - admin
```

## Options (By bridge)

|Option|Type|Required|Default|Description|
|:----|:--:|:--:|:---:|:-----|
|enable|bool|No|false|Enable plugin|
|permissions|string, string[]|No|all|General types of permisions\*|
|admins|string, string[]|No|_empty_|List of users in case of `custom`|
|allowBots|bool|No|false|Allow bots to execute command|
|namespaces|object[]|No|_empty_|Custo config for namespaces|

> \* Permisions can be: `all`, `admin`, `custom`

## Options (By namespace)

|Option|Type|Required|Default|Description|
|:----|:--:|:--:|:---:|:-----|
|prefix|string|No|Same as name|Prefix to match, ex. `ban`|
|permissions|string, string[]|No|_empty_|Extends access permissions|
|admins|string, string[]|No|_empty_|Extends access users|
|allowBots|bool|No|false|Allow bots to execute command|

