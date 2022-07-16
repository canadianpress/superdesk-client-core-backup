import {IBaseRestApiResponse, IUser} from 'superdesk-api';

export interface IShowBase {
    name: string;
    description: string;
    planned_duration: number | null;
}

export type IShow = IShowBase & IBaseRestApiResponse;

export interface IRundownTemplateBase {
    name: string;
    planned_duration: number; // seconds
    airtime_time: string; // ISO 8601 time
    airtime_date: string; // ISO 8601 date without timezone
    headline_template: {
        prefix: string;
        separator: string;
        date_format: string;
    };
    created_by: IUser['_id'];
    updated_by: IUser['_id']; // TODO: rename to last_updated_by
    rundown_items: Array<IRundownItemBase>;
}

export type IRundownTemplate = IRundownTemplateBase & IBaseRestApiResponse;

export interface IRundownItemBase {
    title: string;
    start_time: string;
    end_time: string;
    item_type: string;
    show_part: string;
    additional_notes: string;
    live_captions: string;
    duration: number;
    planned_duration: number;
}

export type IRundownItem = IRundownItemBase & IBaseRestApiResponse;

/**
 * Extending from "IBaseRestApiResponse" is for compatibility reasons.
 * Rundown item template will never be stored as a separate database record.
 */
export interface IRundownItemTemplate extends IBaseRestApiResponse {
    data: IRundownItemBase;
}
