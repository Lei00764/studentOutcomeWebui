import request from "@/utils/request"
import axios from "axios";

const login = (username, password) => {
    return request.post("/api/StudentInfo/login",{
        username: username,
        password: password,
    })
}

const logout = () => {
    return request.get("/api/StudentInfo/logout")
}


const getUserInfo = () => {
    return request.get("/api/StudentInfo/info")
}

const updatePassword = (oldPassword, newPassword) => {
    return request.post("/api/StudentInfo/updatePasswordStudent",{
        new_password: newPassword,
        old_password: oldPassword
    })
}

export default {
    login,
    getUserInfo,
    logout,
    updatePassword
}