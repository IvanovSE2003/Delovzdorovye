interface ParentData {
    userId: number;
    userName: string;
    userSurname: string;
    userPatronymic?: string;
}

export interface IBasicData extends ParentData {
    id: number;
    field_name: string;
    new_value: string;
    old_value: string;
}

export interface IProfData extends ParentData {
    id: number;
    new_diploma: string,
    new_license: string,
    new_experience_years: number,
    new_specialization: string,
    comment: string | null,
    type: "ADD" | "DELETE",
}