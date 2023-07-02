interface IGetRecords {
    createdAt: string;
    department: number;

    useCreatedAt: string;
    useDepartment: string;
}

interface IPostRecords {
    department: number;
    creator: number;
    created_at: string;
}

interface IPatchRecords {
    id: number;
    checklist: string;
}

interface IDeleteRecords {
    id: number;
}

export { IGetRecords, IPostRecords, IPatchRecords, IDeleteRecords }