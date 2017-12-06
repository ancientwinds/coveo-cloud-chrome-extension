declare let chrome: any;
declare let Coveo: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { Configuration } from '../options/Configuration';

export class Popup extends BasicComponent {
    private _hostedSearchPage: string = null;
    private _defaultEndpoint = null;

    constructor() {
        super ('Popup');
    }

    private renderNotLoggedIn(parent: string): void {
        super.render(parent, `
            Your are not logged in. To login, right click on the extension's icon, then on "Options".
        `);
    }

    private renderSearchPage(parent: string): void {
        super.render(parent, `
            <div id="search" class="CoveoSearchInterface" data-enable-history="true" data-design="new">
            
            <div class="CoveoAnalytics"></div>
            <div class="coveo-search-section">
                <div class="CoveoSettings"></div>
                <div class="CoveoSearchbox" data-enable-omnibox="true"></div>
            </div>
            <div class="coveo-main-section">
                <div class="coveo-facet-column">
                    <div class="CoveoFacet" data-title="Type" data-field="@objecttype" data-tab="All"></div>
            <div class="CoveoFacet" data-title="FileType" data-field="@filetype" data-tab="All"></div>
            <div class="CoveoFacet" data-title="Author" data-field="@author" data-tab="All"></div>
            <div class="CoveoFacet" data-title="Year" data-field="@year" data-tab="All"></div>
            <div class="CoveoFacet" data-title="Month" data-field="@month" data-tab="All"></div>
                </div>
                <div class="coveo-results-column">
                    <div class="CoveoShareQuery"></div>
                    <div class="CoveoPreferencesPanel">
                        <div class="CoveoResultsPreferences"></div>
                        <div class="CoveoResultsFiltersPreferences"></div>
                    </div>
                    <div class="CoveoTriggers"></div>
                    <div class="CoveoBreadcrumb"></div>
                    <div class="CoveoSearchAlerts"></div>
                    <div class="coveo-results-header">
                        <div class="coveo-summary-section">
                            <span class="CoveoQuerySummary"></span>
                            <span class="CoveoQueryDuration"></span>
                        </div>
                        <div class="coveo-result-layout-section">
                            <span class="CoveoResultLayout"></span>
                        </div>
                        <div class="coveo-sort-section">
                            <span class="CoveoSort" data-sort-criteria="relevancy" data-caption="Relevance"></span>
            <span class="CoveoSort" data-sort-criteria="date descending,date ascending" data-caption="Date"></span>
                        </div>
                    </div>
                    <div class="CoveoHiddenQuery"></div>
                    <div class="CoveoDidYouMean"></div>
                    <div class="CoveoErrorReport" data-pop-up="false"></div>
                    <div class="CoveoResultList" data-layout="list" data-wait-animation="fade" data-auto-select-fields-to-include="true">
                        <script id="Default" class="result-template" type="text/html" data-layout="list" ><div class="coveo-result-frame">
                <div class="coveo-result-row">
                <div class="coveo-result-cell" style="width:85px;text-align:center;padding-top:7px;">
                    <span class="CoveoIcon">
                    </span>
                    <div class="CoveoQuickview">
                    </div>
                </div>
                <div class="coveo-result-cell" style="padding-left:15px;">
                    <div class="coveo-result-row">
                    <div class="coveo-result-cell" style="font-size:18px;">
                        <a class="CoveoResultLink">
                        </a>
                    </div>
                    <div class="coveo-result-cell" style="width:120px; text-align:right; font-size:12px">
                        <span class="CoveoFieldValue" data-field="@date" data-helper="date">
                        </span>
                    </div>
                    </div>
                    <div class="coveo-result-row">
                    <div class="coveo-result-cell">
                        <span class="CoveoExcerpt">
                        </span>
                    </div>
                    </div>
                </div>
                </div>
                <div class="coveo-result-row">
                <div class="coveo-result-cell" style="width:85px;text-align:center">
                </div>
                <div class="coveo-result-cell" style="font-size:13px;padding-left: 15px;">
                    <table class="CoveoFieldTable">
                    <tbody>
                        <tr data-field="@author" data-caption="Author">
                        </tr>
                        <tr data-field="@source" data-caption="Source">
                        </tr>
                        <tr data-field="@language" data-caption="Language">
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            </script>
                    </div>
                    <div class="CoveoPager"></div>
                    <div class="CoveoLogo"></div>
                    <div class="CoveoResultsPerPage"></div>
                </div>
                
            </div>
            </div>
        `);

        Coveo.init(document.querySelector('#search'));
    }

    public render(parent: string): void {
        let context: Popup = this;
        let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
            function (message: any) {
                context._defaultEndpoint = Coveo.SearchEndpoint.endpoints["default"] = new Coveo.SearchEndpoint({
                    restUri: `${Configuration.PLATFORM_URL}/rest/search`,
                    accessToken: message.userToken,
                    queryStringArguments: {
                        organizationId: message.organizationId
                    }
                });

                Coveo.Analytics.options.endpoint.defaultValue = Configuration.ANALYTICS_URL;
                Coveo.Analytics.options.organization.defaultValue = message.organizationId;

                if (message.organizationId) {
                    location.hash = `q=${message.activeQuery}`;
                    context.renderSearchPage(parent);
                } else {
                    context.renderNotLoggedIn(parent);
                }
            }
        );
    }
}
