import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'L_Shop API',
      version: '1.0.0',
      description: 'API для интернет-магазина настольных игр',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Локальный сервер',
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'shop.session',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000' 
            },
            name: { 
              type: 'string', 
              example: 'Иван Петров' 
            },
            login: { 
              type: 'string', 
              example: 'ivan123' 
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-01T12:00:00Z'
            },
          },
        },
        Basket: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            userId: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            count: { 
              type: 'integer',
              example: 3 
            },
            sum: { 
              type: 'integer',
              example: 5999 
            },
            boardGames: {
              type: 'array',
              items: { $ref: '#/components/schemas/BasketBoardGame' },
            },
          },
          required: ['id', 'userId', 'count', 'sum', 'boardGames']
        },
        BasketBoardGame: {
          type: 'object',
          properties: {
            boardGameId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            count: { 
              type: 'integer',
              example: 2 
            },
            sum: { 
              type: 'integer',
              example: 3998 
            },
          },
          required: ['boardGameId', 'count', 'sum']
        },
        BoardGame: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            name: { 
              type: 'string',
              example: 'Монополия' 
            },
            description: { 
              type: 'string',
              example: 'Классическая экономическая игра' 
            },
            categories: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['экономическая', 'стратегия']
            },
            minPlayers: { 
              type: 'integer',
              example: 2 
            },
            maxPlayers: { 
              type: 'integer',
              example: 6 
            },
            isAvailable: { 
              type: 'boolean',
              example: true 
            },
            price: { 
              type: 'integer',
              example: 1999 
            },
            amount: { 
              type: 'integer',
              example: 10 
            },
            images: {
              type: 'object',
              properties: {
                preview: { 
                  type: 'string',
                  example: '/images/monopoly-preview.jpg' 
                },
                gallery: { 
                  type: 'array', 
                  items: { type: 'string' },
                  example: ['/images/monopoly-1.jpg', '/images/monopoly-2.jpg']
                },
              },
            },
            delivery: {
              type: 'object',
              properties: {
                startCountry: { 
                  type: 'string',
                  example: 'Россия' 
                },
                startTown: { 
                  type: 'string',
                  example: 'Москва' 
                },
                startStreet: { 
                  type: 'string',
                  example: 'Складская' 
                },
                startHouseNumber: { 
                  type: 'string',
                  example: '10' 
                },
                closestDate: { 
                  type: 'string',
                  format: 'date',
                  example: '2024-02-01' 
                },
                price: { 
                  type: 'integer',
                  example: 300 
                },
              },
            },
            discount: { 
              type: 'integer',
              example: 10,
              nullable: true
            },
          },
          required: ['id', 'name', 'description', 'categories', 'minPlayers', 'maxPlayers', 'isAvailable', 'price', 'amount', 'images']
        },
        Delivery: {
          type: 'object',
          properties: {
            id: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            userId: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            contact: {
              type: 'object',
              properties: {
                phone: { 
                  type: 'string',
                  example: '+71234567890' 
                },
                email: { 
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com' 
                },
              },
              required: ['phone', 'email']
            },
            address: {
              type: 'object',
              properties: {
                country: { 
                  type: 'string',
                  example: 'Россия' 
                },
                city: { 
                  type: 'string',
                  example: 'Москва' 
                },
                street: { 
                  type: 'string',
                  example: 'Ленина' 
                },
                house: { 
                  type: 'string',
                  example: '10' 
                },
                apartment: { 
                  type: 'string',
                  example: '15',
                  nullable: true
                },
              },
              required: ['country', 'city', 'street', 'house']
            },
            paymentMethod: { 
              type: 'string',
              enum: ['card', 'cash'],
              example: 'card' 
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/DeliveryItem' },
            },
            totalCount: { 
              type: 'integer',
              example: 3 
            },
            totalSum: { 
              type: 'integer',
              example: 5999 
            },
            totalDeliverySum: { 
              type: 'integer',
              example: 300 
            },
            totalOrderSum: { 
              type: 'integer',
              example: 6299 
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              example: '2024-01-01T12:00:00Z' 
            },
            status: { 
              type: 'string',
              enum: ['created', 'paid', 'shipped', 'delivered', 'cancelled'],
              example: 'created' 
            },
          },
          required: ['id', 'userId', 'contact', 'address', 'paymentMethod', 'items', 'totalCount', 'totalSum', 'totalDeliverySum', 'totalOrderSum', 'createdAt', 'status']
        },
        DeliveryItem: {
          type: 'object',
          properties: {
            boardGameId: { 
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            count: { 
              type: 'integer',
              example: 2 
            },
            price: { 
              type: 'integer',
              example: 1999 
            },
            delivery: {
              type: 'object',
              properties: {
                startCountry: { 
                  type: 'string',
                  example: 'Россия' 
                },
                startTown: { 
                  type: 'string',
                  example: 'Москва' 
                },
                startStreet: { 
                  type: 'string',
                  example: 'Складская' 
                },
                startHouseNumber: { 
                  type: 'string',
                  example: '10' 
                },
                closestDate: { 
                  type: 'string',
                  format: 'date',
                  example: '2024-02-01' 
                },
                price: { 
                  type: 'integer',
                  example: 300 
                },
              },
              required: ['startCountry', 'startTown', 'startStreet', 'startHouseNumber', 'closestDate', 'price']
            },
          },
          required: ['boardGameId', 'count', 'price', 'delivery']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { 
              type: 'string',
              example: 'Описание ошибки' 
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../services/*.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);