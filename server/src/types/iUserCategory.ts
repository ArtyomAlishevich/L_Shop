export interface IUserCategory {
    category: string;
    weight: number;
    lastUpdated: string;
}
export interface IUserRecommendations {
    userId: string;
    categories: IUserCategory[];
    likedGames: string[];  
}