type FolderAnalysis = {
    folderName: string;
    numberOfFiles: number;
    files: {
        [filetype: string]: number;
    };
    totalSize: number;
    oldestFile: {
        filename: string;
        timestamp: Date;
    } | null;
    newestFile: {
        filename: string;
        timestamp: Date;
    } | null;
};
declare function human_readable_size(size: number): string;
