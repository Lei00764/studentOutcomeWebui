import request from "@/utils/request"

const getSystemNotice = () => {
    return request.get("/api/notice/getSystemNotice")
}

export default {
    getSystemNotice
}
