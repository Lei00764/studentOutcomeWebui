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

const checkApi = {
    changeVerifyStatus: (socialworkId, statusId, checkMessage) => {
        return request.post("/api/socialwork/check/changeVerifyStatus", {
            socialwork_id: socialworkId,
            status: statusId,
            msg: checkMessage
        })
    },
    /**
     * @typedef {Object} QueryField
     * @property {string} field 字段
     * @property {string} keyword 关键字
     * @property {boolean} precise 是否精确查找
     */

    /**
     * 通过一堆关键字联合查询
     * @param {QueryField[]} fields 字段名列表
     * @param {number} pageNo 页码，一页20个？
     * @return {Promise}
     */
    getSocialworkWithKeyword: (fields, pageNo) => {
        return request.post("/api/socialwork/check/getSocialwork",{
            fields: fields,
            page: pageNo
        })
    },

    getSocialworkWithStudent: (userId, pageNo) => {
        return request.post("/api/socialwork/check/getSocialwork",{
            user_id: userId,
            page: pageNo
        })
    },
}

const editApi = {
    getSocialworkInfo: (socialworkId) => {
        console.log('api',socialworkId)
        return request.post("/api/socialwork/getSocialworkInfo", { socialwork_id: socialworkId })
    },
    uploadImage: (socialworkId, imgBlob) => {
        return request.post("/api/socialwork/uploadImage", {
            socialwork_id: socialworkId,
            image: imgBlob
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    clearCertImage: (socialworkId) => {
        return request.post("/api/socialwork/clearCertImage", { socialwork_id: socialworkId })
    },
 
}

const getStates = () => {
    return request.get("/api/socialwork/getStates");
}
export default {
    submitCreate,
    getRecord,
    deleteRecord,
    chanegRecord,
    checkApi,
    editApi,
    getStates,
}