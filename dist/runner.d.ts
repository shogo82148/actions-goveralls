interface Options {
    token: string;
    profile: string;
    parallel: boolean;
    parallel_finished: boolean;
    flag_name: string;
    working_directory: string;
    ignore: string;
    shallow: boolean;
}
export declare function goveralls(options: Options): Promise<void>;
export {};
