import { Dictionary } from '../commons/collections/Dictionary';
import { BasicComponent } from '../components/BasicComponent';

export class ComponentStore {
    private static _instance: ComponentStore = new ComponentStore();
    private static _components: Dictionary<BasicComponent> = new Dictionary<BasicComponent>();

    public static registerComponent(component: BasicComponent): void {
        ComponentStore._components.Add(
            component.getComponentId(),
            component
        );

        // console.log(`Component ${component.getComponentId()} of type ${component.getClassName()} successfully registered.`);
    }

    public static unregisterComponent(component: BasicComponent): void {
        ComponentStore._components.Remove(
            component.getComponentId()
        );
        // console.log(`Component ${component.getComponentId()} of type ${component.getClassName()} successfully UNregistered.`);
    }

    public static getComponents(): Dictionary<BasicComponent> {
        return ComponentStore._components;
    }

    public static execute(componentId: string, functionToCall: string, args: string): void {
        if (ComponentStore._components.ContainsKey(componentId)) {
            if (ComponentStore._components.Item(componentId)[functionToCall]) {
                ComponentStore._components.Item(componentId)[functionToCall](JSON.parse(atob(args)));
            } else {
                // console.log(`Function ${functionToCall} was not found in the component ${componentId}.`);
            }
        } else {
            // console.log(`Component ${componentId} was not found in the component store.`);
        }
    }
}