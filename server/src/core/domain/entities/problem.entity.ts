export default class Problem {
    constructor(
        public id: number,
        public name: string
    ) {}

    setName(name: string) {
        this.name = name;
        return this;
    }
}