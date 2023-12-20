import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/paper/insertPapers',
        method: 'post',
        params
    })
}

const getRecord = (params) => {
    return request({
        url: '/api/paper/selectStuRecord',
        method: 'get',
        params
    })
}

const deleteRecord = (params) => {
    return request({
        url: '/api/paper/deleteStuRecord',
        method: 'post',
        params
    })
}

export default {
    submitCreate,
    getRecord,
    deleteRecord
}