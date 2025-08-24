export default class Patient {
    constructor(
        public id: number,
        public isActivated: boolean,
        public userId?: number
    ) {}

    activate(): Patient {
        this.isActivated = true;
        return this;
    }
}