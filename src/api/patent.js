import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/patent/insertPatents',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: '/api/patent/selectStuRecord',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: '/api/patent/deleteStuRecord',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}