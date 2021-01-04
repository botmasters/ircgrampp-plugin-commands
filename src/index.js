
import PluginBase from 'ircgrampp-plugin';
import BridgeCommands from './commands';

export default class CommandsPlugin extends PluginBase {

    _channels = [];

    initialize() {
        this.debug('Plugin initialized');
        this._channels = [];
    }

    getCompatibleVersion() {
        return "~0.4.2";
    }

    updateChannel(bridge, channel, data, config) {
        let chan = this._channels.find(x => x.id === data.id);

        if (chan) {
            this.debug(`Channel info update to ${data.name}`);
            chan.update(data);
        } else {
            this.debug(`New channel to use`, channel.name);
            this._channels.push(new BridgeCommands(
                bridge,
                channel,
                data,
                config,
                (...args) => {
                    this.debug(...args);
                }
            ));
        }
    }

    handleBridge(bridge, config) {
        const channel = bridge._telegramChannel;
        this.debug('Subscribe to updateinformtion of telegram channel');

        channel.on('updateinformation', (data) => {
            this.debug('data', data);
            this.updateChannel(bridge, channel, data, config);
        });

    }

    afterBridgeCreate(bridge) {
        this.debug('New bridge ', bridge.name);

        let conf = this.config.get(bridge.name);

        if (conf) {
            if (!conf.enable) {
                this.debug('Plugin is not enabled for this bridge, pass');
                return;
            }

            this.handleBridge(bridge, conf);
        } else {
            this.debug('There are not configuration for bridge, pass');
        }
    }

}
