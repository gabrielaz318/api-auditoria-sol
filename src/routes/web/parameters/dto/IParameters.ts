interface IGetDepartment {
    department: string;
}

interface IDeleteDepartment {
    id: number;
}

interface IPatchDepartmentActivate {
    id: number;
}

interface IPatchDepartment {
    id: number;
    department: string;
}

export { 
    IGetDepartment,
    IDeleteDepartment,
    IPatchDepartmentActivate,
    IPatchDepartment
}