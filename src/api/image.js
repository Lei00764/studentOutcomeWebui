import request from "@/utils/request";

export default  {
    clearCertImage: (teamId) => {
        return request.post("/api/img/imgClear", {team_id: teamId})
    },
    uploadImage: (recordId, recordType, imgBlob) => {
        return request.post("/api/img/imgUpload", {
            record_id: recordId,
            image: imgBlob,
            record_type: recordType
        }, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    },
}