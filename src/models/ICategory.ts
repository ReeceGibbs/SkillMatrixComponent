//our Category interface that we will implement with our Categories request to the SkillsMatrix endpoint
export interface ICategory {

    //properties of the ICategory interface
    name: string;
    children?: Array<ICategory>;
    id: number;
}

//the model for our category scores
export interface ICategoryScores {

    category_id: number;
    score: number;
}

export interface SkillDictionaryItem {

    id: number;
    name: string;
}