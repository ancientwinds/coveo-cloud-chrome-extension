export class Dictionary<T> {
    private items: { [index: string]: T } = {};

    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number {
        return Object.keys(this.items).length
    }

    public Add(key: string, value: T): void {
        this.items[key] = value;
    }

    public Remove(key: string): T {
        let val = this.items[key];
        delete this.items[key];
        return val;
    }

    public Item(key: string): T {
        return this.items[key];
    }

    public Keys(): string[] {
        let keySet: Array<string> = [];

        for (let prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public Values(): Array<T> {
        let values: Array<T> = [];

        for (let prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }

        return values;
    }

    public Clone(): Dictionary<T> {
        return JSON.parse( JSON.stringify(this.items) );
    }

    public Clear(): void {
        this.items = {};
    }
}
