import request from "@/utils/request"

const submitCreate = (params) => {
    return request({
        url: 'http://127.0.0.1:4523/m1/3206870-0-default/api/Volunteers/selectStuRecord',
        method: 'post',
        params
    })
}

const getRecord = () => {
    console.log("到了打印部分")
    return request({
        url: '/api/volunteer/selectVolunteerInfo',
        method: 'get',            
    });
};


const deleteRecord = (params) => {
    return request({
        url: '/api/volunteer/deleteVolunteerInfo',
        method: 'post',
        params
    })
}

const chanegRecord = (params) => {
    return request({
        url: '/api/volunteer/changeVolunteerInfo',
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