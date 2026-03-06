import {
    ActionIcon,
    Button,
    Drawer,
    Group,
    NumberInput,
    Select,
    Stack,
    Switch,
    Text,
    TextInput
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

import {
    QueryKeys,
    useCreateSubscriptionImportSource,
    useGetConfigProfiles,
    useUpdateSubscriptionImportSource
} from '@shared/api/hooks'
import { queryClient } from '@shared/api/query-client'

import { TSubscriptionImportSource } from '@shared/api/contract/subscription-import-sources.contract'
import { IProps } from './interfaces'

interface HeaderRow {
    key: string
    value: string
}

interface FormValues {
    name: string
    url: string
    isEnabled: boolean
    fetchIntervalMinutes: number
    configProfileInboundUuid: string | null
    importGroup: string | null
    fetchHeaders: HeaderRow[]
}

function recordToRows(record: Record<string, string> | null | undefined): HeaderRow[] {
    if (!record) return []
    return Object.entries(record).map(([key, value]) => ({ key, value }))
}

function rowsToRecord(rows: HeaderRow[]): Record<string, string> | null {
    const filtered = rows.filter((r) => r.key.trim())
    if (filtered.length === 0) return null
    return Object.fromEntries(filtered.map((r) => [r.key.trim(), r.value]))
}

export function SubscriptionImportSourceDrawerWidget(props: IProps) {
    const { opened, editingSource, onClose } = props
    const { t } = useTranslation()

    const isEdit = !!editingSource

    const { data: configProfilesData } = useGetConfigProfiles()

    const inboundOptions = (configProfilesData?.configProfiles ?? []).flatMap((profile) =>
        (profile.inbounds ?? []).map((inbound) => ({
            value: inbound.uuid,
            label: `${profile.name} / ${inbound.tag}`
        }))
    )

    const form = useForm<FormValues>({
        initialValues: {
            name: '',
            url: '',
            isEnabled: true,
            fetchIntervalMinutes: 60,
            configProfileInboundUuid: null,
            importGroup: null,
            fetchHeaders: []
        },
        validate: {
            name: (v) => (v.trim().length < 2 ? 'Name must be at least 2 characters' : null),
            url: (v) => {
                try {
                    new URL(v)
                    return null
                } catch {
                    return 'Must be a valid URL'
                }
            },
            fetchIntervalMinutes: (v) =>
                v < 5 || v > 1440 ? 'Interval must be between 5 and 1440 minutes' : null
        }
    })

    useEffect(() => {
        if (opened) {
            if (editingSource) {
                form.setValues({
                    name: editingSource.name,
                    url: editingSource.url,
                    isEnabled: editingSource.isEnabled,
                    fetchIntervalMinutes: editingSource.fetchIntervalMinutes,
                    configProfileInboundUuid: editingSource.configProfileInboundUuid,
                    importGroup: editingSource.importGroup ?? null,
                    fetchHeaders: recordToRows(editingSource.fetchHeaders)
                })
            } else {
                form.reset()
            }
        }
    }, [opened, editingSource])

    const { mutate: createSource, isPending: isCreating } = useCreateSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
                onClose()
            }
        }
    })

    const { mutate: updateSource, isPending: isUpdating } = useUpdateSubscriptionImportSource({
        mutationFns: {
            onSuccess: () => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.subscriptionImportSources.getAll.queryKey
                })
                onClose()
            }
        }
    })

    const handleSubmit = (values: FormValues) => {
        const fetchHeaders = rowsToRecord(values.fetchHeaders)
        const importGroup = values.importGroup?.trim() || null
        if (isEdit && editingSource) {
            updateSource({
                route: { uuid: editingSource.uuid },
                variables: { ...values, importGroup, fetchHeaders }
            })
        } else {
            createSource({ variables: { ...values, importGroup, fetchHeaders } })
        }
    }

    return (
        <Drawer
            onClose={onClose}
            opened={opened}
            position="right"
            size="md"
            title={
                <Text fw={600} size="lg">
                    {isEdit ? 'Edit Import Source' : 'Add Import Source'}
                </Text>
            }
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Name"
                        placeholder="My VPN Subscription"
                        required
                        {...form.getInputProps('name')}
                    />

                    <TextInput
                        label="Subscription URL"
                        placeholder="https://example.com/sub?token=..."
                        required
                        {...form.getInputProps('url')}
                    />

                    <NumberInput
                        description="How often to fetch this subscription (5–1440 minutes)"
                        label="Fetch Interval (minutes)"
                        max={1440}
                        min={5}
                        required
                        {...form.getInputProps('fetchIntervalMinutes')}
                    />

                    <Select
                        clearable
                        data={inboundOptions}
                        description="Imported hosts will be linked to this config profile inbound"
                        label="Target Config Profile Inbound"
                        placeholder="Select inbound..."
                        {...form.getInputProps('configProfileInboundUuid')}
                    />

                    <TextInput
                        label="Import Group"
                        description="Sources sharing the same group tag compete — only one is picked at random per request. Leave empty to always include this source."
                        placeholder="e.g. provider-a"
                        {...form.getInputProps('importGroup')}
                        value={form.values.importGroup ?? ''}
                        onChange={(e) =>
                            form.setFieldValue('importGroup', e.currentTarget.value || null)
                        }
                    />

                    <Switch
                        label="Enabled"
                        description="When enabled, configs will be fetched on schedule"
                        {...form.getInputProps('isEnabled', { type: 'checkbox' })}
                    />

                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" fw={500}>
                                Request Headers
                            </Text>
                            <Button
                                size="compact-xs"
                                variant="light"
                                onClick={() =>
                                    form.insertListItem('fetchHeaders', { key: '', value: '' })
                                }
                            >
                                + Add header
                            </Button>
                        </Group>
                        {form.values.fetchHeaders.length === 0 && (
                            <Text size="xs" c="dimmed">
                                No custom headers. Headers like User-Agent or hwid will be sent here.
                            </Text>
                        )}
                        {form.values.fetchHeaders.map((_, i) => (
                            <Group key={i} gap="xs" align="flex-start">
                                <TextInput
                                    placeholder="Header name"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps(`fetchHeaders.${i}.key`)}
                                />
                                <TextInput
                                    placeholder="Value"
                                    style={{ flex: 1 }}
                                    {...form.getInputProps(`fetchHeaders.${i}.value`)}
                                />
                                <ActionIcon
                                    color="red"
                                    variant="subtle"
                                    mt={4}
                                    onClick={() => form.removeListItem('fetchHeaders', i)}
                                >
                                    ×
                                </ActionIcon>
                            </Group>
                        ))}
                    </Stack>

                    <Group justify="flex-end" mt="sm">
                        <Button onClick={onClose} variant="subtle">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            loading={isCreating || isUpdating}
                            type="submit"
                        >
                            {isEdit ? t('common.save') : t('common.create')}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    )
}
