import * as mongoose from 'mongoose'

export interface SsoContent extends mongoose.Document{
    "email": string;
    "firstname": string;
    "firstnameth": string;
    "gecos": string;
    "lastname": string;
    "lastnameth": string;
    "ouid": string;
    "roles": any;
    "uid": string;
    "username": string;
}