import request from "@/utils/request";

/**
 *
 * @typedef {Object} Volunteer
 * @property {number} id
 * @property {string} vol_name
 * @property {number} vol_type
 * @property {string} participate_time
 * @property {number} duration_day
 * @property {number} duration_hour
 * @property {string} vol_detail
 * @property {string} image_id
 * @property {number} verify_status
 */

/**
 * @typedef {Object} VolunteertState
 * @property {number} id
 * @property {string} state_name
 */

/**
 * @typedef {Object} VolunteerOperationLog
 * Creates an instance of PatentOperationLog.
 * @property {string} operation_time - The time of the operation.
 * @property {string} operation_text - The text describing the operation.
 * @property {number} operation_level - The level of the operation.
 */

/**
 * @typedef {Object} SimpleVolunteer
 * @property {number} id
 * @property {string} vol_name
 * @property {number} vol_type
 * @property {string} participate_time
 * @property {number} duration_day
 * @property {number} duration_hour
 * @property {string} stu_name
 * @property {number} verify_status
 */




const checkApi = {
    changeVerifyStatus: (volunteerId, statusId, checkMessage) => {
        return request.post("/api/volunteer/check/changeVerifyStatus", {
            volunteer_id: volunteerId,
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
     * @return {Promise<ParsedResponse<{
     *       content: SimpleVolunteer[],
     *       count: number
     *   }>>}
     */
    getVolunteerWithKeyword: (fields, pageNo) => {
        return request.post("/api/volunteer/check/getVolunteer",{
            fields: fields,
            page: pageNo
        })
    },

    /**
     * 通过一堆关键字联合查询
     * @param {number} userId 要查询的用户id
     * @param {number} pageNo 页码，一页20个？
     * @return {Promise<ParsedResponse<{
     *      content: SimpleVolunteer[],
     *      count: number
     *  }>>}
     */
    getVolunteerWithStudent: (userId, pageNo) => {
        return request.post("/api/volunteer/check/getVolunteer",{
            user_id: userId,
            page: pageNo
        })
    },
}

const editApi = {
    /**
     *
     * @param {Volunteer} newVolunteer
     * @return {Promise<ParsedResponse<{
     *     newVolunteerId: number
     * }>>}
     */
    submitCreate: (newVolunteer) => {
        return request.post("/api/volunteer/insertVolunteer", {
            newVolunteer
        });
    },

    /**
     *
     * @param {Volunteer} newVolunteer
     * @return {Promise<ParsedResponse>}
     */
    changeRecord: (newVolunteer) => {
        return request.post("/api/volunteer/changeVolunteer", {
            newVolunteer
        });
    },

    deleteRecord: (volunteerId) => {
        return request.post("/api/volunteer/deleteStuRecord", {
            volunteerId
        });
    },

    submitToReview: (volunteerId) => {
        return request.post('/api/volunteer/submitToReview', {
            volunteerId
        })
    },

    withdrawReview: (volunteerId) => {
        return request.post('/api/volunteer/withdrawReview', {
            volunteerId
        })
    }

}

const viewApi = {
    /**
     *
     * @return {Promise<ParsedResponse<{
     *     states: VolunteertState[]
     * }>>}
     */
    getStates: () => {
        return request.get("/api/volunteer/getStates");
    },

    /**
     *
     * @return {Promise<ParsedResponse<{
     *     volunteer: Volunteer,
     *     logs: VolunteerOperationLog[],
     *     student: SimpleStudent
     * }>>}
     */
    selectStuRecordById: (vol_id) => {
        return request.post("/api/volunteer/selectStuRecordById",{
                volunteerId: vol_id
        })
    },
    /**
     * 选择用户拥有的志愿服务记录
     * @return {Promise<ParsedResponse<{
     *     volunteers: SimpleVolunteer[]
     * }
     * >>}
     */
    getRecord: () => {
        console.log("到了打印部分");
        return request.get("/api/volunteer/selectStuRecord");
    }
}

export default {
    editApi,
    checkApi,
    viewApi
};