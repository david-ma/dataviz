/// <reference types="showdown" />
declare const sd: showdown.Converter;
type Issue = {
    number: number;
    title: string;
    body: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    closed_at: string;
    state: string;
};
type Commit = {
    author: string;
    date: string;
    description: string;
    hash: string;
    issue: string;
};
declare var allIssues: {
    [key: string]: Issue;
};
