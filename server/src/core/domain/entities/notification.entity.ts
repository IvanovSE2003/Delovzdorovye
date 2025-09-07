export default class Notification {
    constructor(
        public id: number,
        public title: string,
        public message: string,
        public type: "INFO" | "WARNING" | "ERROR" | "CONSULTATION" | "PAYMENT",
        public isRead: boolean,
        public entity: object | null,
        public entityType: string | null,
        public userId?: number
    ) {}

    setType(type: "INFO" | "WARNING" | "ERROR" | "CONSULTATION" | "PAYMENT") {
        this.type = type;
        return this;
    }
}