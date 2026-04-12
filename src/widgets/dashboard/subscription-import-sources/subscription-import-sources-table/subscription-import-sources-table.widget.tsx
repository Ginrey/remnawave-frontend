import {
    ActionIcon,
    Badge,
    Card,
    Group,
    Stack,
    Switch,
    Table,
    Text,
    Tooltip
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { instance } from '@shared/api/axios'
import { FetchNowSubscriptionImportSourceContract } from '@shared/api/contract/subscription-import-sources.contract'

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

function TrafficInfo({ source }: { source: { lastUploadBytes: number | null; lastDownloadBytes: number | null; lastTotalBytes: number | null; lastExpireAt: Date | null } }) {
    const hasTraffic = source.lastUploadBytes !== null || source.lastDownloadBytes !== null
    if (!hasTraffic) return <Text c="dimmed" size="xs">—</Text>

    const upload = source.lastUploadBytes ?? 0
    const download = source.lastDownloadBytes ?? 0
    const total = source.lastTotalBytes ?? 0
    const used = upload + download
    const expire = source.lastExpireAt ? new Date(source.lastExpireAt) : null

    return (
        <Stack gap={2}>
            <Text size="xs">↑ {formatBytes(upload)} / ↓ {formatBytes(download)}</Text>
            {total > 0 && (
                <Text c="dimmed" size="xs">Limit: {formatBytes(total)} (used {formatBytes(used)})</Text>
            )}
            {expire && (
                <Text c="dimmed" size="xs">Exp: {expire.toLocaleDateString()}</Text>
            )}
        </Stack>
    )
}
import { modals } from '@mantine/modals'
import { useTranslation } from 'react-i18next'
import { TbCopy, TbPencil, TbRefresh, TbTrash } from 'react-icons/tb'
import { PiEmpty } from 'react-icons/pi'
import { useEffect, useRef, useState } from 'react'

import {
    QueryKeys,
    useCreateSubscriptionImportSource,
    useDeleteSubscriptionImportSource,
    useFetchNowSubscriptionImportSource,
    useUpdateSubscriptionImportSource
} from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'

import { IMPORT_FETCH_STATUS, TSubscriptionImportSource } from '@shared/api/contract/subscription-import-sources.contract'
import { IProps } from './interfaces'

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <Badge color="gray" variant="light">—</Badge>
    if (status === IMPORT_FETCH_STATUS.SUCCESS) return <Badge color="teal" variant="light">Success</Badge>
    if (status === IMPORT_FETCH_STATUS.ERROR) return <Badge color="red" variant="light">Error</Badge>
    return <Badge color="yellow" variant="light">Pending</Badge>
}

const CLONED_SUFFIX = ' (cloned)'
const IMPORT_SOURCE_NAME_LIMIT = 100

function generateRandomHwid() {
    return Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16).toUpperCase()
    ).join('')
}

function cloneImportSourceName(name: string) {
    return `${name}${CLONED_SUFFIX}`.slice(0, IMPORT_SOURCE_NAME_LIMIT)
}

function cloneFetchHeaders(fetchHeaders: Record<string, string> | null) {
    if (!fetchHeaders) return null

    return Object.fromEntries(
        Object.entries(fetchHeaders).map(([key, value]) => [
            key,
            key.toLowerCase() === 'x-hwid' ? generateRandomHwid() : value
        ])
    )
}

