/*
 ** Teletypes Gamekit. © 2024 by PuterJam
 ** Licensed under MIT License.
 */

import {
  InitDataParsed,
  postEvent,
  retrieveLaunchParams,
  User,
} from "@telegram-apps/sdk";
import { CurrencyCodeEnum, WalletPay } from "wallet-pay";
import {
  generateTGWebAppStartParam,
  getTGWebAppStartParam,
  IStartParam,
} from "./utils/utils";
import { CloudData } from "./utils/cloud-data";

export * from "./utils/utils";

/**
 * Gamekit Config
 */
export interface IConfig {
  gameID: string;
  endpointURL: string;
  gamekitVersion: string;
  walletToken: string;
  walletPaymentTimeout: number;
  paymentReturnUrl: string;
  paymentFailReturnUrl: string;
  currencyCode: CurrencyCodeEnum;
}

/**
 * @example
 * const gamekit = new GameKit();
 * gamekit.setGameReady();
 * await gamekit.init(gameId);
 */
export class GameKit {
  /** gamekit initialize ready */
  public isPlatformReady = false;

  /** gamekit config */
  public config: IConfig = {
    gameID: "",
    endpointURL: "",
    gamekitVersion: "1.0.12",
    walletToken: "",
    walletPaymentTimeout: 10800, //sec
    paymentReturnUrl: "https://t.me/wallet",
    paymentFailReturnUrl: "https://t.me/wallet",
    currencyCode: CurrencyCodeEnum.TON,
  };

  /** Cloud Data Storage */
  public cloudData = new CloudData();

  /** tg user info */
  private _userInfo: User;

  /** tg init raw data */
  private _initDataRaw: string;

  /** tg init data */
  private _initData: InitDataParsed;

  /** invite id */
  private _inviteId: string;

  /**
   * set endpoint url
   * @param url endpoint url
   */
  public setEndpointUrl(url: string) {
    this.config.endpointURL = url ? url : this.config.endpointURL;
  }

  /**
   * Initializes the Gamekit with the given game ID.
   *
   * @param gameID - The ID of the game to initialize.
   * @returns {Promise<Object>} A promise that resolves to the response object from the fetch call or an error message.
   */
  public async init(gameID: string) {
    if (this._initPlatform(gameID)) {
      const params = new URLSearchParams(location.search);
      const startParam = params.get("tgWebAppStartParam");
      let body = {};

      if (startParam) {
        body = {
          startParam: startParam,
        };
      }

      return this.fetch("/login", {
        body: JSON.stringify(body),
      });
    }

    return {
      message: "initialize failure",
    };
  }

  /**
   * return user info
   * @returns UserInfo
   */
  public getUserInfo() {
    if (!this.isPlatformReady) {
      console.warn("platform not ready");
      return { id: 0 };
    }

    return this._userInfo;
  }

  /**
   * call telegram game is ready
   */
  public setGameReady() {
    postEvent("web_app_ready");
  }

  /**
   * invite friend by send message
   * @param uri invite bot url
   * @param msg invite bot url
   * @param args other param
   * @param extraKeyMap other key map
   * @returns
   */
  public async invite({
    uri,
    msg,
    args,
    extraKeyMap,
  }: {
    uri: string;
    msg: string;
    args?: Partial<IStartParam>;
    extraKeyMap?: Record<string, string>;
  }) {
    if (!this.isPlatformReady) {
      console.warn("platform not ready");
      return;
    }

    const inviteId = await this.getInviteId();

    const startParam = getTGWebAppStartParam();

    const query = [
      uri
        ? `url=${encodeURIComponent(
            `${uri}?startapp=${generateTGWebAppStartParam(
              {
                invite: inviteId,
                channel: startParam.channel,
                ...args,
              },
              extraKeyMap
            )}`
          )}`
        : ``,
      msg ? `text=${encodeURIComponent(msg)}` : ``,
    ]
      .filter(Boolean)
      .join("&");

    // @ts-ignore
    postEvent("web_app_open_tg_link", {
      path_full: `/share/url?${query}`,
    });
  }

