interface IPostResquestUsers {
    name: string;
    user: string;
    password: string;
    confirmPassword: string;
}

interface IPatchRequestUsers {
    id: number;
    name: string;
    user: string;
    status: number;
    password: string;
    confirmPassword: string;
}

interface IPatchRequestChangePassAuthenticated {
    password: string;
    confirmPassword: string;
}

export { IPostResquestUsers, IPatchRequestUsers, IPatchRequestChangePassAuthenticated }