import { TSubscriptionImportSource } from '@shared/api/contract/subscription-import-sources.contract'

export interface IProps {
    opened: boolean
    editingSource: TSubscriptionImportSource | null
    onClose: () => void
}
