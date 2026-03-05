import { createQueryKeys } from '@lukemorales/query-key-factory'
import { keepPreviousData } from '@tanstack/react-query'

import { sToMs } from '@shared/utils/time-utils'

import { createGetQueryHook, errorHandler } from '../../tsq-helpers'
import {
    GetSubscriptionImportSourcesContract,
    GetSubscriptionImportSourceByUuidContract,
} from '../../contract/subscription-import-sources.contract'

export const subscriptionImportSourcesQueryKeys = createQueryKeys('subscriptionImportSources', {
    getAll: {
        queryKey: null,
    },
    getByUuid: (uuid: string) => ({
        queryKey: [uuid],
    }),
})

export const useGetSubscriptionImportSources = createGetQueryHook({
    endpoint: GetSubscriptionImportSourcesContract.TSQ_url,
    responseSchema: GetSubscriptionImportSourcesContract.ResponseSchema,
    getQueryKey: () => subscriptionImportSourcesQueryKeys.getAll.queryKey,
    rQueryParams: {
        placeholderData: keepPreviousData,
        refetchOnMount: true,
        staleTime: sToMs(10),
    },
    errorHandler: (error) => errorHandler(error, 'Get Subscription Import Sources'),
})

export const useGetSubscriptionImportSourceByUuid = createGetQueryHook({
    endpoint: GetSubscriptionImportSourceByUuidContract.TSQ_url,
    responseSchema: GetSubscriptionImportSourceByUuidContract.ResponseSchema,
    routeParamsSchema: GetSubscriptionImportSourceByUuidContract.RequestSchema,
    getQueryKey: ({ route }) =>
        subscriptionImportSourcesQueryKeys.getByUuid(route?.uuid ?? '').queryKey,
    rQueryParams: {
        refetchOnMount: true,
        staleTime: sToMs(15),
    },
    errorHandler: (error) => errorHandler(error, 'Get Subscription Import Source'),
})
