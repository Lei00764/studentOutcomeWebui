import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: 'Volunteers/insertVolunteers',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: 'http://127.0.0.1:4523/m1/3206870-0-default/api/Volunteers/selectStuRecord?apifoxApiId=132024676',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: 'Volunteers/deleteRecord',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}