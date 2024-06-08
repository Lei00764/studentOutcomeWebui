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



const checkApi = {
    changeVerifyStatus: (socialId, statusId, checkMessage) => {
        return request.post("/api/social/check/changeVerifyStatus", {
            society_id: socialId,
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
    getSocialWithKeyword: (fields, pageNo) => {
        return request.post("/api/social/check/getSociety",{
            fields: fields,
            page: pageNo
        })
    },

    getSocialWithStudent: (userId, pageNo) => {
        return request.post("/api/social/check/getSociety",{
            user_id: userId,
            page: pageNo
        })
    },
}

const editApi = {
    /**
     *
     * @param {Society} newSociety
     * @return {Promise<ParsedResponse<{
     *     newSocietyId: number
     * }>>}
     */
    submitCreate: (newSociety) => {
        return request.post('/api/social/insertSociety',
            {
                newSociety
            }
        )
    },


    deleteRecord: (societyId) => {
        return request.post('/api/social/deleteStuRecord', {
            societyId
        })
    },

    submitToReview: (societyId) => {
        return request.post('/api/social/submitToReview', {
            societyId
        })
    },

    withdrawReview: (societyId) => {
        return request.post('/api/social/withdrawReview', {
            societyId
        })
    },

    /**
     *
     * @param {Society} newSociety
     * @return {Promise<ParsedResponse<{
     *     newSocietyId: number
     * }>>}
     */
    changeRecord: (newSociety) => {
        return request.post(
            '/api/social/changeSociety', {newSociety}
        )
    }
 
}



const viewApi = {
    /**
     *
     * @return {Promise<ParsedResponse<{
     *  types: SocietyType[]
     * }>>}
     */
    getTypes: () => {
        return request.get("/api/social/getTypes");
    },
    /**
     * 返回当前用户所有的社会活动记录
     * @return {Promise<ParsedResponse<{
     *     societies: SimpleSociety[]
     * }>>}
     */
    getStudentRecords: () => {
        return request.get('/api/social/selectStuRecord');
    },

    /**
     * 返回id指定的社会活动记录
     * @return {Promise<ParsedResponse<{
     *     society: Society
     *     logs: SocietyOperationLog[],
     *     student: SimpleStudent
     * }>>}
     */
    getRecordById: (id) => {
        return request.post('/api/social/selectStuRecordById', {
            societyId: id
        })
    }
}

export default {
    viewApi,
    checkApi,
    editApi,
}