//

type RedNode_ = import("node-red").Node;
interface RedNode extends RedNode_ { }

type NodeAPI = import("node-red").NodeAPI;
interface RED extends NodeAPI { }

type NodeDef = import("node-red").NodeDef;
interface NodeConfig extends NodeDef { }

type Headers = import("node-fetch").Headers;
type Response_ = import("node-fetch").Response;
interface Response extends Response_ { }

type NodeLog = (node: RedNode, msg_text: string) => void;
type NodeSetStatus = (node: RedNode, is_debug: boolean, color: string, shape: string, topic: string, status: string) => void;
type NodeSetError = (node: RedNode, is_debug: boolean, topic: string, status: string) => void;
type NodeClean = (node: RedNode) => void;

type FuncLog = (msg_text: string) => NodeLog;
type FuncSetStatus = (color: string, shape: string, topic: string, status: string) => NodeSetStatus;
type FuncSetError = (topic: string, status: string) => NodeSetError;
type FuncClean = () => NodeClean;

type defFunc = {
    Debug_Log: FuncLog,
    SetStatus: FuncSetStatus,
    SetError: FuncSetError;
};

interface defHeaders extends Headers {
    Version: number;
    OS: string;
    bundleID: string;
    device: string;
    OSdata: string;
    "User-Agent": string;
    Authorization?: string;
    "Content-Type"?: string;
}

interface defParams {
    flatId: string;
    host: string;
    defHeaders: defHeaders;
    defFunctions: defFunc;
    topic?: string;
}

interface defGetParams {
    host: string;
    defHeaders: defHeaders;
    Debug_Log: FuncLog;
    SetStatus: FuncSetStatus;
    SetError: FuncSetError;
    topic?: string;
}

interface fetchGetParams {
    topic: string;
    url: string;
    headers: defHeaders;
    SetError: FuncSetError;
}

interface fetchPostParams extends fetchGetParams {
    body: Body;
}

type fetchGet = ({ topic, url, headers, SetError }: fetchGetParams) => Promise<object>;
type fetchPost = ({ topic, url, headers, SetError, body }: fetchPostParams) => Promise<object>;

type initCheck = (uk: string, token: string, flatId: string, username: string, password: string, defFunctions: defFunc) => Promise<defParams> | undefined;

interface getTokenParams extends defGetParams {
    username: string;
    password: string;
}
type getToken = ({ username, password, defHeaders, host, SetStatus, SetError, Debug_Log }: getTokenParams) => Promise<string> | undefined;

interface getConfigParams extends defGetParams {
    flatId: string;
}
type getConfig = ({ flatId, host, defHeaders, SetStatus, SetError, Debug_Log }: getConfigParams) => Promise<string> | boolean | undefined;

interface getAccrOrPay extends getConfigParams {
    lastMonth: boolean;
    date: string;
}
type onlyLast = {
    month: string;
    sum: number;
};
type accrualsAll = {
    [key: number]: {
        [key: string]: number;
    };
};
type accruals = accrualsAll | onlyLast;
type getAccruals = ({ lastMonth, date, flatId, defHeaders, host, topic, SetError, Debug_Log }: getAccrOrPay) => Promise<object> | boolean | undefined;
type payments = accruals | {
    [key: string]: number;
};
type getPayments = getAccruals;


type counters = {
    [key: string]: {
        id: number,
        title: string,
        vals: number[],
        error: string | null;
    };
};
type getCounters = ({ flatId, defHeaders, host, topic, SetError, Debug_Log }: getConfigParams) => Promise<counters>;

interface news extends Object { [key: string]: number[]; }
interface sendCountersParams extends getConfigParams { news: news; }

type sendCounters = ({ news, flatId, defHeaders, host, SetStatus, SetError, Debug_Log }: sendCountersParams) => Promise<string>;
type out = accruals | payments | counters | undefined | null;
// }

