import request from "@/utils/request"
import axios from "axios";

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

export default {
    login,
    getUserInfo,
    logout,
    updatePassword,
    getStudentPageWithKeyword,
    getStudentInfo
}