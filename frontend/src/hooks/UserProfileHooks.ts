export const GetFormatDate = (date: string) => {
    return date?.split('-').reverse().join('.');
};

export const GetFormatPhone = (phone: string) => {
    return phone?.replace(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
};
