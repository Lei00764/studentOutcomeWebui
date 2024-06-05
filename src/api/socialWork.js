import request from "@/utils/request"

/**
 * 用来在列表中显示的简化的社会活动记录
 * @typedef {Object} SimpleSociety
 * @property {number} id
 * @property {string} society_name
 * @property {number} society_type
 * @property {string} participate_time
 * @property {number} duration_day
 * @property {number} duration_hour
 * @property {number} patent_situation
 * @property {number} verify_status
 */

/**
 * @typedef {Object} SocietyType
 * @property {number} id
 * @property {string} type_name
 */

/**
 * 一个完整的社会活动信息
 * @typedef {Object} Society
 * @property {number} id
 * @property {string} society_name
 * @property {number} society_type
 * @property {string} participate_time
 * @property {number} duration_day
 * @property {number} duration_hour
 * @property {number} verify_status
 * @property {string} society_detail
 * @property {string} evidence 图片id，命名是历史遗留问题
 */

/**
 * @typedef {Object} SocietyOperationLog
 * Creates an instance of PatentOperationLog.
 * @property {string} operation_time - The time of the operation.
 * @property {string} operation_text - The text describing the operation.
 * @property {number} operation_level - The level of the operation.
 */

/**
 *
 * @param {Society} newSociety
 * @return {Promise<ParsedResponse<{
 *     newSocietyId: number
 * }>>}
 */
const submitCreate = (newSociety) => {
    return request.post('/api/social/insertSociety',
        {
            newSociety
        }
    )
}

/**
 * 返回当前用户所有的社会活动记录
 * @return {Promise<ParsedResponse<{
 *     societies: SimpleSociety[]
 * }>>}
 */
const getStudentRecords = () => {
    return request.get('/api/social/selectStuRecord');
};

/**
 * 返回id指定的社会活动记录
 * @return {Promise<ParsedResponse<{
 *     society: Society
 *     logs: SocietyOperationLog[]
 * }>>}
 */
const getRecordById = (id) => {
    return request.post('/api/social/selectStuRecordById', {
        societyId: id
    })
}


const deleteRecord = (societyId) => {
    return request.post('/api/social/deleteStuRecord', {
        societyId
    })
}

const submitToReview = (societyId) => {
    return request.post('/api/social/submitToReview', {
        societyId
    })
}

const withdrawReview = (societyId) => {
    return request.post('/api/social/withdrawReview', {
        societyId
    })
}

/**
 *
 * @param {Society} newSociety
 * @return {Promise<ParsedResponse<{
 *     newSocietyId: number
 * }>>}
 */
const changeRecord = (newSociety) => {
    return request.post(
        '/api/social/changeSociety', {newSociety}
    )
}

const checkApi = {
    changeVerifyStatus: (socialId, statusId, checkMessage) => {
        return request.post("/api/social/check/changeVerifyStatus", {
            social_id: socialId,
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
    getsocialWithKeyword: (fields, pageNo) => {
        return request.post("/api/social/check/getsocial",{
            fields: fields,
            page: pageNo
        })
    },

    getsocialWithStudent: (userId, pageNo) => {
        return request.post("/api/social/check/getsocial",{
            user_id: userId,
            page: pageNo
        })
    },
}

const editApi = {
    getsocialInfo: (socialId) => {
        console.log('api',socialId)
        return request.post("/api/social/getsocialInfo", { social_id: socialId })
    },
    uploadImage: (socialId, imgBlob) => {
        return request.post("/api/social/uploadImage", {
            social_id: socialId,
            image: imgBlob
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    clearCertImage: (socialId) => {
        return request.post("/api/social/clearCertImage", { social_id: socialId })
    },
 
}

/**
 *
 * @return {Promise<ParsedResponse<{
 *  types: SocietyType[]
 * }>>}
 */
const getTypes = () => {
    return request.get("/api/social/getTypes");
}
export default {
    submitCreate,
    deleteRecord,
    changeRecord,
    checkApi,
    editApi,
    getTypes,
    getStudentRecords,
    getRecordById,
    submitToReview,
    withdrawReview
}