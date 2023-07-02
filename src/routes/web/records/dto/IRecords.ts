interface IGetRecords {
    id: number;
    user: number;
    endDate: string;
    startDate: string;
    department: number;
}

interface IGetRecord {
    id: number;
}

interface IPatchRecord {
    id: number;
    comment: string;
}

interface IPatchRecordStatus {
    id: number;
    status: number;
}

interface IPatchRecordChecklist {
    id: number;
    checklist: string;
}

interface IDeleteRecords {
    id: number;
}

export { IGetRecords, IGetRecord, IPatchRecord, IPatchRecordChecklist, IDeleteRecords, IPatchRecordStatus }