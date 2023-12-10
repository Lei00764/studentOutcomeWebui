import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/Volunteers/selectStuRecord',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: '/api/Volunteers/selectStuRecord?apifoxApiId=118198285',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: '/api/Volunteers/deleteStuRecord',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}