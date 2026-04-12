import { Button, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { TbCloudDownload, TbRefresh } from 'react-icons/tb'
import { useState } from 'react'
import { motion } from 'motion/react'

import { SubscriptionImportSourcesTableWidget } from '@widgets/dashboard/subscription-import-sources/subscription-import-sources-table/subscription-import-sources-table.widget'
import { SubscriptionImportSourceDrawerWidget } from '@widgets/dashboard/subscription-import-sources/subscription-import-source-drawer/subscription-import-source-drawer.widget'
import { PageHeaderShared } from '@shared/ui/page-header/page-header.shared'
import { Page } from '@shared/ui/page'

import { TSubscriptionImportSource } from '@shared/api/contract/subscription-import-sources.contract'
import { IProps } from './interfaces'

export const SubscriptionImportSourcesPageComponent = (props: IProps) => {
    const { importSources } = props

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
    const [editingSource, setEditingSource] = useState<TSubscriptionImportSource | null>(null)
    const [refreshAllTrigger, setRefreshAllTrigger] = useState(0)

    const handleEdit = (source: TSubscriptionImportSource) => {
        setEditingSource(source)
        openDrawer()
    }

    const handleCreate = () => {
        setEditingSource(null)
        openDrawer()
    }

    const handleClose = () => {
        closeDrawer()
        setEditingSource(null)
    }

    return (
        <Page title="Import Sources">
            <PageHeaderShared
                actions={
                    <Group gap="sm">
                        <Button
                            leftSection={<TbRefresh size={16} />}
                            onClick={() => setRefreshAllTrigger((current) => current + 1)}
                            variant="light"
                        >
                            Refresh All
                        </Button>
                        <Button leftSection={<TbCloudDownload size={16} />} onClick={handleCreate}>
                            Add Import Source
                        </Button>
                    </Group>
                }
                icon={<TbCloudDownload size={24} />}
                title="Import Sources"
            />

            <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <SubscriptionImportSourcesTableWidget
                    importSources={importSources}
                    onEdit={handleEdit}
                    refreshAllTrigger={refreshAllTrigger}
                />
            </motion.div>

            <SubscriptionImportSourceDrawerWidget
                editingSource={editingSource}
                onClose={handleClose}
                opened={drawerOpened}
            />
        </Page>
    )
}
