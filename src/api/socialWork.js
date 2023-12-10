import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: 'http://127.0.0.1:4523/m1/3206870-0-default/api/Social/deleteStuRecord',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: 'http://127.0.0.1:4523/m1/3206870-0-default/api/social/selectStuRecord',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: 'http://127.0.0.1:4523/m1/3206870-0-default/api/social/insertVolunteers',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}