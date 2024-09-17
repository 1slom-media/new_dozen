export interface ICompetition {
    name: string;
    banner?: string;
    content: string;
    startTime: Date;
    endTime: Date;
    isEmpty?: boolean;
    status?: number;
}
