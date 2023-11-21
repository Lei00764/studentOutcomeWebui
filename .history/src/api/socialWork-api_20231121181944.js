import request from "@/utils/request"

export function submit_create(params){
    return request({
        url: 'Volunteers/insertVolunteers',
        method: 'post',
        params
    })
}

export function get_record(params){
    return request({
        url: 'http://127.0.0.1:4523/m2/3206870-0-default/118198285',
        method: 'get',
        params
    })
}

export function delete_record(params){
    return request({
        url: 'Volunteers/deleteRecord',
        method: 'post',
        params
    })
}