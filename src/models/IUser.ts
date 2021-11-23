import { ICategoryScores } from "./ICategory";

//our User interface that we will implement as a model to more strongly type the data we will retrieve from our API call to the SkillsMatrix endpoint
export interface IUser {
    
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    scores: Array<ICategoryScores>;    
}