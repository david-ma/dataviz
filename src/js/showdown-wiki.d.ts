export declare function wiki(): {
    type: string;
    regex: RegExp;
    replace: (match: any, templateName: any, params: any) => any;
}[];
export type WikiExtension = ReturnType<typeof wiki>;
