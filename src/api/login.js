import request from "@/utils/request"
import axios from "axios";

const login = (username, password) => {
    return request.post("/api/studentInfo/login",{
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
    return request.post("/api/studentInfo/updatePasswordStudent",{
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