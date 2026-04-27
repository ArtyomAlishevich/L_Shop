import { IDelivery } from '../src/types/iDelivery';
import deliveriesData from './deliveries.json';
import fs from 'fs/promises';
import path from 'path';
import uuid from 'uuid';

interface DeliveriesData {
    deliveries: IDelivery[];
}

const typedDeliveriesData = deliveriesData as DeliveriesData;

export class DeliveryDatabase {
    static async create(delivery: IDelivery): Promise<IDelivery> {
        try {
            typedDeliveriesData.deliveries.push(delivery);
            await fs.writeFile(
                path.join(__dirname, 'deliveries.json'),
                JSON.stringify(typedDeliveriesData, null, 2)
            );
            return delivery;
        } catch (error) {
            throw error;
        }
    }

    static getByUserId(userId: string): IDelivery[] {
        try {
            return typedDeliveriesData.deliveries.filter((d: IDelivery) => d.userId === userId);
        } catch (error) {
            throw error;
        }
    }

    static async getById(id: string): Promise<IDelivery | undefined> {
        try {
            return typedDeliveriesData.deliveries.find(d => d.id === id);
        } catch (error) {
            throw error;
        }
    }
}