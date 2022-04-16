//

type RedNode = import("node-red").Node;
type RED = import("node-red").NodeAPI;
type NodeConfig = import("node-red").NodeDef;
type NodeStatusFill = import("node-red").NodeStatusFill;
type NodeStatusShape = import("node-red").NodeStatusShape;

type Headers_ = import("node-fetch").Headers;
type Response_ = import("node-fetch").Response;
interface Response extends Response_ { }

type NodeLog = (node: RedNode, msg_text: string) => void;
type NodeSetStatus = (node: RedNode, is_debug: boolean, color: NodeStatusFill, shape: NodeStatusShape, topic: string, status: string) => void;
type NodeSetError = (node: RedNode, is_debug: boolean, topic: string, status: string) => void;
type NodeClean = (node: RedNode) => void;

type FuncLog = (msg_text: string) => NodeLog;
type FuncSetStatus = (color: NodeStatusFill, shape: NodeStatusShape, topic: string, status: string) => NodeSetStatus;
type FuncSetError = (topic: string, status: string) => NodeSetError;
type FuncClean = () => NodeClean;

interface defFunc {
    Debug_Log: FuncLog,
    SetStatus: FuncSetStatus,
    SetError: FuncSetError;
}

interface defHeaders extends Headers_ {
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
    flatId: number;
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

interface ansAPI {
    isSuccess: boolean;
    error?: { message: string; };
    message?: string | null;
}
interface ansAuth extends ansAPI {
    typeAccount?: string | null;
}
interface ansAuthLogin extends ansAuth {
    data?: {
        nextScreen: boolean;
    };
}
interface ansAuthPasswd extends ansAuth {
    data?: string;
}
interface ansConfig extends ansAPI {
    data: {
        human: {
            id: string;
            name: string;
            surname: string;
            patronymic: string;
            phone: string;
            email: string;
        };
        roomsList: {
            id: number;
            street: string;
            houseNumber: string;
            flatNumber: string;
            balance: string;
            balanceDecimal: number;
            balanceModel: {
                value: string;
                date: any;
                balanceNeedsToBeUpdated: boolean;
            };
            fullAdress: string;
            countRooms: string;
            subTitle: string;
            title: string;
            roomTypeTitle: string;
            roomTypeId: any;
            managementCompanyNumber: string;
            squareAll: string;
            accountNumber: string;
            oldAccountNumber: string;
            personNumber: number;
            accrual: {
                totalSumm: string;
                month: string;
                countAccrualsByThisMonth: number;
            };
        }[];
    };
}
interface ansAccruals extends ansAPI {
    data: {
        type: string | null;
        id: number;
        year: number;
        month: string;
        period: string;
        address: string;
        flatNumber: string;
        addressHouse: string;
        accountNumber: string;
        pdf: string;
        summToPay: number;
        isOther: boolean;
        totalSumm: string;
        totalSumToDecimal: number;
        monthStat: {
            isDone: boolean;
            summToDecimal: number;
            summToString: string;
        };
    }[];
}
interface ansPayments extends ansAPI {
    data: {
        dateTime: string;
        monthToString: string;
        summ: number;
        summToString: string;
        types: {
            title: string;
            summ: number;
            summToString: string;
        }[];
        list: {
            type: string;
            dateTime: string;
            dateTimeToString: string;
            summ: number;
            summToString: string;
            id: number | null;
            localId: number;
            inProcessing: boolean;
            hideDay: boolean;
            purpose: string;
            receiptLocation: string;
        }[];
    }[];
}
interface ansCounters extends ansAPI {
    data: {
        id: number;
        isManual: boolean;
        counterDescription: string;
        isTrueDay: boolean;
        isSumm: boolean;
        isAdditional: boolean;
        identifier: string;
        lastValue: string;
        type: {
            title: string;
            unit: string;
            equipmentSection: {
                title: string;
                image: string;
                identifier: string;
            };
        };
        serialNumber: string;
        checkDate: string;
        checkDateStatus: {
            hot: boolean;
            warm: boolean;
            expired: boolean;
        };
        readingDate: string;
        readingOwner: string;
        capacity: number;
        unit: string;
        error: string | null;
        isArchive: boolean;
    }[];
}
interface ansSendCounters extends ansAPI {
    data: {
        id: number;
        error: string;
    }[] | null;
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

type arrowPromise<I, O> = (Params: I) => Promise<O> | undefined;

type fetchGet = arrowPromise<fetchGetParams, ansConfig | ansAccruals | ansPayments | ansCounters>;
type fetchPost = arrowPromise<fetchPostParams, ansAuthLogin | ansAuthPasswd | ansSendCounters>;

interface ecvidaCredsBase {
    uk: string;
    username: string;
    password: string;
}
interface ecvidaCredsAdd {
    token?: string;
    flatId?: number;
}
interface ecvidaCreds extends ecvidaCredsBase, ecvidaCredsAdd { }
interface initCheckParams {
    RED: RED;
    id: string;
    should_update: boolean;
    defFunctions: defFunc;
}
type initCheck = arrowPromise<initCheckParams, defParams>;

interface getTokenParams extends defGetParams, ecvidaCreds { }
type getToken = arrowPromise<getTokenParams, string>;

interface getConfigParams extends defGetParams {
    flatId: number;
    isBalance?: boolean;
}
interface flatObj {
    id: number;
    adress: string;
    balance: number;
}
type getConfigAns = flatObj | string;
type getConfig = arrowPromise<getConfigParams, getConfigAns>;

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
type getAccruals = arrowPromise<getAccrOrPay, accruals>;

type payments = accruals | { [key: string]: number; };
type getPayments = arrowPromise<getAccrOrPay, payments>;

type counters = {
    [key: string]: {
        id: number,
        title: string,
        vals: number[],
        error: string | null;
    };
};
type getCounters = arrowPromise<getConfigParams, counters>;

type news = { [key: string]: number[]; };
interface sendCountersParams extends getConfigParams { news: news; }
type sendCounters = arrowPromise<sendCountersParams, string>;
