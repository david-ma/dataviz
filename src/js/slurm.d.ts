declare const jobs: {
    [key: string]: Job[];
};
type Job = {
    JobID: string;
    JobName: string;
    MaxRSS: string;
    UserCPU: string;
    CPUTime: string;
    AveCPU: string;
    Elapsed: string;
    State: string;
    ExitCode: string;
    Start: string;
    End: string;
};
declare const named_jobs: {};
type Contract = {
    'Primary Key': string;
    'Analysis Path': string;
    'Contract Id': string;
    Run: string;
    'Date Sent': string;
    'Data Sender': string;
    Purge: string;
    'Purge Approver': string;
    'Purge Notes': string;
    'Retention Notes': string;
    'Retention Notes Author': string;
    'Publish As Benchmarking Data': string;
    instrument_name: string;
    machine_model: string;
};
declare const contracts: {
    [key: string]: Contract;
};
declare function get_log_id(jobs: Job[]): any;
declare function log_id_from_contract(contract: Contract): string;
