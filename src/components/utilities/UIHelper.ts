import {  } from '../components/BasicComponent';
import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';

export class UIHelper extends BasicComponent {
    constructor() {
        super('UIHelper');
    }

    public static getCleanFacetName(facet: string): string {
        let cleanFacetMappings: {} = {
            'author': 'AUTHOR',
            'filetype': 'FILE TYPE'
        };

        let cleanFacetName: string = facet;

        if (cleanFacetMappings[facet]) {
            cleanFacetName = cleanFacetMappings[facet];
        }

        return cleanFacetName;
    }

    public static toggleDisplay(elementId: string) {
        var element = document.getElementById(elementId);

        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }

    public static adjustStyleForGoogle(): void {
        // Adjust style for google... yeah... unclean but...
        let resultList: HTMLDivElement = (document.querySelector('.ResultList') as HTMLDivElement);
        resultList.style.fontFamily = `Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif`;
        resultList.style.color = 'black';

        let resultListResults: HTMLDivElement = (document.querySelector('.ResultListResults') as HTMLDivElement);
        resultListResults.style.paddingLeft = '10px';

        let searchBar: HTMLDivElement = (document.querySelector('.SearchBar') as HTMLDivElement);
        searchBar.style.margin = '20px 20px 10px 20px';
        searchBar.style.backgroundColor = '#F6F6F6';
        searchBar.style.height = '42px';

        let coveoSearchBox : HTMLInputElement = (document.querySelector('.SearchBar input') as HTMLInputElement);
        coveoSearchBox.style.backgroundColor = 'transparent';
        coveoSearchBox.maxLength = 128;
        coveoSearchBox.style.marginBottom = '5px';
        coveoSearchBox.style.paddingLeft = '40px';

        let clearButton: HTMLDivElement = (document.querySelector('.SearchBar div') as HTMLDivElement);
        clearButton.style.fontFamily = `Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif`;
        clearButton.style.fontSize = '40px';

        /*
        let magnifier: HTMLImageElement = (document.querySelector('.SearchBar img') as HTMLImageElement);
        magnifier.style.top = '12px';
        magnifier.style.left = '20px';
        */

        let resultListContainer: HTMLDivElement = (document.querySelector('.ResultListResultsContainer') as HTMLDivElement);
        resultListContainer.style.padding = '20px';

        let resultStats: HTMLDivElement = (document.querySelector('.ResultStats') as HTMLDivElement);
        resultStats.style.paddingLeft = '20px';
    }
}