export function SubscriptionImportSourcesTableWidget(props: IProps) {
    const { importSources, onEdit, refreshAllTrigger } = props
    const { t } = useTranslation()
    const [isRefreshingAll, setIsRefreshingAll] = useState(false)
    const lastRefreshAllTriggerRef = useRef(refreshAllTrigger)

    const { mutate: deleteSource } = useDeleteSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
            }
        }
    })

    const { mutate: updateSource } = useUpdateSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
            }
        }
    })

    const { mutate: createSource, isPending: isCloning } = useCreateSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
            }
        }
    })

    const { mutate: fetchNow, isPending: isFetching } = useFetchNowSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
            }
        }
    })

    const handleDelete = (source: TSubscriptionImportSource) => {
        modals.openConfirmModal({
            title: t('common.delete'),
            children: t('common.confirm-action-description'),
            labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
            cancelProps: { variant: 'subtle', color: 'gray' },
            confirmProps: { color: 'red' },
            centered: true,
            onConfirm: () => deleteSource({ route: { uuid: source.uuid } })
        })
    }

    const handleToggleEnabled = (source: TSubscriptionImportSource) => {
        updateSource({
            route: { uuid: source.uuid },
            variables: { isEnabled: !source.isEnabled }
        })
    }

    const handleFetchNow = (source: TSubscriptionImportSource) => {
        fetchNow({ route: { uuid: source.uuid } })
    }

    const handleClone = (source: TSubscriptionImportSource) => {
        createSource({
            variables: {
                name: cloneImportSourceName(source.name),
                url: source.url,
                isEnabled: source.isEnabled,
                fetchIntervalMinutes: source.fetchIntervalMinutes,
                configProfileInboundUuid: source.configProfileInboundUuid,
                importGroup: source.importGroup,
                fetchHeaders: cloneFetchHeaders(source.fetchHeaders)
            }
        })
    }

    useEffect(() => {
        if (refreshAllTrigger === lastRefreshAllTriggerRef.current) return

        lastRefreshAllTriggerRef.current = refreshAllTrigger

        const handleRefreshAll = async () => {
            if (isRefreshingAll || importSources.length === 0) return

            setIsRefreshingAll(true)

            const results = await Promise.allSettled(
                importSources.map((source) =>
                    instance.post(FetchNowSubscriptionImportSourceContract.url(source.uuid))
                )
            )

            const successCount = results.filter((result) => result.status === 'fulfilled').length
            const failedCount = results.length - successCount

            await queryClient.refetchQueries({
                queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
            })

            notifications.show({
                title: failedCount === 0 ? 'Success' : 'Refresh completed',
                message:
                    failedCount === 0
                        ? `Triggered refresh for ${successCount} import sources.`
                        : `Triggered refresh for ${successCount} import sources, ${failedCount} failed.`,
                color: failedCount === 0 ? 'teal' : 'yellow'
            })

            setIsRefreshingAll(false)
        }

        void handleRefreshAll()
    }, [importSources, isRefreshingAll, refreshAllTrigger])

    if (importSources.length === 0) {
        return (
            <Card p="xl" withBorder>
                <Stack align="center" gap="xs" py="xl">
                    <PiEmpty size={48} opacity={0.3} />
                    <Text c="dimmed" ta="center">No import sources configured yet.</Text>
                    <Text c="dimmed" size="sm" ta="center">
                        Add an external VPN subscription URL to automatically import proxy configs.
                    </Text>
                </Stack>
            </Card>
        )
    }

    return (
        <Card p={0} withBorder>
            <Table highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>URL</Table.Th>
                        <Table.Th>Interval</Table.Th>
                        <Table.Th>Last Fetch</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Hosts</Table.Th>
                        <Table.Th>Traffic</Table.Th>
                        <Table.Th>Enabled</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {importSources.map((source) => (
                        <Table.Tr key={source.uuid}>
                            <Table.Td>
                                <Text fw={500}>{source.name}</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text c="dimmed" size="xs" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {source.url}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{source.fetchIntervalMinutes}m</Text>
                            </Table.Td>
                            <Table.Td>
                                <Text c="dimmed" size="xs">
                                    {source.lastFetchedAt
                                        ? new Date(source.lastFetchedAt).toLocaleString()
                                        : '—'}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <StatusBadge status={source.lastFetchStatus} />
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{source.lastHostsCount ?? '—'}</Text>
                            </Table.Td>
                            <Table.Td>
                                <TrafficInfo source={source} />
                            </Table.Td>
                            <Table.Td>
                                <Switch
                                    checked={source.isEnabled}
                                    onChange={() => handleToggleEnabled(source)}
                                    size="sm"
                                />
                            </Table.Td>
                            <Table.Td>
                                <Group gap={4} justify="flex-end">
                                    <Tooltip label="Fetch now">
                                        <ActionIcon
                                            color="blue"
                                            loading={isFetching}
                                            onClick={() => handleFetchNow(source)}
                                            variant="subtle"
                                        >
                                            <TbRefresh size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Edit">
                                        <ActionIcon
                                            color="gray"
                                            onClick={() => onEdit(source)}
                                            variant="subtle"
                                        >
                                            <TbPencil size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Clone">
                                        <ActionIcon
                                            color="grape"
                                            loading={isCloning}
                                            onClick={() => handleClone(source)}
                                            variant="subtle"
                                        >
                                            <TbCopy size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Delete">
                                        <ActionIcon
                                            color="red"
                                            onClick={() => handleDelete(source)}
                                            variant="subtle"
                                        >
                                            <TbTrash size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Card>
    )
}
