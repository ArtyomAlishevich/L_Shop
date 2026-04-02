import fs from 'fs/promises';
import path from 'path';
import recommendationsData from './recommendations.json';
import { IUserRecommendations, IUserCategory } from '../src/types/iUserCategory';

interface RecommendationsData {
    usersCategories: IUserRecommendations[];
}

const typedData = recommendationsData as RecommendationsData;

export class RecommendationsDatabase {
    static getUserData(userId: string): IUserRecommendations | undefined {
        return typedData.usersCategories.find(u => u.userId === userId);
    }

    static getUserCategories(userId: string): IUserCategory[] | undefined {
        return this.getUserData(userId)?.categories;
    }

    static getUserLikedGames(userId: string): string[] | undefined {
        return this.getUserData(userId)?.likedGames;
    }

    static async updateUserData(userId: string, likedGames: string[], categories: IUserCategory[]): Promise<void> {
        const index = typedData.usersCategories.findIndex(u => u.userId === userId);
        if (index !== -1) {
            typedData.usersCategories[index].likedGames = likedGames;
            typedData.usersCategories[index].categories = categories;
        } else {
            typedData.usersCategories.push({ userId, likedGames, categories });
        }
        await fs.writeFile(
            path.join(__dirname, 'recommendations.json'),
            JSON.stringify(typedData, null, 2)
        );
    }
}