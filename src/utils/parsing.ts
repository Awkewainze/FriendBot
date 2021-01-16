export class SimpleTransformer<T> {
    private constructor(private readonly transformer = new Map<string, T>(), private readonly ignoreCase = false) {}
    static create<T>(): SimpleTransformer<T> {
        return new SimpleTransformer<T>();
    }
    setTransform(from: string, to: T): SimpleTransformer<T> {
        if (this.ignoreCase) from = from.toLowerCase();
        const newMap = new Map<string, T>(this.transformer);
        return new SimpleTransformer(newMap.set(from, to), this.ignoreCase);
    }
    ignoringCase(): SimpleTransformer<T> {
        if (this.ignoreCase) return this;
        const newMap = new Map<string, T>();
        for (const key in this.transformer) {
            newMap.set(key.toLowerCase(), this.transformer.get(key));
        }
        return new SimpleTransformer(newMap, true);
    }
    transform(value: string): T {
        if (this.ignoreCase) value = value.toLowerCase();
        return this.transformer.get(value);
    }
}
