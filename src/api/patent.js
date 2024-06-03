import request from "@/utils/request"

/**
 *
 * @typedef {Object} Patent
 * @property {number} id
 * @property {string} patent_title
 * @property {string} patent_author
 * @property {string} submission_date
 * @property {string} patent_abstract
 * @property {string} attachments
 * @property {number} patent_situation
 * @property {number} verify_status
 */

/**
 * @typedef {Object} PatentState
 * @property {number} id
 * @property {string} state_name
 */

/**
 * @typedef {Object} PatentOperationLog
 * Creates an instance of PatentOperationLog.
 * @property {string} operation_time - The time of the operation.
 * @property {string} operation_text - The text describing the operation.
 * @property {number} operation_level - The level of the operation.
 */

/**
 *
 * @return {Promise<ParsedResponse<{
 *     states: [PatentState]
 * }>>}
 */
const getStates = () => {
    return request.get("/api/patent/getStates");
}

/**
 *
 * @param {Patent} newPatent
 * @return {Promise<ParsedResponse<{
 *     newPatentId: number
 * }>>}
 */
const submitCreate = (newPatent) => {
    return request.post(
        '/api/patent/insertPatent', {
            newPatent
        }
    )
}

/**
 * @param {number} patentId
 * @return {Promise<ParsedResponse<{
 *     patent: Patent
 *     logs: [PatentOperationLog]
 * }>>}
 */
const selectStuRecordById = (patentId) => {
    return request.post('/api/patent/selectStuRecordById', {
        patentId
    })
}

/**
 *
 * @return {Promise<ParsedResponse<{
 *     patents: [Patent]
 * }>>}
 */
const getRecord = () => {
    return request.get('/api/patent/selectStuRecord')
}

/**
 *
 * @param {number} patentId
 * @return {Promise<ParsedResponse>}
 */
const deleteRecord = (patentId) => {
    return request.post('/api/patent/deleteStuRecord', {
        patentId
    })
}

/**
 *
 * @param {Patent} newPatent
 * @return {Promise<ParsedResponse>}
 */
const changeRecord = (newPatent) => {
    return request.post('/api/patent/changePatent', {
        newPatent
    })
}

const submitToReview = (patentId) => {
    return request.post('/api/patent/submitToReview', {
        patentId
    })
}

const withdrawReview = (patentId) => {
    return request.post('/api/patent/withdrawReview', {
        patentId
    })
}



const editApi = {
    getPatentInfo: (patentId) => {
        console.log('api',patentId)
        return request.post("/api/patent/getPatentInfo", { patent_id: patentId })
    },
    uploadImage: (patentId, imgBlob) => {
        return request.post("/api/patent/uploadImage", {
            patent_id: patentId,
            image: imgBlob
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
    clearCertImage: (patentId) => {
        return request.post("/api/patent/clearCertImage", { patent_id: patentId })
    },
 
}

const checkApi = {
    changeVerifyStatus: (patentId, statusId, checkMessage) => {
        return request.post("/api/patent/check/changeVerifyStatus", {
            patent_id: patentId,
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
    getPatentWithKeyword: (fields, pageNo) => {
        return request.post("/api/patent/check/getPatent",{
            fields: fields,
            page: pageNo
        })
    },

    getPatentWithStudent: (userId, pageNo) => {
        return request.post("/api/patent/check/getPatent",{
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
    getStates,
    submitToReview,
    withdrawReview,
    selectStuRecordById,
    editApi,
    checkApi

}