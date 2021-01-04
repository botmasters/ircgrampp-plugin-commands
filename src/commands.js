
const FIRST_NAME = 'first_name';
const LAST_NAME = 'last_name';
const IS_BOT = 'is_bot';

export default class ChannelCommand {

    constructor(bridge, channel, data, config, debug) {
        this._bridge = bridge;
        this._channel = channel; 
        this._data = data;
        this._nsPermissions = [];
        this._config = {
            prefix: '!',
            allowBots: false,
            permissions: 'all',
            admins: [],
            namespaces: [],
            ...config,
        };
        this._debug = debug;

        if (typeof this._config.permissions === 'string') {
            this._config.permissions = [this._config.permissions];
        }

        if (!Array.isArray(this._config.namespaces)) {
            this._config.namespaces = Object.keys(this._config.namespaces)
                .map((name) => ({
                    permissions: [],
                    admins: [],
                    ...this._config.namespaces[name],
                    prefix: this._config.namespaces[name].prefix || name,
                    name,
                }))
            ;
        }

        this.debug(`Loading commands plugin for ${channel.name}`);
        this._handleChannel();
    }

    get name() {
        return this._data.name;
    }

    get id() {
        return this._channel.id;
    }

    debug(...args) {
        this._debug(...args);
    }

    update(data) {
        this._data = data;
    }

    async _getAdmins() {
        const admins = await this._channel._connector.tgBot
            .getChatAdministrators(this._channel._chatId);
        return admins.map((x) => [x.user.id, x.user.[IS_BOT], x.status]);
    }

    _getPermissionsMap(command) {
        const ns = this._config.namespaces
            .find((x) => command.startsWith(x.prefix));

        if (ns && ns.map) {
            return ns.map;
        }

        let nsPerms = ns ? ns.permissions : [];

        if (typeof nsPerms === 'string') {
            nsPerms = [nsPerms];
            if (ns) ns.permissions = nsPerms;
        }

        let nsAdmins = ns ? ns.admins : [];

        if (typeof nsAdmins === 'string') {
            nsAdmins = [nsAdmins];
            if (ns) ns.admins = nsAdmins;
        }

        const perms = [
            ...this._config.permissions,
            ...nsPerms,
        ];

        const map = {
            permissions: [...new Set(perms)],
            admins: [...new Set(nsAdmins)], 
            allowBots: (ns ? ns.allowBots : null) || this._config.allowBots,
        }
                
        if (ns) ns.map = map;

        return map;
    }

    async _checkPermissions(command, user) {
        this.debug(`Checking permissions for ${user.username} to ${command}`);
        const perms = this._getPermissionsMap(command);

        if (user[IS_BOT] && !perms.allowBots) {
            return false;
        }

        if (perms.permissions.includes('all')) {
            return true;
        }

        if (
            perms.permissions.includes('custom') && 
            (
                perms.admins.includes(user.id) ||
                perms.admins.includes(user.username)
            ) 
        ) {
            return true;
        }

        if (perms.permissions.includes('admin')) {
            const admins = await this._getAdmins();
            if (admins.find(([id]) => id === user.id)) {
                return true;
            }
        }

        return false;
    }

    async _handleCommand(command, user) {
        const hasPerms = await this._checkPermissions(command, user);

        if (!hasPerms) {
            this.debug(
                `User ${user.username} (${user.id}) has not perms ` +
                `for ${command}`
            );

            this._channel.sendMessage(
                `@${user.username} _not have permission for this action_`, {
                    "parse_mode": 'Markdown',
                    "disable_web_page_preview": true,
                    "disable_notification": true,
                }
            );
        }

        this.debug(user.username, 'execs', command);
        this._bridge.emit(
            'x_command',
            this._bridge,
            this._channel,
            user,
            command,
        );
    }

    _handleChannel() {
        this.debug("handle channel events");
        this._channel.on('message', async (_user, message) => {
            let user = {..._user};

            if (!message.startsWith(this._config.prefix)) {
                return;
            }

            await this._handleCommand(
                message.replace(this._config.prefix, ''),
                user,
            );
        });
    }
}
