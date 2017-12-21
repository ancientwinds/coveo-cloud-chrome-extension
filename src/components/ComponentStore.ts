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
    }

    public static unregisterComponent(component: BasicComponent): void {
        ComponentStore._components.Remove(
            component.getComponentId()
        );
    }

    public static getComponents(): Dictionary<BasicComponent> {
        return ComponentStore._components;
    }

    public static execute(componentId: string, functionToCall: string, args: string): void {
        if (ComponentStore._components.ContainsKey(componentId)) {
            if (ComponentStore._components.Item(componentId)[functionToCall]) {
                ComponentStore._components.Item(componentId)[functionToCall](JSON.parse(atob(args)));
            }
        }
    }
}