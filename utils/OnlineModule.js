import axios from "axios";

export default class {
    constructor(nickname, settings) {
        this.nickname = nickname;
        this.settings = settings;
    }
    register = async () => {
        return await axios.post("http://localhost:3001/api/users/register", {nickname: this.nickname, settings: this.settings});
    }

    getUser = async (id) => {
        return await axios.get(`http://localhost:3001/api/users/${id}`);
    }

    getUsers = async (id) => {
        return await axios.get(`http://localhost:3001/api/users/all?exclude=${id}`);
    }

    update = async (id) => {
        return await axios.put(`http://localhost:3001/api/users/update/${id}`, {nickname: this.nickname, settings: this.settings});
    }
}
