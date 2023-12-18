import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/Social/deleteStuRecord',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: '/api/social/selectStuRecord',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: '/api/social/insertVolunteers',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}