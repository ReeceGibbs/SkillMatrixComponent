//our Category interface that we will implement with our Categories request to the SkillsMatrix endpoint
export interface ICategory {

    //properties of the ICategory interface
    name: string;
    children?: Array<ICategory>;
    id: number;
}