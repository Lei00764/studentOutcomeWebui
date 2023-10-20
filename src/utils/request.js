import axios from 'axios';

const service = axios.create({
    baseURL:'http://localhost:7217',//后期可以改成服务器地址
    headers: {},
    timeout:5000
})

export default service
