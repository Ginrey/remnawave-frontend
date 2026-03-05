import { notifications } from '@mantine/notifications'

import { createMutationHook } from '../../tsq-helpers'
import {
    CreateSubscriptionImportSourceContract,
    DeleteSubscriptionImportSourceContract,
    FetchNowSubscriptionImportSourceContract,
    UpdateSubscriptionImportSourceContract,
} from '../../contract/subscription-import-sources.contract'

export const useCreateSubscriptionImportSource = createMutationHook({
    endpoint: CreateSubscriptionImportSourceContract.TSQ_url,
    bodySchema: CreateSubscriptionImportSourceContract.RequestSchema,
    responseSchema: CreateSubscriptionImportSourceContract.ResponseSchema,
    requestMethod: CreateSubscriptionImportSourceContract.RequestMethod,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Import source created successfully',
                color: 'teal',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Create Import Source',
                message: error instanceof Error ? error.message : 'Request failed with unknown error.',
                color: 'red',
            })
        },
    },
})

export const useUpdateSubscriptionImportSource = createMutationHook({
    endpoint: UpdateSubscriptionImportSourceContract.TSQ_url,
    bodySchema: UpdateSubscriptionImportSourceContract.RequestSchema,
    routeParamsSchema: UpdateSubscriptionImportSourceContract.RouteParamsSchema,
    responseSchema: UpdateSubscriptionImportSourceContract.ResponseSchema,
    requestMethod: UpdateSubscriptionImportSourceContract.RequestMethod,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Import source updated successfully',
                color: 'teal',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Update Import Source',
                message: error instanceof Error ? error.message : 'Request failed with unknown error.',
                color: 'red',
            })
        },
    },
})

export const useDeleteSubscriptionImportSource = createMutationHook({
    endpoint: DeleteSubscriptionImportSourceContract.TSQ_url,
    routeParamsSchema: DeleteSubscriptionImportSourceContract.RequestSchema,
    responseSchema: DeleteSubscriptionImportSourceContract.ResponseSchema,
    requestMethod: DeleteSubscriptionImportSourceContract.RequestMethod,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Import source deleted successfully',
                color: 'teal',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Delete Import Source',
                message: error instanceof Error ? error.message : 'Request failed with unknown error.',
                color: 'red',
            })
        },
    },
})

export const useFetchNowSubscriptionImportSource = createMutationHook({
    endpoint: FetchNowSubscriptionImportSourceContract.TSQ_url,
    routeParamsSchema: FetchNowSubscriptionImportSourceContract.RequestSchema,
    responseSchema: FetchNowSubscriptionImportSourceContract.ResponseSchema,
    requestMethod: FetchNowSubscriptionImportSourceContract.RequestMethod,
    rMutationParams: {
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Fetch triggered. Configs will be imported shortly.',
                color: 'teal',
            })
        },
        onError: (error) => {
            notifications.show({
                title: 'Fetch Now',
                message: error instanceof Error ? error.message : 'Request failed with unknown error.',
                color: 'red',
            })
        },
    },
})
