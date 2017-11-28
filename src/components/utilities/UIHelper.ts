import {  } from '../components/BasicComponent';
import { BasicComponent } from '../BasicComponent';
import { ComponentStore } from '../ComponentStore';

export class UIHelper extends BasicComponent {
    constructor() {
        super('UIHelper');
    }

    public render() {
        super.render('body', `
        <div id="${this._guid}">
            <script>
                function toggleDisplay(elementId) {
                    var element = document.getElementById(elementId);

                    if (element.style.display === 'none') {
                        element.style.display = 'block';
                    } else {
                        element.style.display = 'none';
                    }
                }
            </script>
        </div>
        `);
    }
}