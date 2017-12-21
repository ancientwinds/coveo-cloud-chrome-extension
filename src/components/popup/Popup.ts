declare let chrome: any;
declare let Coveo: any;

import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';
import { PlatformUrls } from '../options/PlatformUrls';

export class Popup extends BasicComponent {
    private _hostedSearchPage: string = null;
    private _defaultEndpoint = null;

    constructor() {
        super ('Popup');
    }

    private renderNotLoggedIn(parent: string): void {
        super.remove();
        super.render(parent, `
            Your are not logged in. <a id="optionPageLink" href="#">Click here to login</a>. NOTE: The extension option page will open in a new tab.
        `);

        document.getElementById('optionPageLink').addEventListener('click', function () {
            let extensionId: string;

            try {
                extensionId = location.href.match('(?<=://)(.*)(?=/html/popup.html)')[0];
            } catch (e) {
                extensionId = 'egcobhndnfihpdffpfmmebdojcbnfpee';
            }


            chrome.tabs.create({'url': `chrome://extensions/?options=${extensionId}` } )
        })
    }

    private renderSearchPage(parent: string): void {
        super.render(parent, `
            <div class="CoveoChromeExtension">
                <div id="search" class="CoveoSearchInterface" data-enable-history="true" data-design="new">
                <div class="CoveoChromeExtensionHeader">
                    <div class="CoveoAnalytics"></div>
                    <div class="coveo-search-section">
                        <div class="CoveoSearchbox" data-enable-omnibox="true"></div>
                    </div>
                    <div class="coveo-summary-section">
                        <span class="CoveoQuerySummary"></span>
                        <span class="CoveoQueryDuration"></span>
                    </div>
                    <div class="coveo-facet-column">
                        <div class="CoveoFacetLeft">
                            <div class="CoveoFacet" data-number-of-values="3" data-title="Year" data-field="@year" data-tab="All"></div>
                            <div class="CoveoFacet" data-number-of-values="3" data-title="Month" data-field="@month" data-tab="All"></div>
                        </div>
                        <div class="CoveoFacetRight">
                            <div class="CoveoFacet" data-number-of-values="3" data-title="FileType" data-field="@filetype" data-tab="All"></div>
                            <div class="CoveoFacet" data-number-of-values="3" data-title="Author" data-field="@author" data-tab="All"></div>
                        </div>
                    </div>
                    <div class="coveo-results-header">
                        <div class="coveo-sort-section">
                            <span class="CoveoSort" data-sort-criteria="relevancy" data-caption="Relevance"></span>
                            <span class="CoveoSort" data-sort-criteria="date descending,date ascending" data-caption="Date"></span>
                        </div>
                    </div>
                </div>
                <div id="coveo-main-section" class="coveo-main-section">
                    <div class="coveo-results-column">
                        <div class="CoveoTriggers"></div>
                        <div class="CoveoHiddenQuery"></div>
                        <div class="CoveoDidYouMean"></div>
                        <div class="CoveoErrorReport" data-pop-up="false"></div>
                        <div class="CoveoResultList" data-layout="list" data-enable-infinite-scroll="true" data-infinite-scroll-container-selector='#coveo-main-section' data-wait-animation="fade" data-auto-select-fields-to-include="true">
                            <script id="Default" class="result-template" type="text/html" data-layout="list">

                                <div class="coveo-result-frame">
                                    <div class="coveo-result-row">
                                    <div class="coveo-result-cell" style="width:40px;text-align:center;">
                                        <span class="CoveoIcon"></span>
                                    </div>
                                    <div class="coveo-result-cell" style="padding-left:15px;">
                                        <div class="coveo-result-row">
                                            <div class="coveo-result-cell" style="font-size:18px;">
                                                <a class="CoveoResultLink" target="_blank"></a>
                                            </div>
                                        </div>
                                        <div class="coveo-result-row">
                                            <div class="coveo-result-cell" style="width:120px; text-align:left; font-size:12px">
                                                <span class="CoveoFieldValue" data-field="@date" data-helper="date"></span>
                                                &nbsp;
                                                <span class="CoveoFieldValue" data-field="@author"></span>
                                            </div>
                                        </div>
                                        <div class="coveo-result-row">
                                        <div class="coveo-result-cell">
                                            <span class="CoveoExcerpt"></span>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </script>
                        </div>
                    </div>
                </div>
                </div>
        `);

        Coveo.init(document.querySelector('#search'));
    }

    public render(parent: string): void {
        let context: Popup = this;
        let userIsLoggedIn = chrome.runtime.sendMessage(
            {
                command: 'isUserLoggedIn'
            },
            function (userIsLoggedInMessage: any) {
                if (userIsLoggedInMessage.userIsLoggedIn) {
                    let message = chrome.runtime.sendMessage({command: 'getActiveQueryAndOptions'},
                        function (message: any) {
                            if (message.organizationId) {
                                context._defaultEndpoint = Coveo.SearchEndpoint.endpoints["default"] = new Coveo.SearchEndpoint({
                                    restUri: `${PlatformUrls.getPlatformUrl(message.environment)}/rest/search`,
                                    accessToken: message.userToken,
                                    queryStringArguments: {
                                        organizationId: message.organizationId
                                    }
                                });

                                Coveo.Analytics.options.endpoint.defaultValue = PlatformUrls.getAnalyticsUrl(message.environment);
                                Coveo.Analytics.options.organization.defaultValue = message.organizationId;

                                location.hash = `q=${message.activeQuery}`;
                                context.renderSearchPage(parent);
                            } else {
                                context.renderNotLoggedIn(parent);
                            }
                        }
                    );
                } else {
                    context.renderNotLoggedIn(parent);
                }
            }
        );
    }
}
