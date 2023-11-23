import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/Volunteers/insertVolunteers',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: '/api/Volunteers/selectStuRecord',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: '/api/Volunteers/deleteRecord',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}