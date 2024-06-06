import request from "@/utils/request";

const submitCreate = (params) => {
    return request.post("/api/volunteer/insertVolunteerInfo", params);
};

const getRecord = () => {
    console.log("到了打印部分");
    return request.get("/api/volunteer/selectVolunteerInfo");
};

const deleteRecord = (params) => {
    return request.post("/api/volunteer/deleteVolunteerInfo", params);
};

const changeRecord = (params) => {
    return request.post("/api/volunteer/changeVolunteerInfo", params);
};
const selectStuRecordById = (vol_id) => {
    return request.post("/api/volunteer/selectStuRecordById", 
        {vol_id}
    )
   
};

const checkApi = {
    changeVerifyStatus: (volunteerId, statusId, checkMessage) => {
        return request.post("/api/volunteer/check/changeVerifyStatus", {
            volunteer_id: volunteerId,
            status: statusId,
            msg: checkMessage
        })
    },

    uploadImage: (volunteerId, imgBlob) => {
        return request.post("/api/volunteer/uploadImage", {
            vol_id: volunteerId,
            image: imgBlob
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    clearCertImage: (volunteerId) => {
        return request.post("/api/volunteer/clearCertImage", { patent_id: patentId })
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
    getVolunteerWithKeyword: (fields, pageNo) => {
        return request.post("/api/volunteer/check/getVolunteer",{
            fields: fields,
            page: pageNo
        })
    },

    getVolunteerWithStudent: (userId, pageNo) => {
        return request.post("/api/volunteer/check/getVolunteer",{
            user_id: userId,
            page: pageNo
        })
    },
}

export default {
    submitCreate,
    getRecord,
    deleteRecord,
    changeRecord,
    selectStuRecordById,
    checkApi
};