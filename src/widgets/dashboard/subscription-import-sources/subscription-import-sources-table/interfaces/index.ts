import { TSubscriptionImportSource } from '@shared/api/contract/subscription-import-sources.contract'

export interface IProps {
    importSources: TSubscriptionImportSource[]
    onEdit: (source: TSubscriptionImportSource) => void
    refreshAllTrigger: number
}
