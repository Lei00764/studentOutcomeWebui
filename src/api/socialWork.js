import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: '/api/social/insertsocial',
        method: 'post',
        params
    })
}

const getRecord = () => {
    return request({
        url: '/api/social/selectStuRecord',
        method: 'get',            
    });
};


const deleteRecord = (params) => {
    return request({
        url: '/api/Social/deleteStuRecord',
        method: 'post',
        params
    })
}

const chanegRecord = (params) => {
    return request({
        url: '/api/social/changesocial',
        method: 'post',
        params
    })
}
export default {
    submitCreate,
    getRecord,
    deleteRecord,
    chanegRecord
}