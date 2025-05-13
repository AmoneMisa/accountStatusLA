import axios from "axios";
const API_PATH = import.meta.env.VITE_API_PATH;

export default class {
    constructor(nickname, settings) {
        this.nickname = nickname;
        this.settings = settings;
    }
    register = async () => {
        return await axios.post(`${API_PATH}/register`, {nickname: this.nickname, settings: this.settings});
    }

    getUser = async (id) => {
        return await axios.get(`${API_PATH}/${id}`);
    }

    getUserByInviteKey = async (inviteKey) => {
        return await axios.get(`${API_PATH}/key/${inviteKey}`);
    }

    getSubscribers = async (inviteKey) => {
        return await axios.get(`${API_PATH}/subscribers/${inviteKey}`);
    }

    getUsers = async (id) => {
        return await axios.get(`${API_PATH}/all?exclude=${id}`);
    }

    update = async (id) => {
        return await axios.put(`${API_PATH}/update/${id}`, {nickname: this.nickname, settings: this.settings});
    }

    resetInviteKey = async (id) => {
        return await axios.put(`${API_PATH}/resetInviteKey/${id}`);
    }
}
