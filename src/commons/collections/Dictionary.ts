export class Dictionary<T> {
    private items: { [index: string]: T } = {};

    private count: number = 0;

    public ContainsKey(key: string): boolean {
        return this.items.hasOwnProperty(key);
    }

    public Count(): number {
        return this.count;
    }

    public Add(key: string, value: T): void {
        if (!this.items.hasOwnProperty(key)) {
            this.count++;
        }

        this.items[key] = value;
    }

    public Remove(key: string): T {
        let val = this.items[key];
        delete this.items[key];
        this.count--;
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
        let clone: Dictionary<T> = new Dictionary<T>();
        let orgiginal = this;

        this.Keys().forEach(function (key: string) {
            clone.Add(key, orgiginal.Item(key));
        });

        return clone;
    }

    public Clear(): void {
        this.items = {};
        this.count = 0;
    }
}
