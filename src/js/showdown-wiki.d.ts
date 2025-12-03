export declare function wiki(): ({
    type: string;
    regex: RegExp;
    replace: (match: any, filename: any, width: any, caption: any) => string;
} | {
    type: string;
    regex: RegExp;
    replace: (match: any, content: any) => any;
})[];
export type WikiExtension = ReturnType<typeof wiki>;
