import request from "@/utils/request"

/**
 *
 * @typedef {Object} Paper
 * @property {number} id
 * @property {string} paper_title
 * @property {string} paper_author
 * @property {string} submission_date
 * @property {string} paper_abstract
 * @property {number} paper_situation
 * @property {number} verify_status
 */

/**
 * @typedef {Object} PaperState
 * @property {number} id
 * @property {string} state_name
 */

/**
 * @typedef {Object} PaperOperationLog
 * Creates an instance of PaperOperationLog.
 * @property {string} operation_time - The time of the operation.
 * @property {string} operation_text - The text describing the operation.
 * @property {number} operation_level - The level of the operation.
 */

/**
 *
 * @return {Promise<ParsedResponse<{
 *     states: [PaperState]
 * }>>}
 */
const getStates = () => {
    return request.get("/api/paper/getStates");
}


const editApi = {
    /**
     *
     * @param {Paper} newPaper
     * @return {Promise<ParsedResponse<{
     *     newPaperId: number
     * }>>}
     */
    submitCreate: (newPaper) => {
        return request.post(
            '/api/paper/insertPaper', {
                newPaper
            }
        )
    },

    /**
     * @param {number} paperId
     * @return {Promise<ParsedResponse<{
     *     paper: Paper
     *     logs: [PaperOperationLog],
     *     student: SimpleStudent
     * }>>}
     */
    selectStuRecordById: (paperId) => {
        return request.post('/api/paper/selectStuRecordById', {
            paperId
        })
    },

    /**
     *
     * @return {Promise<ParsedResponse<{
     *     papers: [Paper]
     * }>>}
     */
    getRecord: () => {
        return request.get('/api/paper/selectStuRecord')
    },
    /**
     *
     * @param {number} paperId
     * @return {Promise<ParsedResponse>}
     */
    deleteRecord: (paperId) => {
        return request.post('/api/paper/deleteStuRecord', {
            paperId
        })
    },

    /**
     *
     * @param {Paper} newPaper
     * @return {Promise<ParsedResponse>}
     */
    changeRecord: (newPaper) => {
        return request.post('/api/paper/changePaper', {
            newPaper
        })
    },

    submitToReview: (paperId) => {
        return request.post('/api/paper/submitToReview', {
            paperId
        })
    },

    withdrawReview: (paperId) => {
        return request.post('/api/paper/withdrawReview', {
            paperId
        })
    }
}

const checkApi = {
    changeVerifyStatus: (paperId, statusId, checkMessage) => {
        return request.post("/api/paper/check/changeVerifyStatus", {
            paper_id: paperId,
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
    getPaperWithKeyword: (fields, pageNo) => {
        return request.post("/api/paper/check/getPaper",{
            fields: fields,
            page: pageNo
        })
    },

    getPaperWithStudent: (userId, pageNo) => {
        return request.post("/api/paper/check/getPaper",{
            user_id: userId,
            page: pageNo
        })
    },
}


export default {
    getStates,
    editApi,
    checkApi

}