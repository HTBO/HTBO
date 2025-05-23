// // Store interface for individual store data
// export interface Store {
//     name: string;
//     logoUrl: string;
//     website: string;
//     createdAt: string;
//     updatedAt: string;
//     id: string;
//   }
  
//   // GameStore interface for the relationship between a game and a store
//   export interface GameStore {
//     storeId: Store;
//     link: string;
//   }
  
//   // Main Game model interface
//   export interface Game {
//     id: string;
//     name: string;
//     description: string;
//     shortDescription: string;
//     publisher: string;
//     releaseYear: number;
//     stores: GameStore[];
//     createdAt: string;
//     updatedAt: string;
//   }
  
//   // Optional helper function to create a new Game object with default values
//   export const createGame = (data: Partial<Game> = {}): Game => {
//     return {
//       id: data.id || '',
//       name: data.name || '',
//       description: data.description || '',
//       shortDescription: data.shortDescription || '',
//       publisher: data.publisher || '',
//       releaseYear: data.releaseYear || new Date().getFullYear(),
//       stores: data.stores || [],
//       createdAt: data.createdAt || new Date().toISOString(),
//       updatedAt: data.updatedAt || new Date().toISOString(),
//     };
//   };
  
//   // Optional helper to get image from first store (if needed)
//   export const getGamePrimaryImage = (game: Game): string => {
//     if (game.stores && game.stores.length > 0 && game.stores[0].storeId.logoUrl) {
//       return game.stores[0].storeId.logoUrl;
//     }
//     return ''; // Return a default image URL if needed
//   };
export interface Game {
  id: number
  cover: string
  involved_companies: InvolvedCompany[]
  name: string
  rating: number
  rating_count: number
  summary: string
}

export interface InvolvedCompany {
  id: number
  company: Company
}

export interface Company {
  id: number
  name: string
}