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
import { modals } from '@mantine/modals'
import { useTranslation } from 'react-i18next'
import { TbPencil, TbRefresh, TbTrash } from 'react-icons/tb'
import { PiEmpty } from 'react-icons/pi'

import {
    QueryKeys,
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

export function SubscriptionImportSourcesTableWidget(props: IProps) {
    const { importSources, onEdit } = props
    const { t } = useTranslation()

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
