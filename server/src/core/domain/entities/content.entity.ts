export default class Content {
    constructor(
        public id: number,
        public type: string,
        public text_content: string,
        public label?: string
    ) {}

    setType(type: string) {
        this.type = type;
        return type;
    }
}
