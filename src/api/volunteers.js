import request from "@/utils/request";

const submitCreate = (params) => {
    return request.post("/api/volunteer/insertVolunteerInfo", params);
};

const getRecord = () => {
    console.log("到了打印部分");
    return request.get("/api/volunteer/selectVolunteerInfo");
};

const deleteRecord = (params) => {
    return request.post("/api/volunteer/deleteVolunteerInfo", params);
};

const chanegRecord = (params) => {
    return request.post("/api/volunteer/changeVolunteerInfo", params);
};

export default {
    submitCreate,
    getRecord,
    deleteRecord,
    chanegRecord
};