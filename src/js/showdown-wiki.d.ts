declare const citations: any[];
declare const cite: {
    type: string;
    regex: RegExp;
    replace: (match: any, colWidth: any, content: any) => string;
}[];
declare function md5(str: any): "e/ed" | "1/1c";
declare function getFieldValue(fields: any, fieldName: any): any;
