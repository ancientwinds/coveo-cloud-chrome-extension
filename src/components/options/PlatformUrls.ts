export module PlatformUrls {
    export function getPlatformUrl(environment: string): string {
        switch (environment.toLowerCase()) {
            case "production":
                return 'https://platform.cloud.coveo.com';
            case "qa":
                return 'https://platformqa.cloud.coveo.com';
            case "hipaa":
                return 'https://platformhipaa.cloud.coveo.com';
            default:
                return 'https://platform.cloud.coveo.com';
        }
    }

    export function getAnalyticsUrl(environment: string): string {
        switch (environment.toLowerCase()) {
            case "production":
                return 'https://usageanalytics.coveo.com';
            case "qa":
                return 'https://usageanalyticsstaging.coveo.com';
            case "hipaa":
                return 'https://usageanalyticshipaa.cloud.coveo.com';
            default:
                return 'https://usageanalytics.coveo.com';
        }
    }
}