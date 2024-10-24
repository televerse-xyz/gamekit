import {TonConnectUI, TonConnectUiCreateOptions} from "@tonconnect/ui";
import {Address} from "@ton/core";

/**
 * ton connect
 * @param options
 */
export function connectWallet(options: TonConnectUiCreateOptions) {
    return new TonConnectUI(options);
}

/**
 * format ton address
 * @param address ton address
 */
export function formatAddress(address: string) {
    return Address.parseRaw(address).toString({
        bounceable: false,
        testOnly: false,
    });
}
