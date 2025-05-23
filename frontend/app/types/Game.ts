export interface Game {
    id: number;
    name: string;
    summary: string;
    cover: string;
    rating: number;
    involved_companies: Array<{
        id: number;
        company: {
            id: number;
            name: string;
        }
    }>
}