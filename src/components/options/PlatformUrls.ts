export module PlatformUrls {
    export function getPlatformUrl(environment: string): string {
        const PLATFORMS = {
            'production': 'https://platform.cloud.coveo.com',
            'qa': 'https://platformqa.cloud.coveo.com',
            'hipaa': 'https://platformhipaa.cloud.coveo.com'
        }

        return PLATFORMS[environment.toLowerCase()] || 'https://platform.cloud.coveo.com';
    }

    export function getAnalyticsUrl(environment: string): string {
        const ANALYTICS = {
            'production': 'https://usageanalytics.coveo.com',
            'qa': 'https://usageanalyticsstaging.coveo.com',
            'hipaa': 'https://usageanalyticshipaa.cloud.coveo.com'
        }

        return ANALYTICS[environment.toLowerCase()] || 'https://usageanalytics.coveo.com';
    }
}