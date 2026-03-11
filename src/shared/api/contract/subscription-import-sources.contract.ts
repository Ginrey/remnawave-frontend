/**
 * Local contract for Subscription Import Sources feature.
 * This mirrors the backend contract lib additions for this feature.
 */
import z from 'zod'

const ROOT = '/api'
const CONTROLLER = 'subscription-import-sources'

export const IMPORT_FETCH_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
} as const

export type TImportFetchStatus = (typeof IMPORT_FETCH_STATUS)[keyof typeof IMPORT_FETCH_STATUS]

export const SubscriptionImportSourceSchema = z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    url: z.string().url(),
    isEnabled: z.boolean(),
    fetchIntervalMinutes: z.number().int(),
    configProfileInboundUuid: z.string().uuid().nullable(),
    lastFetchedAt: z
        .string()
        .datetime()
        .nullable()
        .transform((str) => (str ? new Date(str) : null)),
    lastFetchStatus: z.nativeEnum(IMPORT_FETCH_STATUS).nullable(),
    lastFetchError: z.string().nullable(),
    lastHostsCount: z.number().int().nullable(),
    importGroup: z.string().nullable(),
    fetchHeaders: z.record(z.string()).nullable(),
    lastUploadBytes: z.number().nullable(),
    lastDownloadBytes: z.number().nullable(),
    lastTotalBytes: z.number().nullable(),
    lastExpireAt: z
        .string()
        .datetime()
        .nullable()
        .transform((str) => (str ? new Date(str) : null)),
    createdAt: z
        .string()
        .datetime()
        .transform((str) => new Date(str)),
    updatedAt: z
        .string()
        .datetime()
        .transform((str) => new Date(str)),
})

export type TSubscriptionImportSource = z.infer<typeof SubscriptionImportSourceSchema>

// ========================
// GET ALL
// ========================
export namespace GetSubscriptionImportSourcesContract {
    export const url = `${ROOT}/${CONTROLLER}`
    export const TSQ_url = url
    export const RequestMethod = 'get' as const
    export const ResponseSchema = z.object({
        response: z.object({
            total: z.number(),
            importSources: z.array(SubscriptionImportSourceSchema),
        }),
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// ========================
// GET BY UUID
// ========================
export namespace GetSubscriptionImportSourceByUuidContract {
    export const url = (uuid: string) => `${ROOT}/${CONTROLLER}/${uuid}`
    export const TSQ_url = url(':uuid')
    export const RequestMethod = 'get' as const
    export const RequestSchema = z.object({ uuid: z.string().uuid() })
    export type Request = z.infer<typeof RequestSchema>
    export const ResponseSchema = z.object({
        response: SubscriptionImportSourceSchema,
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// ========================
// CREATE
// ========================
export namespace CreateSubscriptionImportSourceContract {
    export const url = `${ROOT}/${CONTROLLER}`
    export const TSQ_url = url
    export const RequestMethod = 'post' as const
    export const RequestSchema = z.object({
        name: z.string().min(2).max(100),
        url: z.string().url(),
        isEnabled: z.boolean().default(true),
        fetchIntervalMinutes: z.number().int().min(5).max(1440).default(60),
        configProfileInboundUuid: z.string().uuid().nullable().optional(),
        importGroup: z.string().min(1).max(100).nullable().optional(),
        fetchHeaders: z.record(z.string()).nullable().optional(),
    })
    export type Request = z.infer<typeof RequestSchema>
    export const ResponseSchema = z.object({
        response: SubscriptionImportSourceSchema,
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// ========================
// UPDATE
// ========================
export namespace UpdateSubscriptionImportSourceContract {
    export const url = (uuid: string) => `${ROOT}/${CONTROLLER}/${uuid}`
    export const TSQ_url = url(':uuid')
    export const RequestMethod = 'patch' as const
    export const RouteParamsSchema = z.object({ uuid: z.string().uuid() })
    export type RouteParams = z.infer<typeof RouteParamsSchema>
    export const RequestSchema = z.object({
        name: z.string().min(2).max(100).optional(),
        url: z.string().url().optional(),
        isEnabled: z.boolean().optional(),
        fetchIntervalMinutes: z.number().int().min(5).max(1440).optional(),
        configProfileInboundUuid: z.string().uuid().nullable().optional(),
        importGroup: z.string().min(1).max(100).nullable().optional(),
        fetchHeaders: z.record(z.string()).nullable().optional(),
    })
    export type Request = z.infer<typeof RequestSchema>
    export const ResponseSchema = z.object({
        response: SubscriptionImportSourceSchema,
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// ========================
// DELETE
// ========================
export namespace DeleteSubscriptionImportSourceContract {
    export const url = (uuid: string) => `${ROOT}/${CONTROLLER}/${uuid}`
    export const TSQ_url = url(':uuid')
    export const RequestMethod = 'delete' as const
    export const RequestSchema = z.object({ uuid: z.string().uuid() })
    export type Request = z.infer<typeof RequestSchema>
    export const ResponseSchema = z.object({
        response: z.object({ isDeleted: z.boolean() }),
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// ========================
// FETCH NOW
// ========================
export namespace FetchNowSubscriptionImportSourceContract {
    export const url = (uuid: string) =>
        `${ROOT}/${CONTROLLER}/${uuid}/actions/fetch-now`
    export const TSQ_url = url(':uuid')
    export const RequestMethod = 'post' as const
    export const RequestSchema = z.object({ uuid: z.string().uuid() })
    export type Request = z.infer<typeof RequestSchema>
    export const ResponseSchema = z.object({
        response: SubscriptionImportSourceSchema,
    })
    export type Response = z.infer<typeof ResponseSchema>
}
