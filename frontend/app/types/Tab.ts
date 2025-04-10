export interface Tab {
    name: string;
    component: Component
    getProps?: (data: any) => Record<string, any>
}