interface IUserModel {
    email: string;
    id: number;
    isActivated: Boolean;
}

export default class UserDto {
    email: string;
    id: number;
    isActivated: Boolean;

    constructor(model : IUserModel) {
        this.email = model.email;
        this.id = model.id;
        this.isActivated = model.isActivated
    }
}