const Bridge = require('./bridge');

const bridge = new Bridge(self, self);

self.init = async ({ apiEndpoint, apiKey, appVersion, shellVersion }) => {
    // TODO remove the document shim when this PR is merged
    // https://github.com/cfware/babel-plugin-bundled-import-meta/pull/26
    self.document = {
        baseURI: self.location.href
    };
    self.app_version = appVersion;
    self.shell_version = shellVersion;
    self.api_endpoint = apiEndpoint;
    self.api_key = apiKey;
    self.get_location_hash = async () => bridge.call(['location', 'hash'], []);
    self.local_storage_get_item = async (key) => bridge.call(['localStorage', 'getItem'], [key]);
    self.local_storage_set_item = async (key, value) => bridge.call(['localStorage', 'setItem'], [key, value]);
    self.local_storage_remove_item = async (key) => bridge.call(['localStorage', 'removeItem'], [key]);
    const { default: initialize_api, initialize_runtime, get_state, get_debug_state, dispatch, analytics, decode_stream } = require('./stremio_core_web.js');
    self.getState = get_state;
    self.getDebugState = get_debug_state;
    self.dispatch = dispatch;
    self.analytics = analytics;
    self.decodeStream = decode_stream;
    await initialize_api(require('./stremio_core_web_bg.wasm'));
    await initialize_runtime((event) => bridge.call(['onCoreEvent'], [event]));
};
