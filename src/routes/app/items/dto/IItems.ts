interface IGetItems {
    recordId: number;
}

interface IPostItems {
    comment: string;
    picture: string;
    recordId: number;
    createdAt: string;
}

interface IPatchItem {
    comment: string;
    picture: string;
    itemId: number;
    createdAt: string;
}

interface IPatchPicture {
    id: number;
    picture: string;
}

interface IPatchComment {
    id: number;
    comment: string;
}

interface IDeleteItem {
    id: number;
    comment: string;
}

export { IGetItems, IDeleteItem, IPatchItem, IPatchComment, IPostItems, IPatchPicture }