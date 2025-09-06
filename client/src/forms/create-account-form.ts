export type CreateAccountForm = {
    username: string;
    password: string;
    confirm: string;
    tos: boolean;
};

export const CREATE_ACCOUNT_FORM_DEFAULT: CreateAccountForm = {
    username: '',
    password: '',
    confirm: '',
    tos: false,
};
