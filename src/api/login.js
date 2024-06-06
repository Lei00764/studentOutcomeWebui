import request from "@/utils/request"
import axios from "axios";

/**
 * @typedef {Object} SimpleStudent
 * @property {number} user_id
 * @property {string} stu_id
 * @property {string} stu_name
 * @property {string} grade
 */

const login = (username, password) => {
    return request.post("/api/studentInfo/login", {
        username: username,
        password: password,
    })
}

const logout = () => {
    return request.get("/api/studentInfo/logout")
}


const getUserInfo = () => {
    return request.get("/api/studentInfo/info")
}

const updatePassword = (oldPassword, newPassword) => {
    return request.post("/api/studentInfo/changePasswordStudent", {
        new_password: newPassword,
        old_password: oldPassword
    })
}

/**
 * 通过条件筛选学生
 * @param field 字段名
 * @param keyword 关键字
 * @param {boolean} precise 是否精确查找
 * @param {number} pageNo 页码，一页10个？
 * @return {Promise}
 */
const getStudentPageWithKeyword = (field, keyword, precise, pageNo) => {
    return request.post("/api/studentInfo/select", {
        field: field,
        keyword: keyword,
        precise: precise,
        page: pageNo
    })
}

/**
 * 根据 user_id 获取学生信息
 */
const getStudentInfo = (user_id) => {
    return request.post("/api/studentInfo/getStudentInfo", {
        user_id: user_id
    })
}

const resetStudentPassword = (userId) => {
    return request.post("/api/studentInfo/resetPassword", {
        user_id: userId
    })
}

/**
 * 修改/新建学生账号信息 userId=-1代表创建学生
 * @param userId
 * @param stuName
 * @param stuId
 * @param grade
 * @return {Promise<axios.AxiosResponse<any>>}
 */
const modifyStudent = (userId, stuName, stuId, grade) => {
    return request.post("/api/studentInfo/edit", {
        user_id: userId,
        stu_name: stuName,
        stu_id: stuId,
        grade: grade
    })
}


/**
 * @typedef {Object} uploadStudentExcelAns
 * @property {number} json.completedCount
 * @property {number} json.repeatedCount
 * @property {number} json.failedCount
 */
/**
 *
 * @param file{File}
 * @return {Promise<uploadStudentExcelAns>}
 */

const uploadStudentExcel = (file) => {
    let fd = new FormData()
    let canSubmit = false
    fd.append("file", file)


    return request.post("/api/studentInfo/batchImport", fd)
}

export default {
    login,
    getUserInfo,
    logout,
    updatePassword,
    getStudentPageWithKeyword,
    getStudentInfo,
    modifyStudent,
    resetStudentPassword,
    uploadStudentExcel
}