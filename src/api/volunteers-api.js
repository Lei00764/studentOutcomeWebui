import request from "@/utils/request"

export function submit_create(params){
    return request({
        url: 'Volunteers/insertVolunteers',
        method: 'put',
        params
    })
}

export function get_record(params){
    return request({
        url: 'Volunteers/selectStuRecord',
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