import request from "@/utils/request"

const getSystemNotice = () => {
    return request.post("/api/notice/getSystemNotice")
}

const sendSystemNotice = (content, related_link) => {
    return request.post("/api/notice/sendSystemNotice", {
        content: content,
        related_link: related_link
    })
}

const sendPersonalNotice = (user_id, content, related_link) => {
    return request.post("/api/notice/sendPersonalNotice", {
        user_id, user_id,
        content: content,
        related_link: related_link
    })
}

export default {
    getSystemNotice,
    sendSystemNotice,
    sendPersonalNotice
}
