export default connect;
declare function connect(): Promise<{
    logger: import("pino").Logger<import("pino").LoggerOptions>;
    getOrderDetails: (orderId: string, tokenBase64: string) => Promise<import("baileys/lib/Types/index.js").OrderDetails>;
    getCatalog: ({ jid, limit, cursor }: import("baileys/lib/Types/index.js").GetCatalogOptions) => Promise<{
        products: import("baileys/lib/Types/index.js").Product[];
        nextPageCursor: string | undefined;
    }>;
    getCollections: (jid?: string | undefined, limit?: number) => Promise<{
        collections: import("baileys/lib/Types/index.js").CatalogCollection[];
    }>;
    productCreate: (create: import("baileys/lib/Types/index.js").ProductCreate) => Promise<import("baileys/lib/Types/index.js").Product>;
    productDelete: (productIds: string[]) => Promise<{
        deleted: number;
    }>;
    productUpdate: (productId: string, update: import("baileys/lib/Types/index.js").ProductUpdate) => Promise<import("baileys/lib/Types/index.js").Product>;
    sendMessageAck: ({ tag, attrs, content }: import("baileys").BinaryNode) => Promise<void>;
    sendRetryRequest: (node: import("baileys").BinaryNode, forceIncludeKeys?: boolean) => Promise<void>;
    rejectCall: (callId: string, callFrom: string) => Promise<void>;
    fetchMessageHistory: (count: number, oldestMsgKey: import("baileys/lib/Types/index.js").WAProto.IMessageKey, oldestMsgTimestamp: number | import("long").Long) => Promise<string>;
    requestPlaceholderResend: (messageKey: import("baileys/lib/Types/index.js").WAProto.IMessageKey) => Promise<string | undefined>;
    getPrivacyTokens: (jids: string[]) => Promise<import("baileys").BinaryNode>;
    assertSessions: (jids: string[], force: boolean) => Promise<boolean>;
    relayMessage: (jid: string, message: import("baileys/lib/Types/index.js").WAProto.IMessage, { messageId: msgId, participant, additionalAttributes, additionalNodes, useUserDevicesCache, useCachedGroupMetadata, statusJidList }: import("baileys/lib/Types/index.js").MessageRelayOptions) => Promise<string>;
    sendReceipt: (jid: string, participant: string | undefined, messageIds: string[], type: import("baileys/lib/Types/index.js").MessageReceiptType) => Promise<void>;
    sendReceipts: (keys: import("baileys/lib/Types/index.js").WAProto.IMessageKey[], type: import("baileys/lib/Types/index.js").MessageReceiptType) => Promise<void>;
    readMessages: (keys: import("baileys/lib/Types/index.js").WAProto.IMessageKey[]) => Promise<void>;
    refreshMediaConn: (forceGet?: boolean) => Promise<import("baileys/lib/Types/index.js").MediaConnInfo>;
    waUploadToServer: import("baileys/lib/Types/index.js").WAMediaUploadFunction;
    fetchPrivacySettings: (force?: boolean) => Promise<{
        [_: string]: string;
    }>;
    sendPeerDataOperationMessage: (pdoMessage: import("baileys/lib/Types/index.js").WAProto.Message.IPeerDataOperationRequestMessage) => Promise<string>;
    createParticipantNodes: (jids: string[], message: import("baileys/lib/Types/index.js").WAProto.IMessage, extraAttrs?: {
        [key: string]: string;
    } | undefined) => Promise<{
        nodes: import("baileys").BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<import("baileys").JidWithDevice[]>;
    updateMediaMessage: (message: import("baileys/lib/Types/index.js").WAProto.IWebMessageInfo) => Promise<import("baileys/lib/Types/index.js").WAProto.IWebMessageInfo>;
    sendMessage: (jid: string, content: import("baileys/lib/Types/index.js").AnyMessageContent, options?: import("baileys/lib/Types/index.js").MiscMessageGenerationOptions) => Promise<import("baileys/lib/Types/index.js").WAProto.WebMessageInfo | undefined>;
    groupMetadata: (jid: string) => Promise<import("baileys/lib/Types/index.js").GroupMetadata>;
    groupCreate: (subject: string, participants: string[]) => Promise<import("baileys/lib/Types/index.js").GroupMetadata>;
    groupLeave: (id: string) => Promise<void>;
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>;
    groupRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    groupRequestParticipantsUpdate: (jid: string, participants: string[], action: "reject" | "approve") => Promise<{
        status: string;
        jid: string;
    }[]>;
    groupParticipantsUpdate: (jid: string, participants: string[], action: import("baileys/lib/Types/index.js").ParticipantAction) => Promise<{
        status: string;
        jid: string;
        content: import("baileys").BinaryNode;
    }[]>;
    groupUpdateDescription: (jid: string, description?: string | undefined) => Promise<void>;
    groupInviteCode: (jid: string) => Promise<string | undefined>;
    groupRevokeInvite: (jid: string) => Promise<string | undefined>;
    groupAcceptInvite: (code: string) => Promise<string | undefined>;
    groupRevokeInviteV4: (groupJid: string, invitedJid: string) => Promise<boolean>;
    groupAcceptInviteV4: (key: string | import("baileys/lib/Types/index.js").WAProto.IMessageKey, inviteMessage: import("baileys/lib/Types/index.js").WAProto.Message.IGroupInviteMessage) => Promise<string>;
    groupGetInviteInfo: (code: string) => Promise<import("baileys/lib/Types/index.js").GroupMetadata>;
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    groupSettingUpdate: (jid: string, setting: "announcement" | "locked" | "not_announcement" | "unlocked") => Promise<void>;
    groupMemberAddMode: (jid: string, mode: "all_member_add" | "admin_add") => Promise<void>;
    groupJoinApprovalMode: (jid: string, mode: "on" | "off") => Promise<void>;
    groupFetchAllParticipating: () => Promise<{
        [_: string]: import("baileys/lib/Types/index.js").GroupMetadata;
    }>;
    processingMutex: {
        mutex<T>(code: () => T | Promise<T>): Promise<T>;
    };
    upsertMessage: (msg: import("baileys/lib/Types/index.js").WAProto.IWebMessageInfo, type: import("baileys/lib/Types/index.js").MessageUpsertType) => Promise<void>;
    appPatch: (patchCreate: import("baileys/lib/Types/index.js").WAPatchCreate) => Promise<void>;
    sendPresenceUpdate: (type: import("baileys/lib/Types/index.js").WAPresence, toJid?: string | undefined) => Promise<void>;
    presenceSubscribe: (toJid: string, tcToken?: Buffer | undefined) => Promise<void>;
    profilePictureUrl: (jid: string, type?: "image" | "preview", timeoutMs?: number | undefined) => Promise<string | undefined>;
    onWhatsApp: (...jids: string[]) => Promise<{
        exists: boolean;
        jid: string;
    }[]>;
    fetchBlocklist: () => Promise<string[]>;
    fetchStatus: (jid: string) => Promise<{
        status: string | undefined;
        setAt: Date;
    } | undefined>;
    updateProfilePicture: (jid: string, content: import("baileys/lib/Types/index.js").WAMediaUpload) => Promise<void>;
    removeProfilePicture: (jid: string) => Promise<void>;
    updateProfileStatus: (status: string) => Promise<void>;
    updateProfileName: (name: string) => Promise<void>;
    updateBlockStatus: (jid: string, action: "block" | "unblock") => Promise<void>;
    updateCallPrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyCallValue) => Promise<void>;
    updateLastSeenPrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyValue) => Promise<void>;
    updateOnlinePrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyOnlineValue) => Promise<void>;
    updateProfilePicturePrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyValue) => Promise<void>;
    updateStatusPrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyValue) => Promise<void>;
    updateReadReceiptsPrivacy: (value: import("baileys/lib/Types/index.js").WAReadReceiptsValue) => Promise<void>;
    updateGroupsAddPrivacy: (value: import("baileys/lib/Types/index.js").WAPrivacyGroupAddValue) => Promise<void>;
    updateDefaultDisappearingMode: (duration: number) => Promise<void>;
    getBusinessProfile: (jid: string) => Promise<void | import("baileys/lib/Types/index.js").WABusinessProfile>;
    resyncAppState: (collections: readonly ("critical_block" | "critical_unblock_low" | "regular_high" | "regular_low" | "regular")[], isInitialSync: boolean) => Promise<void>;
    chatModify: (mod: import("baileys/lib/Types/index.js").ChatModification, jid: string) => Promise<void>;
    cleanDirtyBits: (type: "account_sync" | "groups", fromTimestamp?: string | number | undefined) => Promise<void>;
    addLabel: (jid: string, labels: import("baileys/lib/Types/Label.js").LabelActionBody) => Promise<void>;
    addChatLabel: (jid: string, labelId: string) => Promise<void>;
    removeChatLabel: (jid: string, labelId: string) => Promise<void>;
    addMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    removeMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    star: (jid: string, messages: {
        id: string;
        fromMe?: boolean | undefined;
    }[], star: boolean) => Promise<void>;
    type: "md";
    ws: import("baileys/lib/Socket/Client/websocket.js").WebSocketClient;
    ev: import("baileys/lib/Types/index.js").BaileysEventEmitter & {
        process(handler: (events: Partial<import("baileys/lib/Types/index.js").BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T_1>(work: (...args: A) => Promise<T_1>): (...args: A) => Promise<T_1>;
        flush(force?: boolean | undefined): boolean;
        isBuffering(): boolean;
    };
    authState: {
        creds: import("baileys/lib/Types/index.js").AuthenticationCreds;
        keys: import("baileys/lib/Types/index.js").SignalKeyStoreWithTransaction;
    };
    signalRepository: import("baileys/lib/Types/index.js").SignalRepository;
    user: import("baileys/lib/Types/index.js").Contact | undefined;
    generateMessageTag: () => string;
    query: (node: import("baileys").BinaryNode, timeoutMs?: number | undefined) => Promise<import("baileys").BinaryNode>;
    waitForMessage: <T_2>(msgId: string, timeoutMs?: number | undefined) => Promise<T_2>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Uint8Array | Buffer) => Promise<void>;
    sendNode: (frame: import("baileys").BinaryNode) => Promise<void>;
    logout: (msg?: string | undefined) => Promise<void>;
    end: (error: Error | undefined) => void;
    onUnexpectedError: (err: Error | import("@hapi/boom").Boom<any>, msg: string) => void;
    uploadPreKeys: (count?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    requestPairingCode: (phoneNumber: string) => Promise<string>;
    waitForConnectionUpdate: (check: (u: Partial<import("baileys/lib/Types/index.js").ConnectionState>) => boolean | undefined, timeoutMs?: number | undefined) => Promise<void>;
    sendWAMBuffer: (wamBuffer: Buffer) => Promise<import("baileys").BinaryNode>;
}>;
import * as baileys from 'baileys';