  /**
   * preload or get invite id
   * @returns {string} invite id
   */
  public async getInviteId() {
    if (!this._inviteId) {
      const resp = await this.fetch("/getInvite");
      if (resp && resp.ok) {
        this._inviteId = resp.result?.id;
      }
    }
    return this._inviteId;
  }

  /**
   * open telegram mini app
   *
   * @param {string} bot bot name
   * @param {string} appname app'name,from bot
   * @param {string} [parameter] start parameter
   * @see https://docs.telegram-mini-apps.com/platform/start-parameter
   * @returns
   */

  public openMiniApp(bot: string, appname: string, parameter: string) {
    if (!this.isPlatformReady) {
      console.warn("platform not ready");
      return false;
    }

    const param = {
      path_full: `/${bot}/${appname}?startapp=${parameter ? parameter : ""}`,
    };
    // @ts-ignore
    postEvent("web_app_open_tg_link", param);
  }

  /**
   * create a wallet payment order
   *
   * @deprecated
   * @param {string} externalId Order ID in Merchant system. Use to prevent orders duplication due to request retries
   * @param {string} amount Big decimal string representation. Note that the max precision (number of digits after decimal point) depends on the currencyCode. E.g. for all fiat currencies is 2 (0.01), for TON is 9, for BTC is 8, for USDT is 6. There's also min order amount for creating an order. It's 0.001 TON / 0.000001 BTC / 0.01 USDT / 0.01 USD / 0.01 EUR / 0.1 RUB.
   * @param {string} description Description of the order
   * @param {string} customData Any custom string, will be provided through webhook and order status polling
   * @async
   * @see https://docs.wallet.tg/pay/#tag/Order/operation/create
   * @returns order
   */
  public async pay(
    externalId: string,
    amount: string,
    description: string,
    customData: string
  ) {
    const wallet = new WalletPay(this.config.walletToken);
    const _userID = this.getUserInfo().id;

    if (_userID == 0) {
      return false;
    }

    const order = await wallet.createOrder({
      amount: {
        currencyCode: this.config.currencyCode,
        amount: amount,
      },
      description: description,
      returnUrl: this.config.paymentReturnUrl,
      failReturnUrl: this.config.paymentFailReturnUrl,
      customData: customData, //any data
      externalId: externalId, //"ORD-5023-4E89"
      timeoutSeconds: this.config.walletPaymentTimeout,
      customerTelegramUserId: _userID,
    });

    if (order.status == "SUCCESS") {
      // @ts-ignore
      postEvent("web_app_open_tg_link", {
        path_full: order.data!.payLink,
      });
    }

    return order;
  }

  /**
   * get payment Order
   *
   * @param {string} orderID
   * @async
   * @see https://docs.wallet.tg/pay/#tag/Order/operation/getPreview
   */
  public async getOrderPreview(orderID: string) {
    const wallet = new WalletPay(this.config.walletToken);

    const order = await wallet.getOrderPreview(orderID);
    console.log(order);
  }

  /**
   * Gamekit.fetch include Authorization
   * @param path
   * @param req
   */
  public async fetch(path: string, req: RequestInit = {}) {
    switch (req.method) {
      case "POST":
        if (typeof req.body === "object") {
          req.body = JSON.stringify(req.body);
        }
        break;
      case "GET":
        break;
      default:
        break;
    }

    try {
      const headers = new Headers(req.headers);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `tma ${this._initDataRaw}`);
      headers.set("tt-game-id", this.config.gameID.toString());

      const resp = await fetch(this.config.endpointURL + path, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        ...req,
        headers: headers as Headers,
      });
      return resp.json();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * initialize tg platform
   * @param gameID
   * @returns is initialize success? true or false
   */
  private _initPlatform(gameID: string) {
    this.config.gameID = gameID; //tell me game id.

    try {
      //get Authorization Data
      const { initDataRaw, initData } = retrieveLaunchParams();

      this._userInfo = initData!.user!;
      this._initDataRaw = initDataRaw!;
      this._initData = initData!;

      this.isPlatformReady = true;
    } catch (e) {
      console.warn("not launuch in telegram platform");
      return false;
    }

    return true;
  }
}
