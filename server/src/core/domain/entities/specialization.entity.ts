export default class Specialization {
    constructor(
        public id: number,
        public name: string
    ) {}

    setName(name: string) {
        this.name = name;
        return this;
    }
}