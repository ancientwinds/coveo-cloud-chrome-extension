import * as chai from 'chai';

import { BasicComponent }  from '../components/BasicComponent';
import { ComponentStore }  from '../components/ComponentStore';

const expect = chai.expect;
const should = chai.should;
const assert = chai.assert;

describe('Components management', () => {
    let component: BasicComponent = null;

    it('should correctly create the component' , () => {
        component = new BasicComponent('Test');
        expect(component.getClassName()).to.equal('Test');
    });

    it('should correctly register the component' , () => {
        should().exist(ComponentStore.getComponents().Item(component.getComponentId()));
    });

    it('should correctly unregister the component' , () => {
        component.unregister();
        should().not.exist(ComponentStore.getComponents().Item(component.getComponentId()));
    });
});
