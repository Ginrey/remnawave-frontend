import { useGetSubscriptionImportSources } from '@shared/api/hooks'
import { LoadingScreen } from '@shared/ui/loading-screen'

import { SubscriptionImportSourcesPageComponent } from '../components/subscription-import-sources.page.component'

export function SubscriptionImportSourcesPageConnector() {
    const { data, isLoading } = useGetSubscriptionImportSources()

    if (isLoading || !data) {
        return <LoadingScreen />
    }

    return (
        <SubscriptionImportSourcesPageComponent
            importSources={data.importSources}
        />
    )
}
