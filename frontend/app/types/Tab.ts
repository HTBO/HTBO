export interface Tab {
    name: string;
    component: Component | null;
    getProps?: (data: any) => Record<string, any>
}