const db = require('../database-connection');
const bcrypt = require("bcrypt");
const allColumns =  "user_id as id, email, name, surname, nickname, password, role_id as role";

const checkIfUserExist  = async (email, index, nickname) => {
    try {
        const res = await db.query(`SELECT 
                CASE 
                    WHEN email = $1 THEN 'email' 
                    WHEN CAST(index AS INTEGER) = $2 THEN 'index' 
                    WHEN nickname = $3 THEN 'nickname' 
                END AS matched_by 
            FROM users 
            WHERE email = $1 OR CAST(index AS INTEGER) = $2 OR nickname = $3`, [email, index, nickname]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

const createUser = async (data) => {
    try {
        const res = await db.query(`INSERT INTO users (email, index, name, surname, nickname, password, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [data.email, data.index, data.name, data.surname, data.nickname, data.password, data.role]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}
const saveUser = async (user) => {
    const { nickname, email, index, password, name, surname, role } = user;
    const checkUser = await checkIfUserExist(email, index, nickname);

    if (checkUser) {
        console.log(`User with this ${checkUser.matched_by} already exists`);
        return {error: `User with this ${checkUser.matched_by} already exists`};
    }

    const data = {
        nickname,
        email,
        password: await bcrypt.hash(password, 10),
        index,
        name,
        surname,
        role
    };

    return await createUser(data);
}

const findUserByEmail = async (email) => {
    try {
        const res = await db.query(`SELECT ${allColumns} FROM users WHERE email = $1`, [email]);
        return res.rows[0];
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    saveUser,
    findUserByEmail
}